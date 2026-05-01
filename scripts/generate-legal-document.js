#!/usr/bin/env node
// Legal Document Generator — Muthomi Mutiga & Company Advocates
// Usage: node generate-legal-document.js <data.json> <output.docx>
//
// Handles:
//   Category A (letterhead): demand_letter, client_letter
//   Category B (court/registry): plaint, defence, notice_of_motion,
//                                 affidavit, affidavit_of_service, hearing_notice

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Footer, AlignmentType, BorderStyle, WidthType, VerticalAlign,
  UnderlineType, LineRuleType, ShadingType, PageNumber, TabStopType, LeaderType, PageBreak,
  ImageRun, TextWrappingType, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom
} = require('docx');
const fs = require('fs');
const path = require('path');

// Jurat bracket image — loaded once at startup
const JURAT_BRACKET = fs.readFileSync(path.join(__dirname, 'assets', 'jurat-bracket.png'));

const dataPath = process.argv[2];
const outputPath = process.argv[3];

if (!dataPath || !outputPath) {
  console.error('Usage: node generate-legal-document.js <data.json> <output.docx>');
  process.exit(1);
}

const d = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// ─── Page geometry (A4) ───────────────────────────────────────────────────────
const A4_W = 11906;
const A4_H = 16838;
const MARGIN_TOP    = 1440; // 1 inch
const MARGIN_BOTTOM = 1440;
const MARGIN_SIDE   = 1440;

// ─── Firm details (loaded from firm-config.json) ─────────────────────────────
const firmConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'firm-config.json'), 'utf8'));

// ─── User preferences (written by /setup on first use) ───────────────────────
const userConfigPath = path.join(__dirname, 'user-config.json');
const userConfig = fs.existsSync(userConfigPath)
  ? JSON.parse(fs.readFileSync(userConfigPath, 'utf8'))
  : {};
// Apply user-config defaults to document data (only when field not already provided)
if (userConfig.matter_prefix && !d.ref) {
  const year = new Date().getFullYear();
  d.ref = `${userConfig.matter_prefix}/${year}/`;
}
if (userConfig.default_court && !d.court) {
  d.court = userConfig.default_court;
}
const FIRM_NAME        = firmConfig.firm_name;
const FIRM_NAME_TC     = firmConfig.firm_name_tc;
const FIRM_PARTNER     = firmConfig.firm_partner;
const FIRM_LINE2       = firmConfig.firm_line2;
const FIRM_PO          = firmConfig.firm_po;
const FIRM_TEL         = firmConfig.firm_tel;
const FIRM_EMAIL       = firmConfig.firm_email;
const FIRM_P105_NO     = firmConfig.firm_p105_no;
const FIRM_PRACTICE_NO = firmConfig.firm_practice_no;

// ─── Colours ─────────────────────────────────────────────────────────────────
const BLACK  = '000000';
const NAVY   = firmConfig.brand_navy || '0D2458';
const GOLD   = firmConfig.brand_gold || 'C9A12C';

// ─── Fonts ────────────────────────────────────────────────────────────────────
const FONT_A = firmConfig.font_correspondence || 'Garamond';       // letters, demand letters
const FONT_B = firmConfig.font_court          || 'Book Antiqua';   // pleadings, court docs
const SIZE_A = (firmConfig.font_size_correspondence || 12) * 2;    // half-points
const SIZE_B = (firmConfig.font_size_court          || 12) * 2;

// ─── Letterhead config ────────────────────────────────────────────────────────
const FIRM_CITY         = (firmConfig.firm_city || 'NAIROBI').toUpperCase();
const LH_MODE           = firmConfig.letterhead_mode || 'generated';
const LH_HEADER_H       = firmConfig.lh_header_height || 100;
const LH_FOOTER_H       = firmConfig.lh_footer_height || 40;
const FONT_LH           = firmConfig.font_letterhead || 'Georgia';
const LH_H1_SIZE        = firmConfig.font_size_header_line1 || 56;
const LH_H2_SIZE        = firmConfig.font_size_header_line2 || 22;
const LH_MONO_SIZE      = firmConfig.font_size_monogram     || 96;
const FIRM_HEADER_LINE1 = firmConfig.firm_name_header_line1
  || FIRM_NAME_TC.split('&')[0].trim().toUpperCase();
const FIRM_HEADER_LINE2 = firmConfig.firm_name_header_line2
  || ('& ' + (FIRM_NAME_TC.split('&')[1] || '').trim()).toUpperCase();
const FIRM_MONOGRAM     = firmConfig.firm_monogram
  || FIRM_NAME_TC.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 3).toUpperCase();

// Load letterhead image assets if present
const LH_HEADER_IMG = (() => {
  if (LH_MODE === 'image') {
    const p = path.join(__dirname, 'assets', 'letterhead-header.png');
    return fs.existsSync(p) ? fs.readFileSync(p) : null;
  }
  if (LH_MODE === 'logo') {
    const p = path.join(__dirname, 'assets', 'firm-logo.png');
    return fs.existsSync(p) ? fs.readFileSync(p) : null;
  }
  return null;
})();

const LH_FOOTER_IMG = (() => {
  if (LH_MODE === 'image') {
    const p = path.join(__dirname, 'assets', 'letterhead-footer.png');
    return fs.existsSync(p) ? fs.readFileSync(p) : null;
  }
  return null;
})();

// ─── Font helpers ─────────────────────────────────────────────────────────────
// Category A — correspondence
function lexend(text, opts = {}) {
  return new TextRun({ text: String(text || ''), font: FONT_A, size: SIZE_A, color: BLACK, ...opts });
}

// Category B — court documents
function antiqua(text, opts = {}) {
  return new TextRun({ text: String(text || ''), font: FONT_B, size: SIZE_B, color: BLACK, ...opts });
}

// ─── Paragraph helpers ────────────────────────────────────────────────────────
function spacing(before = 0, after = 120) {
  return { before, after, line: 240, lineRule: LineRuleType.AUTO };
}

// Category A paragraph
function paraA(children, opts = {}) {
  const c = Array.isArray(children) ? children : [lexend(children)];
  return new Paragraph({ children: c, spacing: spacing(), alignment: AlignmentType.JUSTIFIED, ...opts });
}

// Category B paragraph
function paraB(children, opts = {}) {
  const c = Array.isArray(children) ? children : [antiqua(children)];
  return new Paragraph({ children: c, spacing: spacing(0, 160), alignment: AlignmentType.JUSTIFIED, ...opts });
}

function spacer() {
  return new Paragraph({ children: [], spacing: { before: 0, after: 160 } });
}

function spacerA() {
  return new Paragraph({ children: [], spacing: { before: 0, after: 120 } });
}

// Split a date string into TextRun array with ordinal suffix (st/nd/rd/th) as superscript
// Works for "21st March 2026" and "21ST MARCH 2026"
// dateRunsA — correspondence font (FONT_A); dateRuns — court font (FONT_B)
function dateRunsA(dateStr, extraOpts = {}) {
  const str = String(dateStr || '___');
  const parts = str.split(/(\d+(?:st|nd|rd|th))/i);
  return parts.flatMap(part => {
    const m = part.match(/^(\d+)(st|nd|rd|th)$/i);
    if (m) {
      return [
        lexend(m[1], extraOpts),
        new TextRun({ text: m[2], font: FONT_A, size: Math.round(SIZE_A * 0.75), color: BLACK, superScript: true, ...extraOpts }),
      ];
    }
    return part ? [lexend(part, extraOpts)] : [];
  });
}

function dateRuns(dateStr, extraOpts = {}) {
  const str = String(dateStr || '___');
  const parts = str.split(/(\d+(?:st|nd|rd|th))/i);
  return parts.flatMap(part => {
    const m = part.match(/^(\d+)(st|nd|rd|th)$/i);
    if (m) {
      return [
        antiqua(m[1], extraOpts),
        new TextRun({ text: m[2], font: FONT_B, size: Math.round(SIZE_B * 0.75), color: BLACK, superScript: true, ...extraOpts }),
      ];
    }
    return part ? [antiqua(part, extraOpts)] : [];
  });
}

// "DATED at NAIROBI this 21ST DAY OF MARCH 2026." — place and date bold, caps, underlined, ordinal superscript
function datedAt(place, dateStr) {
  const p = (place || 'NAIROBI').toUpperCase();
  const dt = (dateStr || '___').toUpperCase();
  const boldUL = { bold: true, underline: { type: UnderlineType.SINGLE } };
  return new Paragraph({
    children: [
      antiqua('DATED at '),
      antiqua(p, boldUL),
      antiqua(' this '),
      ...dateRuns(dt, boldUL),
      antiqua('.'),
    ],
    spacing: spacing(0, 120),
    alignment: AlignmentType.JUSTIFIED,
  });
}

// ─── ═══════════════════════════════════════════════════════════════════════ ──
// CATEGORY A — LETTERHEAD DOCUMENTS
// ─── ═══════════════════════════════════════════════════════════════════════ ──

function buildLetterhead() {
  const noBorder  = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

  // Shared address line — always rendered from config
  const addressLine = new Paragraph({
    children: [
      new TextRun({
        text: `${FIRM_LINE2} \u2022 ${FIRM_PO} \u2022 ${FIRM_TEL} \u2022 ${FIRM_EMAIL}`,
        font: 'Arial',
        color: NAVY,
        size: 16
      })
    ],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 60 }
  });

  // Shared gold separator line
  const goldLine = new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 14, space: 1, color: GOLD } },
    spacing: { before: 120, after: 0 }
  });

  // ── Image mode: full letterhead header PNG ────────────────────────────────
  if (LH_MODE === 'image' && LH_HEADER_IMG) {
    return [
      new Paragraph({
        children: [
          new ImageRun({ data: LH_HEADER_IMG, transformation: { width: 600, height: LH_HEADER_H }, type: 'png' })
        ],
        spacing: { before: 0, after: 0 }
      }),
      addressLine
    ];
  }

  // ── Logo mode: logo left + firm name text right ───────────────────────────
  if (LH_MODE === 'logo' && LH_HEADER_IMG) {
    const logoTable = new Table({
      width: { size: 9026, type: WidthType.DXA },
      columnWidths: [2000, 7026],
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: noBorders,
              width: { size: 2000, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 0, right: 200 },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: [new ImageRun({ data: LH_HEADER_IMG, transformation: { width: 120, height: 60 }, type: 'png' })],
                  spacing: { before: 0, after: 0 }
                })
              ]
            }),
            new TableCell({
              borders: noBorders,
              width: { size: 7026, type: WidthType.DXA },
              margins: { top: 80, bottom: 80, left: 200, right: 0 },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  children: [new TextRun({ text: FIRM_HEADER_LINE1, font: FONT_LH, bold: true, color: NAVY, size: LH_H1_SIZE })],
                  spacing: { before: 0, after: 80 }
                }),
                new Paragraph({
                  children: [new TextRun({ text: FIRM_HEADER_LINE2, font: FONT_LH, color: NAVY, size: LH_H2_SIZE, characterSpacing: 120 })],
                  spacing: { before: 0, after: 0 }
                }),
              ]
            })
          ]
        })
      ]
    });
    return [logoTable, goldLine, addressLine];
  }

  // ── Generated mode (default): text header from config ────────────────────
  const headerTable = new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [6400, 2626],
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
    rows: [
      new TableRow({
        children: [
          // Left: firm name
          new TableCell({
            borders: noBorders,
            width: { size: 6400, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 0, right: 280 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                children: [new TextRun({ text: FIRM_HEADER_LINE1, font: FONT_LH, bold: true, color: NAVY, size: LH_H1_SIZE })],
                spacing: { before: 0, after: 80 }
              }),
              new Paragraph({
                children: [new TextRun({ text: FIRM_HEADER_LINE2, font: FONT_LH, color: NAVY, size: LH_H2_SIZE, characterSpacing: 120 })],
                spacing: { before: 0, after: 0 }
              }),
            ]
          }),
          // Right: accent background with monogram
          new TableCell({
            borders: noBorders,
            width: { size: 2626, type: WidthType.DXA },
            margins: { top: 120, bottom: 120, left: 80, right: 80 },
            verticalAlign: VerticalAlign.CENTER,
            shading: { fill: NAVY, type: ShadingType.CLEAR, color: 'auto' },
            children: [
              new Paragraph({
                children: [new TextRun({ text: FIRM_MONOGRAM, font: FONT_LH, bold: true, color: GOLD, size: LH_MONO_SIZE })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 0 }
              })
            ]
          })
        ]
      })
    ]
  });

  return [headerTable, goldLine, addressLine];
}

