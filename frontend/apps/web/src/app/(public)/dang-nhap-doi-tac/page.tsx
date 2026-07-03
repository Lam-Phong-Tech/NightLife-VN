"use client";

import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Building2, Eye, LockKeyhole, LogIn, QrCode, ShieldCheck } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { loginPartner } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { setAuthSession } from '@/lib/auth/session';

const colors = {
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

const testAccount = {
  email: 'partner@nightlife.vn',
  password: 'Str0ngPass!',
  store: 'Demo NightLife Store',
};

function Logo({ compact = false }: { compact?: boolean }) {
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

function LoginContent({ mode }: { mode: 'mobile' | 'desktop' }) {
  const isMobile = mode === 'mobile';
  const [email, setEmail] = useState(testAccount.email);
  const [password, setPassword] = useState(testAccount.password);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
      }}
    >
      <div style={{ padding: isMobile ? '13px 22px 0' : '18px 34px 0' }}>
        <header
          style={{
            minHeight: isMobile ? '64px' : '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? '12px' : '0',
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
            <Logo compact={isMobile} />
          </div>
          <div
            style={{
              width: isMobile ? '100%' : 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'flex-end' : 'flex-start',
              gap: isMobile ? '8px' : '14px',
            }}
          >
            <span
              style={{
                minHeight: '38px',
                padding: isMobile ? '0 10px' : '0 11px',
                borderRadius: '19px',
                border: `1px solid ${colors.borderGold32}`,
                color: colors.gold,
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: isMobile ? '11.5px' : '12px',
                fontWeight: 700,
                background: colors.surface2,
                whiteSpace: 'nowrap',
              }}
            >
              VI / JP
            </span>
            <Link
              href="/dang-nhap-doi-tac?redirect=/partner"
              style={{ color: colors.text2, fontSize: isMobile ? '12px' : '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              Đăng nhập
            </Link>
            <Link
              href="/dang-ky-doi-tac"
              style={{
                minHeight: '38px',
                borderRadius: '19px',
                padding: isMobile ? '0 12px' : '0 16px',
                background: colors.goldGrad,
                color: colors.onGold,
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 800,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Đăng ký đối tác
            </Link>
          </div>
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
            border: `1px solid ${colors.borderGold22}`,
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
              border: `1px solid ${colors.borderGold40}`,
              borderRadius: '999px',
              padding: '7px 11px',
              background: 'rgba(12,12,15,.45)',
              color: colors.gold,
              fontSize: '9.5px',
              fontWeight: 700,
              letterSpacing: '1.5px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.neonPink }} />
            PARTNER PORTAL
          </div>
          <div>
            <div style={{ color: colors.gold, fontSize: '10px', fontWeight: 700, letterSpacing: '1.8px', marginBottom: '10px' }}>
              ĐĂNG NHẬP ĐỐI TÁC
            </div>
            <h1 style={{ margin: 0, maxWidth: '560px', fontSize: isMobile ? '28px' : '48px', lineHeight: 1.08, fontWeight: 700 }}>
              Quản lý đặt chỗ, coupon và nội dung quán tại một nơi
            </h1>
            <p style={{ margin: '14px 0 0', maxWidth: '520px', color: colors.text2, fontSize: '13.5px', lineHeight: 1.7 }}>
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
            boxShadow: '0 16px 34px -18px rgba(0,0,0,.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600 }}>Đăng nhập đối tác</h2>
              <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>
                PARTNER SIGN IN
              </div>
            </div>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
          </div>

          <div
            style={{
              border: `1px solid ${colors.borderGold22}`,
              borderRadius: '14px',
              background: 'rgba(212,178,106,.08)',
              padding: '13px',
              color: colors.text2,
              fontSize: '12px',
              lineHeight: 1.6,
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: colors.goldBright, fontWeight: 700 }}>
              <BadgeCheck size={16} />
              Tài khoản test
            </div>
            <div style={{ marginTop: '7px' }}>Email: <b>{testAccount.email}</b></div>
            <div>Mật khẩu: <b>{testAccount.password}</b></div>
          </div>

          <div style={{ display: 'grid', gap: '13px' }}>
            <label style={{ display: 'grid', gap: '7px', color: colors.text2, fontSize: '11.5px', fontWeight: 600 }}>
              Tài khoản quán
              <input
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
                }}
              />
            </label>
            <label style={{ display: 'grid', gap: '7px', color: colors.text2, fontSize: '11.5px', fontWeight: 600 }}>
              Mật khẩu
              <span style={{ position: 'relative', display: 'block' }}>
                <input
                  type="password"
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
                  }}
                />
                <Eye size={16} color={colors.gold} style={{ position: 'absolute', right: '14px', top: '14px' }} />
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
            {isSubmitting ? 'Dang xac thuc...' : 'Vào cổng đối tác'}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginTop: '14px' }}>
            {[
              { icon: Building2, text: testAccount.store },
              { icon: QrCode, text: 'Quét mã và đối soát' },
              { icon: ShieldCheck, text: 'Không xem dữ liệu khách chi tiết' },
              { icon: LockKeyhole, text: 'Role PARTNER qua JWT backend' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.text}
                  style={{
                    border: `1px solid ${colors.borderGold12}`,
                    borderRadius: '12px',
                    padding: '10px',
                    background: colors.surface2,
                    color: colors.muted,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11.5px',
                  }}
                >
                  <Icon size={15} color={colors.gold} />
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function Page() {
  return (
    <React.Fragment>
      <div className="block md:hidden">
        <LoginContent mode="mobile" />
      </div>
      <div className="hidden md:block">
        <LoginContent mode="desktop" />
      </div>
    </React.Fragment>
  );
}
