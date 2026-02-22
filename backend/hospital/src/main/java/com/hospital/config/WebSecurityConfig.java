package com.hospital.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

/**
 * Spring Security configuration using OAuth2 Resource Server (Keycloak JWT).
 *
 * Roles expected in token (Keycloak realm roles):
 * - patient
 * - doctor
 * - admin
 *
 * Keycloak JWT claim path: realm_access.roles → mapped by KeycloakRoleConverter
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig {

    private final KeycloakRoleConverter keycloakRoleConverter;

    // ─────────────────────────────────────────────────────────────────────
    // CORS — cho phép frontend gọi API từ bất kỳ origin
    // ─────────────────────────────────────────────────────────────────────
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOriginPatterns("*")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                        .allowedHeaders("*")
                        .allowCredentials(false);
            }
        };
    }

    // ─────────────────────────────────────────────────────────────────────
    // Converter: đọc realm_access.roles từ Keycloak JWT → GrantedAuthority
    // ─────────────────────────────────────────────────────────────────────
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(keycloakRoleConverter);
        return converter;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Security Filter Chain
    // ─────────────────────────────────────────────────────────────────────
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {
                })
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ── Public endpoints (không cần đăng nhập) ──────────────────
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // Xem danh sách bác sĩ, khoa, tin tức — ai cũng xem được
                        .requestMatchers(HttpMethod.GET, "/api/doctors/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/departments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/medical-news/**").permitAll()

                        // ── ADMIN only ────────────────────────────────────────────────
                        // Sync account sau login — bất kỳ user nào có token hợp lệ đều gọi được
                        .requestMatchers(HttpMethod.POST, "/api/accounts/login").authenticated()

                        // Quản lý account (còn lại) — chỉ admin
                        .requestMatchers("/api/accounts/**").hasRole("admin")

                        // Quản lý bác sĩ (thêm/sửa/xóa)
                        .requestMatchers(HttpMethod.POST, "/api/doctors/**").hasRole("admin")
                        .requestMatchers(HttpMethod.PUT, "/api/doctors/**").hasRole("admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/doctors/**").hasRole("admin")

                        // Quản lý khoa (thêm/sửa/xóa)
                        .requestMatchers(HttpMethod.POST, "/api/departments/**").hasRole("admin")
                        .requestMatchers(HttpMethod.PUT, "/api/departments/**").hasRole("admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/departments/**").hasRole("admin")

                        // Quản lý tin tức (thêm/sửa/xóa)
                        .requestMatchers(HttpMethod.POST, "/api/medical-news/**").hasRole("admin")
                        .requestMatchers(HttpMethod.PUT, "/api/medical-news/**").hasRole("admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/medical-news/**").hasRole("admin")

                        // Quản lý ảnh
                        .requestMatchers("/api/pictures/**").hasRole("admin")

                        // ── DOCTOR + ADMIN ────────────────────────────────────────────
                        // Bác sĩ xem danh sách bệnh nhân
                        .requestMatchers(HttpMethod.GET, "/api/patients/**").hasAnyRole("doctor", "admin")

                        // Bác sĩ cập nhật lịch hẹn (confirm/complete/cancel)
                        .requestMatchers(HttpMethod.PUT, "/api/appointments/**").hasAnyRole("doctor", "admin")
                        .requestMatchers(HttpMethod.DELETE, "/api/appointments/**").hasAnyRole("doctor", "admin")

                        // ── PATIENT + DOCTOR + ADMIN ──────────────────────────────────
                        // Đặt lịch hẹn, xem lịch hẹn
                        .requestMatchers(HttpMethod.GET, "/api/appointments/**")
                        .hasAnyRole("patient", "doctor", "admin")
                        .requestMatchers(HttpMethod.POST, "/api/appointments/**")
                        .hasAnyRole("patient", "doctor", "admin")

                        // Bệnh nhân tự cập nhật hồ sơ của mình
                        .requestMatchers(HttpMethod.PUT, "/api/patients/**").hasAnyRole("patient", "doctor", "admin")
                        .requestMatchers(HttpMethod.POST, "/api/patients/**").hasAnyRole("patient", "doctor", "admin")

                        // ── Tất cả còn lại phải đăng nhập ────────────────────────────
                        .anyRequest().authenticated())

                // ── OAuth2 Resource Server — validate JWT từ Keycloak ────────────
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }
}
