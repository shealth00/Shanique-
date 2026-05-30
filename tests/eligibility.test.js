'use strict';

const EDIGenerator270         = require('../src/edi/EDIGenerator270');
const StediEligibilityService = require('../src/services/StediEligibilityService');

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const PROVIDER = {
  npi             : '1234567893',
  organizationName: 'Irby Psychological Services LLC',
};

const SUBSCRIBER = {
  memberId  : 'XYZ123456789',
  firstName : 'Emma',
  lastName  : 'Richardson',
  dob       : '2019-03-15',
  gender    : 'F',
};

const PAYER = { payerId: 'BCBSTX', name: 'Blue Cross Blue Shield of Texas' };

const INQUIRY = {
  billingProvider : PROVIDER,
  provider        : PROVIDER,
  payer           : PAYER,
  subscriber      : SUBSCRIBER,
  serviceTypeCodes: ['30'],
  dateOfService   : '2024-03-15',
  controlNumber   : '123456789',
};

// ─── EDIGenerator270 ──────────────────────────────────────────────────────────

describe('EDIGenerator270', () => {
  const gen = new EDIGenerator270({
    senderId      : 'IRBYPSY1234567',
    usageIndicator: 'T',
  });

  let edi;
  beforeAll(() => {
    edi = gen.generate(INQUIRY, new Date('2024-03-15T12:00:00Z'));
  });

  test('output starts with ISA and ends with IEA', () => {
    expect(edi.trimStart().startsWith('ISA*')).toBe(true);
    expect(edi.trimEnd().endsWith('~')).toBe(true);
    expect(edi).toContain('IEA*');
  });

  test('contains GS with 270 version identifier', () => {
    expect(edi).toContain('GS*HC*');
    expect(edi).toContain('005010X279A1');
  });

  test('ST segment references 270 transaction type', () => {
    expect(edi).toContain('ST*270*');
  });

  test('BHT segment contains control number', () => {
    expect(edi).toContain('BHT*0022*13*123456789');
  });

  test('contains payer NM1 2100A loop (PR)', () => {
    expect(edi).toContain('NM1*PR*2*Blue Cross Blue Shield of Texas');
  });

  test('contains provider NM1 2100B loop (1P)', () => {
    expect(edi).toContain('NM1*1P*');
    expect(edi).toContain('Irby Psychological Services LLC');
  });

  test('contains subscriber NM1 2100C loop (IL)', () => {
    expect(edi).toContain('NM1*IL*1*Richardson*Emma');
  });

  test('contains subscriber member ID', () => {
    expect(edi).toContain('MI*XYZ123456789');
  });

  test('contains DMG segment with DOB and gender', () => {
    expect(edi).toContain('DMG*D8*20190315*F');
  });

  test('contains DTP date of service', () => {
    expect(edi).toContain('DTP*291*D8*20240315');
  });

  test('contains EQ segment with service type code', () => {
    expect(edi).toContain('EQ*30');
  });

  test('contains SE trailer', () => {
    expect(edi).toContain('\nSE*');
  });

  test('contains HL segments for all three levels (20, 21, 22)', () => {
    expect(edi).toContain('HL*1**20*1');
    expect(edi).toContain('HL*2*1*21*1');
    expect(edi).toContain('HL*3*2*22*0');
  });

  test('multiple service type codes generate multiple EQ segments', () => {
    const multi = gen.generate(
      { ...INQUIRY, serviceTypeCodes: ['30', 'MH', '80'] },
      new Date('2024-03-15T12:00:00Z')
    );
    const eqMatches = (multi.match(/\nEQ\*/g) || []);
    expect(eqMatches.length).toBe(3);
  });

  test('GE and IEA close the envelope', () => {
    expect(edi).toContain('\nGE*');
    expect(edi).toContain('\nIEA*');
  });
});

// ─── StediEligibilityService ──────────────────────────────────────────────────

