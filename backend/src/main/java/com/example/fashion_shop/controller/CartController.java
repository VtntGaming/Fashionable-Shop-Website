package com.example.fashion_shop.controller;

import com.example.fashion_shop.dto.request.AddToCartRequest;
import com.example.fashion_shop.dto.request.UpdateCartItemRequest;
import com.example.fashion_shop.dto.response.ApiResponse;
import com.example.fashion_shop.dto.response.CartResponse;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * Get current user's cart
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        CartResponse cart = cartService.getCart(userId);
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart retrieved successfully")
                .data(cart)
                .build());
    }

    /**
     * Add product to cart
     */
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(
            Authentication authentication,
            @Valid @RequestBody AddToCartRequest request) {
        Long userId = getUserIdFromAuthentication(authentication);
        CartResponse cart = cartService.addToCart(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<CartResponse>builder()
                        .success(true)
                        .message("Product added to cart successfully")
                        .data(cart)
                        .build());
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/update")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            Authentication authentication,
            @Valid @RequestBody UpdateCartItemRequest request) {
        Long userId = getUserIdFromAuthentication(authentication);
        CartResponse cart = cartService.updateCartItem(userId, request);
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Cart item updated successfully")
                .data(cart)
                .build());
    }

    /**
     * Remove item from cart
     */
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(
            Authentication authentication,
            @PathVariable Long cartItemId) {
        Long userId = getUserIdFromAuthentication(authentication);
        CartResponse cart = cartService.removeFromCart(userId, cartItemId);
        return ResponseEntity.ok(ApiResponse.<CartResponse>builder()
                .success(true)
                .message("Item removed from cart successfully")
                .data(cart)
                .build());
    }

    /**
     * Clear cart
     */
    @DeleteMapping("/clear")
    public ResponseEntity<ApiResponse<String>> clearCart(Authentication authentication) {
        Long userId = getUserIdFromAuthentication(authentication);
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Cart cleared successfully")
                .data("Cart has been emptied")
                .build());
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
