/**
 * Security headers applied to every Worker response. Import in app/src/server.ts
 * and wrap the final response: `return applySecurityHeaders(response)`.
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  // Framing: nothing may embed this site.
  //
  // This was deliberately left open while the app was hosted on Higgsfield,
  // whose design-mode preview rendered it cross-origin in an iframe and
  // injected its own frame-ancestors allowlist; a second, stricter list here
  // could only subtract from that one and blank the preview. The site now runs
  // on its own domain on Cloudflare and nothing legitimately frames it, so the
  // exemption no longer applies and its absence is just a clickjacking hole —
  // an invisible copy of the checkout or the admin login over an attacker's
  // page, catching real clicks.
  //
  // Both headers on purpose: frame-ancestors is the modern rule, X-Frame-Options
  // is what older browsers obey. Neither affects iframes this site loads
  // ITSELF, so PayPal's button (see frame-src below) is unaffected.
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; frame-ancestors 'none'; " +
      // PayPal's button is an iframe served from paypal.com and loaded by a
    // script from paypalobjects.com. Without these three the button renders
    // as an empty box with nothing in the console to explain why.
    "script-src 'self' 'unsafe-inline' https://www.paypal.com https://www.paypalobjects.com https://www.sandbox.paypal.com; " +
      "frame-src https://www.paypal.com https://www.sandbox.paypal.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' data: https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; media-src 'self' https:; " +
      "connect-src 'self' https:; " +
      "base-uri 'self'; form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
  );
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  headers.set('X-XSS-Protection', '0');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
