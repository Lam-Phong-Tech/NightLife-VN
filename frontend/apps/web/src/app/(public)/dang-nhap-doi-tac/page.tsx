"use client";

import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, LogIn, Sun, Moon } from 'lucide-react';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { loginPartner } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { setAuthSession } from '@/lib/auth/session';

type PartnerTheme = 'dark' | 'light';

const partnerThemeStorageKey = 'vy-user-theme';

const darkColors = {
  bg: '#0c0c0f',
  surface1: 'rgba(255,255,255,.035)',
  surface2: 'rgba(255,255,255,.04)',
  borderGold12: 'rgba(212,178,106,.18)',
  borderGold22: 'rgba(212,178,106,.22)',
  borderGold32: 'rgba(212,178,106,.32)',
  borderGold40: 'rgba(212,178,106,.4)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldBright: '#e3c27e',
  goldPale: '#f0dda8',
  neonPink: '#e0729e',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
};

const lightColors = {
  bg: '#f4eddf',
  surface1: 'rgba(255,255,255,.86)',
  surface2: 'rgba(255,255,255,.78)',
  borderGold12: 'rgba(166,119,38,.18)',
  borderGold22: 'rgba(166,119,38,.26)',
  borderGold32: 'rgba(166,119,38,.34)',
  borderGold40: 'rgba(166,119,38,.42)',
  text: '#241d14',
  text2: '#5f5547',
  muted: '#8b7d6a',
  onGold: '#23180a',
  gold: '#a67425',
  goldBright: '#b98735',
  goldPale: '#75511b',
  neonPink: '#d9548b',
  goldGrad: 'linear-gradient(135deg,#f8e8b2,#d7ab50 55%,#b98931)',
};

const readStoredPartnerTheme = (): PartnerTheme => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(partnerThemeStorageKey);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return document.documentElement.classList.contains('vy-light') ? 'light' : 'dark';
};

const testAccount = {
  email: 'partner@nightlife.vn',
  password: 'Str0ngPass!',
  store: 'Demo NightLife Store',
};

