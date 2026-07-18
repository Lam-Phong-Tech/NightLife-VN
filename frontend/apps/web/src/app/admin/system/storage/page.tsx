"use client";

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';
import { getAuthUser } from '@/lib/auth/session';
import { useRouter } from 'next/navigation';
import { DataSkeleton } from '@/components/ui/DataLoading';

export default function VpsStorageConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [limit, setLimit] = useState<number>(50);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();
    if (user?.role !== 'SUPER_ADMIN') {
      router.push('/admin');
      return;
    }

    const fetchConfig = async () => {
      try {
        const res = await apiClient<{ data: { limit: number } }>('/admin/system-config/storage');
        if (res?.data?.limit) {
          setLimit(res.data.limit);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Lỗi tải cấu hình');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      await apiClient('/admin/system-config/storage', {
        method: 'PUT',
        data: { value: { limit } },
      });
      setSuccessMsg('Cập nhật giới hạn VPS Storage thành công!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <DataSkeleton variant="form" count={3} ariaLabel="Đang tải cấu hình lưu trữ" style={{ padding: '24px' }} />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto', color: '#f3f0ea' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', color: '#d4b26a' }}>
        Cấu hình VPS Storage
      </h1>

      <div style={{ background: '#1c1b22', padding: '24px', borderRadius: '12px', border: '1px solid rgba(212,178,106,0.1)' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#c5c0b6' }}>
            Giới hạn dung lượng tối đa (GB)
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 14px',
              background: '#2a2833',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '15px'
            }}
          />
          <p style={{ fontSize: '13px', color: '#8c8679', marginTop: '8px' }}>
            Thông số này dùng để cảnh báo khi dung lượng VPS vượt ngưỡng cho phép.
          </p>
        </div>

        {successMsg && (
          <div style={{ padding: '12px', background: 'rgba(76, 175, 80, 0.1)', color: '#4caf50', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '12px', background: 'rgba(244, 67, 54, 0.1)', color: '#f44336', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {errorMsg}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: 'linear-gradient(135deg, #d4b26a, #c19b52)',
            color: '#121117',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>
    </div>
  );
}
