# GitHub Integration & Repository Setup Guide

## Repository Information

**Repository:** git@github.com:shealth00/Shanique-.git
**URL:** https://github.com/shealth00/Shanique-
**Subdomain:** https://agents.shealthmedia.org
**Branch:** main

---

## 📂 Repository Structure

```
Shanique-/
├── README.md                          # Main documentation
├── QUICK_START.md                     # Quick start guide
├── INDEX.md                           # System index
├── psych_report_system.md             # Technical architecture
├── sample_patient_data.md             # 12 example patients
├── PROMPT_ENGINEERING.md              # Customization guide
│
├── src/
│   ├── components/
│   │   ├── PsychReportGenerator.jsx   # Main React component
│   │   ├── PatientForm.jsx            # Patient data form
│   │   ├── AgentPanel.jsx             # Agent controls
│   │   └── ReportPreview.jsx          # Report preview
│   │
│   ├── utils/
│   │   ├── api.js                     # Anthropic API calls
│   │   ├── agents.js                  # Agent definitions
│   │   ├── prompts.js                 # Agent prompts
│   │   └── dataValidation.js          # Data validation
│   │
│   ├── hooks/
│   │   ├── usePatientData.js          # Patient state management
│   │   ├── useReportGeneration.js     # Report generation logic
│   │   └── useAgents.js               # Agent orchestration
│   │
│   ├── styles/
│   │   ├── index.css                  # Global styles
│   │   ├── components.css             # Component styles
│   │   └── theme.css                  # Theme variables
│   │
│   ├── App.jsx                        # Main app component
│   └── index.js                       # Entry point
│
├── public/
│   ├── index.html                     # HTML template
│   └── favicon.ico                    # Favicon
│
├── tests/
│   ├── components.test.jsx            # Component tests
│   ├── agents.test.js                 # Agent tests
│   ├── api.test.js                    # API tests
│   └── dataValidation.test.js         # Validation tests
│
├── docs/
│   ├── ARCHITECTURE.md                # System architecture
│   ├── API_REFERENCE.md               # API documentation
│   ├── DEPLOYMENT.md                  # Deployment guide
│   ├── CONFIGURATION.md               # Configuration options
│   └── TROUBLESHOOTING.md             # Troubleshooting guide
│
├── examples/
│   ├── patient-1-emma.json            # Patient example 1
│   ├── patient-2-marcus.json          # Patient example 2
│   ├── patient-3-sophie.json          # Patient example 3
│   ├── patient-4-joshua.json          # Patient example 4
│   ├── patient-5-olivia.json          # Patient example 5
│   ├── patient-6-brandon.json         # Patient example 6
│   └── patient-7-hannah.json          # Patient example 7
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                     # CI/CD pipeline
│   │   ├── deploy.yml                 # Deployment workflow
│   │   └── tests.yml                  # Test workflow
│   │
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md              # Bug report template
│   │   └── feature_request.md         # Feature request template
│   │
│   └── PULL_REQUEST_TEMPLATE.md       # PR template
│
├── docker/
│   ├── Dockerfile                     # Docker image definition
│   ├── docker-compose.yml             # Docker compose config
│   └── nginx.conf                     # Nginx configuration
│
├── config/
│   ├── .env.example                   # Environment variables example
│   ├── .env.development               # Development config
│   ├── .env.production                # Production config
│   └── subdomain.config.js            # Subdomain configuration
│
├── package.json                       # NPM dependencies
├── package-lock.json                  # Dependency lock file
├── .gitignore                         # Git ignore rules
├── LICENSE                            # MIT License
├── CHANGELOG.md                       # Version history
├── CONTRIBUTING.md                    # Contribution guidelines
└── psychreport.skill                  # Skill definition
```

---

## 🚀 Getting Started with GitHub

### 1. Clone the Repository

```bash
# Clone using SSH (recommended)
git clone git@github.com:shealth00/Shanique-.git
cd Shanique-

# Or clone using HTTPS
git clone https://github.com/shealth00/Shanique-.git
cd Shanique-
```

### 2. Install Dependencies

```bash
# Install Node dependencies
npm install

# Install React dependencies
npm install react react-dom

# Install Lucide icons
npm install lucide-react

# Install development dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### 3. Configure Environment

```bash
# Copy environment template
cp config/.env.example .env

# Edit .env with your values
nano .env
```

**Required environment variables:**
```
REACT_APP_ANTHROPIC_API_KEY=your_api_key_here
REACT_APP_SUBDOMAIN=agents.shealthmedia.org
NODE_ENV=production
```

### 4. Start Development Server

```bash
# Development mode with hot reload
npm start

# Production build
npm run build

