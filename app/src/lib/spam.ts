/**
 * Scoring the contact form.
 *
 * The form had no notification at all, so nobody minded what arrived. Turning
 * it into email changes that: four of the first six submissions were agency
 * cold-pitches, and an inbox that is mostly those gets ignored, which puts us
 * back where we started.
 *
 * Two rules this follows. Nothing is ever discarded — every submission is
 * saved and shown in Messages whatever it scores, because a filter that
 * silently drops a customer is worse than one that lets a pitch through. And
 * the score is a plain sum of named reasons, stored on the row, so when it
 * gets one wrong you can see exactly why rather than guessing at a black box.
 */

/** At or above this, it is not worth an email. Saved and flagged, not sent. */
export const SPAM_HOLD = 4;
/** At or above this, email it but say in the subject that it looks like spam. */
export const SPAM_FLAG = 2;

/** What these pitches actually sell, and how they open. */
const PITCH: [RegExp, string][] = [
  [/\bvirtual assistants?\b/i, "virtual assistants"],
  [/\bVAs?\b/, "VAs"],
  [/\boutsourc/i, "outsourcing"],
  [/\boffshore\b/i, "offshore"],
  [/\blead gener/i, "lead generation"],
  [/\bcold (email|call)/i, "cold outreach"],
  [/\bSEO\b/i, "SEO"],
  [/\bbacklinks?\b/i, "backlinks"],
  [/\brank (your|the) (site|website)\b/i, "search rankings"],
  [/\bweb ?site design\b|\bwebsite redesign\b/i, "website design"],
  [/\bdigital marketing\b/i, "digital marketing"],
  [/\bsocial media (management|marketing)\b/i, "social media services"],
  [/\bgrow your business\b/i, "grow your business"],
  [/\bscale your\b/i, "scale your"],
  [/\bwithout having to learn\b/i, "without having to learn"],
  [/\bI tried (emailing|reaching|contacting)\b/i, "I tried emailing you"],
  [/\bI(?:'|’)?m (reaching out|contacting you)\b/i, "I am reaching out"],
  [/\bfree (trial|audit|consultation|quote for your)\b/i, "free audit"],
  [/\bno (upfront )?(cost|obligation)\b/i, "no obligation"],
  [/\bunsubscribe\b/i, "unsubscribe"],
];

/** Anything a real enquiry to this shop tends to mention. */
const RELEVANT =
  /\b(camera|cctv|dvr|nvr|surveillance|security|alarm|sensor|doorbell|intercom|access control|lock|monitor|cable|recorder|install|wiring|order|product|price|pricing|quote|stock|warranty|return|refund|ship|delivery|tracking|invoice|sell|sold|buy|purchase|wholesale|government|bulk|dealer|distributor|supply|supplier|repair|replace)\b/i;

/** If a long message has none of these it is probably not written in English. */
const ENGLISH = /\b(the|and|you|your|for|with|have|this|that|are|our|was|from)\b/i;

const LINK = /\b(https?:\/\/|www\.)/i;

export type SpamVerdict = { score: number; reasons: string[] };

export function scoreEnquiry(input: {
  message: string;
  topic?: string;
  /** True when this phone number already arrived under a different name. */
  phoneSeenUnderAnotherName?: boolean;
}): SpamVerdict {
  const message = (input.message ?? "").trim();
  const haystack = `${message} ${input.topic ?? ""}`;
  const reasons: string[] = [];
  let score = 0;

  // The pitch itself. Capped, so one spammer saying six buzzwords does not
  // outrank the signals that are actually independent of each other.
  let pitch = 0;
  for (const [re, label] of PITCH) {
    if (re.test(haystack)) {
      pitch += 2;
      reasons.push(label);
      if (pitch >= 6) break;
    }
  }
  score += Math.min(pitch, 6);

  if (message && !RELEVANT.test(haystack)) {
    score += 1;
    reasons.push("never mentions anything we sell");
  }

  if (LINK.test(message)) {
    score += 1;
    reasons.push("contains a link");
  }

  // Only on something long enough for the absence to mean anything — "hello
  // test" has no stopwords either, and it is not foreign, it is just short.
  if (message.length > 120 && !ENGLISH.test(message)) {
    score += 2;
    reasons.push("does not look like English");
  }

  if (message.length > 700) {
    score += 1;
    reasons.push("very long");
  }

  // The giveaway that caught two of the four: the same agency works a list
  // under different names from one number.
  if (input.phoneSeenUnderAnotherName) {
    score += 3;
    reasons.push("same phone number as an earlier message under a different name");
  }

  return { score, reasons };
}
