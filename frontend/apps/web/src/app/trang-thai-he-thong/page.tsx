"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, Check, Info, Loader2, MessageCircle, Smartphone, X } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { useSystemFeedback } from "@/components/ui/SystemFeedback";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.04)",
  border: "rgba(212,178,106,.22)",
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const standardToasts = [
  {
    tone: "success" as const,
    title: "Đã lấy mã thành công",
    description: "Mã Happy Hour -30% đã lưu vào ví ưu đãi.",
  },
  {
    tone: "info" as const,
    title: "Đã cập nhật hồ sơ",
    description: "Thông tin tài khoản của bạn đã được lưu.",
  },
  {
    tone: "warning" as const,
    title: "Mã sắp hết hạn",
    description: "Mã ưu đãi của bạn còn hiệu lực trong 2 giờ.",
  },
  {
    tone: "error" as const,
    title: "Mất kết nối",
    description: "Không thể tải dữ liệu. Vui lòng thử lại sau.",
  },
];

export default function SystemStatesPage() {
  const feedback = useSystemFeedback();

  const showStandardToasts = () => {
    standardToasts.forEach((toast, index) => {
      window.setTimeout(() => feedback.showToast(toast), index * 120);
    });
  };

  const showProcessingToast = () => {
    const id = feedback.showToast({
      loading: true,
      title: "Đang gửi yêu cầu đặt chỗ...",
      description: "Vui lòng đợi trong giây lát.",
      progress: 62,
      durationMs: Infinity,
    });

    window.setTimeout(() => {
      feedback.updateToast(id, {
        loading: false,
        tone: "success",
        title: "Đã gửi yêu cầu đặt chỗ",
        description: "Admin sẽ điều phối với quán và liên hệ lại.",
        progress: 100,
        durationMs: 4000,
      });
    }, 1400);
  };

  const showBottomStack = () => {
    [
      { tone: "gold" as const, title: "Đã gửi tới Admin qua Telegram", description: "Admin sẽ điều phối với quán." },
      { tone: "success" as const, title: "Đã lưu vào ví ưu đãi", description: "Bạn có thể dùng mã trong lần đặt tiếp theo." },
      { tone: "warning" as const, title: "Phiên sắp hết hạn", description: "Hoàn tất đặt chỗ trong 5 phút." },
    ].forEach((toast, index) => {
      window.setTimeout(() => feedback.showToast({ ...toast, placement: "bottom" }), index * 120);
    });
  };

  return (
    <main className="nl-system-kit-page">
      <section className="nl-system-kit-hero">
        <div>
          <span>Vietyoru System UI</span>
          <h1>Màn hệ thống</h1>
          <p>Popup, toast, loading, empty và trang lỗi theo nền than đen + gold premium.</p>
        </div>
        <Link href="/maintenance">Màn bảo trì</Link>
      </section>

      <section className="nl-system-section">
        <SectionHead title="Modal thông báo" />
        <div className="nl-system-action-grid">
          <ActionButton
            icon={<Check size={18} />}
            label="Thành công"
            onClick={() =>
              feedback.showModal({
                tone: "success",
                title: "Đặt chỗ thành công!",
                description: "Bàn của bạn tại Club Lumière đã được giữ. Mã đặt chỗ đã gửi vào tài khoản.",
                primaryLabel: "Xem chi tiết đặt chỗ",
              })
            }
          />
          <ActionButton
            icon={<X size={18} />}
            label="Xác nhận hủy"
            onClick={() =>
              feedback.showModal({
                tone: "error",
                destructive: true,
                title: "Hủy đặt chỗ?",
                description: "Bạn có chắc muốn hủy lượt đặt tại Club Lumière? Thao tác này không thể hoàn tác.",
                secondaryLabel: "Để sau",
                primaryLabel: "Đồng ý hủy",
              })
            }
          />
          <ActionButton
            icon={<AlertTriangle size={18} />}
            label="Cảnh báo"
            onClick={() =>
              feedback.showModal({
                tone: "warning",
                title: "Phiên sắp hết hạn",
                description: "Vui lòng hoàn tất đặt chỗ trong 5 phút, nếu không phiên sẽ tự đóng.",
                primaryLabel: "Tiếp tục đặt chỗ",
              })
            }
          />
          <ActionButton
            icon={<X size={18} />}
            label="Lỗi"
            onClick={() =>
              feedback.showModal({
                tone: "error",
                title: "Đặt chỗ thất bại",
                description: "Không thể kết nối tới máy chủ. Vui lòng kiểm tra mạng và thử lại.",
                secondaryLabel: "Đóng",
                primaryLabel: "Thử lại",
              })
            }
          />
        </div>
      </section>

      <section className="nl-system-section">
        <SectionHead title="Toast" />
        <div className="nl-system-action-grid">
          <ActionButton icon={<Info size={18} />} label="4 loại tiêu chuẩn" onClick={showStandardToasts} />
          <ActionButton
            icon={<MessageCircle size={18} />}
            label="Có hành động"
            onClick={() =>
              feedback.showToast({
                tone: "gold",
                title: "Đã xóa khỏi mục đã lưu",
                actionLabel: "Hoàn tác",
                onAction: () =>
                  feedback.showToast({
                    tone: "success",
                    title: "Đã khôi phục mục đã lưu",
                    description: "Mục này đã trở lại danh sách yêu thích.",
                  }),
              })
            }
          />
          <ActionButton icon={<Loader2 size={18} />} label="Đang xử lý" onClick={showProcessingToast} />
          <ActionButton icon={<Smartphone size={18} />} label="Xếp chồng góc dưới" onClick={showBottomStack} />
        </div>
      </section>

      <section className="nl-system-section">
        <SectionHead title="Bottom-sheet" />
        <div className="nl-system-phone-preview">
          <button
            type="button"
            onClick={() =>
              feedback.showBottomSheet({
                title: "Xác nhận đặt bàn?",
                description: "Yêu cầu sẽ được gửi tới Admin và quán. Bạn có thể theo dõi trạng thái trong lịch sử đặt chỗ.",
                secondaryLabel: "Xem lại",
                primaryLabel: "Gửi yêu cầu",
              })
            }
          >
            Mở bottom-sheet xác nhận
          </button>
        </div>
      </section>

      <section className="nl-system-section">
        <SectionHead title="Empty states" />
        <div className="nl-system-empty-grid">
          <EmptyState variant="bookings" compact />
          <EmptyState variant="saved" compact />
          <EmptyState variant="search" compact />
          <EmptyState variant="coupons" compact />
        </div>
      </section>

      <section className="nl-system-section">
        <SectionHead title="Loading" />
        <div className="nl-system-loading-grid">
          <LoadingSkeleton rows={3} />
          <LoadingSkeleton variant="mobile-home" />
        </div>
      </section>

      <section className="nl-system-section">
        <SectionHead title="Trang lỗi" />
        <div className="nl-system-status-links">
          <Link href="/khong-ton-tai">404 Không tìm thấy</Link>
          <Link href="/500">500 Sự cố máy chủ</Link>
          <Link href="/403">403 Forbidden</Link>
          <Link href="/maintenance">Bảo trì</Link>
        </div>
      </section>

      <style>{styles}</style>
    </main>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="nl-system-section-head">
      <h2>{title}</h2>
      <i />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="nl-system-action-button">
      <span>{icon}</span>
      {label}
    </button>
  );
}

