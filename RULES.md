# BỘ QUY TẮC PHÁT TRIỂN & CHUẨN MỰC MÃ NGUỒN (DEVELOPMENT RULES & CODING STANDARDS)

> **Phạm vi áp dụng**: Áp dụng bắt buộc cho toàn bộ 4 giai đoạn tái cấu trúc và phát triển dự án Hebekery (WebBakery). Mọi nhà phát triển (developer) và trợ lý ảo (AI assistant) phải tuân thủ nghiêm ngặt các quy tắc này.
> **Tài liệu tham chiếu**: `BE_Training_Plan_v1 1.pdf` và `FE_Training_Plan_v1.pdf`.

---

## 1. QUY TẮC KIẾN TRÚC & PHÂN TÁCH LỚP (CLEAN ARCHITECTURE & S.O.L.I.D)

### 1.1. Tầng Controller (Presentation Layer)
* **Chỉ sử dụng `@RestController`**: Tuyệt đối không trộn lẫn giao diện Server-side rendering (`@Controller` trả về HTML view) với REST API.
* **Không chứa nghiệp vụ (Zero Business Logic)**: Controller chỉ làm 3 nhiệm vụ:
  1. Tiếp nhận request và xác thực dữ liệu đầu vào (`@Valid`).
  2. Ủy quyền xử lý cho Service layer tương ứng.
  3. Đóng gói kết quả trả về qua `ResponseEntity<ApiResponse<T>>`.
* **Cấm trả trực tiếp JPA Entity**: Mọi dữ liệu trả về client phải là **DTO (Data Transfer Object)**. Việc trả Entity trực tiếp làm rò rỉ cấu trúc cơ sở dữ liệu và dễ gây lỗi `LazyInitializationException` hoặc đệ quy vô hạn khi serialize JSON.
* **Cấm tự khởi tạo `new HashMap<>()` để build response**: 100% response trả về phải dùng chuẩn thống nhất `ApiResponse<T>`.
* **Kích thước file**: Mỗi Controller không được vượt quá **200 dòng code**. Khi Controller phình to, bắt buộc phải tách nhỏ theo subdomain (ví dụ: tách `AdminController` thành `AdminUserController`, `AdminProductController`, `AdminOrderController`...).

### 1.2. Tầng Dịch vụ (Service Layer)
* **Trọng tâm nghiệp vụ**: Chứa 100% các quy tắc tính toán, kiểm tra trạng thái, chuyển đổi trạng thái và logic giao dịch (`@Transactional`).
* **Phi trạng thái (Stateless Service)**: Tuyệt đối không sử dụng `@SessionScope` hoặc lưu trữ trạng thái người dùng trong các thuộc tính của Service (như mảng `List` in-memory). Backend phải là Stateless để có thể scale ngang trên nhiều container Docker.
* **Đơn nhiệm (Single Responsibility Principle - SRP)**: Một service chỉ quản lý một aggregate domain cụ thể. Nếu cần gọi chéo, hãy inject Service khác thay vì can thiệp trực tiếp vào Repository của domain khác.

### 1.3. Tầng Truy xuất Dữ liệu (Repository & Database Layer)
* **Nghiêm cấm In-Memory Filtering**:
  * **TUYỆT ĐỐI CẤM** viết code dạng `findAll().stream().filter(...)` để tìm kiếm dữ liệu.
  * Mọi thao tác tìm kiếm, lọc, sắp xếp, tính toán tổng hợp phải được đẩy xuống database thực hiện thông qua câu lệnh SQL/JPQL hoặc Spring Data JPA Specification.
* **Bắt buộc phân trang (Pagination)**: Tất cả các API trả về danh sách có nguy cơ tăng trưởng theo thời gian (sản phẩm, đơn hàng, người dùng, giao dịch kho) **bắt buộc phải nhận `Pageable`** và trả về `Page<T>` hoặc `Slice<T>`.
* **Chống lỗi N+1 Query**:
  * Thiết lập mặc định `fetch = FetchType.LAZY` cho tất cả các quan hệ `@OneToMany`, `@ManyToMany`.
  * Khi cần nạp kèm quan hệ, sử dụng `@EntityGraph` hoặc truy vấn `JOIN FETCH`.

---

## 2. QUY TẮC AN TOÀN THÔNG TIN & BẢO MẬT (SECURITY RULES)

