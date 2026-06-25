CREATE TABLE return_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(64) NOT NULL,
    return_status VARCHAR(32),
    reason VARCHAR(1000),
    admin_note VARCHAR(1000),
    changed_by VARCHAR(64),
    created_at DATETIME,
    INDEX idx_return_history_order_id (order_id)
);
