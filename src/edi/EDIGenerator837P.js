'use strict';

const X12Builder  = require('./X12Builder');
const X12Envelope = require('./X12Envelope');

/**
 * Builds a complete HIPAA 005010X222A2 (837P) EDI X12 file string
 * from a normalised claim object.
 *
 * Loop / Segment structure:
 *
 *   ISA  (Interchange Control Header)
 *   GS   (Functional Group Header)
 *     ST   2000
 *     BPR  — Beginning of Provider Info
 *     NM1  1000A — Submitter
 *     PER  1000A — Submitter Contact
 *     NM1  1000B — Receiver (Availity)
 *     HL   2000A — Billing Provider HL
 *     PRV  2000A — Provider Specialty
 *     NM1  2010AA — Billing Provider Name
 *     N3   2010AA — Billing Provider Address
 *     N4   2010AA — Billing Provider City/State/ZIP
 *     REF  2010AA — Tax ID
 *     HL   2000B — Subscriber HL
 *     SBR  2000B — Subscriber Info
 *     NM1  2010BA — Subscriber Name
 *     N3   2010BA — Subscriber Address
 *     N4   2010BA — Subscriber City/State/ZIP
 *     DMG  2010BA — Subscriber Demographics
 *     NM1  2010BB — Payer Name
 *     [HL  2000C — Patient HL if patient ≠ subscriber]
 *     [PAT 2000C]
 *     [NM1 2010CA — Patient Name]
 *     [N3  2010CA]
 *     [N4  2010CA]
 *     [DMG 2010CA]
 *     CLM  2300 — Claim Header
 *     [REF 2300 — Prior Auth / Referral]
 *     HI   2300 — Diagnosis Codes (ICD-10)
 *     [NM1 2310B — Rendering Provider]
 *     LX   2400 — Line Counter
 *     SV1  2400 — Service Info
 *     DTP  2400 — Date of Service
 *     SE   Transaction Set Trailer
 *   GE  (Functional Group Trailer)
 *   IEA (Interchange Control Trailer)
 */
class EDIGenerator837P {
  /**
   * @param {object} envelopeConfig  - Passed to X12Envelope constructor
   *   senderId, senderQualifier, usageIndicator, gsApplicationSenderId
   */
  constructor(envelopeConfig = {}) {
    this.envelope = new X12Envelope(envelopeConfig);
  }

