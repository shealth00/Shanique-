# Subdomain Configuration & Deployment

## Subdomain: agents.shealthmedia.org

### Overview

**Domain:** shealthmedia.org
**Subdomain:** agents
**Full URL:** https://agents.shealthmedia.org
**Purpose:** Psychological Evaluation Report Generator
**Status:** Production-ready

---

## DNS Configuration

### Step 1: Update DNS Records

Contact your domain registrar and add the following DNS record:

```
Type:  CNAME
Name:  agents
Value: shealthmedia.org
TTL:   3600
```

Or if using an IP address:

```
Type:  A
Name:  agents
Value: [Your Server IP Address]
TTL:   3600
```

### Step 2: Verify DNS Propagation

```bash
# Check DNS resolution
nslookup agents.shealthmedia.org
dig agents.shealthmedia.org

# Expected output:
# agents.shealthmedia.org. 3600 IN CNAME shealthmedia.org.
# shealthmedia.org. 3600 IN A [IP Address]
```

---

## SSL/TLS Certificate

### Let's Encrypt Setup

Install and configure SSL certificate:

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Verify domain ownership and get certificate
sudo certbot certonly --standalone -d agents.shealthmedia.org

# When prompted:
# - Enter email for notifications
# - Agree to terms
# - Enter domain: agents.shealthmedia.org
```

### Certificate Details

**Location:** `/etc/letsencrypt/live/agents.shealthmedia.org/`

Files:
- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key
- `cert.pem` - Certificate only

### Auto-Renewal

```bash
# Enable auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Verify renewal timer
sudo systemctl status certbot.timer

# Manual renewal test
sudo certbot renew --dry-run
```

---

## Nginx Configuration

### Create Nginx Configuration File

**File:** `/etc/nginx/sites-available/agents.shealthmedia.org`

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name agents.shealthmedia.org;

    # Let's Encrypt validation
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name agents.shealthmedia.org;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/agents.shealthmedia.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agents.shealthmedia.org/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';" always;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Access and Error Logs
    access_log /var/log/nginx/agents.shealthmedia.org.access.log combined buffer=32k flush=5s;
    error_log /var/log/nginx/agents.shealthmedia.org.error.log warn;

    # Client upload size limit (for PDF export)
    client_max_body_size 50M;

    # Root directory
    root /var/www/psychreport-agent;

    # Static files (React build)
    location / {
        # Try to serve file directly, fallback to index.html
        try_files $uri $uri/ /index.html;
        
        # Cache control for index.html (no cache)
        location = /index.html {
            add_header Cache-Control "public, must-revalidate, max-age=0";
        }
        
        # Cache control for assets (long cache)
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            add_header Cache-Control "public, immutable, max-age=31536000";
        }
    }

    # API proxy to Anthropic
    location /api/anthropic/ {
        proxy_pass https://api.anthropic.com/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host api.anthropic.com;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts for long-running requests
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Rate limiting (prevent abuse)
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    
    location /api/ {
        limit_req zone=api burst=20 nodelay;
    }

    location / {
        limit_req zone=general burst=50 nodelay;
    }
}
```

### Enable Nginx Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/agents.shealthmedia.org /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# If test passes, restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

## Application Deployment

### Deploy Using PM2

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'psychreport-agent',
    script: 'node_modules/react-scripts/scripts/start.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      REACT_APP_SUBDOMAIN: 'agents.shealthmedia.org',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js

# Make PM2 start on system boot
sudo pm2 startup
sudo pm2 save

# Monitor application
pm2 status
pm2 logs psychreport-agent
pm2 dashboard
```

### Deploy Using Docker

```bash
# Build image
docker build -t shealth/psychreport-agent:1.0.0 .

# Tag for production
docker tag shealth/psychreport-agent:1.0.0 shealth/psychreport-agent:latest

# Run container
docker run -d \
  --name psychreport-agent \
  --restart always \
  -p 3000:3000 \
  -e REACT_APP_ANTHROPIC_API_KEY=your_api_key \
  -e REACT_APP_SUBDOMAIN=agents.shealthmedia.org \
  -e NODE_ENV=production \
  -v /app/reports:/app/reports \
  -v /app/logs:/app/logs \
  shealth/psychreport-agent:latest

# View logs
docker logs -f psychreport-agent
```

---

## Application Setup

### Create Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/psychreport-agent
sudo chown -R $USER:$USER /var/www/psychreport-agent

# Navigate to directory
cd /var/www/psychreport-agent
```

### Install Application

```bash
# Clone repository
git clone git@github.com:shealth00/Shanique-.git .

# Install dependencies
npm install

# Create environment file
cat > .env << 'EOF'
REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
REACT_APP_SUBDOMAIN=agents.shealthmedia.org
REACT_APP_API_BASE=https://agents.shealthmedia.org
NODE_ENV=production
EOF

# Build for production
npm run build

# Create reports directory
mkdir -p reports logs
```

