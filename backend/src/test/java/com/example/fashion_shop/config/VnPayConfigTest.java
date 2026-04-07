package com.example.fashion_shop.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("VnPayConfig - VNPay Configuration Tests")
class VnPayConfigTest {

    private VnPayConfig vnPayConfig;

    @BeforeEach
    void setUp() {
        vnPayConfig = new VnPayConfig();
    }

    private void setFields(String tmnCode, String hashSecret, String apiUrl, String returnUrl, String notifyUrl) {
        ReflectionTestUtils.setField(vnPayConfig, "tmnCode", tmnCode);
        ReflectionTestUtils.setField(vnPayConfig, "hashSecret", hashSecret);
        ReflectionTestUtils.setField(vnPayConfig, "apiUrl", apiUrl);
        ReflectionTestUtils.setField(vnPayConfig, "returnUrl", returnUrl);
        ReflectionTestUtils.setField(vnPayConfig, "notifyUrl", notifyUrl);
    }

    // ==================== isConfigured Tests ====================

    @Nested
    @DisplayName("isConfigured")
    class IsConfiguredTests {

        @Test
        @DisplayName("Should return true when all required fields are set")
        void shouldReturnTrueWhenAllFieldsSet() {
            setFields("TEST_TMN", "TEST_SECRET", "https://api.vnpay.vn", "http://localhost/return", "http://localhost/ipn");

            assertTrue(vnPayConfig.isConfigured());
        }

        @Test
        @DisplayName("Should return false when tmnCode is null")
        void shouldReturnFalseWhenTmnCodeNull() {
            setFields(null, "TEST_SECRET", "https://api.vnpay.vn", "http://localhost/return", "http://localhost/ipn");

            assertFalse(vnPayConfig.isConfigured());
        }

        @Test
        @DisplayName("Should return false when hashSecret is null")
        void shouldReturnFalseWhenHashSecretNull() {
            setFields("TEST_TMN", null, "https://api.vnpay.vn", "http://localhost/return", "http://localhost/ipn");

            assertFalse(vnPayConfig.isConfigured());
        }

        @Test
        @DisplayName("Should return false when returnUrl is null")
        void shouldReturnFalseWhenReturnUrlNull() {
            setFields("TEST_TMN", "TEST_SECRET", "https://api.vnpay.vn", null, "http://localhost/ipn");

            assertFalse(vnPayConfig.isConfigured());
        }

        @Test
        @DisplayName("Should return false when notifyUrl is null")
        void shouldReturnFalseWhenNotifyUrlNull() {
            setFields("TEST_TMN", "TEST_SECRET", "https://api.vnpay.vn", "http://localhost/return", null);

            assertFalse(vnPayConfig.isConfigured());
        }

        @Test
        @DisplayName("Should return false when all fields are null")
        void shouldReturnFalseWhenAllFieldsNull() {
            setFields(null, null, null, null, null);

            assertFalse(vnPayConfig.isConfigured());
        }

        @Test
        @DisplayName("Should return false when tmnCode is empty string")
        void shouldReturnFalseWhenTmnCodeEmpty() {
            setFields("", "TEST_SECRET", "https://api.vnpay.vn", "http://localhost/return", "http://localhost/ipn");

            assertFalse(vnPayConfig.isConfigured());
        }

        @Test
        @DisplayName("Should return false when hashSecret is empty string")
        void shouldReturnFalseWhenHashSecretEmpty() {
            setFields("TEST_TMN", "", "https://api.vnpay.vn", "http://localhost/return", "http://localhost/ipn");

            assertFalse(vnPayConfig.isConfigured());
        }
    }

    // ==================== Getter Tests ====================

    @Nested
    @DisplayName("Getters")
    class GetterTests {

        @Test
        @DisplayName("Should return correct tmnCode")
        void shouldReturnCorrectTmnCode() {
            ReflectionTestUtils.setField(vnPayConfig, "tmnCode", "9NIRGDUZ");

            assertEquals("9NIRGDUZ", vnPayConfig.getTmnCode());
        }

        @Test
        @DisplayName("Should return correct hashSecret")
        void shouldReturnCorrectHashSecret() {
            ReflectionTestUtils.setField(vnPayConfig, "hashSecret", "TEST_HASH_SECRET_32_CHARS_LONG_123");

            assertEquals("TEST_HASH_SECRET_32_CHARS_LONG_123", vnPayConfig.getHashSecret());
        }

        @Test
        @DisplayName("Should return correct apiUrl")
        void shouldReturnCorrectApiUrl() {
            ReflectionTestUtils.setField(vnPayConfig, "apiUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");

            assertEquals("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", vnPayConfig.getApiUrl());
        }

        @Test
        @DisplayName("Should return correct returnUrl")
        void shouldReturnCorrectReturnUrl() {
            ReflectionTestUtils.setField(vnPayConfig, "returnUrl", "http://localhost:3000/payment-result");

            assertEquals("http://localhost:3000/payment-result", vnPayConfig.getReturnUrl());
        }

        @Test
        @DisplayName("Should return correct notifyUrl")
        void shouldReturnCorrectNotifyUrl() {
            ReflectionTestUtils.setField(vnPayConfig, "notifyUrl", "http://localhost:8080/api/payment/vnpay/ipn");

            assertEquals("http://localhost:8080/api/payment/vnpay/ipn", vnPayConfig.getNotifyUrl());
        }
    }

    // ==================== Default API URL Tests ====================

    @Nested
    @DisplayName("Default API URL")
    class DefaultApiUrlTests {

        @Test
        @DisplayName("Should use sandbox URL as default")
        void shouldUseSandboxUrlAsDefault() {
            ReflectionTestUtils.setField(vnPayConfig, "apiUrl", "https://sandbox.vnpayment.vn/paygate/pay");

            assertEquals("https://sandbox.vnpayment.vn/paygate/pay", vnPayConfig.getApiUrl());
        }
    }

    // ==================== Sandbox Configuration Tests ====================

    @Nested
    @DisplayName("Sandbox Configuration")
    class SandboxConfigurationTests {

        @Test
        @DisplayName("Should be configured with sandbox credentials")
        void shouldBeConfiguredWithSandboxCredentials() {
            setFields("TEST_TMN_CODE", "TEST_HASH_SECRET_32_CHARS_LONG_123",
                    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
                    "http://localhost:3000/payment-result",
                    "http://localhost:8080/api/payment/vnpay/ipn");

            assertTrue(vnPayConfig.isConfigured());
            assertEquals("TEST_TMN_CODE", vnPayConfig.getTmnCode());
            assertTrue(vnPayConfig.getApiUrl().contains("sandbox"));
        }

        @Test
        @DisplayName("Should handle production URL")
        void shouldHandleProductionUrl() {
            setFields("PROD_TMN", "PROD_SECRET",
                    "https://vnpayment.vn/paymentv2/vpcpay.html",
                    "https://myshop.com/payment-result",
                    "https://myshop.com/api/payment/vnpay/ipn");

            assertTrue(vnPayConfig.isConfigured());
            assertFalse(vnPayConfig.getApiUrl().contains("sandbox"));
        }
    }
}
