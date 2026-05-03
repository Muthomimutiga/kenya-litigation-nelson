---
description: Process a court transcript into emails, notices, and tasks
allowed-tools: Read, Write, Edit, mcp__airtable__create_record, mcp__airtable__update_record, mcp__airtable__search_records, mcp__gmail__send_email, mcp__google_calendar__create_event
argument-hint: [transcript-file or paste transcript text]
---

Process the court hearing transcript provided in $ARGUMENTS (or if no argument given, ask the user to paste or attach the transcript).

Load and apply the `hearing-processor` skill throughout.

Execute the following steps in order:

## Step 1: Confirm All Names and Identifiers

**Do this before anything else. Do not proceed until all questions are answered.**

Tactiq and similar transcription tools consistently distort Kenyan names — surnames, place names, court stations, and firm names are frequently garbled. A wrong name in a hearing notice, calendar entry, or client email is a professional error.

Read the transcript and extract each value. Then ask the user to confirm or correct each field using individual popup questions — one question per field.

For each field:
- If a value was extracted: pre-fill it and ask — "Court name and station — I read this as: **[extracted value]**. Confirm or correct:"
- If nothing was found in the transcript: still ask the question — "Court name and station — I couldn't find this in the transcript. Please provide:"

Apply this rule to every field below. Never skip a field. Never leave a field blank.

Ask: "Court name and station — [pre-fill if found, otherwise request]:"
Ask: "Case number — [pre-fill if found, otherwise request]:"
Ask: "Case name — [pre-fill if found, otherwise request]:"
Ask: "Hearing date — [pre-fill if found, otherwise request]:"
Ask: "Judge / Magistrate — [pre-fill if found, otherwise request]:"
Ask: "Our client (full name) — [pre-fill if found, otherwise request]:"
Ask: "Opposing party (full name) — [pre-fill if found, otherwise request]:"
Ask: "Our counsel (full name) — [pre-fill if found, otherwise request]:"
Ask: "Opposing counsel (full name) — [pre-fill if found, otherwise request]:"
Ask: "Opposing counsel's firm — [pre-fill if found, otherwise request]:"
Ask: "Any other advocates, witnesses, or third parties named — [pre-fill if found, or 'None — confirm or add']:"
Ask: "Any locations mentioned (police stations, offices, properties) — [pre-fill if found, or 'None — confirm or add']:"

Use all confirmed values in every subsequent step. Do not use the original transcript names after this point.

## Step 2: Extract Hearing Details

Using the confirmed names, record:
- Court, division, case number, case name
- Date and time of hearing
- Judge or magistrate presiding
- Advocates present and which party they represent
- Hearing type

## Step 3: Extract and Display Court Directions

List every court direction or order, tagged by type (filing, service, hearing, undertaking, ruling, costs). Display this list to the user clearly before proceeding.

Ask: "Does this look right, or are there any directions I've missed?"

Wait for user confirmation or corrections before proceeding.

## Step 4: Look Up the Matter in Airtable

Search the Matters table for a record matching the confirmed case name or case number.

If found: confirm with the user that this is the correct matter.
If not found: ask the user "I don't have this matter in the database — would you like me to create it now?"

## Step 5: Create the Hearing Record

Create a new record in the Hearings table with:
- Matter (linked)
- Hearing Date
- Judge/Magistrate
- Hearing Type
- Outcome Summary (plain language)
- Directions (verbatim)

## Step 6: Create Deadlines

For each direction that has a date, create a Deadlines record in Airtable and a Google Calendar event.

For each deadline:
- Set Due Date
- Set Type (Hearing / Filing / Service / Undertaking etc.)
- Set Priority (High for undertakings and hearing dates; Medium for filing deadlines; Low for administrative tasks)
- Link to the Matter
- Create a Google Calendar event titled "[Matter Name] — [Description]" on the due date at 7:00 AM with a 2-day reminder

After creating all deadlines, show the user a summary table.

## Step 7: Draft Client Update Email

Using the client email format from the hearing-processor skill, draft the update email.

Look up the client's email from the Clients table in Airtable.

Show the user the draft email and ask: "Shall I send this to [client name] at [email]?"

If confirmed: send via Gmail. Then tick the "Client Email Sent" checkbox in the Hearings record.

## Step 8: Identify Documents to Draft

List every document that must be drafted based on the court directions.

Classify each document as either:

**Supported — offer to draft now** (these use the document generator):
- Hearing Notice / Mention Notice / Judgment Notice → `/draft-notice hearing notice`
- Affidavit of Service → `/draft-notice affidavit of service`
- Notice of Motion → `/draft-notice notice of motion`
- Demand Letter → `/draft-notice demand letter`
- Affidavit → `/draft-affidavit`

**Not yet supported — log as a task only, do not offer to draft**:
- Written Submissions / Skeletal Arguments
- Chamber Summons
- Record of Appeal
- Replying Affidavit
- Any other document not in the list above

For supported documents: ask once — "I can draft the following: [list]. Shall I proceed?"
If confirmed, run the appropriate command for each.
For unsupported documents: create a Task record in Airtable and note it in the Step 11 summary.

## Step 9: Create Tasks for Internal Actions

For any action items that don't have a document (e.g., "Obtain client instructions on XYZ", "File record of appeal"), create Tasks records in Airtable.

## Step 10: Update the Matter Record

Update the Matter record:
- Next Hearing Date → next hearing date from directions (if fixed)
- Next Hearing Type → type of next hearing

## Step 11: Summary

Display a summary to the user:
- Names confirmed ✓
- Hearing recorded ✓
- Client email [sent / pending]
- X deadlines created ✓
- Documents drafted: [list]
- Tasks created: [list]
- Anything still needing attention (e.g., dates not yet confirmed, instructions not yet received)
