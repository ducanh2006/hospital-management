package com.hospital.dto;

import lombok.Data;

/**
 * DTO cho endpoint POST /api/accounts/login.
 * Frontend chỉ cần gửi raw Access Token từ Keycloak.
 * Backend tự parse các claim cần thiết.
 */
@Data
public class LoginRequest {

    /** Raw JWT Access Token nhận được từ Keycloak */
    private String token;
}
