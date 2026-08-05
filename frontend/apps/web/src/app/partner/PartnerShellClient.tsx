'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  FileClock,
  FileText,
  Home,
  LogOut,
  Moon,
  QrCode,
  ReceiptText,
  Settings,
  Sun,
  type LucideIcon,
} from 'lucide-react';
import { usePartnerTheme, usePartnerStoreScope, usePartnerNotification } from './PartnerProviders';
import { ThemedListingSelect } from '@/components/ui/ThemedListingSelect';
import { logoutBrowserProfile } from '@/lib/api/auth';

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { key: 'home', href: '/partner', label: 'Tổng quan', icon: Home },
  { key: 'scan', href: '/partner/scan', label: 'Quét QR & Đặt chỗ', icon: QrCode },
  { key: 'listing', href: '/partner/listing', label: 'Đăng tin & Nhân sự', icon: FileText },
  { key: 'settings', href: '/partner/settings', label: 'Cài đặt & Nhân viên', icon: Settings },
  { key: 'activity', href: '/partner/activity', label: 'Hoạt động & Hóa đơn', icon: ReceiptText },
];

const getPageTitleInfo = (pathname: string) => {
  if (pathname.startsWith('/partner/scan')) {
    return { eyebrow: 'MÃ KHUYẾN MÃI & CHECK-IN', title: 'Xác nhận mã & Quét QR' };
  }
  if (pathname.startsWith('/partner/listing')) {
    return { eyebrow: 'THÔNG TIN CƠ SỞ & CASTING', title: 'Cấu hình thông tin quán' };
  }
  if (pathname.startsWith('/partner/settings/staff')) {
    return { eyebrow: 'STAFF MANAGEMENT', title: 'Quản lý nhân viên' };
  }
  if (pathname.startsWith('/partner/settings')) {
    return { eyebrow: 'PARTNER SETTINGS', title: 'Cấu hình & Cài đặt' };
  }
  if (pathname.startsWith('/partner/activity') || pathname.startsWith('/partner/gui-hoa-don')) {
    return { eyebrow: 'LỊCH SỬ GIAO DỊCH', title: 'Hoạt động & Hóa đơn' };
  }
  return { eyebrow: 'DASHBOARD ĐỐI TÁC', title: 'Tổng quan kinh doanh' };
};

const isRouteActive = (pathname: string, href: string) => {
  if (href === '/partner') {
    return pathname === '/partner';
  }
  return pathname.startsWith(href);
};

