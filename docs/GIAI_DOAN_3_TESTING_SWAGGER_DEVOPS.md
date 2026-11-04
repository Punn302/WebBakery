# KẾ HOẠCH GIAI ĐOẠN 3: KIỂM THỬ TỰ ĐỘNG, TÀI LIỆU HÓA API & ĐÓNG GÓI DEVOPS (DOCKER & NGINX)

> **Mục tiêu**: Nâng cao chất lượng mã nguồn bằng bộ kiểm thử tự động (**JUnit 5 + Mockito**), tự động sinh tài liệu chuẩn hóa giao tiếp API (**Swagger / OpenAPI 3.0**), và đóng gói triển khai toàn diện qua **Docker, Docker Compose và Nginx (Reverse Proxy & Load Balancing)**.
> **Tài liệu đối chiếu**: `BE_Training_Plan_v1 1.pdf` — Phần 5 (Testing & Quality: Unit Test, Mockito), Phần 6 (Build & Deployment: Docker, Nginx).

---

## 1. Danh sách vấn đề cần giải quyết triệt để

1. **Thiếu hoàn toàn tầng kiểm thử tự động (Test Suite)**:
   - Toàn bộ backend chỉ có đúng 1 file rỗng `HebekeryApplicationTests.java` với test `contextLoads()`.
   - Không có Unit Test nào kiểm tra tính toàn vẹn của logic nghiệp vụ (tính toán đơn hàng, trừ kho, xác thực mật khẩu, kiểm tra trạng thái đổi trả).
2. **Thiếu tài liệu hóa API tương tác**:
   - Chưa tích hợp công cụ tài liệu hóa API tự động (Swagger / OpenAPI). Frontend developer không có nơi tra cứu Request/Response schema chính thức.
3. **Chưa có cấu hình Container hóa và triển khai**:
   - Chưa có `Dockerfile` để đóng gói ứng dụng.
   - Chưa có `docker-compose.yml` để chạy ứng dụng kèm MySQL chỉ với 1 lệnh `docker compose up`.
   - Chưa có `nginx.conf` để thực hiện Reverse Proxy và Load Balancing theo đúng bài tập Phần 6.14 của lộ trình đào tạo.

---

## 2. Chi tiết các công việc cần thực hiện

### Bước 3.1: Tài liệu hóa API với Swagger / OpenAPI
- [ ] **Bổ sung dependency trong `pom.xml`**:
  ```xml
  <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>2.6.0</version>
  </dependency>
  ```
- [ ] **Tạo class cấu hình `OpenApiConfig.java`**:
  - Khai báo thông tin API: Tiêu đề "Hebekery Healthy Bakery REST API", Phiên bản "v1.0", Mô tả.
  - Cấu hình Security Scheme cho JWT Bearer Token:
    ```java
    @Configuration
    public class OpenApiConfig {
        @Bean
        public OpenAPI customOpenAPI() {
            return new OpenAPI()
                .info(new Info()
                    .title("Hebekery RESTful API")
                    .version("1.0.0")
                    .description("Hệ thống API quản lý và đặt bánh Hebekery"))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                    .addSecuritySchemes("BearerAuth", new SecurityScheme()
                        .name("BearerAuth")
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
        }
    }
    ```
- [ ] **Gắn annotation tài liệu hóa cho toàn bộ Controller & DTO**:
  - `@Tag(name = "Authentication", description = "Các endpoint đăng ký, đăng nhập và cấp token")`
  - `@Tag(name = "Product Catalog", description = "Xem và tìm kiếm sản phẩm cho khách")`
  - `@Tag(name = "Admin Order Management", description = "Quản lý đơn hàng dành cho admin")`
  - `@Operation(summary = "...", description = "...")`
  - `@ApiResponse(responseCode = "200", description = "Thành công")`
  - `@Schema(description = "Mã sản phẩm", example = "P001")` trên các field DTO.

---

