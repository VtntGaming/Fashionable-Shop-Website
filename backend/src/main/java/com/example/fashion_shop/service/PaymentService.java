package com.example.fashion_shop.service;

import com.example.fashion_shop.config.VnPayConfig;
import com.example.fashion_shop.dto.response.PaymentResponse;
import com.example.fashion_shop.dto.response.PaymentUrlResponse;
import com.example.fashion_shop.entity.Order;
import com.example.fashion_shop.entity.Payment;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.OrderRepository;
import com.example.fashion_shop.repository.PaymentRepository;
import com.example.fashion_shop.util.VnPayUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final VnPayConfig vnPayConfig;

    /**
     * Create payment record and generate VNPay payment URL
     */
    public PaymentUrlResponse createVnPayPayment(Long orderId, String returnBaseUrl) {
        if (!vnPayConfig.isConfigured()) {
            throw new BadRequestException("VNPay is not configured");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new BadRequestException("Order status is not pending");
        }

        // Check if payment already exists
        Optional<Payment> existingPayment = paymentRepository.findByOrderId(orderId);
        Payment payment;

        if (existingPayment.isPresent()) {
            payment = existingPayment.get();
            payment.setAmount(order.getTotalAmount());
            payment.setPaymentMethod(Payment.PaymentMethod.VNPAY);
            payment.setStatus(Payment.PaymentStatus.PENDING);
        } else {
            payment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalAmount())
                    .paymentMethod(Payment.PaymentMethod.VNPAY)
                    .status(Payment.PaymentStatus.PENDING)
                    .build();
        }

        String txnRef = order.getOrderCode();
        String resolvedReturnUrl = resolveReturnUrl(returnBaseUrl);

        payment.setVnpTxnRef(txnRef);
        payment.setVnpReturnUrl(resolvedReturnUrl);
        payment = paymentRepository.save(payment);

        order.setVnpTxnRef(txnRef);
        orderRepository.save(order);

        // Generate VNPay payment URL
        String paymentUrl = generateVnPayUrl(order, resolvedReturnUrl);

        log.info("VNPay payment URL generated for order: {}", orderId);
        return PaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .message("Payment URL generated successfully")
                .build();
    }

    /**
     * Handle VNPay return URL
     */
    public PaymentResponse handleVnPayReturn(Map<String, String> params) {
        String vnpTxnRef = VnPayUtil.getParam(params, "vnp_TxnRef");
        String vnpResponseCode = VnPayUtil.getParam(params, "vnp_ResponseCode");
        String vnpSecureHash = VnPayUtil.getParam(params, "vnp_SecureHash");

        // Verify secure hash
        if (!verifyVnPaySecureHash(params, vnpSecureHash)) {
            throw new BadRequestException("Invalid secure hash");
        }

        Payment payment = paymentRepository.findByVnpTxnRef(vnpTxnRef)
                .orElseThrow(() -> new BadRequestException("Payment not found"));

        // Update payment status based on response code
        if ("00".equals(vnpResponseCode)) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            
            // Update order status
            Order order = payment.getOrder();
            if (order != null) {
                order.setStatus(Order.OrderStatus.PAID);
                orderRepository.save(order);
                log.info("Payment successful for order: {}", order.getId());
            } else {
                log.warn("Payment successful but order not found for payment: {}", payment.getId());
            }
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            log.info("Payment failed with code: {} for order: {}", vnpResponseCode, payment.getOrder().getId());
        }

        payment.setVnpResponseCode(vnpResponseCode);
        payment.setVnpResponseMessage(VnPayUtil.getParam(params, "vnp_Message"));
        paymentRepository.save(payment);

        return toPaymentResponse(payment);
    }

    /**
     * Handle VNPay IPN callback
     */
    public void handleVnPayIpn(Map<String, String> params) {
        String vnpTxnRef = VnPayUtil.getParam(params, "vnp_TxnRef");
        String vnpResponseCode = VnPayUtil.getParam(params, "vnp_ResponseCode");
        String vnpSecureHash = VnPayUtil.getParam(params, "vnp_SecureHash");
        String vnpRequestId = VnPayUtil.getParam(params, "vnp_TransactionNo");

        // Verify secure hash
        if (!verifyVnPaySecureHash(params, vnpSecureHash)) {
            log.warn("Invalid secure hash for IPN from VNPay");
            return;
        }

        Optional<Payment> existingPayment = paymentRepository.findByVnpTxnRef(vnpTxnRef);

        if (existingPayment.isEmpty()) {
            log.warn("Payment not found for transaction: {}", vnpTxnRef);
            return;
        }

        Payment payment = existingPayment.get();

        // Update IPN request ID
        if (vnpRequestId != null) {
            payment.setIpnRequestId(vnpRequestId);
        }

        // Update payment status if successful
        if ("00".equals(vnpResponseCode) && payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());

            // Update order status
            Order order = payment.getOrder();
            order.setStatus(Order.OrderStatus.PAID);
            orderRepository.save(order);

            log.info("Payment confirmed via IPN for order: {}", order.getId());
        }

        paymentRepository.save(payment);
    }

    /**
     * Get payment by order ID
     */
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return toPaymentResponse(payment);
    }

    /**
     * Verify VNPay secure hash
     */
    private boolean verifyVnPaySecureHash(Map<String, String> params, String secureHash) {
        // Remove secure hash from params
        Map<String, String> verifyParams = new TreeMap<>(params);
        verifyParams.remove("vnp_SecureHash");
        verifyParams.remove("vnp_SecureHashType");

        String data = VnPayUtil.buildQueryString(verifyParams);
        String calculatedHash = VnPayUtil.hmacSHA512(data, vnPayConfig.getHashSecret());

        return calculatedHash.equals(secureHash);
    }

    /**
     * Generate VNPay payment URL
     */
    private String generateVnPayUrl(Order order, String returnBaseUrl) {
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.1");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", VnPayUtil.formatAmount(order.getTotalAmount()));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", order.getOrderCode());
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + order.getOrderCode());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnBaseUrl);
        vnpParams.put("vnp_IpAddr", "127.0.0.1");

        LocalDateTime now = LocalDateTime.now();
        String createDate = now.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String expireDate = now.plusMinutes(15).format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);

        String hashData = VnPayUtil.buildQueryString(vnpParams);
        String secureHash = VnPayUtil.hmacSHA512(hashData, vnPayConfig.getHashSecret());
        vnpParams.put("vnp_SecureHash", secureHash);
        vnpParams.put("vnp_SecureHashType", "SHA512");

        return vnPayConfig.getApiUrl() + "?" + VnPayUtil.buildQueryString(vnpParams);
    }

    private String resolveReturnUrl(String returnBaseUrl) {
        String configuredReturnUrl = vnPayConfig.getReturnUrl();
        String candidate = (returnBaseUrl == null || returnBaseUrl.isBlank())
                ? configuredReturnUrl
                : returnBaseUrl.trim();

        try {
            URI uri = URI.create(candidate);
            String scheme = uri.getScheme();
            if (scheme != null && (scheme.equalsIgnoreCase("http") || scheme.equalsIgnoreCase("https"))) {
                return uri.toASCIIString();
            }
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid VNPay return URL received, fallback to configured URL: {}", candidate);
        }

        if (configuredReturnUrl != null && !configuredReturnUrl.isBlank()) {
            return configuredReturnUrl.trim();
        }

        throw new BadRequestException("VNPay return URL is invalid or not configured");
    }

    private PaymentResponse toPaymentResponse(Payment payment) {
        Order order = payment.getOrder();
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(order != null ? order.getId() : null)
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod().name())
                .status(payment.getStatus().name())
                .vnpTxnRef(payment.getVnpTxnRef())
                .vnpResponseCode(payment.getVnpResponseCode())
                .vnpResponseMessage(payment.getVnpResponseMessage())
                .createdAt(payment.getCreatedAt())
                .paidAt(payment.getPaidAt())
                .build();
    }
}
