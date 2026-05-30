# Section 1.1 — Entity Formation Documents
## Integrated Healthcare MSO, Inc. | Corporate Document Index

---

## Entities Covered

| Entity ID | Legal Name | Type | State | Role |
|-----------|-----------|------|-------|------|
| IHM-PARENT | Integrated Healthcare MSO, Inc. | For-Profit Corporation | TX | Parent Company |
| MSO-TX | MSO-Texas LLC | LLC | TX | Regional MSO |
| MSO-REGIONAL | MSO-Regional Entities LLC | LLC | TBD | Multi-State MSO |

---

## Document Inventory

| # | Document | Entity | Template | Tracker | Status |
|---|----------|--------|----------|---------|--------|
| DOC-001 | Articles of Incorporation | IHM-PARENT | [View](templates/articles_of_incorporation_IHM.md) | — | Pending |
| DOC-002 | Operating Agreement | MSO-TX | [View](templates/operating_agreement_MSO_TX.md) | — | Pending |
| DOC-003 | Operating Agreement | MSO-REGIONAL | [View](templates/operating_agreement_MSO_regional.md) | — | Pending |
| DOC-004 | EIN Applications & Confirmations | ALL | — | [View](tracking/ein_registry.json) | Pending |
| DOC-005 | State Registration Certificates | ALL | — | [View](tracking/state_registrations.json) | Pending |
| DOC-006 | Certificates of Good Standing | ALL | — | [View](certificates/good_standing_tracker.json) | Pending |

Master registry: [`tracking/document_registry.json`](tracking/document_registry.json)

---

## Directory Structure

```
corporate/
├── INDEX.md                                        ← this file
├── templates/
│   ├── articles_of_incorporation_IHM.md            ← DOC-001
│   ├── operating_agreement_MSO_TX.md               ← DOC-002
│   └── operating_agreement_MSO_regional.md         ← DOC-003
├── tracking/
│   ├── document_registry.json                      ← master status tracker
│   ├── ein_registry.json                           ← DOC-004
│   └── state_registrations.json                    ← DOC-005
└── certificates/
    └── good_standing_tracker.json                  ← DOC-006
    (store scanned PDFs here as: entity_doctype.pdf)
```

---

## Compliance Quick Reference

### Annual Deadlines (Texas)
| Filing | Due Date | Agency | Entity |
|--------|----------|--------|--------|
| Public Information Report (PIR) | May 15 | TX Comptroller | All TX entities |
| Registered Agent Renewal | As contracted | Agent | All entities |
| Certificate of Good Standing | Within 90 days of trigger event | TX SOS | All entities |

### Good Standing Trigger Events
Pull a fresh Certificate of Good Standing before any:
- Bank account opening or financing close
- Payer credentialing or re-credentialing submission
- State Medicaid or managed care enrollment
- Major contract execution (MSA, lease, acquisition)
- Licensing application in any state

### Multi-State Obligations (MSO-Regional)
For each new operating state, complete in order:
1. Obtain Certificate of Good Standing from home state
2. File for foreign qualification (Certificate of Authority) in new state
3. Appoint registered agent in new state
4. Add state to `tracking/state_registrations.json`
5. Add state addendum to applicable Management Services Agreements
6. Confirm compliance with that state's corporate practice doctrine

---

## Important Regulatory Reminders

> **Anti-Kickback Statute (42 U.S.C. § 1320a-7b(b))** — Management fees must reflect fair market value for actual services rendered. Percentage-of-revenue arrangements require specific safe harbor analysis.

> **Stark Law (42 U.S.C. § 1395nn)** — Any financial relationship between the MSO and a referring physician must fit within a recognized exception.

> **Corporate Practice of Medicine** — Texas and most operating states prohibit unlicensed entities from controlling clinical decision-making. All MSAs must be reviewed by qualified healthcare regulatory counsel.

> **HIPAA** — Any MSO access to protected health information requires a signed Business Associate Agreement with each practice client.

---

*All templates are drafts only. Legal review and execution by licensed corporate and healthcare regulatory counsel is required before use.*
*Last updated: 2026-05-30*
