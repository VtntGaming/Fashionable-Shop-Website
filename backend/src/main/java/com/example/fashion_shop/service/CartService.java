package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.request.AddToCartRequest;
import com.example.fashion_shop.dto.request.UpdateCartItemRequest;
import com.example.fashion_shop.dto.response.CartItemResponse;
import com.example.fashion_shop.dto.response.CartResponse;
import com.example.fashion_shop.entity.Cart;
import com.example.fashion_shop.entity.CartItem;
import com.example.fashion_shop.entity.Product;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.CartItemRepository;
import com.example.fashion_shop.repository.CartRepository;
import com.example.fashion_shop.repository.ProductRepository;
import com.example.fashion_shop.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    /**
     * Get or create an active cart for the user
     */
    public Cart getOrCreateCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return cartRepository.findByUserAndStatus(user, Cart.CartStatus.ACTIVE)
                .orElseGet(() -> createNewCart(user));
    }

    private Cart createNewCart(User user) {
        Cart cart = Cart.builder()
                .user(user)
                .status(Cart.CartStatus.ACTIVE)
                .build();
        return cartRepository.save(cart);
    }

    /**
     * Add item to cart
     */
    public CartResponse addToCart(Long userId, AddToCartRequest request) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (product.getStatus() == Product.Status.INACTIVE) {
            throw new BadRequestException("Product is not available");
        }

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock available");
        }

        // Check if product already in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(
                cart.getId(), product.getId());

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (product.getStock() < newQuantity) {
                throw new BadRequestException("Insufficient stock available");
            }
            item.updateQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .priceAtAdd(product.getEffectivePrice())
                    .build();
            cartItemRepository.save(newItem);
        }

        cart.updateTotalAmount();
        cartRepository.save(cart);

        log.info("Product {} added to cart for user {}", product.getId(), userId);
        return toCartResponse(cart);
    }

    /**
     * Update cart item quantity
     */
    public CartResponse updateCartItem(Long userId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(request.getCartItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to this cart");
        }

        Product product = cartItem.getProduct();
        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Insufficient stock available");
        }

        cartItem.updateQuantity(request.getQuantity());
        cartItemRepository.save(cartItem);

        cart.updateTotalAmount();
        cartRepository.save(cart);

        log.info("Cart item {} updated with quantity {}", cartItem.getId(), request.getQuantity());
        return toCartResponse(cart);
    }

    /**
     * Remove item from cart
     */
    public CartResponse removeFromCart(Long userId, Long cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to this cart");
        }

        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);
        cartRepository.save(cart);

        log.info("Item {} removed from cart for user {}", cartItemId, userId);
        return toCartResponse(cart);
    }

    /**
     * Get cart for user
     */
    public CartResponse getCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return toCartResponse(cart);
    }

    /**
     * Clear cart
     */
    public void clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cart.clear();
        cartRepository.save(cart);
        log.info("Cart cleared for user {}", userId);
    }

    /**
     * Mark cart as checked out
     */
    public void markCartAsCheckedOut(Cart cart) {
        cart.setStatus(Cart.CartStatus.CHECKED_OUT);
        cartRepository.save(cart);
    }

    private CartResponse toCartResponse(Cart cart) {
        List<CartItemResponse> itemResponses = (cart.getItems() != null && !cart.getItems().isEmpty())
                ? cart.getItems().stream()
                        .map(this::toCartItemResponse)
                        .toList()
                : List.of();

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemResponses)
                .itemCount(itemResponses.size())
                .totalAmount(cart.getTotalAmount())
                .status(cart.getStatus().name())
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    private CartItemResponse toCartItemResponse(CartItem item) {
        Product product = item.getProduct();
        return CartItemResponse.builder()
                .id(item.getId())
                .cartId(item.getCart() != null ? item.getCart().getId() : null)
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : "Unknown Product")
                .productImage(product != null ? product.getImageUrl() : null)
                .quantity(item.getQuantity())
                .priceAtAdd(item.getPriceAtAdd())
                .subtotal(item.getSubtotal())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
