package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.RecommendationResponse;
import com.example.fashion_shop.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.example.fashion_shop.entity.User;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * Get personalized recommendations for authenticated user
     */
    @GetMapping("/personalized")
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> getPersonalizedRecommendations(
            @RequestParam(defaultValue = "8") int limit) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.ok(ApiResponse.success(
                    recommendationService.getGuestRecommendations(limit)));
        }

        User user = (User) authentication.getPrincipal();
        List<RecommendationResponse> recommendations = 
                recommendationService.getRecommendationsForUser(user.getId(), limit);
        
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    /**
     * Get recommendations for guests (no authentication)
     */
    @GetMapping("/guest")
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> getGuestRecommendations(
            @RequestParam(defaultValue = "8") int limit) {
        
        List<RecommendationResponse> recommendations = 
                recommendationService.getGuestRecommendations(limit);
        return ResponseEntity.ok(ApiResponse.success(recommendations));
    }

    /**
     * Get similar products
     */
    @GetMapping("/similar/{productId}")
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> getSimilarProducts(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "6") int limit) {
        
        List<RecommendationResponse> similar = 
                recommendationService.getSimilarProducts(productId, limit);
        return ResponseEntity.ok(ApiResponse.success(similar));
    }

    /**
     * Get trending products
     */
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> getTrendingProducts(
            @RequestParam(defaultValue = "8") int limit) {
        
        List<RecommendationResponse> trending = 
                recommendationService.getGuestRecommendations(limit);
        return ResponseEntity.ok(ApiResponse.success(trending));
    }
}
