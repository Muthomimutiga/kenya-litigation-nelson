---
description: Draft a standalone affidavit (not an Affidavit of Service — use /draft-notice for that)
allowed-tools: Read, Write, mcp__airtable__search_records, mcp__airtable__create_record
argument-hint: [purpose or matter name]
---

Draft a standalone affidavit using the document generator.

This command is for general affidavits only — sworn statements in support of applications, for administrative purposes, or statutory declarations. It is NOT for:
- Supporting Affidavits (those are auto-generated as part of `/draft-notice notice of motion`)
- Affidavits of Service (use `/draft-notice affidavit of service`)

Parse $ARGUMENTS to understand the purpose of the affidavit.

## Step 1: Gather Deponent Details

Ask using individual popup questions:

Ask: "Who is/are the deponent(s)? (single name, or multiple names separated by commas):"
Ask: "Is this linked to a court case, or a standalone statutory declaration? (court case / standalone):"
Ask: "If court case — case number, court, and parties. If standalone — matter reference (e.g. IN THE MATTER OF THE ESTATE OF...):"
Ask: "Deponent description — ID number and postal address:"
Ask: "What are the facts to be deposed? List each paragraph of facts on a new line — these become the numbered THAT paragraphs (do not include a competency paragraph — that is auto-generated):"

## Step 2: Build the Document Data

Write the following JSON to `/tmp/legal-doc-data.json`:

```json
{
  "doc_type": "affidavit",
  "date": "[e.g. 22nd March 2026]",

  // For standalone (non-court) affidavit — use matter_ref, omit case_number/plaintiff/defendant
  "matter_ref": "IN THE MATTER OF THE OATHS AND STATUTORY DECLARATIONS ACT (CAP 15, LAWS OF KENYA)",

  // For court-linked affidavit — use these instead of matter_ref
  "court": "IN THE HIGH COURT OF KENYA AT NAIROBI",
  "division": "CIVIL DIVISION",
  "case_number": "HCCC NO. ___ OF ___",
  "plaintiff": "PLAINTIFF NAME",
  "defendant": "DEFENDANT NAME",

  // deponent: string for single, array for multiple
  "deponent": "Full Name",
  "deponent_description": "of Post Office Box Number ___-00100, Nairobi",
  "sworn_at": "NAIROBI",
  "dated_at": "NAIROBI",

  // paragraphs: each is the full text after "THAT" — numbered automatically
  // Do NOT include a competency paragraph — it is auto-generated as paragraph 1
  "paragraphs": [
    "First substantive fact...",
    "Second substantive fact..."
  ]
}
```

**Important:** Do NOT include a competency paragraph in `paragraphs` — it is auto-generated as paragraph 1 ("I am competent to swear this affidavit").

## Step 3: Generate the Document

Determine the output filename:
e.g. `[matter-slug]-affidavit-[YYYY-MM-DD].docx`

Run:
```bash
cd ${CLAUDE_PLUGIN_ROOT}/scripts && ([ -d node_modules ] || npm install) && node generate-legal-document.js /tmp/legal-doc-data.json /sessions/${SESSION_ID}/mnt/outputs/[filename].docx
```

## Step 4: Present and Refine

Confirm the file was created. Present the download link.

Ask: "Would you like any changes? If yes, tell me what to update and I will regenerate."

## Step 5: Log in Airtable

When approved, create a record in the Documents table:
- Document Name
- Matter (linked, if applicable)
- Document Type: "Affidavit"
- Status: "Draft"

Confirm: "Logged in the database. Status: Draft."
