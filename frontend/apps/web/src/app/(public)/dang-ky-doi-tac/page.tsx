"use client";

import Link from 'next/link';
import {
  BadgeCheck,
  BarChart3,
  Camera,
  ChevronDown,
  Crown,
  FileClock,
  Home,
  LockKeyhole,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  UsersRound,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { ApiError, apiClient } from '@/lib/api/client';

const colors = {
  bg: '#0c0c0f',
  bezel: '#000000',
  surface1: 'rgba(255,255,255,.035)',
  surface2: 'rgba(255,255,255,.04)',
  surface3: 'rgba(255,255,255,.05)',
  navBg: 'rgba(8,8,11,.9)',
  borderSoft: 'rgba(255,255,255,.06)',
  borderHair: 'rgba(255,255,255,.08)',
  borderGold12: 'rgba(212,178,106,.18)',
  borderGold22: 'rgba(212,178,106,.22)',
  borderGold32: 'rgba(212,178,106,.32)',
  borderGold40: 'rgba(212,178,106,.4)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  tertiary: '#9b958a',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldBright: '#e3c27e',
  goldPale: '#f0dda8',
  neonPink: '#e0729e',
  red: '#e68798',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
};

const fieldFontFamily = 'Inter, "Segoe UI", Arial, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';

const heroImage =
  'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80';

const benefits = [
  {
    icon: UsersRound,
    title: 'Tiếp cận khách mục tiêu',
    desc: 'Khách Nhật và khách cao cấp tìm quán, cast, ưu đãi mỗi tối.',
  },
  {
    icon: QrCode,
    title: 'Tài khoản đối tác riêng',
    desc: 'Tự quét mã, đối soát dịch vụ và theo dõi hiệu quả của quán.',
  },
  {
    icon: BarChart3,
    title: 'Hiển thị nổi bật',
    desc: 'Gói tài trợ giúp quán xuất hiện tốt hơn trong đề xuất và ranking.',
  },
];

const portalItems = [
  { icon: TicketCheck, label: 'Quét mã QR', detail: 'Xác nhận coupon tại quán' },
  { icon: BarChart3, label: 'Dashboard', detail: 'Đặt chỗ, lượt xem, khách đến' },
  { icon: FileClock, label: 'Đối soát', detail: 'Lọc hôm nay, 7 ngày, 30 ngày' },
  { icon: Camera, label: 'Đăng thông tin', detail: 'Chờ Admin duyệt trước khi công khai' },
];

type PartnerFormState = {
  businessName: string;
  businessType: string;
  area: string;
  storeName: string;
  storeCategory: string;
  storeDescription: string;
  storeAddress: string;
  storeCity: string;
  storeDistrict: string;
  openingHours: string;
  menuSummary: string;
  mediaUrls: string;
  castProfiles: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  note: string;
};

type PartnerRequestResponse = {
  id: string;
  status: string;
  draft?: {
    storeId: string;
    storeName: string;
    storeSlug: string;
    castCount: number;
    mediaCount: number;
    contentCount: number;
  };
};

type AddressOption = {
  code: number;
  name: string;
};

const initialPartnerForm: PartnerFormState = {
  businessName: '',
  businessType: '',
  area: '',
  storeName: '',
  storeCategory: '',
  storeDescription: '',
  storeAddress: '',
  storeCity: '',
  storeDistrict: '',
  openingHours: '',
  menuSummary: '',
  mediaUrls: '',
  castProfiles: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  note: '',
};

const bottomNav = [
  { href: '/', label: 'Trang chủ', icon: Home },
  { href: '/danh-sach-cast', label: 'Cast', icon: UsersRound },
  { href: '/uu-dai', label: 'Ưu đãi', icon: TicketCheck },
  { href: '/lich-su-dat-cho', label: 'Đặt chỗ', icon: FileClock },
  { href: '/tai-khoan', label: 'Tài khoản', icon: LockKeyhole },
];

function SectionTitle({ title, en }: { title: string; en: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
      <div>
        <h2 style={{ margin: 0, color: colors.text, fontSize: '21px', fontWeight: 600, lineHeight: 1.15 }}>
          {title}
        </h2>
        <div style={{ marginTop: '4px', fontSize: '9px', fontWeight: 600, letterSpacing: '1.6px', color: colors.muted }}>
          {en}
        </div>
      </div>
      <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.45), transparent)' }} />
    </div>
  );
}

