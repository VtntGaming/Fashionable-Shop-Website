package com.example.fashion_shop.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private Long totalUsers;
    private Long totalProducts;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalOrderValue;
    private Double averageOrderValue;
    private Long pendingOrders;
    private Long successfulOrders;
    private Integer conversionRate; // percentage
    private Map<String, Long> ordersByStatus;
    private Map<String, BigDecimal> revenueByMonth; // Last 12 months
    private java.util.List<String> topProducts;
    private java.util.List<String> topCategories;
}
