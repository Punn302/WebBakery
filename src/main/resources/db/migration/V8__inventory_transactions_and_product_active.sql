ALTER TABLE products
    ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE inventory_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(255),
    transaction_type VARCHAR(32) NOT NULL,
    quantity INT NOT NULL,
    stock_after INT NOT NULL,
    unit_cost DOUBLE NOT NULL DEFAULT 0,
    reference_type VARCHAR(64),
    reference_id VARCHAR(128),
    note VARCHAR(1000),
    created_at DATETIME,
    INDEX idx_inventory_transactions_product_id (product_id),
    INDEX idx_inventory_transactions_reference (reference_type, reference_id),
    INDEX idx_inventory_transactions_created_at (created_at)
);
