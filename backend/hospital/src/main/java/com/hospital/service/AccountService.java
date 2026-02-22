package com.hospital.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import com.hospital.entity.AccountEntity;
import com.hospital.repository.AccountRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountService {

    @Autowired
    private AccountRepository repo;

    // ----------------------------------------------------------------
    // Role mapping: Keycloak role name → role_id trong MySQL
    // ----------------------------------------------------------------
    private static final int ROLE_PATIENT = 1;
    private static final int ROLE_DOCTOR = 2;
    private static final int ROLE_ADMIN = 3;

    /**
     * Ánh xạ role name từ Keycloak sang role_id cố định trong DB.
     * Mọi role không nhận diện được đều coi là patient (mặc định).
     */
    private int resolveRoleId(String roleName) {
        if (roleName == null)
            return ROLE_PATIENT;
        return switch (roleName.toLowerCase()) {
            case "doctor" -> ROLE_DOCTOR;
            case "admin" -> ROLE_ADMIN;
            default -> ROLE_PATIENT;
        };
    }

    /**
     * Trích xuất role đầu tiên có ý nghĩa từ claim realm_access.roles của Keycloak
     * JWT.
     * Ưu tiên: admin > doctor > patient > (default)
     */
    @SuppressWarnings("unchecked")
    private String extractRole(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        if (realmAccess == null)
            return null;

        List<String> roles = (List<String>) realmAccess.get("roles");
        if (roles == null || roles.isEmpty())
            return null;

        // Ưu tiên theo thứ tự: admin → doctor → patient
        if (roles.contains("admin"))
            return "admin";
        if (roles.contains("doctor"))
            return "doctor";
        if (roles.contains("patient"))
            return "patient";

        return null; // không tìm thấy role hợp lệ → sẽ map về patient
    }

    /**
     * Đồng bộ tài khoản sau khi Frontend nhận được Token từ Keycloak.
     * Backend tự parse JWT để lấy: sub, preferred_username, email,
     * realm_access.roles.
     *
     * Logic Upsert theo keycloak_user_id (= claim "sub"):
     * - Chưa có trong DB → Tạo mới.
     * - Đã có → Cập nhật username, email, role mới nhất.
     *
     * LƯU Ý: Spring Security đã validate chữ ký JWT trước khi vào đây.
     * 
     * @AuthenticationPrincipal Jwt jwt được inject tự động.
     *
     * @param jwt Đối tượng Jwt đã được Spring Security validate và inject.
     * @return AccountEntity đã được lưu.
     */
    public void syncFromToken(Jwt jwt) {
        if (jwt == null) {
            throw new IllegalArgumentException("JWT must not be null");
        }

        String keycloakUserId = jwt.getSubject(); // claim "sub"
        String username = jwt.getClaimAsString("preferred_username");
        String email = jwt.getClaimAsString("email");
        String roleName = extractRole(jwt);
        int roleId = resolveRoleId(roleName);

        // Upsert: tìm theo keycloak_user_id, nếu chưa có thì tạo mới
        AccountEntity account = repo.findByKeycloakUserId(keycloakUserId)
                .orElseGet(AccountEntity::new);

        account.setKeycloakUserId(keycloakUserId);
        account.setUsername(username);
        account.setEmail(email);
        account.setRoleId(roleId);

        repo.save(account);
    }

    // ----------------------------------------------------------------
    // Các phương thức CRUD hiện có
    // ----------------------------------------------------------------

    public List<AccountEntity> findAll() {
        return repo.findAll();
    }

    public Optional<AccountEntity> findById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Account id must not be null");
        }
        return repo.findById(id);
    }

    public AccountEntity save(AccountEntity account) {
        if (account == null) {
            throw new IllegalArgumentException("Account must not be null");
        }
        return repo.save(account);
    }

    public AccountEntity update(AccountEntity account) {
        if (account == null) {
            throw new IllegalArgumentException("Account must not be null");
        }
        if (account.getUsername() == null) {
            throw new IllegalArgumentException("Account username must not be null");
        }
        if (!repo.existsById(account.getId())) {
            throw new EntityNotFoundException("Account not found with id=" + account.getId());
        }
        return repo.save(account);
    }

    public void deleteById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Account id must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Account not found with id=" + id);
        }
        repo.deleteById(id);
    }

    public Optional<AccountEntity> findByUsername(String username) {
        return repo.findByUsername(username);
    }
}
