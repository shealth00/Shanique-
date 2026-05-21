# Sample Patient Data for 12 Psychological Evaluations

This file contains 12 diverse patient profiles that can be used to generate example psychological evaluation reports. Each profile represents different diagnoses, ages, and clinical presentations.

---

## Patient 1: Autism Spectrum Disorder (ASD) - Early Elementary

```json
{
  "id": 1,
  "patient_info": {
    "first_name": "Emma",
    "last_name": "Richardson",
    "birth_date": "2019-03-15",
    "age_years": 5,
    "age_months": 3,
    "gender": "Female",
    "city": "Memphis",
    "state": "Tennessee"
  },
  "family_info": {
    "parents": [
      { "name": "Margaret Richardson", "relationship": "Mother" },
      { "name": "David Richardson", "relationship": "Father" }
    ],
    "siblings": [
      { "name": "Thomas Richardson", "age": 8, "gender": "Male" }
    ],
    "household_members": 4,
    "family_history": ["Autism in maternal uncle", "Anxiety in mother"]
  },
  "referral_info": {
    "referral_source": "Pediatrician Dr. James Mitchell, MD",
    "reason_for_evaluation": "Concerns regarding social communication delays, limited peer interaction, and repetitive behaviors",
    "primary_concerns": [
      "Social communication delays",
      "Limited eye contact and joint attention",
      "Repetitive play patterns and interest in spinning objects",
      "Sensory sensitivities to loud noises",
      "Difficulty with transitions"
    ],
    "evaluation_date": "2024-10-15",
    "report_date": "2024-10-22"
  },
  "developmental_history": {
    "birth_type": "full-term",
    "weeks_gestation": 39,
    "birth_method": "vaginal",
    "pregnancy_complications": [],
    "motor_milestones": {
      "crawling_months": 7,
      "walking_months": 14
    },
    "language_milestones": {
      "first_word_months": 16,
      "first_sentences_years": 3,
      "current_language_level": "Phrases and short sentences; difficulty with conversation initiation"
    }
  },
  "medical_history": {
    "current_medications": [],
    "chronic_conditions": [],
    "allergies": ["Peanut allergy (severe)"],
    "sleep_patterns": "Difficulty falling asleep; requires white noise machine; approximately 8-9 hours nightly",
    "appetite": "Restricted diet; prefers bland foods and specific textures; avoids most vegetables",
    "vision_hearing_screening": "September 2024: Vision and hearing within normal limits"
  },
  "behavioral_observations": {
    "appearance": "Well-groomed, age-appropriate clothing, appeared healthy",
    "eye_contact": "Minimal spontaneous eye contact; briefly made eye contact when prompted by examiner",
    "affect": "Flat affect; limited facial expressions; appeared anxious during transitions",
    "cooperation_level": "Cooperative but required frequent praise and reassurance; some resistance to non-preferred tasks",
    "activity_level": "Fidgety; frequent hand-flapping when excited or anxious",
    "notable_behaviors": [
      "Hand flapping when excited",
      "Spinning in circles during breaks",
      "Lining up testing blocks by color",
      "Covering ears when examiner spoke loudly",
      "Humming repetitively"
    ]
  },
  "test_results": [
    {
      "test_name": "Autism Diagnostic Observation Schedule-2 (ADOS-2)",
      "composite_score": 13,
      "percentile": 92,
      "score_range": "Autism",
      "subtests": {
        "Social Affect": { "score": 7, "range": "High" },
        "Restricted/Repetitive Behavior": { "score": 6, "range": "High" }
      },
      "clinical_notes": "Scores indicate autism spectrum disorder meets threshold"
    },
    {
      "test_name": "Wechsler Preschool and Primary Scale of Intelligence-IV (WPPSI-IV)",
      "composite_score": 88,
      "percentile": 21,
      "score_range": "Low Average",
      "subtests": {
        "Verbal Comprehension": { "score": 8, "range": "Low Average" },
        "Visual Spatial": { "score": 9, "range": "Average" },
        "Fluid Reasoning": { "score": 7, "range": "Low Average" },
        "Working Memory": { "score": 7, "range": "Low Average" },
        "Processing Speed": { "score": 10, "range": "Average" }
      },
      "clinical_notes": "Cognitive abilities in low average range; relative strength in visual spatial skills"
    },
    {
      "test_name": "Vineland-3 Adaptive Behavior Scales",
      "composite_score": 72,
      "percentile": 3,
      "score_range": "Very Low",
      "subtests": {
        "Communication": { "score": 65, "range": "Very Low" },
        "Daily Living Skills": { "score": 75, "range": "Low" },
        "Socialization": { "score": 68, "range": "Very Low" },
        "Motor Skills": { "score": 80, "range": "Low" }
      },
      "clinical_notes": "Significant adaptive delays across all domains; greatest deficits in communication and social skills"
    }
  ],
  "diagnoses": [
    {
      "diagnosis": "Autism Spectrum Disorder, Level 2 (Requiring Substantial Support)",
      "dsm_code": "F84.0",
      "severity": "Moderate",
      "supporting_evidence": [
        "ADOS-2 score in autism range",
        "Significant social communication deficits",
        "Restricted and repetitive behaviors",
        "Sensory sensitivities"
      ]
    },
    {
      "diagnosis": "Language Disorder",
      "dsm_code": "F80.2",
      "severity": "Moderate",
      "supporting_evidence": [
        "Delayed language development",
        "Expressive language below age level",
        "Difficulty with pragmatic language"
      ]
    }
  ],
  "functional_impact": {
    "academic": "Not yet in school; will require significant classroom modifications and 1:1 support",
    "social": "Minimal peer interaction; does not initiate social contact; difficulty understanding social cues",
    "behavioral": "Anxiety-driven behaviors; difficulty with transitions; repetitive behaviors provide comfort",
    "adaptive": "Requires supervision for personal care; limited independence with daily living tasks"
  },
  "strengths": [
    "Visual spatial abilities",
    "Good gross motor skills",
    "Ability to maintain focus on preferred activities",
    "Responds well to structure and visual supports",
    "Can follow simple one-step directions when motivated"
  ],
  "recommendations_focus": [
    "ABA therapy and behavioral support",
    "Speech-language pathology",
    "Special education classroom placement",
    "Visual supports and communication systems",
    "Social skills training"
  ]
}
```

