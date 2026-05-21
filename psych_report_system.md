# Psychological Evaluation Report Generation System
## Multi-Agent Architecture for IPS Report Generation

---

## System Overview

This system uses specialized Claude API agents to generate comprehensive psychological evaluation reports. Each agent is responsible for a specific section of the report and maintains clinical accuracy while personalizing content based on patient data.

---

## Agent Architecture

### 1. CAREGIVER INTERVIEW AGENT
**Purpose:** Generate realistic, detailed caregiver interview narratives

```yaml
Agent_ID: caregiver_interview
Input_Parameters:
  - patient_name: string
  - age_years: integer
  - age_months: integer
  - gender: string (Male/Female)
  - city: string
  - state: string
  - family_structure: object
  - birth_details: object
  - developmental_history: object
  - medical_history: object
  - behavioral_concerns: array
  - educational_history: object
  - social_skills_concerns: object
  - sensory_behaviors: array
  - repetitive_behaviors: array
  - restricted_interests: array

Output: Formatted CAREGIVER INTERVIEW section (3-5 pages)
```

**Prompt Template:**
```
You are a clinical psychologist writing the "CAREGIVER INTERVIEW" section 
of a comprehensive psychological evaluation report. Your task is to create 
a detailed, clinically accurate narrative based on the provided patient data.

STYLE REQUIREMENTS:
- Use professional clinical language
- Maintain empathetic tone toward caregivers
- Include specific examples and concrete details
- Use third-person perspective
- Follow the provided template structure
- Include medical history, developmental milestones, behavioral concerns
- Describe educational services and progress
- Detail social/behavioral concerns

PATIENT DATA:
[INSERT PATIENT PARAMETERS IN JSON]

TEMPLATE SECTIONS TO COMPLETE:
1. Family composition and living situation
2. Family history and stressors
3. Birth and medical history
4. Developmental milestones (motor, language, social)
5. Current functioning (appetite, sleep, vision, hearing)
6. Communication abilities
7. Educational history and services
8. Behavioral concerns
9. ASD-related concerns (social, sensory, repetitive, interests)

Generate a natural, flowing narrative that feels authentic and specific to this patient.
```

---

### 2. BEHAVIORAL OBSERVATIONS AGENT
**Purpose:** Generate detailed behavioral observation narratives from testing session

```yaml
Agent_ID: behavioral_observations
Input_Parameters:
  - patient_name: string
  - age: string
  - appearance_grooming: string
  - sensory_functioning: string
  - communication_style: string
  - eye_contact_patterns: string
  - affect_description: string
  - behaviors_during_testing: array
  - compliance_level: string
  - modifications_made: array
  - overall_validity: string

Output: Formatted BEHAVIORAL OBSERVATIONS section (1-2 pages)
```

**Prompt Template:**
```
Generate a BEHAVIORAL OBSERVATIONS section for a psychological evaluation.
This section describes how the patient presented during the testing session.

CLINICAL GUIDELINES:
- Describe observable behaviors only
- Include specific examples
- Note level of cooperation/compliance
- Describe communication and social interaction during testing
- Note any unusual behaviors or emotional responses
- Describe modifications made to accommodate the patient
- Assess validity of results based on cooperation

PATIENT PRESENTATION DATA:
[INSERT PARAMETERS]

Write in professional clinical language with specific behavioral examples.
```

---

### 3. TEST RESULTS SUMMARY AGENT
**Purpose:** Generate test result narratives and interpretations

```yaml
Agent_ID: test_results
Input_Parameters:
  - test_name: string
  - composite_score: number
  - percentile_rank: number
  - confidence_interval: object
  - subtest_scores: object
  - score_range: string (Extremely Low, Very Low, Low, Low Average, Average, High Average, High, Very High, Extremely High)
  - clinical_interpretation: string
  - strengths_identified: array
  - weaknesses_identified: array
  - relevant_observations: string

Output: Formatted test result narrative (0.5-1.5 pages per test)
```

**Prompt Template:**
```
Generate a test result interpretation narrative for: [TEST_NAME]

GUIDELINES:
- Begin with test description and purpose
- Report composite score, percentile, and confidence interval
- Describe performance range using clinical descriptors
- Note subtest patterns (strengths/weaknesses)
- Provide clinical interpretation
- Connect results to diagnosis or functioning
- Note behavioral observations during test administration

SCORE DATA:
[INSERT TEST SCORES AND DATA]

Write in clear, professional clinical language suitable for parents and educators.
```

