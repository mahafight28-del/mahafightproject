-- PRODUCTION DATABASE FIX: Sync migration history and add missing columns
-- Run this manually on Render PostgreSQL database

-- 1. Check if email_otps table has attempt_count column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'email_otps' 
        AND column_name = 'attempt_count'
    ) THEN
        -- Add missing columns to email_otps
        ALTER TABLE email_otps 
        ADD COLUMN attempt_count integer DEFAULT 0,
        ADD COLUMN user_agent character varying(500),
        ADD COLUMN ip_address character varying(50),
        ADD COLUMN updated_at timestamp with time zone;
        
        RAISE NOTICE 'Added missing columns to email_otps table';
    ELSE
        RAISE NOTICE 'email_otps table already has required columns';
    END IF;
END $$;

-- 2. Check if mobile_otps table exists and has required columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mobile_otps') THEN
        -- Create mobile_otps table
        CREATE TABLE mobile_otps (
            id uuid NOT NULL,
            phone character varying(20) NOT NULL,
            otp_hash character varying(255) NOT NULL,
            purpose integer NOT NULL,
            expires_at timestamp with time zone NOT NULL,
            is_used boolean NOT NULL DEFAULT false,
            attempt_count integer NOT NULL DEFAULT 0,
            user_agent character varying(500),
            ip_address character varying(50),
            created_at timestamp with time zone NOT NULL,
            updated_at timestamp with time zone,
            CONSTRAINT "PK_mobile_otps" PRIMARY KEY (id)
        );
        
        CREATE INDEX "idx_mobile_otps_lookup" ON mobile_otps (phone, purpose, is_used, expires_at);
        RAISE NOTICE 'Created mobile_otps table';
    END IF;
END $$;

-- 3. Fix product table column names if needed
DO $$
BEGIN
    -- Check if products table has old column names and rename them
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'Barcode') THEN
        ALTER TABLE products RENAME COLUMN "Barcode" TO barcode;
        RAISE NOTICE 'Renamed Barcode to barcode';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'QrCode') THEN
        ALTER TABLE products RENAME COLUMN "QrCode" TO qr_code;
        RAISE NOTICE 'Renamed QrCode to qr_code';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'QrCodeExpiresAt') THEN
        ALTER TABLE products RENAME COLUMN "QrCodeExpiresAt" TO qr_code_expires_at;
        RAISE NOTICE 'Renamed QrCodeExpiresAt to qr_code_expires_at';
    END IF;
END $$;

-- 4. Mark all migrations as applied in __EFMigrationsHistory
INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion") VALUES
('20251220101845_InitialCreate', '8.0.0'),
('20251221103442_UpdateKycStatusToEnum', '8.0.0'),
('20251221163119_AddECommerceEntities', '8.0.0'),
('20251221170504_UpdateECommerceEntities', '8.0.0'),
('20251221172058_RemoveECommerceEntities', '8.0.0'),
('20251221182445_AddCustomerOrderFields', '8.0.0'),
('20251221191911_AddProductImages', '8.0.0'),
('20251222182831_FixProductImagesForCloudinary', '8.0.0'),
('20251222192001_AddPasswordResetOtp', '8.0.0'),
('20251223165959_AddProductScanFields', '8.0.0'),
('20251227172810_AddBarcodeQrCodeFields', '8.0.0'),
('20251228063846_AddEmailOtpTable', '8.0.0'),
('20251228093342_AddQrCodeExpiresAt', '8.0.0'),
('20251228115715_AddMissingEmailOtpColumns', '8.0.0')
ON CONFLICT ("MigrationId") DO NOTHING;

SELECT 'Production database schema synchronized successfully' AS status;