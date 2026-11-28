import { Link, createFileRoute } from "@tanstack/react-router";

import { SiteShell } from "../components/site/chrome";
import { FaqList, faqJsonLd, type Faq } from "../components/site/faq";
import { Eyebrow, Shell } from "../components/site/section";
import { JsonLd } from "../components/JsonLd";
import { ORIGIN, SITE } from "../lib/site";
import { pageJsonLd } from "../lib/structured-data";

/**
 * Plain-language guide aimed at the questions people ask AI assistants about
 * installation. No prices on purpose (owner's decision, 2026-11-28). Installs
 * are arranged through contractors the shop works with; never say "we install".
 */
const PATH = "/installation-guide";
const TITLE = "Security Camera Installation Guide: What's Included | AHE";
const DESCRIPTION =
  "What a professional security camera or access control installation includes, what drives the cost, how long it takes, how many cameras a building needs, and when installing it yourself makes sense.";

const INCLUDED = [
  { t: "Site survey", b: "Walking the property to decide where each camera goes, what it must see, and where the recorder will live." },
  { t: "System design", b: "Camera count and type, lens choice, recorder channels and a hard drive sized for how many days you want kept." },
  { t: "Cable runs", b: "Network cable (Cat6 for PoE cameras) or coax, pulled through walls, ceilings or conduit, with clean terminations." },
  { t: "Mounting and aiming", b: "Cameras mounted on the right boxes or brackets, weather-sealed outside, and aimed and focused for the job." },
  { t: "Recorder setup", b: "Recording schedules, motion zones, the hard drive, date and time, and a battery backup if one is fitted." },
  { t: "Phone app and handover", b: "Remote viewing set up on your phone, and a walk-through of how to find and save a clip." },
];

const COST = [
  { t: "Number of cameras", b: "Each camera is another cable run, mount and aim. It is the biggest single factor." },
  { t: "The building", b: "Brick, concrete and plaster walls take longer than drywall or a drop ceiling. Multiple floors add cable and time." },
  { t: "Cable distance", b: "Long runs to a garage, a back yard or another floor need more cable and labour. Very long runs may need extra equipment." },
  { t: "Height and access", b: "Cameras above a normal ladder's reach, over a storefront or in a warehouse may need a lift." },
  { t: "Existing cable", b: "If an old system's coax is in good shape, 4-in-1 cameras can reuse it and save much of the labour." },
  { t: "Storage and features", b: "More recording days, 4K cameras, plate reading or PTZ cameras change the equipment, not just the labour." },
  { t: "When the work happens", b: "A store that can only be worked on after closing, or a building that needs landlord or board approval, adds time." },
];

const TIMES = [
  { t: "A house or small shop, 4 cameras", b: "Usually one day, when the cable paths are straightforward." },
  { t: "A store or office, 8 cameras", b: "Often one to two days." },
  { t: "A warehouse or multi-floor building, 16+ cameras", b: "Several days, depending on height, distance and when the space can be worked in." },
];

const APARTMENT = [
  "Every entrance: front door, back door, side gate",
  "The lobby and the mailboxes",
  "Each stairwell, on each floor",
  "The hallway on each floor",
  "The back yard, alley or trash area",
  "The basement, boiler room and laundry room",
  "The parking area or driveway, if there is one",
];

const DOOR = [
  { t: "Controller", b: "The box that decides who gets in and keeps the log." },
  { t: "Reader or keypad", b: "Card or fob reader, PIN keypad, fingerprint or face reader." },
  { t: "Electric lock", b: "An electric strike or a magnetic lock, matched to the door and its frame." },
  { t: "Request-to-exit", b: "A button or motion sensor so people can always get out." },
  { t: "Door sensor", b: "Tells the system when a door is forced or held open." },
  { t: "Power supply with battery", b: "Keeps the system and the lock working through a power cut." },
  { t: "Software or app", b: "To add and remove users and see who came in when." },
];