function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitComma(value?: string) {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalText(value: string) {
  const text = value.trim();
  return text || undefined;
}

function parseMoney(value?: string) {
  const normalized = (value ?? '').replace(/[^\d]/g, '');
  if (!normalized) return undefined;
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : undefined;
}

function parseCastProfiles(value: string) {
  return splitLines(value)
    .map((line) => {
      const [stageName, bio, tags, languages, hourlyRateVnd, mediaUrls] = line
        .split('|')
        .map((part) => part.trim());

      return {
        stageName,
        bio: optionalText(bio ?? ''),
        tags: splitComma(tags),
        languages: splitComma(languages),
        hourlyRateVnd: parseMoney(hourlyRateVnd),
        mediaUrls: splitComma(mediaUrls),
      };
    })
    .filter((profile) => profile.stageName);
}

function buildPartnerRequestPayload(
  form: PartnerFormState,
  address?: { provinceName?: string; wardName?: string },
) {
  const storeAddressParts = [form.storeAddress.trim(), address?.wardName, address?.provinceName].filter(Boolean);
  const area = form.area.trim() || [address?.wardName, address?.provinceName].filter(Boolean).join(' - ');

  return {
    businessName: form.businessName.trim(),
    businessType: optionalText(form.businessType),
    area: optionalText(area),
    storeName: form.businessName.trim(),
    storeCategory: optionalText(form.storeCategory),
    storeDescription: optionalText(form.storeDescription),
    storeAddress: optionalText(storeAddressParts.length > 0 ? storeAddressParts.join(', ') : form.storeAddress),
    storeCity: optionalText(address?.provinceName ?? form.storeCity),
    storeDistrict: optionalText(address?.wardName ?? form.storeDistrict),
    openingHours: optionalText(form.openingHours),
    menuSummary: optionalText(form.menuSummary),
    mediaUrls: splitLines(form.mediaUrls),
    castProfiles: parseCastProfiles(form.castProfiles),
    contactName: form.contactName.trim(),
    contactPhone: form.contactPhone.trim(),
    contactEmail: optionalText(form.contactEmail),
    note: optionalText(form.note),
  };
}

function inputStyle(tall = false): React.CSSProperties {
  return {
    width: '100%',
    minHeight: tall ? '72px' : '42px',
    border: `1px solid ${colors.borderGold22}`,
    borderRadius: '11px',
    padding: tall ? '10px 12px' : '10px 12px',
    color: colors.text,
    background: colors.surface2,
    fontFamily: fieldFontFamily,
    fontSize: '13px',
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: 1.45,
    outline: 'none',
    resize: tall ? 'vertical' : undefined,
  };
}

function FormControl({
  label,
  value,
  onChange,
  placeholder,
  required,
  wide,
  tall,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  wide?: boolean;
  tall?: boolean;
  type?: string;
}) {
  const id = label.replace(/\s+/g, '-').toLowerCase();
  const sharedProps = {
    id,
    value,
    autoComplete: 'off',
    autoCorrect: 'off',
    autoCapitalize: 'none',
    spellCheck: false,
    'data-form-type': 'other',
    'data-lpignore': 'true',
    'data-1p-ignore': 'true',
    'data-bwignore': 'true',
    onChange: (
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>,
    ) => onChange(event.target.value),
    placeholder,
    required,
    style: inputStyle(tall),
  };

  return (
    <div style={{ gridColumn: wide ? 'span 2' : undefined }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '11.5px',
          fontWeight: 600,
          color: colors.text2,
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      {tall ? (
        <textarea {...sharedProps} rows={3} />
      ) : (
        <input {...sharedProps} type={type} />
      )}
    </div>
  );
}

function SelectControl({
  label,
  value,
  onChange,
  placeholder,
  options,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: AddressOption[];
  required?: boolean;
  disabled?: boolean;
}) {
  const id = label.replace(/\s+/g, '-').toLowerCase();
  const selectedLabel = options.find((option) => option.code.toString() === value)?.name ?? '';

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          fontSize: '11.5px',
          fontWeight: 600,
          color: colors.text2,
          marginBottom: '6px',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <select
          id={id}
          value={value}
          required={required}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          style={{
            ...inputStyle(false),
            appearance: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
            paddingRight: '38px',
            opacity: disabled ? 0.62 : 1,
            fontFamily: fieldFontFamily,
            fontWeight: 400,
            letterSpacing: 0,
          }}
        >
          <option value="" style={{ color: colors.text, background: '#17161a' }}>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.code} value={option.code.toString()} style={{ color: colors.text, background: '#17161a' }}>
              {option.name}
            </option>
          ))}
        </select>
        <span
          style={{
            position: 'absolute',
            left: '12px',
            right: '36px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: selectedLabel ? colors.text2 : colors.muted,
            fontFamily: fieldFontFamily,
            fontSize: '13px',
            fontWeight: 400,
            letterSpacing: 0,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            pointerEvents: 'none',
          }}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={15}
          color={disabled ? colors.muted : colors.gold}
          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
        />
      </div>
    </div>
  );
}

