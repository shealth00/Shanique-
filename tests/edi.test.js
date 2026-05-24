'use strict';

const { sanitize, formatDate, digitsOnly, formatAmount, stateCode } = require('../src/edi/utils/DataSanitizer');
const X12Builder        = require('../src/edi/X12Builder');
const X12Envelope       = require('../src/edi/X12Envelope');
const { validateClaim } = require('../src/edi/ClaimValidator');
const { mapEHRToClaim } = require('../src/edi/mappers/ClaimMapper837P');
const EDIGenerator837P  = require('../src/edi/EDIGenerator837P');

// ─── Test fixtures ─────────────────────────────────────────────────────────────

const VALID_EHR_DATA = {
  patient: {
    patient_info: {
      first_name : 'Emma',
      last_name  : 'Richardson',
      birth_date : '2019-03-15',
      gender     : 'Female',
    },
    address: { street: '123 Oak Ave', city: 'Austin', state: 'TX', zip: '78701' },
  },
  billingInfo: {
    claimId          : 'CLM20240315001',
    totalCharge      : '350.00',
    placeOfServiceCode: '11',
    claimFrequencyCode: '1',
    primaryInsurance : {
      memberId         : 'XYZ123456789',
      groupNumber      : 'GRP001',
      relationshipCode : '18',  // Self
      payerId          : 'BCBSTX',
      insuredPerson    : {
        last_name  : 'Richardson',
        first_name : 'Sarah',
        birth_date : '1985-06-22',
        gender     : 'Female',
        address    : { street: '123 Oak Ave', city: 'Austin', state: 'TX', zip: '78701' },
      },
    },
    diagnoses: [
      { code: 'F84.0' },  // ASD
      { code: 'F80.1' },  // Expressive language disorder
    ],
    serviceLines: [
      {
        cptCode         : '96136',  // Psychological testing admin & scoring
        charge          : '200.00',
        units           : 1,
        dateOfService   : '2024-03-15',
        diagnosisPointers: ['1', '2'],
        modifiers       : [],
      },
      {
        cptCode         : '96130',  // Psychological testing evaluation
        charge          : '150.00',
        units           : 1,
        dateOfService   : '2024-03-15',
        diagnosisPointers: ['1'],
        modifiers       : [],
      },
    ],
  },
  provider: {
    organizationName: 'Irby Psychological Services LLC',
    npi             : '1234567893',
    taxId           : '123456789',
    taxIdType       : 'EIN',
    taxonomyCode    : '103T00000X', // Psychologist
    phone           : '5124445678',
    address: { street: '456 Wellness Blvd', city: 'Austin', state: 'TX', zip: '787022345' },
  },
  payer: {
    name   : 'Blue Cross Blue Shield of Texas',
    payerId: 'BCBSTX',
    address: { street: '1001 E Lookout Dr', city: 'Richardson', state: 'TX', zip: '75082' },
  },
};

// ─── DataSanitizer tests ───────────────────────────────────────────────────────

describe('DataSanitizer', () => {
  test('sanitize strips X12 delimiters', () => {
    expect(sanitize('Hello*World~Test^Value', 50)).toBe('HelloWorldTestValue');
  });

  test('sanitize truncates to maxLength', () => {
    expect(sanitize('ABCDEFGHIJ', 5)).toBe('ABCDE');
  });

  test('sanitize returns empty string for null/undefined', () => {
    expect(sanitize(null, 10)).toBe('');
    expect(sanitize(undefined, 10)).toBe('');
  });

  test('formatDate handles YYYY-MM-DD strings', () => {
    expect(formatDate('2024-03-15')).toBe('20240315');
  });

  test('formatDate returns empty string for falsy input', () => {
    expect(formatDate('')).toBe('');
    expect(formatDate(null)).toBe('');
  });

  test('digitsOnly strips non-digit characters', () => {
    expect(digitsOnly('123-45-6789')).toBe('123456789');
    expect(digitsOnly('(512) 444-5678')).toBe('5124445678');
  });

  test('formatAmount formats to two decimal places', () => {
    expect(formatAmount(350)).toBe('350.00');
    expect(formatAmount('150.5')).toBe('150.50');
    expect(formatAmount('bad')).toBe('0.00');
  });

  test('stateCode converts full state names', () => {
    expect(stateCode('Texas')).toBe('TX');
    expect(stateCode('tx')).toBe('TX');
    expect(stateCode('CA')).toBe('CA');
  });
});

