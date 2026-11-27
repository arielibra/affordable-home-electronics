/**
 * "Complete your system" add-ons on the product page.
 *
 * Picked by rule from the product's category and name, so every camera and
 * recorder gets sensible extras without editing each listing. Each suggestion
 * is an ordinary shop product: the page shows its live price, and products
 * that are hidden, deleted or sold out simply drop out.
 *
 * To change a suggestion, edit the slugs below.
 */

export const UPSELL = {
  monitor: "ens-led-22-h200-security-monitor-display-22-inches",
  cat6: "lan-cable-dss-nca6-1000w-1000-ft-black-cat6-network-cable",
  powerBox: "dss-dss-px-9p9aptc-9-port-power-box-9amp-ptc-output-cctv-distributed-power-suppl",
  hardDrive: "wd85purz",
} as const;

/** Short labels shown in the box, instead of the full catalogue names. */
export const UPSELL_LABEL: Record<string, string> = {
  [UPSELL.monitor]: 'ENS 22" security monitor',
  [UPSELL.cat6]: "Cat6 network cable, 1000 ft",
  [UPSELL.powerBox]: "9-port camera power box",
  [UPSELL.hardDrive]: "WD Purple 8TB surveillance hard drive",
};

const RECORDER = /^(nvr-|dvr-|recorders$|128-channel-nvrs$)/;
const IP_CAMERA = new Set(["security-ip-cameras", "license-plate-camera"]);

export type UpsellPlan = {
  /** Product slugs to offer, in order. */
  slugs: string[];
  /** Show the "Want it installed?" row. */
  install: boolean;
};

export function upsellPlan(p: { slug: string; name: string; category: string; options?: string | null }): UpsellPlan {
  const name = p.name.toLowerCase();
  const out: string[] = [];
  if (RECORDER.test(p.category)) {
    // Recorders that already offer a drive drop-down, or ship with one, skip the drive.
    const hasDriveChoice = !!p.options && p.options.trim() !== "" && p.options.trim() !== "[]";
    const includesDrive = /\b\d+\s?tb\b/.test(name) && !/optional/.test(name) && !/\d+\s?tb each/.test(name);
    if (!hasDriveChoice && !includesDrive) out.push(UPSELL.hardDrive);
    out.push(UPSELL.monitor);
    const isNvr = p.category.startsWith("nvr-") || p.category === "128-channel-nvrs" || /\bnvr\b/.test(name);
    out.push(isNvr ? UPSELL.cat6 : UPSELL.powerBox);
    return { slugs: out.filter((s) => s !== p.slug), install: true };
  }
  if (IP_CAMERA.has(p.category)) return { slugs: [UPSELL.cat6], install: true };
  if (p.category === "cameras") {
    // "cameras" holds both analog (4-in-1, TVI, CVI) and some network cameras.
    const isIp = /\bip\b|\bipc\b|network/.test(name);
    return { slugs: [isIp ? UPSELL.cat6 : UPSELL.powerBox], install: true };
  }
  return { slugs: [], install: false };
}
