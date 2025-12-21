package com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hospital.entity.Patient;
import com.hospital.repository.PatientRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class PatientService{

    private final PatientRepository repo;

    public PatientService(PatientRepository repo) {
        this.repo = repo;
    }

    public List<Patient> findAll() {
        return repo.findAll();
    }

    public Optional<Patient> findById(Integer id) {
          if (id == null) {
            throw new IllegalArgumentException("Patient id must not be null");
        }
        return repo.findById(id);
    }

    public Patient save(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("Patient must not be null");
        }
        return repo.save(patient);
    }

    public Patient update(Integer id, Patient patient) {
         if (id == null) {
            throw new IllegalArgumentException("Patient id must not be null");
        }
        if (patient == null) {
            throw new IllegalArgumentException("Patient must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Patient not found with id=" + id);
        }
        patient.setId(id);
        return repo.save(patient);
    }

    public void deleteById(Integer id) {
         if (id == null) {
            throw new IllegalArgumentException("Patient id must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Patient not found with id=" + id);
        }
        repo.deleteById(id);
    }
}
