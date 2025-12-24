# MAHA FIGHT - Production Deployment Guide

## Prerequisites

### System Requirements
- Ubuntu 20.04+ or CentOS 8+
- Docker 20.10+
- Docker Compose 2.0+
- PostgreSQL 15+ (if not using Docker)
- Nginx (if not using Docker)
- SSL Certificate

### Hardware Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage

## Step 1: Server Setup

### 1.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git
```

### 1.2 Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 1.3 Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## Step 2: Application Deployment

### 2.1 Clone Repository
```bash
git clone https://github.com/your-org/MahaFight.DealerManagement.git
cd MahaFight.DealerManagement
```

### 2.2 Configure Environment
```bash
# Copy and edit production environment file
cp .env.production .env
nano .env

# Update these critical values:
DB_PASSWORD=your-secure-database-password
JWT_SECRET_KEY=your-super-secure-jwt-key-minimum-32-characters-long
```

### 2.3 SSL Certificate Setup
```bash
# Create certificates directory
mkdir -p certs

# Option 1: Let's Encrypt (Recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d mahafight.com -d www.mahafight.com
sudo cp /etc/letsencrypt/live/mahafight.com/fullchain.pem certs/mahafight.crt
sudo cp /etc/letsencrypt/live/mahafight.com/privkey.pem certs/mahafight.key

# Option 2: Self-signed (Development only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/mahafight.key \
  -out certs/mahafight.crt \
  -subj "/C=IN/ST=State/L=City/O=MahaFight/CN=mahafight.com"
```

### 2.4 Create Upload Directory
```bash
mkdir -p uploads
sudo chown -R 1001:1001 uploads
```

## Step 3: Database Setup

### 3.1 Run Migration Script
```bash
chmod +x migrate-db.sh
./migrate-db.sh
```

### 3.2 Verify Database
```bash
# Connect to database and verify tables
docker-compose -f docker-compose.production.yml exec mahafight-db psql -U mahafight_user -d MahaFightDB -c '\dt'
```

## Step 4: Application Startup

### 4.1 Build and Start Services
```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d --build

# Check service status
docker-compose -f docker-compose.production.yml ps
```

### 4.2 Verify Deployment
```bash
# Check application health
curl -k https://localhost/api/health

# Check logs
docker-compose -f docker-compose.production.yml logs -f mahafight-api
```

## Step 5: Security Configuration

### 5.1 Firewall Setup
```bash
# Enable UFW firewall
sudo ufw enable
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 5432/tcp   # Block direct database access
```

### 5.2 Fail2Ban (Optional)
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Step 6: Monitoring & Maintenance

### 6.1 Log Rotation
```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json
```
Add:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 6.2 Backup Script
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.production.yml exec -T mahafight-db pg_dump -U mahafight_user MahaFightDB > backup_$DATE.sql
tar -czf uploads_backup_$DATE.tar.gz uploads/
EOF

chmod +x backup.sh

# Add to crontab for daily backups
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## Step 7: Performance Optimization

### 7.1 Enable HTTP/2 and Gzip
Already configured in nginx.conf

### 7.2 Database Optimization
```sql
-- Connect to database and run these optimizations
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
SELECT pg_reload_conf();
```

## Step 8: Testing

### 8.1 API Testing
```bash
# Test authentication
curl -X POST https://mahafight.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mahafight.com","password":"admin123"}'

# Test protected endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://mahafight.com/api/dealers
```

### 8.2 Load Testing (Optional)
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API performance
ab -n 1000 -c 10 https://mahafight.com/api/health
```

## Step 9: Domain & DNS Setup

### 9.1 DNS Configuration
Point your domain to the server IP:
```
A    mahafight.com      -> YOUR_SERVER_IP
A    www.mahafight.com  -> YOUR_SERVER_IP
```

### 9.2 SSL Certificate Renewal
```bash
# Add to crontab for auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database logs
   docker-compose -f docker-compose.production.yml logs mahafight-db
   ```

2. **SSL Certificate Issues**
   ```bash
   # Verify certificate
   openssl x509 -in certs/mahafight.crt -text -noout
   ```

3. **Application Not Starting**
   ```bash
   # Check application logs
   docker-compose -f docker-compose.production.yml logs mahafight-api
   ```

4. **High Memory Usage**
   ```bash
   # Monitor resource usage
   docker stats
   ```

## Maintenance Commands

```bash
# Update application
git pull origin main
docker-compose -f docker-compose.production.yml up -d --build

# View logs
docker-compose -f docker-compose.production.yml logs -f

# Restart services
docker-compose -f docker-compose.production.yml restart

# Stop services
docker-compose -f docker-compose.production.yml down

# Clean up unused Docker resources
docker system prune -a
```

## Security Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] Regular backups scheduled
- [ ] Log rotation configured
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] Non-root user in containers
- [ ] Secrets not in source code

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review nginx configuration
5. Check SSL certificate validity

**Production deployment complete!** 🚀

Access your application at: https://mahafight.com