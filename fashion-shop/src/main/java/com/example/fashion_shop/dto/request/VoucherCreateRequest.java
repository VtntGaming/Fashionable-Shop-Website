package com.example.fashion_shop.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoucherCreateRequest {

    @NotBlank(message = "Voucher code is required")
    private String code;

    @NotNull(message = "Discount type is required")
    private String discountType; // PERCENT or AMOUNT

    @NotNull(message = "Discount value is required")
    @DecimalMin(value = "0.01", message = "Discount value must be greater than 0")
    private BigDecimal discountValue;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private BigDecimal minOrderValue;

    private BigDecimal maxDiscount;

    private Integer quantity; // 0 = unlimited

    private String status; // ACTIVE or INACTIVE
}
