import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DataSkeleton, InlineLoading, TableLoadingRows } from "../DataLoading";

describe("DataLoading", () => {
  it("renders accessible card skeletons without visible technical copy", () => {
    const { container } = render(
      <DataSkeleton
        variant="cards"
        count={3}
        columns={3}
        ariaLabel="Đang tải nội dung trang chủ"
      />,
    );

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Đang tải nội dung trang chủ",
    );
    expect(container.querySelectorAll(".nl-data-skeleton-item")).toHaveLength(3);
    expect(screen.queryByText(/API|CMS/i)).not.toBeInTheDocument();
  });

  it("renders valid table loading rows with one announced status", () => {
    const { container } = render(
      <table>
        <tbody>
          <TableLoadingRows columns={6} rows={4} ariaLabel="Đang tải bảng dữ liệu" />
        </tbody>
      </table>,
    );

    expect(container.querySelectorAll("tr")).toHaveLength(4);
    expect(container.querySelectorAll("td[colspan='6']")).toHaveLength(4);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Đang tải bảng dữ liệu",
    );
  });

  it("supports an inline loading state for buttons and compact fields", () => {
    render(<InlineLoading label="Đang lưu thay đổi" />);

    expect(screen.getByRole("status")).toHaveTextContent("Đang lưu thay đổi");
  });
});
