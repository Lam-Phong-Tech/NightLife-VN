import { PrismaClient } from '@prisma/client';
import { LEGAL_PAGE_DEFINITIONS } from '../../src/legal-pages/legal-pages.constants';

export async function seedLegalPagesOnly(
  prisma: PrismaClient,
  now = new Date(),
): Promise<void> {
  for (const definition of LEGAL_PAGE_DEFINITIONS) {
    await prisma.legalPage.upsert({
      where: { key: definition.key },
      update: {
        slug: definition.slug,
      },
      create: {
        key: definition.key,
        slug: definition.slug,
        title: definition.title,
        excerpt: definition.excerpt,
        sections: definition.sections,
        noindex: true,
        publishedAt: now,
      },
    });
  }
}

export async function seedLegalPages(prisma: PrismaClient): Promise<void> {
  await seedLegalPagesOnly(prisma);

  // Legacy POLICY rows are retained for audit/history but cannot be surfaced
  // through the new legal-pages API or the generic CMS mutation endpoints.
  await prisma.content.updateMany({
    where: { type: 'POLICY' },
    data: { status: 'ARCHIVED', deletedAt: new Date() },
  });
}
