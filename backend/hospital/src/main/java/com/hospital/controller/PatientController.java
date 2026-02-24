package com.hospital.controller;

import java.util.List;
import java.util.Map;

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
import org.springframework.web.bind.annotation.RestController;

import com.hospital.dto.AppointmentHistoryDTO;
import com.hospital.dto.PatientDTO;
import com.hospital.entity.PatientEntity;
import com.hospital.service.PatientService;

import lombok.RequiredArgsConstructor;

@RestController
@CrossOrigin
@RequiredArgsConstructor
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService service;

    // 1. Lấy danh sách tất cả bệnh nhân (trả về PatientDTO với thông tin từ
    // profile)
    @GetMapping
    public List<PatientDTO> list() {
        return service.findAll();
    }

    /**
     * GET /api/patients/me
     * Lấy bản ghi patient của người dùng hiện tại.
     */
    @GetMapping("/me")
    public ResponseEntity<PatientEntity> getMyPatient(@AuthenticationPrincipal Jwt jwt) {
        return service.findMyPatient(jwt.getSubject())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/patients (hoặc /api/patients/me, nhưng theo yêu cầu là
     * /api/patients)
     * Cập nhật bản ghi patient của người dùng hiện tại.
     */
    @PutMapping
    public ResponseEntity<PatientEntity> updateMyPatient(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody PatientEntity updates) {
        return ResponseEntity.ok(service.updateMyPatient(jwt.getSubject(), updates));
    }

    // 2. Lấy thông tin chi tiết một bệnh nhân theo patient.id (INT)
    @GetMapping("/{id}")
    public ResponseEntity<PatientEntity> get(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(service.findById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 3. Lịch sử khám bệnh của bệnh nhân theo patient.id
    @GetMapping("/appointments/{id}")
    public ResponseEntity<List<AppointmentHistoryDTO>> getHistory(@PathVariable Integer id) {
        try {
            List<AppointmentHistoryDTO> history = service.getAppointmentHistory(id);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 4. Tạo mới hồ sơ bệnh nhân
    @PostMapping
    public PatientEntity create(@RequestBody PatientEntity p) {
        return service.save(p);
    }

    // 5. Cập nhật thông tin bệnh nhân (theo patient.id)
    @PutMapping("/{id}")
    public ResponseEntity<PatientEntity> update(@PathVariable Integer id, @RequestBody PatientEntity p) {
        return ResponseEntity.ok(service.update(id, p));
    }

    // 6. Xóa hồ sơ bệnh nhân (theo patient.id)
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Integer id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}