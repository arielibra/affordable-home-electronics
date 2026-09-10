/**
 * Security headers applied to every Worker response. Import in app/src/server.ts
 * and wrap the final response: `return applySecurityHeaders(response)`.
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  // Framing: the Supercomputer Design-mode inspector + preview render this app
  // cross-origin inside an iframe. The Higgsfield hosting platform injects the
  // canonical `frame-ancestors` allowlist on every app response, so this app
  // MUST NOT set its own — browsers intersect multiple CSP headers, so a second
  // (stricter) list here can only ever subtract from the platform's allowlist
  // and silently block the embed. We also deliberately do NOT set
  // `X-Frame-Options` (no cross-origin allowlist; SAMEORIGIN/DENY would blank
  // the preview) and leave framing entirely to the platform.
  headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
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
