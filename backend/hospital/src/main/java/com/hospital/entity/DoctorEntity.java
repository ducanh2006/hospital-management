package com.hospital.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Data
@Table(name = "doctor")
public class DoctorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotNull(message = "Profile ID is required")
    @Column(name = "profile_id", nullable = false, unique = true)
    private Integer profileId;

    @Column(length = 50)
    private String specialization;

    @Column(name = "department_id")
    private Integer departmentId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_year")
    private Integer experienceYear;

    @Column(name = "picture_id")
    private Integer pictureId;
}