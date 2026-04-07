package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.PaymentResponse;
import com.example.fashion_shop.dto.response.PaymentUrlResponse;
import com.example.fashion_shop.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Create VNPay payment and get payment URL
     */
    @PostMapping("/vnpay/create")
    public ResponseEntity<ApiResponse<PaymentUrlResponse>> createVnPayPayment(
            @RequestParam Long orderId,
            @RequestParam(required = false, defaultValue = "") String returnUrl) {
        PaymentUrlResponse result = paymentService.createVnPayPayment(orderId, returnUrl);
        return ResponseEntity.ok(ApiResponse.<PaymentUrlResponse>builder()
                .success(true)
                .message("Payment URL created successfully")
                .data(result)
                .build());
    }

    /**
     * VNPay return URL handler
     */
    @GetMapping("/vnpay/return")
    public ResponseEntity<ApiResponse<PaymentResponse>> vnPayReturn(@RequestParam Map<String, String> allParams) {
        PaymentResponse payment = paymentService.handleVnPayReturn(allParams);
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(payment.getStatus().equals("SUCCESS"))
                .message(payment.getStatus().equals("SUCCESS") ? "Payment successful" : "Payment failed")
                .data(payment)
                .build());
    }

    /**
     * VNPay IPN callback handler
     */
    @PostMapping("/vnpay/ipn")
    public ResponseEntity<Map<String, String>> vnPayIpn(@RequestParam Map<String, String> allParams) {
        try {
            paymentService.handleVnPayIpn(allParams);
            return ResponseEntity.ok(Map.of(
                    "RspCode", "00",
                    "Message", "Confirm received"
            ));
        } catch (Exception e) {
            log.error("Error processing VNPay IPN", e);
            return ResponseEntity.ok(Map.of(
                    "RspCode", "01",
                    "Message", "Error processing payment"
            ));
        }
    }

    /**
     * Get payment details by order ID
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrderId(@PathVariable Long orderId) {
        PaymentResponse payment = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.<PaymentResponse>builder()
                .success(true)
                .message("Payment details retrieved successfully")
                .data(payment)
                .build());
    }
}
