package com.example.fashion_shop.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long id;
    private Long orderId;
    private BigDecimal amount;
    private String paymentMethod;
    private String status;
    private String vnpTxnRef;
    private String vnpResponseCode;
    private String vnpResponseMessage;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
}
