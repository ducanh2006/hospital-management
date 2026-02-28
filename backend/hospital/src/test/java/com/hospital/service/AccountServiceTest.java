package com.hospital.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.entity.AccountEntity;
import com.hospital.entity.DoctorEntity;
import com.hospital.entity.PatientEntity;
import com.hospital.entity.ProfileEntity;
import com.hospital.repository.AccountRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AccountServiceTest {

    @Autowired
    private AccountService accountService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // Helper method to create a mock JWT
    private Jwt createMockJwt(String subject, String username, String email,
            String givenName, String familyName, List<String> roles) {
        return Jwt.withTokenValue("mock-token")
                .header("alg", "RS256")
                .subject(subject)
                .claim("preferred_username", username)
                .claim("email", email)
                .claim("given_name", givenName)
                .claim("family_name", familyName)
                .claim("realm_access", Map.of("roles", roles))
                .build();
    }

    // ========== Test syncFromToken for Patient ==========
    @Test
    void shouldSyncFromTokenForPatient() {
        Jwt jwt = createMockJwt("patient-keycloak-001", "patient_user",
                "patient@example.com", "John", "Doe", List.of("patient"));

        accountService.syncFromToken(jwt);

        Optional<AccountEntity> account = accountRepository.findByKeycloakUserId("patient-keycloak-001");
        assertTrue(account.isPresent());
        assertEquals("patient_user", account.get().getUsername());
        assertEquals("patient@example.com", account.get().getEmail());

        Optional<ProfileEntity> profile = profileRepository.findByAccountId(account.get().getId());
        assertTrue(profile.isPresent());
        assertNotNull(profile.get().getFullName());

        Optional<PatientEntity> patient = patientRepository.findByProfileId(profile.get().getId());
        assertTrue(patient.isPresent(), "Patient record should be created for patient role");
    }

    // ========== Test syncFromToken for Doctor ==========
    @Test
    void shouldSyncFromTokenForDoctor() {
        Jwt jwt = createMockJwt("doctor-keycloak-001", "doctor_user",
                "doctor@example.com", "Jane", "Smith", List.of("doctor"));

        accountService.syncFromToken(jwt);

        Optional<AccountEntity> account = accountRepository.findByKeycloakUserId("doctor-keycloak-001");
        assertTrue(account.isPresent());

        Optional<ProfileEntity> profile = profileRepository.findByAccountId(account.get().getId());
        assertTrue(profile.isPresent());

        Optional<DoctorEntity> doctor = doctorRepository.findByProfileId(profile.get().getId());
        assertTrue(doctor.isPresent(), "Doctor record should be created for doctor role");
        assertNotNull(doctor.get().getSpecialization());
    }

    // ========== Test syncFromToken for Admin ==========
    @Test
    void shouldSyncFromTokenForAdmin() {
        Jwt jwt = createMockJwt("admin-keycloak-001", "admin_user",
                "admin@example.com", "Admin", "User", List.of("admin"));

        accountService.syncFromToken(jwt);

        Optional<AccountEntity> account = accountRepository.findByKeycloakUserId("admin-keycloak-001");
        assertTrue(account.isPresent());
        assertEquals("admin_user", account.get().getUsername());
    }

    // ========== Test syncFromToken with null JWT ==========
    @Test
    void shouldThrowWhenSyncingWithNullJwt() {
        assertThrows(IllegalArgumentException.class, () -> accountService.syncFromToken(null));
    }

    // ========== Test findMyPatient ==========
    @Test
    void shouldFindMyPatient() {
        // Setup
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("my-patient-keycloak");
        account.setUsername("my_patient");
        account.setEmail("mypatient@example.com");
        AccountEntity savedAccount = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(savedAccount.getId());
        profile.setFullName("My Patient Name");
        ProfileEntity savedProfile = profileRepository.save(profile);

        PatientEntity patient = new PatientEntity();
        patient.setProfileId(savedProfile.getId());
        patient.setInsuranceNumber("MY_INS_001");
        patientRepository.save(patient);

        // Test
        Optional<PatientEntity> found = accountService.findMyPatient("my-patient-keycloak");
        assertTrue(found.isPresent());
        assertEquals("MY_INS_001", found.get().getInsuranceNumber());
    }

    // ========== Test findMyPatient not found ==========
    @Test
    void shouldReturnEmptyWhenMyPatientNotFound() {
        Optional<PatientEntity> found = accountService.findMyPatient("non-existing-keycloak");
        assertFalse(found.isPresent());
    }

    // ========== Test findMyProfile ==========
    @Test
    void shouldFindMyProfile() {
        // Setup
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("my-profile-keycloak");
        account.setUsername("my_profile_user");
        account.setEmail("myprofile@example.com");
        AccountEntity savedAccount = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(savedAccount.getId());
        profile.setFullName("My Profile Name");
        profileRepository.save(profile);

        // Test
        Optional<ProfileEntity> found = accountService.findMyProfile("my-profile-keycloak");
        assertTrue(found.isPresent());
        assertEquals("My Profile Name", found.get().getFullName());
    }

    // ========== Test findMyProfile not found ==========
    @Test
    void shouldReturnEmptyWhenMyProfileNotFound() {
        Optional<ProfileEntity> found = accountService.findMyProfile("non-existing-keycloak");
        assertFalse(found.isPresent());
    }

    // ========== Test updateMyProfile ==========
    @Test
    void shouldUpdateMyProfile() {
        // Setup
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("update-profile-keycloak");
        account.setUsername("update_profile_user");
        account.setEmail("updateprofile@example.com");
        AccountEntity savedAccount = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(savedAccount.getId());
        profile.setFullName("Original Name");
        profile.setPhoneNumber("0111111111");
        profileRepository.save(profile);

        // Update
        ProfileEntity updates = new ProfileEntity();
        updates.setFullName("Updated Name");
        updates.setPhoneNumber("0222222222");
        updates.setGender(com.hospital.dto.Gender.MALE);
        updates.setDateOfBirth(LocalDate.of(1990, 1, 1));

        // Test
        ProfileEntity updated = accountService.updateMyProfile("update-profile-keycloak", updates);
        assertEquals("Updated Name", updated.getFullName());
        assertEquals("0222222222", updated.getPhoneNumber());
        assertEquals(com.hospital.dto.Gender.MALE, updated.getGender());
    }

    // ========== Test updateMyProfile not found ==========
    @Test
    void shouldThrowWhenUpdatingMyProfileNotFound() {
        ProfileEntity updates = new ProfileEntity();
        updates.setFullName("Test");
        assertThrows(EntityNotFoundException.class,
                () -> accountService.updateMyProfile("non-existing-keycloak", updates));
    }

    // ========== Test findAll ==========
    @Test
    void shouldFindAllAccounts() {
        AccountEntity account1 = new AccountEntity();
        account1.setKeycloakUserId("account-001");
        account1.setUsername("user_001");
        account1.setEmail("user001@example.com");
        accountRepository.save(account1);

        AccountEntity account2 = new AccountEntity();
        account2.setKeycloakUserId("account-002");
        account2.setUsername("user_002");
        account2.setEmail("user002@example.com");
        accountRepository.save(account2);

        List<AccountEntity> found = accountService.findAll();
        assertTrue(found.size() >= 2, "Should have at least 2 accounts");
    }

    // ========== Test findById ==========
    @Test
    void shouldFindAccountById() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("find-by-id-account");
        account.setUsername("find_by_id_user");
        account.setEmail("findbyid@example.com");
        AccountEntity saved = accountRepository.save(account);

        Optional<AccountEntity> found = accountService.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("find_by_id_user", found.get().getUsername());
    }

    // ========== Test findById with null ==========
    @Test
    void shouldThrowWhenFindByIdWithNull() {
        assertThrows(IllegalArgumentException.class, () -> accountService.findById(null));
    }

    // ========== Test save ==========
    @Test
    void shouldSaveAccount() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("new-account");
        account.setUsername("new_user");
        account.setEmail("newuser@example.com");

        AccountEntity saved = accountService.save(account);
        assertNotNull(saved.getId());
        assertEquals("new_user", saved.getUsername());
    }

    // ========== Test save with null ==========
    @Test
    void shouldThrowWhenSavingNull() {
        assertThrows(IllegalArgumentException.class, () -> accountService.save(null));
    }

    // ========== Test update ==========
    @Test
    void shouldUpdateAccount() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("update-account");
        account.setUsername("update_user");
        account.setEmail("updateuser@example.com");
        AccountEntity saved = accountRepository.save(account);

        AccountEntity updateData = new AccountEntity();
        updateData.setId(saved.getId());
        updateData.setKeycloakUserId("update-account-new");
        updateData.setUsername("updated_user");
        updateData.setEmail("updateduser@example.com");

        AccountEntity updated = accountService.update(updateData);
        assertEquals("updated_user", updated.getUsername());
        assertEquals("updateduser@example.com", updated.getEmail());
    }

    // ========== Test update with null ==========
    @Test
    void shouldThrowWhenUpdatingNull() {
        assertThrows(IllegalArgumentException.class, () -> accountService.update(null));
    }

    // ========== Test update with non-existing ==========
    @Test
    void shouldThrowWhenUpdatingNonExistingAccount() {
        AccountEntity updateData = new AccountEntity();
        updateData.setId(999_999);
        updateData.setUsername("nonexistent");
        assertThrows(EntityNotFoundException.class, () -> accountService.update(updateData));
    }

    // ========== Test deleteById ==========
    @Test
    void shouldDeleteAccount() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("delete-account");
        account.setUsername("delete_user");
        account.setEmail("deleteuser@example.com");
        AccountEntity saved = accountRepository.save(account);

        accountService.deleteById(saved.getId());
        assertFalse(accountRepository.existsById(saved.getId()));
    }

    // ========== Test deleteById with null ==========
    @Test
    void shouldThrowWhenDeletingWithNull() {
        assertThrows(IllegalArgumentException.class, () -> accountService.deleteById(null));
    }

    // ========== Test deleteById with non-existing ==========
    @Test
    void shouldThrowWhenDeletingNonExistingAccount() {
        assertThrows(EntityNotFoundException.class, () -> accountService.deleteById(999_999));
    }

    // ========== Test findByUsername ==========
    @Test
    void shouldFindAccountByUsername() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("find-by-username");
        account.setUsername("unique_username");
        account.setEmail("byusername@example.com");
        accountRepository.save(account);

        Optional<AccountEntity> found = accountService.findByUsername("unique_username");
        assertTrue(found.isPresent());
        assertEquals("unique_username", found.get().getUsername());
    }

    // ========== Test findByUsername not found ==========
    @Test
    void shouldReturnEmptyWhenUsernameNotFound() {
        Optional<AccountEntity> found = accountService.findByUsername("non-existing-username");
        assertFalse(found.isPresent());
    }
}