### 2.1. Quản lý Khóa Bí Mật & Môi Trường (Zero Hardcode Secrets)
* **Tuyệt đối cấm commit thông tin nhạy cảm vào Git**: Không hardcode mật khẩu, private key, secret key, access token (MoMo, JWT Secret, DB Password) trong mã nguồn.
* Tất cả phải được nạp thông qua **Biến môi trường (Environment Variables)** hoặc file `.env` được bỏ qua bởi `.gitignore`.
* Luôn cung cấp file cấu hình mẫu `.env.example` hoặc `application-example.properties` với giá trị giả định để team member dễ dàng clone và thiết lập.

### 2.2. Xác thực & Phân quyền (Authentication & Authorization)
* **Cơ chế xác thực**: Sử dụng duy nhất **Spring Security kết hợp JSON Web Token (JWT)**.
* **Quản lý mật khẩu**:
  * Bắt buộc mã hóa mật khẩu người dùng bằng `BCryptPasswordEncoder` với độ phức tạp (strength) tối thiểu là 10.
  * Tuyệt đối không cho phép kiểm tra mật khẩu dạng chuỗi trần (`storedPassword.equals(rawPassword)`).
* **Phân quyền theo vai trò (Role-Based Access Control - RBAC)**:
  * Sử dụng `@EnableMethodSecurity` và kiểm soát quyền ở mức phương thức bằng `@PreAuthorize("hasRole('ADMIN')")` hoặc `@PreAuthorize("hasRole('USER')")`.
  * Không dùng hàm `if (userService.isAdmin())` thủ công rải rác trong Controller.

---

## 3. QUY TẮC CƠ SỞ DỮ LIỆU & QUẢN LÝ SCHEMA (DATABASE & LIQUIBASE)

### 3.1. Phiên bản hóa Cơ sở dữ liệu (Database Migration)
* **Sử dụng Liquibase**: 100% thay đổi cấu trúc bảng, thêm cột, tạo index, cập nhật dữ liệu khởi tạo (seed data) phải được viết qua **Liquibase ChangeSet** (`.yaml` hoặc `.sql`).
* **Cấm can thiệp trực tiếp**: Nghiêm cấm chạy câu lệnh DDL trực tiếp trên môi trường database dùng chung mà không có ChangeSet tương ứng.
* **Cấm dùng `ddl-auto = update / create`**: Luôn đặt `spring.jpa.hibernate.ddl-auto=validate` để Liquibase là nguồn chân lý duy nhất (Single Source of Truth) điều khiển schema.

