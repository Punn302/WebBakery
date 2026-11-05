package com.example.hebekery.controller;

import com.example.hebekery.dto.AddressResponse;
import com.example.hebekery.dto.ApiResponse;
import com.example.hebekery.dto.request.AddressRequest;
import com.example.hebekery.model.Address;
import com.example.hebekery.service.AddressService;
import com.example.hebekery.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping({"/api/user/addresses", "/api/addresses"})
@PreAuthorize("isAuthenticated()")
@Tag(name = "Address Book", description = "Quản lý sổ địa chỉ giao hàng của người dùng")
public class AddressController {

    private final AddressService addressService;
    private final UserService userService;

    public AddressController(AddressService addressService, UserService userService) {
        this.addressService = addressService;
        this.userService = userService;
    }

    @Operation(summary = "Lấy danh sách địa chỉ nhận hàng", description = "Danh sách tất cả địa chỉ đã lưu của người dùng hiện tại", security = @SecurityRequirement(name = "BearerAuth"))
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressResponse>>> list() {
        requireLogin();
        List<Address> addresses = addressService.getByUser(userService.getCurrentUser().getId());
        List<AddressResponse> dtos = addresses.stream()
                .map(AddressResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách địa chỉ thành công", dtos));
    }

    @Operation(summary = "Thêm địa chỉ giao hàng mới", description = "Lưu địa chỉ nhận hàng mới vào sổ địa chỉ", security = @SecurityRequirement(name = "BearerAuth"))
    @PostMapping
    public ResponseEntity<ApiResponse<AddressResponse>> create(@Valid @RequestBody AddressRequest request) {
        requireLogin();
        Address saved = addressService.save(userService.getCurrentUser().getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm địa chỉ giao hàng thành công", AddressResponse.from(saved)));
    }

    @Operation(summary = "Cập nhật địa chỉ nhận hàng", description = "Chỉnh sửa thông tin địa chỉ đã có theo ID", security = @SecurityRequirement(name = "BearerAuth"))
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressResponse>> update(
            @Parameter(description = "ID địa chỉ cần sửa") @PathVariable String id,
            @Valid @RequestBody AddressRequest request) {
        requireLogin();
        Address updated = addressService.save(userService.getCurrentUser().getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật địa chỉ thành công", AddressResponse.from(updated)));
    }

    @Operation(summary = "Xóa địa chỉ giao hàng", description = "Xóa một địa chỉ khỏi sổ địa chỉ người dùng", security = @SecurityRequirement(name = "BearerAuth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "ID địa chỉ cần xóa") @PathVariable String id) {
        requireLogin();
        boolean deleted = addressService.delete(userService.getCurrentUser().getId(), id);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.failure("Không tìm thấy địa chỉ cần xóa"));
        }
        return ResponseEntity.ok(ApiResponse.success("Xóa địa chỉ thành công", null));
    }

    private void requireLogin() {
        if (!userService.isLoggedIn() || userService.getCurrentUser() == null) {
            throw new IllegalStateException("Vui lòng đăng nhập để thực hiện thao tác này");
        }
    }
}