function Logo({ compact = false, colors }: { compact?: boolean; colors: typeof darkColors }) {
  return (
    <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', textDecoration: 'none' }}>
      <span
        style={{
          fontSize: compact ? '23px' : '26px',
          fontWeight: 800,
          lineHeight: 1,
          background: colors.goldGrad,
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        Vietyoru
      </span>
      <span style={{ marginTop: '4px', fontSize: '8.5px', letterSpacing: '3.6px', color: colors.muted }}>
        VIETNAM NIGHTLIFE GUIDE
      </span>
    </Link>
  );
}

function LoginContent({
  mode,
  theme,
  onToggleTheme,
}: {
  mode: 'mobile' | 'desktop';
  theme: PartnerTheme;
  onToggleTheme: () => void;
}) {
  const isMobile = mode === 'mobile';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = theme === 'light' ? lightColors : darkColors;

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return '/partner';
    return new URLSearchParams(window.location.search).get('redirect') || '/partner';
  }, []);

  const submit = async () => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const session = await loginPartner({
        email: email.trim(),
        password,
      });

      setAuthSession(session);
      window.location.href = redirectTo;
    } catch (error) {
      const detail = error instanceof ApiError ? error.message : 'Không kết nối được API đăng nhập.';
      setMessage(`${detail} Tài khoản seed: partner@nightlife.vn / Str0ngPass!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      data-no-translate="true"
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      <div style={{ padding: isMobile ? '13px 22px 0' : '18px 34px 0' }}>
        <header
          style={{
            minHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            gap: '12px',
            borderBottom: `1px solid ${colors.borderGold12}`,
            paddingBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile ? (
              <Link
                href="/dang-ky-doi-tac"
                aria-label="Quay lại"
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
                }}
              >
                <ArrowLeft size={18} />
              </Link>
            ) : null}
            <Logo compact={isMobile} colors={colors} />
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
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
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            }}
          >
            {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
          </button>
        </header>
      </div>

      <section
        style={{
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? undefined : 'minmax(0,1.1fr) minmax(430px,.9fr)',
          gap: isMobile ? '18px' : '32px',
          minHeight: isMobile ? undefined : 'calc(100vh - 82px)',
          padding: isMobile ? '18px' : '32px 34px',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            minHeight: isMobile ? '300px' : 'calc(100vh - 146px)',
            borderRadius: '18px',
            border: `1px solid ${darkColors.borderGold22}`,
            overflow: 'hidden',
            padding: isMobile ? '22px' : '36px',
            background:
              "linear-gradient(180deg,rgba(12,12,15,.08),rgba(12,12,15,.86)), url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1500&q=80') center/cover",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 16px 34px -18px rgba(0,0,0,.7)',
          }}
        >
          <div
            style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: `1px solid ${darkColors.borderGold40}`,
              borderRadius: '999px',
              padding: '7px 11px',
              background: 'rgba(12,12,15,.45)',
              color: darkColors.gold,
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '1.5px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: darkColors.neonPink }} />
            PARTNER PORTAL
          </div>
          <div>
            <div style={{ color: darkColors.gold, fontSize: '10px', fontWeight: 700, letterSpacing: '1.8px', marginBottom: '10px' }}>
              ĐĂNG NHẬP ĐỐI TÁC
            </div>
            <h1 style={{ margin: 0, maxWidth: '560px', fontSize: isMobile ? '28px' : '48px', lineHeight: 1.08, fontWeight: 700, color: '#f3f0ea' }}>
              Quản lý đặt chỗ, coupon và nội dung quán tại một nơi
            </h1>
            <p style={{ margin: '14px 0 0', maxWidth: '520px', color: darkColors.text2, fontSize: '13.5px', lineHeight: 1.7 }}>
              Tài khoản đối tác chỉ xem dữ liệu tổng hợp của quán, quét mã giảm giá và gửi bản nháp chờ Admin duyệt.
            </p>
          </div>
        </div>

        <div
          style={{
            border: `1px solid ${colors.borderGold22}`,
            borderRadius: '16px',
            background: colors.surface1,
            padding: isMobile ? '18px' : '26px',
            alignSelf: isMobile ? undefined : 'center',
            boxShadow: theme === 'light' ? '0 16px 36px -20px rgba(40,30,10,.25)' : '0 16px 34px -18px rgba(0,0,0,.7)',
            transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Đăng nhập đối tác</h2>
              <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>
                PARTNER SIGN IN
              </div>
            </div>
            <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${colors.borderGold40}, transparent)` }} />
          </div>


          <div style={{ display: 'grid', gap: '13px' }}>
            <label style={{ display: 'grid', gap: '7px', color: colors.text2, fontSize: '11.5px', fontWeight: 600 }}>
              Tài khoản quán
              <input
                name="nl-partner-login-email"
                type="email"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                data-form-type="other"
                data-lpignore="true"
                data-1p-ignore="true"
                data-bwignore="true"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={{
                  minHeight: '44px',
                  width: '100%',
                  border: `1px solid ${colors.borderGold22}`,
                  borderRadius: '11px',
                  padding: '0 13px',
                  color: colors.text,
                  background: colors.surface2,
                  fontSize: '13px',
                  outline: 'none',
                  transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: '7px', color: colors.text2, fontSize: '11.5px', fontWeight: 600 }}>
              Mật khẩu
              <span style={{ position: 'relative', display: 'block' }}>
                <input
                  name="nl-partner-login-passcode"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={{
                    minHeight: '44px',
                    width: '100%',
                    border: `1px solid ${colors.borderGold22}`,
                    borderRadius: '11px',
                    padding: '0 48px 0 13px',
                    color: colors.text,
                    background: colors.surface2,
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                  }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={showPassword}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowPassword((current) => !current)}
                  style={{
                    position: 'absolute',
                    right: '7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '34px',
                    height: '34px',
                    border: 0,
                    borderRadius: '999px',
                    color: colors.gold,
                    background: theme === 'light' ? 'rgba(166,119,38,.12)' : 'rgba(212,178,106,.12)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </span>
            </label>
          </div>

          {message ? <div style={{ marginTop: '12px', color: colors.neonPink, fontSize: '12px' }}>{message}</div> : null}

          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              minHeight: '44px',
              marginTop: '16px',
              border: 0,
              borderRadius: '11px',
              background: colors.goldGrad,
              color: colors.onGold,
              fontSize: '14px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isSubmitting ? 'wait' : 'pointer',
              opacity: isSubmitting ? 0.72 : 1,
            }}
          >
            <LogIn size={16} />
            {isSubmitting ? 'Đang xác thực...' : 'Vào cổng đối tác'}
          </button>

        </div>
      </section>
    </main>
  );
}

export default function Page() {
  const [partnerTheme, setPartnerTheme] = useState<PartnerTheme>('dark');

  useEffect(() => {
    setPartnerTheme(readStoredPartnerTheme());
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('vy-light', partnerTheme === 'light');
    window.localStorage.setItem(partnerThemeStorageKey, partnerTheme);
  }, [partnerTheme]);

  const toggleTheme = useCallback(() => {
    setPartnerTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <React.Fragment>
      <div className="block md:hidden">
        <LoginContent mode="mobile" theme={partnerTheme} onToggleTheme={toggleTheme} />
      </div>
      <div className="hidden md:block">
        <LoginContent mode="desktop" theme={partnerTheme} onToggleTheme={toggleTheme} />
      </div>
    </React.Fragment>
  );
}

