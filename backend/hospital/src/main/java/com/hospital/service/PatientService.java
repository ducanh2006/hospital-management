package com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hospital.dto.AppointmentHistoryDTO;
import com.hospital.dto.PatientDTO;
import com.hospital.entity.PatientEntity;
import com.hospital.repository.PatientRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repo;
    private final com.hospital.repository.AccountRepository accountRepo;
    private final com.hospital.repository.ProfileRepository profileRepo;

    /**
     * Trả về tất cả bệnh nhân dưới dạng PatientDTO (JOIN profile).
     */
    public List<PatientDTO> findAll() {
        return repo.findAllWithProfile();
    }

    /**
     * Tìm bệnh nhân theo patient.id (INT, auto_increment).
     */
    public PatientEntity findById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id=" + id));
    }

    /**
     * Lịch sử khám bệnh theo patient.id.
     */
    public List<AppointmentHistoryDTO> getAppointmentHistory(Integer patientId) {
        if (!repo.existsById(patientId)) {
            throw new EntityNotFoundException("Patient not found with id=" + patientId);
        }
        return repo.findAppointmentHistoryByPatientId(patientId);
    }

    public PatientEntity save(PatientEntity patient) {
        // lastUpdate đã bị xóa khỏi schema mới
        return repo.save(patient);
    }

    public PatientEntity update(Integer id, PatientEntity patient) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Patient not found with id=" + id);
        }
        patient.setId(id);
        return repo.save(patient);
    }

    public void deleteById(Integer id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Patient not found with id=" + id);
        }
        repo.deleteById(id);
    }

    /**
     * Tìm bản ghi patient của người dùng hiện tại theo Keycloak sub.
     */
    public Optional<PatientEntity> findMyPatient(String sub) {
        return accountRepo.findByKeycloakUserId(sub)
                .flatMap(acc -> profileRepo.findByAccountId(acc.getId()))
                .flatMap(prof -> repo.findByProfileId(prof.getId()));
    }

    /**
     * Cập nhật bản ghi patient của người dùng hiện tại.
     */
    public PatientEntity updateMyPatient(String sub, PatientEntity updates) {
        PatientEntity patient = findMyPatient(sub)
                .orElseThrow(() -> new EntityNotFoundException("Patient record not found for user: " + sub));

        if (updates.getInsuranceNumber() != null)
            patient.setInsuranceNumber(updates.getInsuranceNumber());
        if (updates.getEmergencyContactPhone() != null)
            patient.setEmergencyContactPhone(updates.getEmergencyContactPhone());

        return repo.save(patient);
    }
}