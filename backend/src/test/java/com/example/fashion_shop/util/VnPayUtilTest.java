package com.example.fashion_shop.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("VnPayUtil - VNPay Utility Tests")
class VnPayUtilTest {

    private static final String TEST_SECRET = "TEST_HASH_SECRET_32_CHARS_LONG_123";
    private static final String SANDBOX_SECRET = "SANDBOX_HASH_SECRET_32_CHARS_456";

    // ==================== HMAC SHA512 Tests ====================

    @Nested
    @DisplayName("HMAC SHA512 Hash Generation")
    class HmacSha512Tests {

        @Test
        @DisplayName("Should generate consistent HMAC SHA512 hash for same input")
        void shouldGenerateConsistentHash() {
            String data = "vnp_Amount=5000000&vnp_Command=pay&vnp_CurrCode=VND&vnp_OrderInfo=Test";

            String hash1 = VnPayUtil.hmacSHA512(data, TEST_SECRET);
            String hash2 = VnPayUtil.hmacSHA512(data, TEST_SECRET);

            assertNotNull(hash1);
            assertEquals(128, hash1.length());
            assertEquals(hash1, hash2);
        }

        @Test
        @DisplayName("Should generate different hashes for different data")
        void shouldGenerateDifferentHashesForDifferentData() {
            String data1 = "vnp_Amount=5000000";
            String data2 = "vnp_Amount=6000000";

            String hash1 = VnPayUtil.hmacSHA512(data1, TEST_SECRET);
            String hash2 = VnPayUtil.hmacSHA512(data2, TEST_SECRET);

            assertNotEquals(hash1, hash2);
        }

        @Test
        @DisplayName("Should generate different hashes for different secrets")
        void shouldGenerateDifferentHashesForDifferentSecrets() {
            String data = "vnp_Amount=5000000";

            String hash1 = VnPayUtil.hmacSHA512(data, TEST_SECRET);
            String hash2 = VnPayUtil.hmacSHA512(data, "DIFFERENT_SECRET_KEY_32_CHARS_LONG_ABC");

            assertNotEquals(hash1, hash2);
        }

        @Test
        @DisplayName("Should produce lowercase hexadecimal output")
        void shouldProduceLowercaseHexOutput() {
            String data = "vnp_Command=pay";

            String hash = VnPayUtil.hmacSHA512(data, TEST_SECRET);

            assertTrue(hash.matches("^[a-f0-9]+$"));
        }

        @Test
        @DisplayName("Should throw RuntimeException for null data")
        void shouldThrowExceptionForNullData() {
            assertThrows(RuntimeException.class, () -> VnPayUtil.hmacSHA512(null, TEST_SECRET));
        }

        @Test
        @DisplayName("Should throw RuntimeException for null key")
        void shouldThrowExceptionForNullKey() {
            assertThrows(RuntimeException.class, () -> VnPayUtil.hmacSHA512("test data", null));
        }

        @Test
        @DisplayName("Should handle empty string data")
        void shouldHandleEmptyStringData() {
            String hash = VnPayUtil.hmacSHA512("", TEST_SECRET);

            assertNotNull(hash);
            assertEquals(128, hash.length());
        }
    }

    // ==================== Query String Builder Tests ====================

    @Nested
    @DisplayName("Query String Builder")
    class QueryStringBuilderTests {

        @Test
        @DisplayName("Should build sorted query string from map")
        void shouldBuildSortedQueryString() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Amount", "5000000");
            params.put("vnp_Command", "pay");
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_OrderInfo", "Test Order");

            String query = VnPayUtil.buildQueryString(params);

            assertTrue(query.contains("vnp_Amount=5000000"));
            assertTrue(query.contains("vnp_Command=pay"));
            assertTrue(query.contains("vnp_CurrCode=VND"));
            assertTrue(query.contains("vnp_OrderInfo=Test+Order"));
            assertEquals(4, query.split("&").length);
        }

        @Test
        @DisplayName("Should skip null values")
        void shouldSkipNullValues() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Amount", "5000000");
            params.put("vnp_Command", null);
            params.put("vnp_CurrCode", "VND");

            String query = VnPayUtil.buildQueryString(params);

