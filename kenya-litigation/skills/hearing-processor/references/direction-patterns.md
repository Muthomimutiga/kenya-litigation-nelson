# Court Direction Patterns — Extraction Guide

Common phrasing patterns used by Kenyan judges and magistrates when issuing directions, and how to extract and classify them.

---

## Filing Directions

**Patterns:**
- "Plaintiff/Petitioner/Applicant to file and serve [document] within [X] days"
- "Defendant/Respondent to file their [document] within [X] days of service"
- "Written submissions to be filed and served by [date]"
- "Replying affidavit to be filed within 14 days"
- "Record of appeal to be filed within 60 days"

**Extract:** Document type, who files, timeline (absolute date if given, or relative "X days from today/service").

**Calculate absolute date** if relative. If transcript date is known, add the stated number of days. Flag weekends and public holidays if the deadline falls on one.

---

## Service Directions

**Patterns:**
- "Applicant to serve the other side within [X] days"
- "Matter to be served upon the interested parties"
- "Notice of the application to be served upon [party name]"
- "Service to be effected by [method]"
- "Leave granted to serve by substituted service"

**Extract:** Who serves, who is to be served, method (personal, email, substituted, advertisement), timeline.

---

## Hearing Date Directions

**Patterns:**
- "Matter to come up on [date] for [hearing type]"
- "Set down for hearing on [date]"
- "Adjourned to [date] for ruling/judgment"
- "Return date [date]"
- "Case management conference on [date]"

**Extract:** Date, time (if given), court, hearing type.

---

## Undertakings

**Patterns:**
- "[Advocate name] gives an undertaking to..."
- "Counsel undertakes to file..."
- "On counsel's undertaking that..."

**Extract:** Who gave the undertaking, what was promised, by when. Flag as HIGH PRIORITY — breach of undertaking is a serious professional matter.

---

## Costs Orders

**Patterns:**
- "Costs in the cause" → costs follow the final outcome; no immediate action
- "Costs to the [party]" → costs awarded now; quantification may follow
- "Costs reserved" → court will decide costs later
- "No order as to costs" → each party bears own costs
- "Costs of [Kshs amount] to [party]" → specific amount awarded

**Extract:** Type of costs order, amount (if specified), which party benefits.

---

## Consent Orders

**Patterns:**
- "By consent, the court orders..."
- "Parties have agreed and the court records..."

**Extract:** Terms of the consent order exactly. These are binding court orders even though agreed between parties.

---

## Injunctions and Conservatory Orders

**Patterns:**
- "Conservatory orders granted as prayed in prayer [X]"
- "Interim injunction granted restraining the respondent from..."
- "Status quo to be maintained pending..."
- "Ex parte orders confirmed/discharged"

**Extract:** Exact terms of the order, duration (if stated), return date. Mark service requirement as URGENT.

---

## Appeal Deadlines (Auto-generate)

When a judgment is delivered, automatically create a deadline note:
- **High Court → Court of Appeal**: 30 days from date of judgment (Court of Appeal Rules, Rule 75)
- **Magistrate Court → High Court**: 30 days (Civil Procedure Rules)
- **Court of Appeal → Supreme Court**: 14 days for leave, 30 days for filing (Supreme Court Rules)
- **ELRC → Court of Appeal**: 30 days

Always flag this immediately after extracting a judgment outcome, even if the client has not instructed an appeal. The advocate must advise on the deadline.
