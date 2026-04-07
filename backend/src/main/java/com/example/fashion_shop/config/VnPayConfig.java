package com.example.fashion_shop.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@Getter
public class VnPayConfig {

    @Value("${vnpay.tmn-code:#{null}}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:#{null}}")
    private String hashSecret;

    @Value("${vnpay.api-url:https://sandbox.vnpayment.vn/paygate/pay}")
    private String apiUrl;

    @Value("${vnpay.return-url:#{null}}")
    private String returnUrl;

    @Value("${vnpay.notify-url:#{null}}")
    private String notifyUrl;

    public boolean isConfigured() {
        return tmnCode != null && !tmnCode.isBlank()
                && hashSecret != null && !hashSecret.isBlank()
                && returnUrl != null && !returnUrl.isBlank()
                && notifyUrl != null && !notifyUrl.isBlank();
    }
}
