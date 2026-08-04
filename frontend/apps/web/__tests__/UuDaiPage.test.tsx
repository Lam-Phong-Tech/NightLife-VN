import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Page from '../src/app/(member)/uu-dai/page';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { listPublicCampaignsMock } = vi.hoisted(() => ({
  listPublicCampaignsMock: vi.fn(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/api/campaigns', () => ({
  campaignsApi: {
    listPublicCampaigns: listPublicCampaignsMock,
  },
  campaignStoreDistrict: vi.fn().mockReturnValue("Tay Ho"),
}));

vi.mock('@/lib/i18n/use-active-language', () => ({
  useActiveLanguage: () => 'vi',
  intlLocaleByLanguage: { vi: 'vi-VN' },
}));

vi.mock('@/components/providers/CurrencyProvider', () => ({
  useMoneyFormatter: () => ({ rates: {} }),
}));

const mockCampaigns = [
  {
    id: "camp-1",
    name: "Summer Chill -10%",
    status: "ACTIVE",
    discountType: "PERCENT",
    discountValue: 10,
    startsAt: null,
    endsAt: new Date(Date.now() + 3600 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    targetStoreId: "store-1",
    targetStore: {
      id: "store-1",
      name: "Kimono Wellness",
      slug: "kimono-wellness",
      category: "MASSAGE_SPA",
      city: "Hanoi",
    },
  },
  {
    id: "camp-2",
    name: "VIP Discount",
    status: "ACTIVE",
    discountType: "PERCENT",
    discountValue: 15,
    startsAt: null,
    endsAt: null,
    createdAt: new Date().toISOString(),
    targetStoreId: "store-2",
    targetStore: {
      id: "store-2",
      name: "Happy Pancake",
      slug: "happy-pancake",
      category: "RESTAURANT",
      city: "Hanoi",
    },
  },
];

describe("UuDai Page (Ưu đãi đêm nay)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPublicCampaignsMock.mockResolvedValue(mockCampaigns);
  });

  it("does NOT render the 'Sắp hết hạn' filter chip button", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Ưu đãi đêm nay")).toBeInTheDocument();
    });

    // Verify 'Tất cả' and 'Theo quán' filter chips exist
    expect(screen.getByRole("button", { name: "Tất cả" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Theo quán" })).toBeInTheDocument();

    // Verify 'Sắp hết hạn' filter chip is NOT present
    expect(screen.queryByRole("button", { name: "Sắp hết hạn" })).toBeNull();
  });

  it("can switch filter between 'Tất cả' and 'Theo quán'", async () => {
    render(<Page />);

    await waitFor(() => {
      expect(screen.getByText("Ưu đãi đêm nay")).toBeInTheDocument();
    });

    const byStoreBtn = screen.getByRole("button", { name: "Theo quán" });
    fireEvent.click(byStoreBtn);

    expect(byStoreBtn).toHaveClass("active");
  });
});
