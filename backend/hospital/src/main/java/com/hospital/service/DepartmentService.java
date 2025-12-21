package com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hospital.entity.Department;
import com.hospital.repository.DepartmentRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class DepartmentService{

    private final DepartmentRepository repo;

    public DepartmentService(DepartmentRepository repo) {
        this.repo = repo;
    }

    public List<Department> findAll() {
        return repo.findAll();
    }

    public Optional<Department> findById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Department id must not be null");
        }
        return repo.findById(id);
    }

    public Department save(Department dept) {
        if (dept == null) {
            throw new IllegalArgumentException("Department must not be null");
        }
        return repo.save(dept);
    }

    public Department update(Integer id, Department dept) {
         if (id == null) {
            throw new IllegalArgumentException("Department id must not be null");
        }
        if (dept == null) {
            throw new IllegalArgumentException("Department must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Department not found with id=" + id);
        }
        dept.setId(id);
        return repo.save(dept);
    }

    public void deleteById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Department id must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Department not found with id=" + id);
        }
        repo.deleteById(id);
    }
}