export function PartnerShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/partner';
  const router = useRouter();

  const { partnerTheme, togglePartnerTheme, partnerThemeVariables } = usePartnerTheme();
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    storeName,
    activeStoreStatus,
    isStaffAccount,
  } = usePartnerStoreScope();
  const {
    partnerNotifications,
    unreadNotificationCount,
    isNotificationOpen,
    setIsNotificationOpen,
    markAllNotificationsRead,
    openPartnerNotification,
  } = usePartnerNotification();

  const pageTitleInfo = getPageTitleInfo(pathname);
  const accountScopeLabel = isStaffAccount ? 'Nhân viên đang hoạt động' : 'Đối tác đang hoạt động';

  const visibleNavItems = isStaffAccount
    ? navItems.filter((item) => item.key === 'scan' || item.key === 'home')
    : navItems;

  const handleLogout = async () => {
    try {
      await logoutBrowserProfile();
    } catch {}
    window.location.href = '/';
  };

  const colors = {
    bg: 'var(--partner-bg, #0c0c0f)',
    surface1: 'var(--partner-surface-1, rgba(255,255,255,.035))',
    surface2: 'var(--partner-surface-2, rgba(255,255,255,.04))',
    surface3: 'var(--partner-surface-3, rgba(255,255,255,.05))',
    navBg: 'var(--partner-nav-bg, rgba(8,8,11,.9))',
    headerBg: 'var(--partner-header-bg, rgba(12,12,15,.72))',
    popoverBg: 'var(--partner-popover-bg, linear-gradient(180deg,rgba(28,27,31,.98),rgba(12,12,15,.98)))',
    activeControlBg: 'var(--partner-active-control-bg, rgba(212,178,106,.16))',
    borderSoft: 'var(--partner-border-soft, rgba(255,255,255,.06))',
    borderHair: 'var(--partner-border-hair, rgba(255,255,255,.08))',
    borderGold12: 'var(--partner-border-gold-12, rgba(212,178,106,.18))',
    borderGold22: 'var(--partner-border-gold-22, rgba(212,178,106,.22))',
    borderGold32: 'var(--partner-border-gold-32, rgba(212,178,106,.32))',
    borderGold40: 'var(--partner-border-gold-40, rgba(212,178,106,.4))',
    text: 'var(--partner-text, #f3f0ea)',
    text2: 'var(--partner-text-2, #c5c0b6)',
    muted: 'var(--partner-muted, #8c8679)',
    onGold: 'var(--partner-on-gold, #241a0a)',
    gold: 'var(--partner-gold, #d4b26a)',
    goldBright: 'var(--partner-gold-bright, #e3c27e)',
    goldPale: 'var(--partner-gold-pale, #f0dda8)',
    goldGrad: 'var(--partner-gold-grad, linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a))',
    danger: 'var(--partner-danger, #ffb4a8)',
    success: 'var(--partner-success, #8de6b0)',
    neonPink: 'var(--partner-neon-pink, #e0729e)',
  };

  return (
    <main
      className="partner-main"
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        ...partnerThemeVariables,
      }}
    >
      <style jsx global>{`
        .partner-shell {
          display: grid;
          grid-template-columns: 252px 1fr;
          min-height: 100vh;
        }
        .partner-content {
          padding: 26px 30px 34px;
          min-width: 0;
        }
        @media (max-width: 991px) {
          .partner-shell {
            grid-template-columns: 1fr !important;
          }
          .partner-sidebar {
            display: none !important;
          }
          .partner-header {
            padding: 0 16px !important;
          }
          .partner-content {
            padding: 20px 16px 88px !important;
          }
          .partner-desktop-header-title {
            display: none !important;
          }
          .partner-mobile-header-store {
            display: flex !important;
          }
          .partner-mobile-page-title {
            display: block !important;
          }
          .partner-mobile-bottom-nav {
            display: flex !important;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            z-index: 90;
            background: ${colors.navBg};
            backdrop-filter: blur(16px);
            border-top: 1px solid ${colors.borderGold12};
            padding: 0 6px;
            align-items: center;
            justify-content: space-around;
          }
          .partner-mobile-nav-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            background: transparent;
            border: 0;
            color: ${colors.muted};
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            padding: 6px;
            border-radius: 8px;
            text-decoration: none;
            flex: 1;
          }
          .partner-mobile-nav-btn.active {
            color: ${colors.goldBright};
          }
        }
        @media (max-width: 480px) {
          .partner-header-status-pill {
            display: none !important;
          }
          .partner-logout-btn .logout-text {
            display: none !important;
          }
        }
      `}</style>

      <div className="partner-shell">
        {/* Desktop Sidebar */}
        <aside
          className="partner-sidebar"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: '252px',
            height: '100dvh',
            minHeight: '100dvh',
            overflowY: 'auto',
            zIndex: 10,
            borderRight: `1px solid ${colors.borderGold12}`,
            background: colors.navBg,
            padding: '22px 16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              textDecoration: 'none',
              margin: '0 6px 26px',
            }}
          >
            <span
              style={{
                fontSize: '25px',
                fontWeight: 800,
                lineHeight: 1,
                background: colors.goldGrad,
                WebkitBackgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Vietyoru
            </span>
            <span
              style={{
                marginTop: '4px',
                fontSize: '8.5px',
                letterSpacing: '3.2px',
                color: colors.muted,
              }}
            >
              PARTNER PORTAL
            </span>
          </Link>

          <nav className="partner-nav" style={{ display: 'grid', gap: '4px' }}>
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const active = isRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  style={{
                    minHeight: '52px',
                    width: '100%',
                    border: 0,
                    borderRadius: '12px',
                    padding: '0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '11px',
                    color: active ? colors.onGold : colors.text2,
                    background: active ? colors.goldGrad : 'transparent',
                    fontSize: '13px',
                    fontWeight: active ? 800 : 600,
                    textDecoration: 'none',
                    boxSizing: 'border-box',
                  }}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon size={18} strokeWidth={1.7} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block' }}>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div
            style={{
              marginTop: 'auto',
              borderTop: `1px solid ${colors.borderGold12}`,
              paddingTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                border: `1px solid ${colors.borderGold32}`,
                background:
                  "linear-gradient(180deg,rgba(12,12,15,.1),rgba(12,12,15,.55)), url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=300&q=70') center/cover",
                flex: '0 0 auto',
              }}
            />
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 700,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {storeName}
              </span>
              <span
                style={{
                  display: 'block',
                  marginTop: '2px',
                  fontSize: '11px',
                  color: colors.muted,
                }}
              >
                {accountScopeLabel}
              </span>
            </span>
          </div>
        </aside>

        {/* Content & Top Header Container */}
        <section style={{ minWidth: 0 }}>
          <header
            className="partner-header"
            style={{
              minHeight: '78px',
              borderBottom: `1px solid ${colors.borderGold12}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              padding: '0 30px',
              background: colors.headerBg,
              backdropFilter: 'blur(14px)',
            }}
          >
            <div className="partner-header-left">
              {/* Desktop-only Page Title */}
              <div className="partner-desktop-header-title">
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '1.7px',
                    color: colors.gold,
                  }}
                >
                  {pageTitleInfo.eyebrow}
                </div>
                <h1 style={{ margin: '5px 0 0', fontSize: '24px', fontWeight: 700 }}>
                  {pageTitleInfo.title}
                </h1>
              </div>

              {/* Mobile-only Store Name & Status Dot */}
              <div
                className="partner-mobile-header-store"
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background:
                      activeStoreStatus.toUpperCase() === 'ACTIVE'
                        ? colors.success
                        : colors.gold,
                    boxShadow: `0 0 8px ${
                      activeStoreStatus.toUpperCase() === 'ACTIVE'
                        ? colors.success
                        : colors.gold
                    }`,
                    flex: '0 0 auto',
                  }}
                />
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: colors.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px',
                  }}
                >
                  {storeName}
                </span>
              </div>
            </div>

            <div
              className="partner-header-actions"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}
            >
              {/* Store Switcher via custom component */}
              {stores.length > 1 && (
                <div style={{ minWidth: '160px' }}>
                  <ThemedListingSelect
                    value={selectedStoreId}
                    onChange={setSelectedStoreId}
                    placeholder="Chọn quán..."
                    options={stores.map((s) => ({ value: s.id, label: s.name }))}
                    compact
                    ariaLabel="Chọn quán hoạt động"
                  />
                </div>
              )}

              {/* Store Status Pill */}
              <span
                className="partner-header-status-pill"
                style={{
                  height: '38px',
                  borderRadius: '19px',
                  border: `1px solid ${colors.borderGold32}`,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: colors.text2,
                  fontSize: '12px',
                }}
              >
                <CheckCircle2 size={15} color={colors.gold} />
                {activeStoreStatus}
              </span>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={togglePartnerTheme}
                title="Chuyển giao diện sáng/tối"
                aria-label="Chuyển giao diện sáng/tối"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: `1px solid ${colors.borderGold32}`,
                  color: colors.gold,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: colors.surface2,
                  cursor: 'pointer',
                  flex: '0 0 auto',
                }}
              >
                {partnerTheme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              </button>

              {/* Notifications Bell & Popover */}
              <button
                type="button"
                onClick={() => setIsNotificationOpen((current) => !current)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: `1px solid ${colors.borderGold32}`,
                  color: colors.gold,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isNotificationOpen ? colors.activeControlBg : colors.surface2,
                  cursor: 'pointer',
                  position: 'relative',
                  boxShadow: unreadNotificationCount
                    ? '0 0 0 3px rgba(224,114,158,.08)'
                    : undefined,
                }}
                aria-label={`Thông báo đối tác${
                  unreadNotificationCount ? `, ${unreadNotificationCount} chưa đọc` : ''
                }`}
                aria-expanded={isNotificationOpen}
              >
                <Bell size={17} />
                {unreadNotificationCount ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      right: '-3px',
                      top: '-4px',
                      minWidth: '17px',
                      height: '17px',
                      borderRadius: '999px',
                      padding: '0 5px',
                      background: colors.neonPink,
                      color: '#fff',
                      border: `2px solid ${colors.bg}`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                ) : null}
              </button>

              {/* Notification Popover */}
              <div
                className="partner-notification-popover"
                style={{
                  display: isNotificationOpen ? 'block' : 'none',
                  position: 'fixed',
                  top: '84px',
                  right: '30px',
                  width: '390px',
                  maxWidth: 'calc(100vw - 36px)',
                  zIndex: 80,
                  border: `1px solid ${colors.borderGold32}`,
                  borderRadius: '18px',
                  background: colors.popoverBg,
                  boxShadow: '0 26px 70px -28px rgba(0,0,0,.9)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '14px 14px 12px',
                    borderBottom: `1px solid ${colors.borderHair}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ color: colors.text, fontSize: '15px', fontWeight: 900 }}>
                      Thông báo đối tác
                    </div>
                    <div style={{ marginTop: '3px', color: colors.muted, fontSize: '11px' }}>
                      Tách theo booking, QR, bill, coupon và đăng tin
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    disabled={!unreadNotificationCount}
                    style={{
                      minHeight: '30px',
                      border: `1px solid ${colors.borderGold22}`,
                      borderRadius: '999px',
                      background: unreadNotificationCount
                        ? 'rgba(212,178,106,.12)'
                        : colors.surface2,
                      color: unreadNotificationCount ? colors.goldBright : colors.muted,
                      padding: '0 10px',
                      fontSize: '10.5px',
                      fontWeight: 900,
                      cursor: unreadNotificationCount ? 'pointer' : 'not-allowed',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Đã đọc
                  </button>
                </div>
                <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '8px' }}>
                  {partnerNotifications.length ? (
                    partnerNotifications.map((notification) => {
                      return (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => openPartnerNotification(notification)}
                          style={{
                            width: '100%',
                            border: `1px solid ${
                              notification.unread ? colors.borderGold32 : colors.borderHair
                            }`,
                            borderRadius: '14px',
                            background: notification.unread
                              ? 'linear-gradient(90deg,rgba(212,178,106,.15),rgba(255,255,255,.035))'
                              : colors.surface2,
                            color: colors.text,
                            padding: '12px 14px',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'start',
                            textAlign: 'left',
                            cursor: 'pointer',
                            marginTop: '4px',
                          }}
                        >
                          <span style={{ minWidth: 0, flex: 1 }}>
                            <span
                              style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: 900,
                              }}
                            >
                              {notification.title}
                            </span>
                            <span
                              style={{
                                display: 'block',
                                marginTop: '4px',
                                color: colors.text2,
                                fontSize: '11.5px',
                              }}
                            >
                              {notification.message}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        border: `1px dashed ${colors.borderGold22}`,
                        borderRadius: '14px',
                        padding: '16px',
                        color: colors.text2,
                        fontSize: '12.5px',
                        lineHeight: 1.6,
                      }}
                    >
                      Chưa có thông báo cần xử lý.
                    </div>
                  )}
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="partner-logout-btn"
                style={{
                  height: '38px',
                  borderRadius: '11px',
                  border: `1px solid ${colors.borderGold22}`,
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: colors.gold,
                  textDecoration: 'none',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <LogOut size={15} />
                <span className="logout-text">Đăng xuất</span>
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="partner-content">
            <h1
              className="partner-mobile-page-title"
              style={{
                display: 'none',
                margin: '0 0 16px',
                fontSize: '20px',
                fontWeight: 800,
                color: colors.text,
              }}
            >
              {pageTitleInfo.title}
            </h1>
            {children}
          </div>
        </section>

        {/* Mobile Bottom Navigation */}
        <nav className="partner-mobile-bottom-nav" style={{ display: 'none' }}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`partner-mobile-nav-btn ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                <span className="partner-mobile-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </main>
  );
}
