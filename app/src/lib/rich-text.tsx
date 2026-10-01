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
          {inline(line.replace(/\t+/g, " "), `${p}-${l}-`)}
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

/** One label/value pair, or a lone line that stands as a heading. */
type SpecLine = { label: string; value: string } | { heading: string };

function parseSpecs(src: string): SpecLine[] {
  return src
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const tab = line.indexOf("\t");
      if (tab === -1) return { heading: line.trim() };
      return { label: line.slice(0, tab).trim(), value: line.slice(tab + 1).replace(/\t/g, " ").trim() };
    });
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
 * Specifications render as the two columns they are. A line without a tab is
 * treated as a heading between groups, which is how a copied sheet with
 * section titles in it comes out.
 */
export function renderSpecs(text: string | undefined): ReactNode {
  const src = (text ?? "").replace(/\r\n?/g, "\n").trim();
  if (!src) return null;
  if (!src.includes("\t")) return <>{renderRichText(src)}</>;

  const lines = parseSpecs(src);
  const blocks: ReactNode[] = [];
  let group: { label: string; value: string }[] = [];

  const flush = (key: string) => {
    if (group.length === 0) return;
    const rows = group;
    group = [];
    blocks.push(
      <dl key={key} className="mt-2 border-t border-line">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-1 gap-x-6 border-b border-line py-2 sm:grid-cols-[14rem_1fr]">
            <dt className="text-ink">{inline(r.label, `k${key}-${i}-`)}</dt>
            <dd className="text-muted">{inline(r.value, `v${key}-${i}-`)}</dd>
          </div>
        ))}
      </dl>,
    );
  };

  lines.forEach((line, i) => {
    if ("heading" in line) {
      flush(`d${i}`);
      blocks.push(
        <p key={`h${i}`} className="mt-5 font-medium text-ink first:mt-0">
          {inline(line.heading, `h${i}-`)}
        </p>,
      );
    } else {
      group.push(line);
    }
  });
  flush("dlast");

  return <>{blocks}</>;
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
