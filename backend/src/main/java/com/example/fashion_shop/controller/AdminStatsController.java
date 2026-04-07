package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.DashboardResponse;
import com.example.fashion_shop.dto.response.RevenueReportResponse;
import com.example.fashion_shop.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {

    private final AdminStatsService adminStatsService;

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        DashboardResponse dashboard = adminStatsService.getDashboard();
        return ResponseEntity.ok(ApiResponse.<DashboardResponse>builder()
                .success(true)
                .message("Dashboard statistics retrieved successfully")
                .data(dashboard)
                .build());
    }

    /**
     * Get revenue report
     */
    @GetMapping("/reports/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport() {
        RevenueReportResponse report = adminStatsService.getRevenueReport();
        return ResponseEntity.ok(ApiResponse.<RevenueReportResponse>builder()
                .success(true)
                .message("Revenue report retrieved successfully")
                .data(report)
                .build());
    }

    /**
     * Get product statistics
     */
    @GetMapping("/reports/products")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getProductStats() {
        Map<String, Object> stats = adminStatsService.getProductStats();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Product statistics retrieved successfully")
                .data(stats)
                .build());
    }

    /**
     * Get user statistics
     */
    @GetMapping("/reports/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats() {
        Map<String, Object> stats = adminStatsService.getUserStats();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("User statistics retrieved successfully")
                .data(stats)
                .build());
    }

    /**
     * Get order statistics
     */
    @GetMapping("/reports/orders")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOrderStats() {
        Map<String, Object> stats = adminStatsService.getOrderStats();
        return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                .success(true)
                .message("Order statistics retrieved successfully")
                .data(stats)
                .build());
    }
}
