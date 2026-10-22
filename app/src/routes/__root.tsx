import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportHiggsfieldError } from "../lib/higgsfield-error-reporting";
import appMetaJson from "../app-meta.json";
import { Mark } from "../components/site/mark";
import { SITE_JSON_LD } from "../lib/structured-data";

declare const __HF_DESIGN_INSPECTOR__: boolean;

const DEFAULT_TITLE = "Affordable Home Electronics";
const DEFAULT_DESCRIPTION =
  "Security cameras, recorders and access control from an authorized dealer in Rego Park, Queens. Shipping nationwide since 2003, installing across New York City.";

type AppMeta = {
  og_title?: string | null;
  og_description?: string | null;
  og_image_url?: string | null;
  favicon_url?: string | null;
  og_video_url?: string | null;
};

const appMeta = appMetaJson as AppMeta;
const APP_HOST_ZONES = ["higgsfield.app", "higgsfield-dev.app"];

function toOwnAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/")) return value;
  try {
    const u = new URL(value);
    const isAppHost = APP_HOST_ZONES.some((zone) => u.hostname === zone || u.hostname.endsWith(`.${zone}`));
    if (isAppHost) return u.pathname + u.search;
    return value;
  } catch {
    return value;
  }
}

function buildHead(meta: AppMeta) {
  const title = meta.og_title ?? DEFAULT_TITLE;
  const description = meta.og_description ?? DEFAULT_DESCRIPTION;
  const ogImage = toOwnAssetUrl(meta.og_image_url);
  const favicon = toOwnAssetUrl(meta.favicon_url);
  const ogVideo = toOwnAssetUrl(meta.og_video_url);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      { name: "theme-color", content: "#1f66b8" },
      { property: "og:site_name", content: DEFAULT_TITLE },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
      ...(ogImage ? [{ property: "og:image", content: ogImage }, { name: "twitter:image", content: ogImage }] : []),
      ...(ogVideo ? [{ property: "og:video", content: ogVideo }] : []),
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Fonts are served from this site (public/fonts) and preloaded, so text
      // is drawn in the right face from the first paint instead of reflowing
      // when a third-party font arrives late.
      { rel: "preload", href: "/fonts/figtree-latin.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" as const },
      { rel: "preload", href: "/fonts/barlow-condensed-700.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" as const },
      { rel: "apple-touch-icon", href: "/app-icon.png" },
      // Google needs a square icon that is a multiple of 48px, so the ICO
      // (16/32/48) and the 192px PNG come first; the SVG is for modern browsers.
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/favicon-192.png" },
      { rel: "icon", type: "image/svg+xml", href: favicon ?? "/favicon.svg" },
    ],
  };
}

function Centered({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ground px-6 text-center">
      <Mark className="h-16 w-[82px] text-ink" />
      <p className="mt-6 text-[15px] font-semibold text-signal">{eyebrow}</p>
      <h1 className="ahe-display mt-2 text-[40px] leading-none text-ink md:text-[56px]">{title}</h1>
      <p className="mt-3 max-w-[46ch] text-[17px] leading-relaxed text-muted">{body}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{children}</div>
    </div>
  );
}

function NotFoundComponent() {
  return (
    <Centered
      eyebrow="404"
      title="That page is not on the shelf"
      body="The link may be old, or the product moved to another category. The catalog is one click away."
    >
      <Link
        to="/shop"
        className="inline-flex h-12 items-center rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-surface transition-transform active:scale-[0.98]"
      >
        Browse the catalog
      </Link>
      <Link to="/" className="inline-flex h-12 items-center rounded-[10px] px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] hover:bg-surface">
        Go home
      </Link>
    </Centered>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportHiggsfieldError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <Centered
      eyebrow="Error"
      title="This page did not load"
      body="Something went wrong on our end. Try again, or call the shop and we will sort it out on the phone."
    >
      <button
        onClick={() => {
          router.invalidate();
          reset();
        }}
        className="inline-flex h-12 items-center rounded-[10px] bg-ink px-6 text-[15px] font-semibold text-surface transition-transform active:scale-[0.98]"
      >
        Try again
      </button>
      <a href="/" className="inline-flex h-12 items-center rounded-[10px] px-6 text-[15px] font-semibold text-ink shadow-[inset_0_0_0_1.5px_#9db6cf] hover:bg-surface">
        Go home
      </a>
    </Centered>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => buildHead(appMeta),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="ahe" style={{ colorScheme: "light" }}>
      <head>
        <HeadContent />
        {/* Who the shop is and how to search it, on every page (lib/structured-data.ts). */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SITE_JSON_LD }} />
      </head>
      <body className="bg-ground text-ink antialiased">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (!__HF_DESIGN_INSPECTOR__) return;
    void import("../module/design-inspector/runtime")
      .then(({ installHiggsfieldDesignInspector }) => {
        installHiggsfieldDesignInspector();
      })
      .catch((error) => {
        reportHiggsfieldError(error instanceof Error ? error : new Error("Failed to load design inspector"), {
          boundary: "higgsfield_design_inspector_import",
        });
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
