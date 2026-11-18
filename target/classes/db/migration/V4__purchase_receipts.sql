CREATE TABLE purchase_receipts (
    id VARCHAR(64) PRIMARY KEY,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    supplier VARCHAR(255),
    quantity INT NOT NULL,
    unit_cost DOUBLE NOT NULL,
    total_cost DOUBLE NOT NULL,
    imported_at DATETIME,
    note VARCHAR(1000),
    INDEX idx_purchase_receipts_product_id (product_id),
    INDEX idx_purchase_receipts_imported_at (imported_at)
);