---

### 4. DIAGNOSTIC SUMMARY AGENT
**Purpose:** Synthesize all data into diagnostic conclusions

```yaml
Agent_ID: diagnostic_summary
Input_Parameters:
  - primary_diagnoses: array
  - supporting_evidence: object
  - differential_diagnoses_ruled_out: array
  - functional_impact: object
  - severity_level: string
  - comorbid_conditions: array
  - psychosocial_stressors: array
  - protective_factors: array

Output: Formatted SUMMARY/CLINICAL IMPRESSIONS and DIAGNOSES sections
```

**Prompt Template:**
```
Generate a SUMMARY/CLINICAL IMPRESSIONS section synthesizing all evaluation data.

REQUIREMENTS:
- Restate reason for evaluation
- Summarize key behavioral observations
- Review significant test findings
- Address each diagnostic criterion
- Explain diagnoses using clinical language
- Discuss differential diagnoses
- Describe functional impact on daily life
- Note severity levels where applicable
- Identify strengths and protective factors

DATA SUMMARY:
[INSERT ALL EVALUATION DATA]

DIAGNOSES TO EXPLAIN:
[INSERT DIAGNOSES WITH CODES]

Create a cohesive narrative that supports the diagnostic conclusions.
```

---

### 5. RECOMMENDATIONS AGENT
**Purpose:** Generate tailored, evidence-based recommendations

```yaml
Agent_ID: recommendations
Input_Parameters:
  - diagnoses: array
  - age: integer
  - academic_level: string
  - home_environment: string
  - school_setting: string
  - primary_concerns: array
  - strengths: array
  - resources_available: object
  - regional_location: string

Output: Formatted RECOMMENDATIONS section (3-5 pages, 30-50 recommendations)
```

**Prompt Template:**
```
Generate comprehensive, tailored RECOMMENDATIONS for this patient.

INCLUDE RECOMMENDATIONS FOR:
1. Educational interventions and accommodations
2. Therapeutic services (behavioral, speech, occupational, physical)
3. Classroom modifications and supports
4. Home-based interventions
5. Family support services
6. Medication consultation (if relevant)
7. Community resources and support groups
8. Monitoring and follow-up evaluation timeline
9. Adaptive skills and life skills training
10. Social-emotional support

CLINICAL DATA:
[INSERT PATIENT DATA AND DIAGNOSES]

GUIDELINES:
- Make recommendations specific to the patient's needs
- Include local resources and service providers
- Provide practical, implementable suggestions
- Include relevant website links and phone numbers
- Organize by priority and area of functioning
- Number all recommendations for easy reference
- Include evidence-based approaches
- Consider age-appropriateness

Generate 30-50 detailed, actionable recommendations.
```

---

## Patient Data Structure

```json
{
  "patient_info": {
    "first_name": "string",
    "last_name": "string",
    "birth_date": "YYYY-MM-DD",
    "age_years": integer,
    "age_months": integer,
    "gender": "Male/Female",
    "race_ethnicity": "string",
    "city": "string",
    "state": "string"
  },
  "family_info": {
    "parents": [{"name": "string", "relationship": "string"}],
    "siblings": [{"name": "string", "age": integer, "gender": "string"}],
    "household_members": integer,
    "primary_language": "string",
    "family_history": ["concern1", "concern2"]
  },
  "referral_info": {
    "referral_source": "string",
    "reason_for_evaluation": "string",
    "primary_concerns": ["concern1", "concern2", "concern3"],
    "evaluation_date": "YYYY-MM-DD",
    "report_date": "YYYY-MM-DD"
  },
  "developmental_history": {
    "birth_type": "full-term/preterm",
    "weeks_gestation": integer,
    "birth_method": "vaginal/cesarean",
    "pregnancy_complications": ["complication1"],
    "prenatal_exposures": ["exposure1"],
    "neonatal_complications": ["complication1"],
    "motor_milestones": {
      "crawling_months": integer,
      "walking_months": integer
    },
    "language_milestones": {
      "first_word_months": integer,
      "first_sentences_years": number,
      "current_language_level": "string"
    }
  },
  "medical_history": {
    "current_medications": ["med1", "med2"],
    "chronic_conditions": ["condition1"],
    "allergies": ["allergy1"],
    "surgeries": ["surgery1"],
    "sleep_patterns": "description",
    "appetite": "description",
    "vision_hearing_screening": "date and results"
  },
  "behavioral_observations": {
    "appearance": "string",
    "grooming": "string",
    "eye_contact": "description",
    "affect": "string",
    "cooperation_level": "string",
    "activity_level": "string",
    "notable_behaviors": ["behavior1", "behavior2"],
    "modifications_needed": ["modification1"]
  },
  "test_results": [
    {
      "test_name": "string",
      "composite_score": number,
      "percentile": number,
      "score_range": "string",
      "subtests": {
        "subtest_name": {"score": number, "range": "string"}
      },
      "clinical_notes": "string"
    }
  ],
  "diagnoses": [
    {
      "diagnosis": "string",
      "dsm_code": "string",
      "severity": "string",
      "supporting_evidence": ["evidence1", "evidence2"]
    }
  ],
  "functional_impact": {
    "academic": "description",
    "social": "description",
    "behavioral": "description",
    "adaptive": "description"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendations_focus": ["area1", "area2", "area3"]
}
```

