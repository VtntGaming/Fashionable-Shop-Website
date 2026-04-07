package com.example.fashion_shop.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherUpdateRequest {

    private String code;

    private String discountType;

    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    private LocalDateTime startDate;

    private LocalDateTime endDate;

    private BigDecimal minOrderValue;

    private BigDecimal maxDiscount;

    private Integer quantity;

    private String status;
}