// ─── X12Builder tests ──────────────────────────────────────────────────────────

describe('X12Builder', () => {
  let builder;

  beforeEach(() => { builder = new X12Builder(); });

  test('builds a segment with correct delimiters', () => {
    builder.segment('NM1', ['IL', '1', 'Smith', 'John']);
    expect(builder.toString()).toBe('NM1*IL*1*Smith*John~\n');
  });

  test('trims trailing empty elements', () => {
    builder.segment('NM1', ['IL', '1', 'Smith', '', '', '', '', 'MI', 'MBR001']);
    // should NOT trim mid-segment empties, only trailing ones
    expect(builder.toString()).toContain('NM1*IL*1*Smith*****MI*MBR001~');
  });

  test('composite joins sub-elements with colon', () => {
    expect(builder.composite('11', 'B', '1')).toBe('11:B:1');
  });

  test('segmentCount increments correctly', () => {
    builder.segment('ST', ['837', '0001', '005010X222A2']);
    builder.segment('BHT', ['0019', '00', 'CLM001', '20240315', '1200', 'CH']);
    expect(builder.segmentCount).toBe(2);
  });

  test('reset clears all segments', () => {
    builder.segment('ST', ['837', '0001']);
    builder.reset();
    expect(builder.toString()).toBe('');
    expect(builder.segmentCount).toBe(0);
  });
});

// ─── X12Envelope tests ────────────────────────────────────────────────────────

describe('X12Envelope', () => {
  const env = new X12Envelope({ senderId: 'MYPRACTICE', usageIndicator: 'T' });

  test('ISA segment is exactly 106 characters before terminator', () => {
    const { isa } = env.buildISA(new Date('2024-03-15T12:00:00Z'));
    // ISA body before the terminator = 105 chars; the ~ makes it 106 total per X12 spec
    const content = isa.replace('~\n', '');
    expect(content.length).toBe(105);
  });

  test('ISA contains AVAILITY as receiver ID', () => {
    const { isa } = env.buildISA();
    expect(isa).toContain('AVAILITY');
  });

  test('ISA08 is padded to 15 chars', () => {
    const { isa } = env.buildISA();
    // Split on * and check element at index 8 (0-based from ISA = index 8)
    const elements = isa.split('*');
    expect(elements[8]).toBe('AVAILITY       '); // 8 + 7 spaces = 15
  });

  test('GS segment contains HC for claims', () => {
    const { gs } = env.buildGS('837P');
    expect(gs.startsWith('GS*HC*')).toBe(true);
  });

  test('GS08 contains correct 837P version', () => {
    const { gs } = env.buildGS('837P');
    expect(gs).toContain('005010X222A2');
  });

  test('IEA closes interchange with matching ICN', () => {
    const { isa, icn } = env.buildISA();
    const iea = env.buildIEA(icn);
    expect(iea).toContain(icn);
    expect(iea.startsWith('IEA*1*')).toBe(true);
  });
});

// ─── ClaimValidator tests ─────────────────────────────────────────────────────

describe('ClaimValidator', () => {
  test('accepts a fully valid claim', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    const { valid, errors } = validateClaim(claim);
    expect(errors).toEqual([]);
    expect(valid).toBe(true);
  });

  test('rejects missing billingProvider', () => {
    const { valid, errors } = validateClaim({});
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('billingProvider'))).toBe(true);
  });

  test('rejects invalid NPI', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    claim.billingProvider.npi = '123'; // too short
    const { valid, errors } = validateClaim(claim);
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('npi'))).toBe(true);
  });

  test('rejects missing subscriber', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    delete claim.subscriber;
    const { valid, errors } = validateClaim(claim);
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('subscriber'))).toBe(true);
  });

  test('rejects malformed ICD-10 code', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    claim.claimHeader.diagnosisCodes = ['ZZZ99'];
    const { valid, errors } = validateClaim(claim);
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('ICD-10'))).toBe(true);
  });

  test('rejects zero-charge service line', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    claim.serviceLines[0].charge = '0.00';
    const { valid, errors } = validateClaim(claim);
    expect(valid).toBe(false);
    expect(errors.some(e => e.includes('charge'))).toBe(true);
  });
});