### 3.2. Chuẩn hóa Khóa chính & Kiểm toán (Auditing)
* **Khóa chính (Primary Key)**: Không dùng `System.currentTimeMillis()` làm khóa chính. Sử dụng `BIGINT AUTO_INCREMENT` hoặc `UUIDv7` / `UUID`.
* **Kế thừa `BaseEntity`**: Mọi Entity nghiệp vụ đều phải kế thừa `BaseEntity` để tự động ghi nhận `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.

---

## 4. QUY TẮC KIỂM THỬ TỰ ĐỘNG (TESTING STANDARDS)

### 4.1. Backend Unit Test (JUnit 5 + Mockito)
* Mọi Service mới hoặc được tái cấu trúc bắt buộc phải có file Test tương ứng đặt trong `src/test/java/...`.
* **Cấu trúc bài test**: Tuân thủ mẫu **AAA (Arrange - Act - Assert)** hoặc **Given - When - Then**.
* **Độ bao phủ (Coverage)**:
  * Phải kiểm tra tối thiểu 2 nhánh kịch bản:
    1. **Happy Path**: Dữ liệu hợp lệ, kết quả trả về thành công như mong đợi.
    2. **Edge Cases & Failure**: Dữ liệu không hợp lệ, không tìm thấy tài nguyên, vi phạm nghiệp vụ -> kiểm tra xem có ném đúng ngoại lệ (Exception) hay không.
* Mọi build trên CI hoặc trước khi commit phải đảm bảo lệnh `mvn test` vượt qua 100%.

### 4.2. Frontend Unit Test (Vitest + React Testing Library)
* Mỗi Custom Hook quan trọng (như `useCart`, `useAuth`) phải có file test kiểm tra logic cập nhật state và đồng bộ LocalStorage/API.
* Mỗi Component giao diện cốt lõi phải được test khả năng render và tương tác người dùng (click, submit, nhập dữ liệu).

---

## 5. QUY TẮC FRONTEND (REACT + TYPESCRIPT + TANSTACK QUERY)

### 5.1. Kiểu dữ liệu & Ngôn ngữ (TypeScript Strict)
* Bật `strict: true` trong `tsconfig.json`.
* **Nghiêm cấm dùng kiểu `any`**: Mọi response từ API, props của component, state của form đều phải có type/interface rõ ràng đồng bộ với DTO của Backend.
* Tách biệt các interface trong thư mục `src/types/`.

### 5.2. Quản lý Dữ liệu & Trạng thái (Server State vs Client State)
* **Server State (Dữ liệu từ API)**: Bắt buộc quản lý bằng **TanStack Query (React Query)**. Không dùng `useEffect + useState` để fetch dữ liệu từ API.
* **Client State (Trạng thái giao diện)**: Sử dụng React State cục bộ (`useState`, `useReducer`) hoặc Context API (`AuthContext`, `ThemeContext`).
* Mọi thao tác thay đổi dữ liệu (Create, Update, Delete) phải dùng `useMutation` và thực hiện `queryClient.invalidateQueries()` để làm mới dữ liệu tự động.

### 5.3. Form & Validate
* Bắt buộc quản lý Form bằng **`react-hook-form`**.
* Bắt buộc định nghĩa luật kiểm tra bằng **`zod` schema** trước khi gửi payload lên server.
* Hiển thị thông báo phản hồi thao tác bằng component **Sonner Toast**, không dùng popup trình duyệt `alert()`.

### 5.4. Đa ngôn ngữ (i18n)
* Không hardcode văn bản hiển thị trực tiếp trong component.
* Sử dụng hook `useTranslation()` từ `react-i18next` để đọc nhãn từ file resource ngôn ngữ (`vi.json`, `en.json`).

### 5.5. Quy chuẩn Thiết kế Giao diện Tối giản & Nổi khối Xúc giác (Minimalist & Tactile UI Standards)
Áp dụng bắt buộc cho toàn bộ màn hình, trang mới và các component tái cấu trúc:
1. **Văn bản ngắn gọn, chính xác (Concise & Professional Copywriting)**:
   * Tuyệt đối không viết văn giải thích dài dòng, kể lể hoặc dùng đại từ thừa thãi (*"của bạn"*, *"hãy bấm vào đây"*).
   * Dùng nhãn dứt khoát và thuật ngữ chuyên ngành chuẩn E-Commerce & F&B: `Họ tên`, `Địa chỉ nhận`, `SKU`, `Tồn khả dụng`, `Giá vốn (WAC)`, `HSD`, `Macro`, `Calo`, `Vận đơn`.
2. **Không Card lồng Card (Anti-Nested Cards / No Cardception)**:
   * Nghiêm cấm bọc thẻ Card con bên trong một thẻ Card cha lớn gây nặng nề, bí bách và viền bóng đè lớp.
   * Phân cấp bố cục bằng **Khoảng trắng (Whitespace)**, **Typography** (tiêu đề đậm, nội dung vừa) và **Đường kẻ mỏng phẳng (`border-b border-border`)**.
3. **Vuông vức, không bo góc (`rounded-none` / Sharp Edges)**:
   * Toàn bộ các phần tử giao diện (`Button`, `Card`, `Input`, `Dialog`, `Sheet`, `Table`, `Badge`) đều thiết lập góc vuông tuyệt đối **`rounded-none`**.
   * Phong cách Architectural Minimalist tạo cảm giác dứt khoát, chuyên nghiệp và tối ưu diện tích hiển thị.
4. **Không Text giải thích thừa thãi (Self-Explanatory Interface)**:
   * Nhãn (Label) và Placeholder phải tự thân rõ nghĩa. Không chèn các đoạn text xám giải thích việc hiển nhiên bên dưới Input hay Card.
   * Chỉ hiển thị text phụ khi thông báo lỗi validate (Error state màu đỏ) hoặc tooltip ẩn khi người dùng chủ động hover.
5. **Không Nút lặp (Single Source of Action / No Duplicate CTA)**:
   * Mỗi thành phần/thẻ chỉ có duy nhất **1 hành động chính (Primary Action)**. Không nhồi nhét nhiều nút trùng lặp (ví dụ: vừa nút "Xem chi tiết", vừa nút "Thêm giỏ", vừa icon giỏ hàng trên cùng một card).
   * Trên mỗi màn hình hoặc bảng quản trị: Nút hành động chính chỉ xuất hiện đúng 1 lần tại Header thanh công cụ.
6. **Tiết chế Icon tối đa (Strict Icon Discipline)**:
   * Nghiêm cấm rải icon trang trí tùy tiện ở mọi đầu dòng chữ hay menu.
   * Icon chỉ được xuất hiện ở 3 trường hợp:
     - Công cụ phổ quát (Kính lúp tìm kiếm, Giỏ hàng, Menu di động).
     - Chỉ báo trạng thái hệ thống (Tick thành công, Chéo cảnh báo lỗi).
     - Điều hướng dứt khoát (Mũi tên Chevron `->`).
7. **Button Phủ nền đặc & Nổi khối xúc giác (Solid Tactile Raised Buttons)**:
   * **Phủ nền đặc dứt khoát (Solid Background)**: Tuyệt đối không dùng kiểu nút "viền đậm nền nhạt trong suốt/mờ" gây cảm giác rẻ tiền và thiếu độ tương phản. Primary button phải phủ nền màu đặc thương hiệu (xanh rừng đậm hoặc đen dứt khoát) tương phản cao với chữ.
   * **Hiệu ứng nổi khối xúc giác (Tactile Gloss & Depth Overlay)**:
     - Sử dụng lớp phủ bóng highlight nhẹ ở cạnh trên: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2)`.
     - Kết hợp đổ bóng chân nút tạo độ nổi khối 3D: `box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2)`.
     - Phản hồi xúc giác khi click (`active state`): Nút lún nhẹ xuống (`active:translate-y-[1px] active:shadow-inner`), mô phỏng chân thực cảm giác bấm phím cơ học cao cấp.

