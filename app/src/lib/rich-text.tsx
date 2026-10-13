import type { ReactNode } from "react";

/**
 * A very small amount of formatting for product text: **bold** and *italic*,
 * nothing else.
 *
 * This deliberately parses into React elements rather than producing HTML for
 * dangerouslySetInnerHTML. The catalog is the reason, not theory — one real
 * description reads "high Sub band rejection (>-40dB) and low-insertion loss
 * (<0.5dB)". Rendered as HTML, "(<0.5dB)" is a malformed tag and the text
 * disappears. As React children it is a text node and stays literal. The same
 * property means product text can never introduce a script, which matters
 * because the admin is one shared password in front of a shop that takes card
 * details.
 *
 * Asterisks already appear in the catalog as multiplication: "2560*1944@20fps".
 * So a marker only opens when it is not preceded by a letter or digit, and only
 * closes when it is not followed by one. "2560*1944" can neither open nor
 * close, and survives untouched.
 */
const TOKEN =
  /(?<![A-Za-z0-9])\*\*(?=[^*\s])([\s\S]*?[^*\s])\*\*(?![A-Za-z0-9])|(?<![A-Za-z0-9])\*(?=[^*\s])([^*\n]*?[^*\s])\*(?![A-Za-z0-9])/g;

/** Inline markers within a single line. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(<strong key={`${keyPrefix}b${m.index}`}>{m[1]}</strong>);
    } else {
      out.push(<em key={`${keyPrefix}i${m.index}`}>{m[2]}</em>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * Blank line starts a paragraph; a single newline is a line break. Pasted
 * manufacturer copy is usually a run of one-line bullets, and before this it
 * collapsed into one unreadable block because HTML folds newlines into spaces.
 */
export function renderRichText(text: string | undefined): ReactNode[] {
  const src = (text ?? "").replace(/\r\n?/g, "\n").trim();
  if (!src) return [];
  return src.split(/\n{2,}/).map((para, p) => (
    <p key={`p${p}`} className={p === 0 ? undefined : "mt-3"}>
      {para.split("\n").map((line, l) => (
        <span key={`l${l}`}>
          {l > 0 ? <br /> : null}
          {inline(line.replace(/\t+/g, " ").replace(/\s*\*{3,}\s*$/, ""), `${p}-${l}-`)}
        </span>
      ))}
    </p>
  ));
}

/**
 * The same text with the markers removed and the columns flattened, for places
 * that take a plain string: the meta description, and any short preview.
 */
