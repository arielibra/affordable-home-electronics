import type { SVGProps } from "react";

/** One stroke language for the whole site: 2px, square caps, sharp corners. */
function Glyph({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const IconDome = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M3 14a9 9 0 0 1 18 0" />
    <path d="M2 14h20" />
    <path d="M12 14v3" />
    <path d="M9 20h6" />
  </Glyph>
);
export const IconBullet = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M4 7h13v7H4z" />
    <path d="M17 8.5h3v4h-3" />
    <path d="M9 14v3" />
    <path d="M5 20h8" />
  </Glyph>
);
export const IconRecorder = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M3 8h18v8H3z" />
    <path d="M6 12h6" />
    <path d="M17 12h1" />
    <path d="M6 19h12" />
  </Glyph>
);
export const IconShield = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </Glyph>
);
export const IconFinger = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M5 11a7 7 0 0 1 14 0v2" />
    <path d="M8.5 11a3.5 3.5 0 0 1 7 0v4" />
    <path d="M12 11v8" />
    <path d="M19 16v2" />
  </Glyph>
);
export const IconDoorbell = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M7 3h10v18H7z" />
    <path d="M12 8v3" />
    <path d="M10 15h4" />
  </Glyph>
);
export const IconCable = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M5 5v6a7 7 0 0 0 14 0V8" />
    <path d="M3 5h4" />
    <path d="M17 5h4" />
    <path d="M17 8h4" />
  </Glyph>
);
export const IconMonitor = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M3 4h18v12H3z" />
    <path d="M12 16v4" />
    <path d="M8 20h8" />
  </Glyph>
);
export const IconLock = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M5 11h14v10H5z" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </Glyph>
);
export const IconPin = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
    <path d="M10 10h4v4h-4z" />
  </Glyph>
);
export const IconPhone = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4h-3C10.8 18 6 13.2 6 6z" />
  </Glyph>
);
export const IconMail = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M3 5h18v14H3z" />
    <path d="M3 6l9 7 9-7" />
  </Glyph>
);
export const IconCart = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M3 4h3l2.5 11h10L21 7H7" />
    <path d="M9 20h.01M18 20h.01" />
  </Glyph>
);
export const IconArrow = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M4 12h15" />
    <path d="M13 6l6 6-6 6" />
  </Glyph>
);
export const IconSearch = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <circle cx="11" cy="11" r="6" />
    <path d="M15.5 15.5L21 21" />
  </Glyph>
);
export const IconTruck = (p: SVGProps<SVGSVGElement>) => (
  <Glyph {...p}>
    <path d="M2 6h12v10H2z" />
    <path d="M14 9h4l3 3v4h-7" />
    <path d="M6 19h.01M17 19h.01" />
  </Glyph>
);
