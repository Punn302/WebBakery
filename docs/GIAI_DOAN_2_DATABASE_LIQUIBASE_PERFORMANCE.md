# KẾ HOẠCH GIAI ĐOẠN 2: CƠ SỞ DỮ LIỆU, LIQUIBASE MIGRATION, AUDITING & HIỆU NĂNG TRUY VẤN

> **Mục tiêu**: Nâng cấp và chuẩn hóa toàn bộ tầng dữ liệu theo chuẩn Enterprise: Chuyển đổi công cụ Database Migration từ Flyway sang **Liquibase**, bổ sung **JPA Auditing**, chuẩn hóa khóa chính (Primary Key), xóa bỏ triệt để các vị trí xử lý dữ liệu trong RAM (In-Memory Processing) gây nguy cơ tràn bộ nhớ (OOM), chuyển đổi `CartService` thành **Stateless Service**.
> **Tài liệu đối chiếu**: `BE_Training_Plan_v1 1.pdf` — Phần 4 (Database & JPA, Liquibase, JPA Auditing, Normal Form).

---

## 1. Danh sách vấn đề cần giải quyết triệt để

1. **Công cụ Migration chưa đúng lộ trình đào tạo**:
   - Hiện tại đang dùng `Flyway` (14 file SQL từ `V1` đến `V14`), trong khi lộ trình `BE_Training_Plan_v1 1.pdf` (Mục 11) yêu cầu sử dụng **Liquibase**.
2. **Thiếu cơ chế Entity Auditing**:
   - Chưa có trường lưu trữ tự động thời gian tạo (`created_at`), thời gian cập nhật gần nhất (`updated_at`), người tạo (`created_by`), người sửa (`updated_by`).
3. **Chiến lược Khóa chính (Primary Key) thiếu an toàn**:
   - Các bảng `products`, `orders`, `users`, `addresses` đang dùng chuỗi String sinh từ `System.currentTimeMillis()`. Trong môi trường đa luồng/concurrency cao sẽ gây lỗi trùng khóa chính (`Duplicate Key Exception`) và làm giảm hiệu năng đánh chỉ mục B-Tree của MySQL.
4. **Xử lý dữ liệu trong RAM gây nguy cơ sập hệ thống (OOM)**:
   - `ProductService.searchProducts(keyword)`: Lấy toàn bộ bản ghi `getAllProducts()` vào RAM rồi dùng Java Stream `filter()`.
   - `ProductService.getFeaturedProducts()`: Hardcode ID sản phẩm `P001`, `P004`...
   - `ProductService.getAllCategories()`: Hardcode danh mục dạng List String trong code Java, không có bảng `categories` độc lập trong database.
5. **Anti-pattern Lazy/Eager Loading (N+1 Query)**:
   - `Order.java` khai báo `items` với `fetch = FetchType.EAGER`, luôn kéo toàn bộ OrderItem ngay cả khi chỉ cần đọc thông tin tổng quát của đơn hàng.
6. **CartService vi phạm nguyên lý Stateless**:
   - `CartService.java` đang gắn `@SessionScope` và lưu danh sách giỏ hàng vãng lai trong mảng in-memory `sessionCartItems`.

---

## 2. Chi tiết các công việc cần thực hiện

### Bước 2.1: Chuyển đổi Migration từ Flyway sang Liquibase
- [ ] **Cập nhật `pom.xml`**:
  - Gỡ bỏ `spring-boot-starter-flyway` và `flyway-mysql`.
  - Thêm `liquibase-core`:
    ```xml
    <dependency>
        <groupId>org.liquibase</groupId>
        <artifactId>liquibase-core</artifactId>
    </dependency>
    ```
- [ ] **Cập nhật `application.properties`**:
  ```properties
  # Tắt Flyway
  # spring.flyway.enabled=false

  # Cấu hình Liquibase
  spring.liquibase.enabled=true
  spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml
  ```
