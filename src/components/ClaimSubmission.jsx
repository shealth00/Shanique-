import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

const PLACE_OF_SERVICE = [
  { code: '11', label: '11 — Office' },
  { code: '02', label: '02 — Telehealth (patient home)' },
  { code: '10', label: '10 — Telehealth (non-home)' },
  { code: '21', label: '21 — Inpatient Hospital' },
  { code: '22', label: '22 — Outpatient Hospital' },
  { code: '23', label: '23 — Emergency Room' },
];

// Common psych/behavioral health CPT codes
const QUICK_CODES = [
  { code: '90837', desc: 'Psychotherapy, 60 min',        fee: '180.00' },
  { code: '90834', desc: 'Psychotherapy, 45 min',        fee: '135.00' },
  { code: '90832', desc: 'Psychotherapy, 30 min',        fee: '90.00'  },
  { code: '90791', desc: 'Psychiatric diagnostic eval',  fee: '250.00' },
  { code: '96136', desc: 'Psych testing admin & scoring',fee: '200.00' },
  { code: '96130', desc: 'Psych testing evaluation',     fee: '150.00' },
  { code: '96132', desc: 'Neuropsych testing evaluation',fee: '175.00' },
  { code: '99213', desc: 'Office visit, E&M level 3',    fee: '110.00' },
];

const BLANK_LINE = { cptCode: '', description: '', charge: '', units: '1', dateOfService: today(), modifiers: '', diagnosisPointers: '1', placeOfServiceCode: '11' };

