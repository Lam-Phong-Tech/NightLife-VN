import { describe, expect, it } from "vitest";
import { campaignStoreDistrict, type CampaignItem } from "@/lib/api/campaigns";

const store = (
  overrides: Partial<NonNullable<CampaignItem["targetStore"]>> = {},
): NonNullable<CampaignItem["targetStore"]> => ({
  id: "store-1",
  name: "Clever Lounge",
  category: "LOUNGE",
  slug: "clever-lounge",
  city: "Hanoi",
  ...overrides,
});

describe("campaignStoreDistrict", () => {
  it("prefers the district stored directly on the store", () => {
    expect(
      campaignStoreDistrict(
        store({
          district: "Tay Ho",
          area: {
            id: "area-1",
            name: "Ba Dinh",
            city: "Ha Noi",
            district: "Ba Dinh",
          },
        }),
      ),
    ).toBe("Tay Ho");
  });

  it("falls back to area.district when store.district is empty", () => {
    expect(
      campaignStoreDistrict(
        store({
          district: null,
          area: {
            id: "area-1",
            name: "Ba Dinh",
            city: "Ha Noi",
            district: "Ba Dinh",
          },
        }),
      ),
    ).toBe("Ba Dinh");
  });
});
