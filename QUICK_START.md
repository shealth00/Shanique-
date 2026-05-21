# Quick Start Guide - Psychological Report Generation System

## 5-Minute Setup

### 1. Copy the React Component
```bash
# Copy PsychReportGenerator.jsx to your React project
src/components/PsychReportGenerator.jsx
```

### 2. Import in Your App
```javascript
import PsychReportGenerator from './components/PsychReportGenerator';

function App() {
  return <PsychReportGenerator />;
}
```

### 3. Install Dependencies
```bash
npm install lucide-react
```

### 4. Set Your API Key
Add to `.env`:
```
REACT_APP_ANTHROPIC_API_KEY=your_key_here
```

### 5. Run the Application
```bash
npm start
```

---

## Generating Your First Report (15 Minutes)

### Step 1: Add Patient (1 min)
- Click the **"+"** button in the Patients panel
- You'll see a new patient form

### Step 2: Enter Patient Info (3 min)
```
First Name: [Patient First Name]
Last Name: [Patient Last Name]
Birth Date: [MM/DD/YYYY]
Age: [# years, # months]
Gender: [Male/Female]
City/State: [City], [State]
```

### Step 3: Enter Referral Information (2 min)
```
Reason for Evaluation: 
[Briefly describe why evaluation was requested]

Primary Concerns:
[List main concerns]

Evaluation Date: [Date evaluated]
```

### Step 4: Generate Report Sections (5 min)
Choose one of two options:

**Option A - Generate All Sections:**
- Click the large blue **"Generate Complete Report"** button
- Wait for all 5 sections to complete
- Takes about 3-5 minutes

**Option B - Generate Individual Sections:**
- Click the **"Generate"** button for each agent type
- Useful for customizing specific sections
- Takes 2-3 minutes total

### Step 5: Export Report (2 min)
- Click **"Export Report"** button
- A text file downloads with the complete report
- Open in Microsoft Word or Google Docs
- Format, add letterhead, adjust as needed

---

## Common Tasks

### Adding More Patients
```
1. Click "+" button in left panel
2. Fill in patient info
3. Click "Generate Complete Report"
4. Repeat for each patient
```

### Editing Report Sections Before Export
- Generated sections display in real-time
- Click "Generate" next to any section to regenerate
- Export the final version when satisfied

### Using Sample Patient Data
1. Open `sample_patient_data.md`
2. Find patient profile you want to use
3. Copy the JSON block
4. In the app, manually enter the data
5. Click "Generate Complete Report"

### Generating Multiple Reports
- The system handles unlimited patients
- Add patients one by one
- Generate reports sequentially
- Export each when complete

---

## What Each Agent Does

| Agent | Creates | Time |
|-------|---------|------|
| **Caregiver Interview** | Family history, development, concerns | 30 sec |
| **Behavioral Observations** | Testing session behaviors, cooperation | 30 sec |
| **Test Results** | Interpretations of all test scores | 1 min |
| **Diagnostic Summary** | Clinical impressions, diagnoses | 1 min |
| **Recommendations** | 25-50 actionable recommendations | 2 min |

**Total Time:** ~5 minutes per report

---

## After Report Generation

### Quality Control Checklist
- [ ] All patient names correct?
- [ ] All dates accurate?
- [ ] All test scores match your records?
- [ ] Diagnoses clinically appropriate?
- [ ] Recommendations relevant to patient?
- [ ] No spelling/grammar errors?
- [ ] Professional tone throughout?

### Formatting the Report
```
1. Open exported .txt file in Word
2. Add your clinic letterhead
3. Add page numbers and footer
4. Insert table of contents
5. Adjust section headers/formatting
6. Proofread carefully
7. Save as .docx
8. Print and obtain signature
9. Create PDF for distribution
```

### Distributing the Report
- Print signed copy for family
- Create PDF for electronic distribution
- Maintain secure storage
- Follow HIPAA guidelines
- Document distribution

---

## Customizing Patient Data Fields

### Add Custom Concerns
```javascript
primary_concerns: [
  "Social communication delays",
  "Limited eye contact",
  "Repetitive behaviors"
]
```

### Add Medical History Details
```javascript
medical_history: {
  current_medications: ["Medication 1", "Medication 2"],
  chronic_conditions: ["Condition 1"],
  allergies: ["Allergy 1"]
}
```

