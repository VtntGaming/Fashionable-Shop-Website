package com.example.fashion_shop.service;

import com.example.fashion_shop.dto.request.CreateOrderRequest;
import com.example.fashion_shop.dto.response.OrderItemResponse;
import com.example.fashion_shop.dto.response.OrderResponse;
import com.example.fashion_shop.entity.*;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    /**
     * Create order from cart
     */
    public OrderResponse createOrder(Long userId, CreateOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Cart cart = cartRepository.findByUserAndStatus(user, Cart.CartStatus.ACTIVE)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        // Validate payment method
        Order.PaymentMethod paymentMethod;
        try {
            paymentMethod = Order.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid payment method. Allowed values: COD, VNPAY");
        }

        // Check stock availability for all items
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException(
                        String.format("Insufficient stock for product: %s", product.getName()));
            }
        }

        // Create order
        String orderCode = generateOrderCode();
        Order order = Order.builder()
                .user(user)
                .orderCode(orderCode)
                .shippingAddress(request.getShippingAddress())
                .phone(request.getPhone())
                .paymentMethod(paymentMethod)
                .status(Order.OrderStatus.PENDING)
                .build();

        // Add items from cart to order
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(cartItem.getPriceAtAdd())
                    .build();
            order.addItem(orderItem);

            // Update product stock
            Product product = cartItem.getProduct();
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        // Calculate total
        order.calculateTotal();
        Order savedOrder = orderRepository.save(order);

        // Save order items
        order.getItems().forEach(orderItemRepository::save);

        // Mark cart as checked out and clear it
        cart.setStatus(Cart.CartStatus.CHECKED_OUT);
        cart.clear();
        cartRepository.save(cart);

        log.info("Order {} created for user {} with {} items", orderCode, userId, order.getItems().size());
        emailService.sendOrderConfirmationEmail(savedOrder);
        return toOrderResponse(savedOrder);
    }

    /**
     * Get order by ID
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toOrderResponse(order);
    }

    /**
     * Get order by order code
     */
    @Transactional(readOnly = true)
    public OrderResponse getOrderByCode(String orderCode) {
        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toOrderResponse(order);
    }

    /**
     * Get user orders
     */
    @Transactional(readOnly = true)
    public Page<OrderResponse> getUserOrders(Long userId, Pageable pageable) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return orderRepository.findByUserId(userId, pageable)
                .map(this::toOrderResponse);
    }

    /**
     * Update order status
     */
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        try {
            order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid order status");
        }

        Order updatedOrder = orderRepository.save(order);
        log.info("Order {} status updated to {}", orderId, status);
        return toOrderResponse(updatedOrder);
    }

    /**
     * Cancel order
     */
    public OrderResponse cancelOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == Order.OrderStatus.DELIVERED) {
            throw new BadRequestException("Cannot cancel delivered order");
        }

        if (order.getStatus() == Order.OrderStatus.CANCELLED) {
            throw new BadRequestException("Order is already cancelled");
        }

        // Restore product stock
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        log.info("Order {} cancelled", orderId);
        return toOrderResponse(cancelledOrder);
    }

    /**
     * Generate unique order code
     */
    private String generateOrderCode() {
        // Format: ORD-YYYYMMDD-XXXXXX where XXXXXX is random hex
        LocalDateTime now = LocalDateTime.now();
        String datePart = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + datePart + "-" + randomPart;
    }

    private OrderResponse toOrderResponse(Order order) {
        List<OrderItemResponse> itemResponses = (order.getItems() != null && !order.getItems().isEmpty())
                ? order.getItems().stream()
                        .map(this::toOrderItemResponse)
                        .toList()
                : List.of();

        return OrderResponse.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .shippingAddress(order.getShippingAddress())
                .phone(order.getPhone())
                .paymentMethod(order.getPaymentMethod().name())
                .voucherId(order.getVoucher() != null ? order.getVoucher().getId() : null)
                .itemCount(itemResponses.size())
                .createdAt(order.getCreatedAt())
                .build();
    }

    private OrderItemResponse toOrderItemResponse(OrderItem item) {
        Order order = item.getOrder();
        Product product = item.getProduct();
        return OrderItemResponse.builder()
                .id(item.getId())
                .orderId(order != null ? order.getId() : null)
                .productId(product != null ? product.getId() : null)
                .productName(product != null ? product.getName() : "Unknown Product")
                .productImage(product != null ? product.getImageUrl() : null)
                .quantity(item.getQuantity())
                .priceAtPurchase(item.getPriceAtPurchase())
                .subtotal(item.getSubtotal())
                .build();
    }
}
