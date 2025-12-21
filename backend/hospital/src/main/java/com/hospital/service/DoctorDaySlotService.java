package  com.hospital.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.hospital.entity.DoctorDaySlot;
import com.hospital.repository.DoctorDaySlotRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class DoctorDaySlotService {

    private final DoctorDaySlotRepository repo;

    public DoctorDaySlotService(DoctorDaySlotRepository repo) {
        this.repo = repo;
    }

    public List<DoctorDaySlot> findAll() {
        return repo.findAll();
    }

    public Optional<DoctorDaySlot> findById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("DoctorDaySlot id must not be null");
        }
        return repo.findById(id);
    }

    public DoctorDaySlot save(DoctorDaySlot slot) {
        if (slot == null) {
            throw new IllegalArgumentException("DoctorDaySlot must not be null");
        }
        return repo.save(slot);
    }

    public DoctorDaySlot update(Long id, DoctorDaySlot slot) {
         if (id == null) {
            throw new IllegalArgumentException("DoctorDaySlot id must not be null");
        }
        if (slot == null) {
            throw new IllegalArgumentException("DoctorDaySlot must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("DoctorDaySlot not found with id=" + id);
        }
        slot.setId(id);
        return repo.save(slot);
    }

    public void deleteById(Long id) {
         if (id == null) {
            throw new IllegalArgumentException("DoctorDaySlot id must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("DoctorDaySlot not found with id=" + id);
        }
        repo.deleteById(id);
    }
}
