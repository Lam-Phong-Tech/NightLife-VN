"use client";

import React, { useState } from "react";
import dayjs from "dayjs";
import type { AuditLogRec } from "@/lib/api/audit-logs";

const colors = {
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  gold: "#d4b26a",
  green: "#4ade80",
  red: "#f87171",
};

const friendlyActionNames: Record<string, string> = {
  "ranking.config.create": "Thêm vào bảng xếp hạng",
  "ranking.config.update": "Cập nhật xếp hạng",
  "ranking.config.delete": "Gỡ khỏi bảng xếp hạng",
  "store.create": "Thêm quán",
  "store.update": "Cập nhật thông tin quán",
  "store.partner.link": "Liên kết tài khoản đối tác",
  "store.partner.unlink": "Gỡ tài khoản đối tác",
  "store.soft_delete": "Xóa quán",
  "store.hard_delete": "Xóa vĩnh viễn quán",
  "store.restore": "Khôi phục quán",
  "cast.create": "Thêm nhân viên",
  "cast.update": "Cập nhật nhân viên",
  "cast.soft_delete": "Xóa nhân viên",
  "cast.hard_delete": "Xóa vĩnh viễn nhân viên",
  "coupon.create": "Tạo mã ưu đãi",
  "coupon.update": "Cập nhật mã ưu đãi",
  "coupon.delete": "Xóa mã ưu đãi",
  "content.create": "Tạo nội dung",
  "content.update": "Cập nhật nội dung",
  "content.delete": "Xóa nội dung",
  "appearance.update": "Cập nhật giao diện",
  "system_config.update": "Cập nhật cấu hình hệ thống",
  "user.create": "Tạo tài khoản",
  "user.update": "Cập nhật tài khoản",
  "user.password.update": "Đổi mật khẩu tài khoản",
  "user.soft_delete": "Vô hiệu hóa tài khoản",
  "user.restore": "Khôi phục tài khoản",
  "user.hard_delete": "Xóa vĩnh viễn tài khoản",
  PROFILE_VIEW_RECORDED: "Ghi nhận lượt xem hồ sơ",
  BOOKING_RESCHEDULE_REJECTED: "Từ chối đổi lịch hẹn",
  BOOKING_RESCHEDULE_APPROVED: "Duyệt đổi lịch hẹn",
  BOOKING_POLICY_UPDATED: "Cập nhật chính sách đặt phòng",
  BOOKING_CANCELLED: "Hủy lịch đặt phòng/bàn",
  BOOKING_QR_SCANNED: "Quét QR lịch hẹn",
  BOOKING_STATUS_CHANGED: "Đổi trạng thái lịch hẹn",
  COUPON_ISSUE_SCANNED: "Quét mã QR ưu đãi",
  COUPON_ISSUE_USED: "Sử dụng mã ưu đãi",
  COUPON_QR_TOKEN_REVOKED: "Thu hồi mã QR ưu đãi",
  COUPON_QR_TOKEN_ROTATED: "Xoay vòng mã QR ưu đãi",
  "bill.review.pending_pm_ba": "Chờ duyệt chiết khấu đặc biệt (PM/BA)",
  "bill.review.approve": "Duyệt hóa đơn",
  "bill.review.reject": "Từ chối duyệt hóa đơn",
  "bill.review.void": "Hủy/vô hiệu hóa hóa đơn",
  "bill.reversal": "Yêu cầu hoàn trả hóa đơn",
  "bill.fraud.auto_reversal": "Tự động hoàn trả hóa đơn nghi vấn gian lận",
  "campaign.create": "Tạo chương trình ưu đãi",
  "campaign.update": "Cập nhật chương trình ưu đãi",
  "campaign.delete": "Xóa chương trình ưu đãi",
  "category.create": "Tạo danh mục",
  "category.update": "Cập nhật danh mục",
  "category.delete": "Xóa danh mục",
  "tour.create": "Tạo tour",
  "tour.update": "Cập nhật tour",
  "tour.delete": "Xóa tour",
};

type AuditSnapshot = Record<string, unknown>;

type FriendlyDiff = {
  field: string;
  label: string;
  before: string;
  after: string;
};

function asAuditSnapshot(value: unknown): AuditSnapshot {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AuditSnapshot)
    : {};
}

function rankingTargetLabel(targetType: unknown, lowercase = false) {
  const label = String(targetType || "").toUpperCase() === "CAST" ? "Nhân viên" : "Quán";
  return lowercase ? label.toLocaleLowerCase("vi-VN") : label;
}