---

## Patient 2: ADHD - Combined Presentation - Middle School

```json
{
  "id": 2,
  "patient_info": {
    "first_name": "Marcus",
    "last_name": "Thompson",
    "birth_date": "2011-05-22",
    "age_years": 13,
    "age_months": 5,
    "gender": "Male",
    "city": "Southaven",
    "state": "Mississippi"
  },
  "family_info": {
    "parents": [
      { "name": "Christine Thompson", "relationship": "Mother" },
      { "name": "Robert Thompson", "relationship": "Father" }
    ],
    "siblings": [
      { "name": "Ashley Thompson", "age": 16, "gender": "Female" },
      { "name": "Joshua Thompson", "age": 10, "gender": "Male" }
    ],
    "household_members": 5,
    "family_history": [
      "Father diagnosed with ADHD",
      "Paternal grandmother had anxiety",
      "Maternal uncle had conduct disorder"
    ]
  },
  "referral_info": {
    "referral_source": "School counselor Ms. Sandra Williams",
    "reason_for_evaluation": "Poor academic performance, behavioral difficulties in classroom, impulsivity, and difficulty with sustained attention",
    "primary_concerns": [
      "Inattention and difficulty sustaining focus",
      "Impulsive behavior and decision-making",
      "Difficulty organizing materials and completing assignments",
      "Interrupting and talking out of turn in class",
      "Restlessness and fidgeting",
      "Failing grades despite average intelligence"
    ],
    "evaluation_date": "2024-10-10",
    "report_date": "2024-10-20"
  },
  "developmental_history": {
    "birth_type": "full-term",
    "weeks_gestation": 40,
    "birth_method": "vaginal",
    "pregnancy_complications": [],
    "motor_milestones": {
      "crawling_months": 6,
      "walking_months": 11
    },
    "language_milestones": {
      "first_word_months": 11,
      "first_sentences_years": 2,
      "current_language_level": "Age-appropriate expressive and receptive language"
    }
  },
  "medical_history": {
    "current_medications": ["Methylphenidate 10mg BID"],
    "chronic_conditions": [],
    "allergies": [],
    "sleep_patterns": "7-8 hours nightly; mother reports difficulty falling asleep; sometimes wakes early",
    "appetite": "Decreased appetite since starting stimulant medication; eats well with meals",
    "vision_hearing_screening": "August 2024: 20/20 vision both eyes; hearing within normal limits"
  },
  "behavioral_observations": {
    "appearance": "Well-groomed, age-appropriate casual clothing",
    "eye_contact": "Appropriate eye contact maintained during direct questions; less consistent during independent work",
    "affect": "Cheerful, cooperative; occasional frustration when tasks became difficult",
    "cooperation_level": "Generally cooperative; engaged well with examiner; some difficulty delaying gratification",
    "activity_level": "Restless; frequently changed position in chair; fidgeted with test materials",
    "notable_behaviors": [
      "Tapped pencil throughout testing",
      "Jiggled legs while seated",
      "Impulsively called out answers before questions were completed",
      "Showed brief frustration when told he answered too quickly",
      "Appeared distracted by sounds in hallway"
    ]
  },
  "test_results": [
    {
      "test_name": "Conners Continuous Performance Test-3 (CPT-3)",
      "composite_score": null,
      "percentile": null,
      "score_range": "Elevated (7 atypical T-scores)",
      "subtests": {
        "Omissions": { "score": 68, "range": "High" },
        "Commissions": { "score": 72, "range": "High" },
        "Hit Reaction Time": { "score": 65, "range": "Elevated" },
        "Variability": { "score": 71, "range": "High" }
      },
      "clinical_notes": "Performance consistent with ADHD; difficulty with sustained attention and impulse control"
    },
    {
      "test_name": "Wechsler Intelligence Scale for Children-V (WISC-V)",
      "composite_score": 102,
      "percentile": 55,
      "score_range": "Average",
      "subtests": {
        "Verbal Comprehension": { "score": 105, "range": "Average" },
        "Visual Spatial": { "score": 100, "range": "Average" },
        "Fluid Reasoning": { "score": 103, "range": "Average" },
        "Working Memory": { "score": 95, "range": "Average" },
        "Processing Speed": { "score": 92, "range": "Average" }
      },
      "clinical_notes": "Overall cognitive abilities average; slight weakness in processing speed relative to other abilities"
    },
    {
      "test_name": "Conners Rating Scale (Parent and Teacher Forms)",
      "composite_score": null,
      "percentile": null,
      "score_range": "Clinically Significant",
      "subtests": {
        "Inattention/Executive Dysfunction": { "score": 75, "range": "Clinically Significant" },
        "Hyperactivity": { "score": 68, "range": "At-Risk" },
        "Impulsivity": { "score": 72, "range": "Clinically Significant" }
      },
      "clinical_notes": "Both parent and teacher ratings indicate significant ADHD symptoms"
    },
    {
      "test_name": "Wechsler Individual Achievement Test-4 (WIAT-4)",
      "composite_score": 98,
      "percentile": 45,
      "score_range": "Average",
      "subtests": {
        "Reading": { "score": 100, "range": "Average" },
        "Mathematics": { "score": 96, "range": "Average" },
        "Written Expression": { "score": 94, "range": "Average" }
      },
      "clinical_notes": "Academic skills average overall; suggests ADHD impacting academic performance despite adequate ability"
    }
  ],
  "diagnoses": [
    {
      "diagnosis": "Attention-Deficit/Hyperactivity Disorder, Combined Presentation",
      "dsm_code": "F90.2",
      "severity": "Moderate",
      "supporting_evidence": [
        "CPT-3 performance indicating attention deficits and impulsivity",
        "Parent and teacher ratings in clinically significant ranges",
        "Behavioral observations of fidgeting, impulsivity, and distractibility",
        "Academic underperformance despite average cognitive ability",
        "Family history of ADHD in father"
      ]
    }
  ],
  "functional_impact": {
    "academic": "Grades declining despite average intelligence; difficulty completing homework; careless mistakes on assignments",
    "social": "Some difficulty with peer relationships due to impulsivity and interrupting; generally good social skills when regulated",
    "behavioral": "Frequent disciplinary actions at school for classroom disruption; argues with teachers and parents",
    "adaptive": "Difficulty with organization and planning; needs reminders for daily tasks; poor time management"
  },
  "strengths": [
    "Average to above-average intelligence",
    "Athletic abilities; plays soccer and basketball",
    "Strong verbal comprehension skills",
    "Friendly and likable personality when properly regulated",
    "Good gross motor coordination"
  ],
  "recommendations_focus": [
    "Medication optimization and monitoring",
    "School accommodations and modifications",
    "Executive functioning support",
    "Behavioral interventions",
    "Parent and teacher education on ADHD"
  ]
}
```

