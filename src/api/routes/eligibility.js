'use strict';

const express = require('express');
const router  = express.Router();

const StediEligibilityService = require('../../services/StediEligibilityService');
const EDIGenerator270          = require('../../edi/EDIGenerator270');

let stedi;
try {
  stedi = new StediEligibilityService();
} catch (_) {
  // Service will return 503 if key is missing at runtime
}

const gen270 = new EDIGenerator270({
  senderId      : process.env.AVAILITY_SENDER_ID   || 'SUBMITTERID',
  senderQualifier: process.env.AVAILITY_SENDER_QUAL || 'ZZ',
  usageIndicator: process.env.AVAILITY_USAGE        || 'P',
  gsApplicationSenderId: process.env.AVAILITY_GS_SENDER_ID || (process.env.AVAILITY_SENDER_ID || 'SUBMITTERID'),
});

/**
 * POST /api/eligibility/check
 *
 * Real-time eligibility check via Stedi API.
 *
 * Body: {
 *   provider   : { npi, organizationName }
 *   subscriber : { memberId, firstName, lastName, dob, gender }
 *   payer      : { payerId }
 *   serviceTypeCodes?: string[]   default ['30']
 *   dateOfService?  : string      YYYY-MM-DD, defaults to today
 * }
 *
 * Response: structured coverage summary (see StediEligibilityService._parseBenefits)
 */
router.post('/check', async (req, res, next) => {
  if (!stedi) {
    return res.status(503).json({ error: 'Stedi API key not configured. Set STEDI_API_KEY in .env' });
  }
  try {
    const result = await stedi.checkEligibility(req.body);
    res.json(result);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message, stediError: err.stediError });
    }
    next(err);
  }
});

/**
 * POST /api/eligibility/270
 *
 * Generate a raw X12 270 EDI file string without submitting it.
 * Useful for testing, audit trails, and direct clearinghouse submission.
 *
 * Body: same shape as /check, plus:
 *   billingProvider: { npi, organizationName, ... }
 */
router.post('/270', (req, res, next) => {
  try {
    const inquiry = {
      ...req.body,
      billingProvider: req.body.billingProvider || req.body.provider,
    };
    const edi = gen270.generate(inquiry);
    res.json({ ediContent: edi });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/eligibility/service-types
 *
 * Reference list of common X12 service type codes for eligibility inquiries.
 */
router.get('/service-types', (_req, res) => {
  res.json(SERVICE_TYPE_CODES);
});

const SERVICE_TYPE_CODES = [
  { code: '1',  label: 'Medical Care' },
  { code: '2',  label: 'Surgical' },
  { code: '3',  label: 'Consultation' },
  { code: '4',  label: 'Diagnostic X-Ray' },
  { code: '5',  label: 'Diagnostic Lab' },
  { code: '7',  label: 'Anesthesia' },
  { code: '23', label: 'Diagnostic Dental' },
  { code: '30', label: 'Health Benefit Plan Coverage (General)' },
  { code: '33', label: 'Chiropractic' },
  { code: '35', label: 'Dental Care' },
  { code: '42', label: 'Home Health Care' },
  { code: '45', label: 'Hospice' },
  { code: '47', label: 'Hospital — Inpatient' },
  { code: '48', label: 'Hospital — Outpatient' },
  { code: '50', label: 'Hospital — Emergency Accident' },
  { code: '51', label: 'Hospital — Emergency Medical' },
  { code: '56', label: 'Medically Related Transportation' },
  { code: '62', label: 'MRI/CT Scan' },
  { code: '65', label: 'Newborn Care' },
  { code: '68', label: 'Occupational Therapy' },
  { code: '69', label: 'Osteopathic Manipulation' },
  { code: '76', label: 'Dialysis' },
  { code: '78', label: 'Physical Medicine' },
  { code: '79', label: 'Physical Therapy' },
  { code: '80', label: 'Psychiatric — Outpatient' },
  { code: '82', label: 'Psychiatric — Inpatient' },
  { code: '86', label: 'Emergency Services' },
  { code: '88', label: 'Pharmacy' },
  { code: 'A6', label: 'Psychotherapy' },
  { code: 'A7', label: 'Psychiatric — Emergency' },
  { code: 'A8', label: 'Psychiatric — Inpatient (Extended)' },
  { code: 'AD', label: 'Occupational Therapy — Outpatient' },
  { code: 'AE', label: 'Physical Therapy — Outpatient' },
  { code: 'AF', label: 'Speech Therapy — Outpatient' },
  { code: 'AG', label: 'Skilled Nursing Care' },
  { code: 'AI', label: 'Substance Abuse' },
  { code: 'AJ', label: 'Alcoholism' },
  { code: 'AK', label: 'Drug Addiction' },
  { code: 'AL', label: 'Vision (Optometry)' },
  { code: 'BJ', label: 'Neurological' },
  { code: 'BV', label: 'Allergy' },
  { code: 'BW', label: 'Intensive Cardiac Rehab' },
  { code: 'MH', label: 'Mental Health' },
];

module.exports = router;
