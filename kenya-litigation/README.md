# Kenya Litigation Manager

A Claude Cowork plugin that automates the administrative workflows of a Kenyan litigation practice — from processing court hearing transcripts to drafting documents, serving notices, and keeping the whole firm organised with daily and weekly briefings.

## What It Does

The plugin handles the full post-hearing lifecycle and ongoing matter management:

1. **Process hearings** — Drop in a Teams transcript; Claude extracts all court directions, drafts the client update email, creates deadlines in your calendar and database, and drafts any required notices.
2. **Draft documents** — Notices of Motion, Chamber Summons, Affidavits, Affidavits of Service, Hearing Notices, Written Submissions — all drafted to the correct Kenyan court format.
3. **Serve notices** — Email a notice to opposing counsel, log the service, and automatically create the Affidavit of Service.
4. **File documents** — Step-by-step guidance through the Kenya eCourt eFiling portal, with a pre-filing checklist and post-filing database update.
5. **Manage deadlines and tasks** — Add court dates and filing deadlines to both Google Calendar and the Airtable database in one step.
6. **Daily briefing** — At 7:30 AM on weekdays, a formatted digest of the day's hearings, deadlines, and outstanding tasks is sent to the whole team.
7. **Weekly review** — Every Monday, a full week-ahead review covers this week and next week's diary, plus overdue items.

## Commands

| Command | Description |
|---|---|
| `/process-hearing` | Process a court transcript through the full post-hearing workflow |
| `/draft-notice` | Draft any court document for a matter |
| `/serve` | Email a notice to opposing counsel and log the service |
| `/draft-affidavit` | Draft an Affidavit of Service from the service record |
| `/add-deadline` | Add a court date or filing deadline to the database and Google Calendar |
| `/briefing` | Manually trigger the daily or weekly briefing at any time |
| `/file-document` | Step-by-step guidance for filing on the Kenya eCourt portal |

## Skills

| Skill | What It Knows |
|---|---|
| `hearing-processor` | Kenyan court hearing types, direction patterns, client email format |
| `document-drafter` | Templates for Kenyan court documents, correct court captions, citing statutes and rules |
| `airtable-matters` | Full Airtable schema, how to query and write matter records |

## Setup

### 1. Create Your Airtable Base

Follow the step-by-step guide in `skills/airtable-matters/references/airtable-setup.md`.

After setting up the base, you'll have:
- Your **Airtable Personal Access Token** (starts with `pat...`)
- Your **Base ID** (starts with `app...`)

### 2. Set Environment Variables

In your Cowork or system settings, set:

```
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

### 3. Connect Google Workspace

Connect your firm's Google Workspace account (Gmail, Calendar, Drive) through the Cowork connectors settings. The plugin uses:
- **Gmail** — for sending client emails and service emails
- **Google Calendar** — for creating deadline events
- **Google Drive** — for saving drafted documents

### 4. Populate Your Database

Before using the plugin, add your team members (Team Members table) and existing matters (Matters table) to the Airtable base. At minimum, add:
- All advocates and their email addresses
- Your active matters with case names, case numbers, and client links

### 5. Set Up Scheduled Briefings

See `SCHEDULED-TASKS.md` for exact instructions and prompts.

Create two scheduled tasks:
- **Daily Briefing** — 7:30 AM weekdays
- **Weekly Review** — 7:30 AM Mondays

## Notes on the eFiling Portal

The Kenya eCourt eFiling portal (efiling.ecourt.go.ke) does not have a public API. The `/file-document` command prepares your documents and walks you through the portal step by step, but the actual upload must be done by a human. This is by design — filing is a supervised action.

## Courts Supported

High Court (all divisions), Court of Appeal, Environment and Land Court (ELC), Employment and Labour Relations Court (ELRC), Magistrate Courts (Chief, Senior Resident, Resident), Small Claims Court.

## Required Environment Variables

| Variable | Description |
|---|---|
| `AIRTABLE_API_KEY` | Your Airtable personal access token |
| `AIRTABLE_BASE_ID` | Your Kenya Litigation Manager base ID |
| `FIRM_BCC_EMAIL` | *(Optional)* A mailbox to BCC on all service emails for your records |

## Version

0.1.0 — Initial release
