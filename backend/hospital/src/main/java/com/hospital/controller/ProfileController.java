package com.hospital.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.entity.ProfileEntity;
import com.hospital.service.ProfileService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/api/profiles")
public class ProfileController {

    private final ProfileService service;

    /*
     * GET /api/profiles
     * Lấy thông tin profile của người dùng đang đăng nhập.
     */
    @GetMapping("/me")
    public ResponseEntity<ProfileEntity> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return service.findMyProfile(jwt.getSubject())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /*
     * PUT /api/profiles
     * Cập nhật thông tin profile của người dùng đang đăng nhập.
     */
    @PutMapping
    public ResponseEntity<ProfileEntity> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ProfileEntity updates) {
        ProfileEntity saved = service.updateMyProfile(jwt.getSubject(), updates);
        return ResponseEntity.ok(saved);
    }
}
