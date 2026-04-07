package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.request.ReviewCreateRequest;
import com.example.fashion_shop.dto.request.ReviewUpdateRequest;
import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.ReviewResponse;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * Create review
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewCreateRequest request) {
        Long userId = getUserIdFromAuthentication(authentication);
        ReviewResponse review = reviewService.createReview(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ReviewResponse>builder()
                        .success(true)
                        .message("Review created successfully")
                        .data(review)
                        .build());
    }

    /**
     * Get review by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReview(@PathVariable Long id) {
        ReviewResponse review = reviewService.getReview(id);
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Review retrieved successfully")
                .data(review)
                .build());
    }

    /**
     * Get reviews for product
     */
    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = reviewService.getProductReviews(productId, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ReviewResponse>>builder()
                .success(true)
                .message("Reviews retrieved successfully")
                .data(reviews)
                .build());
    }

    /**
     * Get user's reviews
     */
    @GetMapping("/my-reviews")
    public ResponseEntity<ApiResponse<Page<ReviewResponse>>> getUserReviews(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getUserIdFromAuthentication(authentication);
        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = reviewService.getUserReviews(userId, pageable);
        return ResponseEntity.ok(ApiResponse.<Page<ReviewResponse>>builder()
                .success(true)
                .message("Your reviews retrieved successfully")
                .data(reviews)
                .build());
    }

    /**
     * Update review
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody ReviewUpdateRequest request) {
        Long userId = getUserIdFromAuthentication(authentication);
        ReviewResponse review = reviewService.updateReview(id, userId, request);
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Review updated successfully")
                .data(review)
                .build());
    }

    /**
     * Delete review
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteReview(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        reviewService.deleteReview(id, userId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Review deleted successfully")
                .data("Review has been removed")
                .build());
    }

    /**
     * Update review status (Admin only)
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReviewStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        ReviewResponse review = reviewService.updateReviewStatus(id, status);
        return ResponseEntity.ok(ApiResponse.<ReviewResponse>builder()
                .success(true)
                .message("Review status updated successfully")
                .data(review)
                .build());
    }

    /**
     * Get average rating for product
     */
    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<ApiResponse<Double>> getAverageRating(@PathVariable Long productId) {
        Double rating = reviewService.getAverageRating(productId);
        return ResponseEntity.ok(ApiResponse.<Double>builder()
                .success(true)
                .message("Average rating retrieved successfully")
                .data(rating)
                .build());
    }

    /**
     * Get review count for product
     */
    @GetMapping("/product/{productId}/count")
    public ResponseEntity<ApiResponse<Long>> getReviewCount(@PathVariable Long productId) {
        long count = reviewService.getReviewCount(productId);
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .message("Review count retrieved successfully")
                .data(count)
                .build());
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
