package com.example.fashion_shop.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherResponse {

    private Long id;
    private String code;
    private String discountType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscount;
    private Integer quantity;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private Boolean isValid;
    private LocalDateTime createdAt;
}
