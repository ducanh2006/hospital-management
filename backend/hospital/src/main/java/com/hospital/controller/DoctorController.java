package com.hospital.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.DoctorDTO;
import com.hospital.dto.DoctorSearchRequest;
import com.hospital.dto.PageResponse;
import com.hospital.entity.AppointmentEntity;
import com.hospital.entity.DoctorEntity;
import com.hospital.service.DoctorService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService service;

    // 1. Lấy danh sách bác sĩ cơ bản
    @GetMapping
    public List<DoctorEntity> list() {
        return service.findAll();
    }

    /**
     * GET /api/doctors/me
     * Lấy bản ghi doctor của người dùng hiện tại.
     */
    @GetMapping("/me")
    public ResponseEntity<DoctorEntity> getMyDoctor(@AuthenticationPrincipal Jwt jwt) {
        return service.findMyDoctor(jwt.getSubject())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/doctors
     * Cập nhật bản ghi doctor của người dùng hiện tại.
     */
    @PutMapping
    public ResponseEntity<DoctorEntity> updateMyDoctor(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody DoctorEntity updates) {
        return ResponseEntity.ok(service.updateMyDoctor(jwt.getSubject(), updates));
    }

    // 2. Lấy danh sách bác sĩ đầy đủ thông tin (Rating trung bình và tổng số
    // review)
    @GetMapping("/with-rating")
    public List<DoctorDTO> listWithRating() {
        return service.findAllDoctorsWithRating();
    }

    // 3. Lấy chi tiết một bác sĩ theo ID
    @GetMapping("/{id}")
    public ResponseEntity<DoctorDTO> get(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 4. Tìm kiếm bác sĩ nâng cao với phân trang (Deferred Join)
     *
     * GET /api/doctors/search?name=nguyen&gender=MALE&departmentId=2&page=0&size=10
     *
     * Tất cả tham số đều optional. Nếu không truyền thì không lọc theo tiêu chí đó.
     */
    @GetMapping("/search")
    public ResponseEntity<PageResponse<DoctorDTO>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        DoctorSearchRequest req = new DoctorSearchRequest();
        req.setName(name);
        req.setGender(gender);
        req.setDepartmentId(departmentId);
        req.setPage(page);
        req.setSize(size);

        return ResponseEntity.ok(service.searchDoctors(req));
    }

    @GetMapping("/non-completed-appointments/{id}")
    public ResponseEntity<List<AppointmentEntity>> getNonCompletedAppointments(@PathVariable Integer id) {
        List<AppointmentEntity> appointments = service.findNonCompletedAppointments(id);
        return ResponseEntity.ok(appointments);

    }

    // 5. Tạo mới bác sĩ
    @PostMapping
    public DoctorEntity create(@RequestBody DoctorEntity d) {
        return service.save(d); // Sử dụng save() có validate doctor null
    }

    // 6. Cập nhật thông tin bác sĩ (Admin dùng DTO)
    @PutMapping("/{id}")
    public ResponseEntity<DoctorDTO> update(@PathVariable Integer id, @RequestBody DoctorDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // 7. Xóa bác sĩ theo ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}