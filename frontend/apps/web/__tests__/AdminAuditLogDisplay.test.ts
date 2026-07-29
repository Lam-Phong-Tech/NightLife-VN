import { describe, expect, it } from "vitest";
import {
  getFriendlyAuditDetail,
  getFriendlyAuditDiff,
} from "../src/app/admin/audit-logs/AuditLogFriendlyDetail";
import type { AuditLogRec } from "../src/lib/api/audit-logs";

function rankingLog(
  action: string,
  beforeJson: Record<string, unknown> | null,
  afterJson: Record<string, unknown> | null,
): AuditLogRec {
  return {
    id: "log-id",
    action,
    targetType: "RankingConfig",
    targetId: "ranking-id",
    beforeJson,
    afterJson,
    createdAt: "2026-07-29T15:00:00.000Z",
  };
}

describe("admin audit log friendly display", () => {
  it("describes a store ranking move using its name and positions", () => {
    const detail = getFriendlyAuditDetail(
      rankingLog(
        "ranking.config.update",
        {
          targetType: "STORE",
          targetId: "store-id",
          targetName: "Lighthouse Club",
          pinRank: 4,
        },
        {
          targetType: "STORE",
          targetId: "store-id",
          targetName: "Lighthouse Club",
          pinRank: 2,
        },
      ),
    );

    expect(detail.title).toBe("Thay đổi vị trí xếp hạng");
    expect(detail.summary).toBe("Đã chuyển quán “Lighthouse Club” từ vị trí #4 sang vị trí #2.");
    expect(detail.targetDescription).toBe("Quán: Lighthouse Club");
  });

  it("describes adding a cast member to a pinned ranking position", () => {
    const detail = getFriendlyAuditDetail(
      rankingLog("ranking.config.create", null, {
        targetType: "CAST",
        targetId: "cast-id",
        targetName: "Mika",
        pinRank: 3,
      }),
    );

    expect(detail.summary).toBe("Đã thêm nhân viên “Mika” vào bảng xếp hạng ở vị trí #3.");
  });

  it("hides technical ids and formats ranking values", () => {
    const diffs = getFriendlyAuditDiff(
      { targetId: "store-id", pinRank: 4, scope: "GLOBAL" },
      { targetId: "store-id", pinRank: 2, scope: "CITY" },
    );

    expect(diffs).toEqual([
      expect.objectContaining({
        field: "pinRank",
        label: "Vị trí xếp hạng",
        before: "vị trí #4",
        after: "vị trí #2",
      }),
      expect.objectContaining({
        field: "scope",
        label: "Phạm vi xếp hạng",
        before: "Toàn hệ thống",
        after: "Theo thành phố",
      }),
    ]);
  });

  it("shows a friendly store update summary and field labels", () => {
    const log: AuditLogRec = {
      id: "store-log-id",
      action: "store.update",
      targetType: "Store",
      targetId: "store-id",
      entityDisplayCode: "Lighthouse Club",
      changeSummary: 'Đã cập nhật thông tin quán "Lighthouse Club"',
      beforeJson: { name: "Lighthouse", address: "1 Phố Cũ" },
      afterJson: { name: "Lighthouse Club", address: "2 Phố Mới" },
      createdAt: "2026-07-29T15:00:00.000Z",
    };

    expect(getFriendlyAuditDetail(log)).toEqual(
      expect.objectContaining({
        title: "Cập nhật thông tin quán",
        summary: 'Đã cập nhật thông tin quán "Lighthouse Club"',
        targetDescription: "Quán: Lighthouse Club",
      }),
    );
    expect(getFriendlyAuditDiff(log.beforeJson, log.afterJson)).toEqual([
      expect.objectContaining({ field: "name", label: "Tên" }),
      expect.objectContaining({ field: "address", label: "Địa chỉ" }),
    ]);
  });
});
