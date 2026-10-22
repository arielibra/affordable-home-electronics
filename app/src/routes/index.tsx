import { createFileRoute } from "@tanstack/react-router";

import { BrandsWall } from "../components/home/brands-wall";
import { CategoriesRail } from "../components/home/categories-rail";
import { ContactPanel } from "../components/home/contact-panel";
import { Featured } from "../components/home/featured";
import { Hero } from "../components/home/hero";
import { InstallBand } from "../components/home/install-band";
import { Testimonials } from "../components/home/testimonials";
import { WhatWeDo } from "../components/home/what-we-do";
import { WhyBuy } from "../components/home/why-buy";
import { SiteShell } from "../components/site/chrome";
import { getStorefront } from "../lib/api/store.functions";
import { ORIGIN } from "../lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Affordable Home Electronics: Cameras & Access Control" },
      {
        name: "description",
        content:
          "Security cameras, NVR/DVR recorders, access control and smart locks from an authorized dealer in Queens. Shipped nationwide, installed in NYC since 2003.",
      },
      { property: "og:title", content: "Affordable Home Electronics | Security Cameras & Access Control" },
      {
        property: "og:description",
        content: "Authorized dealer in Rego Park, Queens. Shipped across the US, installed across NYC since 2003.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/` }],
  }),
  loader: () => getStorefront(),
  component: Index,
});

function Index() {
  const { categories, counts, featured } = Route.useLoaderData();
  return (
    <SiteShell>
      <Hero />
      <CategoriesRail categories={categories} counts={counts} />
      <Featured products={featured} />
      <WhatWeDo />
      <InstallBand />
      <WhyBuy />
      <BrandsWall />
      <Testimonials />
      <ContactPanel />
    </SiteShell>
  );
}
