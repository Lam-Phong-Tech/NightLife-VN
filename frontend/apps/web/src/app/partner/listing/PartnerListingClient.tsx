'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { Eye, Save, Send, Plus, Trash2, CheckCircle2, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { usePartnerStoreScope } from '../PartnerProviders';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';
import { ThemedListingSelect } from '@/components/ui/ThemedListingSelect';
import { validateStoreName, validateVietnamStorePhone } from '@/lib/store-form-validation';

const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: '158px',
        borderRadius: '12px',
        border: '1px solid var(--partner-border-hair, rgba(255,255,255,.08))',
        background: 'var(--partner-surface-2, rgba(255,255,255,.04))',
        color: 'var(--partner-muted, #8c8679)',
        display: 'grid',
        placeItems: 'center',
        fontSize: '13px',
        fontWeight: 700,
      }}
    >
      Đang tải Editor...
    </div>
  ),
});

type PartnerListingDraft = {
  id?: string;
  storeId?: string;
  name: string;
  phone: string;
  address: string;
  description: string;
  openingHours: string;
  status?: string;
  [key: string]: any;
};

const defaultListingDraft: PartnerListingDraft = {
  name: '',
  phone: '',
  address: '',
  description: '',
  openingHours: '',
};

export default function PartnerListingClient() {
  const { stores, selectedStoreId, setSelectedStoreId, isStaffAccount } = usePartnerStoreScope();
  const feedback = useSystemFeedback();

  const [isViewingLive, setIsViewingLive] = useState<boolean>(false);
  const [liveData, setLiveData] = useState<PartnerListingDraft | null>(null);
  const [draftState, setDraftState] = useState<PartnerListingDraft>(defaultListingDraft);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const activeStoreId = selectedStoreId || stores[0]?.id || '';
  const currentData = isViewingLive && liveData ? liveData : draftState;

  const fetchListingData = useCallback(async (storeId: string) => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const res = await apiClient<{ draft?: PartnerListingDraft; live?: PartnerListingDraft }>(
        `/partner/listing/draft?storeId=${storeId}`,
      ).catch(() => null);

      if (res) {
        if (res.draft) setDraftState(res.draft);
        if (res.live) setLiveData(res.live);
      }
    } catch {
      // Keep existing draft state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeStoreId) {
      fetchListingData(activeStoreId);
    }
  }, [activeStoreId, fetchListingData]);

  const handleSaveDraft = async () => {
    if (isViewingLive || isStaffAccount) return;

    const nameErr = validateStoreName(draftState.name);
    const phoneErr = validateVietnamStorePhone(draftState.phone);
    if (nameErr || phoneErr) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi thông tin',
        description: nameErr || phoneErr || 'Vui lòng kiểm tra lại thông tin nhập.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await apiClient('/partner/listing/draft', {
        method: 'POST',
        data: {
          ...draftState,
          storeId: activeStoreId,
        },
      });
      feedback.showToast({
        tone: 'success',
        title: 'Thành công',
        description: 'Đã lưu bản nháp thông tin cơ sở.',
      });
    } catch (err: any) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi lưu nháp',
        description: err.message || 'Không thể lưu bản nháp.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitReview = async () => {
    if (isViewingLive || isStaffAccount) return;
    setIsSaving(true);
    try {
      await apiClient('/partner/listing/submit', {
        method: 'POST',
        data: { storeId: activeStoreId },
      });
      feedback.showToast({
        tone: 'success',
        title: 'Đã gửi duyệt',
        description: 'Đã gửi hồ sơ thông tin quán lên Admin xét duyệt thành công.',
      });
      fetchListingData(activeStoreId);
    } catch (err: any) {
      feedback.showToast({
        tone: 'error',
        title: 'Lỗi gửi duyệt',
        description: err.message || 'Không thể gửi duyệt hồ sơ.',
      });
    } finally {
      setIsSaving(false);
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
    padding: '10px 14px',
    borderRadius: '10px',
    border: `1px solid ${colors.borderGold22}`,
    background: 'rgba(0,0,0,.3)',
    color: colors.text,
    fontSize: '13.5px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Top Bar with Store Selector & Toggle Live Switch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: colors.surface2, padding: '14px 18px', borderRadius: '14px', border: `1px solid ${colors.borderGold12}` }}>
        {stores.length > 1 ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: colors.gold }}>Chọn quán:</span>
            <div style={{ minWidth: '220px' }}>
              <ThemedListingSelect
                value={activeStoreId}
                onChange={setSelectedStoreId}
                placeholder="Chọn quán..."
                options={stores.map((s) => ({ value: s.id, label: s.name }))}
                compact
              />
            </div>
          </div>
        ) : (
          <div style={{ fontSize: '15px', fontWeight: 800, color: colors.goldBright }}>
            {stores[0]?.name || 'Cơ sở kinh doanh'}
          </div>
        )}

        {/* Toggle Switch Go Live vs Draft */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,.3)', padding: '4px', borderRadius: '10px', border: `1px solid ${colors.borderGold22}` }}>
          <button
            type="button"
            onClick={() => setIsViewingLive(false)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 0,
              background: !isViewingLive ? colors.goldGrad : 'transparent',
              color: !isViewingLive ? '#241a0a' : colors.text2,
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Bản chỉnh sửa
          </button>
          <button
            type="button"
            onClick={() => setIsViewingLive(true)}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 0,
              background: isViewingLive ? colors.goldGrad : 'transparent',
              color: isViewingLive ? '#241a0a' : colors.text2,
              fontWeight: 800,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Eye size={14} /> Bản đang Go Live
          </button>
        </div>
      </div>

      {/* Main Listing Form */}
      <div style={{ background: colors.surface2, borderRadius: '16px', border: `1px solid ${colors.borderGold22}`, padding: '24px', display: 'grid', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: colors.text, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color={colors.gold} />
            {isViewingLive ? 'Thông tin quán đang hiển thị thực tế (Go Live)' : 'Chỉnh sửa thông tin cơ sở kinh doanh'}
          </h2>
          {isViewingLive && (
            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 800, background: 'rgba(141,230,176,.15)', color: colors.goldBright, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} /> Chế độ chỉ xem
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Tên quán</label>
            <input
              type="text"
              disabled={isViewingLive || isStaffAccount}
              value={currentData.name}
              onChange={(e) => setDraftState((prev) => ({ ...prev, name: e.target.value }))}
              style={{ ...inputStyle, opacity: isViewingLive ? 0.7 : 1 }}
              placeholder="Nhập tên thương hiệu quán..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Số điện thoại liên hệ</label>
            <input
              type="text"
              disabled={isViewingLive || isStaffAccount}
              value={currentData.phone}
              onChange={(e) => setDraftState((prev) => ({ ...prev, phone: e.target.value }))}
              style={{ ...inputStyle, opacity: isViewingLive ? 0.7 : 1 }}
              placeholder="Hotline đặt bàn (Ví dụ: 0901234567)"
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Địa chỉ đầy đủ</label>
          <input
            type="text"
            disabled={isViewingLive || isStaffAccount}
            value={currentData.address}
            onChange={(e) => setDraftState((prev) => ({ ...prev, address: e.target.value }))}
            style={{ ...inputStyle, opacity: isViewingLive ? 0.7 : 1 }}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Giờ mở cửa</label>
          <input
            type="text"
            disabled={isViewingLive || isStaffAccount}
            value={currentData.openingHours}
            onChange={(e) => setDraftState((prev) => ({ ...prev, openingHours: e.target.value }))}
            style={{ ...inputStyle, opacity: isViewingLive ? 0.7 : 1 }}
            placeholder="Ví dụ: 19:00 - 04:00 (Hàng ngày)"
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: colors.text2, marginBottom: '6px' }}>Mô tả chi tiết không gian & dịch vụ</label>
          {isViewingLive ? (
            <div
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: `1px solid ${colors.borderGold22}`,
                background: 'rgba(0,0,0,.2)',
                minHeight: '120px',
                color: colors.text,
                fontSize: '13.5px',
              }}
              dangerouslySetInnerHTML={{ __html: currentData.description || 'Chưa có mô tả' }}
            />
          ) : (
            <ReactQuill
              value={draftState.description}
              onChange={(content) => setDraftState((prev) => ({ ...prev, description: content }))}
              theme="snow"
            />
          )}
        </div>

        {!isViewingLive && !isStaffAccount && (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: `1px solid ${colors.borderGold32}`,
                background: colors.surface2,
                color: colors.goldBright,
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Save size={16} /> Lưu bản nháp
            </button>
            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={isSaving}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 0,
                background: colors.goldGrad,
                color: '#241a0a',
                fontWeight: 900,
                fontSize: '13.5px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Send size={16} /> Gửi duyệt lên Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
