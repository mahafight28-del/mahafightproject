-- Sample data insertion script
-- Run after schema creation

INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES
('admin@mahafight.com', '$2a$11$hash', 'System', 'Admin', '+1-800-MAHA', 'Admin'),
('dealer1@elite.com', '$2a$11$hash', 'John', 'Smith', '+1-555-0101', 'Dealer'),
('dealer2@champion.com', '$2a$11$hash', 'Jane', 'Doe', '+1-555-0102', 'Dealer');

INSERT INTO dealers (user_id, business_name, business_type, address, city, state, postal_code, commission_rate) VALUES
((SELECT id FROM users WHERE email = 'dealer1@elite.com'), 'Elite Combat Sports', 'Retail', '123 Fighter Street', 'Las Vegas', 'NV', '89101', 12.50),
((SELECT id FROM users WHERE email = 'dealer2@champion.com'), 'Champion Martial Arts', 'Training Center', '456 Victory Avenue', 'Miami', 'FL', '33101', 15.00);

INSERT INTO products (sku, name, description, category, brand, unit_price, cost_price, stock_quantity) VALUES
('GLOVE-PRO-001', 'Professional Boxing Gloves', 'Premium leather boxing gloves for professionals', 'Equipment', 'MAHA FIGHT', 129.99, 65.00, 50),
('GEAR-TRAIN-002', 'Complete Training Set', 'Full training gear including pads and wraps', 'Equipment', 'MAHA FIGHT', 249.99, 125.00, 25),
('APPAREL-SHIRT-003', 'MAHA FIGHT T-Shirt', 'Official branded merchandise', 'Apparel', 'MAHA FIGHT', 29.99, 12.00, 100);

INSERT INTO dealer_kyc (dealer_id, document_type, document_number, verification_status) VALUES
((SELECT id FROM dealers WHERE business_name = 'Elite Combat Sports'), 'Business License', 'BL-2024-001', 'Verified'),
((SELECT id FROM dealers WHERE business_name = 'Champion Martial Arts'), 'Tax ID', 'TAX-2024-002', 'Pending');