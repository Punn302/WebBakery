package com.example.hebekery.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonIgnoreProperties(ignoreUnknown = true)
@Schema(description = "Payload nhận từ Webhook đối soát SePay")
public class SepayWebhookPayload {

    @Schema(description = "ID giao dịch nội bộ SePay", example = "1827364")
    private Long id;

    @Schema(description = "Mã ngân hàng", example = "MBBank")
    private String gateway;

    @Schema(description = "Thời gian giao dịch", example = "2026-11-04 22:30:00")
    private String transactionDate;

    @Schema(description = "Số tài khoản nhận", example = "0987654321")
    private String accountNumber;

    @Schema(description = "Mã code giao dịch (nếu có)")
    private String code;

    @Schema(description = "Nội dung chuyển khoản (chứa mã đơn HBK...)", example = "HBK10852 thanh toan")
    private String content;

    @Schema(description = "Loại giao dịch (in / out)", example = "in")
    private String transferType;

    @Schema(description = "Số tiền chuyển khoản", example = "280000")
    private Double transferAmount;

    @Schema(description = "Số dư lũy kế")
    private Double accumulated;

    @Schema(description = "Tài khoản phụ")
    private String subAccount;

    @Schema(description = "Mã tham chiếu ngân hàng (FT...)", example = "FT2630981726")
    private String referenceCode;

    public SepayWebhookPayload() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getGateway() {
        return gateway;
    }

    public void setGateway(String gateway) {
        this.gateway = gateway;
    }

    public String getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(String transactionDate) {
        this.transactionDate = transactionDate;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getTransferType() {
        return transferType;
    }

    public void setTransferType(String transferType) {
        this.transferType = transferType;
    }

    public Double getTransferAmount() {
        return transferAmount;
    }

    public void setTransferAmount(Double transferAmount) {
        this.transferAmount = transferAmount;
    }

    public Double getAccumulated() {
        return accumulated;
    }

    public void setAccumulated(Double accumulated) {
        this.accumulated = accumulated;
    }

    public String getSubAccount() {
        return subAccount;
    }

    public void setSubAccount(String subAccount) {
        this.subAccount = subAccount;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public void setReferenceCode(String referenceCode) {
        this.referenceCode = referenceCode;
    }
}