### Bước 3.2: Xây dựng Bộ Kiểm Thử Tự Động (Unit Test & Integration Test)
- [ ] **Cấu hình JaCoCo trong `pom.xml` để đo lường độ bao phủ (Code Coverage)**:
  ```xml
  <plugin>
      <groupId>org.jacoco</groupId>
      <artifactId>jacoco-maven-plugin</artifactId>
      <version>0.8.12</version>
      <executions>
          <execution>
              <goals><goal>prepare-agent</goal></goals>
          </execution>
          <execution>
              <id>report</id>
              <phase>test</phase>
              <goals><goal>report</goal></goals>
          </execution>
      </executions>
  </plugin>
  ```
- [ ] **Viết Unit Test cho Service Layer (JUnit 5 + Mockito)**:
  - `UserServiceTest.java`:
    - `testLogin_Success`: Đăng nhập đúng email & mật khẩu -> trả về User.
    - `testLogin_WrongPassword`: Đăng nhập sai mật khẩu -> trả về null / ném ngoại lệ.
    - `testRegister_DuplicateEmail`: Đăng ký với email đã tồn tại -> ném ngoại lệ `EmailAlreadyExistsException`.
    - `testUpdateRole`: Đổi role thành công và lưu database.
  - `ProductServiceTest.java`:
    - `testSearchProducts_WithKeyword`: Tìm kiếm có từ khóa -> trả về danh sách phân trang đúng.
    - `testEnsureAvailable_OutOfStock`: Sản phẩm hết hàng -> ném ngoại lệ `OutOfStockException`.
    - `testSaveProduct_NewProduct`: Tạo mới sản phẩm thành công.
  - `OrderServiceTest.java`:
    - `testCreateOrder_COD`: Đặt hàng COD thành công, giỏ hàng hợp lệ, tạo đúng OrderItem và History.
    - `testUpdateStatus_ShippingToDelivered`: Chuyển trạng thái từ SHIPPING sang DELIVERED -> tự động đánh dấu PAID nếu là COD.
    - `testCancelOrder_InvalidStatus`: Hủy đơn khi đơn đã giao -> ném ngoại lệ không cho phép.
    - `testRequestReturn_ValidReason`: Tạo yêu cầu đổi trả thành công khi đơn ở trạng thái RECEIVED.
  - `CartServiceTest.java`:
    - `testAddToCart_MergeQuantity`: Thêm sản phẩm đã có trong giỏ -> tăng số lượng chính xác.
    - `testCalculateTotalPrice`: Tính đúng tổng tiền của tất cả mặt hàng trong giỏ.
- [ ] **Viết Integration Test cho Controller Layer (`@WebMvcTest`)**:
  - `AuthControllerTest.java`: Test endpoint `/api/auth/login` với MockMvc, kiểm tra response status và JSON token trả về.
  - `ProductControllerTest.java`: Test endpoint `/api/products` phân trang và tìm kiếm.
- [ ] **Viết Repository Test (`@DataJpaTest`)**:
  - `OrderRepositoryTest.java`: Test câu lệnh query tìm kiếm đơn theo nhiều tiêu chí (keyword, status, khoảng ngày).

---

### Bước 3.3: Container hóa ứng dụng với Docker
- [ ] **Tạo file `Dockerfile` (Multi-stage build)** tại gốc dự án `WebBakery`:
  ```dockerfile
  # Stage 1: Build JAR bằng Maven
  FROM maven:3.9-eclipse-temurin-17 AS builder
  WORKDIR /build
  COPY pom.xml .
  RUN mvn dependency:go-offline -B
  COPY src ./src
  RUN mvn clean package -DskipTests

  # Stage 2: Runtime image siêu nhẹ
  FROM eclipse-temurin:17-jre-alpine
  WORKDIR /app
  RUN addgroup -S appgroup && adduser -S appuser -G appgroup
  USER appuser
  COPY --from=builder /build/target/Hebekery-0.0.1-SNAPSHOT.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
  ```
- [ ] **Tạo `.dockerignore`**:
  ```text
  target/
  .mvn/
  mvnw
  mvnw.cmd
  .git/
  .idea/
  *.iml
  docs/
  uploads/
  ```

---

