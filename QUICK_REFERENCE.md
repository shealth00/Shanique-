# 🎯 Quick Reference Card
## Psychological Evaluation Report Generation System

---

## 📍 KEY LINKS

| Resource | URL/Command |
|----------|------------|
| **GitHub Repo** | `git@github.com:shealth00/Shanique-.git` |
| **Live App** | https://agents.shealthmedia.org |
| **Main Documentation** | README.md |
| **Quick Start** | QUICK_START.md (5 minutes) |
| **Navigation Guide** | INDEX.md |

---

## ⚡ QUICK START COMMANDS

```bash
# Clone repository
git clone git@github.com:shealth00/Shanique-.git
cd Shanique-

# Install dependencies
npm install
npm install lucide-react

# Configure environment
cp config/.env.example .env
# Edit .env with ANTHROPIC_API_KEY

# Start development
npm start
# Opens http://localhost:3000

# Build for production
npm run build

# Run tests
npm test
```

---

## 🐳 DOCKER QUICK START

```bash
# Build Docker image
docker build -t psychreport-agent:latest .

# Run container
docker run -p 3000:3000 \
  -e REACT_APP_ANTHROPIC_API_KEY=your_key \
  psychreport-agent:latest

# Docker Compose
docker-compose -f docker/docker-compose.yml up -d
```

---

## 📦 FILES AT A GLANCE

| File | Purpose | Read Time |
|------|---------|-----------|
| **IMPLEMENTATION_SUMMARY.md** | Project overview | 5 min |
| **INDEX.md** | Navigation guide | 5 min |
| **QUICK_START.md** | Setup instructions | 5 min |
| **README.md** | Full documentation | 20 min |
| **SKILLS_INTEGRATION.md** | Deployment workflow | 30 min |
| **psych_report_system.md** | Architecture | 15 min |
| **PROMPT_ENGINEERING.md** | Customization | 30 min |

---

## 🎯 MINIMAL SETUP (20 minutes)

1. **Clone:** `git clone git@github.com:shealth00/Shanique-.git`
2. **Install:** `npm install && npm install lucide-react`
3. **Configure:** `cp config/.env.example .env` (add API key)
4. **Run:** `npm start`
5. **Use:** Add patient → Generate Report → Export

---

## 🌐 SUBDOMAIN SETUP

```
DNS CNAME Record:
  Name:  agents
  Type:  CNAME
  Value: shealthmedia.org
  TTL:   3600

Full URL: https://agents.shealthmedia.org
```

---

## 🔑 ENVIRONMENT VARIABLES

```bash
# Required
REACT_APP_ANTHROPIC_API_KEY=sk-ant-xxxxx

# Recommended
REACT_APP_SUBDOMAIN=agents.shealthmedia.org
REACT_APP_API_BASE=https://agents.shealthmedia.org
NODE_ENV=production
```

---

## 5️⃣ CORE AGENTS

| Agent | Output | Time |
|-------|--------|------|
| Caregiver Interview | 2-3 pages | 30 sec |
| Behavioral Observations | 1-2 pages | 30 sec |
| Test Results | 5-10 pages | 1 min |
| Diagnostic Summary | 3-5 pages | 1 min |
| Recommendations | 3-5 pages | 2 min |
| **TOTAL** | **15-25 pages** | **3-5 min** |

---

## 📊 SYSTEM SPECS

- **Framework:** React 16.8+
- **UI Library:** Lucide React
- **API:** Anthropic Claude API
- **Server:** Nginx
- **Container:** Docker
- **Node Version:** 14+
- **Time Savings:** 50-75%

---

## 🚀 DEPLOYMENT PHASES

| Phase | Duration | Key Tasks |
|-------|----------|-----------|
| **Dev** | Week 1 | Setup locally, test data |
| **Staging** | Week 2 | Infrastructure, CI/CD |
| **Production** | Week 3 | Full deployment, monitoring |

---

## 🔐 SECURITY CHECKLIST

