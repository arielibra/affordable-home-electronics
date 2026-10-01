import { createFileRoute } from "@tanstack/react-router";
import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";
import { mailReady, ownerAddress, sendMail } from "../../../lib/email.server";
import { ORIGIN, SITE } from "../../../lib/site";

/**
 * Proves the mail path without involving a customer.
 *
 * The alternative is finding out whether email works by marking a real order
 * shipped, which either tells a real person their parcel is moving or fails
 * silently at the worst moment. This sends one message to the shop's own
 * address and reports exactly what came back, so a wrong key or an unverified
 * domain is visible here rather than discovered later.
 */
export const Route = createFileRoute("/api/admin/test-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();

        if (!mailReady()) {
          return Response.json({
            ok: false,
            error: "No mail provider is set up yet. RESEND_API_KEY and MAIL_FROM are both needed, as Secrets.",
          });
        }
        const to = ownerAddress();
        if (!to) {
          return Response.json({
            ok: false,
            error: "There is no address to send to. Set OWNER_EMAIL as a Secret.",
          });
        }

        const when = new Date().toUTCString();
        const result = await sendMail("", "test", {
          to,
          subject: `${SITE.name} — email is working`,
          text: [
            `This is a test from the back office.`,
            ``,
            `If you are reading it, order notifications will reach you:`,
            `  - you get an email the moment an order is paid`,
            `  - the customer gets one when you mark their order shipped`,
            ``,
            `Sent ${when}`,
            ORIGIN,
          ].join("\n"),
          html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#14304e;max-width:560px">
<p><strong>This is a test from the back office.</strong></p>
<p>If you are reading it, order notifications will reach you:</p>
<ul style="padding-left:18px">
<li>you get an email the moment an order is paid</li>
<li>the customer gets one when you mark their order shipped</li>
</ul>
<p style="color:#5b7696;font-size:13px">Sent ${when}<br><a href="${ORIGIN}" style="color:#1668c1">${ORIGIN}</a></p>
</div>`,
        });

        await logAdmin("email_test", to, result.ok ? "sent" : result.error);
        return Response.json(
          result.ok
            ? { ok: true, sent_to: to }
            : { ok: false, error: result.error },
        );
      },
    },
  },
});
