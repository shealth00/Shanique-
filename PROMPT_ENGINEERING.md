# Agent Prompt Engineering Guide

## Customizing Claude for Your Specific Needs

This guide explains how to optimize, customize, and improve the prompts used by each agent to generate higher-quality, more personalized reports.

---

## Understanding the Prompt Structure

### Base Prompt Components

Every agent prompt includes:

1. **Role Definition** - Who the AI is
2. **Task Description** - What to generate
3. **Context Data** - Patient information
4. **Output Specifications** - How to structure response
5. **Quality Criteria** - Standards to maintain

### Example Base Structure

```
[ROLE] You are a clinical psychologist writing...

[TASK] Generate the "CAREGIVER INTERVIEW" section...

[CONTEXT] Patient Data:
${JSON.stringify(patient, null, 2)}

[INSTRUCTIONS] Write in professional clinical language...

[QUALITY] Include specific examples, maintain empathetic tone...
```

---

## Agent-Specific Prompt Customization

### 1. CAREGIVER INTERVIEW AGENT

**Current Prompt Focus:**
- Family history and composition
- Developmental milestones
- Medical history
- Current functioning
- Educational background
- Behavioral concerns

**Customization Options:**

#### Option A: Add Cultural Sensitivity
```
ADD TO INSTRUCTIONS:
"Consider cultural factors in child-rearing practices, 
family structure, and educational expectations. Avoid 
culturally specific assumptions. Note any language barriers 
or multilingual home environments."
```

#### Option B: Emphasize Strengths-Based Approach
```
ADD TO INSTRUCTIONS:
"Include family strengths, protective factors, and 
positive attributes of the child. Balance concerns with 
positive observations. Highlight parent involvement and 
engagement in support services."
```

#### Option C: Include Trauma-Informed Perspective
```
ADD TO INSTRUCTIONS:
"Screen for and sensitively document any trauma exposure, 
adverse childhood experiences, or significant life stressors. 
Use trauma-informed language. Note any behavioral responses 
to past trauma that may be evident."
```

**Example Customized Prompt:**

```javascript
const caregiverInterviewPrompt = `
You are a clinical psychologist writing the "CAREGIVER INTERVIEW" 
section of a comprehensive psychological evaluation.

SPECIAL FOCUS: Trauma-Informed Approach
You will sensitively document:
- Adverse childhood experiences (ACEs)
- Trauma exposure and responses
- Protective factors and resilience
- Cultural contexts and strengths

PATIENT DATA:
${JSON.stringify(patient, null, 2)}

WRITE WITH:
- Sensitivity to trauma effects
- Strength-based language
- Cultural humility
- Specific, concrete examples
- Professional clinical tone

GENERATE:
A detailed 2-3 page narrative that feels authentic, 
specific, and clinically appropriate.
`;
```

---

### 2. BEHAVIORAL OBSERVATIONS AGENT

**Current Prompt Focus:**
- Appearance and demeanor
- Sensory capabilities
- Communication style
- Cooperation and engagement
- Behavioral patterns
- Test validity

**Customization Options:**

#### Option A: Detailed Neurodevelopmental Focus
```
ADD TO INSTRUCTIONS:
"Pay special attention to:
- Motor tone (hypertonia vs. hypotonia)
- Coordination and balance
- Fine motor control during writing/drawing
- Gait and gross motor patterns
- Tremors or other movement abnormalities
- Signs of neurological involvement"
```

#### Option B: Detailed Social/Emotional Observation
```
ADD TO INSTRUCTIONS:
"Document in detail:
- Quality of social overtures
- Response to social bids
- Shared enjoyment and affect reciprocity
- Emotional regulation patterns
- Response to frustration/success
- Relationship building with examiner"
```

#### Option C: ADHD-Specific Focus
```
ADD TO INSTRUCTIONS:
"Specifically note:
- Attention span and sustained focus
- Impulsive responding patterns
- Activity level changes across tasks
- Response to structure and boundaries
- Distractibility to environmental stimuli
- Executive function demonstrations"
```

**Example Customized Prompt:**

```javascript
const behavioralObservationsPrompt = `
Generate the "BEHAVIORAL OBSERVATIONS" section with 
SPECIFIC FOCUS on ADHD presentation patterns.

PATIENT DATA:
${JSON.stringify(patient, null, 2)}

DOCUMENT SPECIFICALLY:
- Attention patterns: What sustained his/her attention? 
  What caused distraction?
- Impulse control: Examples of impulsive responding, waiting ability
- Activity level: Movement during testing, restlessness, fidgeting
- Task engagement: Effort expended, frustration tolerance
- Executive function: Organization, planning, follow-through

INCLUDE CONCRETE EXAMPLES:
"Marcus fidgeted continuously with pencil while working 
on the math problems" rather than "showed fidgeting"

