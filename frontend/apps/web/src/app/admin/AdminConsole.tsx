"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  Handshake,
  Home,
  LogOut,
  MessageCircle,
  Newspaper,
  Pencil,
  Plus,
  ReceiptText,
  RefreshCcw,
  Save,
  Search,
  ShieldCheck,
  Star,
  Store,
  TicketPercent,
  Trash2,
  Trophy,
  UsersRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  adminRankingsApi,
  type AdminRankingConfig,
  type AdminRankingTargetOption,
} from "@/lib/api/admin-rankings";
import {
  bookingApi,
  type BookingCancelAnalytics,
  type BookingChangeRequest,
  type BookingChatMessage,
} from "@/lib/api/bookings";
import { ApiError, apiClient } from "@/lib/api/client";
import {
  contentApi,
  type CmsContentItem,
  type CmsContentStatus,
  type CmsContentType,
} from "@/lib/api/content";
import type { RankingCategory, RankingCity, RankingTargetType } from "@/lib/api/rankings";
import { clearAuthSession } from "@/lib/auth/session";
import { logoutBrowserProfile } from "@/lib/api/auth";
import { useSocket } from "@/components/providers/SocketProvider";

const colors = {
  bg: "#0c0c0f",
  shell: "#101013",
  navBg: "rgba(8,8,11,.94)",
  surface1: "rgba(255,255,255,.035)",
  surface2: "rgba(255,255,255,.048)",
  surface3: "rgba(255,255,255,.07)",
  borderSoft: "rgba(255,255,255,.06)",
  borderHair: "rgba(255,255,255,.08)",
  borderGold12: "rgba(212,178,106,.18)",
  borderGold22: "rgba(212,178,106,.22)",
  borderGold32: "rgba(212,178,106,.32)",
  borderGold40: "rgba(212,178,106,.4)",
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  onGold: "#241a0a",
  gold: "#d4b26a",
  goldBright: "#e3c27e",
  goldPale: "#f0dda8",
  neonPink: "#e0729e",
  green: "#7fd3a0",
  amber: "#e7b76d",
  red: "#e68798",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const ENABLE_REVENUE_EXPORT = process.env.NEXT_PUBLIC_ENABLE_REVENUE_EXPORT === "true";
const ENABLE_REVENUE_BI = process.env.NEXT_PUBLIC_ENABLE_REVENUE_BI === "true";

type AdminView =
  | "dashboard"
  | "booking"
  | "bill"
  | "partners"
  | "stores"
  | "cast"
  | "campaign"
  | "blog"
  | "ranking"
  | "reports"
  | "membership";

type AdminStore = {
  id: string;
  name: string;
  slug?: string;
  status: string;
};

type AdminCast = {
  id: string;
  stageName: string;
  storeId?: string | null;
  status: string;
  isPublic?: boolean | null;
  birthMonth?: number | null;
  zodiacSign?: string | null;
  tags?: string[];
  languages?: string[];
  store?: { id?: string; name: string } | null;
};

type AdminBooking = {
  id: string;
  status: string;
  scheduledAt: string;
  partySize: number;
  store: { id?: string; name: string; slug?: string };
  coupon?: { id: string; code: string; name: string } | null;
  couponIssue?: { id: string; code: string; status: string } | null;
  user?: { displayName: string | null } | null;
  guest?: { displayName: string | null; phone: string | null } | null;
};

type AdminBookingRow = {
  id: string;
  guest: string;
  place: string;
  people: string;
  time: string;
  status: string;
  focused: boolean;
  canCancel: boolean;
  booking: AdminBooking | null;
};

type SensitiveBill = {
  id: string;
  billNumber: string | null;
  status: string;
  submitterType?: "MEMBER" | "PARTNER" | string | null;
  subtotalVnd?: number | null;
  discountVnd?: number | null;
  serviceChargeVnd?: number | null;
  taxVnd?: number | null;
  grossRevenueVnd?: number | null;
  netRevenueVnd?: number | null;
  payableVnd?: number | null;
  totalVnd: number | null;
  paidVnd: number | null;
  commissionAmountVnd: number | null;
  pointsEarned: number | null;
  discountRuleSnapshot?: Record<string, unknown> | null;
  commissionRuleSnapshot?: Record<string, unknown> | null;
  pointRuleSnapshot?: Record<string, unknown> | null;
  submittedAt: string | null;
  usedAt?: string | null;
  store: { id?: string; name: string; slug?: string };
  booking?: { id: string; status: string; scheduledAt?: string | null } | null;
  coupon?: { id: string; code: string; name: string } | null;
  couponIssue?: { id: string; code: string; status: string } | null;
  user?: { email: string; displayName: string | null; phone: string | null } | null;
  guest?: { email: string | null; displayName: string | null; phone: string | null } | null;
  media?: Array<{
    id: string;
    originalName: string;
    storageKey: string;
    mimeType: string;
    access: "PUBLIC" | "PROTECTED" | string;
    url: string;
  }>;
  fraudWarnings?: Array<{
    code: string;
    severity: "LOW" | "MEDIUM" | "HIGH" | string;
    message: string;
    evidence?: Record<string, unknown>;
  }>;
};

type RevenueReportTotals = {
  billCount: number;
  grossVnd: number;
  discountVnd: number;
  netVnd: number;
  payableVnd: number;
  commissionVnd: number;
};

type RevenueReportCoupon = RevenueReportTotals & {
  coupon: { id: string | null; code: string; name: string };
  bills?: RevenueReportBill[];
};

type RevenueReportBill = RevenueReportTotals & {
  id: string;
  billNumber: string | null;
  status: string;
  usedAt: string;
};

type RevenueReportStore = RevenueReportTotals & {
  store: { id: string; name: string; slug: string | null };
  coupons: RevenueReportCoupon[];
};

type RevenueReportDay = RevenueReportTotals & {
  date: string;
  stores: RevenueReportStore[];
};

type RevenueReportDimension = RevenueReportTotals & {
  id: string | null;
  code: string;
  name: string;
  secondary: string | null;
};

type RevenueReportFunnelStep = {
  key: string;
  label: string;
  count: number;
  rateFromPrevious: number | null;
  commissionVnd?: number;
};

type RevenueReportComparisonMetric = {
  current: number;
  previous: number;
  delta: number;
  deltaPercent: number | null;
};

type RevenueReport = {
  filters: {
    from: string;
    to: string;
    fromDate?: string;
    toDate?: string;
    timezone?: string;
    dateField: "usedAt";
    statusIn: string[];
    billStatusIncluded?: string[];
    storeId: string | null;
    couponId: string | null;
    flag?: string | null;
    partnerAccountId?: string | null;
    areaId?: string | null;
    castId?: string | null;
    exportEnabled: boolean;
    exportFormats?: string[];
  };
  meta?: {
    billStatusIncluded: string[];
    timezone: string;
    generatedAt: string;
    exportEnabled: boolean;
    exportFormats: string[];
    formula?: {
      grossVnd: string;
      discountVnd: string;
      netVnd: string;
      payableVnd?: string;
      commissionVnd: string;
    };
  };
  totals: RevenueReportTotals;
  days: RevenueReportDay[];
  breakdowns?: {
    stores?: RevenueReportDimension[];
    partners: RevenueReportDimension[];
    campaigns: RevenueReportDimension[];
    coupons?: RevenueReportDimension[];
    areas: RevenueReportDimension[];
    casts: RevenueReportDimension[];
  };
  funnel?: RevenueReportFunnelStep[];
  comparison?: {
    previousPeriod: { from: string; to: string; fromDate: string; toDate: string };
    totals: Record<keyof RevenueReportTotals, RevenueReportComparisonMetric>;
  };
};

type BillApprovalPreview = {
  preview: {
    nextStatus: string;
    requiresPmBaConfirmation: boolean;
    pmBaConfirmationReason?: string | null;
    flags: string[];
    grossRevenueVnd: number;
    discountVnd: number;
    netRevenueVnd: number;
    payableVnd: number;
    commissionAmountVnd: number;
    loyaltyPoints: number;
    loyaltyExpiresAt?: string | null;
  };
};

type AdminPartnerRequest = {
  id: string;
  notificationId: string | null;
  notificationStatus: string | null;
  notificationError: string | null;
  notifiedAt: string | null;
  submittedAt: string;
  status: string;
  reviewReason: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  partnerUserId: string | null;
  partnerAccountId: string | null;
  publicState: string | null;
  draftStoreId: string | null;
  draftStoreName: string | null;
  draftStoreSlug: string | null;
  draftStoreCategory?: string | null;
  draftStoreAddress?: string | null;
  draftStoreMenuSummary?: string | null;
  draftStoreMediaUrls?: string[];
  draftCastCount: number;
  draftMediaCount: number;
  draftContentCount: number;
  businessName: string;
  businessType: string | null;
  area: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  note: string | null;
  storeDescription: string | null;
  storeAddress: string | null;
  storeCity: string | null;
  storeDistrict: string | null;
  mapUrl: string | null;
  openingHours: string | null;
  menuSummary: string | null;
  mediaUrls: string[];
  originalStore: {
    id: string;
    name: string;
    slug: string;
    status: string;
    category: string;
    description: string | null;
    address: string | null;
    city: string;
    district: string | null;
    phone: string | null;
    openingHours: any;
    pricingInfo: any;
    tags: string[];
    media: { url: string }[];
    mapUrl: string | null;
  } | null;
};

type AdminCouponIssue = {
  id: string;
  code: string;
  status: string;
  statusLabel?: string;
  qrPayloadHash?: string | null;
  discountPercent?: number | null;
  discountRuleSnapshot?: Record<string, unknown> | null;
  campaignSnapshot?: Record<string, unknown> | null;
  auditLogs?: AdminCouponIssueAuditLog[];
  expiresAt?: string | null;
  usedAt?: string | null;
  revokedAt?: string | null;
  createdAt?: string | null;
  userType?: string | null;
  user?: { id: string; displayName?: string | null; tier?: string | null } | null;
  guest?: { id: string; displayName?: string | null } | null;
  scannedBy?: { id: string; displayName?: string | null } | null;
  booking?: { id: string; status: string; scheduledAt?: string | null } | null;
  bill?: { id: string; billNumber?: string | null; status: string; totalVnd?: number | null } | null;
  coupon: {
    id: string;
    code: string;
    name: string;
    store?: { id: string; name: string; slug: string } | null;
  };
};

type AdminCouponIssueAuditLog = {
  id: string;
  action: string;
  actorId?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  beforeJson?: Record<string, unknown> | null;
  afterJson?: Record<string, unknown> | null;
  createdAt?: string | null;
  actor?: { id: string; displayName?: string | null; role?: string | null } | null;
};

type AdminCounts = {
  booking: number;
  bill: number;
  partners: number;
  stores: number;
  cast: number;
  ranking: number;
  blog: number;
  campaign: number;
};

type AdminNavItem = {
  view: AdminView;
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: keyof AdminCounts;
};

type RankingFormState = {
  targetType: RankingTargetType;
  targetId: string;
  cityCode: RankingCity;
  category: "all" | RankingCategory;
  scope: string;
  pinRank: string;
  manualScore: string;
  sponsored: boolean;
  status: "ACTIVE" | "PAUSED" | "EXPIRED";
  startsAt: string;
  endsAt: string;
};

type ContentFormState = {
  type: CmsContentType;
  title: string;
  slug: string;
  status: Exclude<CmsContentStatus, "DELETED">;
  excerpt: string;
  body: string;
  publishedAt: string;
  noindex: boolean;
  category: string;
  tags: string;
  image: string;
  imageAlt: string;
};

type BillFilterState = {
  bookingId: string;
  couponId: string;
  couponIssueId: string;
};

type RevenueReportFilterState = {
  from: string;
  to: string;
  flag: string;
  storeId: string;
  couponId: string;
  quickRange: "today" | "seven" | "thirty" | "month" | "custom";
};

type PartnerRequestFilterState = {
  status: string;
  keyword: string;
  page: string;
  limit: string;
};

const defaultPartnerRequestFilters: PartnerRequestFilterState = {
  status: "all",
  keyword: "",
  page: "1",
  limit: "50",
};

const emptyRevenueReportTotals: RevenueReportTotals = {
  billCount: 0,
  grossVnd: 0,
  discountVnd: 0,
  netVnd: 0,
  payableVnd: 0,
  commissionVnd: 0,
};

const emptyRevenueReport: RevenueReport = {
  filters: {
    from: "",
    to: "",
    fromDate: "",
    toDate: "",
    timezone: "Asia/Ho_Chi_Minh",
    dateField: "usedAt",
    statusIn: ["VERIFIED", "PAID"],
    billStatusIncluded: ["VERIFIED", "PAID"],
    storeId: null,
    couponId: null,
    flag: null,
    partnerAccountId: null,
    areaId: null,
    castId: null,
    exportEnabled: false,
    exportFormats: [],
  },
  meta: {
    billStatusIncluded: ["VERIFIED", "PAID"],
    timezone: "Asia/Ho_Chi_Minh",
    generatedAt: "",
    exportEnabled: false,
    exportFormats: [],
    formula: {
      grossVnd: "subtotalVnd",
      discountVnd: "discountVnd",
      netVnd: "subtotalVnd - discountVnd",
      payableVnd: "netVnd + serviceChargeVnd + taxVnd",
      commissionVnd: "commissionAmountVnd",
    },
  },
  totals: emptyRevenueReportTotals,
  days: [],
  breakdowns: {
    stores: [],
    partners: [],
    campaigns: [],
    coupons: [],
    areas: [],
    casts: [],
  },
  funnel: [],
  comparison: undefined,
};

const normalizeRevenueReport = (value: unknown): RevenueReport => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return emptyRevenueReport;
  const report = value as Partial<RevenueReport>;

  return {
    filters: { ...emptyRevenueReport.filters, ...(report.filters ?? {}) },
    meta: {
      billStatusIncluded: report.meta?.billStatusIncluded ?? emptyRevenueReport.meta!.billStatusIncluded,
      timezone: report.meta?.timezone ?? emptyRevenueReport.meta!.timezone,
      generatedAt: report.meta?.generatedAt ?? emptyRevenueReport.meta!.generatedAt,
      exportEnabled: report.meta?.exportEnabled ?? emptyRevenueReport.meta!.exportEnabled,
      exportFormats: report.meta?.exportFormats ?? emptyRevenueReport.meta!.exportFormats,
      formula: report.meta?.formula ?? emptyRevenueReport.meta!.formula,
    },
    totals: { ...emptyRevenueReportTotals, ...(report.totals ?? {}) },
    days: Array.isArray(report.days) ? report.days : [],
    breakdowns: {
      stores: Array.isArray(report.breakdowns?.stores) ? report.breakdowns.stores : [],
      partners: Array.isArray(report.breakdowns?.partners) ? report.breakdowns.partners : [],
      campaigns: Array.isArray(report.breakdowns?.campaigns) ? report.breakdowns.campaigns : [],
      coupons: Array.isArray(report.breakdowns?.coupons) ? report.breakdowns.coupons : [],
      areas: Array.isArray(report.breakdowns?.areas) ? report.breakdowns.areas : [],
      casts: Array.isArray(report.breakdowns?.casts) ? report.breakdowns.casts : [],
    },
    funnel: Array.isArray(report.funnel) ? report.funnel : [],
    comparison: report.comparison,
  };
};

const normalizeAdminCastList = (value: unknown): AdminCast[] => {
  if (Array.isArray(value)) return value as AdminCast[];
  if (!value || typeof value !== "object") return [];

  const payload = value as { data?: unknown; items?: unknown };
  if (Array.isArray(payload.data)) return payload.data as AdminCast[];
  if (Array.isArray(payload.items)) return payload.items as AdminCast[];

  if (payload.data && typeof payload.data === "object") {
    const nested = payload.data as { data?: unknown; items?: unknown };
    if (Array.isArray(nested.data)) return nested.data as AdminCast[];
    if (Array.isArray(nested.items)) return nested.items as AdminCast[];
  }

  return [];
};

const sectionToView: Record<string, AdminView> = {
  dashboard: "dashboard",
  tongquan: "dashboard",
  "tong-quan": "dashboard",
  booking: "booking",
  "dat-cho": "booking",
  bill: "bill",
  "hoa-don": "bill",
  "duyet-hoa-don": "bill",
  "doi-tac": "partners",
  partners: "partners",
  partner: "partners",
  quan: "stores",
  stores: "stores",
  store: "stores",
  cast: "cast",
  campaign: "campaign",
  "uu-dai": "campaign",
  blog: "blog",
  content: "blog",
  ranking: "ranking",
  "xep-hang": "ranking",
  "bao-cao": "reports",
  reports: "reports",
  membership: "membership",
  member: "membership",
};

const navGroups: Array<{ title: string; items: AdminNavItem[] }> = [
  {
    title: "Vận hành",
    items: [
      { view: "dashboard", href: "/admin", icon: Home, label: "Tổng quan" },
      { view: "booking", href: "/admin/booking", icon: CalendarCheck, label: "Đặt chỗ", badge: "booking" },
      { view: "bill", href: "/admin/bill", icon: ReceiptText, label: "Duyệt hóa đơn", badge: "bill" },
      { view: "partners", href: "/admin/doi-tac", icon: Handshake, label: "Duyệt đối tác", badge: "partners" },
    ],
  },
  {
    title: "Nội dung",
    items: [
      { view: "stores", href: "/admin/quan", icon: Building2, label: "Quán / Địa điểm", badge: "stores" },
      { view: "cast", href: "/admin/cast", icon: UsersRound, label: "Cast", badge: "cast" },
      { view: "campaign", href: "/admin/campaign", icon: TicketPercent, label: "Campaign / Ưu đãi", badge: "campaign" },
      { view: "blog", href: "/admin/blog", icon: Newspaper, label: "Blog / Nội dung", badge: "blog" },
      { view: "ranking", href: "/admin/ranking", icon: Trophy, label: "Xếp hạng thủ công", badge: "ranking" },
    ],
  },
  {
    title: "Phân tích",
    items: [
      { view: "reports", href: "/admin/bao-cao", icon: BarChart3, label: "Báo cáo doanh thu" },
      { view: "membership", href: "/admin/membership", icon: Star, label: "Membership & điểm" },
    ],
  },
];

const pageMeta: Record<AdminView, { title: string; subtitle: string; eyebrow: string }> = {
  dashboard: {
    title: "Tổng quan",
    subtitle: "Bức tranh vận hành toàn hệ thống",
    eyebrow: "ADMIN OVERVIEW",
  },
  booking: {
    title: "Đặt chỗ",
    subtitle: "Quản lý, điều phối và xử lý yêu cầu đổi lịch",
    eyebrow: "BOOKING OPS",
  },
  bill: {
    title: "Duyệt hóa đơn",
    subtitle: "Xác minh chứng từ, ưu đãi và doanh thu nhạy cảm",
    eyebrow: "BILL REVIEW",
  },
  partners: {
    title: "Duyệt đối tác",
    subtitle: "Hồ sơ đăng ký hợp tác và trạng thái thông báo",
    eyebrow: "PARTNER REVIEW",
  },
  stores: {
    title: "Quán / Địa điểm",
    subtitle: "Danh mục quán đang vận hành trên hệ thống",
    eyebrow: "STORE CMS",
  },
  cast: {
    title: "Cast",
    subtitle: "Hồ sơ cast theo quán và trạng thái hiển thị",
    eyebrow: "CAST CMS",
  },
  campaign: {
    title: "Campaign / Ưu đãi",
    subtitle: "Vòng đời mã ưu đãi, coupon issue và chiến dịch",
    eyebrow: "CAMPAIGN CMS",
  },
  blog: {
    title: "Blog / Nội dung",
    subtitle: "Soạn, xuất bản và lưu trữ nội dung CMS",
    eyebrow: "CONTENT CMS",
  },
  ranking: {
    title: "Xếp hạng thủ công",
    subtitle: "Ghim cast/quán và điều chỉnh điểm xếp hạng",
    eyebrow: "RANKING CONTROL",
  },
  reports: {
    title: "Báo cáo doanh thu",
    subtitle: "Doanh thu, hoa hồng, giảm giá và tỷ lệ hủy",
    eyebrow: "REVENUE REPORT",
  },
  membership: {
    title: "Membership & điểm",
    subtitle: "Tổng quan hội viên, hạng và quy tắc điểm",
    eyebrow: "MEMBER OPS",
  },
};

const rankingCityOptions: Array<{ value: RankingCity; label: string }> = [
  { value: "all", label: "Tổng hợp" },
  { value: "hn", label: "Hà Nội" },
  { value: "hcm", label: "TP.HCM" },
];

const rankingCategoryOptions: Array<{ value: "all" | RankingCategory; label: string }> = [
  { value: "all", label: "Tất cả loại hình" },
  { value: "bar", label: "Bar" },
  { value: "club", label: "Club" },
  { value: "lounge", label: "Lounge" },
  { value: "girls_bar", label: "Girls bar" },
  { value: "karaoke", label: "Karaoke" },
  { value: "massage_spa", label: "Massage/Spa" },
  { value: "restaurant", label: "Restaurant" },
  { value: "casino", label: "Casino" },
];

const defaultRankingForm: RankingFormState = {
  targetType: "CAST",
  targetId: "",
  cityCode: "all",
  category: "all",
  scope: "global",
  pinRank: "1",
  manualScore: "100",
  sponsored: false,
  status: "ACTIVE",
  startsAt: "",
  endsAt: "",
};

const defaultContentForm: ContentFormState = {
  type: "BLOG",
  title: "",
  slug: "",
  status: "DRAFT",
  excerpt: "",
  body: "",
  publishedAt: "",
  noindex: false,
  category: "",
  tags: "",
  image: "",
  imageAlt: "",
};

