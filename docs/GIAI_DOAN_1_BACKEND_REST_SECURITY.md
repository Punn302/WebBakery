# KẾ HOẠCH GIAI ĐOẠN 1: CHUẨN HÓA BACKEND RESTful API & BẢO MẬT (SECURITY & JWT)

> **Mục tiêu**: Chuyển đổi toàn diện từ kiến trúc Monolithic Web MVC (Thymeleaf + HTTP Session) sang kiến trúc **RESTful API chuẩn**, bảo mật bằng **Spring Security + JWT (Stateless)**, xóa bỏ toàn bộ mã cứng (hardcoded secrets) và chuẩn hóa luồng trao đổi dữ liệu qua DTO & ApiResponse.
> **Tài liệu đối chiếu**: `BE_Training_Plan_v1 1.pdf` — Phần 2 (OOP & SOLID), Phần 3 (Spring Framework, REST API, Spring Security + JWT).

---

## 1. Danh sách vấn đề cần giải quyết triệt để

1. **Vấn đề bảo mật & xác thực**:
   - `SecurityConfig.java`: Đang mở toàn bộ quyền `.anyRequest().permitAll()`, tắt CSRF.
   - Authentication đang phụ thuộc vào `HttpSession` và bộ lọc tự viết `AdminAccessFilter.java`.
   - `UserService.java`: Có logic chấp nhận mật khẩu plain-text cũ (`storedPassword.equals(rawPassword)`).
   - Kiểm tra quyền hạn bằng code thủ công `requireAdmin()`, `requireLogin()` thay vì Spring Security.
2. **Lộ thông tin bí mật (Hardcoded Secrets)**:
   - `OrderService.java`: Các thông tin cấu hình cổng thanh toán cũ bị hardcode trong mã nguồn.
3. **Phá vỡ tính phân tách trách nhiệm (SRP - God Controller)**:
   - `AdminController.java`: Dài gần 500 dòng, gánh cả User, Product, Order, Report, Inventory, Contact, vừa trả về View Thymeleaf vừa trả về JSON.
   - `ProductController.java`: Vừa trả redirect view vừa trả JSON API.
4. **Không nhất quán trong API Response**:
   - Nơi dùng `ApiResponse.java`, nơi tự tạo `Map<String, Object>` bằng `new HashMap<>()` rồi trả về.
   - Trả trực tiếp JPA Entity (`Order`, `Product`, `Address`, `ProductReview`) ra ngoài Controller gây nguy cơ rò rỉ dữ liệu hoặc lỗi Lazy loading.
5. **Global Exception Handling chưa toàn diện**:
   - Thiếu bắt các ngoại lệ bảo mật: `BadCredentialsException`, `AccessDeniedException`, `AuthenticationException`.

---

## 2. Chi tiết các công việc cần thực hiện

### Bước 1.1: Cấu hình Dependency trong `pom.xml`
- [x] Bổ sung các thư viện cần thiết cho JWT & Cloudinary:
  ```xml
  <!-- JWT Support -->
  <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-api</artifactId>
      <version>0.12.6</version>
  </dependency>
  <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-impl</artifactId>
      <version>0.12.6</version>
      <scope>runtime</scope>
  </dependency>
  <dependency>
      <groupId>io.jsonwebtoken</groupId>
      <artifactId>jjwt-jackson</artifactId>
      <version>0.12.6</version>
      <scope>runtime</scope>
  </dependency>

  <!-- Cloudinary SDK for Cloud Media Storage -->
  <dependency>
      <groupId>com.cloudinary</groupId>
      <artifactId>cloudinary-http44</artifactId>
      <version>1.38.0</version>
  </dependency>
  ```
- [ ] Loại bỏ dependency `spring-boot-starter-thymeleaf` (khi đã hoàn thành chuyển đổi sang REST API hoàn toàn).

---

