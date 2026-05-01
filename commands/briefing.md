---
description: Generate a daily or weekly litigation briefing
allowed-tools: mcp__airtable__search_records, mcp__gmail__send_email
argument-hint: [daily|weekly]
---

Generate a litigation briefing and email it to the team.

Determine the briefing type:
- If $ARGUMENTS contains "weekly" or "week" → generate the weekly review
- If $ARGUMENTS contains "daily" or is empty → generate the daily briefing
- If called from the scheduled task on a Monday → generate both the daily and weekly briefings

---

## DAILY BRIEFING

### Pull from Airtable

1. **Today's hearings**: Deadlines table, Type = Hearing, Due Date = today, Status = Pending → sort by time
2. **Deadlines due today**: Deadlines table, Due Date = today, Status = Pending, Type ≠ Hearing → sort by priority
3. **Deadlines due tomorrow**: Deadlines table, Due Date = tomorrow, Status = Pending
4. **Overdue items**: Deadlines table, Due Date < today, Status = Pending → flag immediately
5. **Outstanding tasks**: Tasks table, Status = To Do or In Progress, Due Date ≤ today

### Format the Daily Briefing

```
DAILY LITIGATION BRIEFING — [DAY, DATE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ OVERDUE (requires immediate attention)
[List overdue items with matter name and days overdue — or "None"]

📅 TODAY'S HEARINGS
[For each hearing:]
• [Time if known] — [Court] — [Case Name] ([Case Number])
  Assigned: [Advocate] | Type: [Hearing Type]
[Or "No hearings today"]

🗂️ DUE TODAY (non-hearing deadlines)
[For each deadline:]
• [Description] — [Case Name] | Priority: [High/Medium/Low]
[Or "No other deadlines today"]

📋 DUE TOMORROW
[List — gives the team time to prepare]
[Or "Nothing due tomorrow"]

✅ OUTSTANDING TASKS
[List tasks with due dates and assignees]
[Or "No outstanding tasks"]
```

### Send the Email

Send the formatted briefing to all team members via Gmail.
- Subject: `Daily Briefing — [DAY DD MONTH YYYY]`
- From: firm's Gmail
- To: all Team Members emails from Airtable

---

## WEEKLY REVIEW (Monday only)

### Pull from Airtable

1. **This week's hearings**: Deadlines table, Type = Hearing, Due Date between today and end of week
2. **This week's deadlines**: All Deadlines due this week (not hearings)
3. **Next week's hearings**: Deadlines, Type = Hearing, Due Date in next calendar week
4. **Next week's deadlines**: All Deadlines due next week
5. **All overdue items**: Deadlines with Status = Pending and Due Date < today
6. **Active matters with no upcoming deadlines**: Matters with Status = Active but no Deadlines in the next 30 days

### Format the Weekly Review

```
WEEKLY REVIEW — WEEK OF [DATE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ OVERDUE — REQUIRES ACTION
[List with matter name and how many days overdue]

📅 THIS WEEK'S HEARINGS
[Day-by-day list]

📁 THIS WEEK'S DEADLINES
[List by priority]

📅 NEXT WEEK'S HEARINGS
[Day-by-day list]

📁 NEXT WEEK'S DEADLINES
[List]

🟡 MATTERS WITH NO UPCOMING ACTIVITY
These active matters have no deadlines in the next 30 days — confirm they are
not dormant or that there are no outstanding obligations:
[List matter names]
```

### Send the Weekly Email

Send to all team members.
- Subject: `Weekly Review — Week of [DD MONTH YYYY]`

---

## After Sending

Confirm to the user: "Briefing sent to [N] team members."

Display a summary of any overdue items, then ask:

Ask: "Would you like to address any of the overdue items now? (yes / no — or name the matter):"
