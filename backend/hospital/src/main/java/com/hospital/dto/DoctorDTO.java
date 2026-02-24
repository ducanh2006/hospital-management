package com.hospital.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DoctorDTO — giữ nguyên các fields cần thiết cho frontend.
 * Các trường fullName, gender, dateOfBirth được lấy từ JOIN với bảng profile
 * trong các JPQL queries tại DoctorRepository.
 */
@AllArgsConstructor
@Data
@NoArgsConstructor
public class DoctorDTO {
    private Integer id;
    private String fullName; // từ profile.full_name
    private Gender gender; // từ profile.gender
    private String specialization;
    private LocalDate dateOfBirth; // từ profile.date_of_birth
    private Integer departmentId;
    private String phoneNumber; // từ profile.phone_number
    private String bio;
    private Integer experienceYear;
    private String pictureUrl; // từ picture.picture_url
    private Double avgRating;
    private Long totalReviews;
}