- [ ] **Tạo cấu trúc thư mục Liquibase**:
  ```text
  src/main/resources/db/changelog/
  +-- db.changelog-master.yaml
  +-- changes/
      +-- 001-initial-schema.yaml
      +-- 002-add-categories-table.yaml
      +-- 003-add-auditing-columns.yaml
      +-- 004-seed-initial-data.yaml
  ```
- [ ] **Chuyển đổi toàn bộ schema cũ sang Liquibase ChangeSets**:
  - Hợp nhất 14 file SQL cũ (`V1` đến `V14`) thành ChangeSet chuẩn hóa (gồm các bảng `users`, `categories`, `products`, `orders`, `order_items`, `cart_items`, `addresses`, `product_reviews`, `inventory_transactions`, `purchase_receipts`, `contact_messages`, `order_status_history`, `return_history`).
  - Thiết lập đầy đủ Foreign Keys, Constraints (`NOT NULL`, `UNIQUE`) và Indexes (`idx_products_category`, `idx_orders_user_id`, `idx_orders_status`).

---

### Bước 2.2: Thiết kế Base Entity & JPA Auditing
- [ ] **Tạo `BaseEntity.java`**:
  ```java
  package com.example.hebekery.model;

  import jakarta.persistence.*;
  import org.springframework.data.annotation.CreatedBy;
  import org.springframework.data.annotation.CreatedDate;
  import org.springframework.data.annotation.LastModifiedBy;
  import org.springframework.data.annotation.LastModifiedDate;
  import org.springframework.data.jpa.domain.support.AuditingEntityListener;
  import java.time.LocalDateTime;

  @MappedSuperclass
  @EntityListeners(AuditingEntityListener.class)
  public abstract class BaseEntity {
      @CreatedDate
      @Column(name = "created_at", nullable = false, updatable = false)
      private LocalDateTime createdAt;

      @LastModifiedDate
      @Column(name = "updated_at")
      private LocalDateTime updatedAt;

      @CreatedBy
      @Column(name = "created_by", updatable = false)
      private String createdBy;

      @LastModifiedBy
      @Column(name = "updated_by")
      private String updatedBy;

      // Getters & Setters
  }
  ```
- [ ] **Tạo `JpaAuditingConfig.java`**:
  ```java
  @Configuration
  @EnableJpaAuditing(auditorAwareRef = "auditorProvider")
  public class JpaAuditingConfig {
      @Bean
      public AuditorAware<String> auditorProvider() {
          return () -> Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                  .filter(Authentication::isAuthenticated)
                  .map(Authentication::getName);
      }
  }
  ```
- [ ] Cập nhật toàn bộ các Entity kế thừa `BaseEntity`.

---

### Bước 2.3: Chuẩn hóa Khóa chính & Quan hệ Thực thể
- [ ] **Chuẩn hóa Primary Key**:
  - Các bảng nghiệp vụ phát sinh nhiều bản ghi: Chuyển sang `UUID` (chuỗi 36 ký tự ngẫu nhiên hoặc UUIDv7) hoặc `BIGINT AUTO_INCREMENT`.
  - Bảng `Order`: Sử dụng mã đơn hàng nghiệp vụ riêng biệt (`order_code`, ví dụ: `ORD-20261104-0012`) tách rời với `id` khóa chính kỹ thuật (`BIGINT` hoặc `UUID`).
- [ ] **Chuẩn hóa Bảng Danh mục (`Category`)**:
  - Tạo entity `Category.java`:
    - `id` (Long hoặc UUID)
    - `name` (VARCHAR 100, UNIQUE, NOT NULL)
    - `slug` (VARCHAR 100, UNIQUE, NOT NULL)
    - `description` (VARCHAR 500)
    - `active` (BOOLEAN)
  - Trong `Product.java`:
    - Thay thế trường `private String category;` bằng:
      ```java
      @ManyToOne(fetch = FetchType.LAZY)
      @JoinColumn(name = "category_id", nullable = false)
      private Category category;
      ```
  - Bổ sung `CategoryRepository.java` và `CategoryService.java` (CRUD danh mục cho Admin, lấy danh sách danh mục cho Khách).
