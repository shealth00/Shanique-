'use strict';

/**
 * Pre-generation validation for 837P claims.
 * Catches the most common SNIP Level 1 & 2 failures before building the file.
 *
 * Returns { valid: boolean, errors: string[] }.
 */

// NPI must be exactly 10 digits
const NPI_RE = /^\d{10}$/;

// ICD-10-CM: accepts both dotted (F84.0) and dot-stripped (F840) forms.
// The mapper strips dots before building X12, so both must be valid here.
const ICD10_RE = /^[A-Z]\d{2}\.?\w{0,4}$/i;

// CPT/HCPCS: 5-char alphanumeric
const CPT_RE = /^[A-Z0-9]{5}$/i;

/**
 * Validate a complete claim payload before EDI generation.
 *
 * @param {object} claim  - Normalised claim object (see ClaimMapper837P for shape)
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateClaim(claim) {
  const errors = [];

  // ── Billing Provider ────────────────────────────────────────────────────────
  const bp = claim.billingProvider;
  if (!bp) {
    errors.push('billingProvider is required');
  } else {
    if (!bp.lastName && !bp.organizationName)
      errors.push('billingProvider: lastName or organizationName is required');
    if (!NPI_RE.test(bp.npi || ''))
      errors.push(`billingProvider.npi "${bp.npi}" is not a valid 10-digit NPI`);
    if (!bp.taxId)
      errors.push('billingProvider.taxId (EIN or SSN) is required');
    if (!bp.address?.street)
      errors.push('billingProvider.address.street is required');
    if (!bp.address?.city)
      errors.push('billingProvider.address.city is required');
    if (!bp.address?.state)
      errors.push('billingProvider.address.state is required');
    if (!bp.address?.zip)
      errors.push('billingProvider.address.zip is required');
  }

  // ── Subscriber ───────────────────────────────────────────────────────────────
  const sub = claim.subscriber;
  if (!sub) {
    errors.push('subscriber is required');
  } else {
    if (!sub.lastName)  errors.push('subscriber.lastName is required');
    if (!sub.firstName) errors.push('subscriber.firstName is required');
    if (!sub.memberId)  errors.push('subscriber.memberId is required');
    if (!sub.dob)       errors.push('subscriber.dob (date of birth) is required');
    if (!sub.gender)    errors.push('subscriber.gender is required');
    if (!sub.address?.street) errors.push('subscriber.address.street is required');
    if (!sub.address?.city)   errors.push('subscriber.address.city is required');
    if (!sub.address?.state)  errors.push('subscriber.address.state is required');
    if (!sub.address?.zip)    errors.push('subscriber.address.zip is required');
  }

  // ── Payer ────────────────────────────────────────────────────────────────────
  const payer = claim.payer;
  if (!payer) {
    errors.push('payer is required');
  } else {
    if (!payer.name)    errors.push('payer.name is required');
    if (!payer.payerId) errors.push('payer.payerId (Availity payer ID) is required');
  }

  // ── Claim Header ─────────────────────────────────────────────────────────────
  const hdr = claim.claimHeader;
  if (!hdr) {
    errors.push('claimHeader is required');
  } else {
    if (!hdr.claimId)
      errors.push('claimHeader.claimId is required');
    if (!hdr.totalCharge || parseFloat(hdr.totalCharge) <= 0)
      errors.push('claimHeader.totalCharge must be a positive number');
    if (!hdr.placeOfServiceCode)
      errors.push('claimHeader.placeOfServiceCode is required (e.g., "11" for office)');
    if (!Array.isArray(hdr.diagnosisCodes) || hdr.diagnosisCodes.length === 0)
      errors.push('claimHeader.diagnosisCodes must have at least one ICD-10 code');
    else {
      hdr.diagnosisCodes.forEach((code, i) => {
        if (!ICD10_RE.test(code))
          errors.push(`claimHeader.diagnosisCodes[${i}] "${code}" does not look like a valid ICD-10 code`);
      });
    }
  }

  // ── Service Lines ─────────────────────────────────────────────────────────────
  const lines = claim.serviceLines;
  if (!Array.isArray(lines) || lines.length === 0) {
    errors.push('serviceLines must be a non-empty array');
  } else {
    lines.forEach((line, i) => {
      const pfx = `serviceLines[${i}]`;
      if (!line.procedureCode)
        errors.push(`${pfx}.procedureCode is required`);
      else if (!CPT_RE.test(line.procedureCode))
        errors.push(`${pfx}.procedureCode "${line.procedureCode}" is not a valid CPT/HCPCS code`);

      if (!line.dateOfService)
        errors.push(`${pfx}.dateOfService is required`);

      if (!line.charge || parseFloat(line.charge) <= 0)
        errors.push(`${pfx}.charge must be a positive number`);

      if (!line.units || parseInt(line.units, 10) < 1)
        errors.push(`${pfx}.units must be at least 1`);
    });
  }

  // ── Rendering Provider (optional but must be valid if present) ────────────────
  const rp = claim.renderingProvider;
  if (rp && rp.npi && !NPI_RE.test(rp.npi))
    errors.push(`renderingProvider.npi "${rp.npi}" is not a valid 10-digit NPI`);

  return { valid: errors.length === 0, errors };
}

module.exports = { validateClaim };
