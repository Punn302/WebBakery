package com.example.hebekery.service;

import com.example.hebekery.dto.VoucherCalculationResponse;
import com.example.hebekery.dto.VoucherResponse;
import com.example.hebekery.model.Voucher;
import com.example.hebekery.model.VoucherUsage;
import com.example.hebekery.repository.VoucherRepository;
import com.example.hebekery.repository.VoucherUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherUsageRepository voucherUsageRepository;
    private final DecimalFormat formatter = new DecimalFormat("#,###");

    public VoucherService(VoucherRepository voucherRepository, VoucherUsageRepository voucherUsageRepository) {
        this.voucherRepository = voucherRepository;
        this.voucherUsageRepository = voucherUsageRepository;
    }

    public List<VoucherResponse> getAvailableVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return voucherRepository.findAll().stream()
                .filter(Voucher::isActive)
                .filter(v -> v.getStartDate() == null || !now.isBefore(v.getStartDate()))
                .filter(v -> v.getEndDate() == null || !now.isAfter(v.getEndDate()))
                .filter(v -> v.getUsageLimit() <= 0 || v.getUsedCount() < v.getUsageLimit())
                .map(VoucherResponse::from)
                .collect(Collectors.toList());
    }

    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(VoucherResponse::from)
                .collect(Collectors.toList());
    }

    public VoucherCalculationResponse validateAndCalculate(String code, double orderAmount, String userId) {
        if (code == null || code.trim().isEmpty()) {
            return VoucherCalculationResponse.invalid("Mã giảm giá không được để trống", orderAmount);
        }

        String cleanCode = code.trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCodeIgnoreCaseAndActiveTrue(cleanCode).orElse(null);

        if (voucher == null) {
            return VoucherCalculationResponse.invalid("Mã giảm giá '" + cleanCode + "' không tồn tại hoặc đã bị khóa", orderAmount);
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getStartDate() != null && now.isBefore(voucher.getStartDate())) {
            return VoucherCalculationResponse.invalid("Mã giảm giá chưa đến ngày áp dụng", orderAmount);
        }
        if (voucher.getEndDate() != null && now.isAfter(voucher.getEndDate())) {
            return VoucherCalculationResponse.invalid("Mã giảm giá đã hết hạn sử dụng", orderAmount);
        }

        if (voucher.getUsageLimit() > 0 && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            return VoucherCalculationResponse.invalid("Mã giảm giá đã hết số lượt sử dụng", orderAmount);
        }

        if (orderAmount < voucher.getMinOrderAmount()) {
            String requiredAmount = formatter.format(voucher.getMinOrderAmount()) + "đ";
            return VoucherCalculationResponse.invalid(
                    "Đơn hàng cần đạt tối thiểu " + requiredAmount + " để áp dụng mã '" + cleanCode + "'",
                    orderAmount
            );
        }

        if (userId != null && !userId.isBlank() && voucher.getUserLimit() > 0) {
            long userUsedCount = voucherUsageRepository.countByVoucherIdAndUserId(voucher.getId(), userId);
            if (userUsedCount >= voucher.getUserLimit()) {
                return VoucherCalculationResponse.invalid("Bạn đã đạt giới hạn sử dụng mã này (" + voucher.getUserLimit() + " lần)", orderAmount);
            }
        }

        double discountAmount = 0.0;
        if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
            discountAmount = (orderAmount * voucher.getDiscountValue()) / 100.0;
            if (voucher.getMaxDiscount() != null && voucher.getMaxDiscount() > 0) {
                discountAmount = Math.min(discountAmount, voucher.getMaxDiscount());
            }
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(voucher.getDiscountType()) || "FREE_SHIPPING".equalsIgnoreCase(voucher.getDiscountType())) {
            discountAmount = Math.min(voucher.getDiscountValue(), orderAmount);
        }

        discountAmount = Math.round(discountAmount);
        double finalAmount = Math.max(0.0, orderAmount - discountAmount);

        return new VoucherCalculationResponse(
                true,
                "Áp dụng mã giảm giá thành công! Giảm " + formatter.format(discountAmount) + "đ",
                cleanCode,
                voucher.getDiscountType(),
                discountAmount,
                finalAmount
        );
    }

    @Transactional
    public void recordUsage(String voucherCode, String userId, String orderId) {
        if (voucherCode == null || voucherCode.isBlank()) return;
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(voucherCode.trim()).orElse(null);
        if (voucher != null) {
            voucher.setUsedCount(voucher.getUsedCount() + 1);
            voucherRepository.save(voucher);

            VoucherUsage usage = new VoucherUsage(
                    UUID.randomUUID().toString(),
                    voucher.getId(),
                    userId != null ? userId : "GUEST",
                    orderId
            );
            voucherUsageRepository.save(usage);
        }
    }

    @Transactional
    public Voucher createVoucher(Voucher voucher) {
        if (voucher.getId() == null || voucher.getId().isBlank()) {
            voucher.setId(UUID.randomUUID().toString());
        }
        voucher.setCode(voucher.getCode().trim().toUpperCase());
        return voucherRepository.save(voucher);
    }

    @Transactional
    public Voucher updateVoucher(String id, Voucher req) {
        Voucher existing = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy voucher ID: " + id));

        existing.setCode(req.getCode().trim().toUpperCase());
        existing.setDiscountType(req.getDiscountType());
        existing.setDiscountValue(req.getDiscountValue());
        existing.setMaxDiscount(req.getMaxDiscount());
        existing.setMinOrderAmount(req.getMinOrderAmount());
        existing.setUsageLimit(req.getUsageLimit());
        existing.setUserLimit(req.getUserLimit());
        existing.setStartDate(req.getStartDate());
        existing.setEndDate(req.getEndDate());
        existing.setActive(req.isActive());

        return voucherRepository.save(existing);
    }

    @Transactional
    public void deleteVoucher(String id) {
        voucherRepository.deleteById(id);
    }
}