const sampleBookings: Array<[string, string, string, string, string]> = [
  ["Minh H.", "Club Lumiere", "4", "21:30", "Mới"],
  ["Yuki T.", "KTV Hoàng Gia · Michi", "2", "20:00", "Hoàn tất"],
  ["Tuấn A.", "Sakura Lounge", "6", "22:00", "Mới"],
  ["Kenji M.", "Roppongi Night", "3", "23:00", "Đã hủy"],
];

const sampleMembers = [
  ["Nguyễn Văn A", "VIP", "12.480", "31/12/2026"],
  ["Trần Thị B", "Member", "3.240", "30/06/2026"],
  ["Lê Minh C", "VIP", "9.870", "31/12/2026"],
  ["Hoàng Nam E", "Guest", "0", "-"],
  ["Đỗ Hải F", "Member", "5.120", "30/09/2026"],
];

const sampleCampaigns = [
  ["Happy Hour cuối tuần", "Club Lumiere", "Giảm %", "Đang chạy"],
  ["Combo phòng VIP 2+1", "KTV Hoàng Gia", "Banner", "Đang chạy"],
  ["Spa thư giãn nửa giá", "Spa Hồng Ngọc", "Giảm %", "Đang chạy"],
  ["Welcome Member -8%", "Toàn hệ thống", "First-time", "Lên lịch"],
];

function resolveAdminView(section?: string | null) {
  if (!section) return "dashboard" as AdminView;
  return sectionToView[section.toLowerCase()] ?? "dashboard";
}

const formatDateInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString().slice(0, 16) : "";
};

const revenueReportTimezone = "Asia/Ho_Chi_Minh";
const vietnamOffsetMs = 7 * 60 * 60 * 1000;
const dateKeyInVietnam = (date = new Date()) =>
  new Date(date.getTime() + vietnamOffsetMs).toISOString().slice(0, 10);

