package com.example.fashion_shop.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WishlistItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private String productSlug;
    private java.math.BigDecimal price;
    private java.math.BigDecimal salePrice;
    private Integer stock;
    private String status;
    private LocalDateTime addedAt;
}
