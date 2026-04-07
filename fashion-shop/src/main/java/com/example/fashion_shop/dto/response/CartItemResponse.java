package com.example.fashion_shop.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {

    private Long id;
    private Long cartId;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private BigDecimal priceAtAdd;
    private BigDecimal subtotal;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
