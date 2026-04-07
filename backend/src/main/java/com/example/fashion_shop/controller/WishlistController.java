package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.WishlistResponse;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    /**
     * Get user's wishlist
     */
    @GetMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> getWishlist(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        WishlistResponse wishlist = wishlistService.getWishlist(userId);
        return ResponseEntity.ok(ApiResponse.<WishlistResponse>builder()
                .success(true)
                .message("Wishlist retrieved successfully")
                .data(wishlist)
                .build());
    }

    /**
     * Add product to wishlist
     */
    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> addToWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        Long userId = getUserIdFromAuthentication(authentication);
        WishlistResponse wishlist = wishlistService.addToWishlist(userId, productId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<WishlistResponse>builder()
                        .success(true)
                        .message("Product added to wishlist successfully")
                        .data(wishlist)
                        .build());
    }

    /**
     * Remove product from wishlist
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistResponse>> removeFromWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        Long userId = getUserIdFromAuthentication(authentication);
        WishlistResponse wishlist = wishlistService.removeFromWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.<WishlistResponse>builder()
                .success(true)
                .message("Product removed from wishlist successfully")
                .data(wishlist)
                .build());
    }

    /**
     * Check if product is in wishlist
     */
    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Boolean>> isInWishlist(
            Authentication authentication,
            @PathVariable Long productId) {
        Long userId = getUserIdFromAuthentication(authentication);
        boolean inWishlist = wishlistService.isInWishlist(userId, productId);
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                .success(true)
                .message("Wishlist check completed")
                .data(inWishlist)
                .build());
    }

    /**
     * Clear wishlist
     */
    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> clearWishlist(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        wishlistService.clearWishlist(userId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Wishlist cleared successfully")
                .data("All items removed from wishlist")
                .build());
    }

    /**
     * Get wishlist item count
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getWishlistCount(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        long count = wishlistService.getWishlistCount(userId);
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .success(true)
                .message("Wishlist count retrieved successfully")
                .data(count)
                .build());
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