function rankingPosition(value: unknown) {
  return typeof value === "number" ? `vị trí #${value}` : "không ghim vị trí";
}

export function getFriendlyAuditDetail(log: AuditLogRec) {
  const before = asAuditSnapshot(log.beforeJson);
  const after = asAuditSnapshot(log.afterJson);
  const latest = Object.keys(after).length ? after : before;
  const defaultTitle = friendlyActionNames[log.action] || log.action;

  if (log.action.startsWith("ranking.config.")) {
    const targetType = after.targetType || before.targetType;
    const targetLabel = rankingTargetLabel(targetType);
    const targetName = after.targetName || before.targetName;
    const subject = targetName
      ? `${rankingTargetLabel(targetType, true)} “${targetName}”`
      : `${rankingTargetLabel(targetType, true)} đã chọn`;
    const beforeRank = before.pinRank;
    const afterRank = after.pinRank;
    const targetChanged =
      before.targetId &&
      after.targetId &&
      (before.targetId !== after.targetId || before.targetType !== after.targetType);

    if (log.action === "ranking.config.create") {
      return {
        title: "Thêm vào bảng xếp hạng",
        summary: `Đã thêm ${subject} vào bảng xếp hạng${
          typeof afterRank === "number" ? ` ở vị trí #${afterRank}` : ""
        }.`,
        targetDescription: targetName ? `${targetLabel}: ${targetName}` : targetLabel,
      };
    }

    if (log.action === "ranking.config.delete") {
      return {
        title: "Gỡ khỏi bảng xếp hạng",
        summary: `Đã gỡ ${subject} khỏi bảng xếp hạng.`,
        targetDescription: targetName ? `${targetLabel}: ${targetName}` : targetLabel,
      };
    }

    if (targetChanged) {
      const oldSubject = before.targetName
        ? `${rankingTargetLabel(before.targetType, true)} “${before.targetName}”`
        : "đối tượng cũ";
      const newSubject = after.targetName
        ? `${rankingTargetLabel(after.targetType, true)} “${after.targetName}”`
        : "đối tượng mới";
      return {
        title: "Thay đối tượng xếp hạng",
        summary: `Đã thay ${oldSubject} bằng ${newSubject} trong bảng xếp hạng.`,
        targetDescription: after.targetName
          ? `${rankingTargetLabel(after.targetType)}: ${after.targetName}`
          : rankingTargetLabel(after.targetType),
      };
    }

    if (beforeRank !== afterRank) {
      return {
        title: "Thay đổi vị trí xếp hạng",
        summary: `Đã chuyển ${subject} từ ${rankingPosition(
          beforeRank,
        )} sang ${rankingPosition(afterRank)}.`,
        targetDescription: targetName ? `${targetLabel}: ${targetName}` : targetLabel,
      };
    }

    return {
      title: "Cập nhật xếp hạng",
      summary: `Đã cập nhật thiết lập xếp hạng của ${subject}.`,
      targetDescription: targetName ? `${targetLabel}: ${targetName}` : targetLabel,
    };
  }

  const targetLabels: Record<string, string> = {
    AdminCoupon: "Mã ưu đãi",
    Bill: "Hóa đơn",
    Booking: "Lịch đặt",
    Campaign: "Chương trình ưu đãi",
    Cast: "Nhân viên",
    Category: "Danh mục",
    Content: "Nội dung",
    CouponIssue: "Mã ưu đãi",
    Store: "Quán",
    SystemConfig: "Cấu hình",
    Tour: "Tour",
    User: "Tài khoản",
  };
  const targetLabel = targetLabels[log.targetType] || log.targetType;
  const targetName =
    latest.name || latest.title || latest.displayName || latest.stageName || log.entityDisplayCode;

  return {
    title: defaultTitle,
    summary: log.changeSummary || `Đã thực hiện thao tác “${defaultTitle}”.`,
    targetDescription: targetName ? `${targetLabel}: ${targetName}` : targetLabel,
  };
}

export function getFriendlyAuditDiff(beforeJson: unknown, afterJson: unknown) {
  if (!beforeJson && !afterJson) return [];
  const before = asAuditSnapshot(beforeJson);
  const after = asAuditSnapshot(afterJson);
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  const fieldLabels: Record<string, string> = {
    status: "Trạng thái",
    totalVnd: "Tổng tiền",
    subtotalVnd: "Tạm tính",
    paidVnd: "Thực trả",
    discountVnd: "Giảm giá",
    taxVnd: "Thuế VAT",
    serviceChargeVnd: "Phí dịch vụ",
    commissionAmountVnd: "Tiền hoa hồng",
    pointsEarned: "Điểm tích lũy",
    rejectReason: "Lý do từ chối",
    reviewedAt: "Thời gian duyệt",
    verifiedAt: "Thời gian xác thực",
    rejectedAt: "Thời gian từ chối",
    startsAt: "Thời gian bắt đầu",
    endsAt: "Thời gian kết thúc",
    name: "Tên",
    title: "Tiêu đề",
    stageName: "Tên nhân viên",
    displayName: "Tên hiển thị",
    email: "Email",
    phone: "Số điện thoại",
    role: "Vai trò",
    tier: "Hạng thành viên",
    bookingDate: "Ngày đặt lịch",
    bookingTime: "Giờ đặt lịch",
    customerName: "Tên khách hàng",
    customerPhone: "SĐT khách hàng",
    adultsCount: "Số khách",
    notes: "Ghi chú",
    address: "Địa chỉ",
    city: "Thành phố",
    mapUrl: "Liên kết bản đồ",
    description: "Mô tả",
    bio: "Giới thiệu",
    heightCm: "Chiều cao",
    measurements: "Số đo",
    languages: "Ngôn ngữ",
    hobbies: "Sở thích",
    tags: "Nhãn",
    youtubeLinks: "Liên kết YouTube",
    isPublic: "Hiển thị công khai",
    openingHours: "Giờ mở cửa",
    pricingInfo: "Thông tin giá",
    discountType: "Loại giảm giá",
    discountValue: "Mức giảm",
    targetStores: "Quán áp dụng",
    targetAudiences: "Đối tượng áp dụng",
    usageLimit: "Giới hạn sử dụng",
    excerpt: "Mô tả ngắn",
    body: "Nội dung",
    publishedAt: "Thời gian đăng",
    value: "Giá trị cấu hình",
    password: "Mật khẩu",
    isActive: "Trạng thái hoạt động",
    scope: "Phạm vi xếp hạng",
    cityCode: "Thành phố",
    category: "Loại hình",
    manualScore: "Điểm ưu tiên",
    pinRank: "Vị trí xếp hạng",
    sponsored: "Nội dung tài trợ",
  };

  const statuses: Record<string, string> = {
    SUBMITTED: "Chờ duyệt",
    VERIFIED: "Đã xác thực",
    REJECTED: "Đã từ chối",
    PENDING_PM_BA: "Chờ PM/BA duyệt",
    ACTIVE: "Hoạt động",
    INACTIVE: "Ngừng hoạt động",
    USED: "Đã sử dụng",
    UNUSED: "Chưa sử dụng",
    EXPIRED: "Đã hết hạn",
    CANCELLED: "Đã hủy",
    PENDING: "Chờ xử lý",
    SUSPENDED: "Tạm ngưng",
    DRAFT: "Bản nháp",
    DELETED: "Đã xóa",
  };

  const formatValue = (key: string, value: unknown) => {
    if (value === null || value === undefined) return "Trống";
    if (key === "pinRank") return rankingPosition(value);
    if (key === "manualScore" && typeof value === "number") return `${value} điểm`;
    if (key === "sponsored") return value ? "Có tài trợ" : "Không tài trợ";
    if (key === "scope") {
      const scopes: Record<string, string> = {
        GLOBAL: "Toàn hệ thống",
        CITY: "Theo thành phố",
        AREA: "Theo khu vực",
        CATEGORY: "Theo loại hình",
      };
      return scopes[String(value).toUpperCase()] || String(value);
    }
    if (key === "cityCode") {
      const cities: Record<string, string> = {
        HN: "Hà Nội",
        HCM: "TP. Hồ Chí Minh",
        GLOBAL: "Toàn quốc",
      };
      return cities[String(value).toUpperCase()] || String(value);
    }
    if (key === "category") {
      const categories: Record<string, string> = {
        ALL: "Tất cả loại hình",
        CLUB: "Club",
        LOUNGE: "Lounge",
        KARAOKE: "Karaoke",
        GIRLS_BAR: "Girls Bar",
        MASSAGE_SPA: "Massage & Spa",
      };
      return categories[String(value).toUpperCase()] || String(value);
    }
    if (typeof value === "boolean") return value ? "Bật" : "Tắt";
    if (key.endsWith("Vnd") && typeof value === "number") {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(value);
    }
    if (key === "status" && typeof value === "string" && statuses[value]) {
      return statuses[value];
    }
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return dayjs(value).format("DD/MM/YYYY HH:mm:ss");
    }
    if (Array.isArray(value)) {
      return value.every((item) => ["string", "number"].includes(typeof item))
        ? value.join(", ")
        : `${value.length} mục`;
    }
    if (typeof value === "object") {
      return "Thông tin chi tiết đã được cập nhật";
    }
    return String(value);
  };

  return keys.reduce<FriendlyDiff[]>((diffs, key) => {
    if (
      ["id", "createdAt", "updatedAt", "targetName", "targetType"].includes(key) ||
      key.endsWith("Id")
    ) {
      return diffs;
    }

    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      diffs.push({
        field: key,
        label: fieldLabels[key] || "Thông tin",
        before: formatValue(key, before[key]),
        after: formatValue(key, after[key]),
      });
    }
    return diffs;
  }, []);
}

export function FriendlyAuditChanges({ log }: { log: AuditLogRec }) {
  const [showTechnicalData, setShowTechnicalData] = useState(false);
  const diffs = getFriendlyAuditDiff(log.beforeJson, log.afterJson);
  const isNewValue = !log.beforeJson;

  if (!log.beforeJson && !log.afterJson) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600, color: colors.text }}>
          Nội dung thay đổi
        </div>
        <button
          onClick={() => setShowTechnicalData((current) => !current)}
          style={{
            background: "rgba(212,178,106,.1)",
            border: "1px solid rgba(212,178,106,.2)",
            color: colors.gold,
            fontSize: "11.5px",
            cursor: "pointer",
            padding: "5px 10px",
            borderRadius: "6px",
          }}
        >
          {showTechnicalData ? "Quay lại nội dung dễ hiểu" : "Xem dữ liệu kỹ thuật"}
        </button>
      </div>

      {showTechnicalData ? (
        <div>
          {log.beforeJson && (
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{
                  fontSize: "11px",
                  color: colors.red,
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Dữ liệu trước khi thay đổi
              </div>
              <pre
                style={{
                  background: "#1e1d24",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#d4d4d4",
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(log.beforeJson, null, 2)}
              </pre>
            </div>
          )}
          {log.afterJson && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  color: colors.green,
                  fontWeight: 600,
                  marginBottom: "6px",
                }}
              >
                Dữ liệu sau khi thay đổi
              </div>
              <pre
                style={{
                  background: "#1e1d24",
                  padding: "14px",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#d4d4d4",
                  overflowX: "auto",
                }}
              >
                {JSON.stringify(log.afterJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {diffs.length === 0 ? (
            <div
              style={{
                padding: "16px",
                textAlign: "center",
                color: colors.muted,
                fontSize: "12.5px",
                background: "rgba(255,255,255,.01)",
                border: "1px solid rgba(255,255,255,.04)",
                borderRadius: "12px",
              }}
            >
              Thao tác đã được ghi nhận nhưng không có thông tin nào thay đổi.
            </div>
          ) : (
            diffs.map((diff) => (
              <div
                key={diff.field}
                style={{
                  background: "rgba(255,255,255,.018)",
                  border: "1px solid rgba(255,255,255,.055)",
                  borderRadius: "12px",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    color: colors.muted,
                    fontSize: "11.5px",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  {diff.label}
                </div>
                {isNewValue ? (
                  <div
                    style={{
                      color: colors.text,
                      fontSize: "13.5px",
                      fontWeight: 600,
                    }}
                  >
                    {diff.after}
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 24px minmax(0, 1fr)",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                        background: "rgba(248,113,113,.06)",
                        borderRadius: "8px",
                        padding: "9px 10px",
                      }}
                    >
                      <div
                        style={{
                          color: colors.muted,
                          fontSize: "10px",
                          marginBottom: "3px",
                        }}
                      >
                        Từ
                      </div>
                      <div
                        style={{
                          color: colors.text2,
                          fontSize: "12.5px",
                          wordBreak: "break-word",
                        }}
                      >
                        {diff.before}
                      </div>
                    </div>
                    <div
                      style={{
                        color: colors.gold,
                        textAlign: "center",
                        fontSize: "16px",
                      }}
                    >
                      →
                    </div>
                    <div
                      style={{
                        minWidth: 0,
                        background: "rgba(74,222,128,.06)",
                        borderRadius: "8px",
                        padding: "9px 10px",
                      }}
                    >
                      <div
                        style={{
                          color: colors.muted,
                          fontSize: "10px",
                          marginBottom: "3px",
                        }}
                      >
                        Thành
                      </div>
                      <div
                        style={{
                          color: colors.text,
                          fontSize: "12.5px",
                          fontWeight: 600,
                          wordBreak: "break-word",
                        }}
                      >
                        {diff.after}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