---

## Patient 3: Specific Learning Disorder in Reading (Dyslexia) - Upper Elementary

```json
{
  "id": 3,
  "patient_info": {
    "first_name": "Sophie",
    "last_name": "Martinez",
    "birth_date": "2016-08-10",
    "age_years": 8,
    "age_months": 2,
    "gender": "Female",
    "city": "Memphis",
    "state": "Tennessee"
  },
  "family_info": {
    "parents": [
      { "name": "Isabella Martinez", "relationship": "Mother" },
      { "name": "Carlos Martinez", "relationship": "Father" }
    ],
    "siblings": [
      { "name": "Diego Martinez", "age": 11, "gender": "Male" }
    ],
    "household_members": 4,
    "family_history": [
      "Father has history of reading difficulties",
      "Paternal grandfather had similar struggles"
    ]
  },
  "referral_info": {
    "referral_source": "School psychologist Dr. Lisa Patterson",
    "reason_for_evaluation": "Significant reading difficulties despite good intelligence and intervention; suspected dyslexia",
    "primary_concerns": [
      "Reading significantly below grade level",
      "Difficulty with phonological processing and decoding",
      "Slow reading fluency",
      "Spelling difficulties",
      "Reading avoidance and frustration",
      "Strong verbal skills but struggling with written words"
    ],
    "evaluation_date": "2024-09-28",
    "report_date": "2024-10-08"
  },
  "developmental_history": {
    "birth_type": "full-term",
    "weeks_gestation": 39,
    "birth_method": "vaginal",
    "pregnancy_complications": [],
    "motor_milestones": {
      "crawling_months": 7,
      "walking_months": 12
    },
    "language_milestones": {
      "first_word_months": 10,
      "first_sentences_years": 1.5,
      "current_language_level": "Age-appropriate spoken language; strong vocabulary"
    }
  },
  "medical_history": {
    "current_medications": [],
    "chronic_conditions": [],
    "allergies": ["Seasonal allergies"],
    "sleep_patterns": "Sleeps 9-10 hours per night; no reported sleep difficulties",
    "appetite": "Good appetite; eats well-balanced diet",
    "vision_hearing_screening": "September 2024: Vision corrected to 20/20 with glasses; hearing normal"
  },
  "behavioral_observations": {
    "appearance": "Well-groomed, age-appropriate; wearing glasses",
    "eye_contact": "Good eye contact; engaged with examiner",
    "affect": "Pleasant affect; showed frustration when asked to read difficult material",
    "cooperation_level": "Cooperative and eager to please; some anxiety around reading tasks",
    "activity_level": "Appropriate activity level; no fidgeting noted",
    "notable_behaviors": [
      "Became noticeably anxious when shown reading passages",
      "Made excuses to avoid reading tasks",
      "Misread many words; appeared to guess at words",
      "Read very slowly, word-by-word",
      "Easily frustrated when making mistakes"
    ]
  },
  "test_results": [
    {
      "test_name": "Comprehensive Test of Phonological Processing-2 (CTOPP-2)",
      "composite_score": null,
      "percentile": null,
      "score_range": "Mixed",
      "subtests": {
        "Phonological Awareness": { "score": 92, "range": "Average" },
        "Phonological Memory": { "score": 78, "range": "Low Average" },
        "Rapid Naming": { "score": 75, "range": "Low Average" }
      },
      "clinical_notes": "Significant weakness in rapid naming; suggests phonological processing deficit"
    },
    {
      "test_name": "Wechsler Intelligence Scale for Children-V (WISC-V)",
      "composite_score": 106,
      "percentile": 66,
      "score_range": "Average to High Average",
      "subtests": {
        "Verbal Comprehension": { "score": 112, "range": "High Average" },
        "Visual Spatial": { "score": 104, "range": "Average" },
        "Fluid Reasoning": { "score": 109, "range": "Average to High" },
        "Working Memory": { "score": 103, "range": "Average" },
        "Processing Speed": { "score": 98, "range": "Average" }
      },
      "clinical_notes": "Overall intelligence in average to high average range; verbal comprehension a relative strength"
    },
    {
      "test_name": "Wechsler Individual Achievement Test-4 (WIAT-4)",
      "composite_score": null,
      "percentile": null,
      "score_range": "Variable",
      "subtests": {
        "Word Reading": { "score": 78, "range": "Low Average" },
        "Pseudoword Decoding": { "score": 72, "range": "Low" },
        "Reading Comprehension": { "score": 85, "range": "Low Average" },
        "Spelling": { "score": 76, "range": "Low" },
        "Math": { "score": 102, "range": "Average" }
      },
      "clinical_notes": "Significant discrepancy between math (average) and reading skills (low average); pattern consistent with dyslexia"
    },
    {
      "test_name": "Test of Word Reading Efficiency-2 (TOWRE-2)",
      "composite_score": 74,
      "percentile": 4,
      "score_range": "Very Low",
      "subtests": {
        "Sight Word Efficiency": { "score": 77, "range": "Low" },
        "Phonemic Decoding Efficiency": { "score": 71, "range": "Very Low" }
      },
      "clinical_notes": "Reading fluency significantly impaired; notable difficulty with phonemic decoding"
    }
  ],
  "diagnoses": [
    {
      "diagnosis": "Specific Learning Disorder with Impairment in Reading (Dyslexia)",
      "dsm_code": "F81.0",
      "severity": "Moderate",
      "supporting_evidence": [
        "Significant discrepancy between IQ (above average) and reading achievement (below average)",
        "Deficiency in phonological processing and rapid naming",
        "Poor reading fluency and decoding",
        "Spelling difficulties",
        "Family history of reading difficulties"
      ]
    }
  ],
  "functional_impact": {
    "academic": "Reading 2-3 years below grade level; struggles across content areas that require reading",
    "social": "Some peer teasing about reading difficulties; anxiety about oral reading in class",
    "behavioral": "Avoidance of reading; frustration and emotional dysregulation when forced to read",
    "adaptive": "Limited independent reading for pleasure; relies on others for reading support"
  },
  "strengths": [
    "Above-average intelligence overall",
    "Strong verbal skills and vocabulary",
    "Strong math abilities",
    "Good reasoning skills",
    "Creative and artistic abilities",
    "Cooperative and motivated to improve"
  ],
  "recommendations_focus": [
    "Dyslexia-specific interventions (multisensory approaches)",
    "Reading remediation with phonological emphasis",
    "Classroom accommodations",
    "Assistive technology",
    "Counseling for reading anxiety"
  ]
}
```