// ─── Category A footer ────────────────────────────────────────────────────────
// Image mode: uploaded footer PNG | Generated/logo mode: text footer from config
function buildLetterheadFooter() {
  if (LH_MODE === 'image' && LH_FOOTER_IMG) {
    return new Footer({
      children: [
        new Paragraph({
          children: [new ImageRun({ data: LH_FOOTER_IMG, transformation: { width: 600, height: LH_FOOTER_H }, type: 'png' })],
          spacing: { before: 0, after: 0 }
        })
      ]
    });
  }

  return new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 8, space: 0, color: GOLD } },
        spacing: { before: 100 },
        tabStops: [{ type: 'right', position: 9026 }],
        children: [
          new TextRun({ text: FIRM_NAME_TC, font: FONT_LH, bold: true, color: GOLD, size: 15 }),
          new TextRun({ text: ' \u2022 Advocates of the High Court of Kenya', font: 'Arial', color: NAVY, size: 15 }),
          new TextRun({ text: '\t', font: 'Arial', color: NAVY, size: 15 }),
          new TextRun({ text: 'Page ', font: 'Arial', color: NAVY, size: 15 }),
          new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', color: NAVY, size: 15 }),
        ]
      })
    ]
  });
}

// Render a letter paragraph — bolds "TAKE NOTICE" and "GOVERN YOURSELF ACCORDINGLY" if present
function letterParaRuns(text) {
  const markers = ['TAKE NOTICE', 'GOVERN YOURSELF ACCORDINGLY'];
  let remaining = text;
  const runs = [];
  while (remaining.length > 0) {
    let earliestIdx = -1;
    let earliestMarker = null;
    for (const m of markers) {
      const idx = remaining.indexOf(m);
      if (idx !== -1 && (earliestIdx === -1 || idx < earliestIdx)) {
        earliestIdx = idx;
        earliestMarker = m;
      }
    }
    if (earliestMarker === null) {
      runs.push(lexend(remaining));
      break;
    }
    if (earliestIdx > 0) runs.push(lexend(remaining.slice(0, earliestIdx)));
    runs.push(lexend(earliestMarker, { bold: true }));
    remaining = remaining.slice(earliestIdx + earliestMarker.length);
  }
  return runs;
}

function buildDemandLetter() {
  const children = [];

  // Letterhead
  children.push(...buildLetterhead());
  children.push(spacerA());

  // Our Ref | Your Ref | Date — all on one centered line, date with superscript ordinal
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      lexend(`Our Ref: ${d.ref || ''}`, { bold: true }),
      lexend('          '),
      lexend(`Your Ref: ${d.their_ref || 'T.B.A'}`),
      lexend('          '),
      ...dateRunsA(d.date || ''),
    ],
    spacing: spacing(),
  }));
  children.push(spacerA());

  // Recipient
  (d.recipient_lines || []).forEach(line => children.push(paraA(line)));
  children.push(spacerA());

  // Salutation
  children.push(paraA(d.salutation || 'Dear Sir/Madam,'));
  children.push(spacerA());

  // Subject — bold + underline
  children.push(new Paragraph({
    children: [lexend(d.subject || '', { bold: true, underline: { type: UnderlineType.SINGLE } })],
    spacing: spacing(),
    alignment: AlignmentType.JUSTIFIED
  }));
  children.push(spacerA());

  // Body paragraphs — 1.0 spacing, "TAKE NOTICE" and "GOVERN YOURSELF ACCORDINGLY" bolded inline
  (d.paragraphs || []).forEach(text => {
    children.push(new Paragraph({
      children: letterParaRuns(text),
      spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
      alignment: AlignmentType.JUSTIFIED
    }));
    children.push(spacerA());
  });

  // Closing — centered
  children.push(new Paragraph({
    children: [lexend(d.closing || 'Yours faithfully,')],
    spacing: spacing(0, 40),
    alignment: AlignmentType.CENTER
  }));
  children.push(spacerA());
  children.push(spacerA());
  children.push(spacerA());
  children.push(spacerA());

  // Sign-off: advocate name in caps then firm name — centered
  children.push(new Paragraph({
    children: [lexend(FIRM_PARTNER, { bold: true })],
    spacing: spacing(0, 40),
    alignment: AlignmentType.CENTER
  }));
  children.push(new Paragraph({
    children: [lexend(FIRM_NAME, { bold: true })],
    spacing: spacing(0, 40),
    alignment: AlignmentType.CENTER
  }));

  // Government/State notice note if present
  if (d.notice_note) {
    children.push(spacerA());
    children.push(paraA(d.notice_note, { children: [lexend(d.notice_note, { italics: true, size: 20 })] }));
  }

  return children;
}

// Generic Category A letter (client letters, general correspondence)
function buildClientLetter() {
  return buildDemandLetter(); // same structure
}

// ─── ═══════════════════════════════════════════════════════════════════════ ──
// CATEGORY B — COURT / REGISTRY DOCUMENTS
// ─── ═══════════════════════════════════════════════════════════════════════ ──

// Party line with dot leader tab: NAME .............. ROLE
function partyLine(name, role) {
  return new Paragraph({
    children: [
      antiqua(name.toUpperCase(), { bold: true }),
      new TextRun({ text: '\t', font: 'Book Antiqua', size: 24 }),
      antiqua(role, { bold: true }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: 9026, leader: LeaderType.DOT }],
    spacing: spacing(0, 60),
    alignment: AlignmentType.LEFT,
  });
}

