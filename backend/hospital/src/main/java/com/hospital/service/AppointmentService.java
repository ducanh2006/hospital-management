package com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hospital.entity.Appointment;
import com.hospital.repository.AppointmentRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class AppointmentService{

    private final AppointmentRepository repo;

    public AppointmentService(AppointmentRepository repo) {
        this.repo = repo;
    }

    public List<Appointment> findAll() {
        return repo.findAll();
    }

    public Optional<Appointment> findById(Integer id) {
        if(id == null){
            throw new IllegalArgumentException("Appoinment id must not be null");
        }
        return repo.findById(id);
    }

    public Appointment save(Appointment appointment) {
        if (appointment == null) {
            throw new IllegalArgumentException("Appointment must not be null");
        }
        return repo.save(appointment);
    }

    public Appointment update(Integer id, Appointment appointment) {
        if (id == null) {
            throw new IllegalArgumentException("Appointment id must not be null");
        }
        if (appointment == null) {
            throw new IllegalArgumentException("Appointment must not be null");
        }

        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Appointment not found with id=" + id);
        }
        appointment.setId(id);
        return repo.save(appointment);
    }

    public void deleteById(Integer id) {
        if (id == null) {
            throw new IllegalArgumentException("Appointment id must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Appointment not found with id=" + id);
        }
        repo.deleteById(id);
    }
}
