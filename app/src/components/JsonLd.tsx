/** A pre-built JSON-LD string (from lib/structured-data) as a script tag. */
export function JsonLd({ json }: { json: string }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
