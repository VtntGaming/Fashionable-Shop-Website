package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.response.ProductResponse;
import com.example.fashion_shop.dto.response.RecommendationResponse;
import com.example.fashion_shop.entity.*;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class RecommendationService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    /**
     * Get personalized recommendations for a user
     */
    public List<RecommendationResponse> getRecommendationsForUser(Long userId, int limit) {
        // Verify user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<RecommendationResponse> recommendations = new ArrayList<>();

        // 1. Get recommendations based on user's purchase history
        List<RecommendationResponse> categoryBased = getRecommendationsByUserPurchaseHistory(userId, limit);
        recommendations.addAll(categoryBased);

        // 2. Get trending/popular products
        if (recommendations.size() < limit) {
            List<RecommendationResponse> trending = getTrendingProducts(limit - recommendations.size());
            trending.stream()
                    .filter(r -> !recommendations.stream()
                            .map(RecommendationResponse::getId)
                            .collect(Collectors.toSet())
                            .contains(r.getId()))
                    .forEach(recommendations::add);
        }

        // 3. Get highly rated products
        if (recommendations.size() < limit) {
            List<RecommendationResponse> topRated = getTopRatedProducts(limit - recommendations.size());
            topRated.stream()
                    .filter(r -> !recommendations.stream()
                            .map(RecommendationResponse::getId)
                            .collect(Collectors.toSet())
                            .contains(r.getId()))
                    .forEach(recommendations::add);
        }

        return recommendations.stream().limit(limit).collect(Collectors.toList());
    }

    /**
     * Get recommendations based on user's purchase history
     */
    private List<RecommendationResponse> getRecommendationsByUserPurchaseHistory(Long userId, int limit) {
        // Get user's orders
        List<Order> userOrders = orderRepository.findByUserIdAndStatus(userId, Order.OrderStatus.DELIVERED);

        if (userOrders.isEmpty()) {
            return new ArrayList<>();
        }

        // Extract categories from user's purchases
        Set<Long> purchasedCategoryIds = new HashSet<>();
        for (Order order : userOrders) {
            for (OrderItem item : order.getItems()) {
                if (item.getProduct().getCategory() != null) {
                    purchasedCategoryIds.add(item.getProduct().getCategory().getId());
                }
            }
        }

        if (purchasedCategoryIds.isEmpty()) {
            return new ArrayList<>();
        }

        // Get products from the same categories
        Pageable pageable = PageRequest.of(0, limit * 2);
        List<Product> recommendedProducts = new ArrayList<>();

        for (Long categoryId : purchasedCategoryIds) {
            List<Product> categoryProducts = productRepository.findByCategoryIdAndStatus(
                    categoryId, Product.Status.ACTIVE, pageable).getContent();
            recommendedProducts.addAll(categoryProducts);
        }

        // Remove already purchased products
        Set<Long> purchasedProductIds = new HashSet<>();
        for (Order order : userOrders) {
            for (OrderItem item : order.getItems()) {
                purchasedProductIds.add(item.getProduct().getId());
            }
        }

        return recommendedProducts.stream()
                .filter(p -> !purchasedProductIds.contains(p.getId()))
                .distinct()
                .limit(limit)
                .map(p -> {
                    ProductResponse prodResponse = ProductResponse.fromEntity(p, false);
                    return RecommendationResponse.fromProductResponse(prodResponse, 
                            "Based on your purchase history");
                })
                .collect(Collectors.toList());
    }

    /**
     * Get trending products (based on views and recent additions)
     */
    private List<RecommendationResponse> getTrendingProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> trendingProducts = productRepository
                .findByStatus(Product.Status.ACTIVE, pageable)
                .stream()
                .sorted(Comparator.comparingInt(Product::getViews).reversed())
                .limit(limit)
                .collect(Collectors.toList());

        return trendingProducts.stream()
                .map(p -> {
                    ProductResponse prodResponse = ProductResponse.fromEntity(p, false);
                    return RecommendationResponse.fromProductResponse(prodResponse, 
                            "Trending now");
                })
                .collect(Collectors.toList());
    }

    /**
     * Get top rated products
     */
    private List<RecommendationResponse> getTopRatedProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> productsByRating = productRepository
                .findByStatus(Product.Status.ACTIVE, pageable)
                .stream()
                .sorted((p1, p2) -> {
                    Double avg1 = reviewRepository.getAverageRating(p1.getId()).orElse(0.0);
                    Double avg2 = reviewRepository.getAverageRating(p2.getId()).orElse(0.0);
                    return avg2.compareTo(avg1);
                })
                .limit(limit)
                .collect(Collectors.toList());

        return productsByRating.stream()
                .map(p -> {
                    ProductResponse prodResponse = ProductResponse.fromEntity(p, false);
                    return RecommendationResponse.fromProductResponse(prodResponse, 
                            "Highly rated");
                })
                .collect(Collectors.toList());
    }

    /**
     * Get recommendations based on a specific product (similar products)
     */
    public List<RecommendationResponse> getSimilarProducts(Long productId, int limit) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Pageable pageable = PageRequest.of(0, limit * 2);

        // Get products from the same category
        List<Product> similarProducts = new ArrayList<>();
        if (product.getCategory() != null) {
            similarProducts = productRepository.findByCategoryIdAndStatus(
                    product.getCategory().getId(), Product.Status.ACTIVE, pageable)
                    .getContent();
        }

        // Filter out the current product and limit results
        return similarProducts.stream()
                .filter(p -> !p.getId().equals(productId))
                .limit(limit)
                .map(p -> {
                    ProductResponse prodResponse = ProductResponse.fromEntity(p, false);
                    return RecommendationResponse.fromProductResponse(prodResponse, 
                            "Similar to this product");
                })
                .collect(Collectors.toList());
    }

    /**
     * Get recommendations for guests (no user history)
     */
    public List<RecommendationResponse> getGuestRecommendations(int limit) {
        List<RecommendationResponse> recommendations = new ArrayList<>();

        // 1. Get trending products
        recommendations.addAll(getTrendingProducts(limit / 2));

        // 2. Get top-rated products
        if (recommendations.size() < limit) {
            recommendations.addAll(getTopRatedProducts(limit - recommendations.size()));
        }

        return recommendations.stream().limit(limit).collect(Collectors.toList());
    }
}
