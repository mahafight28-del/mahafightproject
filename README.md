# MAHA FIGHT - Dealer & Franchise Management System

## Quick Start

1. **Setup Database**
   ```bash
   # Update connection string in appsettings.json
   dotnet ef migrations add InitialCreate --project src/MahaFight.Infrastructure --startup-project src/MahaFight.WebApi
   dotnet ef database update --project src/MahaFight.Infrastructure --startup-project src/MahaFight.WebApi
   ```

2. **Run Application**
   ```bash
   cd src/MahaFight.WebApi
   dotnet run
   ```

3. **Access Swagger**: https://localhost:7000/swagger

## Authentication
- **Login**: POST `/api/auth/login`
- **Credentials**: `admin@mahafight.com` / `admin123`
- **Token**: Use Bearer token in Authorization header

## API Endpoints
- **Authentication**: `/api/auth/login`
- **Dealers**: `/api/dealers` (GET, POST)
- **Products**: `/api/products` (GET, POST)
- **Sales**: `/api/sales` (POST)
- **Franchises**: `/api/franchises` (GET, POST) - Requires Auth
- **Health**: `/api/health`
- **Metrics**: `/api/metrics/status`

## Database Setup
```bash
# Manual setup
setup-db.bat

# Or with Docker
docker-compose up -d
```

## Architecture
- **Clean Architecture** with 4 layers
- **JWT Authentication** with configurable expiry
- **PostgreSQL** database with EF Core
- **Global Exception Handling**
- **Swagger Documentation**
- **Docker Support** with compose file
- **Health Checks** for monitoring
- **Unit Tests** with xUnit

## Deployment
```bash
# Development
build.bat
docker-compose up -d

# Production
deploy.bat
# Or manually:
docker-compose -f docker-compose.prod.yml up -d
```

## Environment Variables
Copy `.env.example` to `.env` and configure:
- `POSTGRES_PASSWORD`: Database password
- `JWT_SECRET_KEY`: JWT signing key (32+ characters)