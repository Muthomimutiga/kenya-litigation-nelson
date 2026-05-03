---
description: Draft a court document for a matter
allowed-tools: Read, Write, mcp__airtable__search_records, mcp__airtable__create_record
argument-hint: [document type] for [matter name or case number] — e.g. "hearing notice for Savanna v Peak", "mention notice for HCCC 12/2026", "judgment notice for..."
---

Draft a court document using the `document-drafter` skill.

Parse $ARGUMENTS to extract:
- Document type (e.g., "Notice of Motion", "Affidavit of Service", "Hearing Notice", "Mention Notice", "Judgment Notice")
- Matter identifier (case name or case number)

If either is missing or ambiguous, ask the user before proceeding.

## Step 1: Load Matter Details

Search the Matters table in Airtable for the matter. Retrieve:
- Full case name and case number
- Court, division
- Client name
- Assigned advocate
- Parties (from the Parties table)

If the matter is not found, ask the user to provide the details manually.

## Step 2: Gather Document-Specific Information

Ask using individual popup questions based on document type. Only ask what cannot be inferred from the matter record.

**Notice of Motion:**
Ask: "What orders are sought? (list each order on a new line):"
Ask: "What are the grounds? (list each ground on a new line):"
Ask: "Is this urgent? (yes / no):"
Ask: "Who is the deponent for the supporting affidavit?:" [if not obvious from matter]
Ask: "Hearing date (or leave blank — to be filled at registry):"

**Affidavit of Service:**
Ask: "What document was served?:"
Ask: "Who was it served on (full name and description):"
Ask: "Date and time of service:"
Ask: "Method of service — personal delivery / email / WhatsApp:"
Ask: "Location of service:"

**Hearing / Mention / Judgment Notice:**
Ask: "Hearing date:"
Ask: "Hearing time:"
Ask: "Nature of the hearing — Hearing / Mention / Judgment:"

**Demand Letter / Client Letter:**
Ask: "What is the background and the demand? (summarise the key facts and what you are demanding):"
Ask: "Any deadline given for compliance?:"

**Plaint:**
Ask: "Summary of the claim and relief sought:"
Ask: "Track — Fast Track (≤KES 1M or limited issues) or Multi-Track?:"

**Defence:**
Ask: "Summary of the defence (and counterclaim if any):"

**Demand and client letters — important:** Draft the `paragraphs` array as flowing prose only. Do NOT include section headings (e.g. "BACKGROUND", "THE DEMAND", "INTEREST") as paragraph entries. The letter must read as continuous paragraphs with no bold headings breaking the flow.

## Step 3: Build the Document Data

Using the `document-drafter` skill and the appropriate reference file, assemble the full document content.

### 3a — doc_type mapping

Determine the correct `doc_type` value:
- Demand letter / government notice → `demand_letter`
- Client letter / general correspondence → `client_letter`
- Plaint → `plaint`
- Defence / Defence and Counterclaim → `defence`
- Notice of Motion → `notice_of_motion`
- Affidavit → `affidavit`
- Affidavit of Service → `affidavit_of_service`
- Hearing Notice → `hearing_notice` (set `notice_title: "HEARING NOTICE"`)
- Mention Notice → `hearing_notice` (set `notice_title: "MENTION NOTICE"`)
- Judgment Notice → `hearing_notice` (set `notice_title: "JUDGMENT NOTICE"`)

### 3b — Required fields checklist (complete BEFORE writing any JSON)

Confirm every field in the relevant block is populated. Do not write the JSON until all mandatory fields are filled.

**demand_letter / client_letter — REQUIRED FIELDS**
- [ ] doc_type
- [ ] date, ref
- [ ] recipient_lines (array — name, address line, TOWN — minimum 3 entries)
- [ ] salutation
- [ ] subject (RE: IN CAPS)
- [ ] paragraphs (array, minimum 3 — background, demand/update, consequences; NO headings inside paragraphs)
- [ ] closing

**plaint — REQUIRED FIELDS**
- [ ] doc_type: "plaint"
- [ ] date, ref
- [ ] court, division, case_number
- [ ] track — "FAST TRACK" or "MULTI-TRACK"
- [ ] plaintiff, defendant
- [ ] dated_at
- [ ] paragraphs (numbered facts, minimum 3)
- [ ] relief (array of prayers, minimum 2)
- [ ] serve_upon (array of {name, address})
- [ ] verifier — MANDATORY — full name of deponent
- [ ] verifier_description — MANDATORY — ID number and postal address
- [ ] verifier_capacity — MANDATORY — "the Plaintiff herein" / "a director of the Plaintiff" / "duly authorized by the Plaintiff"
- [ ] verification_date — MANDATORY — "Xth day of Month YYYY"
- [ ] witnesses — MANDATORY — array of {name, id_no}, minimum 1 entry
- [ ] doc_list — MANDATORY — array of document strings, minimum 1 entry