- [ ] **Bổ sung cờ `is_featured` cho Sản phẩm**:
  - Thêm cột `is_featured BOOLEAN DEFAULT FALSE` vào bảng `products`.
  - Thay thế logic `getFeaturedProducts()` lọc mã cứng bằng truy vấn database:
    ```java
    List<Product> findByFeaturedTrueAndActiveTrue();
    ```

---

### Bước 2.4: Tối ưu Hóa Truy Vấn & Xóa Bỏ In-Memory Filtering
- [ ] **Tối ưu tìm kiếm sản phẩm**:
  - Xóa bỏ việc kéo toàn bộ sản phẩm vào RAM rồi dùng Stream API.
  - Sử dụng Spring Data JPA Specification hoặc `@Query` kết hợp `Pageable`:
    ```java
    @Query("""
        SELECT p FROM Product p
        WHERE p.active = true
          AND (:categoryId IS NULL OR p.category.id = :categoryId)
          AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    Page<Product> searchProducts(
        @Param("categoryId") Long categoryId,
        @Param("keyword") String keyword,
        Pageable pageable
    );
    ```
- [ ] **Khắc phục N+1 Problem và FetchType.EAGER**:
  - Trong `Order.java`: Sửa `fetch = FetchType.EAGER` thành `fetch = FetchType.LAZY`.
  - Trong `OrderRepository.java`: Sử dụng `@EntityGraph` để nạp `items` khi cần xem chi tiết đơn:
    ```java
    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<Order> findWithItemsById(String id);
    ```

---

### Bước 2.5: Chuyển đổi `CartService` thành Stateless Service
- [ ] **Xóa bỏ `@SessionScope`**:
  - Xóa annotation `@SessionScope` khỏi `CartService.java`.
  - Xóa biến in-memory `private final List<CartItem> sessionCartItems = new ArrayList<>();`.
- [ ] **Chiến lược Quản lý Giỏ hàng Stateless**:
  - **Khách đã đăng nhập**: Quản lý thông qua bảng `cart_items` trong CSDL liên kết với `user_id`.
  - **Khách vãng lai (Guest)**:
    - Lưu giỏ hàng hoàn toàn tại **LocalStorage** của trình duyệt (phía Client).
    - Khi khách đăng nhập: Client gửi danh sách giỏ hàng local lên endpoint `POST /api/cart/sync` để đồng bộ vào database.
    - Khi khách vãng lai thanh toán: Gửi toàn bộ danh sách item kèm payload checkout để backend xác thực tồn kho và tính tổng tiền trực tiếp.

---

## 3. Tiêu chí nghiệm thu Giai đoạn 2 (Acceptance Criteria)

1. **Liquibase**:
   - Khi chạy ứng dụng, bảng `DATABASECHANGELOG` và `DATABASECHANGELOGLOCK` được tự động tạo và cập nhật đầy đủ các ChangeSets mà không có lỗi.
2. **Auditing**:
   - Khi tạo mới hoặc cập nhật bất kỳ bản ghi nào (User, Product, Order), các trường `created_at`, `updated_at`, `created_by`, `updated_by` được tự động điền giá trị chính xác.
3. **Hiệu năng & Database**:
   - Không còn hàm nào trong `ProductService` hoặc `OrderService` đọc toàn bộ bảng ra RAM để lọc.
   - Thao tác tìm kiếm sản phẩm phân trang thực hiện hoàn toàn dưới câu lệnh SQL `LIMIT ... OFFSET ...` của MySQL.
   - Bảng danh mục `categories` hoạt động độc lập, có thể thêm/sửa/xóa danh mục từ trang quản trị.
4. **Stateless**:
   - `CartService` hoạt động ổn định ở scope Singleton, không còn phụ thuộc vào `HttpSession`.
