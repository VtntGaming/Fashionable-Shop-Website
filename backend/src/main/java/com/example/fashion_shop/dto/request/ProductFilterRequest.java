package com.example.fashion_shop.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductFilterRequest {

    private Long categoryId;

    @Min(value = 0, message = "Minimum price must be non-negative")
    private BigDecimal minPrice;

    @Min(value = 0, message = "Maximum price must be non-negative")
    private BigDecimal maxPrice;

    private String keyword;

    private String sortBy;

    private String sortDir;

    @Min(value = 0, message = "Page number must be non-negative")
    @Builder.Default
    private Integer page = 0;

    @Min(value = 1, message = "Page size must be at least 1")
    @Builder.Default
    private Integer size = 12;
}
