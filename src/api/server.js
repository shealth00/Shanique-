'use strict';

require('dotenv').config();

// ── Production guard ──────────────────────────────────────────────────────────
// Refuse to start if critical credentials are missing when running in production
const REQUIRED_ENV = ['AVAILITY_SENDER_ID', 'STEDI_API_KEY'];
if (process.env.NODE_ENV === 'production') {
  const missing = REQUIRED_ENV.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

const express = require('express');
const cors    = require('cors');

const claimsRouter      = require('./routes/claims');
const eligibilityRouter = require('./routes/eligibility');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/edi',         claimsRouter);
app.use('/api/eligibility', eligibilityRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Error handler ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`EDI service listening on port ${PORT}`));
}

module.exports = app;
