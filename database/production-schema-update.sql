-- Complete Database Schema Update for MahaFight Production
-- Run this in Render PostgreSQL console

-- 1. Add missing columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS barcode character varying(100),
ADD COLUMN IF NOT EXISTS qr_code character varying(500),
ADD COLUMN IF NOT EXISTS qr_code_expires_at timestamp with time zone;

-- 2. Create email_otps table with all required columns
DROP TABLE IF EXISTS email_otps;
CREATE TABLE email_otps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email character varying(100) NOT NULL,
    otp_hash character varying(255) NOT NULL,
    purpose integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean NOT NULL DEFAULT FALSE,
    attempt_count integer NOT NULL DEFAULT 0,
    user_agent character varying(500),
    ip_address character varying(50),
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    CONSTRAINT PK_email_otps PRIMARY KEY (id)
);

-- 3. Create index for email_otps
CREATE INDEX IF NOT EXISTS idx_email_otps_lookup 
ON email_otps (email, purpose, is_used, expires_at);

-- 4. Create mobile_otps table
DROP TABLE IF EXISTS mobile_otps;
CREATE TABLE mobile_otps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    phone character varying(20) NOT NULL,
    otp_hash character varying(255) NOT NULL,
    purpose integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean NOT NULL DEFAULT FALSE,
    attempt_count integer NOT NULL DEFAULT 0,
    user_agent character varying(500),
    ip_address character varying(50),
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    CONSTRAINT PK_mobile_otps PRIMARY KEY (id)
);

-- 5. Create index for mobile_otps
CREATE INDEX IF NOT EXISTS idx_mobile_otps_lookup 
ON mobile_otps (phone, purpose, is_used, expires_at);

-- 6. Verify all changes
SELECT 'Products columns:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('barcode', 'qr_code', 'qr_code_expires_at');

SELECT 'Email OTP table:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'email_otps';

SELECT 'Mobile OTP table:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'mobile_otps';

SELECT 'Schema update completed successfully!' as result;