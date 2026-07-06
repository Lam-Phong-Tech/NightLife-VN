"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ImageIcon, Info, Loader2, XCircle } from "lucide-react";

import { ApiError, apiClient, translateApiMessage } from "@/lib/api/client";

const colors = {
  bg: "#0f0f13",
  surface1: "#18181f",
  surface2: "#202028",
  borderSoft: "rgba(255,255,255,.05)",
  borderGold22: "rgba(212,178,106,.22)",
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  onGold: "#241a0a",
  gold: "#d4b26a",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
  green: "#4ade80",
  red: "#f87171",
  blue: "#60a5fa",
};

type PartnerStatus = "PENDING_REVIEW" | "APPROVED" | "REJECTED";

type ApiPartnerRequest = {
  id: string;
  submittedAt?: string | null;
  status: PartnerStatus;
  reviewReason?: string | null;
  reviewedAt?: string | null;
  publicState?: string | null;
  draftStoreId?: string | null;
  draftStoreName?: string | null;
  draftStoreSlug?: string | null;
  draftCastCount?: number | null;
  draftMediaCount?: number | null;
  draftContentCount?: number | null;
  businessName?: string | null;
  businessType?: string | null;
  area?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  note?: string | null;
  storeDescription?: string | null;
  storeAddress?: string | null;
  storeCity?: string | null;
  storeDistrict?: string | null;
  openingHours?: string | null;
  menuSummary?: string | null;
  mediaUrls?: string[] | null;
  notificationStatus?: string | null;
  notificationError?: string | null;
  notifiedAt?: string | null;
};

const tabs: Array<{ status: PartnerStatus; label: string }> = [
  { status: "PENDING_REVIEW", label: "Chờ duyệt" },
  { status: "APPROVED", label: "Đã duyệt" },
  { status: "REJECTED", label: "Từ chối" },
];

const statusLabels: Record<PartnerStatus, string> = {
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Từ chối",
};

const statusTone = (status: PartnerStatus) => {
  if (status === "APPROVED") {
    return { color: colors.green, border: "1px solid rgba(74,222,128,0.3)" };
  }
  if (status === "REJECTED") {
    return { color: colors.red, border: "1px solid rgba(248,113,113,0.3)" };
  }
  return { color: colors.gold, border: `1px solid ${colors.borderGold22}` };
};

const cleanText = (value?: string | null, fallback = "-") => {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
};

const formatRequestCode = (id: string) => {
  const shortId = id.replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
  return shortId ? `PR-${shortId}` : "PR";
};

const formatSubmittedAt = (value?: string | null) => {
  if (!value) return "Chưa có ngày gửi";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa có ngày gửi";

  const formatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formatter.format(date);
};

const joinTypeAndArea = (request: ApiPartnerRequest) => {
  const parts = [request.businessType, request.area].map((part) => part?.trim()).filter(Boolean);
  return parts.length ? parts.join(" · ") : "Chưa có loại hình";
};

const requestDescription = (request: ApiPartnerRequest) =>
  cleanText(request.storeDescription ?? request.note ?? request.menuSummary, "Chưa có mô tả gửi kèm.");

