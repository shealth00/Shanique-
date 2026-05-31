import React, { useState } from 'react';
import Dashboard         from './components/Dashboard';
import PatientList       from './components/PatientList';
import EligibilityCheck  from './components/EligibilityCheck';
import ClaimSubmission   from './components/ClaimSubmission';

const NAV = [
  { key: 'dashboard',   label: 'Dashboard'   },
  { key: 'patients',    label: 'Patients'     },
  { key: 'eligibility', label: 'Eligibility'  },
  { key: 'claims',      label: 'Claims'       },
];

export default function App() {
  const [page, setPage]               = useState('dashboard');
  const [patients, setPatients]       = useState([]);
  const [selectedPatient, setSelected] = useState(null);

  const current = patients.find(p => p.id === selectedPatient) || null;

  const openPatient = (id, dest = 'patients') => {
    setSelected(id);
    setPage(dest);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui,-apple-system,sans-serif' }}>
      {/* ── Top bar ── */}
      <header style={{ background: '#1e3a5f', color: '#fff', padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 32, height: 56, boxShadow: '0 2px 8px rgba(0,0,0,.25)' }}>
        <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>
          Integrated Healthcare EHR
        </span>
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV.map(n => (
            <button key={n.key} onClick={() => setPage(n.key)} style={{
              background: page === n.key ? 'rgba(255,255,255,.18)' : 'transparent',
              border: 'none', color: '#fff', padding: '6px 16px', borderRadius: 6,
              cursor: 'pointer', fontWeight: page === n.key ? 700 : 400, fontSize: 14,
            }}>{n.label}</button>
          ))}
        </nav>
      </header>

      {/* ── Page content ── */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
        {page === 'dashboard' && (
          <Dashboard patients={patients} onOpenPatient={openPatient} />
        )}
        {page === 'patients' && (
          <PatientList
            patients={patients}
            setPatients={setPatients}
            selectedId={selectedPatient}
            setSelected={setSelected}
            onGoToEligibility={id => openPatient(id, 'eligibility')}
            onGoToClaims={id => openPatient(id, 'claims')}
          />
        )}
        {page === 'eligibility' && (
          <EligibilityCheck prefillPatient={current} />
        )}
        {page === 'claims' && (
          <ClaimSubmission patient={current} />
        )}
      </main>
    </div>
  );
}