### Verify Installation

```bash
# Check installation
ls -la

# Check file structure
tree -L 2

# Verify environment variables
cat .env

# Test build
npm run build
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Check application status
curl -I https://agents.shealthmedia.org/health

# Check SSL certificate
openssl s_client -connect agents.shealthmedia.org:443 -showcerts

# Check DNS
nslookup agents.shealthmedia.org

# Monitor logs
tail -f /var/log/nginx/agents.shealthmedia.org.access.log
tail -f /var/log/nginx/agents.shealthmedia.org.error.log
```

### Log Rotation

**File:** `/etc/logrotate.d/agents.shealthmedia.org`

```
/var/log/nginx/agents.shealthmedia.org.*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        /usr/lib/nginx/modules/ngx_http_geoip_module.so reload > /dev/null 2>&1 || true
    endscript
}
```

### Performance Monitoring

```bash
# Monitor resource usage
watch -n 1 'ps aux | grep node'

# Monitor network connections
netstat -tnp | grep 3000

# Monitor disk space
df -h

# Monitor memory
free -h
```

---

## Backup & Recovery

### Automated Backups

Create backup script `/usr/local/bin/backup-psychreport.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/backups/psychreport-agent"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
APP_DIR="/var/www/psychreport-agent"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application
tar -czf $BACKUP_DIR/app-$DATE.tar.gz -C /var/www psychreport-agent

# Backup database/reports
tar -czf $BACKUP_DIR/data-$DATE.tar.gz -C /var/www/psychreport-agent reports

# Backup Nginx config
tar -czf $BACKUP_DIR/nginx-$DATE.tar.gz /etc/nginx/sites-available/agents.shealthmedia.org

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Schedule with cron:

```bash
# Add to crontab
0 2 * * * /usr/local/bin/backup-psychreport.sh
```

---

## Security Hardening

### Firewall Configuration

```bash
# UFW (Uncomplicated Firewall)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable

# Verify rules
sudo ufw status
```

### Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt-get install fail2ban

# Create local configuration
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit configuration
sudo nano /etc/fail2ban/jail.local

# Add at bottom:
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true

# Start service
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

---

## Troubleshooting

### Issue: Subdomain not resolving

```bash
# Check DNS propagation
nslookup agents.shealthmedia.org
dig agents.shealthmedia.org +short

# Flush DNS cache (macOS)
dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Flush DNS cache (Linux)
sudo systemctl restart systemd-resolved
```

### Issue: SSL certificate not working

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/agents.shealthmedia.org/fullchain.pem -noout -dates

# Check certificate is used by Nginx
openssl s_client -connect agents.shealthmedia.org:443 -showcerts

# Check certificate expiration
certbot certificates
```

### Issue: Application not accessible

```bash
# Check if application is running
pm2 status
docker ps | grep psychreport

# Check if port is listening
sudo netstat -tlnp | grep 3000

# Check Nginx status
sudo systemctl status nginx

# Check Nginx configuration
sudo nginx -t

# Check application logs
pm2 logs psychreport-agent
docker logs psychreport-agent

# Check system logs
sudo journalctl -xe
```

### Issue: High memory/CPU usage

```bash
# Monitor processes
top
ps aux | grep node

# Check for zombie processes
ps aux | grep defunct

# Restart application
pm2 restart psychreport-agent

# Check for memory leaks
node --inspect=9229 app.js
```

---

## Scaling & Performance

### Horizontal Scaling (Multiple Servers)

Setup load balancing across multiple application servers:

```nginx
upstream psychreport_backend {
    least_conn;
    server 192.168.1.10:3000 weight=5 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:3000 weight=5 max_fails=3 fail_timeout=30s;
    server 192.168.1.12:3000 weight=5 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl http2;
    server_name agents.shealthmedia.org;
    
    # ... SSL config ...
    
    location / {
        proxy_pass http://psychreport_backend;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Caching Strategy

```nginx
# Cache API responses
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_pass http://upstream;
}
```

---

## Production Checklist

- [ ] DNS records updated and propagated
- [ ] SSL certificate installed and valid
- [ ] Nginx configured and tested
- [ ] Application deployed and running
- [ ] Health check endpoints working
- [ ] Logs configured and rotating
- [ ] Backups scheduled
- [ ] Firewall configured
- [ ] Fail2Ban configured
- [ ] Monitoring in place
- [ ] Documentation updated
- [ ] Team trained on deployment
- [ ] Disaster recovery plan in place

---

**Subdomain:** agents.shealthmedia.org
**Status:** Production Ready
**Last Updated:** October 2024