---

## Implementation Workflow

### Step 1: Data Collection
- Interview caregivers and gather comprehensive patient data
- Compile all test scores and results
- Document observations from testing sessions
- Populate the JSON patient data structure

### Step 2: Agent Execution (Sequential)
1. **Caregiver Interview Agent** → Generate interview narrative
2. **Behavioral Observations Agent** → Generate observation section
3. **Test Results Agent** → Generate each test result interpretation
4. **Diagnostic Summary Agent** → Generate summary and diagnoses
5. **Recommendations Agent** → Generate recommendations

### Step 3: Report Assembly
- Compile sections in proper order per template
- Format with headers, page numbers, footers
- Insert Irby Psychological Services letterhead
- Create Table of Contents and index

### Step 4: Quality Review
- Clinical review by licensed psychologist
- Accuracy check against raw data
- Appropriateness of recommendations
- Professional quality and tone

### Step 5: Final Output
- Export to DOCX format
- Generate PDF
- Prepare for distribution to family and school

---

## API Integration Pattern

```javascript
// Pseudo-code for agent orchestration

async function generateReport(patientData) {
  const results = {};
  
  // 1. Caregiver Interview
  results.interview = await callAgent('caregiver_interview', {
    patientData,
    template: INTERVIEW_TEMPLATE
  });
  
  // 2. Behavioral Observations
  results.observations = await callAgent('behavioral_observations', {
    patientData: patientData.behavioral_observations,
    template: OBSERVATIONS_TEMPLATE
  });
  
  // 3. Test Results (iterative)
  results.testResults = [];
  for (let test of patientData.test_results) {
    const result = await callAgent('test_results', {
      test,
      patientData,
      template: TEST_RESULT_TEMPLATE
    });
    results.testResults.push(result);
  }
  
  // 4. Diagnostic Summary
  results.summary = await callAgent('diagnostic_summary', {
    patientData,
    testResults: results.testResults,
    template: SUMMARY_TEMPLATE
  });
  
  // 5. Recommendations
  results.recommendations = await callAgent('recommendations', {
    patientData,
    diagnoses: patientData.diagnoses,
    summary: results.summary,
    template: RECOMMENDATIONS_TEMPLATE
  });
  
  return assembleReport(results);
}
```

---

## Quality Assurance Checklist

- [ ] All patient identifiers filled in correctly
- [ ] Diagnoses match DSM-5-TR codes
- [ ] Test scores accurately reported
- [ ] Clinical interpretations evidence-based
- [ ] Recommendations are specific and actionable
- [ ] All sections internally consistent
- [ ] Tone is professional and accessible
- [ ] No contradictory statements
- [ ] All data sources cited
- [ ] Appropriate for intended audience
- [ ] Free of spelling and grammatical errors
- [ ] Proper formatting and page breaks

---

## System Limitations & Ethics

⚠️ **IMPORTANT CLINICAL CONSIDERATIONS:**

This system is designed to **ASSIST** clinical professionals, not replace them:

1. All reports must be reviewed and signed by a licensed psychologist
2. Clinical judgment overrides algorithmic outputs
3. Recommendations must align with professional standards of care
4. System cannot replace clinical expertise or intuition
5. All data entry must be accurate and complete
6. Cultural sensitivity and individualization are essential
7. Families must have opportunity to ask questions
8. Reports must be explained in accessible language

This tool enhances efficiency while maintaining clinical integrity and professional responsibility.
