import { useState } from "react";

import { saveHeardAbout } from "../../lib/api/store.functions";
import { HEARD_ABOUT, type HeardAboutId } from "../../lib/heard-about";

// "How did you hear about us?" on the order confirmation screens.
//
// Optional and one tap. The answer is saved onto the order and shows in the
// back office; nobody is emailed. `proof` is whatever only this buyer holds
// (Stripe session id, PayPal order id, or the email they typed) so the server
// can tell the answer really came from them.
export function HeardAbout({ reference, proof }: { reference: string; proof: string }) {
  const [picked, setPicked] = useState<HeardAboutId | null>(null);
  const [state, setState] = useState<"ask" | "saving" | "thanks">("ask");

  async function choose(id: HeardAboutId) {
    if (state !== "ask") return;
    setPicked(id);
    setState("saving");
    try {
      await saveHeardAbout({ data: { reference, proof, answer: id } });
    } catch {
      // A failed save is not worth troubling a customer who has just paid.
    }
    setState("thanks");
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
                onClick={() => choose(h.id)}
                className={`inline-flex h-11 items-center rounded-full px-4 text-[15px] font-medium transition active:scale-[0.97] disabled:opacity-60 ${
                  picked === h.id
                    ? "bg-ink text-surface"
                    : "bg-white text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] hover:shadow-[inset_0_0_0_1.5px_currentColor]"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
