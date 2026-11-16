import { useEffect } from "react";

import { getReviewOptIn } from "../../lib/api/store.functions";

// Google Customer Reviews: after a paid order, Google offers to email the
// buyer a short survey once the parcel should have arrived. Those answers are
// what build the shop's seller rating on Google Shopping and ads.
//
// Renders nothing of its own. Google draws its own small dialog in the bottom
// left corner; the buyer can tick yes or close it. Needs apis.google.com in
// script-src and www.google.com in frame-src (security-headers.server.ts).
const MERCHANT_ID = 11697041;

type GapiWindow = Window & {
  gapi?: { load: (name: string, cb: () => void) => void; surveyoptin?: { render: (o: object) => void } };
  renderGoogleOptIn?: () => void;
};

export function GoogleReviewsOptIn({ reference, proof }: { reference: string; proof: string }) {
  useEffect(() => {
    if (!reference || !proof) return;
    let alive = true;
    void (async () => {
      let r: Awaited<ReturnType<typeof getReviewOptIn>>;
      try {
        r = await getReviewOptIn({ data: { reference, proof } });
      } catch {
        return;
      }
      if (!alive || !r.ok) return;
      const w = window as GapiWindow;
      w.renderGoogleOptIn = () => {
        w.gapi?.load("surveyoptin", () => {
          w.gapi?.surveyoptin?.render({
            merchant_id: MERCHANT_ID,
            order_id: reference,
            email: r.email,
            delivery_country: r.country,
            estimated_delivery_date: r.deliveryDate,
            opt_in_style: "BOTTOM_LEFT_DIALOG",
          });
        });
      };
      if (document.getElementById("google-platform-js")) {
        if (w.gapi) w.renderGoogleOptIn();
        return;
      }
      const s = document.createElement("script");
      s.id = "google-platform-js";
      s.src = "https://apis.google.com/js/platform.js?onload=renderGoogleOptIn";
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    })();
    return () => {
      alive = false;
    };
  }, [reference, proof]);

  return null;
}
