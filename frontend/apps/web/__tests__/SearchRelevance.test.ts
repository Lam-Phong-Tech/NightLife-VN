import { describe, expect, it } from "vitest";
import { normalizeSearchText, searchRelevanceScore, sortBySearchRelevance } from "../src/lib/search-relevance";

describe("search relevance sorting", () => {
  it("prioritizes names that start with the typed letter", () => {
    const items = [
      { name: "Yuki", store: "A Bar" },
      { name: "Sumi", store: "Opera Spa Hải Phòng" },
      { name: "Aoi", store: "Tokyo Kitchen" },
      { name: "Akari", store: "Jade Lounge" },
    ];

    const sorted = sortBySearchRelevance(items, "a", (item) => ({
      primary: [item.name],
      secondary: [item.store],
    }));

    expect(sorted.map((item) => item.name)).toEqual(["Akari", "Aoi", "Yuki", "Sumi"]);
  });

  it("keeps primary name matches above secondary field matches", () => {
    expect(
      searchRelevanceScore("bar", {
        primary: ["Moonlight Bar"],
        secondary: ["Club"],
      }),
    ).toBeLessThan(
      searchRelevanceScore("bar", {
        primary: ["Yuki"],
        secondary: ["A Bar"],
      }),
    );
  });

  it("normalizes Vietnamese accents for search", () => {
    expect(normalizeSearchText("Đà Nẵng")).toBe("da nang");
    expect(
      sortBySearchRelevance(
        [
          { name: "Tokyo Kitchen", area: "Tây Hồ" },
          { name: "Đông Đô Club", area: "Hoàn Kiếm" },
        ],
        "do",
        (item) => ({ primary: [item.name], secondary: [item.area] }),
      ).map((item) => item.name),
    ).toEqual(["Đông Đô Club", "Tokyo Kitchen"]);
  });
});
