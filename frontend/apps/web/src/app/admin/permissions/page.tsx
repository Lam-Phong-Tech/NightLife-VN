"use client";

import React, { useState, useEffect, useSyncExternalStore, useMemo } from 'react';
import { authSessionChangeEvent, getAuthUser } from '@/lib/auth/session';
import { apiClient } from '@/lib/api/client';

const colors = {
  bg: '#0c0c0f',
  surface1: 'rgba(255,255,255,.02)',
  borderSoft: 'rgba(255,255,255,.06)',
  borderSoft2: 'rgba(255,255,255,.04)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldGrad: 'linear-gradient(135deg,#f0dda8,#d4b26a)'
};

const Toggle = ({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) => (
  <div
    onClick={disabled ? undefined : onClick}
    title={disabled ? 'Không thể thay đổi cấu hình cho role này' : undefined}
    style={{
      width: 28,
      height: 16,
      borderRadius: 8,
      background: on ? (disabled ? 'rgba(212,178,106,.35)' : 'rgba(212,178,106,.8)') : (disabled ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.1)'),
      position: 'relative',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.45 : 1,
      margin: '0 auto',
      transition: 'all 0.2s',
    }}
  >
    <div
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: on ? (disabled ? '#4a3e28' : '#241a0a') : '#5c5850',
        position: 'absolute',
        top: 2,
        left: on ? 14 : 2,
        transition: 'all 0.2s',
      }}
    />
  </div>
);

const subscribeToAuthRole = (onStoreChange: () => void) => {
  window.addEventListener(authSessionChangeEvent, onStoreChange);
  return () => window.removeEventListener(authSessionChangeEvent, onStoreChange);
};

const getCurrentAuthRole = () => getAuthUser()?.role ?? null;
const getServerAuthRole = () => null;

type Role = { key: string, name: string, level: number };
type Permission = { key: string, name: string, description?: string };
type MatrixData = {
  roles: Role[];
  permissions: Permission[];
  assignments: Record<string, string[]>;
  version: number;
};

const CATEGORIES = [
  { prefix: 'booking.', label: 'Booking & Hỗ trợ' },
  { prefix: 'store.', label: 'Quán & Chính sách' },
  { prefix: 'coupon.', label: 'Ưu đãi & QR' },
  { prefix: 'checkin.', label: 'Ưu đãi & QR' },
  { prefix: 'bill.', label: 'Hóa đơn & Tài chính' },
  { prefix: 'report.', label: 'Báo cáo' },
  { prefix: 'ranking.', label: 'Xếp hạng' },
  { prefix: 'cast.', label: 'Cast' },
  { prefix: 'system.', label: 'Hệ thống' },
  { prefix: 'partner.', label: 'Đối tác' },
  { prefix: 'content.', label: 'Nội dung' },
  { prefix: 'media.', label: 'Media' },
];

function getCategory(key: string) {
  for (const cat of CATEGORIES) {
    if (key.startsWith(cat.prefix)) return cat.label;
  }
  return 'Khác';
}

