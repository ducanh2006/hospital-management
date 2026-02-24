package com.hospital.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về thông tin bệnh nhân đầy đủ (JOIN patient + profile).
 * Dùng cho GET /api/patients và GET /api/patients/{id}.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PatientDTO {
    private Integer id; // patient.id
    private Integer profileId;
    private String fullName; // profile.full_name
    private String identityNumber; // profile.identity_number
    private Gender gender; // profile.gender
    private LocalDate dateOfBirth; // profile.date_of_birth
    private String phoneNumber; // profile.phone_number
    private String address; // profile.address
    private String insuranceNumber;
    private String emergencyContactPhone;
}
