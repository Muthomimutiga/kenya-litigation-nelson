---
name: hearing-processor
description: >
  This skill should be used when the user provides a court hearing transcript,
  recording summary, or hearing notes and wants to process them — including
  "process this transcript", "extract court directions", "what did the judge
  order", "draft a client update from this hearing", "what undertakings were
  given", or any request to turn hearing output into action items, emails,
  or notices. Also trigger when the user runs /process-hearing.
version: 0.1.0
---

# Kenyan Court Hearing Processor

Extract structured output from court hearing transcripts or notes and drive the full post-hearing workflow.

## What to Extract from Every Transcript

Work through the transcript systematically and identify:

**1. Administrative record**
- Date and time of hearing
- Court name, division, and court number
- Case name and case number
- Judge or magistrate presiding
- Advocates present (name and firm for each side)
- Hearing type (see reference for full typology)

**2. Court directions and orders**
Capture every direction verbatim if possible, then restate in plain language. Tag each direction by type:
- `filing` — a document must be filed by a certain date
- `service` — a document must be served on a party
- `hearing` — next hearing date fixed
- `undertaking` — an advocate gave an undertaking to the court
- `ruling` — a ruling was delivered
- `judgment` — judgment was delivered or reserved
- `payment` — costs ordered or payment directed
- `other` — any direction not captured above

**3. Outcome summary**
One paragraph: what happened, what was ordered, what it means for the client.

**4. Action items**
For each direction, generate a concrete action item:
- Responsible party (which side must act)
- Action description
- Deadline (extract the exact date; if no date given, flag as "date to be confirmed")
- Document required (if any)
- Priority: High / Medium / Low

**5. Documents to draft**
List every document that must now be prepared based on the directions. See the document-drafter skill for templates.

## Post-Hearing Workflow

After extracting the above, execute these steps in order unless the user says otherwise:

1. **Draft client update email** using the extracted outcome summary and action items. Keep it plain — no legalese. Structure: what happened, what it means, what we are doing next, what (if anything) the client must do.

2. **Create deadlines in Airtable and Google Calendar** for every action item with a date. Use the `/add-deadline` command for each.

3. **Draft required notices** using the document-drafter skill for any documents the court has directed to be filed or served.

4. **Propose next steps** — list anything that still needs a decision (e.g., instructions not yet received, dates to be confirmed with the other side).

## Handling Ambiguity

- If the transcript is incomplete or unclear, note the gap explicitly rather than guessing.
- If a direction has no clear deadline, create the action item but flag it as "deadline unconfirmed — follow up with registry."
- If technical terms (section numbers, rule references) appear, include them exactly as stated.

## Client Email Format

```
Subject: Court Update — [Case Name] — [Hearing Date]

Dear [Client Name],

We write to update you following today's hearing before [Judge/Magistrate] in [Court] on [Date].

**What happened**
[Plain-language outcome summary — 2-4 sentences]

**What this means for your case**
[Implication — 1-2 sentences]

**What we are doing next**
[List of firm's action items]

**What we need from you** *(include only if applicable)*
[Any instructions or documents required from the client]

Please do not hesitate to contact us if you have any questions.

Yours faithfully,
[Advocate Name]
[Firm Name]
```

## Reference Files

- `references/hearing-types.md` — full typology of Kenyan court hearings and their significance
- `references/direction-patterns.md` — common phrasing patterns judges use when giving directions, with extraction guidance
