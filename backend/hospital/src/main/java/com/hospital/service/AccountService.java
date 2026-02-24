package com.hospital.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.hospital.dto.AppointmentHistoryDTO;
import com.hospital.entity.AccountEntity;
import com.hospital.entity.DoctorEntity;
import com.hospital.entity.PatientEntity;
import com.hospital.entity.ProfileEntity;
import com.hospital.repository.AccountRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountService {

    @Autowired
    private AccountRepository repo;

    @Autowired
    private ProfileRepository profileRepo;

    @Autowired
    private PatientRepository patientRepo;

    @Autowired
    private DoctorRepository doctorRepo;

    // ----------------------------------------------------------------
    // Role mapping: Keycloak role name → role_id trong MySQL
    // ----------------------------------------------------------------
    private static final int ROLE_PATIENT = 1;
    private static final int ROLE_DOCTOR = 2;
    private static final int ROLE_ADMIN = 3;

    private int resolveRoleId(String roleName) {
        if (roleName == null)
            return ROLE_PATIENT;
        return switch (roleName.toLowerCase()) {
            case "doctor" -> ROLE_DOCTOR;
            case "admin" -> ROLE_ADMIN;
            default -> ROLE_PATIENT;
        };
    }

    @SuppressWarnings("unchecked")
    private List<String> extractRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null)
            return List.of();
        List<String> roles = (List<String>) realmAccess.get("roles");
        return roles != null ? roles : List.of();
    }

    private String extractPrimaryRole(List<String> roles) {
        if (roles.contains("admin"))
            return "admin";
        if (roles.contains("doctor"))
            return "doctor";
        if (roles.contains("patient"))
            return "patient";
        return null;
    }

    // ----------------------------------------------------------------
    // syncFromToken — Upsert account + profile + patient/doctor
    // ----------------------------------------------------------------

    /**
     * Đồng bộ sau mỗi lần đăng nhập:
     * 1. Upsert bảng `account`
     * 2. Upsert bảng `profile` (liên kết với account)
     * 3. Nếu có role `patient` → upsert bảng `patient`
     * Nếu có role `doctor` → upsert bảng `doctor`
     */
    public void syncFromToken(Jwt jwt) {
        if (jwt == null)
            throw new IllegalArgumentException("JWT must not be null");

        String keycloakUserId = jwt.getSubject();
        String username = jwt.getClaimAsString("preferred_username");
        String email = jwt.getClaimAsString("email");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");

        List<String> roles = extractRoles(jwt);
        String primaryRole = extractPrimaryRole(roles);
        int roleId = resolveRoleId(primaryRole);

        // ── 1. Upsert account ─────────────────────────────────────────
        AccountEntity account = repo.findByKeycloakUserId(keycloakUserId)
                .orElseGet(AccountEntity::new);
        account.setKeycloakUserId(keycloakUserId);
        account.setUsername(username);
        account.setEmail(email);
        account.setRoleId(roleId);
        account = repo.save(account);

        // ── 2. Upsert profile ─────────────────────────────────────────
        ProfileEntity profile = profileRepo.findByAccountId(account.getId())
                .orElseGet(ProfileEntity::new);
        profile.setAccountId(account.getId());

        // Chỉ đặt fullName nếu chưa có (để không ghi đè dữ liệu user đã tự điền)
        if (profile.getFullName() == null || profile.getFullName().isBlank()) {
            String fullName = "";
            if (firstName != null && !firstName.isBlank()) {
                fullName = firstName + (lastName != null ? " " + lastName : "");
            }
            if (fullName.isBlank())
                fullName = username;
            profile.setFullName(fullName.trim());
        }

        profile = profileRepo.save(profile);

        // ── 3. Upsert patient nếu role patient (hoặc cả hai) ─────────
        if (roles.contains("patient")) {
            PatientEntity patient = patientRepo.findByProfileId(profile.getId())
                    .orElseGet(PatientEntity::new);
            patient.setProfileId(profile.getId());
            patientRepo.save(patient);
        }

        // ── 4. Upsert doctor nếu role doctor ─────────────────────────
        if (roles.contains("doctor")) {
            DoctorEntity doctor = doctorRepo.findByProfileId(profile.getId())
                    .orElseGet(DoctorEntity::new);
            doctor.setProfileId(profile.getId());
            // specialization bắt buộc NOT NULL — đặt placeholder nếu chưa có
            if (doctor.getSpecialization() == null || doctor.getSpecialization().isBlank()) {
                doctor.setSpecialization("Chưa cập nhật");
            }
            doctorRepo.save(doctor);
        }
    }

    // ----------------------------------------------------------------
    // "Me" endpoints — tra cứu theo JWT (không cần truyền ID)
    // ----------------------------------------------------------------

    /**
     * Tìm patient record của người dùng hiện tại dựa trên keycloakUserId.
     * Trả Optional.empty() nếu account chưa có profile hoặc chưa là patient.
     */
    public Optional<PatientEntity> findMyPatient(String keycloakUserId) {
        return repo.findByKeycloakUserId(keycloakUserId)
                .flatMap(acc -> profileRepo.findByAccountId(acc.getId()))
                .flatMap(prof -> patientRepo.findByProfileId(prof.getId()));
    }

    /**
     * Lịch sử khám của người dùng hiện tại (cho cả TestResults và Booking).
     */
    public List<AppointmentHistoryDTO> findMyAppointments(String keycloakUserId) {
        PatientEntity patient = findMyPatient(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Không tìm thấy hồ sơ bệnh nhân cho tài khoản này."));
        return patientRepo.findAppointmentHistoryByPatientId(patient.getId());
    }

    /**
     * Profile của người dùng hiện tại.
     */
    public Optional<ProfileEntity> findMyProfile(String keycloakUserId) {
        return repo.findByKeycloakUserId(keycloakUserId)
                .flatMap(acc -> profileRepo.findByAccountId(acc.getId()));
    }

    /**
     * Cập nhật profile của người dùng hiện tại từ dữ liệu người dùng nhập.
     */
    public ProfileEntity updateMyProfile(String keycloakUserId, ProfileEntity updates) {
        ProfileEntity profile = findMyProfile(keycloakUserId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Chưa có profile, hãy đăng nhập lại để tạo."));

        // Chỉ cập nhật các field được phép — không cho đổi accountId
        if (updates.getFullName() != null)
            profile.setFullName(updates.getFullName());
        if (updates.getIdentityNumber() != null)
            profile.setIdentityNumber(updates.getIdentityNumber());
        if (updates.getGender() != null)
            profile.setGender(updates.getGender());
        if (updates.getDateOfBirth() != null)
            profile.setDateOfBirth(updates.getDateOfBirth());
        if (updates.getAddress() != null)
            profile.setAddress(updates.getAddress());
        if (updates.getPhoneNumber() != null)
            profile.setPhoneNumber(updates.getPhoneNumber());

        return profileRepo.save(profile);
    }

    // ----------------------------------------------------------------
    // Các phương thức CRUD hiện có
    // ----------------------------------------------------------------

    public List<AccountEntity> findAll() {
        return repo.findAll();
    }

    public Optional<AccountEntity> findById(Integer id) {
        if (id == null)
            throw new IllegalArgumentException("Account id must not be null");
        return repo.findById(id);
    }

    public AccountEntity save(AccountEntity account) {
        if (account == null)
            throw new IllegalArgumentException("Account must not be null");
        return repo.save(account);
    }

    public AccountEntity update(AccountEntity account) {
        if (account == null)
            throw new IllegalArgumentException("Account must not be null");
        if (!repo.existsById(account.getId()))
            throw new EntityNotFoundException("Account not found with id=" + account.getId());
        return repo.save(account);
    }

    public void deleteById(Integer id) {
        if (id == null)
            throw new IllegalArgumentException("Account id must not be null");
        if (!repo.existsById(id))
            throw new EntityNotFoundException("Account not found with id=" + id);
        repo.deleteById(id);
    }

    public Optional<AccountEntity> findByUsername(String username) {
        return repo.findByUsername(username);
    }
}
