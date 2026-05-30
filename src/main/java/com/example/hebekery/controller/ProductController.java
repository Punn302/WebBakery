package com.example.hebekery.controller;

import com.example.hebekery.model.Product;
import com.example.hebekery.service.ProductService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

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
    public String searchProducts(@RequestParam(required = false) String keyword, Model model) {
        List<Product> results = productService.searchProducts(keyword);
        model.addAttribute("products", results);
        model.addAttribute("keyword", keyword);
        model.addAttribute("resultCount", results.size());
        return "search-results";
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
