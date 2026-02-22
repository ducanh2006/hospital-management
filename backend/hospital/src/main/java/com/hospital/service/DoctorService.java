package com.hospital.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.hospital.dto.DoctorDTO;
import com.hospital.dto.DoctorSearchRequest;
import com.hospital.dto.Gender;
import com.hospital.dto.PageResponse;
import com.hospital.entity.AppointmentEntity;
import com.hospital.entity.DoctorEntity;
import com.hospital.repository.DoctorRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository repo;

    public List<DoctorEntity> findAll() {
        return repo.findAll();
    }

    // Query giống findAll ở trên nhưng thông tin đầy đủ hơn, có cả rating
    public List<DoctorDTO> findAllDoctorsWithRating() {
        return repo.findAllDoctorsWithRating();
    }

    /**
     * Tìm kiếm bác sĩ nâng cao với phân trang tối ưu (Deferred Join — 2 bước JPQL).
     *
     * Bước 1: findDoctorIds() — chỉ SELECT d.id với điều kiện lọc + Pageable.
     * Không JOIN bảng phụ → DB chỉ quét index. Spring Data tự sinh COUNT.
     *
     * Bước 2: findDoctorsByIds() — lấy đầy đủ DoctorDTO (JOIN picture, appointment)
     * chỉ trên đúng danh sách ID của trang hiện tại.
     */
    public PageResponse<DoctorDTO> searchDoctors(DoctorSearchRequest req) {
        // Convert gender string → enum (null = không lọc theo gender)
        Gender gender = (req.getGender() != null && !req.getGender().isBlank())
                ? Gender.valueOf(req.getGender().toUpperCase())
                : null;

        // Bước 1: index-only scan, có phân trang + count tự động
        Page<Integer> idPage = repo.findDoctorIds(
                req.getName(),
                gender,
                req.getDepartmentId(),
                PageRequest.of(req.getPage(), req.getSize()));

        if (idPage.isEmpty()) {
            return new PageResponse<>(List.of(), req.getPage(), req.getSize(),
                    idPage.getTotalElements(), idPage.getTotalPages());
        }

        // Bước 2: full fetch chỉ cho IDs của trang này
        List<DoctorDTO> content = repo.findDoctorsByIds(idPage.getContent());

        return new PageResponse<>(content, req.getPage(), req.getSize(),
                idPage.getTotalElements(), idPage.getTotalPages());
    }

    public Optional<DoctorDTO> findById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Doctor id must not be null");
        }
        return repo.findByIdDoctorsWithRating(id);
    }

    // Query tìm lịch hẹn chưa hoàn thành của bác sĩ
    public List<AppointmentEntity> findNonCompletedAppointments(Integer doctorId) {
        if (!repo.existsById(doctorId)) {
            throw new EntityNotFoundException("Doctor not found with id=" + doctorId);
        }
        System.out.println(" vao repository ");
        return repo.findNonCompletedAppointmentsByDoctor(doctorId);
    }

    public DoctorEntity save(DoctorEntity doctor) {
        if (doctor == null)
            throw new IllegalArgumentException("Doctor must not be null");
        doctor.setLastUpdate(LocalDateTime.now());
        return repo.save(doctor);
    }

    public DoctorEntity update(Integer id, DoctorEntity doctor) {
        if (id == null)
            throw new IllegalArgumentException("ID must not be null");
        if (doctor.getLastUpdate() == null) {
            doctor.setLastUpdate(LocalDateTime.now());
        }
        doctor.setId(id);
        repo.findById(doctor.getId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id=" + doctor.getId()));
        return repo.save(doctor);
    }

    public void deleteById(Integer id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Doctor not found with id=" + id);
        }
        repo.deleteById(id);
    }
}