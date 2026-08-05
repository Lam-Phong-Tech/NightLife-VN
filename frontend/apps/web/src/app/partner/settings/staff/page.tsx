'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Plus, Trash2, Users, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { usePartnerStoreScope } from '../../PartnerProviders';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';
import { ThemedListingSelect } from '@/components/ui/ThemedListingSelect';
import { TableLoadingRows } from '@/components/ui/DataLoading';

type StaffMember = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  permissions?: string[];
  [key: string]: any;
};

export default function PartnerStaffManagementPage() {
  const { stores, selectedStoreId, setSelectedStoreId, isPartnerAccount, currentUser } = usePartnerStoreScope();
  const feedback = useSystemFeedback();

  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);
  const [isAddingStaff, setIsAddingStaff] = useState<boolean>(false);

  // Form states
  const [staffDisplayName, setStaffDisplayName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [staffStoreId, setStaffStoreId] = useState(selectedStoreId || stores[0]?.id || '');
  const [staffPermissions, setStaffPermissions] = useState<string[]>(['coupon.scan', 'checkin.confirm']);

  const activeStoreId = staffStoreId || selectedStoreId || stores[0]?.id || '';

  useEffect(() => {
    if (!staffStoreId && (selectedStoreId || stores[0]?.id)) {
      setStaffStoreId(selectedStoreId || stores[0]?.id || '');
    }
  }, [selectedStoreId, stores, staffStoreId]);

  const fetchStaffList = useCallback(async (storeId: string) => {
    if (!storeId) return;
    setIsLoadingStaff(true);
    try {
      const data = await apiClient<StaffMember[]>(`/partner/staff?storeId=${storeId}`);
      setStaffList(data);
    } catch {
      setStaffList([]);
    } finally {
      setIsLoadingStaff(false);
    }
  }, []);

  useEffect(() => {
    if (activeStoreId && isPartnerAccount) {
      fetchStaffList(activeStoreId);
    }
  }, [activeStoreId, isPartnerAccount, fetchStaffList]);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffDisplayName || !staffEmail || !staffPassword || !activeStoreId) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi nhập liệu',
        description: 'Vui lòng nhập đầy đủ tên, email, mật khẩu và chọn quán cho nhân viên.',
      });
      return;
    }

    if (staffPassword.length < 8) {
      feedback.showToast({
        tone: 'error',
        title: 'Mật khẩu yếu',
        description: 'Mật khẩu nhân viên phải chứa ít nhất 8 ký tự.',
      });
      return;
    }

    setIsAddingStaff(true);
    try {
      await apiClient('/partner/staff', {
        method: 'POST',
        data: {
          storeId: activeStoreId,
          email: staffEmail,
          password: staffPassword,
          displayName: staffDisplayName,
          permissions: staffPermissions,
        },
      });

      feedback.showToast({
        tone: 'success',
        title: 'Thành công',
        description: 'Đã tạo tài khoản và gán quyền nhân viên thành công.',
      });

      setStaffDisplayName('');
      setStaffEmail('');
      setStaffPassword('');
      setStaffPermissions(['coupon.scan', 'checkin.confirm']);
      fetchStaffList(activeStoreId);
    } catch (err: any) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi tạo nhân viên',
        description: err.message || 'Không thể tạo tài khoản nhân viên.',
      });
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleDeleteStaff = (staffId: string, staffName: string) => {
    feedback.showModal({
      tone: 'warning',
      title: 'Xác nhận xóa nhân viên',
      description: `Bạn có chắc chắn muốn xóa nhân viên "${staffName}" khỏi quán này? Quyền truy cập của nhân viên sẽ bị gỡ bỏ và tài khoản chuyển sang ngưng hoạt động.`,
      primaryLabel: 'Xóa nhân viên',
      secondaryLabel: 'Hủy',
      destructive: true,
      onPrimary: async () => {
        try {
          await apiClient(`/partner/staff/${staffId}?storeId=${activeStoreId}`, {
            method: 'DELETE',
          });
          feedback.showToast({
            tone: 'success',
            title: 'Thành công',
            description: 'Đã xóa quyền nhân viên khỏi quán.',
          });
          fetchStaffList(activeStoreId);
          feedback.closeModal();
        } catch (err: any) {
          feedback.showToast({
            tone: 'error',
            title: 'Lỗi xóa nhân viên',
            description: err.message || 'Không thể xóa nhân viên.',
          });
        }
      },
      onSecondary: () => {
        feedback.closeModal();
      },
    });
  };

  const colors = {
    surface2: 'var(--partner-surface-2, rgba(255,255,255,.04))',
    surface3: 'var(--partner-surface-3, rgba(255,255,255,.05))',
    borderSoft: 'var(--partner-border-soft, rgba(255,255,255,.06))',
    borderGold12: 'var(--partner-border-gold-12, rgba(212,178,106,.18))',
    borderGold22: 'var(--partner-border-gold-22, rgba(212,178,106,.22))',
    borderGold32: 'var(--partner-border-gold-32, rgba(212,178,106,.32))',
    text: 'var(--partner-text, #f3f0ea)',
    text2: 'var(--partner-text-2, #c5c0b6)',
    muted: 'var(--partner-muted, #8c8679)',
    gold: 'var(--partner-gold, #d4b26a)',
    goldBright: 'var(--partner-gold-bright, #e3c27e)',
    goldGrad: 'var(--partner-gold-grad, linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a))',
    danger: 'var(--partner-danger, #ffb4a8)',
    success: 'var(--partner-success, #8de6b0)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1px solid ${colors.borderGold22}`,
    background: 'rgba(0,0,0,.3)',
    color: colors.text,
    fontSize: '13.5px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  if (currentUser?.role === 'STAFF') {
    return (
      <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,180,168,.1)', border: `1px solid ${colors.danger}`, color: colors.danger }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800, fontSize: '16px' }}>
          <AlertTriangle size={22} /> Truy cập bị từ chối (403 Forbidden)
        </div>
        <div style={{ marginTop: '8px', fontSize: '13px', color: colors.text }}>
          Chỉ tài khoản đối tác chủ sở hữu (PARTNER) mới có quyền truy cập trang quản lý nhân viên.
        </div>
        <Link href="/partner" style={{ display: 'inline-block', marginTop: '16px', color: colors.goldBright, fontWeight: 700, textDecoration: 'none' }}>
          &larr; Quay lại trang chủ đối tác
        </Link>
      </div>
    );
  }

  const selectedStoreObj = stores.find((s) => s.id === activeStoreId);

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Header Back Button & Store Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: colors.surface2, padding: '14px 18px', borderRadius: '14px', border: `1px solid ${colors.borderGold12}` }}>
        <Link
          href="/partner/settings"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: colors.goldBright, fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}
        >
          <ArrowLeft size={16} /> Quay lại Cài đặt
        </Link>

        {stores.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: colors.gold }}>Chọn quán quản lý:</span>
            <div style={{ minWidth: '220px' }}>
              <ThemedListingSelect
                value={activeStoreId}
                onChange={(val) => {
                  setStaffStoreId(val);
                  setSelectedStoreId(val);
                }}
                placeholder="Chọn quán..."
                options={stores.map((s) => ({ value: s.id, label: s.name }))}
                compact
              />
            </div>
          </div>
        )}
      </div>

      {/* Form thêm nhân viên mới */}
      <div style={{ background: colors.surface2, borderRadius: '16px', border: `1px solid ${colors.borderGold22}`, padding: '24px', display: 'grid', gap: '18px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: colors.goldBright, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Thêm nhân viên mới cho quán "{selectedStoreObj?.name || 'Đã chọn'}"
        </h2>

        <form onSubmit={handleAddStaff} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Họ tên nhân viên</label>
            <input
              type="text"
              value={staffDisplayName}
              onChange={(e) => setStaffDisplayName(e.target.value)}
              placeholder="Nguyễn Văn A"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Email đăng nhập</label>
            <input
              type="email"
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
              placeholder="staff@example.com"
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Mật khẩu (Tối thiểu 8 ký tự)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showStaffPassword ? 'text' : 'password'}
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                style={{ ...inputStyle, paddingRight: '40px' }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowStaffPassword(!showStaffPassword)}
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
                {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Quyền hạn cấp cho Staff</label>
            <div style={{ display: 'flex', gap: '16px', minHeight: '42px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: colors.text }}>
                <input
                  type="checkbox"
                  checked={staffPermissions.includes('coupon.scan')}
                  onChange={(e) => {
                    if (e.target.checked) setStaffPermissions((prev) => [...prev, 'coupon.scan']);
                    else setStaffPermissions((prev) => prev.filter((p) => p !== 'coupon.scan'));
                  }}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: colors.gold }}
                />
                Quét coupon
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: colors.text }}>
                <input
                  type="checkbox"
                  checked={staffPermissions.includes('checkin.confirm')}
                  onChange={(e) => {
                    if (e.target.checked) setStaffPermissions((prev) => [...prev, 'checkin.confirm']);
                    else setStaffPermissions((prev) => prev.filter((p) => p !== 'checkin.confirm'));
                  }}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: colors.gold }}
                />
                Xác nhận check-in
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAddingStaff}
            style={{
              height: '42px',
              padding: '0 20px',
              borderRadius: '10px',
              border: 0,
              background: colors.goldGrad,
              color: '#241a0a',
              fontWeight: 900,
              fontSize: '13.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} />
            {isAddingStaff ? 'Đang thêm...' : 'Thêm nhân viên'}
          </button>
        </form>
      </div>

      {/* Danh sách nhân viên */}
      <div style={{ background: colors.surface2, borderRadius: '16px', border: `1px solid ${colors.borderGold22}`, padding: '24px', display: 'grid', gap: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: colors.text, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={18} color={colors.gold} />
          Danh sách nhân viên tại quán ({staffList.length})
        </h2>

        <div style={{ overflowX: 'auto', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: colors.surface3, borderBottom: `1px solid ${colors.borderSoft}`, color: colors.text2, fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Họ tên</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Quán quản lý</th>
                <th style={{ padding: '12px 16px' }}>Quyền hạn</th>
                <th style={{ padding: '12px 16px' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingStaff ? (
                <TableLoadingRows columns={6} rows={4} ariaLabel="Đang tải danh sách nhân viên" />
              ) : staffList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: colors.muted }}>
                    Chưa có nhân viên nào được phân quyền tại quán này.
                  </td>
                </tr>
              ) : (
                staffList.map((staff) => (
                  <tr key={staff.id} style={{ borderBottom: `1px solid ${colors.borderSoft}`, color: colors.text }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>{staff.displayName}</td>
                    <td style={{ padding: '12px 16px' }}>{staff.email}</td>
                    <td style={{ padding: '12px 16px' }}>{selectedStoreObj?.name || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', color: colors.text2 }}>
                      {(staff.permissions || ['coupon.scan', 'checkin.confirm']).join(', ')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: staff.status === 'ACTIVE' ? 'rgba(141,230,176,.12)' : 'rgba(255,180,168,.12)',
                          color: staff.status === 'ACTIVE' ? colors.success : colors.danger,
                        }}
                      >
                        {staff.status === 'ACTIVE' ? 'Hoạt động' : 'Ngưng hoạt động'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleDeleteStaff(staff.id, staff.displayName)}
                        style={{
                          background: 'transparent',
                          border: 0,
                          color: colors.danger,
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 800,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          outline: 'none',
                        }}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
