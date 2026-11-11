package com.example.hebekery.controller;

import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.LoyaltySummaryResponse;
import com.example.hebekery.dto.LoyaltyTransactionResponse;
import com.example.hebekery.model.User;
import com.example.hebekery.repository.UserRepository;
import com.example.hebekery.service.LoyaltyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loyalty")
@Tag(name = "Customer Loyalty & VVIP Tier", description = "Quản lý điểm thưởng tích lũy, phân hạng VVIP và lịch sử giao dịch Điểm Lành")
public class LoyaltyController {

    private final LoyaltyService loyaltyService;
    private final UserRepository userRepository;

    public LoyaltyController(LoyaltyService loyaltyService, UserRepository userRepository) {
        this.loyaltyService = loyaltyService;
        this.userRepository = userRepository;
    }

    @Operation(summary = "Xem tổng quan Điểm Lành và Hạng thành viên", description = "Lấy số dư điểm thưởng, tỷ lệ tích điểm, tiến độ thăng hạng tiếp theo", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LoyaltySummaryResponse>> getMyLoyaltySummary(Principal principal) {
        User user = userRepository.findByEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        LoyaltySummaryResponse summary = loyaltyService.getLoyaltySummary(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin điểm thưởng thành công", summary));
    }

    @Operation(summary = "Xem lịch sử biến động Điểm Lành", description = "Danh sách các lần tích/tiêu điểm thưởng của người dùng", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping("/transactions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<LoyaltyTransactionResponse>>> getMyTransactions(
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = userRepository.findByEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng"));
        Pageable pageable = PageRequest.of(Math.max(0, page), size);
        Page<LoyaltyTransactionResponse> txPage = loyaltyService.getTransactions(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử giao dịch điểm thành công", txPage));
    }

    @Operation(summary = "Danh sách các hạng thành viên và đặc quyền", description = "Thông tin 4 hạng thành viên VVIP: Mầm Xanh, Hạt Lành, Bánh Mộc, Hebe Diamond")
    @GetMapping("/tiers")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTierPerks() {
        List<Map<String, Object>> tiers = List.of(
                Map.of(
                        "tier", "BRONZE",
                        "name", "Mầm Xanh",
                        "spendThreshold", 0,
                        "earnRate", "1%",
                        "perks", List.of("Tích 1% điểm cho mọi đơn hàng", "Voucher chào mừng 10%", "Hỗ trợ tư vấn Eat Clean")
                ),
                Map.of(
                        "tier", "SILVER",
                        "name", "Hạt Lành",
                        "spendThreshold", 1000000,
                        "earnRate", "2%",
                        "perks", List.of("Tích 2% điểm cho mọi đơn hàng", "Voucher sinh nhật 50.000đ", "Ưu tiên trải nghiệm mẻ bánh mới")
                ),
                Map.of(
                        "tier", "GOLD",
                        "name", "Bánh Mộc",
                        "spendThreshold", 3000000,
                        "earnRate", "3%",
                        "perks", List.of("Tích 3% điểm cho mọi đơn hàng", "Freeship đơn từ 199.000đ", "Tặng quà hộp bánh mới dùng thử")
                ),
                Map.of(
                        "tier", "DIAMOND",
                        "name", "Hebe Diamond",
                        "spendThreshold", 7000000,
                        "earnRate", "5%",
                        "perks", List.of("Tích 5% điểm cao nhất", "Freeship trọn đời", "Trợ lý dinh dưỡng riêng & quà Tết độc quyền")
                )
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách hạng thành viên thành công", tiers));
    }
}