const FAQ: Faq[] = [
  {
    q: "What is included in a professional CCTV camera installation?",
    a: "A site survey, a system design, cable runs, mounting and aiming the cameras, setting up the recorder and hard drive, remote viewing on your phone, and a handover showing you how to find and save recordings.",
  },
  {
    q: "What affects the cost of security camera installation in New York City?",
    a: "The number of cameras, the building's construction (brick and plaster take longer), cable distances, ceiling and mounting height, whether existing cable can be reused, the recording features you want, and whether work has to happen after hours or with landlord or board approval. A written, itemised quote after a survey is the only reliable number.",
  },
  {
    q: "How long does it take to install cameras in a store or warehouse?",
    a: "A small store with about four cameras is usually done in a day. Eight cameras is often one to two days. A warehouse or multi-floor building with 16 or more cameras can take several days, depending on height, cable distances and when the space can be worked in.",
  },
  {
    q: "Should I hire an installer or install a security camera system myself?",
    a: "Doing it yourself is realistic for a single-storey home with a few cameras and easy cable paths, or for Wi-Fi cameras near outlets. Hire an installer for multiple floors, brick or plaster walls, long cable runs, high mounting points, commercial buildings, and any access control that involves door locks and fire-code exits.",
  },
  {
    q: "How many security cameras does a two-story apartment building need?",
    a: "Usually 8 to 16. Cover every entrance, the lobby and mailboxes, each stairwell and hallway on each floor, the back yard or trash area, and the basement, boiler and laundry rooms. More floors, more entrances or a parking area add cameras.",
  },
  {
    q: "What equipment is needed for a building access control system?",
    a: "For each door: a reader or keypad, an electric strike or magnetic lock, a request-to-exit button or sensor, and a door position sensor. Plus a controller, a power supply with battery backup, and software or an app to manage users.",
  },
  {
    q: "Should a business use keycards, keypads, or biometric access control?",
    a: "Keycards and fobs are easy to issue and cancel, and suit most offices and buildings. Keypads are cheapest but codes get shared. Fingerprint and face readers cannot be lent or lost, which suits stockrooms, server rooms and time-and-attendance. Many businesses combine card or fob at the front door with biometric on the sensitive rooms.",
  },
  {
    q: "Do you install outside New York City?",
    a: `Installation is arranged in the New York City area through installers we work with. Everywhere else in the USA, we ship the equipment for you or your own installer to fit, and we can help plan the system by phone or email.`,
  },
];

