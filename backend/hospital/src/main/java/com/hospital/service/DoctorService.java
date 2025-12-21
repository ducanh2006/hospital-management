package com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hospital.entity.Doctor;
import com.hospital.repository.DoctorRepository;

@Service
public class DoctorService{

    private final DoctorRepository repo;

    public DoctorService(DoctorRepository repo) {
        this.repo = repo;
    }

    public List<Doctor> findAll() {
        return repo.findAll();
    }

    public Optional<Doctor> findById(Integer id) {
        if(id == null){
            throw new IllegalArgumentException("Doctor id must not be null");
        }
        return repo.findById(id);
    }

    public Doctor save(Doctor doctor) {
        if(doctor == null) {
            throw new IllegalArgumentException("Doctor must not be null");
        }
        return repo.save(doctor);
    }

    public Doctor update(Integer id, Doctor doctor) {
        if(id == null){
            throw new IllegalArgumentException("Doctor id must not be null");
        }
        if(doctor == null){
            throw new IllegalArgumentException("Doctor must not be null");
        }
        if(!repo.existsById(id)){
            throw new jakarta.persistence.EntityNotFoundException(" Doctor not found with id=" + id);
        }
        doctor.setId(id);
        return repo.save(doctor);
    }

    public void deleteById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Doctor id must not be null");
        }
        if (!repo.existsById(id)) {
            throw new jakarta.persistence.EntityNotFoundException("Doctor not found with id=" + id);
        }
        repo.deleteById(id);
    }
}
