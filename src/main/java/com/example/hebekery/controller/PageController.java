package com.example.hebekery.controller;

import com.example.hebekery.model.Product;
import com.example.hebekery.service.CartService;
import com.example.hebekery.service.ProductService;
import com.example.hebekery.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class PageController {

    private final ProductService productService;
    private final CartService cartService;
    private final UserService userService;

    public PageController(ProductService productService, CartService cartService, UserService userService) {
        this.productService = productService;
        this.cartService = cartService;
        this.userService = userService;
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

    @GetMapping("/products")
    public String products(Model model) {
        model.addAttribute("products", productService.getAllProducts());
        model.addAttribute("categories", productService.getAllCategories());
        return "products";
    }

    @GetMapping("/category/{category}")
    public String category(@PathVariable String category, Model model) {
        model.addAttribute("products", productService.getProductsByCategory(category));
        model.addAttribute("currentCategory", category);
        model.addAttribute("categories", productService.getAllCategories());
        return "products";
    }

    @GetMapping("/product/{id}")
    public String productDetail(@PathVariable String id, Model model) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return "redirect:/products";
        }

        model.addAttribute("product", product);
        model.addAttribute("relatedProducts", productService.getRelatedProducts(id, product.getCategory()));
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
        return "redirect:/profile";
    }

    @GetMapping("/cart")
    public String cart(Model model) {
        model.addAttribute("cartItems", cartService.getCartItems());
        model.addAttribute("totalPrice", cartService.getTotalPrice());
        return "cart";
    }

    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String redirect, Model model) {
        if (userService.isLoggedIn()) {
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
    public String profile() {
        if (!userService.isLoggedIn()) {
            return "redirect:/login?redirect=/profile";
        }
        return "profile";
    }

    @GetMapping("/orders")
    public String orders() {
        return "redirect:/profile";
    }

    @GetMapping("/checkout")
    public String checkout() {
        if (!userService.isLoggedIn()) {
            return "redirect:/login?redirect=/checkout";
        }
        return "redirect:/cart";
    }
}