### Include Test Results
```javascript
test_results: [
  {
    test_name: "WISC-V",
    composite_score: 100,
    percentile: 50,
    score_range: "Average"
  }
]
```

---

## Troubleshooting

### Report not generating?
- Verify API key is correct
- Check internet connection
- Ensure patient data is filled in
- Try regenerating individual sections

### Generated content not specific?
- Add more details to patient data
- Include specific test scores
- Provide behavioral observations
- List detailed concerns

### API errors?
- Check Anthropic API status
- Verify API key has credits
- Wait a few seconds between generations
- Check rate limits (100/hour)

### Formatting issues in Word?
- Paste into fresh Word document
- Manually format headers/sections
- Use report template as guide
- Save as .docx before printing

---

## Best Practices

### For Accurate Reports:
1. **Complete all patient data fields** - More data = Better reports
2. **Include specific test scores** - Exact numbers from your records
3. **Detail behavioral observations** - Include concrete examples
4. **List all diagnoses** - Include DSM-5 codes if available
5. **Verify information before export** - Check against raw data

### For Efficiency:
1. **Batch similar patients** - Generate similar-age reports consecutively
2. **Use copy/paste** - Quickly add similar family histories
3. **Create templates** - Save patient data you use frequently
4. **Review while generating** - Read first sections while others complete

### For Quality:
1. **Always have licensed clinician review** - CRITICAL
2. **Compare with your records** - Verify accuracy
3. **Check clinical appropriateness** - Override AI if needed
4. **Customize recommendations** - Tailor to local resources
5. **Maintain ethical standards** - Follow professional guidelines

---

## Sample Quick Entry - Emma (Age 5)

### Minimal Data Entry:
```
Name: Emma Richardson
DOB: 03/15/2019
Age: 5 years, 3 months
Gender: Female
City: Memphis, State: Tennessee

Referral: Pediatrician Dr. Mitchell concerned about social delays

Concerns:
- Social communication delays
- Limited eye contact
- Repetitive play patterns
- Sensory sensitivities
- Difficulty with transitions

Primary diagnosis: Autism Spectrum Disorder
```

**Result:** Professional 15-20 page report generated in 5 minutes!

---

## Integration with Your Workflow

### Current Workflow
```
Evaluate → Take Notes → Write Report → Review → Distribute
(4-6 hours)
```

### With This System
```
Evaluate → Enter Data → Generate Report → Review → Distribute
(1-2 hours)
```

**Time Savings:** 50-75% reduction in report writing time

---

## Next Level: Advanced Features

### Using Patient Templates
```javascript
// Save frequently used patient structures
const autismTemplate = {
  referral_info: {
    reason_for_evaluation: "Concern for Autism Spectrum Disorder"
  },
  primary_concerns: [
    "Social communication delays",
    "Restricted/repetitive behaviors",
    "Sensory sensitivities"
  ]
}
```

### Bulk Report Generation
```javascript
// Generate reports for multiple patients
patients.forEach(patient => {
  generateCompleteReport(patient.id);
});
```

### Custom Recommendations
Edit the `recommendations` agent prompt to include:
- Your clinic-specific services
- Local provider lists
- Regional resources
- Specific interventions you offer

---

## Support Resources

### Quick Links
- `README.md` - Full documentation
- `psych_report_system.md` - System architecture
- `sample_patient_data.md` - Example patient profiles

### Where to Find Help
1. Review documentation files
2. Check sample patient data
3. Try test case first
4. Review generated sections
5. Customize as needed

---

## Key Reminders ⚠️

1. **Licensed psychologist review REQUIRED** before distribution
2. **Verify all data accuracy** against your records
3. **Override AI** whenever clinically indicated
4. **Maintain confidentiality** and HIPAA compliance
5. **Professional responsibility** rests with clinician, not AI

---

## Generate Your First Report Today!

**Time commitment:** 20 minutes
**Outcome:** Professional, complete psychological evaluation report
**Result:** More time for direct patient care

**Ready to start?** 
1. Run `npm start`
2. Click "+" to add patient
3. Fill in patient info
4. Click "Generate Complete Report"
5. Review and export!

Good luck! 🚀
