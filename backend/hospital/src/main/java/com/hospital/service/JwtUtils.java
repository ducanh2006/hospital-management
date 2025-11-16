package com.hospital.service;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.hospital.entity.Account;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtUtils {

    private final Key key;
    private final long expirationMs;

    public JwtUtils(@Value("${jwt.secret}") String secretKey,
                    @Value("${jwt.expirationMs}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
        this.expirationMs = expirationMs;
    }

    /**
     * Sinh JWT token từ thông tin Account
     */
    public String generateToken(Account account) {
        return Jwts.builder()
                .setSubject(String.valueOf(account.getId())) // Lưu ID vào subject
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key)
                .compact();
    }
    /**
     * Validate JWT token
     */
    public Claims validateToken(String token) throws JwtException {
        try {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
        } catch (JwtException e) {
            throw e;
        }
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Lấy ID từ token
     */
    public Integer getIdFromToken(String token) {
        try {
            Claims claims = validateToken(token);
            return Integer.parseInt(claims.getSubject());
        } catch ( Exception e) {
            throw new RuntimeException("Invalid token, error caused in service.JwtUtils.getIdFromToken");
        }
    }
    /**
     * Kiểm tra token đã hết hạn chưa
     */
    public boolean isTokenExpired(String token) {
        try {
            Date expiration = validateToken(token).getExpiration();
            return expiration.before(new Date());
        } catch (JwtException e) {
            return true;
        }
    }
    /**
     * Kiểm tra token hợp lệ và chưa hết hạn
     */
    public boolean isTokenValid(String token) {
        return !isTokenExpired(token) && getIdFromToken(token) != null;
    }
}