function FormGroupTitle({ title, caption }: { title: string; caption?: string }) {
  return (
    <div style={{ gridColumn: '1 / -1', marginTop: '2px' }}>
      <div style={{ color: colors.goldBright, fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
        {title}
      </div>
      {caption ? (
        <div style={{ marginTop: '3px', color: colors.muted, fontSize: '11.5px', lineHeight: 1.45 }}>
          {caption}
        </div>
      ) : null}
    </div>
  );
}

function PartnerPageContent({ mode }: { mode: 'mobile' | 'desktop' }) {
  const isMobile = mode === 'mobile';
  const [form, setForm] = useState<PartnerFormState>(initialPartnerForm);
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);
  const selectedProvinceName = provinces.find((province) => province.code.toString() === selectedProvince)?.name ?? '';
  const selectedWardName = wards.find((ward) => ward.code.toString() === selectedWard)?.name ?? '';
  const canSubmit = useMemo(
    () =>
      Boolean(
        form.businessName.trim() &&
          form.storeAddress.trim() &&
          selectedProvince &&
          form.contactName.trim() &&
          form.contactPhone.trim(),
      ),
    [form.businessName, form.contactName, form.contactPhone, form.storeAddress, selectedProvince],
  );

  useEffect(() => {
    let isMounted = true;

    fetch('https://provinces.open-api.vn/api/v2/p/')
      .then((response) => response.json())
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setProvinces(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProvinces([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedProvince) {
      return;
    }

    let isMounted = true;

    fetch(`https://provinces.open-api.vn/api/v2/p/${selectedProvince}?depth=2`)
      .then((response) => response.json())
      .then((data) => {
        if (isMounted) {
          setWards(Array.isArray(data?.wards) ? data.wards : []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setWards([]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedProvince]);

  const updateForm = (field: keyof PartnerFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };
  const updateProvince = (value: string) => {
    const provinceName = provinces.find((province) => province.code.toString() === value)?.name ?? '';

    setSelectedProvince(value);
    setSelectedWard('');
    setWards([]);
    setForm((current) => ({
      ...current,
      storeCity: provinceName,
      storeDistrict: '',
      area: provinceName,
    }));
  };
  const updateWard = (value: string) => {
    const wardName = wards.find((ward) => ward.code.toString() === value)?.name ?? '';

    setSelectedWard(value);
    setForm((current) => ({
      ...current,
      storeDistrict: wardName,
      area: [wardName, selectedProvinceName].filter(Boolean).join(' - '),
    }));
  };
  const submitPartnerRequest = async () => {
    if (!canSubmit || submitting) {
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await apiClient<PartnerRequestResponse>(
        '/partner-requests',
        {
          data: buildPartnerRequestPayload(form, {
            provinceName: selectedProvinceName,
            wardName: selectedWardName,
          }),
        },
      );
      setSubmitResult({
        tone: 'success',
        message: `Đã gửi hồ sơ ${result.id}. Admin sẽ thấy trong CMS và duyệt trước khi public.`,
      });
      setForm(initialPartnerForm);
      setSelectedProvince('');
      setSelectedWard('');
      setWards([]);
    } catch (error) {
      setSubmitResult({
        tone: 'error',
        message:
          error instanceof ApiError
            ? String(error.message)
            : 'Chưa gửi được hồ sơ. Vui lòng thử lại.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        paddingBottom: isMobile ? '76px' : 0,
      }}
    >
      <div
        style={{
        maxWidth: isMobile ? 'none' : 'none',
        margin: '0 auto',
        padding: isMobile ? '0' : '0 34px 48px',
        }}
      >
        <section
          style={{
            display: isMobile ? 'block' : 'grid',
            gridTemplateColumns: isMobile ? undefined : 'minmax(0,0.92fr) minmax(520px,1.08fr)',
            gap: isMobile ? 0 : '22px',
            padding: isMobile ? '14px 16px 0' : '22px 0 0',
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              minHeight: isMobile ? '258px' : '560px',
              borderRadius: isMobile ? '18px' : '18px',
              overflow: 'hidden',
              border: `1px solid ${colors.borderGold22}`,
              background: `linear-gradient(180deg,rgba(12,12,15,.05),rgba(12,12,15,.86)), url(${heroImage}) center/cover`,
              boxShadow: '0 16px 34px -18px rgba(0,0,0,.7)',
              padding: isMobile ? '18px' : '28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
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
                backdropFilter: 'blur(4px)',
                color: colors.gold,
                fontSize: '9.5px',
                fontWeight: 700,
                letterSpacing: '1.5px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.neonPink }} />
              HỢP TÁC CÙNG VIETYORU
            </div>

            <div>
              <div style={{ color: colors.gold, fontSize: '10px', fontWeight: 700, letterSpacing: '1.8px', marginBottom: '10px' }}>
                PARTNER PORTAL
              </div>
              <h1
                style={{
                  maxWidth: isMobile ? '280px' : '420px',
                  margin: 0,
                  color: '#fff',
                  fontSize: isMobile ? '28px' : '42px',
                  lineHeight: 1.12,
                  fontWeight: 700,
                  textShadow: '0 2px 16px rgba(0,0,0,.4)',
                }}
              >
                Đưa quán của bạn đến đúng khách mỗi đêm
              </h1>
              <p
                style={{
                  maxWidth: isMobile ? '300px' : '430px',
                  margin: '13px 0 0',
                  color: colors.text2,
                  fontSize: isMobile ? '12.5px' : '13.5px',
                  lineHeight: 1.65,
                }}
              >
                Cổng đối tác giúp quán nhận đặt chỗ, quét mã ưu đãi, đối soát dịch vụ và gửi nội dung chờ Admin duyệt.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '18px' }}>
                <Link
                  href="#partner-form"
                  style={{
                    minHeight: '44px',
                    borderRadius: '11px',
                    padding: '0 18px',
                    background: colors.goldGrad,
                    color: colors.onGold,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  <Send size={16} />
                  Gửi đăng ký
                </Link>
                <Link
                  href="/dang-nhap-doi-tac?redirect=/partner"
                  style={{
                    minHeight: '44px',
                    borderRadius: '11px',
                    padding: '0 16px',
                    border: `1px solid ${colors.borderGold32}`,
                    color: colors.goldPale,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: 'rgba(12,12,15,.45)',
                  }}
                >
                  <LockKeyhole size={16} />
                  Đăng nhập đối tác
                </Link>
              </div>
            </div>
          </div>

          <div id="partner-form" style={{ marginTop: isMobile ? '18px' : 0 }}>
            <div
              style={{
                border: `1px solid ${colors.borderGold22}`,
                borderRadius: '16px',
                background: colors.surface1,
                boxShadow: '0 16px 34px -18px rgba(0,0,0,.7)',
                padding: isMobile ? '16px' : '20px',
              }}
            >
              <SectionTitle title="Đăng ký hợp tác" en="PARTNER APPLICATION" />
              <p style={{ margin: '0 0 14px', color: colors.text2, fontSize: '12.5px', lineHeight: 1.55 }}>
                Điền thông tin tối thiểu để Admin kiểm duyệt và liên hệ cấp tài khoản đối tác.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '11px',
                }}
              >
                <FormGroupTitle title="Thông tin quán" />
                <FormControl
                  label="Tên quán / cơ sở"
                  value={form.businessName}
                  onChange={(value) => updateForm('businessName', value)}
                  placeholder="Ví dụ: Club Lumière"
                  required
                />
                <FormControl
                  label="Loại hình kinh doanh"
                  value={form.businessType}
                  onChange={(value) => updateForm('businessType', value)}
                  placeholder="Bar / Lounge / KTV / Spa..."
                />
                <FormControl
                  label="Danh mục CMS"
                  value={form.storeCategory}
                  onChange={(value) => updateForm('storeCategory', value)}
                  placeholder="Ví dụ: CLUB, LOUNGE, KARAOKE"
                />

                <FormGroupTitle title="Địa chỉ" caption="Chọn tỉnh/thành phố rồi chọn phường/xã để Admin xác nhận địa chỉ nhanh hơn." />
                <SelectControl
                  label="Tỉnh/Thành phố"
                  value={selectedProvince}
                  onChange={updateProvince}
                  placeholder="Chọn tỉnh/thành phố"
                  options={provinces}
                  required
                />
                <SelectControl
                  label="Phường/Xã"
                  value={selectedWard}
                  onChange={updateWard}
                  placeholder={selectedProvince ? 'Chọn phường/xã' : 'Chọn tỉnh trước'}
                  options={wards}
                  disabled={!selectedProvince}
                />
                <FormControl
                  label="Số nhà, tên đường"
                  value={form.storeAddress}
                  onChange={(value) => updateForm('storeAddress', value)}
                  placeholder="Ví dụ: 12 Trần Phú"
                  required
                />
                <FormControl
                  label="Giờ mở cửa"
                  value={form.openingHours}
                  onChange={(value) => updateForm('openingHours', value)}
                  placeholder="Ví dụ: 18:00 - 02:00"
                />

                <FormGroupTitle title="Liên hệ" />
                <FormControl
                  label="Người liên hệ"
                  value={form.contactName}
                  onChange={(value) => updateForm('contactName', value)}
                  placeholder="Họ và tên"
                  required
                />
                <FormControl
                  label="Số điện thoại / Telegram"
                  value={form.contactPhone}
                  onChange={(value) => updateForm('contactPhone', value)}
                  placeholder="Ví dụ: 0912 345 678"
                  required
                />
                <FormControl
                  label="Email liên hệ"
                  value={form.contactEmail}
                  onChange={(value) => updateForm('contactEmail', value)}
                  placeholder="Ví dụ: owner@example.com"
                  type="email"
                  wide={!isMobile}
                />

                <FormGroupTitle title="Bổ sung" caption="Menu, cast và album có thể cập nhật chi tiết sau khi được duyệt." />
                <FormControl
                  label="Mô tả quán"
                  value={form.storeDescription}
                  onChange={(value) => updateForm('storeDescription', value)}
                  placeholder="Không gian, dịch vụ nổi bật, nhóm khách phù hợp..."
                  tall
                  wide={!isMobile}
                />
                <FormControl
                  label="Link ảnh / video quán"
                  value={form.mediaUrls}
                  onChange={(value) => updateForm('mediaUrls', value)}
                  placeholder="Mỗi link một dòng: https://..."
                  tall
                  wide={!isMobile}
                />
                <FormControl
                  label="Ghi chú cho Admin"
                  value={form.note}
                  onChange={(value) => updateForm('note', value)}
                  placeholder="Thời gian gọi lại, yêu cầu riêng..."
                  tall
                  wide={!isMobile}
                />
              </div>

              <div
                style={{
                  marginTop: '14px',
                  border: `1px solid ${colors.borderGold22}`,
                  borderRadius: '12px',
                  background: 'rgba(212,178,106,.08)',
                  color: colors.text2,
                  padding: '11px 13px',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  fontSize: '11.5px',
                  lineHeight: 1.55,
                }}
              >
                <ShieldCheck size={17} color={colors.gold} style={{ flex: 'none', marginTop: '1px' }} />
                Không yêu cầu giấy phép kinh doanh khi gửi đăng ký. Nội dung chỉ hiển thị công khai sau khi Admin duyệt.
              </div>

              {submitResult ? (
                <div
                  style={{
                    marginTop: '12px',
                    border: `1px solid ${submitResult.tone === 'success' ? 'rgba(127,211,160,.36)' : 'rgba(230,135,152,.4)'}`,
                    borderRadius: '12px',
                    background:
                      submitResult.tone === 'success'
                        ? 'rgba(127,211,160,.12)'
                        : 'rgba(230,135,152,.1)',
                    color: submitResult.tone === 'success' ? '#a9e7be' : colors.red,
                    padding: '11px 13px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                  }}
                >
                  {submitResult.message}
                </div>
              ) : null}

              <button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={() => {
                  void submitPartnerRequest();
                }}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  marginTop: '14px',
                  border: 0,
                  borderRadius: '11px',
                  background: !canSubmit || submitting ? 'rgba(212,178,106,.34)' : colors.goldGrad,
                  color: colors.onGold,
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={16} />
                Gửi đăng ký hợp tác
              </button>
              <div style={{ marginTop: '9px', color: colors.muted, fontSize: '11px', textAlign: 'center' }}>
                Yêu cầu sẽ gửi tới Admin qua Telegram để kiểm duyệt.
              </div>
            </div>
          </div>
        </section>

        {!isMobile ? (
          <>
            <section style={{ padding: '28px 0 0' }}>
              <SectionTitle title="Quyền lợi đối tác" en="PARTNER BENEFITS" />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3,1fr)',
                  gap: '13px',
                }}
              >
                {benefits.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      style={{
                        border: `1px solid ${colors.borderGold12}`,
                        borderRadius: '16px',
                        background: colors.surface1,
                        padding: '14px',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <span
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '15px',
                          border: `1px solid ${colors.borderGold12}`,
                          background: colors.surface2,
                          color: colors.gold,
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: 'none',
                        }}
                      >
                        <Icon size={22} />
                      </span>
                      <span>
                        <span style={{ display: 'block', color: colors.text, fontSize: '14px', fontWeight: 600 }}>{item.title}</span>
                        <span style={{ display: 'block', marginTop: '4px', color: colors.muted, fontSize: '12px', lineHeight: 1.55 }}>
                          {item.desc}
                        </span>
                      </span>
                    </article>
                  );
                })}
              </div>
            </section>

            <section style={{ padding: '28px 0 0' }}>
              <SectionTitle title="Cổng quản lý" en="PORTAL MODULES" />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4,1fr)',
                  gap: '12px',
                }}
              >
                {portalItems.map((item, index) => {
                  const Icon = item.icon;
                  const featured = index === 0;
                  return (
                    <article
                      key={item.label}
                      style={{
                        border: `1px solid ${featured ? colors.borderGold40 : colors.borderSoft}`,
                        borderRadius: '16px',
                        background: featured
                          ? 'linear-gradient(135deg,rgba(212,178,106,.14),rgba(255,255,255,.03))'
                          : colors.surface1,
                        padding: '15px',
                        minHeight: '142px',
                      }}
                    >
                      <Icon size={22} color={featured ? colors.goldBright : colors.gold} />
                      <div style={{ marginTop: '12px', color: colors.text, fontSize: '13.5px', fontWeight: 600 }}>{item.label}</div>
                      <div style={{ marginTop: '5px', color: colors.muted, fontSize: '11.5px', lineHeight: 1.5 }}>{item.detail}</div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section style={{ padding: '28px 0 44px' }}>
              <div
                style={{
                  borderRadius: '18px',
                  background: colors.goldGrad,
                  color: colors.onGold,
                  boxShadow: '0 16px 34px -16px rgba(168,124,60,.6)',
                  padding: '22px 24px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '24px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: '-36px',
                    top: '-58px',
                    width: '170px',
                    height: '170px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle,rgba(255,255,255,.45),transparent 70%)',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', fontSize: '15px', fontWeight: 800 }}>
                    <Crown size={20} />
                    Đối tác nổi bật
                  </div>
                  <p style={{ margin: '8px 0 0', maxWidth: '620px', fontSize: '12.5px', lineHeight: 1.6, opacity: .86 }}>
                    Quán đạt hiệu quả tốt có thể nâng lên gói hiển thị VIP, xuất hiện trong đề xuất tối nay và bảng xếp hạng theo khu vực.
                  </p>
                </div>
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    minHeight: '44px',
                    borderRadius: '11px',
                    background: colors.onGold,
                    color: colors.goldPale,
                    padding: '0 16px',
                    fontSize: '13px',
                    fontWeight: 800,
                  }}
                >
                  <Sparkles size={16} />
                  Tư vấn gói VIP
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>

      {isMobile ? (
        <nav
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            height: '66px',
            background: colors.navBg,
            borderTop: `1px solid ${colors.borderGold12}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(5,1fr)',
            alignItems: 'center',
            paddingBottom: '6px',
            backdropFilter: 'blur(16px)',
            zIndex: 20,
          }}
        >
          {bottomNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  color: item.href === '/' ? colors.goldBright : '#6f6b62',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  fontSize: '9.5px',
                  fontWeight: item.href === '/' ? 600 : 500,
                }}
              >
                <Icon size={21} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      ) : (
        <footer style={{ borderTop: `1px solid ${colors.borderGold12}`, color: colors.muted, padding: '24px 34px', fontSize: '12px' }}>
          <div style={{ maxWidth: 'none', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
            <span>© 2026 Vietyoru · Partner Portal</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <BadgeCheck size={15} color={colors.gold} />
              Chỉ công khai nội dung sau khi Admin duyệt
            </span>
          </div>
        </footer>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <React.Fragment>
      <div className="block md:hidden">
        <PartnerPageContent mode="mobile" />
      </div>
      <div className="hidden md:block">
        <PartnerPageContent mode="desktop" />
      </div>
    </React.Fragment>
  );
}
