import React, { useState } from 'react';

const BLANK = {
  patient_info: {
    first_name: '', last_name: '', birth_date: '', gender: 'Female',
    city: '', state: '', zip: '', phone: '',
    address: { street: '', city: '', state: '', zip: '' },
  },
  insurance: {
    primaryPayer: { payerId: '', name: '', memberId: '', groupNumber: '', relationshipCode: '18' },
    secondaryPayer: { payerId: '', name: '', memberId: '' },
  },
  provider: {
    npi: '', organizationName: '', taxId: '', taxonomyCode: '103T00000X',
    phone: '',
    address: { street: '', city: '', state: 'TX', zip: '' },
  },
  referral_info: {
    reason_for_evaluation: '', referral_source: '',
    evaluation_date: today(), report_date: today(),
  },
  diagnoses: [],
  claims: [],
  eligibilityChecks: [],
};

export default function PatientForm({ initial, onSave, onCancel }) {
  const [data, setData] = useState(initial ? merge(BLANK, initial) : BLANK);
  const [tab,  setTab]  = useState('demographics');

  const set = (path, value) => {
    setData(prev => setPath(prev, path.split('.'), value));
  };

  const addDiagnosis = () =>
    setData(prev => ({ ...prev, diagnoses: [...prev.diagnoses, { code: '', description: '' }] }));

  const updateDiag = (i, field, v) =>
    setData(prev => {
      const d = [...prev.diagnoses];
      d[i] = { ...d[i], [field]: v };
      return { ...prev, diagnoses: d };
    });

  const removeDiag = (i) =>
    setData(prev => ({ ...prev, diagnoses: prev.diagnoses.filter((_, j) => j !== i) }));

  const save = (e) => {
    e.preventDefault();
    onSave(data);
  };

  const TABS = [
    { key: 'demographics', label: 'Demographics' },
    { key: 'insurance',    label: 'Insurance'    },
    { key: 'provider',     label: 'Provider'     },
    { key: 'clinical',     label: 'Clinical'     },
  ];

  return (
    <form onSubmit={save} style={{ background: '#fff', borderRadius: 12, padding: 28,
      boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' }}>
          {initial ? 'Edit Patient' : 'New Patient'}
        </h2>
        <button type="button" onClick={onCancel} style={ghostBtn}>Cancel</button>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} style={{
            padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: tab === t.key ? 700 : 400, fontSize: 14,
            color: tab === t.key ? '#3b82f6' : '#64748b',
            borderBottom: tab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
            marginBottom: -1,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'demographics' && (
        <Section>
          <Row>
            <Field label="First Name *" value={data.patient_info.first_name} onChange={v => set('patient_info.first_name', v)} required />
            <Field label="Last Name *"  value={data.patient_info.last_name}  onChange={v => set('patient_info.last_name', v)}  required />
          </Row>
          <Row>
            <Field label="Date of Birth *" type="date" value={data.patient_info.birth_date} onChange={v => set('patient_info.birth_date', v)} required />
            <SelectField label="Gender" value={data.patient_info.gender} onChange={v => set('patient_info.gender', v)}
              options={['Female', 'Male', 'Unknown']} />
          </Row>
          <Row>
            <Field label="Street Address" value={data.patient_info.address?.street || ''} onChange={v => set('patient_info.address.street', v)} />
            <Field label="City"  value={data.patient_info.address?.city  || ''} onChange={v => set('patient_info.address.city', v)} />
          </Row>
          <Row>
            <Field label="State" value={data.patient_info.address?.state || ''} onChange={v => set('patient_info.address.state', v)} maxLength={2} />
            <Field label="ZIP"   value={data.patient_info.address?.zip   || ''} onChange={v => set('patient_info.address.zip', v)} />
            <Field label="Phone" value={data.patient_info.phone || ''} onChange={v => set('patient_info.phone', v)} />
          </Row>
        </Section>
      )}

      {tab === 'insurance' && (
        <Section>
          <p style={sectionLabel}>Primary Insurance</p>
          <Row>
            <Field label="Payer ID *"   value={data.insurance.primaryPayer.payerId}     onChange={v => set('insurance.primaryPayer.payerId', v)} placeholder="e.g. BCBSTX" />
            <Field label="Payer Name"   value={data.insurance.primaryPayer.name}        onChange={v => set('insurance.primaryPayer.name', v)} />
          </Row>
          <Row>
            <Field label="Member ID *"  value={data.insurance.primaryPayer.memberId}    onChange={v => set('insurance.primaryPayer.memberId', v)} />
            <Field label="Group Number" value={data.insurance.primaryPayer.groupNumber} onChange={v => set('insurance.primaryPayer.groupNumber', v)} />
          </Row>
          <Row>
            <SelectField label="Relationship to Insured" value={data.insurance.primaryPayer.relationshipCode}
              onChange={v => set('insurance.primaryPayer.relationshipCode', v)}
              options={[
                { value: '18', label: 'Self' },
                { value: '01', label: 'Spouse' },
                { value: '19', label: 'Child' },
                { value: '20', label: 'Employee' },
                { value: 'G8', label: 'Other' },
              ]} />
          </Row>
          <p style={{ ...sectionLabel, marginTop: 20 }}>Secondary Insurance (optional)</p>
          <Row>
            <Field label="Payer ID"   value={data.insurance.secondaryPayer?.payerId  || ''} onChange={v => set('insurance.secondaryPayer.payerId', v)} />
            <Field label="Payer Name" value={data.insurance.secondaryPayer?.name     || ''} onChange={v => set('insurance.secondaryPayer.name', v)} />
            <Field label="Member ID"  value={data.insurance.secondaryPayer?.memberId || ''} onChange={v => set('insurance.secondaryPayer.memberId', v)} />
          </Row>
        </Section>
      )}

      {tab === 'provider' && (
        <Section>
          <p style={sectionLabel}>Billing / Rendering Provider</p>
          <Row>
            <Field label="Organization Name" value={data.provider.organizationName} onChange={v => set('provider.organizationName', v)} />
            <Field label="NPI *" value={data.provider.npi} onChange={v => set('provider.npi', v)} placeholder="10-digit NPI" pattern="\d{10}" required />
          </Row>
          <Row>
            <Field label="Tax ID (EIN)" value={data.provider.taxId}        onChange={v => set('provider.taxId', v)} placeholder="9 digits" />
            <Field label="Taxonomy Code" value={data.provider.taxonomyCode} onChange={v => set('provider.taxonomyCode', v)} placeholder="e.g. 103T00000X" />
            <Field label="Phone" value={data.provider.phone || ''} onChange={v => set('provider.phone', v)} />
          </Row>
          <Row>
            <Field label="Street" value={data.provider.address?.street || ''} onChange={v => set('provider.address.street', v)} />
            <Field label="City"   value={data.provider.address?.city   || ''} onChange={v => set('provider.address.city', v)} />
          </Row>
          <Row>
            <Field label="State" value={data.provider.address?.state || 'TX'} onChange={v => set('provider.address.state', v)} maxLength={2} />
            <Field label="ZIP"   value={data.provider.address?.zip   || ''}   onChange={v => set('provider.address.zip', v)} />
          </Row>
        </Section>
      )}

      {tab === 'clinical' && (
        <Section>
          <Row>
            <Field label="Referral Source" value={data.referral_info.referral_source}
              onChange={v => set('referral_info.referral_source', v)} />
            <Field label="Evaluation Date" type="date" value={data.referral_info.evaluation_date}
              onChange={v => set('referral_info.evaluation_date', v)} />
          </Row>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Reason for Evaluation</label>
            <textarea value={data.referral_info.reason_for_evaluation}
              onChange={e => set('referral_info.reason_for_evaluation', e.target.value)}
              rows={3} style={{ ...inputStyle, width: '100%' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
            <p style={{ ...sectionLabel, margin: 0 }}>Diagnoses (ICD-10)</p>
            <button type="button" onClick={addDiagnosis} style={{ ...ghostBtn, fontSize: 12 }}>+ Add</button>
          </div>
          {data.diagnoses.map((d, i) => (
            <Row key={i}>
              <Field label="ICD-10 Code" value={d.code} onChange={v => updateDiag(i, 'code', v)} placeholder="e.g. F84.0" />
              <Field label="Description" value={d.description} onChange={v => updateDiag(i, 'description', v)} />
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 2 }}>
                <button type="button" onClick={() => removeDiag(i)}
                  style={{ ...ghostBtn, color: '#ef4444', borderColor: '#ef4444' }}>Remove</button>
              </div>
            </Row>
          ))}
        </Section>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
        <button type="button" onClick={onCancel} style={ghostBtn}>Cancel</button>
        <button type="submit" style={primaryBtn}>Save Patient</button>
      </div>
    </form>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function Section({ children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>;
}
function Row({ children }) {
  return <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>{children}</div>;
}
function Field({ label, value, onChange, required, placeholder, type = 'text', pattern, maxLength }) {
  return (
    <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder} pattern={pattern}
        maxLength={maxLength} style={inputStyle} />
    </div>
  );
}
function SelectField({ label, value, onChange, options }) {
  return (
    <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
        {options.map(o =>
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const labelStyle  = { fontSize: 12, fontWeight: 600, color: '#475569' };
const inputStyle  = { padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#1e293b', width: '100%', boxSizing: 'border-box' };
const primaryBtn  = { padding: '9px 22px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const ghostBtn    = { padding: '8px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const sectionLabel = { margin: '0 0 8px', fontWeight: 700, fontSize: 13, color: '#1e293b' };

// ─── Helpers ───────────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0]; }

function setPath(obj, [head, ...tail], value) {
  return { ...obj, [head]: tail.length ? setPath(obj[head] ?? {}, tail, value) : value };
}

function merge(base, override) {
  if (!override) return base;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    out[k] = override[k] && typeof override[k] === 'object' && !Array.isArray(override[k])
      ? merge(base[k] ?? {}, override[k])
      : override[k];
  }
  return out;
}
