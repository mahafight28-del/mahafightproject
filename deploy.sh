#!/bin/bash

# MAHA FIGHT - Production Deployment Script
# Usage: ./deploy.sh

set -e

echo "=== MAHA FIGHT - Production Deployment ==="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    echo "Error: Do not run this script as root"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Error: .env file not found. Copy .env.production to .env and configure it."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

echo "Step 1: Stopping existing services..."
docker-compose -f docker-compose.production.yml down || true

echo "Step 2: Pulling latest changes..."
git pull origin main

echo "Step 3: Building application..."
docker-compose -f docker-compose.production.yml build --no-cache

echo "Step 4: Running database migrations..."
./migrate-db.sh

echo "Step 5: Starting services..."
docker-compose -f docker-compose.production.yml up -d

echo "Step 6: Waiting for services to start..."
sleep 30

echo "Step 7: Health check..."
for i in {1..10}; do
    if curl -f -k https://localhost/api/health > /dev/null 2>&1; then
        echo "✓ Application is healthy"
        break
    else
        echo "Waiting for application to start... ($i/10)"
        sleep 10
    fi
    
    if [ $i -eq 10 ]; then
        echo "Error: Application failed to start"
        docker-compose -f docker-compose.production.yml logs mahafight-api
        exit 1
    fi
done

echo "Step 8: Cleaning up old Docker images..."
docker image prune -f

echo ""
echo "=== Deployment completed successfully! ==="
echo ""
echo "Application URL: https://mahafight.com"
echo "API Health: https://mahafight.com/api/health"
echo "Swagger UI: https://mahafight.com/swagger"
echo ""
echo "Useful commands:"
echo "  View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "  Restart:   docker-compose -f docker-compose.production.yml restart"
echo "  Stop:      docker-compose -f docker-compose.production.yml down"