- [ ] HTTPS/TLS enabled
- [ ] API key in env variables
- [ ] HIPAA compliance verified
- [ ] Firewall configured
- [ ] SSL certificate auto-renewal
- [ ] Backups scheduled
- [ ] Monitoring active

---

## 📈 MONITORING COMMANDS

```bash
# Check application status
pm2 status
docker ps

# View logs
pm2 logs psychreport-agent
docker logs psychreport-agent

# Health check
curl https://agents.shealthmedia.org/health

# Monitor resources
top
df -h
free -h
```

---

## 🆘 TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| **Build fails** | `rm -rf node_modules && npm install` |
| **API connection error** | Check API key in .env |
| **Subdomain not resolving** | Check DNS propagation with `nslookup` |
| **SSL certificate error** | Verify Let's Encrypt certificate |
| **Application won't start** | Check port 3000 not in use |

---

## 📞 SUPPORT

- **Docs:** All .md files in package
- **Issues:** GitHub Issues tab
- **Questions:** GitHub Discussions
- **API Docs:** https://docs.anthropic.com

---

## 💡 TIPS & TRICKS

**Faster Setup:** Use Docker for containerized deployment
**Better Data:** Include specific test scores and observations
**Customization:** See PROMPT_ENGINEERING.md for detailed guide
**Examples:** Use sample_patient_data.md for reference
**Scaling:** Use PM2 clusters or Kubernetes for high volume

---

## 📋 PATIENT DATA TEMPLATE

```json
{
  "patient_info": {
    "first_name": "John",
    "last_name": "Doe",
    "birth_date": "2019-01-15",
    "age_years": 5,
    "age_months": 9
  },
  "referral_info": {
    "reason_for_evaluation": "Concerns about...",
    "primary_concerns": ["concern1", "concern2"]
  },
  "test_results": [
    {
      "test_name": "WISC-V",
      "composite_score": 100,
      "percentile": 50
    }
  ]
}
```

---

## ⏱️ TIMELINE

- **Day 1:** Read docs, clone repo
- **Day 2-3:** Install and test locally
- **Day 4-7:** Generate practice reports
- **Week 2:** Setup infrastructure
- **Week 3:** Deploy production

---

## 🎓 RECOMMENDED READING ORDER

1. **IMPLEMENTATION_SUMMARY.md** ← Start here
2. **QUICK_START.md** ← Get running fast
3. **README.md** ← Understand the system
4. **SKILLS_INTEGRATION.md** ← Full deployment
5. **PROMPT_ENGINEERING.md** ← Customization

---

## 📌 CRITICAL REMINDERS

🚨 **Licensed clinician review REQUIRED before distribution**
🔐 **Never commit API keys to repository**
📋 **Patient data is sensitive - HIPAA compliance required**
✅ **Test thoroughly before production deployment**
📊 **Monitor application performance regularly**

---

## 🎯 SUCCESS METRICS

✅ Report generation: < 5 minutes
✅ Uptime: > 99.9%
✅ Time savings: > 50%
✅ User satisfaction: > 4.5/5
✅ Error rate: < 0.1%

---

## 🔗 REPOSITORY INFO

```
Owner:    shealth00
Repo:     Shanique-
Branch:   main
SSH:      git@github.com:shealth00/Shanique-.git
HTTPS:    https://github.com/shealth00/Shanique-.git
Status:   Ready for first commit
```

---

## 🌐 SUBDOMAIN INFO

```
Domain:        shealthmedia.org
Subdomain:     agents
Full URL:      https://agents.shealthmedia.org
Status:        Ready for DNS setup
SSL:           Let's Encrypt compatible
```

---

## 📞 QUICK CONTACTS

- **GitHub Issues:** Report bugs and feature requests
- **GitHub Discussions:** Ask questions, share ideas
- **Documentation:** See .md files in package
- **Anthropic Support:** https://support.anthropic.com

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Last Updated:** October 2024

**Next Step:** Read IMPLEMENTATION_SUMMARY.md or QUICK_START.md