function buildCourtCaption() {
  const children = [];
  const captionOpts = { bold: true, underline: { type: UnderlineType.SINGLE } };

  // Republic of Kenya
  children.push(new Paragraph({
    children: [antiqua('REPUBLIC OF KENYA', captionOpts)],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 60)
  }));

  // Court name
  children.push(new Paragraph({
    children: [antiqua(d.court || 'IN THE HIGH COURT OF KENYA AT NAIROBI', captionOpts)],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 60)
  }));

  // Division / sub-court
  if (d.division) {
    children.push(new Paragraph({
      children: [antiqua(d.division, captionOpts)],
      alignment: AlignmentType.CENTER,
      spacing: spacing(0, 60)
    }));
  }

  // Case number
  children.push(new Paragraph({
    children: [antiqua(d.case_number || '', captionOpts)],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 60)
  }));

  // Track designation (Order 3 r.1) — plaint only
  if (d.track && d.doc_type === 'plaint') {
    children.push(new Paragraph({
      children: [antiqua(`(${d.track.toUpperCase()})`, captionOpts)],
      alignment: AlignmentType.CENTER,
      spacing: spacing(0, 120)
    }));
  } else {
    children.push(spacer());
  }

  // BETWEEN
  children.push(new Paragraph({
    children: [antiqua('BETWEEN', { bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(120, 120)
  }));

  // Plaintiff(s)
  const plaintiffs = Array.isArray(d.plaintiff) ? d.plaintiff : [d.plaintiff];
  plaintiffs.forEach((name, i) => {
    const label = plaintiffs.length > 1 ? `${ordinal(i + 1)} PLAINTIFF` : 'PLAINTIFF';
    children.push(partyLine(name || '', label));
  });

  // AND
  children.push(new Paragraph({
    children: [antiqua('AND', { bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(100, 100)
  }));

  // Defendant(s)
  const defendants = Array.isArray(d.defendant) ? d.defendant : [d.defendant];
  defendants.forEach((name, i) => {
    const label = defendants.length > 1 ? `${ordinal(i + 1)} DEFENDANT` : 'DEFENDANT';
    children.push(partyLine(name || '', label));
  });

  children.push(spacer());
  return children;
}

function ordinal(n) {
  const s = ['TH', 'ST', 'ND', 'RD'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function buildDrawnByBlock({ serveUpon = [] } = {}) {
  const items = [
    spacer(),
    new Paragraph({ children: [antiqua('DRAWN & FILED BY:', { bold: true, underline: { type: UnderlineType.SINGLE } })], spacing: spacing(0, 40) }),
    new Paragraph({ children: [antiqua(FIRM_NAME_TC)], spacing: spacing(0, 40) }),
    new Paragraph({ children: [antiqua(FIRM_LINE2)], spacing: spacing(0, 40) }),
    new Paragraph({ children: [antiqua(FIRM_PO)], spacing: spacing(0, 40) }),
    new Paragraph({ children: [antiqua(`${FIRM_CITY}.`)], spacing: spacing(0, 40) }),
    new Paragraph({ children: [antiqua(`Tel: ${FIRM_TEL}`)], spacing: spacing(0, 40) }),
    new Paragraph({ children: [antiqua(`Email: ${FIRM_EMAIL}`)], spacing: spacing(0, 40) }),
    new Paragraph({
      children: [antiqua('P105 Number: '), antiqua(FIRM_P105_NO, { bold: true })],
      spacing: spacing(0, 40)
    }),
    new Paragraph({
      children: [antiqua('Practice Number: '), antiqua(FIRM_PRACTICE_NO, { bold: true })],
      spacing: spacing(0, 40)
    }),
  ];

  // TO BE SERVED UPON — defendants or their advocates, numbered
  if (serveUpon.length > 0) {
    items.push(spacer());
    items.push(new Paragraph({
      children: [antiqua('TO BE SERVED UPON:', { bold: true, underline: { type: UnderlineType.SINGLE } })],
      spacing: spacing(0, 80)
    }));
    serveUpon.forEach((party, i) => {
      items.push(new Paragraph({
        children: [antiqua(`${i + 1}. ${party.name}`)],
        spacing: spacing(0, 40)
      }));
      (party.address || []).forEach(line => {
        items.push(new Paragraph({
          children: [antiqua(line)],
          spacing: spacing(0, 40),
          indent: { left: 360 }
        }));
      });
      items.push(spacer());
    });
  }

  return items;
}

// ─── Jurat (sworn statement block for all affidavits) ─────────────────────────
// Format per standard Kenyan practice (from firm letterhead reference):
//
//   SWORN at NAIROBI by the said
//
//   [DEPONENT NAME]         }         DEPONENT
//
//   This 8th day of MARCH 2026
//
//   BEFORE ME
//
//   COMMISSIONER FOR OATHS
//
// The `}` sits on the deponent name line only, positioned at mid-page with
// two tab stops: name → `}` (left tab at 4500) → DEPONENT (left tab at 5200)
function buildJurat(deponent, place, dateStr) {
  const loc = (place || 'NAIROBI').toUpperCase();
  return [
    spacer(),
    new Paragraph({
      children: [antiqua(`SWORN at ${loc} by the said`, { bold: true })],
      spacing: spacing(0, 160)
    }),
    // Line 1: [NAME left]  [floating bracket]  [tab → signature line right]
    new Paragraph({
      children: [
        antiqua((deponent || '[DEPONENT NAME]').toUpperCase(), { bold: true }),
        new ImageRun({
          data: JURAT_BRACKET,
          transformation: { width: 37, height: 204 },
          type: 'png',
          floating: {
            horizontalPosition: {
              relative: HorizontalPositionRelativeFrom.COLUMN,
              offset: 3429000,
            },
            verticalPosition: {
              relative: VerticalPositionRelativeFrom.PARAGRAPH,
              offset: 0,
            },
            wrap: { type: TextWrappingType.NONE },
            behindDocument: false,
          },
        }),
        new TextRun({ text: '\t', font: 'Book Antiqua', size: 24 }),
        antiqua('_________________'),
      ],
      tabStops: [{ type: TabStopType.LEFT, position: 6800 }],
      spacing: { before: 0, after: 40, line: 240, lineRule: LineRuleType.AUTO }
    }),
    // Line 2: [tab → DEPONENT label] — sits directly below signature line
    new Paragraph({
      children: [
        new TextRun({ text: '\t', font: 'Book Antiqua', size: 24 }),
        antiqua('DEPONENT', { bold: true }),
      ],
      tabStops: [{ type: TabStopType.LEFT, position: 6800 }],
      spacing: spacing(0, 120)
    }),
    new Paragraph({
      children: [antiqua('This '), ...dateRuns(dateStr || '___')],
      spacing: spacing(0, 240)
    }),
    new Paragraph({
      children: [antiqua('BEFORE ME', { bold: true })],
      spacing: spacing(0, 480)
    }),
    spacer(),
    new Paragraph({
      children: [antiqua('COMMISSIONER FOR OATHS', { bold: true, underline: { type: UnderlineType.SINGLE } })],
      spacing: spacing(0, 80)
    }),
  ];
}

function buildDocumentTitle(title) {
  return [
    new Paragraph({
      children: [antiqua(title, { bold: true, underline: { type: UnderlineType.SINGLE } })],
      alignment: AlignmentType.CENTER,
      spacing: spacing(160, 160)
    })
  ];
}

// ─── Shared helpers for Category B ────────────────────────────────────────────
function sectionHeading(title) {
  return new Paragraph({
    children: [antiqua(title.toUpperCase(), { bold: true, underline: { type: UnderlineType.SINGLE } })],
    spacing: spacing(200, 100),
    alignment: AlignmentType.LEFT
  });
}

function numberedPara(n, text) {
  return new Paragraph({
    children: [antiqua(`${n}.  ${text}`)],
    spacing: spacing(0, 120),
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 360, hanging: 360 }
  });
}

function subItem(letter, text) {
  return new Paragraph({
    children: [antiqua(`(${letter})  ${text}`)],
    spacing: spacing(0, 80),
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 720 }
  });
}

// ─── PLAINT (composite: plaint + verifying affidavit + witness list + doc list) ─
function buildPlaint() {
  const plaintiffLabel = Array.isArray(d.plaintiff) && d.plaintiff.length > 1 ? 'Plaintiffs' : 'Plaintiff';

  // ── Section 1: The Plaint ────────────────────────────────────────────────────
  const children = [...buildCourtCaption(), ...buildDocumentTitle('PLAINT')];

  (d.paragraphs || []).forEach((text, i) => {
    children.push(numberedPara(i + 1, text));
  });

  let paraCount = (d.paragraphs || []).length;

  // Particulars sections (negligence, injuries, special damages, etc.)
  (d.particulars || []).forEach(section => {
    paraCount++;
    children.push(numberedPara(paraCount, section.intro || ''));
    children.push(sectionHeading(section.heading));
    (section.items || []).forEach((item, i) => {
      children.push(subItem(String.fromCharCode(97 + i), item));
    });
  });

  // Mandatory no-other-suit averment — Order 4 r.1(1)(f) — auto-injected last
  paraCount++;
  children.push(numberedPara(
    paraCount,
    'That the Plaintiff avers that there is no other suit pending in any court of law in Kenya or elsewhere between the same parties and in respect of the same subject matter as is herein, and that no previous proceedings have been filed in any court in relation to the subject matter of this suit.'
  ));

  // Relief prayers
  if (d.relief && d.relief.length > 0) {
    children.push(spacer());
    children.push(sectionHeading('REASONS WHEREFORE'));
    children.push(paraB('The Plaintiff prays for judgment against the Defendant for:'));
    d.relief.forEach((item, i) => {
      children.push(subItem(String.fromCharCode(97 + i), item));
    });
  }

  // Advocate signature block (Order 2 r.16)
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({
    children: [antiqua(FIRM_NAME, { bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 40)
  }));
  children.push(new Paragraph({
    children: [antiqua(`Advocates for the ${plaintiffLabel}`)],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 80)
  }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Section 2: Verifying Affidavit ──────────────────────────────────────────
  // Per Order 4 r.1(2) — accompanies the plaint as a separate document but filed together
  const verifier = d.verifier || '[VERIFIER NAME]';
  const verifierDesc = d.verifier_description || '[ID No. XXXXXXXX, of P.O. Box ___, Nairobi, Republic of Kenya]';
  const verifierCapacity = d.verifier_capacity || `the ${plaintiffLabel} herein`;

  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...buildCourtCaption());
  children.push(...buildDocumentTitle('VERIFYING AFFIDAVIT'));

  children.push(paraB(`I, ${verifier}, ${verifierDesc}, do hereby make oath and state as follows:`));
  children.push(spacer());

  children.push(numberedPara(1, `That I am ${verifierCapacity} and am competent to make this affidavit.`));
  children.push(numberedPara(2, `That I have read and understood the contents of the Plaint filed herewith and the facts stated therein are true to the best of my knowledge, information and belief.`));
  children.push(numberedPara(3, `That there is no other suit pending in any court of law in Kenya or elsewhere between the same parties and in respect of the same subject matter, and that no previous proceedings have been filed in any court relating to the subject matter of this suit.`));
  children.push(numberedPara(4, `That what is stated herein is true to the best of my knowledge, information and belief.`));

  // Any extra verification paragraphs the advocate wants to add
  (d.verification_extra_paragraphs || []).forEach((text, i) => {
    children.push(numberedPara(5 + i, text));
  });

  children.push(...buildJurat(verifier, d.dated_at || 'NAIROBI', d.verification_date || d.date));
  children.push(spacer());
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Section 3: Plaintiff's List of Witnesses ────────────────────────────────
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...buildCourtCaption());
  children.push(...buildDocumentTitle(`${plaintiffLabel.toUpperCase()}'S LIST OF WITNESSES`));
  children.push(new Paragraph({
    children: [antiqua('(Pursuant to Order 3 Rule 2)', { italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 160)
  }));

  const witnesses = d.witnesses || [];
  if (witnesses.length === 0) {
    children.push(paraB('[TO BE COMPLETED]'));
  } else {
    witnesses.forEach((w, i) => {
      const idStr = w.id_no ? ` (ID No. ${w.id_no})` : '';
      children.push(new Paragraph({
        children: [antiqua(`${i + 1}. ${w.name}${idStr}`)],
        spacing: spacing(0, 80)
      }));
    });
  }

  children.push(spacer());
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Section 4: Plaintiff's List of Documents ────────────────────────────────
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...buildCourtCaption());
  children.push(...buildDocumentTitle(`${plaintiffLabel.toUpperCase()}'S LIST OF DOCUMENTS`));
  children.push(new Paragraph({
    children: [antiqua('(Pursuant to Order 3 Rule 2)', { italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 160)
  }));

  const docList = d.doc_list || [];
  if (docList.length === 0) {
    children.push(paraB('[TO BE COMPLETED]'));
  } else {
    docList.forEach((doc, i) => {
      children.push(new Paragraph({
        children: [antiqua(`${i + 1}. ${doc}`)],
        spacing: spacing(0, 80)
      }));
    });
  }

  children.push(spacer());
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── DEFENCE (composite: defence + witness list + document list) ───────────────
function buildDefence() {
  const defendantLabel = Array.isArray(d.defendant) && d.defendant.length > 1 ? 'Defendants' : 'Defendant';
  const docTitle = d.has_counterclaim ? 'DEFENCE AND COUNTERCLAIM' : 'DEFENCE';

  // ── Section 1: The Defence ───────────────────────────────────────────────────
  const children = [...buildCourtCaption(), ...buildDocumentTitle(docTitle)];

  if (d.has_counterclaim) {
    children.push(new Paragraph({
      children: [antiqua('PART I — DEFENCE', { bold: true, underline: { type: UnderlineType.SINGLE } })],
      spacing: spacing(80, 120)
    }));
  }

  (d.defence_paragraphs || d.paragraphs || []).forEach((text, i) => {
    children.push(numberedPara(i + 1, text));
  });

  if (d.has_counterclaim && d.counterclaim_paragraphs) {
    children.push(spacer());
    children.push(new Paragraph({
      children: [antiqua('PART II — COUNTERCLAIM', { bold: true, underline: { type: UnderlineType.SINGLE } })],
      spacing: spacing(80, 120)
    }));
    d.counterclaim_paragraphs.forEach((text, i) => {
      children.push(numberedPara(i + 1, text));
    });
    // Relief for counterclaim
    if (d.counterclaim_relief && d.counterclaim_relief.length > 0) {
      children.push(spacer());
      children.push(sectionHeading('REASONS WHEREFORE'));
      children.push(paraB(`The ${defendantLabel}/Counterclaimant prays for judgment against the Plaintiff/Respondent for:`));
      d.counterclaim_relief.forEach((item, i) => {
        children.push(subItem(String.fromCharCode(97 + i), item));
      });
    }
  }

  // Advocate signature block
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({
    children: [antiqua(FIRM_NAME, { bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 40)
  }));
  children.push(new Paragraph({
    children: [antiqua(`Advocates for the ${defendantLabel}`)],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 80)
  }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Verifying Affidavit ──────────────────────────────────────────────────────
  const verifier = d.verifier || '[VERIFIER NAME]';
  const verifierDesc = d.verifier_description || `an officer of the ${defendantLabel} herein`;
  const verifierCapacity = d.verifier_capacity || `duly authorised to make this affidavit on behalf of the ${defendantLabel}`;

  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...buildCourtCaption());
  children.push(...buildDocumentTitle('VERIFYING AFFIDAVIT'));
  children.push(paraB(`I, ${verifier}, ${verifierDesc}, do hereby make oath and state as follows:-`));
  children.push(spacer());
  children.push(numberedPara(1, `I am duly authorised to make this affidavit on behalf of the ${defendantLabel} herein.`));
  children.push(numberedPara(2, `I have read and understood the Statement of Defence of the ${defendantLabel} dated herein and the contents thereof are true and correct to the best of my knowledge, information and belief.`));
  children.push(numberedPara(3, 'I have full knowledge of the facts herein and where I state matters not within my personal knowledge, I state them to the best of my information and belief.'));
  (d.verification_extra_paragraphs || []).forEach((text, i) => {
    children.push(numberedPara(4 + i, text));
  });
  children.push(...buildJurat(verifier, d.dated_at || 'NAIROBI', d.verification_date || d.date));
  children.push(spacer());
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Witness Statement ─────────────────────────────────────────────────────────
  const defWsName = d.witnesses && d.witnesses[0] ? d.witnesses[0].name : verifier;
  const defWsCapacity = d.witnesses && d.witnesses[0] && d.witnesses[0].description
    ? d.witnesses[0].description
    : `an officer of the ${defendantLabel}`;

  if (d.witness_statement_paragraphs && d.witness_statement_paragraphs.length > 0) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(...buildCourtCaption());
    children.push(...buildDocumentTitle(`WITNESS STATEMENT OF ${defWsName.toUpperCase()}`));
    children.push(spacer());
    children.push(paraB(`I, ${defWsName}, ${defWsCapacity}, state as follows:-`));
    children.push(spacer());
    d.witness_statement_paragraphs.forEach((text, i) => {
      children.push(numberedPara(i + 1, text));
    });
    children.push(spacer());
    children.push(new Paragraph({
      children: [antiqua('......................................................')],
      spacing: spacing(240, 40)
    }));
    children.push(new Paragraph({
      children: [antiqua(defWsName.toUpperCase(), { bold: true })],
      spacing: spacing(0, 80)
    }));
    children.push(spacer());
    children.push(datedAt(d.dated_at, d.date));
    children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));
  }

  // ── Defendant's List of Witnesses ─────────────────────────────────────────────
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...buildCourtCaption());
  children.push(...buildDocumentTitle(`${defendantLabel.toUpperCase()}'S LIST OF WITNESSES`));

  const defWitnesses = d.witnesses || [];
  if (defWitnesses.length === 0) {
    children.push(paraB('[TO BE COMPLETED]'));
  } else {
    defWitnesses.forEach((w, i) => {
      children.push(new Paragraph({
        children: [antiqua(`${i + 1}.  ${w.name}${w.description ? '; ' + w.description : ''}`)],
        spacing: spacing(0, 80)
      }));
    });
  }
  children.push(new Paragraph({
    children: [antiqua(`${(defWitnesses.length || 0) + 1}.  Any other with Leave of this Honourable Court.`)],
    spacing: spacing(0, 80)
  }));
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({
    children: [antiqua(FIRM_NAME, { bold: true })],
    alignment: AlignmentType.RIGHT,
    spacing: spacing(0, 40)
  }));
  children.push(new Paragraph({
    children: [antiqua(`Advocates for the ${defendantLabel}`)],
    alignment: AlignmentType.RIGHT,
    spacing: spacing(0, 80)
  }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Defendant's List of Documents ─────────────────────────────────────────────
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...buildCourtCaption());
  children.push(...buildDocumentTitle(`${defendantLabel.toUpperCase()}'S LIST OF DOCUMENTS`));

  const defDocList = d.doc_list || [];
  if (defDocList.length === 0) {
    children.push(paraB('[TO BE COMPLETED]'));
  } else {
    defDocList.forEach((doc, i) => {
      children.push(new Paragraph({
        children: [antiqua(`${i + 1}.  ${doc}`)],
        spacing: spacing(0, 80)
      }));
    });
  }
  children.push(new Paragraph({
    children: [antiqua(`${(defDocList.length || 0) + 1}.  Any other document with leave of this Honourable Court.`)],
    spacing: spacing(0, 80)
  }));
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({
    children: [antiqua(FIRM_NAME, { bold: true })],
    alignment: AlignmentType.RIGHT,
    spacing: spacing(0, 40)
  }));
  children.push(new Paragraph({
    children: [antiqua(`Advocates for the ${defendantLabel}`)],
    alignment: AlignmentType.RIGHT,
    spacing: spacing(0, 80)
  }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── CERTIFICATE OF URGENCY ───────────────────────────────────────────────────
// Separate section — comes BEFORE the Notice of Motion in the same document
function buildCertificateOfUrgency() {
  const children = [...buildCourtCaption(), ...buildDocumentTitle('CERTIFICATE OF URGENCY')];

  const applicantLabel = (d.applicant_description || 'the Applicant')
    .replace(/^the /i, '').toUpperCase();

  // Opening sentence — advocate name and firm name bold
  children.push(new Paragraph({
    children: [
      antiqua('I, '),
      antiqua(FIRM_PARTNER, { bold: true }),
      antiqua(', an Advocate of the High Court of Kenya practicing as such in the firm of '),
      antiqua(FIRM_NAME, { bold: true }),
      antiqua(', do certify this application to be extremely urgent for the following reasons:'),
    ],
    spacing: spacing(0, 160),
    alignment: AlignmentType.JUSTIFIED
  }));

  // Numbered urgency reasons — support string (legacy) or array
  const reasons = Array.isArray(d.urgency_reasons)
    ? d.urgency_reasons
    : [d.urgency_reasons || '[STATE REASONS FOR URGENCY]'];

  reasons.forEach((reason, i) => {
    children.push(new Paragraph({
      children: [
        antiqua(`${i + 1}.  `, { bold: true }),
        antiqua('THAT', { bold: true }),
        antiqua(` ${reason}`),
      ],
      spacing: spacing(0, 120),
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 360, hanging: 360 }
    }));
    children.push(spacer());
  });

  // DATED line — same pattern as hearing notice
  const place = (d.dated_at || 'NAIROBI').toUpperCase();
  const rawDate = d.date || '___';
  const dayMatch = rawDate.match(/^(\d+(?:st|nd|rd|th))\s+(.+)$/i);
  const dayPart = dayMatch ? dayMatch[1] : rawDate;
  const monthYearPart = dayMatch ? dayMatch[2].toUpperCase() : '';

  children.push(new Paragraph({
    children: [
      antiqua(`DATED at ${place} `, { bold: true }),
      antiqua('this '),
      ...dateRuns(dayPart, { bold: true }),
      antiqua(' day of '),
      antiqua(monthYearPart, { bold: true }),
      antiqua('.'),
    ],
    spacing: spacing(160, 160),
    alignment: AlignmentType.JUSTIFIED
  }));

  children.push(spacer());
  children.push(spacer());

  // Sign-off — right-aligned: firm name bold, then ADVOCATE FOR THE [PARTY] bold+underline
  children.push(new Paragraph({
    children: [antiqua(FIRM_NAME, { bold: true })],
    alignment: AlignmentType.RIGHT,
    spacing: spacing(0, 40)
  }));
  children.push(new Paragraph({
    children: [antiqua(`ADVOCATE FOR THE ${applicantLabel}`, { bold: true, underline: { type: UnderlineType.SINGLE } })],
    alignment: AlignmentType.RIGHT,
    spacing: spacing(0, 80)
  }));

  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── NOTICE OF MOTION ─────────────────────────────────────────────────────────
function buildNoticeOfMotion() {
  const children = [];

  // Certificate of Urgency comes first (same document, before the NOM)
  if (d.urgent) {
    children.push(...buildCertificateOfUrgency());
    children.push(new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }));
  }

  children.push(...buildCourtCaption(), ...buildDocumentTitle('NOTICE OF MOTION'));

  // Statutory basis subtitle — italic, centered
  const statutoryBasis = d.statutory_basis || '[Order ___ Rule ___, Section ___ of the Civil Procedure Act and all enabling provisions of the law]';
  children.push(new Paragraph({
    children: [antiqua(`(Application under ${statutoryBasis})`, { italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 160)
  }));

  // TAKE NOTICE paragraph — hearing date always left blank (filled at registry)
  const applicantDesc = d.applicant_description || 'the Plaintiff/Applicant';
  children.push(new Paragraph({
    children: [
      antiqua('TAKE NOTICE ', { bold: true }),
      antiqua(`that this Honourable Court will be moved on the\u2026\u2026\u2026\u2026\u2026 day of \u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026 20\u2026\u2026 at ${d.hearing_time || '9:00 a.m.'} in the forenoon or soon thereafter, as an Application will be made by Counsel for ${applicantDesc} for `),
      antiqua('ORDERS', { bold: true }),
      antiqua(': -'),
    ],
    spacing: spacing(0, 160),
    alignment: AlignmentType.JUSTIFIED
  }));
  children.push(spacer());

  // Orders — when urgent, auto-inject Order 1 (certify urgent + ex parte)
  // User-supplied orders follow as Order 2, 3, etc.
  const urgencyOrder = 'this application be certified as urgent and be heard ex parte in the first instance.';
  const allOrders = d.urgent
    ? [urgencyOrder, ...(d.orders || [])]
    : (d.orders || []);

  allOrders.forEach((order, i) => {
    children.push(new Paragraph({
      children: [
        antiqua(`${i + 1}.  `, { bold: true }),
        antiqua('THAT', { bold: true, underline: { type: UnderlineType.SINGLE } }),
        antiqua(` ${order}`),
      ],
      spacing: spacing(0, 120),
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 360, hanging: 360 }
    }));
    children.push(spacer());
  });

  // WHICH APPLICATION — introduces the supporting affidavit and grounds
  children.push(new Paragraph({
    children: [
      antiqua('WHICH APPLICATION ', { bold: true }),
      antiqua('is supported by the Affidavit of '),
      antiqua(d.deponent || '[DEPONENT NAME]', { bold: true }),
      antiqua(' annexed hereto and on the following grounds among other and further grounds to be adduced at the hearing hereof:'),
    ],
    spacing: spacing(0, 160),
    alignment: AlignmentType.JUSTIFIED
  }));

  // Grounds — numbered, "THAT" bold+underline, rest plain, no blank lines between
  (d.grounds || []).forEach((ground, i) => {
    children.push(new Paragraph({
      children: [
        antiqua(`${i + 1}.  `, { bold: true }),
        antiqua('THAT', { bold: true, underline: { type: UnderlineType.SINGLE } }),
        antiqua(` ${ground}`),
      ],
      spacing: spacing(0, 120),
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 360, hanging: 360 }
    }));
  });

  children.push(spacer());

  // DATED line — entire line bold, all caps, JUSTIFIED
  const place = (d.dated_at || 'NAIROBI').toUpperCase();
  const dt = (d.date || '___').toUpperCase();
  children.push(new Paragraph({
    children: [
      antiqua(`DATED AT ${place} THIS `, { bold: true }),
      ...dateRuns(dt, { bold: true }),
      antiqua('.', { bold: true }),
    ],
    spacing: spacing(160, 120),
    alignment: AlignmentType.JUSTIFIED
  }));
  children.push(spacer());

  // Firm name — centered, bold (no underline)
  children.push(new Paragraph({
    children: [antiqua(FIRM_NAME, { bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 40)
  }));

  // "ADVOCATES FOR THE [APPLICANT]" — centered, bold + underline
  const applicantLabel = (d.applicant_description || 'the Applicant')
    .replace(/^the /i, '')
    .toUpperCase();
  children.push(new Paragraph({
    children: [antiqua(`ADVOCATES FOR THE ${applicantLabel}`, { bold: true, underline: { type: UnderlineType.SINGLE } })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 80)
  }));

  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // Bottom note — bold italic, after TO BE SERVED UPON
  children.push(spacer());
  children.push(new Paragraph({
    children: [
      antiqua('Note:\t', { bold: true, italics: true }),
      antiqua('\u201cIf any party served does not appear at the time and place above mentioned, such order will be made and proceedings taken as the court may think just and expedient\u201d', { bold: true, italics: true }),
    ],
    spacing: spacing(0, 120),
    alignment: AlignmentType.JUSTIFIED
  }));

  // Page break then supporting affidavit
  children.push(new Paragraph({ children: [new PageBreak()], spacing: { before: 0, after: 0 } }));
  children.push(...buildSupportingAffidavit());

  return children;
}

// ─── SUPPORTING AFFIDAVIT (always part of NOM — same document, page 2) ────────
function buildSupportingAffidavit() {
  const children = [...buildCourtCaption(), ...buildDocumentTitle('SUPPORTING AFFIDAVIT')];

  // Opening sentence — deponent name bold, rest plain, ends ": -"
  const capacity = d.deponent_capacity || 'the Plaintiff herein';
  const description = d.deponent_description || '';
  const descPart = description ? `, ${description}` : '';
  children.push(new Paragraph({
    children: [
      antiqua('I, '),
      antiqua((d.deponent || '[DEPONENT NAME]').toUpperCase(), { bold: true }),
      antiqua(`, ${capacity}${descPart}, do hereby make oath and state as follows: -`),
    ],
    spacing: spacing(0, 160),
    alignment: AlignmentType.JUSTIFIED
  }));

  // Build all paragraphs with sequential numbering (Order 2 requirement)
  const affParas = [
    `I am ${capacity} and thus competent to swear this Affidavit.`,
    ...(d.affidavit_paragraphs || []),
    'the facts herein deposed are within my own knowledge, information and belief save as to the matters deposed on information the sources whereof, I have disclosed.',
  ];

  affParas.forEach((text, i) => {
    children.push(new Paragraph({
      children: [
        antiqua(`${i + 1}.  `, { bold: true }),
        antiqua('THAT ', { bold: true }),
        antiqua(text),
      ],
      spacing: spacing(0, 120),
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 360, hanging: 360 }
    }));
    children.push(spacer());
  });

  children.push(...buildJurat(d.deponent, d.dated_at || 'NAIROBI', d.date));
  children.push(spacer());
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── AFFIDAVIT ────────────────────────────────────────────────────────────────
// Supports both court-case affidavits (case_number present → full caption)
// and standalone affidavits (matter_ref present → simple caption).
// Supports single or multiple deponents (pass deponent as string or array).
function buildAffidavit() {
  const children = [];
  const captionOpts = { bold: true, underline: { type: UnderlineType.SINGLE } };

  // Caption — court case if case_number present, otherwise standalone
  if (d.case_number) {
    children.push(...buildCourtCaption());
  } else {
    children.push(new Paragraph({
      children: [antiqua('REPUBLIC OF KENYA', captionOpts)],
      alignment: AlignmentType.CENTER,
      spacing: spacing(0, 60)
    }));
    if (d.matter_ref) {
      children.push(new Paragraph({
        children: [antiqua(d.matter_ref.toUpperCase(), captionOpts)],
        alignment: AlignmentType.CENTER,
        spacing: spacing(0, 60)
      }));
    }
    children.push(spacer());
  }

  children.push(...buildDocumentTitle('AFFIDAVIT'));

  // Opening sentence — deponent name(s) bold, handles single or array
  const deponents = Array.isArray(d.deponent)
    ? d.deponent
    : [d.deponent || '[DEPONENT NAME]'];
  const pronoun = deponents.length > 1 ? 'WE' : 'I';
  const jointly  = deponents.length > 1 ? ' jointly' : '';

  const openRuns = [antiqua(`${pronoun}, `)];
  deponents.forEach((name, i) => {
    openRuns.push(antiqua(name.toUpperCase(), { bold: true }));
    if (i < deponents.length - 2) openRuns.push(antiqua(', '));
    if (i === deponents.length - 2) openRuns.push(antiqua(' and '));
  });
  openRuns.push(antiqua(`, ${d.deponent_description || ''}, do hereby${jointly} make oath and state as follows:`));

  children.push(new Paragraph({
    children: openRuns,
    spacing: spacing(0, 160),
    alignment: AlignmentType.JUSTIFIED
  }));

  // Paragraphs — numbered, "THAT" bold+underline, rest plain, blank line between
  (d.paragraphs || []).forEach((text, i) => {
    children.push(new Paragraph({
      children: [
        antiqua(`${i + 1}.  `, { bold: true }),
        antiqua('THAT', { bold: true, underline: { type: UnderlineType.SINGLE } }),
        antiqua(` ${text}`),
      ],
      spacing: spacing(0, 120),
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 360, hanging: 360 }
    }));
    children.push(spacer());
  });

  // Jurat — join multiple deponent names for the sworn line
  const juratName = deponents.join(' AND ');
  children.push(...buildJurat(juratName, d.sworn_at || d.dated_at || 'NAIROBI', d.date));
  children.push(spacer());
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── AFFIDAVIT OF SERVICE ─────────────────────────────────────────────────────
// deponent_type: "advocate" (default) | "process_server"
//
// Advocate AOS — 3 fixed paragraphs:
//   1. Service fact (email | whatsapp | physical)
//   2. Return of exhibit / WhatsApp number verification
//   3. Closing verification
//
// Process Server AOS — variable paragraphs:
//   1. Competency (auto)
//   2. Documents received from instructing firm (auto, with sub-list)
//   3. Service fact (email | whatsapp | physical)
//   4. WhatsApp number verification (whatsapp only)
//   5. Closing verification (auto)
function buildAffidavitOfService() {
  const deponentName   = (d.deponent || FIRM_PARTNER).toUpperCase();
  const deponentType   = (d.deponent_type || 'advocate').toLowerCase();
  const serviceMethod  = (d.service_method || 'physical').toLowerCase();
  const copyType       = d.service_copy_type || 'scanned copy';
  const exhibitMark    = d.exhibit_mark  || 'A';
  const exhibit2Mark   = d.exhibit_mark_2 || 'B';
  const exhibitDesc    = d.exhibit_description || d.document_served || '[EXHIBIT DESCRIPTION]';

  const children = [...buildCourtCaption(), ...buildDocumentTitle('AFFIDAVIT OF SERVICE')];

  // ── Opening sentence ────────────────────────────────────────────────────────
  if (deponentType === 'process_server') {
    // Process server: name + address only, no law firm
    children.push(new Paragraph({
      children: [
        antiqua('I, '),
        antiqua(deponentName, { bold: true }),
        antiqua(`, of ${d.deponent_description || '[ADDRESS]'}, do hereby make oath and state as follows:`),
      ],
      spacing: spacing(0, 160),
      alignment: AlignmentType.JUSTIFIED
    }));
  } else {
    // Advocate: name + law firm
    children.push(new Paragraph({
      children: [
        antiqua('I, '),
        antiqua(deponentName, { bold: true }),
        antiqua(', an Advocate of the High Court of Kenya practicing as such with the law firm of '),
        antiqua(FIRM_NAME, { bold: true }),
        antiqua(' do hereby make an oath and state as follows:'),
      ],
      spacing: spacing(0, 160),
      alignment: AlignmentType.JUSTIFIED
    }));
  }
  children.push(spacer());

  // ── Build service fact paragraph (shared by both types) ─────────────────────
  let servicePara;
  if (serviceMethod === 'email') {
    const emailAddresses = Array.isArray(d.service_email_to)
      ? d.service_email_to.join(', ')
      : (d.service_email_to || '[RECIPIENT EMAIL]');
    const plural = emailAddresses.includes(',') ? 'es' : '';
    servicePara = `on the ${d.service_date || '…………………………'}, we caused a ${copyType} of the ${d.document_served || '[DOCUMENT SERVED]'} to be served upon ${d.served_person || '[PARTY]'} via their official email address${plural} ${emailAddresses} using our email address ${d.service_email_from || '[OUR EMAIL]'}.`;

  } else if (serviceMethod === 'whatsapp') {
    const waFrom  = d.service_whatsapp_from   || '[OUR WHATSAPP NUMBER]';
    const waTo    = d.service_whatsapp_number  || '[RECIPIENT WHATSAPP NUMBER]';
    const timeStr = d.service_time ? ` at ${d.service_time}` : '';
    const actor   = deponentType === 'process_server' ? 'I' : 'we';
    servicePara = `on the ${d.service_date || '…………………………'}${timeStr}, using the phone number ${waFrom} belonging to ${deponentType === 'process_server' ? 'the instructing firm' : FIRM_NAME_TC}, ${actor} caused service of the ${d.document_served || '[DOCUMENT SERVED]'} upon ${d.served_person || '[PARTY]'} via their last known WhatsApp number: ${waTo}. The said service was successfully transmitted and delivered on the said WhatsApp platform. A true copy of the screenshot evidencing such service, generated and saved on the said device, is annexed hereto and marked '${exhibitMark}'.`;

  } else {
    const actor = deponentType === 'process_server' ? 'I' : 'we';
    servicePara = `on the ${d.service_date || '…………………………'}, ${actor} caused a copy of the ${d.document_served || '[DOCUMENT SERVED]'} to be served upon ${d.served_person || '[PARTY]'} via ${d.service_method || 'personal delivery'} at ${d.service_location || '[LOCATION]'}.`;
  }

  // ── WhatsApp number verification paragraph (shared by both types) ────────────
  const waPara = `out of abundance of caution, and in order to establish beyond all doubt that the aforementioned number belongs to ${d.served_person || '[PARTY]'}, I sent KES 1/= to them. (Annexed hereto and marked '${exhibit2Mark}' is a copy of the M-Pesa confirmation in confirmation).`;

  // ── Assemble paragraphs by deponent type ────────────────────────────────────
  let paragraphs = [];

  if (deponentType === 'process_server') {
    // Para 1: competency
    paragraphs.push('I am a Licensed Court Process Server hence competent to swear this affidavit.');

    // Para 2: documents received (with sub-list rendered inline if provided)
    const receivedFrom = d.documents_received_from || '[INSTRUCTING FIRM]';
    const receivedDate = d.documents_received_date || d.service_date || '[DATE]';
    const docList = d.documents_list || [];
    let receivedPara = `on the ${receivedDate}, I received copies of the following documents from the firm of ${receivedFrom} with instructions to occasion the service:`;
    paragraphs.push({ text: receivedPara, subList: docList });

    // Para 3: service fact
    paragraphs.push(servicePara);

    // Para 4: WhatsApp number verification (if whatsapp)
    if (serviceMethod === 'whatsapp') paragraphs.push(waPara);

    // Para 5: closing
    paragraphs.push('all the matters deposed to herein are true to the best of my knowledge, information and belief, and what is deposed on the basis of information I verily believe to be true, the grounds whereof have been disclosed.');

  } else {
    // Advocate — exactly 3 paragraphs
    paragraphs.push(servicePara);
    if (serviceMethod === 'whatsapp') {
      paragraphs.push(waPara);
    } else {
      paragraphs.push(`we now return a copy of the ${exhibitDesc}. (Annexed hereto and marked '${exhibitMark}' is the ${exhibitDesc} in confirmation).`);
    }
    paragraphs.push('I swear this Affidavit from the facts within my own information and belief except where otherwise stated the sources whereof I have specifically stated and disclosed.');
  }

  // ── Render paragraphs ───────────────────────────────────────────────────────
  paragraphs.forEach((para, i) => {
    const text    = typeof para === 'string' ? para : para.text;
    const subList = typeof para === 'object' ? (para.subList || []) : [];

    children.push(new Paragraph({
      children: [
        antiqua(`${i + 1}.  `, { bold: true }),
        antiqua('THAT', { bold: true, underline: { type: UnderlineType.SINGLE } }),
        antiqua(` ${text}`),
      ],
      spacing: spacing(0, 80),
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 360, hanging: 360 }
    }));

    // Sub-list (documents received)
    subList.forEach((item, j) => {
      children.push(new Paragraph({
        children: [antiqua(`${String.fromCharCode(97 + j)}. ${item}`)],
        spacing: spacing(0, 60),
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 720 }
      }));
    });

    children.push(spacer());
  });

  children.push(...buildJurat(deponentName, d.dated_at || 'NAIROBI', d.date));
  children.push(spacer());
  children.push(...buildDrawnByBlock({}));

  return children;
}

// ─── HEARING / MENTION / JUDGMENT NOTICE ──────────────────────────────────────
// notice_title: "HEARING NOTICE" | "MENTION NOTICE" | "JUDGMENT NOTICE" (default: HEARING NOTICE)
function buildHearingNotice() {
  const noticeTitle = (d.notice_title || 'HEARING NOTICE').toUpperCase();
  const hearingType = d.hearing_type || 'Hearing';
  const hearingTime = d.hearing_time || '9:00 a.m.';
  const place = (d.dated_at || 'NAIROBI').toUpperCase();
  const dt = (d.date || '___').toUpperCase();

  // Derive the party label for "ADVOCATES FOR THE ___"
  const applicantLabel = (d.applicant_description || d.applicant_label || 'the Plaintiff')
    .replace(/^the /i, '')
    .toUpperCase();

  const children = [...buildCourtCaption(), ...buildDocumentTitle(noticeTitle)];

  // TAKE NOTICE paragraph — "TAKE NOTICE" bold+underline, date bold
  children.push(new Paragraph({
    children: [
      antiqua('TAKE NOTICE ', { bold: true, underline: { type: UnderlineType.SINGLE } }),
      antiqua(`that this matter is coming up for ${hearingType} on the `),
      ...dateRuns(dt, { bold: true }),
      antiqua(` at ${hearingTime} in the forenoon or soon thereafter, as may be shown in the Court\u2019s daily cause list.`),
    ],
    spacing: spacing(0, 160),
    alignment: AlignmentType.JUSTIFIED
  }));

  // TAKE FURTHER NOTICE paragraph
  children.push(new Paragraph({
    children: [
      antiqua('TAKE FURTHER NOTICE ', { bold: true, underline: { type: UnderlineType.SINGLE } }),
      antiqua('that if you or a duly authorized representative does not attend Court on the said date the matter will be heard and orders made your absence notwithstanding.'),
    ],
    spacing: spacing(0, 160),
    alignment: AlignmentType.JUSTIFIED
  }));

  children.push(spacer());

  // DATED line — "DATED at [place] this [day] day of [month year]."
  // Parse "22nd March 2026" → day="22nd", monthYear="MARCH 2026"
  const rawDate = d.date || '___';
  const dayMatch = rawDate.match(/^(\d+(?:st|nd|rd|th))\s+(.+)$/i);
  const dayPart = dayMatch ? dayMatch[1] : rawDate;
  const monthYearPart = dayMatch ? dayMatch[2].toUpperCase() : '';

  children.push(new Paragraph({
    children: [
      antiqua('DATED ', { bold: true }),
      antiqua(`at ${place} this `),
      ...dateRuns(dayPart, { bold: true }),
      antiqua(' day of '),
      antiqua(monthYearPart, { bold: true }),
      antiqua('.'),
    ],
    spacing: spacing(160, 120),
    alignment: AlignmentType.JUSTIFIED
  }));

  children.push(spacer());

  // Firm name — centered, bold
  children.push(new Paragraph({
    children: [antiqua(FIRM_NAME, { bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 40)
  }));

  // ADVOCATES FOR THE [PARTY] — centered, bold+underline
  children.push(new Paragraph({
    children: [antiqua(`ADVOCATES FOR THE ${applicantLabel}`, { bold: true, underline: { type: UnderlineType.SINGLE } })],
    alignment: AlignmentType.CENTER,
    spacing: spacing(0, 80)
  }));

  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── ═══════════════════════════════════════════════════════════════════════ ──
// SMALL CLAIMS COURT HELPERS
// ─── ═══════════════════════════════════════════════════════════════════════ ──

// "Rule 3   FORM No SCC 1" — left/right on same line using tab
function sccFormHeader(ruleNo, formNo) {
  return new Paragraph({
    children: [
      antiqua(`Rule ${ruleNo}`, { italics: true }),
      new TextRun({ text: '\t', font: FONT_B, size: SIZE_B }),
      antiqua(`FORM No SCC ${formNo}`, { italics: true }),
    ],
    tabStops: [{ type: TabStopType.RIGHT, position: 9026 }],
    spacing: spacing(0, 80)
  });
}

// SCC caption: CLAIMANT / VERSUS / RESPONDENT (no BETWEEN...AND)
function sccCaption() {
  const captionOpts = { bold: true, underline: { type: UnderlineType.SINGLE } };
  const courtName = d.court || `IN THE SMALL CLAIMS COURT AT ${(d.court_location || 'NAIROBI').toUpperCase()}`;
  return [
    new Paragraph({ children: [antiqua('REPUBLIC OF KENYA', captionOpts)], alignment: AlignmentType.CENTER, spacing: spacing(0, 60) }),
    new Paragraph({ children: [antiqua(courtName, captionOpts)], alignment: AlignmentType.CENTER, spacing: spacing(0, 60) }),
    new Paragraph({ children: [antiqua(d.case_number || '', captionOpts)], alignment: AlignmentType.CENTER, spacing: spacing(0, 80) }),
    spacer(),
    partyLine(d.claimant || '', 'CLAIMANT'),
    spacer(),
    new Paragraph({ children: [antiqua('VERSUS', { bold: true })], alignment: AlignmentType.CENTER, spacing: spacing(80, 80) }),
    spacer(),
    partyLine(d.respondent || '', 'RESPONDENT'),
    spacer(),
  ];
}

// Labeled field: bold label + plain value on same line
function formField(label, value) {
  return new Paragraph({
    children: [
      antiqua(label, { bold: true }),
      antiqua(value || 'N/A')
    ],
    spacing: spacing(0, 60)
  });
}

// Single checkbox line: ☑/☐ + label
function checkboxLine(checked, label) {
  const mark = checked ? '\u2611' : '\u2610';
  return new Paragraph({
    children: [antiqua(`${mark}  ${label}`)],
    spacing: spacing(0, 60)
  });
}

// Numbered section heading: "1.  Heading Text:"
function sccSectionHeading(n, title) {
  return new Paragraph({
    children: [antiqua(`${n}.  ${title}`, { bold: true, underline: { type: UnderlineType.SINGLE } })],
    spacing: spacing(160, 80)
  });
}

// Statement of Facts numbered in Roman numerals
const ROMAN_NUM = ['I','II','III','IV','V','VI','VII','VIII','IX','X',
                   'XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX'];
function romanPara(n, text) {
  return new Paragraph({
    children: [antiqua(`${ROMAN_NUM[n] || (n + 1)}.  ${text}`)],
    spacing: spacing(0, 120),
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 540, hanging: 360 }
  });
}

// ─── SCC STATEMENT OF CLAIM (FORM 1, RULE 3) ─────────────────────────────────
// Composite: Claim form + Verifying Affidavit + List of Witnesses +
//            Witness Statement + List of Documents
function buildSCCClaim() {
  const claimant  = d.claimant  || '';
  const respondent = d.respondent || '';
  const cd = d.claimant_details  || {};   // claimant section 1 details
  const rd = d.respondent_details || {};  // respondent section 2 details
  const rp = d.represented_party  || {};  // party on whose behalf advocate files
  const isRep = cd.claiming_as_representative !== false; // default: advocate files as rep

  const LEGAL_STATUS_LABELS = ['Individual','Sole Proprietorship','Partnership','Company','Cooperative','State Department'];
  const LEGAL_STATUS_KEYS   = ['individual','sole_prop','partnership','company','cooperative','state_dept'];
  const legalStatus = (rd.legal_status || 'individual').toLowerCase().replace(/\s+/g,'_');

  const CLAIM_OPTIONS = [
    { key: 'contract_money',  text: `A contract relating to monies owed${d.claim_description ? ' by the Respondent to the Claimant — ' + d.claim_description : ''}` },
    { key: 'services',        text: `Services rendered on or about the ___ day of __________ to the value of Kshs ${d.claim_value || '___'}` },
    { key: 'money_received',  text: `A Contract relating to money had and received on or about _________ in the sum of Kshs ___` },
    { key: 'property_damage', text: `Compensation for loss or damage to property which occurred on or about ___ day of ____________` },
    { key: 'personal_injury', text: `Compensation for personal injury which occurred on or about the ___ day of ____________` },
  ];
  const claimNature = d.claim_nature || 'contract_money';

  // ── Page 1: The Claim Form ────────────────────────────────────────────────────
  const children = [
    sccFormHeader(3, 1),
    ...sccCaption(),
    ...buildDocumentTitle('STATEMENT OF CLAIM'),
    spacer(),

    // Section 1: Claimant Details
    sccSectionHeading(1, "Claimant's Personal Details:"),
    formField('Name: ',                     cd.name              || FIRM_NAME),
    formField('Postal Address: ',           cd.postal_address    || FIRM_PO),
    formField('Physical Address: ',         cd.physical_address  || FIRM_LINE2),
    formField('Telephone Contact: ',        cd.tel               || FIRM_TEL),
    formField('Email Address: ',            cd.email             || FIRM_EMAIL),
    formField('Nature of Business: ',       cd.nature_of_business || 'LEGAL REPRESENTATION'),
    formField('Location/Sub-Location/Village: ', cd.location     || FIRM_CITY),
    spacer(),
    checkboxLine(!isRep, 'Claiming in Person'),
    checkboxLine( isRep, 'Claiming as a Representative (Please tick where appropriate)'),
    spacer(),
  ];

  if (isRep) {
    children.push(paraB('If Claiming as a representative, kindly provide the Personal Details of the person you represent:'));
    children.push(spacer());
    children.push(formField('Name: ',               rp.name            || claimant));
    children.push(formField('Postal Address: ',     rp.postal_address  || 'N/A'));
    children.push(formField('Physical Address: ',   rp.physical_address || 'N/A'));
    children.push(formField('Telephone Contact: ',  rp.tel             || 'N/A'));
    children.push(formField('Email Address: ',      rp.email           || 'N/A'));
    children.push(formField('Location/Sub/Village: ', rp.location      || 'N/A'));
    children.push(paraB(`Give reasons why you claim as a representative attaching a copy of the written authority (if any): ${rp.reason || 'We are the Claimant\'s Advocates.'}`));
    children.push(spacer());
  }

  // Section 2: Respondent Details
  children.push(sccSectionHeading(2, "Respondent's Personal Details:"));
  children.push(formField('Name: ',               rd.name            || respondent));
  children.push(formField('Postal Address: ',     rd.postal_address  || ''));
  children.push(formField('Physical Address: ',   rd.physical_address || ''));
  children.push(formField('Telephone Contact: ',  rd.tel             || ''));
  children.push(formField('Email Address: ',      rd.email           || ''));
  children.push(formField('Nature of Business: ', rd.nature_of_business || ''));
  children.push(new Paragraph({
    children: [
      antiqua('Legal Status of the Respondent (Please tick where appropriate)   ', { bold: true }),
      ...LEGAL_STATUS_LABELS.flatMap((opt, i) => [
        antiqua(`${LEGAL_STATUS_KEYS[i] === legalStatus ? '\u2611' : '\u2610'} ${opt}   `)
      ])
    ],
    spacing: spacing(0, 80)
  }));
  children.push(spacer());

  // Section 3: Nature of Claim
  children.push(sccSectionHeading(3, 'Nature of Claim (Please tick where appropriate)'));
  children.push(spacer());
  CLAIM_OPTIONS.forEach(opt => children.push(checkboxLine(opt.key === claimNature, opt.text)));
  children.push(spacer());

  // Section 4: Statement of Facts
  children.push(sccSectionHeading(4, 'Statement of Facts:'));
  children.push(spacer());
  (d.facts || []).forEach((text, i) => {
    children.push(romanPara(i, text));
    children.push(spacer());
  });

  // Particulars subsections (breach, loss/damages etc.)
  (d.particulars || []).forEach(section => {
    children.push(spacer());
    children.push(sectionHeading(section.heading));
    (section.items || []).forEach(item => {
      children.push(new Paragraph({
        children: [antiqua(item)],
        spacing: spacing(0, 80),
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 360 }
      }));
    });
    if (section.total) {
      children.push(new Paragraph({
        children: [antiqua(`TOTAL .......................................  ${section.total}`, { bold: true })],
        spacing: spacing(80, 80),
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 360 }
      }));
    }
  });

  // Section 5: Relief Sought
  children.push(spacer());
  children.push(sccSectionHeading(5, 'What is the Remedy/Relief sought: (Please tick where appropriate)'));
  children.push(spacer());
  (d.relief || []).forEach(item => children.push(checkboxLine(true, item)));
  children.push(spacer());

  // Waiver + Signatures
  children.push(paraB('By filing this Claim, I (the Claimant) hereby waive and forfeit the recovery of all sums in excess of Kshs. One Million excluding costs and interest.'));
  children.push(spacer());
  const sigName = (d.claimant_signatory && d.claimant_signatory.name) ? d.claimant_signatory.name : claimant;
  children.push(formField('Name of Claimant: ', sigName));
  children.push(new Paragraph({ children: [antiqua('Signature of Claimant: ____________________________')], spacing: spacing(0, 80) }));
  children.push(spacer());
  children.push(new Paragraph({ children: [antiqua('Declaration', { bold: true, underline: { type: UnderlineType.SINGLE } })], spacing: spacing(120, 60) }));
  children.push(paraB('I declare that the information given above is true'));
  children.push(spacer());
  children.push(formField('Name of Claimant: ', sigName));
  children.push(new Paragraph({ children: [antiqua('Signature of Claimant: ____________________________')], spacing: spacing(0, 80) }));
  children.push(paraB(`Dated this ______ day of ______________ ${new Date().getFullYear()}`));
  children.push(spacer());

  // Acknowledgement of Service
  children.push(new Paragraph({ children: [antiqua('Acknowledgement of Service', { bold: true, underline: { type: UnderlineType.SINGLE } })], spacing: spacing(120, 60) }));
  children.push(paraB('I acknowledge service of this Statement of Claim delivered to me, with evidential documents attached,'));
  children.push(paraB('on ......................................................................................'));
  children.push(spacer());
  children.push(formField('Name of Respondent: ', rd.name || respondent));
  children.push(new Paragraph({ children: [antiqua('Signature of Respondent: ____________________________')], spacing: spacing(0, 80) }));
  children.push(spacer());

  // For Official Use Only
  children.push(new Paragraph({ children: [antiqua('For Official Use Only', { bold: true })], spacing: spacing(120, 60) }));
  children.push(paraB(`This Claim was filed on the _______ day of ________________ ${new Date().getFullYear()}`));
  children.push(paraB('Signed ....................................................'));
  children.push(new Paragraph({ children: [antiqua('(Registrar)')], spacing: spacing(0, 80) }));
  children.push(spacer());

  // Dated + firm sig (right-aligned per SCC practice)
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({ children: [antiqua(FIRM_NAME, { bold: true })], alignment: AlignmentType.RIGHT, spacing: spacing(0, 40) }));
  children.push(new Paragraph({ children: [antiqua('ADVOCATES FOR THE CLAIMANT')], alignment: AlignmentType.RIGHT, spacing: spacing(0, 80) }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Verifying Affidavit ───────────────────────────────────────────────────────
  const sccVerifier     = d.verifier             || '[VERIFIER NAME]';
  const sccVerifierDesc = d.verifier_description || 'an adult of sound mind, duly authorized to swear this affidavit on behalf of the Claimant';
  const sccVerifierCap  = d.verifier_capacity    || 'Director/authorized officer of the Claimant';

  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...sccCaption());
  children.push(...buildDocumentTitle('VERIFYING AFFIDAVIT'));
  children.push(spacer());
  children.push(paraB(`I, ${sccVerifier}, ${sccVerifierDesc}, do make an oath and state as follows:`));
  children.push(spacer());
  children.push(numberedPara(1, `THAT I am ${sccVerifierCap} and am duly authorized to swear this affidavit on behalf of the Claimant, hence competent to do so.`));
  children.push(numberedPara(2, 'THAT I have read the Statement of Claim herein and I confirm that all the averments contained therein are correct and true and in accordance with the Claimant\'s instructions to our Advocates.'));
  children.push(numberedPara(3, 'THAT I swear this Affidavit in verification of the averments in the Statement of Claim.'));
  children.push(numberedPara(4, 'THAT what is deponed is true to the best of my knowledge, information and belief.'));
  (d.verification_extra_paragraphs || []).forEach((text, i) => children.push(numberedPara(5 + i, text)));
  children.push(...buildJurat(sccVerifier, d.dated_at || 'NAIROBI', d.verification_date || d.date));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── List of Witnesses ─────────────────────────────────────────────────────────
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...sccCaption());
  children.push(...buildDocumentTitle("CLAIMANT'S LIST OF WITNESSES"));
  const sccWitnesses = d.witnesses || [];
  sccWitnesses.forEach((w, i) => {
    children.push(new Paragraph({
      children: [antiqua(`${i + 1}.  ${w.name}${w.description ? ' — ' + w.description : ''}`)],
      spacing: spacing(0, 80)
    }));
  });
  children.push(new Paragraph({ children: [antiqua(`${sccWitnesses.length + 1}.  Any other witness with leave of court.`)], spacing: spacing(0, 80) }));
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({ children: [antiqua(FIRM_NAME, { bold: true })], alignment: AlignmentType.RIGHT, spacing: spacing(0, 40) }));
  children.push(new Paragraph({ children: [antiqua('ADVOCATES FOR THE CLAIMANT')], alignment: AlignmentType.RIGHT, spacing: spacing(0, 80) }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Witness Statement ─────────────────────────────────────────────────────────
  if (d.witness_statement_paragraphs && d.witness_statement_paragraphs.length > 0) {
    const sccWsName     = sccWitnesses[0] ? sccWitnesses[0].name        : sccVerifier;
    const sccWsCap      = sccWitnesses[0] ? sccWitnesses[0].description  : sccVerifierCap;
    const sccWsDesc     = d.verifier_description || 'an adult of sound mind';

    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(...sccCaption());
    children.push(...buildDocumentTitle("CLAIMANT'S WITNESS STATEMENT"));
    children.push(spacer());
    children.push(paraB(`I, ${sccWsName}, ${sccWsDesc}, ${sccWsCap}, do hereby make an oath and state as follows:`));
    children.push(spacer());
    d.witness_statement_paragraphs.forEach((text, i) => {
      children.push(numberedPara(i + 1, `THAT ${text}`));
      children.push(spacer());
    });
    children.push(paraB('THAT is all I wish to state.'));
    children.push(spacer());
    children.push(new Paragraph({ children: [antiqua('......................................................')], spacing: spacing(240, 40) }));
    children.push(new Paragraph({ children: [antiqua(sccWsName.toUpperCase(), { bold: true })], spacing: spacing(0, 40) }));
    children.push(new Paragraph({ children: [antiqua(sccWsCap.toUpperCase())], spacing: spacing(0, 80) }));
    children.push(spacer());
    children.push(datedAt(d.dated_at, d.date));
    children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));
  }

  // ── List of Documents ─────────────────────────────────────────────────────────
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...sccCaption());
  children.push(...buildDocumentTitle("CLAIMANT'S LIST OF DOCUMENTS"));
  const sccDocList = d.doc_list || [];
  sccDocList.forEach((doc, i) => {
    children.push(new Paragraph({ children: [antiqua(`${i + 1}.  ${doc}`)], spacing: spacing(0, 80) }));
  });
  children.push(new Paragraph({ children: [antiqua(`${sccDocList.length + 1}.  Any other document with leave of the Honourable Court.`)], spacing: spacing(0, 80) }));
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({ children: [antiqua(FIRM_NAME, { bold: true })], alignment: AlignmentType.RIGHT, spacing: spacing(0, 40) }));
  children.push(new Paragraph({ children: [antiqua('ADVOCATES FOR THE CLAIMANT')], alignment: AlignmentType.RIGHT, spacing: spacing(0, 80) }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── SCC RESPONSE TO STATEMENT OF CLAIM (FORM 2, RULE 9) ─────────────────────
// Composite: Response form + Witness Statement + List of Witnesses + List of Documents
function buildSCCResponse() {
  const claimant   = d.claimant   || '';
  const respondent = d.respondent || '';
  const cd = d.claimant_details   || {};
  const rd = d.respondent_details || {};

  const responseType = d.response_type || 'denial';
  // response_type options: no_debt | partial_debt | admits_all | paid | claimant_owes | denial

  // ── Page 1: The Response Form ─────────────────────────────────────────────────
  const children = [
    sccFormHeader(9, 2),
    ...sccCaption(),
    ...buildDocumentTitle('RESPONSE TO STATEMENT OF CLAIM'),
    spacer(),

    // Section 1: Claimant Details (as served on us)
    sccSectionHeading(1, "Claimant's Personal Details"),
    formField('Name: ',               cd.name            || claimant),
    formField('Postal Address: ',     cd.postal_address  || 'N/A'),
    formField('Physical Address: ',   cd.physical_address || 'N/A'),
    formField('Telephone Contact: ',  cd.tel             || 'N/A'),
    formField('Email Address: ',      cd.email           || 'N/A'),
    formField('Nature of Business: ', cd.nature_of_business || 'N/A'),
    formField('Location/Sub/Village: ', cd.location      || 'N/A'),
    spacer(),

    // Section 2: Respondent Details (our client)
    sccSectionHeading(2, "Respondent's Personal Details"),
    formField('Name: ',               rd.name            || respondent),
    formField('Physical Address: ',   rd.physical_address || `c/o ${FIRM_NAME_TC}`),
    formField('Postal Address: ',     rd.postal_address  || FIRM_PO),
    formField('Telephone Contact: ',  rd.tel             || FIRM_TEL),
    formField('Email Address: ',      rd.email           || FIRM_EMAIL),
    formField('Nature of Business: ', rd.nature_of_business || ''),
    formField('Location/Sub/Village: ', rd.location      || FIRM_CITY),
    spacer(),
  ];

  // Section 3: Response
  children.push(sccSectionHeading(3, 'Response to Statement of Claim'));
  children.push(paraB(`In response to the Statement of Claim dated the ${d.claim_date || '___'} day of ${d.claim_month || '___'} ${new Date().getFullYear()}, the Respondent states as follows: (Please tick where appropriate)`));
  children.push(spacer());
  children.push(checkboxLine(responseType === 'no_debt',       'The Respondent does not owe the Claimant any money.'));
  children.push(checkboxLine(responseType === 'partial_debt',  `The Respondent owes the Claimant only a portion of the amount claimed amounting to Kshs ${d.partial_amount || '_______________'} (state the amount admitted)`));
  children.push(checkboxLine(responseType === 'admits_all',    "The Respondent admits the whole of the Claimant's claim."));
  children.push(checkboxLine(responseType === 'paid',          "The Respondent has paid to the Claimant all the sum claimed in the Statement of Claim."));
  children.push(checkboxLine(responseType === 'claimant_owes', `It is the Claimant who owes the Respondent a sum of Kshs ${d.claimant_owes_amount || '_______________'} on account of ${d.claimant_owes_basis || '_______________'}`));
  children.push(checkboxLine(responseType === 'denial',        'If the response is in denial of the whole or part of the claim. Give reasons why the claim is denied (explain briefly):'));
  children.push(spacer());
  if (responseType === 'denial') {
    (d.denial_reasons || []).forEach((reason, i) => {
      children.push(new Paragraph({
        children: [antiqua(`${i + 1}.  ${reason}`)],
        spacing: spacing(0, 100),
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 360 }
      }));
    });
    children.push(spacer());
  }

  // Section 4: Correct court?
  const correctCourt = d.correct_court !== false;
  children.push(sccSectionHeading(4, "In addition to the Respondent's response above, the Respondent states that this claim:"));
  children.push(checkboxLine( correctCourt, 'Is filed in the right Court'));
  children.push(checkboxLine(!correctCourt, `Is filed in the wrong Court and should be transferred to the Small Claims Court at ${d.transfer_court || '_______________'}`));
  children.push(spacer());

  // Section 5: Counterclaim
  children.push(sccSectionHeading(5, 'Counterclaim'));
  children.push(paraB(`Without prejudice to the Respondent's response above, the Respondent Counterclaims against the Claimant the sum of Kshs ${d.counterclaim_amount || '_______________'} on account of ${d.counterclaim_basis || '_______________'} (state amount and grounds of counterclaim)`));
  children.push(spacer());

  // Section 6: Set-Off
  children.push(sccSectionHeading(6, 'Set-Off'));
  children.push(paraB(`While admitting the Claimant's claim in the sum of Kshs ${d.setoff_admission || '_______________'}, the Respondent states they are entitled to a Set-Off in the sum of Kshs ${d.setoff_amount || '_______________'} on account of ${d.setoff_basis || '_______________'}`));
  children.push(spacer());

  // Section 7: Third Party
  children.push(sccSectionHeading(7, 'Claim against Third Party'));
  children.push(paraB('The Respondent denies the Claimant\'s claim and states that the person named below ("the Third Party") is liable to the Claimant on the grounds set out in the attached Third Party Notice.'));
  children.push(formField('Name of Third Party: ',    d.third_party_name     || '...............................................'));
  children.push(formField('Postal Address: ',         d.third_party_postal   || '...............................................'));
  children.push(formField('Telephone Contact: ',      d.third_party_tel      || '...............................................'));
  children.push(formField('Email Address: ',          d.third_party_email    || '...............................................'));
  children.push(formField('Location/Sub/Village: ',   d.third_party_location || '...............................................'));
  children.push(spacer());

  // Section 8: Relief
  const responseRelief = d.response_relief || 'dismiss';
  children.push(sccSectionHeading(8, 'Remedy/Relief Sought (Please tick where appropriate)'));
  children.push(checkboxLine(responseRelief === 'dismiss',              "Dismiss the Claimant's claim with costs to the Respondent"));
  children.push(checkboxLine(responseRelief === 'judgment_for_claimant', `Enter Judgment in favour of the Claimant against the Respondent in the sum of Kshs ${d.judgment_amount || '_______________'}`));
  children.push(checkboxLine(responseRelief === 'counterclaim_judgment', `Enter judgment in favour of the Respondent against the Claimant on the Counterclaim/Set off in the sum of Kshs ${d.counterclaim_amount || '_______________'}`));
  children.push(checkboxLine(responseRelief === 'third_party_judgment',  `Enter judgment in favour of the Claimant against the Third-party in the sum of Kshs ${d.judgment_amount || '_______________'}`));
  children.push(spacer());

  // Declaration
  children.push(new Paragraph({ children: [antiqua('Declaration', { bold: true, underline: { type: UnderlineType.SINGLE } })], spacing: spacing(120, 60) }));
  children.push(paraB('I declare that the information given above is true.'));
  children.push(formField('Name of Respondent: ', rd.name || respondent));
  children.push(new Paragraph({ children: [antiqua('Signature of Respondent: ___________________')], spacing: spacing(0, 60) }));
  children.push(paraB(`Dated this _______ day of _________________ ${new Date().getFullYear()}`));
  children.push(spacer());

  // Acknowledgement of Service
  children.push(new Paragraph({ children: [antiqua('Acknowledgement of Service', { bold: true, underline: { type: UnderlineType.SINGLE } })], spacing: spacing(120, 60) }));
  children.push(paraB('I acknowledge service of this Response to Statement of Claim delivered to me, with evidential documents attached, on ___________________________________________.'));
  children.push(formField('Name of Claimant: ', cd.name || claimant));
  children.push(new Paragraph({ children: [antiqua('Signature of Claimant: _____________________')], spacing: spacing(0, 80) }));
  children.push(spacer());

  // For Official Use Only
  children.push(new Paragraph({ children: [antiqua('For Official Use Only', { bold: true })], spacing: spacing(120, 60) }));
  children.push(paraB(`This Response to Statement of Claim was filed on the _______ day of _________________ ${new Date().getFullYear()}`));
  children.push(paraB('Signed ________________________________'));
  children.push(new Paragraph({ children: [antiqua('(Registrar)')], spacing: spacing(0, 80) }));
  children.push(spacer());

  // Dated + firm
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({ children: [antiqua(FIRM_NAME, { bold: true })], alignment: AlignmentType.RIGHT, spacing: spacing(0, 40) }));
  children.push(new Paragraph({ children: [antiqua('ADVOCATES FOR THE RESPONDENT')], alignment: AlignmentType.RIGHT, spacing: spacing(0, 80) }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── Witness Statement ─────────────────────────────────────────────────────────
  const rWsName     = d.witness_name     || d.respondent_signatory || '[WITNESS NAME]';
  const rWsCap      = d.witness_capacity || `the Director of the Respondent, ${respondent}`;

  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...sccCaption());
  children.push(...buildDocumentTitle('WITNESS STATEMENT'));
  children.push(spacer());
  children.push(paraB(`I ${rWsName}, am an adult of sound mind and ${rWsCap}, and competent to swear/affirm this statement.`));
  children.push(spacer());
  (d.witness_statement_paragraphs || []).forEach((text, i) => {
    children.push(new Paragraph({
      children: [antiqua(text)],
      spacing: spacing(0, 120),
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 360 }
    }));
    children.push(spacer());
  });
  children.push(new Paragraph({ children: [antiqua('______________________________')], spacing: spacing(240, 40) }));
  children.push(new Paragraph({ children: [antiqua(rWsName.toUpperCase(), { bold: true })], spacing: spacing(0, 80) }));
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── List of Witnesses ─────────────────────────────────────────────────────────
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...sccCaption());
  children.push(...buildDocumentTitle('LIST OF WITNESSES'));
  const rWitnesses = d.witnesses || [{ name: rWsName }];
  rWitnesses.forEach((w, i) => {
    children.push(new Paragraph({ children: [antiqua(`${i + 1}.  ${w.name}`)], spacing: spacing(0, 80) }));
  });
  children.push(new Paragraph({ children: [antiqua(`${rWitnesses.length + 1}.  Any other witness to be called with leave of this Honourable Court.`)], spacing: spacing(0, 80) }));
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({ children: [antiqua(FIRM_NAME, { bold: true })], alignment: AlignmentType.RIGHT, spacing: spacing(0, 40) }));
  children.push(new Paragraph({ children: [antiqua('ADVOCATES FOR THE RESPONDENT')], alignment: AlignmentType.RIGHT, spacing: spacing(0, 80) }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  // ── List of Documents ─────────────────────────────────────────────────────────
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(...sccCaption());
  children.push(...buildDocumentTitle('LIST OF DOCUMENTS'));
  const rDocList = d.doc_list || [];
  rDocList.forEach((doc, i) => {
    children.push(new Paragraph({ children: [antiqua(`${i + 1}.  ${doc}`)], spacing: spacing(0, 80) }));
  });
  children.push(new Paragraph({ children: [antiqua(`${rDocList.length + 1}.  Any other document to be produced with leave of this Court.`)], spacing: spacing(0, 80) }));
  children.push(spacer());
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({ children: [antiqua(FIRM_NAME, { bold: true })], alignment: AlignmentType.RIGHT, spacing: spacing(0, 40) }));
  children.push(new Paragraph({ children: [antiqua('ADVOCATES FOR THE RESPONDENT')], alignment: AlignmentType.RIGHT, spacing: spacing(0, 80) }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── WRITTEN SUBMISSIONS ──────────────────────────────────────────────────────
// Works for any court or tribunal.
// d.sections = [ { heading: '...', paragraphs: ['...'], is_issue: bool } ]
// Continuous paragraph numbering across all sections.
function buildSubmissions() {
  const partyDesc = d.party_description
    || (d.plaintiff_label ? d.plaintiff_label.toUpperCase() : 'PLAINTIFF');
  const submissionsTitle = d.submissions_title
    || `${partyDesc}'S WRITTEN SUBMISSIONS${d.submissions_context ? ' ' + d.submissions_context.toUpperCase() : ''}`;

  const children = [...buildCourtCaption(), ...buildDocumentTitle(submissionsTitle)];
  children.push(spacer());

  // Opening line ("May it please this Honourable Court/Tribunal;")
  const openingLine = d.opening_line || 'May it please this Honourable Court;';
  children.push(new Paragraph({ children: [antiqua(openingLine)], spacing: spacing(0, 200) }));

  // Continuous paragraph numbering
  let paraCounter = 0;
  (d.sections || []).forEach(section => {
    children.push(sectionHeading(section.heading));
    (section.paragraphs || []).forEach(text => {
      paraCounter++;
      children.push(numberedPara(paraCounter, text));
    });
    children.push(spacer());
  });

  // Dated + firm
  children.push(datedAt(d.dated_at, d.date));
  children.push(spacer());
  children.push(new Paragraph({ children: [antiqua(FIRM_NAME, { bold: true })], alignment: AlignmentType.RIGHT, spacing: spacing(0, 40) }));
  children.push(new Paragraph({ children: [antiqua(`ADVOCATES FOR THE ${partyDesc}`)], alignment: AlignmentType.RIGHT, spacing: spacing(0, 80) }));
  children.push(...buildDrawnByBlock({ serveUpon: d.serve_upon || [] }));

  return children;
}

// ─── ═══════════════════════════════════════════════════════════════════════ ──
// ROUTE TO CORRECT BUILDER
// ─── ═══════════════════════════════════════════════════════════════════════ ──

function buildDocumentChildren() {
  switch (d.doc_type) {
    case 'demand_letter':  return buildDemandLetter();
    case 'client_letter':  return buildClientLetter();
    case 'plaint':         return buildPlaint();
    case 'defence':        return buildDefence();
    case 'notice_of_motion': return buildNoticeOfMotion();
    case 'affidavit':      return buildAffidavit();
    case 'affidavit_of_service': return buildAffidavitOfService();
    case 'hearing_notice':       return buildHearingNotice();
    case 'scc_claim':            return buildSCCClaim();
    case 'scc_response':         return buildSCCResponse();
    case 'submissions':          return buildSubmissions();
    default:
      console.error(`Unknown doc_type: ${d.doc_type}`);
      process.exit(1);
  }
}

// ─── Assemble and write document ──────────────────────────────────────────────
const isLetterhead = ['demand_letter', 'client_letter'].includes(d.doc_type);

const section = {
  properties: {
    page: {
      size: { width: A4_W, height: A4_H },
      margin: {
        top: (isLetterhead && LH_MODE === 'image') ? 360 : MARGIN_TOP,
        right: MARGIN_SIDE,
        bottom: MARGIN_BOTTOM,
        left: MARGIN_SIDE
      }
    }
  },
  children: buildDocumentChildren()
};

if (isLetterhead) {
  section.footers = { default: buildLetterheadFooter() };
}

const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Book Antiqua', size: 24, color: BLACK } }
    }
  },
  sections: [section]
});

Packer.toBuffer(doc)
  .then(buffer => {
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Document written to: ${outputPath}`);
  })
  .catch(err => {
    console.error('Error generating document:', err.message);
    process.exit(1);
  });
