import 'dotenv/config';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

type LinkCandidate = {
  url: string;
  kind: 'image' | 'video' | 'page';
  source: string;
};

type LinkResult = LinkCandidate & {
  ok: boolean;
  detail: string;
};

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? '',
  }),
});

function collectHttpUrls(value: unknown, output = new Set<string>()) {
  if (typeof value === 'string') {
    for (const match of value.matchAll(/https?:\/\/[^\s"'<>]+/g)) {
      output.add(match[0].replace(/[),.;]+$/, ''));
    }
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => collectHttpUrls(entry, output));
    return output;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((entry) => collectHttpUrls(entry, output));
  }

  return output;
}

function youtubeId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.split('/').filter(Boolean)[0] ?? null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const embed = parsed.pathname.match(/\/embed\/([^/?]+)/)?.[1];
      return embed ?? parsed.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchHeaders(url: string) {
  let lastError = 'request failed';
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(20_000),
        headers: {
          'User-Agent': 'Mozilla/5.0 NightLife-VN-Seed-Link-Checker/1.0',
          Range: 'bytes=0-1023',
        },
      });
      await response.body?.cancel();
      return response;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(lastError);
}

async function checkExternal(candidate: LinkCandidate): Promise<LinkResult> {
  const videoId = youtubeId(candidate.url);
  if (videoId) {
    const oembed =
      'https://www.youtube.com/oembed?format=json&url=' +
      encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`);
    try {
      const response = await fetchHeaders(oembed);
      return {
        ...candidate,
        ok: response.ok,
        detail: response.ok
          ? `YouTube oEmbed ${response.status}`
          : `YouTube unavailable (${response.status})`,
      };
    } catch (error) {
      return {
        ...candidate,
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }
  }

  try {
    const response = await fetchHeaders(candidate.url);
    const contentType = response.headers.get('content-type') ?? 'unknown';
    const typeMatches =
      candidate.kind !== 'image' || contentType.startsWith('image/');
    return {
      ...candidate,
      ok: response.ok && typeMatches,
      detail: `${response.status} ${contentType}`,
    };
  } catch (error) {
    return {
      ...candidate,
      ok: false,
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main() {
  const [media, casts, stores, contents] = await Promise.all([
    prisma.media.findMany({
      where: { status: 'READY', deletedAt: null },
      select: {
        id: true,
        storageKey: true,
        originalName: true,
        url: true,
        type: true,
        access: true,
        metadata: true,
      },
    }),
    prisma.cast.findMany({
      where: { deletedAt: null },
      select: { slug: true, youtubeLinks: true },
    }),
    prisma.store.findMany({
      where: { deletedAt: null },
      select: { slug: true, mapUrl: true },
    }),
    prisma.content.findMany({
      where: { deletedAt: null },
      select: { slug: true, body: true, metadata: true },
    }),
  ]);

  const failures: LinkResult[] = [];
  const candidates = new Map<string, LinkCandidate>();
  const uploadDir = join(
    process.cwd(),
    process.env.STORAGE_LOCAL_DIR ?? 'uploads',
  );

  for (const item of media) {
    const parsed = new URL(item.url, 'http://localhost');
    const isLocalStorage =
      parsed.pathname.includes('/storage/public/') ||
      parsed.pathname.includes('/storage/files/');

    if (isLocalStorage) {
      const path = join(uploadDir, item.storageKey);
      const exists = existsSync(path) && statSync(path).size > 0;
      if (!exists) {
        failures.push({
          url: item.url,
          kind: item.type === 'VIDEO' ? 'video' : 'image',
          source: `media:${item.originalName}`,
          ok: false,
          detail: `missing local file ${path}`,
        });
      }
    } else {
      candidates.set(item.url, {
        url: item.url,
        kind:
          item.type === 'IMAGE'
            ? 'image'
            : item.type === 'VIDEO'
              ? 'video'
              : 'page',
        source: `media:${item.originalName}`,
      });
    }

    for (const url of collectHttpUrls(item.metadata)) {
      if (url.includes('nightlife.vn/partner?scanToken=')) continue;
      candidates.set(url, {
        url,
        kind: url.includes('img.youtube.com') ? 'image' : 'page',
        source: `media-metadata:${item.originalName}`,
      });
    }
  }

  for (const cast of casts) {
    for (const url of cast.youtubeLinks) {
      candidates.set(url, {
        url,
        kind: 'video',
        source: `cast:${cast.slug}`,
      });
    }
  }

  for (const store of stores) {
    if (store.mapUrl) {
      candidates.set(store.mapUrl, {
        url: store.mapUrl,
        kind: 'page',
        source: `store-map:${store.slug}`,
      });
    }
  }

  for (const content of contents) {
    const urls = collectHttpUrls([content.body, content.metadata]);
    for (const url of urls) {
      candidates.set(url, {
        url,
        kind:
          /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url) ||
          url.includes('placehold.co')
            ? 'image'
            : 'page',
        source: `content:${content.slug}`,
      });
    }
  }

  const queue = [...candidates.values()];
  const results: LinkResult[] = [];
  const concurrency = 8;
  for (let index = 0; index < queue.length; index += concurrency) {
    results.push(
      ...(await Promise.all(
        queue.slice(index, index + concurrency).map(checkExternal),
      )),
    );
  }
  failures.push(...results.filter((result) => !result.ok));

  console.log(
    `Seed link audit: ${media.length} READY media rows, ${queue.length} unique external URLs`,
  );
  console.log(
    `  ✓ ${results.filter((result) => result.ok).length} external URLs reachable`,
  );
  console.log(
    `  ✓ ${media.filter((item) => new URL(item.url, 'http://localhost').pathname.includes('/storage/')).length - failures.filter((failure) => failure.detail.startsWith('missing local file')).length} local files present`,
  );

  if (failures.length) {
    console.error(`  ✗ ${failures.length} broken seed links/files`);
    failures.forEach((failure) => {
      console.error(
        `    - [${failure.source}] ${failure.url} — ${failure.detail}`,
      );
    });
    process.exitCode = 1;
    return;
  }

  console.log(
    '  ✅ No broken image, video, map, content, or local media links',
  );
}

main()
  .finally(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
