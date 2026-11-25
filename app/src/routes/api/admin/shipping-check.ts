import { createFileRoute } from "@tanstack/react-router";

import { denied, isSignedIn } from "../../../lib/admin.server";
import { shippingDiagnostics } from "../../../lib/rates.server";

/** Open /api/admin/shipping-check while signed in to the back office to see
 *  whether live UPS rates are working and which account they come from. */
export const Route = createFileRoute("/api/admin/shipping-check")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        return Response.json(await shippingDiagnostics(), { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
