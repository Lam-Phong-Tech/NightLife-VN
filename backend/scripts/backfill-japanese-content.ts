import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ContentTranslationService } from '../src/common/content-translation.service';

const APPLY = process.argv.includes('--apply');
const STORE_SLUG = process.argv
  .find((argument) => argument.startsWith('--store='))
  ?.slice('--store='.length);
// The fallback provider is deliberately rate-limited; keep production backfill
// gentle so normal admin saves stay responsive.
const CONCURRENCY = 1;

type TranslationTask = {
  label: string;
  run: () => Promise<boolean>;
};

async function runTasks(tasks: TranslationTask[]) {
  let cursor = 0;
  let translated = 0;
  let failed = 0;

  async function worker() {
    while (cursor < tasks.length) {
      const task = tasks[cursor++];
      try {
        if (await task.run()) {
          translated += 1;
          console.log(`[TRANSLATED] ${task.label}`);
        } else {
          failed += 1;
          console.warn(`[SKIPPED] ${task.label}: provider returned no text`);
        }
      } catch (error) {
        failed += 1;
        console.warn(
          `[FAILED] ${task.label}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, tasks.length) }, () => worker()),
  );
  return { translated, failed };
}

async function main() {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) throw new Error('DATABASE_URL is required');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
  const translator = new ContentTranslationService();

  try {
    const [stores, casts] = await Promise.all([
      prisma.store.findMany({
        where: {
          deletedAt: null,
          ...(STORE_SLUG ? { slug: STORE_SLUG } : {}),
          OR: [
            { streetName: { not: null }, streetNameJa: null },
            { description: { not: null }, descriptionJa: null },
          ],
        },
        select: {
          id: true,
          slug: true,
          streetName: true,
          streetNameJa: true,
          description: true,
          descriptionJa: true,
        },
      }),
      prisma.cast.findMany({
        where: {
          deletedAt: null,
          publicBio: { not: null },
          publicBioJa: null,
        },
        select: { id: true, slug: true, publicBio: true },
      }),
    ]);

    const taskCount =
      stores.reduce(
        (count, store) =>
          count +
          (store.streetName && !store.streetNameJa ? 1 : 0) +
          (store.description && !store.descriptionJa ? 1 : 0),
        0,
      ) + casts.length;

    console.log(
      `[${APPLY ? 'APPLY' : 'DRY RUN'}] ${taskCount} missing Japanese translations`,
    );
    if (!APPLY) {
      console.log('Run again with --apply to translate and save them.');
      return;
    }

    const tasks: TranslationTask[] = [];
    for (const store of stores) {
      if (store.streetName && !store.streetNameJa) {
        tasks.push({
          label: `store/${store.slug}/street-name`,
          run: async () => {
            const translated =
              await translator.translateStreetNameToJapanese(store.streetName);
            if (!translated) return false;
            await prisma.store.update({
              where: { id: store.id },
              data: { streetNameJa: translated },
            });
            return true;
          },
        });
      }
      if (store.description && !store.descriptionJa) {
        tasks.push({
          label: `store/${store.slug}/description`,
          run: async () => {
            const translated =
              await translator.translateVietnameseToJapanese(store.description);
            if (!translated) return false;
            await prisma.store.update({
              where: { id: store.id },
              data: { descriptionJa: translated },
            });
            return true;
          },
        });
      }
    }
    for (const cast of casts) {
      tasks.push({
        label: `cast/${cast.slug}/public-bio`,
        run: async () => {
          const translated = await translator.translateVietnameseToJapanese(
            cast.publicBio,
          );
          if (!translated) return false;
          await prisma.cast.update({
            where: { id: cast.id },
            data: { publicBioJa: translated },
          });
          return true;
        },
      });
    }

    const result = await runTasks(tasks);
    console.log(
      `[DONE] translated=${result.translated} failed=${result.failed} total=${tasks.length}`,
    );
    if (result.failed > 0) process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
