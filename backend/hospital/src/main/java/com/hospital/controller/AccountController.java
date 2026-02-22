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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.entity.AccountEntity;
import com.hospital.service.AccountService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService service;

    /**
     * POST /api/accounts/login
     *
     * Đồng bộ tài khoản vào DB sau khi người dùng đăng nhập thành công qua
     * Keycloak.
     *
     * Cách dùng từ Frontend:
     * fetch('/api/accounts/login', {
     * method: 'POST',
     * headers: { 'Authorization': 'Bearer <access_token>' }
     * })
     *
     * Không cần gửi body. Spring Security tự validate token và inject Jwt.
     * Backend tự extract: sub → keycloakUserId, preferred_username, email,
     * realm_access.roles.
     *
     * Chỉ gọi đúng MỘT LẦN sau mỗi lần đăng nhập thành công.
     */
    @PostMapping("/login")
    public void login(@AuthenticationPrincipal Jwt jwt) {
        service.syncFromToken(jwt);
    }

    // ----------------------------------------------------------------
    // Các endpoint CRUD (admin only — được bảo vệ bởi SecurityConfig)
    // ----------------------------------------------------------------

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