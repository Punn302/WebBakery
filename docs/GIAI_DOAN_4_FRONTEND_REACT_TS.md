# KẾ HOẠCH GIAI ĐOẠN 4: XÂY DỰNG FRONTEND HIỆN ĐẠI (REACT + TYPESCRIPT + TANSTACK QUERY + SHADCN/UI + ANIMATE-UI)

> **Mục tiêu**: Xây dựng mới hoàn toàn ứng dụng Frontend độc lập (SPA) thay thế lớp giao diện Thymeleaf cũ, đáp ứng 100% các tiêu chuẩn trong **Kế hoạch đào tạo Frontend (`FE_Training_Plan_v1.pdf`)**: React 18+, TypeScript, Tailwind CSS, shadcn/ui, animate-ui (Motion), TanStack Query, React Router, react-hook-form + Zod, đa ngôn ngữ (i18n), tích hợp lưu trữ đa phương tiện Cloudinary và kiểm thử với Vitest.
> **Tài liệu đối chiếu**: `FE_Training_Plan_v1.pdf` — Phần 1 đến Phần 8 và Bài tập thực hành bắt buộc; tham chiếu thư viện giao diện động [animate-ui](https://github.com/imskyleen/animate-ui).

---

## 1. Danh sách vấn đề cần giải quyết triệt để

1. **Giao diện cũ phụ thuộc Server-Side Rendering (Thymeleaf)**:
   - Các file HTML tại `src/main/resources/templates` và script tại `src/main/resources/static/js` gây tải lại toàn bộ trang (Full page reload) mỗi khi chuyển trang hoặc lọc sản phẩm.
2. **Không có hệ thống Type Safety (TypeScript)**:
   - Toàn bộ JS cũ là dynamic typing, dễ sinh lỗi `undefined is not a function`, khó bảo trì khi schema API thay đổi.
3. **Quản lý trạng thái phân tán, thiếu bộ nhớ đệm (Cache)**:
   - Các file JS tự gọi `fetch()` độc lập, không có cơ chế cache dữ liệu, không có loading/error state chuẩn, không hỗ trợ Optimistic Update.
4. **Form và Validate thủ công**:
   - Sử dụng kiểm tra thuộc tính HTML5 cơ bản, không có schema validation đồng bộ với Backend.
5. **Thiếu đa ngôn ngữ và Unit Test**:
   - Giao diện bị hardcode 100% tiếng Việt, không có bất kỳ test tự động nào trên giao diện.

---

## 2. Chi tiết các công việc cần thực hiện

### Bước 4.1: Khởi tạo Dự Án Frontend & Cấu hình Môi trường
- [ ] **Khởi tạo dự án độc lập với Vite**:
  ```bash
  npm create vite@latest web-bakery-frontend -- --template react-ts
  cd web-bakery-frontend
  ```
- [ ] **Cài đặt các gói thư viện chuẩn theo lộ trình & UI Motion**:
  ```bash
  # UI, Animations & Styling
  npm install tailwindcss postcss autoprefixer clsx tailwind-merge lucide-react sonner motion
  # State & Routing
  npm install @tanstack/react-query @tanstack/react-query-devtools react-router-dom axios
  # Form & Validation
  npm install react-hook-form @hookform/resolvers zod
  # Đa ngôn ngữ (i18n)
  npm install i18next react-i18next i18next-browser-languagedetector
  # Testing
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom msw
  ```
- [ ] **Cấu hình Path Alias trong `vite.config.ts` và `tsconfig.json`**:
  - Alias `@/` trỏ tới `./src/`.
- [ ] **Thiết lập cấu trúc thư mục chuẩn**:
  ```text
  web-bakery-frontend/
  +-- src/
      +-- api/               # Axios client, base API calls, endpoints
      +-- components/
      |   +-- ui/            # shadcn/ui & animate-ui primitives (Button, Dialog, Sheet, AnimatedCard...)
      |   +-- common/        # Header, Footer, Breadcrumb, ProtectedRoute, ImageUploader (Cloudinary)...
      |   +-- layout/        # MainLayout, AdminLayout, AuthLayout
      +-- features/          # Chia theo module tính năng
      |   +-- auth/          # Login, Register, Profile, Token management
      |   +-- products/      # Catalog, Detail, Search, CategoryFilter
      |   +-- cart/          # CartDrawer, CartTable, SyncCart
      |   +-- checkout/      # CheckoutForm, AddressSelector, VietQRModal (SePay)
      |   +-- orders/        # OrderTracking, OrderDetail, ReturnRequest
      |   +-- admin/         # Dashboard, Users, Products (Cloudinary upload), Orders, Reports
      +-- hooks/             # Custom hooks (useCart, useAuth, useDebounce...)
      +-- locales/           # i18n JSON files (vi.json, en.json)
      +-- types/             # TypeScript models/DTO interfaces
      +-- utils/             # Helper format tiền tệ (VND), format ngày tháng, Cloudinary URL optimizer
  ```

---

### Bước 4.2: Tích hợp UI Design System (Tailwind CSS, shadcn/ui & animate-ui)
- [ ] **Cấu hình Tailwind Theme với CSS Variables**:
  - Khai báo bảng màu chủ đạo cho thương hiệu tiệm bánh healthy (Tone màu nâu bánh mì, xanh lá organic, kem bơ):
    ```css
    :root {
      --primary: 138 18% 34%;     /* #47654c - Xanh thảo mộc Hebekery */
      --secondary: 35 30% 95%;   /* #f7f3ec - Màu kem bơ nhạt */
      --accent: 32 80% 55%;      /* Màu cam mật ong */
    }
    ```
- [ ] **Cài đặt các component shadcn/ui & Quy chuẩn Giao diện Tối giản (Sharp & Tactile Minimalist)**:
  - Cấu hình toàn bộ component theo phong cách vuông vức dứt khoát **`rounded-none`**, không bo góc.
  - Loại bỏ hoàn toàn mô hình card lồng card; phân tách bố cục bằng khoảng trắng và đường kẻ mỏng phẳng (`border-b`).
  - **Component `Button` chuẩn Tactile Raised**: Phủ nền màu đặc (Solid Fill), lớp highlight phủ bóng cạnh trên (`inset 0 1px 0 rgba(255,255,255,0.2)`), đổ bóng chân nút tạo độ nổi khối 3D và hiệu ứng lún cơ học khi nhấn (`active:translate-y-[1px]`).
  - `Button`, `Input`, `Textarea`, `Select`, `Dialog`, `Sheet` (cho Giỏ hàng trượt ra từ bên phải).
  - `DataTable` (kết hợp TanStack Table cho trang Quản lý đơn hàng, Quản lý sản phẩm admin).
  - `Sonner` (Toast notification thông báo thành công / thất bại mượt mà).
- [ ] **Tích hợp Animate UI CLI & Agent Skill**:
  - Cài đặt AI Agent Skill cho Animate UI (giúp AI Assistant hiểu sâu hệ thống spring physics, animation tokens và registry component):
    ```bash
    npx skills add imskyleen/animate-ui
    ```
  - Chuyển đổi và nâng cấp tự động toàn bộ component sang phiên bản Animated:
    ```bash
    npx @animate-ui/cli@latest animate all
    ```
- [ ] **Tích hợp các thành phần động từ `animate-ui` (`imskyleen/animate-ui`)**:
  - **Hero & Banner Animations**: Áp dụng text morphing / reveal animation và floating badges (Organic, Healthy, Ít Calo) cho trang chủ tiệm bánh.
  - **Animated Product Cards**: Hiệu ứng hover card mượt mà, scale nhẹ, tag giảm giá nhấp nháy tinh tế, hiệu ứng layout transition khi lọc theo danh mục sản phẩm (bánh mì tươi, bánh quy ăn kiêng, granola).
  - **Animated Cart Drawer & Sheet**: Trượt vào êm ái bằng `motion`, animated badge số lượng giỏ hàng khi thêm sản phẩm (bounce/scale-up).
  - **Interactive Admin Dashboard**: Card thống kê doanh thu / tồn kho có count-up animation, modal thêm/sửa sản phẩm mở ra với spring animation mượt mà.
- [ ] **Xây dựng component `ImageUploader.tsx` (Cloudinary Integration)**:
  - Cho phép kéo thả (drag & drop) ảnh sản phẩm trong trang quản trị.
  - Tải ảnh lên endpoint `/api/upload/image`, hiển thị thanh tiến trình (progress bar), ảnh xem trước (preview thumbnail).
  - Tích hợp hàm tiện ích tối ưu ảnh Cloudinary (tự động thêm `f_auto,q_auto,w_600` vào URL để tải trang siêu tốc).

---

### Bước 4.3: Tích hợp State Management & Data Fetching (TanStack Query v5)
- [ ] **Tạo Axios Instance (`src/api/axiosClient.ts`)**:
  - Đính kèm `Authorization: Bearer <token>` vào mọi request qua Request Interceptor.
  - Tự động bắt lỗi HTTP 401: Xóa token và điều hướng về trang Login hoặc gọi endpoint `/api/auth/refresh-token` qua Response Interceptor.
- [ ] **Xây dựng Custom Query Hooks**:
  - `useProducts(params)`: Gọi `GET /api/products`, quản lý `staleTime: 5 * 60 * 1000` (5 phút), pagination state.
  - `useProductDetail(id)`: Gọi `GET /api/products/{id}`.
  - `useCart()`: Lấy giỏ hàng từ server nếu đã đăng nhập hoặc từ LocalStorage nếu là khách.
  - `useAdminOrders(filterParams)`: Quản lý danh sách đơn hàng cho admin.
- [ ] **Xây dựng Custom Mutation Hooks (với Optimistic Updates)**:
  - `useAddToCart()`: Thêm sản phẩm, cập nhật ngay UI số lượng trên icon giỏ hàng trước khi server phản hồi.
  - `useCheckout()`: Gửi thông tin đơn hàng, xử lý mở Modal hiển thị mã VietQR động đối soát qua SePay nếu chọn chuyển khoản online.
  - `useUpdateOrderStatus()`: Admin đổi trạng thái đơn, tự động invalidate query `["admin-orders"]` để nạp dữ liệu mới.

---

### Bước 4.4: Điều Hướng (Routing) & Bảo Vệ Tuyến Đường (Private Route)
- [ ] **Cấu hình React Router v6 (`src/routes/AppRoutes.tsx`)**:
  - **Public Routes (MainLayout)**:
    - `/` (Home), `/products` (Catalog), `/products/:id` (Detail), `/about`, `/contact`, `/bmi-tdee`.
  - **Auth Routes (AuthLayout)**:
    - `/login`, `/register`.
  - **User Protected Routes (`<RequireAuth role="USER" />`)**:
    - `/profile`, `/orders`, `/orders/:id`, `/checkout`.
  - **Admin Protected Routes (`<RequireAuth role="ADMIN" />`)**:
    - `/admin/dashboard`, `/admin/products`, `/admin/orders`, `/admin/inventory`, `/admin/reports`, `/admin/users`.
- [ ] **Tạo Dynamic Breadcrumb**:
  - Tự động sinh breadcrumb theo cấu trúc URL (ví dụ: Trang chủ > Sản phẩm > Bánh Biscotti Ăn Kiêng).

---

### Bước 4.5: Xử lý Form Toàn Diện với `react-hook-form` + `zod`
- [ ] **Viết Schema Validation bằng Zod (`src/schemas/`)**:
  ```typescript
  export const checkoutSchema = z.object({
    customerName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
    province: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố"),
    district: z.string().min(1, "Vui lòng chọn Quận/Huyện"),
    ward: z.string().min(1, "Vui lòng chọn Phường/Xã"),
    address: z.string().min(5, "Vui lòng nhập số nhà, tên đường cụ thể"),
    paymentMethod: z.enum(["COD", "VIETQR"]),
    note: z.string().max(500, "Ghi chú không được vượt quá 500 ký tự").optional()
  });
  ```
- [ ] **Xử lý Dynamic Field Array**:
  - Dùng `useFieldArray` trong trang Tạo phiếu nhập kho (Admin thêm/bớt nhiều dòng sản phẩm nhập).
  - Tách field không thuộc payload API (ghi chú nội bộ) theo yêu cầu Phần 6.9 của FE Plan.

---

### Bước 4.6: Quốc tế hóa (i18n) & Thông Báo (Sonner Toast)
- [ ] **Cấu hình đa ngôn ngữ `react-i18next`**:
  - Tạo `src/locales/vi.json` và `src/locales/en.json`.
  - Dịch toàn bộ menu, tiêu đề, trạng thái đơn hàng:
    - PENDING: Chờ xử lý / Pending
    - SHIPPING: Đang giao hàng / Shipping
    - DELIVERED: Đã giao hàng / Delivered
    - RECEIVED: Đã nhận hàng / Received
    - CANCELLED: Đã hủy / Cancelled
  - Tạo component chuyển đổi ngôn ngữ (LanguageSwitcher: Tiếng Việt 🇻🇳 / English 🇬🇧).
- [ ] **Toast Notification**:
  - Tích hợp Sonner cho toàn bộ thông báo:
    - `toast.success("Đã thêm vào giỏ hàng")`
    - `toast.error("Số lượng trong kho không đủ")`

---

### Bước 4.7: Kiểm thử Tự Động Frontend (Vitest + React Testing Library)
- [ ] **Cấu hình `vitest.config.ts`** với môi trường `jsdom`.
- [ ] **Viết Unit Test cho Component**:
  - `ProductCard.test.tsx`:
    - Render đúng tên, giá bán định dạng VND, ảnh và tag giảm giá.
    - Click nút "Thêm vào giỏ" gọi đúng hàm callback với ID sản phẩm.
- [ ] **Viết Unit Test cho Custom Hook**:
  - `useCart.test.tsx`:
    - Test hàm `addItem()` tăng số lượng trong giỏ.
    - Test hàm `removeItem()` xóa mặt hàng khỏi danh sách.
    - Test tính đúng tổng tiền thanh toán (`subtotal`).

---

## 3. Tiêu chí nghiệm thu Giai đoạn 4 (Acceptance Criteria)

1. **Giao diện, Chuyển động & Trải nghiệm (UI/UX & Motion)**:
   - Ứng dụng chạy mượt mà dưới dạng SPA, chuyển trang không có độ trễ tải lại trang (no full reload).
   - Tích hợp hiệu ứng chuyển động tự nhiên, tinh tế từ `animate-ui` và `motion` (Hero text reveal, card hover, modal transition, animated cart bounce) mà không gây giật lag hay tụt FPS.
   - Responsive hoàn hảo trên Mobile, Tablet và Desktop.
2. **Tích hợp API & Quản lý Media**:
   - Thực hiện đầy đủ các luồng: Xem danh mục -> Tìm kiếm -> Thêm giỏ hàng -> Đăng nhập (nhận JWT) -> Đặt hàng -> Theo dõi đơn hàng -> Đổi trả.
   - Admin đăng nhập quản lý toàn diện: duyệt đơn hàng, cập nhật vận đơn, xuất báo cáo CSV/PDF, quản trị tồn kho.
   - Quản trị viên tải ảnh sản phẩm lên Cloudinary trực tiếp và an toàn, có ảnh xem trước (preview thumbnail), tốc độ tải ảnh tối ưu qua CDN.
3. **Đa ngôn ngữ & Kiểm thử**:
   - Chuyển đổi ngôn ngữ Tiếng Việt và Tiếng Anh tức thì mà không cần nạp lại trang.
   - Chạy lệnh `npm run test` (hoặc `npx vitest run`) pass 100% các bài test component và custom hook.
