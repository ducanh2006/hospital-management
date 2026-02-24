package com.hospital.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hospital.entity.PatientEntity;

@Repository
public interface PatientRepository extends JpaRepository<PatientEntity, Integer> {

    Optional<PatientEntity> findByProfileId(Integer profileId);

    /**
     * Trả về tất cả bệnh nhân kèm thông tin cá nhân từ profile.
     */
    @Query("""
                SELECT new com.hospital.dto.PatientDTO(
                    pt.id,
                    pt.profileId,
                    prof.fullName,
                    prof.identityNumber,
                    prof.gender,
                    prof.dateOfBirth,
                    prof.phoneNumber,
                    prof.address,
                    pt.insuranceNumber,
                    pt.emergencyContactPhone
                )
                FROM PatientEntity pt
                JOIN ProfileEntity prof ON pt.profileId = prof.id
                ORDER BY pt.id
            """)
    List<com.hospital.dto.PatientDTO> findAllWithProfile();

    /**
     * Lịch sử khám bệnh theo patient.id (không còn dùng identity_number).
     */
    @Query("""
                SELECT new com.hospital.dto.AppointmentHistoryDTO(
                    a.id,
                    a.time,
                    a.status,
                    a.notes,
                    a.rating,
                    docProf.fullName,
                    dept.name,
                    a.testResults
                )
                FROM AppointmentEntity a
                JOIN DoctorEntity doc ON a.doctorId = doc.id
                JOIN ProfileEntity docProf ON doc.profileId = docProf.id
                LEFT JOIN DepartmentEntity dept ON a.departmentId = dept.id
                WHERE a.patientId = :patientId
                ORDER BY a.time DESC
            """)
    List<com.hospital.dto.AppointmentHistoryDTO> findAppointmentHistoryByPatientId(
            @Param("patientId") Integer patientId);

    @Query("""
            SELECT new com.hospital.entity.PatientEntity(
                pt.id,
                pt.profileId,
                pt.insuranceNumber,
                pt.emergencyContactPhone
            )
            FROM PatientEntity pt
            LEFT JOIN ProfileEntity prof ON pt.profileId = prof.id
            LEFT JOIN AccountEntity a ON prof.accountId = a.id
            WHERE a.keycloakUserId = :keycloakId
            """)
    PatientEntity findByKeycloakId(String keycloakId);
}