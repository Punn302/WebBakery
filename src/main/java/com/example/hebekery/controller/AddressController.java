package com.example.hebekery.controller;

import com.example.hebekery.dto.request.AddressRequest;
import com.example.hebekery.service.AddressService;
import com.example.hebekery.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AddressController {
    private final AddressService addressService;
    private final UserService userService;

    public AddressController(AddressService addressService, UserService userService) {
        this.addressService = addressService;
        this.userService = userService;
    }

    @GetMapping("/api/user/addresses")
    public Map<String, Object> list() {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("addresses", addressService.getByUser(userService.getCurrentUser().getId()));
        return response;
    }

    @PostMapping("/api/user/addresses")
    public Map<String, Object> create(@Valid @RequestBody AddressRequest request) {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("address", addressService.save(userService.getCurrentUser().getId(), request));
        return response;
    }

    @PutMapping("/api/user/addresses/{id}")
    public Map<String, Object> update(@PathVariable String id, @Valid @RequestBody AddressRequest request) {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("address", addressService.save(userService.getCurrentUser().getId(), id, request));
        return response;
    }

    @DeleteMapping("/api/user/addresses/{id}")
    public Map<String, Object> delete(@PathVariable String id) {
        requireLogin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", addressService.delete(userService.getCurrentUser().getId(), id));
        return response;
    }

    private void requireLogin() {
        if (!userService.isLoggedIn()) {
            throw new IllegalStateException("Vui lòng đăng nhập");
        }
    }
}
