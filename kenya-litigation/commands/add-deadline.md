---
description: Add a court deadline to the database and calendar
allowed-tools: mcp__airtable__search_records, mcp__airtable__create_record, mcp__airtable__update_record, mcp__google_calendar__create_event
argument-hint: [description] for [matter] on [date]
---

Add a deadline or court date to both Airtable and Google Calendar.

Parse $ARGUMENTS for:
- Description of the deadline (e.g., "File replying affidavit", "Hearing — Mention", "Serve Notice of Motion")
- Matter name or case number
- Due date (parse natural language dates: "next Tuesday", "15 March", "in 14 days")
- Type (infer from description if possible)

If any of the above is missing or ambiguous, ask using individual popup questions before proceeding:

Ask: "What is the deadline description? (e.g. File replying affidavit, Hearing — Mention):" [only if missing]
Ask: "Which matter? (case name or case number):" [only if missing]
Ask: "Due date:" [only if missing]
Ask: "Deadline type — Filing / Hearing / Service / Undertaking / Administrative:" [only if unclear]

## Step 1: Look Up the Matter

Search the Matters table for the matter. Confirm the correct record with the user.

Retrieve:
- Case name and case number (for calendar event title)
- Assigned advocate (for calendar event attendee)

## Step 2: Determine Deadline Details

If not already provided in the arguments, ask using individual popup questions:

Ask: "Exact time (if relevant — e.g. 9:00 AM for hearings, or leave blank for filing deadlines):" [only if not provided]
Ask: "Priority — High / Medium / Low (suggested: [inferred priority based on type]):" [only if not provided]
Ask: "Assigned to — which team member is responsible?:" [only if not provided]

Suggest priority based on type:
- Hearing dates → High
- Undertakings → High
- Filing deadlines → Medium
- Service deadlines → Medium
- Administrative tasks → Low

## Step 3: Create the Airtable Deadlines Record

Create a record in the Deadlines table:
- Description
- Matter (linked)
- Due Date
- Type
- Priority
- Status: Pending
- Assigned To (linked to Team Members)

## Step 4: Create the Google Calendar Event

Create a Google Calendar event:
- Title: "[Case Name] — [Description]"
- Date/time: the due date at 7:00 AM
- Description: "Case Number: [X] | Type: [type] | Matter: [matter name]"
- Reminders:
  - For High priority: 2 days before and 1 hour before
  - For Medium priority: 1 day before
  - For Low priority: 1 day before
- Invite the assigned advocate's calendar

Save the returned Google Calendar Event ID into the Airtable Deadlines record.

## Step 5: Confirm

Display a confirmation:
```
✓ Deadline added

[Description]
Matter: [Case Name]
Due: [Date]
Priority: [Priority]
Assigned to: [Name]
Calendar event created ✓
```

Ask: "Anything else to add for this matter?"
