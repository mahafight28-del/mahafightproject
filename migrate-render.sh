#!/bin/bash
# Migration script for Render deployment

echo "Running database migrations..."

# Check if migrations directory exists
if [ -d "src/MahaFight.Infrastructure/Migrations" ]; then
    echo "Migrations found, applying to database..."
    
    # The application will handle migrations automatically in Program.cs
    echo "Migrations will be applied during application startup"
else
    echo "No migrations directory found"
fi

echo "Migration script completed"