export default function AdminPartnersPage() {
  const [activeStatus, setActiveStatus] = useState<PartnerStatus>("PENDING_REVIEW");
  const [requests, setRequests] = useState<ApiPartnerRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewReason, setReviewReason] = useState("");

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const data = await apiClient<ApiPartnerRequest[]>("/admin/partner-requests", {
        params: { page: 1, limit: 100 },
      });
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      setRequests([]);
      setErrorMessage(
        error instanceof ApiError
          ? translateApiMessage(error.message, error.status)
          : "Không tải được danh sách yêu cầu đối tác.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void loadRequests();
    });
  }, [loadRequests]);

  const counts = useMemo(
    () =>
      requests.reduce<Record<PartnerStatus, number>>(
        (result, request) => {
          result[request.status] += 1;
          return result;
        },
        { PENDING_REVIEW: 0, APPROVED: 0, REJECTED: 0 },
      ),
    [requests],
  );

  const filteredRequests = useMemo(
    () => requests.filter((request) => request.status === activeStatus),
    [activeStatus, requests],
  );

  const selectedRequest = useMemo(
    () => requests.find((request) => request.id === selectedId) ?? filteredRequests[0] ?? null,
    [filteredRequests, requests, selectedId],
  );

  const reviewRequest = async (request: ApiPartnerRequest, approve: boolean) => {
    const reason = approve
      ? reviewReason.trim() || "Hồ sơ hợp lệ, duyệt public nội dung đối tác."
      : reviewReason.trim();

    if (!reason) {
      setActionMessage("Vui lòng nhập lý do trước khi từ chối.");
      return;
    }

    setReviewingId(request.id);
    setActionMessage("");
    try {
      await apiClient(`/admin/partner-requests/${request.id}/review`, {
        method: "PATCH",
        data: { approve, reason },
      });
      setActionMessage(approve ? "Đã duyệt yêu cầu và public nội dung nháp." : "Đã từ chối yêu cầu đối tác.");
      setReviewReason("");
      await loadRequests();
      setActiveStatus(approve ? "APPROVED" : "REJECTED");
    } catch (error) {
      setActionMessage(
        error instanceof ApiError
          ? translateApiMessage(error.message, error.status)
          : "Không xử lý được yêu cầu đối tác.",
      );
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div style={{ display: "flex", height: "100%", minHeight: "calc(100vh - 80px)" }}>
      <div
        style={{
          width: 360,
          borderRight: `1px solid ${colors.borderSoft}`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "24px 20px 16px" }}>
          <div style={{ display: "flex", background: colors.surface1, borderRadius: 8, padding: 4 }}>
            {tabs.map((tab) => {
              const isActive = activeStatus === tab.status;
              return (
                <button
                  key={tab.status}
                  type="button"
                  onClick={() => setActiveStatus(tab.status)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 6,
                    border: "none",
                    background: isActive ? colors.goldGrad : "transparent",
                    color: isActive ? colors.onGold : colors.muted,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {tab.label} {counts[tab.status] || ""}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
          {isLoading ? (
            <div style={{ display: "grid", placeItems: "center", minHeight: 180, color: colors.muted }}>
              <Loader2 size={22} className="admin-spin" />
            </div>
          ) : errorMessage ? (
            <div
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid rgba(248,113,113,.35)",
                background: "rgba(248,113,113,.08)",
                color: colors.red,
                fontSize: 13,
                lineHeight: 1.5,
              }}
            >
              {errorMessage}
            </div>
          ) : filteredRequests.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredRequests.map((request) => {
                const isSelected = request.id === selectedRequest?.id;
                const tone = statusTone(request.status);
                return (
                  <button
                    key={request.id}
                    type="button"
                    onClick={() => setSelectedId(request.id)}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      cursor: "pointer",
                      textAlign: "left",
                      background: isSelected ? "rgba(212,178,106,.05)" : colors.surface1,
                      border: `1px solid ${isSelected ? colors.borderGold22 : colors.borderSoft}`,
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: isSelected ? colors.gold : colors.text,
                          lineHeight: 1.35,
                        }}
                      >
                        {cleanText(request.businessName ?? request.draftStoreName, "Yêu cầu đối tác")}
                      </div>
                      <span
                        style={{
                          flex: "none",
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 12,
                          color: tone.color,
                          border: tone.border,
                        }}
                      >
                        {statusLabels[request.status]}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: colors.text2, marginBottom: 8 }}>
                      {joinTypeAndArea(request)}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: colors.muted,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: `1px solid ${colors.muted}`,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: colors.muted }} />
                      </span>
                      {formatSubmittedAt(request.submittedAt)}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                padding: 18,
                borderRadius: 12,
                border: `1px dashed ${colors.borderGold22}`,
                color: colors.muted,
                fontSize: 13,
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              Chưa có yêu cầu {statusLabels[activeStatus].toLowerCase()}.
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: colors.bg, overflowY: "auto" }}>
        {selectedRequest ? (
          <div style={{ padding: 40, maxWidth: 960, width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 24,
                marginBottom: 36,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: colors.muted,
                    marginBottom: 8,
                    textTransform: "uppercase",
                  }}
                >
                  Yêu cầu hợp tác · {formatRequestCode(selectedRequest.id)}
                </div>
                <h2 style={{ fontSize: 30, fontWeight: 800, color: colors.text, margin: "0 0 6px" }}>
                  {cleanText(selectedRequest.businessName ?? selectedRequest.draftStoreName, "Yêu cầu đối tác")}
                </h2>
                <div style={{ fontSize: 14, color: colors.muted }}>{joinTypeAndArea(selectedRequest)}</div>
              </div>
              <span
                style={{
                  padding: "5px 16px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  color: statusTone(selectedRequest.status).color,
                  border: statusTone(selectedRequest.status).border,
                  whiteSpace: "nowrap",
                }}
              >
                {statusLabels[selectedRequest.status]}
              </span>
            </div>

            {actionMessage ? (
              <div
                style={{
                  padding: 14,
                  borderRadius: 12,
                  border: `1px solid ${colors.borderGold22}`,
                  background: "rgba(212,178,106,.06)",
                  color: colors.text2,
                  fontSize: 13,
                  marginBottom: 24,
                }}
              >
                {actionMessage}
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 28,
                marginBottom: 30,
              }}
            >
              <InfoField label="Người liên hệ" value={selectedRequest.contactName} />
              <InfoField label="Số điện thoại" value={selectedRequest.contactPhone} highlight />
              <InfoField label="Email" value={selectedRequest.contactEmail} />
              <InfoField
                label="Địa chỉ"
                value={[selectedRequest.storeAddress, selectedRequest.storeDistrict, selectedRequest.storeCity]
                  .map((item) => item?.trim())
                  .filter(Boolean)
                  .join(", ")}
              />
              <InfoField label="Giờ mở cửa" value={selectedRequest.openingHours} />
              <InfoField
                label="Nội dung nháp"
                value={`${selectedRequest.draftCastCount ?? 0} cast · ${selectedRequest.draftMediaCount ?? 0} media · ${
                  selectedRequest.draftContentCount ?? 0
                } menu`}
              />
            </div>

            <Section title="Giới thiệu quán">
              <div
                style={{
                  padding: 20,
                  borderRadius: 12,
                  background: colors.surface1,
                  border: `1px solid ${colors.borderSoft}`,
                  fontSize: 14,
                  color: colors.text2,
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                }}
              >
                {requestDescription(selectedRequest)}
              </div>
            </Section>

            <Section title="Ảnh gửi kèm">
              {selectedRequest.mediaUrls?.length ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
                  {selectedRequest.mediaUrls.slice(0, 8).map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "block",
                        aspectRatio: "1",
                        borderRadius: 12,
                        overflow: "hidden",
                        background: colors.surface1,
                        border: `1px solid ${colors.borderSoft}`,
                      }}
                    >
                      <img
                        src={url}
                        alt={`Ảnh đối tác ${index + 1}`}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    minHeight: 118,
                    borderRadius: 12,
                    border: `1px dashed ${colors.borderGold22}`,
                    display: "grid",
                    placeItems: "center",
                    color: colors.muted,
                    fontSize: 13,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <ImageIcon size={18} />
                    Chưa có ảnh gửi kèm
                  </span>
                </div>
              )}
            </Section>

            {selectedRequest.reviewReason ? (
              <Section title="Lý do review">
                <div
                  style={{
                    padding: 16,
                    borderRadius: 12,
                    border: `1px solid ${colors.borderSoft}`,
                    background: colors.surface1,
                    color: colors.text2,
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {selectedRequest.reviewReason}
                </div>
              </Section>
            ) : null}

            <div
              style={{
                padding: 16,
                borderRadius: 12,
                border: "1px solid rgba(96,165,250,0.3)",
                background: "rgba(96,165,250,0.05)",
                display: "flex",
                gap: 12,
                alignItems: "center",
                marginBottom: selectedRequest.status === "PENDING_REVIEW" ? 30 : 0,
              }}
            >
              <Info size={16} color={colors.blue} />
              <div style={{ fontSize: 13, color: colors.text2 }}>
                Dữ liệu đang đọc từ hồ sơ đối tác thật. Khi duyệt, backend sẽ public store/cast/media/menu nháp và tạo tài
                khoản đối tác nếu đủ email liên hệ.
              </div>
            </div>

            {selectedRequest.status === "PENDING_REVIEW" ? (
              <div style={{ display: "grid", gap: 14 }}>
                <textarea
                  value={reviewReason}
                  onChange={(event) => setReviewReason(event.target.value)}
                  placeholder="Nhập lý do review. Nếu duyệt có thể để trống, hệ thống sẽ dùng lý do mặc định."
                  rows={3}
                  style={{
                    width: "100%",
                    resize: "vertical",
                    borderRadius: 12,
                    border: `1px solid ${colors.borderGold22}`,
                    background: colors.surface1,
                    color: colors.text,
                    padding: "13px 14px",
                    outline: "none",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                />
                <div style={{ display: "flex", gap: 16 }}>
                  <button
                    type="button"
                    onClick={() => void reviewRequest(selectedRequest, true)}
                    disabled={reviewingId === selectedRequest.id}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: colors.goldGrad,
                      color: colors.onGold,
                      border: "none",
                      height: 48,
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: reviewingId === selectedRequest.id ? "wait" : "pointer",
                      opacity: reviewingId === selectedRequest.id ? 0.75 : 1,
                    }}
                  >
                    {reviewingId === selectedRequest.id ? (
                      <Loader2 size={18} className="admin-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    Duyệt & public hồ sơ
                  </button>
                  <button
                    type="button"
                    onClick={() => void reviewRequest(selectedRequest, false)}
                    disabled={reviewingId === selectedRequest.id}
                    style={{
                      width: 140,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      background: "transparent",
                      color: colors.text,
                      border: `1px solid ${colors.borderSoft}`,
                      height: 48,
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: reviewingId === selectedRequest.id ? "wait" : "pointer",
                      opacity: reviewingId === selectedRequest.id ? 0.65 : 1,
                    }}
                  >
                    <XCircle size={17} />
                    Từ chối
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.muted,
              fontSize: 14,
            }}
          >
            {isLoading ? "Đang tải yêu cầu đối tác..." : "Chọn một yêu cầu để xem chi tiết"}
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-spin {
          animation: admin-spin 0.8s linear infinite;
        }

        @keyframes admin-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

function InfoField({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div>
      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: highlight ? colors.gold : colors.text }}>
        {cleanText(value)}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}
