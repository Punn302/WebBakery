package com.example.hebekery.service;

import com.example.hebekery.model.Product;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    // Lấy tất cả sản phẩm
    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();

        // ========== DANH MỤC 1: NGŨ CỐC & GRANOLA ==========
        products.add(new Product("P001", "Granola Truyền Thống", "Ngũ cốc & Granola",
                "Granola truyền thống với yến mạch nguyên cám, mật ong, hạt điều, hạnh nhân",
                219000, "/images/granola-traditional.jpg", "Bán chạy", "Nghi lễ buổi sáng"));

        products.add(new Product("P002", "Granola Chocolate", "Ngũ cốc & Granola",
                "Granola vị chocolate đậm đà, kết hợp hạt óc chó và hạnh nhân",
                239000, "/images/granola-choco.jpg", "Hot", "Hương vị mới"));

        products.add(new Product("P003", "Granola Matcha", "Ngũ cốc & Granola",
                "Granola matcha Nhật Bản, giàu chất chống oxy hóa",
                249000, "/images/granola-matcha.jpeg", "Premium", "Trà xanh"));

        // ========== DANH MỤC 2: BÁNH ĂN KIÊNG ==========
        products.add(new Product("P004", "Bánh Biscotti Ý", "Bánh ăn kiêng",
                "Bánh quy giòn truyền thống Ý, hạnh nhân thơm ngon, low-carb",
                180000, "/images/biscotti.jpg", "Artisanal", "Thủ công"));

        products.add(new Product("P005", "Keto Cookies", "Bánh ăn kiêng",
                "Bánh cookies Keto-friendly, không đường, giàu chất xơ",
                160000, "/images/keto-cookies.jpg", "Paleo Friendly", "Low-carb"));

        products.add(new Product("P006", "Almond Cookies", "Bánh ăn kiêng",
                "Bánh hạnh nhân nguyên cám, bổ sung protein thực vật",
                189000, "/images/almond-cookies.jpg", "New", "Giàu protein"));

        products.add(new Product("P007", "Bánh Matcha Almond", "Bánh ăn kiêng",
                "Bánh hạnh nhân matcha, thơm nhẹ, tốt cho tiêu hóa",
                199000, "/images/matcha-almond.jpg", "Limited", "Trà xanh"));

        // ========== DANH MỤC 3: SNACK HEALTHY ==========
        products.add(new Product("P008", "Thanh Yến Mạch Hữu Cơ", "Snack healthy",
                "Thanh yến mạch nguyên chất, mật ong rừng, hạt chia",
                220000, "/images/oat-bars.jpg", "Wellness", "Năng lượng"));

        products.add(new Product("P009", "Trái Cây Sấy Tổng Hợp", "Snack healthy",
                "Trái cây sấy giòn tự nhiên: chuối, dâu, xoài, thanh long",
                159000, "/images/dried-fruit.jpg", "Natural", "Thuần chay"));

        products.add(new Product("P010", "Hạt Điều Rang Muối", "Snack healthy",
                "Hạt điều cao cấp, rang muối hồng, giàu Omega-3",
                149000, "/images/cashew.jpg", "Best Seller", "Protein cao"));

        products.add(new Product("P011", "Hạt Hạnh Nhân Sấy Mật Ong", "Snack healthy",
                "Hạnh nhân sấy cùng mật ong nguyên chất, giòn thơm",
                169000, "/images/almond-honey.jpg", "New", "Năng lượng"));

        // ========== DANH MỤC 4: THỰC PHẨM BỔ SUNG ==========
        products.add(new Product("P012", "Matcha Powder", "Thực phẩm bổ sung",
                "Bột matcha Nhật Bản loại 1, hỗ trợ giảm cân và chống oxy hóa",
                299000, "/images/matcha-powder.jpg", "Premium", "Antioxidant"));

        products.add(new Product("P013", "Hạt Chia Organic", "Thực phẩm bổ sung",
                "Hạt chia Mỹ, giàu Omega-3, chất xơ, protein",
                129000, "/images/chia-seed.jpg", "Organic", "Superfood"));

        products.add(new Product("P014", "Protein Bar", "Thực phẩm bổ sung",
                "Thanh protein thực vật, hỗ trợ phục hồi sau tập luyện",
                189000, "/images/protein-bar.jpg", "Fitness", "20g protein"));

        // ========== DANH MỤC 5: COMBO QUÀ TẶNG ==========
        products.add(new Product("P015", "Combo Detox 7 Ngày", "Combo quà tặng",
                "Bộ sản phẩm hỗ trợ thanh lọc cơ thể trong 7 ngày",
                850000, "/images/detox-combo.jpg", "Bestseller", "Giảm cân"));

        products.add(new Product("P016", "Combo Ăn Sáng Lành Mạnh", "Combo quà tặng",
                "Granola + Yến mạch + Mật ong + Hạt chia cho bữa sáng",
                450000, "/images/breakfast-combo.jpg", "Tiết kiệm", "Gift"));

        products.add(new Product("P017", "Combo Quà Tết Healthy", "Combo quà tặng",
                "Set sản phẩm cao cấp mừng năm mới, bao bì sang trọng",
                599000, "/images/lunar-combo.jpg", "Limited", "Lì xì"));

        return products;
    }

    // Lấy sản phẩm nổi bật (4 sản phẩm ban đầu)
    public List<Product> getFeaturedProducts() {
        List<Product> all = getAllProducts();
        return all.stream()
                .filter(p -> p.getId().equals("P001") ||
                        p.getId().equals("P004") ||
                        p.getId().equals("P005") ||
                        p.getId().equals("P008"))
                .collect(Collectors.toList());
    }

    // ✅ Sửa lại: Lấy sản phẩm theo category (dùng getCategory)
    public List<Product> getProductsByCategory(String category) {
        return getAllProducts().stream()
                .filter(p -> p.getCategory().equals(category))  // ← đã sửa thành getCategory()
                .collect(Collectors.toList());
    }

    // Lấy sản phẩm theo ID
    public Product getProductById(String id) {
        return getAllProducts().stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    // Lấy tất cả danh mục
    public List<String> getAllCategories() {
        return List.of(
                "Ngũ cốc & Granola",
                "Bánh ăn kiêng",
                "Snack healthy",
                "Thực phẩm bổ sung",
                "Combo quà tặng"
        );
    }
    // Lấy sản phẩm liên quan (cùng danh mục, trừ sản phẩm hiện tại)
    public List<Product> getRelatedProducts(String currentId, String category) {
        return getAllProducts().stream()
                .filter(p -> !p.getId().equals(currentId))
                .filter(p -> p.getCategory().equals(category))
                .limit(4)
                .collect(Collectors.toList());
    }
    // Tìm kiếm sản phẩm theo từ khóa
    public List<Product> searchProducts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllProducts();
        }

        String searchTerm = keyword.toLowerCase().trim();
        return getAllProducts().stream()
                .filter(product ->
                        product.getName().toLowerCase().contains(searchTerm) ||
                                product.getDescription().toLowerCase().contains(searchTerm) ||
                                product.getCategory().toLowerCase().contains(searchTerm) ||
                                product.getBadge().toLowerCase().contains(searchTerm)
                )
                .collect(Collectors.toList());
    }
}