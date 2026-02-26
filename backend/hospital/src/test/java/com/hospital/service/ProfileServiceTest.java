package com.hospital.service;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.hospital.entity.AccountEntity;
import com.hospital.entity.ProfileEntity;
import com.hospital.repository.AccountRepository;
import com.hospital.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    ProfileRepository profileRepo;

    @Mock
    AccountRepository accountRepo;

    @InjectMocks
    ProfileService profileService;

    @Test
    void findMyProfile_returnsProfileWhenExists() {
        String sub = "kc-sub-1";
        AccountEntity acc = new AccountEntity();
        acc.setId(42);
        when(accountRepo.findByKeycloakUserId(sub)).thenReturn(Optional.of(acc));

        ProfileEntity prof = new ProfileEntity();
        prof.setId(7);
        prof.setAccountId(42);
        prof.setFullName("Nguyen Van A");
        when(profileRepo.findByAccountId(42)).thenReturn(Optional.of(prof));

        Optional<ProfileEntity> res = profileService.findMyProfile(sub);
        Assertions.assertTrue(res.isPresent());
        Assertions.assertEquals("Nguyen Van A", res.get().getFullName());
    }

    @Test
    void updateMyProfile_updatesFieldsAndSaves() {
        String sub = "kc-sub-2";
        AccountEntity acc = new AccountEntity();
        acc.setId(100);
        when(accountRepo.findByKeycloakUserId(sub)).thenReturn(Optional.of(acc));

        ProfileEntity existing = new ProfileEntity();
        existing.setId(11);
        existing.setAccountId(100);
        existing.setFullName("Old Name");
        existing.setPhoneNumber("012345");
        when(profileRepo.findByAccountId(100)).thenReturn(Optional.of(existing));

        ProfileEntity updates = new ProfileEntity();
        updates.setFullName("New Name");
        updates.setPhoneNumber("098765");
        updates.setDateOfBirth(LocalDate.of(1990, 1, 2));

        when(profileRepo.save(any(ProfileEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        ProfileEntity result = profileService.updateMyProfile(sub, updates);

        Assertions.assertEquals("New Name", result.getFullName());
        Assertions.assertEquals("098765", result.getPhoneNumber());
        Assertions.assertEquals(LocalDate.of(1990, 1, 2), result.getDateOfBirth());

        verify(profileRepo).save(existing);
    }

    @Test
    void updateMyProfile_throwsWhenProfileMissing() {
        String sub = "missing-sub";
        when(accountRepo.findByKeycloakUserId(sub)).thenReturn(Optional.empty());

        ProfileEntity updates = new ProfileEntity();
        EntityNotFoundException ex = Assertions.assertThrows(EntityNotFoundException.class, () -> {
            profileService.updateMyProfile(sub, updates);
        });
        Assertions.assertTrue(ex.getMessage().contains(sub));
    }
}
