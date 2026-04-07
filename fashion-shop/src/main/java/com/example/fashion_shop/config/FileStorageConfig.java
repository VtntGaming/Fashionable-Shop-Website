package com.example.fashion_shop.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.nio.file.Files;
import java.nio.file.Paths;

@Configuration
public class FileStorageConfig {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${file.max-file-size:5242880}")  // 5MB default
    private long maxFileSize;

    @Value("${file.allowed-extensions:jpg,jpeg,png,webp}")
    private String allowedExtensions;

    @Value("${file.product-images-dir:products}")
    private String productImagesDir;

    @Value("${file.user-avatars-dir:avatars}")
    private String userAvatarsDir;

    @PostConstruct
    public void init() {
        try {
            // Create upload directory if it doesn't exist
            Files.createDirectories(Paths.get(uploadDir));
            Files.createDirectories(Paths.get(uploadDir, productImagesDir));
            Files.createDirectories(Paths.get(uploadDir, userAvatarsDir));
        } catch (Exception e) {
            throw new RuntimeException("Failed to create upload directories", e);
        }
    }

    public String getUploadDir() {
        return uploadDir;
    }

    public String getProductImagesDir() {
        return Paths.get(uploadDir, productImagesDir).toString();
    }

    public String getUserAvatarsDir() {
        return Paths.get(uploadDir, userAvatarsDir).toString();
    }

    public long getMaxFileSize() {
        return maxFileSize;
    }

    public String[] getAllowedExtensions() {
        return allowedExtensions.split(",");
    }

    public boolean isExtensionAllowed(String fileName) {
        String extension = getFileExtension(fileName).toLowerCase();
        for (String allowed : getAllowedExtensions()) {
            if (allowed.equalsIgnoreCase(extension.strip())) {
                return true;
            }
        }
        return false;
    }

    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : "";
    }
}
