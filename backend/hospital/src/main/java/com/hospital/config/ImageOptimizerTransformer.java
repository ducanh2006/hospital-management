package com.hospital.config;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.resource.ResourceTransformer;
import org.springframework.web.servlet.resource.ResourceTransformerChain;

import jakarta.servlet.http.HttpServletRequest;
import net.coobird.thumbnailator.Thumbnails;

class OptimizedImageResource extends ByteArrayResource {
    private final String filename;
    private final long lastModified;

    public OptimizedImageResource(byte[] data, Resource originalResource) throws IOException {
        super(data);
        this.filename = originalResource.getFilename();
        this.lastModified = originalResource.lastModified();
    }

    @Override
    public String getFilename() {
        return this.filename;
    }

    // Quan trọng: Giúp trình duyệt không tải lại ảnh nếu ảnh gốc chưa đổi
    @Override
    public long lastModified() {
        return this.lastModified;
    }
}

public class ImageOptimizerTransformer implements ResourceTransformer {

    @Override
    public Resource transform(HttpServletRequest request, Resource resource, 
                             ResourceTransformerChain transformerChain) throws IOException {
        
        // 1. Chạy qua các transformer khác (nếu có) trước
        resource = transformerChain.transform(request, resource);
        
        // 2. Kiểm tra tham số 'size'
        String sizeParam = request.getParameter("size");
        // System.out.println(" request = "+ request);
        if (sizeParam == null || resource == null || !isImage(resource.getFilename())) {
            return resource;
        }

        try (ByteArrayOutputStream os = new ByteArrayOutputStream()) {
            int size = Integer.parseInt(sizeParam);

            // 3. Thực hiện resize
            Thumbnails.of(resource.getInputStream())
                    .size(size, size)
                    .keepAspectRatio(true)
                    .toOutputStream(os);
            
            // 4. Trả về bằng Custom Class thay vì Anonymous Class
            return new OptimizedImageResource(os.toByteArray(), resource);
            
        } catch (Exception e) {
            System.out.println(e.getMessage());
            return resource;
        }
    }

    private boolean isImage(String filename) {
        if (filename == null) return false;
        String f = filename.toLowerCase();
        return f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png") || f.endsWith(".gif");
    }
}