### Bước 1.2: Đưa Secrets ra Biến Môi Trường & Cấu Hình
- [x] Thêm các thuộc tính vào `src/main/resources/application.properties` và tạo file mẫu `.env.example`:
  ```properties
  # JWT Configuration
  jwt.secret=${JWT_SECRET:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}
  jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}          # 1 ngày
  jwt.refresh-expiration-ms=${JWT_REFRESH_EXPIRATION_MS:604800000} # 7 ngày

  # SePay & VietQR Payment Configuration (Tự động hóa chuyển khoản)
  sepay.webhook-api-key=${SEPAY_WEBHOOK_API_KEY:sepay_secret_key_12345}
  sepay.account-number=${SEPAY_ACCOUNT_NUMBER:0987654321}
  sepay.bank-code=${SEPAY_BANK_CODE:MBBank}
  sepay.account-holder=${SEPAY_ACCOUNT_HOLDER:TIEM BANH HEBEKERY}

  # Cloudinary Media Configuration (Cloud Storage & CDN)
  cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME:}
  cloudinary.api-key=${CLOUDINARY_API_KEY:}
  cloudinary.api-secret=${CLOUDINARY_API_SECRET:}
  ```
- [x] Tạo class `SepayConfig.java` với `@ConfigurationProperties(prefix = "sepay")` hoặc inject thông qua `@Value`.
- [x] Cập nhật `OrderService.java` để inject cấu hình, xóa hoàn toàn các hằng số MoMo hardcode cũ.
- [x] **Tạo cấu hình và dịch vụ Cloudinary**:
  - Tạo `CloudinaryConfig.java`: Khởi tạo Bean `Cloudinary` nạp từ properties.
  - Tạo Interface `UploadService.java` (Clean Architecture / DIP):
    - `UploadResult uploadImage(MultipartFile file, String folder)`
    - `void deleteImage(String publicId)`
  - Triển khai `CloudinaryUploadService.java`: Tải ảnh lên Cloudinary, tự động nén tối ưu, trả về `secure_url` và `public_id`. Chấm dứt việc lưu trữ file trên ổ cứng local (`/uploads`).

---

### Bước 1.3: Xây dựng Cơ chế Xác thực Spring Security + JWT (Stateless)
- [x] **Tạo `JwtTokenProvider.java`**:
  - `generateToken(Authentication authentication)`
  - `generateRefreshToken(String username)`
  - `getUsernameFromToken(String token)`
  - `validateToken(String token)`
- [x] **Tạo `CustomUserDetails.java` và `CustomUserDetailsService.java`**:
  - Cài đặt `UserDetailsService` từ Spring Security.
  - Tải người dùng từ `UserRepository.findByEmailIgnoreCase()`.
  - Gán quyền `ROLE_USER` hoặc `ROLE_ADMIN` dựa theo trường `role` trong bảng `users`.
- [x] **Tạo `JwtAuthenticationFilter.java`**:
  - Kế thừa `OncePerRequestFilter`.
  - Trích xuất token từ header `Authorization: Bearer <token>`.
  - Xác thực token và gán `UsernamePasswordAuthenticationToken` vào `SecurityContextHolder`.
- [x] **Tạo `JwtAuthenticationEntryPoint.java`**:
  - Trả về mã lỗi HTTP `401 Unauthorized` dạng JSON đồng nhất khi chưa xác thực.
- [x] **Tạo `CustomAccessDeniedHandler.java`**:
  - Trả về mã lỗi HTTP `403 Forbidden` dạng JSON đồng nhất khi không đủ quyền hạn.
- [x] **Tái cấu trúc `SecurityConfig.java`**:
  - Kích hoạt `@EnableWebSecurity` và `@EnableMethodSecurity`.
  - Cấu hình `SecurityFilterChain`:
    - `sessionManagement` -> `SessionCreationPolicy.STATELESS`.
    - `csrf` -> `disable`.
    - `cors` -> Cấu hình cho phép Frontend truy cập (Origin: `http://localhost:3000`, `http://localhost:5173`).
    - Phân quyền URL:
      - Public: `/api/auth/**`, `/api/products/**` (GET), `/api/payment/sepay/webhook`, `/swagger-ui/**`, `/v3/api-docs/**`.
      - Quyền User: `/api/user/**`, `/api/cart/**`, `/api/checkout/**`.
      - Quyền Nhân viên & Admin: Phân quyền theo RBAC `@PreAuthorize` cho 4 vai trò (`ADMIN`, `STAFF_WAREHOUSE`, `STAFF_SALES`, `USER`).
      - Quyền Upload Media: `/api/upload/**` (Admin và Thủ kho).
  - Đăng ký `JwtAuthenticationFilter` trước `UsernamePasswordAuthenticationFilter`.
