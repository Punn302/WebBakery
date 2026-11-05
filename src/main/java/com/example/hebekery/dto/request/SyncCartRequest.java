package com.example.hebekery.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

@Schema(description = "Yêu cầu đồng bộ giỏ hàng từ LocalStorage khi đăng nhập")
public class SyncCartRequest {

    @Schema(description = "Danh sách các mặt hàng lưu tạm dưới client")
    @NotNull(message = "Danh sách sản phẩm không được null")
    @Valid
    private List<SyncCartItemDto> items = new ArrayList<>();

    public SyncCartRequest() {
    }

    public SyncCartRequest(List<SyncCartItemDto> items) {
        this.items = items;
    }

    public List<SyncCartItemDto> getItems() {
        return items;
    }

    public void setItems(List<SyncCartItemDto> items) {
        this.items = items;
    }
}
