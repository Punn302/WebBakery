CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    role VARCHAR(32) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    price DOUBLE NOT NULL,
    image_url VARCHAR(500),
    badge VARCHAR(100),
    tag VARCHAR(100)
);

CREATE TABLE cart_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(64),
    product_id VARCHAR(64),
    product_name VARCHAR(255),
    image_url VARCHAR(500),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    total DOUBLE NOT NULL,
    INDEX idx_cart_items_user_id (user_id)
);

CREATE TABLE orders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    customer_name VARCHAR(255),
    phone VARCHAR(32),
    address VARCHAR(1000),
    note VARCHAR(1000),
    payment_method VARCHAR(32),
    payment_status VARCHAR(32),
    order_status VARCHAR(32),
    total DOUBLE NOT NULL,
    created_at DATETIME,
    INDEX idx_orders_user_id (user_id),
    INDEX idx_orders_phone (phone),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(64) NOT NULL,
    product_id VARCHAR(64),
    product_name VARCHAR(255),
    image_url VARCHAR(500),
    price DOUBLE NOT NULL,
    quantity INT NOT NULL,
    total DOUBLE NOT NULL,
    INDEX idx_order_items_order_id (order_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE addresses (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    receiver_name VARCHAR(255),
    phone VARCHAR(32),
    address_line VARCHAR(1000),
    default_address BOOLEAN NOT NULL DEFAULT FALSE,
    INDEX idx_addresses_user_id (user_id),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE contact_messages (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(32),
    subject VARCHAR(255),
    message VARCHAR(2000),
    status VARCHAR(32),
    created_at DATETIME
);

INSERT INTO users (id, email, password, name, phone, role, active) VALUES
('1', 'user@hebekery.vn', '123456', 'Nguyen Van A', '0912345678', 'USER', TRUE),
('2', 'admin@hebekery.vn', 'admin123', 'Admin Hebekery', '0987654321', 'ADMIN', TRUE);

INSERT INTO products (id, name, category, description, price, image_url, badge, tag) VALUES
('P001', 'Granola Truyen Thong', 'Ngu coc & Granola', 'Granola yen mach, mat ong, hat dieu, hanh nhan', 219000, '/images/granola-traditional.jpg', 'Ban chay', 'An sang'),
('P002', 'Granola Chocolate', 'Ngu coc & Granola', 'Granola vi chocolate dam da', 239000, '/images/granola-choco.jpg', 'Hot', 'Moi'),
('P003', 'Granola Matcha', 'Ngu coc & Granola', 'Granola matcha Nhat Ban', 249000, '/images/granola-matcha.jpeg', 'Premium', 'Tra xanh'),
('P004', 'Banh Biscotti Y', 'Banh an kieng', 'Banh quy gion low-carb', 180000, '/images/biscotti.jpg', 'Artisanal', 'Thu cong'),
('P005', 'Keto Cookies', 'Banh an kieng', 'Cookies khong duong, giau chat xo', 160000, '/images/keto-cookies.jpg', 'Paleo Friendly', 'Low-carb'),
('P006', 'Almond Cookies', 'Banh an kieng', 'Banh hanh nhan nguyen cam', 189000, '/images/almond-cookies.jpg', 'New', 'Protein'),
('P007', 'Banh Matcha Almond', 'Banh an kieng', 'Banh hanh nhan matcha', 199000, '/images/matcha-almond.jpg', 'Limited', 'Tra xanh'),
('P008', 'Thanh Yen Mach Huu Co', 'Snack healthy', 'Thanh yen mach mat ong hat chia', 220000, '/images/oat-bars.jpg', 'Wellness', 'Nang luong'),
('P009', 'Trai Cay Say Tong Hop', 'Snack healthy', 'Trai cay say gion tu nhien', 159000, '/images/dried-fruit.jpg', 'Natural', 'Vegan'),
('P010', 'Hat Dieu Rang Muoi', 'Snack healthy', 'Hat dieu cao cap rang muoi', 149000, '/images/cashew.jpg', 'Best Seller', 'Protein'),
('P011', 'Hanh Nhan Say Mat Ong', 'Snack healthy', 'Hanh nhan say mat ong', 169000, '/images/almond-honey.jpg', 'New', 'Energy'),
('P012', 'Matcha Powder', 'Thuc pham bo sung', 'Bot matcha Nhat Ban', 299000, '/images/matcha-powder.jpg', 'Premium', 'Antioxidant'),
('P013', 'Hat Chia Organic', 'Thuc pham bo sung', 'Hat chia giau omega-3', 129000, '/images/chia-seed.jpg', 'Organic', 'Superfood'),
('P014', 'Protein Bar', 'Thuc pham bo sung', 'Thanh protein thuc vat', 189000, '/images/protein-bar.jpg', 'Fitness', '20g protein'),
('P015', 'Combo Detox 7 Ngay', 'Combo qua tang', 'Bo san pham detox 7 ngay', 850000, '/images/detox-combo.jpg', 'Bestseller', 'Detox'),
('P016', 'Combo An Sang Lanh Manh', 'Combo qua tang', 'Granola, yen mach, mat ong, hat chia', 450000, '/images/breakfast-combo.jpg', 'Tiet kiem', 'Gift'),
('P017', 'Combo Qua Tet Healthy', 'Combo qua tang', 'Set san pham cao cap', 599000, '/images/lunar-combo.jpg', 'Limited', 'Tet');
