import { expect, test } from '@playwright/test';
import type { Page, Route } from '@playwright/test';

type RankingTargetType = 'CAST' | 'STORE';

type RankingRequest = {
  targetType: RankingTargetType;
  city: string;
  category?: string | null;
  limit: number;
};

type RankingItem = {
  rank: number;
  targetType: RankingTargetType;
  targetId: string;
  name: string;
  slug: string;
  image: string | null;
  area: string;
  city: string;
  cityCode: string;
  category: string;
  sponsored: boolean;
  pinRank: number | null;
  manualScore: number;
  href: string;
  phone?: string | null;
};

const castItems: RankingItem[] = [
  {
    rank: 1,
    targetType: 'CAST',
    targetId: 'cast-1',
    name: 'Mika',
    slug: 'mika',
    image: null,
    area: 'Hoan Kiem',
    city: 'Ha Noi',
    cityCode: 'hn',
    category: 'bar',
    sponsored: true,
    pinRank: 1,
    manualScore: 98,
    href: '/casts/mika',
  },
  {
    rank: 2,
    targetType: 'CAST',
    targetId: 'cast-2',
    name: 'Yuna',
    slug: 'yuna',
    image: null,
    area: 'Ba Dinh',
    city: 'Ha Noi',
    cityCode: 'hn',
    category: 'club',
    sponsored: false,
    pinRank: 2,
    manualScore: 91,
    href: '/casts/yuna',
  },
  {
    rank: 3,
    targetType: 'CAST',
    targetId: 'cast-3',
    name: 'Hana',
    slug: 'hana',
    image: null,
    area: 'Tay Ho',
    city: 'Ha Noi',
    cityCode: 'hn',
    category: 'karaoke',
    sponsored: false,
    pinRank: 3,
    manualScore: 88,
    href: '/casts/hana',
  },
];

const storeItems: RankingItem[] = [
  {
    rank: 1,
    targetType: 'STORE',
    targetId: 'store-1',
    name: 'Midnight Bar',
    slug: 'midnight-bar',
    image: null,
    area: 'District 1',
    city: 'TP.HCM',
    cityCode: 'hcm',
    category: 'bar',
    sponsored: true,
    pinRank: 1,
    manualScore: 96,
    href: '/stores/midnight-bar',
    phone: '0900000001',
  },
  {
    rank: 2,
    targetType: 'STORE',
    targetId: 'store-2',
    name: 'Moon Lounge',
    slug: 'moon-lounge',
    image: null,
    area: 'Hoan Kiem',
    city: 'Ha Noi',
    cityCode: 'hn',
    category: 'lounge',
    sponsored: false,
    pinRank: 2,
    manualScore: 89,
    href: '/stores/moon-lounge',
    phone: '0900000002',
  },
];

function resolveRankingItems(request: RankingRequest) {
  const source = request.targetType === 'STORE' ? storeItems : castItems;
  const filtered = source.filter((item) => {
    const cityMatches = request.city === 'all' || item.cityCode === request.city;
    const categoryMatches = !request.category || item.category === request.category;

    return cityMatches && categoryMatches;
  });

  return filtered.slice(0, request.limit).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

async function mockRankingsApi(page: Page, capturedRequests: RankingRequest[]) {
  await page.route(/\/rankings(?:\?|$)/, async (route: Route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, OPTIONS',
          'access-control-allow-headers': 'content-type, authorization',
        },
      });
      return;
    }

    const url = new URL(route.request().url());
    const request: RankingRequest = {
      targetType: (url.searchParams.get('targetType') as RankingTargetType | null) ?? 'CAST',
      city: url.searchParams.get('city') ?? 'all',
      category: url.searchParams.get('category'),
      limit: Number(url.searchParams.get('limit') ?? 5),
    };

    capturedRequests.push(request);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': '*',
      },
      body: JSON.stringify({
        data: resolveRankingItems(request),
        meta: {
          targetType: request.targetType,
          city: request.city,
          category: request.category,
          limit: request.limit,
          total: resolveRankingItems(request).length,
        },
      }),
    });
  });
}

async function gotoRankingPage(page: Page, capturedRequests: RankingRequest[]) {
  await mockRankingsApi(page, capturedRequests);
  await page.goto('/xep-hang', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('ranking-page')).toBeVisible();
}

async function waitForRankingCard(page: Page, rank: number) {
  await expect(page.getByTestId(`ranking-card-${rank}`)).toBeVisible({ timeout: 15_000 });
}

