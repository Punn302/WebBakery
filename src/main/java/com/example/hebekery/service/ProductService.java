package com.example.hebekery.service;

import com.example.hebekery.model.Product;
import com.example.hebekery.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public List<Product> getFeaturedProducts() {
        return getAllProducts().stream()
                .filter(p -> p.getId().equals("P001") || p.getId().equals("P004") || p.getId().equals("P005") || p.getId().equals("P008"))
                .collect(Collectors.toList());
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public Product getProductById(String id) {
        return productRepository.findById(id).orElse(null);
    }

    public List<String> getAllCategories() {
        return List.of("Ngu coc & Granola", "Banh an kieng", "Snack healthy", "Thuc pham bo sung", "Combo qua tang");
    }

    public List<Product> getRelatedProducts(String currentId, String category) {
        return getAllProducts().stream()
                .filter(p -> !p.getId().equals(currentId))
                .filter(p -> p.getCategory().equals(category))
                .limit(4)
                .collect(Collectors.toList());
    }

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
                                product.getBadge().toLowerCase().contains(searchTerm))
                .collect(Collectors.toList());
    }

    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return productRepository.findAll(pageable);
        }
        String term = keyword.trim();
        return productRepository.findByNameContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrBadgeContainingIgnoreCase(
                term,
                term,
                term,
                pageable
        );
    }

    public Product saveProduct(Product product) {
        if (product.getId() == null || product.getId().isBlank()) {
            product.setId("P" + System.currentTimeMillis());
        }
        if (product.getBadge() == null) {
            product.setBadge("");
        }
        if (product.getTag() == null) {
            product.setTag("");
        }
        return productRepository.save(product);
    }

    public boolean deleteProduct(String id) {
        if (!productRepository.existsById(id)) {
            return false;
        }
        productRepository.deleteById(id);
        return true;
    }
}
