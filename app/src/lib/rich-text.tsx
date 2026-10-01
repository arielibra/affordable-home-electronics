import type { ReactNode } from "react";

/**
 * A very small amount of formatting for product descriptions: **bold** and
 * *italic*, nothing else.
 *
 * This deliberately parses into React elements rather than producing HTML for
 * dangerouslySetInnerHTML. The catalog is the reason, not theory — one real
 * description reads "high Sub band rejection (>-40dB) and low-insertion loss
 * (<0.5dB)". Rendered as HTML, "(<0.5dB)" is a malformed tag and the text
 * disappears. As React children it is a text node and stays literal. The same
 * property means a description can never introduce a script, which matters
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
          {inline(line, `${p}-${l}-`)}
        </span>
      ))}
    </p>
  ));
}

/**
 * The same text with the markers removed, for places that take a plain string:
 * the meta description, and any short preview. Whitespace is flattened because
 * those are single-line contexts.
 */
export function plainText(text: string | undefined): string {
  return (text ?? "")
    .replace(TOKEN, (_all, bold, italic) => bold ?? italic)
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Text copied out of a web page carries the page's layout with it: a run of
 * empty lines for every empty div, indentation from the source markup, no-break
 * spaces, and the odd zero-width character. Pasted raw, a four-line feature
 * list arrives with a dozen blank lines running through it.
 *
 * This keeps the structure that was really there — the line breaks and the
 * paragraph breaks — and drops the rest. One blank line is the most that
 * survives, because one blank line is all the renderer treats as a new
 * paragraph anyway.
 */
export function cleanPastedText(raw: string): string {
  return raw
    .replace(/\r\n?/g, "\n")
    // no-break and typographic spaces: they read as spaces but do not collapse
    .replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ")
    // zero-width characters: invisible, and they break search and word wrap
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .split("\n")
    // indentation from the source markup, and runs of spaces holding a layout up
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    // a blank line between paragraphs is meaningful; six of them are not
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
