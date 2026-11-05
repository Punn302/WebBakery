# 📋 BỘ KỊCH BẢN KIỂM THỬ THỰC HÀNH CỤC BỘ (LOCAL MANUAL TEST CASES)
## HỆ THỐNG THƯƠNG MẠI ĐIỆN TỬ TIỆM BÁNH HEBEKERY

> **Môi trường thử nghiệm**: Local (`http://localhost` qua Docker Gateway hoặc `http://localhost:5173` qua Vite Dev)  
> **Backend**: Spring Boot 3.4 (`http://localhost:8080`)  
> **Ngrok Webhook Tunnel**: `https://yam-bubble-surrender.ngrok-free.dev`

---

## 📑 BẢNG QUYỀN HẠN CÁC NHÓM VAI TRÒ KIỂM THỬ (ROLES)

> [!TIP]
> Tài khoản kiểm thử có thể sử dụng các tài khoản được cấp quyền sẵn trong cơ sở dữ liệu nội bộ của bạn hoặc tạo mới qua tính năng Đăng ký (`/register`). Không lưu thông tin tài khoản hoặc mật khẩu thực tế lên tài liệu mã nguồn công khai.

| Vai trò (Role) | Mô tả vai trò | Quyền hạn kiểm thử |
| :--- | :--- | :--- |
| **`ADMIN`** | Quản trị viên hệ thống | Toàn quyền quản trị hệ thống, người dùng, sản phẩm, kho, đơn hàng, báo cáo doanh thu |
| **`STAFF_SALES`** | Nhân viên kinh doanh | Xử lý duyệt đơn hàng, cập nhật vận chuyển, quản lý phản hồi liên hệ khách hàng |
| **`STAFF_WAREHOUSE`** | Nhân viên thủ kho | Quản lý danh mục & sản phẩm, kiểm kê và điều chỉnh số lượng tồn kho |
| **`USER`** | Khách hàng mua sắm | Đặt hàng, giỏ hàng, thanh toán VietQR / COD, sổ địa chỉ, đánh giá sản phẩm |

---

## 🧪 1. MODULE XÁC THỰC & PHÂN QUYỀN (AUTH & RBAC)

### TC-AUTH-01: Đăng nhập thành công với vai trò Quản trị viên (Admin)
- **Mục tiêu**: Xác thực người dùng Admin và kiểm tra quyền truy cập các trang quản trị.
- **Các bước thực hiện**:
  1. Truy cập `http://localhost/login`.
  2. Nhập thông tin đăng nhập của tài khoản Quản trị viên (ADMIN).
  3. Bấm **"Đăng Nhập"**.
- **Kết quả mong đợi**:
  - Thông báo toast: *"Đăng nhập thành công!"*.
  - Chuyển hướng về trang chủ hoặc trang Admin.
  - Trên thanh Header xuất hiện nút xanh có biểu tượng khiên: **"Quản trị"** (`/admin/dashboard`).
  - Bấm vào nút "Quản trị" truy cập được đầy đủ 6 phân hệ (Tổng quan, Đơn hàng, Sản phẩm, Tồn kho, Báo cáo, Khách hàng, Liên hệ).

---

### TC-AUTH-02: Kiểm tra phân quyền RBAC nhân viên Bán hàng (STAFF_SALES)
- **Mục tiêu**: Đảm bảo nhân viên Sales chỉ vào được trang Đơn hàng và Liên hệ, bị chặn vào Quản lý người dùng.
- **Các bước thực hiện**:
  1. Đăng xuất tài khoản hiện tại.
  2. Đăng nhập bằng tài khoản có vai trò Nhân viên Bán hàng (`STAFF_SALES`).
  3. Nhìn menu thanh bên quản trị: Kiểm tra danh sách menu hiển thị.
  4. Cố tình gõ trực tiếp URL `http://localhost/admin/users` trên thanh địa chỉ trình duyệt.
- **Kết quả mong đợi**:
  - Nhân viên Sales chỉ thấy menu: **"Quản Lý Đơn Hàng"** và **"Phản Hồi Liên Hệ"**.
  - Không thấy menu "Quản Lý Người Dùng", "Báo Cáo Doanh Thu".
  - Khi cố tình vào `http://localhost/admin/users`, hệ thống tự động chặn và điều hướng về trang cho phép (`/admin/orders`).