---

## 6. QUY TẮC QUẢN LÝ MÃ NGUỒN VỚI GIT (GIT FLOW, PR & BEST PRACTICES)

### 6.1. Nguyên tắc làm việc hàng ngày & Vòng đời tính năng (Feature Lifecycle)
* **Quy tắc vàng**: **TUYỆT ĐỐI CẤM commit hoặc push trực tiếp lên nhánh `main`**. Mọi thay đổi đưa vào nhánh chính đều bắt buộc phải thông qua Pull Request (PR) có kiểm thử và review.
* **Quy trình 6 bước chuẩn cho mọi task**:
  1. **Bắt đầu từ code mới nhất**:
     ```bash
     git checkout main
     git pull origin main
     ```
  2. **Tạo nhánh tính năng mới**:
     ```bash
     git checkout -b feature/<tên-tính-năng>
     ```
  3. **Cam kết nhỏ & độc lập (Atomic Commits)**:
     - Chia nhỏ commit theo từng đơn vị chức năng logic (không dồn 20-30 files vào 1 commit khổng lồ).
     - Luôn kiểm tra trạng thái và sự thay đổi trước khi commit:
       ```bash
       git status
       git diff
       git add <file-hoặc-thư-mục>
       git commit -m "<type>(<scope>): <mô tả>"
       ```
  4. **Đẩy nhánh lên Remote Repository**:
     ```bash
     git push -u origin feature/<tên-tính-năng>
     ```
  5. **Tạo Pull Request (PR)** trên GitHub/GitLab, tự review checklist và chờ merge.
  6. **Dọn dẹp nhánh cục bộ sau khi PR được merge**:
     ```bash
     git checkout main
     git pull origin main
     git branch -d feature/<tên-tính-năng>
     ```

### 6.2. Quy ước đặt tên nhánh (Branch Naming)
* Tính năng mới: `feature/<tên-tính-năng>` (ví dụ: `feature/jwt-auth`, `feature/product-filter`)
* Sửa lỗi: `fix/<mã-lỗi-hoặc-mô-tả>` (ví dụ: `fix/momo-signature`, `fix/cart-quantity`)
* Tái cấu trúc: `refactor/<tên-module>` (ví dụ: `refactor/order-service`, `refactor/clean-controllers`)
* Thử nghiệm/Nghiên cứu: `spike/<chủ-đề>` hoặc `test/<chủ-đề>`

### 6.3. Quy ước thông điệp Commit (Conventional Commits)
Cú pháp commit bắt buộc: `<type>(<scope>): <mô tả ngắn gọn>`
* `feat`: Thêm tính năng mới (ví dụ: `feat(auth): implement jwt token provider`)
* `fix`: Sửa lỗi (ví dụ: `fix(order): prevent duplicate inventory deduction`)
* `refactor`: Tái cấu trúc code nhưng không thay đổi tính năng (ví dụ: `refactor(product): replace in-memory filter with jpa pagination`)
* `test`: Thêm hoặc sửa bài kiểm thử (ví dụ: `test(user): add unit tests for user service`)
* `docs`: Thêm hoặc cập nhật tài liệu (ví dụ: `docs(phase1): add phase 1 execution plan`)
* `chore`: Cấu hình build, dependency, docker, git (ví dụ: `chore(deps): add cloudinary and animate-ui dependencies`)

