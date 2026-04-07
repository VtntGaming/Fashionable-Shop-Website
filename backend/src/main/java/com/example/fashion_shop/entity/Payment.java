package com.example.fashion_shop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payments_order", columnList = "order_id"),
        @Index(name = "idx_payments_status", columnList = "status"),
        @Index(name = "idx_payments_vnp_ref", columnList = "vnp_txn_ref")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod; // VNPAY, COD

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING; // PENDING, PROCESSING, SUCCESS, FAILED

    @Column(name = "vnp_txn_ref", length = 100)
    private String vnpTxnRef; // VNPay transaction reference

    @Column(name = "vnp_response_code", length = 10)
    private String vnpResponseCode; // VNPay response code

    @Column(columnDefinition = "TEXT")
    private String vnpResponseMessage; // VNPay response message

    @Column(name = "vnp_return_url", length = 500)
    private String vnpReturnUrl;

    @Column(name = "ipn_request_id", length = 100)
    private String ipnRequestId; // VNPay IPN request ID

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    public enum PaymentMethod {
        VNPAY, COD
    }

    public enum PaymentStatus {
        PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED
    }
}