---

### TC-AUTH-03: Kiểm tra phân quyền RBAC nhân viên Kho (STAFF_WAREHOUSE)
- **Mục tiêu**: Đảm bảo nhân viên Kho chỉ vào được trang Sản phẩm và Tồn kho.
- **Các bước thực hiện**:
  1. Đăng nhập bằng tài khoản có vai trò Nhân viên Kho (`STAFF_WAREHOUSE`).
  2. Kiểm tra menu thanh bên quản trị.
  3. Cố tình gõ trực tiếp URL `http://localhost/admin/reports` trên trình duyệt.
- **Kết quả mong đợi**:
  - Menu chỉ hiển thị: **"Quản Lý Sản Phẩm"** và **"Kiểm Kê Tồn Kho"**.
  - Bị chặn khi truy cập trang báo cáo doanh thu (`/admin/reports`).

---

### TC-AUTH-04: Đăng ký tài khoản khách hàng mới & Kiểm tra xác thực lỗi
- **Mục tiêu**: Kiểm tra tính toàn vẹn và thông báo lỗi khi đăng ký.
- **Các bước thực hiện**:
  1. Truy cập `http://localhost/register`.
  2. Thử bấm "Đăng ký" khi để trống thông tin $\rightarrow$ Kiểm tra thông báo lỗi validate đỏ dưới từng ô.
  3. Nhập mật khẩu dưới 6 ký tự $\rightarrow$ Kiểm tra thông báo lỗi.
  4. Nhập Họ tên hợp lệ, Email mới (ví dụ: `testuser01@gmail.com`), Mật khẩu: `123456`, Số điện thoại: `0901234567`.
  5. Bấm **"Đăng Ký Thành Viên"**.
- **Kết quả mong đợi**:
  - Tạo tài khoản thành công, tự động đăng nhập hoặc chuyển hướng đến trang đăng nhập với thông báo thành công.

---

## 🥐 2. MODULE THỰC ĐƠN, BỘ LỌC & CÔNG CỤ DINH DƯỠNG

### TC-STORE-01: Xem thực đơn và bộ lọc sản phẩm
- **Mục tiêu**: Kiểm tra hình ảnh Cloudinary, bộ lọc danh mục và ô tìm kiếm.
- **Các bước thực hiện**:
  1. Bấm vào menu **"Menu"** trên Header (`http://localhost/products`).
  2. Quan sát danh sách sản phẩm: Mỗi thẻ bánh hiển thị ảnh Cloudinary chất lượng cao, tên bánh, badge nổi bật ("Best Seller", "Keto", "Không đường",...), giá tiền định dạng VNĐ.
  3. Bấm vào nút lọc **"Bánh ăn kiêng"** $\rightarrow$ Chỉ hiển thị các loại bánh ăn kiêng (Biscotti, Sourdough, Chuối yến mạch,...).
  4. Gõ từ khóa `"Granola"` vào ô tìm kiếm $\rightarrow$ Lọc ra đúng các dòng Granola.
- **Kết quả mong đợi**:
  - Dữ liệu hiển thị mượt mà, ảnh tải nhanh qua CDN, không có lỗi 404 hay ảnh vỡ.

---

### TC-STORE-02: Đo chỉ số BMI/TDEE & Đặt combo thực đơn 7 ngày
- **Mục tiêu**: Kiểm tra công cụ tính toán thể trạng và cơ chế 1-Click Upsell combo.
- **Các bước thực hiện**:
  1. Truy cập trang **"BMI & TDEE"** (`http://localhost/bmi-tdee`).
  2. Nhập thông số: Giới tính: *Nữ*, Tuổi: *25*, Chiều cao: *162 cm*, Cân nặng: *54 kg*.
  3. Chọn mục tiêu: *Giảm mỡ tự nhiên*.
  4. Quan sát bảng kết quả bên phải: Hiển thị chỉ số BMI (20.6 - Bình thường), Calo mục tiêu (1443 kcal/ngày) và tỷ lệ Macro (Đạm, Tinh bột tốt, Chất béo lành).
  5. Kéo xuống phần **"Gợi Ý Thực Đơn Bánh 7 Ngày"**: Quan sát gói combo giảm giá 10% (364.500 đ).
  6. Bấm nút **"Thêm Gói 7 Ngày Vào Giỏ Hàng"**.