**defence — REQUIRED FIELDS**
- [ ] doc_type: "defence"
- [ ] date, ref, court, division, case_number, plaintiff, defendant, dated_at
- [ ] defence_paragraphs (array — address each plaint paragraph)
- [ ] has_counterclaim (boolean)
- [ ] serve_upon (array of {name, address})
- [ ] witnesses — MANDATORY — array of {name, id_no}, minimum 1 entry
- [ ] doc_list — MANDATORY — array of document strings, minimum 1 entry
- [ ] If has_counterclaim is true: also counterclaim_paragraphs, counterclaim_relief

**notice_of_motion — REQUIRED FIELDS**
- [ ] doc_type: "notice_of_motion"
- [ ] date, ref, court, division, case_number, plaintiff, defendant
- [ ] applicant_description
- [ ] orders (array — text after "THAT", no numbering)
- [ ] grounds (array — text after "THAT")
- [ ] statutory_basis
- [ ] deponent, deponent_capacity, deponent_description
- [ ] affidavit_paragraphs (array, minimum 2)
- [ ] dated_at
- [ ] serve_upon (array of {name, address})
- [ ] urgent (boolean)
- [ ] If urgent is true: urgency_reasons (array, minimum 2 — specific and factual, no vague assertions)

**affidavit_of_service — REQUIRED FIELDS**
- [ ] doc_type: "affidavit_of_service"
- [ ] date, ref, court, division, case_number, plaintiff, defendant
- [ ] deponent, deponent_description, sworn_at
- [ ] service_date, service_time
- [ ] served_person, served_description
- [ ] document_served, service_method, service_location

**hearing_notice / mention_notice / judgment_notice — REQUIRED FIELDS**
- [ ] doc_type: "hearing_notice"
- [ ] notice_title — "HEARING NOTICE" | "MENTION NOTICE" | "JUDGMENT NOTICE"
- [ ] date, ref, court, division, case_number, plaintiff, defendant
- [ ] hearing_date, hearing_time, hearing_type
- [ ] applicant_label
- [ ] serve_upon (array of {name, address})

### 3c — JSON template (use only the block matching your doc_type)

Write the completed data to `/tmp/legal-doc-data.json`.

**demand_letter / client_letter:**
```json
{
  "doc_type": "demand_letter",
  "date": "5th April 2026",
  "ref": "MM/CIV/2026/001",
  "recipient_lines": ["Full Name", "Address Line 1", "NAIROBI"],
  "salutation": "Dear Sir/Madam,",
  "subject": "RE: SUBJECT IN CAPS",
  "paragraphs": ["Full paragraph text.", "Second paragraph.", "Third paragraph."],
  "closing": "Yours faithfully,",
  "notice_note": ""
}
```

**plaint:**
```json
{
  "doc_type": "plaint",
  "date": "5th April 2026",
  "ref": "MM/CIV/2026/001",
  "court": "IN THE HIGH COURT OF KENYA AT NAIROBI",
  "division": "CIVIL DIVISION",
  "case_number": "HCCC NO. ___ OF 2026",
  "track": "FAST TRACK",
  "plaintiff": "PLAINTIFF NAME",
  "defendant": "DEFENDANT NAME",
  "dated_at": "NAIROBI",
  "paragraphs": ["Paragraph 1.", "Paragraph 2.", "Paragraph 3."],
  "relief": ["Judgment for KES X", "Interest at court rates", "Costs of the suit"],
  "serve_upon": [
    { "name": "DEFENDANT NAME", "address": ["P.O. BOX XXXX-00100", "NAIROBI"] }
  ],
  "verifier": "Full Name of Deponent",
  "verifier_description": "ID No. XXXXXXXX, of P.O. Box ___, Nairobi, Republic of Kenya",
  "verifier_capacity": "the Plaintiff herein",
  "verification_date": "5th day of April 2026",
  "witnesses": [
    { "name": "Full Name", "id_no": "XXXXXXXX" }
  ],
  "doc_list": [
    "Contract dated 3rd January 2026",
    "Invoice No. XXX dated 10th January 2026",
    "Demand letter dated 1st March 2026"
  ]
}
```

**defence:**
```json
{
  "doc_type": "defence",
  "date": "5th April 2026",
  "ref": "MM/CIV/2026/001",
  "court": "IN THE HIGH COURT OF KENYA AT NAIROBI",
  "division": "CIVIL DIVISION",
  "case_number": "HCCC NO. ___ OF 2026",
  "plaintiff": "PLAINTIFF NAME",
  "defendant": "DEFENDANT NAME",
  "dated_at": "NAIROBI",
  "has_counterclaim": false,
  "defence_paragraphs": ["Paragraph 1.", "Paragraph 2."],
  "counterclaim_paragraphs": [],
  "counterclaim_relief": [],
  "serve_upon": [
    { "name": "PLAINTIFF'S ADVOCATES, ADVOCATES", "address": ["P.O. BOX XXXX-00100", "NAIROBI"] }
  ],
  "witnesses": [
    { "name": "Full Name", "id_no": "XXXXXXXX" }
  ],
  "doc_list": [
    "Document 1",
    "Document 2"
  ]
}
```

