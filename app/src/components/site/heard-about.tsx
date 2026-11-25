import { useEffect, useRef, useState } from "react";

import { saveHeardAbout } from "../../lib/api/store.functions";
import { HEARD_ABOUT, HEARD_ABOUT_OTHER_MAX, type HeardAboutId } from "../../lib/heard-about";

// "How did you hear about us?" on the order confirmation screens.
//
// Optional. Google, ChatGPT and Gemini save with one tap; "Other" opens a small
// text box so the customer can say where, then saves when they tap Send. The
// answer is saved onto the order and shows in the back office; nobody is
// emailed. `proof` is whatever only this buyer holds (Stripe session id, PayPal
// order id, or the email they typed) so the server can tell the answer really
// came from them.
export function HeardAbout({ reference, proof }: { reference: string; proof: string }) {
  const [picked, setPicked] = useState<HeardAboutId | null>(null);
  const [other, setOther] = useState("");
  const [state, setState] = useState<"ask" | "saving" | "thanks">("ask");
  const otherRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (picked === "other") otherRef.current?.focus();
  }, [picked]);

  async function save(id: HeardAboutId, text?: string) {
    if (state !== "ask") return;
    setState("saving");
    try {
      await saveHeardAbout({ data: { reference, proof, answer: id, other: text } });
    } catch {
      // A failed save is not worth troubling a customer who has just paid.
    }
    setState("thanks");
  }

  function choose(id: HeardAboutId) {
    if (state !== "ask") return;
    setPicked(id);
    if (id !== "other") void save(id);
  }

  if (!reference || !proof) return null;

  return (
    <section
      aria-labelledby="heard-about-title"
      className="mt-8 rounded-[14px] border border-[#dbe7f3] bg-surface px-5 py-5"
    >
      {state === "thanks" ? (
        <p className="text-[16px] font-semibold text-ink" role="status">
          Thanks for letting us know!
        </p>
      ) : (
        <>
          <p id="heard-about-title" className="text-[17px] font-semibold text-ink">
            One quick question: how did you hear about us?
          </p>
          <p className="mt-1 text-[14px] text-muted">Optional. Tap one.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {HEARD_ABOUT.map((h) => (
              <button
                key={h.id}
                type="button"
                disabled={state === "saving"}
                aria-pressed={picked === h.id}
                onClick={() => choose(h.id)}
                className={`inline-flex h-11 items-center rounded-full px-5 text-[15px] font-medium transition active:scale-[0.97] disabled:opacity-60 ${
                  picked === h.id
                    ? "bg-ink text-surface"
                    : "bg-white text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] hover:shadow-[inset_0_0_0_1.5px_currentColor]"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
          {picked === "other" ? (
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                void save("other", other);
              }}
            >
              <label htmlFor="heard-about-other" className="sr-only">
                Where did you hear about us?
              </label>
              <input
                id="heard-about-other"
                ref={otherRef}
                type="text"
                value={other}
                maxLength={HEARD_ABOUT_OTHER_MAX}
                onChange={(e) => setOther(e.target.value)}
                placeholder="Where did you hear about us?"
                className="h-11 w-full min-w-0 rounded-[10px] bg-white px-3.5 text-[15px] text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] placeholder:text-muted sm:flex-1"
              />
              <button
                type="submit"
                disabled={state === "saving"}
                className="h-11 rounded-[10px] bg-ink px-5 text-[15px] font-semibold text-surface transition active:scale-[0.97] disabled:opacity-60"
              >
                Send
              </button>
            </form>
          ) : null}
        </>
      )}
    </section>
  );
}