---

## Patient 4: Intellectual Disability - Moderate Level

```json
{
  "id": 4,
  "patient_info": {
    "first_name": "Joshua",
    "last_name": "Williams",
    "birth_date": "2014-02-18",
    "age_years": 10,
    "age_months": 8,
    "gender": "Male",
    "city": "Clarksdale",
    "state": "Mississippi"
  },
  "family_info": {
    "parents": [
      { "name": "Angela Williams", "relationship": "Mother" },
      { "name": "DeShawn Williams", "relationship": "Father" }
    ],
    "siblings": [
      { "name": "LaKeisha Williams", "age": 14, "gender": "Female" },
      { "name": "Malik Williams", "age": 8, "gender": "Male" }
    ],
    "household_members": 5,
    "family_history": [
      "No known genetic conditions",
      "Possible alcohol use during pregnancy",
      "Complicated delivery with low Apgar scores"
    ]
  },
  "referral_info": {
    "referral_source": "School special education team",
    "reason_for_evaluation": "Reevaluation for intellectual disability; assessment of current functioning and service needs",
    "primary_concerns": [
      "Significant cognitive delays across all domains",
      "Adaptive behavior deficits in self-care and social skills",
      "Academic skills at 50-60% of grade level expectation",
      "Limited independence in daily activities",
      "Behavioral challenges in unstructured environments"
    ],
    "evaluation_date": "2024-10-12",
    "report_date": "2024-10-22"
  },
  "developmental_history": {
    "birth_type": "full-term",
    "weeks_gestation": 38,
    "birth_method": "vaginal",
    "pregnancy_complications": [
      "Maternal alcohol use",
      "Difficult delivery; low Apgar scores (4 at 1 minute, 6 at 5 minutes)"
    ],
    "motor_milestones": {
      "crawling_months": 12,
      "walking_months": 20
    },
    "language_milestones": {
      "first_word_months": 18,
      "first_sentences_years": 4,
      "current_language_level": "2-3 word phrases; difficulty with complex language and abstract concepts"
    }
  },
  "medical_history": {
    "current_medications": [],
    "chronic_conditions": ["Mild cerebral palsy affecting gait"],
    "allergies": [],
    "sleep_patterns": "10-11 hours nightly; uses weighted blanket",
    "appetite": "Good appetite; prefers simple foods",
    "vision_hearing_screening": "August 2024: Vision slightly reduced; hearing normal; glasses prescribed"
  },
  "behavioral_observations": {
    "appearance": "Well-groomed; slightly reduced muscle tone on left side; gait slightly affected",
    "eye_contact": "Inconsistent eye contact; required prompting to engage visually",
    "affect": "Cheerful when engaged with preferred activities; frustration with difficult tasks",
    "cooperation_level": "Cooperative with structure and one-on-one attention; challenges with transitions",
    "activity_level": "Appropriate activity level for age",
    "notable_behaviors": [
      "Struggled with understanding multi-step directions",
      "Required frequent redirection and prompting",
      "Showed enthusiasm for concrete, hands-on activities",
      "Demonstrated difficulty with symbolic/abstract thinking",
      "Became upset when tasks were too difficult"
    ]
  },
  "test_results": [
    {
      "test_name": "Stanford-Binet Intelligence Scales, Fifth Edition (SB-5)",
      "composite_score": 48,
      "percentile": 0.3,
      "score_range": "Extremely Low",
      "subtests": {
        "Fluid Reasoning": { "score": 25, "range": "Extremely Low" },
        "Knowledge": { "score": 30, "range": "Extremely Low" },
        "Quantitative Reasoning": { "score": 28, "range": "Extremely Low" },
        "Visual-Spatial Processing": { "score": 35, "range": "Very Low" },
        "Working Memory": { "score": 26, "range": "Extremely Low" }
      },
      "clinical_notes": "IQ in extremely low range consistent with moderate intellectual disability"
    },
    {
      "test_name": "Vineland-3 Adaptive Behavior Scales",
      "composite_score": 51,
      "percentile": 0.5,
      "score_range": "Very Low",
      "subtests": {
        "Communication": { "score": 48, "range": "Very Low" },
        "Daily Living Skills": { "score": 55, "range": "Low" },
        "Socialization": { "score": 49, "range": "Very Low" },
        "Motor Skills": { "score": 58, "range": "Low" }
      },
      "clinical_notes": "Significant deficits across all adaptive domains; requires substantial support"
    },
    {
      "test_name": "Woodcock-Johnson IV Tests of Achievement",
      "composite_score": null,
      "percentile": null,
      "score_range": "Very Low",
      "subtests": {
        "Letter-Word Identification": { "score": 72, "range": "Low" },
        "Math Calculation": { "score": 68, "range": "Very Low" },
        "Spelling": { "score": 70, "range": "Low" }
      },
      "clinical_notes": "Academic skills consistent with intellectual disability; significant support needed"
    }
  ],
  "diagnoses": [
    {
      "diagnosis": "Intellectual Developmental Disorder, Moderate",
      "dsm_code": "F71",
      "severity": "Moderate",
      "supporting_evidence": [
        "IQ score of 48 (>2 SD below mean)",
        "Significant deficits in adaptive behavior across communication, daily living skills, and socialization",
        "Early developmental delays",
        "Need for substantial support across settings"
      ]
    },
    {
      "diagnosis": "Cerebral Palsy (Mild)",
      "dsm_code": "G80.9",
      "severity": "Mild",
      "supporting_evidence": [
        "History of complicated birth",
        "Muscle tone abnormalities",
        "Gait affected"
      ]
    }
  ],
  "functional_impact": {
    "academic": "Academic skills 4-5 years below grade level; requires substantial special education support",
    "social": "Limited peer friendships; difficulty understanding social rules; needs adult facilitation for interactions",
    "behavioral": "Some behavioral challenges when frustrated; generally cooperative with structure",
    "adaptive": "Requires supervision for personal care; limited independence with dressing, toileting; needs help with meals"
  },
  "strengths": [
    "Cheerful personality and desire to please",
    "Responds well to concrete, hands-on instruction",
    "Good gross motor skills despite mild cerebral palsy",
    "Engaged and motivated when appropriately supported",
    "Forms attachments with caregivers"
  ],
  "recommendations_focus": [
    "Appropriate special education classroom (separate special needs)",
    "Life skills and vocational training",
    "Speech and language therapy",
    "Occupational and physical therapy",
    "Transition planning for post-secondary life",
    "Family support services"
  ]
}
```

