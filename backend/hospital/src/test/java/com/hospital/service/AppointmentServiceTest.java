package com.hospital.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.dto.AppointmentStatus;
import com.hospital.entity.AccountEntity;
import com.hospital.entity.AppointmentEntity;
import com.hospital.entity.DoctorEntity;
import com.hospital.entity.PatientEntity;
import com.hospital.entity.ProfileEntity;
import com.hospital.repository.AccountRepository;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AppointmentServiceTest {

    private static final Integer NON_EXIST_ID = 999_999;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    // ================= SETUP PATIENT =================
    private PatientEntity setupPatient(String keycloakId, String fullName) {
        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId(keycloakId);
        account.setUsername(keycloakId + "_user");
        account.setEmail(keycloakId + "@example.com");
        AccountEntity savedAccount = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(savedAccount.getId());
        profile.setFullName(fullName);
        ProfileEntity savedProfile = profileRepository.save(profile);

        PatientEntity patient = new PatientEntity();
        patient.setProfileId(savedProfile.getId());
        patient.setInsuranceNumber(keycloakId + "_INS");

        return patientRepository.save(patient);
    }

    // ================= SETUP DOCTOR =================
    private DoctorEntity setupDoctor(String keycloakId, String fullName) {

        AccountEntity account = new AccountEntity();
        account.setKeycloakUserId(keycloakId);
        account.setUsername(keycloakId + "_doctor");
        account.setEmail(keycloakId + "@doctor.com");
        AccountEntity savedAccount = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(savedAccount.getId());
        profile.setFullName(fullName);
        ProfileEntity savedProfile = profileRepository.save(profile);

        DoctorEntity doctor = new DoctorEntity();
        doctor.setProfileId(savedProfile.getId());

        return doctorRepository.save(doctor);
    }

    // ================= Test findAll =================
    @Test
    void shouldFindAllAppointments() {

        PatientEntity patient = setupPatient("apt-patient-001", "Appointment Patient 1");
        DoctorEntity doctor1 = setupDoctor("doc-001", "Doctor 1");
        DoctorEntity doctor2 = setupDoctor("doc-002", "Doctor 2");

        AppointmentEntity apt1 = new AppointmentEntity();
        apt1.setPatientId(patient.getId());
        apt1.setDoctorId(doctor1.getId());
        apt1.setTime(LocalDateTime.now().plusDays(1));
        apt1.setNotes("Checkup");
        apt1.setStatus(AppointmentStatus.PENDING);
        appointmentRepository.save(apt1);

        AppointmentEntity apt2 = new AppointmentEntity();
        apt2.setPatientId(patient.getId());
        apt2.setDoctorId(doctor2.getId());
        apt2.setTime(LocalDateTime.now().plusDays(2));
        apt2.setNotes("Follow-up");
        apt2.setStatus(AppointmentStatus.PENDING);
        appointmentRepository.save(apt2);

        List<AppointmentEntity> found = appointmentService.findAll();
        assertTrue(found.size() >= 2);
    }

    // ================= Test findById =================
    @Test
    void shouldFindAppointmentById() {

        PatientEntity patient = setupPatient("apt-patient-002", "Appointment Patient 2");
        DoctorEntity doctor = setupDoctor("doc-003", "Doctor 3");

        AppointmentEntity apt = new AppointmentEntity();
        apt.setPatientId(patient.getId());
        apt.setDoctorId(doctor.getId());
        apt.setTime(LocalDateTime.now().plusDays(1));
        apt.setNotes("Initial Consultation");
        apt.setStatus(AppointmentStatus.PENDING);

        AppointmentEntity saved = appointmentRepository.save(apt);

        Optional<AppointmentEntity> found = appointmentService.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals("Initial Consultation", found.get().getNotes());
    }

    @Test
    void shouldThrowWhenFindByIdWithNullId() {
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> appointmentService.findById(null));

        assertTrue(ex instanceof IllegalArgumentException);
    }

    @Test
    void shouldReturnEmptyWhenAppointmentNotFound() {
        Optional<AppointmentEntity> found =
                appointmentService.findById(NON_EXIST_ID);

        assertFalse(found.isPresent());
    }

    // ================= Test update =================
    @Test
    void shouldUpdateAppointment() {

        PatientEntity patient = setupPatient("apt-patient-003", "Appointment Patient 3");
        DoctorEntity doctor1 = setupDoctor("doc-004", "Doctor 4");
        DoctorEntity doctor2 = setupDoctor("doc-005", "Doctor 5");

        AppointmentEntity apt = new AppointmentEntity();
        apt.setPatientId(patient.getId());
        apt.setDoctorId(doctor1.getId());
        apt.setTime(LocalDateTime.now().plusDays(1));
        apt.setNotes("Original Reason");
        apt.setStatus(AppointmentStatus.PENDING);

        AppointmentEntity saved = appointmentRepository.save(apt);

        AppointmentEntity updateData = new AppointmentEntity();
        updateData.setPatientId(patient.getId());
        updateData.setDoctorId(doctor2.getId());
        updateData.setTime(LocalDateTime.now().plusDays(2));
        updateData.setNotes("Updated Reason");

        AppointmentEntity updated =
                appointmentService.update(saved.getId(), updateData);

        assertEquals("Updated Reason", updated.getNotes());
        assertEquals(doctor2.getId(), updated.getDoctorId());
    }

    @Test
    void shouldThrowWhenUpdatingNonExistingAppointment() {
        AppointmentEntity updateData = new AppointmentEntity();
        updateData.setNotes("Test");

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> appointmentService.update(NON_EXIST_ID, updateData));

        assertTrue(ex instanceof EntityNotFoundException);
    }

    // ================= Test delete =================
    @Test
    void shouldDeleteAppointment() {

        PatientEntity patient = setupPatient("apt-patient-004", "Appointment Patient 4");
        DoctorEntity doctor = setupDoctor("doc-006", "Doctor 6");

        AppointmentEntity apt = new AppointmentEntity();
        apt.setPatientId(patient.getId());
        apt.setDoctorId(doctor.getId());
        apt.setTime(LocalDateTime.now().plusDays(1));
        apt.setNotes("To Delete");
        apt.setStatus(AppointmentStatus.PENDING);

        AppointmentEntity saved = appointmentRepository.save(apt);

        appointmentService.deleteById(saved.getId());

        assertFalse(appointmentRepository.existsById(saved.getId()));
    }

    @Test
    void shouldThrowWhenDeletingNonExistingAppointment() {
        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> appointmentService.deleteById(NON_EXIST_ID));

        assertTrue(ex instanceof EntityNotFoundException);
    }
}