import { useRef } from "react";
import { renderRichText } from "../../lib/rich-text";
import { btnTiny, textarea as textareaStyle } from "./ui";

/**
 * A plain textarea with Bold and Italic. The text stays text — the markers are
 * the two asterisk forms the shop pages understand — so a description can be
 * pasted in or copied out of this box and it is still just a description.
 */

/**
 * React keeps its own record of an input's value, so assigning el.value is
 * ignored on the next render. Going through execCommand keeps the browser's
 * own undo history intact, which matters when the box holds a long paste and
 * one stray ctrl+Z should not empty it. The native setter is the fallback for
 * browsers that have dropped execCommand.
 */
function replaceRange(el: HTMLTextAreaElement, from: number, to: number, text: string, caretFrom: number, caretTo: number) {
  el.focus();
  el.setSelectionRange(from, to);
  let inserted = false;
  try {
    inserted = document.execCommand("insertText", false, text);
  } catch {
    inserted = false;
  }
  if (!inserted) {
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    setter?.call(el, el.value.slice(0, from) + text + el.value.slice(to));
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }
  el.setSelectionRange(caretFrom, caretTo);
}

/** Wrap the selection, or unwrap it if it is already wrapped. */
function toggle(el: HTMLTextAreaElement, mark: "**" | "*") {
  const v = el.value;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const sel = v.slice(start, end);
  const n = mark.length;

  // the markers are inside the selection
  if (sel.length >= n * 2 && sel.startsWith(mark) && sel.endsWith(mark)) {
    const inner = sel.slice(n, -n);
    replaceRange(el, start, end, inner, start, start + inner.length);
    return;
  }
  // the markers are just outside it
  if (start >= n && v.slice(start - n, start) === mark && v.slice(end, end + n) === mark) {
    replaceRange(el, start - n, end + n, sel, start - n, start - n + sel.length);
    return;
  }
  // nothing selected puts the cursor between a fresh pair
  replaceRange(el, start, end, mark + sel + mark, start + n, start + n + sel.length);
}

export function RichTextArea({
  value,
  onChange,
  rows = 8,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const run = (mark: "**" | "*") => {
    if (ref.current) toggle(ref.current, mark);
  };

  return (
    <div>
      <div className="mt-1.5 flex items-center gap-2">
        <button type="button" onClick={() => run("**")} className={`${btnTiny} font-bold`} title="Bold (Ctrl+B)">
          B
        </button>
        <button type="button" onClick={() => run("*")} className={`${btnTiny} italic`} title="Italic (Ctrl+I)">
          I
        </button>
        <span className="text-[12px] text-muted">Select some words, then press B or I</span>
      </div>

      <textarea
        ref={ref}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
          const k = e.key.toLowerCase();
          if (k !== "b" && k !== "i") return;
          e.preventDefault();
          run(k === "b" ? "**" : "*");
        }}
        className={`mt-2 ${textareaStyle}`}
      />

      {/* Only worth the space once there is something to show. */}
      {/\*/.test(value) ? (
        <div className="mt-2.5">
          <span className="text-[12px] text-muted">How it will look on the shop page</span>
          <div className="mt-1.5 rounded-[12px] bg-[color:var(--admin-sunken)] px-4 py-3 text-[15px] leading-[1.55] text-ink">
            {renderRichText(value)}
          </div>
        </div>
      ) : null}
    </div>
  );
}