- [x] **Xóa bỏ các thành phần lỗi thời**:
  - Xóa `AdminAccessFilter.java`.
  - Xóa logic lưu thông tin user trong `HttpSession` tại `UserService.java`.
  - Xóa bỏ logic hỗ trợ plain-text password fallback trong `UserService.passwordMatches()`.

---

### Bước 1.4: Tách nhỏ các Controller (Phá vỡ God Controller)
- [ ] **Tạo `AuthController.java` (`/api/auth`)**:
  - `POST /api/auth/login`: Nhận `LoginRequest`, xác thực qua `AuthenticationManager`, sinh và trả về `AuthResponse` (Access token, Refresh token, User profile).
  - `POST /api/auth/register`: Nhận `RegisterRequest`, mã hóa password bằng BCrypt, lưu User mới.
  - `POST /api/auth/refresh-token`: Cấp access token mới từ refresh token hợp lệ.
  - `POST /api/auth/logout`: Hủy token hoặc xóa thông tin ở phía client.
- [ ] **Phân rã `AdminController.java` thành các REST Controller độc lập**:
  - `AdminUserController.java` (`/api/admin/users`):
    - `GET /api/admin/users`: Tìm kiếm, phân trang user.
    - `PUT /api/admin/users/{id}/role`: Phân quyền user.
    - `PATCH /api/admin/users/{id}/status`: Kích hoạt / Khóa tài khoản.
    - `POST /api/admin/users/{id}/reset-password`: Reset mật khẩu.
  - `AdminProductController.java` (`/api/admin/products`):
    - `POST /api/admin/products`: Tạo mới sản phẩm (nhận URL ảnh đã upload hoặc hỗ trợ multipart trực tiếp lên Cloudinary).
    - `PUT /api/admin/products/{id}`: Cập nhật sản phẩm và đổi ảnh.
    - `DELETE /api/admin/products/{id}`: Ẩn/xóa sản phẩm (hỗ trợ xóa ảnh trên Cloudinary nếu cần).
  - `UploadController.java` (`/api/upload`):
    - `POST /api/upload/image`: Tiếp nhận file ảnh (`MultipartFile`), đẩy lên Cloudinary, trả về `UploadResponse` chứa `url` và `publicId`.
  - `AdminOrderController.java` (`/api/admin/orders`):
    - `GET /api/admin/orders`: Lọc đơn theo trạng thái, ngày tháng, tìm kiếm, phân trang.
    - `GET /api/admin/orders/{id}`: Xem chi tiết đơn hàng admin.
    - `PUT /api/admin/orders/{id}/status`: Cập nhật trạng thái đơn (SHIPPING, DELIVERED).
    - `PUT /api/admin/orders/{id}/shipping`: Cập nhật mã vận đơn.
    - `PUT /api/admin/orders/{id}/note`: Thêm ghi chú admin.
    - `POST /api/admin/orders/{id}/returns/approve`: Duyệt đổi trả và hoàn kho.
    - `POST /api/admin/orders/{id}/returns/reject`: Từ chối đổi trả.
  - `AdminInventoryController.java` (`/api/admin/inventory`):
    - `GET /api/admin/inventory`: Thống kê tồn kho, cảnh báo tồn thấp.
    - `POST /api/admin/inventory/purchase-receipt`: Tạo phiếu nhập hàng.
    - `GET /api/admin/inventory/transactions`: Lịch sử biến động kho.
  - `AdminReportController.java` (`/api/admin/reports`):
    - `GET /api/admin/reports/summary`: Thống kê doanh thu, giá vốn, lợi nhuận.
    - `GET /api/admin/reports/revenue-trend`: Biểu đồ doanh thu theo tuần/tháng.
    - `GET /api/admin/reports/export/csv`: Xuất file CSV báo cáo.
    - `GET /api/admin/reports/export/pdf`: Xuất file PDF báo cáo (dùng OpenPDF).
  - `AdminContactController.java` (`/api/admin/contacts`):
    - `GET /api/admin/contacts`: Danh sách phản hồi.
    - `PATCH /api/admin/contacts/{id}/status`: Đổi trạng thái xử lý liên hệ.
