package com.example.fashion_shop.controller;

import com.example.fashion_shop.config.VnPayConfig;
import com.example.fashion_shop.dto.response.PaymentResponse;
import com.example.fashion_shop.dto.response.PaymentUrlResponse;
import com.example.fashion_shop.entity.Order;
import com.example.fashion_shop.entity.Payment;
import com.example.fashion_shop.entity.User;
import com.example.fashion_shop.repository.OrderRepository;
import com.example.fashion_shop.repository.PaymentRepository;
import com.example.fashion_shop.util.VnPayUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("PaymentController - Payment Controller Integration Tests")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PaymentRepository paymentRepository;

    @MockitoBean
    private OrderRepository orderRepository;

    @MockitoBean
    private VnPayConfig vnPayConfig;

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
                .password("password")
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

    // ==================== Create VNPay Payment Tests ====================

    @Nested
    @DisplayName("Create VNPay Payment Endpoint")
    class CreateVnPayPaymentTests {

        @Test
        @DisplayName("Should return 401 when not authenticated")
        void shouldReturn401WhenNotAuthenticated() throws Exception {
            mockMvc.perform(post("/api/payments/vnpay/create")
                            .param("orderId", "100")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("Should return 404 when order not found")
        void shouldReturn404WhenOrderNotFound() throws Exception {
            when(vnPayConfig.isConfigured()).thenReturn(true);
            when(orderRepository.findById(999L)).thenReturn(Optional.empty());

            mockMvc.perform(post("/api/payments/vnpay/create")
                            .header("Authorization", "Bearer valid-token")
                            .param("orderId", "999")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("Should return 400 when order status is not pending")
        void shouldReturn400WhenOrderNotPending() throws Exception {
            testOrder.setStatus(Order.OrderStatus.PAID);
            when(vnPayConfig.isConfigured()).thenReturn(true);
            when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));

            mockMvc.perform(post("/api/payments/vnpay/create")
                            .header("Authorization", "Bearer valid-token")
                            .param("orderId", "100")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("Should return 400 when VNPay is not configured")
        void shouldReturn400WhenVnpayNotConfigured() throws Exception {
            when(vnPayConfig.isConfigured()).thenReturn(false);
            when(orderRepository.findById(100L)).thenReturn(Optional.of(testOrder));

            mockMvc.perform(post("/api/payments/vnpay/create")
                            .header("Authorization", "Bearer valid-token")
                            .param("orderId", "100")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== VNPay Return Tests ====================

    @Nested
    @DisplayName("VNPay Return Endpoint")
    class VnPayReturnTests {

        @Test
        @DisplayName("Should return payment result for successful payment")
        void shouldReturnPaymentResultForSuccess() throws Exception {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", "ORD-2026-001");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_Amount", "50000000");
            params.put("vnp_CurrCode", "VND");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, TEST_SECRET);
            params.put("vnp_SecureHash", secureHash);

            testPayment.setStatus(Payment.PaymentStatus.SUCCESS);
            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));

            StringBuilder queryString = new StringBuilder("?");
            params.forEach((key, value) -> queryString.append(key).append("=").append(value).append("&"));

            mockMvc.perform(get("/api/payments/vnpay/return" + queryString.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.message").value("Payment successful"));
        }

        @Test
        @DisplayName("Should return payment failed result")
        void shouldReturnPaymentFailedResult() throws Exception {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", "ORD-2026-001");
            params.put("vnp_ResponseCode", "07");
            params.put("vnp_Amount", "50000000");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, TEST_SECRET);
            params.put("vnp_SecureHash", secureHash);

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));

            StringBuilder queryString = new StringBuilder("?");
            params.forEach((key, value) -> queryString.append(key).append("=").append(value).append("&"));

            mockMvc.perform(get("/api/payments/vnpay/return" + queryString.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.message").value("Payment failed"));
        }

        @Test
        @DisplayName("Should return 400 for invalid secure hash")
        void shouldReturn400ForInvalidHash() throws Exception {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", "ORD-2026-001");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_SecureHash", "invalid_hash");

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));

            StringBuilder queryString = new StringBuilder("?");
            params.forEach((key, value) -> queryString.append(key).append("=").append(value).append("&"));

            mockMvc.perform(get("/api/payments/vnpay/return" + queryString.toString()))
                    .andExpect(status().isBadRequest());
        }
    }

    // ==================== VNPay IPN Tests ====================

    @Nested
    @DisplayName("VNPay IPN Endpoint")
    class VnPayIpnTests {

        @Test
        @DisplayName("Should return 00 RspCode for successful IPN processing")
        void shouldReturnSuccessForSuccessfulIpn() throws Exception {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", "ORD-2026-001");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_TransactionNo", "12345");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, TEST_SECRET);
            params.put("vnp_SecureHash", secureHash);

            when(paymentRepository.findByVnpTxnRef("ORD-2026-001")).thenReturn(Optional.of(testPayment));

            MultiValueMap<String, String> multiParams = new LinkedMultiValueMap<>();
            params.forEach(multiParams::add);

            mockMvc.perform(post("/api/payments/vnpay/ipn")
                            .params(multiParams)
                            .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.RspCode").value("00"))
                    .andExpect(jsonPath("$.Message").value("Confirm received"));
        }

        @Test
        @DisplayName("Should return 01 RspCode for failed IPN processing")
        void shouldReturnErrorForFailedIpn() throws Exception {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", "ORD-2026-001");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_SecureHash", "invalid_hash");

            MultiValueMap<String, String> multiParams = new LinkedMultiValueMap<>();
            params.forEach(multiParams::add);

            mockMvc.perform(post("/api/payments/vnpay/ipn")
                            .params(multiParams)
                            .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.RspCode").value("01"))
                    .andExpect(jsonPath("$.Message").value("Error processing payment"));
        }

        @Test
        @DisplayName("Should return 01 RspCode when payment not found")
        void shouldReturnErrorWhenPaymentNotFound() throws Exception {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_TxnRef", "NONEXISTENT");
            params.put("vnp_ResponseCode", "00");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, TEST_SECRET);
            params.put("vnp_SecureHash", secureHash);

            when(paymentRepository.findByVnpTxnRef("NONEXISTENT")).thenReturn(Optional.empty());

            MultiValueMap<String, String> multiParams = new LinkedMultiValueMap<>();
            params.forEach(multiParams::add);

            mockMvc.perform(post("/api/payments/vnpay/ipn")
                            .params(multiParams)
                            .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.RspCode").value("01"));
        }
    }

    // ==================== Get Payment By Order ID Tests ====================

    @Nested
    @DisplayName("Get Payment By Order ID Endpoint")
    class GetPaymentByOrderIdTests {

        @Test
        @DisplayName("Should return payment details for valid order ID")
        void shouldReturnPaymentDetailsForValidOrderId() throws Exception {
            when(paymentRepository.findByOrderId(100L)).thenReturn(Optional.of(testPayment));

            mockMvc.perform(get("/api/payments/order/100")
                            .header("Authorization", "Bearer valid-token"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.success").value(true))
                    .andExpect(jsonPath("$.data.id").value(1));
        }

        @Test
        @DisplayName("Should return 404 when payment not found")
        void shouldReturn404WhenPaymentNotFound() throws Exception {
            when(paymentRepository.findByOrderId(999L)).thenReturn(Optional.empty());

            mockMvc.perform(get("/api/payments/order/999")
                            .header("Authorization", "Bearer valid-token"))
                    .andExpect(status().isNotFound());
        }
    }
}