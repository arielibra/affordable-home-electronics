import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { CallCta, ShopCta } from "../components/site/cta";
import { IconBullet, IconDome, IconRecorder, IconShield } from "../components/site/icons";
import { ProductCard } from "../components/site/product-card";
import { Eyebrow, SectionHead, Shell } from "../components/site/section";
import { getCategoryPage } from "../lib/api/store.functions";
import { ORIGIN, SITE } from "../lib/site";
import { JsonLd } from "../components/JsonLd";
import { STORE_ID, pageJsonLd } from "../lib/structured-data";

export const Route = createFileRoute("/security-cameras")({
  loader: () => getCategoryPage({ data: { slug: "cameras", sort: "featured" } }),
  head: () => ({
    meta: [
      { title: "Security Cameras & CCTV | Affordable Home Electronics" },
      {
        name: "description",
        content:
          "Dome, bullet and turret cameras, recorders and complete systems from an authorized dealer in Rego Park, Queens. Sold nationwide, installed across New York City.",
      },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}/security-cameras` }],
  }),
  component: SecurityCameras,
});

const TYPES = [
  {
    icon: IconDome,
    name: "Dome and turret",
    body: "Flush to a ceiling or a soffit, hard to grab and hard to aim away. The default for shop interiors, lobbies and porches.",
  },
  {
    icon: IconBullet,
    name: "Bullet",
    body: "Obviously pointed at something, which is half the deterrent. Longer range down a driveway, an alley or a loading bay.",
  },
  {
    icon: IconRecorder,
    name: "The recorder decides",
    body: "Channel count, drive size and whether the cameras run on coax or network cable. Get this right and the cameras are the easy part.",
  },
  {
    icon: IconShield,
    name: "Resolution you can use",
    body: "2MP reads a face across a counter. 4K reads a plate across a lot. We tell you which one your building actually needs.",
  },
];

function SecurityCameras() {
  const { products } = Route.useLoaderData();
  return (
    <SiteShell>
      <JsonLd json={pageJsonLd({ type: "CollectionPage", path: "/security-cameras", name: "Security cameras", description: "Security cameras, NVR and DVR recorders and complete systems from authorized brands.", mainEntity: { "@type": "ItemList", numberOfItems: products.length, itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: `${ORIGIN}/p/${p.slug}`, name: p.name })) } })} />
      <section className="border-b border-line bg-ground">
        <Shell className="grid items-center gap-12 py-14 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:py-20">
          <div>
            <Eyebrow>Security and surveillance</Eyebrow>
            <h1 className="mt-5 max-w-[16ch] text-4xl font-semibold leading-[0.98] tracking-tighter text-ink md:text-6xl">
              The camera is easy. The system is the job.
            </h1>
            <p className="mt-6 max-w-[54ch] text-base leading-relaxed text-muted md:text-lg">
              We have been specifying CCTV since {SITE.since}, for row houses, delis, warehouses and buildings with a super
              who needs it simple. Tell us the property and we will tell you what it takes.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ShopCta category="cameras">Shop cameras</ShopCta>
              <CallCta phone={SITE.phone} href={SITE.phoneHref} />
            </div>
          </div>
          <figure className="border border-line bg-surface p-2.5">
            <img
              src="/assets/hero-counter.webp"
              alt="Two white bullet cameras on a wall bracket above a slim network video recorder"
              width={1024}
              height={688}
              className="block w-full object-cover"
            />
          </figure>
        </Shell>
      </section>

      <section className="bg-surface py-16">
        <Shell>
          <h2 className="max-w-[22ch] text-3xl font-semibold leading-[1.04] tracking-tighter text-ink md:text-4xl">
            What actually matters when you pick.
          </h2>
          <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2">
            {TYPES.map((t) => (
              <div key={t.name} className="bg-surface p-7">
                <t.icon className="h-7 w-7 text-ink" />
                <h3 className="mt-5 text-lg font-medium leading-snug text-ink">{t.name}</h3>
                <p className="mt-2 max-w-[50ch] text-sm leading-relaxed text-muted">{t.body}</p>
              </div>
            ))}
          </div>
        </Shell>
      </section>

      <section className="bg-ground py-16">
        <Shell>
          <SectionHead
            title="Cameras on the shelf"
            lead="A slice of what is in stock right now. The recorders, complete systems and access control sit one click away."
            aside={
              <Link
                to="/shop/$category"
                params={{ category: "cameras" }}
                className="border-b border-signal pb-0.5 text-sm text-ink hover:text-signal"
              >
                All cameras
              </Link>
            }
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 8).map((p) => (
              <ProductCard key={p.slug} p={p} />
            ))}
          </div>
        </Shell>
      </section>
    </SiteShell>
  );
}
