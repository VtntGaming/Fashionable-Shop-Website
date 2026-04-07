package com.example.fashion_shop.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportResponse {

    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal dailyRevenue;
    private Long totalTransactions;
    private Long monthlyTransactions;
    private BigDecimal averageOrderValue;
    private Integer growthPercentage; // compared to previous month
    private java.util.Map<String, BigDecimal> revenueByCategory;
    private java.util.Map<String, BigDecimal> revenueByPaymentMethod;
}
