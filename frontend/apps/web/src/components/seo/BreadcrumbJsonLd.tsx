import { breadcrumbJsonLd, jsonLdGraph } from "@/lib/seo/structured-data";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type BreadcrumbJsonLdProps = {
  items: BreadcrumbItem[];
  idPath?: string;
};

export function BreadcrumbJsonLd({ items, idPath }: BreadcrumbJsonLdProps) {
  const structuredData = jsonLdGraph([breadcrumbJsonLd(items, idPath)]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