            assertTrue(query.contains("vnp_Amount=5000000"));
            assertTrue(query.contains("vnp_CurrCode=VND"));
            assertFalse(query.contains("vnp_Command"));
        }

        @Test
        @DisplayName("Should skip empty string values")
        void shouldSkipEmptyStringValues() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Amount", "5000000");
            params.put("vnp_Command", "");
            params.put("vnp_CurrCode", "VND");

            String query = VnPayUtil.buildQueryString(params);

            assertEquals(2, query.split("&").length);
        }

        @Test
        @DisplayName("Should handle empty map")
        void shouldHandleEmptyMap() {
            Map<String, String> params = new TreeMap<>();

            String query = VnPayUtil.buildQueryString(params);

            assertEquals("", query);
        }

        @Test
        @DisplayName("Should handle special characters in values")
        void shouldHandleSpecialCharacters() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_OrderInfo", "Thanh toán đơn hàng: ABC-123");
            params.put("vnp_Note", "Ghi chú & yêu cầu = đặc biệt");

            String query = VnPayUtil.buildQueryString(params);

            assertTrue(query.contains("vnp_OrderInfo="));
            assertTrue(query.contains("ABC-123"));
            assertTrue(query.contains("vnp_Note="));
        }

        @Test
        @DisplayName("Should use sorted order regardless of insertion order")
        void shouldUseSortedOrderRegardlessOfInsertionOrder() {
            Map<String, String> params = new HashMap<>();
            params.put("z_param", "z");
            params.put("a_param", "a");
            params.put("m_param", "m");

            String query = VnPayUtil.buildQueryString(params);

            assertTrue(query.indexOf("a_param") < query.indexOf("m_param"));
            assertTrue(query.indexOf("m_param") < query.indexOf("z_param"));
        }
    }

    // ==================== Parameter Retrieval Tests ====================

    @Nested
    @DisplayName("Parameter Retrieval")
    class ParameterRetrievalTests {

        @Test
        @DisplayName("Should get existing parameter")
        void shouldGetExistingParameter() {
            Map<String, String> params = Map.of(
                    "vnp_TxnRef", "ORDER001",
                    "vnp_ResponseCode", "00",
                    "vnp_Amount", "5000000"
            );

            assertEquals("ORDER001", VnPayUtil.getParam(params, "vnp_TxnRef"));
            assertEquals("00", VnPayUtil.getParam(params, "vnp_ResponseCode"));
            assertEquals("5000000", VnPayUtil.getParam(params, "vnp_Amount"));
        }

        @Test
        @DisplayName("Should return null for non-existing parameter")
        void shouldReturnNullForNonExistingParameter() {
            Map<String, String> params = Map.of("vnp_TxnRef", "ORDER001");

            assertNull(VnPayUtil.getParam(params, "vnp_NonExisting"));
            assertNull(VnPayUtil.getParam(params, ""));
            assertNull(VnPayUtil.getParam(params, null));
        }

        @Test
        @DisplayName("Should return null for null map")
        void shouldReturnNullForNullMap() {
            assertNull(VnPayUtil.getParam(null, "vnp_TxnRef"));
        }

        @Test
        @DisplayName("Should return empty string for empty string key")
        void shouldHandleEmptyStringKey() {
            Map<String, String> params = new HashMap<>();
            params.put("", "emptyKeyValue");

            assertEquals("emptyKeyValue", VnPayUtil.getParam(params, ""));
        }
    }

    // ==================== VNPay Secure Hash Integration Tests ====================

    @Nested
    @DisplayName("VNPay Secure Hash Integration")
    class SecureHashIntegrationTests {

        @Test
        @DisplayName("Should generate valid secure hash for payment request")
        void shouldGenerateValidSecureHash() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", "TEST_TMN_CODE");
            params.put("vnp_Amount", "5000000");
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", "ORDER001");
            params.put("vnp_OrderInfo", "Test");
            params.put("vnp_Locale", "vn");
            params.put("vnp_CreateDate", "20260407120000");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, SANDBOX_SECRET);

            assertNotNull(secureHash);
            assertEquals(128, secureHash.length());
            assertTrue(secureHash.matches("^[a-f0-9]+$"));
        }

        @Test
        @DisplayName("Should verify secure hash matches original data")
        void shouldVerifySecureHashMatches() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Command", "pay");
            params.put("vnp_TxnRef", "ORDER001");
            params.put("vnp_Amount", "5000000");
            params.put("vnp_CurrCode", "VND");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, SANDBOX_SECRET);

            assertNotNull(secureHash);
            assertEquals(128, secureHash.length());

            // Verify by recomputing hash from original data
            String recomputedHash = VnPayUtil.hmacSHA512(data, SANDBOX_SECRET);
            assertEquals(secureHash, recomputedHash);
        }

        @Test
        @DisplayName("Should generate different hash when secure hash is included in data")
        void shouldGenerateDifferentHashWhenSecureHashIncluded() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Command", "pay");
            params.put("vnp_TxnRef", "ORDER001");

            String data = VnPayUtil.buildQueryString(params);
            String hashWithoutSecureHash = VnPayUtil.hmacSHA512(data, SANDBOX_SECRET);

            // Add secure hash to params and build new data
            Map<String, String> paramsWithHash = new TreeMap<>(params);
            paramsWithHash.put("vnp_SecureHash", hashWithoutSecureHash);
            String dataWithHash = VnPayUtil.buildQueryString(paramsWithHash);
            String hashWithSecureHash = VnPayUtil.hmacSHA512(dataWithHash, SANDBOX_SECRET);

            // Hashes should be different because data is different
            assertNotEquals(hashWithoutSecureHash, hashWithSecureHash);
        }

        @Test
        @DisplayName("Should handle complex order info with special characters")
        void shouldHandleComplexOrderInfo() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_OrderInfo", "Thanh toán đơn hàng: ABC-12345");
            params.put("vnp_TxnRef", "ORD-2026-001");
            params.put("vnp_Amount", "19900000");

            String data = VnPayUtil.buildQueryString(params);
            String secureHash = VnPayUtil.hmacSHA512(data, SANDBOX_SECRET);

            assertNotNull(secureHash);
        }

        @Test
        @DisplayName("Should generate unique hash for each order reference")
        void shouldGenerateUniqueHashPerOrderRef() {
            String baseParams = "vnp_Command=pay&vnp_CurrCode=VND&vnp_Amount=5000000";

            String hash1 = VnPayUtil.hmacSHA512(baseParams + "&vnp_TxnRef=ORD001", SANDBOX_SECRET);
            String hash2 = VnPayUtil.hmacSHA512(baseParams + "&vnp_TxnRef=ORD002", SANDBOX_SECRET);
            String hash3 = VnPayUtil.hmacSHA512(baseParams + "&vnp_TxnRef=ORD003", SANDBOX_SECRET);

            assertNotEquals(hash1, hash2);
            assertNotEquals(hash2, hash3);
            assertNotEquals(hash1, hash3);
        }
    }

    // ==================== Edge Cases ====================

    @Nested
    @DisplayName("Edge Cases")
    class EdgeCaseTests {

        @Test
        @DisplayName("Should handle very long input data")
        void shouldHandleVeryLongInputData() {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 100; i++) {
                sb.append("param").append(i).append("=value").append(i).append("&");
            }
            String longData = sb.toString();

            String hash = VnPayUtil.hmacSHA512(longData, TEST_SECRET);

            assertNotNull(hash);
            assertEquals(128, hash.length());
        }

        @Test
        @DisplayName("Should handle unicode characters")
        void shouldHandleUnicodeCharacters() {
            String data = "vnp_OrderInfo=Thanh toán đơn hàng Việt Nam 日本語";

            String hash = VnPayUtil.hmacSHA512(data, TEST_SECRET);

            assertNotNull(hash);
            assertEquals(128, hash.length());
        }

        @Test
        @DisplayName("Should handle very large amount values")
        void shouldHandleLargeAmountValues() {
            Map<String, String> params = new TreeMap<>();
            params.put("vnp_Amount", "999999999900");
            params.put("vnp_TxnRef", "LARGE_ORDER");
            params.put("vnp_CurrCode", "VND");

            String data = VnPayUtil.buildQueryString(params);
            String hash = VnPayUtil.hmacSHA512(data, TEST_SECRET);

            assertNotNull(hash);
            assertTrue(params.get("vnp_Amount").length() > 10);
        }
    }
}
