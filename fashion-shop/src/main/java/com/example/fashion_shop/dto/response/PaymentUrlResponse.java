package com.example.fashion_shop.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentUrlResponse {

    private String paymentUrl;
    private String message;
}
