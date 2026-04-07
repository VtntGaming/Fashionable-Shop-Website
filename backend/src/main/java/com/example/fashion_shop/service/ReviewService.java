package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.request.ReviewCreateRequest;
import com.example.fashion_shop.dto.request.ReviewUpdateRequest;
import com.example.fashion_shop.dto.response.ReviewResponse;
import com.example.fashion_shop.entity.Product;
import com.example.fashion_shop.entity.Review;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.ProductRepository;
import com.example.fashion_shop.repository.ReviewRepository;
import com.example.fashion_shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    /**
     * Create review
     */
    public ReviewResponse createReview(Long userId, ReviewCreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if user already reviewed this product
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(Review.ReviewStatus.VISIBLE)
                .build();

        Review savedReview = reviewRepository.save(review);
        log.info("Review created for product {} by user {}", product.getId(), userId);
        emailService.sendReviewNotificationEmail(savedReview);
        return toReviewResponse(savedReview);
    }

    /**
     * Get review by ID
     */
    @Transactional(readOnly = true)
    public ReviewResponse getReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        return toReviewResponse(review);
    }

    /**
     * Get reviews for product
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getProductReviews(Long productId, Pageable pageable) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return reviewRepository.findByProductIdAndStatus(productId, Review.ReviewStatus.VISIBLE, pageable)
                .map(this::toReviewResponse);
    }

    /**
     * Get reviews by user
     */
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getUserReviews(Long userId, Pageable pageable) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return reviewRepository.findByUserId(userId, pageable)
                .map(this::toReviewResponse);
    }

    /**
     * Update review
     */
    public ReviewResponse updateReview(Long reviewId, Long userId, ReviewUpdateRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Check if user owns this review
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You cannot modify this review");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review updatedReview = reviewRepository.save(review);
        log.info("Review {} updated by user {}", reviewId, userId);
        return toReviewResponse(updatedReview);
    }

    /**
     * Delete review
     */
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        // Check if user owns this review
        if (!review.getUser().getId().equals(userId)) {
            throw new BadRequestException("You cannot delete this review");
        }

        reviewRepository.delete(review);
        log.info("Review {} deleted by user {}", reviewId, userId);
    }

    /**
     * Change review status (Admin)
     */
    public ReviewResponse updateReviewStatus(Long reviewId, String status) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        try {
            review.setStatus(Review.ReviewStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status value");
        }

        Review updatedReview = reviewRepository.save(review);
        log.info("Review {} status updated to {}", reviewId, status);
        return toReviewResponse(updatedReview);
    }

    /**
     * Get average rating for product
     */
    @Transactional(readOnly = true)
    public Double getAverageRating(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Double average = reviewRepository.getAverageRatingByProductId(productId);
        return average != null ? Math.round(average * 10.0) / 10.0 : 0.0;
    }

    /**
     * Get total review count for product
     */
    @Transactional(readOnly = true)
    public long getReviewCount(Long productId) {
        productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        return reviewRepository.countByProductIdAndVisibleStatus(productId);
    }

    private ReviewResponse toReviewResponse(Review review) {
        Product product = review.getProduct();
        User user = review.getUser();
        
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(product != null ? product.getId() : null)
                .userId(user != null ? user.getId() : null)
                .userName(user != null ? user.getFullName() : "Anonymous")
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus().name())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
