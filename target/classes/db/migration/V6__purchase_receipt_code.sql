ALTER TABLE purchase_receipts
    ADD COLUMN receipt_code VARCHAR(64);

UPDATE purchase_receipts
SET receipt_code = id
WHERE receipt_code IS NULL;

ALTER TABLE purchase_receipts
    MODIFY receipt_code VARCHAR(64) NOT NULL;

CREATE INDEX idx_purchase_receipts_receipt_code ON purchase_receipts(receipt_code);
