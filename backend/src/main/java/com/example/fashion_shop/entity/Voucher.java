package com.example.fashion_shop.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers", indexes = {
        @Index(name = "idx_vouchers_code", columnList = "code"),
        @Index(name = "idx_vouchers_status", columnList = "status"),
        @Index(name = "idx_vouchers_dates", columnList = "start_date,end_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENT or AMOUNT

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_value", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal minOrderValue = BigDecimal.ZERO;

    @Column(name = "max_discount", precision = 10, scale = 2)
    private BigDecimal maxDiscount;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 0; // 0 = unlimited

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VoucherStatus status = VoucherStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum DiscountType {
        PERCENT, AMOUNT
    }

    public enum VoucherStatus {
        ACTIVE, INACTIVE
    }

    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return status == VoucherStatus.ACTIVE &&
                now.isAfter(startDate) &&
                now.isBefore(endDate) &&
                (quantity == 0 || quantity > 0);
    }

    public boolean canBeUsed(BigDecimal orderAmount) {
        if (!isValid()) {
            return false;
        }
        return orderAmount.compareTo(minOrderValue) >= 0;
    }

    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!canBeUsed(orderAmount)) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (discountType == DiscountType.PERCENT) {
            discount = orderAmount.multiply(discountValue).divide(new BigDecimal(100));
        } else {
            discount = discountValue;
        }

        // Apply max discount limit
        if (maxDiscount != null && discount.compareTo(maxDiscount) > 0) {
            discount = maxDiscount;
        }

        return discount;
    }

    public void decrementQuantity() {
        if (quantity > 0) {
            quantity--;
        }
    }
}
