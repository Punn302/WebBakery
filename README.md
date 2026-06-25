# Hebekery

Hebekery là website thương mại điện tử cho tiệm bánh healthy, xây dựng bằng Spring Boot, Thymeleaf và MySQL. Project có đầy đủ luồng người dùng mua hàng, quản lý admin, tồn kho, nhập hàng, báo cáo doanh thu và đổi trả đơn hàng.

## Tính năng chính

### Người dùng

- Xem trang chủ, giới thiệu, kiến thức dinh dưỡng, BMI, TDEE và liên hệ.
- Xem danh sách sản phẩm, lọc theo danh mục, tìm kiếm, phân trang và xem chi tiết sản phẩm.
- Đăng ký, đăng nhập, đăng xuất, cập nhật hồ sơ và đổi mật khẩu.
- Giỏ hàng lưu theo tài khoản; giỏ khách được gộp lại sau khi đăng nhập.
- Thanh toán COD hoặc MoMo test flow.
- Sổ địa chỉ trong trang profile, có tỉnh/thành, quận/huyện, phường/xã.
- Theo dõi đơn hàng, xem chi tiết đơn, hủy đơn, xác nhận đã nhận hàng.
- Yêu cầu đổi trả sau khi đã nhận hàng, kèm lý do bắt buộc.
- Đánh giá sản phẩm sau khi nhận hàng.

### Quản trị viên

- Dashboard quản trị với thống kê doanh thu, biểu đồ theo thời gian và cảnh báo tồn kho thấp.
- Quản lý người dùng: tìm kiếm, phân trang, đổi trạng thái, phân quyền và reset mật khẩu khách hàng.
- Quản lý sản phẩm: thêm, sửa, ẩn sản phẩm, upload ảnh, preview ảnh lớn, tìm kiếm và phân trang.
- Quản lý đơn hàng: lọc theo trạng thái, ngày, phương thức thanh toán; xem chi tiết, cập nhật vận chuyển, in hóa đơn.
- Xử lý đổi trả: duyệt hoặc từ chối yêu cầu, ghi chú admin và hoàn kho khi duyệt.
- Quản lý liên hệ từ khách hàng.
- Quản lý tồn kho, ngưỡng cảnh báo tồn thấp và lịch sử nhập/xuất/hoàn kho.
- Lập phiếu nhập nhiều sản phẩm, in phiếu nhập.
- Báo cáo doanh thu, giá vốn, lợi nhuận, top sản phẩm bán chạy, in báo cáo, export CSV/PDF.

## Công nghệ sử dụng

- Java 17
- Spring Boot 4.0.6
- Spring MVC
- Spring Data JPA
- Spring Validation
- Spring Security
- Thymeleaf
- MySQL
- Flyway Migration
- OpenPDF
- Maven Wrapper

## Cấu trúc thư mục

```text
src/main/java/com/example/hebekery
+-- config          # Cấu hình security, filter, web resource
+-- controller      # Controller cho user, admin, cart, checkout, order...
+-- dto             # DTO request/response
+-- exception       # Global error response
+-- model           # JPA entity
+-- repository      # Spring Data repository
+-- service         # Business logic

src/main/resources
+-- db/migration    # Flyway migration SQL
+-- static          # CSS, JS, ảnh tĩnh
+-- templates       # Thymeleaf templates
```

## Yêu cầu môi trường

- JDK 17+
- MySQL 8+
- Maven Wrapper đã có sẵn trong project

## Cài đặt và chạy local

1. Clone project:

```bash
git clone <repository-url>
cd Hebekery
```

2. Tạo database MySQL:

```sql
CREATE DATABASE hebekery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Cấu hình biến môi trường.

PowerShell:

```powershell
$env:DB_URL="jdbc:mysql://localhost:3306/hebekery?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Ho_Chi_Minh"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_password"
```

Hoặc cấu hình trực tiếp trong Run Configuration của IDE.

4. Chạy project:

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./mvnw spring-boot:run
```

5. Mở trình duyệt:

```text
http://localhost:8080
```

## Tài khoản demo

Sau khi Flyway chạy migration lần đầu, project có dữ liệu mẫu:

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| User | user@hebekery.vn | 123456 |
| Admin | admin@hebekery.vn | admin123 |

> Lưu ý: tài khoản demo chỉ dùng cho môi trường học tập/local. Khi deploy thật cần đổi mật khẩu, hash lại dữ liệu seed và cấu hình bảo mật production.

## Upload ảnh sản phẩm

Ảnh sản phẩm upload từ admin được lưu ở:

```text
uploads/products
```

Project giới hạn file ảnh tối đa 2MB và hỗ trợ các định dạng `jpg`, `jpeg`, `png`, `webp`, `gif`.

## Database migration

Project dùng Flyway để quản lý schema. Các file migration nằm trong:

```text
src/main/resources/db/migration
```

Khi database đã chạy một migration, không sửa trực tiếp file migration cũ vì sẽ gây lỗi checksum mismatch. Nếu cần thay đổi schema hoặc dữ liệu, hãy tạo migration mới theo thứ tự version tiếp theo, ví dụ:

```text
V15__your_change_name.sql
```

## Cấu hình quan trọng

File cấu hình chính:

```text
src/main/resources/application.properties
```

Các cấu hình đang dùng:

- `DB_URL`: đường dẫn MySQL.
- `DB_USERNAME`: tài khoản MySQL.
- `DB_PASSWORD`: mật khẩu MySQL.
- `spring.jpa.hibernate.ddl-auto=validate`: Hibernate chỉ kiểm tra schema, không tự tạo bảng.
- `spring.flyway.enabled=true`: Flyway tự chạy migration khi khởi động.
- `spring.servlet.multipart.max-file-size=2MB`: giới hạn upload ảnh.

## Lưu ý trước khi public GitHub

- Không commit mật khẩu database, secret key hoặc thông tin thật của cổng thanh toán.
- MoMo hiện là test flow phục vụ demo. Nếu muốn triển khai thanh toán thật, nên chuyển toàn bộ cấu hình MoMo sang biến môi trường.
- Không sửa migration cũ đã chạy trên database.
- Không commit thư mục `target/`.
- Nên cân nhắc không commit dữ liệu upload thật trong `uploads/products/` nếu đó là dữ liệu production.

## Một số lỗi thường gặp

### Port 8080 đã được sử dụng

Dừng process đang chiếm port 8080 hoặc đổi `server.port` trong `application.properties`.

### Flyway checksum mismatch

Lỗi này xảy ra khi file migration cũ bị sửa sau khi đã chạy trên database. Cách xử lý đúng là khôi phục file migration cũ và tạo migration mới cho thay đổi tiếp theo.

### Schema validation: missing table

Kiểm tra lại database đã tạo đúng tên, biến môi trường `DB_URL` đã trỏ đúng database và Flyway đã chạy migration thành công.

### AccessDeniedException khi compile/package

Nếu app đang chạy hoặc IDE đang giữ file trong `target/`, hãy dừng ứng dụng rồi chạy lại lệnh Maven.

## Trạng thái project

Project phù hợp để demo hoặc phát triển tiếp thành website bán hàng hoàn chỉnh. Các phần nên gia cố trước khi production gồm: bảo mật role-based đầy đủ, tách secret sang environment variables, kiểm thử tự động, logging/audit, hardening CSRF/session và cấu hình deploy.
