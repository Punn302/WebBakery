package com.example.hebekery.controller;

import com.example.hebekery.model.Product;
import com.example.hebekery.service.ProductService;
import org.springframework.stereotype.Controller;
import org.springframework.web.util.UriUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/search")
    public String searchProducts(@RequestParam(required = false) String keyword) {
        String encodedKeyword = UriUtils.encodeQueryParam(keyword == null ? "" : keyword, StandardCharsets.UTF_8);
        return "redirect:/products?keyword=" + encodedKeyword;
    }

    @GetMapping("/api/search")
    @ResponseBody
    public Map<String, Object> quickSearch(@RequestParam(required = false) String keyword) {
        List<Product> results = productService.searchProducts(keyword);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("keyword", keyword);
        response.put("count", results.size());
        response.put("results", results);
        return response;
    }
}
