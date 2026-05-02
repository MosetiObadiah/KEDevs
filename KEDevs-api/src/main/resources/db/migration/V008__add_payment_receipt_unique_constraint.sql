ALTER TABLE payments 
ADD CONSTRAINT uk_payments_mpesa_receipt_no 
UNIQUE (mpesa_receipt_no);