### 6.4. Chuẩn mực Tạo & Quản lý Pull Request (PR Standards & Checklist)
* **Tiêu đề PR**: Tuân theo format `[TYPE] Mô tả ngắn gọn tính năng/sửa lỗi` (ví dụ: `[FEAT] Tích hợp Cloudinary Upload Service và Animate UI`).
* **PR Checklist (Bắt buộc tự kiểm tra trước khi bấm Create PR)**:
  - [ ] Đã chạy bài test tự động (`mvn test` hoặc `npm run test`) pass 100%.
  - [ ] Đã xóa bỏ toàn bộ code rác, code bị comment (`// TODO: sau này làm`), `console.log` hoặc `System.out.println`.
  - [ ] Đã kiểm tra không có secret key, password, access token nào bị commit vào mã nguồn.
  - [ ] Mô tả PR rõ ràng: Nêu mục đích thay đổi, danh sách API/Component mới, có ảnh chụp màn hình UI nếu là thay đổi Frontend.
* **Chiến lược Merge (Merge Strategy)**:
  * Ưu tiên chọn **`Squash and Merge`** trên giao diện GitHub khi merge nhánh feature vào `main` để giữ lịch sử commit của `main` luôn gọn gàng, rõ ràng (mỗi PR tương ứng đúng 1 commit trên `main`).

### 6.5. Đồng bộ Nhánh & Kỹ năng Giải quyết Xung đột (Rebase & Conflict Resolution)
* **Đồng bộ code mới từ `main` vào nhánh đang làm việc**:
  * Khi nhánh `main` có commit mới từ đồng nghiệp, tuyệt đối không tạo merge commit lộn xộn. Hãy dùng `rebase`:
    ```bash
    git checkout feature/<tên-tính-năng>
    git fetch origin
    git rebase origin/main
    ```
* **Quy trình gỡ xung đột (Conflict Resolution)**:
  1. Khi gặp xung đột, Git sẽ tạm dừng và báo danh sách file bị conflict (`both modified`).
  2. Mở file xung đột bằng IDE (VS Code / IntelliJ), so sánh giữa code hiện tại (`Current Change`) và code mới từ main (`Incoming Change`).
  3. Chỉnh sửa code cho chuẩn xác, lưu file.
  4. Đánh dấu đã giải quyết: `git add <tên-file-đã-sửa>`.
  5. Tiếp tục chu trình rebase: `git rebase --continue` (tuyệt đối **KHÔNG** gõ `git commit`).
  6. Sau khi rebase thành công, cập nhật lên remote nhánh cá nhân:
     ```bash
     git push --force-with-lease origin feature/<tên-tính-năng>
     ```

### 6.6. Các Lệnh Cứu Nguy Thường Dùng (Git Troubleshooting Tools)
* **Lưu tạm việc đang làm dở (`git stash`)**:
  * Khi đang code dở mà cần chuyển sang nhánh khác gấp để fix bug:
    ```bash
    git stash push -m "WIP: đang làm dở form checkout"
    # Chuyển nhánh khác xử lý xong, quay lại nhánh cũ:
    git stash pop
    ```
* **Sửa lại commit gần nhất (`git commit --amend`)**:
  * Dùng khi quên thêm file vào commit trước hoặc viết sai chính tả commit message (chỉ áp dụng khi commit **chưa được push** lên remote):
    ```bash
    git add <file-bị-quên>
    git commit --amend -m "feat(auth): thông điệp đã sửa chuẩn"
    ```
* **Hủy commit nhưng giữ nguyên code (`git reset --soft`)**:
  * Khi lỡ commit sai nhưng muốn giữ lại toàn bộ code đã viết để chia nhỏ lại:
    ```bash
    git reset --soft HEAD~1
    ```
* **Hủy toàn bộ thay đổi chưa commit đưa về trạng thái sạch (`git restore`)**:
  ```bash
  git restore <file-muốn-bỏ-thay-đổi>
  ```

### 6.7. Quy Tắc An Toàn Sống Còn (Golden Safety Rules)
1. **CẤM TUYỆT ĐỐI `git push --force` (hoặc `-f`) lên nhánh `main` hoặc `develop`**:
   * Việc này có thể ghi đè và làm mất vĩnh viễn commit của thành viên khác.
