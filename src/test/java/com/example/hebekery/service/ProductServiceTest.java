package com.example.hebekery.service;

import com.example.hebekery.model.Category;
import com.example.hebekery.model.Product;
import com.example.hebekery.repository.CategoryRepository;
import com.example.hebekery.repository.InventoryTransactionRepository;
import com.example.hebekery.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("Lấy sản phẩm sắp hết hàng trực tiếp từ query database, không lọc qua RAM")
    void getLowStockProducts_queriesDatabase() {
        Product p = new Product("P001", "Granola", "Ngu coc", "Mo ta", 100000, "url", "badge");
        p.setStockQuantity(2);
        p.setLowStockThreshold(5);

        when(productRepository.findLowStockProducts()).thenReturn(List.of(p));

        List<Product> result = productService.getLowStockProducts();

        assertEquals(1, result.size());
        verify(productRepository, times(1)).findLowStockProducts();
        verify(productRepository, never()).findAll();
    }

    @Test
    @DisplayName("Lấy sản phẩm nổi bật dựa trên cờ is_featured từ database, không lọc mã cứng")
    void getFeaturedProducts_queriesDatabase() {
        Product p = new Product("P001", "Granola", "Ngu coc", "Mo ta", 100000, "url", "badge");
        p.setFeatured(true);

        when(productRepository.findByIsFeaturedTrueAndActiveTrue()).thenReturn(List.of(p));

        List<Product> result = productService.getFeaturedProducts();

        assertEquals(1, result.size());
        assertTrue(result.get(0).isFeatured());
        verify(productRepository, times(1)).findByIsFeaturedTrueAndActiveTrue();
    }

    @Test
    @DisplayName("Lấy danh mục sản phẩm từ bảng categories trong database")
    void getAllCategories_queriesCategoriesTable() {
        Category c1 = new Category(1L, "Ngũ cốc", "ngu-coc", "Mo ta", true);
        Category c2 = new Category(2L, "Bánh ăn kiêng", "banh-an-kieng", "Mo ta", true);

        when(categoryRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(c1, c2));

        List<String> categories = productService.getAllCategories();

        assertEquals(2, categories.size());
        assertTrue(categories.contains("Ngũ cốc"));
        assertTrue(categories.contains("Bánh ăn kiêng"));
    }

    @Test
    @DisplayName("Tìm kiếm sản phẩm phân trang dùng truy vấn database có LIMIT OFFSET")
    void searchProducts_queriesDatabaseWithPagination() {
        Product p = new Product("P001", "Biscotti", "Banh", "Mo ta", 50000, "url", "badge");
        Page<Product> page = new PageImpl<>(List.of(p));

        when(productRepository.searchActive(eq("Biscotti"), any())).thenReturn(page);

        Page<Product> result = productService.searchProducts("Biscotti", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
        verify(productRepository, times(1)).searchActive(eq("Biscotti"), any());
    }

    @Test
    @DisplayName("testEnsureAvailable_OutOfStock: Ném ngoại lệ khi sản phẩm hết hàng tồn kho (<= 0)")
    void testEnsureAvailable_OutOfStock() {
        Product p = new Product("P001", "Biscotti", "Banh", "Mo ta", 50000, "url", "badge");
        p.setStockQuantity(0);

        when(productRepository.findById("P001")).thenReturn(Optional.of(p));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                productService.ensureAvailable("P001", 1)
        );
        assertTrue(ex.getMessage().contains("het hang"));
    }

    @Test
    @DisplayName("testEnsureAvailable_ExceedStock: Ném ngoại lệ khi số lượng đặt mua vượt quá tồn kho khả dụng")
    void testEnsureAvailable_ExceedStock() {
        Product p = new Product("P001", "Biscotti", "Banh", "Mo ta", 50000, "url", "badge");
        p.setStockQuantity(5);

        when(productRepository.findById("P001")).thenReturn(Optional.of(p));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                productService.ensureAvailable("P001", 10)
        );
        assertTrue(ex.getMessage().contains("Chi con 5"));
    }

    @Test
    @DisplayName("testSaveProduct_NewProduct: Tự sinh mã ID SKU dạng P-UUID nếu truyền vào ID rỗng")
    void testSaveProduct_NewProduct() {
        Product p = new Product();
        p.setName("Bánh Sừng Bò Yến Mạch");
        p.setPrice(45000.0);

        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product saved = productService.saveProduct(p);

        assertNotNull(saved.getId());
        assertTrue(saved.getId().startsWith("P-"));
        assertEquals("Bánh Sừng Bò Yến Mạch", saved.getName());
        verify(productRepository).save(p);
    }

    @Test
    @DisplayName("testUpdateLowStockThreshold: Cập nhật ngưỡng cảnh báo tồn kho thành công")
    void testUpdateLowStockThreshold() {
        Product p = new Product("P001", "Biscotti", "Banh", "Mo ta", 50000, "url", "badge");
        p.setLowStockThreshold(5);

        when(productRepository.findById("P001")).thenReturn(Optional.of(p));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Product updated = productService.updateLowStockThreshold("P001", 12);

        assertEquals(12, updated.getLowStockThreshold());
        verify(productRepository).save(p);
    }
}
