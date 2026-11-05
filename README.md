# 🥐 Tiệm Bánh Dinh Dưỡng Hebekery

Website thương mại điện tử chuyên cung cấp các dòng bánh, hạt và ngũ cốc dinh dưỡng lành mạnh (Healthy Bakery, Eat Clean, Granola, Biscotti). Hệ thống bao gồm Frontend React 19 SPA, Backend Spring Boot 3.4 RESTful API, tự động hóa thanh toán VietQR SePay và trọn gói triển khai Docker Compose.

---

## 📸 Hình ảnh giao diện thực tế (Screenshots)

### 1. Trang chủ (Homepage & Menu)
![Trang chủ Hebekery](docs/screenshots/home.png)

### 2. Công cụ tính BMI, TDEE & Gợi ý thực đơn dinh dưỡng
![Công cụ BMI & Combo 7 ngày](docs/screenshots/bmi.png)

### 3. Tra cứu đơn hàng công khai (Không cần đăng nhập)
![Tra cứu đơn hàng](docs/screenshots/order-lookup.png)

### 4. Tài liệu Swagger OpenAPI tương tác trực tiếp
![Swagger UI Documentation](docs/screenshots/swagger.png)

---

## ⚡ Hướng dẫn khởi chạy nhanh (Quick Start)

### Cách 1: Khởi chạy 1 lệnh với Docker Compose (Khuyến nghị)

Chỉ cần máy bạn đã cài **Docker Desktop**:

```bash
# 1. Tạo file cấu hình môi trường từ mẫu
cp .env.example .env

# 2. Khởi chạy toàn bộ hệ thống (MySQL, Backend, Frontend, Nginx Gateway)
docker compose up -d --build
```

Sau khi chạy xong, mở trình duyệt truy cập:
- 🌐 **Website**: [http://localhost](http://localhost)
- 📑 **Swagger API Docs**: [http://localhost/swagger-ui/index.html](http://localhost/swagger-ui/index.html)

---

### Cách 2: Chạy môi trường phát triển cục bộ (Local Dev)

Yêu cầu: **JDK 17+**, **Node.js 22+**, **MySQL 8.0+** (đã tạo database `hebekery`).

**1. Khởi chạy Backend (Spring Boot 3.4)**
```bash
./mvnw clean spring-boot:run
```
> Backend chạy tại: `http://localhost:8080` (Tự động nạp dữ liệu mẫu ban đầu qua Liquibase).

**2. Khởi chạy Frontend (React 19 Vite)**
```bash
cd web-bakery-frontend
npm install
npm run dev
```
> Frontend chạy tại: `http://localhost:5173`.

---

## 🔐 Tài khoản đăng nhập dùng thử (Demo Accounts)

Hệ thống có sẵn các tài khoản demo tương ứng với từng nhóm vai trò:

| Vai trò (Role) | Email đăng nhập | Mật khẩu mặc định | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (`ADMIN`)** | `admin@hebekery.vn` | `password123` | Quản trị người dùng, sản phẩm, tồn kho, đơn hàng, báo cáo doanh thu |
| **Nhân viên Sale (`STAFF_SALES`)** | `staff.sales@hebekery.vn` | `password123` | Xử lý duyệt đơn hàng, cập nhật giao hàng, phản hồi liên hệ khách |
| **Nhân viên Kho (`STAFF_WAREHOUSE`)**| `staff.warehouse@hebekery.vn` | `password123` | Quản lý sản phẩm, danh mục, kiểm kê số lượng tồn kho |
| **Khách hàng (`USER`)** | `user@hebekery.vn` | `password123` | Mua hàng, tính BMI, thanh toán VietQR / COD, đánh giá sản phẩm |

---

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, Vitest.
- **Backend**: Spring Boot 3.4.x (Java 17), Spring Security 6 (JWT & RBAC), Spring Data JPA, Liquibase.
- **Thanh toán**: Tự động đối soát giao dịch VietQR ngân hàng qua Webhook SePay (15 phút).
- **Hạ tầng**: Docker, Docker Compose (4 containers: MySQL, Backend, Frontend, Nginx Reverse Proxy Gateway).

---

## 🧪 Kiểm thử tự động (Automated Tests)

- **Backend**: 107/107 JUnit 5 & MockMvc tests Passed (100%).
- **Frontend**: 12/12 Vitest tests Passed (100%).
- **CI/CD**: Tự động kiểm thử qua GitHub Actions trên mỗi lần đẩy mã nguồn.
