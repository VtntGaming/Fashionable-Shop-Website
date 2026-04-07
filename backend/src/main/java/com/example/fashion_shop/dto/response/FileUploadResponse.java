package com.example.fashion_shop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponse {

    private String fileName;
    private String fileSize;
    private String fileUrl;
    private String contentType;
    private String message;

    public static FileUploadResponse success(String fileName, String fileSize, String fileUrl, String contentType) {
        return FileUploadResponse.builder()
                .fileName(fileName)
                .fileSize(fileSize)
                .fileUrl(fileUrl)
                .contentType(contentType)
                .message("File uploaded successfully")
                .build();
    }

    public static FileUploadResponse error(String message) {
        return FileUploadResponse.builder()
                .message(message)
                .build();
    }
}
