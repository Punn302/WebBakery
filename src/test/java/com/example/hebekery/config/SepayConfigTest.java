package com.example.hebekery.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SepayConfigTest {

    @Test
    @DisplayName("generateVietQrUrl sinh đúng định dạng VietQR động qua SePay")
    void testGenerateVietQrUrl() {
        SepayConfig config = new SepayConfig();
        config.setBankCode("MBBank");
        config.setAccountNumber("0987654321");

        String qrUrl = config.generateVietQrUrl("HBK-10023", 280000.0);

        assertNotNull(qrUrl);
        assertTrue(qrUrl.startsWith("https://qr.sepay.vn/img?"));
        assertTrue(qrUrl.contains("bank=MBBank"));
        assertTrue(qrUrl.contains("acc=0987654321"));
        assertTrue(qrUrl.contains("amount=280000"));
        assertTrue(qrUrl.contains("des=HBKHBK10023"));
    }
}