async function captureRankingClick(page: Page, selector: string) {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout: 15_000 });

  return page.evaluate((linkSelector) => {
    return new Promise<Record<string, unknown>>((resolve, reject) => {
      const link = document.querySelector<HTMLElement>(linkSelector);

      if (!link) {
        reject(new Error(`Ranking action not found: ${linkSelector}`));
        return;
      }

      const timeout = window.setTimeout(() => reject(new Error('Ranking click event was not dispatched.')), 2_000);
      const preventNavigation = (event: MouseEvent) => event.preventDefault();

      window.addEventListener(
        'nightlife:ranking-click',
        (event) => {
          window.clearTimeout(timeout);
          resolve((event as CustomEvent<Record<string, unknown>>).detail);
        },
        { once: true },
      );
      link.addEventListener('click', preventNavigation, { once: true });
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    });
  }, selector);
}

test.describe('ranking page', () => {
  test('fetches public ranking data by tab and filters', async ({ page }) => {
    const capturedRequests: RankingRequest[] = [];
    await gotoRankingPage(page, capturedRequests);

    await expect(page.getByTestId('ranking-card-1')).toContainText('Mika');
    await expect(page.getByTestId('ranking-sponsored-badge').first()).toBeVisible();
    expect(capturedRequests.at(-1)).toMatchObject({ targetType: 'CAST', city: 'hn', limit: 5 });

    await page.getByTestId('ranking-kind-quan').click();
    await expect(page.getByTestId('ranking-card-1')).toContainText('Moon Lounge');
    await expect(page.getByRole('link', { name: /Xem chi/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /G/i }).first()).toBeVisible();
    expect(capturedRequests.at(-1)).toMatchObject({ targetType: 'STORE', city: 'hn', limit: 5 });

    await page.getByTestId('ranking-city-select').locator('.vyr-ranking-select-trigger').click();
    await page.getByTestId('ranking-city-select').locator('[role="option"]').nth(1).click();
    await expect(page.getByTestId('ranking-card-1')).toContainText('Midnight Bar');
    expect(capturedRequests.at(-1)).toMatchObject({ targetType: 'STORE', city: 'hcm' });

    await page.getByTestId('ranking-city-select').locator('.vyr-ranking-select-trigger').click();
    await page.getByTestId('ranking-city-select').locator('[role="option"]').nth(2).click();
    await expect(page.getByTestId('ranking-card-1')).toContainText('Midnight Bar');
    expect(capturedRequests.at(-1)).toMatchObject({ targetType: 'STORE', city: 'all' });

    await page.getByTestId('ranking-category-select').locator('.vyr-ranking-select-trigger').click();
    await page.getByTestId('ranking-category-select').locator('[role="option"]').nth(2).click();
    await expect(page.getByTestId('ranking-empty-state')).toBeVisible();
    expect(capturedRequests.at(-1)).toMatchObject({ targetType: 'STORE', city: 'all', category: 'club' });
  });

  test('tracks profile, booking, store, and call clicks', async ({ page }) => {
    const capturedRequests: RankingRequest[] = [];
    await gotoRankingPage(page, capturedRequests);
    await waitForRankingCard(page, 1);

    const profilePayload = await captureRankingClick(page, '[data-testid="ranking-card-1"] .vyr-rank-action.is-primary');
    expect(profilePayload).toMatchObject({ event: 'ranking_click', action: 'profile', rankingSlot: 1 });

    const bookingPayload = await captureRankingClick(page, '[data-testid="ranking-card-1"] .vyr-rank-action:not(.is-primary)');
    expect(bookingPayload).toMatchObject({ event: 'ranking_click', action: 'booking', rankingSlot: 1 });

    await page.getByTestId('ranking-kind-quan').click();
    await expect(page.getByTestId('ranking-card-1')).toContainText('Moon Lounge');
    const storePayload = await captureRankingClick(page, '[data-testid="ranking-card-1"] .vyr-rank-action.is-primary');
    expect(storePayload).toMatchObject({ event: 'ranking_click', action: 'store', rankingSlot: 1 });

    const callPayload = await captureRankingClick(page, '[data-testid="ranking-card-1"] .vyr-rank-action:not(.is-primary)');
    expect(callPayload).toMatchObject({ event: 'ranking_click', action: 'call', rankingSlot: 1 });
  });

  test('highlights top 1-3 distinctly on mobile', async ({ page }) => {
    const capturedRequests: RankingRequest[] = [];
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoRankingPage(page, capturedRequests);
    await waitForRankingCard(page, 3);

    await expect(page.getByTestId('ranking-card-1')).toHaveClass(/is-podium-rank/);
    await expect(page.getByTestId('ranking-card-1')).toHaveClass(/is-rank-1/);
    await expect(page.getByTestId('ranking-card-2')).toHaveClass(/is-rank-2/);
    await expect(page.getByTestId('ranking-card-3')).toHaveClass(/is-rank-3/);
  });
});
