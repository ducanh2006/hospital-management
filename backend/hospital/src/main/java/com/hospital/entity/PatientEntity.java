package com.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mapping bảng `patient`.
 * PK giờ là INT auto_increment (trước đây là identity_number LONG).
 * Thông tin cá nhân nằm ở bảng `profile` thông qua FK profile_id.
 */
@Entity
@Data
@Table(name = "patient")
@AllArgsConstructor
@NoArgsConstructor
public class PatientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "Profile ID is required")
    @Column(name = "profile_id", nullable = false, unique = true)
    private Integer profileId;

    @Column(name = "insurance_number", length = 50)
    private String insuranceNumber;

    @Column(name = "emergency_contact_phone", length = 30)
    private String emergencyContactPhone;
}