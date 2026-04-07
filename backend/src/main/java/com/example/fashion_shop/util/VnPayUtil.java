package com.example.fashion_shop.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public class VnPayUtil {

    /**
     * Generate HMAC SHA512 hash
     */
    public static String hmacSHA512(String data, String key) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, 0, hmacKeyBytes.length, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error generating HMAC SHA512", e);
        }
    }

    /**
     * Build query string from map
     */
    public static String buildQueryString(Map<String, String> fields) {
        return fields.entrySet().stream()
                .filter(entry -> entry.getValue() != null && !entry.getValue().isBlank())
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    /**
     * Format amount for VNPay (minor unit, integer only)
     */
    public static String formatAmount(BigDecimal amount) {
        Objects.requireNonNull(amount, "amount must not be null");
        return amount.movePointRight(2)
                .setScale(0, RoundingMode.HALF_UP)
                .toPlainString();
    }

    private static String encode(String value) {
        // VNPay Java integration expects standard URLEncoder behavior, including `+` for spaces.
        return URLEncoder.encode(value, StandardCharsets.US_ASCII);
    }

    /**
     * Get safe parameter from map
     */
    public static String getParam(Map<String, String> m, String key) {
        if (m == null || key == null) {
            return null;
        }
        Object v = m.get(key);
        if (v == null) {
            return null;
        }
        return v.toString();
    }
}