---

## Patient 5: Anxiety Disorder - Adolescent

```json
{
  "id": 5,
  "patient_info": {
    "first_name": "Olivia",
    "last_name": "Chen",
    "birth_date": "2009-11-30",
    "age_years": 14,
    "age_months": 11,
    "gender": "Female",
    "city": "Memphis",
    "state": "Tennessee"
  },
  "family_info": {
    "parents": [
      { "name": "Dr. Wei Chen", "relationship": "Mother" },
      { "name": "Jennifer Chen", "relationship": "Stepmother" }
    ],
    "siblings": [],
    "household_members": 3,
    "family_history": [
      "Mother diagnosed with generalized anxiety disorder",
      "Paternal grandmother had panic attacks",
      "Father's side: perfectionistic tendencies"
    ]
  },
  "referral_info": {
    "referral_source": "Primary care physician Dr. Robert Patel",
    "reason_for_evaluation": "Excessive worry, panic symptoms, academic impacts from anxiety",
    "primary_concerns": [
      "Persistent worry about grades and academic performance",
      "Panic attacks with physical symptoms",
      "Avoidance of social situations and presentations",
      "Sleep disturbance due to worry",
      "Physical complaints (stomachaches, headaches)",
      "Perfectionism and fear of failure"
    ],
    "evaluation_date": "2024-10-05",
    "report_date": "2024-10-15"
  },
  "developmental_history": {
    "birth_type": "full-term",
    "weeks_gestation": 39,
    "birth_method": "vaginal",
    "pregnancy_complications": [],
    "motor_milestones": {
      "crawling_months": 6,
      "walking_months": 12
    },
    "language_milestones": {
      "first_word_months": 10,
      "first_sentences_years": 2,
      "current_language_level": "Age-appropriate and articulate"
    }
  },
  "medical_history": {
    "current_medications": [],
    "chronic_conditions": [],
    "allergies": [],
    "sleep_patterns": "6-7 hours per night; difficulty falling asleep due to racing thoughts; reports nightmares about tests/failure",
    "appetite": "Some appetite suppression; reports stomach upset when anxious",
    "vision_hearing_screening": "September 2024: 20/20 vision bilaterally; hearing normal"
  },
  "behavioral_observations": {
    "appearance": "Well-groomed, appropriate clothing; appeared nervous; fidgeted with hands",
    "eye_contact": "Appropriate eye contact; occasional nervous laughing",
    "affect": "Anxious affect; appeared tense; smiled only when reassured",
    "cooperation_level": "Cooperative; expressed worry about getting answers 'right' on tests",
    "activity_level": "Slightly elevated muscle tension; nervous fidgeting",
    "notable_behaviors": [
      "Wringing hands when discussing anxiety",
      "Seeking reassurance repeatedly ('Did I do that right?')",
      "Deep breathing when discussing panic symptoms",
      "Apologetic about minor mistakes",
      "Expressed worry about how examiner was perceiving her performance"
    ]
  },
  "test_results": [
    {
      "test_name": "Generalized Anxiety Disorder-7 (GAD-7)",
      "composite_score": 18,
      "percentile": null,
      "score_range": "Moderate to Severe Anxiety",
      "subtests": null,
      "clinical_notes": "Significant anxiety symptoms; met threshold for GAD diagnosis"
    },
    {
      "test_name": "Screen for Child Anxiety Related Disorders (SCARED)",
      "composite_score": 32,
      "percentile": null,
      "score_range": "Clinically Significant",
      "subtests": {
        "Panic/Somatic": { "score": 10, "range": "Elevated" },
        "Generalized Anxiety": { "score": 14, "range": "Elevated" },
        "Separation Anxiety": { "score": 5, "range": "Normal" },
        "Social Phobia": { "score": 3, "range": "Normal" }
      },
      "clinical_notes": "Elevations in panic symptoms and generalized anxiety; social anxiety absent"
    },
    {
      "test_name": "Wechsler Intelligence Scale for Children-V (WISC-V)",
      "composite_score": 115,
      "percentile": 84,
      "score_range": "High Average",
      "subtests": {
        "Verbal Comprehension": { "score": 120, "range": "Superior" },
        "Visual Spatial": { "score": 110, "range": "High Average" },
        "Fluid Reasoning": { "score": 116, "range": "High Average" },
        "Working Memory": { "score": 108, "range": "Average" },
        "Processing Speed": { "score": 109, "range": "Average" }
      },
      "clinical_notes": "Above-average overall intelligence; strength in verbal reasoning; working memory adequate"
    },
    {
      "test_name": "Wechsler Individual Achievement Test-4 (WIAT-4)",
      "composite_score": 109,
      "percentile": 73,
      "score_range": "Average to High Average",
      "subtests": {
        "Reading": { "score": 112, "range": "High Average" },
        "Mathematics": { "score": 107, "range": "Average to High" },
        "Written Expression": { "score": 105, "range": "Average" }
      },
      "clinical_notes": "Academic skills commensurate with ability; anxiety not significantly impacting academic performance"
    }
  ],
  "diagnoses": [
    {
      "diagnosis": "Generalized Anxiety Disorder",
      "dsm_code": "F41.1",
      "severity": "Moderate",
      "supporting_evidence": [
        "Excessive worry about academic performance for >6 months",
        "Physical symptoms: sleep disturbance, stomachaches, headaches",
        "Difficulty controlling worry",
        "Functional impairment in social and academic domains",
        "Family history of anxiety",
        "GAD-7 and SCARED scores in clinically significant range"
      ]
    }
  ],
  "functional_impact": {
    "academic": "Academic performance maintained at high level due to perfectionism; significant emotional cost; avoids presentations",
    "social": "Some avoidance of group activities and social events; limited close friendships; difficulty relaxing with peers",
    "behavioral": "Perfectionism and excessive checking of work; avoidance of challenging situations",
    "adaptive": "Sleep difficulties; some somatic complaints; reliance on reassurance-seeking"
  },
  "strengths": [
    "Above-average intelligence",
    "Strong academic performance and motivation",
    "Articulate and verbal",
    "Motivated for treatment",
    "Good insight into anxiety symptoms",
    "Strong family support"
  ],
  "recommendations_focus": [
    "Cognitive-behavioral therapy (CBT) for anxiety",
    "Psychoeducation about anxiety and panic",
    "Relaxation and coping skills training",
    "Possible medication consultation with psychiatrist",
    "School accommodations",
    "Family counseling to address family dynamics"
  ]
}
```

