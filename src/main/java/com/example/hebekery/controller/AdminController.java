package com.example.hebekery.controller;

import com.example.hebekery.dto.UserResponse;
import com.example.hebekery.dto.request.AdminOrderUpdateRequest;
import com.example.hebekery.dto.request.AdminUserUpdateRequest;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.ContactService;
import com.example.hebekery.service.FileStorageService;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class AdminController {

    private final UserService userService;
    private final OrderService orderService;
    private final ProductService productService;
    private final ContactService contactService;
    private final FileStorageService fileStorageService;

    public AdminController(UserService userService, OrderService orderService, ProductService productService, ContactService contactService, FileStorageService fileStorageService) {
        this.userService = userService;
        this.orderService = orderService;
        this.productService = productService;
        this.contactService = contactService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/admin")
    public String dashboard(Model model) {
        requireAdminPage();
        model.addAttribute("userCount", userService.getAllUsers().size());
        model.addAttribute("orderCount", orderService.getAllOrders().size());
        model.addAttribute("productCount", productService.getAllProducts().size());
        model.addAttribute("contactCount", contactService.getAll().size());
        return "admin/dashboard";
    }

    @GetMapping("/admin/users")
    public String usersPage(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("name").ascending());
        model.addAttribute("page", userService.searchUsers(keyword, pageable));
        model.addAttribute("keyword", keyword);
        return "admin/users";
    }

    @PostMapping("/admin/users/{id}/update")
    public String updateUserForm(@PathVariable String id, @RequestParam String role,
                                 @RequestParam(defaultValue = "false") boolean active,
                                 @RequestParam(required = false) String newPassword) {
        requireAdminPage();
        userService.updateUserRole(id, role);
        userService.setUserActive(id, active);
        if (newPassword != null && !newPassword.isBlank()) {
            userService.resetPassword(id, newPassword);
        }
        return "redirect:/admin/users";
    }

    @GetMapping("/admin/products")
    public String productsPage(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("id").ascending());
        model.addAttribute("page", productService.searchProducts(keyword, pageable));
        model.addAttribute("keyword", keyword);
        model.addAttribute("product", new Product());
        model.addAttribute("categories", productService.getAllCategories());
        return "admin/products";
    }

    @GetMapping("/admin/products/{id}/edit")
    public String editProductPage(@PathVariable String id, Model model) {
        requireAdminPage();
        Product product = productService.getProductById(id);
        if (product == null) {
            return "redirect:/admin/products";
        }
        model.addAttribute("product", product);
        model.addAttribute("categories", productService.getAllCategories());
        return "admin/product-form";
    }

    @PostMapping("/admin/products")
    public String saveProductForm(@ModelAttribute Product product, @RequestParam(required = false) MultipartFile imageFile) {
        requireAdminPage();
        Product existing = product.getId() == null || product.getId().isBlank() ? null : productService.getProductById(product.getId());
        String oldImageUrl = existing == null ? null : existing.getImageUrl();
        String uploadedImage = fileStorageService.saveProductImage(imageFile);
        if (uploadedImage != null) {
            product.setImageUrl(uploadedImage);
        } else if (product.getId() != null && !product.getId().isBlank()) {
            if (existing != null && (product.getImageUrl() == null || product.getImageUrl().isBlank())) {
                product.setImageUrl(existing.getImageUrl());
            }
        }
        productService.saveProduct(product);
        if (uploadedImage != null && oldImageUrl != null && !oldImageUrl.equals(uploadedImage)) {
            fileStorageService.deleteProductImage(oldImageUrl);
        }
        return "redirect:/admin/products";
    }

    @PostMapping("/admin/products/{id}/delete")
    public String deleteProductForm(@PathVariable String id) {
        requireAdminPage();
        Product product = productService.getProductById(id);
        productService.deleteProduct(id);
        if (product != null) {
            fileStorageService.deleteProductImage(product.getImageUrl());
        }
        return "redirect:/admin/products";
    }

    @GetMapping("/admin/products/{id}/preview")
    public String productPreviewPage(@PathVariable String id, Model model) {
        requireAdminPage();
        Product product = productService.getProductById(id);
        if (product == null) {
            return "redirect:/admin/products";
        }
        model.addAttribute("product", product);
        return "admin/product-preview";
    }

    @GetMapping("/admin/orders")
    public String ordersPage(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("createdAt").descending());
        model.addAttribute("page", orderService.searchOrders(keyword, pageable));
        model.addAttribute("keyword", keyword);
        return "admin/orders";
    }

    @PostMapping("/admin/orders/{id}/status")
    public String updateOrderStatusForm(@PathVariable String id, @RequestParam String orderStatus, @RequestParam String paymentStatus) {
        requireAdminPage();
        orderService.updateStatus(id, orderStatus, paymentStatus);
        return "redirect:/admin/orders";
    }

    @GetMapping("/admin/orders/{id}")
    public String orderDetailPage(@PathVariable String id, Model model) {
        requireAdminPage();
        model.addAttribute("order", orderService.getOrderById(id));
        model.addAttribute("history", orderService.getHistory(id));
        return "admin/order-detail";
    }

    @PostMapping("/admin/orders/{id}/note")
    public String updateOrderNoteForm(@PathVariable String id, @RequestParam(required = false) String adminNote) {
        requireAdminPage();
        orderService.updateAdminNote(id, adminNote);
        return "redirect:/admin/orders/" + id;
    }

    @PostMapping("/admin/orders/{id}/return")
    public String reviewReturnForm(@PathVariable String id, @RequestParam String decision, @RequestParam(required = false) String adminNote) {
        requireAdminPage();
        orderService.reviewReturn(id, decision, adminNote);
        return "redirect:/admin/orders/" + id;
    }

    @GetMapping("/admin/contacts")
    public String contactsPage(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int page, Model model) {
        requireAdminPage();
        Pageable pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("createdAt").descending());
        model.addAttribute("page", contactService.search(keyword, pageable));
        model.addAttribute("keyword", keyword);
        return "admin/contacts";
    }

    @PostMapping("/admin/contacts/{id}/status")
    public String updateContactStatusForm(@PathVariable String id, @RequestParam String status) {
        requireAdminPage();
        contactService.updateStatus(id, status);
        return "redirect:/admin/contacts";
    }

    @GetMapping("/api/admin/users")
    @ResponseBody
    public Map<String, Object> users() {
        requireAdmin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("users", userService.getAllUsers().stream().map(UserResponse::from).collect(Collectors.toList()));
        return response;
    }

    @PostMapping("/api/admin/users/{id}")
    @ResponseBody
    public Map<String, Object> updateUser(@PathVariable String id, @RequestBody AdminUserUpdateRequest request) {
        requireAdmin();
        if (request.getRole() != null && !request.getRole().isBlank()) {
            userService.updateUserRole(id, request.getRole());
        }
        if (request.getActive() != null) {
            userService.setUserActive(id, request.getActive());
        }
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            userService.resetPassword(id, request.getNewPassword());
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("user", UserResponse.from(userService.findById(id).orElseThrow()));
        return response;
    }

    @GetMapping("/api/admin/products")
    @ResponseBody
    public Map<String, Object> products() {
        requireAdmin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("products", productService.getAllProducts());
        return response;
    }

    @PostMapping("/api/admin/products")
    @ResponseBody
    public Map<String, Object> saveProduct(@Valid @RequestBody Product product) {
        requireAdmin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("product", productService.saveProduct(product));
        return response;
    }

    @DeleteMapping("/api/admin/products/{id}")
    @ResponseBody
    public Map<String, Object> deleteProduct(@PathVariable String id) {
        requireAdmin();
        Product product = productService.getProductById(id);
        boolean deleted = productService.deleteProduct(id);
        if (deleted && product != null) {
            fileStorageService.deleteProductImage(product.getImageUrl());
        }
        Map<String, Object> response = new HashMap<>();
        response.put("success", deleted);
        return response;
    }

    @GetMapping("/api/admin/orders")
    @ResponseBody
    public Map<String, Object> orders() {
        requireAdmin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("orders", orderService.getAllOrders());
        return response;
    }

    @PostMapping("/api/admin/orders/{id}")
    @ResponseBody
    public Map<String, Object> updateOrder(@PathVariable String id, @RequestBody AdminOrderUpdateRequest request) {
        requireAdmin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("order", orderService.updateStatus(id, request.getOrderStatus(), request.getPaymentStatus()));
        return response;
    }

    @GetMapping("/api/admin/contacts")
    @ResponseBody
    public Map<String, Object> contacts() {
        requireAdmin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("contacts", contactService.getAll());
        return response;
    }

    @PostMapping("/api/admin/contacts/{id}/status")
    @ResponseBody
    public Map<String, Object> updateContact(@PathVariable String id, @RequestBody Map<String, String> payload) {
        requireAdmin();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("contact", contactService.updateStatus(id, payload.getOrDefault("status", "DONE")));
        return response;
    }

    private void requireAdminPage() {
        if (!userService.isAdmin()) {
            throw new IllegalStateException("Ban can dang nhap bang tai khoan admin");
        }
    }

    private void requireAdmin() {
        requireAdminPage();
    }
}
