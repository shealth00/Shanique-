import React, { useState } from 'react';
import PatientForm from './PatientForm';

export default function PatientList({ patients, setPatients, selectedId, setSelected, onGoToEligibility, onGoToClaims }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const addPatient = (data) => {
    const p = { id: Date.now(), claims: [], eligibilityChecks: [], ...data };
    setPatients(prev => [...prev, p]);
    setSelected(p.id);
    setShowForm(false);
  };

  const updatePatient = (id, data) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
    setEditingId(null);
  };

  const deletePatient = (id) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    if (selectedId === id) setSelected(null);
  };

  const editing = patients.find(p => p.id === editingId);

  if (showForm || editingId) {
    return (
      <PatientForm
        initial={editing}
        onSave={editingId ? (d) => updatePatient(editingId, d) : addPatient}
        onCancel={() => { setShowForm(false); setEditingId(null); }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={h1}>Patients</h1>
        <button onClick={() => setShowForm(true)} style={primaryBtn}>+ New Patient</button>
      </div>

      {patients.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 48, textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,.08)', color: '#94a3b8' }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>No patients yet.</p>
          <button onClick={() => setShowForm(true)} style={primaryBtn}>Add Your First Patient</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {patients.map(p => {
            const pi  = p.patient_info || {};
            const ins = p.insurance?.primaryPayer;
            const lastCheck = (p.eligibilityChecks || []).slice(-1)[0];
            return (
              <div key={p.id} style={{
                background: '#fff', borderRadius: 12, padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,.08)',
                border: selectedId === p.id ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
              }} onClick={() => setSelected(p.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#1e293b' }}>
                      {pi.first_name} {pi.last_name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>
                      DOB: {pi.birth_date || '—'} &nbsp;|&nbsp; {pi.gender || '—'}
                      {ins?.payerId ? ` | ${ins.payerId}` : ' | No insurance on file'}
                    </p>
                    {lastCheck && (
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: lastCheck.coverageStatus === 'active' ? '#059669' : '#dc2626' }}>
                        Last eligibility: {lastCheck.coverageStatus?.toUpperCase()} — {new Date(lastCheck.checkedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <Btn label="Edit"        color="#64748b" onClick={e => { e.stopPropagation(); setEditingId(p.id); }} />
                    <Btn label="Eligibility" color="#3b82f6" onClick={e => { e.stopPropagation(); onGoToEligibility(p.id); }} />
                    <Btn label="Claim"       color="#8b5cf6" onClick={e => { e.stopPropagation(); onGoToClaims(p.id); }} />
                    <Btn label="Delete"      color="#ef4444" onClick={e => { e.stopPropagation(); deletePatient(p.id); }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Btn({ label, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 14px', borderRadius: 6, border: 'none', background: color,
      color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
    }}>{label}</button>
  );
}

const h1 = { margin: 0, fontSize: 24, fontWeight: 800, color: '#1e293b' };
const primaryBtn = {
  padding: '9px 20px', borderRadius: 8, border: 'none', background: '#3b82f6',
  color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
};