---

## Patient 6: Conduct Disorder - Adolescent

```json
{
  "id": 6,
  "patient_info": {
    "first_name": "Brandon",
    "last_name": "Jackson",
    "birth_date": "2008-06-15",
    "age_years": 16,
    "age_months": 4,
    "gender": "Male",
    "city": "Memphis",
    "state": "Tennessee"
  },
  "family_info": {
    "parents": [
      { "name": "Monica Jackson", "relationship": "Mother" }
    ],
    "siblings": [
      { "name": "Tanya Jackson", "age": 19, "gender": "Female" }
    ],
    "household_members": 3,
    "family_history": [
      "Father incarcerated for assault",
      "Maternal uncle history of substance abuse",
      "Multiple family members with legal involvement"
    ]
  },
  "referral_info": {
    "referral_source": "Juvenile court; mandatory evaluation",
    "reason_for_evaluation": "Assessment following arrest for vandalism; evaluation of conduct problems and risk",
    "primary_concerns": [
      "Multiple rule violations at home and school",
      "Aggressive behavior toward peers and authority figures",
      "Property destruction and vandalism",
      "Theft and lying",
      "Peer group of delinquent youth",
      "School attendance problems and suspensions"
    ],
    "evaluation_date": "2024-10-08",
    "report_date": "2024-10-18"
  },
  "developmental_history": {
    "birth_type": "full-term",
    "weeks_gestation": 40,
    "birth_method": "vaginal",
    "pregnancy_complications": ["Maternal substance use during pregnancy"],
    "motor_milestones": {
      "crawling_months": 8,
      "walking_months": 15
    },
    "language_milestones": {
      "first_word_months": 13,
      "first_sentences_years": 2.5,
      "current_language_level": "Age-appropriate vocabulary; uses profanity frequently"
    }
  },
  "medical_history": {
    "current_medications": [],
    "chronic_conditions": [],
    "allergies": [],
    "sleep_patterns": "Irregular sleep; reports 5-6 hours per night; stays up late with peers",
    "appetite": "Normal appetite; poor nutritional habits",
    "vision_hearing_screening": "September 2024: Vision 20/25 both eyes without correction; hearing normal"
  },
  "behavioral_observations": {
    "appearance": "Wore oversized clothing with gang-style appearance; various tattoos",
    "eye_contact": "Inconsistent eye contact; seemed suspicious of examiner",
    "affect": "Guarded; occasional angry outbursts; rarely smiled",
    "cooperation_level": "Minimally cooperative; appeared forced to participate; answered questions reluctantly",
    "activity_level": "Restless; frequently changed position; appeared agitated",
    "notable_behaviors": [
      "Used profanity throughout session",
      "Displayed anger when questioned about illegal activity",
      "Denied responsibility for actions despite evidence",
      "Made threats (minor, toward no specific person)",
      "Expressed callousness about others' feelings",
      "Bragged about negative peer interactions"
    ]
  },
  "test_results": [
    {
      "test_name": "Conners Rating Scale (Mother Report)",
      "composite_score": null,
      "percentile": null,
      "score_range": "Clinically Significant",
      "subtests": {
        "Inattention/Executive Dysfunction": { "score": 72, "range": "Clinically Significant" },
        "Oppositional Defiant": { "score": 76, "range": "Clinically Significant" },
        "Hyperactivity": { "score": 58, "range": "At-Risk" }
      },
      "clinical_notes": "Significant oppositional and defiant behaviors reported"
    },
    {
      "test_name": "Wechsler Intelligence Scale for Children-V (WISC-V)",
      "composite_score": 98,
      "percentile": 45,
      "score_range": "Average",
      "subtests": {
        "Verbal Comprehension": { "score": 96, "range": "Average" },
        "Visual Spatial": { "score": 102, "range": "Average" },
        "Fluid Reasoning": { "score": 99, "range": "Average" },
        "Working Memory": { "score": 94, "range": "Average" },
        "Processing Speed": { "score": 101, "range": "Average" }
      },
      "clinical_notes": "Overall cognitive abilities average; no cognitive limitations explaining behavior"
    },
    {
      "test_name": "Youth Outcome Questionnaire (YOQ) - Mother Report",
      "composite_score": 108,
      "percentile": null,
      "score_range": "Clinically Significant",
      "subtests": {
        "Intrapersonal Distress": { "score": 75, "range": "Elevated" },
        "Interpersonal Relations": { "score": 82, "range": "Elevated" },
        "Social Problems": { "score": 88, "range": "Elevated" },
        "Behavioral Dysfunction": { "score": 91, "range": "Elevated" }
      },
      "clinical_notes": "Significant emotional and behavioral problems across all domains"
    },
    {
      "test_name": "PCL-5 (PTSD Checklist)",
      "composite_score": 24,
      "percentile": null,
      "score_range": "Below threshold",
      "subtests": null,
      "clinical_notes": "No clinically significant PTSD symptoms despite trauma exposure"
    }
  ],
  "diagnoses": [
    {
      "diagnosis": "Conduct Disorder, Adolescent-Onset Type, Moderate",
      "dsm_code": "F91.1",
      "severity": "Moderate",
      "supporting_evidence": [
        "Aggression and threats toward others",
        "Destruction of property (vandalism)",
        "Theft and lying",
        "Violation of others' rights",
        "Persistent pattern for >12 months",
        "Significant functional impairment",
        "Poor peer relationships"
      ]
    },
    {
      "diagnosis": "Oppositional Defiant Disorder",
      "dsm_code": "F91.3",
      "severity": "Moderate",
      "supporting_evidence": [
        "Frequent arguing with authority figures",
        "Defiance of rules",
        "Angry and resentful attitude",
        "Spiteful behavior"
      ]
    }
  ],
  "functional_impact": {
    "academic": "Multiple school suspensions; currently expelled pending hearing; failing grades",
    "social": "Associations with delinquent peers; no positive peer relationships; aggressive with adults",
    "behavioral": "Legal involvement (arrest for vandalism); repeated rule violations; aggression",
    "adaptive": "Poor self-care; substance experimentation; risky behaviors"
  },
  "strengths": [
    "Average intelligence",
    "Physical capability/athleticism",
    "Organizational skills within peer group",
    "Artistic/creative abilities (shown in graffiti art)"
  ],
  "recommendations_focus": [
    "Intensive supervision and monitoring",
    "Substance abuse evaluation and treatment if indicated",
    "Psychiatric evaluation for medication management of oppositional/aggressive behavior",
    "Alternative educational placement (therapeutic school or juvenile justice program)",
    "Family therapy and parent involvement",
    "Mentoring or therapeutic relationship with positive adult",
    "Residential treatment consideration depending on legal outcome"
  ]
}
```

