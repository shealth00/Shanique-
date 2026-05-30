'use strict';

const axios = require('axios');
const { digitsOnly, formatDate, sanitize } = require('../edi/utils/DataSanitizer');

const STEDI_BASE_URL = 'https://healthcare.us.stedi.com/2024-04-01/change/medicalnetwork/eligibility/v3';

/**
 * Calls the Stedi real-time eligibility API (X12 270/271 under the hood)
 * and returns a structured coverage summary.
 *
 * Required env var: STEDI_API_KEY
 */
class StediEligibilityService {
  constructor(apiKey) {
    this.apiKey = apiKey || process.env.STEDI_API_KEY;
    if (!this.apiKey) throw new Error('STEDI_API_KEY is not configured');
  }

  /**
   * Check patient eligibility against a payer.
   *
   * @param {object} params
   *   provider   { npi, organizationName, lastName, firstName }
   *   subscriber { memberId, firstName, lastName, dob (YYYY-MM-DD), gender (M/F/U) }
   *   payer      { payerId }  — Stedi trading partner service ID
   *   serviceTypeCodes {string[]} — defaults to ['30'] (Health Benefit Plan Coverage)
   *   dateOfService    {string}   — YYYY-MM-DD, defaults to today
   *
   * @returns {object} Structured eligibility result (see _parseBenefits)
   */
  async checkEligibility(params) {
    const payload = this._buildPayload(params);

    try {
      const response = await axios.post(STEDI_BASE_URL, payload, {
        headers: {
          Authorization: `Key ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      return this._parseBenefits(response.data, params);
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error || JSON.stringify(err.response.data);
        const e = new Error(`Stedi eligibility check failed (${err.response.status}): ${msg}`);
        e.statusCode = err.response.status;
        e.stediError = err.response.data;
        throw e;
      }
      throw err;
    }
  }

  _buildPayload(params) {
    const { provider, subscriber, payer, serviceTypeCodes, dateOfService } = params;

    const today = new Date();
    const dos = dateOfService || `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, '0')}-${String(today.getUTCDate()).padStart(2, '0')}`;

    const controlNumber = String(Date.now()).slice(-9);

    return {
      controlNumber,
      tradingPartnerServiceId: sanitize(payer.payerId, 50),
      provider: {
        organizationName: sanitize(provider.organizationName || `${provider.firstName} ${provider.lastName}`, 60),
        npi: digitsOnly(provider.npi).slice(0, 10),
      },
      subscriber: {
        memberId   : sanitize(subscriber.memberId, 50),
        firstName  : sanitize(subscriber.firstName, 35).toUpperCase(),
        lastName   : sanitize(subscriber.lastName, 60).toUpperCase(),
        dateOfBirth: formatDate(subscriber.dob),
        gender     : stediGender(subscriber.gender),
      },
      encounter: {
        serviceTypeCodes: serviceTypeCodes || ['30'],
        dateRange: {
          startDate: dos.replace(/-/g, ''),
          endDate  : dos.replace(/-/g, ''),
        },
      },
    };
  }

  /**
   * Normalise the raw Stedi/271 response into a clean summary
   * that the front-end and downstream services can consume directly.
   */
  _parseBenefits(raw, params) {
    const isActive = isActiveCoverage(raw);
    const planStatus = raw.planStatus?.[0] || {};
    const benefits   = raw.benefitsInformation || [];

    return {
      requestId       : raw.controlNumber,
      payerId         : params.payer.payerId,
      memberName      : `${raw.subscriber?.firstName || ''} ${raw.subscriber?.lastName || ''}`.trim(),
      memberId        : raw.subscriber?.memberId || params.subscriber.memberId,
      groupNumber     : extractRef(benefits, 'group'),
      planDescription : planStatus.planDescription || raw.planDateInformation?.planDescription || '',
      coverageStatus  : isActive ? 'active' : 'inactive',
      coverageStart   : raw.planDateInformation?.eligibilityBegin || '',
      coverageEnd     : raw.planDateInformation?.eligibilityEnd   || '',
      deductible      : extractBenefit(benefits, '1', 'deductible'),
      deductibleMet   : extractBenefit(benefits, '2', 'deductible'),
      outOfPocket     : extractBenefit(benefits, 'G', 'out-of-pocket'),
      outOfPocketMet  : extractBenefit(benefits, 'H', 'out-of-pocket'),
      copay           : extractBenefit(benefits, 'B', 'copay'),
      coinsurance     : extractBenefit(benefits, 'A', 'coinsurance'),
      planStatus      : planStatus,
      rawBenefits     : benefits,
      raw             : raw,
      checkedAt       : new Date().toISOString(),
    };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stediGender(g) {
  if (!g) return 'U';
  const c = String(g).charAt(0).toUpperCase();
  return c === 'M' ? 'M' : c === 'F' ? 'F' : 'U';
}

function isActiveCoverage(raw) {
  const statuses = raw.planStatus || [];
  return statuses.some(s =>
    String(s.statusCode) === '1' ||
    /\bactive\b/i.test(String(s.status || ''))
  );
}

function extractBenefit(benefits, typeCode, label) {
  const match = benefits.find(b =>
    b.code === typeCode &&
    (b.benefitAmount || b.benefitPercent)
  );
  if (!match) return null;
  return {
    label,
    amount : match.benefitAmount  || null,
    percent: match.benefitPercent || null,
    inNetwork   : match.inPlanNetworkIndicatorCode === 'Y',
    serviceTypes: match.serviceTypeCodes || [],
  };
}

function extractRef(benefits, type) {
  const match = benefits.find(b =>
    b.referenceIdentification &&
    String(b.referenceIdentificationQualifier || '').toLowerCase().includes(type)
  );
  return match?.referenceIdentification || null;
}

module.exports = StediEligibilityService;
