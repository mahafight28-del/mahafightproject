#!/bin/bash

# Database Migration Script for Production
# Run this script to apply database migrations

set -e

echo "=== MAHA FIGHT - Database Migration ==="
echo ""

# Load environment variables
if [ -f .env.production ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
else
    echo "Error: .env.production file not found"
    exit 1
fi

# Check if database exists
echo "Checking database connection..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -c "SELECT 1" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Error: Cannot connect to database"
    exit 1
fi

echo "✓ Database connection successful"

# Create database if not exists
echo "Creating database if not exists..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME" 2>/dev/null || echo "Database already exists"

# Apply schema
echo "Applying database schema..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/schema.sql

if [ $? -eq 0 ]; then
    echo "✓ Schema applied successfully"
else
    echo "Error: Failed to apply schema"
    exit 1
fi

# Optional: Apply sample data (comment out for production)
# echo "Applying sample data..."
# PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f database/sample-data.sql

echo ""
echo "=== Migration completed successfully ==="
echo ""
echo "Next steps:"
echo "1. Verify database tables: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c '\dt'"
echo "2. Start the application"