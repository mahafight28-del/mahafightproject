@echo off
echo Deploying MAHA FIGHT API to Production...

echo Copying environment file...
copy .env.example .env

echo Building production image...
docker-compose -f docker-compose.prod.yml build

echo Starting production services...
docker-compose -f docker-compose.prod.yml up -d

echo Checking service health...
timeout /t 10
curl -f http://localhost/api/health || echo "Health check failed"

echo Production deployment completed!
echo API available at: http://localhost
echo Swagger UI: http://localhost/swagger