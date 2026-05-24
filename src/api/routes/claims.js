'use strict';

const express           = require('express');
const router            = express.Router();
const { validateClaim } = require('../../edi/ClaimValidator');
const { mapEHRToClaim } = require('../../edi/mappers/ClaimMapper837P');
const EDIGenerator837P  = require('../../edi/EDIGenerator837P');

// Shared generator instance — reads Availity submitter config from env
const generator = new EDIGenerator837P({
  senderId               : process.env.AVAILITY_SENDER_ID      || 'SUBMITTERID',
  senderQualifier        : process.env.AVAILITY_SENDER_QUAL    || 'ZZ',
  usageIndicator         : process.env.AVAILITY_USAGE          || 'T', // 'T'=test, 'P'=production
  gsApplicationSenderId  : process.env.AVAILITY_GS_SENDER_ID   || 'SUBMITTERID',
});

/**
 * POST /api/edi/837p
 *
 * Accepts raw EHR data, maps it, validates it, and returns the EDI string.
 *
 * Body: { patient, billingInfo, provider, payer }
 *
 * Response (success): { ediContent: string, claimId: string }
 * Response (validation failure): 422 { errors: string[] }
 */
router.post('/837p', (req, res, next) => {
  try {
    const ehrData = req.body;

    // 1. Map EHR fields → normalised claim object
    let claim;
    try {
      claim = mapEHRToClaim(ehrData);
    } catch (mappingErr) {
      return res.status(400).json({ error: `Mapping failed: ${mappingErr.message}` });
    }

    // 2. Validate before building
    const { valid, errors } = validateClaim(claim);
    if (!valid) {
      return res.status(422).json({ errors });
    }

    // 3. Generate EDI file
    const ediContent = generator.generate(claim);

    res.json({
      claimId   : claim.claimHeader.claimId,
      ediContent,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/edi/837p/validate
 *
 * Dry-run: validate the mapped claim without generating the EDI file.
 * Useful for front-end pre-submission checks.
 */
router.post('/837p/validate', (req, res, next) => {
  try {
    const claim = mapEHRToClaim(req.body);
    const { valid, errors } = validateClaim(claim);
    res.json({ valid, errors });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/edi/837p/raw
 *
 * Accepts an already-normalised claim object (skips the EHR mapper).
 * Useful for testing or direct integration.
 */
router.post('/837p/raw', (req, res, next) => {
  try {
    const claim = req.body;
    const { valid, errors } = validateClaim(claim);
    if (!valid) return res.status(422).json({ errors });

    const ediContent = generator.generate(claim);
    res.json({ claimId: claim.claimHeader?.claimId, ediContent });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
