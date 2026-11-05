package com.example.hebekery.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class SyncCartRequest {

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