describe('StediEligibilityService — payload builder', () => {
  test('throws if API key is missing', () => {
    const OLD = process.env.STEDI_API_KEY;
    delete process.env.STEDI_API_KEY;
    expect(() => new StediEligibilityService()).toThrow('STEDI_API_KEY');
    process.env.STEDI_API_KEY = OLD;
  });

  test('_buildPayload produces correct tradingPartnerServiceId', () => {
    const svc     = new StediEligibilityService('test-key');
    const payload = svc._buildPayload(INQUIRY);
    expect(payload.tradingPartnerServiceId).toBe('BCBSTX');
  });

  test('_buildPayload uppercases subscriber name', () => {
    const svc     = new StediEligibilityService('test-key');
    const payload = svc._buildPayload(INQUIRY);
    expect(payload.subscriber.firstName).toBe('EMMA');
    expect(payload.subscriber.lastName).toBe('RICHARDSON');
  });

  test('_buildPayload formats dob to CCYYMMDD', () => {
    const svc     = new StediEligibilityService('test-key');
    const payload = svc._buildPayload(INQUIRY);
    expect(payload.subscriber.dateOfBirth).toBe('20190315');
  });

  test('_buildPayload strips non-digit chars from NPI', () => {
    const svc     = new StediEligibilityService('test-key');
    const payload = svc._buildPayload({ ...INQUIRY, provider: { ...PROVIDER, npi: '123-456-7893' } });
    expect(payload.provider.npi).toBe('1234567893');
  });

  test('_buildPayload defaults serviceTypeCodes to ["30"]', () => {
    const svc     = new StediEligibilityService('test-key');
    const payload = svc._buildPayload({ ...INQUIRY, serviceTypeCodes: undefined });
    expect(payload.encounter.serviceTypeCodes).toEqual(['30']);
  });

  test('_buildPayload generates a 9-digit control number when not provided', () => {
    const svc     = new StediEligibilityService('test-key');
    const payload = svc._buildPayload({ ...INQUIRY, controlNumber: undefined });
    expect(payload.controlNumber).toMatch(/^\d{9}$/);
  });

  test('_parseBenefits identifies active coverage', () => {
    const svc = new StediEligibilityService('test-key');
    const raw = {
      controlNumber : '123',
      subscriber    : { firstName: 'EMMA', lastName: 'RICHARDSON', memberId: 'XYZ123' },
      planStatus    : [{ statusCode: '1', planDescription: 'PPO Gold' }],
      benefitsInformation: [],
      planDateInformation: { eligibilityBegin: '20240101', eligibilityEnd: '20241231' },
    };
    const result = svc._parseBenefits(raw, INQUIRY);
    expect(result.coverageStatus).toBe('active');
    expect(result.planDescription).toBe('PPO Gold');
    expect(result.coverageStart).toBe('20240101');
  });

  test('_parseBenefits identifies inactive coverage', () => {
    const svc = new StediEligibilityService('test-key');
    const raw = {
      controlNumber : '456',
      subscriber    : { firstName: 'EMMA', lastName: 'RICHARDSON', memberId: 'XYZ123' },
      planStatus    : [{ statusCode: '6', status: 'Inactive' }],
      benefitsInformation: [],
    };
    const result = svc._parseBenefits(raw, INQUIRY);
    expect(result.coverageStatus).toBe('inactive');
  });

  test('_parseBenefits extracts deductible amount', () => {
    const svc = new StediEligibilityService('test-key');
    const raw = {
      controlNumber : '789',
      subscriber    : { firstName: 'EMMA', lastName: 'RICHARDSON', memberId: 'XYZ123' },
      planStatus    : [{ statusCode: '1' }],
      benefitsInformation: [
        { code: '1', benefitAmount: '1500', inPlanNetworkIndicatorCode: 'Y', serviceTypeCodes: ['30'] },
        { code: '2', benefitAmount: '750',  inPlanNetworkIndicatorCode: 'Y', serviceTypeCodes: ['30'] },
      ],
    };
    const result = svc._parseBenefits(raw, INQUIRY);
    expect(result.deductible.amount).toBe('1500');
    expect(result.deductible.inNetwork).toBe(true);
    expect(result.deductibleMet.amount).toBe('750');
  });
});
