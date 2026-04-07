package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.response.WishlistItemResponse;
import com.example.fashion_shop.dto.response.WishlistResponse;
import com.example.fashion_shop.entity.Product;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.entity.Wishlist;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.ProductRepository;
import com.example.fashion_shop.repository.UserRepository;
import com.example.fashion_shop.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    /**
     * Get user's wishlist
     */
    @Transactional(readOnly = true)
    public WishlistResponse getWishlist(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        List<WishlistItemResponse> items = wishlists.stream()
                .map(this::toWishlistItemResponse)
                .toList();

        return WishlistResponse.builder()
                .userId(userId)
                .items(items)
                .itemCount(items.size())
                .build();
    }

    /**
     * Add product to wishlist
     */
    public WishlistResponse addToWishlist(Long userId, Long productId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        // Check if already in wishlist
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new BadRequestException("Product is already in wishlist");
        }

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .build();

        wishlistRepository.save(wishlist);
        log.info("Product {} added to wishlist for user {}", productId, userId);

        return getWishlist(userId);
    }

    /**
     * Remove product from wishlist
     */
    public WishlistResponse removeFromWishlist(Long userId, Long productId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Wishlist wishlist = wishlistRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new BadRequestException("Product not in wishlist"));

        wishlistRepository.delete(wishlist);
        log.info("Product {} removed from wishlist for user {}", productId, userId);

        return getWishlist(userId);
    }

    /**
     * Check if product is in wishlist
     */
    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }

    /**
     * Clear wishlist
     */
    public void clearWishlist(Long userId) {
        List<Wishlist> wishlists = wishlistRepository.findByUserId(userId);
        wishlistRepository.deleteAll(wishlists);
        log.info("Wishlist cleared for user {}", userId);
    }

    /**
     * Get wishlist count
     */
    @Transactional(readOnly = true)
    public long getWishlistCount(Long userId) {
        return wishlistRepository.countByUserId(userId);
    }

    private WishlistItemResponse toWishlistItemResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        if (product == null) {
            return WishlistItemResponse.builder()
                    .id(wishlist.getId())
                    .productId(null)
                    .productName("Product Deleted")
                    .productImage(null)
                    .productSlug(null)
                    .price(null)
                    .salePrice(null)
                    .stock(0)
                    .status("INACTIVE")
                    .addedAt(wishlist.getCreatedAt())
                    .build();
        }

        return WishlistItemResponse.builder()
                .id(wishlist.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImageUrl())
                .productSlug(product.getSlug())
                .price(product.getPrice())
                .salePrice(product.getSalePrice())
                .stock(product.getStock())
                .status(product.getStatus().name())
                .addedAt(wishlist.getCreatedAt())
                .build();
    }
}