**notice_of_motion:**
```json
{
  "doc_type": "notice_of_motion",
  "date": "5th April 2026",
  "ref": "MM/CIV/2026/001",
  "court": "IN THE HIGH COURT OF KENYA AT NAIROBI",
  "division": "CIVIL DIVISION",
  "case_number": "HCCC NO. ___ OF 2026",
  "plaintiff": "PLAINTIFF NAME",
  "defendant": "DEFENDANT NAME",
  "applicant_description": "the Plaintiff/Applicant",
  "dated_at": "NAIROBI",
  "orders": ["An injunction restraining...", "Costs of this application be in the cause."],
  "grounds": [
    "the Applicant is entitled to the relief sought for the reasons set out in the Supporting Affidavit.",
    "it is just and expedient that the orders sought be granted."
  ],
  "statutory_basis": "Order ___ Rule ___, Section ___ of the Civil Procedure Act and all enabling provisions of the law",
  "deponent": "Full Deponent Name",
  "deponent_capacity": "the Plaintiff herein",
  "deponent_description": "of Post Office Box Number ___-00100, Nairobi",
  "affidavit_paragraphs": ["Paragraph 1.", "Paragraph 2."],
  "urgent": false,
  "urgency_reasons": [],
  "serve_upon": [
    { "name": "OPPOSING COUNSEL, ADVOCATES", "address": ["P.O. BOX XXXX-00100", "NAIROBI"] }
  ]
}
```

**affidavit_of_service:**
```json
{
  "doc_type": "affidavit_of_service",
  "date": "5th April 2026",
  "ref": "MM/CIV/2026/001",
  "court": "IN THE HIGH COURT OF KENYA AT NAIROBI",
  "division": "CIVIL DIVISION",
  "case_number": "HCCC NO. ___ OF 2026",
  "plaintiff": "PLAINTIFF NAME",
  "defendant": "DEFENDANT NAME",
  "deponent": "Full Name",
  "deponent_description": "ID No. XXXXXXXX, of P.O. Box ___, Nairobi",
  "sworn_at": "NAIROBI",
  "service_date": "5th April 2026",
  "service_time": "10:30 a.m.",
  "served_person": "Full Name",
  "served_description": "an adult male/female at the said address",
  "document_served": "Notice of Motion and Supporting Affidavit",
  "service_method": "personal delivery",
  "service_location": "the offices of Opposing Counsel, Nairobi",
  "extra_paragraphs": []
}
```

**hearing_notice / mention_notice / judgment_notice:**
```json
{
  "doc_type": "hearing_notice",
  "notice_title": "HEARING NOTICE",
  "date": "5th April 2026",
  "ref": "MM/CIV/2026/001",
  "court": "IN THE HIGH COURT OF KENYA AT NAIROBI",
  "division": "CIVIL DIVISION",
  "case_number": "HCCC NO. ___ OF 2026",
  "plaintiff": "PLAINTIFF NAME",
  "defendant": "DEFENDANT NAME",
  "hearing_date": "14th April 2026",
  "hearing_time": "9:00 a.m.",
  "hearing_type": "Hearing",
  "applicant_label": "the Plaintiff",
  "serve_upon": [
    { "name": "OPPOSING COUNSEL, ADVOCATES", "address": ["P.O. BOX XXXX-00100", "NAIROBI"] }
  ]
}
```

## Step 4: Generate the Word Document

Determine the output filename from matter name and document type:
e.g. `[matter-slug]-[doc-type]-[YYYY-MM-DD].docx`

Run the generation script from the scripts directory (node_modules lives there):
```bash
cd ${CLAUDE_PLUGIN_ROOT}/scripts && ([ -d node_modules ] || npm install) && node generate-legal-document.js /tmp/legal-doc-data.json /sessions/${SESSION_ID}/mnt/outputs/[filename].docx
```

If the script fails, read the error and fix it, then retry.

## Step 5: Present and Refine

Confirm the file was created. Present the download link.

Ask: "Would you like any changes? If yes, tell me what to update and I will regenerate the document."

For any changes: update the JSON data file and re-run the generation script.

## Step 6: Log in Airtable

When the user approves:
1. Create a record in the Documents table in Airtable:
   - Document Name
   - Matter (linked)
   - Document Type
   - Status: "Draft"

Confirm: "Logged in the database. Status: Draft."
