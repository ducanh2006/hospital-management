package com.hospital.service;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.hospital.entity.DepartmentEntity;
import com.hospital.repository.DepartmentRepository;

import jakarta.persistence.EntityNotFoundException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class DepartmentServiceTest {

    private static final Integer NON_EXIST_ID = 999_999;

    @Autowired
    private DepartmentService departmentService;

    @Autowired
    private DepartmentRepository departmentRepository;

    // ========== Test findAll ==========
    @Test
    void shouldFindAllDepartments() {
        DepartmentEntity dept1 = new DepartmentEntity();
        dept1.setName("Cardiology");
        dept1.setDescription("Heart and circulatory system");
        departmentRepository.save(dept1);

        DepartmentEntity dept2 = new DepartmentEntity();
        dept2.setName("Neurology");
        dept2.setDescription("Nervous system");
        departmentRepository.save(dept2);

        List<DepartmentEntity> found = departmentService.findAll();
        assertTrue(found.size() >= 2, "Should have at least 2 departments");
    }

    // ========== Test findById ==========
    @Test
    void shouldFindDepartmentById() {
        DepartmentEntity dept = new DepartmentEntity();
        dept.setName("Orthopedics");
        dept.setDescription("Bones and joints");
        DepartmentEntity saved = departmentRepository.save(dept);

        Optional<DepartmentEntity> found = departmentService.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("Orthopedics", found.get().getName());
    }

    // ========== Test findById with null id ==========
    @Test
    void shouldThrowWhenFindByIdWithNullId() {
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> departmentService.findById(null));

        assertNotNull(ex);
    }

    // ========== Test findById with non-existing ==========
    @Test
    void shouldReturnEmptyWhenDepartmentNotFound() {
        Optional<DepartmentEntity> found = departmentService.findById(NON_EXIST_ID);
        assertFalse(found.isPresent());
    }

    // ========== Test save ==========
    @Test
    void shouldSaveDepartment() {
        DepartmentEntity dept = new DepartmentEntity();
        dept.setName("Pediatrics");
        dept.setDescription("Children's medicine");

        DepartmentEntity saved = departmentService.save(dept);
        assertNotNull(saved.getId());
        assertEquals("Pediatrics", saved.getName());
    }

    // ========== Test save with null ==========
    @Test
    void shouldThrowWhenSavingNull() {
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> departmentService.save(null));

        assertNotNull(ex);
    }

    // ========== Test update ==========
    @Test
    void shouldUpdateDepartment() {
        DepartmentEntity dept = new DepartmentEntity();
        dept.setName("Radiology");
        dept.setDescription("Medical imaging");
        DepartmentEntity saved = departmentRepository.save(dept);

        DepartmentEntity updateData = new DepartmentEntity();
        updateData.setName("Radiology - Updated");
        updateData.setDescription("Medical imaging - Updated description");

        DepartmentEntity updated = departmentService.update(saved.getId(), updateData);
        assertEquals("Radiology - Updated", updated.getName());
        assertEquals("Medical imaging - Updated description", updated.getDescription());
    }

    // ========== Test update with null department ==========
    @Test
    void shouldThrowWhenUpdatingWithNullDepartment() {
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> departmentService.update(1, null));

        assertNotNull(ex);
    }

    // ========== Test update with null id ==========
    @Test
    void shouldThrowWhenUpdatingWithNullId() {
        DepartmentEntity dept = new DepartmentEntity();
        dept.setName("Test Dept");

        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> departmentService.update(null, dept));

        assertNotNull(ex);
    }

    // ========== Test update with non-existing ==========
    @Test
    void shouldThrowWhenUpdatingNonExistingDepartment() {
        DepartmentEntity updateData = new DepartmentEntity();
        updateData.setName("Test");

        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> departmentService.update(NON_EXIST_ID, updateData));

        assertNotNull(ex);
    }

    // ========== Test deleteById ==========
    @Test
    void shouldDeleteDepartment() {
        DepartmentEntity dept = new DepartmentEntity();
        dept.setName("Emergency");
        dept.setDescription("Emergency Medicine");
        DepartmentEntity saved = departmentRepository.save(dept);

        departmentService.deleteById(saved.getId());
        assertFalse(departmentRepository.existsById(saved.getId()));
    }

    // ========== Test deleteById with null id ==========
    @Test
    void shouldThrowWhenDeletingWithNullId() {
        IllegalArgumentException ex =
                assertThrows(IllegalArgumentException.class,
                        () -> departmentService.deleteById(null));

        assertNotNull(ex);
    }

    // ========== Test deleteById with non-existing ==========
    @Test
    void shouldThrowWhenDeletingNonExistingDepartment() {
        EntityNotFoundException ex =
                assertThrows(EntityNotFoundException.class,
                        () -> departmentService.deleteById(NON_EXIST_ID));

        assertNotNull(ex);
    }
}