const shiftDateKey = (dateKey: string, days: number) => {
  const [year = 1970, month = 1, day = 1] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

const monthStartDateKey = (dateKey: string) => `${dateKey.slice(0, 8)}01`;

const defaultRevenueReportFilters = (): RevenueReportFilterState => {
  const to = dateKeyInVietnam();
  return {
    from: shiftDateKey(to, -29),
    to,
    flag: "all",
    storeId: "",
    couponId: "",
    quickRange: "thirty",
  };
};

const formatMoney = (value?: number | null) => `${(value ?? 0).toLocaleString("vi-VN")}đ`;

const compactMoney = (value?: number | null) => {
  const amount = value ?? 0;
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)}tr`;
  return formatMoney(amount);
};

const displayCategory = (value?: string | null) =>
  rankingCategoryOptions.find((option) => option.value.toUpperCase() === value)?.label ??
  rankingCategoryOptions.find((option) => option.value === value)?.label ??
  value ??
  "Tất cả";

const canStaffCancelBooking = (status: string) => ["REQUESTED", "CONFIRMED"].includes(status);

const adminBookingStatusLabel = (status: string) => {
  if (status === "REQUESTED" || status === "CONFIRMED") return "Mới";
  if (status === "CHECKED_IN" || status === "COMPLETED") return "Hoàn tất";
  if (status === "CANCELLED" || status === "NO_SHOW") return "Đã hủy";
  return status;
};

const billStatusLabel = (status: string) => {
  const normalized = status.toUpperCase();
  if (normalized === "PENDING_PM_BA") return "Cho PM/BA";
  if (normalized === "VOIDED") return "Da void";
  if (["APPROVED", "VERIFIED", "PAID"].includes(normalized)) return "Đã duyệt";
  if (["REJECTED", "DECLINED"].includes(normalized)) return "Từ chối";
  return "Chờ duyệt";
};

const bookingGuestLabel = (booking: AdminBooking) =>
  booking.user?.displayName ?? booking.guest?.displayName ?? booking.guest?.phone ?? "Guest";

const shortCode = (value?: string | null) => (value ? value.slice(0, 8).toUpperCase() : "-");

const buildBillFilterParams = (filters: BillFilterState) =>
  Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value.length > 0),
  );

const buildRevenueReportParams = (filters: RevenueReportFilterState) => {
  const params = Object.fromEntries(
    Object.entries({
      fromDate: filters.from,
      toDate: filters.to,
      timezone: revenueReportTimezone,
      storeId: filters.storeId.trim(),
      couponId: filters.couponId.trim(),
    }).filter(([, value]) => value.length > 0),
  );

  if (filters.flag !== "all") {
    params.flag = filters.flag;
  }

  return params;
};

const revenueReportFileStem = (report: RevenueReport) =>
  `nightlife-revenue-${report.filters.fromDate || "from"}-${report.filters.toDate || "to"}`;

const revenueReportExportRows = (report: RevenueReport): Array<Array<string | number>> => {
  const rows: Array<Array<string | number>> = [
    ["Date", "Store", "Coupon", "Bill", "Gross", "Discount", "Net", "Payable", "Commission"],
  ];

  report.days.forEach((day) =>
    day.stores.forEach((store) =>
      store.coupons.forEach((coupon) => {
        if (coupon.bills?.length) {
          coupon.bills.forEach((bill) => {
            rows.push([
              day.date,
              store.store.name,
              `${coupon.coupon.code} - ${coupon.coupon.name}`,
              bill.billNumber ?? shortCode(bill.id),
              bill.grossVnd,
              bill.discountVnd,
              bill.netVnd,
              bill.payableVnd,
              bill.commissionVnd,
            ]);
          });
          return;
        }

        rows.push([
          day.date,
          store.store.name,
          `${coupon.coupon.code} - ${coupon.coupon.name}`,
          coupon.billCount,
          coupon.grossVnd,
          coupon.discountVnd,
          coupon.netVnd,
          coupon.payableVnd,
          coupon.commissionVnd,
        ]);
      }),
    ),
  );

  return rows;
};

const escapeXmlCell = (value: string | number) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeCsvCell = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
};

const buildCsvBlob = (rows: unknown[][]) =>
  new Blob([rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n")], {
    type: "text/csv;charset=utf-8",
  });

const buildRevenueReportExcelBlob = (report: RevenueReport) => {
  const rows = revenueReportExportRows(report)
    .map(
      (row) =>
        `<tr>${row
          .map((cell) => `<td>${escapeXmlCell(cell)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table>${rows}</table></body></html>`;
  return new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
};

const asciiPdfText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .slice(0, 110);

const escapePdfText = (value: string) =>
  asciiPdfText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const buildPdfContentStream = (lines: string[]) =>
  lines
    .map((line, index) => `BT /F1 10 Tf 44 ${792 - index * 16} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");

const buildRevenueReportPdfBlob = (report: RevenueReport) => {
  const lines = [
    "NightLife revenue report",
    `Period: ${report.filters.fromDate ?? report.filters.from} -> ${report.filters.toDate ?? report.filters.to}`,
    `Timezone: ${report.meta?.timezone ?? report.filters.timezone ?? revenueReportTimezone}`,
    `Gross: ${formatMoney(report.totals.grossVnd)} | Net: ${formatMoney(report.totals.netVnd)} | Payable: ${formatMoney(
      report.totals.payableVnd,
    )} | Commission: ${formatMoney(
      report.totals.commissionVnd,
    )}`,
    "",
    "Funnel",
    ...(report.funnel ?? []).map((step) => `${step.label}: ${step.commissionVnd ? formatMoney(step.commissionVnd) : step.count}`),
    "",
    "Breakdowns",
    ...(["partners", "campaigns", "areas", "casts"] as const).flatMap((key) =>
      (report.breakdowns?.[key] ?? [])
        .slice(0, 8)
        .map((item) => `${key}: ${item.code} ${item.name} | Net ${formatMoney(item.netVnd)} | Commission ${formatMoney(item.commissionVnd)}`),
    ),
    "",
    "Rows",
    ...revenueReportExportRows(report)
      .slice(1, 70)
      .map((row) => row.join(" | ")),
  ];
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / 46)) }, (_, index) =>
    lines.slice(index * 46, index * 46 + 46),
  );
  const objects: string[] = [];
  const pageIds: number[] = [];
  let nextId = 3;

  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  pages.forEach((page) => {
    const content = buildPdfContentStream(page);
    const contentId = nextId++;
    const pageId = nextId++;
    objects[contentId] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] ` +
      `/Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> ` +
      `/Contents ${contentId} 0 R >>`;
    pageIds.push(pageId);
  });
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let id = 1; id < objects.length; id += 1) {
    if (!objects[id]) continue;
    offsets[id] = pdf.length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) {
    pdf += `${String(offsets[id] ?? 0).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
};

const downloadBlob = (blob: Blob, filename: string) => {
  if (typeof document === "undefined" || typeof URL === "undefined" || !URL.createObjectURL) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const buildPartnerRequestParams = (filters: PartnerRequestFilterState) =>
  Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([key, value]) => value.length > 0 && !(key === "status" && value === "all")),
  );

const snapshotNumber = (snapshot: Record<string, unknown> | null | undefined, key: string) => {
  const value = snapshot?.[key];
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const absoluteDateDiffMs = (left?: string | null, right?: string | null) => {
  if (!left || !right) return null;
  const leftDate = new Date(left);
  const rightDate = new Date(right);
  if (!Number.isFinite(leftDate.getTime()) || !Number.isFinite(rightDate.getTime())) return null;
  return Math.abs(leftDate.getTime() - rightDate.getTime());
};

const bookingRelationLabel = (booking?: { id: string; status?: string | null } | null) =>
  booking ? `BK-${shortCode(booking.id)}${booking.status ? ` · ${booking.status}` : ""}` : "-";

const compactJson = (value: unknown) => {
  if (!value) return "-";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const snapshotValue = (snapshot: Record<string, unknown> | null | undefined, key: string) =>
  typeof snapshot?.[key] === "string" || typeof snapshot?.[key] === "number"
    ? String(snapshot[key])
    : "-";

const snapshotFlags = (snapshot: Record<string, unknown> | null | undefined) => {
  const flags = snapshot?.flags;
  return Array.isArray(flags) ? flags.filter((flag): flag is string => typeof flag === "string") : [];
};

const hasBillSnapshotFlag = (bill: SensitiveBill, flag: string) =>
  snapshotFlags(bill.commissionRuleSnapshot).includes(flag);

const couponRelationLabel = (
  coupon?: { code?: string | null; name?: string | null } | null,
  issue?: { code?: string | null; status?: string | null } | null,
) => {
  if (issue?.code) return `${issue.code}${issue.status ? ` · ${issue.status}` : ""}`;
  if (coupon?.code || coupon?.name) return coupon.code ?? coupon.name ?? "-";
  return "-";
};

function prioritizeById<T extends { id: string }>(items: T[], focusedId: string | null) {
  if (!focusedId) return items;
  const index = items.findIndex((item) => item.id === focusedId);
  if (index <= 0) return items;
  const next = [...items];
  const focused = next.splice(index, 1)[0];
  return focused ? [focused, ...next] : items;
}

function statusStyle(status: string): React.CSSProperties {
  const normalized = status.toUpperCase();

  if (status === "Mới" || normalized.includes("REQUEST") || normalized.includes("PENDING")) {
    return {
      color: colors.onGold,
      background: colors.goldGrad,
      border: "1px solid transparent",
    };
  }

  if (
    status === "Hoàn tất" ||
    status === "Đã duyệt" ||
    normalized.includes("APPROVED") ||
    normalized.includes("ACTIVE") ||
    normalized.includes("SENT")
  ) {
    return {
      color: colors.green,
      background: "rgba(127,211,160,.1)",
      border: "1px solid rgba(127,211,160,.24)",
    };
  }

  if (
    status === "Đã hủy" ||
    status === "Từ chối" ||
    normalized.includes("CANCEL") ||
    normalized.includes("REJECT") ||
    normalized.includes("FAILED")
  ) {
    return {
      color: colors.red,
      background: "rgba(224,114,158,.1)",
      border: "1px solid rgba(224,114,158,.24)",
    };
  }

  return {
    color: colors.goldBright,
    background: "rgba(212,178,106,.1)",
    border: `1px solid ${colors.borderGold22}`,
  };
}

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    minHeight: 42,
    width: "100%",
    borderRadius: 11,
    border: `1px solid ${colors.borderGold22}`,
    background: "rgba(8,8,11,.62)",
    color: colors.text,
    padding: "0 12px",
    font: "inherit",
    outline: "none",
    ...extra,
  };
}

function buttonStyle(variant: "primary" | "secondary" | "danger" = "secondary"): React.CSSProperties {
  if (variant === "primary") {
    return {
      minHeight: 38,
      border: 0,
      borderRadius: 10,
      background: colors.goldGrad,
      color: colors.onGold,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      padding: "0 12px",
      fontWeight: 900,
      cursor: "pointer",
      whiteSpace: "nowrap",
    };
  }

  if (variant === "danger") {
    return {
      minHeight: 38,
      border: `1px solid rgba(224,114,158,.32)`,
      borderRadius: 10,
      background: "rgba(224,114,158,.08)",
      color: colors.neonPink,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      padding: "0 12px",
      fontWeight: 900,
      cursor: "pointer",
      whiteSpace: "nowrap",
    };
  }

  return {
    minHeight: 38,
    border: `1px solid ${colors.borderGold22}`,
    borderRadius: 10,
    background: colors.surface2,
    color: colors.goldBright,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "0 12px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}

function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      style={{
        ...statusStyle(tone ?? String(children)),
        borderRadius: 999,
        padding: "4px 9px",
        fontSize: 11,
        fontWeight: 900,
        lineHeight: 1.1,
        display: "inline-flex",
        alignItems: "center",
        width: "fit-content",
      }}
    >
      {children}
    </span>
  );
}

function SectionTitle({
  title,
  eyebrow,
  action,
}: {
  title: string;
  eyebrow: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 14,
      }}
    >
      <div>
        <h2 className="nl-admin-section-title" style={{ margin: 0, color: colors.text, fontSize: 21, fontWeight: 700 }}>{title}</h2>
        <div
          style={{
            marginTop: 4,
            color: colors.muted,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.6,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
      </div>
      <div
        style={{
          flex: 1,
          height: 1,
          background: "linear-gradient(90deg, rgba(212,178,106,.45), transparent)",
        }}
      />
      {action}
    </div>
  );
}

function Panel({
  children,
  style,
  testId,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  testId?: string;
}) {
  return (
    <article
      data-testid={testId}
      style={{
        border: `1px solid ${colors.borderGold22}`,
        borderRadius: 16,
        background: colors.surface1,
        boxShadow: "0 16px 34px -22px rgba(0,0,0,.8)",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </article>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  hot,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  hot?: boolean;
}) {
  return (
    <Panel style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: colors.text2, fontSize: 12 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            border: `1px solid ${hot ? colors.borderGold40 : colors.borderGold22}`,
            background: hot ? "rgba(212,178,106,.12)" : colors.surface2,
            display: "grid",
            placeItems: "center",
            color: colors.gold,
          }}
        >
          <Icon size={16} />
        </span>
        {label}
      </div>
      <div style={{ marginTop: 8, color: colors.text, fontSize: 30, lineHeight: 1, fontWeight: 800 }}>
        {value}
      </div>
      <div style={{ marginTop: 7, color: hot ? colors.goldBright : colors.muted, fontSize: 11, lineHeight: 1.35 }}>
        {note}
      </div>
    </Panel>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: 18,
        color: colors.muted,
        fontSize: 13,
        borderTop: `1px solid ${colors.borderSoft}`,
      }}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 7,
        color: colors.muted,
        fontSize: 11,
        fontWeight: 800,
        gridColumn: wide ? "1 / -1" : undefined,
      }}
    >
      {label}
      {children}
    </label>
  );
}

function AdminSidebar({
  activeView,
  counts,
  onLogout,
}: {
  activeView: AdminView;
  counts: AdminCounts;
  onLogout: () => void;
}) {
  return (
    <aside
      style={{
        width: 268,
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        alignSelf: "start",
        borderRight: `1px solid ${colors.borderGold12}`,
        background: colors.navBg,
        backdropFilter: "blur(18px)",
        display: "flex",
        flexDirection: "column",
        padding: "22px 14px",
      }}
    >
      <Link href="/admin" style={{ textDecoration: "none", padding: "0 8px" }}>
        <div
          style={{
            color: "transparent",
            background: colors.goldGrad,
            WebkitBackgroundClip: "text",
            fontSize: 25,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          Vietyoru
        </div>
        <div
          style={{
            marginTop: 5,
            color: colors.muted,
            fontSize: 9,
            letterSpacing: 3.4,
            textTransform: "uppercase",
          }}
        >
          Admin CMS
        </div>
      </Link>

      <div style={{ display: "grid", gap: 13, overflowY: "auto", padding: "24px 0 16px" }}>
        {navGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <div
              style={{
                color: colors.muted,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                padding: "0 10px 7px",
              }}
            >
              {group.title}
            </div>
            <div style={{ display: "grid", gap: 4 }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.view === activeView;
                const badge = item.badge ? counts[item.badge] : 0;

                return (
                  <Link
                    key={item.view}
                    href={item.href}
                    style={{
                      minHeight: 42,
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      borderRadius: 11,
                      padding: "0 11px",
                      textDecoration: "none",
                      border: `1px solid ${active ? colors.borderGold40 : "transparent"}`,
                      background: active
                        ? "linear-gradient(135deg,rgba(244,227,180,.16),rgba(212,178,106,.08))"
                        : "transparent",
                      color: active ? colors.goldBright : colors.text2,
                      fontSize: 13,
                      fontWeight: active ? 800 : 600,
                    }}
                  >
                    <Icon size={18} strokeWidth={1.8} />
                    <span style={{ minWidth: 0, flex: 1 }}>{item.label}</span>
                    {badge > 0 ? (
                      <span
                        style={{
                          minWidth: 22,
                          minHeight: 19,
                          borderRadius: 10,
                          display: "grid",
                          placeItems: "center",
                          padding: "0 6px",
                          color: colors.onGold,
                          background: colors.goldGrad,
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        {badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </nav>
        ))}
      </div>

      <div
        style={{
          marginTop: "auto",
          borderTop: `1px solid ${colors.borderGold12}`,
          padding: "14px 8px 0",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: colors.goldGrad,
            color: colors.onGold,
            display: "grid",
            placeItems: "center",
            fontSize: 14,
            fontWeight: 900,
            flex: "none",
          }}
        >
          A
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: colors.text, fontSize: 13, fontWeight: 800 }}>Admin Trung</div>
          <div style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>Quản trị viên</div>
        </div>
        <button
          type="button"
          aria-label="Đăng xuất"
          onClick={onLogout}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `1px solid ${colors.borderGold22}`,
            background: colors.surface2,
            color: colors.goldBright,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}

function AdminTopbar({
  activeView,
  statusMessage,
  onRefresh,
}: {
  activeView: AdminView;
  statusMessage: string;
  onRefresh: () => void;
}) {
  const meta = pageMeta[activeView];

  return (
    <header
      style={{
        minHeight: 76,
        borderBottom: `1px solid ${colors.borderGold12}`,
        background: "rgba(12,12,15,.84)",
        backdropFilter: "blur(18px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        padding: "16px 28px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ color: colors.muted, fontSize: 9, fontWeight: 800, letterSpacing: 1.7 }}>
          {meta.eyebrow}
        </div>
        <h1 style={{ margin: "4px 0 0", color: colors.text, fontSize: 22, fontWeight: 700 }}>
          {meta.title}
        </h1>
        <div
          style={{
            marginTop: 3,
            color: colors.text2,
            fontSize: 12,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: 680,
          }}
        >
          {meta.subtitle} · {statusMessage}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: "none" }}>
        <div
          style={{
            width: 286,
            minHeight: 40,
            border: `1px solid ${colors.borderGold22}`,
            borderRadius: 12,
            background: colors.surface2,
            color: colors.muted,
            display: "flex",
            alignItems: "center",
            gap: 9,
            padding: "0 13px",
            fontSize: 13,
          }}
        >
          <Search size={15} color={colors.gold} />
          Tìm quán, cast, booking...
        </div>
        <button type="button" onClick={onRefresh} style={buttonStyle("secondary")}>
          <RefreshCcw size={15} />
          Tải lại
        </button>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `1px solid ${colors.borderGold32}`,
            color: colors.goldBright,
            display: "grid",
            placeItems: "center",
            position: "relative",
            background: colors.surface2,
          }}
        >
          <Bell size={17} />
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 9,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: colors.neonPink,
            }}
          />
        </div>
      </div>
    </header>
  );
}

export default function AdminConsole({ section }: { section?: string }) {
  const { socket } = useSocket();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const focusedBookingId = searchParams.get("bookingId");
  const focusedBillId = searchParams.get("billId");
  const focusedRequestId = searchParams.get("requestId");
  const focusedTab = searchParams.get("tab");
  const initialBillFilters: BillFilterState = {
    bookingId: focusedBookingId ?? "",
    couponId: searchParams.get("couponId") ?? "",
    couponIssueId: searchParams.get("couponIssueId") ?? "",
  };
  const pathSection = pathname?.split("/").filter(Boolean)[1];
  const activeView = resolveAdminView(section ?? focusedTab ?? pathSection);

  const [stores, setStores] = useState<AdminStore[]>([]);
  const [promptData, setPromptData] = useState<{ isOpen: boolean; title: string; onSubmit: (val: string) => void; onCancel: () => void } | null>(null);
  const [promptInputValue, setPromptInputValue] = useState("");
  const [casts, setCasts] = useState<AdminCast[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [sensitiveBills, setSensitiveBills] = useState<SensitiveBill[]>([]);
  const [reportBills, setReportBills] = useState<SensitiveBill[]>([]);
  const [revenueReport, setRevenueReport] = useState<RevenueReport>(emptyRevenueReport);
  const [revenueReportFilters, setRevenueReportFilters] = useState<RevenueReportFilterState>(() =>
    defaultRevenueReportFilters(),
  );
  const [revenueReportDraft, setRevenueReportDraft] = useState<RevenueReportFilterState>(() =>
    defaultRevenueReportFilters(),
  );
  const [billFilters, setBillFilters] = useState<BillFilterState>(initialBillFilters);
  const [billFilterDraft, setBillFilterDraft] = useState<BillFilterState>(initialBillFilters);
  const [partnerRequests, setPartnerRequests] = useState<AdminPartnerRequest[]>([]);
  const [partnerRequestFilters, setPartnerRequestFilters] = useState<PartnerRequestFilterState>(
    defaultPartnerRequestFilters,
  );
  const [partnerRequestFilterDraft, setPartnerRequestFilterDraft] = useState<PartnerRequestFilterState>(
    defaultPartnerRequestFilters,
  );
  const [partnerReviewReasons, setPartnerReviewReasons] = useState<Record<string, string>>({});
  const [reviewingPartnerRequestId, setReviewingPartnerRequestId] = useState<string | null>(null);
  const [partnerRequestTab, setPartnerRequestTab] = useState<"registration" | "modification">("registration");
  const [selectedRequestForDiff, setSelectedRequestForDiff] = useState<AdminPartnerRequest | null>(null);
  const [diffModalReason, setDiffModalReason] = useState<string>("");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<boolean>(false);
  const [couponIssues, setCouponIssues] = useState<AdminCouponIssue[]>([]);
  const [couponIssueStatusFilter, setCouponIssueStatusFilter] = useState("all");
  const [expandedCouponIssueId, setExpandedCouponIssueId] = useState<string | null>(null);
  const [couponIssueActionId, setCouponIssueActionId] = useState<string | null>(null);
  const [expandedRevenueCouponKey, setExpandedRevenueCouponKey] = useState<string | null>(null);
  const [billPreviews, setBillPreviews] = useState<Record<string, BillApprovalPreview["preview"]>>({});
  const [statusMessage, setStatusMessage] = useState("Đang tải dữ liệu admin...");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reversingBillId, setReversingBillId] = useState<string | null>(null);
  const [isAutoReversingBills, setIsAutoReversingBills] = useState(false);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<AdminBooking | null>(null);
  const [cancelBookingReason, setCancelBookingReason] = useState("");
  const [cancelingBookingId, setCancelingBookingId] = useState<string | null>(null);
  const [rankings, setRankings] = useState<AdminRankingConfig[]>([]);
  const [rankingOptions, setRankingOptions] = useState<AdminRankingTargetOption[]>([]);
  const [rankingForm, setRankingForm] = useState<RankingFormState>(defaultRankingForm);
  const [editingRankingId, setEditingRankingId] = useState<string | null>(null);
  const [rankingSavingId, setRankingSavingId] = useState<string | null>(null);
  const [rankingStatusMessage, setRankingStatusMessage] = useState("Đang tải cấu hình ranking...");
  const [contentItems, setContentItems] = useState<CmsContentItem[]>([]);
  const [contentForm, setContentForm] = useState<ContentFormState>(defaultContentForm);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [contentSavingId, setContentSavingId] = useState<string | null>(null);
  const [contentStatusMessage, setContentStatusMessage] = useState("Đang tải blog/chính sách...");
  const [bookingChangeRequests, setBookingChangeRequests] = useState<BookingChangeRequest[]>([]);
  const [cancelAnalytics, setCancelAnalytics] = useState<BookingCancelAnalytics | null>(null);
  const [reviewingChangeRequestId, setReviewingChangeRequestId] = useState<string | null>(null);
  const [bookingPolicyStoreId, setBookingPolicyStoreId] = useState("");
  const [bookingPolicyCutoff, setBookingPolicyCutoff] = useState<30 | 60 | 120>(60);
  const [savingBookingPolicy, setSavingBookingPolicy] = useState(false);
  const [adminChatBooking, setAdminChatBooking] = useState<AdminBooking | null>(null);
  const [adminChatMessages, setAdminChatMessages] = useState<BookingChatMessage[]>([]);
  const [adminChatInput, setAdminChatInput] = useState("");
  const [adminChatLoading, setAdminChatLoading] = useState(false);
  const [adminChatSending, setAdminChatSending] = useState(false);

  const billFilterParams = useMemo(() => buildBillFilterParams(billFilters), [billFilters]);
  const hasBillFilters = Object.keys(billFilterParams).length > 0;
  const revenueReportParams = useMemo(
    () => buildRevenueReportParams(revenueReportFilters),
    [revenueReportFilters],
  );
  const partnerRequestParams = useMemo(
    () => buildPartnerRequestParams(partnerRequestFilters),
    [partnerRequestFilters],
  );
  const hasPartnerRequestFilters = Object.keys(partnerRequestParams).length > 0;

  const loadAdminData = useCallback(async () => {
    try {
      const [
        storeData,
        castData,
        bookingData,
        billData,
        reportBillData,
        revenueReportData,
        partnerRequestData,
        couponIssueData,
        rankingData,
        contentData,
        bookingChangeRequestData,
        cancelAnalyticsData,
      ] = await Promise.all([
        apiClient<AdminStore[]>("/partner/stores"),
        apiClient<AdminCast[] | { data: AdminCast[] }>("/admin/casts", { params: { limit: 100 } }),
        apiClient<AdminBooking[]>("/partner/bookings"),
        apiClient<SensitiveBill[]>(
          "/admin/sensitive-bills",
          hasBillFilters ? { params: billFilterParams } : undefined,
        ),
        apiClient<SensitiveBill[]>("/partner/bills").catch(() => []),
        apiClient<RevenueReport>("/admin/reports/revenue", { params: revenueReportParams }).catch(
          () => emptyRevenueReport,
        ),
        apiClient<AdminPartnerRequest[]>(
          "/admin/partner-requests",
          hasPartnerRequestFilters ? { params: partnerRequestParams } : undefined,
        ),
        apiClient<AdminCouponIssue[]>("/admin/coupon-issues"),
        adminRankingsApi.list(),
        contentApi.adminList({ limit: 100 }),
        bookingApi.listAdminBookingChangeRequests({ status: "REQUESTED" }),
        bookingApi.getAdminCancelAnalytics(30),
      ]);

      setStores(storeData);
      setCasts(normalizeAdminCastList(castData));
      setBookings(bookingData);
      setSensitiveBills(billData);
      setReportBills(reportBillData);
      setRevenueReport(normalizeRevenueReport(revenueReportData));
      setPartnerRequests(partnerRequestData);
      setCouponIssues(couponIssueData);
      setRankings(rankingData);
      setContentItems(contentData);
      setBookingChangeRequests(bookingChangeRequestData);
      setCancelAnalytics(cancelAnalyticsData);
      setBookingPolicyStoreId((current) => current || storeData[0]?.id || "");
      setStatusMessage("Đang xem bằng token ADMIN.");
      setRankingStatusMessage(`Đã tải ${rankingData.length} cấu hình ranking.`);
      setContentStatusMessage(`Đã tải ${contentData.length} bài viết/chính sách.`);
    } catch (error) {
      if (error instanceof ApiError && [401, 403].includes(error.status)) {
        clearAuthSession();
        window.location.href = "/admin/dang-nhap?redirect=/admin";
        return;
      }

      setStatusMessage("Chưa kết nối được backend. Kiểm tra backend/NEXT_PUBLIC_API_URL.");
      setRankingStatusMessage("Chưa tải được ranking CMS. Kiểm tra backend/NEXT_PUBLIC_API_URL.");
      setContentStatusMessage("Chưa tải được content CMS. Kiểm tra backend/NEXT_PUBLIC_API_URL.");
    }
  }, [billFilterParams, hasBillFilters, hasPartnerRequestFilters, partnerRequestParams, revenueReportParams]);

  const loadRankingOptions = useCallback(async () => {
    try {
      const options = await adminRankingsApi.options({
        targetType: rankingForm.targetType,
        city: rankingForm.cityCode,
        category: rankingForm.category,
        limit: 80,
      });

      setRankingOptions(options);
      setRankingForm((current) => {
        if (current.targetId && options.some((option) => option.id === current.targetId)) {
          return current;
        }

        return { ...current, targetId: options[0]?.id ?? "" };
      });
    } catch {
      setRankingOptions([]);
    }
  }, [rankingForm.category, rankingForm.cityCode, rankingForm.targetType]);

  useEffect(() => {
    void Promise.resolve().then(loadAdminData);
  }, [loadAdminData]);

  useEffect(() => {
    void Promise.resolve().then(loadRankingOptions);
  }, [loadRankingOptions]);

  useEffect(() => {
    if (!socket || !adminChatBooking) return;

    socket.emit("join_room", { bookingId: adminChatBooking.id });
    const onMessage = (nextMessage: BookingChatMessage) => {
      if (nextMessage.bookingId !== adminChatBooking.id) return;
      setAdminChatMessages((current) =>
        current.some((item) => item.id === nextMessage.id) ? current : [...current, nextMessage],
      );
    };

    socket.on("booking_chat_message_created", onMessage);

    return () => {
      socket.off("booking_chat_message_created", onMessage);
    };
  }, [adminChatBooking, socket]);

  const orderedBookings = useMemo(
    () => prioritizeById(bookings, focusedBookingId),
    [bookings, focusedBookingId],
  );
  const orderedSensitiveBills = useMemo(
    () => prioritizeById(sensitiveBills, focusedBillId),
    [focusedBillId, sensitiveBills],
  );
  const orderedPartnerRequests = useMemo(
    () => prioritizeById(partnerRequests, focusedRequestId),
    [focusedRequestId, partnerRequests],
  );
  const filteredRequestsByTab = useMemo(() => {
    return orderedPartnerRequests.filter((req) => {
      const isListing = req.id.startsWith("LISTING-");
      if (partnerRequestTab === "modification") {
        return isListing;
      } else {
        return !isListing;
      }
    });
  }, [orderedPartnerRequests, partnerRequestTab]);
  const visibleCouponIssues = useMemo(
    () =>
      couponIssues.filter((issue) =>
        couponIssueStatusFilter === "all" ? true : issue.status === couponIssueStatusFilter,
      ),
    [couponIssueStatusFilter, couponIssues],
  );
  const reconciliationBills = useMemo(
    () => (reportBills.length ? reportBills : sensitiveBills),
    [reportBills, sensitiveBills],
  );
  const issueById = useMemo(() => new Map(couponIssues.map((issue) => [issue.id, issue])), [couponIssues]);
  const couponLinkedBills = useMemo(
    () => reconciliationBills.filter((bill) => bill.coupon || bill.couponIssue),
    [reconciliationBills],
  );
  const reversibleBills = useMemo(
    () => reconciliationBills.filter((bill) => ["VERIFIED", "PAID"].includes(bill.status)),
    [reconciliationBills],
  );
  const reconciliationFunnel = useMemo(
    () => [
      { label: "Coupon claim", value: couponIssues.length, note: "claim/issue" },
      { label: "Booking", value: couponIssues.filter((issue) => issue.booking).length, note: "có booking" },
      { label: "QR used", value: couponIssues.filter((issue) => issue.status === "USED").length, note: "đã quét" },
      { label: "Bill submitted", value: couponLinkedBills.length, note: "có coupon" },
      {
        label: "Bill approved",
        value: couponLinkedBills.filter((bill) => ["VERIFIED", "PAID"].includes(bill.status)).length,
        note: "đã duyệt",
      },
    ],
    [couponIssues, couponLinkedBills],
  );
  const couponLifecycleMetrics = useMemo(() => {
    const scannedCount = couponIssues.filter(
      (issue) =>
        issue.scannedBy ||
        issue.usedAt ||
        issue.auditLogs?.some((log) => ["COUPON_ISSUE_SCANNED", "COUPON_ISSUE_USED"].includes(log.action)),
    ).length;
    const confirmedCount = couponIssues.filter((issue) => issue.status === "USED" || issue.usedAt).length;
    const billedCount = couponLinkedBills.filter((bill) => bill.couponIssue).length;
    const revokedCount = couponIssues.filter((issue) => issue.status === "REVOKED").length;

    return [
      { label: "Claim", value: couponIssues.length, note: "issue created" },
      { label: "Scan", value: scannedCount, note: "partner scan" },
      { label: "Confirm USED", value: confirmedCount, note: "one-time update" },
      { label: "Bill", value: billedCount, note: "bill linked" },
      { label: "Fraud review", value: revokedCount, note: "revoked tokens" },
    ];
  }, [couponIssues, couponLinkedBills]);
  const reconciliationWarnings = useMemo(() => {
    const warnings: Array<{ id: string; title: string; detail: string }> = [];
    const oneDayMs = 24 * 60 * 60 * 1000;

    couponLinkedBills.forEach((bill) => {
      const issue = bill.couponIssue ? issueById.get(bill.couponIssue.id) : undefined;
      const billLabel = bill.billNumber ?? shortCode(bill.id);

      if (!bill.booking && bill.couponIssue) {
        warnings.push({
          id: `missing-booking-${bill.id}`,
          title: `${billLabel}: Không có booking`,
          detail: `${bill.couponIssue.code} đã gắn bill nhưng bookingId đang trống.`,
        });
      }

      if (issue?.status !== "USED") return;

      if (issue.coupon.store?.id && bill.store.id && issue.coupon.store.id !== bill.store.id) {
        warnings.push({
          id: `store-mismatch-${bill.id}`,
          title: `${billLabel}: Lệch quán`,
          detail: `${issue.coupon.store.name} khác ${bill.store.name}.`,
        });
      }

      const usedDiff = absoluteDateDiffMs(issue.usedAt, bill.usedAt);
      if (usedDiff !== null && usedDiff > oneDayMs) {
        warnings.push({
          id: `date-mismatch-${bill.id}`,
          title: `${billLabel}: Lệch ngày sử dụng`,
          detail: `QR usedAt và bill usedAt lệch hơn 24 giờ.`,
        });
      }

      const minSpend =
        snapshotNumber(issue.discountRuleSnapshot, "minSpendVnd") ??
        snapshotNumber(issue.campaignSnapshot, "minSpendVnd");
      if (minSpend && (bill.totalVnd ?? 0) < minSpend) {
        warnings.push({
          id: `amount-mismatch-${bill.id}`,
          title: `${billLabel}: Tổng tiền thấp hơn điều kiện`,
          detail: `${formatMoney(bill.totalVnd)} < ${formatMoney(minSpend)}.`,
        });
      }
    });

    return warnings.slice(0, 8);
  }, [couponLinkedBills, issueById]);
  const totalBillValue = useMemo(
    () => sensitiveBills.reduce((sum, item) => sum + (item.totalVnd ?? 0), 0),
    [sensitiveBills],
  );
  const totalCommission = useMemo(
    () => sensitiveBills.reduce((sum, item) => sum + (item.commissionAmountVnd ?? 0), 0),
    [sensitiveBills],
  );
  const revenueReportMaxGross = useMemo(
    () => Math.max(1, ...revenueReport.days.map((day) => day.grossVnd)),
    [revenueReport.days],
  );
  const revenueReportIncludedStatuses = revenueReport.meta?.billStatusIncluded?.length
    ? revenueReport.meta.billStatusIncluded
    : ["VERIFIED", "PAID"];
  const revenueReportExportEnabled =
    ENABLE_REVENUE_EXPORT &&
    Boolean(revenueReport.meta?.exportEnabled) &&
    Boolean(revenueReport.meta?.exportFormats?.length);
  const revenueReportBiEnabled = ENABLE_REVENUE_BI;
  const revenueReportCouponOptions = useMemo(() => {
    const options = new Map<string, { id: string; code: string; name: string }>();
    couponIssues.forEach((issue) => {
      if (issue.coupon?.id) options.set(issue.coupon.id, issue.coupon);
    });
    revenueReport.days.forEach((day) =>
      day.stores.forEach((store) =>
        store.coupons.forEach((coupon) => {
          if (coupon.coupon.id) {
            options.set(coupon.coupon.id, {
              id: coupon.coupon.id,
              code: coupon.coupon.code,
              name: coupon.coupon.name,
            });
          }
        }),
      ),
    );
    return Array.from(options.values()).sort((left, right) => left.code.localeCompare(right.code));
  }, [couponIssues, revenueReport.days]);
  const revenueReportBreakdownSections = useMemo(
    () => [
      { key: "stores", title: "Store", items: revenueReport.breakdowns?.stores ?? [] },
      { key: "partners", title: "Partner", items: revenueReport.breakdowns?.partners ?? [] },
      { key: "campaigns", title: "Campaign", items: revenueReport.breakdowns?.campaigns ?? [] },
      { key: "coupons", title: "Coupon", items: revenueReport.breakdowns?.coupons ?? [] },
      { key: "areas", title: "Khu vuc", items: revenueReport.breakdowns?.areas ?? [] },
      { key: "casts", title: "Cast mong muon", items: revenueReport.breakdowns?.casts ?? [] },
    ],
    [revenueReport.breakdowns],
  );
  const revenueReportComparisonCards = useMemo(() => {
    const totals = revenueReport.comparison?.totals;
    if (!totals) return [];

    return [
      { label: "Gross", metric: totals.grossVnd, money: true },
      { label: "Net", metric: totals.netVnd, money: true },
      { label: "Payable", metric: totals.payableVnd, money: true },
      { label: "Discount", metric: totals.discountVnd, money: true },
      { label: "Commission", metric: totals.commissionVnd, money: true },
      { label: "Bill", metric: totals.billCount, money: false },
    ].filter(
      (
        item,
      ): item is {
        label: string;
        metric: NonNullable<typeof item.metric>;
        money: boolean;
      } => Boolean(item.metric),
    );
  }, [revenueReport.comparison]);
  const counts: AdminCounts = useMemo(
    () => ({
      booking: bookings.filter((item) => item.status !== "CANCELLED").length,
      bill: sensitiveBills.length,
      partners: partnerRequests.length,
      stores: stores.length,
      cast: casts.length,
      ranking: rankings.length,
      blog: contentItems.length,
      campaign: couponIssues.length,
    }),
    [
      bookings,
      casts.length,
      contentItems.length,
      couponIssues.length,
      partnerRequests.length,
      rankings.length,
      sensitiveBills.length,
      stores.length,
    ],
  );
  const adminBookingRows: AdminBookingRow[] = orderedBookings.length
    ? orderedBookings.slice(0, activeView === "booking" ? 12 : 5).map((booking) => ({
        id: booking.id,
        guest: bookingGuestLabel(booking),
        place: booking.store.name,
        people: String(booking.partySize),
        time: new Date(booking.scheduledAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: adminBookingStatusLabel(booking.status),
        focused: booking.id === focusedBookingId,
        canCancel: canStaffCancelBooking(booking.status),
        booking,
      }))
    : sampleBookings.map(([guest, place, people, time, status], index) => ({
        id: `sample-${index}`,
        guest,
        place,
        people,
        time,
        status,
        focused: false,
        canCancel: false,
        booking: null,
      }));
  const dashboardStats = useMemo(
    () => [
      {
        icon: Building2,
        label: "Quán",
        value: String(stores.length),
        note: "đang quản lý",
      },
      {
        icon: UsersRound,
        label: "Booking",
        value: String(bookings.length),
        note: "toàn hệ thống",
      },
      {
        icon: CalendarCheck,
        label: "Booking mới",
        value: String(counts.booking),
        note: "cần điều phối",
        hot: true,
      },
      {
        icon: ReceiptText,
        label: "Bill chờ duyệt",
        value: String(sensitiveBills.length),
        note: "dữ liệu nhạy cảm",
        hot: true,
      },
      {
        icon: Handshake,
        label: "Partner request",
        value: String(partnerRequests.length),
        note: "từ CMS record",
        hot: partnerRequests.length > 0,
      },
      {
        icon: TicketPercent,
        label: "Coupon issues",
        value: String(couponIssues.length),
        note: `${couponIssues.filter((item) => item.status === "ISSUED").length} đang giữ chỗ`,
      },
      {
        icon: BarChart3,
        label: "Tổng giá trị bill",
        value: compactMoney(totalBillValue),
        note: "từ sensitive-bills",
      },
    ],
    [bookings.length, counts.booking, couponIssues, partnerRequests.length, sensitiveBills.length, stores.length, totalBillValue],
  );
  const topStores = useMemo(() => {
    const storeCounts = new Map<string, { name: string; count: number }>();
    bookings.forEach((booking) => {
      const key = booking.store?.id ?? booking.store?.name ?? "unknown";
      const current = storeCounts.get(key) ?? { name: booking.store?.name ?? "Không rõ", count: 0 };
      current.count += 1;
      storeCounts.set(key, current);
    });

    return Array.from(storeCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [bookings]);

  const updateBillFilterDraft = (key: keyof BillFilterState, value: string) => {
    setBillFilterDraft((current) => ({ ...current, [key]: value }));
  };

  const applyBillFilters = () => {
    setBillFilters({
      bookingId: billFilterDraft.bookingId.trim(),
      couponId: billFilterDraft.couponId.trim(),
      couponIssueId: billFilterDraft.couponIssueId.trim(),
    });
  };

  const clearBillFilters = () => {
    const emptyFilters = { bookingId: "", couponId: "", couponIssueId: "" };
    setBillFilterDraft(emptyFilters);
    setBillFilters(emptyFilters);
  };

  const updateRevenueReportDraft = (
    key: Exclude<keyof RevenueReportFilterState, "quickRange">,
    value: string,
  ) => {
    setRevenueReportDraft((current) => ({ ...current, [key]: value, quickRange: "custom" }));
  };

  const applyRevenueReportFilters = () => {
    setRevenueReportFilters({
      from: revenueReportDraft.from,
      to: revenueReportDraft.to,
      flag: revenueReportDraft.flag,
      storeId: revenueReportDraft.storeId.trim(),
      couponId: revenueReportDraft.couponId.trim(),
      quickRange: "custom",
    });
  };

  const clearRevenueReportFilters = () => {
    const nextFilters = defaultRevenueReportFilters();
    setRevenueReportDraft(nextFilters);
    setRevenueReportFilters(nextFilters);
  };

  const exportRevenueReportExcel = () => {
    downloadBlob(buildRevenueReportExcelBlob(revenueReport), `${revenueReportFileStem(revenueReport)}.xls`);
  };

  const exportRevenueReportPdf = () => {
    downloadBlob(buildRevenueReportPdfBlob(revenueReport), `${revenueReportFileStem(revenueReport)}.pdf`);
  };

  const updateCouponIssueInState = (nextIssue: AdminCouponIssue) => {
    setCouponIssues((current) =>
      current.map((issue) => (issue.id === nextIssue.id ? { ...issue, ...nextIssue } : issue)),
    );
  };

  const revokeCouponIssueQr = async (issue: AdminCouponIssue) => {
    if (issue.status !== "ISSUED") return;

    setCouponIssueActionId(issue.id);
    try {
      const nextIssue = await apiClient<AdminCouponIssue>(`/admin/coupon-issues/${issue.id}/revoke-qr`, {
        method: "PATCH",
      });
      updateCouponIssueInState(nextIssue);
      setStatusMessage(`Da revoke QR token cho ${issue.code}.`);
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong revoke duoc QR token.");
    } finally {
      setCouponIssueActionId(null);
    }
  };

  const rotateCouponIssueQr = async (issue: AdminCouponIssue) => {
    if (issue.status !== "ISSUED") return;

    setCouponIssueActionId(issue.id);
    try {
      const nextIssue = await apiClient<AdminCouponIssue>(`/admin/coupon-issues/${issue.id}/rotate-qr`, {
        method: "POST",
      });
      updateCouponIssueInState(nextIssue);
      setStatusMessage(`Da rotate QR token cho ${issue.code}.`);
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong rotate duoc QR token.");
    } finally {
      setCouponIssueActionId(null);
    }
  };

  const exportCouponLifecycleCsv = () => {
    const rows: unknown[][] = [
      [
        "Issue ID",
        "Issue code",
        "Coupon",
        "Store",
        "Status",
        "Created at",
        "Scanned at",
        "Used at",
        "Revoked at",
        "Booking",
        "Bill",
        "QR payload hash",
      ],
    ];

    visibleCouponIssues.forEach((issue) => {
      const linkedBill = couponLinkedBills.find((bill) => bill.couponIssue?.id === issue.id);
      const scannedAt = issue.auditLogs?.find((log) => log.action === "COUPON_ISSUE_SCANNED")?.createdAt;
      rows.push([
        issue.id,
        issue.code,
        issue.coupon.code,
        issue.coupon.store?.name ?? "",
        issue.status,
        issue.createdAt ?? "",
        scannedAt ?? "",
        issue.usedAt ?? "",
        issue.revokedAt ?? "",
        issue.booking?.id ?? "",
        linkedBill?.billNumber ?? linkedBill?.id ?? issue.bill?.billNumber ?? issue.bill?.id ?? "",
        issue.qrPayloadHash ?? "",
      ]);
    });

    downloadBlob(buildCsvBlob(rows), `nightlife-coupon-qr-lifecycle-${dateKeyInVietnam()}.csv`);
  };

  const applyRevenueQuickRange = (range: RevenueReportFilterState["quickRange"]) => {
    const today = dateKeyInVietnam();
    const nextFilters: RevenueReportFilterState = {
      from:
        range === "today"
          ? today
          : range === "seven"
            ? shiftDateKey(today, -6)
            : range === "month"
              ? monthStartDateKey(today)
              : shiftDateKey(today, -29),
      to: today,
      flag: revenueReportDraft.flag,
      storeId: revenueReportDraft.storeId.trim(),
      couponId: revenueReportDraft.couponId.trim(),
      quickRange: range,
    };

    setRevenueReportDraft(nextFilters);
    setRevenueReportFilters(nextFilters);
  };

  const updatePartnerRequestFilterDraft = (key: keyof PartnerRequestFilterState, value: string) => {
    setPartnerRequestFilterDraft((current) => ({ ...current, [key]: value }));
  };

  const applyPartnerRequestFilters = () => {
    setPartnerRequestFilters({
      status: partnerRequestFilterDraft.status,
      keyword: partnerRequestFilterDraft.keyword.trim(),
      page: partnerRequestFilterDraft.page.trim() || "1",
      limit: partnerRequestFilterDraft.limit.trim() || "50",
    });
  };

  const clearPartnerRequestFilters = () => {
    setPartnerRequestFilterDraft(defaultPartnerRequestFilters);
    setPartnerRequestFilters(defaultPartnerRequestFilters);
  };

  const reviewBill = async (billId: string, approve: boolean) => {
    setReviewingId(billId);

    try {
      await apiClient(`/admin/sensitive-bills/${billId}/review`, {
        method: "PATCH",
        data: approve
          ? { approve: true }
          : { approve: false, rejectReason: "Rejected from admin dashboard" },
      });

      await loadAdminData();
    } finally {
      setReviewingId(null);
    }
  };

  const reverseBill = async (bill: SensitiveBill) => {
    if (!["VERIFIED", "PAID"].includes(bill.status)) {
      setStatusMessage("Chi dao bill VERIFIED/PAID moi duoc reverse.");
      return;
    }

    setReversingBillId(bill.id);
    try {
      await apiClient(`/admin/sensitive-bills/${bill.id}/reverse`, {
        method: "PATCH",
        data: {
          reason:
            bill.fraudWarnings?.[0]?.message ??
            "Admin reversal from bill fraud/reconciliation dashboard.",
        },
      });
      setStatusMessage(`Da reverse bill ${bill.billNumber ?? shortCode(bill.id)}.`);
      await loadAdminData();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong reverse duoc bill.");
    } finally {
      setReversingBillId(null);
    }
  };

  const autoReverseHighRiskBills = async () => {
    setIsAutoReversingBills(true);
    try {
      const response = await apiClient<{
        mode: "EXECUTED" | "DRY_RUN";
        candidateCount: number;
        reversedCount: number;
      }>("/admin/sensitive-bills/auto-reverse", {
        data: {
          execute: true,
          limit: 5,
          reason: "Auto reversal from admin high-risk fraud dashboard.",
        },
      });
      setStatusMessage(
        `Auto reverse xong: ${response.reversedCount}/${response.candidateCount} bill high-risk.`,
      );
      await loadAdminData();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong auto reverse duoc bill.");
    } finally {
      setIsAutoReversingBills(false);
    }
  };

  const previewBillApproval = async (billId: string) => {
    setReviewingId(billId);
    try {
      const response = await apiClient<BillApprovalPreview>(
        `/admin/sensitive-bills/${billId}/approval-preview`,
      );
      setBillPreviews((current) => ({ ...current, [billId]: response.preview }));
      setStatusMessage(
        response.preview.requiresPmBaConfirmation
          ? "Preview xong: bill này cần PM/BA xác nhận trước khi duyệt."
          : "Preview xong: bill có thể duyệt bình thường.",
      );
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong preview duoc bill.");
    } finally {
      setReviewingId(null);
    }
  };

  const confirmNegativeBill = async (billId: string) => {
    setPromptInputValue("");
    setPromptData({
      isOpen: true,
      title: "Nhap ly do PM/BA xac nhan commission am:",
      onCancel: () => setPromptData(null),
      onSubmit: async (reason) => {
        setPromptData(null);
        if (!reason?.trim()) return;

        setReviewingId(billId);
        try {
          await apiClient(`/admin/sensitive-bills/${billId}/confirm-negative-commission`, {
            method: "PATCH",
            data: { reason: reason.trim() },
          });
          setStatusMessage("Da xac nhan PM/BA va duyet bill commission am.");
          await loadAdminData();
        } catch (error) {
          setStatusMessage(error instanceof ApiError ? error.message : "Khong confirm duoc bill.");
        } finally {
          setReviewingId(null);
        }
      }
    });
  };

  const voidBill = async (billId: string) => {
    setPromptInputValue("");
    setPromptData({
      isOpen: true,
      title: "Nhap ly do void/refund bill:",
      onCancel: () => setPromptData(null),
      onSubmit: async (reason) => {
        setPromptData(null);
        if (!reason?.trim()) return;

        setReviewingId(billId);
        try {
          await apiClient(`/admin/sensitive-bills/${billId}/void`, {
            method: "PATCH",
            data: { reason: reason.trim() },
          });
          setStatusMessage("Da void bill va reverse diem neu bill da cong diem.");
          await loadAdminData();
        } catch (error) {
          setStatusMessage(error instanceof ApiError ? error.message : "Khong void duoc bill.");
        } finally {
          setReviewingId(null);
        }
      }
    });
  };

  const reviewPartnerRequest = async (requestId: string, approve: boolean, customReason?: string) => {
    const reason =
      customReason?.trim() ||
      partnerReviewReasons[requestId]?.trim() ||
      (approve
        ? "Ho so hop le, duyet public noi dung partner."
        : "");

    if (!reason) {
      setStatusMessage("Nhap ly do truoc khi tu choi partner request.");
      return;
    }

    setReviewingPartnerRequestId(requestId);

    try {
      await apiClient(`/admin/partner-requests/${requestId}/review`, {
        method: "PATCH",
        data: { approve, reason },
      });
      setStatusMessage(approve ? "Da duyet partner request va public draft." : "Da tu choi partner request va giu noi dung an.");
      setPartnerReviewReasons((current) => ({ ...current, [requestId]: "" }));
      await loadAdminData();
      setSelectedRequestForDiff(null);
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong review duoc partner request.");
    } finally {
      setReviewingPartnerRequestId(null);
    }
  };

  const renderDiffRow = (label: string, currentValue: string | null | undefined, proposedValue: string | null | undefined, isChanged: boolean) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          padding: "12px 16px",
          borderBottom: `1px solid ${colors.borderSoft}`,
          background: isChanged ? "rgba(212, 178, 106, 0.05)" : "transparent",
          border: isChanged ? `1px solid ${colors.borderGold32}` : "none",
          borderRadius: isChanged ? 8 : 0,
          margin: isChanged ? "4px 0" : 0,
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 10, color: colors.muted, fontWeight: 900, textTransform: "uppercase" }}>{label} (Hiện tại)</span>
          <div style={{ color: colors.text2, fontSize: 13 }}>{currentValue || "-"}</div>
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 10, color: isChanged ? colors.goldBright : colors.muted, fontWeight: 900, textTransform: "uppercase" }}>
            {label} (Đề xuất) {isChanged && "✨ Thay đổi"}
          </span>
          <div style={{ color: isChanged ? colors.goldBright : colors.text, fontSize: 13, fontWeight: isChanged ? 700 : 400 }}>{proposedValue || "-"}</div>
        </div>
      </div>
    );
  };

  const renderMediaDiffRow = (label: string, currentUrls: string[], proposedUrls: string[], isChanged: boolean) => {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          padding: "12px 16px",
          borderBottom: `1px solid ${colors.borderSoft}`,
          background: isChanged ? "rgba(212, 178, 106, 0.05)" : "transparent",
          border: isChanged ? `1px solid ${colors.borderGold32}` : "none",
          borderRadius: isChanged ? 8 : 0,
          margin: isChanged ? "4px 0" : 0,
        }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 10, color: colors.muted, fontWeight: 900, textTransform: "uppercase" }}>{label} (Hiện tại)</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {currentUrls.length === 0 ? "-" : currentUrls.map((url, i) => (
              <img key={i} src={url} alt="current" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: `1px solid ${colors.borderSoft}` }} />
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          <span style={{ fontSize: 10, color: isChanged ? colors.goldBright : colors.muted, fontWeight: 900, textTransform: "uppercase" }}>
            {label} (Đề xuất) {isChanged && "✨ Thay đổi"}
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
            {proposedUrls.length === 0 ? "-" : proposedUrls.map((url, i) => (
              <img key={i} src={url} alt="proposed" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4, border: `1px solid ${isChanged ? colors.gold : colors.borderSoft}` }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const openCancelBookingDialog = (booking: AdminBooking) => {
    setCancelBookingTarget(booking);
    setCancelBookingReason("");
  };

  const closeCancelBookingDialog = () => {
    if (cancelingBookingId) return;
    setCancelBookingTarget(null);
    setCancelBookingReason("");
  };

  const submitAdminCancelBooking = async () => {
    const booking = cancelBookingTarget;
    const reason = cancelBookingReason.trim();

    if (!booking) return;

    if (!reason) {
      setStatusMessage("Nhập lý do hủy booking trước khi xác nhận.");
      return;
    }

    setCancelingBookingId(booking.id);
    try {
      await apiClient(`/admin/bookings/${booking.id}/cancel`, {
        method: "PATCH",
        data: { reason },
      });
      setStatusMessage("Đã hủy booking, lưu audit reason và tạo notification cho khách/Admin.");
      setCancelBookingTarget(null);
      setCancelBookingReason("");
      await loadAdminData();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Không hủy được booking.");
    } finally {
      setCancelingBookingId(null);
    }
  };

  const reviewBookingChangeRequest = async (requestId: string, approve: boolean) => {
    setReviewingChangeRequestId(requestId);

    try {
      await bookingApi.reviewAdminBookingChangeRequest(requestId, {
        approve,
        note: approve ? "Approved from admin dashboard" : "Rejected from admin dashboard",
      });
      setStatusMessage(approve ? "Đã duyệt đổi lịch booking." : "Đã từ chối yêu cầu đổi lịch.");
      await loadAdminData();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Không duyệt được yêu cầu đổi lịch.");
    } finally {
      setReviewingChangeRequestId(null);
    }
  };

  const saveBookingPolicy = async () => {
    if (!bookingPolicyStoreId) {
      setStatusMessage("Chọn quán trước khi lưu policy booking.");
      return;
    }

    setSavingBookingPolicy(true);
    try {
      await bookingApi.updateAdminStoreBookingPolicy(bookingPolicyStoreId, bookingPolicyCutoff);
      setStatusMessage(`Đã cập nhật cutoff hủy/đổi lịch ${bookingPolicyCutoff} phút cho quán.`);
      const analytics = await bookingApi.getAdminCancelAnalytics(30);
      setCancelAnalytics(analytics);
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Không lưu được policy booking.");
    } finally {
      setSavingBookingPolicy(false);
    }
  };

  const openAdminBookingChat = async (booking: AdminBooking) => {
    setAdminChatBooking(booking);
    setAdminChatMessages([]);
    setAdminChatInput("");
    setAdminChatLoading(true);

    try {
      const messages = await bookingApi.listAdminBookingMessages(booking.id);
      setAdminChatMessages(messages);
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Không tải được chat booking.");
    } finally {
      setAdminChatLoading(false);
    }
  };

  const closeAdminBookingChat = () => {
    if (adminChatSending) return;
    setAdminChatBooking(null);
    setAdminChatMessages([]);
    setAdminChatInput("");
  };

  const sendAdminChatMessage = async () => {
    const booking = adminChatBooking;
    const body = adminChatInput.trim();
    if (!booking || !body) return;

    setAdminChatSending(true);
    try {
      const sentMessage = await bookingApi.sendAdminBookingMessage(booking.id, {
        message: body,
        topic: "GENERAL",
      });
      setAdminChatMessages((current) =>
        current.some((item) => item.id === sentMessage.id) ? current : [...current, sentMessage],
      );
      setAdminChatInput("");
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Không gửi được tin nhắn booking.");
    } finally {
      setAdminChatSending(false);
    }
  };

  const resetRankingForm = () => {
    setEditingRankingId(null);
    setRankingForm(defaultRankingForm);
  };

  const editRanking = (ranking: AdminRankingConfig) => {
    setEditingRankingId(ranking.id);
    setRankingForm({
      targetType: ranking.targetType,
      targetId: ranking.targetId,
      cityCode: ranking.cityCode,
      category: (ranking.category?.toLowerCase() as RankingCategory | undefined) ?? "all",
      scope: ranking.scope,
      pinRank: ranking.pinRank ? String(ranking.pinRank) : "",
      manualScore: String(ranking.manualScore),
      sponsored: ranking.sponsored,
      status: ranking.status === "DELETED" ? "EXPIRED" : ranking.status,
      startsAt: formatDateInput(ranking.startsAt),
      endsAt: formatDateInput(ranking.endsAt),
    });
    setRankingStatusMessage(`Đang sửa ${ranking.targetName}.`);
  };

  const saveRanking = async () => {
    if (!rankingForm.targetId) {
      setRankingStatusMessage("Chọn Cast hoặc Quán trước khi lưu ranking.");
      return;
    }

    const payload = {
      ...rankingForm,
      pinRank: rankingForm.pinRank ? Number(rankingForm.pinRank) : null,
      manualScore: rankingForm.manualScore ? Number(rankingForm.manualScore) : 0,
      startsAt: rankingForm.startsAt || null,
      endsAt: rankingForm.endsAt || null,
    };

    setRankingSavingId(editingRankingId ?? "new");
    try {
      if (editingRankingId) {
        await adminRankingsApi.update(editingRankingId, payload);
      } else {
        await adminRankingsApi.create(payload);
      }

      const rankingData = await adminRankingsApi.list();
      setRankings(rankingData);
      setRankingStatusMessage(`Đã lưu ranking. Tổng ${rankingData.length} cấu hình.`);
      resetRankingForm();
    } catch (error) {
      setRankingStatusMessage(error instanceof ApiError ? error.message : "Không lưu được ranking.");
    } finally {
      setRankingSavingId(null);
    }
  };

  const deleteRanking = async (rankingId: string) => {
    setRankingSavingId(rankingId);
    try {
      await adminRankingsApi.delete(rankingId);
      const rankingData = await adminRankingsApi.list();
      setRankings(rankingData);
      setRankingStatusMessage(`Đã xóa mềm ranking. Còn ${rankingData.length} cấu hình.`);
      if (editingRankingId === rankingId) resetRankingForm();
    } catch (error) {
      setRankingStatusMessage(error instanceof ApiError ? error.message : "Không xóa được ranking.");
    } finally {
      setRankingSavingId(null);
    }
  };

  const resetContentForm = () => {
    setEditingContentId(null);
    setContentForm(defaultContentForm);
  };

  const editContent = (content: CmsContentItem) => {
    const metadata = content.metadata ?? {};
    const tags = Array.isArray(metadata.tags)
      ? metadata.tags.filter((item): item is string => typeof item === "string").join(", ")
      : "";

    setEditingContentId(content.id);
    setContentForm({
      type: content.type,
      title: content.title,
      slug: content.slug,
      status: content.status === "DELETED" ? "ARCHIVED" : content.status,
      excerpt: content.excerpt ?? "",
      body: content.body ?? "",
      publishedAt: formatDateInput(content.publishedAt),
      noindex: content.noindex === true || metadata.noindex === true,
      category: typeof metadata.category === "string" ? metadata.category : "",
      tags,
      image: typeof metadata.image === "string" ? metadata.image : "",
      imageAlt: typeof metadata.imageAlt === "string" ? metadata.imageAlt : "",
    });
    setContentStatusMessage(`Đang sửa ${content.title}.`);
  };

  const saveContent = async () => {
    if (!contentForm.title.trim()) {
      setContentStatusMessage("Nhập tiêu đề trước khi lưu content.");
      return;
    }

    const tagList = contentForm.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    const metadata = {
      noindex: contentForm.noindex,
      ...(contentForm.category.trim() ? { category: contentForm.category.trim() } : {}),
      ...(tagList.length ? { tags: tagList } : {}),
      ...(contentForm.image.trim() ? { image: contentForm.image.trim() } : {}),
      ...(contentForm.imageAlt.trim() ? { imageAlt: contentForm.imageAlt.trim() } : {}),
    };
    const payload = {
      type: contentForm.type,
      title: contentForm.title.trim(),
      slug: contentForm.slug.trim() || undefined,
      status: contentForm.status,
      excerpt: contentForm.excerpt.trim() || null,
      body: contentForm.body.trim() || null,
      publishedAt: contentForm.publishedAt || null,
      metadata,
    };

    setContentSavingId(editingContentId ?? "new");
    try {
      if (editingContentId) {
        await contentApi.adminUpdate(editingContentId, payload);
      } else {
        await contentApi.adminCreate(payload);
      }

      const nextContent = await contentApi.adminList({ limit: 100 });
      setContentItems(nextContent);
      setContentStatusMessage(`Đã lưu content. Tổng ${nextContent.length} bài viết/chính sách.`);
      resetContentForm();
    } catch (error) {
      setContentStatusMessage(error instanceof ApiError ? error.message : "Không lưu được content.");
    } finally {
      setContentSavingId(null);
    }
  };

  const deleteContent = async (contentId: string) => {
    setContentSavingId(contentId);
    try {
      await contentApi.adminDelete(contentId);
      const nextContent = await contentApi.adminList({ limit: 100 });
      setContentItems(nextContent);
      setContentStatusMessage(`Đã xóa mềm content. Còn ${nextContent.length} bài viết/chính sách.`);
      if (editingContentId === contentId) resetContentForm();
    } catch (error) {
      setContentStatusMessage(error instanceof ApiError ? error.message : "Không xóa được content.");
    } finally {
      setContentSavingId(null);
    }
  };

  const logout = async () => {
    await logoutBrowserProfile();
    window.location.href = "/admin/dang-nhap";
  };

  const bookingTable = (limitActions = true) => (
    <Panel testId="admin-booking-table">
      <div style={{ minWidth: 900, overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1.45fr .7fr .7fr .8fr 180px",
            padding: "12px 18px",
            color: colors.muted,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            borderBottom: `1px solid ${colors.borderSoft}`,
          }}
        >
          <span>Khách</span>
          <span>Quán / Cast</span>
          <span>Số người</span>
          <span>Khung giờ</span>
          <span>Trạng thái</span>
          <span>Thao tác</span>
        </div>
        {adminBookingRows.map(({ id, guest, place, people, time, status, focused, canCancel, booking }) => (
          <div
            key={id}
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1.45fr .7fr .7fr .8fr 180px",
              padding: "13px 18px",
              alignItems: "center",
              borderBottom: `1px solid ${focused ? colors.borderGold32 : colors.borderSoft}`,
              background: focused ? "rgba(212,178,106,.09)" : "transparent",
              color: colors.text2,
              fontSize: 13,
              gap: 8,
            }}
          >
            <span style={{ color: colors.text, fontWeight: 800 }}>{guest}</span>
            <span>
              <span style={{ display: "block" }}>{place}</span>
              {booking?.coupon || booking?.couponIssue ? (
                <span style={{ display: "block", marginTop: 3, color: colors.goldBright, fontSize: 11 }}>
                  {couponRelationLabel(booking.coupon, booking.couponIssue)}
                </span>
              ) : null}
            </span>
            <span>{people}</span>
            <span>{time}</span>
            <Badge tone={status}>{status}</Badge>
            <span style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {booking ? (
                <button
                  type="button"
                  onClick={() => openAdminBookingChat(booking)}
                  style={buttonStyle("secondary")}
                >
                  <MessageCircle size={14} />
                  Chat
                </button>
              ) : null}
              {limitActions && canCancel && booking ? (
                <button
                  type="button"
                  disabled={cancelingBookingId === booking.id}
                  onClick={() => openCancelBookingDialog(booking)}
                  style={buttonStyle("danger")}
                >
                  <XCircle size={14} />
                  Hủy
                </button>
              ) : null}
              {!booking ? <span style={{ color: colors.muted }}>-</span> : null}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );

  const billFilterPanel = () => (
    <Panel>
      <div style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SectionTitle title="Lọc đối soát" eyebrow="RELATION FILTERS" />
          {hasBillFilters ? <Badge tone="PENDING">Đang lọc</Badge> : null}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(180px,1fr)) auto", gap: 10, alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
            Booking ID
            <input
              aria-label="Booking ID filter"
              value={billFilterDraft.bookingId}
              onChange={(event) => updateBillFilterDraft("bookingId", event.target.value)}
              style={inputStyle({ minHeight: 38 })}
              placeholder="bookingId"
            />
          </label>
          <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
            Coupon ID
            <input
              aria-label="Coupon ID filter"
              value={billFilterDraft.couponId}
              onChange={(event) => updateBillFilterDraft("couponId", event.target.value)}
              style={inputStyle({ minHeight: 38 })}
              placeholder="couponId"
            />
          </label>
          <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
            Coupon issue ID
            <input
              aria-label="Coupon issue ID filter"
              value={billFilterDraft.couponIssueId}
              onChange={(event) => updateBillFilterDraft("couponIssueId", event.target.value)}
              style={inputStyle({ minHeight: 38 })}
              placeholder="couponIssueId"
            />
          </label>
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              aria-label="Apply bill relation filters"
              onClick={applyBillFilters}
              style={buttonStyle("primary")}
            >
              <Search size={14} />
              Áp dụng
            </button>
            <button
              type="button"
              aria-label="Clear bill relation filters"
              onClick={clearBillFilters}
              style={buttonStyle("secondary")}
            >
              Xóa
            </button>
          </span>
        </div>
      </div>
    </Panel>
  );

  const billTable = () => (
    <Panel testId="admin-sensitive-bills-panel">
      <div style={{ minWidth: 980, overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr .9fr 1.1fr .95fr 280px",
            padding: "12px 18px",
            color: colors.muted,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            borderBottom: `1px solid ${colors.borderSoft}`,
          }}
        >
          <span>Bill</span>
          <span>Quán</span>
          <span>Khách</span>
          <span>Liên kết</span>
          <span>Doanh thu</span>
          <span>Duyệt</span>
        </div>
        {orderedSensitiveBills.slice(0, activeView === "bill" ? 12 : 6).map((bill) => {
          const preview = billPreviews[bill.id];
          const grossAmount =
            bill.grossRevenueVnd ?? bill.subtotalVnd ?? bill.totalVnd ?? 0;
          const netAmount = bill.netRevenueVnd ?? bill.totalVnd ?? grossAmount;
          const payableAmount = bill.payableVnd ?? bill.paidVnd ?? netAmount;

          return (
            <div
            key={bill.id}
            data-testid={`admin-sensitive-bill-row-${bill.id}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr .9fr 1.1fr .95fr 280px",
              padding: "13px 18px",
              alignItems: "center",
              borderBottom: `1px solid ${bill.id === focusedBillId ? colors.borderGold32 : colors.borderSoft}`,
              background: bill.id === focusedBillId ? "rgba(212,178,106,.09)" : "transparent",
              color: colors.text2,
              fontSize: 13,
              gap: 8,
            }}
          >
            <span>
              <span style={{ display: "block", color: colors.text, fontWeight: 800 }}>
                {bill.billNumber ?? shortCode(bill.id)}
              </span>
              <span style={{ display: "block", marginTop: 3 }}>
                <Badge tone={billStatusLabel(bill.status)}>{billStatusLabel(bill.status)}</Badge>
              </span>
              {bill.submitterType ? (
                <span style={{ display: "inline-flex", marginTop: 6 }}>
                  <Badge tone="INFO">{bill.submitterType === "PARTNER" ? "Chủ quán" : "Member"}</Badge>
                </span>
              ) : null}
              {hasBillSnapshotFlag(bill, "NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED") ? (
                <span style={{ display: "block", marginTop: 6 }}>
                  <Badge tone="REJECTED">Can PM/BA</Badge>
                </span>
              ) : null}
            </span>
            <span>{bill.store.name}</span>
            <span>
              {bill.user?.displayName ??
                bill.user?.email ??
                bill.guest?.displayName ??
                bill.guest?.phone ??
                "Guest"}
            </span>
            <span>
              <span style={{ display: "block", color: colors.goldBright }}>
                {bookingRelationLabel(bill.booking)}
              </span>
              <span style={{ display: "block", marginTop: 3, fontSize: 11 }}>
                {couponRelationLabel(bill.coupon, bill.couponIssue)}
              </span>
              {!bill.booking && bill.couponIssue ? (
                <span style={{ display: "inline-flex", marginTop: 6 }}>
                  <Badge tone="PENDING">Không có booking</Badge>
                </span>
              ) : null}
              {bill.media?.length ? (
                <span style={{ display: "inline-flex", marginTop: 6 }}>
                  <Badge tone="INFO">Chứng từ {bill.media.length}</Badge>
                </span>
              ) : null}
              {bill.fraudWarnings?.length ? (
                <span style={{ display: "inline-flex", marginTop: 6 }}>
                  <Badge tone="REJECTED">Fraud {bill.fraudWarnings.length}</Badge>
                </span>
              ) : null}
            </span>
            <span>
              <span style={{ display: "block", color: colors.text, fontWeight: 800 }}>
                Gross {formatMoney(grossAmount)}
              </span>
              <span style={{ display: "block", marginTop: 3, color: colors.text, fontWeight: 800 }}>
                Net {formatMoney(netAmount)}
              </span>
              <span style={{ display: "block", marginTop: 3, color: colors.text2, fontSize: 11 }}>
                Payable {formatMoney(payableAmount)}
              </span>
              {typeof bill.commissionAmountVnd === "number" ? (
                <span style={{ display: "block", marginTop: 3, color: colors.muted, fontSize: 11 }}>
                  Commission {formatMoney(bill.commissionAmountVnd)}
                </span>
              ) : null}
              {preview ? (
                <span style={{ display: "block", marginTop: 6, color: colors.goldBright, fontSize: 11 }}>
                  Preview: Net {formatMoney(preview.netRevenueVnd)} · Payable{" "}
                  {formatMoney(preview.payableVnd)} · Commission{" "}
                  {formatMoney(preview.commissionAmountVnd)}
                </span>
              ) : null}
            </span>
            <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                disabled={reviewingId === bill.id}
                onClick={() => void previewBillApproval(bill.id)}
                style={buttonStyle("secondary")}
              >
                <Search size={14} />
                Preview
              </button>
              <button
                type="button"
                disabled={reviewingId === bill.id}
                onClick={() => void reviewBill(bill.id, true)}
                style={buttonStyle("primary")}
              >
                <Check size={14} />
                Duyệt
              </button>
              <button
                type="button"
                disabled={reviewingId === bill.id}
                onClick={() => void reviewBill(bill.id, false)}
                style={buttonStyle("danger")}
              >
                Từ chối
              </button>
              {["VERIFIED", "PAID"].includes(bill.status) ? (
                <button
                  type="button"
                  disabled={reversingBillId === bill.id}
                  onClick={() => void reverseBill(bill)}
                  style={buttonStyle("danger")}
                >
                  <RefreshCcw size={14} />
                  Reverse
                </button>
              ) : null}
              {bill.status === "PENDING_PM_BA" ? (
                <button
                  type="button"
                  disabled={reviewingId === bill.id}
                  onClick={() => void confirmNegativeBill(bill.id)}
                  style={buttonStyle("primary")}
                >
                  <ShieldCheck size={14} />
                  PM/BA
                </button>
              ) : null}
              {["VERIFIED", "PAID", "PENDING_PM_BA"].includes(bill.status) ? (
                <button
                  type="button"
                  disabled={reviewingId === bill.id}
                  onClick={() => void voidBill(bill.id)}
                  style={buttonStyle("danger")}
                >
                  <Trash2 size={14} />
                  Void
                </button>
              ) : null}
            </span>
            </div>
          );
        })}
        {!orderedSensitiveBills.length ? <EmptyState>Chưa có hóa đơn nhạy cảm cần xử lý.</EmptyState> : null}
      </div>
    </Panel>
  );

  const partnerRequestFilterPanel = () => (
    <Panel>
      <div style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SectionTitle title="Lọc hồ sơ" eyebrow="CMS PARTNER REQUESTS" />
          {hasPartnerRequestFilters ? <Badge tone="PENDING">Đang lọc</Badge> : null}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, alignItems: "end" }}>
          <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800, position: "relative" }}>
            Status
            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                style={{
                  ...inputStyle({ minHeight: 38 }),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  cursor: "pointer",
                  textAlign: "left",
                  background: colors.shell,
                  color: colors.text,
                }}
              >
                <span>{partnerRequestFilterDraft.status === "all" ? "Tất cả" : partnerRequestFilterDraft.status}</span>
                <span style={{ fontSize: 10 }}>▼</span>
              </button>
              {statusDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: colors.shell,
                    border: `1px solid ${colors.borderSoft}`,
                    borderRadius: 4,
                    marginTop: 4,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                    overflow: "hidden",
                  }}
                >
                  {[
                    { value: "all", label: "Tất cả" },
                    { value: "PENDING_REVIEW", label: "PENDING_REVIEW" },
                    { value: "APPROVED", label: "APPROVED" },
                    { value: "REJECTED", label: "REJECTED" },
                  ].map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        updatePartnerRequestFilterDraft("status", opt.value);
                        setStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        background: partnerRequestFilterDraft.status === opt.value ? "rgba(212,178,106,.15)" : "transparent",
                        color: partnerRequestFilterDraft.status === opt.value ? colors.goldBright : colors.text,
                        fontSize: 12,
                      }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </label>
          <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
            Keyword
            <input
              aria-label="Partner request keyword filter"
              value={partnerRequestFilterDraft.keyword}
              onChange={(event) => updatePartnerRequestFilterDraft("keyword", event.target.value)}
              style={inputStyle({ minHeight: 38 })}
              placeholder="Tên quán, liên hệ, email"
            />
          </label>
          <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
            Page
            <input
              aria-label="Partner request page filter"
              value={partnerRequestFilterDraft.page}
              onChange={(event) => updatePartnerRequestFilterDraft("page", event.target.value)}
              style={inputStyle({ minHeight: 38 })}
              inputMode="numeric"
            />
          </label>
          <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
            Limit
            <input
              aria-label="Partner request limit filter"
              value={partnerRequestFilterDraft.limit}
              onChange={(event) => updatePartnerRequestFilterDraft("limit", event.target.value)}
              style={inputStyle({ minHeight: 38 })}
              inputMode="numeric"
            />
          </label>
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              aria-label="Apply partner request filters"
              onClick={applyPartnerRequestFilters}
              style={buttonStyle("primary")}
            >
              <Search size={14} />
              Áp dụng
            </button>
            <button
              type="button"
              aria-label="Clear partner request filters"
              onClick={clearPartnerRequestFilters}
              style={buttonStyle("secondary")}
            >
              Xóa
            </button>
          </span>
        </div>
      </div>
    </Panel>
  );

  const partnerTable = () => (
    <Panel testId="admin-partner-requests-panel">
      <div style={{ display: "flex", borderBottom: `1px solid ${colors.borderSoft}`, padding: "10px 18px", gap: 16 }}>
        <button
          type="button"
          onClick={() => setPartnerRequestTab("registration")}
          style={{
            background: "none",
            border: "none",
            color: partnerRequestTab === "registration" ? colors.goldBright : colors.text2,
            fontWeight: partnerRequestTab === "registration" ? "bold" : "normal",
            borderBottom: partnerRequestTab === "registration" ? `2px solid ${colors.goldBright}` : "none",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Yêu cầu Đăng ký mới
        </button>
        <button
          type="button"
          onClick={() => setPartnerRequestTab("modification")}
          style={{
            background: "none",
            border: "none",
            color: partnerRequestTab === "modification" ? colors.goldBright : colors.text2,
            fontWeight: partnerRequestTab === "modification" ? "bold" : "normal",
            borderBottom: partnerRequestTab === "modification" ? `2px solid ${colors.goldBright}` : "none",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          Yêu cầu Sửa đổi
        </button>
      </div>
      <div style={{ minWidth: 900, overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr .75fr 1fr 1fr .75fr 1.35fr",
            padding: "12px 18px",
            color: colors.muted,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            borderBottom: `1px solid ${colors.borderSoft}`,
          }}
        >
          <span>Cơ sở</span>
          <span>Khu vực</span>
          <span>Liên hệ</span>
          <span>Ghi chú</span>
          <span>Status</span>
          <span>Duyá»‡t</span>
        </div>
        {filteredRequestsByTab.slice(0, activeView === "partners" ? 12 : 6).map((request) => (
          <div
            key={request.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .75fr 1fr 1fr .75fr 1.35fr",
              padding: "13px 18px",
              alignItems: "center",
              borderBottom: `1px solid ${request.id === focusedRequestId ? colors.borderGold32 : colors.borderSoft}`,
              background: request.id === focusedRequestId ? "rgba(212,178,106,.09)" : "transparent",
              color: colors.text2,
              fontSize: 13,
              gap: 10,
            }}
          >
            <span>
              <span style={{ display: "block", color: colors.goldBright, fontWeight: 800 }}>
                {request.businessName}
              </span>
              <span style={{ display: "block", marginTop: 3, color: colors.muted, fontSize: 11 }}>
                {request.businessType ?? request.id}
              </span>
            </span>
            <span>{request.area ?? "-"}</span>
            <span>
              <span style={{ display: "block", color: colors.text, fontWeight: 700 }}>
                {request.contactName}
              </span>
              <span style={{ display: "block", marginTop: 3, color: colors.muted, fontSize: 11 }}>
                {request.contactPhone}
              </span>
            </span>
            <span>
              <span style={{ display: "block", color: colors.text, fontWeight: 700 }}>
                {request.draftStoreName ?? request.businessName}
              </span>
              <span style={{ display: "block", marginTop: 3, color: colors.muted, fontSize: 11 }}>
                {request.draftCastCount} cast / {request.draftMediaCount} media / {request.draftContentCount} menu
              </span>
              <span style={{ display: "block", marginTop: 3, color: colors.muted, fontSize: 11 }}>
                {request.note ?? request.menuSummary ?? request.contactEmail ?? "-"}
              </span>
              {request.mapUrl ? (
                <a
                  href={request.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "block", marginTop: 3, color: colors.goldBright, fontSize: 11, fontWeight: 700 }}
                >
                  Google Maps
                </a>
              ) : null}
            </span>
            <span style={{ display: "grid", gap: 6, justifyItems: "start" }}>
              <Badge tone={request.status}>{request.status}</Badge>
              <Badge tone={request.notificationStatus ?? "QUEUED"}>{request.notificationStatus ?? "NO_NOTIFY"}</Badge>
            </span>
            <span style={{ display: "grid", gap: 8 }}>
              <input
                value={partnerReviewReasons[request.id] ?? ""}
                onChange={(event) =>
                  setPartnerReviewReasons((current) => ({
                    ...current,
                    [request.id]: event.target.value,
                  }))
                }
                placeholder="Ly do review"
                disabled={request.status !== "PENDING_REVIEW" || reviewingPartnerRequestId === request.id}
                style={inputStyle({ minHeight: 36 })}
              />
              {request.reviewReason ? (
                <span style={{ color: colors.muted, fontSize: 11 }}>
                  Ly do: {request.reviewReason}
                </span>
              ) : null}
              <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {request.id.startsWith("LISTING-") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRequestForDiff(request);
                      setDiffModalReason(partnerReviewReasons[request.id] ?? "");
                    }}
                    style={buttonStyle("secondary")}
                  >
                    Xem thay đổi
                  </button>
                )}
                <button
                  type="button"
                  disabled={request.status !== "PENDING_REVIEW" || reviewingPartnerRequestId === request.id}
                  onClick={() => void reviewPartnerRequest(request.id, true)}
                  style={buttonStyle("primary")}
                >
                  Duyá»‡t
                </button>
                <button
                  type="button"
                  disabled={request.status !== "PENDING_REVIEW" || reviewingPartnerRequestId === request.id}
                  onClick={() => void reviewPartnerRequest(request.id, false)}
                  style={buttonStyle("danger")}
              >
                Tá»« chá»‘i
              </button>
            </span>
            </span>
          </div>
        ))}
        {!partnerRequests.length ? <EmptyState>Chưa có partner request phù hợp bộ lọc.</EmptyState> : null}
      </div>
    </Panel>
  );

  const couponIssueDetail = (issue: AdminCouponIssue) => {
    const campaignSnapshot = issue.campaignSnapshot ?? null;
    const auditLogs = issue.auditLogs ?? [];
    const isQrActionRunning = couponIssueActionId === issue.id;
    const canManageQrToken = issue.status === "ISSUED" && !isQrActionRunning;

    return (
      <div
        data-testid={`admin-coupon-issue-detail-${issue.id}`}
        style={{
          borderBottom: `1px solid ${colors.borderSoft}`,
          background: "rgba(212,178,106,.035)",
          padding: "14px 18px 18px",
          display: "grid",
          gridTemplateColumns: "minmax(220px,.7fr) minmax(280px,1fr) minmax(280px,1fr)",
          gap: 14,
          color: colors.text2,
          fontSize: 12,
        }}
      >
        <div style={{ display: "grid", gap: 9 }}>
          <span style={{ color: colors.goldBright, fontWeight: 900 }}>QR payload hash</span>
          <code
            style={{
              display: "block",
              overflowWrap: "anywhere",
              border: `1px solid ${colors.borderGold22}`,
              borderRadius: 10,
              padding: 10,
              color: colors.text,
              background: "rgba(8,8,11,.62)",
              lineHeight: 1.55,
            }}
          >
            {issue.qrPayloadHash ?? "-"}
          </code>
          <span style={{ color: colors.muted }}>
            {issue.discountRuleSnapshot ? `Discount: ${compactJson(issue.discountRuleSnapshot)}` : "Discount snapshot: -"}
          </span>
          <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              aria-label={`Revoke QR token ${issue.code}`}
              disabled={!canManageQrToken}
              onClick={() => void revokeCouponIssueQr(issue)}
              style={{ ...buttonStyle("danger"), opacity: canManageQrToken ? 1 : 0.55 }}
            >
              <XCircle size={14} />
              Revoke
            </button>
            <button
              type="button"
              aria-label={`Rotate QR token ${issue.code}`}
              disabled={!canManageQrToken}
              onClick={() => void rotateCouponIssueQr(issue)}
              style={{ ...buttonStyle("secondary"), opacity: canManageQrToken ? 1 : 0.55 }}
            >
              <RefreshCcw size={14} />
              Rotate
            </button>
          </span>
        </div>

        <div style={{ display: "grid", gap: 9 }}>
          <span style={{ color: colors.goldBright, fontWeight: 900 }}>Campaign snapshot</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 8 }}>
            {[
              ["Code", snapshotValue(campaignSnapshot, "code")],
              ["Name", snapshotValue(campaignSnapshot, "name")],
              ["Coupon ID", snapshotValue(campaignSnapshot, "id")],
              ["Store ID", snapshotValue(campaignSnapshot, "storeId")],
            ].map(([label, value]) => (
              <span key={label} style={{ borderBottom: `1px solid ${colors.borderHair}`, paddingBottom: 7 }}>
                <span style={{ display: "block", color: colors.muted, fontSize: 10, fontWeight: 900 }}>{label}</span>
                <span style={{ display: "block", marginTop: 3, color: colors.text, overflowWrap: "anywhere" }}>{value}</span>
              </span>
            ))}
          </div>
          <code style={{ color: colors.muted, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
            {compactJson(campaignSnapshot)}
          </code>
        </div>

        <div style={{ display: "grid", gap: 9, alignContent: "start" }}>
          <span style={{ color: colors.goldBright, fontWeight: 900 }}>Audit logs</span>
          {auditLogs.length ? (
            auditLogs.map((log) => (
              <div key={log.id} style={{ borderBottom: `1px solid ${colors.borderHair}`, paddingBottom: 8 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 8, color: colors.text, fontWeight: 800 }}>
                  <span>{log.action}</span>
                  <span>{log.createdAt ? new Date(log.createdAt).toLocaleString("vi-VN") : "-"}</span>
                </span>
                <span style={{ display: "block", marginTop: 4, color: colors.muted }}>
                  {log.actor?.displayName ?? log.actorId ?? "system"} · {compactJson(log.metadata)}
                </span>
              </div>
            ))
          ) : (
            <span style={{ color: colors.muted }}>Chưa có audit log liên quan.</span>
          )}
        </div>
      </div>
    );
  };

  const couponIssuePanel = () => (
    <Panel testId="admin-coupon-issues-panel">
      <div style={{ padding: 18, borderBottom: `1px solid ${colors.borderSoft}` }}>
        <SectionTitle
          title="Coupon issue"
          eyebrow="COUPON LIFECYCLE"
          action={
            <span style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                type="button"
                aria-label="Export coupon QR lifecycle report"
                onClick={exportCouponLifecycleCsv}
                style={buttonStyle("secondary")}
              >
                <FileText size={14} />
                Export CSV
              </button>
              <select
                value={couponIssueStatusFilter}
                onChange={(event) => setCouponIssueStatusFilter(event.target.value)}
                style={inputStyle({ width: 170, minHeight: 38 })}
              >
              <option value="all">Tất cả</option>
              <option value="ISSUED">Đã cấp</option>
              <option value="USED">Đã dùng</option>
              <option value="EXPIRED">Hết hạn</option>
              <option value="REVOKED">Đã hủy</option>
              </select>
            </span>
          }
        />
        <div
          data-testid="admin-coupon-lifecycle-metrics"
          style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(120px,1fr))", gap: 10, marginTop: 14 }}
        >
          {couponLifecycleMetrics.map((metric) => (
            <span
              key={metric.label}
              style={{
                border: `1px solid ${colors.borderHair}`,
                background: "rgba(255,255,255,.032)",
                padding: "10px 12px",
                display: "grid",
                gap: 3,
              }}
            >
              <span style={{ color: colors.muted, fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>
                {metric.label}
              </span>
              <strong style={{ color: colors.text, fontSize: 20 }}>{metric.value}</strong>
              <span style={{ color: colors.text2, fontSize: 11 }}>{metric.note}</span>
            </span>
          ))}
        </div>
      </div>
      <div style={{ minWidth: 980, overflowX: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 1fr .7fr .8fr .8fr 1fr auto",
            padding: "12px 18px",
            color: colors.muted,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 1,
            textTransform: "uppercase",
            borderBottom: `1px solid ${colors.borderSoft}`,
          }}
        >
          <span>Mã</span>
          <span>Quán</span>
          <span>Status</span>
          <span>Holder</span>
          <span>Expiry</span>
          <span>Link</span>
          <span>Action</span>
        </div>
        {visibleCouponIssues.slice(0, activeView === "campaign" ? 12 : 8).map((issue) => (
          <React.Fragment key={issue.id}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr .7fr .8fr .8fr 1fr auto",
                padding: "13px 18px",
                alignItems: "center",
                borderBottom: expandedCouponIssueId === issue.id ? "0" : `1px solid ${colors.borderSoft}`,
                color: colors.text2,
                fontSize: 13,
                gap: 8,
              }}
            >
              <span>
                <span style={{ display: "block", color: colors.text, fontWeight: 800 }}>{issue.code}</span>
                <span style={{ display: "block", marginTop: 3, color: colors.goldBright, fontSize: 11 }}>
                  {issue.coupon.name} {typeof issue.discountPercent === "number" ? `-${issue.discountPercent}%` : ""}
                </span>
              </span>
              <span>{issue.coupon.store?.name ?? "-"}</span>
              <Badge tone={issue.status}>{issue.statusLabel ?? issue.status}</Badge>
              <span>{issue.user?.displayName ?? issue.guest?.displayName ?? issue.userType ?? "-"}</span>
              <span>{issue.expiresAt ? new Date(issue.expiresAt).toLocaleDateString("vi-VN") : "-"}</span>
              <span>{issue.bill ? `Bill ${issue.bill.billNumber ?? shortCode(issue.bill.id)}` : bookingRelationLabel(issue.booking)}</span>
              <button
                type="button"
                aria-expanded={expandedCouponIssueId === issue.id}
                aria-label={`Chi tiết coupon issue ${issue.code}`}
                onClick={() => setExpandedCouponIssueId((current) => (current === issue.id ? null : issue.id))}
                style={buttonStyle(expandedCouponIssueId === issue.id ? "primary" : "secondary")}
              >
                <FileText size={14} />
                Chi tiết
              </button>
            </div>
            {expandedCouponIssueId === issue.id ? couponIssueDetail(issue) : null}
          </React.Fragment>
        ))}
        {!visibleCouponIssues.length ? <EmptyState>Chưa có coupon issue phù hợp bộ lọc.</EmptyState> : null}
      </div>
    </Panel>
  );

  const renderDashboard = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: `1px solid ${colors.borderGold32}`,
          borderRadius: 14,
          padding: "14px 16px",
          background: "linear-gradient(135deg,rgba(212,178,106,.13),rgba(255,255,255,.035))",
        }}
      >
        <ShieldCheck size={22} color={colors.goldBright} />
        <div style={{ color: colors.text2, fontSize: 13.5, flex: 1 }}>
          Đang chờ xử lý: <b style={{ color: colors.goldBright }}>{sensitiveBills.length} hóa đơn</b>,{" "}
          <b style={{ color: colors.goldBright }}>{partnerRequests.length} hồ sơ đối tác</b> và{" "}
          <b style={{ color: colors.goldBright }}>{counts.booking} yêu cầu đặt chỗ</b>.
        </div>
        <Link href="/admin/bill" style={{ ...buttonStyle("primary"), textDecoration: "none" }}>
          Xử lý ngay
          <ChevronRight size={15} />
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(150px,1fr))", gap: 14 }}>
        {dashboardStats.slice(0, 5).map((item) => (
          <MetricCard key={item.label} {...item} />
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(320px,.9fr)", gap: 16 }}>
        <Panel style={{ padding: 20 }}>
          <SectionTitle title="Doanh thu & hoa hồng 7 ngày" eyebrow="REVENUE SNAPSHOT" />
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 178 }}>
            {[46, 62, 40, 74, 96, 88, 54].map((height, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: "56%",
                    height: `${Math.max(16, Math.round(height * 0.38))}%`,
                    borderRadius: "6px 6px 0 0",
                    background: "rgba(212,178,106,.22)",
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: `${height}%`,
                    borderRadius: "7px 7px 0 0",
                    background: colors.goldGrad,
                    boxShadow: "0 12px 24px rgba(212,178,106,.12)",
                  }}
                />
                <span style={{ color: colors.muted, fontSize: 11 }}>
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][index]}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel style={{ padding: 20 }}>
          <SectionTitle title="Top quán theo lượt đặt" eyebrow="TOP STORES" />
          <div style={{ display: "grid", gap: 12 }}>
            {(topStores.length ? topStores : [
              { name: "Club Lumiere", count: 312 },
              { name: "KTV Hoàng Gia", count: 208 },
              { name: "Sakura Lounge", count: 156 },
              { name: "Casino Diamond", count: 89 },
            ]).map((store, index) => (
              <div key={`${store.name}-${index}`} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 9,
                    background: index === 0 ? colors.goldGrad : "rgba(212,178,106,.1)",
                    color: index === 0 ? colors.onGold : colors.goldBright,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                  }}
                >
                  {index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: colors.text, fontSize: 13.5, fontWeight: 800 }}>{store.name}</div>
                  <div style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>NightLife VN</div>
                </div>
                <span style={{ color: colors.goldBright, fontSize: 12.5, fontWeight: 900 }}>{store.count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div>
        <SectionTitle
          title="Yêu cầu đặt chỗ gần đây"
          eyebrow="RECENT BOOKINGS"
          action={
            <Link href="/admin/booking" style={{ color: colors.goldBright, fontSize: 12.5, fontWeight: 800, textDecoration: "none" }}>
              Xem tất cả
            </Link>
          }
        />
        {bookingTable(false)}
      </div>
    </div>
  );

  const renderBooking = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(150px,1fr))", gap: 14 }}>
        <MetricCard icon={CalendarCheck} label="Mới" value={String(counts.booking)} note="cần điều phối" hot />
        <MetricCard
          icon={Check}
          label="Hoàn tất"
          value={String(bookings.filter((item) => ["CHECKED_IN", "COMPLETED"].includes(item.status)).length)}
          note="đã phục vụ"
        />
        <MetricCard
          icon={XCircle}
          label="Đã hủy"
          value={String(bookings.filter((item) => ["CANCELLED", "NO_SHOW"].includes(item.status)).length)}
          note="theo trạng thái booking"
        />
        <MetricCard
          icon={Clock3}
          label="Đổi lịch"
          value={String(bookingChangeRequests.length)}
          note="đang chờ duyệt"
          hot={bookingChangeRequests.length > 0}
        />
      </div>

      <SectionTitle title="Danh sách đặt chỗ" eyebrow="BOOKING QUEUE" />
      {bookingTable(true)}

      <Panel testId="admin-booking-p2-panel" style={{ padding: 18 }}>
        <SectionTitle title="Điều phối nâng cao" eyebrow="CHANGE REQUESTS / POLICY / CANCEL RATE" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(260px,1fr))", gap: 14 }}>
          <section>
            <h3 style={{ margin: "0 0 12px", color: colors.text, fontSize: 16 }}>Yêu cầu đổi lịch</h3>
            <div style={{ display: "grid", gap: 9 }}>
              {bookingChangeRequests.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: `1px solid ${colors.borderSoft}`,
                    borderRadius: 12,
                    padding: 11,
                    background: colors.surface2,
                  }}
                >
                  <div style={{ color: colors.text, fontWeight: 800, fontSize: 13 }}>
                    {item.store?.name ?? item.booking?.store?.name ?? "Booking"} ·{" "}
                    {item.requestedScheduledAt
                      ? new Date(item.requestedScheduledAt).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Chưa có giờ mới"}
                  </div>
                  <div style={{ marginTop: 5, color: colors.muted, fontSize: 12 }}>
                    {item.reason || "Khách chưa nhập lý do"}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      disabled={reviewingChangeRequestId === item.id}
                      onClick={() => void reviewBookingChangeRequest(item.id, true)}
                      style={buttonStyle("primary")}
                    >
                      Duyệt
                    </button>
                    <button
                      type="button"
                      disabled={reviewingChangeRequestId === item.id}
                      onClick={() => void reviewBookingChangeRequest(item.id, false)}
                      style={buttonStyle("danger")}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
              {bookingChangeRequests.length === 0 ? <div style={{ color: colors.muted, fontSize: 12 }}>Chưa có yêu cầu đổi lịch đang chờ.</div> : null}
            </div>
          </section>

          <section>
            <h3 style={{ margin: "0 0 12px", color: colors.text, fontSize: 16 }}>Cutoff hủy/đổi lịch</h3>
            <div style={{ display: "grid", gap: 10 }}>
              <select
                value={bookingPolicyStoreId}
                onChange={(event) => setBookingPolicyStoreId(event.target.value)}
                style={inputStyle()}
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                {([30, 60, 120] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBookingPolicyCutoff(value)}
                    style={{
                      ...buttonStyle(bookingPolicyCutoff === value ? "primary" : "secondary"),
                      minHeight: 42,
                    }}
                  >
                    {value}p
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={savingBookingPolicy}
                onClick={() => void saveBookingPolicy()}
                style={buttonStyle("primary")}
              >
                <Save size={15} />
                {savingBookingPolicy ? "Đang lưu" : "Lưu policy"}
              </button>
            </div>
          </section>

          <section>
            <h3 style={{ margin: "0 0 12px", color: colors.text, fontSize: 16 }}>Tỷ lệ hủy</h3>
            <div style={{ display: "grid", gap: 8, color: colors.text2, fontSize: 12 }}>
              <strong style={{ color: colors.goldBright, fontSize: 28 }}>
                {cancelAnalytics?.meta.cancelRate ?? 0}%
              </strong>
              {(cancelAnalytics?.byStore ?? []).slice(0, 4).map((item) => (
                <span key={item.storeId}>
                  {item.storeName}: {item.cancelledBookings}/{item.totalBookings} · cutoff{" "}
                  {item.cancelCutoffMinutes}p
                </span>
              ))}
              {!cancelAnalytics ? <span style={{ color: colors.muted }}>Chưa có dữ liệu cancel analytics.</span> : null}
            </div>
          </section>
        </div>
      </Panel>
    </div>
  );

  const renderBill = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(170px,1fr))", gap: 14 }}>
        <MetricCard icon={BarChart3} label="Tổng doanh thu" value={compactMoney(totalBillValue)} note="đã ghi nhận từ bill" hot />
        <MetricCard icon={ReceiptText} label="Hoa hồng" value={compactMoney(totalCommission)} note="commissionAmountVnd" />
        <MetricCard icon={TicketPercent} label="Coupon link" value={String(couponIssues.length)} note="issue đang theo dõi" />
        <MetricCard icon={ShieldCheck} label="Chờ duyệt" value={String(sensitiveBills.length)} note="admin review" hot />
      </div>
      <SectionTitle title="Bảng hóa đơn" eyebrow="SENSITIVE BILL REVIEW" />
      {billFilterPanel()}
      {billTable()}
    </div>
  );

  const renderPartners = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(170px,1fr))", gap: 14 }}>
        <MetricCard icon={Handshake} label="Chờ duyệt" value={String(partnerRequests.length)} note="hồ sơ mới" hot={partnerRequests.length > 0} />
        <MetricCard
          icon={Bell}
          label="Đã gửi notify"
          value={String(partnerRequests.filter((item) => item.notificationStatus === "SENT").length)}
          note="Telegram delivery"
        />
        <MetricCard icon={Store} label="Cơ sở hiện có" value={String(stores.length)} note="store scope" />
      </div>
      <SectionTitle title="Hồ sơ đối tác" eyebrow="PARTNER REQUESTS" />
      {partnerRequestFilterPanel()}
      {partnerTable()}
    </div>
  );

  const renderStores = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(170px,1fr))", gap: 14 }}>
        <MetricCard icon={Building2} label="Quán" value={String(stores.length)} note="từ /partner/stores" hot />
        <MetricCard icon={CalendarCheck} label="Có booking" value={String(topStores.length)} note="đã phát sinh đặt chỗ" />
        <MetricCard icon={TicketPercent} label="Coupon issue" value={String(couponIssues.length)} note="đang gắn ưu đãi" />
      </div>
      <Panel>
        <div style={{ padding: 18 }}>
          <SectionTitle title="Danh sách quán" eyebrow="STORE DIRECTORY" />
        </div>
        <div style={{ minWidth: 860, overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr .9fr .8fr .8fr 1fr",
              padding: "12px 18px",
              color: colors.muted,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              borderTop: `1px solid ${colors.borderSoft}`,
              borderBottom: `1px solid ${colors.borderSoft}`,
            }}
          >
            <span>Tên quán</span>
            <span>Slug</span>
            <span>Booking</span>
            <span>Trạng thái</span>
            <span>Ghi chú</span>
          </div>
          {stores.map((store) => {
            const bookingCount = bookings.filter((booking) => booking.store?.id === store.id || booking.store?.name === store.name).length;
            return (
              <div
                key={store.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr .9fr .8fr .8fr 1fr",
                  padding: "13px 18px",
                  borderBottom: `1px solid ${colors.borderSoft}`,
                  color: colors.text2,
                  fontSize: 13,
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ color: colors.text, fontWeight: 800 }}>{store.name}</span>
                <span>{store.slug ?? "-"}</span>
                <span>{bookingCount}</span>
                <Badge tone={store.status}>{store.status}</Badge>
                <span>Đồng bộ theo dữ liệu store hiện có.</span>
              </div>
            );
          })}
          {!stores.length ? <EmptyState>Chưa có dữ liệu quán từ backend.</EmptyState> : null}
        </div>
      </Panel>
    </div>
  );

  const renderCast = () => {
    const activePublicCasts = casts.filter((cast) => cast.status === "ACTIVE" && cast.isPublic !== false).length;
    const linkedStoreCount = new Set(casts.map((cast) => cast.store?.id ?? cast.storeId).filter(Boolean)).size;
    const visibleCasts = casts.slice(0, 50);

    return (
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(170px,1fr))", gap: 14 }}>
          <MetricCard icon={UsersRound} label="Cast" value={String(casts.length)} note="hồ sơ hiện có" />
          <MetricCard icon={Star} label="Đang hiển thị" value={String(activePublicCasts)} note="ACTIVE + public" hot />
          <MetricCard icon={Building2} label="Quán liên kết" value={String(linkedStoreCount)} note="theo hồ sơ cast" />
        </div>
        <Panel>
          <div style={{ padding: 18 }}>
            <SectionTitle title="Danh sách cast" eyebrow="CAST DIRECTORY" />
          </div>
          <div style={{ minWidth: 780, overflowX: "auto" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr .9fr .8fr",
                padding: "12px 18px",
                color: colors.muted,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: 1,
                textTransform: "uppercase",
                borderTop: `1px solid ${colors.borderSoft}`,
                borderBottom: `1px solid ${colors.borderSoft}`,
              }}
            >
              <span>Tên cast</span>
              <span>Quán</span>
              <span>Ngôn ngữ / Tags</span>
              <span>Trạng thái</span>
            </div>
            {visibleCasts.map((cast) => {
              const storeName =
                cast.store?.name ?? stores.find((store) => store.id === cast.storeId)?.name ?? "Chưa gắn quán";
              const tags = [...(cast.languages ?? []), ...(cast.tags ?? [])].slice(0, 4);
              const status = cast.status === "ACTIVE" && cast.isPublic === false ? "HIDDEN" : cast.status;

              return (
                <div
                  key={cast.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr .9fr .8fr",
                    padding: "13px 18px",
                    borderBottom: `1px solid ${colors.borderSoft}`,
                    alignItems: "center",
                    color: colors.text2,
                    fontSize: 13,
                    gap: 8,
                  }}
                >
                  <span style={{ color: colors.text, fontWeight: 800 }}>
                    {cast.stageName}
                    {cast.zodiacSign ? (
                      <span style={{ color: colors.muted, fontWeight: 700 }}> · {cast.zodiacSign}</span>
                    ) : null}
                  </span>
                  <span>{storeName}</span>
                  <span>{tags.length ? tags.join(" · ") : "-"}</span>
                  <Badge tone={status}>{status}</Badge>
                </div>
              );
            })}
            {!casts.length ? <EmptyState>Chưa có dữ liệu cast từ backend.</EmptyState> : null}
          </div>
        </Panel>
      </div>
    );
  };

  const renderCampaign = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(160px,1fr))", gap: 14 }}>
        <MetricCard icon={TicketPercent} label="Coupon issue" value={String(couponIssues.length)} note="đã cấp / đã dùng" hot />
        <MetricCard icon={Store} label="Quán áp dụng" value={String(stores.length)} note="store scope" />
        <MetricCard icon={Check} label="Đã dùng" value={String(couponIssues.filter((item) => item.status === "USED").length)} note="used" />
        <MetricCard icon={Clock3} label="Đang giữ" value={String(couponIssues.filter((item) => item.status === "ISSUED").length)} note="issued" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,.9fr) minmax(0,1.1fr)", gap: 16 }}>
        <Panel style={{ padding: 18 }}>
          <SectionTitle title="Cấu hình hoa hồng" eyebrow="DISABLED" />
          <div
            style={{
              border: `1px solid ${colors.borderSoft}`,
              background: colors.surface2,
              padding: 14,
              display: "grid",
              gap: 8,
            }}
          >
            <Badge tone="INACTIVE">Đã tắt</Badge>
            <p style={{ margin: 0, color: colors.text2, fontSize: 13, lineHeight: 1.55 }}>
              Hệ thống không còn sử dụng CommissionConfig hoặc campaign commission override. Bill được duyệt với
              commissionAmountVnd = 0.
            </p>
          </div>
        </Panel>
        <Panel style={{ padding: 18 }}>
          <SectionTitle title="Campaign đang quản lý" eyebrow="PROMOTION LIST" />
          <div style={{ display: "grid", gap: 10 }}>
            {sampleCampaigns.map(([name, store, type, status]) => (
              <div
                key={name}
                style={{
                  border: `1px solid ${colors.borderSoft}`,
                  borderRadius: 12,
                  background: colors.surface2,
                  padding: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ color: colors.text, fontWeight: 800, fontSize: 13 }}>{name}</div>
                  <div style={{ marginTop: 4, color: colors.muted, fontSize: 12 }}>
                    {store} · {type}
                  </div>
                </div>
                <Badge tone={status}>{status}</Badge>
              </div>
            ))}
          </div>
        </Panel>
        {couponIssuePanel()}
      </div>
    </div>
  );

  const renderRanking = () => (
    <Panel testId="admin-ranking-panel">
      <div style={{ padding: 18, borderBottom: `1px solid ${colors.borderSoft}` }}>
        <SectionTitle
          title="Điều khiển ranking thủ công"
          eyebrow="CAST / STORE PINNING"
          action={
            <button type="button" onClick={resetRankingForm} style={buttonStyle("secondary")}>
              <Plus size={15} />
              Tạo mới
            </button>
          }
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px,.92fr) minmax(0,1.08fr)", gap: 16, padding: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, alignContent: "start" }}>
          <Field label="Loại target">
            <select
              value={rankingForm.targetType}
              onChange={(event) =>
                setRankingForm((current) => ({
                  ...current,
                  targetType: event.target.value as RankingTargetType,
                  targetId: "",
                }))
              }
              style={inputStyle()}
            >
              <option value="CAST">Cast</option>
              <option value="STORE">Quán</option>
            </select>
          </Field>

          <Field label="City">
            <select
              value={rankingForm.cityCode}
              onChange={(event) =>
                setRankingForm((current) => ({
                  ...current,
                  cityCode: event.target.value as RankingCity,
                  targetId: "",
                }))
              }
              style={inputStyle()}
            >
              {rankingCityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Cast / Quán" wide>
            <select
              value={rankingForm.targetId}
              onChange={(event) => setRankingForm((current) => ({ ...current, targetId: event.target.value }))}
              style={inputStyle()}
            >
              {rankingOptions.length ? null : <option value="">Không có target phù hợp</option>}
              {rankingOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name} · {option.area ?? option.city ?? "All"} · {displayCategory(option.category)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Category">
            <select
              value={rankingForm.category}
              onChange={(event) =>
                setRankingForm((current) => ({
                  ...current,
                  category: event.target.value as RankingFormState["category"],
                  targetId: "",
                }))
              }
              style={inputStyle()}
            >
              {rankingCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Scope">
            <input
              value={rankingForm.scope}
              onChange={(event) => setRankingForm((current) => ({ ...current, scope: event.target.value }))}
              style={inputStyle()}
            />
          </Field>

          <Field label="Pin rank">
            <input
              type="number"
              min={1}
              max={5}
              value={rankingForm.pinRank}
              onChange={(event) => setRankingForm((current) => ({ ...current, pinRank: event.target.value }))}
              style={inputStyle()}
            />
          </Field>

          <Field label="Manual score">
            <input
              type="number"
              min={0}
              value={rankingForm.manualScore}
              onChange={(event) => setRankingForm((current) => ({ ...current, manualScore: event.target.value }))}
              style={inputStyle()}
            />
          </Field>

          <Field label="Starts at">
            <input
              type="datetime-local"
              value={rankingForm.startsAt}
              onChange={(event) => setRankingForm((current) => ({ ...current, startsAt: event.target.value }))}
              style={inputStyle()}
            />
          </Field>

          <Field label="Ends at">
            <input
              type="datetime-local"
              value={rankingForm.endsAt}
              onChange={(event) => setRankingForm((current) => ({ ...current, endsAt: event.target.value }))}
              style={inputStyle()}
            />
          </Field>

          <Field label="Status">
            <select
              value={rankingForm.status}
              onChange={(event) =>
                setRankingForm((current) => ({
                  ...current,
                  status: event.target.value as RankingFormState["status"],
                }))
              }
              style={inputStyle()}
            >
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </Field>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: colors.text2,
              fontSize: 12,
              fontWeight: 800,
              paddingTop: 20,
            }}
          >
            <input
              type="checkbox"
              checked={rankingForm.sponsored}
              onChange={(event) => setRankingForm((current) => ({ ...current, sponsored: event.target.checked }))}
            />
            Tài trợ
          </label>


          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={rankingSavingId !== null}
              onClick={() => void saveRanking()}
              style={buttonStyle("primary")}
            >
              <Save size={15} />
              {editingRankingId ? "Lưu thay đổi" : "Tạo ranking"}
            </button>
            <button type="button" onClick={resetRankingForm} style={buttonStyle("secondary")}>
              Hủy
            </button>
          </div>
          <div style={{ gridColumn: "1 / -1", color: colors.muted, fontSize: 12 }}>{rankingStatusMessage}</div>
        </div>

        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          {rankings.map((ranking) => (
            <div
              key={ranking.id}
              data-testid="admin-ranking-row"
              style={{
                border: `1px solid ${colors.borderSoft}`,
                borderRadius: 13,
                background:
                  ranking.pinRank === 1
                    ? "linear-gradient(135deg,rgba(212,178,106,.14),rgba(255,255,255,.03))"
                    : colors.surface2,
                padding: 12,
                display: "grid",
                gridTemplateColumns: "44px 1fr auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: ranking.pinRank === 1 ? colors.goldGrad : "rgba(212,178,106,.12)",
                  color: ranking.pinRank === 1 ? colors.onGold : colors.goldBright,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 17,
                  fontWeight: 900,
                }}
              >
                {ranking.pinRank ?? "-"}
              </span>
              <span>
                <span style={{ display: "block", color: colors.text, fontWeight: 800 }}>
                  {ranking.targetName}
                  {ranking.sponsored ? (
                    <span style={{ marginLeft: 7 }}>
                      <Badge tone="ACTIVE">Tài trợ</Badge>
                    </span>
                  ) : null}
                </span>
                <span style={{ display: "block", color: colors.muted, marginTop: 4, fontSize: 12 }}>
                  {ranking.targetType} · {ranking.cityCode.toUpperCase()} · {displayCategory(ranking.category)} ·{" "}
                  {ranking.scope} · score {ranking.manualScore}
                </span>
              </span>
              <span style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => editRanking(ranking)} style={buttonStyle("secondary")}>
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  disabled={rankingSavingId === ranking.id}
                  onClick={() => void deleteRanking(ranking.id)}
                  aria-label={`Xóa ranking ${ranking.targetName}`}
                  style={buttonStyle("danger")}
                >
                  <Trash2 size={14} />
                </button>
              </span>
            </div>
          ))}
          {!rankings.length ? <EmptyState>Chưa có cấu hình ranking. Tạo Top đầu tiên ở form bên trái.</EmptyState> : null}
        </div>
      </div>
    </Panel>
  );

  const renderBlog = () => (
    <Panel testId="admin-content-panel">
      <div style={{ padding: 18, borderBottom: `1px solid ${colors.borderSoft}` }}>
        <SectionTitle
          title="Trình soạn thảo nội dung"
          eyebrow="BLOG / POLICY CMS"
          action={
            <button type="button" onClick={resetContentForm} style={buttonStyle("secondary")}>
              <Plus size={15} />
              Viết mới
            </button>
          }
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px,.92fr) minmax(0,1.08fr)", gap: 16, padding: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10, alignContent: "start" }}>
          <Field label="Loại">
            <select
              value={contentForm.type}
              onChange={(event) =>
                setContentForm((current) => ({ ...current, type: event.target.value as CmsContentType }))
              }
              style={inputStyle()}
            >
              <option value="BLOG">Blog</option>
              <option value="POLICY">Chính sách</option>
            </select>
          </Field>
          <Field label="Status">
            <select
              value={contentForm.status}
              onChange={(event) =>
                setContentForm((current) => ({
                  ...current,
                  status: event.target.value as ContentFormState["status"],
                }))
              }
              style={inputStyle()}
            >
              <option value="DRAFT">Nháp</option>
              <option value="PUBLISHED">Đã đăng</option>
              <option value="ARCHIVED">Lưu trữ</option>
            </select>
          </Field>
          <Field label="Tiêu đề" wide>
            <input
              value={contentForm.title}
              onChange={(event) => setContentForm((current) => ({ ...current, title: event.target.value }))}
              style={inputStyle()}
            />
          </Field>
          <Field label="Slug">
            <input
              value={contentForm.slug}
              onChange={(event) => setContentForm((current) => ({ ...current, slug: event.target.value }))}
              style={inputStyle()}
            />
          </Field>
          <Field label="Published at">
            <input
              type="datetime-local"
              value={contentForm.publishedAt}
              onChange={(event) => setContentForm((current) => ({ ...current, publishedAt: event.target.value }))}
              style={inputStyle()}
            />
          </Field>
          <Field label="Chuyên mục">
            <input
              value={contentForm.category}
              onChange={(event) => setContentForm((current) => ({ ...current, category: event.target.value }))}
              style={inputStyle()}
            />
          </Field>
          <Field label="Tags">
            <input
              value={contentForm.tags}
              onChange={(event) => setContentForm((current) => ({ ...current, tags: event.target.value }))}
              style={inputStyle()}
            />
          </Field>
          <Field label="Excerpt" wide>
            <textarea
              value={contentForm.excerpt}
              onChange={(event) => setContentForm((current) => ({ ...current, excerpt: event.target.value }))}
              rows={3}
              style={inputStyle({ padding: 12, minHeight: 82, resize: "vertical" })}
            />
          </Field>
          <Field label="Ảnh bìa">
            <input
              value={contentForm.image}
              onChange={(event) => setContentForm((current) => ({ ...current, image: event.target.value }))}
              style={inputStyle()}
            />
          </Field>
          <Field label="Alt ảnh">
            <input
              value={contentForm.imageAlt}
              onChange={(event) => setContentForm((current) => ({ ...current, imageAlt: event.target.value }))}
              style={inputStyle()}
            />
          </Field>
          <Field label="Nội dung" wide>
            <textarea
              value={contentForm.body}
              onChange={(event) => setContentForm((current) => ({ ...current, body: event.target.value }))}
              rows={8}
              style={inputStyle({ padding: 12, minHeight: 180, resize: "vertical", lineHeight: 1.55 })}
            />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
            <input
              type="checkbox"
              checked={contentForm.noindex}
              onChange={(event) => setContentForm((current) => ({ ...current, noindex: event.target.checked }))}
            />
            Noindex
          </label>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              disabled={contentSavingId !== null}
              onClick={() => void saveContent()}
              style={buttonStyle("primary")}
            >
              <Save size={15} />
              {editingContentId ? "Lưu content" : "Tạo content"}
            </button>
            <button type="button" onClick={resetContentForm} style={buttonStyle("secondary")}>
              Hủy
            </button>
          </div>
          <div style={{ gridColumn: "1 / -1", color: colors.muted, fontSize: 12 }}>{contentStatusMessage}</div>
        </div>

        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          {contentItems.map((content) => (
            <div
              key={content.id}
              data-testid="admin-content-row"
              style={{
                border: `1px solid ${colors.borderSoft}`,
                borderRadius: 13,
                background: colors.surface2,
                padding: 12,
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span>
                <span style={{ display: "block", color: colors.text, fontWeight: 800 }}>{content.title}</span>
                <span style={{ display: "block", color: colors.muted, marginTop: 4, fontSize: 12 }}>
                  /{content.type === "BLOG" ? "blog" : "legal"}/{content.slug} · {content.status} ·{" "}
                  {content.publishedAt ? new Date(content.publishedAt).toLocaleDateString("vi-VN") : "chưa đăng"}
                </span>
              </span>
              <span style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => editContent(content)} style={buttonStyle("secondary")}>
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  disabled={contentSavingId === content.id}
                  onClick={() => void deleteContent(content.id)}
                  aria-label={`Xóa content ${content.title}`}
                  style={buttonStyle("danger")}
                >
                  <Trash2 size={14} />
                </button>
              </span>
            </div>
          ))}
          {!contentItems.length ? <EmptyState>Chưa có content CMS. Tạo blog hoặc chính sách ở form bên trái.</EmptyState> : null}
        </div>
      </div>
    </Panel>
  );

  const renderReports = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 14 }}>
        <MetricCard
          icon={BarChart3}
          label="Gross"
          value={compactMoney(revenueReport.totals.grossVnd)}
          note="subtotal trước giảm"
          hot
        />
        <MetricCard
          icon={ReceiptText}
          label="Net"
          value={compactMoney(revenueReport.totals.netVnd)}
          note="gross - discount"
        />
        <MetricCard
          icon={ReceiptText}
          label="Payable"
          value={compactMoney(revenueReport.totals.payableVnd)}
          note="net + fee/tax"
        />
        <MetricCard
          icon={TicketPercent}
          label="Discount"
          value={compactMoney(revenueReport.totals.discountVnd)}
          note="ưu đãi đã trừ"
        />
        <MetricCard
          icon={ShieldCheck}
          label="Commission"
          value={compactMoney(revenueReport.totals.commissionVnd)}
          note={`${revenueReport.totals.billCount} bill`}
        />
      </div>

      <Panel testId="admin-revenue-report-panel" style={{ padding: 20 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <SectionTitle title="Report P0: ngày -> quán -> mã giảm giá" eyebrow="BILL USED AT" />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ color: colors.text2, fontSize: 13 }}>
              Lọc theo ngày sử dụng dịch vụ (Bill.usedAt). MVP chỉ tính bill VERIFIED/PAID và nhóm theo ngày - quán - mã giảm giá.
            </div>
            {revenueReportExportEnabled ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                aria-label="Export revenue report Excel"
                onClick={exportRevenueReportExcel}
                style={buttonStyle("secondary")}
              >
                <FileText size={14} />
                Export Excel
              </button>
              <button
                type="button"
                aria-label="Export revenue report PDF"
                onClick={exportRevenueReportPdf}
                style={buttonStyle("secondary")}
              >
                <ReceiptText size={14} />
                Export PDF
              </button>
            </div>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["today", "Hôm nay"],
              ["seven", "7 ngày"],
              ["thirty", "30 ngày"],
              ["month", "Tháng này"],
            ].map(([range, label]) => (
              <button
                key={range}
                type="button"
                aria-label={`Revenue quick range ${range}`}
                onClick={() => applyRevenueQuickRange(range as RevenueReportFilterState["quickRange"])}
                style={{
                  ...buttonStyle(revenueReportDraft.quickRange === range ? "primary" : "secondary"),
                  minHeight: 34,
                }}
              >
                <CalendarCheck size={14} />
                {label}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
              Từ ngày sử dụng
              <input
                aria-label="Revenue report from date"
                type="date"
                value={revenueReportDraft.from}
                onChange={(event) => updateRevenueReportDraft("from", event.target.value)}
                style={inputStyle({ minHeight: 38 })}
              />
            </label>
            <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
              Đến ngày sử dụng
              <input
                aria-label="Revenue report to date"
                type="date"
                value={revenueReportDraft.to}
                onChange={(event) => updateRevenueReportDraft("to", event.target.value)}
                style={inputStyle({ minHeight: 38 })}
              />
            </label>
            <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
              Commission flag
              <select
                aria-label="Revenue report commission flag"
                value={revenueReportDraft.flag}
                onChange={(event) => updateRevenueReportDraft("flag", event.target.value)}
                style={inputStyle({ minHeight: 38 })}
              >
                <option value="all">All flags</option>
                <option value="NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED">Negative commission</option>
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
              Quán
              <select
                aria-label="Revenue report store filter"
                value={revenueReportDraft.storeId}
                onChange={(event) => updateRevenueReportDraft("storeId", event.target.value)}
                style={inputStyle({ minHeight: 38 })}
              >
                <option value="">Tất cả quán</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
              Mã giảm giá
              <select
                aria-label="Revenue report coupon filter"
                value={revenueReportDraft.couponId}
                onChange={(event) => updateRevenueReportDraft("couponId", event.target.value)}
                style={inputStyle({ minHeight: 38 })}
              >
                <option value="">Tất cả mã</option>
                {revenueReportCouponOptions.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.code} - {coupon.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
              Trạng thái tính doanh thu
              <input
                aria-label="Revenue report status filter"
                readOnly
                value={revenueReportIncludedStatuses.join(" / ")}
                style={inputStyle({ minHeight: 38, opacity: 0.82 })}
              />
            </label>
            <div style={{ display: "flex", alignItems: "end", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                aria-label="Apply revenue report date filters"
                onClick={applyRevenueReportFilters}
                style={buttonStyle("primary")}
              >
                <Search size={14} />
                Lọc báo cáo
              </button>
              <button
                type="button"
                aria-label="Clear revenue report date filters"
                onClick={clearRevenueReportFilters}
                style={buttonStyle("secondary")}
              >
                <RefreshCcw size={14} />
                30 ngày
              </button>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
              gap: 8,
              color: colors.text2,
              fontSize: 12,
            }}
          >
            <span title={revenueReport.meta?.formula?.grossVnd ?? "subtotalVnd"}>grossVnd = subtotalVnd / bill gốc</span>
            <span title={revenueReport.meta?.formula?.discountVnd ?? "discountVnd"}>discountVnd = discountVnd</span>
            <span title={revenueReport.meta?.formula?.netVnd ?? "subtotalVnd - discountVnd"}>
              netVnd = subtotalVnd - discountVnd
            </span>
            <span title={revenueReport.meta?.formula?.commissionVnd ?? "commissionAmountVnd"}>
              commissionVnd = commissionAmountVnd
            </span>
          </div>

          {revenueReportBiEnabled ? (
          <div data-testid="admin-revenue-p2-dashboard" style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
              {(revenueReport.funnel ?? []).map((step) => (
                <div
                  key={step.key}
                  style={{
                    border: `1px solid ${colors.borderGold22}`,
                    background: "rgba(255,255,255,.035)",
                    padding: 12,
                    minHeight: 88,
                    display: "grid",
                    gap: 4,
                  }}
                >
                  <span style={{ color: colors.muted, fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>
                    {step.label}
                  </span>
                  <strong style={{ color: colors.text, fontSize: 22 }}>
                    {step.commissionVnd !== undefined ? compactMoney(step.commissionVnd) : step.count.toLocaleString("vi-VN")}
                  </strong>
                  <span style={{ color: colors.text2, fontSize: 12 }}>
                    {step.rateFromPrevious === null ? "base" : `${step.rateFromPrevious}% tu buoc truoc`}
                  </span>
                </div>
              ))}
            </div>
            {revenueReportComparisonCards.length ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10 }}>
                {revenueReportComparisonCards.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      border: `1px solid ${item.metric.delta >= 0 ? "rgba(127,211,160,.22)" : "rgba(224,114,158,.28)"}`,
                      background: item.metric.delta >= 0 ? "rgba(127,211,160,.06)" : "rgba(224,114,158,.07)",
                      padding: 12,
                      display: "grid",
                      gap: 4,
                    }}
                  >
                    <span style={{ color: colors.muted, fontSize: 10, fontWeight: 900, textTransform: "uppercase" }}>
                      {item.label} vs ky truoc
                    </span>
                    <strong style={{ color: colors.text }}>
                      {item.money ? formatMoney(item.metric.current) : item.metric.current.toLocaleString("vi-VN")}
                    </strong>
                    <span style={{ color: item.metric.delta >= 0 ? colors.green : colors.red, fontSize: 12 }}>
                      {item.metric.delta >= 0 ? "+" : ""}
                      {item.money ? formatMoney(item.metric.delta) : item.metric.delta.toLocaleString("vi-VN")}
                      {item.metric.deltaPercent === null ? "" : ` (${item.metric.deltaPercent}%)`}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
            {reversibleBills.length ? (
              <div
                data-testid="admin-bill-reversal-panel"
                style={{
                  border: `1px solid ${colors.borderGold22}`,
                  background: "rgba(224,114,158,.06)",
                  padding: 12,
                  display: "grid",
                  gap: 10,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <strong style={{ color: colors.goldPale, fontSize: 13 }}>
                    Bill reversal tự động
                  </strong>
                  <button
                    type="button"
                    aria-label="Auto reverse high-risk bills"
                    disabled={isAutoReversingBills}
                    onClick={() => void autoReverseHighRiskBills()}
                    style={buttonStyle("danger")}
                  >
                    <RefreshCcw size={14} />
                    {isAutoReversingBills ? "Đang chạy" : "Auto reverse"}
                  </button>
                </div>
                {reversibleBills.slice(0, 5).map((bill) => (
                  <div
                    key={`reverse-${bill.id}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0,1fr) auto",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: colors.text2, fontSize: 12 }}>
                      <b style={{ color: colors.text }}>{bill.billNumber ?? shortCode(bill.id)}</b>{" "}
                      {bill.store.name} · {formatMoney(bill.totalVnd)}
                      {bill.fraudWarnings?.length ? ` · Fraud ${bill.fraudWarnings.length}` : ""}
                    </span>
                    <button
                      type="button"
                      aria-label={`Reverse bill ${bill.billNumber ?? bill.id}`}
                      disabled={reversingBillId === bill.id}
                      onClick={() => void reverseBill(bill)}
                      style={buttonStyle("danger")}
                    >
                      <RefreshCcw size={14} />
                      Reverse
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 }}>
              {revenueReportBreakdownSections.map((section) => (
                <div
                  key={section.key}
                  style={{
                    border: `1px solid ${colors.borderSoft}`,
                    background: "rgba(255,255,255,.028)",
                    padding: 12,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <strong style={{ color: colors.goldPale, fontSize: 13 }}>{section.title}</strong>
                  {section.items.length ? (
                    section.items.slice(0, 4).map((item) => (
                      <div key={`${section.key}-${item.id ?? item.code}`} style={{ display: "grid", gap: 3 }}>
                        <span style={{ color: colors.text, fontSize: 12, fontWeight: 800 }}>
                          {item.code} - {item.name}
                        </span>
                        <span style={{ color: colors.muted, fontSize: 11 }}>
                          {item.billCount} bill · Net {formatMoney(item.netVnd)} · Commission {formatMoney(item.commissionVnd)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span style={{ color: colors.muted, fontSize: 12 }}>Chua co du lieu</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          ) : null}

          {revenueReport.days.length ? (
            <div style={{ display: "grid", gap: 14 }}>
              {revenueReport.days.map((day) => (
                <div
                  key={day.date}
                  style={{
                    border: `1px solid ${colors.borderGold22}`,
                    background: "rgba(255,255,255,.03)",
                    padding: 14,
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <strong style={{ color: colors.text, fontSize: 16 }}>{day.date}</strong>
                      <div style={{ color: colors.muted, fontSize: 12, marginTop: 3 }}>
                        {day.stores.length} quán · {day.billCount} bill · {compactMoney(day.grossVnd)} gross
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: colors.text2, fontSize: 12 }}>
                      <span>Net: <b style={{ color: colors.goldBright }}>{formatMoney(day.netVnd)}</b></span>
                      <span>Payable: <b style={{ color: colors.goldBright }}>{formatMoney(day.payableVnd)}</b></span>
                      <span>Discount: <b style={{ color: colors.goldBright }}>{formatMoney(day.discountVnd)}</b></span>
                      <span>Commission: <b style={{ color: colors.goldBright }}>{formatMoney(day.commissionVnd)}</b></span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,.08)" }}>
                    <div
                      style={{
                        width: `${Math.max(5, Math.round((day.grossVnd / revenueReportMaxGross) * 100))}%`,
                        height: "100%",
                        background: colors.goldGrad,
                      }}
                    />
                  </div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {day.stores.map((store) => (
                      <div
                        key={`${day.date}-${store.store.id}`}
                        style={{
                          borderTop: `1px solid ${colors.borderSoft}`,
                          paddingTop: 10,
                          display: "grid",
                          gap: 8,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                          <strong style={{ color: colors.goldPale }}>{store.store.name}</strong>
                          <span style={{ color: colors.text2, fontSize: 12 }}>
                            Gross {formatMoney(store.grossVnd)} · Net {formatMoney(store.netVnd)} · Payable{" "}
                            {formatMoney(store.payableVnd)} · Commission{" "}
                            {formatMoney(store.commissionVnd)}
                          </span>
                        </div>
                        <div style={{ minWidth: 840, overflowX: "auto" }}>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1.3fr .55fr .85fr .85fr .85fr .85fr .85fr",
                              gap: 10,
                              color: colors.muted,
                              fontSize: 11,
                              fontWeight: 900,
                              textTransform: "uppercase",
                              padding: "6px 0",
                            }}
                          >
                            <span>Mã giảm giá</span>
                            <span>Bill</span>
                            <span>Gross</span>
                            <span>Discount</span>
                            <span>Net</span>
                            <span>Payable</span>
                            <span>Commission</span>
                          </div>
                          {store.coupons.map((coupon) => {
                            const couponKey = `${day.date}-${store.store.id}-${coupon.coupon.id ?? coupon.coupon.code}`;
                            const isExpanded = expandedRevenueCouponKey === couponKey;

                            return (
                              <React.Fragment key={couponKey}>
                                <div
                                  style={{
                                    display: "grid",
                                    gridTemplateColumns: "1.3fr .55fr .85fr .85fr .85fr .85fr .85fr",
                                    gap: 10,
                                    color: colors.text2,
                                    fontSize: 12,
                                    padding: "7px 0",
                                    borderTop: `1px solid ${colors.borderSoft}`,
                                    alignItems: "center",
                                  }}
                                >
                                  <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                    <button
                                      type="button"
                                      aria-label={`Revenue coupon drilldown ${coupon.coupon.code}`}
                                      onClick={() => setExpandedRevenueCouponKey(isExpanded ? null : couponKey)}
                                      style={{ ...buttonStyle("secondary"), minHeight: 30, width: 34, padding: 0 }}
                                    >
                                      <ChevronRight
                                        size={14}
                                        style={{ transform: isExpanded ? "rotate(90deg)" : "none" }}
                                      />
                                    </button>
                                    <span>
                                      <b style={{ color: colors.text }}>{coupon.coupon.code}</b>
                                      <span style={{ display: "block", color: colors.muted }}>{coupon.coupon.name}</span>
                                    </span>
                                  </span>
                                  <span>{coupon.billCount}</span>
                                  <span>{formatMoney(coupon.grossVnd)}</span>
                                  <span>{formatMoney(coupon.discountVnd)}</span>
                                  <span>{formatMoney(coupon.netVnd)}</span>
                                  <span>{formatMoney(coupon.payableVnd)}</span>
                                  <span>{formatMoney(coupon.commissionVnd)}</span>
                                </div>
                                {isExpanded && coupon.bills?.length ? (
                                  <div
                                    style={{
                                      borderTop: `1px solid ${colors.borderSoft}`,
                                      background: "rgba(255,255,255,.025)",
                                      padding: "8px 10px",
                                      display: "grid",
                                      gap: 6,
                                    }}
                                  >
                                    {coupon.bills.map((bill) => (
                                      <div
                                        key={bill.id}
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns: "1.25fr .8fr .8fr .8fr .8fr .8fr",
                                          gap: 10,
                                          color: colors.text2,
                                          fontSize: 12,
                                        }}
                                      >
                                        <span style={{ color: colors.text }}>{bill.billNumber ?? shortCode(bill.id)}</span>
                                        <span>{new Date(bill.usedAt).toLocaleString("vi-VN")}</span>
                                        <span>{bill.status}</span>
                                        <span>{formatMoney(bill.netVnd)}</span>
                                        <span>{formatMoney(bill.payableVnd)}</span>
                                        <span>{formatMoney(bill.commissionVnd)}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState>Chưa có bill VERIFIED/PAID trong khoảng ngày sử dụng đã chọn.</EmptyState>
          )}
        </div>
      </Panel>

      {revenueReportBiEnabled ? (
      <Panel style={{ padding: 20 }}>
        <SectionTitle title="Funnel đối soát" eyebrow="BOOKING / COUPON / BILL" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(130px,1fr))", gap: 10, marginTop: 14 }}>
          {reconciliationFunnel.map((step, index) => (
            <div
              key={step.label}
              style={{
                minHeight: 92,
                borderLeft: `3px solid ${index === reconciliationFunnel.length - 1 ? colors.green : colors.gold}`,
                background: "rgba(255,255,255,.035)",
                padding: "12px 12px 10px",
                display: "grid",
                gap: 4,
              }}
            >
              <span style={{ color: colors.muted, fontSize: 11, fontWeight: 900, textTransform: "uppercase" }}>{step.label}</span>
              <strong style={{ color: colors.text, fontSize: 24 }}>{step.value}</strong>
              <span style={{ color: colors.text2, fontSize: 12 }}>{step.note}</span>
            </div>
          ))}
        </div>
        {reconciliationWarnings.length ? (
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {reconciliationWarnings.map((warning) => (
              <div
                key={warning.id}
                style={{
                  border: `1px solid rgba(224,114,158,.26)`,
                  background: "rgba(224,114,158,.08)",
                  padding: "10px 12px",
                  color: colors.text2,
                  fontSize: 12,
                }}
              >
                <strong style={{ color: colors.neonPink, display: "block", marginBottom: 3 }}>{warning.title}</strong>
                {warning.detail}
              </div>
            ))}
          </div>
        ) : null}
      </Panel>
      ) : null}
    </div>
  );

  const renderMembership = () => (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(170px,1fr))", gap: 14 }}>
        <MetricCard icon={UsersRound} label="Guest" value="8.420" note="khách vãng lai" />
        <MetricCard icon={Star} label="Member" value="1.260" note="đã tích điểm" hot />
        <MetricCard icon={ShieldCheck} label="VIP" value="184" note="hạng cao nhất" />
      </div>
      <Panel>
        <div style={{ padding: 18 }}>
          <SectionTitle title="Hội viên & điểm" eyebrow="MEMBER LEDGER" />
        </div>
        <div style={{ minWidth: 760, overflowX: "auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr .8fr .8fr 1fr",
              padding: "12px 18px",
              color: colors.muted,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1,
              textTransform: "uppercase",
              borderTop: `1px solid ${colors.borderSoft}`,
              borderBottom: `1px solid ${colors.borderSoft}`,
            }}
          >
            <span>Tên</span>
            <span>Hạng</span>
            <span>Điểm</span>
            <span>Hết hạn điểm</span>
          </div>
          {sampleMembers.map(([name, tier, points, expiry]) => (
            <div
              key={name}
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr .8fr .8fr 1fr",
                padding: "13px 18px",
                borderBottom: `1px solid ${colors.borderSoft}`,
                color: colors.text2,
                fontSize: 13,
                alignItems: "center",
              }}
            >
              <span style={{ color: colors.text, fontWeight: 800 }}>{name}</span>
              <Badge tone={tier}>{tier}</Badge>
              <span>{points}</span>
              <span>{expiry}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );

  const renderActiveView = () => {
    switch (activeView) {
      case "booking":
        return renderBooking();
      case "bill":
        return renderBill();
      case "partners":
        return renderPartners();
      case "stores":
        return renderStores();
      case "cast":
        return renderCast();
      case "campaign":
        return renderCampaign();
      case "blog":
        return renderBlog();
      case "ranking":
        return renderRanking();
      case "reports":
        return renderReports();
      case "membership":
        return renderMembership();
      case "dashboard":
      default:
        return renderDashboard();
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left,rgba(212,178,106,.08),transparent 32%), #0c0c0f",
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        minWidth: 1180,
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "268px minmax(0,1fr)", minHeight: "100vh" }}>
        <AdminSidebar activeView={activeView} counts={counts} onLogout={logout} />
        <div style={{ minWidth: 0, background: "rgba(255,255,255,.012)" }}>
          <AdminTopbar activeView={activeView} statusMessage={statusMessage} onRefresh={() => void loadAdminData()} />
          <div style={{ padding: "24px 28px 38px", display: "grid", gap: 18 }}>{renderActiveView()}</div>
        </div>
      </div>

      {selectedRequestForDiff ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-diff-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 90,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(0,0,0,.75)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: "min(100%, 860px)",
              maxHeight: "90vh",
              border: `1px solid ${colors.borderGold32}`,
              borderRadius: 14,
              background: "#121216",
              boxShadow: "0 24px 70px rgba(0,0,0,.55)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${colors.borderSoft}`, paddingBottom: 12 }}>
              <h2 id="admin-diff-modal-title" style={{ margin: 0, color: colors.goldBright, fontSize: 19 }}>
                So sánh thay đổi hồ sơ: {selectedRequestForDiff.businessName}
              </h2>
              <button
                type="button"
                onClick={() => setSelectedRequestForDiff(null)}
                style={{ background: "none", border: "none", color: colors.text, fontSize: 20, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: 10, paddingRight: 6 }}>
              {renderDiffRow(
                "Tên cơ sở",
                selectedRequestForDiff.originalStore?.name,
                selectedRequestForDiff.businessName,
                selectedRequestForDiff.businessName !== selectedRequestForDiff.originalStore?.name
              )}
              {renderDiffRow(
                "Loại hình (Category)",
                selectedRequestForDiff.originalStore?.category,
                selectedRequestForDiff.businessType,
                selectedRequestForDiff.businessType !== selectedRequestForDiff.originalStore?.category
              )}
              {renderDiffRow(
                "Khu vực",
                selectedRequestForDiff.originalStore
                  ? [selectedRequestForDiff.originalStore.district, selectedRequestForDiff.originalStore.city].filter(Boolean).join(", ")
                  : "",
                selectedRequestForDiff.area,
                selectedRequestForDiff.area !== (selectedRequestForDiff.originalStore
                  ? [selectedRequestForDiff.originalStore.district, selectedRequestForDiff.originalStore.city].filter(Boolean).join(", ")
                  : "")
              )}
              {renderDiffRow(
                "Mô tả cơ sở",
                selectedRequestForDiff.originalStore?.description,
                selectedRequestForDiff.storeDescription,
                selectedRequestForDiff.storeDescription !== selectedRequestForDiff.originalStore?.description
              )}
              {renderDiffRow(
                "Địa chỉ chi tiết",
                selectedRequestForDiff.originalStore?.address,
                selectedRequestForDiff.storeAddress,
                selectedRequestForDiff.storeAddress !== selectedRequestForDiff.originalStore?.address
              )}
              {renderDiffRow(
                "Thành phố",
                selectedRequestForDiff.originalStore?.city,
                selectedRequestForDiff.storeCity,
                selectedRequestForDiff.storeCity !== selectedRequestForDiff.originalStore?.city
              )}
              {renderDiffRow(
                "Quận/Huyện",
                selectedRequestForDiff.originalStore?.district,
                selectedRequestForDiff.storeDistrict,
                selectedRequestForDiff.storeDistrict !== selectedRequestForDiff.originalStore?.district
              )}
              {renderDiffRow(
                "Số điện thoại liên hệ",
                selectedRequestForDiff.originalStore?.phone,
                selectedRequestForDiff.contactPhone,
                selectedRequestForDiff.contactPhone !== selectedRequestForDiff.originalStore?.phone
              )}
              {renderDiffRow(
                "Giờ mở cửa",
                typeof selectedRequestForDiff.originalStore?.openingHours === "object"
                  ? JSON.stringify(selectedRequestForDiff.originalStore?.openingHours)
                  : String(selectedRequestForDiff.originalStore?.openingHours || ""),
                selectedRequestForDiff.openingHours,
                selectedRequestForDiff.openingHours !== (typeof selectedRequestForDiff.originalStore?.openingHours === "object"
                  ? JSON.stringify(selectedRequestForDiff.originalStore?.openingHours)
                  : String(selectedRequestForDiff.originalStore?.openingHours || ""))
              )}
              {renderDiffRow(
                "Menu Summary",
                typeof selectedRequestForDiff.originalStore?.pricingInfo === "object"
                  ? JSON.stringify(selectedRequestForDiff.originalStore?.pricingInfo)
                  : String(selectedRequestForDiff.originalStore?.pricingInfo || ""),
                selectedRequestForDiff.menuSummary,
                selectedRequestForDiff.menuSummary !== (typeof selectedRequestForDiff.originalStore?.pricingInfo === "object"
                  ? JSON.stringify(selectedRequestForDiff.originalStore?.pricingInfo)
                  : String(selectedRequestForDiff.originalStore?.pricingInfo || ""))
              )}
              {renderMediaDiffRow(
                "Hình ảnh (Media)",
                selectedRequestForDiff.originalStore?.media?.map((m) => m.url) || [],
                selectedRequestForDiff.mediaUrls || [],
                JSON.stringify(selectedRequestForDiff.mediaUrls) !== JSON.stringify(selectedRequestForDiff.originalStore?.media?.map((m) => m.url) || [])
              )}
            </div>

            <div style={{ borderTop: `1px solid ${colors.borderSoft}`, paddingTop: 16, display: "grid", gap: 12 }}>
              <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
                Lý do duyệt / từ chối
                <input
                  value={diffModalReason}
                  onChange={(e) => setDiffModalReason(e.target.value)}
                  placeholder="Nhập lý do review..."
                  style={inputStyle({ minHeight: 38 })}
                />
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setSelectedRequestForDiff(null)}
                  style={buttonStyle("secondary")}
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  disabled={selectedRequestForDiff.status !== "PENDING_REVIEW" || reviewingPartnerRequestId === selectedRequestForDiff.id}
                  onClick={() => void reviewPartnerRequest(selectedRequestForDiff.id, false, diffModalReason)}
                  style={buttonStyle("danger")}
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  disabled={selectedRequestForDiff.status !== "PENDING_REVIEW" || reviewingPartnerRequestId === selectedRequestForDiff.id}
                  onClick={() => void reviewPartnerRequest(selectedRequestForDiff.id, true, diffModalReason)}
                  style={buttonStyle("primary")}
                >
                  Duyệt
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {cancelBookingTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-cancel-booking-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(0,0,0,.68)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: "min(100%, 420px)",
              border: `1px solid ${colors.borderGold32}`,
              borderRadius: 14,
              background: "#121216",
              boxShadow: "0 24px 70px rgba(0,0,0,.48)",
              padding: 20,
            }}
          >
            <h2 id="admin-cancel-booking-title" style={{ margin: 0, color: colors.goldBright, fontSize: 19 }}>
              Hủy booking thay khách
            </h2>
            <p style={{ margin: "10px 0 0", color: colors.text2, fontSize: 13, lineHeight: 1.6 }}>
              Booking của {bookingGuestLabel(cancelBookingTarget)} tại {cancelBookingTarget.store.name}. Lý do sẽ được lưu vào audit log và notification.
            </p>
            <Field label="Lý do hủy">
              <textarea
                value={cancelBookingReason}
                onChange={(event) => setCancelBookingReason(event.target.value)}
                rows={4}
                maxLength={300}
                placeholder="Ví dụ: khách báo đổi lịch qua LINE OA"
                style={inputStyle({ padding: 12, minHeight: 104, resize: "vertical", marginTop: 8 })}
              />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              <button type="button" onClick={closeCancelBookingDialog} disabled={Boolean(cancelingBookingId)} style={buttonStyle("secondary")}>
                Quay lại
              </button>
              <button type="button" onClick={() => void submitAdminCancelBooking()} disabled={Boolean(cancelingBookingId)} style={buttonStyle("danger")}>
                {cancelingBookingId ? "Đang hủy" : "Xác nhận hủy"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {adminChatBooking ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-booking-chat-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            display: "grid",
            placeItems: "center",
            padding: 18,
            background: "rgba(0,0,0,.68)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              width: "min(100%, 460px)",
              border: `1px solid ${colors.borderGold32}`,
              borderRadius: 14,
              background: "#121216",
              boxShadow: "0 24px 70px rgba(0,0,0,.48)",
              padding: 20,
            }}
          >
            <h2 id="admin-booking-chat-title" style={{ margin: 0, color: colors.goldBright, fontSize: 19 }}>
              Chat booking
            </h2>
            <p style={{ margin: "10px 0 0", color: colors.text2, fontSize: 13 }}>
              {bookingGuestLabel(adminChatBooking)} · {adminChatBooking.store.name}
            </p>
            <div
              style={{
                maxHeight: 280,
                overflow: "auto",
                display: "grid",
                gap: 8,
                marginTop: 14,
                padding: 10,
                border: `1px solid ${colors.borderSoft}`,
                borderRadius: 12,
                background: "rgba(0,0,0,.18)",
              }}
            >
              {adminChatLoading ? <span style={{ color: colors.muted, fontSize: 12 }}>Đang tải tin nhắn...</span> : null}
              {!adminChatLoading && adminChatMessages.length === 0 ? (
                <span style={{ color: colors.muted, fontSize: 12 }}>Chưa có tin nhắn.</span>
              ) : null}
              {adminChatMessages.map((item) => {
                const fromStaff = item.senderType === "ADMIN" || item.senderType === "OPERATOR";
                return (
                  <div
                    key={item.id}
                    style={{
                      width: "min(88%, 310px)",
                      justifySelf: fromStaff ? "end" : "start",
                      border: `1px solid ${fromStaff ? colors.borderGold32 : colors.borderSoft}`,
                      borderRadius: 12,
                      background: fromStaff ? "rgba(212,178,106,.12)" : colors.surface2,
                      padding: "9px 10px",
                    }}
                  >
                    <div style={{ color: colors.gold, fontSize: 10, fontWeight: 900 }}>{item.senderType}</div>
                    <div style={{ marginTop: 4, color: colors.text, fontSize: 12.5 }}>{item.body}</div>
                  </div>
                );
              })}
            </div>
            <Field label="Tin nhắn">
              <textarea
                value={adminChatInput}
                onChange={(event) => setAdminChatInput(event.target.value)}
                rows={3}
                maxLength={800}
                placeholder="Nhập nội dung phản hồi khách..."
                style={inputStyle({ padding: 12, minHeight: 92, resize: "vertical", marginTop: 8 })}
              />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 18 }}>
              <button type="button" onClick={closeAdminBookingChat} disabled={adminChatSending} style={buttonStyle("secondary")}>
                Đóng
              </button>
              <button
                type="button"
                onClick={() => void sendAdminChatMessage()}
                disabled={adminChatSending || !adminChatInput.trim()}
                style={buttonStyle("primary")}
              >
                {adminChatSending ? "Đang gửi" : "Gửi tin"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {promptData?.isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.7)" }}>
          <div style={{ background: "#202028", padding: "24px", borderRadius: "12px", width: "90%", maxWidth: "400px", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 style={{ marginTop: 0, color: "#f3f0ea", fontSize: "16px" }}>{promptData.title}</h3>
            <input 
              autoFocus
              style={{ width: "100%", padding: "10px", marginTop: "12px", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} 
              value={promptInputValue} 
              onChange={e => setPromptInputValue(e.target.value)} 
              onKeyDown={e => {
                if (e.key === "Enter") promptData.onSubmit(promptInputValue);
                if (e.key === "Escape") promptData.onCancel();
              }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button onClick={promptData.onCancel} style={{ padding: "8px 16px", borderRadius: "6px", background: "rgba(255,255,255,0.1)", color: "#f3f0ea", border: "none", cursor: "pointer" }}>Hủy</button>
              <button onClick={() => promptData.onSubmit(promptInputValue)} style={{ padding: "8px 16px", borderRadius: "6px", background: "#d4b26a", color: "#241a0a", border: "none", fontWeight: "bold", cursor: "pointer" }}>Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
