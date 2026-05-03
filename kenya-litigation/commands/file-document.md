---
description: Guide filing a document on the Kenya eCourt eFiling portal
allowed-tools: mcp__airtable__search_records, mcp__airtable__update_record, mcp__airtable__create_record
argument-hint: [document name or matter name]
---

Guide the user through filing a document on the Kenya eCourt eFiling portal (efiling.ecourt.go.ke).

Note: The eFiling portal requires a human login and does not have an API. This command prepares everything and walks the user through exactly what to do on the portal.

Parse $ARGUMENTS for the document and matter.

## Step 1: Retrieve Document Details

Search the Documents table in Airtable for the document. Retrieve:
- Document name, type, and Drive link
- Matter: case name, case number, court, division
- Document status (warn if not "Ready to File")

If the document is still "Drafting", ask:

Ask: "This document is still marked as Drafting. Has it been reviewed and approved for filing? (yes / no):"

## Step 2: Pre-Filing Checklist

Run through this checklist with the user:

```
PRE-FILING CHECKLIST — [DOCUMENT NAME]

Before filing, confirm the following:

☐ Document has been signed by the advocate
☐ Affidavit (if any) has been sworn before a Commissioner for Oaths
☐ Filing fee has been confirmed (or exemption applies)
☐ All annexures/exhibits are attached to the main document
☐ Document is saved as a PDF
☐ File size is under 10MB (if larger, may need to split)
☐ Case number is correctly stated on the document
```

Ask: "Is the pre-filing checklist above complete? (yes / all clear — or list any items not yet done):"

## Step 3: Filing Instructions

Once the checklist is confirmed, give the user step-by-step instructions:

```
FILING INSTRUCTIONS — KENYA eCOURT PORTAL

1. Go to: https://efiling.ecourt.go.ke
   Log in with your firm credentials.

2. On the dashboard, click "File a Document" or find your matter
   by searching for: [CASE NUMBER] — [CASE NAME]

3. Select the matter from the results.

4. Click "New Filing" and select the document type:
   → [Document Type — e.g., "Notice of Motion / Application"]

5. Upload the document:
   → The document is saved in Google Drive at:
      Kenya Litigation / [Matter Name] / Documents / [Document Name]
   → Download it from Drive first, then upload it here.

6. Fill in the filing details:
   → Case number: [CASE NUMBER]
   → Document type: [DOCUMENT TYPE]
   → Date: [TODAY'S DATE]
   → Filing party: [FIRM NAME / PARTY NAME]

7. Pay the filing fee (if applicable):
   → Filing fees vary by document type and court.
   → The eCourt portal accepts M-Pesa, Visa/Mastercard, and bank transfer.

8. Submit the filing.

9. Download and save the:
   → Electronic Filing Receipt (proof of filing)
   → Sealed/stamped copy of the document (the court returns this after stamping)

10. Come back and tell me "filing complete" — I'll update the database.
```

## Step 4: Post-Filing Update

When the user confirms filing is complete, ask:

Ask: "Filing date (today, or the date you filed):"
Ask: "Filing receipt number (if the portal provided one — or type 'none'):"

Then update the Documents record in Airtable:
- Status → "Filed"
- Filed Date → today (or confirmed date)

Create a reminder task: "Retrieve sealed copy from eCourt portal / registry" — Due: today + 3 days.

Confirm: "Filing logged. I've set a reminder to follow up on the sealed copy."
