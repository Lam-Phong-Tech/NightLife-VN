import { breadcrumbJsonLd, jsonLdDocument } from "@/lib/seo/structured-data";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[];
  idPath?: string;
};

export function BreadcrumbJsonLd({ items, idPath }: BreadcrumbJsonLdProps) {
  const structuredData = jsonLdDocument(breadcrumbJsonLd(items, idPath));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
