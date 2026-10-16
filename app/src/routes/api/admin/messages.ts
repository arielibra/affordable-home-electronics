import { createFileRoute } from "@tanstack/react-router";
import { bindings } from "../../../lib/bindings.server";
import { denied, isSignedIn, logAdmin } from "../../../lib/admin.server";

type Message = {
  id: string;
  name: string;
  phone: string;
  email: string;
  borough: string;
  property_type: string;
  cameras: string;
  message: string;
  created_at: string;
  spam_score: number;
  spam_reasons: string;
};

export const Route = createFileRoute("/api/admin/messages")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });
        const res = await DB.prepare(
          "SELECT id,name,phone,email,borough,property_type,cameras,message,created_at,spam_score,spam_reasons FROM quote_requests ORDER BY created_at DESC LIMIT 300",
        ).all<Message>();
        return Response.json({ ok: true, messages: res.results ?? [] }, { headers: { "Cache-Control": "no-store" } });
      },

      /** Delete one message for good. No copy is kept; the admin asks twice first. */
      DELETE: async ({ request }) => {
        if (!(await isSignedIn(request))) return denied();
        const DB = bindings().DB;
        if (!DB) return Response.json({ ok: false, error: "No database." }, { status: 503 });
        const id = (new URL(request.url).searchParams.get("id") ?? "").trim().slice(0, 80);
        if (!id) return Response.json({ ok: false, error: "Bad request." }, { status: 400 });
        const row = await DB.prepare("SELECT name, email FROM quote_requests WHERE id = ?1")
          .bind(id)
          .first<{ name: string; email: string }>();
        if (!row) return Response.json({ ok: false, error: "That message is already gone." }, { status: 404 });
        await DB.prepare("DELETE FROM quote_requests WHERE id = ?1").bind(id).run();
        await logAdmin("message_delete", id, `${row.name} <${row.email}>`);
        return Response.json({ ok: true });
      },
    },
  },
});
