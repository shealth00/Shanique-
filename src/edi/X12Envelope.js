'use strict';

const { padRight, formatDate, formatTime } = require('./utils/DataSanitizer');

/**
 * Generates the ISA/IEA interchange envelope and GS/GE functional group
 * wrappers per Availity's companion guide requirements.
 *
 * Availity Receiver IDs:
 *   ISA08 (Interchange Receiver ID) : AVAILITY       (15 chars, space-padded)
 *   GS03  (Functional Group Receiver): AVAILITY
 *
 * Fixed ISA positions (all fixed-width per the X12 005010 standard):
 *   ISA01  Authorization Info Qualifier  : 00
 *   ISA02  Authorization Information     : 10 spaces
 *   ISA03  Security Info Qualifier       : 00
 *   ISA04  Security Information          : 10 spaces
 *   ISA05  Interchange Sender ID Qual    : ZZ (mutually defined)
 *   ISA06  Interchange Sender ID         : 15 chars (your submitter ID, space-padded)
 *   ISA07  Interchange Receiver ID Qual  : ZZ
 *   ISA08  Interchange Receiver ID       : AVAILITY       (15 chars)
 *   ISA09  Interchange Date              : YYMMDD
 *   ISA10  Interchange Time             : HHMM
 *   ISA11  Repetition Separator          : ^
 *   ISA12  Interchange Control Version   : 00501
 *   ISA13  Interchange Control Number    : 9-digit, zero-padded
 *   ISA14  Acknowledgment Requested      : 0
 *   ISA15  Usage Indicator               : T (test) | P (production)
 *   ISA16  Component Element Separator   : :
 */

const AVAILITY_RECEIVER_ID = padRight('AVAILITY', 15);   // 'AVAILITY       '
const AVAILITY_GS_RECEIVER = 'AVAILITY';

class X12Envelope {
  /**
   * @param {object} config
   * @param {string} config.senderId         - Your Availity submitter ID (up to 15 chars)
   * @param {string} config.senderQualifier  - Default 'ZZ'
   * @param {string} config.usageIndicator   - 'T' for test, 'P' for production
   * @param {string} config.gsApplicationSenderId - GS02 application sender (your Tax ID or submitter ID)
   */
  constructor(config = {}) {
    this.senderId        = padRight(config.senderId || 'SUBMITTERID', 15);
    this.senderQualifier = config.senderQualifier || 'ZZ';
    this.usageIndicator  = config.usageIndicator || 'T';
    this.gsSenderId      = config.gsApplicationSenderId || (config.senderId || 'SUBMITTERID').trim();

    this._icnCounter = 100000001; // Interchange Control Number seed
    this._gcnCounter = 1;         // Functional Group Control Number seed
    this._stCounter  = 1;         // Transaction Set Control Number seed
  }

  /** Zero-padded 9-digit interchange control number. */
  _nextICN() {
    return String(this._icnCounter++).padStart(9, '0');
  }

  _nextGCN() {
    return String(this._gcnCounter++).padStart(9, '0');
  }

  /** Zero-padded 4-digit transaction set control number. */
  nextSTNumber() {
    return String(this._stCounter++).padStart(4, '0');
  }

  /**
   * Build the ISA segment string (fixed-length, 106 chars + terminator).
   * Returns { isa, icn } — store icn to close with IEA later.
   */
  buildISA(now = new Date()) {
    const icn  = this._nextICN();
    const date = formatDate(now).slice(2); // YYMMDD (drop century)
    const time = formatISATime(now);       // HHMM

    // ISA is fixed-width: each element has a strict character count
    const isa = [
      'ISA',
      '00',                         // ISA01 - Auth qualifier
      '          ',                  // ISA02 - Auth info (10 spaces)
      '00',                         // ISA03 - Security qualifier
      '          ',                  // ISA04 - Security info (10 spaces)
      this.senderQualifier,         // ISA05 - Sender qualifier (2)
      this.senderId,                // ISA06 - Sender ID (15)
      'ZZ',                         // ISA07 - Receiver qualifier (2)
      AVAILITY_RECEIVER_ID,         // ISA08 - Receiver ID (15)
      date,                         // ISA09 - Date (6)
      time,                         // ISA10 - Time (4)
      '^',                          // ISA11 - Repetition separator
      '00501',                      // ISA12 - Version
      icn,                          // ISA13 - Control number (9)
      '0',                          // ISA14 - Ack requested
      this.usageIndicator,          // ISA15 - Usage indicator
      ':',                          // ISA16 - Component separator
    ].join('*') + '~\n';

    return { isa, icn };
  }

  /** Build IEA closing segment. */
  buildIEA(icn, functionalGroupCount = 1) {
    return `IEA*${functionalGroupCount}*${icn}~\n`;
  }

  /**
   * Build GS (Functional Group Header) for 837 Health Care Claims.
   *   GS01: HC  (Health Care Claim)
   *   GS08: 005010X222A2 for 837P
   * Returns { gs, gcn }.
   */
  buildGS(transactionType = '837P', now = new Date()) {
    const gcn      = this._nextGCN();
    const date     = formatDate(now);    // CCYYMMDD
    const time     = formatISATime(now); // HHMM

    const versionMap = {
      '837P': '005010X222A2',
      '837I': '005010X223A3',
      '270':  '005010X279A1',
      '271':  '005010X279A1',
    };
    const version = versionMap[transactionType] || '005010X222A2';

    const gs = [
      'GS',
      'HC',                    // GS01 - Functional ID code
      this.gsSenderId,         // GS02 - Application sender
      AVAILITY_GS_RECEIVER,   // GS03 - Application receiver
      date,                    // GS04 - Date
      time,                    // GS05 - Time
      gcn,                     // GS06 - Group control number
      'X',                     // GS07 - Responsible agency code
      version,                 // GS08 - Version/release
    ].join('*') + '~\n';

    return { gs, gcn };
  }

  /** Build GE closing segment. */
  buildGE(gcn, transactionSetCount = 1) {
    return `GE*${transactionSetCount}*${gcn}~\n`;
  }
}

/** Format Date as HHMM for ISA10 (UTC). */
function formatISATime(d) {
  return String(d.getUTCHours()).padStart(2, '0') +
         String(d.getUTCMinutes()).padStart(2, '0');
}

module.exports = X12Envelope;
