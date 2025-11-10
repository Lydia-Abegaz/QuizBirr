# Deployment Guide - Swipe Quiz Platform

## Production Deployment Checklist

### Pre-Deployment

- [ ] Update all environment variables for production
- [ ] Change JWT_SECRET to a strong random string (min 32 characters)
- [ ] Configure production database
- [ ] Set up SMS provider (Twilio or local Ethiopian provider)
- [ ] Configure Telebirr payment gateway
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domains
- [ ] Set up monitoring and logging
- [ ] Create database backups

## Deployment Options

### Option 1: Traditional VPS (Recommended for Ethiopia)

#### Requirements
- Ubuntu 20.04+ server
- 2GB+ RAM
- 20GB+ storage
- Domain name with DNS configured

#### Steps

**1. Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

**2. Database Setup**
```bash
# Create database and user
sudo -u postgres psql
CREATE DATABASE swipe-quiz-prod;
CREATE USER swipe_admin WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE swipe-quiz-prod TO swipe_admin;
\q
```

**3. Deploy Application**
```bash
# Clone repository
cd /var/www
git clone <your-repo-url> swipe-quiz
cd swipe-quiz

# Backend setup
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy

# Frontend setup
cd ../frontend
npm install
npm run build

# Start backend with PM2
cd ../backend
pm2 start npm --name "swipe-quiz-api" -- start
pm2 save
pm2 startup
```

**4. Nginx Configuration**
```nginx
# /etc/nginx/sites-available/swipe-quiz
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/swipe-quiz/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/swipe-quiz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**5. SSL with Let's Encrypt**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 2: Docker Deployment

**docker-compose.yml**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
  POSTGRES_DB: swipe-quiz
      POSTGRES_USER: swipe_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    environment:
      NODE_ENV: production
  DATABASE_URL: postgresql://swipe_admin:${DB_PASSWORD}@postgres:5432/swipe-quiz
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
      - redis
    ports:
      - "5000:5000"

  frontend:
    build: ./frontend
    environment:
      VITE_API_URL: https://api.yourdomain.com
    ports:
      - "3000:80"

volumes:
  postgres_data:
```

**Deploy with Docker:**
```bash
# Build and start
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f
```

### Option 3: Cloud Platforms

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create swipe-quiz-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

#### Railway.app
1. Connect GitHub repository
2. Add PostgreSQL database
3. Set environment variables
4. Deploy automatically on push

#### Render.com
1. Create Web Service for backend
2. Create Static Site for frontend
3. Add PostgreSQL database
4. Configure environment variables

## Environment Variables (Production)

**Backend:**
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-strong-random-32+-char-string>
JWT_EXPIRES_IN=7d

DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379

SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE_NUMBER=<your-number>

TELEBIRR_API_KEY=<your-key>
TELEBIRR_API_URL=https://api.telebirr.com

FRONTEND_URL=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com
```

**Frontend:**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use strong, random JWT secrets
- Rotate secrets regularly

### 2. Database Security
```sql
-- Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'password';
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

-- Regular backups
pg_dump swipe-quiz-prod > backup_$(date +%Y%m%d).sql
```

### 3. API Security
- Enable rate limiting in production
- Use HTTPS only
- Implement CORS properly
- Add request logging
- Monitor for suspicious activity

### 4. Application Security
```typescript
// backend/src/app.ts - Production settings
if (env.NODE_ENV === 'production') {
  app.use(helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true
  }));
  
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
  }));
}
```

## Monitoring & Logging

### PM2 Monitoring
```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs swipe-quiz-api

# Restart app
pm2 restart swipe-quiz-api
```

### Database Backups
```bash
# Automated daily backups
crontab -e

# Add this line (runs at 2 AM daily)
0 2 * * * pg_dump swipe-quiz-prod > /backups/swipe-quiz_$(date +\%Y\%m\%d).sql
```

### Error Tracking
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for infrastructure monitoring

## Performance Optimization

### Backend
- Enable Redis caching
- Use connection pooling
- Optimize database queries
- Enable gzip compression

### Frontend
- Enable PWA caching
- Optimize images
- Code splitting
- CDN for static assets

### Database
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
```

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, HAProxy)
- Deploy multiple backend instances
- Use Redis for session storage
- Implement database read replicas

### Vertical Scaling
- Increase server resources
- Optimize database configuration
- Enable query caching

## Maintenance

### Regular Tasks
- [ ] Weekly database backups
- [ ] Monthly security updates
- [ ] Monitor disk space
- [ ] Review error logs
- [ ] Check API performance
- [ ] Update dependencies

### Update Procedure
```bash
# Pull latest code
git pull origin main

# Backend
cd backend
npm install
npx prisma migrate deploy
pm2 restart swipe-quiz-api

# Frontend
cd ../frontend
npm install
npm run build
```

## Rollback Procedure

```bash
# Revert to previous version
git checkout <previous-commit>

# Rebuild and restart
cd backend
npm install
pm2 restart swipe-quiz-api

cd ../frontend
npm run build
```

## Support & Troubleshooting

### Common Issues

**Database Connection Failed:**
- Check DATABASE_URL
- Verify PostgreSQL is running
- Check firewall rules

**API Not Responding:**
```bash
pm2 status
pm2 logs swipe-quiz-api
```

**High Memory Usage:**
```bash
pm2 restart swipe-quiz-api
# Consider increasing server resources
```

## Cost Estimates (Monthly)

### Budget Option (~$20-30/month)
- VPS: DigitalOcean Droplet ($12)
- Domain: Namecheap ($1)
- SMS: Twilio Pay-as-you-go (~$5-10)
- Backups: DigitalOcean Spaces ($5)

### Production Option (~$100-150/month)
- VPS: 4GB RAM server ($24)
- Database: Managed PostgreSQL ($15)
- CDN: Cloudflare (Free)
- SMS: Twilio ($20-50)
- Monitoring: Sentry ($26)
- Backups: Automated ($10)

## Launch Checklist

- [ ] All tests passing
- [ ] Production environment configured
- [ ] Database migrated
- [ ] SSL certificate installed
- [ ] Admin user created
- [ ] Sample quizzes added
- [ ] Payment gateway tested
- [ ] SMS provider configured
- [ ] Monitoring enabled
- [ ] Backup system active
- [ ] Domain DNS configured
- [ ] Terms of Service added
- [ ] Privacy Policy added

## Post-Launch

1. Monitor error logs daily
2. Track user registrations
3. Monitor transaction success rates
4. Gather user feedback
5. Plan feature updates
6. Regular security audits
