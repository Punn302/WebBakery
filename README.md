# 🥐 Tiệm Bánh Dinh Dưỡng Hebekery (Healthy Bakery E-Commerce System)

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-blue?logo=githubactions)](https://github.com)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.x-brightgreen?logo=springboot)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)](https://www.oracle.com/java/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-purple?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38b2ac?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose%20v2-2496ed?logo=docker)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Alpine-green?logo=nginx)](https://nginx.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479a1?logo=mysql)](https://www.mysql.com/)
[![Liquibase](https://img.shields.io/badge/Liquibase-Database%20Migration-red?logo=liquibase)](https://www.liquibase.org/)

---

## 📖 1. Tổng quan hệ thống (System Overview)

**Hebekery** là nền tảng thương mại điện tử chuyên nghiệp cung cấp các dòng bánh, hạt và ngũ cốc dinh dưỡng lành mạnh (Healthy Bakery, Eat Clean, Granola, Biscotti, Bánh ăn kiêng). 

Hệ thống được phát triển theo kiến trúc **Full-Stack Decoupled (Phân tách độc lập)**:
- **Frontend SPA (Single-Page Application)**: Xây dựng trên nền tảng **React 19 + TypeScript + Vite + Tailwind CSS**, giao diện tối ưu trải nghiệm khách hàng với tính năng tính toán chỉ số BMI, gợi ý thực đơn 7 ngày, giỏ hàng real-time, sổ địa chỉ giao hàng nhiều cấp, thanh toán VietQR tự động và tra cứu trạng thái đơn hàng công khai.
- **Backend API Server**: Sử dụng **Spring Boot 3.4.x (Java 17)** với Spring Security 6, xác thực stateless JWT, phân quyền đa vai trò (RBAC), Spring Data JPA kết hợp Liquibase Database Migration.
- **Cổng thanh toán tự động SePay Webhook**: Hỗ trợ quét mã VietQR động, đối soát giao dịch ngân hàng theo thời gian thực (real-time polling 3s), scheduler tự động hủy đơn quá hạn 15 phút.
- **DevOps & Điều phối hạ tầng (Reverse Proxy Gateway)**: Đóng gói toàn bộ 4 dịch vụ (`mysql`, `backend`, `frontend`, `nginx`) trong **Docker Compose**, cổng 80 được phân luồng đồng nhất qua Nginx Reverse Proxy.
- **Tự động hóa CI/CD**: Pipeline GitHub Actions chạy tự động toàn bộ 107 bài kiểm thử Backend (JUnit 5 / MockMvc) và 12 bài kiểm thử Frontend (Vitest / React Testing Library) trên môi trường Node.js 22 & Java 17.

---

## 🏛️ 2. Kiến trúc hệ thống (Architecture)

### Sơ đồ điều phối luồng mạng Docker Gateway (Port 80 Unified Entrypoint)

```
                       [ Trình duyệt Khách hàng / Quản trị viên ]
                                         │
                                         ▼ (HTTP Port 80)
                       ┌────────────────────────────────────────┐
                       │           hebekery_nginx               │
                       │     (Nginx Reverse Proxy Gateway)      │
                       └──────────────────┬─────────────────────┘
                                          │
                     ┌────────────────────┴────────────────────┐
       / (Root & SPA Routing)                     /api/ & /swagger-ui/
                     │                                         │
                     ▼                                         ▼
         ┌───────────────────────┐                 ┌───────────────────────┐
         │   hebekery_frontend   │                 │   hebekery_backend    │
         │  (React 19 SPA Nginx) │                 │  (Spring Boot 3.4.x)  │
         │     Port 80 (int)     │                 │     Port 8080         │
         └───────────────────────┘                 └───────────┬───────────┘
                                                               │ (Port 3306)
                                                               ▼
                                                   ┌───────────────────────┐
                                                   │    hebekery_mysql     │
                                                   │   (MySQL 8.0 Server)  │
                                                   │ Liquibase Migrations  │
                                                   └───────────────────────┘
```

---

## 👥 3. Phân quyền người dùng (RBAC) & Tài khoản mẫu (Demo Credentials)

Hệ thống áp dụng mô hình phân quyền chặt chẽ trên cả Backend (`@PreAuthorize`) và Frontend (`ProtectedRoute` & RBAC Navigation Guard):

| Vai trò (Role) | Email đăng nhập | Mật khẩu mặc định | Quyền hạn và Chức năng chính |
| :--- | :--- | :--- | :--- |
| **`ADMIN`** | `admin@hebekery.vn` | `password123` | **Toàn quyền hệ thống**: Quản lý người dùng & phân quyền (`/admin/users`), cấu hình hệ thống, quản lý sản phẩm & danh mục (`/admin/products`), quản lý đơn hàng (`/admin/orders`), kiểm kê tồn kho (`/admin/inventory`), xem báo cáo doanh thu (`/admin/reports`), quản lý phản hồi liên hệ (`/admin/contacts`). |
| **`STAFF_SALES`** | `staff.sales@hebekery.vn` | `password123` | **Nhân viên bán hàng**: Quản lý & xử lý đơn hàng (`/admin/orders`), cập nhật trạng thái thanh toán và giao vận, tiếp nhận và phản hồi thư liên hệ khách hàng (`/admin/contacts`). |
| **`STAFF_WAREHOUSE`** | `staff.warehouse@hebekery.vn` | `password123` | **Nhân viên kho vận**: Quản lý danh mục & sản phẩm (`/admin/products`), kiểm soát số lượng tồn kho & nhận cảnh báo hàng sắp hết (`/admin/inventory`). |
| **`USER`** | `user@hebekery.vn` | `password123` | **Khách hàng**: Đăng ký/đăng nhập, mua hàng, tính chỉ số BMI cá nhân hóa, thanh toán COD / VietQR SePay, quản lý sổ địa chỉ giao hàng (`/profile`), đánh giá đơn hàng đã nhận, tra cứu đơn công khai (`/tra-cuu-don-hang`). |

*(Lưu ý: Mật khẩu của các tài khoản đã được mã hóa bằng thuật toán BCrypt trong cơ sở dữ liệu).*

---

## ⚙️ 4. Cấu hình biến môi trường (`.env` & API Keys)

Hệ thống cung cấp sẵn file mẫu [`.env.example`](file:///c:/project/WebBakery/.env.example). Để khởi chạy môi trường thực tế, hãy sao chép thành file `.env`:

```bash
cp .env.example .env
```

### Bảng chi tiết các biến môi trường:

| Tên biến (Env Variable) | Giá trị mặc định (Default) | Mục đích / Giải thích |
| :--- | :--- | :--- |
| `DB_URL` | `jdbc:mysql://localhost:3306/hebekery?...` | Chuỗi kết nối JDBC tới cơ sở dữ liệu MySQL (trong Docker Compose tự động nối `mysql:3306`). |
| `DB_USERNAME` | `root` | Tên tài khoản quản trị MySQL. |
| `DB_PASSWORD` | `root_password` | Mật khẩu truy cập MySQL. |
| `JWT_SECRET` | `404E635266556A586E32...` | Chuỗi khóa bí mật (HMAC-SHA256) dùng để ký và xác thực JWT token. |
| `JWT_EXPIRATION_MS` | `86400000` (24 giờ) | Thời gian hiệu lực của Access Token. |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` (7 ngày) | Thời gian hiệu lực của Refresh Token. |
| `SEPAY_WEBHOOK_API_KEY` | `sepay_secret_key_12345` | API Key dùng để xác thực Webhook đối soát tự động từ cổng SePay. |
| `SEPAY_ACCOUNT_NUMBER` | `0987654321` | Số tài khoản ngân hàng thụ hưởng hiển thị trên VietQR. |
| `SEPAY_BANK_CODE` | `MBBank` | Mã ngân hàng thụ hưởng (MBBank, Vietcombank, Techcombank, TPBank,...). |
| `SEPAY_ACCOUNT_HOLDER` | `TIEM BANH HEBEKERY` | Tên chủ tài khoản thụ hưởng hiển thị trên mã VietQR. |
| `CLOUDINARY_CLOUD_NAME` | *(Tùy chọn)* | Tên Cloudinary Cloud dùng để lưu trữ ảnh sản phẩm lên CDN. |
| `CLOUDINARY_API_KEY` | *(Tùy chọn)* | API Key tài khoản Cloudinary. |
| `CLOUDINARY_API_SECRET` | *(Tùy chọn)* | API Secret tài khoản Cloudinary. |

### 🔑 Tư vấn về các API Key bên ngoài:
1. **SePay Webhook & VietQR Payment**:
   - *Mục đích*: Tự động đối soát giao dịch chuyển khoản ngân hàng 24/7 không cần can thiệp thủ công. Khi khách hàng quét mã VietQR và hoàn tất chuyển khoản, SePay gửi Webhook đến endpoint `/api/payment/sepay/webhook`, hệ thống đối soát mã đơn hàng và tự động chuyển trạng thái đơn sang `PAID`.
   - *Môi trường kiểm thử / Demo*: Hệ thống đã cấu hình sẵn giá trị fallback an toàn (`sepay_secret_key_12345`). Khách hàng trên giao diện có thể kiểm tra trực tiếp qua modal QR đếm ngược 15:00 và polling trạng thái mỗi 3 giây.
   - *Khi triển khai Production*: Đăng ký tài khoản miễn phí tại [my.sepay.vn](https://my.sepay.vn), liên kết tài khoản ngân hàng của bạn, tạo Webhook URL trỏ về `https://your-domain.com/api/payment/sepay/webhook` và sao chép API Key vào biến `SEPAY_WEBHOOK_API_KEY`.
2. **Cloudinary Media Storage & CDN**:
   - *Mục đích*: Lưu trữ và tối ưu hóa hình ảnh sản phẩm/banner tải lên từ Admin Dashboard lên máy chủ CDN toàn cầu.
   - *Môi trường kiểm thử*: Nếu để trống, hệ thống sử dụng thư mục uploads cục bộ (`/uploads`) mà không gây lỗi runtime.
   - *Khi triển khai Production*: Đăng ký tài khoản miễn phí tại [cloudinary.com](https://cloudinary.com) và điền 3 thông số `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` vào file `.env`.

---

## 🚀 5. Hướng dẫn khởi chạy hệ thống (Deployment & Run Guide)

### Cách 1: Khởi chạy 1-Click bằng Docker Compose (Khuyến nghị)

Yêu cầu máy chủ đã cài đặt [Docker](https://docs.docker.com/get-docker/) và Docker Compose.

```bash
# 1. Clone mã nguồn
git clone https://github.com/hieukompa123/WebBakery.git
cd WebBakery

# 2. Khởi tạo cấu hình môi trường
cp .env.example .env

# 3. Build và khởi động 4 dịch vụ (MySQL, Backend, Frontend, Nginx Gateway)
docker compose up -d --build
```

Sau khi các container khởi động hoàn tất:
- 🌐 **Trang chủ Khách hàng & SPA Frontend**: [http://localhost](http://localhost)
- 📊 **Cổng Admin & Quản trị**: [http://localhost/admin/orders](http://localhost/admin/orders)
- 📑 **Swagger UI / OpenAPI Documentation**: [http://localhost/swagger-ui/index.html](http://localhost/swagger-ui/index.html)
- 🔌 **RESTful API Direct Endpoint**: [http://localhost/api/products](http://localhost/api/products)

Để kiểm tra trạng thái và log hoạt động:
```bash
# Xem danh sách container đang chạy
docker compose ps

# Xem log thời gian thực của backend
docker compose logs -f backend

# Dừng toàn bộ hệ thống
docker compose down
```

---

### Cách 2: Chạy môi trường phát triển cục bộ (Local Development)

#### Yêu cầu tiên quyết:
- **Java JDK 17+**
- **Node.js 22+** và npm
- **MySQL Server 8.0+** (đang chạy tại cổng 3306, đã tạo schema `hebekery`)

#### Bước 1: Khởi động Backend (Spring Boot 3.4.x)
```bash
# Tại thư mục gốc dự án
./mvnw clean spring-boot:run
```
*(Backend sẽ tự động chạy Liquibase Migration để khởi tạo cấu trúc bảng và nạp dữ liệu mẫu ban đầu).*
- Backend chạy tại: `http://localhost:8080`
- Swagger UI cục bộ: `http://localhost:8080/swagger-ui/index.html`

#### Bước 2: Khởi động Frontend (React 19 Vite SPA)
```bash
# Di chuyển vào thư mục frontend
cd web-bakery-frontend

# Cài đặt thư viện dependencies
npm install

# Khởi chạy Vite Dev Server
npm run dev
```
- Frontend dev server chạy tại: `http://localhost:5173` (Vite dev server đã được cấu hình proxy `/api` tự động chuyển tiếp tới `http://localhost:8080`).

---

## 📚 6. Tài liệu API & Swagger OpenAPI (API Documentation)

Hệ thống tích hợp chuẩn OpenAPI 3 thông qua thư viện `springdoc-openapi-starter-webmvc-ui`. 

- **Địa chỉ truy cập giao diện tương tác**: [http://localhost/swagger-ui/index.html](http://localhost/swagger-ui/index.html)
- **OpenAPI Schema (JSON Format)**: [http://localhost/v3/api-docs](http://localhost/v3/api-docs)

### Danh mục các cụm API chính:

| Cụm chức năng (Tag) | Đường dẫn API mẫu | Phương thức | Mô tả chi tiết |
| :--- | :--- | :---: | :--- |
| **Authentication** | `/api/auth/login` | `POST` | Đăng nhập hệ thống, nhận JWT Access Token & Refresh Token. |
| | `/api/auth/register` | `POST` | Đăng ký tài khoản khách hàng mới. |
| | `/api/auth/me` | `GET` | Lấy thông tin tài khoản đang đăng nhập. |
| **Products & Catalog** | `/api/products` | `GET` | Lấy danh sách sản phẩm phân trang, lọc theo danh mục, từ khóa. |
| | `/api/products/{id}` | `GET` | Xem thông tin chi tiết một sản phẩm theo ID. |
| | `/api/categories` | `GET` | Danh sách các danh mục bánh và ngũ cốc đang hoạt động. |
| **Cart Management** | `/api/cart` | `GET` | Xem nội dung giỏ hàng hiện tại của người dùng. |
| | `/api/cart/items` | `POST` | Thêm sản phẩm vào giỏ hàng. |
| | `/api/cart/items/{id}` | `PUT` / `DELETE` | Điều chỉnh số lượng hoặc xóa món khỏi giỏ hàng. |
| **Checkout & Orders** | `/api/checkout` | `POST` | Đặt hàng từ giỏ (hỗ trợ COD hoặc thanh toán VietQR SePay). |
| | `/api/orders` | `GET` | Danh sách lịch sử đơn hàng của người dùng. |
| | `/api/orders/{id}/confirm-received` | `PUT` | Khách hàng xác nhận "Đã nhận hàng thành công". |
| | `/api/orders/lookup/{orderCode}` | `GET` | Tra cứu đơn hàng công khai không cần đăng nhập. |
| **SePay Payment** | `/api/payment/sepay/webhook` | `POST` | Webhook tiếp nhận thanh toán tự động, đối soát & đổi trạng thái. |
| | `/api/payment/sepay/status/{orderId}` | `GET` | Polling kiểm tra trạng thái thanh toán đơn hàng theo thời gian thực. |
| **Addresses & Profile** | `/api/users/addresses` | `GET` / `POST` | Sổ địa chỉ giao hàng nhiều cấp, đánh dấu địa chỉ mặc định. |
| **Reviews & Feedback** | `/api/reviews` | `POST` | Đánh giá sao (1-5) và bình luận sản phẩm đã mua thành công. |
| **Contact Form** | `/api/contact` | `POST` | Gửi thư liên hệ, góp ý từ trang Contact. |
| **Admin Operations** | `/api/admin/users/**` | `CRUD` | Quản lý tài khoản và phân quyền người dùng (Role ADMIN). |
| | `/api/admin/products/**` | `CRUD` | Quản lý sản phẩm, giá bán, cấu hình tồn kho. |
| | `/api/admin/orders/**` | `GET` / `PUT` | Xử lý duyệt đơn, hủy đơn, chuyển trạng thái giao vận. |
| | `/api/admin/contacts/**` | `GET` / `PUT` | Tiếp nhận và cập nhật trạng thái phản hồi liên hệ. |

---

## 🧪 7. Kiểm thử tự động & Báo cáo QA (Automated Testing Report)

Hệ thống được trang bị bộ kiểm thử tự động toàn diện trên cả Backend và Frontend, tích hợp kiểm tra tự động qua GitHub Actions CI Pipeline:

```
Total Test Suites: 119 Passed / 0 Failed (100% Success Rate)
├── Backend Unit & Integration Tests (JUnit 5, Mockito, MockMvc): 107 tests passed
└── Frontend React Component & Hook Tests (Vitest, RTL, jsdom):    12 tests passed
```

### Chi tiết các kịch bản kiểm thử trọng yếu:
1. **Backend Tests (107 Tests)**:
   - `SepayWebhookControllerTest` & `SepayWebhookServiceTest`: Kiểm tra xác thực API Key, đối soát mã đơn hàng, xử lý webhook trùng lặp, cập nhật trạng thái `PAID` và kích hoạt tự động hủy đơn sau 15 phút.
   - `AuthControllerTest` & `CustomUserDetailsServiceTest`: Kiểm tra quy trình đăng nhập, mã hóa BCrypt, cấp phát và thu hồi JWT token, RBAC role mapping.
   - `ProductControllerTest` & `ProductServiceTest`: Kiểm tra phân trang, tìm kiếm sản phẩm, quản lý tồn kho, validate dữ liệu đầu vào.
   - `OrderServiceTest` & `CheckoutControllerTest`: Kiểm tra tính toán tổng tiền đơn hàng, trừ kho sản phẩm, tạo mã VietQR SePay.
   - `AddressControllerTest` & `ReviewControllerTest`: Kiểm tra bảo mật sổ địa chỉ cá nhân và điều kiện chỉ cho phép đánh giá đơn đã hoàn tất.
2. **Frontend Tests (12 Tests)**:
   - `ProtectedRoute.test.tsx`: Kiểm tra chuyển hướng đăng nhập khi chưa có token, chặn truy cập trái phép role không tương thích.
   - `CustomerExperience.test.tsx`: Kiểm tra hiển thị modal VietQR đếm ngược 15:00, nút xác nhận nhận hàng, popup đánh giá sao sản phẩm.
   - `useCart.test.tsx`: Kiểm tra nghiệp vụ thêm, sửa, xóa, tính tổng tiền giỏ hàng.
   - `ProductCard.test.tsx`: Kiểm tra render thẻ sản phẩm, huy hiệu bán chạy và thao tác thêm vào giỏ.

---

## 📁 8. Cấu trúc thư mục dự án (Project Directory Layout)

```
WebBakery/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # GitHub Actions CI Pipeline (Node.js 22 & Java 17)
├── src/
│   ├── main/
│   │   ├── java/com/example/hebekery/
│   │   │   ├── config/              # Cấu hình Spring Security, SePay, OpenAPI, WebMvc
│   │   │   ├── controller/          # REST Controllers (Auth, Product, Order, Admin,...)
│   │   │   ├── dto/                 # Request & Response Data Transfer Objects
│   │   │   ├── exception/           # Global Exception Handling & Custom Errors
│   │   │   ├── model/               # JPA Entities (User, Product, Order, Category,...)
│   │   │   ├── repository/         # Spring Data JPA Repositories
│   │   │   ├── scheduler/           # Quản lý tác vụ định kỳ (Hủy đơn quá hạn 15m)
│   │   │   ├── security/            # JWT Token Provider, JwtAuthenticationFilter
│   │   │   └── service/             # Lớp nghiệp vụ chuyên sâu (Order, Product, SePay,...)
│   │   └── resources/
│   │       ├── application.properties
│   │       └── db/changelog/        # Liquibase Master & Migration Changesets (001 -> 005)
│   └── test/java/com/example/hebekery/ # 107 bài kiểm thử JUnit 5 & Mockito
├── web-bakery-frontend/
│   ├── src/
│   │   ├── components/              # AddressSelector, VietQrModal, ProductCard, Navbar,...
│   │   ├── context/                 # AuthContext, CartContext
│   │   ├── layouts/                 # CustomerLayout, AdminLayout đa vai trò
│   │   ├── pages/                   # Admin & Customer Pages (BMI, Products, Orders,...)
│   │   ├── services/                # Axios API Services kết nối Backend
│   │   └── test/                    # 12 bài kiểm thử Vitest & React Testing Library
│   ├── Dockerfile                   # Dockerfile đa tầng (node:22-alpine -> nginx:alpine)
│   ├── nginx.conf                   # Cấu hình Nginx nội bộ SPA
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml               # File điều phối 4 dịch vụ Docker
├── Dockerfile                       # Dockerfile đa tầng Spring Boot (Maven -> Temurin JRE 17)
├── nginx.conf                       # Cấu hình Unified Nginx Reverse Proxy Gateway (Port 80)
├── .env.example                     # File mẫu biến môi trường
├── pom.xml                          # Maven Project Descriptor
└── RULES.md                         # Nguyên tắc phát triển và phân nhánh Git
```

---

## 🤝 9. Quy chuẩn phát triển (Development Guidelines)

Để đảm bảo tính nhất quán và chất lượng mã nguồn:
1. **Nguyên tắc phân nhánh**:
   - Nhánh `main` được bảo vệ nghiêm ngặt: **Tuyệt đối không commit hoặc push trực tiếp lên `main`**.
   - Mọi tính năng, sửa lỗi hoặc tài liệu phải được thực hiện trên nhánh độc lập: `feature/<ten-tinh-nang>` hoặc `fix/<ten-loi>`.
   - Tạo Pull Request (PR) để review và merge vào `main` sau khi toàn bộ bài kiểm thử CI đều chuyển xanh (Green).
2. **Quy chuẩn thông điệp Commit (Conventional Commits)**:
   - `feat:` Thêm tính năng mới cho hệ thống.
   - `fix:` Sửa lỗi mã nguồn hoặc xử lý bug.
   - `docs:` Cập nhật tài liệu kỹ thuật, hướng dẫn.
   - `test:` Bổ sung hoặc cập nhật các bài kiểm thử tự động.
   - `refactor:` Tái cấu trúc mã nguồn mà không thay đổi hành vi logic.
   - `chore:` Cập nhật cấu hình build, dependencies hoặc tác vụ bảo trì.

---

*Hệ thống được phát triển và bàn giao đạt chuẩn mực doanh nghiệp, sẵn sàng triển khai trên môi trường Docker và đám mây.*
