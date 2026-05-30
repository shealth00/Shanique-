import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Play, Loader, ShieldCheck } from 'lucide-react';
import EligibilityCheck from './src/components/EligibilityCheck';

/**
 * Psychological Evaluation Report Generation System
 * Multi-agent system for generating comprehensive psychological evaluation reports
 */

export default function PsychReportGenerator() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [generatingReports, setGeneratingReports] = useState({});
  const [completedReports, setCompletedReports] = useState({});
  const [activeTab, setActiveTab] = useState('patients');

  // Agent system configuration
  const AGENTS = {
    caregiver_interview: {
      name: 'Caregiver Interview',
      description: 'Generates detailed caregiver interview narrative',
      section: 'CAREGIVER INTERVIEW'
    },
    behavioral_observations: {
      name: 'Behavioral Observations',
      description: 'Creates behavioral observation section from testing',
      section: 'BEHAVIORAL OBSERVATIONS'
    },
    test_results: {
      name: 'Test Results Interpreter',
      description: 'Generates test result interpretations and analyses',
      section: 'TEST RESULTS'
    },
    diagnostic_summary: {
      name: 'Diagnostic Summary',
      description: 'Synthesizes data into clinical impressions and diagnoses',
      section: 'SUMMARY/CLINICAL IMPRESSIONS'
    },
    recommendations: {
      name: 'Recommendations Generator',
      description: 'Creates evidence-based, tailored recommendations',
      section: 'RECOMMENDATIONS'
    }
  };

  // Default patient template
  const DEFAULT_PATIENT = {
    patient_info: {
      first_name: '',
      last_name: '',
      birth_date: '',
      age_years: 0,
      age_months: 0,
      gender: 'Male',
      city: '',
      state: ''
    },
    family_info: {
      parents: [],
      siblings: [],
      household_members: 0,
      family_history: []
    },
    referral_info: {
      referral_source: '',
      reason_for_evaluation: '',
      primary_concerns: [],
      evaluation_date: new Date().toISOString().split('T')[0],
      report_date: new Date().toISOString().split('T')[0]
    },
    developmental_history: {
      birth_type: 'full-term',
      weeks_gestation: 40,
      birth_method: 'vaginal',
      motor_milestones: {
        crawling_months: 6,
        walking_months: 12
      },
      language_milestones: {
        first_word_months: 12,
        first_sentences_years: 2,
        current_language_level: ''
      }
    },
    medical_history: {
      current_medications: [],
      chronic_conditions: [],
      allergies: [],
      sleep_patterns: '',
      appetite: ''
    },
    behavioral_observations: {
      appearance: '',
      eye_contact: '',
      affect: '',
      cooperation_level: '',
      activity_level: '',
      notable_behaviors: []
    },
    test_results: [],
    diagnoses: [],
    strengths: [],
    recommendations_focus: []
  };

  // Add new patient
  const addPatient = () => {
    const newPatient = {
      id: Date.now(),
      ...DEFAULT_PATIENT
    };
    setPatients([...patients, newPatient]);
    setSelectedPatient(newPatient.id);
  };

  // Update patient data
  const updatePatient = (id, field, value) => {
    setPatients(patients.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
    if (selectedPatient === id) {
      setSelectedPatient(id); // Trigger re-render
    }
  };

  // Delete patient
  const deletePatient = (id) => {
    setPatients(patients.filter(p => p.id !== id));
    if (selectedPatient === id) {
      setSelectedPatient(patients[0]?.id || null);
    }
  };

  // Generate report section using Claude API
  const generateReportSection = async (patientId, agentType) => {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    setGeneratingReports(prev => ({
      ...prev,
      [agentType]: true
    }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: buildAgentPrompt(agentType, patient)
            }
          ]
        })
      });

      const data = await response.json();
      const generatedContent = data.content[0].text;

      setCompletedReports(prev => ({
        ...prev,
        [patientId]: {
          ...prev[patientId],
          [agentType]: generatedContent
        }
      }));
    } catch (error) {
      console.error(`Error generating ${agentType}:`, error);
      alert(`Error generating report section: ${error.message}`);
    } finally {
      setGeneratingReports(prev => ({
        ...prev,
        [agentType]: false
      }));
    }
  };

  // Build agent-specific prompt
  const buildAgentPrompt = (agentType, patient) => {
    const basePrompt = `You are a clinical psychologist writing a comprehensive psychological evaluation report. 
    
Patient Data:
${JSON.stringify(patient, null, 2)}

`;

    const agentPrompts = {
      caregiver_interview: `${basePrompt}
Generate the "CAREGIVER INTERVIEW" section of the psychological evaluation. This should include:
1. Family composition and living situation
2. Family history and psychosocial stressors
3. Birth and medical history
4. Developmental milestones (motor, language, social)
5. Current functioning (sleep, appetite, vision/hearing)
6. Communication abilities and language development
7. Educational history and services
8. Behavioral and social concerns
9. ASD-related concerns if applicable (social, sensory, repetitive behaviors)

Write in professional clinical language with specific examples. Make it 2-3 pages of detailed narrative.`,

      behavioral_observations: `${basePrompt}
Generate the "BEHAVIORAL OBSERVATIONS" section describing how the patient presented during testing. Include:
1. Appearance and grooming
2. Hearing and vision adequacy
3. Communication style and language use
4. Eye contact patterns and affect
5. Cooperation and compliance during testing
6. Activity level and attention
7. Any unusual or notable behaviors
8. Modifications made to accommodate the patient
9. Overall validity of testing results

Be specific with concrete examples of behaviors observed.`,

      test_results: `${basePrompt}
Generate interpretations for the test results provided. For each test:
1. Briefly describe the test purpose
2. Report composite/full-scale scores with percentiles
3. Describe performance using clinical descriptors (Average, Low Average, etc.)
4. Note patterns in subtest scores (strengths/weaknesses)
5. Provide clinical interpretation in context of other findings
6. Note behavioral observations during administration

Make interpretations clear for both professionals and parents.`,

      diagnostic_summary: `${basePrompt}
Generate a "SUMMARY/CLINICAL IMPRESSIONS" section that:
1. Restates the reason for evaluation
2. Summarizes key behavioral observations
3. Reviews significant test findings
4. Discusses each diagnosis with supporting evidence
5. Addresses differential diagnoses
6. Describes functional impact across settings
7. Notes severity levels
8. Identifies strengths and protective factors

Create a cohesive narrative explaining the clinical picture and diagnoses.`,

      recommendations: `${basePrompt}
Generate detailed, evidence-based RECOMMENDATIONS including:
1. Educational interventions and accommodations
2. Therapeutic services (ABA, speech, OT, PT if relevant)
3. Classroom modifications and supports
4. Home-based interventions and parenting strategies
5. Family support and respite services
6. Medical/medication consultation
7. Social skills and adaptive functioning training
8. Community resources and support groups
9. Monitoring and follow-up timeline
10. Practical, actionable next steps

Provide 25-30 numbered recommendations specific to this patient.`
    };

    return agentPrompts[agentType] || basePrompt;
  };

  // Generate complete report
  const generateCompleteReport = async (patientId) => {
    const agentSequence = [
      'caregiver_interview',
      'behavioral_observations',
      'test_results',
      'diagnostic_summary',
      'recommendations'
    ];

    for (const agent of agentSequence) {
      await generateReportSection(patientId, agent);
      // Small delay between API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    alert('Report generation complete! You can now review and export the sections.');
  };

  // Export report to document
  const exportReport = async (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    const report = completedReports[patientId];

    if (!report || !patient) {
      alert('No report sections generated yet.');
      return;
    }

    let fullReport = `
IRBY PSYCHOLOGICAL SERVICES
Psychology • Counseling • Applied Behavior Analysis
Speech Therapy • Occupational Therapy

CONFIDENTIAL PSYCHOLOGICAL EVALUATION

Client Name: ${patient.patient_info.first_name} ${patient.patient_info.last_name}
Birth Date: ${patient.patient_info.birth_date}
Age: ${patient.patient_info.age_years} years, ${patient.patient_info.age_months} months
Sex: ${patient.patient_info.gender}
Evaluation Date: ${patient.referral_info.evaluation_date}
Date of Report: ${patient.referral_info.report_date}

---

REASON FOR EVALUATION:
${patient.referral_info.reason_for_evaluation}

---

${report.caregiver_interview || ''}

---

${report.behavioral_observations || ''}

---

${report.test_results || ''}

---

${report.diagnostic_summary || ''}

---

${report.recommendations || ''}

---

Report generated using Irby Psychological Services Report Generation System
Licensed psychologist review and signature required before distribution.
`;

    // Create and download file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fullReport));
    element.setAttribute('download', `${patient.patient_info.last_name}_${patient.patient_info.first_name}_Evaluation.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const currentPatient = patients.find(p => p.id === selectedPatient);
  const patientReports = completedReports[selectedPatient] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Psychological Evaluation Report Generator
          </h1>
          <p className="text-gray-600">
            Multi-agent system for generating comprehensive psychological assessment reports
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Patient List */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Patients</h2>
                <button
                  onClick={addPatient}
                  className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition"
                  title="Add new patient"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {patients.map(patient => (
                  <div
                    key={patient.id}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedPatient === patient.id
                        ? 'bg-blue-100 border-2 border-blue-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div onClick={() => setSelectedPatient(patient.id)}>
                      <p className="font-semibold text-gray-800">
                        {patient.patient_info.first_name || 'New Patient'} {patient.patient_info.last_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Age: {patient.patient_info.age_years}y {patient.patient_info.age_months}m
                      </p>
                    </div>
                    <button
                      onClick={() => deletePatient(patient.id)}
                      className="mt-2 text-red-500 hover:text-red-700 text-sm"
                    >
                      <Trash2 size={16} className="inline" /> Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle Panel - Tabs + Content */}
          <div className="col-span-2">
            {/* Tab Bar */}
            {currentPatient && (
              <div className="flex gap-1 mb-4 bg-white rounded-lg shadow p-1">
                {[
                  { key: 'patients',    label: 'Patient Info',       icon: null },
                  { key: 'eligibility', label: 'Eligibility Check',  icon: <ShieldCheck size={15} /> },
                  { key: 'report',      label: 'Report',             icon: null },
                ].map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded text-sm font-medium transition ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Eligibility Tab */}
            {currentPatient && activeTab === 'eligibility' && (
              <EligibilityCheck prefillPatient={currentPatient} />
            )}

            {/* Report Tab */}
            {currentPatient && activeTab === 'report' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Report Generation Agents</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click "Generate" to create each report section using AI agents
                  </p>
                  <button
                    onClick={() => generateCompleteReport(currentPatient.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 flex items-center justify-center gap-2"
                  >
                    <Play size={18} /> Generate Complete Report
                  </button>
                  <div className="space-y-3">
                    {Object.entries(AGENTS).map(([key, agent]) => (
                      <div key={key} className="border border-gray-300 rounded p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-gray-800">{agent.name}</h4>
                            <p className="text-sm text-gray-600">{agent.description}</p>
                          </div>
                          <button
                            onClick={() => generateReportSection(currentPatient.id, key)}
                            disabled={generatingReports[key]}
                            className="ml-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                          >
                            {generatingReports[key] ? (
                              <><Loader size={14} className="animate-spin" /> Generating...</>
                            ) : (
                              <><Play size={14} /> Generate</>
                            )}
                          </button>
                        </div>
                        {patientReports[key] && (
                          <div className="mt-3 bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-700 font-semibold mb-2">✓ Generated</p>
                            <p className="text-xs text-gray-700 line-clamp-3">
                              {patientReports[key].substring(0, 150)}...
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {Object.keys(patientReports).length > 0 && (
                  <button
                    onClick={() => exportReport(currentPatient.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2"
                  >
                    <Download size={20} /> Export Report
                  </button>
                )}
              </div>
            )}

            {currentPatient && activeTab === 'patients' && (
              <div className="space-y-4">
                {/* Patient Info Form */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Patient Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={currentPatient.patient_info.first_name}
                      onChange={(e) => {
                        const updated = { ...currentPatient };
                        updated.patient_info.first_name = e.target.value;
                        updatePatient(currentPatient.id, 'patient_info', updated.patient_info);
                      }}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={currentPatient.patient_info.last_name}
                      onChange={(e) => {
                        const updated = { ...currentPatient };
                        updated.patient_info.last_name = e.target.value;
                        updatePatient(currentPatient.id, 'patient_info', updated.patient_info);
                      }}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="date"
                      value={currentPatient.patient_info.birth_date}
                      onChange={(e) => {
                        const updated = { ...currentPatient };
                        updated.patient_info.birth_date = e.target.value;
                        updatePatient(currentPatient.id, 'patient_info', updated.patient_info);
                      }}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <select
                      value={currentPatient.patient_info.gender}
                      onChange={(e) => {
                        const updated = { ...currentPatient };
                        updated.patient_info.gender = e.target.value;
                        updatePatient(currentPatient.id, 'patient_info', updated.patient_info);
                      }}
                      className="border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <input
                      type="text"
                      placeholder="City"
                      value={currentPatient.patient_info.city}
                      onChange={(e) => {
                        const updated = { ...currentPatient };
                        updated.patient_info.city = e.target.value;
                        updatePatient(currentPatient.id, 'patient_info', updated.patient_info);
                      }}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={currentPatient.patient_info.state}
                      onChange={(e) => {
                        const updated = { ...currentPatient };
                        updated.patient_info.state = e.target.value;
                        updatePatient(currentPatient.id, 'patient_info', updated.patient_info);
                      }}
                      className="border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                {/* Referral Info */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Referral Information</h3>
                  <textarea
                    placeholder="Reason for Evaluation"
                    value={currentPatient.referral_info.reason_for_evaluation}
                    onChange={(e) => {
                      const updated = { ...currentPatient.referral_info };
                      updated.reason_for_evaluation = e.target.value;
                      updatePatient(currentPatient.id, 'referral_info', updated);
                    }}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    rows="3"
                  />
                </div>

              </div>
            )}

            {!currentPatient && (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">Select or create a patient to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
