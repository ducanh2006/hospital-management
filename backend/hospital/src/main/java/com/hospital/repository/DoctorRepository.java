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
                p.pictureUrl,
                d.lastUpdate,
                AVG(a.rating),
                COUNT(a.id)
            )
            FROM DoctorEntity d
            LEFT JOIN PictureEntity p ON d.pictureId = p.id
            LEFT JOIN AppointmentEntity a
                ON a.doctorId = d.id
                AND a.status = com.hospital.dto.AppointmentStatus.COMPLETED
            GROUP BY d.id, d.fullName, d.gender, d.specialization,
                    d.dateOfBirth, d.departmentId, d.email, d.phone,
                    d.bio, d.experienceYear, p.pictureUrl, d.lastUpdate
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
                    p.pictureUrl,
                    d.lastUpdate,
                    AVG(a.rating),
                    COUNT(a.id)
            )
            FROM DoctorEntity d
            LEFT JOIN PictureEntity p ON d.pictureId = p.id
            LEFT JOIN AppointmentEntity a
                ON a.doctorId = d.id
                AND a.status = com.hospital.dto.AppointmentStatus.COMPLETED
            WHERE d.id = :doctorId
            GROUP BY d.id, d.fullName, d.gender, d.specialization,
                    d.dateOfBirth, d.departmentId, d.email, d.phone,
                    d.bio, d.experienceYear, p.pictureUrl, d.lastUpdate
            """)
    Optional<DoctorDTO> findByIdDoctorsWithRating(@Param("doctorId") Integer doctorId);

    @Query("""
            SELECT a FROM AppointmentEntity a
            WHERE a.status <> com.hospital.dto.AppointmentStatus.COMPLETED
              AND a.doctorId = :doctorId
            """)
    List<AppointmentEntity> findNonCompletedAppointmentsByDoctor(@Param("doctorId") Integer doctorId);

    // ── Tìm kiếm nâng cao — Deferred Join (2 bước) ───────────────────────────

    /**
     * Bước 1: Chỉ SELECT d.id với điều kiện lọc + phân trang.
     * Không JOIN bảng phụ → DB chỉ quét index trên bảng doctor (nhẹ).
     * Spring Data tự sinh count query để tính totalElements / totalPages.
     */
    @Query("""
            SELECT d.id FROM DoctorEntity d
            WHERE (:name IS NULL OR LOWER(d.fullName) LIKE LOWER(CONCAT('%', :name, '%')))
              AND (:gender IS NULL OR d.gender = :gender)
              AND (:departmentId IS NULL OR d.departmentId = :departmentId)
            """)
    Page<Integer> findDoctorIds(@Param("name") String name,
            @Param("gender") Gender gender,
            @Param("departmentId") Integer departmentId,
            Pageable pageable);

    /**
     * Bước 2: Lấy đầy đủ thông tin chỉ cho danh sách ID từ Bước 1.
     * JOIN picture + appointment chỉ thực hiện trên đúng số bản ghi của trang hiện
     * tại.
     */
    @Query("""
            SELECT new com.hospital.dto.DoctorDTO(
                d.id, d.fullName, d.gender, d.specialization, d.dateOfBirth,
                d.departmentId, d.email, d.phone, d.bio, d.experienceYear,
                p.pictureUrl, d.lastUpdate, AVG(a.rating), COUNT(a.id)
            )
            FROM DoctorEntity d
            LEFT JOIN PictureEntity p ON d.pictureId = p.id
            LEFT JOIN AppointmentEntity a
                ON a.doctorId = d.id
                AND a.status = com.hospital.dto.AppointmentStatus.COMPLETED
            WHERE d.id IN :ids
            GROUP BY d.id, d.fullName, d.gender, d.specialization,
                     d.dateOfBirth, d.departmentId, d.email, d.phone,
                     d.bio, d.experienceYear, p.pictureUrl, d.lastUpdate
            ORDER BY d.id
            """)
    List<DoctorDTO> findDoctorsByIds(@Param("ids") List<Integer> ids);
}