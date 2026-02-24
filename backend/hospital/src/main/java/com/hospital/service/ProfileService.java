package com.hospital.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hospital.entity.ProfileEntity;
import com.hospital.repository.AccountRepository;
import com.hospital.repository.ProfileRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepo;
    private final AccountRepository accountRepo;

    /**
     * Tìm profile của người dùng hiện tại dựa trên Keycloak sub (keycloakUserId).
     */
    public Optional<ProfileEntity> findMyProfile(String sub) {
        return accountRepo.findByKeycloakUserId(sub)
                .flatMap(acc -> profileRepo.findByAccountId(acc.getId()));
    }

    /**
     * Cập nhật profile của người dùng hiện tại.
     */
    public ProfileEntity updateMyProfile(String sub, ProfileEntity updates) {
        ProfileEntity profile = findMyProfile(sub)
                .orElseThrow(() -> new EntityNotFoundException("Profile not found for user: " + sub));

        // Update fields
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
}
