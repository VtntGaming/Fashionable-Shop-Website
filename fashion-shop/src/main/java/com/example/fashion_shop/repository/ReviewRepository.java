package com.example.fashion_shop.repository;

import com.example.fashion_shop.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Page<Review> findByProductId(Long productId, Pageable pageable);

    Page<Review> findByProductIdAndStatus(Long productId, Review.ReviewStatus status, Pageable pageable);

    Page<Review> findByUserId(Long userId, Pageable pageable);

    Optional<Review> findByUserIdAndProductId(Long userId, Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.status = 'VISIBLE'")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId AND r.status = 'VISIBLE'")
    Optional<Double> getAverageRating(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.status = 'VISIBLE'")
    long countByProductIdAndVisibleStatus(@Param("productId") Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);
}
