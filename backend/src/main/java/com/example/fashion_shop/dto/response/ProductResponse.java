package com.example.fashion_shop.dto.response;

import com.example.fashion_shop.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String description;
    private BigDecimal price;
    private BigDecimal salePrice;
    private BigDecimal effectivePrice;
    private Integer stock;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String brand;
    private String imageUrl;
    private List<String> images;
    private Integer views;
    private Double averageRating;
    private Integer reviewCount;
    private String status;
    private LocalDateTime createdAt;

    public static ProductResponse fromEntity(Product product) {
        return fromEntity(product, false);
    }

    public static ProductResponse fromEntity(Product product, boolean includeDescription) {
        ProductResponseBuilder builder = ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .effectivePrice(product.getEffectivePrice())
                .stock(product.getStock())
                .brand(product.getBrand())
                .imageUrl(product.getImageUrl())
                .views(product.getViews())
                .status(product.getStatus().name())
                .createdAt(product.getCreatedAt());

        if (product.getCategory() != null) {
            builder.categoryId(product.getCategory().getId())
                   .categoryName(product.getCategory().getName())
                   .categorySlug(product.getCategory().getSlug());
        }

        if (product.getImages() != null && !product.getImages().isEmpty()) {
            builder.images(product.getImages().stream()
                    .map(img -> img.getImageUrl())
                    .toList());
        }

        if (includeDescription) {
            builder.description(product.getDescription());
        }

        return builder.build();
    }
}
