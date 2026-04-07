package com.example.fashion_shop.service;

import com.example.fashion_shop.config.FileStorageConfig;
import com.example.fashion_shop.dto.response.FileUploadResponse;
import com.example.fashion_shop.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.DecimalFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final FileStorageConfig fileStorageConfig;

    /**
     * Upload product image
     */
    public FileUploadResponse uploadProductImage(MultipartFile file) {
        return uploadFile(file, fileStorageConfig.getProductImagesDir(), "Product image");
    }

    /**
     * Upload user avatar
     */
    public FileUploadResponse uploadUserAvatar(MultipartFile file) {
        return uploadFile(file, fileStorageConfig.getUserAvatarsDir(), "User avatar");
    }

    /**
     * Generic file upload method
     */
    private FileUploadResponse uploadFile(MultipartFile file, String directory, String fileType) {
        // Validate file
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(fileType + " file is required");
        }

        // Check file size
        if (file.getSize() > fileStorageConfig.getMaxFileSize()) {
            throw new BadRequestException("File size exceeds maximum limit of " + 
                    formatBytes(fileStorageConfig.getMaxFileSize()));
        }

        // Check file extension
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileStorageConfig.isExtensionAllowed(fileName)) {
            throw new BadRequestException("File type not allowed. Allowed types: " + 
                    String.join(", ", fileStorageConfig.getAllowedExtensions()));
        }

        try {
            // Generate unique filename
            String uniqueFileName = generateUniqueFileName(fileName);
            Path filePath = Paths.get(directory, uniqueFileName);

            // Create parent directories if not exist
            Files.createDirectories(filePath.getParent());

            // Save file
            Files.write(filePath, file.getBytes());

            // Generate file URL (relative path)
            String fileUrl = "/uploads/" + extractRelativePath(directory) + "/" + uniqueFileName;

            log.info("{} uploaded successfully: {}", fileType, uniqueFileName);

            return FileUploadResponse.success(
                    uniqueFileName,
                    formatBytes(file.getSize()),
                    fileUrl,
                    file.getContentType()
            );
        } catch (IOException e) {
            log.error("Failed to upload {}", fileType, e);
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
    }

    /**
     * Delete file
     */
    public void deleteFile(String fileUrl) {
        try {
            // Convert URL to file path
            String relativePath = fileUrl.replace("/uploads/", "");
            Path filePath = Paths.get(fileStorageConfig.getUploadDir(), relativePath);

            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("File deleted: {}", fileUrl);
            }
        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileUrl, e);
        }
    }

    /**
     * Generate unique filename
     */
    private String generateUniqueFileName(String originalFileName) {
        String fileExtension = getFileExtension(originalFileName);
        String uniqueName = UUID.randomUUID() + "." + fileExtension;
        return uniqueName;
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : "";
    }

    /**
     * Extract relative path from full directory path
     */
    private String extractRelativePath(String fullPath) {
        String uploadDir = fileStorageConfig.getUploadDir();
        if (fullPath.startsWith(uploadDir)) {
            String relative = fullPath.substring(uploadDir.length());
            return relative.replace("\\", "/").replaceAll("^/+", "");
        }
        return fullPath;
    }

    /**
     * Format bytes to human-readable format
     */
    private String formatBytes(long bytes) {
        if (bytes <= 0) return "0 B";
        final String[] units = new String[] { "B", "KB", "MB", "GB", "TB" };
        int digitGroups = (int) (Math.log10(bytes) / Math.log10(1024));
        return new DecimalFormat("#,##0.#").format(bytes / Math.pow(1024, digitGroups)) 
                + " " + units[digitGroups];
    }
}
