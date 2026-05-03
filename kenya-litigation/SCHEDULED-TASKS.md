# Scheduled Tasks Setup

This plugin uses two scheduled tasks. After installing the plugin, set these up by asking Claude:
"Set up the daily briefing schedule" and "Set up the weekly review schedule."

Or copy the prompts below and create them manually via the Schedule skill.

---

## Task 1: Daily Morning Briefing

**Schedule**: 7:30 AM, Monday through Friday (cron: `30 7 * * 1-5`)

**Prompt**:

```
Run the /briefing daily command for the Kenya Litigation Manager.

Pull today's cause list from Airtable:
- All hearings due today (Deadlines table, Type = Hearing, Due Date = today)
- All other deadlines due today
- All deadlines due tomorrow
- All overdue items (Status = Pending, Due Date < today)
- All outstanding tasks (Status = To Do or In Progress, Due Date ≤ today)

Format and send the daily briefing email to all team members in the Team Members table.

Subject line: Daily Briefing — [DAY DD MONTH YYYY]

After sending, show a brief summary in the chat confirming what was sent.
```

---

## Task 2: Monday Weekly Review

**Schedule**: 7:30 AM, Mondays only (cron: `30 7 * * 1`)

**Note**: On Mondays, this runs IN ADDITION to the daily briefing, not instead of it. The daily briefing runs first; the weekly review is a separate, longer email.

**Prompt**:

```
Run the /briefing weekly command for the Kenya Litigation Manager.

Pull from Airtable:
- This week's hearings (Monday to Friday)
- This week's non-hearing deadlines
- Next week's hearings
- Next week's non-hearing deadlines
- All overdue items
- Active matters with no deadlines in the next 30 days

Format and send the weekly review email to all team members in the Team Members table.

Subject line: Weekly Review — Week of [DD MONTH YYYY]

After sending, show a brief summary in the chat.
```

---

## How to Create These in Cowork

Ask Claude: "Create a scheduled task called 'Daily Litigation Briefing' to run at 7:30 AM on weekdays" and paste the prompt from Task 1 above.

Then: "Create a scheduled task called 'Monday Weekly Review' to run at 7:30 AM on Mondays" and paste the prompt from Task 2 above.