---

## Patient 7: Depression and Suicidal Ideation - Adolescent

```json
{
  "id": 7,
  "patient_info": {
    "first_name": "Hannah",
    "last_name": "Peterson",
    "birth_date": "2008-12-08",
    "age_years": 15,
    "age_months": 10,
    "gender": "Female",
    "city": "Southaven",
    "state": "Mississippi"
  },
  "family_info": {
    "parents": [
      { "name": "Karen Peterson", "relationship": "Mother" },
      { "name": "Michael Peterson", "relationship": "Father" }
    ],
    "siblings": [
      { "name": "Emily Peterson", "age": 13, "gender": "Female" }
    ],
    "household_members": 4,
    "family_history": [
      "Maternal grandmother had depression and attempted suicide",
      "Father struggles with anger management",
      "Recent family stressor: parents' marital conflict"
    ]
  },
  "referral_info": {
    "referral_source": "School counselor after disclosure of suicidal ideation",
    "reason_for_evaluation": "Assessment of depressive symptoms and suicidal risk; treatment planning",
    "primary_concerns": [
      "Depressed mood for 4+ months",
      "Hopelessness and thoughts that life is not worth living",
      "Suicidal ideation with vague plan",
      "Loss of interest in activities",
      "Difficulty concentrating",
      "Feelings of worthlessness",
      "Recent social withdrawal",
      "Sleep disturbance (hypersomnia)"
    ],
    "evaluation_date": "2024-10-10",
    "report_date": "2024-10-17"
  },
  "developmental_history": {
    "birth_type": "full-term",
    "weeks_gestation": 38,
    "birth_method": "vaginal",
    "pregnancy_complications": [],
    "motor_milestones": {
      "crawling_months": 7,
      "walking_months": 12
    },
    "language_milestones": {
      "first_word_months": 10,
      "first_sentences_years": 2,
      "current_language_level": "Age-appropriate; articulate"
    }
  },
  "medical_history": {
    "current_medications": [],
    "chronic_conditions": [],
    "allergies": [],
    "sleep_patterns": "Sleeping 10-12 hours per night; difficulty waking for school; daytime fatigue",
    "appetite": "Decreased appetite; weight loss of 8 pounds in past 2 months",
    "vision_hearing_screening": "September 2024: Vision and hearing normal; normal physical exam"
  },
  "behavioral_observations": {
    "appearance": "Appeared thin; wore dark, oversized clothing; poor grooming (unkempt hair)",
    "eye_contact": "Minimal eye contact; looked down frequently",
    "affect": "Depressed affect; flat; occasionally tearful when discussing feelings of worthlessness",
    "cooperation_level": "Cooperative but slow to respond; appeared fatigued",
    "activity_level": "Psychomotor slowing; moved slowly; minimal spontaneous movement",
    "notable_behaviors": [
      "Sighing frequently",
      "Speaking in whispers",
      "Appeared hopeless when discussing future",
      "Became tearful when discussing parents' conflict",
      "Slow to respond to questions",
      "Expressed guilt about family problems"
    ]
  },
  "test_results": [
    {
      "test_name": "Patient Health Questionnaire-9 (PHQ-9)",
      "composite_score": 23,
      "percentile": null,
      "score_range": "Moderately Severe Depression",
      "subtests": null,
      "clinical_notes": "Scores indicate major depressive episode; suicidal ideation endorsed"
    },
    {
      "test_name": "Generalized Anxiety Disorder-7 (GAD-7)",
      "composite_score": 8,
      "percentile": null,
      "score_range": "Mild Anxiety",
      "subtests": null,
      "clinical_notes": "Anxiety present but not primary concern"
    },
    {
      "test_name": "Beck Depression Inventory-II (BDI-II)",
      "composite_score": 31,
      "percentile": null,
      "score_range": "Moderate Depression",
      "subtests": null,
      "clinical_notes": "Symptoms of hopelessness, worthlessness, and suicidal ideation endorsed"
    },
    {
      "test_name": "Wechsler Intelligence Scale for Children-V (WISC-V)",
      "composite_score": 104,
      "percentile": 61,
      "score_range": "Average",
      "subtests": {
        "Verbal Comprehension": { "score": 105, "range": "Average" },
        "Visual Spatial": { "score": 104, "range": "Average" },
        "Fluid Reasoning": { "score": 102, "range": "Average" },
        "Working Memory": { "score": 101, "range": "Average" },
        "Processing Speed": { "score": 104, "range": "Average" }
      },
      "clinical_notes": "Cognitive abilities average; depression not attributed to cognitive impairment"
    }
  ],
  "diagnoses": [
    {
      "diagnosis": "Major Depressive Disorder, Single Episode, Moderate",
      "dsm_code": "F32.1",
      "severity": "Moderate",
      "supporting_evidence": [
        "Depressed mood for 4+ months",
        "Loss of interest in activities",
        "Sleep disturbance (hypersomnia)",
        "Appetite and weight loss",
        "Fatigue and lack of energy",
        "Feelings of worthlessness and guilt",
        "Difficulty concentrating",
        "Recurrent thoughts of death; suicidal ideation without specific plan",
        "Functional impairment in school and social domains"
      ]
    }
  ],
  "functional_impact": {
    "academic": "Grades declining; missing assignments; increased school absences",
    "social": "Social withdrawal; loss of friendships; isolation from peers; no longer participates in school activities",
    "behavioral": "Irritability with family; difficulty with motivation; crying episodes",
    "adaptive": "Poor self-care; neglects hygiene; sleeping excessively"
  },
  "strengths": [
    "Average intelligence",
    "Previously engaged in creative writing and art (now stopped)",
    "Close relationship with mother",
    "Cooperative and honest about symptoms",
    "Willing to engage in treatment"
  ],
  "recommendations_focus": [
    "Psychiatric evaluation for antidepressant medication",
    "Individual psychotherapy (CBT or IPT)",
    "Safety planning and suicide risk monitoring",
    "Family therapy to address family stressors",
    "School involvement and possible academic accommodations",
    "Regular psychiatric follow-up (every 2 weeks initially)",
    "Possible hospitalization if suicidal risk increases",
    "Sleep hygiene and healthy habits"
  ]
}
```

