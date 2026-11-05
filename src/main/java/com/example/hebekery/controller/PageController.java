package com.example.hebekery.controller;

import com.example.hebekery.dto.request.CheckoutRequest;
import com.example.hebekery.model.Product;
import com.example.hebekery.service.AddressService;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.OrderService;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.ProductReviewService;
import com.example.hebekery.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;

@Controller
public class PageController {

    private final ProductService productService;
    private final CartService cartService;
    private final UserService userService;
    private final OrderService orderService;
    private final ProductReviewService productReviewService;
    private final AddressService addressService;

    public PageController(ProductService productService, CartService cartService, UserService userService, OrderService orderService, ProductReviewService productReviewService, AddressService addressService) {
        this.productService = productService;
        this.cartService = cartService;
        this.userService = userService;
        this.orderService = orderService;
        this.productReviewService = productReviewService;
        this.addressService = addressService;
    }

    @GetMapping("/")
    public String home(Model model) {
        model.addAttribute("products", productService.getFeaturedProducts());
        return "index";
    }

    @GetMapping("/about")
    public String about() {
        return "about";
    }

    @GetMapping("/search")
    public String searchProducts(@RequestParam(required = false) String keyword) {
        String encodedKeyword = UriUtils.encodeQueryParam(keyword == null ? "" : keyword, StandardCharsets.UTF_8);
        return "redirect:/products?keyword=" + encodedKeyword;
    }

    @GetMapping("/products")
    public String products(@RequestParam(defaultValue = "all") String category,
                           @RequestParam(defaultValue = "") String keyword,
                           @RequestParam(defaultValue = "0") int page,
                           Model model) {
        var pageable = PageRequest.of(Math.max(page, 0), 8, Sort.by("id").ascending());
        var productsPage = keyword == null || keyword.isBlank()
                ? productService.getProductsPage(category, pageable)
                : productService.searchProducts(keyword, pageable);
        model.addAttribute("page", productsPage);
        model.addAttribute("products", productsPage.getContent());
        model.addAttribute("categories", productService.getAllCategories());
        model.addAttribute("currentCategory", category);
        model.addAttribute("keyword", keyword);
        return "products";
    }

    @GetMapping("/category/{category}")
    public String category(@PathVariable String category) {
        return "redirect:/products?category=" + UriUtils.encodeQueryParam(category, StandardCharsets.UTF_8);
    }

    @GetMapping("/product/{id}")
    public String productDetail(@PathVariable String id, Model model) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return "redirect:/products";
        }

        model.addAttribute("product", product);
        model.addAttribute("relatedProducts", productService.getRelatedProducts(id, product.getCategoryName()));
        model.addAttribute("reviews", productReviewService.getReviews(id));
        model.addAttribute("canReview", productReviewService.canReview(id, userService.getCurrentUser()));
        model.addAttribute("myReview", userService.isLoggedIn()
                ? productReviewService.getUserReview(id, userService.getCurrentUser().getId()).orElse(null)
                : null);
        return "product-detail";
    }

    @GetMapping("/bmi")
    public String bmi() {
        return "bmi";
    }

    @GetMapping("/tdee")
    public String tdee() {
        return "tdee";
    }

    @GetMapping("/knowledge")
    public String knowledge() {
        return "knowledge";
    }

    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }

    @GetMapping("/order-tracking")
    public String orderTracking() {
        return "order-tracking";
    }

    @GetMapping("/cart")
    public String cart(Model model) {
        model.addAttribute("cartItems", cartService.getCartItems());
        model.addAttribute("totalPrice", cartService.getTotalPrice());
        return "cart";
    }

    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String redirect, Model model) {
        boolean adminRedirect = redirect != null && redirect.startsWith("/admin");
        if (adminRedirect && userService.isAdmin()) {
            return "redirect:/admin";
        }
        if (!adminRedirect && userService.isLoggedIn()) {
            return "redirect:/";
        }
        model.addAttribute("redirect", redirect);
        return "login";
    }

    @GetMapping("/register")
    public String registerPage() {
        if (userService.isLoggedIn()) {
            return "redirect:/";
        }
        return "register";
    }

    @GetMapping("/profile")
    public String profile(Model model) {
        if (!userService.isLoggedIn()) {
            return "redirect:/login?redirect=/profile";
        }
        model.addAttribute("user", userService.getCurrentUser());
        return "profile";
    }

    @GetMapping("/orders")
    public String orders() {
        return "redirect:/profile";
    }

    @GetMapping("/orders/{id}")
    public String orderDetail(@PathVariable String id, Model model) {
        if (!userService.isLoggedIn()) {
            return "redirect:/login?redirect=/orders/" + id;
        }
        var order = orderService.getOrderById(id);
        if (!order.getUserId().equals(userService.getCurrentUser().getId())) {
            return "redirect:/profile";
        }
        model.addAttribute("order", order);
        model.addAttribute("returnHistory", orderService.getReturnHistory(id));
        return "order-detail";
    }

    @GetMapping("/checkout")
    public String checkout(Model model) {
        if (!userService.isLoggedIn()) {
            return "redirect:/login?redirect=/checkout";
        }
        if (cartService.getCartItems().isEmpty()) {
            return "redirect:/cart";
        }
        model.addAttribute("user", userService.getCurrentUser());
        var addresses = addressService.getByUser(userService.getCurrentUser().getId());
        model.addAttribute("addresses", addresses);
        model.addAttribute("defaultAddress", addresses.stream()
                .filter(address -> address.isDefaultAddress())
                .findFirst()
                .orElse(addresses.isEmpty() ? null : addresses.get(0)));
        model.addAttribute("cartItems", cartService.getCartItems());
        model.addAttribute("subtotal", cartService.getTotalPrice());
        model.addAttribute("shippingFee", 30000);
        model.addAttribute("totalPrice", cartService.getTotalPrice() + 30000);
        return "checkout";
    }

    @GetMapping("/checkout/success")
    public String checkoutSuccess() {
        return "checkout-success";
    }

    @GetMapping("/checkout/momo-test")
    public String momoTest(HttpSession session) {
        if (session.getAttribute("pendingMomoCheckout") == null) {
            return "redirect:/checkout";
        }
        return "momo-test";
    }

    @PostMapping("/checkout/momo-test/pay")
    public String payMomoTest(HttpSession session) {
        if (!userService.isLoggedIn()) {
            return "redirect:/login?redirect=/checkout";
        }
        Object pendingCheckout = session.getAttribute("pendingMomoCheckout");
        if (!(pendingCheckout instanceof CheckoutRequest request)) {
            return "redirect:/checkout";
        }
        orderService.createPaidMomoOrder(
                userService.getCurrentUser(),
                cartService.getCartItems(),
                cartService.getTotalPrice(),
                request
        );
        cartService.clearCart();
        session.removeAttribute("pendingMomoCheckout");
        return "redirect:/checkout/success";
    }

    @PostMapping("/checkout/momo-test/cancel")
    public String cancelMomoTest(HttpSession session) {
        session.removeAttribute("pendingMomoCheckout");
        return "redirect:/checkout";
    }
}