export function plainText(text: string | undefined): string {
  return (text ?? "")
    .replace(TOKEN, (_all, bold, italic) => bold ?? italic)
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ *
 * Specifications
 *
 * A spec sheet is two columns — a label and a value — and that pairing is
 * the whole structure. A tab carries it here, because a tab is also what a
 * browser puts between table cells when a table is copied, so the thing that
 * arrives on the clipboard and the thing stored in the column are the same
 * shape and nothing has to be guessed.
 * ------------------------------------------------------------------ */

/*
 * Most sheets do not arrive with their tabs. A spec table copied from a
 * manufacturer's page often comes out as plain lines, the label welded to its
 * value by a single space ("Max. Resolution 2688 × 1520"), with section titles
 * and multi-line values indistinguishable from everything else. Printed as-is
 * that is a hundred and fifty ragged lines.
 *
 * So the parser recovers the columns from what is actually there, in order of
 * how certain each signal is: a tab; a line wrapped in bold; a known section
 * title; a known label at the start of the line (the camera and recorder
 * makers this shop carries use a stable vocabulary); "Label: value"; and
 * finally the shape of the line itself. When too little of a block is
 * recognisable it is shown as a plain list rather than guessed into a table.
 */

/** One row: a label with its value, or a full-width line with no label. */
export type SpecRow = { label?: string; value: string; note?: boolean };
export type SpecBlock = { heading: string } | { rows: SpecRow[] };
export type SpecSheet = { blocks: SpecBlock[]; links: string[]; rowCount: number };

/** Section titles, matched only when they stand alone on a line. */
const HEADINGS = new Set(
  [
    "camera", "lens", "dori", "illuminator", "video", "audio", "network", "image", "interface",
    "event", "general", "approval", "function", "functions", "deep learning function",
    "smart feature-set", "smart function", "video and audio", "decoding", "recording",
    "hard disk", "hdd", "external interface", "power", "physical", "environmental",
    "capacity", "feature", "features", "hardware", "software", "electrical", "mechanical",
    "certifications", "package", "in the box", "packaging",
  ].map((h) => h.toLowerCase()),
);

/**
 * Labels as the makers write them. Longest match wins, so "Audio Bit Rate"
 * beats "Audio". Only consulted at the start of a line and only on a word
 * boundary, so "Lens" cannot claim "Lensatic".
 */
const LABELS = [
  // imaging
  "Image Sensor", "Max. Resolution", "Resolution", "Min. Illumination", "Shutter Time", "Shutter Speed",
  "Slow Shutter", "Day & Night", "Angle Adjustment", "Lens Type", "Focal Length & FOV", "Focal Length",
  "Field of View", "FOV", "Lens Mount", "Iris Type", "Iris", "Aperture", "Depth of Field", "DORI",
  "Supplement Light Type", "Supplement Light Range", "Smart Supplement Light", "IR Wavelength",
  "IR Range", "IR Distance", "Wide Dynamic Range (WDR)", "WDR", "SNR", "Image Enhancement",
  "Image Parameters Switch", "Image Settings", "Day/Night Switch", "Privacy Mask", "Strobe Light",
  // video and audio
  "Main Stream", "Sub-Stream", "Sub Stream", "Third Stream", "Fourth Stream", "Video Compression",
  "Video Bit Rate", "H.264 Type", "H.265 Type", "H.264+", "H.265+", "Scalable Video Coding (SVC)",
  "Bit Rate Control", "Region of Interest (ROI)", "Target Cropping", "Audio Compression",
  "Audio Bit Rate", "Audio Sampling Rate", "Environment Noise Filtering", "Audio", "Two-way Audio",
  "Video Output", "Video Input", "Recording Resolution", "Frame Rate", "Decoding Capability",
  "Decoding Format", "Synchronous Playback", "Live View",
  // network
  "Protocols", "Simultaneous Live View", "API", "User/Host", "Security", "Network Storage", "Client",
  "Web Browser", "Incoming Bandwidth", "Outgoing Bandwidth", "Remote Connections",
  // interfaces and events
  "Ethernet Interface", "Network Interface", "On-Board Storage", "Reset Key", "Built-in Speaker",
  "Built-in Microphone", "Alarm Input", "Alarm Output", "Alarm In/Out", "Alarm", "USB Interface",
  "RS-485 Interface", "SATA", "Capacity", "Basic Event", "Smart Event", "Linkage",
  "Perimeter Protection", "Face Capture",
  // general
  "Power Consumption and Current", "Power Consumption", "Power Supply", "Power Interface", "Power",
  "Material", "Dimensions", "Dimension", "Package Dimensions", "Weight", "With Package Weight",
  "Storage Conditions", "Startup and Operating Conditions", "Operating Conditions",
  "Operating Temperature", "Operating Humidity", "Language", "General Function", "Protection",
  "Mounting", "Casing", "Color", "Colour", "Size", "Thickness", "Brand", "Model", "Warranty", "EMC",
  "Safety", "Environment", "Certification",
].sort((a, b) => b.length - a.length);

const URL_LINE = /^<?(https?:\/\/\S+?)>?$/i;
const BOLD_LINE = /^\*\*(.+?)\*\*$/;
const COLON_PAIR = /^([^:]{1,40}?)\s*:\s*(.*)$/;

/** A label at the start of the line, and whatever follows it. */
function knownLabel(line: string): { label: string; rest: string } | null {
  const lower = line.toLowerCase();
  for (const label of LABELS) {
    if (!lower.startsWith(label.toLowerCase())) continue;
    const next = line.charAt(label.length);
    if (next !== "" && next !== " " && next !== ":") continue;
    return { label: line.slice(0, label.length), rest: line.slice(label.length).replace(/^\s*:?\s*/, "") };
  }
  return null;
}

/** Bullets, dashes and paste debris at the edges of a line. */
function tidy(line: string): string {
  return line
    .replace(/^\s*(?:[◼■□▪▫●•◆◇►▶✓✔]\s*|[–—-]\s+)/, "")
    .replace(/\s*\*{3,}\s*$/, "")
    .trim();
}

/** A value line that obviously carries on from the one before it. */
function continues(prev: string, line: string): boolean {
  return /[,/(&+]$/.test(prev) || /\band$/i.test(prev) || /^[a-z(]/.test(line);
}

export function parseSpecSheet(text: string | undefined): SpecSheet {
  const links: string[] = [];
  const lines: string[] = [];
  for (const raw of (text ?? "").replace(/\r\n?/g, "\n").split("\n")) {
    const line = tidy(raw);
    if (!line) continue;
    const url = URL_LINE.exec(line);
    if (url) {
      if (!links.includes(url[1])) links.push(url[1]);
      continue;
    }
    // The section on the page is already called Specifications.
    if (/^(?:\*\*)?(?:product\s+)?specifications?:?(?:\*\*)?$/i.test(line)) continue;
    lines.push(line);
  }

  const recognised = (line: string) =>
    line.includes("\t") ||
    BOLD_LINE.test(line) ||
    HEADINGS.has(line.toLowerCase()) ||
    knownLabel(line) !== null ||
    COLON_PAIR.test(line);
  const structured = lines.length > 0 && lines.filter(recognised).length / lines.length >= 0.4;

  const blocks: SpecBlock[] = [];
  let rows: SpecRow[] = [];
  let rowCount = 0;
  // Held in an object rather than two lets: TypeScript does not see the
  // assignments made inside the helpers below and would narrow a bare `let`
  // to its initial null for the rest of the function.
  const st: {
    /** The row still accepting continuation lines, if any. */
    open: SpecRow | null;
    /** True when `open` was a bare label whose value is on the following lines. */
    gathering: boolean;
  } = { open: null, gathering: false };

  const flush = () => {
    if (rows.length > 0) blocks.push({ rows });
    rows = [];
    st.open = null;
    st.gathering = false;
  };
  const push = (row: SpecRow, keepOpen = true) => {
    // "DORI" as a title over a single row labelled "DORI" says it twice.
    const last = blocks[blocks.length - 1];
    if (rows.length === 0 && last && "heading" in last && row.label?.toLowerCase() === last.heading.toLowerCase()) {
      blocks.pop();
    }
    rows.push(row);
    rowCount++;
    st.open = keepOpen ? row : null;
    st.gathering = false;
  };
  const append = (row: SpecRow, line: string) => {
    if (!row.value) row.value = line;
    else if (COLON_PAIR.test(line) && !/:$/.test(row.value)) row.value += `\n${line}`;
    else if (/[,/(:]$/.test(row.value) || /^[a-z(]/.test(line) || /\band$/i.test(row.value)) row.value += ` ${line}`;
    else row.value += `\n${line}`;
  };

  if (!structured) {
    for (const line of lines) push({ value: line.replace(/\t+/g, " ") }, false);
    flush();
    return { blocks, links, rowCount };
  }

  for (const line of lines) {
    const prev = st.open;

    // A line wrapped in bold is a title, whatever is inside it.
    const bold = BOLD_LINE.exec(line);
    if (bold) {
      flush();
      blocks.push({ heading: bold[1].replace(/\t+/g, " ").trim() });
      continue;
    }

    // A tab is what a copied table cell boundary becomes: certain.
    const tab = line.indexOf("\t");
    if (tab !== -1) {
      const label = line.slice(0, tab).trim();
      const value = line.slice(tab + 1).trim().replace(/\t+/g, " ").replace(/ {3,}/g, " / ");
      push(label ? { label, value } : { value });
      if (label && !value) st.gathering = true;
      continue;
    }

    if (HEADINGS.has(line.toLowerCase())) {
      flush();
      blocks.push({ heading: line });
      continue;
    }

    // "*Third stream is supported under certain settings."
    if (/^\*[^*\s]/.test(line)) {
      push({ value: line.slice(1).trim(), note: true }, false);
      continue;
    }

    // A wrapped value: the previous line ended mid-list, or this one starts
    // in lower case. Checked before labels, so "Security Audit Log, …" on the
    // second line of a list is not mistaken for the label "Security".
    if (prev && prev.value && continues(prev.value, line)) {
      append(prev, line);
      continue;
    }

    // A bare label's first sub-line belongs to it even when that sub-line
    // starts with a word that is itself a label: "Video Compression" followed
    // by "Main stream: H.265/…" is one row, not two.
    if (prev && st.gathering && !prev.value && line.includes(":")) {
      append(prev, line);
      continue;
    }

    const known = knownLabel(line);
    if (known) {
      push({ label: known.label, value: known.rest });
      if (!known.rest) st.gathering = true;
      continue;
    }

    // Under a bare label, everything up to the next recognisable row is its
    // value — "Main Stream" followed by "50 Hz:" and the frame rates.
    if (prev && st.gathering) {
      append(prev, line);
      continue;
    }

    const pair = COLON_PAIR.exec(line);
    if (pair && /[A-Za-z]/.test(pair[1]) && !/https?/i.test(pair[1])) {
      push({ label: pair[1].trim(), value: pair[2].trim() });
      continue;
    }

    // What is left: a short wordy line is a title, anything else a row of its own.
    const words = line.split(/\s+/).length;
    if (words <= 3 && line.length <= 30 && !/\d/.test(line) && !/[.,;:]$/.test(line)) {
      flush();
      blocks.push({ heading: line });
    } else {
      push({ value: line });
    }
  }
  flush();
  return { blocks, links, rowCount };
}

/**
 * Pulls the label/value pairs out of the HTML flavour of a copied selection.
 *
 * The plain-text flavour of a copied table is unreliable: some pages give one
 * cell per line, which is how a tidy two-column sheet arrives as one long
 * ragged column with every value orphaned from its label. The HTML flavour
 * still has the rows, so the pairing is read rather than guessed.
 *
 * Only textContent is ever read out of the parsed document, and DOMParser does
 * not run scripts or fetch anything, so nothing from the clipboard executes.
 */
export function specsFromHtml(html: string): string | null {
  if (typeof DOMParser === "undefined" || !html.trim()) return null;
  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(html, "text/html");
  } catch {
    return null;
  }
  const clean = (el: Element | null) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
  const rows: string[] = [];

  for (const tr of Array.from(doc.querySelectorAll("tr"))) {
    const cells = Array.from(tr.children).filter((c) => c.tagName === "TD" || c.tagName === "TH");
    const parts = cells.map(clean).filter((v) => v !== "");
    if (parts.length === 0) continue;
    rows.push(parts.length === 1 ? parts[0] : `${parts[0]}\t${parts.slice(1).join(" ")}`);
  }
  if (rows.length > 0) return rows.join("\n");

  // Some sheets are marked up as a definition list instead of a table.
  for (const dl of Array.from(doc.querySelectorAll("dl"))) {
    let label = "";
    for (const child of Array.from(dl.children)) {
      if (child.tagName === "DT") label = clean(child);
      else if (child.tagName === "DD") {
        const value = clean(child);
        if (label || value) rows.push(`${label}\t${value}`);
        label = "";
      }
    }
  }
  return rows.length > 0 ? rows.join("\n") : null;
}

/** True when the text is mostly label/value rows rather than prose. */
export function looksLikeSpecRows(text: string): boolean {
  const lines = (text ?? "").split("\n").filter((l) => l.trim() !== "");
  if (lines.length < 2) return false;
  return lines.filter((l) => l.includes("\t")).length >= Math.ceil(lines.length / 2);
}

/**
 * Specifications render as the two columns they are: label on the left, value
 * on the right, section titles between groups, and full-width lines for
 * anything that has no label. Multi-line values keep their line breaks.
 */
export function renderSpecSheet(sheet: SpecSheet): ReactNode {
  return (
    <>
      {sheet.blocks.map((block, b) =>
        "heading" in block ? (
          <h3 key={`h${b}`} className="mt-7 text-sm font-semibold tracking-tight text-ink first:mt-0">
            {inline(block.heading, `h${b}-`)}
          </h3>
        ) : (
          <dl key={`d${b}`} className="mt-2 border-t border-line first:mt-0">
            {block.rows.map((r, i) =>
              r.label !== undefined ? (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-x-6 gap-y-0.5 border-b border-line py-2.5 sm:grid-cols-[15rem_1fr]"
                >
                  <dt className="text-ink">{inline(r.label, `k${b}-${i}-`)}</dt>
                  <dd className="whitespace-pre-line text-muted">{r.value ? inline(r.value, `v${b}-${i}-`) : "\u2014"}</dd>
                </div>
              ) : (
                <div key={i} className="border-b border-line py-2.5">
                  <dd
                    className={`whitespace-pre-line ${r.note ? "text-sm italic text-muted" : "text-muted"}`}
                  >
                    {inline(r.value, `v${b}-${i}-`)}
                  </dd>
                </div>
              ),
            )}
          </dl>
        ),
      )}
    </>
  );
}

/** Text in, rendered sheet out — the admin preview uses this. */
export function renderSpecs(text: string | undefined): ReactNode {
  const sheet = parseSpecSheet(text);
  if (sheet.blocks.length === 0) return null;
  return renderSpecSheet(sheet);
}

/** A readable name for a spec-sheet link: what the customer gets by clicking it. */
export function specLinkLabel(url: string): string {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // leave it blank; the generic label still works
  }
  const pdf = /\.pdf(?:$|[?#])/i.test(url);
  if (pdf) return "Download the spec sheet (PDF)";
  return host ? `Manufacturer\u2019s page on ${host}` : "Manufacturer\u2019s page";
}

/**
 * Text copied out of a web page carries the page's layout with it: a run of
 * empty lines for every empty div, indentation from the source markup, no-break
 * spaces, and the odd zero-width character. Pasted raw, a four-line feature
 * list arrives with a dozen blank lines running through it.
 *
 * This keeps the structure that was really there — the line breaks, the
 * paragraph breaks, and the tabs between columns — and drops the rest. One
 * blank line is the most that survives, because one blank line is all the
 * renderer treats as a new paragraph anyway.
 */
export function cleanPastedText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    // no-break and typographic spaces: they read as spaces but do not collapse
    .replace(/[   -   　]/g, " ")
    // zero-width characters: invisible, and they break search and word wrap
    .replace(/[​-‍⁠﻿]/g, "")
    .split("\n")
    .map((line) =>
      line
        // runs of spaces holding a layout up, but never the tab: that is the
        // column separator, and collapsing it is what welded the labels to
        // their values and lost the two columns.
        .replace(/ +/g, " ")
        .replace(/ *\t[ \t]*/g, "\t")
        .replace(/^ +| +$/g, ""),
    )
    .join("\n")
    // a blank line between paragraphs is meaningful; six of them are not
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
