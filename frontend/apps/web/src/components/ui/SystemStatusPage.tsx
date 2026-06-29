"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Home,
  Lock,
  MessageCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  Wrench,
  type LucideIcon,
} from "lucide-react";

type StatusKind = "not-found" | "server-error" | "forbidden" | "maintenance";

type SystemStatusPageProps = {
  kind: StatusKind;
  digest?: string;
  onRetry?: () => void;
  contextTitle?: string;
  contextDescription?: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

const statusContent: Record<
  StatusKind,
  {
    code?: string;
    badge: string;
    title: string;
    description: string;
    icon: LucideIcon;
    tone: "gold" | "danger";
    search?: boolean;
    retry?: boolean;
    line?: boolean;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  }
> = {
  "not-found": {
    code: "404",
    badge: "Không tìm thấy",
    title: "Không tìm thấy trang",
    description: "Trang có thể đã đổi tên hoặc không còn tồn tại. Thử tìm quán, cast hoặc quay về trang chủ.",
    icon: Search,
    tone: "gold",
    search: true,
    primaryLabel: "Về trang chủ",
    primaryHref: "/",
    secondaryLabel: "Tìm quán",
    secondaryHref: "/danh-sach-quan",
  },
  "server-error": {
    code: "500",
    badge: "Sự cố hệ thống",
    title: "Đã có lỗi xảy ra phía máy chủ",
    description: "Hệ thống đang gặp trục trặc tạm thời. Vui lòng thử lại sau ít phút. Nếu vẫn lỗi, hãy liên hệ qua LINE để được hỗ trợ.",
    icon: AlertTriangle,
    tone: "danger",
    retry: true,
    line: true,
    primaryLabel: "Thử lại",
    primaryHref: "#retry",
    secondaryLabel: "Về trang chủ",
    secondaryHref: "/",
  },
  forbidden: {
    code: "403",
    badge: "Forbidden",
    title: "Bạn không có quyền truy cập",
    description: "Trang này dành cho tài khoản đã đăng nhập hoặc có quyền phù hợp. Vui lòng đăng nhập đúng tài khoản.",
    icon: ShieldAlert,
    tone: "gold",
    primaryLabel: "Đăng nhập",
    primaryHref: "/dang-nhap",
    secondaryLabel: "Về trang chủ",
    secondaryHref: "/",
  },
  maintenance: {
    badge: "Bảo trì",
    title: "Hệ thống đang được bảo trì",
    description: "Chúng tôi đang nâng cấp để mang lại trải nghiệm tốt hơn và sẽ trở lại trong giây lát. Cảm ơn bạn đã kiên nhẫn chờ đợi.",
    icon: Wrench,
    tone: "gold",
    line: true,
    primaryLabel: "Về trang chủ",
    primaryHref: "/",
    secondaryLabel: "Liên hệ LINE",
    secondaryHref: "https://line.me/R/ti/p/@vietyoru",
  },
};

export function SystemStatusPage({
  kind,
  digest,
  onRetry,
  contextTitle,
  contextDescription,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: SystemStatusPageProps) {
  const content = statusContent[kind];
  const Icon = content.icon;
  const incidentCode =
    kind === "server-error" ? `NL-500-${digest ? digest.slice(0, 8).toUpperCase() : "20260629"}` : null;

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }
    window.location.reload();
  };

  return (
    <main className="nl-system-status-page">
      <section className="nl-system-status-hero">
        <div className={`nl-system-status-badge nl-system-status-${content.tone}`}>
          <Icon size={14} strokeWidth={2} />
          {content.badge}
        </div>

        {content.code ? <div className="nl-system-status-code">{content.code}</div> : <StatusIcon icon={Icon} />}

        <h1>{contextTitle ?? content.title}</h1>
        <p>{contextDescription ?? content.description}</p>

        {content.search ? (
          <Link href="/danh-sach-quan" className="nl-system-status-search">
            <Search size={17} strokeWidth={2} />
            <span>Tìm quán hoặc cast...</span>
          </Link>
        ) : null}

        <div className="nl-system-status-actions">
          {content.retry ? (
            <button type="button" className="nl-system-status-primary" onClick={handleRetry}>
              <RefreshCw size={16} strokeWidth={2.2} />
              {primaryLabel ?? content.primaryLabel}
            </button>
          ) : (
            <Link href={primaryHref ?? content.primaryHref} className="nl-system-status-primary">
              {kind === "forbidden" ? <Lock size={16} strokeWidth={2.2} /> : <Home size={16} strokeWidth={2.2} />}
              {primaryLabel ?? content.primaryLabel}
            </Link>
          )}

          <Link href={secondaryHref ?? content.secondaryHref} className="nl-system-status-secondary">
            {content.line ? <MessageCircle size={16} strokeWidth={2} /> : <Search size={16} strokeWidth={2} />}
            {secondaryLabel ?? content.secondaryLabel}
          </Link>
        </div>

        {incidentCode ? <div className="nl-system-status-incident">Mã sự cố: {incidentCode}</div> : null}
      </section>

      <style>{statusStyles}</style>
    </main>
  );
}

function StatusIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="nl-system-status-icon">
      <Icon size={52} strokeWidth={1.7} />
    </div>
  );
}

const statusStyles = `
  .nl-system-status-page {
    min-height: calc(100vh - 82px);
    display: grid;
    place-items: center;
    background: linear-gradient(180deg,#0c0c0f 0%,#111114 55%,#08080b 100%);
    color: #f3f0ea;
    padding: 64px 24px;
    font-family: var(--nl-font-sans);
  }

  .nl-system-status-hero {
    width: min(760px, 100%);
    text-align: center;
  }

  .nl-system-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 34px;
    border-radius: 18px;
    padding: 7px 15px;
    font-size: 12px;
    font-weight: 900;
  }

  .nl-system-status-gold {
    background: rgba(212,178,106,.12);
    color: #e3c27e;
    border: 1px solid rgba(212,178,106,.28);
  }

  .nl-system-status-danger {
    background: rgba(224,105,122,.12);
    color: #e88f9b;
    border: 1px solid rgba(224,105,122,.26);
  }

  .nl-system-status-code {
    margin-top: 20px;
    font-size: 140px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: 0;
    background: linear-gradient(135deg,#f4e3b4,#d4b26a 52%,#a87c3c);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .nl-system-status-icon {
    width: 104px;
    height: 104px;
    border-radius: 28px;
    margin: 22px auto 0;
    background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#a87c3c);
    color: #241a0a;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 18px 40px -16px rgba(168,124,60,.6);
  }

  .nl-system-status-hero h1 {
    margin: 14px 0 0;
    color: #f3f0ea;
    font-size: 29px;
    font-weight: 800;
    line-height: 1.22;
  }

  .nl-system-status-hero p {
    max-width: 560px;
    margin: 13px auto 0;
    color: #c5c0b6;
    font-size: 14.5px;
    line-height: 1.7;
  }

  .nl-system-status-search {
    margin: 28px auto 0;
    max-width: 540px;
    min-height: 48px;
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(212,178,106,.22);
    border-radius: 14px;
    background: rgba(255,255,255,.04);
    color: #8c8679;
    padding: 0 14px;
    text-decoration: none;
    text-align: left;
  }

  .nl-system-status-search svg {
    color: #c9a86a;
    flex: none;
  }

  .nl-system-status-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 24px;
    flex-wrap: wrap;
  }

  .nl-system-status-primary,
  .nl-system-status-secondary {
    min-height: 46px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 18px;
    font-size: 14px;
    font-weight: 900;
    font-family: var(--nl-font-sans);
    text-decoration: none;
    cursor: pointer;
  }

  .nl-system-status-primary {
    border: 0;
    background: linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a);
    color: #241a0a;
  }

  .nl-system-status-secondary {
    border: 1px solid rgba(212,178,106,.28);
    background: rgba(255,255,255,.05);
    color: #e3c27e;
  }

  .nl-system-status-incident {
    margin-top: 20px;
    color: #6f6b62;
    font-size: 12px;
  }

  @media (max-width: 767px) {
    .nl-system-status-page {
      min-height: calc(100vh - 56px);
      padding: 48px 18px calc(120px + env(safe-area-inset-bottom));
    }

    .nl-system-status-code {
      margin-top: 14px;
      font-size: 84px;
    }

    .nl-system-status-icon {
      width: 96px;
      height: 96px;
      border-radius: 26px;
    }

    .nl-system-status-hero h1 {
      font-size: 21px;
      margin-top: 10px;
    }

    .nl-system-status-hero p {
      font-size: 13px;
      line-height: 1.65;
    }

    .nl-system-status-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .nl-system-status-primary,
    .nl-system-status-secondary {
      width: 100%;
      min-height: 46px;
    }
  }
`;
