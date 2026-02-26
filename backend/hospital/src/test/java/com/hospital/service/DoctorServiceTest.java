package com.hospital.service;

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

import com.hospital.dto.DoctorDTO;
import com.hospital.entity.AccountEntity;
import com.hospital.entity.DoctorEntity;
import com.hospital.entity.ProfileEntity;
import com.hospital.repository.AccountRepository; // Đảm bảo đã @Autowired
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;

@SpringBootTest
@ActiveProfiles("test") 
@Transactional       // Tự động ROLLBACK sau mỗi test
class DoctorServiceTest {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private ProfileRepository profileRepository;
    
    @Autowired
    private AccountRepository accountRepository;


    // -----------------------------
    // 1) save + findById
    // -----------------------------
    @Test
    void shouldSaveAndFindDoctorById() {
        AccountEntity account = new AccountEntity();
        // GÁN CÁC TRƯỜNG BẮT BUỘC CHO ACCOUNT
        account.setKeycloakUserId("test-keycloak-id-001"); 
        account.setUsername("test_doctor_username_001");  
        account.setEmail("doctor001@example.com");       


        AccountEntity savedAccount = accountRepository.save(account);

        // Tạo profile, gán account_id từ account vừa tạo
        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(savedAccount.getId());
        profile.setFullName("Dr Test");
        ProfileEntity savedProfile = profileRepository.save(profile);

        DoctorEntity doctor = new DoctorEntity();
        doctor.setProfileId(savedProfile.getId());
        doctor.setSpecialization("Cardiology");
        doctor.setDepartmentId(1);
        doctor.setExperienceYear(5);

        DoctorEntity savedDoctor = doctorRepository.save(doctor);

        Optional<DoctorDTO> found = doctorService.findById(savedDoctor.getId());

        assertTrue(found.isPresent(), "DoctorDTO should be present");
        assertEquals("Cardiology", found.get().getSpecialization(), "specialization should match");
        assertEquals("Dr Test", found.get().getFullName(), "fullName from profile should match");
    }

    // -----------------------------
    // 2) update doctor + update profile inside update()
    // -----------------------------
    @Test
    void shouldUpdateDoctorAndProfileWhenUpdateCalled() {
        AccountEntity account = new AccountEntity();
        // GÁN CÁC TRƯỜNG BẮT BUỘC CHO ACCOUNT
        account.setKeycloakUserId("test-keycloak-id-002"); 
        account.setUsername("test_doctor_username_002");  
        account.setEmail("doctor002@example.com");        

        AccountEntity savedAccount = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(savedAccount.getId()); 
        profile.setFullName("Old Name");
        ProfileEntity savedProfile = profileRepository.save(profile);

        DoctorEntity doctor = new DoctorEntity();
        doctor.setProfileId(savedProfile.getId());
        doctor.setSpecialization("OldSpec");
        doctor.setDepartmentId(2);
        doctor.setExperienceYear(3);
        DoctorEntity savedDoctor = doctorRepository.save(doctor);

        DoctorDTO dto = new DoctorDTO();
        dto.setSpecialization("NewSpec");
        dto.setFullName("New Name"); 

        DoctorDTO returned = doctorService.update(savedDoctor.getId(), dto);
        assertEquals("NewSpec", returned.getSpecialization(), "Doctor specialization should be updated");
        ProfileEntity reloadedProfile = profileRepository.findById(savedProfile.getId()).orElseThrow();
        assertEquals("New Name", reloadedProfile.getFullName(), "Profile fullName should be updated");
    }

    // -----------------------------
    // 3) delete doctor
    // -----------------------------
    @Test
    void shouldDeleteDoctor() {
        AccountEntity account = new AccountEntity();
        // GÁN CÁC TRƯỜNG BẮT BUỘC CHO ACCOUNT
        account.setKeycloakUserId("test-keycloak-id-003"); 
        account.setUsername("test_doctor_username_003");  
        account.setEmail("doctor003@example.com");         

        AccountEntity savedAccount = accountRepository.save(account);

        ProfileEntity profile = new ProfileEntity();
        profile.setAccountId(savedAccount.getId()); 
        profile.setFullName("To Delete");
        ProfileEntity savedProfile = profileRepository.save(profile);

        DoctorEntity doctor = new DoctorEntity();
        doctor.setProfileId(savedProfile.getId());
        doctor.setSpecialization("ToDeleteSpec");
        DoctorEntity savedDoctor = doctorRepository.save(doctor);

        doctorService.deleteById(savedDoctor.getId());

        assertFalse(doctorRepository.existsById(savedDoctor.getId()), "Doctor should be deleted");
    }

    // -----------------------------
    // 4) delete non-existing -> throw EntityNotFoundException
    // -----------------------------
    @Test
    void deleteNonExistingShouldThrow() {
        Integer nonExistId = 999_999;
        assertThrows(EntityNotFoundException.class, () -> doctorService.deleteById(nonExistId));
    }
}