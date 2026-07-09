"use client";

import Link from 'next/link';
import {
  BarChart3,
  Eye,
  EyeOff,
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

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return '/admin';
    return new URLSearchParams(window.location.search).get('redirect') || '/admin';
  }, []);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
      setMessage(`${detail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="nl-admin-login-page" style={{ minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: "var(--nl-font-sans)", padding: '34px' }}>
      <div className="nl-admin-login-layout" style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <section
          className="nl-admin-login-card"
          style={{
            alignSelf: 'center',
            width: '100%',
            maxWidth: '520px',
            border: `1px solid ${colors.borderGold22}`,
            borderRadius: '20px',
            background: colors.surface1,
            padding: '40px 48px',
            boxShadow: '0 16px 34px -18px rgba(0,0,0,.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 600 }}>Đăng nhập quản trị</h2>
              <div style={{ marginTop: '6px', fontSize: '11px', fontWeight: 600, letterSpacing: '1.8px', color: colors.muted }}>
                ADMIN SIGN IN
              </div>
            </div>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
          </div>

          <form onSubmit={submit} style={{ display: 'grid', gap: '20px' }}>
            <label style={{ display: 'grid', gap: '8px', color: colors.text2, fontSize: '14px', fontWeight: 600 }}>
              Email
              <span style={{ position: 'relative', display: 'block' }}>
                <Mail size={20} color={colors.gold} style={{ position: 'absolute', left: 16, top: 16 }} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={{
                    minHeight: '52px',
                    width: '100%',
                    border: `1px solid ${colors.borderGold22}`,
                    borderRadius: '12px',
                    padding: '0 16px 0 48px',
                    color: colors.text,
                    background: colors.surface2,
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
              </span>
            </label>
            <label style={{ display: 'grid', gap: '8px', color: colors.text2, fontSize: '14px', fontWeight: 600 }}>
              Mật khẩu
              <span style={{ position: 'relative', display: 'block' }}>
                <LockKeyhole size={20} color={colors.gold} style={{ position: 'absolute', left: 16, top: 16 }} />
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={{
                    minHeight: '52px',
                    width: '100%',
                    border: `1px solid ${colors.borderGold22}`,
                    borderRadius: '12px',
                    padding: '0 52px 0 48px',
                    color: colors.text,
                    background: colors.surface2,
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: 10,
                    width: 32,
                    height: 32,
                    border: 0,
                    borderRadius: 8,
                    background: 'transparent',
                    color: colors.gold,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
            </label>

          {message ? <div style={{ marginTop: '12px', color: colors.neonPink, fontSize: '13px' }}>{message}</div> : null}

          <button
            className="nl-admin-login-submit"
            type="submit"
            disabled={isSubmitting || !email || !password}
            style={{
              width: '100%',
              minHeight: '52px',
              marginTop: '24px',
              border: 0,
              borderRadius: '12px',
              background: colors.goldGrad,
              color: colors.onGold,
              fontSize: '16px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: isSubmitting ? 'wait' : 'pointer',
              opacity: isSubmitting ? 0.72 : 1,
            }}
          >
            <LogIn size={20} />
            {isSubmitting ? 'Đang đăng nhập...' : 'Vào trang admin'}
          </button>
          </form>

          <div style={{ marginTop: '24px', color: colors.muted, textAlign: 'center', fontSize: '13px' }}>
            Khu vực dành riêng cho quản trị viên NightLife.
          </div>
        </section>
      </div>
    </main>
  );
}
