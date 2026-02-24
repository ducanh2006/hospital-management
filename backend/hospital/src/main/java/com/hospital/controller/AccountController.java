package com.hospital.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.AppointmentHistoryDTO;
import com.hospital.entity.AccountEntity;
import com.hospital.entity.ProfileEntity;
import com.hospital.service.AccountService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService service;

    // ─────────────────────────────────────────────────────────────────────
    // POST /api/accounts/login
    // Được gọi sau mỗi lần đăng nhập Keycloak.
    // Upsert: account + profile + patient/doctor tùy role.
    // ─────────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public void login(@AuthenticationPrincipal Jwt jwt) {
        service.syncFromToken(jwt);
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/accounts/me/profile
    // Trả về profile của người dùng đang đăng nhập (từ JWT).
    // ─────────────────────────────────────────────────────────────────────
    @GetMapping("/me/profile")
    public ResponseEntity<ProfileEntity> getMyProfile(@AuthenticationPrincipal Jwt jwt) {
        return service.findMyProfile(jwt.getSubject())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────────────
    // PUT /api/accounts/me/profile
    // Cập nhật thông tin cá nhân (họ tên, CCCD, giới tính, ngày sinh,
    // địa chỉ, SĐT) — người dùng tự chỉnh sửa qua Header ProfileModal.
    // ─────────────────────────────────────────────────────────────────────
    @PutMapping("/me/profile")
    public ResponseEntity<ProfileEntity> updateMyProfile(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ProfileEntity updates) {
        ProfileEntity saved = service.updateMyProfile(jwt.getSubject(), updates);
        return ResponseEntity.ok(saved);
    }

    // ─────────────────────────────────────────────────────────────────────
    // GET /api/accounts/me/appointments
    // Trả về lịch sử khám của bệnh nhân đang đăng nhập — không cần CCCD.
    // Dùng cho: TestResults page và Booking page.
    // ─────────────────────────────────────────────────────────────────────
    @GetMapping("/me/appointments")
    public ResponseEntity<List<AppointmentHistoryDTO>> getMyAppointments(
            @AuthenticationPrincipal Jwt jwt) {
        try {
            List<AppointmentHistoryDTO> result = service.findMyAppointments(jwt.getSubject());
            return ResponseEntity.ok(result);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            // Người dùng chưa có hồ sơ bệnh nhân — trả 404
            return ResponseEntity.notFound().build();
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Admin CRUD
    // ─────────────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<?> getAccounts(
            @RequestParam(required = false) Integer id,
            @RequestParam(required = false) String username) {

        if (id != null) {
            return service.findById(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }

        if (username != null && !username.isBlank()) {
            return service.findByUsername(username)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        }

        List<AccountEntity> accounts = service.findAll();
        return ResponseEntity.ok(accounts);
    }

    @PostMapping
    public ResponseEntity<AccountEntity> create(@RequestBody AccountEntity account) {
        return ResponseEntity.ok(service.save(account));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}