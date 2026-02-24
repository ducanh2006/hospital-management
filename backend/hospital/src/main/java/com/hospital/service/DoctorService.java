package com.hospital.service;

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
    private final com.hospital.repository.AccountRepository accountRepo;
    private final com.hospital.repository.ProfileRepository profileRepo;

    public List<DoctorEntity> findAll() {
        return repo.findAll();
    }

    public List<DoctorDTO> findAllDoctorsWithRating() {
        return repo.findAllDoctorsWithRating();
    }

    /**
     * Tìm kiếm bác sĩ nâng cao với phân trang tối ưu (Deferred Join — 2 bước JPQL).
     *
     * Bước 1: findDoctorIds() — chỉ SELECT d.id + JOIN profile cho filter tên.
     * Bước 2: findDoctorsByIds() — lấy đầy đủ DoctorDTO chỉ trên IDs của trang.
     */
    public PageResponse<DoctorDTO> searchDoctors(DoctorSearchRequest req) {
        Gender gender = (req.getGender() != null && !req.getGender().isBlank())
                ? Gender.valueOf(req.getGender().toUpperCase())
                : null;

        Page<Integer> idPage = repo.findDoctorIds(
                req.getName(),
                gender,
                req.getDepartmentId(),
                PageRequest.of(req.getPage(), req.getSize()));

        if (idPage.isEmpty()) {
            return new PageResponse<>(List.of(), req.getPage(), req.getSize(),
                    idPage.getTotalElements(), idPage.getTotalPages());
        }

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

    public List<AppointmentEntity> findNonCompletedAppointments(Integer doctorId) {
        if (!repo.existsById(doctorId)) {
            throw new EntityNotFoundException("Doctor not found with id=" + doctorId);
        }
        return repo.findNonCompletedAppointmentsByDoctor(doctorId);
    }

    public DoctorEntity save(DoctorEntity doctor) {
        if (doctor == null)
            throw new IllegalArgumentException("Doctor must not be null");
        // lastUpdate đã được xóa khỏi schema mới → không set nữa
        return repo.save(doctor);
    }

    /**
     * Cập nhật thông tin chi tiết bác sĩ (Admin dùng).
     * Cập nhật cả bảng profile (tên, giới tính, ngày sinh, sđt)
     * và bảng doctor (chuyên khoa, khoa, tiểu sử, kinh nghiệm).
     */
    public DoctorDTO update(Integer id, DoctorDTO dto) {
        DoctorEntity doctor = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id=" + id));

        // 1. Cập nhật profile
        if (doctor.getProfileId() != null) {
            profileRepo.findById(doctor.getProfileId()).ifPresent(profile -> {
                if (dto.getFullName() != null)
                    profile.setFullName(dto.getFullName());
                if (dto.getGender() != null)
                    profile.setGender(dto.getGender());
                if (dto.getDateOfBirth() != null)
                    profile.setDateOfBirth(dto.getDateOfBirth());
                if (dto.getPhoneNumber() != null)
                    profile.setPhoneNumber(dto.getPhoneNumber());
                profileRepo.save(profile);
            });
        }

        // 2. Cập nhật doctor
        if (dto.getSpecialization() != null)
            doctor.setSpecialization(dto.getSpecialization());
        if (dto.getDepartmentId() != null)
            doctor.setDepartmentId(dto.getDepartmentId());
        if (dto.getBio() != null)
            doctor.setBio(dto.getBio());
        if (dto.getExperienceYear() != null)
            doctor.setExperienceYear(dto.getExperienceYear());
        // pictureUrl thường được xử lý riêng hoặc lấy qua ID nếu có field pictureId

        repo.save(doctor);

        // Trả về DTO mới nhất
        return findById(id).orElse(dto);
    }

    public void deleteById(Integer id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Doctor not found with id=" + id);
        }
        repo.deleteById(id);
    }

    /**
     * Tìm bản ghi doctor của người dùng hiện tại theo Keycloak sub.
     */
    public Optional<DoctorEntity> findMyDoctor(String sub) {
        return accountRepo.findByKeycloakUserId(sub)
                .flatMap(acc -> profileRepo.findByAccountId(acc.getId()))
                .flatMap(prof -> repo.findByProfileId(prof.getId()));
    }

    /**
     * Cập nhật bản ghi doctor của người dùng hiện tại.
     */
    public DoctorEntity updateMyDoctor(String sub, DoctorEntity updates) {
        DoctorEntity doctor = findMyDoctor(sub)
                .orElseThrow(() -> new EntityNotFoundException("Doctor record not found for user: " + sub));

        if (updates.getSpecialization() != null)
            doctor.setSpecialization(updates.getSpecialization());
        if (updates.getDepartmentId() != null)
            doctor.setDepartmentId(updates.getDepartmentId());
        if (updates.getBio() != null)
            doctor.setBio(updates.getBio());
        if (updates.getExperienceYear() != null)
            doctor.setExperienceYear(updates.getExperienceYear());
        if (updates.getPictureId() != null)
            doctor.setPictureId(updates.getPictureId());

        return repo.save(doctor);
    }
}