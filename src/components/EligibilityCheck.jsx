import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

const STATUS_COLORS = {
  active  : { bg: '#d1fae5', border: '#34d399', text: '#065f46', label: 'Active Coverage' },
  inactive: { bg: '#fee2e2', border: '#f87171', text: '#7f1d1d', label: 'Inactive / No Coverage' },
  unknown : { bg: '#fef9c3', border: '#facc15', text: '#713f12', label: 'Status Unknown'         },
};

const EMPTY_FORM = {
  providerNpi         : '',
  providerOrg         : '',
  payerId             : '',
  memberId            : '',
  subscriberFirstName : '',
  subscriberLastName  : '',
  subscriberDob       : '',
  subscriberGender    : 'U',
  dateOfService       : new Date().toISOString().split('T')[0],
  serviceTypeCode     : '30',
};

export default function EligibilityCheck({ prefillPatient, onCheckComplete }) {
  const [form,    setForm]    = useState(prefillPatient ? prefill(prefillPatient) : EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState(null);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleCheck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/eligibility/check`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(buildPayload(form)),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data);
      if (onCheckComplete) onCheckComplete(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const style = result ? STATUS_COLORS[result.coverageStatus] || STATUS_COLORS.unknown : null;

  return (
    <div style={cardStyle}>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#1e293b' }}>
        Patient Eligibility Check
      </h2>

      <form onSubmit={handleCheck}>
        {/* ── Provider ───────────────────────────────────────────────────── */}
        <Section title="Provider">
          <Row>
            <Field label="Provider NPI *" value={form.providerNpi} onChange={set('providerNpi')}
              placeholder="10-digit NPI" required pattern="\d{10}" />
            <Field label="Organization Name" value={form.providerOrg} onChange={set('providerOrg')}
              placeholder="Practice name" />
          </Row>
        </Section>

        {/* ── Payer ──────────────────────────────────────────────────────── */}
        <Section title="Payer">
          <Row>
            <Field label="Payer ID *" value={form.payerId} onChange={set('payerId')}
              placeholder="e.g. BCBSTX" required />
          </Row>
        </Section>

        {/* ── Subscriber ─────────────────────────────────────────────────── */}
        <Section title="Subscriber / Patient">
          <Row>
            <Field label="Last Name *" value={form.subscriberLastName} onChange={set('subscriberLastName')} required />
            <Field label="First Name *" value={form.subscriberFirstName} onChange={set('subscriberFirstName')} required />
          </Row>
          <Row>
            <Field label="Member ID *" value={form.memberId} onChange={set('memberId')}
              placeholder="Insurance member ID" required />
            <Field label="Date of Birth *" value={form.subscriberDob} onChange={set('subscriberDob')}
              type="date" required />
          </Row>
          <Row>
            <div style={fieldWrap}>
              <label style={labelStyle}>Gender</label>
              <select value={form.subscriberGender} onChange={set('subscriberGender')} style={inputStyle}>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="U">Unknown</option>
              </select>
            </div>
            <Field label="Date of Service" value={form.dateOfService} onChange={set('dateOfService')}
              type="date" />
          </Row>
        </Section>

        {/* ── Service Type ───────────────────────────────────────────────── */}
        <Section title="Service Type">
          <Row>
            <div style={fieldWrap}>
              <label style={labelStyle}>Service Type Code</label>
              <select value={form.serviceTypeCode} onChange={set('serviceTypeCode')} style={inputStyle}>
                {SERVICE_TYPES.map(st => (
                  <option key={st.code} value={st.code}>{st.code} — {st.label}</option>
                ))}
              </select>
            </div>
          </Row>
        </Section>

        <button type="submit" disabled={loading} style={btnStyle(loading)}>
          {loading ? 'Checking…' : 'Check Eligibility'}
        </button>
      </form>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ marginTop: 20, padding: 14, background: '#fee2e2', borderRadius: 8,
          color: '#7f1d1d', fontSize: 14 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* ── Result ────────────────────────────────────────────────────────── */}
      {result && (
        <div style={{ marginTop: 24 }}>
          {/* Status Banner */}
          <div style={{
            padding: '12px 16px', borderRadius: 8, marginBottom: 16,
            background: style.bg, border: `1px solid ${style.border}`, color: style.text,
            fontWeight: 700, fontSize: 15,
          }}>
            {style.label} — {result.planDescription || 'Insurance Plan'}
          </div>

          {/* Member Info */}
          <InfoGrid title="Member Information" items={[
            ['Member Name',   result.memberName],
            ['Member ID',     result.memberId],
            ['Group Number',  result.groupNumber || '—'],
            ['Coverage Start',result.coverageStart || '—'],
            ['Coverage End',  result.coverageEnd  || '—'],
            ['Checked At',    new Date(result.checkedAt).toLocaleString()],
          ]} />

          {/* Benefits */}
          <InfoGrid title="Benefits Summary" items={[
            ['Deductible (Annual)',      fmtBenefit(result.deductible)],
            ['Deductible Met',           fmtBenefit(result.deductibleMet)],
            ['Out-of-Pocket Max',        fmtBenefit(result.outOfPocket)],
            ['Out-of-Pocket Met',        fmtBenefit(result.outOfPocketMet)],
            ['Copay',                    fmtBenefit(result.copay)],
            ['Coinsurance',              fmtBenefit(result.coinsurance)],
          ].filter(([, v]) => v && v !== '—')} />

          {/* Raw benefits accordion */}
          {result.rawBenefits?.length > 0 && (
            <RawBenefits benefits={result.rawBenefits} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div>;
}

function Field({ label, value, onChange, required, placeholder, type = 'text', pattern }) {
  return (
    <div style={fieldWrap}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={onChange} required={required}
        placeholder={placeholder} pattern={pattern} style={inputStyle} />
    </div>
  );
}

function InfoGrid({ title, items }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {items.map(([k, v]) => (
          <div key={k} style={{ background: '#f8fafc', borderRadius: 6, padding: '8px 12px' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'block' }}>{k}</span>
            <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RawBenefits({ benefits }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(o => !o)} type="button"
        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer',
          fontSize: 13, padding: 0 }}>
        {open ? '▲ Hide' : '▼ Show'} full benefits detail ({benefits.length} items)
      </button>
      {open && (
        <pre style={{ marginTop: 8, padding: 12, background: '#f1f5f9', borderRadius: 8,
          fontSize: 11, overflow: 'auto', maxHeight: 300, color: '#334155' }}>
          {JSON.stringify(benefits, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildPayload(form) {
  return {
    provider   : { npi: form.providerNpi, organizationName: form.providerOrg },
    payer      : { payerId: form.payerId },
    subscriber : {
      memberId   : form.memberId,
      firstName  : form.subscriberFirstName,
      lastName   : form.subscriberLastName,
      dob        : form.subscriberDob,
      gender     : form.subscriberGender,
    },
    serviceTypeCodes: [form.serviceTypeCode],
    dateOfService   : form.dateOfService,
  };
}

function prefill(patient) {
  const pi   = patient.patient_info || patient;
  const ins  = patient.insurance?.primaryPayer || {};
  const prov = patient.provider || {};
  return {
    ...EMPTY_FORM,
    providerNpi         : prov.npi              || '',
    providerOrg         : prov.organizationName || '',
    payerId             : ins.payerId           || '',
    memberId            : ins.memberId          || '',
    subscriberFirstName : pi.first_name         || '',
    subscriberLastName  : pi.last_name          || '',
    subscriberDob       : pi.birth_date         || '',
    subscriberGender    : (pi.gender || 'U').charAt(0).toUpperCase(),
  };
}

function fmtBenefit(b) {
  if (!b) return null;
  if (b.amount)  return `$${parseFloat(b.amount).toLocaleString()} ${b.inNetwork ? '(In-Network)' : ''}`.trim();
  if (b.percent) return `${b.percent}%${b.inNetwork ? ' (In-Network)' : ''}`;
  return '—';
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const cardStyle = {
  maxWidth: 760, margin: '0 auto', padding: 28,
  background: '#fff', borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,.1), 0 4px 16px rgba(0,0,0,.06)',
  fontFamily: 'system-ui, -apple-system, sans-serif',
};
const fieldWrap = { flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: 4 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#475569' };
const inputStyle = {
  padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1',
  fontSize: 14, color: '#1e293b', outline: 'none', width: '100%', boxSizing: 'border-box',
};
const btnStyle = (loading) => ({
  marginTop: 8, padding: '10px 28px', borderRadius: 8, border: 'none',
  background: loading ? '#94a3b8' : '#3b82f6', color: '#fff',
  fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
});

const SERVICE_TYPES = [
  { code: '30', label: 'Health Benefit Plan Coverage (General)' },
  { code: '1',  label: 'Medical Care' },
  { code: 'MH', label: 'Mental Health' },
  { code: '80', label: 'Psychiatric — Outpatient' },
  { code: 'A6', label: 'Psychotherapy' },
  { code: 'AF', label: 'Speech Therapy — Outpatient' },
  { code: 'AE', label: 'Physical Therapy — Outpatient' },
  { code: 'AD', label: 'Occupational Therapy — Outpatient' },
  { code: '48', label: 'Hospital — Outpatient' },
  { code: '47', label: 'Hospital — Inpatient' },
  { code: '86', label: 'Emergency Services' },
  { code: '88', label: 'Pharmacy' },
];