CONCLUDE WITH:
Assessment of validity: "Results are/are not likely a 
representative sample of FIRST's current abilities because..."

TONE: Professional, objective, descriptive
LENGTH: 1-2 pages
`;
```

---

### 3. TEST RESULTS AGENT

**Current Prompt Focus:**
- Score reporting
- Range classification
- Subtest interpretation
- Clinical implications
- Behavioral observations during test

**Customization Options:**

#### Option A: Parent-Friendly Interpretation
```
ADD TO INSTRUCTIONS:
"Explain test results in language accessible to parents 
without formal training. Avoid jargon. Use analogies when 
helpful. Explain what the score means for daily functioning. 
Include a sentence about what this score range means in 
simple terms."
```

#### Option B: DSM-5 Criterion Mapping
```
ADD TO INSTRUCTIONS:
"For each test result, explicitly connect to relevant 
DSM-5 diagnostic criteria where applicable. Example: 
'This poor performance on processing speed is consistent 
with ADHD criterion regarding sustained attention.'"
```

#### Option C: Longitudinal Comparison
```
ADD TO INSTRUCTIONS:
"When previous test data is available, compare and 
contrast current performance. Note areas of improvement 
or decline. Comment on rate of change and what it 
suggests about intervention effectiveness."
```

**Example Customized Prompt:**

```javascript
const testResultsPrompt = `
Generate interpretations of test results formatted for 
PARENT UNDERSTANDING while maintaining clinical accuracy.

PATIENT DATA:
${JSON.stringify(patient, null, 2)}

FOR EACH TEST:
1. State what the test measures in simple terms
2. Report composite/full-scale score with range
3. Explain what the score means (use parent-friendly language)
4. Note subtest patterns (strengths and challenges)
5. Explain what these results mean for daily life
6. Note any behavioral observations during testing

LANGUAGE GUIDELINES:
✓ "Sophie had difficulty sounding out unfamiliar words"
✗ "Phonological decoding deficit evident"

✓ "Marcus answered questions very quickly without 
   thinking them through"
✗ "Elevated commission error rate on CPT-3"

✓ "This suggests Emma will need support learning 
   social rules that other children pick up naturally"
✗ "Significant deficits in pragmatic language processing"

TONE: Professional but warm and understandable
LENGTH: 0.5-1.5 pages per test
`;
```

---

### 4. DIAGNOSTIC SUMMARY AGENT

**Current Prompt Focus:**
- Synthesizing findings
- Clinical reasoning
- Differential diagnoses
- Functional impact
- Diagnostic criteria

**Customization Options:**

#### Option A: Differential Diagnosis Discussion
```
ADD TO INSTRUCTIONS:
"Explicitly discuss why certain diagnoses were ruled in 
or ruled out. Example: 'ASD was considered but ruled out 
because Emma frequently initiated social interactions, 
which would be inconsistent with autism spectrum disorder.'"
```

#### Option B: Developmental Perspective
```
ADD TO INSTRUCTIONS:
"Frame diagnoses in developmental context. Discuss whether 
symptoms represent developmental variation, expected 
developmental difficulty, or clinical concern requiring intervention."
```

#### Option C: Comorbidity Explanation
```
ADD TO INSTRUCTIONS:
"When multiple diagnoses are present, explain the 
relationship between them. Are they related? Do they 
co-occur frequently? How might they interact?"
```

**Example Customized Prompt:**

```javascript
const diagnosticSummaryPrompt = `
Generate "SUMMARY/CLINICAL IMPRESSIONS" section with 
emphasis on DIFFERENTIAL DIAGNOSIS REASONING.

PATIENT DATA:
${JSON.stringify(patient, null, 2)}

STRUCTURE:

1. RESTATE REFERRAL CONCERNS
   - Why was evaluation requested?
   - What specific concerns brought family in?

2. SUMMARIZE KEY FINDINGS
   - Behavioral observations during testing
   - Most significant test results
   - Patterns across measures

3. DISCUSS DIFFERENTIAL DIAGNOSIS
   For each diagnosis considered, explain:
   - Why was it considered?
   - What evidence supports it?
   - What evidence argues against it?
   
   Format: "ASD was considered because [evidence] 
   but ruled out because [counter-evidence]"

4. EXPLAIN FINAL DIAGNOSES
   - How does each diagnosis fit the evidence?
   - Which findings are most critical?
   - What is the severity level?

5. DESCRIBE FUNCTIONAL IMPACT
   - How does this affect daily life?
   - Impact on academics, social, behavior, adaptive?
   - Severity of impairment?

6. IDENTIFY STRENGTHS
   - What are this patient's capabilities?
   - What can be built upon?
   - Protective factors?

LENGTH: 3-5 pages
TONE: Balanced, reasoning-focused, professional
`;
```

---