- **Kết quả mong đợi**:
  - Giỏ hàng tự động mở ra bên góc phải màn hình, hiển thị gói combo với số lượng 1 và tổng tiền chính xác.

---

## 🛒 3. MODULE GIỎ HÀNG & SỔ ĐỊA CHỈ GIAO HÀNG

### TC-CART-01: Quản lý giỏ hàng trực tuyến
- **Mục tiêu**: Kiểm tra thêm, tăng giảm số lượng, xóa sản phẩm khỏi giỏ.
- **Các bước thực hiện**:
  1. Tại trang thực đơn, bấm nút **"+ Thêm"** trên 2 sản phẩm khác nhau.
  2. Mở ngăn kéo giỏ hàng (icon túi xách trên Header).
  3. Bấm nút `+` để tăng số lượng sản phẩm lên 2.
  4. Bấm nút `-` để giảm số lượng.
  5. Bấm icon thùng rác để xóa 1 sản phẩm.
- **Kết quả mong đợi**:
  - Badge số lượng trên icon giỏ hàng cập nhật hiệu ứng rung nhẹ (motion badge).
  - Tổng tiền đơn hàng được tính toán lại chính xác tức thì.

---

### TC-ADDR-01: Quản lý sổ địa chỉ giao hàng trong trang cá nhân
- **Mục tiêu**: Kiểm tra tạo và lưu trữ nhiều địa chỉ giao hàng.
- **Các bước thực hiện**:
  1. Đăng nhập bằng tài khoản Khách hàng (`USER`).
  2. Bấm vào tên người dùng trên Header $\rightarrow$ Chọn **"Tài Khoản"** (`http://localhost/profile`).
  3. Chuyển sang tab **"Sổ Địa Chỉ Giao Hàng"**.
  4. Bấm **"Thêm Địa Chỉ Mới"**.
  5. Nhập: Tên người nhận: *Nguyễn Văn A*, SĐT: *0912345678*, Tỉnh/Thành: *TP. Hồ Chí Minh*, Quận/Huyện: *Quận 1*, Phường/Xã: *Bến Nghé*, Địa chỉ chi tiết: *123 Lê Thánh Tôn*.
  6. Tích chọn *"Đặt làm địa chỉ mặc định"* $\rightarrow$ Bấm **"Lưu Địa Chỉ"**.
- **Kết quả mong đợi**:
  - Địa chỉ mới xuất hiện trong danh sách với badge "Mặc định".
  - Khi sang trang Thanh toán (`/checkout`), địa chỉ này tự động được chọn sẵn.

---

## 💳 4. MODULE ĐẶT HÀNG & THANH TOÁN TỰ ĐỘNG SEPAY VIETQR

### TC-PAY-01: Đặt hàng phương thức COD (Tiền mặt)
- **Mục tiêu**: Kiểm tra luồng thanh toán truyền thống.
- **Các bước thực hiện**:
  1. Mở giỏ hàng có ít nhất 1 sản phẩm $\rightarrow$ Bấm **"Tiến Hành Thanh Toán"** (`/checkout`).
  2. Chọn địa chỉ giao hàng đã lưu.
  3. Chọn phương thức thanh toán: **"Thanh toán tiền mặt khi nhận bánh (COD)"**.
  4. Bấm **"Đặt Hàng Ngay"**.
- **Kết quả mong đợi**:
  - Đơn hàng được tạo thành công với trạng thái `PENDING`.
  - Tự động chuyển hướng sang trang **"Lịch Sử Đơn Hàng"** (`/orders`), hiển thị mã đơn hàng mới.

---

