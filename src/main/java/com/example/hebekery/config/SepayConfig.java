package com.example.hebekery.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "sepay")
public class SepayConfig {

    private String webhookApiKey;
    private String accountNumber;
    private String bankCode;
    private String accountHolder;

    public String getWebhookApiKey() {
        return webhookApiKey;
    }

    public void setWebhookApiKey(String webhookApiKey) {
        this.webhookApiKey = webhookApiKey;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getBankCode() {
        return bankCode;
    }

    public void setBankCode(String bankCode) {
        this.bankCode = bankCode;
    }

    public String getAccountHolder() {
        return accountHolder;
    }

    public void setAccountHolder(String accountHolder) {
        this.accountHolder = accountHolder;
    }

    /**
     * Sinh URL anh VietQR dong qua cong SePay
     */
    public String generateVietQrUrl(String orderId, double amount) {
        long roundedAmount = Math.round(amount);
        String memo = "HBK" + orderId.replaceAll("[^a-zA-Z0-9]", "");
        return String.format(
                "https://qr.sepay.vn/img?bank=%s&acc=%s&template=compact&amount=%d&des=%s",
                bankCode != null && !bankCode.isBlank() ? bankCode : "MBBank",
                accountNumber != null && !accountNumber.isBlank() ? accountNumber : "",
                roundedAmount,
                memo
        );
    }
}
