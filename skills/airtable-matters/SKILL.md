---
name: airtable-matters
description: >
  This skill should be used whenever Claude needs to read from or write to
  the firm's Airtable matters database — including "look up the matter",
  "check the deadline", "log this task", "update the matter status",
  "find the client contact", "add a hearing date", "show me open matters",
  "what's outstanding on this file", or any operation that involves reading
  or writing matter, client, hearing, document, deadline, or task records.
  Also trigger when any command needs to interact with the Airtable base.
version: 0.1.0
---

# Airtable Matters Database — Schema & Operations Guide

This firm's Airtable base is the central record of all litigation matters. Every command that reads or writes to the database uses this schema.

## Base Structure

The base has 8 tables. All are linked by record ID.

| Table | Purpose |
|---|---|
| Matters | Master record for each case |
| Clients | Client contact details |
| Hearings | Record of each court hearing |
| Documents | Tracker for all drafted/filed documents |
| Deadlines | Court dates, filing dates, all time-sensitive obligations |
| Tasks | Internal to-do items per matter |
| Team Members | Firm advocates and staff |
| Parties | Other parties and their advocates in each matter |

## Table Schemas

### Matters

| Field | Type | Notes |
|---|---|---|
| Matter Name | Text | e.g., "Kamau v ABC Bank" |
| Client | Link → Clients | |
| Court | Single Select | High Court, Court of Appeal, Magistrate, ELC, ELRC, Supreme Court, Small Claims |
| Division | Text | e.g., "Civil Division", "Commercial Division" |
| Case Number | Text | e.g., "Civil Suit No. 142 of 2024" |
| Matter Type | Single Select | Civil, Criminal, Constitutional, Land, Employment, Family, Commercial, Judicial Review |
| Status | Single Select | Active, Dormant, Closed |
| Assigned Advocate | Link → Team Members | |
| Next Hearing Date | Date | Auto-update after each hearing |
| Next Hearing Type | Text | e.g., "Mention", "Ruling" |
| Drive Folder URL | URL | Link to Google Drive folder for this matter |
| Notes | Long Text | |
| Created | Created Time | |

### Clients

| Field | Type | Notes |
|---|---|---|
| Client Name | Text | |
| Email | Email | Primary contact email |
| Phone | Phone | |
| Address | Long Text | |
| Client Type | Single Select | Individual, Company, Government Body, NGO |
| Matters | Link → Matters | |

### Hearings

| Field | Type | Notes |
|---|---|---|
| Matter | Link → Matters | |
| Hearing Date | Date | |
| Court | Single Select | |
| Judge/Magistrate | Text | |
| Hearing Type | Single Select | Mention, Directions, Interlocutory, PTC, Full Hearing, Ruling, Judgment, Ex Parte, Other |
| Outcome Summary | Long Text | Plain-language summary |
| Directions | Long Text | Verbatim court directions |
| Client Email Sent | Checkbox | Tick when client update email has been sent |
| Transcript | Attachment | Upload Teams transcript or notes |
| Created | Created Time | |

### Documents

| Field | Type | Notes |
|---|---|---|
| Matter | Link → Matters | |
| Document Name | Text | e.g., "Notice of Motion — Injunction" |
| Document Type | Single Select | Notice of Motion, Chamber Summons, Affidavit, Replying Affidavit, Affidavit of Service, Hearing Notice, Written Submissions, Advocates Memorandum, Judgment, Ruling, Other |
| Status | Single Select | Drafting, Ready to File, Filed, Served, Awaiting Service |
| Drive Link | URL | Google Drive link to the document |
| Filed Date | Date | |
| Served Date | Date | |
| Served By | Text | Name of person who served |
| Served On | Text | Name/firm of party served |
| Service Method | Single Select | Email, Physical, Substituted, Advertisement |
| Hearing | Link → Hearings | Which hearing generated this document |
| Created | Created Time | |

### Deadlines

| Field | Type | Notes |
|---|---|---|
| Matter | Link → Matters | |
| Description | Text | e.g., "File replying affidavit" |
| Due Date | Date | |
| Type | Single Select | Hearing, Filing, Service, Response, Undertaking, Limitation Period, Appeal, Other |
| Priority | Single Select | High, Medium, Low |
| Status | Single Select | Pending, Completed, Overdue, Extended |
| Google Calendar Event ID | Text | Store after creating calendar event |
| Assigned To | Link → Team Members | |
| Notes | Long Text | |

### Tasks

| Field | Type | Notes |
|---|---|---|
| Matter | Link → Matters | |
| Description | Text | |
| Assigned To | Link → Team Members | |
| Due Date | Date | |
| Priority | Single Select | High, Medium, Low |
| Status | Single Select | To Do, In Progress, Done, Deferred |
| Notes | Long Text | |

### Team Members

| Field | Type | Notes |
|---|---|---|
| Name | Text | |
| Email | Email | |
| Role | Single Select | Partner, Senior Associate, Associate, Paralegal, Secretary |

### Parties

| Field | Type | Notes |
|---|---|---|
| Matter | Link → Matters | |
| Party Name | Text | |
| Role | Single Select | Plaintiff, Defendant, Petitioner, Respondent, Interested Party, Appellant, Applicant, Other |
| Advocate | Text | Name of opposing advocate |
| Advocate Email | Email | For service |
| Advocate Phone | Phone | |
| Firm | Text | Opposing firm name |

## Common Queries

When querying the Airtable MCP, translate user requests as follows:

- "Today's hearings" → Deadlines table, Type = Hearing, Due Date = today, Status = Pending
- "This week's deadlines" → Deadlines table, Due Date between today and end of week, Status = Pending
- "Overdue tasks" → Tasks table, Status ≠ Done/Deferred, Due Date < today
- "Active matters" → Matters table, Status = Active
- "Open documents for Matter X" → Documents table, linked to Matter X, Status ≠ Filed
- "Client email for Matter X" → Matters → Clients → Email field

## Write Operations

After any hearing, always:
1. Create a Hearings record
2. Update the Matter's "Next Hearing Date" and "Next Hearing Type" fields
3. Create Deadlines records for each direction with a date
4. Create Tasks for each internal action item
5. Create Documents records for each document to be drafted

## Reference Files

- `references/airtable-setup.md` — step-by-step guide to set up the Airtable base from scratch
