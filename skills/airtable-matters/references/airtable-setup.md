# Airtable Base Setup Guide

Follow these steps to create the Kenya Litigation Manager Airtable base from scratch.

## Step 1: Create a New Base

1. Go to airtable.com and sign in
2. Click **+ Create a base** → Start from scratch
3. Name it: **Kenya Litigation Manager**

## Step 2: Create Each Table

Delete the default "Table 1" and create the following tables in order. For each table, add the fields listed.

---

### Table: Matters

| Field Name | Field Type | Options |
|---|---|---|
| Matter Name | Single line text | (primary field) |
| Client | Link to another record | → Clients table |
| Court | Single select | High Court; Court of Appeal; ELC; ELRC; Magistrate Court; Small Claims Court; Supreme Court |
| Division | Single line text | |
| Case Number | Single line text | |
| Matter Type | Single select | Civil; Criminal; Constitutional; Land; Employment; Family; Commercial; Judicial Review |
| Status | Single select | Active; Dormant; Closed |
| Assigned Advocate | Link to another record | → Team Members table |
| Next Hearing Date | Date | Include time: No; Date format: DD/MM/YYYY |
| Next Hearing Type | Single line text | |
| Drive Folder URL | URL | |
| Notes | Long text | |
| Created | Created time | |

---

### Table: Clients

| Field Name | Field Type | Options |
|---|---|---|
| Client Name | Single line text | (primary field) |
| Email | Email | |
| Phone | Phone number | |
| Address | Long text | |
| Client Type | Single select | Individual; Company; Government Body; NGO |
| Matters | Link to another record | → Matters table (this creates the reverse link) |

---

### Table: Hearings

| Field Name | Field Type | Options |
|---|---|---|
| Hearing Reference | Autonumber | (primary field) |
| Matter | Link to another record | → Matters table |
| Hearing Date | Date | Include time: Yes |
| Judge/Magistrate | Single line text | |
| Hearing Type | Single select | Mention; Directions; Interlocutory Application; Pre-Trial Conference; Full Hearing; Ruling; Judgment; Ex Parte; Consent; Other |
| Outcome Summary | Long text | |
| Directions | Long text | |
| Client Email Sent | Checkbox | |
| Transcript | Attachment | |
| Created | Created time | |

---

### Table: Documents

| Field Name | Field Type | Options |
|---|---|---|
| Document Name | Single line text | (primary field) |
| Matter | Link to another record | → Matters table |
| Document Type | Single select | Notice of Motion; Chamber Summons; Affidavit; Replying Affidavit; Affidavit of Service; Hearing Notice; Written Submissions; Advocates Memorandum; Judgment; Ruling; Consent Order; Other |
| Status | Single select | Drafting; Ready to File; Filed; Served; Awaiting Service |
| Drive Link | URL | |
| Filed Date | Date | |
| Served Date | Date | |
| Served By | Single line text | |
| Served On | Single line text | |
| Service Method | Single select | Email; Physical; Substituted; Advertisement |
| Hearing | Link to another record | → Hearings table |
| Created | Created time | |

---

### Table: Deadlines

| Field Name | Field Type | Options |
|---|---|---|
| Description | Single line text | (primary field) |
| Matter | Link to another record | → Matters table |
| Due Date | Date | Include time: Yes |
| Type | Single select | Hearing; Filing; Service; Response; Undertaking; Limitation Period; Appeal Deadline; Other |
| Priority | Single select | High; Medium; Low |
| Status | Single select | Pending; Completed; Overdue; Extended |
| Google Calendar Event ID | Single line text | |
| Assigned To | Link to another record | → Team Members table |
| Notes | Long text | |

---

### Table: Tasks

| Field Name | Field Type | Options |
|---|---|---|
| Description | Single line text | (primary field) |
| Matter | Link to another record | → Matters table |
| Assigned To | Link to another record | → Team Members table |
| Due Date | Date | |
| Priority | Single select | High; Medium; Low |
| Status | Single select | To Do; In Progress; Done; Deferred |
| Notes | Long text | |

---

### Table: Team Members

| Field Name | Field Type | Options |
|---|---|---|
| Name | Single line text | (primary field) |
| Email | Email | |
| Role | Single select | Partner; Senior Associate; Associate; Paralegal; Secretary |

---

### Table: Parties

| Field Name | Field Type | Options |
|---|---|---|
| Party Name | Single line text | (primary field) |
| Matter | Link to another record | → Matters table |
| Role | Single select | Plaintiff; Defendant; Petitioner; Respondent; Interested Party; Appellant; Applicant; Other |
| Advocate | Single line text | |
| Advocate Email | Email | |
| Advocate Phone | Phone number | |
| Firm | Single line text | |

---

## Step 3: Get Your API Credentials

1. Go to **airtable.com/create/tokens**
2. Click **Create new token**
3. Name: "Kenya Litigation Manager — Claude"
4. Scopes: Select `data.records:read` and `data.records:write`
5. Access: Select your **Kenya Litigation Manager** base
6. Click **Create token** and copy the token — you'll need it for the plugin setup

## Step 4: Get Your Base ID

1. Go to **airtable.com/api**
2. Select your **Kenya Litigation Manager** base
3. In the Introduction section, find your Base ID — it starts with `app...`
4. Copy it — you'll need it for the plugin setup

## Step 5: Configure the Plugin

In your Cowork settings, set these environment variables:
- `AIRTABLE_API_KEY` → your personal access token from Step 3
- `AIRTABLE_BASE_ID` → your base ID from Step 4
