package com.example.fashion_shop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationResponse {

    private Long id;
    private String name;
    private String slug;
    private BigDecimal price;
    private BigDecimal salePrice;
    private String imageUrl;
    private String reason;  // e.g., "Based on your purchases", "Trending now", "Popular in your category"
    private Double rating;
    private Integer reviewCount;
    private String brand;
    private Integer stock;

    public static RecommendationResponse fromProductResponse(ProductResponse product, String reason) {
        return RecommendationResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .imageUrl(product.getImageUrl())
                .reason(reason)
                .rating(product.getAverageRating())
                .reviewCount(product.getReviewCount())
                .brand(product.getBrand())
                .stock(product.getStock())
                .build();
    }
}