const styles = `
  .nl-system-kit-page {
    min-height: 100vh;
    background: #0c0c0f;
    color: ${colors.text};
    padding: 34px;
    font-family: var(--nl-font-sans);
  }

  .nl-system-kit-hero {
    max-width: 1180px;
    margin: 0 auto 26px;
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 20px;
    border-bottom: 1px solid ${colors.border};
    padding-bottom: 24px;
  }

  .nl-system-kit-hero span {
    color: ${colors.gold};
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
  }

  .nl-system-kit-hero h1 {
    margin: 8px 0 0;
    color: ${colors.text};
    font-size: 36px;
    font-weight: 900;
    letter-spacing: 0;
  }

  .nl-system-kit-hero p {
    margin: 8px 0 0;
    color: ${colors.text2};
    font-size: 14px;
    line-height: 1.6;
  }

  .nl-system-kit-hero a,
  .nl-system-status-links a,
  .nl-system-phone-preview button,
  .nl-system-action-button {
    min-height: 44px;
    border-radius: 11px;
    font-family: var(--nl-font-sans);
    font-weight: 900;
    cursor: pointer;
    text-decoration: none;
  }

  .nl-system-kit-hero a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${colors.goldGrad};
    color: ${colors.onGold};
    padding: 0 18px;
    flex: none;
  }

  .nl-system-section {
    max-width: 1180px;
    margin: 0 auto;
    padding: 26px 0;
  }

  .nl-system-section-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 16px;
  }

  .nl-system-section-head h2 {
    margin: 0;
    color: ${colors.text};
    font-size: 21px;
    font-weight: 800;
  }

  .nl-system-section-head i {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(212,178,106,.45), transparent);
  }

  .nl-system-action-grid,
  .nl-system-empty-grid,
  .nl-system-status-links {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
  }

  .nl-system-action-button {
    border: 1px solid ${colors.border};
    background: ${colors.panel};
    color: ${colors.goldPale};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 14px;
  }

  .nl-system-action-button span {
    width: 30px;
    height: 30px;
    border-radius: 9px;
    border: 1px solid rgba(212,178,106,.26);
    background: rgba(212,178,106,.1);
    color: ${colors.gold};
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }

  .nl-system-phone-preview {
    max-width: 390px;
    min-height: 220px;
    border-radius: 34px;
    background: #000;
    padding: 8px;
    box-shadow: 0 30px 70px -34px rgba(0,0,0,.85);
  }

  .nl-system-phone-preview button {
    width: 100%;
    height: 204px;
    border: 1px solid rgba(212,178,106,.2);
    border-radius: 28px;
    background: linear-gradient(180deg,#0c0c0f,#16141b);
    color: ${colors.goldPale};
  }

  .nl-system-loading-grid {
    display: grid;
    grid-template-columns: minmax(0, .85fr) minmax(280px, .65fr);
    gap: 18px;
    align-items: start;
  }

  .nl-system-loading-grid main {
    min-height: auto !important;
    border: 1px solid ${colors.border};
    border-radius: 18px;
    padding: 18px !important;
    overflow: hidden;
  }

  .nl-system-status-links a {
    border: 1px solid ${colors.border};
    background: ${colors.panel};
    color: ${colors.goldPale};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 14px;
    text-align: center;
  }

  @media (max-width: 767px) {
    .nl-system-kit-page {
      padding: 20px 16px calc(112px + env(safe-area-inset-bottom));
    }

    .nl-system-kit-hero {
      align-items: stretch;
      flex-direction: column;
    }

    .nl-system-kit-hero h1 {
      font-size: 28px;
    }

    .nl-system-action-grid,
    .nl-system-empty-grid,
    .nl-system-status-links,
    .nl-system-loading-grid {
      grid-template-columns: 1fr;
    }
  }
`;
