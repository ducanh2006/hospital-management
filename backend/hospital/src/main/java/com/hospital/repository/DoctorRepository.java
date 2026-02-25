package com.hospital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hospital.dto.DoctorDTO;
import com.hospital.dto.Gender;
import com.hospital.entity.AppointmentEntity;
import com.hospital.entity.DoctorEntity;

@Repository
public interface DoctorRepository extends JpaRepository<DoctorEntity, Integer> {

        Optional<DoctorEntity> findByProfileId(Integer profileId);

        // ── Tất cả bác sĩ có rating (JOIN profile + picture + appointment) ────────
        @Query("""
                        SELECT new com.hospital.dto.DoctorDTO(
                                d.id,
                                prof.fullName,
                                prof.gender,
                                d.specialization,
                                prof.dateOfBirth,
                                d.departmentId,
                                prof.phoneNumber,
                                d.bio,
                                d.experienceYear,
                                p.pictureUrl,
                                AVG(a.rating),
                                COUNT(a.id)
                        )
                        FROM DoctorEntity d
                        JOIN ProfileEntity prof ON d.profileId = prof.id
                        LEFT JOIN PictureEntity p ON d.pictureId = p.id
                        LEFT JOIN AppointmentEntity a
                                ON a.doctorId = d.id
                                AND a.status = com.hospital.dto.AppointmentStatus.COMPLETED
                        GROUP BY d.id, prof.fullName, prof.gender, d.specialization,
                                prof.dateOfBirth, d.departmentId, prof.phoneNumber,
                                d.bio, d.experienceYear, p.pictureUrl
                        """)
        List<DoctorDTO> findAllDoctorsWithRating();

        // ── Một bác sĩ theo ID với rating ────────────────────────────────────────
        @Query("""
                        SELECT new com.hospital.dto.DoctorDTO(
                            d.id,
                            prof.fullName,
                            prof.gender,
                            d.specialization,
                            prof.dateOfBirth,
                            d.departmentId,
                            prof.phoneNumber,
                            d.bio,
                            d.experienceYear,
                            p.pictureUrl,
                            AVG(a.rating),
                            COUNT(a.id)
                        )
                        FROM DoctorEntity d
                        JOIN ProfileEntity prof ON d.profileId = prof.id
                        LEFT JOIN PictureEntity p ON d.pictureId = p.id
                        LEFT JOIN AppointmentEntity a
                            ON a.doctorId = d.id
                            AND a.status = com.hospital.dto.AppointmentStatus.COMPLETED
                        WHERE d.id = :doctorId
                        GROUP BY d.id, prof.fullName, prof.gender, d.specialization,
                                prof.dateOfBirth, d.departmentId, prof.phoneNumber,
                                d.bio, d.experienceYear, p.pictureUrl
                        """)
        Optional<DoctorDTO> findByIdDoctorsWithRating(@Param("doctorId") Integer doctorId);

        // ── Lịch hẹn chưa hoàn thành của bác sĩ ─────────────────────────────────
        @Query("""
                        SELECT a FROM AppointmentEntity a
                        WHERE a.status <> com.hospital.dto.AppointmentStatus.COMPLETED
                                AND a.doctorId = :doctorId
                        """)
        List<AppointmentEntity> findNonCompletedAppointmentsByDoctor(@Param("doctorId") Integer doctorId);

        // ── Tìm kiếm nâng cao — Deferred Join (Bước 1) ───────────────────────────

        /**
         * Bước 1: Chỉ SELECT d.id với điều kiện lọc + phân trang.
         * JOIN profile để filter theo tên.
         * Spring Data tự sinh count query để tính totalElements / totalPages.
         */
        @Query("""
                        SELECT d.id FROM DoctorEntity d
                        JOIN ProfileEntity prof ON d.profileId = prof.id
                        WHERE (:name IS NULL OR LOWER(prof.fullName) LIKE :name)
                        AND (:gender IS NULL OR CAST(prof.gender AS string) = :gender)
                        AND (:departmentId IS NULL OR d.departmentId = :departmentId)
                        """)
        Page<Integer> findDoctorIds(@Param("name") String name,
                        @Param("gender") Gender gender,
                        @Param("departmentId") Integer departmentId,
                        Pageable pageable);

        /**
         * Bước 2: Lấy đầy đủ thông tin chỉ cho danh sách ID từ Bước 1.
         * JOIN profile + picture + appointment chỉ trên đúng số bản ghi của trang.
         */
        @Query("""
                        SELECT new com.hospital.dto.DoctorDTO(
                            d.id, prof.fullName, prof.gender, d.specialization, prof.dateOfBirth,
                            d.departmentId, prof.phoneNumber, d.bio, d.experienceYear,
                            p.pictureUrl, AVG(a.rating), COUNT(a.id)
                        )
                        FROM DoctorEntity d
                        JOIN ProfileEntity prof ON d.profileId = prof.id
                        LEFT JOIN PictureEntity p ON d.pictureId = p.id
                        LEFT JOIN AppointmentEntity a
                            ON a.doctorId = d.id
                            AND a.status = com.hospital.dto.AppointmentStatus.COMPLETED
                        WHERE d.id IN :ids
                        GROUP BY d.id, prof.fullName, prof.gender, d.specialization,
                                 prof.dateOfBirth, d.departmentId, prof.phoneNumber,
                                 d.bio, d.experienceYear, p.pictureUrl
                        ORDER BY d.id
                        """)
        List<DoctorDTO> findDoctorsByIds(@Param("ids") List<Integer> ids);
}