  /**
   * Generate the complete EDI 837P string for one claim.
   *
   * @param {object} claim  - Normalised claim object from ClaimMapper837P
   * @param {Date}   [now]  - Timestamp to embed (defaults to current UTC time)
   * @returns {string} Complete X12 file content ready to write/transmit
   */
  generate(claim, now = new Date()) {
    const b = new X12Builder();

    // ── Envelope ────────────────────────────────────────────────────────────────
    const { isa, icn } = this.envelope.buildISA(now);
    const { gs,  gcn } = this.envelope.buildGS('837P', now);
    const stNum = this.envelope.nextSTNumber();

    // We'll track segment count for SE trailer (count from ST through SE inclusive)
    const segmentsBefore = 0; // will calculate after

    // ── ST — Transaction Set Header ─────────────────────────────────────────────
    b.segment('ST', ['837', stNum, '005010X222A2']);

    // ── BHT — Beginning of Hierarchical Transaction ─────────────────────────────
    // BHT01=0019 (claim), BHT02=00 (original), BHT03=reference id, BHT04=date, BHT05=time, BHT06=CH (claim)
    b.segment('BHT', [
      '0019', '00',
      claim.claimHeader.claimId,
      formatDate8(now),
      formatTime4(now),
      'CH',
    ]);

    // ── 1000A — Submitter ───────────────────────────────────────────────────────
    const bp = claim.billingProvider;
    b.segment('NM1', [
      '41',            // entity ID = Submitter
      bp.organizationName ? '2' : '1',
      bp.organizationName || bp.lastName,
      bp.organizationName ? '' : bp.firstName,
      '', '', '',      // middle, prefix, suffix
      '46',            // ID qualifier = Electronic Transmitter ID
      bp.npi,          // Submitter NPI
    ]);
    b.segment('PER', [
      'IC',            // contact function = Information Contact
      bp.organizationName || `${bp.firstName} ${bp.lastName}`.trim(),
      'TE',            // comm qualifier = Telephone
      bp.phone || '0000000000',
    ]);

    // ── 1000B — Receiver (Availity) ─────────────────────────────────────────────
    b.segment('NM1', [
      '40',            // entity ID = Receiver
      '2',             // entity type = Non-person
      'AVAILITY',
      '', '', '', '',
      '46',
      'AVAILITY',
    ]);

    // ── HL counters ─────────────────────────────────────────────────────────────
    let hlCounter = 1;
    const billingHL  = hlCounter++;
    const subscriberHL = hlCounter++;
    const hasPatientLoop = !!claim.patient;
    const patientHL = hasPatientLoop ? hlCounter++ : null;

    // ── 2000A — Billing Provider HL ─────────────────────────────────────────────
    b.segment('HL', [String(billingHL), '', '20', '1']); // 20=Information Source, child=1

    if (bp.taxonomyCode) {
      b.segment('PRV', ['BI', 'PXC', bp.taxonomyCode]); // BI=Billing, PXC=taxonomy qualifier
    }

    // ── 2010AA — Billing Provider Name ──────────────────────────────────────────
    b.segment('NM1', [
      '85',            // entity ID = Billing Provider
      bp.organizationName ? '2' : '1',
      bp.organizationName || bp.lastName,
      bp.organizationName ? '' : bp.firstName,
      '', '', '',
      'XX',            // ID qualifier = NPI
      bp.npi,
    ]);
    b.segment('N3', [bp.address.street, bp.address.street2].filter(Boolean));
    b.segment('N4', [bp.address.city, bp.address.state, bp.address.zip]);
    // REF for Tax ID
    b.segment('REF', [bp.taxIdType, bp.taxId]);

    // ── 2000B — Subscriber HL ───────────────────────────────────────────────────
    b.segment('HL', [String(subscriberHL), String(billingHL), '22', hasPatientLoop ? '1' : '0']);
    // SBR — Subscriber Information
    // SBR01=payer responsibility (P=Primary), SBR02=relationship (18=Self), SBR09=claim filing indicator
    b.segment('SBR', [
      'P',             // Primary payer
      claim.subscriber.relationshipToPatient,
      claim.subscriber.groupNumber,
      '', '', '', '', '',
      'CI',            // CI = Commercial Insurance
    ]);

    // ── 2010BA — Subscriber Name ─────────────────────────────────────────────────
    b.segment('NM1', [
      'IL',            // entity ID = Insured or Subscriber
      '1',
      claim.subscriber.lastName,
      claim.subscriber.firstName,
      claim.subscriber.middleName,
      '', '',
      'MI',            // ID qualifier = Member ID
      claim.subscriber.memberId,
    ]);
    b.segment('N3', [claim.subscriber.address.street]);
    b.segment('N4', [claim.subscriber.address.city, claim.subscriber.address.state, claim.subscriber.address.zip]);
    b.segment('DMG', ['D8', claim.subscriber.dob, claim.subscriber.gender]);

    // ── 2010BB — Payer Name ──────────────────────────────────────────────────────
    b.segment('NM1', [
      'PR',            // entity ID = Payer
      '2',
      claim.payer.name,
      '', '', '', '',
      'PI',            // PI = Payer ID
      claim.payer.payerId,
    ]);

    // ── 2000C / 2010CA — Patient (only when different from subscriber) ────────────
    if (hasPatientLoop) {
      const pat = claim.patient;
      b.segment('HL', [String(patientHL), String(subscriberHL), '23', '0']); // 23=Dependent
      b.segment('PAT', [claim.subscriber.relationshipToPatient]);

      b.segment('NM1', [
        'QC',          // entity ID = Patient
        '1',
        pat.lastName,
        pat.firstName,
        '', '', '', '',
      ]);
      b.segment('N3', [pat.address.street]);
      b.segment('N4', [pat.address.city, pat.address.state, pat.address.zip]);
      b.segment('DMG', ['D8', pat.dob, pat.gender]);
    }

    // ── 2300 — Claim Header ──────────────────────────────────────────────────────
    const hdr = claim.claimHeader;
    // CLM05 composite: place of service : facility type : claim frequency
    b.segment('CLM', [
      hdr.claimId,
      hdr.totalCharge,
      '', '',
      b.composite(hdr.placeOfServiceCode, 'B', hdr.claimFrequencyCode),
      hdr.signatureOnFile,
      hdr.releaseOfInfo,
      hdr.assignmentOfBenefits,
      'Y',  // benefits assignment certification indicator
      'I',  // release of info indicator
    ]);

    if (hdr.priorAuthNumber) {
      b.segment('REF', ['G1', hdr.priorAuthNumber]); // G1 = Prior Auth
    }
    if (hdr.referralNumber) {
      b.segment('REF', ['9F', hdr.referralNumber]);  // 9F = Referral
    }

    // ── HI — Diagnosis Codes ─────────────────────────────────────────────────────
    // First code is principal (ABK), rest are additional (ABF)
    const [principal, ...addl] = hdr.diagnosisCodes;
    const hiElements = [b.composite('ABK', principal)];
    addl.forEach(code => hiElements.push(b.composite('ABF', code)));
    b.segment('HI', hiElements);

    // ── 2310B — Rendering Provider (optional) ────────────────────────────────────
    const rp = claim.renderingProvider;
    if (rp && rp.npi) {
      if (rp.taxonomyCode) {
        b.segment('PRV', ['PE', 'PXC', rp.taxonomyCode]); // PE=Performing
      }
      b.segment('NM1', [
        '82',          // entity ID = Rendering Provider
        '1',
        rp.lastName,
        rp.firstName,
        '', '', '',
        'XX',
        rp.npi,
      ]);
    }

    // ── 2400 — Service Lines ─────────────────────────────────────────────────────
    for (const line of claim.serviceLines) {
      b.segment('LX', [String(line.lineNumber)]);

      // SV1: composite procedure code, charge, unit basis, units, place, diag pointers
      const procComposite = b.composite(
        'HC',                           // HC = HCPCS/CPT
        line.procedureCode,
        ...line.modifiers,
      );
      b.segment('SV1', [
        procComposite,
        line.charge,
        'UN',                           // UN = Unit
        line.units,
        line.placeOfService,
        '',                             // composite service code (not required for 837P)
        line.diagnosisPointers.join(':'),
      ]);

      b.segment('DTP', ['472', 'D8', line.dateOfService]); // 472=Service Date

      // Line-level rendering provider override (optional)
      if (line.renderingProviderNpi && line.renderingProviderNpi !== (rp && rp.npi)) {
        b.segment('NM1', ['82', '1', '', '', '', '', '', 'XX', line.renderingProviderNpi]);
      }
    }

    // ── SE — Transaction Set Trailer ─────────────────────────────────────────────
    // Segment count includes ST and SE themselves
    const segCount = b.segmentCount + 1; // +1 for SE itself
    b.segment('SE', [String(segCount), stNum]);

    // ── Assemble full file ────────────────────────────────────────────────────────
    const ge  = this.envelope.buildGE(gcn, 1);
    const iea = this.envelope.buildIEA(icn, 1);

    return isa + gs + b.toString() + ge + iea;
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDate8(d) {
  const yy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function formatTime4(d) {
  return String(d.getUTCHours()).padStart(2, '0') +
         String(d.getUTCMinutes()).padStart(2, '0');
}

module.exports = EDIGenerator837P;