### 5. RECOMMENDATIONS AGENT

**Current Prompt Focus:**
- Educational interventions
- Therapeutic services
- Classroom modifications
- Home-based interventions
- Community resources
- Follow-up

**Customization Options:**

#### Option A: Evidence-Based Emphasis
```
ADD TO INSTRUCTIONS:
"For each recommendation, briefly cite the evidence base. 
Example: 'ABA therapy for autism is supported by extensive 
research showing X% improvement in...' Include references 
to relevant research or professional guidelines."
```

#### Option B: Implementation-Focused
```
ADD TO INSTRUCTIONS:
"Structure each recommendation with actionable steps. 
Include: What to do? How to do it? When to start? Who 
to contact? Expected timeline? What to expect?"
```

#### Option C: Family-Specific Customization
```
ADD TO INSTRUCTIONS:
"Prioritize recommendations based on family strengths, 
resources, and stated preferences. Acknowledge barriers 
(cost, transportation, access) and offer alternatives. 
Validate family efforts and progress."
```

**Example Customized Prompt:**

```javascript
const recommendationsPrompt = `
Generate RECOMMENDATIONS with IMPLEMENTATION FOCUS.

PATIENT DATA:
${JSON.stringify(patient, null, 2)}

CATEGORIES (in order of priority):

1. SCHOOL-BASED INTERVENTIONS
   For each recommendation include:
   - Specific classroom modifications needed
   - Duration/frequency if service-based
   - How to monitor effectiveness
   - Timeline for implementation

2. THERAPEUTIC SERVICES
   Include:
   - Type of service (therapy, tutoring, etc.)
   - Frequency and duration
   - Specific provider qualifications
   - Local providers in the region (specific names/numbers)
   - Insurance/payment information if applicable

3. HOME-BASED STRATEGIES
   Include:
   - What parents should do
   - When/how often to implement
   - Expected benefits and timeline
   - How to monitor progress
   - Troubleshooting tips

4. COMMUNITY RESOURCES
   Include:
   - Support groups
   - Recreational opportunities
   - Financial assistance programs
   - Advocacy organizations
   - Local contact information

5. MONITORING & FOLLOW-UP
   Include:
   - Timeline for reassessment
   - What progress markers to look for
   - When to seek additional help
   - Who to contact with concerns

FORMAT FOR EACH RECOMMENDATION:

[NUMBER]. [TITLE]
   What: Clear description of the recommendation
   How: Specific implementation steps
   When: Timeline and frequency
   Who: Specific person/organization to contact
   Why: Brief rationale
   Expected Outcome: What to expect

TONE: Practical, actionable, family-friendly
LENGTH: 3-5 pages, 25-50 numbered recommendations
`;
```

---

## Advanced Customization Techniques

### 1. Adding Diagnostic Specificity

For evaluations focused on a particular diagnosis, customize the prompts:

```javascript
const autismSpecificPrompt = {
  caregiver_interview: `
    [Original prompt] + 
    FOCUS AREAS FOR ASD:
    - Early social communication development
    - Sensory sensitivities
    - Repetitive behaviors and restricted interests
    - Peer relationships and social understanding
  `,
  
  behavioral_observations: `
    [Original prompt] +
    ASD-SPECIFIC OBSERVATIONS:
    - Eye contact and joint attention
    - Social reciprocity
    - Repetitive behaviors during testing
    - Sensory responses (over/under-responsive)
  `,
  
  test_results: `
    [Original prompt] +
    CONNECT TO ASD CRITERIA:
    - Social Communication Index interpretations
    - Restricted/Repetitive Behavior observations
    - Adaptive behavior in social domain
  `
};
```

### 2. Adding Developmental Level Focus

Customize for different age groups:

```javascript
const preschoolFocus = {
  templates: {
    developmental_context: `
      At age [X], typical development includes:
      [list developmental norms]
      
      [Patient] shows [description] which is 
      [ahead of/consistent with/below] expectations.
    `
  }
};

const adolescentFocus = {
  templates: {
    developmental_context: `
      Adolescence involves [developmental tasks].
      [Patient's] presentation is consistent with/differs from 
      typical adolescent development because...
    `
  }
};
```

### 3. Adding Trauma-Informed Language

Customize all prompts for trauma-sensitive approach:

```javascript
const traumaInformedGuidelines = {
  language: {
    avoid: ["abuse victim", "damaged", "broken"],
    use: ["trauma exposure", "survival responses", "resilience"]
  },
  
  prompting: `
    Apply trauma-informed lens:
    - Normalize survival/coping responses
    - Identify strengths and resilience
    - Avoid retraumatization in report language
    - Acknowledge impact of trauma on development
    - Recognize cultural/systemic trauma
  `
};
```

---

## Prompt Testing & Iteration

### A/B Testing Prompts

```javascript
// Test Version A
const promptA = `Generate recommendations focused on 
quick wins and early success...`;

// Test Version B  
const promptB = `Generate recommendations organized by 
priority with implementation timelines...`;

// Compare outputs and select best version
```

### Refinement Cycle

1. **Generate** - Create report with current prompt
2. **Review** - Evaluate quality and relevance
3. **Analyze** - Identify weaknesses or gaps
4. **Modify** - Adjust prompt based on findings
5. **Test** - Generate new report with updated prompt
6. **Compare** - Assess improvement
7. **Iterate** - Repeat until satisfied

### Quality Metrics

Track and improve:
- **Specificity** - How tailored to patient?
- **Accuracy** - How well does it match observations?
- **Accessibility** - How understandable to parents?
- **Completeness** - Does it cover all important areas?
- **Actionability** - How implementable are recommendations?
- **Tone** - Is professional tone maintained?

---

## Regional Customization

### Adding Local Resources

Customize recommendations with specific providers:

```javascript
const memphisResources = {
  aba_providers: [
    { name: "Hopebridge", phone: "901-248-7440", location: "Cordova" },
    { name: "The Seed Program", phone: "901-690-5213", location: "Memphis" }
  ],
  schools: [
    { name: "Germantown Schools", type: "public" },
    { name: "St. Mary's", type: "private" }
  ],
  support_groups: [
    { name: "Autism Society Mid-South", website: "..." }
  ]
};
```

Insert into recommendations prompt:

```javascript
`For ABA services in ${patient.city}, ${patient.state}, 
consider: ${JSON.stringify(aba_providers)}`
```

### State-Specific Requirements

Add state-specific information:

```javascript
const tennesseeInfo = {
  special_education_law: "IDEA (federal) + Tennessee Special Education Law",
  transition_requirements: "Transition planning begins at age 14 in Tennessee",
  funding_programs: [
    "First Steps Early Intervention",
    "TEIS (Tennessee Early Intervention Services)"
  ]
};
```

---

## Quality Assurance in Prompts

### Checklist for Custom Prompts

- [ ] Clear role definition?
- [ ] Specific task description?
- [ ] Concrete examples provided?
- [ ] Quality standards articulated?
- [ ] Tone guidelines specified?
- [ ] Length guidelines included?
- [ ] Structured format described?
- [ ] Clinical accuracy emphasized?
- [ ] Professional standards addressed?
- [ ] Potential errors anticipated?

### Common Prompt Problems & Fixes

| Problem | Cause | Fix |
|---------|-------|-----|
| Generic content | Too vague | Add specific patient details |
| Wrong tone | No tone guidance | Include tone examples |
| Too long | No length limits | Specify page/word counts |
| Missing info | Incomplete structure | Add checklist of required elements |
| Not specific enough | Data not provided | Request specific examples |

---

## Version Control & Documentation

### Track Your Customizations

```markdown
# Custom Prompts - Version History

## v1.0 - Original
- Standard clinical prompts
- General recommendations

## v1.1 - ASD Focus (2024-10)
- Added ASD-specific observation areas
- Customized diagnostic criteria mapping

## v1.2 - Trauma-Informed (2024-11)
- Added trauma screening emphasis
- Updated language guidelines
- Included resilience focus

## v2.0 - Family-Centered (2024-12)
- Reframed all prompts for family understanding
- Added implementation-focused recommendations
- Included parent-accessible language
```

---

## Examples of Customized Prompts

### Example 1: Severe Behavioral Problems

```
SPECIAL PROMPT ADDITIONS:
- Safety assessment focus
- Functional behavior analysis lens
- Crisis response planning
- Trauma/adverse experiences screening
- Positive behavior support recommendations
- School-based behavioral intervention planning
```

### Example 2: Gifted with Anxiety

```
SPECIAL PROMPT ADDITIONS:
- Acknowledge advanced intellectual abilities
- Discuss perfectionism and anxiety relationship
- Recommend enrichment alongside intervention
- Address underachievement vs. ability
- Social-emotional needs of gifted students
- Motivation and engagement strategies
```

### Example 3: Developmental Disability

```
SPECIAL PROMPT ADDITIONS:
- Developmental age considerations
- Adaptive functioning emphasis
- Life skills and independence training
- Transition to adulthood planning
- Supported living options
- Community integration focus
- Strengths-based interventions
```

---

## Conclusion

The power of this system comes from its adaptability. By customizing prompts to your specific needs, population, values, and resources, you create a report generation system that truly serves your clinical practice and patients.

**Key Principles:**
1. **Start simple** - Use standard prompts initially
2. **Iterate gradually** - Customize based on experience
3. **Test thoroughly** - Compare outputs before/after changes
4. **Document changes** - Track what works
5. **Share learnings** - Help others improve their prompts

Good luck with your customization! 🎯