// ─── ClaimMapper837P tests ────────────────────────────────────────────────────

describe('ClaimMapper837P', () => {
  test('maps billing provider organization name', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    expect(claim.billingProvider.organizationName).toBe('Irby Psychological Services LLC');
  });

  test('strips dots from ICD-10 codes', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    expect(claim.claimHeader.diagnosisCodes[0]).toBe('F840');
    expect(claim.claimHeader.diagnosisCodes[1]).toBe('F801');
  });

  test('formats total charge to two decimal places', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    expect(claim.claimHeader.totalCharge).toBe('350.00');
  });

  test('maps service lines with correct CPT codes', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    expect(claim.serviceLines[0].procedureCode).toBe('96136');
    expect(claim.serviceLines[1].procedureCode).toBe('96130');
  });

  test('sets patientLoop to null when subscriber is self', () => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    // relationship 18=Self means no separate patient loop
    expect(claim.patient).toBeNull();
  });
});

// ─── EDIGenerator837P integration tests ─────────────────────────────────────

describe('EDIGenerator837P', () => {
  const gen = new EDIGenerator837P({
    senderId      : 'IRBYPSY1234567',
    usageIndicator: 'T',
  });

  let edi;
  beforeAll(() => {
    const claim = mapEHRToClaim(VALID_EHR_DATA);
    edi = gen.generate(claim, new Date('2024-03-15T12:00:00Z'));
  });

  test('output starts with ISA and ends with IEA', () => {
    expect(edi.trimStart().startsWith('ISA*')).toBe(true);
    expect(edi.trimEnd().endsWith('~')).toBe(true);
    expect(edi).toContain('IEA*');
  });

  test('contains GS and GE envelope segments', () => {
    expect(edi).toContain('GS*HC*');
    expect(edi).toContain('\nGE*');
  });

  test('contains ST and SE transaction set markers', () => {
    expect(edi).toContain('ST*837*');
    expect(edi).toContain('\nSE*');
  });

  test('contains BHT segment with claim reference', () => {
    expect(edi).toContain('BHT*0019*00*CLM20240315001');
  });

  test('contains billing provider NM1 loop 85', () => {
    expect(edi).toContain('NM1*85*');
    expect(edi).toContain('Irby Psychological Services LLC');
  });

  test('contains subscriber NM1 loop IL', () => {
    expect(edi).toContain('NM1*IL*');
    expect(edi).toContain('Richardson');
  });

  test('contains payer NM1 loop PR', () => {
    expect(edi).toContain('NM1*PR*');
    expect(edi).toContain('Blue Cross Blue Shield of Texas');
  });

  test('contains CLM segment with claim ID and total charge', () => {
    expect(edi).toContain('CLM*CLM20240315001*350.00*');
  });

  test('contains HI diagnosis codes', () => {
    expect(edi).toContain('HI*ABK:F840');
    expect(edi).toContain('ABF:F801');
  });

  test('contains SV1 service line segments', () => {
    expect(edi).toContain('SV1*HC:96136*200.00*UN*1');
    expect(edi).toContain('SV1*HC:96130*150.00*UN*1');
  });

  test('contains DTP service date for each line', () => {
    const dtpMatches = (edi.match(/DTP\*472\*D8\*20240315/g) || []);
    expect(dtpMatches.length).toBe(2);
  });

  test('contains provider taxonomy PRV segment', () => {
    expect(edi).toContain('PRV*BI*PXC*103T00000X');
  });

  test('SE segment count is greater than 10', () => {
    const seMatch = edi.match(/SE\*(\d+)\*/);
    expect(seMatch).not.toBeNull();
    expect(parseInt(seMatch[1], 10)).toBeGreaterThan(10);
  });

  test('uses test usage indicator T in ISA15', () => {
    // ISA15 is the 15th element (0-indexed from ISA*...)
    const elements = edi.split('\n')[0].split('*');
    expect(elements[15]).toBe('T');
  });
});
