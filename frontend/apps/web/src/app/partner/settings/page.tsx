'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, KeyRound, ShieldCheck, Users, ChevronRight } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { usePartnerStoreScope } from '../PartnerProviders';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';

export default function PartnerSettingsPage() {
  const { isPartnerAccount } = usePartnerStoreScope();
  const feedback = useSystemFeedback();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi nhập liệu',
        description: 'Vui lòng điền đầy đủ mật khẩu cũ, mật khẩu mới và xác nhận mật khẩu.',
      });
      return;
    }

    if (newPassword.length < 8) {
      feedback.showToast({
        tone: 'error',
        title: 'Mật khẩu không hợp lệ',
        description: 'Mật khẩu mới phải chứa ít nhất 8 ký tự.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      feedback.showToast({
        tone: 'error',
        title: 'Mật khẩu không khớp',
        description: 'Mật khẩu mới và nhập lại mật khẩu không khớp nhau.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient('/users/change-password', {
        method: 'POST',
        data: {
          currentPassword: oldPassword,
          newPassword,
        },
      });

      feedback.showToast({
        tone: 'success',
        title: 'Đổi mật khẩu thành công',
        description: 'Mật khẩu của bạn đã được cập nhật an toàn.',
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      feedback.showToast({
        tone: 'error',
        title: 'Đổi mật khẩu thất bại',
        description: err.message || 'Mật khẩu hiện tại không chính xác.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const colors = {
    surface2: 'var(--partner-surface-2, rgba(255,255,255,.04))',
    borderGold12: 'var(--partner-border-gold-12, rgba(212,178,106,.18))',
    borderGold22: 'var(--partner-border-gold-22, rgba(212,178,106,.22))',
    borderGold32: 'var(--partner-border-gold-32, rgba(212,178,106,.32))',
    text: 'var(--partner-text, #f3f0ea)',
    text2: 'var(--partner-text-2, #c5c0b6)',
    muted: 'var(--partner-muted, #8c8679)',
    gold: 'var(--partner-gold, #d4b26a)',
    goldBright: 'var(--partner-gold-bright, #e3c27e)',
    goldGrad: 'var(--partner-gold-grad, linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a))',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 40px 10px 14px',
    borderRadius: '10px',
    border: `1px solid ${colors.borderGold22}`,
    background: 'rgba(0,0,0,.3)',
    color: colors.text,
    fontSize: '13.5px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'grid', gap: '20px', maxWidth: '800px' }}>
      {/* Staff Management Link Card (if Partner Account) */}
      {isPartnerAccount && (
        <Link
          href="/partner/settings/staff"
          style={{
            background: colors.surface2,
            borderRadius: '16px',
            border: `1px solid ${colors.borderGold32}`,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            color: colors.text,
            transition: 'border-color 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(212,178,106,.15)',
                color: colors.goldBright,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Users size={22} />
            </span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: colors.goldBright }}>
                Quản lý tài khoản nhân viên (Staff)
              </div>
              <div style={{ fontSize: '12.5px', color: colors.text2, marginTop: '2px' }}>
                Thêm, xóa và phân quyền nhân viên theo cơ sở (Store Permissions)
              </div>
            </div>
          </div>
          <ChevronRight size={20} color={colors.gold} />
        </Link>
      )}

      {/* Password Change Form */}
      <div
        style={{
          background: colors.surface2,
          borderRadius: '16px',
          border: `1px solid ${colors.borderGold22}`,
          padding: '24px',
          display: 'grid',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={22} color={colors.gold} />
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: colors.text, margin: 0 }}>
              Thay đổi mật khẩu
            </h2>
            <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>
              Cập nhật mật khẩu để bảo vệ an toàn cho tài khoản đối tác của bạn.
            </div>
          </div>
        </div>

        <form onSubmit={handleChangePassword} style={{ display: 'grid', gap: '16px' }}>
          {/* Old Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>
              Mật khẩu hiện tại
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại..."
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 0,
                  color: colors.muted,
                  cursor: 'pointer',
                }}
              >
                {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>
              Mật khẩu mới (Tối thiểu 8 ký tự)
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới..."
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 0,
                  color: colors.muted,
                  cursor: 'pointer',
                }}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>
              Nhập lại mật khẩu mới
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận lại mật khẩu mới..."
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 0,
                  color: colors.muted,
                  cursor: 'pointer',
                }}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '8px',
              padding: '12px 20px',
              borderRadius: '10px',
              border: 0,
              background: colors.goldGrad,
              color: '#241a0a',
              fontWeight: 900,
              fontSize: '14px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: 'fit-content',
            }}
          >
            <KeyRound size={16} />
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}
