package com.hospital.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.hospital.entity.MedicalNewsEntity;
import com.hospital.repository.MedicalNewsRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalNewsService {
    
    private final MedicalNewsRepository repo;

    public List<MedicalNewsEntity> findAll() {
        return repo.findAllByOrderByLastUpdateDesc();
    }

    public MedicalNewsEntity findById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("News not found with id=" + id));
    }

    public MedicalNewsEntity save(MedicalNewsEntity news) {
        news.setLastUpdate(LocalDateTime.now());
        return repo.save(news);
    }

    public MedicalNewsEntity update(Integer id, MedicalNewsEntity news) {
        if (news == null){
            throw new IllegalArgumentException("News must not be null");
        }
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("News not found with id=" + news.getId());
        }
        news.setId(id);
        news.setLastUpdate(LocalDateTime.now());
        return repo.save(news);
    }

    public void deleteById(Integer id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("News not found with id=" + id);
        }
        repo.deleteById(id);
    }
}