'use strict';

const X12Builder  = require('./X12Builder');
const X12Envelope = require('./X12Envelope');

/**
 * Generates a HIPAA 005010X279A1 (270) Eligibility Inquiry X12 file.
 *
 * Loop / Segment structure:
 *   ISA  Interchange Control Header
 *   GS   Functional Group Header
 *     ST   2000
 *     BHT  Beginning of Hierarchical Transaction
 *     HL   2000A — Information Source (Payer)
 *     NM1  2100A — Payer Name
 *     HL   2000B — Information Receiver (Provider)
 *     NM1  2100B — Provider Name
 *     HL   2000C — Subscriber
 *     TRN  2100C — Subscriber Trace Number
 *     NM1  2100C — Subscriber Name
 *     REF  2100C — Subscriber Additional ID (if provided)
 *     DMG  2100C — Subscriber Date of Birth / Gender
 *     DTP  2100C — Date of Service
 *     EQ   2110C — Eligibility or Benefit Inquiry
 *     SE   Transaction Set Trailer
 *   GE   Functional Group Trailer
 *   IEA  Interchange Control Trailer
 */
class EDIGenerator270 {
  constructor(envelopeConfig = {}) {
    this.envelope = new X12Envelope(envelopeConfig);
  }

  /**
   * @param {object} inquiry
   *   billingProvider  { organizationName, npi, address }
   *   payer            { name, payerId }
   *   subscriber       { firstName, lastName, memberId, dob, gender }
   *   serviceTypeCodes {string[]}  e.g. ['30'] = Health Benefit Plan Coverage
   *   dateOfService    {string}    YYYY-MM-DD
   * @param {Date} [now]
   */
  generate(inquiry, now = new Date()) {
    const b = new X12Builder();
    const { isa, icn } = this.envelope.buildISA(now);
    const { gs,  gcn } = this.envelope.buildGS('270', now);
    const stNum = this.envelope.nextSTNumber();

    b.segment('ST',  ['270', stNum, '005010X279A1']);
    b.segment('BHT', ['0022', '13', inquiry.controlNumber || stNum, fmt8(now), fmt4(now)]);

    let hl = 1;
    const srcHL = hl++;
    const rcvHL = hl++;
    const subHL = hl++;

    // 2000A — Information Source (Payer)
    b.segment('HL', [String(srcHL), '', '20', '1']);
    b.segment('NM1', ['PR', '2', inquiry.payer.name, '', '', '', '', 'PI', inquiry.payer.payerId]);

    // 2000B — Information Receiver (Provider)
    b.segment('HL', [String(rcvHL), String(srcHL), '21', '1']);
    b.segment('NM1', [
      '1P', '2',
      inquiry.billingProvider.organizationName || inquiry.billingProvider.lastName,
      inquiry.billingProvider.organizationName ? '' : inquiry.billingProvider.firstName,
      '', '', '',
      'XX', inquiry.billingProvider.npi,
    ]);

    // 2000C — Subscriber
    b.segment('HL', [String(subHL), String(rcvHL), '22', '0']);
    b.segment('TRN', ['1', inquiry.controlNumber || stNum, '9' + inquiry.billingProvider.npi]);

    b.segment('NM1', [
      'IL', '1',
      inquiry.subscriber.lastName,
      inquiry.subscriber.firstName,
      '', '', '',
      'MI', inquiry.subscriber.memberId,
    ]);

    if (inquiry.subscriber.dob) {
      b.segment('DMG', ['D8', inquiry.subscriber.dob.replace(/-/g, ''), inquiry.subscriber.gender || 'U']);
    }

    if (inquiry.dateOfService) {
      b.segment('DTP', ['291', 'D8', inquiry.dateOfService.replace(/-/g, '')]);
    }

    // 2110C — Eligibility or Benefit Inquiry (one per service type code)
    for (const stc of (inquiry.serviceTypeCodes || ['30'])) {
      b.segment('EQ', [stc]);
    }

    const segCount = b.segmentCount + 1;
    b.segment('SE', [String(segCount), stNum]);

    return isa + gs + b.toString() + this.envelope.buildGE(gcn) + this.envelope.buildIEA(icn);
  }
}

function fmt8(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}
function fmt4(d) {
  return `${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}`;
}
function pad(n) { return String(n).padStart(2, '0'); }

module.exports = EDIGenerator270;
