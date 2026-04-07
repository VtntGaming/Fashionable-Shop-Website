package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.response.DashboardResponse;
import com.example.fashion_shop.dto.response.RevenueReportResponse;
import com.example.fashion_shop.entity.Order;
import com.example.fashion_shop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdminStatsService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    /**
     * Get dashboard statistics
     */
    public DashboardResponse getDashboard() {
        long totalUsers = userRepository.count();
        long totalProducts = productRepository.count();
        long totalOrders = orderRepository.count();
        
        long pendingOrders = orderRepository.countByStatus(Order.OrderStatus.PENDING);
        long successfulOrders = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        
        // Calculate conversion rate (successful orders / total users)
        int conversionRate = totalUsers > 0 ? (int)((successfulOrders * 100) / totalUsers) : 0;

        // Calculate statistics
        Map<String, Long> ordersByStatus = new HashMap<>();
        ordersByStatus.put("PENDING", orderRepository.countByStatus(Order.OrderStatus.PENDING));
        ordersByStatus.put("PAID", orderRepository.countByStatus(Order.OrderStatus.PAID));
        ordersByStatus.put("SHIPPING", orderRepository.countByStatus(Order.OrderStatus.SHIPPING));
        ordersByStatus.put("DELIVERED", orderRepository.countByStatus(Order.OrderStatus.DELIVERED));
        ordersByStatus.put("CANCELLED", orderRepository.countByStatus(Order.OrderStatus.CANCELLED));

        return DashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .successfulOrders(successfulOrders)
                .conversionRate(conversionRate)
                .ordersByStatus(ordersByStatus)
                .build();
    }

    /**
     * Get revenue statistics
     */
    public RevenueReportResponse getRevenueReport() {
        // Calculate total revenue (for delivered orders only)
        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal monthlyRevenue = BigDecimal.ZERO;
        BigDecimal dailyRevenue = BigDecimal.ZERO;
        
        // Note: In real implementation, you would query this from database
        // For now, returning structure

        return RevenueReportResponse.builder()
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .dailyRevenue(dailyRevenue)
                .totalTransactions(orderRepository.countByStatus(Order.OrderStatus.DELIVERED))
                .averageOrderValue(BigDecimal.ZERO)
                .growthPercentage(0)
                .revenueByCategory(new HashMap<>())
                .revenueByPaymentMethod(new HashMap<>())
                .build();
    }

    /**
     * Get product statistics
     */
    public Map<String, Object> getProductStats() {
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByStatus(productRepository.findAll().get(0).getStatus());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);
        
        return stats;
    }

    /**
     * Get user statistics
     */
    public Map<String, Object> getUserStats() {
        long totalUsers = userRepository.count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        
        return stats;
    }

    /**
     * Get order statistics
     */
    public Map<String, Object> getOrderStats() {
        long totalOrders = orderRepository.count();
        long completedOrders = orderRepository.countByStatus(Order.OrderStatus.DELIVERED);
        long cancelledOrders = orderRepository.countByStatus(Order.OrderStatus.CANCELLED);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("cancelledOrders", cancelledOrders);
        stats.put("completionRate", totalOrders > 0 ? (int)((completedOrders * 100) / totalOrders) : 0);
        
        return stats;
    }
}
