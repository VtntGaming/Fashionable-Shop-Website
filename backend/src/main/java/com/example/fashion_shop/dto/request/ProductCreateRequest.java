package com.example.fashion_shop.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCreateRequest {

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 255, message = "Name must be between 2 and 255 characters")
    private String name;

    @NotBlank(message = "Slug is required")
    @Size(max = 255)
    private String slug;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price must be non-negative")
    private BigDecimal price;

    @DecimalMin(value = "0.00", message = "Sale price must be non-negative")
    private BigDecimal salePrice;

    @Min(value = 0, message = "Stock must be non-negative")
    private Integer stock;

    private Long categoryId;

    @Size(max = 255)
    private String brand;

    @Size(max = 500)
    private String imageUrl;

    private List<String> additionalImages;
}