# Run tests
npm test
```

---

## 🌐 Subdomain Configuration

### agents.shealthmedia.org Setup

#### DNS Configuration

Add these DNS records to your domain provider:

**Option 1: CNAME Record**
```
Name:     agents
Type:     CNAME
Value:    shealthmedia.org
TTL:      3600
```

**Option 2: A Record (if using static IP)**
```
Name:     agents
Type:     A
Value:    [Your Server IP]
TTL:      3600
```

#### Nginx Configuration

Create `/etc/nginx/sites-available/agents.shealthmedia.org`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name agents.shealthmedia.org;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name agents.shealthmedia.org;

    # SSL Certificate (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/agents.shealthmedia.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/agents.shealthmedia.org/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # React App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API Proxy to Anthropic
    location /api/ {
        proxy_pass https://api.anthropic.com/;
        proxy_set_header Authorization $http_authorization;
        proxy_pass_header Authorization;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/agents.shealthmedia.org /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d agents.shealthmedia.org

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 📦 Docker Deployment

### Build Docker Image

```bash
cd docker
docker build -t shealth/psychreport-agent:latest .
```

### Docker Compose

```bash
docker-compose -f docker/docker-compose.yml up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  psychreport-agent:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - REACT_APP_SUBDOMAIN=agents.shealthmedia.org
      - NODE_ENV=production
    volumes:
      - ./reports:/app/reports
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - shealthmedia-network

  nginx:
    image: nginx:latest
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - psychreport-agent
    networks:
      - shealthmedia-network
    restart: unless-stopped

networks:
  shealthmedia-network:
    driver: bridge
```

---

## 🔄 GitHub Workflow & CI/CD

### GitHub Actions Setup

**File: `.github/workflows/ci.yml`**

```yaml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node-version }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Build application
        run: npm run build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to production
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: |
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H agents.shealthmedia.org >> ~/.ssh/known_hosts
          ssh -i ~/.ssh/deploy_key deploy@agents.shealthmedia.org 'cd /app && git pull origin main && npm install && npm run build && pm2 restart psychreport-agent'
```

---

## 📋 Contributing Guidelines

### How to Contribute

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone git@github.com:YOUR_USERNAME/Shanique-.git
   cd Shanique-
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow the coding standards
   - Write tests for new features
   - Update documentation

5. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Use the PR template
   - Reference any related issues
   - Wait for review

### Commit Message Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style
- `refactor:` Code refactoring
- `test:` Tests
- `chore:` Build/dependencies

**Example:**
```
feat(agents): add trauma-informed prompt option

Add new trauma-informed prompt customization to all agents.
Includes specialized language for trauma survivors.

Closes #123
```

---

## 🔐 Security & Secrets

### GitHub Secrets Setup

Go to Settings → Secrets and add:

```
ANTHROPIC_API_KEY
DEPLOY_KEY
DEPLOY_HOST
DEPLOY_USER
```

### Security Best Practices

1. **Never commit secrets**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use environment variables**
   ```bash
   cp .env.example .env
   # Edit .env locally, never commit
   ```

3. **Protect main branch**
   - Require pull request reviews
   - Require status checks to pass
   - Dismiss stale pull request approvals

4. **Enable security features**
   - Enable branch protection rules
   - Enable CODEOWNERS file
   - Enable security scanning

---

## 📊 Project Management

### GitHub Issues

Use issues for:
- Bug reports
- Feature requests
- Questions and discussions
- Documentation improvements

### GitHub Discussions

Enable for:
- Q&A about usage
- Show and tell
- General discussions

### Project Board

Track progress with:
- Backlog
- In Progress
- In Review
- Done

---

## 🚀 Deployment Pipeline

### Development → Staging → Production

```
Feature Branch
    ↓
Create Pull Request
    ↓
Automated Tests (CI)
    ↓
Code Review
    ↓
Merge to Main
    ↓
Deploy to Staging (agents-staging.shealthmedia.org)
    ↓
Manual Testing
    ↓
Deploy to Production (agents.shealthmedia.org)
```

---

## 📈 Monitoring & Logging

### Application Monitoring

```bash
# PM2 process manager
pm2 install pm2-logrotate
pm2 status
pm2 logs psychreport-agent
```

### Log Locations

- Application logs: `/app/logs/app.log`
- Error logs: `/app/logs/error.log`
- Nginx access: `/var/log/nginx/access.log`
- Nginx error: `/var/log/nginx/error.log`

### Health Checks

```bash
# Check application health
curl https://agents.shealthmedia.org/health

# Expected response:
{
  "status": "healthy",
  "uptime": 12345,
  "version": "1.0.0"
}
```

---

## 📚 Documentation Links

- **Main Repo:** https://github.com/shealth00/Shanique-
- **Live App:** https://agents.shealthmedia.org
- **Wiki:** https://github.com/shealth00/Shanique-/wiki
- **Issues:** https://github.com/shealth00/Shanique-/issues
- **Discussions:** https://github.com/shealth00/Shanique-/discussions
- **Releases:** https://github.com/shealth00/Shanique-/releases

---

## 🆘 Troubleshooting

### Common Issues

**Issue: Build fails locally**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Issue: Cannot connect to API**
```bash
# Check API key
echo $REACT_APP_ANTHROPIC_API_KEY

# Check network
curl -I https://api.anthropic.com
```

**Issue: Subdomain not resolving**
```bash
# Check DNS
nslookup agents.shealthmedia.org

# Check SSL certificate
curl -v https://agents.shealthmedia.org
```

---

## 📞 Support

- **Issues:** https://github.com/shealth00/Shanique-/issues
- **Discussions:** https://github.com/shealth00/Shanique-/discussions
- **Documentation:** README.md and docs/

---

## 📄 License

MIT License - See LICENSE file for details

---

**Repository:** git@github.com:shealth00/Shanique-.git
**Subdomain:** agents.shealthmedia.org
**Status:** Active Development
**Last Updated:** October 2024
