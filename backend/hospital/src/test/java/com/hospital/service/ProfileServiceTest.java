package com.hospital.service;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.entity.AccountEntity;
import com.hospital.entity.ProfileEntity;
import com.hospital.repository.AccountRepository;
import com.hospital.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ProfileServiceTest {

    private static final String NON_EXIST_SUB = "non-existing-sub";

    @Autowired
    ProfileRepository profileRepo;

    @Autowired
    AccountRepository accountRepo;

    @Autowired
    ProfileService profileService;

    @Test
    void findMyProfile_returnsProfileWhenExists() {

        String sub = "kc-sub-1";

        AccountEntity acc = new AccountEntity();
        acc.setKeycloakUserId(sub);
        acc.setUsername("user1");
        acc.setEmail("user1@test.com");
        acc = accountRepo.save(acc);

        ProfileEntity prof = new ProfileEntity();
        prof.setAccountId(acc.getId());
        prof.setFullName("Nguyen Van A");
        profileRepo.save(prof);

        Optional<ProfileEntity> res = profileService.findMyProfile(sub);

        assertTrue(res.isPresent());
        assertEquals("Nguyen Van A", res.get().getFullName());
    }

    @Test
    void updateMyProfile_updatesFieldsAndSaves() {

        String sub = "kc-sub-2";

        AccountEntity acc = new AccountEntity();
        acc.setKeycloakUserId(sub);
        acc.setUsername("user2");
        acc.setEmail("user2@test.com");
        acc = accountRepo.save(acc);

        ProfileEntity existing = new ProfileEntity();
        existing.setAccountId(acc.getId());
        existing.setFullName("Old Name");
        existing.setPhoneNumber("012345");
        profileRepo.save(existing);

        ProfileEntity updates = new ProfileEntity();
        updates.setAccountId(acc.getId());
        updates.setFullName("New Name");
        updates.setPhoneNumber("098765");
        updates.setDateOfBirth(LocalDate.of(1990, 1, 2));

        ProfileEntity result = profileService.updateMyProfile(sub, updates);

        assertEquals("New Name", result.getFullName());
        assertEquals("098765", result.getPhoneNumber());
        assertEquals(LocalDate.of(1990, 1, 2), result.getDateOfBirth());
    }

    @Test
    void updateMyProfile_throwsWhenProfileMissing() {

        ProfileEntity updates = new ProfileEntity();

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> profileService.updateMyProfile(NON_EXIST_SUB, updates)
        );

        assertNotNull(ex);
    }
}