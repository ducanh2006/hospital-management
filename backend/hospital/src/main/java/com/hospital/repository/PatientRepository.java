package com.hospital.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hospital.dto.AppointmentHistoryDTO;
import com.hospital.entity.PatientEntity;

@Repository
public interface PatientRepository extends JpaRepository<PatientEntity, Long> {

    @Query("""
        SELECT new com.hospital.dto.AppointmentHistoryDTO(
            a.id, 
            a.time, 
            a.status, 
            a.notes, 
            a.rating, 
            d.fullName,      
            dept.name,
            a.testResults     
        )
        FROM AppointmentEntity a
        JOIN DoctorEntity d ON a.doctorId = d.id      
        LEFT JOIN DepartmentEntity dept ON a.departmentId = dept.id 
        WHERE a.patientIdentityNumber = :id
        ORDER BY a.time DESC
    """)
    List<AppointmentHistoryDTO> findAppointmentHistoryByIdentityNumber(@Param("id") Long id);
}