export const Route = createFileRoute("/installation-guide")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${ORIGIN}${PATH}` }],
  }),
  component: InstallationGuide,
});

function Cards({ items, cols = "lg:grid-cols-3" }: { items: { t: string; b: string }[]; cols?: string }) {
  return (
    <div className={`mt-6 grid gap-3 sm:grid-cols-2 ${cols}`}>
      {items.map((s) => (
        <div key={s.t} className="rounded-[14px] border border-[#dbe7f3] bg-surface p-5">
          <h3 className="text-[17px] font-bold leading-snug text-ink">{s.t}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">{s.b}</p>
        </div>
      ))}
    </div>
  );
}

function InstallationGuide() {
  const json = pageJsonLd({
    path: PATH,
    name: "Security camera installation guide",
    description: DESCRIPTION,
    crumbs: [
      { name: "Installation", path: "/installation" },
      { name: "Installation guide", path: PATH },
    ],
    extra: [faqJsonLd(PATH, FAQ)],
  });

  return (
    <SiteShell>
      <JsonLd json={json} />

      <section className="bg-ground">
        <Shell className="py-10 lg:py-14">
          <Eyebrow>Guide · camera and access control installation</Eyebrow>
          <h1 className="mt-2 max-w-[22ch] text-[38px] text-ink md:text-[54px]">
            Security camera installation: what's included and what drives the cost
          </h1>
          <p className="mt-4 max-w-[64ch] text-[17px] leading-relaxed text-muted">
            What a professional install covers, what makes one job bigger than another, how long it takes, and when
            doing it yourself is fine. We have sold security systems since {SITE.since}, ship them anywhere in the
            USA, and arrange installation across New York City through installers we work with.
          </p>
          <nav aria-label="On this page" className="mt-6 flex flex-wrap gap-2 text-[14px]">
            {[
              ["#included", "What's included"],
              ["#cost", "What drives the cost"],
              ["#time", "How long it takes"],
              ["#diy", "Hire or DIY?"],
              ["#apartment", "How many cameras"],
              ["#access", "Access control"],
              ["#faq", "Questions"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full bg-surface px-4 py-2 font-medium text-ink shadow-[inset_0_0_0_1px_#dbe7f3] hover:shadow-[inset_0_0_0_1.5px_#9db6cf]"
              >
                {label}
              </a>
            ))}
          </nav>
        </Shell>
      </section>

      <section id="included" className="scroll-mt-24 py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">What a professional installation includes</h2>
          <Cards items={INCLUDED} />
        </Shell>
      </section>

      <section id="cost" className="scroll-mt-24 bg-surface py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">What drives the cost</h2>
          <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">
            Two jobs with the same number of cameras can be priced very differently. These are the things that make
            the difference. The only reliable number is a written, itemised quote after someone has seen the building.
          </p>
          <div className="[&_div.rounded-\[14px\]]:bg-ground">
            <Cards items={COST} cols="lg:grid-cols-4" />
          </div>
        </Shell>
      </section>

      <section id="time" className="scroll-mt-24 py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">How long an install takes</h2>
          <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">
            Typical times once the equipment is on site. Old buildings, high ceilings and after-hours work stretch them.
          </p>
          <Cards items={TIMES} />
        </Shell>
      </section>

      <section id="diy" className="scroll-mt-24 bg-surface py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">Hire an installer, or do it yourself?</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[14px] border border-[#dbe7f3] bg-ground p-5">
              <h3 className="text-[17px] font-bold text-ink">Doing it yourself works when</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-muted">
                <li>It is a single-storey home or a small shop</li>
                <li>You need four cameras or fewer</li>
                <li>Cable can run through an attic, basement or drop ceiling</li>
                <li>You are reusing coax from an old system</li>
                <li>You are fitting Wi-Fi cameras near power outlets</li>
              </ul>
            </div>
            <div className="rounded-[14px] border border-[#dbe7f3] bg-ground p-5">
              <h3 className="text-[17px] font-bold text-ink">Hire an installer when</h3>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-muted">
                <li>The building has several floors, or brick and plaster walls</li>
                <li>Cameras go high on a storefront, a warehouse or a roofline</li>
                <li>Cable runs are long or cross between buildings</li>
                <li>It is a commercial or multi-family building with rules to follow</li>
                <li>It includes access control on doors that are fire exits</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 max-w-[64ch] text-[15px] leading-relaxed text-muted">
            Outside New York City, everything we sell ships ready for you or a local installer to fit.
          </p>
        </Shell>
      </section>

      <section id="apartment" className="scroll-mt-24 py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">How many cameras does a building need?</h2>
          <p className="mt-3 max-w-[64ch] text-[16px] leading-relaxed text-muted">
            A two-storey apartment building usually needs 8 to 16 cameras. Start from this list and add one for every
            extra entrance or floor:
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {APARTMENT.map((a) => (
              <li key={a} className="rounded-[10px] border border-[#dbe7f3] bg-surface px-4 py-3 text-[15px] text-ink">
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[15px] text-muted">
            Recorders come in 4, 8, 16 and 32 channels. Pick one with a few channels spare.{" "}
            <Link to="/shop/$category" params={{ category: "recorders" }} className="font-semibold text-ink underline underline-offset-4">
              See recorders
            </Link>
          </p>
        </Shell>
      </section>

      <section id="access" className="scroll-mt-24 bg-surface py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">Access control: what each door needs</h2>
          <div className="[&_div.rounded-\[14px\]]:bg-ground">
            <Cards items={DOOR} cols="lg:grid-cols-4" />
          </div>
          <p className="mt-5 max-w-[64ch] text-[16px] leading-relaxed text-muted">
            <b className="text-ink">Keycards and fobs</b> are easy to issue and cancel. <b className="text-ink">Keypads</b>{" "}
            are the cheapest, but codes get shared. <b className="text-ink">Fingerprint and face readers</b> cannot be lent
            or lost, which suits stockrooms and time clocks. Many businesses use a card at the front door and biometric
            on the sensitive rooms.
          </p>
        </Shell>
      </section>

      <section id="faq" className="scroll-mt-24 py-12 md:py-16">
        <Shell>
          <h2 className="text-[30px] text-ink md:text-[38px]">Questions people ask about installation</h2>
          <FaqList faq={FAQ} />
        </Shell>
      </section>

      <section className="bg-surface py-12 md:py-16">
        <Shell className="flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="max-w-[24ch] text-[28px] text-ink md:text-[34px]">In New York City?</h2>
            <p className="mt-2 max-w-[56ch] text-[16px] leading-relaxed text-muted">
              We arrange installation across the five boroughs through installers we work with, with a written quote
              before any work starts.
            </p>
          </div>
          <Link
            to="/installation"
            className="inline-flex h-12 items-center rounded-[10px] bg-ink px-7 text-[15px] font-semibold text-white hover:bg-ink-soft"
          >
            Ask for an install quote
          </Link>
        </Shell>
      </section>
    </SiteShell>
  );
}
