package com.hospital.entity;

import java.time.LocalDate;

import com.hospital.dto.Gender;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "profile")
public class ProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "account_id", nullable = false, unique = true)
    private Integer accountId;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "identity_number", unique = true, length = 12)
    private String identityNumber;

    @Enumerated(EnumType.STRING)
    @Column
    private Gender gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 255)
    private String address;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;
}
