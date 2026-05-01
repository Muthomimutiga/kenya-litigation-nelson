---
name: document-drafter
description: >
  This skill should be used when the user wants to draft any Kenyan legal or
  court document — including "draft a demand letter", "draft a plaint",
  "draft a defence", "draft a counterclaim", "draft a defence and
  counterclaim", "draft a notice of motion", "draft a certificate of urgency",
  "draft an affidavit", "draft an affidavit of service", "draft a hearing
  notice", "prepare a replying affidavit", or any request to prepare a legal
  document for filing or service in a Kenyan court. Also trigger for
  /draft-notice and /draft-affidavit commands.
version: 0.1.0
---

# Kenyan Court Document Drafter

Draft Kenyan court documents to the correct format, citing the right rules and using proper court language.

---

## Firm Profile

Use these details wherever the firm's information appears in any document. Never output "[FIRM NAME]" — always use the actual details below.

```
MABEYA & MANDELA ADVOCATES LLP
Shankardass House, 4th Floor, Suite 400, Nkrumah Lane, Harambee Avenue, CBD, Nairobi
P.O. BOX 4888-00506, NAIROBI
NAIROBI, KENYA
Tel: +254 746 019 507
Email: rmmabeyalaw@gmail.com
```

**Principal Advocate:** NELSON M. MANDELA, Advocate of the High Court of Kenya

**Letterhead structure (for reference):**
- Header: Firm name "MABEYA & MANDELA ADVOCATES LLP" with "M&M" monogram logo; address line below: "Shankardass House, 4th Floor, Suite 400, Nkrumah Lane, Harambee Avenue, CBD, Nairobi • P.O. BOX 4888-00506, NAIROBI, Nairobi • +254 746 019 507 • rmmabeyalaw@gmail.com"
- Footer: "Mabeya & Mandela Advocates LLP • Advocates of the High Court of Kenya"

---

## Output Format Rules

There are two categories of document. Apply the correct format for each.

### Category A — Letterhead Documents

These go on the firm's official letterhead. When outputting, begin with:

```
══════════════════════════════════════════════════════════
[PRINT ON FIRM LETTERHEAD — MABEYA & MANDELA ADVOCATES LLP]
══════════════════════════════════════════════════════════
```

Then produce the body. The letterhead already carries the firm's name, address, and logo — do not repeat the address block at the top of the letter itself. End with the standard sign-off block.

**Category A documents:** Demand letters, client update letters, service cover letters, any outward-facing correspondence to clients or third parties.

---

### Category B — Court Documents (Filed Pleadings and Applications)

These are not printed on letterhead. They carry a formal address block at the bottom under "DRAWN AND FILED BY." The document must look clean, formal, and capable of being stamped by the registry.

Output format rules for Category B:

1. **Caption block** — ALL CAPS, centered (represent centering with clear visual spacing or a note "— CENTERED —")
2. **"BETWEEN" and party names** — each party on its own line, name in CAPS, role right-aligned (PLAINTIFF / DEFENDANT / APPLICANT etc.)
3. **Document title** — ALL CAPS, centered, underlined (represent as `=== NOTICE OF MOTION ===` or similar clear marker)
4. **Statutory citation line** — in parentheses, immediately below the title
5. **Body paragraphs** — numbered, full sentences
6. **Prayers / reliefs** — numbered list, each prayer on its own line
7. **Date and signature block** — clearly separated from the body
8. **"DRAWN AND FILED BY" block** — firm name, physical address, P.O. Box, town, tel, email, in that order
9. **"TO BE SERVED UPON" block** — each party on its own line with their address

**Category B documents:** Plaint, Defence and Counterclaim, Notice of Motion, Affidavit (Supporting / Replying), Affidavit of Service, Hearing Notice.

---

## Typography

Two fonts apply depending on document type:

**Pleadings and court forms** (Plaint, Defence, Notice of Motion, Affidavit, Affidavit of Service, Hearing Notice):
- Font: Book Antiqua
- Size: 12pt
- Line spacing: Single
- Alignment: Justified
- Note at bottom of output: `[Typography: Book Antiqua 12pt, single spaced, justified]`

**Correspondence** (Demand Letters, client letters, cover letters, any outward-facing letter):
- Font: Maiandra GD
- Size: 12pt
- Line spacing: Single
- Alignment: Justified
- Note at bottom of output: `[Typography: Maiandra GD 12pt, single spaced, justified]`

---

## Output Instruction (apply to every document)

At the very top of every output, before the document itself, print a one-line instruction block:

- **Category A:** `[LETTERHEAD DOCUMENT — Print on Mabeya & Mandela Advocates LLP letterhead]`
- **Category B:** `[COURT DOCUMENT — No letterhead. File at registry. Check case number before filing.]`

At the very bottom, after the document, print:

```
─────────────────────────────────────────────
Drafted by Kenya Litigation Manager
Review before filing. Insert actual case number, dates, and exhibits.
─────────────────────────────────────────────
```

---

## General Drafting Rules

- Use the correct court's caption format (court name, division, case number style varies by court)
- Every document must have: title, parties block, case number, and date
- Dates: write in full (e.g., "28th February 2026", not "28/02/2026")
- Monetary amounts: write in words and figures (e.g., "Kenya Shillings One Million (Kshs. 1,000,000)")
- Always leave signature blocks for the advocate and (where required) the deponent
- Never include actual signatures or stamps — these are added by the lawyer

## Case Caption Format by Court

**High Court (Civil):**
```
IN THE HIGH COURT OF KENYA AT [TOWN]
CIVIL CASE/PETITION/MISC. APPLICATION NO. [X] OF [YEAR]

BETWEEN

[PLAINTIFF/PETITIONER NAME] ................................ PLAINTIFF/PETITIONER

AND

[DEFENDANT/RESPONDENT NAME] ............................. DEFENDANT/RESPONDENT
```

