package com.example.fashion_shop.service;

import com.example.fashion_shop.config.VnPayConfig;
import com.example.fashion_shop.dto.response.PaymentResponse;
import com.example.fashion_shop.dto.response.PaymentUrlResponse;
import com.example.fashion_shop.entity.Order;
import com.example.fashion_shop.entity.Payment;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.exception.BadRequestException;
import com.example.fashion_shop.exception.ResourceNotFoundException;
import com.example.fashion_shop.repository.OrderRepository;
import com.example.fashion_shop.repository.PaymentRepository;
import com.example.fashion_shop.util.VnPayUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("PaymentService - VNPay Payment Service Tests")
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private VnPayConfig vnPayConfig;

    @InjectMocks
    private PaymentService paymentService;

    private User testUser;
    private Order testOrder;
    private Payment testPayment;

    private static final String TEST_SECRET = "TEST_HASH_SECRET_32_CHARS_LONG_123";
    private static final String TEST_TMN_CODE = "TEST_TMN_CODE";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("testuser@gmail.com")
                .fullName("Test User")
                .status(User.Status.ACTIVE)
                .role(User.Role.USER)
                .build();

        testOrder = Order.builder()
                .id(100L)
                .user(testUser)
                .orderCode("ORD-2026-001")
                .totalAmount(new BigDecimal("500000"))
                .status(Order.OrderStatus.PENDING)
                .shippingAddress("123 Test Street")
                .phone("0912345678")
                .paymentMethod(Order.PaymentMethod.VNPAY)
                .build();

        testPayment = Payment.builder()
                .id(1L)
                .order(testOrder)
                .amount(new BigDecimal("500000"))
                .paymentMethod(Payment.PaymentMethod.VNPAY)
                .status(Payment.PaymentStatus.PENDING)
                .build();
    }

    private void setupVnPayConfigMock() {
        when(vnPayConfig.getHashSecret()).thenReturn(TEST_SECRET);
    }

    // ==================== Create VNPay Payment Tests ====================

    @Nested
    @DisplayName("Create VNPay Payment")
    class CreateVnPayPaymentTests {

        @Test
        @DisplayName("Should throw exception when VNPay is not configured")
        void shouldThrowExceptionWhenNotConfigured() {
            when(vnPayConfig.isConfigured()).thenReturn(false);

            assertThrows(BadRequestException.class, () ->
                    paymentService.createVnPayPayment(100L, "http://localhost/return")
            );
        }

        @Test
        @DisplayName("Should throw exception when order not found")
        void shouldThrowExceptionWhenOrderNotFound() {
            when(vnPayConfig.isConfigured()).thenReturn(true);
            when(orderRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () ->
                    paymentService.createVnPayPayment(999L, "http://localhost/return")
            );
        }

        @Test
        @DisplayName("Should throw exception when order status is not pending")
        void shouldThrowExceptionWhenOrderNotPending() {
            testOrder.setStatus(Order.OrderStatus.PAID);
            when(vnPayConfig.isConfigured()).thenReturn(true);
            when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));

            assertThrows(BadRequestException.class, () ->
                    paymentService.createVnPayPayment(100L, "http://localhost/return")
            );
        }

        @Test
        @DisplayName("Should create new payment when none exists")
        void shouldCreateNewPaymentWhenNoneExists() {
            when(vnPayConfig.isConfigured()).thenReturn(true);
            when(vnPayConfig.getTmnCode()).thenReturn(TEST_TMN_CODE);
            when(vnPayConfig.getHashSecret()).thenReturn(TEST_SECRET);
            when(vnPayConfig.getApiUrl()).thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
            when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
            when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
                Payment p = invocation.getArgument(0);
                p.setId(1L);
                return p;
            });

            PaymentUrlResponse response = paymentService.createVnPayPayment(100L, "http://localhost/return");

            assertNotNull(response);
            assertNotNull(response.getPaymentUrl());
            assertTrue(response.getPaymentUrl().contains("vnp_TmnCode=" + TEST_TMN_CODE));
            assertTrue(response.getPaymentUrl().contains("vnp_TxnRef=" + testOrder.getOrderCode()));
            assertTrue(response.getPaymentUrl().contains("vnp_SecureHash"));
        }

        @Test
        @DisplayName("Should reuse existing payment record")
        void shouldReuseExistingPayment() {
            when(vnPayConfig.isConfigured()).thenReturn(true);
            when(vnPayConfig.getTmnCode()).thenReturn(TEST_TMN_CODE);
            when(vnPayConfig.getHashSecret()).thenReturn(TEST_SECRET);
            when(vnPayConfig.getApiUrl()).thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
            when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
            when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(testPayment));

            PaymentUrlResponse response = paymentService.createVnPayPayment(100L, "http://localhost/return");

            assertNotNull(response);
            verify(paymentRepository, never()).save(any(Payment.class));
        }

        @Test
        @DisplayName("Should include correct amount in VND (multiplied by 100)")
        void shouldIncludeCorrectAmount() {
            when(vnPayConfig.isConfigured()).thenReturn(true);
            when(vnPayConfig.getTmnCode()).thenReturn(TEST_TMN_CODE);
            when(vnPayConfig.getHashSecret()).thenReturn(TEST_SECRET);
            when(vnPayConfig.getApiUrl()).thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
            when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
            when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
                Payment p = invocation.getArgument(0);
                p.setId(1L);
                return p;
            });

            PaymentUrlResponse response = paymentService.createVnPayPayment(100L, "http://localhost/return");

            assertTrue(response.getPaymentUrl().contains("vnp_Amount=" + "50000000"));
        }

        @Test
        @DisplayName("Should not send decimal separators in VNPay amount")
        void shouldNotSendDecimalSeparatorsInVnPayAmount() {
            testOrder.setTotalAmount(new BigDecimal("500000.00"));

            when(vnPayConfig.isConfigured()).thenReturn(true);
            when(vnPayConfig.getTmnCode()).thenReturn(TEST_TMN_CODE);
            when(vnPayConfig.getHashSecret()).thenReturn(TEST_SECRET);
            when(vnPayConfig.getApiUrl()).thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
            when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));
            when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> {
                Payment p = invocation.getArgument(0);
                p.setId(1L);
                return p;
            });

            PaymentUrlResponse response = paymentService.createVnPayPayment(100L, "http://localhost/return");

            assertTrue(response.getPaymentUrl().contains("vnp_Amount=50000000"));
            assertFalse(response.getPaymentUrl().contains("vnp_Amount=50000000.00"));
        }
    }

    // ==================== Handle VNPay Return Tests ====================

    @Nested
    @DisplayName("Handle VNPay Return")
    class HandleVnPayReturnTests {

        private Map<String, String> createSuccessParams(String txnRef, String responseCode) {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", txnRef);
            params.put("vnp_ResponseCode", responseCode);
            params.put("vnp_Amount", "50000000");
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_OrderInfo", "Test");
            params.put("vnp_TransactionNo", "12345");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, TEST_SECRET);
            params.put("vnp_SecureHash", secureHash);
            params.put("vnp_SecureHashType", "SHA512");

            return params;
        }

        @Test
        @DisplayName("Should throw exception for invalid secure hash")
        void shouldThrowExceptionForInvalidSecureHash() {
            setupVnPayConfigMock();
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", "ORD-001");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_SecureHash", "invalid_hash");

            assertThrows(BadRequestException.class, () ->
                    paymentService.handleVnPayReturn(params)
            );
        }

        @Test
        @DisplayName("Should throw exception when payment not found")
        void shouldThrowExceptionWhenPaymentNotFound() {
            setupVnPayConfigMock();
            Map<String, String> params = createSuccessParams("NONEXISTENT-ORDER", "00");

            when(paymentRepository.findByVnpTxnRef("NONEXISTENT-ORDER")).thenReturn(Optional.empty());

            assertThrows(BadRequestException.class, () ->
                    paymentService.handleVnPayReturn(params)
            );
        }

        @Test
        @DisplayName("Should update payment to SUCCESS when response code is 00")
        void shouldUpdatePaymentToSuccessWhenResponseCode00() {
            setupVnPayConfigMock();
            Map<String, String> params = createSuccessParams("ORD-2026-001", "00");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
            when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

            PaymentResponse response = paymentService.handleVnPayReturn(params);

            assertNotNull(response);
            assertEquals("SUCCESS", response.getStatus());
            verify(orderRepository).save(any(Order.class));
        }

        @Test
        @DisplayName("Should update order status to PAID on successful payment")
        void shouldUpdateOrderStatusToPaidOnSuccess() {
            setupVnPayConfigMock();
            Map<String, String> params = createSuccessParams("ORD-2026-001", "00");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
            when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

            paymentService.handleVnPayReturn(params);

            ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
            verify(orderRepository).save(orderCaptor.capture());
            assertEquals(Order.OrderStatus.PAID, orderCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("Should update payment to FAILED when response code is not 00")
        void shouldUpdatePaymentToFailedWhenResponseCodeNot00() {
            setupVnPayConfigMock();
            Map<String, String> params = createSuccessParams("ORD-2026-001", "07");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));
            when(paymentRepository.save(any(Payment.class))).thenReturn(testPayment);

            PaymentResponse response = paymentService.handleVnPayReturn(params);

            assertNotNull(response);
            assertEquals("FAILED", response.getStatus());
        }

        @Test
        @DisplayName("Should store response code in payment record")
        void shouldStoreResponseCodeInPaymentRecord() {
            setupVnPayConfigMock();
            Map<String, String> params = createSuccessParams("ORD-2026-001", "00");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

            paymentService.handleVnPayReturn(params);

            ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(paymentCaptor.capture());
            assertEquals("00", paymentCaptor.getValue().getVnpResponseCode());
            assertEquals(Payment.PaymentStatus.SUCCESS, paymentCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("Should set paidAt timestamp on successful payment")
        void shouldSetPaidAtTimestampOnSuccess() {
            setupVnPayConfigMock();
            Map<String, String> params = createSuccessParams("ORD-2026-001", "00");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

            paymentService.handleVnPayReturn(params);

            ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(paymentCaptor.capture());
            assertNotNull(paymentCaptor.getValue().getPaidAt());
        }
    }

    // ==================== Handle VNPay IPN Tests ====================

    @Nested
    @DisplayName("Handle VNPay IPN")
    class HandleVnPayIpnTests {

        private Map<String, String> createIpnParams(String txnRef, String responseCode) {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", txnRef);
            params.put("vnp_ResponseCode", responseCode);
            params.put("vnp_TransactionNo", "12345");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, TEST_SECRET);
            params.put("vnp_SecureHash", secureHash);
            params.put("vnp_SecureHashType", "SHA512");

            return params;
        }

        @Test
        @DisplayName("Should skip processing when secure hash is invalid")
        void shouldSkipProcessingWhenInvalidSecureHash() {
            setupVnPayConfigMock();
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", "ORD-001");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_SecureHash", "invalid_hash");

            paymentService.handleVnPayIpn(params);

            verify(paymentRepository, never()).save(any(Payment.class));
        }

        @Test
        @DisplayName("Should skip processing when payment not found")
        void shouldSkipProcessingWhenPaymentNotFound() {
            setupVnPayConfigMock();
            Map<String, String> params = createIpnParams("NONEXISTENT", "00");

            when(paymentRepository.findByVnpTxnRef("NONEXISTENT")).thenReturn(Optional.empty());

            paymentService.handleVnPayIpn(params);

            verify(paymentRepository, never()).save(any(Payment.class));
        }

        @Test
        @DisplayName("Should update payment to SUCCESS when IPN response code is 00")
        void shouldUpdatePaymentToSuccessOnIpn() {
            setupVnPayConfigMock();
            Map<String, String> params = createIpnParams("ORD-2026-001", "00");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

            paymentService.handleVnPayIpn(params);

            ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(paymentCaptor.capture());
            assertEquals(Payment.PaymentStatus.SUCCESS, paymentCaptor.getValue().getStatus());
        }

        @Test
        @DisplayName("Should not update already successful payment")
        void shouldNotUpdateAlreadySuccessfulPayment() {
            setupVnPayConfigMock();
            testPayment.setStatus(Payment.PaymentStatus.SUCCESS);
            Map<String, String> params = createIpnParams("ORD-2026-001", "00");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

            paymentService.handleVnPayIpn(params);

            verify(orderRepository, never()).save(any(Order.class));
        }

        @Test
        @DisplayName("Should store IPN request ID")
        void shouldStoreIpnRequestId() {
            setupVnPayConfigMock();
            Map<String, String> params = createIpnParams("ORD-2026-001", "00");
            params.put("vnp_TransactionNo", "54321");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(orderRepository.save(any(Order.class))).thenReturn(testOrder);

            paymentService.handleVnPayIpn(params);

            ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(paymentCaptor.capture());
            assertEquals("54321", paymentCaptor.getValue().getIpnRequestId());
        }
    }

    // ==================== Get Payment By Order ID Tests ====================

    @Nested
    @DisplayName("Get Payment By Order ID")
    class GetPaymentByOrderIdTests {

        @Test
        @DisplayName("Should return payment response when found")
        void shouldReturnPaymentResponseWhenFound() {
            when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(testPayment));

            PaymentResponse response = paymentService.getPaymentByOrderId(100L);

            assertNotNull(response);
            assertEquals(testPayment.getId(), response.getId());
            assertEquals(testPayment.getAmount(), response.getAmount());
            assertEquals("VNPAY", response.getPaymentMethod());
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when payment not found")
        void shouldThrowExceptionWhenPaymentNotFound() {
            when(paymentRepository.findByOrderId(999L)).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () ->
                    paymentService.getPaymentByOrderId(999L)
            );
        }
    }
}
