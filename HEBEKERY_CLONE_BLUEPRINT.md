# BẢN ĐẶC TẢ TÁI CẤU TRÚC GIAO DIỆN CHUẨN HEBEKERY (READONLY CLONE BLUEPRINT)
> **Mục tiêu**: Bản sao chép kiến trúc 1:1 chuẩn xác từ website thực tế `https://hebekery.vn/`.  
> **Quy chuẩn**: Tối giản văn bản (Minimal Text), tập trung hình ảnh & thông số dinh dưỡng/calo, áp dụng 100% Design Tokens và Typography chính hãng.

---

## MỤC LỤC
1. [Hệ Thống Design Tokens & Foundations](#1-hệ-thống-design-tokens--foundations)
2. [Hệ Thống Typography Stack](#2-hệ-thống-typography-stack)
3. [Global Header & Navigation](#3-global-header--navigation)
4. [Trang Chủ (Homepage - 6 Sections Chuẩn)](#4-trang-chủ-homepage---6-sections-chuẩn)
5. [Trang Danh Mục Sản Phẩm (Collections / All)](#5-trang-danh-mục-sản-phẩm-collections--all)
6. [Trang Chi Tiết Sản Phẩm (Product Detail)](#6-trang-chi-tiết-sản-phẩm-product-detail)
7. [Trang Công Cụ Sức Khỏe (BMI & TDEE Calculator)](#7-trang-công-cụ-sức-khỏe-bmi--tdee-calculator)
8. [Trang Câu Chuyện Thương Hiệu (About / Story)](#8-trang-câu-chuyện-thương-hiệu-about--story)
9. [Trang Liên Hệ & Cửa Hàng (Contact & Stores)](#9-trang-liên-hệ--cửa-hàng-contact--stores)
10. [Global Footer & Chứng Nhận](#10-global-footer--chứng-nhận)

---

## 1. HỆ THỐNG DESIGN TOKENS & FOUNDATIONS

### 1.1 Bảng màu chuẩn trích xuất từ `:root`

```css
:root {
  /* Brand Primary Colors */
  --mainColor: #006561;          /* Teal Deep - Màu thương hiệu chính, logo, nút CTA chính */
  --mainColor2: #1a9a9b;         /* Teal Light - Hover state, icon phụ, liên kết */

  /* Topbar & Heritage Accents */
  --bgTopbar: #91350a;           /* Terracotta Dark - Thanh thông báo đầu trang */
  --textTopbar: #f6e9df;         /* Warm Peach Cream - Chữ thanh topbar */
  --terracotta: #C9785C;         /* Terracotta Medium - Điểm nhấn phụ, icon */
  --terracotta-700: #B23A2A;     /* Terracotta Red - Nhãn giảm giá, nút heritage */
  --terracottaHover700: #9A2F20; /* Terracotta Hover */
  --terracotta-100: #FFE6DC;     /* Terracotta Tint - Nền nhãn sale */

  /* Canvas & Warm Backgrounds */
  --bg-body: #FEFBF4;            /* Warm Oat Cream - Màu nền toàn trang (thay thế #ffffff) */
  --sand-canvas: #F8F6F5;        /* Sand Canvas - Nền các khối banner, khung tính toán */
  --oat-cream: #F4EFE6;          /* Oat Cream - Nền card nổi bật, nền badge calo */
  --warm-cream: #F2EAD8;         /* Warm Cream - Nhãn ưu đãi đặc biệt */
  --bg-footer: #FBF6EA;          /* Footer Cream - Nền chân trang */

  /* Nature Accents */
  --mustard: #c8983d;            /* Mustard Gold - Ngôi sao rating, huy hiệu VVIP */
  --sage: #7B9461;               /* Sage Herbal - Nhãn eat clean, thuần chay, 0g đường */

  /* Inks & Text Colors */
  --ink-primary: #2A2725;        /* Mực đen xám ấm - Dùng cho toàn bộ heading & body */
  --ink-secondary: #6B6661;      /* Xám trung - Phụ đề, khối lượng, nhãn danh mục */
  --ink-tertiary: #9A938C;       /* Xám nhạt - Giá gạch ngang cũ, placeholder */

  /* Borders & Shadows */
  --border-subtle: #E5E2DF;      /* Viền mỏng phân chia thẻ card và bảng */
  --shadow-sm: 0 2px 4px rgba(36, 30, 14, 0.06);
  --shadow-md: 0 8px 20px -8px rgba(36, 30, 14, 0.16);
  --shadow-lg: 0 16px 36px -12px rgba(36, 30, 14, 0.22);

  /* Animation Easings */
  --hebekery-easing-default: cubic-bezier(0.32, 0.72, 0, 1);
  --hebekery-easing-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --hebekery-easing-warmth: cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### 1.2 Spacing Scale
- `--space-1`: `4px`
- `--space-2`: `8px`
- `--space-3`: `12px`
- `--space-4`: `16px`
- `--space-6`: `24px`
- `--space-8`: `32px`
- `--space-12`: `48px`
- `--space-16`: `64px`
- `--space-20`: `80px`
- `--space-24`: `96px`

---

## 2. HỆ THỐNG TYPOGRAPHY STACK

```html
<!-- Nhập font chuẩn Hebekery từ Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Wix+Madefor+Display:wght@400..800&family=Wix+Madefor+Text:ital,wght@0,400..800;1,400..800&display=swap" rel="stylesheet">
```

| Vai trò font | Tên Font | Biến CSS | Ứng dụng cụ thể |
| :--- | :--- | :--- | :--- |
| **Display / Heading** | `Wix Madefor Display` | `--font-display` | Tiêu đề sản phẩm, tiêu đề từng khối (`h1`, `h2`, `h3`), giá tiền nổi bật |
| **Heritage Serif** | `Cormorant Garamond` | `--font-serif` | Slogan thương hiệu, câu quote triết lý (*“Chọn nguyên liệu kỹ, làm chỉn chu”*) |
| **Body & UI** | `Montserrat` | `--font-text` | Menu, văn bản mô tả ngắn, nhãn nút bấm, bộ lọc danh mục |
| **Monospace / Specs**| `JetBrains Mono` | `--font-mono` | Số calo (`112 kcal`), khối lượng (`250g`), chỉ số BMI/TDEE |

---

## 3. GLOBAL HEADER & NAVIGATION

### 3.1 Cấu trúc DOM Header
```
┌────────────────────────────────────────────────────────────────────────┐
│ TOPBAR: Freeship toàn quốc đơn từ 299k • Giao 2h HCM                 │
│ (Bg: #91350a | Text: #f6e9df | H: 34px | Font: Montserrat 13px Bold)   │
├────────────────────────────────────────────────────────────────────────┤
│ MAIN NAVBAR (Bg: rgba(254, 251, 244, 0.95) Blur | H: 76px)            │
│ ┌───────────────┐ ┌────────────────────────────────────┐ ┌───────────┐ │
│ │ HeBekery      │ │ SẢN PHẨM ▼  CÂU CHUYỆN  COMBO QUÀ  │ │ 🔍 Tìm kiếm│ │
│ │ Health &      │ │ BLOG ▼  TÍNH BMI  TÍNH TDEE  LIÊN HỆ│ │ ☎ 0979764185│ │
│ │ Beauty Foods  │ │                                    │ │ 🛍 Giỏ hàng│ │
│ └───────────────┘ └────────────────────────────────────┘ └───────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Chi tiết Menu thả xuống (Mega Dropdown "SẢN PHẨM")
- `· SẢN PHẨM MỚI` (`/san-pham-moi`)
- `· BÁNH BISCOTTI NGUYÊN CÁM` (`/banh-biscotti-nguyen-cam-hebekery`)
- `· HẠT NGŨ CỐC GRANOLA` (`/hat-ngu-coc-granola`)
- `· BÁNH NGÓI HẠNH NHÂN KETO` (`/banh-ngoi-hanh-nhan`)
- `· THANH NĂNG LƯỢNG SIÊU HẠT` (`/energy-bar-thanh-nang-luong`)
- `· HẠT & TRÁI CÂY SẤY NHẬP` (`/hat-trai-cay-say-nhap-khau`)
- `· BÚN, NUI, MÌ GẠO LỨT` (`/bun-pho-banh-canh-nui-mi-gao-lut`)
- `· DEMEE - ĐỂ MẸ LO` (`/demee-de-me-lo`)

---

## 4. TRANG CHỦ (HOMEPAGE - 6 SECTIONS CHUẨN)

### Section 1: Hero Banner Slider (`mew_mobile_slide`)
- **Hình ảnh**: Ảnh chụp cận cảnh bánh biscotti / granola sắc nét, phong cách Scandinavian Warm Minimal.
- **Copy**: 
  - Tiêu đề: `BÁNH DINH DƯỠNG & ĂN KIÊNG HEALTHY`
  - Tagline: `Nướng mẻ nhỏ tươi mới mỗi ngày từ hạt & bột nguyên cám`
- **Nút CTA**: 
  - Nút chính: `Khám phá thực đơn >` (Nền `#006561`, chữ `#FEFBF4`, bo tròn 999px)
  - Nút phụ: `Về HeBekery` (Viền `#2A2725`, nền trong suốt)

### Section 2: Triết lý thương hiệu (`mew_about`)
- **Khối chữ nghệ thuật**:
  - Dòng trích dẫn Cormorant Garamond: *“Chọn nguyên liệu kỹ, làm chỉn chu — HeBekery đồng hành cùng lối sống lành mạnh của bạn.”*
- **4 Cột ảnh minh họa 4 hương vị signature (Tall aspect ratio 3:4)**:
  1. `FRUITY GRAINS`: Hạt ngũ cốc & quả mọng
  2. `DARK CHOCO`: Cacao nguyên chất không đường
  3. `PURE MATCHA`: Trà xanh Uji Nhật Bản
  4. `SALTY CHEESE`: Phô mai ít béo hảo hạng

### Section 3: 4 Chứng nhận & Cam kết (`m_policy`)
Trình bày dạng lưới 4 cột tối giản icon:
1. **ISO 22000:2018**: Tiêu chuẩn an toàn thực phẩm quốc tế.
2. **HACCP Codex**: Hệ thống phân tích & kiểm soát mối nguy.
3. **100% Nguyên liệu sạch**: Không đường tinh luyện • Bột nguyên cám.
4. **Giao hàng toàn quốc**: Freeship từ 299k • Giao nhanh 2h TP.HCM & Hà Nội.

### Section 4: Danh mục sản phẩm trực quan (`mew_cate`)
- **Tiêu đề**: `"Mời bạn sống lành cùng Hebekery"`
- **6 Thẻ danh mục (Pill card hình elip bo góc lớn)**:
  - `Granola`
  - `Biscotti`
  - `Thanh hạt (Nut Bar)`
  - `Bánh ngói hạnh nhân`
  - `Cookies nguyên cám`
  - `Mix Nuts sấy lạnh`

### Section 5: Sản phẩm mua nhiều nhất (`mew_bestseller`)
- **Tiêu đề**: `MUA NHIỀU NHẤT` + Liên kết `Xem tất cả (89) >`
- **Cấu trúc Thẻ sản phẩm chuẩn Hebekery**:
  ```
  ┌────────────────────────────────────────────────────────┐
  │ [Sale -17%]                        [Yêu thích ♡]       │
  │                                                        │
  │               [Ảnh sản phẩm tỉ lệ 1:1]                 │
  │                 (Zoom 1.05x khi hover)                 │
  │                                                        │
  ├────────────────────────────────────────────────────────┤
  │ [BÁNH NƯỚNG HEALTHY]            ⚡ 112 kcal / 2 bánh   │
  │ Combo 3 Hũ Cookies Hạnh Nhân Nguyên Cám               │
  │ 399.000₫   <del>480.000₫</del>                         │
  │ ┌────────────────────────────────────────────────────┐ │
  │ │                      MUA NGAY                      │ │
  │ └────────────────────────────────────────────────────┘ │
  └────────────────────────────────────────────────────────┘
  ```
  - Nút bấm `MUA NGAY` thuộc class `.btn-act`: Viền `1px solid #2A2725`, chữ đen xám. Hover: nền đen xám `#2A2725`, chữ trắng `#FFFFFF`.

### Section 6: Bộ công cụ sức khỏe Hebekery (`mew_tool`)
- **Tiêu đề**: `"Hiểu cơ thể để ăn đúng nhu cầu"`
- **3 Khối công cụ tương tác nhanh**:
  1. **Tính TDEE**: Tổng năng lượng tiêu hao mỗi ngày (kcal)
  2. **Tính BMI**: Chỉ số khối cơ thể & tình trạng vóc dáng
  3. **Tính BMR**: Tỷ lệ trao đổi chất cơ bản
- Mỗi khối có CTA: `Tính ngay >` dẫn thẳng tới trang công cụ chi tiết.

---

## 5. TRANG DANH MỤC SẢN PHẨM (COLLECTIONS / ALL)

### 5.1 Cột lọc bên trái (Sidebar Filter)
- **Theo loại bánh**:
  - `Tất cả` (89)
  - `Bánh Biscotti nguyên cám`
  - `Granola siêu hạt`
  - `Bánh ngói hạnh nhân keto`
  - `Thanh năng lượng hạt dinh dưỡng`
  - `Bún / Nui / Mì gạo lứt`
- **Theo nhu cầu sức khỏe ("BẠN CẦN")**:
  - `Ăn kiêng giảm cân`
  - `Keto / Low carb`
  - `Tập luyện thể thao (High Protein)`
  - `Đường huyết thấp (Tiểu đường / Eat clean)`
  - `Ăn chay thuần thực vật`
- **Khoảng giá**: Dưới 100k, 100k - 250k, 250k - 500k, Trên 500k.

### 5.2 Lưới sản phẩm (Grid)
- Desktop: 4 cột (`grid-cols-4`).
- Tablet: 3 cột (`grid-cols-3`).
- Mobile: 2 cột (`grid-cols-2`).
- Thanh sắp xếp: `Bán chạy nhất` (mặc định), `Giá tăng dần`, `Giá giảm dần`, `Mới nhất`.

---

## 6. TRANG CHI TIẾT SẢN PHẨM (PRODUCT DETAIL)

### 6.1 Bố cục 2 Cột (Thực tế Hebekery)
- **Cột trái (Gallery ảnh)**: Ảnh chính kích thước lớn (1:1 aspect ratio) với hiệu ứng zoom, dải thumbnail trượt bên dưới.
- **Cột phải (Sticky thông tin & mua hàng)**:
  - Tên sản phẩm (`Wix Madefor Display`, cỡ 24-26px, bold, màu `#2A2725`).
  - Khối Rating sao vàng `#c8983d` + Số lượt đánh giá.
  - Khối giá: Giá bán hiện tại `#006561` font đậm 22px + Giá cũ gạch ngang `#9A938C` + Badge tiết kiệm `-17%`.
  - **Bảng dinh dưỡng nhanh (Macro Grid)**:
    - `Calo`: 112 - 255 kcal / khẩu phần
    - `Protein`: 4.2g - 12g
    - `Carbs`: 14.5g - 28g
    - `Fat tốt`: 3.8g - 9g
  - Phân loại / Quy cách: Các nút pill chọn trọng lượng (`Hũ 250g`, `Hũ 500g`, `Combo Tiết Kiệm`).
  - Bộ đếm số lượng: `[ - ]  [ 1 ]  [ + ]`.
  - **Cụm 2 nút hành động**:
    - Nút 1: `THÊM VÀO GIỎ` (Nền trong suốt, viền xanh `#006561`, chữ xanh, hover nền xanh chữ trắng).
    - Nút 2: `MUA NGAY` (Nền xanh ngọc `#006561`, chữ kem sáng `#FEFBF4`, bo tròn).

### 6.2 Accordion nội dung bên dưới
1. **Thành phần & Giá trị dinh dưỡng**: Minh bạch 100% nguyên liệu tự nhiên, không hương liệu nhân tạo, không chất bảo quản.
2. **Hướng dẫn sử dụng & Bảo quản**: Hạn sử dụng 6 tháng, bảo quản nơi thoáng mát hoặc ngăn mát tủ lạnh.
3. **Cam kết thương hiệu**: Đổi trả 1-1 miễn phí nếu bánh không giòn hoặc lỗi từ nhà sản xuất.

---

## 7. TRANG CÔNG CỤ SỨC KHỎE (BMI & TDEE CALCULATOR)

### 7.1 Form tính toán tương tác
- **Đầu vào (Inputs)**:
  - Giới tính: `[ Nam ]` / `[ Nữ ]` (Toggle button)
  - Tuổi: Input số
  - Chiều cao (cm): Input số hoặc slider
  - Cân nặng (kg): Input số hoặc slider
  - Mức độ vận động (5 cấp độ: Ít vận động -> Rất năng động)
  - Mục tiêu cân nặng (Duy trì, Giảm mỡ nhẹ, Giảm cân nhanh, Tăng cơ)

### 7.2 Thước đo kết quả & Phân loại
- Thang đo chỉ số BMI với vạch chia màu rõ ràng:
  - `< 18.5`: Gầy (Màu xanh dương)
  - `18.5 - 22.9`: Cân đối lý tưởng (Màu xanh sage `#7B9461`)
  - `23.0 - 24.9`: Tiền thừa cân (Màu vàng mù tạt `#c8983d`)
  - `≥ 25.0`: Béo phì (Màu đỏ terracotta `#B23A2A`)
- **Chỉ số TDEE & Lượng calo khuyến nghị nạp mỗi ngày**:
  - Hiển thị số to dạng `JetBrains Mono` (ví dụ: `1,650 kcal/ngày`).

### 7.3 Khối gợi ý combo bánh tương ứng (Personalized Recommendation)
- Dựa trên lượng calo mục tiêu:
  - Nếu mục tiêu Giảm cân: Gợi ý `Combo Biscotti Ăn Kiêng + Trà Gạo Lứt (bữa phụ 120 kcal)`.
  - Nếu mục tiêu Tăng cơ/Tập luyện: Gợi ý `Granola Siêu Hạt + Thanh Nut Bar Protein`.

---

## 8. TRANG CÂU CHUYỆN THƯƠNG HIỆU (ABOUT / STORY)

- **Phong cách**: Tạp chí ẩm thực dinh dưỡng cao cấp (Editorial).
- **Tiêu đề**: `"Ăn Ngon - Sống Khỏe - Tươi Trẻ"` (Font `Cormorant Garamond`).
- **Triết lý 3 KHÔNG**:
  1. Không đường cát trắng tinh luyện.
  2. Không chất bảo quản hóa học.
  3. Không phụ gia hay chất tạo xốp công nghiệp.
- **Hình ảnh**: Ảnh thực tế xưởng sản xuất, bàn nhào bột ngũ cốc, thợ làm bánh thủ công.

---

## 9. TRANG LIÊN HỆ & CỬA HÀNG (CONTACT & STORES)

- **Thông tin xác thực**:
  - Cửa hàng chính: `2D Hồ Ngọc Cẩn, Phường Tân Thành, Quận Tân Phú, TP HCM`
  - Hotline hỗ trợ: `097 97 64 185`
  - Email: `hebe.healthandbeauty@gmail.com`
  - Giờ mở cửa: `08:00 - 21:00 hàng ngày`
- **Form liên hệ nhanh**: Họ tên, Số điện thoại, Email, Nội dung cần tư vấn.
- **Bản đồ nhúng**: Google Map chỉ đường đến cửa hàng.

---

## 10. GLOBAL FOOTER & CHỨNG NHẬN

- **Màu nền**: `--bg-footer: #FBF6EA` (Kem ấm yến mạch) hoặc phiên bản `--footer-dark: #91350a`.
- **Cấu trúc 4 Cột**:
  1. **Thông tin HeBekery**: Logo, Tagline *Health & Beauty Foods*, địa chỉ cửa hàng, hotline, email.
  2. **Sản phẩm nổi bật**: Biscotti nguyên cám, Granola siêu hạt, Bánh ngói keto, Thanh năng lượng, Mì gạo lứt.
  3. **Hỗ trợ khách hàng**: Chính sách giao hàng, Chính sách đổi trả & hoàn tiền, Hướng dẫn mua hàng, Tra cứu đơn hàng.
  4. **Chứng nhận & Kết nối**:
     - Huy hiệu chính thức: `Đã thông báo Bộ Công Thương` (online.gov.vn).
     - Huy hiệu an toàn: `DMCA Protected`.
     - Mạng xã hội: Facebook, Instagram, TikTok của Hebekery.
- **Dòng bản quyền**: `© 2026 HeBekery. All rights reserved.`

---
*Tài liệu này là bản đặc tả Readonly chính thức dùng để chỉ đạo các Subagent thực thi tái cấu trúc toàn diện codebase WebBakery.*
