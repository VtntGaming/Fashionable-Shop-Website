package com.example.fashion_shop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryUpdateRequest {

    @NotBlank(message = "Category name is required")
    private String name;

    @NotBlank(message = "Category slug is required")
    private String slug;

    private String description;

    private String imageUrl;

    private Long parentId;

    private String status; // ACTIVE or INACTIVE
}
