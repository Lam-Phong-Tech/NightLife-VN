"use client";

import Link from 'next/link';
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Camera,
  ChevronDown,
  Crown,
  FileClock,
  Home,
  ImagePlus,
  LockKeyhole,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  UsersRound,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fields = [
  { label: 'Tên quán / cơ sở', value: 'VD: Club Lumiere', wide: true },
  { label: 'Loại hình', value: 'Bar / Lounge', select: true },
  { label: 'Khu vực', value: 'Ha Noi', select: true },
  { label: 'Người liên hệ', value: 'Họ tên' },
  { label: 'SĐT / Telegram', value: '0912 345 678' },
  { label: 'Giới thiệu ngắn', value: 'Mô tả quán, dịch vụ nổi bật, khung giờ đông khách...', wide: true, tall: true },
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

const initialPartnerForm: PartnerFormState = {
  businessName: '',
  businessType: 'Club / Lounge',
  area: 'Ha Noi - Tay Ho',
  storeName: '',
  storeCategory: 'LOUNGE',
  storeDescription: '',
  storeAddress: '',
  storeCity: 'Ha Noi',
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Field({
  label,
  value,
  select,
  tall,
}: {
  label: string;
  value: string;
  select?: boolean;
  tall?: boolean;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: colors.text2, marginBottom: '6px' }}>
        {label}
      </label>
      <div
        style={{
          minHeight: tall ? '78px' : '44px',
          border: `1px solid ${colors.borderGold22}`,
          borderRadius: '11px',
          padding: '12px 13px',
          color: value.startsWith('VD') || value.startsWith('Họ') || value.startsWith('Mô') ? colors.muted : colors.text,
          background: colors.surface2,
          fontSize: '13px',
          lineHeight: 1.45,
          display: 'flex',
          alignItems: tall ? 'flex-start' : 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>{value}</span>
        {select ? <ChevronDown size={15} color={colors.gold} /> : null}
      </div>
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

function buildPartnerRequestPayload(form: PartnerFormState) {
  return {
    businessName: form.businessName.trim(),
    businessType: optionalText(form.businessType),
    area: optionalText(form.area),
    storeName: optionalText(form.storeName),
    storeCategory: optionalText(form.storeCategory),
    storeDescription: optionalText(form.storeDescription),
    storeAddress: optionalText(form.storeAddress),
    storeCity: optionalText(form.storeCity),
    storeDistrict: optionalText(form.storeDistrict),
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
    minHeight: tall ? '86px' : '44px',
    border: `1px solid ${colors.borderGold22}`,
    borderRadius: '11px',
    padding: '12px 13px',
    color: colors.text,
    background: colors.surface2,
    fontSize: '13px',
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
        <textarea {...sharedProps} rows={4} />
      ) : (
        <input {...sharedProps} type={type} />
      )}
    </div>
  );
}

function PartnerPageContent({ mode }: { mode: 'mobile' | 'desktop' }) {
  const isMobile = mode === 'mobile';
  const [form, setForm] = useState<PartnerFormState>(initialPartnerForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);
  const canSubmit = useMemo(
    () =>
      Boolean(
        form.businessName.trim() &&
          form.contactName.trim() &&
          form.contactPhone.trim(),
      ),
    [form.businessName, form.contactName, form.contactPhone],
  );
  const updateForm = (field: keyof PartnerFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
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
          data: buildPartnerRequestPayload(form),
        },
      );
      setSubmitResult({
        tone: 'success',
        message: `Da gui ho so ${result.id}. Admin se thay trong CMS va duyet truoc khi public.`,
      });
      setForm(initialPartnerForm);
    } catch (error) {
      setSubmitResult({
        tone: 'error',
        message:
          error instanceof ApiError
            ? String(error.message)
            : 'Chua gui duoc ho so. Vui long thu lai.',
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
        <header
          style={{
            minHeight: isMobile ? '78px' : '82px',
            padding: isMobile ? '13px 22px 12px' : '18px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? '12px' : '0',
            borderBottom: `1px solid ${colors.borderGold12}`,
            background: colors.bg,
            position: isMobile ? 'sticky' : 'static',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '34px' }}>
            {isMobile ? (
              <Link
                href="/"
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
            {!isMobile ? (
              <nav style={{ display: 'flex', gap: '22px', fontSize: '13px', color: colors.text2, fontWeight: 500 }}>
                <Link href="/" className="lk">Trang chủ</Link>
                <Link href="/danh-sach-quan" className="lk">Tìm quán</Link>
                <Link href="/danh-sach-cast" className="lk">Cast</Link>
                <Link href="/xep-hang" className="lk">Bảng xếp hạng</Link>
                <Link href="/blog" className="lk">Blog</Link>
              </nav>
            ) : null}
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
              className="lk"
              style={{ fontSize: isMobile ? '12px' : '13px', color: colors.text2, fontWeight: 600, whiteSpace: 'nowrap' }}
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

        <section
          style={{
            display: isMobile ? 'block' : 'grid',
            gridTemplateColumns: isMobile ? undefined : 'minmax(0,1.12fr) minmax(500px,.88fr)',
            gap: isMobile ? 0 : '28px',
            padding: isMobile ? '18px 18px 0' : '32px 0 0',
            alignItems: 'stretch',
            minHeight: isMobile ? undefined : 'calc(100vh - 114px)',
          }}
        >
          <div
            style={{
              minHeight: isMobile ? '360px' : 'calc(100vh - 146px)',
              borderRadius: isMobile ? '18px' : '18px',
              overflow: 'hidden',
              border: `1px solid ${colors.borderGold22}`,
              background: `linear-gradient(180deg,rgba(12,12,15,.05),rgba(12,12,15,.86)), url(${heroImage}) center/cover`,
              boxShadow: '0 16px 34px -18px rgba(0,0,0,.7)',
              padding: isMobile ? '22px' : '34px',
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
                padding: isMobile ? '18px' : '24px',
              }}
            >
              <SectionTitle title="Đăng ký hợp tác" en="PARTNER APPLICATION" />
              <p style={{ margin: '0 0 18px', color: colors.text2, fontSize: '12.5px', lineHeight: 1.65 }}>
                Gửi thông tin cơ bản. Admin sẽ liên hệ, kiểm duyệt và cấp tài khoản đối tác khi hồ sơ phù hợp.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '13px',
                }}
              >
                <FormControl
                  label="Ten quan / co so"
                  value={form.businessName}
                  onChange={(value) => updateForm('businessName', value)}
                  placeholder="VD: Club Lumiere"
                  required
                  wide={!isMobile}
                />
                <FormControl
                  label="Ten hien thi public"
                  value={form.storeName}
                  onChange={(value) => updateForm('storeName', value)}
                  placeholder="Neu khac ten phap ly"
                />
                <FormControl
                  label="Loai hinh"
                  value={form.businessType}
                  onChange={(value) => updateForm('businessType', value)}
                  placeholder="Bar / Lounge / KTV"
                />
                <FormControl
                  label="Category CMS"
                  value={form.storeCategory}
                  onChange={(value) => updateForm('storeCategory', value)}
                  placeholder="BAR, CLUB, LOUNGE..."
                />
                <FormControl
                  label="Khu vuc"
                  value={form.area}
                  onChange={(value) => updateForm('area', value)}
                  placeholder="Ha Noi - Tay Ho"
                />
                <FormControl
                  label="Thanh pho"
                  value={form.storeCity}
                  onChange={(value) => updateForm('storeCity', value)}
                  placeholder="Ha Noi"
                />
                <FormControl
                  label="Dia chi"
                  value={form.storeAddress}
                  onChange={(value) => updateForm('storeAddress', value)}
                  placeholder="So nha, ten duong"
                  wide={!isMobile}
                />
                <FormControl
                  label="Quan / huyen"
                  value={form.storeDistrict}
                  onChange={(value) => updateForm('storeDistrict', value)}
                  placeholder="Tay Ho"
                />
                <FormControl
                  label="Gio mo cua"
                  value={form.openingHours}
                  onChange={(value) => updateForm('openingHours', value)}
                  placeholder="18:00 - 02:00"
                />
                <FormControl
                  label="Nguoi lien he"
                  value={form.contactName}
                  onChange={(value) => updateForm('contactName', value)}
                  placeholder="Ho ten"
                  required
                />
                <FormControl
                  label="SDT / Telegram"
                  value={form.contactPhone}
                  onChange={(value) => updateForm('contactPhone', value)}
                  placeholder="0912 345 678"
                  required
                />
                <FormControl
                  label="Email"
                  value={form.contactEmail}
                  onChange={(value) => updateForm('contactEmail', value)}
                  placeholder="owner@example.com"
                  type="email"
                  wide={!isMobile}
                />
                <FormControl
                  label="Mo ta quan"
                  value={form.storeDescription}
                  onChange={(value) => updateForm('storeDescription', value)}
                  placeholder="Khong gian, dich vu noi bat, khung gio dong khach..."
                  tall
                  wide={!isMobile}
                />
                <FormControl
                  label="Menu / bang gia"
                  value={form.menuSummary}
                  onChange={(value) => updateForm('menuSummary', value)}
                  placeholder="Moi goi, combo hoac bang gia mot dong."
                  tall
                  wide={!isMobile}
                />
                <FormControl
                  label="Cast gui kem"
                  value={form.castProfiles}
                  onChange={(value) => updateForm('castProfiles', value)}
                  placeholder="Moi dong: Ten | Bio | tags | ngon ngu | gia/gio | link1, link2"
                  tall
                  wide={!isMobile}
                />
                <FormControl
                  label="Ghi chu cho Admin"
                  value={form.note}
                  onChange={(value) => updateForm('note', value)}
                  placeholder="Thoi gian goi lai, yeu cau rieng..."
                  tall
                  wide={!isMobile}
                />

                <FormControl
                  label="Link anh / video quan"
                  value={form.mediaUrls}
                  onChange={(value) => updateForm('mediaUrls', value)}
                  placeholder="Moi link mot dong: https://..."
                  tall
                  wide={!isMobile}
                />

                <div style={{ gridColumn: !isMobile ? 'span 2' : undefined }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: colors.text2, marginBottom: '6px' }}>
                    Hình ảnh quán <span style={{ color: colors.muted, fontWeight: 500 }}>(tuỳ chọn)</span>
                  </label>
                  <div
                    style={{
                      minHeight: '92px',
                      border: `1.5px dashed ${colors.borderGold40}`,
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg,rgba(244,227,180,.08),rgba(255,255,255,.03))',
                      color: colors.gold,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      textAlign: 'center',
                    }}
                  >
                    <ImagePlus size={25} />
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>Tải ảnh / video lên</span>
                  </div>
                </div>
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

        <section style={{ padding: isMobile ? '22px 18px 0' : '28px 0 0' }}>
          <SectionTitle title="Quyền lợi đối tác" en="PARTNER BENEFITS" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)',
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

        <section style={{ padding: isMobile ? '22px 18px 0' : '28px 0 0' }}>
          <SectionTitle title="Cổng quản lý" en="PORTAL MODULES" />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)',
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
                    padding: isMobile ? '13px' : '15px',
                    minHeight: isMobile ? '128px' : '142px',
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

        <section style={{ padding: isMobile ? '22px 18px 26px' : '28px 0 44px' }}>
          <div
            style={{
              borderRadius: '18px',
              background: colors.goldGrad,
              color: colors.onGold,
              boxShadow: '0 16px 34px -16px rgba(168,124,60,.6)',
              padding: isMobile ? '18px' : '22px 24px',
              position: 'relative',
              overflow: 'hidden',
              display: isMobile ? 'block' : 'flex',
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
                marginTop: isMobile ? '14px' : 0,
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
