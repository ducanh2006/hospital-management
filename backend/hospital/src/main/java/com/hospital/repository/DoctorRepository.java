package com.hospital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hospital.dto.DoctorDTO;
import com.hospital.entity.AppointmentEntity;
import com.hospital.entity.DoctorEntity;

@Repository
public interface DoctorRepository extends JpaRepository<DoctorEntity, Integer> {

    @Query("""
                SELECT new com.hospital.dto.DoctorDTO(
                    d.id,
                    d.fullName,
                    d.gender,
                    d.specialization,
                    d.dateOfBirth,
                    d.departmentId,
                    d.email,
                    d.phone,
                    d.bio,
                    d.experienceYear,
                    d.pictureId,
                    d.lastUpdate,
                    AVG(a.rating),
                    COUNT(a.id)
                )
                FROM DoctorEntity d
                LEFT JOIN AppointmentEntity a
                    ON a.doctorId = d.id
                    AND a.status = com.hospital.dto.AppointmentStatus.COMPLETED
                GROUP BY d.id, d.fullName, d.gender, d.specialization,
                        d.dateOfBirth, d.departmentId,
                        d.email, d.phone, d.bio,
                        d.experienceYear, d.pictureId, d.lastUpdate
            """)
    List<DoctorDTO> findAllDoctorsWithRating();

    @Query("""
                SELECT new com.hospital.dto.DoctorDTO(
                    d.id,
                    d.fullName,
                    d.gender,
                    d.specialization,
                    d.dateOfBirth,
                    d.departmentId,
                    d.email,
                    d.phone,
                    d.bio,
                    d.experienceYear,
                    d.pictureId,
                    d.lastUpdate,
                    AVG(a.rating),
                    COUNT(a.id)
                )
                FROM DoctorEntity d
                LEFT JOIN AppointmentEntity a
                    ON a.doctorId = d.id
                    AND a.status = com.hospital.dto.AppointmentStatus.COMPLETED
                WHERE d.id = :doctorId
                GROUP BY d.id, d.fullName, d.gender, d.specialization,
                        d.dateOfBirth, d.departmentId,
                        d.email, d.phone, d.bio,
                        d.experienceYear, d.pictureId, d.lastUpdate
            """)
    Optional<DoctorDTO> findByIdDoctorsWithRating(@Param("doctorId") Integer doctorId);

    @Query("""
                SELECT a
                FROM AppointmentEntity a
                WHERE a.status <> com.hospital.dto.AppointmentStatus.COMPLETED
                AND a.doctorId = :doctorId
            """)
    List<AppointmentEntity> findNonCompletedAppointmentsByDoctor(@Param("doctorId") Integer doctorId);
}