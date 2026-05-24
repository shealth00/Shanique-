'use strict';

const { sanitize, formatDate, formatAmount, digitsOnly, stateCode } = require('../utils/DataSanitizer');

/**
 * Maps the EHR internal data model to the normalised claim object
 * expected by the 837P transaction builder.
 *
 * EHR Input shape (based on the existing patient/billing data structure):
 * {
 *   patient       : { ... }   // patient_info from PsychReportGenerator
 *   billingInfo   : { ... }   // encounter/billing record
 *   provider      : { ... }   // billing/rendering provider
 *   payer         : { ... }   // insurance payer info
 * }
 *
 * Normalised Claim Output shape consumed by EDIGenerator837P.
 */
function mapEHRToClaim(ehrData) {
  const { patient, billingInfo, provider, payer } = ehrData;

  return {
    billingProvider: mapBillingProvider(provider),
    renderingProvider: provider.rendering ? mapRenderingProvider(provider.rendering) : null,
    subscriber: mapSubscriber(patient, billingInfo),
    patient: mapPatient(patient, billingInfo),
    payer: mapPayer(payer),
    claimHeader: mapClaimHeader(billingInfo, patient),
    serviceLines: mapServiceLines(billingInfo.serviceLines || []),
  };
}

// ─── Billing Provider ──────────────────────────────────────────────────────────

function mapBillingProvider(provider) {
  return {
    organizationName : sanitize(provider.organizationName, 60),
    lastName         : sanitize(provider.lastName, 60),
    firstName        : sanitize(provider.firstName, 35),
    npi              : digitsOnly(provider.npi).slice(0, 10),
    taxId            : digitsOnly(provider.taxId || provider.ein).slice(0, 9),
    taxIdType        : provider.taxIdType === 'SSN' ? 'SY' : 'EI', // EI=EIN, SY=SSN
    taxonomyCode     : sanitize(provider.taxonomyCode, 10),
    phone            : digitsOnly(provider.phone).slice(0, 10),
    address: {
      street  : sanitize(provider.address?.street, 55),
      street2 : sanitize(provider.address?.street2, 55),
      city    : sanitize(provider.address?.city, 30),
      state   : stateCode(provider.address?.state),
      zip     : digitsOnly(provider.address?.zip).slice(0, 9),
    },
  };
}

// ─── Rendering Provider (loop 2310B) ──────────────────────────────────────────

function mapRenderingProvider(rp) {
  return {
    lastName     : sanitize(rp.lastName, 60),
    firstName    : sanitize(rp.firstName, 35),
    npi          : digitsOnly(rp.npi).slice(0, 10),
    taxonomyCode : sanitize(rp.taxonomyCode, 10),
  };
}

// ─── Subscriber (insured member — may be patient or guarantor) ────────────────

function mapSubscriber(patient, billingInfo) {
  const ins = billingInfo.primaryInsurance || {};
  const insuredPerson = ins.insuredPerson || patient;

  return {
    lastName   : sanitize(insuredPerson.last_name || insuredPerson.lastName, 60),
    firstName  : sanitize(insuredPerson.first_name || insuredPerson.firstName, 35),
    middleName : sanitize(insuredPerson.middleName, 25),
    memberId   : sanitize(ins.memberId || ins.subscriber_id, 50),
    groupNumber: sanitize(ins.groupNumber, 50),
    dob        : formatDate(insuredPerson.birth_date || insuredPerson.dob),
    gender     : genderCode(insuredPerson.gender),
    relationshipToPatient: ins.relationshipCode || '18', // 18=Self
    address: {
      street : sanitize(insuredPerson.address?.street || ins.address?.street, 55),
      city   : sanitize(insuredPerson.address?.city   || ins.address?.city, 30),
      state  : stateCode(insuredPerson.address?.state || ins.address?.state),
      zip    : digitsOnly(insuredPerson.address?.zip  || ins.address?.zip).slice(0, 9),
    },
  };
}

// ─── Patient (when different from subscriber) ─────────────────────────────────

function mapPatient(patient, billingInfo) {
  const rel = billingInfo.primaryInsurance?.relationshipCode;
  // If patient IS subscriber (18=Self), we don't need a separate patient loop
  if (!rel || rel === '18') return null;

  return {
    lastName   : sanitize(patient.last_name || patient.patient_info?.last_name, 60),
    firstName  : sanitize(patient.first_name || patient.patient_info?.first_name, 35),
    dob        : formatDate(patient.birth_date || patient.patient_info?.birth_date),
    gender     : genderCode(patient.gender || patient.patient_info?.gender),
    address: {
      street : sanitize(patient.address?.street, 55),
      city   : sanitize(patient.address?.city, 30),
      state  : stateCode(patient.address?.state),
      zip    : digitsOnly(patient.address?.zip).slice(0, 9),
    },
  };
}

// ─── Payer ─────────────────────────────────────────────────────────────────────

function mapPayer(payer) {
  return {
    name         : sanitize(payer.name, 60),
    payerId      : sanitize(payer.payerId || payer.payer_id, 50),
    address: {
      street : sanitize(payer.address?.street, 55),
      city   : sanitize(payer.address?.city, 30),
      state  : stateCode(payer.address?.state),
      zip    : digitsOnly(payer.address?.zip).slice(0, 9),
    },
  };
}

// ─── Claim Header (CLM, HI) ────────────────────────────────────────────────────

function mapClaimHeader(billingInfo, patient) {
  const diagnoses = (billingInfo.diagnoses || []).map(d => {
    // Strip dots from ICD-10 codes for X12 (e.g., F84.0 → F840)
    return String(d.code || d).replace('.', '').toUpperCase().slice(0, 7);
  });

  return {
    claimId          : sanitize(billingInfo.claimId || billingInfo.encounter_id, 38),
    totalCharge      : formatAmount(billingInfo.totalCharge),
    placeOfServiceCode: sanitize(billingInfo.placeOfServiceCode || '11', 2), // 11=Office
    claimFrequencyCode: sanitize(billingInfo.claimFrequencyCode || '1', 1),  // 1=Original
    signatureOnFile  : 'Y',
    assignmentOfBenefits: 'A',
    releaseOfInfo    : 'Y',
    diagnosisCodes   : diagnoses.slice(0, 12), // X12 005010 allows up to 12
    priorAuthNumber  : sanitize(billingInfo.priorAuthNumber, 50),
    referralNumber   : sanitize(billingInfo.referralNumber, 50),
  };
}

// ─── Service Lines (SV1, DTP) ──────────────────────────────────────────────────

function mapServiceLines(lines) {
  return lines.map((line, idx) => ({
    lineNumber     : idx + 1,
    procedureCode  : sanitize(line.cptCode || line.procedureCode, 5).toUpperCase(),
    modifiers      : (line.modifiers || []).slice(0, 4).map(m => sanitize(m, 2).toUpperCase()),
    diagnosisPointers: (line.diagnosisPointers || ['1']).slice(0, 4),
    charge         : formatAmount(line.charge),
    units          : String(parseInt(line.units || line.quantity, 10) || 1),
    dateOfService  : formatDate(line.dateOfService || line.date_of_service),
    placeOfService : sanitize(line.placeOfServiceCode || '11', 2),
    renderingProviderNpi: line.renderingProviderNpi ? digitsOnly(line.renderingProviderNpi).slice(0, 10) : null,
  }));
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function genderCode(gender) {
  if (!gender) return 'U';
  const g = String(gender).charAt(0).toUpperCase();
  if (g === 'M') return 'M';
  if (g === 'F') return 'F';
  return 'U';
}

module.exports = { mapEHRToClaim };