---

## Remaining Patients (8-12)

Due to space limitations, here are brief summaries of 5 additional patient profiles:

### Patient 8: Selective Mutism - Elementary Age
- Age: 7 years old
- Primary concern: Complete silence in school; normal communication at home
- Diagnoses: Selective Mutism, Anxiety Disorder
- Location: Memphis, TN

### Patient 9: Adjustment Disorder - Post-Parental Divorce
- Age: 11 years old
- Primary concern: Emotional dysregulation following parents' separation
- Diagnoses: Adjustment Disorder with Mixed Disturbance
- Location: Clarksdale, MS

### Patient 10: Tourette Syndrome - Adolescent
- Age: 14 years old
- Primary concern: Multiple motor and vocal tics; social embarrassment
- Diagnoses: Tourette Syndrome, Anxiety Disorder
- Location: Southaven, MS

### Patient 11: Oppositional Defiant Disorder - Early Elementary
- Age: 6 years old
- Primary concern: Pervasive defiance, aggression; kindergarten dismissal
- Diagnoses: Oppositional Defiant Disorder, Disruptive Mood Dysregulation Disorder
- Location: Memphis, TN

### Patient 12: Gifted Student with Anxiety
- Age: 12 years old
- Primary concern: Perfectionism, anxiety, social difficulties despite high intelligence
- Diagnoses: Generalized Anxiety Disorder, Specific Phobia (Performance/Evaluation)
- Location: Memphis, TN

---

## Implementation Notes

1. **Using This Data:**
   - Copy each patient JSON structure
   - Input into the PsychReportGenerator component
   - Click "Generate Complete Report"
   - Export to text/Word document

2. **Customization:**
   - Modify patient data to match your cases
   - Adjust test scores based on actual administration
   - Add specific behavioral observations from testing
   - Include local service provider information

3. **Clinical Review:**
   - All reports must be reviewed by a licensed psychologist
   - Clinical judgment should override AI outputs
   - Verify all data accuracy before distribution
   - Ensure recommendations are appropriate for the patient

4. **Ethical Use:**
   - Use only with actual patients and families
   - Maintain confidentiality and HIPAA compliance
   - Obtain appropriate consent/authorization
   - Ensure reports support quality clinical care
