package com.example.fashion_shop.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCreateRequest {

    private Long orderId;
    private String paymentMethod; // VNPAY or COD
}