2. **Chỉ dùng `--force-with-lease`**:
   * Chỉ sử dụng cờ an toàn `git push --force-with-lease` trên **nhánh feature cá nhân** của bạn sau khi vừa thực hiện `git rebase`.
3. **Luôn kiểm tra trạng thái trước & sau mọi lệnh**:
   * Tập phản xạ gõ `git status` trước khi add/commit và trước khi chuyển nhánh.

---

## 7. QUY TẮC BẮT ĐẦU VÀ KẾT THÚC PHIÊN LÀM VIỆC (SESSION WORKFLOW & PR REVIEW)

### 7.1. Khi BẮT ĐẦU một phiên chat (Session Start Checklist)
1. **Kiểm tra trạng thái Git (Git Status Check)**:
   - Chạy `git status` và `git branch` để biết đang đứng ở nhánh nào, có file nào sửa dở dang không.
   - Nếu cần cập nhật code mới nhất từ remote:
     ```bash
     git pull origin <tên-nhánh>
     ```
2. **Xác định mục tiêu phiên (Session Goal & Scope)**:
   - Nêu rõ: Đang làm ở **Giai đoạn mấy**, **Task cụ thể nào** trong file kế hoạch tương ứng (`docs/GIAI_DOAN_X_...md`).
   - *Nguyên tắc Single Scope*: Mỗi phiên chỉ tập trung giải quyết 1-2 subtask cụ thể, tránh làm dàn trải nhiều module khiến context bị loãng.
3. **Kiểm tra "Sức khỏe" ban đầu (Sanity Baseline Check)**:
   - Chạy lệnh build hoặc test cơ bản để chắc chắn baseline trước khi code không có lỗi tiềm ẩn (`mvn test` hoặc `npm run test`).

### 7.2. Trong QUÁ TRÌNH làm việc (During Session Rules)
* **Atomic Commit**: Chia nhỏ commit khi hoàn thành từng đơn vị logic (DTO, Service, Controller/Component) thay vì để dồn cuối buổi.
* **Zero Secret Exposure**: Không dán API key, token, password thật vào khung chat hoặc commit vào mã nguồn.
* **No Scope Creep**: Không tùy tiện sửa các class hoặc cấu hình ngoài phạm vi task hiện tại.

### 7.3. Khi KẾT THÚC phiên chat & Quy trình Mở PR (Session End & PR Handover)
1. **Kiểm thử tự động (Verification)**:
   - Bắt buộc chạy `mvn test` (Backend) hoặc `npm run test` (Frontend) -> Đảm bảo pass 100%, không bị vỡ logic cũ (No Regression).
2. **Vệ sinh mã nguồn (Code Hygiene)**:
   - Chạy `git diff` rà soát lại: Xóa bỏ `console.log`, `System.out.println`, code comment thừa, file nháp.
3. **Commit & Push lên Remote**:
   - Gom các thay đổi hoàn chỉnh thành commit chuẩn Conventional Commits và push lên nhánh tính năng.
4. **Tạo Pull Request & Thông báo Review (PR Notification & Handover)**:
   - Trợ lý AI (hoặc bạn) tạo PR qua GitHub CLI (`gh pr create`) hoặc gửi link tạo PR trực tiếp trên GitHub.
   - **Trợ lý AI BẮT BUỘC gửi thông báo bàn giao gồm**:
     * **Link PR trực tiếp** trên GitHub.
     * **Tóm tắt thay đổi (Changelog)**: Danh sách file tạo mới/sửa đổi và mục đích của từng file.
     * **Các điểm cần chú ý khi Review**: Hướng dẫn bạn cần nhìn vào đâu trên tab `Files changed` của GitHub.
5. **Quy trình Review & Duyệt PR của Bạn (Developer's Review & Approval)**:
   - Bạn truy cập vào link PR trên GitHub, xem tab **Files changed** để xem trước toàn bộ thay đổi (diff xanh/đỏ).
   - Nếu có chỗ chưa ưng ý: Bạn có thể comment trực tiếp trên dòng code của GitHub hoặc yêu cầu AI sửa tiếp trong chat.
   - Nếu hài lòng: Bạn bấm **Approve** và chọn **Squash and Merge** để gộp code an toàn vào nhánh `main`.
6. **Cập nhật Kế hoạch (Checklist Tracking)**:
   - Đánh dấu `[x]` vào các task đã hoàn thành trong file `docs/GIAI_DOAN_X_...md`.
   - Ghi chú bước tiếp theo (Next Action) cần làm cho phiên chat sau.