### TC-PAY-02: Đặt hàng phương thức Chuyển khoản VietQR tự động qua SePay
- **Mục tiêu**: Kiểm tra hiển thị Modal VietQR, mã QR động và đồng hồ đếm ngược 15:00.
- **Các bước thực hiện**:
  1. Tại trang Checkout, chọn phương thức: **"Chuyển khoản VietQR tự động (SePay)"**.
  2. Bấm **"Đặt Hàng Ngay"**.
- **Kết quả mong đợi**:
  - Popup Modal VietQR lập tức xuất hiện ở giữa màn hình.
  - Hiển thị ảnh mã QR VietQR động chứa đúng số tiền đơn hàng.
  - Hiển thị thông tin chuyển khoản: Ngân hàng MBBank, STK, Chủ TK, và **Nội dung chuyển khoản** (ví dụ: `HBKORD12345`).
  - Thanh đồng hồ đếm ngược **15:00** bắt đầu đếm lùi từng giây (`14:59`, `14:58`,...).
  - Dòng chữ: *"Hệ thống đang tự động nhận diện thanh toán qua SePay Webhook..."* kèm hiệu ứng kiểm tra mỗi 3 giây.

---

### TC-PAY-03: Kiểm thử Webhook SePay đổi trạng thái thanh toán thành công (Real-time Polling)
- **Mục tiêu**: Giả lập SePay bắn webhook xác nhận chuyển khoản và kiểm tra giao diện tự động đổi trạng thái.
- **Các bước thực hiện**:
  1. Giữ nguyên màn hình Modal VietQR ở bước TC-PAY-02 (ghi nhớ mã đơn hàng trên modal, ví dụ: `HBK12345` hoặc `ORD-abc`).
  2. Mở một cửa sổ dòng lệnh PowerShell / Terminal và chạy lệnh cURL giả lập Webhook SePay (thay mã đơn, số tiền và API Key trong file `.env` của bạn):
     ```bash
     curl.exe -i -X POST "https://yam-bubble-surrender.ngrok-free.dev/api/payment/sepay/webhook" \
       -H "Authorization: Apikey <SEPAY_WEBHOOK_API_KEY>" \
       -H "Content-Type: application/json" \
       -d "{\"gateway\":\"MBBank\",\"transactionDate\":\"2026-11-05 23:00:00\",\"accountNumber\":\"0987654321\",\"content\":\"HBK12345\",\"transferType\":\"in\",\"transferAmount\":219000,\"referenceCode\":\"FT_TEST_001\"}"
     ```
  3. Quay lại nhìn màn hình trình duyệt đang mở Modal VietQR.
- **Kết quả mong đợi**:
  - Trong vòng **tối đa 3 giây** (chu kỳ polling), Modal VietQR tự động biến mất và thay thế bằng màn hình màu xanh lá rực rỡ:
    - Biểu tượng tích xanh chuyển động nảy: **"Thanh Toán Thành Công!"**.
    - Thông điệp: *"Hệ thống ngân hàng SePay đã đối soát thành công. Tiệm bánh Hebekery đang bắt đầu làm bánh tươi cho bạn!"*.
  - Sau 2 giây, trang tự động chuyển về trang Quản lý đơn hàng (`/orders`), đơn hàng đã chuyển trạng thái sang **Đã thanh toán (`PAID`)** và **Đang xử lý (`PROCESSING`)**.

---

### TC-PAY-04: Kiểm thử Scheduler tự động hủy đơn quá hạn 15 phút
- **Mục tiêu**: Đảm bảo các đơn hàng VietQR bị bỏ quên sẽ tự động bị hủy và hoàn kho.
- **Điều kiện**: Đơn hàng VietQR tạo xong không được chuyển khoản sau 15 phút.
- **Kết quả mong đợi**:
  - Modal chuyển sang cảnh báo màu đỏ: *"Đơn hàng đã hết hạn thanh toán (quá 15 phút). Kiện hàng đã được hoàn kho để phục vụ khách hàng khác."*.
  - Trạng thái đơn hàng trong cơ sở dữ liệu chuyển sang `CANCELLED`.
  - Tồn kho sản phẩm được cộng hoàn trả nguyên vẹn.

---

