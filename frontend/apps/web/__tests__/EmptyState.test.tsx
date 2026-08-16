import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "@/components/ui/EmptyState";

describe("EmptyState", () => {
  it("renders a localized action button that can reset the current filters", () => {
    const onCtaClick = vi.fn();

    render(
      <EmptyState
        title="条件に合うキャストがいません"
        description="検索条件を変更してください。"
        ctaLabel="フィルターをクリア"
        onCtaClick={onCtaClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "フィルターをクリア" }));

    expect(onCtaClick).toHaveBeenCalledOnce();
  });
});
