UPDATE products SET
    name = 'Granola Truyền Thống',
    category = 'Ngũ cốc & Granola',
    description = 'Granola yến mạch, mật ong, hạt điều, hạnh nhân',
    badge = 'Bán chạy',
    tag = 'Ăn sáng'
WHERE id = 'P001';

UPDATE products SET
    name = 'Granola Chocolate',
    category = 'Ngũ cốc & Granola',
    description = 'Granola vị chocolate đậm đà',
    badge = 'Hot',
    tag = 'Mới'
WHERE id = 'P002';

UPDATE products SET
    name = 'Granola Matcha',
    category = 'Ngũ cốc & Granola',
    description = 'Granola matcha Nhật Bản',
    badge = 'Cao cấp',
    tag = 'Trà xanh'
WHERE id = 'P003';

UPDATE products SET
    name = 'Bánh Biscotti Ý',
    category = 'Bánh ăn kiêng',
    description = 'Bánh quy giòn low-carb',
    badge = 'Thủ công',
    tag = 'Ít carb'
WHERE id = 'P004';

UPDATE products SET
    name = 'Bánh Keto Cookies',
    category = 'Bánh ăn kiêng',
    description = 'Cookies không đường, giàu chất xơ',
    badge = 'Paleo Friendly',
    tag = 'Low-carb'
WHERE id = 'P005';

UPDATE products SET
    name = 'Bánh Hạnh Nhân',
    category = 'Bánh ăn kiêng',
    description = 'Bánh hạnh nhân nguyên cám',
    badge = 'Mới',
    tag = 'Protein'
WHERE id = 'P006';

UPDATE products SET
    name = 'Bánh Matcha Hạnh Nhân',
    category = 'Bánh ăn kiêng',
    description = 'Bánh hạnh nhân vị matcha',
    badge = 'Giới hạn',
    tag = 'Trà xanh'
WHERE id = 'P007';

UPDATE products SET
    name = 'Thanh Yến Mạch Hữu Cơ',
    category = 'Snack healthy',
    description = 'Thanh yến mạch mật ong hạt chia',
    badge = 'Wellness',
    tag = 'Năng lượng'
WHERE id = 'P008';

UPDATE products SET
    name = 'Trái Cây Sấy Tổng Hợp',
    category = 'Snack healthy',
    description = 'Trái cây sấy giòn tự nhiên',
    badge = 'Tự nhiên',
    tag = 'Thuần chay'
WHERE id = 'P009';

UPDATE products SET
    name = 'Hạt Điều Rang Muối',
    category = 'Snack healthy',
    description = 'Hạt điều cao cấp rang muối',
    badge = 'Bán chạy',
    tag = 'Protein'
WHERE id = 'P010';

UPDATE products SET
    name = 'Hạnh Nhân Sấy Mật Ong',
    category = 'Snack healthy',
    description = 'Hạnh nhân sấy mật ong',
    badge = 'Mới',
    tag = 'Năng lượng'
WHERE id = 'P011';

UPDATE products SET
    name = 'Bột Matcha Nhật Bản',
    category = 'Thực phẩm bổ sung',
    description = 'Bột matcha Nhật Bản',
    badge = 'Cao cấp',
    tag = 'Chống oxy hóa'
WHERE id = 'P012';

UPDATE products SET
    name = 'Hạt Chia Hữu Cơ',
    category = 'Thực phẩm bổ sung',
    description = 'Hạt chia giàu omega-3',
    badge = 'Hữu cơ',
    tag = 'Siêu thực phẩm'
WHERE id = 'P013';

UPDATE products SET
    name = 'Thanh Protein',
    category = 'Thực phẩm bổ sung',
    description = 'Thanh protein thực vật',
    badge = 'Fitness',
    tag = '20g protein'
WHERE id = 'P014';

UPDATE products SET
    name = 'Combo Detox 7 Ngày',
    category = 'Combo quà tặng',
    description = 'Bộ sản phẩm detox 7 ngày',
    badge = 'Bán chạy',
    tag = 'Detox'
WHERE id = 'P015';

UPDATE products SET
    name = 'Combo Ăn Sáng Lành Mạnh',
    category = 'Combo quà tặng',
    description = 'Granola, yến mạch, mật ong, hạt chia',
    badge = 'Tiết kiệm',
    tag = 'Quà tặng'
WHERE id = 'P016';

UPDATE products SET
    name = 'Combo Quà Tết Healthy',
    category = 'Combo quà tặng',
    description = 'Set sản phẩm cao cấp',
    badge = 'Giới hạn',
    tag = 'Tết'
WHERE id = 'P017';

UPDATE cart_items ci
JOIN products p ON p.id = ci.product_id
SET ci.product_name = p.name;

UPDATE order_items oi
JOIN products p ON p.id = oi.product_id
SET oi.product_name = p.name;

UPDATE purchase_receipts pr
JOIN products p ON p.id = pr.product_id
SET pr.product_name = p.name;

UPDATE inventory_transactions it
JOIN products p ON p.id = it.product_id
SET it.product_name = p.name;
