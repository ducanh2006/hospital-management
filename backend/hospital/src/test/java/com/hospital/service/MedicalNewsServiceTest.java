package com.hospital.service;

import java.time.LocalDateTime;
import java.util.List;

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

import com.hospital.entity.MedicalNewsEntity;
import com.hospital.repository.MedicalNewsRepository;

import jakarta.persistence.EntityNotFoundException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class MedicalNewsServiceTest {

    private static final Integer NON_EXIST_ID = 999_999_999;

    @Autowired
    private MedicalNewsService medicalNewsService;

    @Autowired
    private MedicalNewsRepository medicalNewsRepository;

    // ========== Test findAll ==========
    @Test
    void shouldFindAllNewsOrderedByLastUpdateDesc() {
        MedicalNewsEntity news1 = new MedicalNewsEntity();
        news1.setTitle("News 1");
        news1.setContent("Content 1");
        news1.setLastUpdate(LocalDateTime.now().minusDays(2));
        medicalNewsRepository.save(news1);

        MedicalNewsEntity news2 = new MedicalNewsEntity();
        news2.setTitle("News 2");
        news2.setContent("Content 2");
        news2.setLastUpdate(LocalDateTime.now());
        medicalNewsRepository.save(news2);

        List<MedicalNewsEntity> found = medicalNewsService.findAll();

        assertTrue(found.size() >= 2);
        assertEquals("News 2", found.get(0).getTitle());
    }

    // ========== Test findById ==========
    @Test
    void shouldFindNewsById() {
        MedicalNewsEntity news = new MedicalNewsEntity();
        news.setTitle("Test News");
        news.setContent("Test Content");
        news.setLastUpdate(LocalDateTime.now());

        MedicalNewsEntity saved = medicalNewsRepository.save(news);
        MedicalNewsEntity found = medicalNewsService.findById(saved.getId());

        assertNotNull(found);
        assertEquals("Test News", found.getTitle());
    }

    // ========== Test findById with non-existing ==========
    @Test
    void shouldThrowWhenNewsNotFound() {
        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> medicalNewsService.findById(NON_EXIST_ID)
        );

        assertNotNull(ex);
    }

    // ========== Test save ==========
    @Test
    void shouldSaveNews() {
        MedicalNewsEntity news = new MedicalNewsEntity();
        news.setTitle("Breaking Health News");
        news.setContent("New findings in medical research...");

        MedicalNewsEntity saved = medicalNewsService.save(news);

        assertNotNull(saved.getId());
        assertEquals("Breaking Health News", saved.getTitle());
        assertNotNull(saved.getLastUpdate());
    }

    // ========== Test save sets lastUpdate ==========
    @Test
    void shouldSetLastUpdateWhenSaving() {
        MedicalNewsEntity news = new MedicalNewsEntity();
        news.setTitle("New Article");
        news.setContent("Article content");

        LocalDateTime beforeSave = LocalDateTime.now();
        MedicalNewsEntity saved = medicalNewsService.save(news);
        LocalDateTime afterSave = LocalDateTime.now();

        assertNotNull(saved.getLastUpdate());
        assertTrue(!saved.getLastUpdate().isBefore(beforeSave));
        assertTrue(!saved.getLastUpdate().isAfter(afterSave));
    }

    // ========== Test update ==========
    @Test
    void shouldUpdateNews() {
        MedicalNewsEntity news = new MedicalNewsEntity();
        news.setTitle("Original Title");
        news.setContent("Original Content");
        news.setLastUpdate(LocalDateTime.now());

        MedicalNewsEntity saved = medicalNewsRepository.save(news);

        MedicalNewsEntity updateData = new MedicalNewsEntity();
        updateData.setTitle("Updated Title");
        updateData.setContent("Updated Content");

        MedicalNewsEntity updated = medicalNewsService.update(saved.getId(), updateData);

        assertEquals("Updated Title", updated.getTitle());
        assertEquals("Updated Content", updated.getContent());
        assertNotNull(updated.getLastUpdate());
    }

    // ========== Test update with null news ==========
    @Test
    void shouldThrowWhenUpdatingWithNullNews() {
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> medicalNewsService.update(1, null)
        );

        assertNotNull(ex);
    }

    // ========== Test update with non-existing ==========
    @Test
    void shouldThrowWhenUpdatingNonExistingNews() {
        MedicalNewsEntity updateData = new MedicalNewsEntity();
        updateData.setTitle("Test");

        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> medicalNewsService.update(NON_EXIST_ID, updateData)
        );

        assertNotNull(ex);
    }

    // ========== Test update sets new lastUpdate ==========
    @Test
    void shouldUpdateLastUpdateWhenUpdatingNews() {
        MedicalNewsEntity news = new MedicalNewsEntity();
        news.setTitle("Original");
        news.setContent("Original");
        news.setLastUpdate(LocalDateTime.now());

        MedicalNewsEntity saved = medicalNewsRepository.save(news);
        LocalDateTime originalLastUpdate = saved.getLastUpdate();

        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        MedicalNewsEntity updateData = new MedicalNewsEntity();
        updateData.setTitle("Updated");
        updateData.setContent("Updated");

        MedicalNewsEntity updated = medicalNewsService.update(saved.getId(), updateData);

        assertTrue(updated.getLastUpdate().isAfter(originalLastUpdate));
    }

    // ========== Test deleteById ==========
    @Test
    void shouldDeleteNews() {
        MedicalNewsEntity news = new MedicalNewsEntity();
        news.setTitle("News To Delete");
        news.setContent("To be deleted");
        news.setLastUpdate(LocalDateTime.now());

        MedicalNewsEntity saved = medicalNewsRepository.save(news);

        medicalNewsService.deleteById(saved.getId());

        assertFalse(medicalNewsRepository.existsById(saved.getId()));
    }

    // ========== Test deleteById with non-existing ==========
    @Test
    void shouldThrowWhenDeletingNonExistingNews() {
        EntityNotFoundException ex = assertThrows(
                EntityNotFoundException.class,
                () -> medicalNewsService.deleteById(NON_EXIST_ID)
        );

        assertNotNull(ex);
    }
}