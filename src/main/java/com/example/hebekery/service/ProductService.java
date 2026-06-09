package com.example.hebekery.service;

import com.example.hebekery.model.Product;
import com.example.hebekery.model.InventoryTransaction;
import com.example.hebekery.repository.InventoryTransactionRepository;
import com.example.hebekery.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;

    public ProductService(ProductRepository productRepository, InventoryTransactionRepository inventoryTransactionRepository) {
        this.productRepository = productRepository;
        this.inventoryTransactionRepository = inventoryTransactionRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findByActiveTrue();
    }

    public List<Product> getAllProductsIncludingHidden() {
        return productRepository.findAll();
    }

    public List<Product> getLowStockProducts() {
        return getAllProducts().stream()
                .filter(product -> product.isOutOfStock() || product.isLowStock())
                .toList();
    }

    public List<Product> getFeaturedProducts() {
        return getAllProducts().stream()
                .filter(p -> p.getId().equals("P001") || p.getId().equals("P004") || p.getId().equals("P005") || p.getId().equals("P008"))
                .collect(Collectors.toList());
    }

    public Page<Product> getProductsPage(String category, Pageable pageable) {
        if (category == null || category.isBlank() || "all".equalsIgnoreCase(category)) {
            return productRepository.findByActiveTrue(pageable);
        }
        return productRepository.findByCategoryAndActiveTrue(category, pageable);
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
            return productRepository.findByActiveTrue(pageable);
        }
        String term = keyword.trim();
        return productRepository.searchActive(term, pageable);
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

    @Transactional
    public Product receiveStock(String productId, int quantity, double unitCost) {
        return receiveStock(productId, quantity, unitCost, "MANUAL", null, "Nhap kho");
    }

    @Transactional
    public Product receiveStock(String productId, int quantity, double unitCost, String referenceType, String referenceId, String note) {
        Product product = getProductById(productId);
        if (product == null) {
            throw new IllegalArgumentException("Khong tim thay san pham");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("So luong nhap phai lon hon 0");
        }

        int oldStock = product.getStockQuantity();
        double oldValue = product.getAverageCost() * oldStock;
        double addedValue = unitCost * quantity;
        int newStock = oldStock + quantity;

        product.setStockQuantity(newStock);
        product.setAverageCost(newStock == 0 ? 0 : (oldValue + addedValue) / newStock);
        Product saved = productRepository.save(product);
        recordInventory(saved, "IMPORT", quantity, unitCost, referenceType, referenceId, note);
        return saved;
    }

    @Transactional
    public Product decreaseStock(String productId, int quantity) {
        return decreaseStock(productId, quantity, "ORDER", null, "Xuat kho");
    }

    @Transactional
    public Product decreaseStock(String productId, int quantity, String referenceType, String referenceId, String note) {
        Product product = getProductById(productId);
        if (product == null) {
            throw new IllegalArgumentException("Khong tim thay san pham");
        }
        if (quantity <= 0) {
            throw new IllegalArgumentException("So luong xuat kho phai lon hon 0");
        }
        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("San pham " + product.getName() + " khong du ton kho");
        }
        product.setStockQuantity(product.getStockQuantity() - quantity);
        Product saved = productRepository.save(product);
        recordInventory(saved, "EXPORT", -quantity, product.getAverageCost(), referenceType, referenceId, note);
        return saved;
    }

    @Transactional
    public Product increaseStock(String productId, int quantity) {
        return increaseStock(productId, quantity, "RETURN", null, "Hoan kho");
    }

    @Transactional
    public Product increaseStock(String productId, int quantity, String referenceType, String referenceId, String note) {
        Product product = getProductById(productId);
        if (product == null) {
            return null;
        }
        if (quantity <= 0) {
            return product;
        }
        product.setStockQuantity(product.getStockQuantity() + quantity);
        Product saved = productRepository.save(product);
        recordInventory(saved, "RETURN", quantity, product.getAverageCost(), referenceType, referenceId, note);
        return saved;
    }

    public void ensureAvailable(String productId, int quantity) {
        Product product = getProductById(productId);
        if (product == null) {
            throw new IllegalArgumentException("San pham khong ton tai");
        }
        if (product.getStockQuantity() <= 0) {
            throw new IllegalArgumentException("San pham da het hang");
        }
        if (quantity > product.getStockQuantity()) {
            throw new IllegalArgumentException("Chi con " + product.getStockQuantity() + " san pham trong kho");
        }
    }

    public Product updateLowStockThreshold(String productId, int threshold) {
        Product product = getProductById(productId);
        if (product == null) {
            throw new IllegalArgumentException("Khong tim thay san pham");
        }
        product.setLowStockThreshold(Math.max(threshold, 0));
        return productRepository.save(product);
    }

    public boolean deleteProduct(String id) {
        Product product = getProductById(id);
        if (product == null) {
            return false;
        }
        product.setActive(false);
        productRepository.save(product);
        return true;
    }

    public boolean hasInventoryTransactions(String productId) {
        return inventoryTransactionRepository.existsByProductId(productId);
    }

    private void recordInventory(Product product, String type, int quantity, double unitCost, String referenceType, String referenceId, String note) {
        inventoryTransactionRepository.save(new InventoryTransaction(
                product.getId(),
                product.getName(),
                type,
                quantity,
                product.getStockQuantity(),
                unitCost,
                referenceType,
                referenceId,
                note
        ));
    }
}
