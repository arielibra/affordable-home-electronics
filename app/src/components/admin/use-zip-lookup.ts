import { useEffect, useRef, useState } from "react";

/**
 * Typing a postcode fills in the city and state.
 *
 * Shared by the order editor and the create-an-order form. It began life
 * inside the editor; copying it into the second form is how the two would have
 * drifted apart, which is the mistake that made the back office feel random in
 * the first place.
 *
 * **It fires only once he has typed in the ZIP box himself**, never on open and
 * never merely because a stored city differs from what a lookup would say.
 * Editing the postcode is the one unambiguous signal that the address moved;
 * anything looser quietly rewrites the city on an order opened to change
 * something else. The same ZIP is never looked up twice in a sitting.
 *
 * The lookup goes through the shop's own Worker rather than from the browser to
 * a third party, so a customer's postcode never leaves his own server and every
 * answer is cached in `zip_lookup`.
 *
 * Failure is never in the way: a miss, a timeout and a dead upstream all end
 * with a quiet line saying to type the city himself. The fields stay editable
 * throughout and nothing blocks on it.
 */
export function useZipLookup(zip: string, fill: (city: string, state: string) => void) {
  const [touched, setTouched] = useState(false);
  const [note, setNote] = useState("");
  const lastLooked = useRef("");

  // Held in a ref so a caller passing an inline arrow does not restart the
  // timer on every keystroke.
  const fillRef = useRef(fill);
  fillRef.current = fill;

  useEffect(() => {
    if (!touched) return;
    const five = zip.replace(/[^0-9]/g, "").slice(0, 5);
    if (five.length !== 5 || five === lastLooked.current) return;

    let alive = true;
    const t = setTimeout(() => {
      setNote("Looking up…");
      void fetch(`/api/admin/zip?zip=${five}`)
        .then((r) => r.json() as Promise<{ ok: boolean; city?: string; state?: string }>)
        .then((d) => {
          if (!alive) return;
          lastLooked.current = five;
          if (d.ok && d.city && d.state) {
            fillRef.current(d.city, d.state);
            setNote(`${five} is ${d.city}, ${d.state}`);
          } else {
            setNote("No match for that ZIP — type the city yourself.");
          }
        })
        .catch(() => alive && setNote("Could not look that up — type the city yourself."));
    }, 450);

    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [zip, touched]);

  return {
    note,
    /** Call from the ZIP field's onChange. */
    touch: () => setTouched(true),
    /** For a form that clears itself after saving, so the last note does not linger. */
    reset: () => {
      setTouched(false);
      setNote("");
      lastLooked.current = "";
    },
  };
}
