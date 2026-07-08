"use client";

import Link from 'next/link';
import {
  BadgeCheck,
  BarChart3,
  Eye,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { loginAdmin } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { setAuthSession } from '@/lib/auth/session';

const colors = {
  bg: '#0c0c0f',
  surface1: 'rgba(255,255,255,.035)',
  surface2: 'rgba(255,255,255,.04)',
  borderGold12: 'rgba(212,178,106,.18)',
  borderGold22: 'rgba(212,178,106,.22)',
  borderGold32: 'rgba(212,178,106,.32)',
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
  email: 'admin@nightlife.vn',
  password: 'Str0ngPass!',
};

export default function AdminLoginPage() {
  const [email, setEmail] = useState(testAccount.email);
  const [password, setPassword] = useState(testAccount.password);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return '/admin';
    return new URLSearchParams(window.location.search).get('redirect') || '/admin';
  }, []);

  const submit = async () => {
    setIsSubmitting(true);
    setMessage('');

    try {
      const session = await loginAdmin({
        email: email.trim(),
        password,
      });

      setAuthSession(session);
      window.location.href = redirectTo;
    } catch (error) {
      const detail = error instanceof ApiError ? error.message : 'Khong ket noi duoc API dang nhap.';
      setMessage(`${detail} Tai khoan seed: admin@nightlife.vn / Str0ngPass!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="nl-admin-login-page" style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "var(--nl-font-sans)", padding: '34px' }}>
      <div className="nl-admin-login-layout" style={{ minHeight: 'calc(100vh - 68px)', display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(430px,.9fr)', gap: '28px' }}>
        <section
          className="nl-admin-login-hero"
          style={{
            border: `1px solid ${colors.borderGold22}`,
            borderRadius: '18px',
            overflow: 'hidden',
            padding: '38px',
            background:
              "linear-gradient(180deg,rgba(12,12,15,.08),rgba(12,12,15,.88)), url('https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1500&q=80') center/cover",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 16px 34px -18px rgba(0,0,0,.7)',
          }}
        >
          <Link href="/" style={{ display: 'inline-flex', flexDirection: 'column', textDecoration: 'none', alignSelf: 'flex-start' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, background: colors.goldGrad, WebkitBackgroundClip: 'text', color: 'transparent' }}>
              Vietyoru
            </span>
            <span style={{ marginTop: '4px', fontSize: '8.5px', letterSpacing: '3.6px', color: colors.muted }}>ADMIN CMS</span>
          </Link>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: `1px solid ${colors.borderGold32}`,
                borderRadius: '999px',
                padding: '7px 11px',
                color: colors.gold,
                background: 'rgba(12,12,15,.45)',
                fontSize: '9.5px',
                fontWeight: 700,
                letterSpacing: '1.5px',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.neonPink }} />
              ADMIN CONTROL CENTER
            </div>
            <h1 style={{ margin: '18px 0 0', maxWidth: '560px', fontSize: '48px', lineHeight: 1.08, fontWeight: 700 }}>
              Bảng điều khiển quản trị hệ thống
            </h1>
            <p style={{ margin: '14px 0 0', maxWidth: '520px', color: colors.text2, fontSize: '13.5px', lineHeight: 1.7 }}>
              Quản lý quán, cast, đặt chỗ, hóa đơn, ưu đãi, ranking và báo cáo vận hành trong cùng một nơi.
            </p>
            <div className="nl-admin-login-badges" style={{ display: 'flex', gap: '12px', marginTop: '22px', flexWrap: 'wrap' }}>
              {[
                { icon: ShieldCheck, text: 'Bảo mật vai trò admin' },
                { icon: BarChart3, text: 'Theo dõi realtime' },
                { icon: Sparkles, text: 'Duyệt nội dung nhanh' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <span
                    key={item.text}
                    style={{
                      minHeight: '38px',
                      borderRadius: '19px',
                      border: `1px solid ${colors.borderGold22}`,
                      background: 'rgba(12,12,15,.45)',
                      color: colors.text2,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 12px',
                      fontSize: '12px',
                    }}
                  >
                    <Icon size={15} color={colors.gold} />
                    {item.text}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="nl-admin-login-card"
          style={{
            alignSelf: 'center',
            border: `1px solid ${colors.borderGold22}`,
            borderRadius: '16px',
            background: colors.surface1,
            padding: '26px',
            boxShadow: '0 16px 34px -18px rgba(0,0,0,.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '21px', fontWeight: 600 }}>Đăng nhập quản trị</h2>
              <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>
                ADMIN SIGN IN
              </div>
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
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
              Tài khoản test admin
            </div>
            <div style={{ marginTop: '7px' }}>Email: <b>{testAccount.email}</b></div>
            <div>Mật khẩu: <b>{testAccount.password}</b></div>
          </div>

          <div style={{ display: 'grid', gap: '13px' }}>
            <label style={{ display: 'grid', gap: '7px', color: colors.text2, fontSize: '11.5px', fontWeight: 600 }}>
              Email
              <span style={{ position: 'relative', display: 'block' }}>
                <Mail size={16} color={colors.gold} style={{ position: 'absolute', left: 13, top: 14 }} />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={{
                    minHeight: '44px',
                    width: '100%',
                    border: `1px solid ${colors.borderGold22}`,
                    borderRadius: '11px',
                    padding: '0 13px 0 40px',
                    color: colors.text,
                    background: colors.surface2,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
              </span>
            </label>
            <label style={{ display: 'grid', gap: '7px', color: colors.text2, fontSize: '11.5px', fontWeight: 600 }}>
              Mật khẩu
              <span style={{ position: 'relative', display: 'block' }}>
                <LockKeyhole size={16} color={colors.gold} style={{ position: 'absolute', left: 13, top: 14 }} />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={{
                    minHeight: '44px',
                    width: '100%',
                    border: `1px solid ${colors.borderGold22}`,
                    borderRadius: '11px',
                    padding: '0 48px 0 40px',
                    color: colors.text,
                    background: colors.surface2,
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <Eye size={16} color={colors.gold} style={{ position: 'absolute', right: 14, top: 14 }} />
              </span>
            </label>
          </div>

          {message ? <div style={{ marginTop: '12px', color: colors.neonPink, fontSize: '12px' }}>{message}</div> : null}

          <button
            className="nl-admin-login-submit"
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
            {isSubmitting ? 'Dang xac thuc...' : 'Vào trang admin'}
          </button>

          <div style={{ marginTop: '18px', color: colors.muted, textAlign: 'center', fontSize: '11.5px' }}>
            Khu vực dành riêng cho quản trị viên NightLife.
          </div>
        </section>
      </div>
    </main>
  );
}
