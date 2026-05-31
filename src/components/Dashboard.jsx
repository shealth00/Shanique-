import React from 'react';

export default function Dashboard({ patients, onOpenPatient }) {
  const total        = patients.length;
  const withInsurance = patients.filter(p => p.insurance?.primaryPayer?.payerId).length;
  const withClaims    = patients.filter(p => (p.claims || []).length > 0).length;
  const recentChecks  = patients.flatMap(p =>
    (p.eligibilityChecks || []).map(c => ({ ...c, patientName: patientName(p) }))
  ).sort((a, b) => new Date(b.checkedAt) - new Date(a.checkedAt)).slice(0, 5);

  return (
    <div>
      <h1 style={h1}>Dashboard</h1>

      {/* ── Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <Stat label="Total Patients" value={total} color="#3b82f6" />
        <Stat label="With Insurance" value={withInsurance} color="#10b981" />
        <Stat label="Claims Submitted" value={withClaims} color="#8b5cf6" />
      </div>

      {/* ── Recent eligibility checks ── */}
      <Card title="Recent Eligibility Checks">
        {recentChecks.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 14 }}>No eligibility checks yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                {['Patient', 'Payer', 'Status', 'Checked'].map(h => (
                  <th key={h} style={{ padding: '6px 12px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentChecks.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={td}>{c.patientName}</td>
                  <td style={td}>{c.payerId}</td>
                  <td style={td}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                      background: c.coverageStatus === 'active' ? '#d1fae5' : '#fee2e2',
                      color     : c.coverageStatus === 'active' ? '#065f46' : '#7f1d1d',
                    }}>{c.coverageStatus?.toUpperCase()}</span>
                  </td>
                  <td style={td}>{c.checkedAt ? new Date(c.checkedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── Quick actions ── */}
      {patients.length > 0 && (
        <Card title="Patients">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {patients.slice(0, 8).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 8 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{patientName(p)}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <ActionBtn label="Eligibility" color="#3b82f6" onClick={() => onOpenPatient(p.id, 'eligibility')} />
                  <ActionBtn label="Claim"       color="#8b5cf6" onClick={() => onOpenPatient(p.id, 'claims')} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,.08)', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,.08)', marginBottom: 20 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{title}</h2>
      {children}
    </div>
  );
}

function ActionBtn({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: '4px 12px', borderRadius: 6, border: 'none',
      background: color, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
      {label}
    </button>
  );
}

const h1  = { margin: '0 0 20px', fontSize: 24, fontWeight: 800, color: '#1e293b' };
const td  = { padding: '8px 12px', color: '#334155' };

function patientName(p) {
  const pi = p.patient_info || p;
  return `${pi.first_name || pi.firstName || ''} ${pi.last_name || pi.lastName || ''}`.trim() || 'Unnamed';
}
