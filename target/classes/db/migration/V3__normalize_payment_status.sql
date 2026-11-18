UPDATE orders
SET payment_status = 'PENDING'
WHERE payment_status = 'UNPAID';
