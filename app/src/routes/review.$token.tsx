import { createFileRoute, notFound } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { ReviewWriter } from "../components/site/reviews";
import { Eyebrow, Shell } from "../components/site/section";

/**
 * Where the follow-up email lands. The token in the address is the proof of
 * purchase, so the buyer sees their order's products straight away. Kept out
 * of search: every one of these pages is private to one customer.
 */
export const Route = createFileRoute("/review/$token")({
  // Real links carry a 32-character hex token. Anything else is a mistyped or
  // made-up address, so it gets a proper 404 instead of an empty review form.
  beforeLoad: ({ params }) => {
    if (!/^[0-9a-f]{32}$/i.test(params.token)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Review your order | Affordable Home Electronics" },
      { name: "robots", content: "noindex, nofollow" },
      // The token must not leak to other sites through the Referer header.
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const { token } = Route.useParams();
  return (
    <SiteShell>
      <Shell className="py-14 md:py-20">
        <div className="max-w-3xl">
          <Eyebrow>Verified buyer review</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tighter text-ink md:text-5xl">
            How did it work out?
          </h1>
          <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-muted">
            A star rating is all it takes. A line or two about how you use it helps the next buyer even more. Rate as many or
            as few as you like.
          </p>
          <div className="mt-10">
            <ReviewWriter token={token} />
          </div>
        </div>
      </Shell>
    </SiteShell>
  );
}