### Bước 3.4: Thiết lập Môi trường với Docker Compose
- [ ] **Tạo file `docker-compose.yml`**:
  ```yaml
  version: '3.8'

  services:
    mysql:
      image: mysql:8.0
      container_name: hebekery_mysql
      restart: always
      environment:
        MYSQL_DATABASE: hebekery
        MYSQL_ROOT_PASSWORD: root_password
      ports:
        - "3306:3306"
      volumes:
        - mysql_data:/var/lib/mysql
      networks:
        - hebekery_net
      healthcheck:
        test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
        interval: 10s
        timeout: 5s
        retries: 5

    backend:
      build:
        context: .
        dockerfile: Dockerfile
      container_name: hebekery_backend
      restart: always
      depends_on:
        mysql:
          condition: service_healthy
      environment:
        DB_URL: jdbc:mysql://mysql:3306/hebekery?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Ho_Chi_Minh
        DB_USERNAME: root
        DB_PASSWORD: root_password
        JWT_SECRET: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
        CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
        CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
        CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      ports:
        - "8080:8080"
      networks:
        - hebekery_net

    nginx:
      image: nginx:alpine
      container_name: hebekery_nginx
      restart: always
      depends_on:
        - backend
      ports:
        - "80:80"
      volumes:
        - ./nginx.conf:/etc/nginx/nginx.conf:ro
      networks:
        - hebekery_net

  volumes:
    mysql_data:

  networks:
    hebekery_net:
      driver: bridge
  ```

---

### Bước 3.5: Cấu hình Nginx (Reverse Proxy & Load Balancing)
- [ ] **Tạo file `nginx.conf`**:
  - Đóng vai trò Reverse Proxy nhận request từ client ở port 80 và chuyển tiếp tới backend:
  - Cho phép tải tệp multipart (ảnh sản phẩm) lên đến 10MB (`client_max_body_size 10M`).
  - Không cần cấu hình cache/alias `/uploads/` cục bộ vì ảnh được phục vụ trực tiếp qua Cloudinary CDN.
  ```nginx
  events { worker_connections 1024; }

  http {
      # Giới hạn kích thước tải lên (hỗ trợ upload ảnh sản phẩm lên Cloudinary qua backend)
      client_max_body_size 10M;

      # Upstream phục vụ bài tập Load Balancing (Phần 6.14)
      upstream backend_servers {
          # Có thể nhân bản nhiều container backend để test round robin
          server backend:8080;
      }

      server {
          listen 80;
          server_name localhost;

          # Reverse proxy toàn bộ API vào Spring Boot Backend
          location / {
              proxy_pass http://backend_servers;
              proxy_set_header Host $host;
              proxy_set_header X-Real-IP $remote_addr;
              proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
              proxy_set_header X-Forwarded-Proto $scheme;
              proxy_connect_timeout 60s;
              proxy_read_timeout 60s;
          }
      }
  }
  ```

---

## 3. Tiêu chí nghiệm thu Giai đoạn 3 (Acceptance Criteria)

1. **Swagger UI**:
   - Truy cập được `http://localhost:8080/swagger-ui/index.html` hiển thị đầy đủ danh sách các API và schemas.
   - Thử nghiệm được nút `Authorize` (nhập Bearer Token) và gọi trực tiếp API trên Swagger UI thành công.
2. **Kiểm thử**:
   - Lệnh `mvn test` chạy thành công 100% không có lỗi.
   - Báo cáo JaCoCo (`target/site/jacoco/index.html`) ghi nhận độ bao phủ code đạt tối thiểu 70% các logic nghiệp vụ quan trọng.
3. **Docker & DevOps**:
   - Chạy lệnh `docker compose up --build -d` khởi động thành công 3 container (`mysql`, `backend`, `nginx`).
   - Container backend đạt chuẩn **100% Stateless** (không lưu ảnh local, không phụ thuộc persistent volume cho media).
   - Truy cập qua cổng 80 (`http://localhost`) trả về phản hồi từ hệ thống thông qua Nginx Reverse Proxy.
