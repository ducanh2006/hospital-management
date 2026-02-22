package com.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "account")
public class AccountEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "keycloak_user_id", length = 36, nullable = false, unique = true)
    private String keycloakUserId;

    @Column(name = "username", length = 100, nullable = false)
    private String username;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;

    @Column(name = "identity_number", length = 12, nullable = false, unique = true)
    private String identityNumber;

    @Column(name = "role_id")
    private Integer roleId;
}