export default function ClaimSubmission({ patient }) {
  const [lines,       setLines]       = useState([{ ...BLANK_LINE }]);
  const [claimId,     setClaimId]     = useState(`CLM-${Date.now()}`);
  const [posCode,     setPosCode]     = useState('11');
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [error,       setError]       = useState(null);
  const [showEDI,     setShowEDI]     = useState(false);

  if (!patient) {
    return (
      <div style={emptyCard}>
        <p style={{ color: '#94a3b8', fontSize: 15 }}>Select a patient from the Patients tab to submit a claim.</p>
      </div>
    );
  }

  const pi  = patient.patient_info  || {};
  const ins = patient.insurance?.primaryPayer || {};
  const prov = patient.provider      || {};
  const diags = (patient.diagnoses || []).filter(d => d.code);

  const missingFields = [];
  if (!prov.npi)       missingFields.push('Provider NPI (edit patient → Provider tab)');
  if (!ins.payerId)    missingFields.push('Payer ID (edit patient → Insurance tab)');
  if (!ins.memberId)   missingFields.push('Member ID (edit patient → Insurance tab)');
  if (diags.length === 0) missingFields.push('At least one diagnosis (edit patient → Clinical tab)');

  const addLine  = () => setLines(l => [...l, { ...BLANK_LINE, dateOfService: today() }]);
  const removeLine = (i) => setLines(l => l.filter((_, j) => j !== i));
  const setLine = (i, field, value) =>
    setLines(l => l.map((ln, j) => j === i ? { ...ln, [field]: value } : ln));

  const quickFill = (i, qc) =>
    setLines(l => l.map((ln, j) => j === i ? { ...ln, cptCode: qc.code, charge: qc.fee } : ln));

  const totalCharge = lines.reduce((s, l) => s + (parseFloat(l.charge) || 0), 0).toFixed(2);

  const buildPayload = () => ({
    patient: { patient_info: pi, address: pi.address },
    billingInfo: {
      claimId,
      totalCharge,
      placeOfServiceCode : posCode,
      claimFrequencyCode : '1',
      primaryInsurance   : {
        memberId        : ins.memberId,
        groupNumber     : ins.groupNumber,
        relationshipCode: ins.relationshipCode || '18',
        insuredPerson   : {
          last_name  : pi.last_name,
          first_name : pi.first_name,
          birth_date : pi.birth_date,
          gender     : pi.gender,
          address    : pi.address,
        },
      },
      diagnoses: diags.map(d => ({ code: d.code })),
      serviceLines: lines.map(l => ({
        cptCode         : l.cptCode,
        charge          : l.charge,
        units           : l.units,
        dateOfService   : l.dateOfService,
        placeOfServiceCode: l.placeOfServiceCode || posCode,
        modifiers       : l.modifiers ? l.modifiers.split(',').map(m => m.trim()) : [],
        diagnosisPointers: l.diagnosisPointers ? l.diagnosisPointers.split(',').map(p => p.trim()) : ['1'],
      })),
    },
    provider: prov,
    payer: { name: ins.name || ins.payerId, payerId: ins.payerId },
  });

  const validate = async () => {
    setError(null);
    setResult(null);
    try {
      const res  = await fetch(`${API_BASE}/api/edi/837p/validate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (data.valid) {
        setResult({ type: 'validation', message: 'Claim validated successfully — ready to submit.' });
      } else {
        setError(data.errors?.join('\n') || 'Validation failed');
      }
    } catch (e) { setError(e.message); }
  };

  const submit = async () => {
    if (missingFields.length) return setError('Missing required fields:\n' + missingFields.join('\n'));
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const res  = await fetch(`${API_BASE}/api/edi/837p`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.errors?.join(', ') || data.error || `HTTP ${res.status}`);
      setResult({ type: 'success', claimId: data.claimId, ediContent: data.ediContent });
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <h1 style={h1}>Submit Claim — {pi.first_name} {pi.last_name}</h1>

      {/* ── Patient/insurance summary ── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <Info label="Member ID"   value={ins.memberId  || '—'} />
          <Info label="Payer ID"    value={ins.payerId   || '—'} />
          <Info label="Group #"     value={ins.groupNumber || '—'} />
          <Info label="Provider NPI" value={prov.npi     || '—'} />
          <Info label="Diagnoses"   value={diags.map(d => d.code).join(', ') || '—'} />
          <Info label="Claim ID"    value={claimId} />
        </div>
      </div>

      {/* ── Missing fields warning ── */}
      {missingFields.length > 0 && (
        <div style={{ ...alertBox, background: '#fffbeb', border: '1px solid #fbbf24', color: '#92400e', marginBottom: 16 }}>
          <strong>Complete patient record before submitting:</strong>
          <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
            {missingFields.map(f => <li key={f} style={{ fontSize: 13 }}>{f}</li>)}
          </ul>
        </div>
      )}

      {/* ── Claim settings ── */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Claim ID</label>
            <input value={claimId} onChange={e => setClaimId(e.target.value)} style={inputStyle} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Place of Service</label>
            <select value={posCode} onChange={e => setPosCode(e.target.value)} style={inputStyle}>
              {PLACE_OF_SERVICE.map(p => <option key={p.code} value={p.code}>{p.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Service lines ── */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e293b' }}>Service Lines</h3>
          <button type="button" onClick={addLine} style={ghostBtn}>+ Add Line</button>
        </div>

        {lines.map((line, i) => (
          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>Line {i + 1}</span>
              {lines.length > 1 && (
                <button type="button" onClick={() => removeLine(i)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 12 }}>
                  Remove
                </button>
              )}
            </div>

            {/* Quick-fill CPT buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {QUICK_CODES.map(qc => (
                <button key={qc.code} type="button" onClick={() => quickFill(i, qc)} style={{
                  padding: '3px 10px', fontSize: 11, borderRadius: 6, border: '1px solid #cbd5e1',
                  background: line.cptCode === qc.code ? '#3b82f6' : '#f8fafc',
                  color: line.cptCode === qc.code ? '#fff' : '#475569', cursor: 'pointer',
                }}>{qc.code}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <LineField label="CPT Code *"     value={line.cptCode}     onChange={v => setLine(i, 'cptCode', v)} placeholder="5-char" style={{ flex: '0 0 100px' }} />
              <LineField label="Charge ($) *"   value={line.charge}      onChange={v => setLine(i, 'charge', v)} placeholder="0.00" style={{ flex: '0 0 100px' }} />
              <LineField label="Units"          value={line.units}       onChange={v => setLine(i, 'units', v)} style={{ flex: '0 0 60px' }} />
              <LineField label="Date of Service" type="date" value={line.dateOfService} onChange={v => setLine(i, 'dateOfService', v)} style={{ flex: '0 0 160px' }} />
              <LineField label="Modifiers (comma sep)" value={line.modifiers} onChange={v => setLine(i, 'modifiers', v)} placeholder="e.g. GT,95" />
              <LineField label="Dx Pointers"    value={line.diagnosisPointers} onChange={v => setLine(i, 'diagnosisPointers', v)} placeholder="1,2" style={{ flex: '0 0 90px' }} />
            </div>
          </div>
        ))}

        <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 15, color: '#1e293b', marginTop: 4 }}>
          Total: ${parseFloat(totalCharge).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={validate} disabled={submitting} style={ghostBtn}>Validate Only</button>
        <button onClick={submit}   disabled={submitting || missingFields.length > 0} style={{
          ...primaryBtn, opacity: (submitting || missingFields.length > 0) ? 0.6 : 1,
        }}>
          {submitting ? 'Submitting…' : 'Submit Claim (837P)'}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ ...alertBox, background: '#fee2e2', border: '1px solid #f87171', color: '#7f1d1d', marginTop: 16 }}>
          <strong>Error</strong>
          <pre style={{ margin: '6px 0 0', fontSize: 12, whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {/* ── Success / Validation result ── */}
      {result && (
        <div style={{ ...alertBox, background: '#d1fae5', border: '1px solid #34d399', color: '#065f46', marginTop: 16 }}>
          {result.type === 'validation' ? (
            <p style={{ margin: 0, fontWeight: 700 }}>{result.message}</p>
          ) : (
            <>
              <p style={{ margin: 0, fontWeight: 700 }}>Claim submitted — ID: {result.claimId}</p>
              <button onClick={() => setShowEDI(s => !s)} style={{ marginTop: 8, background: 'none', border: 'none',
                color: '#065f46', cursor: 'pointer', fontSize: 12, textDecoration: 'underline' }}>
                {showEDI ? 'Hide' : 'Show'} raw EDI X12
              </button>
              {showEDI && (
                <pre style={{ marginTop: 8, padding: 12, background: '#ecfdf5', borderRadius: 8,
                  fontSize: 11, overflow: 'auto', maxHeight: 320, color: '#134e4a' }}>
                  {result.ediContent}
                </pre>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Small components ─────────────────────────────────────────────────────────
function Info({ label, value }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{label}</p>
      <p style={{ margin: '2px 0 0', fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{value}</p>
    </div>
  );
}
function LineField({ label, value, onChange, placeholder, type = 'text', style: s = {} }) {
  return (
    <div style={{ flex: '1 1 120px', display: 'flex', flexDirection: 'column', gap: 3, ...s }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} style={{ padding: '6px 8px', borderRadius: 6,
          border: '1px solid #cbd5e1', fontSize: 13, width: '100%', boxSizing: 'border-box' }} />
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const h1        = { margin: '0 0 20px', fontSize: 24, fontWeight: 800, color: '#1e293b' };
const card      = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.08)' };
const alertBox  = { borderRadius: 10, padding: '12px 16px' };
const fieldWrap = { flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: 4 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#475569' };
const inputStyle = { padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, color: '#1e293b', width: '100%', boxSizing: 'border-box' };
const primaryBtn = { padding: '9px 22px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const ghostBtn   = { padding: '8px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const emptyCard  = { background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,.08)' };

function today() { return new Date().toISOString().split('T')[0]; }
