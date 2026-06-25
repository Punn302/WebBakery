CREATE TABLE product_reviews (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    rating INT NOT NULL,
    comment VARCHAR(1000),
    created_at DATETIME,
    updated_at DATETIME
);

CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE UNIQUE INDEX uk_product_reviews_product_user ON product_reviews(product_id, user_id);