- [ ] **Tách `ProductController.java`**:
  - Chuyển thành `@RestController` thuần túy tại `/api/products`.
  - Bỏ endpoint chuyển hướng `/search`.

---

### Bước 1.5: Chuẩn hóa Định dạng DTO & Wrapper `ApiResponse<T>`
- [ ] Chuẩn hóa `com.example.hebekery.dto.ApiResponse<T>`:
  ```java
  public class ApiResponse<T> {
      private boolean success;
      private String message;
      private T data;
      private Map<String, String> errors;
      private LocalDateTime timestamp = LocalDateTime.now();

      public static <T> ApiResponse<T> success(T data) { ... }
      public static <T> ApiResponse<T> success(String message, T data) { ... }
      public static <T> ApiResponse<T> error(String message) { ... }
      public static <T> ApiResponse<T> error(String message, Map<String, String> errors) { ... }
  }
  ```
- [ ] Tạo đầy đủ các Response DTO để không làm lộ Entity:
  - `AuthResponse.java` (token, refreshToken, user)
  - `ProductDetailResponse.java`, `ProductListResponse.java`
  - `OrderDetailResponse.java`, `OrderItemResponse.java`
  - `AddressResponse.java`
  - `InventoryTransactionResponse.java`
  - `UploadResponse.java` (url, publicId, format, size)
- [ ] Xóa bỏ toàn bộ các hàm trả về `Map<String, Object>` ở Controller.

---

### Bước 1.6: Hoàn thiện `GlobalExceptionHandler.java`
- [ ] Bổ sung handler cho các lỗi bảo mật và xác thực:
  - `BadCredentialsException` -> 401 Unauthorized.
  - `AccessDeniedException` -> 403 Forbidden.
  - `SignatureException`, `MalformedJwtException`, `ExpiredJwtException` -> 401 Unauthorized.
  - `EntityNotFoundException` / `ResourceNotFoundException` -> 404 Not Found.
  - `MethodArgumentNotValidException` -> 400 Bad Request kèm chi tiết field errors.
  - `MaxUploadSizeExceededException` -> 400 Bad Request ("File vượt quá dung lượng cho phép").

---

## 3. Tiêu chí nghiệm thu Giai đoạn 1 (Acceptance Criteria)

1. **Khởi động**: Ứng dụng chạy trên cổng 8080 không phụ thuộc vào Thymeleaf View Resolver.
2. **Bảo mật**:
   - Truy cập các endpoint `/api/admin/**` khi chưa đăng nhập trả về mã HTTP `401`.
   - Đăng nhập bằng tài khoản `ROLE_USER` rồi gọi `/api/admin/**` trả về mã HTTP `403`.
   - Đăng nhập trả về JWT hợp lệ; truyền token vào header `Authorization: Bearer <token>` thực hiện được các thao tác được cấp quyền.
3. **Mã nguồn & Lưu trữ**:
   - Không còn bất kỳ secret key nào bị hardcode.
   - Không còn Controller nào dài quá 200 dòng, không còn `new HashMap<>()` để build response.
   - Toàn bộ endpoint trả về đúng mã HTTP Status (200, 201, 400, 401, 403, 404).
   - Tải ảnh thành công lên Cloudinary, trả về HTTPS URL (`secure_url`), xóa bỏ hoàn toàn việc lưu ảnh cục bộ trên ổ đĩa máy chủ (`/uploads`).