## 📦 5. VÒNG ĐỜI ĐƠN HÀNG, ĐÁNH GIÁ & TRA CỨU CÔNG KHAI

### TC-ORDER-01: Khách hàng xác nhận "Đã nhận hàng thành công" & Đánh giá Review
- **Mục tiêu**: Kiểm tra luồng xác nhận giao hàng và đánh giá chất lượng bánh.
- **Các bước thực hiện**:
  1. Tại trang `/orders`, tìm một đơn hàng đang ở trạng thái `SHIPPING` hoặc `DELIVERED`.
  2. Bấm nút xanh: **"Đã nhận được hàng"**.
  3. Trạng thái đơn chuyển sang `RECEIVED`.
  4. Nút vàng **"Đánh giá sản phẩm"** lập tức xuất hiện cạnh đơn hàng.
  5. Bấm vào "Đánh giá sản phẩm" $\rightarrow$ Chọn 5 sao $\rightarrow$ Nhập cảm nghĩ: *"Bánh biscotti rất giòn, hạt thơm bùi và ít ngọt đúng chuẩn eat clean!"* $\rightarrow$ Bấm **"Gửi Đánh Giá"**.
- **Kết quả mong đợi**:
  - Thông báo đánh giá thành công.
  - Điểm đánh giá sao và bình luận xuất hiện công khai trên trang chi tiết sản phẩm đó.

---

### TC-ORDER-02: Tra cứu đơn hàng công khai (Không cần đăng nhập)
- **Mục tiêu**: Cho phép khách vãng lai tra cứu đơn bằng mã đơn hoặc số điện thoại.
- **Các bước thực hiện**:
  1. Mở cửa sổ ẩn danh (Incognito) hoặc đăng xuất tài khoản.
  2. Bấm vào menu **"Tra cứu đơn"** trên Header (`http://localhost/tracking`).
  3. Nhập số điện thoại đặt hàng (ví dụ: `0912345678`) hoặc mã đơn hàng.
  4. Bấm **"Tra cứu"**.
- **Kết quả mong đợi**:
  - Hệ thống hiển thị toàn bộ tiến độ đơn hàng (Đã nhận đơn $\rightarrow$ Đang nướng bánh $\rightarrow$ Đang giao hàng), danh sách các món bánh trong kiện và tổng tiền mà không cần yêu cầu đăng nhập.

---

## 📊 6. MODULE QUẢN TRỊ ADMIN (ADMIN DASHBOARD)

### TC-ADMIN-01: Xử lý đơn hàng & Cập nhật vận chuyển
- **Các bước**: Đăng nhập `admin@hebekery.vn` $\rightarrow$ Vào `/admin/orders` $\rightarrow$ Chọn một đơn mới $\rightarrow$ Bấm đổi trạng thái sang "Đang giao hàng", điền đơn vị vận chuyển: *Giao Hàng Nhanh*, Mã vận đơn: *GHN12345678* $\rightarrow$ Bấm Xác nhận.
- **Kết quả**: Đơn hàng cập nhật trạng thái tức thì, khách hàng tra cứu sẽ thấy ngay mã vận đơn GHN.

### TC-ADMIN-02: Kiểm kê tồn kho & Cảnh báo sắp hết hàng
- **Các bước**: Vào `/admin/inventory` $\rightarrow$ Xem danh sách sản phẩm và số lượng tồn $\rightarrow$ Các sản phẩm có tồn kho $\le 5$ hiển thị cảnh báo đỏ "Sắp hết hàng".
- **Kết quả**: Có thể bấm "Tạo phiếu nhập kho" để nhập thêm số lượng bánh từ xưởng nướng.

### TC-ADMIN-03: Xem báo cáo doanh thu & Xuất file PDF/CSV
- **Các bước**: Vào `/admin/reports` $\rightarrow$ Xem biểu đồ doanh thu theo ngày/tháng, tỷ suất lợi nhuận và Top 5 bánh bán chạy $\rightarrow$ Bấm **"Xuất Báo Cáo PDF"** hoặc **"Xuất CSV"**.
- **Kết quả**: Trình duyệt tải xuống file báo cáo chuẩn định dạng, đầy đủ số liệu thống kê.