**Court of Appeal:**
```
IN THE COURT OF APPEAL OF KENYA AT [TOWN]
CIVIL APPEAL NO. [X] OF [YEAR]

[APPELLANT] ............................................ APPELLANT

AND

[RESPONDENT] .......................................... RESPONDENT
```

**ELC:**
```
IN THE ENVIRONMENT AND LAND COURT OF KENYA AT [TOWN]
ELC CASE/PETITION NO. [X] OF [YEAR]
```

**ELRC:**
```
IN THE EMPLOYMENT AND LABOUR RELATIONS COURT OF KENYA AT [TOWN]
ELRC CAUSE/PETITION NO. [X] OF [YEAR]
```

**Chief/Senior Resident Magistrate Court:**
```
IN THE [CHIEF/SENIOR RESIDENT/RESIDENT] MAGISTRATE'S COURT AT [TOWN]
CIVIL CASE NO. [X] OF [YEAR]
```

## Document Templates

See reference files for full templates. Summary of what each contains:

### Demand Letter (`references/demand-letter.md`)
- Two templates: standard private demand, and Government / State organ notice (Cap. 40 — 30-day mandatory)
- States the relationship, the breach, the exact sum demanded, the deadline, and consequences of non-compliance
- Government notice template cites Section 13A, Government Proceedings Act (Cap. 40)
- Include annexures: the contract, invoice, or instrument giving rise to the claim

### Plaint (`references/plaint.md`)
- Originating document for civil suits (Order 4, CPR 2010)
- Sections: Parties → Cause of Action and Material Facts → Particulars of Loss and Damage → Prayers
- Verification block (mandatory — unverified Plaint is defective)
- Plaintiff exhibits labelled P.1, P.2, etc.
- Includes jurisdiction note: current pecuniary limits by court level

### Defence and Counterclaim (`references/defence-and-counterclaim.md`)
- Two parts: Part I — Defence, Part II — Counterclaim (omit Part II if no cross-claim)
- Admit, deny, or no knowledge — every paragraph of the Plaint must be addressed
- Particulars of set-off, contributory negligence, or other defences in law
- Defendant exhibits labelled D.1, D.2, etc.
- Verification block (mandatory)
- Counterclaim prayers mirror Plaint structure; Defendant becomes Plaintiff-in-Counterclaim

### Notice of Motion with Certificate of Urgency (`references/notice-of-motion.md`)
- Opening: "TAKE NOTICE that [Applicant] will apply to this Honourable Court..."
- Prayers block (numbered), Grounds block
- Certificate of Urgency appended immediately after the Notice — signed by the Advocate, not the client
- Common grounding statutes table (injunctions, judicial review, constitutional enforcement, stay of execution, ELC, ELRC, attachment before judgment)

### Supporting Affidavit (`references/affidavit.md`)
- Deponent details, facts in numbered paragraphs (one fact per paragraph)
- Exhibits marked A, B, C...
- Jurat block: "SWORN at [town] this [date] by the said [name]..."
- Replying Affidavit structure: same format, opens with "I, [name], being duly sworn make oath and say..."

### Affidavit of Service (`references/affidavit-of-service.md`)
- Who served, what was served, on whom, when, where, and how
- Email service version: attach print-out of sent email as exhibit
- Physical service version: describe circumstances of service

### Hearing Notice (`references/hearing-notice.md`)
- Standard advocate-issued notice (date, time, court, room)
- Restoration notice template for matters restored from abeyance
- Always accompany with Affidavit of Service as proof

## Citing Kenyan Law

- Statutes: "Section [X] of the [Act Name] (Cap. [X])" or for new Acts without chapter numbers, cite year: "[Act Name], [Year]"
- Cases: [Party v Party] [Year] [Law Report] [Page] e.g., *Donoghue v Stevenson* [1932] AC 562
- Kenya Law Reports: eKLR (for unreported decisions on kenyalaw.org)
- Civil Procedure Rules: "Order [X] Rule [X] of the Civil Procedure Rules, 2010"
- Constitution: "Article [X] of the Constitution of Kenya, 2010"

## Key Statutes by Matter Type

| Matter Type | Primary Statute |
|---|---|
| Civil suits | Civil Procedure Act (Cap. 21); Civil Procedure Rules, 2010 |
| Land | Land Registration Act, 2012; Land Act, 2012 |
| Employment | Employment Act, 2007; ELRC (Procedure) Rules, 2016 |
| Environment | EMCA, 1999; ELC Act, 2011 |
| Constitutional | Constitution of Kenya, 2010; Mutunga Rules (Constitution of Kenya (Protection of Rights & Fundamental Freedoms) Practice and Procedure Rules, 2013) |
| Criminal | Criminal Procedure Code (Cap. 75); Penal Code (Cap. 63) |
| Commercial | Companies Act, 2015; Insolvency Act, 2015 |
| Appeals | Appellate Jurisdiction Act (Cap. 9); Court of Appeal Rules, 2022 |

## Reference Files

- `references/demand-letter.md` — Demand Letter (standard + Government/State organ notice under Cap. 40)
- `references/plaint.md` — Plaint (full template + Verification block)
- `references/defence-and-counterclaim.md` — Defence and Counterclaim (full template + Verification block)
- `references/notice-of-motion.md` — Notice of Motion + Certificate of Urgency
- `references/affidavit.md` — Supporting Affidavit + Replying Affidavit
- `references/affidavit-of-service.md` — Affidavit of Service (email and physical service)
- `references/hearing-notice.md` — Hearing Notice + Restoration Notice
