---
description: Email a notice to opposing counsel and log the service
allowed-tools: mcp__airtable__search_records, mcp__airtable__update_record, mcp__airtable__create_record, mcp__gmail__send_email
argument-hint: [document name or Airtable record] on [party/advocate name]
---

Serve a document by email and log the service in Airtable.

Parse $ARGUMENTS for:
- The document to serve (name, Airtable record, or Drive link)
- The party or advocate to serve it on

If not specified, ask the user before proceeding.

## Step 1: Retrieve Document Details

Search the Documents table in Airtable for the document.

Retrieve:
- Document name and type
- Matter (and from there, case name and case number)
- Drive link (to attach the document)
- Current status

If the document status is "Drafting", warn the user: "This document is still marked as Drafting — are you sure it's ready to serve?"

## Step 2: Identify the Recipient

From the Parties table, look up the advocate email for the party to be served.

If multiple parties need to be served, list them all and ask:

Ask: "Shall I serve all parties listed, or a specific one? (all / specify name):"

Confirm the recipient before sending:

Ask: "I'll serve [Advocate Name] at [firm] — [email address]. Confirm or correct:"

## Step 3: Compose the Service Email

Draft the service email:

```
Subject: [Case Name] — [Case Number] — Service of [Document Name]

Dear [Advocate Name],

We act for [Client/Party Name] in the above-captioned matter.

Please find enclosed, by way of service, the following document(s):

1. [Document name]

[If multiple documents:]
2. [Document 2]

Kindly acknowledge receipt.

Yours faithfully,
[Assigned Advocate Name]
[Firm Name]
[Email] | [Phone]
```

Show the user the draft email, then ask:

Ask: "Shall I send this? (yes / no):"

## Step 4: Send the Email

When confirmed, send the email via Gmail with the document attached (the DOCX output from the document generator, or the Drive link stored in the Documents record if available).

BCC the firm's internal service record mailbox if one is configured (check for FIRM_BCC_EMAIL environment variable).

## Step 5: Log the Service in Airtable

After successful sending:
1. Update the Documents record:
   - Status → "Served"
   - Served Date → today
   - Served By → logged-in advocate or user-specified name
   - Served On → advocate name and firm
   - Service Method → "Email"

2. Create a new Deadlines record for the Affidavit of Service:
   - Description: "File Affidavit of Service — [document name]"
   - Due Date: [today + 7 days — flag for user to confirm with registry practice]
   - Type: Filing
   - Priority: Medium

## Step 6: Prompt for Affidavit of Service

Ask: "Would you like me to draft the Affidavit of Service now? I have the service details."

If yes, run the `/draft-notice affidavit of service` command with the service details pre-filled.
