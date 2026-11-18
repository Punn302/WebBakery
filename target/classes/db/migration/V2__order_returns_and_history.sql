ALTER TABLE orders
    ADD COLUMN return_reason VARCHAR(1000),
    ADD COLUMN return_status VARCHAR(32),
    ADD COLUMN admin_note VARCHAR(1000);

CREATE TABLE order_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(64) NOT NULL,
    order_status VARCHAR(32),
    payment_status VARCHAR(32),
    note VARCHAR(1000),
    changed_by VARCHAR(64),
    created_at DATETIME,
    INDEX idx_order_status_history_order_id (order_id),
    CONSTRAINT fk_order_status_history_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
