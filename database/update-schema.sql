-- Add missing columns to existing tables
-- This script will be executed safely with IF NOT EXISTS checks

-- Add QR Code and Barcode columns to products table if they don't exist
DO $$
BEGIN
    -- Add Barcode column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'barcode') THEN
        ALTER TABLE products ADD COLUMN barcode character varying(100);
    END IF;
    
    -- Add QrCode column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'qr_code') THEN
        ALTER TABLE products ADD COLUMN qr_code character varying(500);
    END IF;
    
    -- Add QrCodeExpiresAt column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'qr_code_expires_at') THEN
        ALTER TABLE products ADD COLUMN qr_code_expires_at timestamp with time zone;
    END IF;
END
$$;

-- Create EmailOtp table if it doesn't exist
CREATE TABLE IF NOT EXISTS email_otps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    email character varying(255) NOT NULL,
    otp_code character varying(10) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    CONSTRAINT "PK_email_otps" PRIMARY KEY (id)
);

-- Create MobileOtp table if it doesn't exist
CREATE TABLE IF NOT EXISTS mobile_otps (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    mobile_number character varying(20) NOT NULL,
    otp_code character varying(10) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean NOT NULL DEFAULT FALSE,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone,
    CONSTRAINT "PK_mobile_otps" PRIMARY KEY (id)
);

-- Insert migration history records if they don't exist
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20251227172810_AddBarcodeQrCodeFields', '8.0.0'
WHERE NOT EXISTS (
    SELECT 1 FROM "__EFMigrationsHistory" 
    WHERE "MigrationId" = '20251227172810_AddBarcodeQrCodeFields'
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20251228063846_AddEmailOtpTable', '8.0.0'
WHERE NOT EXISTS (
    SELECT 1 FROM "__EFMigrationsHistory" 
    WHERE "MigrationId" = '20251228063846_AddEmailOtpTable'
);

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
SELECT '20251228093342_AddQrCodeExpiresAt', '8.0.0'
WHERE NOT EXISTS (
    SELECT 1 FROM "__EFMigrationsHistory" 
    WHERE "MigrationId" = '20251228093342_AddQrCodeExpiresAt'
);

-- Success message
SELECT 'Database schema updated successfully' as result;