package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.FileUploadResponse;
import com.example.fashion_shop.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
public class FileUploadController {

    private final FileUploadService fileUploadService;

    /**
     * Upload product image (admin only)
     */
    @PostMapping("/products/images")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadProductImage(
            @RequestParam("file") MultipartFile file) {
        
        FileUploadResponse response = fileUploadService.uploadProductImage(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product image uploaded successfully", response));
    }

    /**
     * Upload user avatar
     */
    @PostMapping("/avatars")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        
        FileUploadResponse response = fileUploadService.uploadUserAvatar(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Avatar uploaded successfully", response));
    }

    /**
     * Upload multiple product images (admin only)
     */
    @PostMapping("/products/images/batch")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<FileUploadResponse>>> uploadProductImagesBatch(
            @RequestParam("files") MultipartFile[] files) {
        
        java.util.List<FileUploadResponse> responses = new java.util.ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                FileUploadResponse response = fileUploadService.uploadProductImage(file);
                responses.add(response);
            } catch (Exception e) {
                log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
                responses.add(FileUploadResponse.error("Failed to upload: " + file.getOriginalFilename()));
            }
        }
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product images uploaded", responses));
    }

    /**
     * Delete file (admin only)
     */
    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @RequestParam("fileUrl") String fileUrl) {
        
        fileUploadService.deleteFile(fileUrl);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", null));
    }
}
