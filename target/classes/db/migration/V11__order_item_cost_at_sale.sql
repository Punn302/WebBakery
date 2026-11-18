ALTER TABLE order_items ADD COLUMN cost_at_sale DOUBLE NOT NULL DEFAULT 0;

UPDATE order_items oi
JOIN products p ON oi.product_id = p.id
SET oi.cost_at_sale = p.average_cost
WHERE oi.cost_at_sale = 0;
