package com.hospital.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.hospital.entity.PictureEntity;
import com.hospital.repository.PictureRepository;

import jakarta.persistence.EntityNotFoundException;

@ExtendWith(MockitoExtension.class)
class PictureServiceTest {

    @Mock
    private PictureRepository pictureRepository;

    @InjectMocks
    private PictureService pictureService;

    // ========== Test uploadPicture with empty file ==========
    @Test
    void shouldThrowWhenUploadingEmptyFile() {
        // Tạo file rỗng thực tế
        MultipartFile emptyFile = new org.springframework.mock.web.MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[0]);

        // SỬA: Xóa dòng when() vì MockMultipartFile là object thật, không cần stub isEmpty()
        // Nó sẽ tự trả về true do mảng byte rỗng
        
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> pictureService.uploadPicture(emptyFile));
        assertTrue(ex instanceof IllegalArgumentException);

        // Verify rằng repository.save() KHÔNG được gọi
        verify(pictureRepository, never()).save(any());
    }


    // ========== Test findById ==========
    @Test
    void shouldFindPictureById() {
        Integer pictureId = 1;
        PictureEntity picture = new PictureEntity();
        picture.setId(pictureId);
        picture.setPictureUrl("test_image.jpg");

        when(pictureRepository.findById(pictureId)).thenReturn(Optional.of(picture));

        PictureEntity found = pictureService.findById(pictureId);
        
        assertNotNull(found);
        assertEquals("test_image.jpg", found.getPictureUrl());
        verify(pictureRepository).findById(pictureId);
    }

    // ========== Test findById with non-existing ==========
    @Test
    void shouldThrowWhenPictureNotFoundById() {
        Integer pictureId = 999;
        when(pictureRepository.findById(pictureId)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> pictureService.findById(pictureId));
        assertTrue(ex instanceof EntityNotFoundException);

    }

    // ========== Test findByUrl ==========
    @Test
    void shouldFindPictureByUrl() {
        String pictureUrl = "image_001.jpg";
        PictureEntity picture = new PictureEntity();
        picture.setId(1);
        picture.setPictureUrl(pictureUrl);

        when(pictureRepository.findByPictureUrl(pictureUrl)).thenReturn(Optional.of(picture));

        PictureEntity found = pictureService.findByUrl(pictureUrl);
        
        assertNotNull(found);
        assertEquals(pictureUrl, found.getPictureUrl());
        verify(pictureRepository).findByPictureUrl(pictureUrl);
    }

    // ========== Test findByUrl with non-existing ==========
    @Test
    void shouldThrowWhenPictureNotFoundByUrl() {
        String pictureUrl = "non_existing.jpg";
        when(pictureRepository.findByPictureUrl(pictureUrl)).thenReturn(Optional.empty());

        EntityNotFoundException ex = assertThrows(EntityNotFoundException.class, () -> pictureService.findByUrl(pictureUrl));
        assertTrue(ex instanceof EntityNotFoundException);

    }

    // ========== Test findById throws with specific error message ==========
    @Test
    void shouldThrowWithCorrectMessageWhenPictureByIdNotFound() {
        Integer pictureId = 42;
        when(pictureRepository.findById(pictureId)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> pictureService.findById(pictureId));
        
        assertNotNull(exception.getMessage());
        assertEquals("Không tìm thấy ảnh với ID: " + pictureId, exception.getMessage());
    }

    // ========== Test findByUrl throws with correct error message ==========
    @Test
    void shouldThrowWithCorrectMessageWhenPictureByUrlNotFound() {
        String pictureUrl = "missing_image.jpg";
        when(pictureRepository.findByPictureUrl(pictureUrl)).thenReturn(Optional.empty());

        EntityNotFoundException exception = assertThrows(EntityNotFoundException.class,
                () -> pictureService.findByUrl(pictureUrl));
        
        assertNotNull(exception.getMessage());
        assertEquals("Không tìm thấy ảnh với URL: " + pictureUrl, exception.getMessage());
    }

    // ========== Test multiple sequential operations ==========
    @Test
    void shouldHandleMultipleOperations() {
        Integer id1 = 1;
        String url1 = "pic1.jpg";
        
        PictureEntity picture1 = new PictureEntity();
        picture1.setId(id1);
        picture1.setPictureUrl(url1);

        when(pictureRepository.findById(id1)).thenReturn(Optional.of(picture1));
        when(pictureRepository.findByPictureUrl(url1)).thenReturn(Optional.of(picture1));

        // Find by ID
        PictureEntity found1 = pictureService.findById(id1);
        assertEquals(id1, found1.getId());

        // Find by URL
        PictureEntity found2 = pictureService.findByUrl(url1);
        assertEquals(url1, found2.getPictureUrl());

        verify(pictureRepository).findById(id1);
        verify(pictureRepository).findByPictureUrl(url1);
    }
}