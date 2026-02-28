package com.hospital.service;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.PatientDTO;
import com.hospital.entity.AccountEntity;
import com.hospital.entity.PatientEntity;
import com.hospital.entity.ProfileEntity;
import com.hospital.repository.AccountRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PatientServiceTest {

    private static final Integer NON_EXIST_ID = 999_999_999;

    @Autowired
    private PatientService patientService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private AccountRepository accountRepository;

    // ========== Test findAll ==========
    @Test
    void shouldFindAllPatients() {
        AccountEntity acc1 = new AccountEntity();
        acc1.setKeycloakUserId("test-keycloak-patient-001");
        acc1.setUsername("patient_001");
        acc1.setEmail("patient001@example.com");
        acc1 = accountRepository.save(acc1);

        ProfileEntity profile1 = new ProfileEntity();
        profile1.setAccountId(acc1.getId());
        profile1.setFullName("Patient One");
        profile1 = profileRepository.save(profile1);

        PatientEntity patient1 = new PatientEntity();
        patient1.setProfileId(profile1.getId());
        patient1.setInsuranceNumber("INS001");
        patientRepository.save(patient1);

        List<PatientDTO> patients = patientService.findAll();
        assertTrue(patients.size() >= 1);
    }

    // ========== Test findById ==========
    @Test
    void shouldFindPatientById() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("test-keycloak-patient-003");
        account.setUsername("patient_003");
        account.setEmail("patient003@example.com");
        account = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(account.getId());
        profile.setFullName("Test Patient");
        profile = profileRepository.save(profile);

        PatientEntity patient = new PatientEntity();
        patient.setProfileId(profile.getId());
        patient.setInsuranceNumber("INS003");
        patient = patientRepository.save(patient);

        PatientEntity found = patientService.findById(patient.getId());

        assertNotNull(found);
        assertEquals("INS003", found.getInsuranceNumber());
    }

    // ========== Test findById not found ==========
    @Test
    void shouldThrowWhenPatientNotFound() {
        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> patientService.findById(NON_EXIST_ID)
        );

        assertNotNull(ex);
    }

    // ========== Test save ==========
    @Test
    void shouldSavePatient() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("test-keycloak-patient-004");
        account.setUsername("patient_004");
        account.setEmail("patient004@example.com");
        account = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(account.getId());
        profile.setFullName("New Patient");
        profile = profileRepository.save(profile);

        PatientEntity patient = new PatientEntity();
        patient.setProfileId(profile.getId());
        patient.setInsuranceNumber("INS004");
        patient.setEmergencyContactPhone("0123456789");

        PatientEntity saved = patientService.save(patient);

        assertNotNull(saved.getId());
        assertEquals("INS004", saved.getInsuranceNumber());
    }

    // ========== Test update ==========
    @Test
    void shouldUpdatePatient() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("test-keycloak-patient-005");
        account.setUsername("patient_005");
        account.setEmail("patient005@example.com");
        account = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(account.getId());
        profile.setFullName("Patient To Update");
        profile = profileRepository.save(profile);

        PatientEntity patient = new PatientEntity();
        patient.setProfileId(profile.getId());
        patient.setInsuranceNumber("INS005");
        patient = patientRepository.save(patient);

        PatientEntity updateData = new PatientEntity();
        updateData.setInsuranceNumber("INS005_UPDATED");
        updateData.setEmergencyContactPhone("0987654321");

        PatientEntity updated = patientService.update(patient.getId(), updateData);

        assertEquals("INS005_UPDATED", updated.getInsuranceNumber());
        assertEquals("0987654321", updated.getEmergencyContactPhone());
    }

    // ========== Test update not found ==========
    @Test
    void shouldThrowWhenUpdatingNonExistingPatient() {
        PatientEntity updateData = new PatientEntity();
        updateData.setInsuranceNumber("INS999");

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> patientService.update(NON_EXIST_ID, updateData)
        );

        assertNotNull(ex);
    }

    // ========== Test delete ==========
    @Test
    void shouldDeletePatient() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("test-keycloak-patient-006");
        account.setUsername("patient_006");
        account.setEmail("patient006@example.com");
        account = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(account.getId());
        profile.setFullName("Patient To Delete");
        profile = profileRepository.save(profile);

        PatientEntity patient = new PatientEntity();
        patient.setProfileId(profile.getId());
        patient.setInsuranceNumber("INS006");
        patient = patientRepository.save(patient);

        patientService.deleteById(patient.getId());

        assertFalse(patientRepository.existsById(patient.getId()));
    }

    // ========== Test delete not found ==========
    @Test
    void shouldThrowWhenDeletingNonExistingPatient() {
        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> patientService.deleteById(NON_EXIST_ID)
        );

        assertNotNull(ex);
    }

    // ========== Test findMyPatient ==========
    @Test
    void shouldFindMyPatient() {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId("test-keycloak-my-patient");
        account.setUsername("my_patient");
        account.setEmail("mypatient@example.com");
        account = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(account.getId());
        profile.setFullName("My Patient");
        profile = profileRepository.save(profile);

        PatientEntity patient = new PatientEntity();
        patient.setProfileId(profile.getId());
        patient.setInsuranceNumber("INS_MY");
        patientRepository.save(patient);

        Optional<PatientEntity> found =
                patientService.findMyPatient("test-keycloak-my-patient");

        assertTrue(found.isPresent());
        assertEquals("INS_MY", found.get().getInsuranceNumber());
    }

    // ========== Test updateMyPatient not found ==========
    @Test
    void shouldThrowWhenUpdatingMyPatientNotFound() {
        PatientEntity updateData = new PatientEntity();
        updateData.setInsuranceNumber("INS_TEST");

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> patientService.updateMyPatient("non-existing-keycloak-id", updateData)
        );

        assertNotNull(ex);
    }
}