export default function AdminPermissionsPage() {
  const currentRole = useSyncExternalStore(
    subscribeToAuthRole,
    getCurrentAuthRole,
    getServerAuthRole,
  );

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const isAdmin = currentRole === 'ADMIN';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [matrixData, setMatrixData] = useState<MatrixData | null>(null);
  const [localAssignments, setLocalAssignments] = useState<Record<string, string[]>>({});
  const [dirtyRoles, setDirtyRoles] = useState<Set<string>>(new Set());
  
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMatrix = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient<MatrixData>('/admin/rbac/matrix');
      setMatrixData(data);
      setLocalAssignments(JSON.parse(JSON.stringify(data.assignments)));
      setDirtyRoles(new Set());
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu phân quyền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole !== 'OPERATOR') {
      fetchMatrix();
    }
  }, [currentRole]);

  const handleToggle = (roleKey: string, permKey: string) => {
    setLocalAssignments(prev => {
      const next = { ...prev };
      const rolePerms = next[roleKey] || [];
      if (rolePerms.includes(permKey)) {
        next[roleKey] = rolePerms.filter(k => k !== permKey);
      } else {
        next[roleKey] = [...rolePerms, permKey];
      }
      return next;
    });
    setDirtyRoles(prev => new Set(prev).add(roleKey));
  };

  const handleSaveColumn = async (roleKey: string) => {
    if (!matrixData) return;
    try {
      const permissionKeys = localAssignments[roleKey] || [];
      const res = await apiClient<{ roleKey: string, permissionCount: number, version: number }>(`/admin/rbac/roles/${roleKey}/permissions`, {
        method: 'PUT',
        data: { permissionKeys, version: matrixData.version }
      });
      setMatrixData(prev => prev ? { ...prev, version: res.version } : null);
      setDirtyRoles(prev => {
        const next = new Set(prev);
        next.delete(roleKey);
        return next;
      });
      showToast('Đã lưu phân quyền', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu phân quyền', 'error');
    }
  };

  const visibleRoles = useMemo(() => {
    if (!matrixData) return [];
    let roles = matrixData.roles.filter(r => !['user', 'partner', 'staff'].includes(r.key));
    if (!isSuperAdmin) {
      roles = roles.filter(r => r.key === 'operator');
    }
    return roles.sort((a, b) => b.level - a.level);
  }, [matrixData, isSuperAdmin]);

  const groupedPermissions = useMemo(() => {
    if (!matrixData) return {};
    const groups: Record<string, Permission[]> = {};
    matrixData.permissions.forEach(p => {
      const cat = getCategory(p.key);
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [matrixData]);

  if (currentRole === 'OPERATOR') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ff4d4f' }}>
        <h2>403 - Bạn không có quyền truy cập trang này</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: colors.text2 }}>
        Đang tải cấu hình phân quyền...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#ff4d4f' }}>
        <p>{error}</p>
        <button onClick={fetchMatrix} style={{ marginTop: '10px', padding: '8px 16px', background: colors.gold, color: colors.onGold, border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Thử lại
        </button>
      </div>
    );
  }

  const matrixGridCols = `minmax(250px, 1fr) repeat(${visibleRoles.length}, 130px)`;

  return (
    <div style={{ padding: '22px 26px 44px', minHeight: '100%', overflowY: 'auto', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '20px', color: colors.text2, fontSize: '13px' }}>
        Nhân viên quán (Staff) được phân quyền riêng theo từng cửa hàng, không qua ma trận này.
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '18px', fontWeight: 600, color: '#f3f0ea' }}>Bảng phân quyền chi tiết (Matrix)</span>
        <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.4), transparent)' }}></span>
      </div>
      
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden', marginBottom: '30px' }}>
        
        {/* Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: matrixGridCols, gap: '10px', padding: '16px 20px', borderBottom: `1px solid ${colors.borderSoft}`, background: 'rgba(255,255,255,.02)', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.8px', color: '#8c8679', textTransform: 'uppercase' }}>Chức năng</span>
          {visibleRoles.map(role => {
            const canEdit = isSuperAdmin || (isAdmin && role.key === 'operator');
            const isDirty = dirtyRoles.has(role.key);
            return (
              <div key={role.key} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: canEdit ? '#e3c27e' : '#c5c0b6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {role.name}
                  {isDirty && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffc107', display: 'inline-block' }} title="Có thay đổi chưa lưu" />}
                </span>
                {canEdit && (
                  <button 
                    onClick={() => handleSaveColumn(role.key)}
                    disabled={!isDirty}
                    style={{ 
                      padding: '4px 12px', 
                      fontSize: '11px',
                      background: isDirty ? colors.gold : 'rgba(255,255,255,0.1)', 
                      color: isDirty ? colors.onGold : colors.text2, 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: isDirty ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s'
                    }}
                  >
                    Lưu
                  </button>
                )}
              </div>
            );
          })}
        </div>
        
        {Object.entries(groupedPermissions).map(([category, perms], index) => (
          <React.Fragment key={category}>
            <div style={{ padding: '12px 20px 10px', background: 'rgba(212,178,106,.04)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.1px', color: '#caa765', textTransform: 'uppercase', marginTop: index > 0 ? '1px' : '0' }}>
              {index + 1}. {category}
            </div>
            {perms.map((p) => (
              <div key={p.key} style={{ display: 'grid', gridTemplateColumns: matrixGridCols, gap: '10px', padding: '12px 20px', borderBottom: `1px solid ${colors.borderSoft2}`, alignItems: 'center' }}>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '13px', color: '#f3f0ea' }}>{p.name}</span>
                  {p.description && <span style={{ display: 'block', fontSize: '11px', color: colors.muted, marginTop: '2px' }}>{p.description}</span>}
                </span>
                {visibleRoles.map(role => {
                  const canEdit = isSuperAdmin || (isAdmin && role.key === 'operator');
                  const rolePerms = localAssignments[role.key] || [];
                  const isOn = rolePerms.includes(p.key);
                  return (
                    <Toggle 
                      key={`${role.key}-${p.key}`} 
                      on={isOn} 
                      onClick={() => handleToggle(role.key, p.key)} 
                      disabled={!canEdit} 
                    />
                  );
                })}
              </div>
            ))}
          </React.Fragment>
        ))}

      </div>

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: 90, display: 'flex', alignItems: 'center', gap: '10px', background: '#17161c', border: `1px solid ${toast.type === 'success' ? 'rgba(127,211,162,0.3)' : 'rgba(255,77,79,0.3)'}`, color: '#f3f0ea', fontSize: '13.5px', fontWeight: 500, padding: '13px 22px', borderRadius: '12px', boxShadow: '0 20px 44px -18px rgba(0,0,0,.85)' }}>
          {toast.type === 'success' ? (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7fd3a2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          )}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
