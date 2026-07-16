"use client";

import { ConfigProvider, Select } from "antd";
import enUS from "antd/locale/en_US";
import jaJP from "antd/locale/ja_JP";
import koKR from "antd/locale/ko_KR";
import viVN from "antd/locale/vi_VN";
import zhCN from "antd/locale/zh_CN";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { ApiError, translateApiMessage } from "@/lib/api/client";
import {
  billApi,
  type BillOcrPreview,
  type BillRecord,
  type BillStoreOption,
} from "@/lib/api/bills";
import { bookingApi, getLastBooking, type BookingRecord } from "@/lib/api/bookings";
import { couponApi, type CouponIssue } from "@/lib/api/coupons";
import { useMoneyFormatter } from "@/components/providers/CurrencyProvider";
import {
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";
import { translateText } from "@/lib/i18n/client-translations";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

const antdLocaleByLanguage: Record<LanguageCode, typeof viVN> = {
  vi: viVN,
  en: enUS,
  ja: jaJP,
  ko: koKR,
  zh: zhCN,
};

const billPickerTheme = {
  token: {
    colorPrimary: "var(--vy-gold)",
    colorBgContainer: "var(--vy-surface-3)",
    colorBgElevated: "var(--vy-surface)",
    colorBorder: "var(--vy-border-gold-22)",
    colorText: "var(--vy-text)",
    colorTextPlaceholder: "var(--vy-faint)",
    colorTextDisabled: "var(--vy-muted)",
    borderRadius: 8,
    controlHeight: 48,
    fontFamily: "inherit",
  },
  components: {
    Select: {
      activeBorderColor: "var(--vy-gold)",
      hoverBorderColor: "var(--vy-border-gold-40)",
      optionActiveBg: "var(--vy-gold-soft-bg)",
      optionSelectedBg: "var(--vy-gold-soft-bg)",
      optionSelectedColor: "var(--vy-gold-hi)",
    },
  },
} as const;

const tenDaysMs = 10 * 24 * 60 * 60 * 1000;
const maxBillTotalVnd = 100_000_000;
const maxEvidenceSizeBytes = 25 * 1024 * 1024;
const allowedEvidenceMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);
const allowedEvidenceExtension = /\.(jpe?g|png|webp|gif|pdf)$/i;

type FormNotice =
  | { tone: "success"; message: string; bill?: BillRecord }
  | { tone: "warning" | "danger"; message: string };

const billPageCopy: Record<string, Partial<Record<LanguageCode, string>>> = {
  "Đối soát hóa đơn": {
    en: "Bill reconciliation",
    ja: "請求書の照合",
    ko: "영수증 정산",
    zh: "账单对账",
  },
  "Gửi hóa đơn gốc để quản trị viên đối soát điểm, ưu đãi và công nợ với quán.": {
    en: "Submit the original bill so the team can reconcile points, deals, and venue payables.",
    ja: "原本の請求書を送信すると、ポイント、特典、店舗精算を確認できます。",
    ko: "원본 영수증을 제출하면 포인트, 혜택, 매장 정산을 확인할 수 있습니다.",
    zh: "提交原始账单，用于核对积分、优惠和店铺结算。",
  },
  "Quán / cơ sở": {
    en: "Venue / business",
    ja: "店舗 / 施設",
    ko: "매장 / 업소",
    zh: "店铺 / 场所",
  },
  "Chưa có quán đã đặt": {
    en: "No booked venue yet",
    ja: "予約済み店舗はまだありません",
    ko: "예약한 매장이 아직 없습니다",
    zh: "暂无已预约店铺",
  },
  "Bạn cần đặt chỗ ở một quán trước khi gửi hóa đơn.": {
    en: "You need a reservation at a venue before submitting a bill.",
    ja: "請求書を送信する前に、店舗の予約が必要です。",
    ko: "영수증을 제출하려면 먼저 매장을 예약해야 합니다.",
    zh: "提交账单前需要先预约一家店铺。",
  },
  "Liên kết đặt chỗ": {
    en: "Linked reservation",
    ja: "予約に紐付け",
    ko: "예약 연결",
    zh: "关联预约",
  },
  "Không liên kết đặt chỗ": {
    en: "No linked reservation",
    ja: "予約に紐付けない",
    ko: "예약 연결 없음",
    zh: "不关联预约",
  },
  "Đặt chỗ": {
    en: "Reservation",
    ja: "予約",
    ko: "예약",
    zh: "预约",
  },
  "Đã liên kết": {
    en: "Linked",
    ja: "連携済み",
    ko: "연결됨",
    zh: "已关联",
  },
  "Đặt chỗ đang gắn với hóa đơn": {
    en: "Reservation linked to this bill",
    ja: "この請求書に紐付いた予約",
    ko: "이 영수증에 연결된 예약",
    zh: "与此账单关联的预约",
  },
  "Đơn hàng đang liên kết": {
    en: "Linked order",
    ja: "連携中の注文",
    ko: "연결된 주문",
    zh: "关联订单",
  },
  "Mã đặt chỗ": {
    en: "Reservation code",
    ja: "予約コード",
    ko: "예약 코드",
    zh: "预约码",
  },
  "Giờ hẹn": {
    en: "Appointment time",
    ja: "予約時間",
    ko: "예약 시간",
    zh: "预约时间",
  },
  "Xác nhận sử dụng": {
    en: "Usage confirmation",
    ja: "利用確認",
    ko: "사용 확인",
    zh: "使用确认",
  },
  "Mã ưu đãi/QR": {
    en: "Deal code / QR",
    ja: "特典コード / QR",
    ko: "혜택 코드 / QR",
    zh: "优惠码 / QR",
  },
  "Mức giảm": {
    en: "Discount",
    ja: "割引",
    ko: "할인",
    zh: "折扣",
  },
  "Chưa được xác nhận": {
    en: "Not confirmed yet",
    ja: "未確認",
    ko: "아직 확인되지 않음",
    zh: "尚未确认",
  },
  "QR đặt chỗ": {
    en: "Reservation QR",
    ja: "予約QR",
    ko: "예약 QR",
    zh: "预约二维码",
  },
  "Liên kết mã ưu đãi": {
    en: "Linked deal code",
    ja: "特典コードに紐付け",
    ko: "혜택 코드 연결",
    zh: "关联优惠码",
  },
  "Đã liên kết mã ưu đãi": {
    en: "Deal code linked",
    ja: "特典コード連携済み",
    ko: "혜택 코드 연결됨",
    zh: "已关联优惠码",
  },
  "Không liên kết mã ưu đãi": {
    en: "No linked deal code",
    ja: "特典コードに紐付けない",
    ko: "혜택 코드 연결 없음",
    zh: "不关联优惠码",
  },
  "Mã ưu đãi": {
    en: "Deal code",
    ja: "特典コード",
    ko: "혜택 코드",
    zh: "优惠码",
  },
  "Tổng tiền hóa đơn gốc": {
    en: "Original bill total",
    ja: "原本請求額",
    ko: "원본 영수증 총액",
    zh: "原始账单总额",
  },
  "Vui lòng nhập tổng tiền": {
    en: "Enter total amount",
    ja: "合計金額を入力してください",
    ko: "총액을 입력하세요",
    zh: "请输入总金额",
  },
  "Thời gian xác nhận sử dụng": {
    en: "Confirmed usage time",
    ja: "確認済み利用時間",
    ko: "확인된 사용 시간",
    zh: "已确认使用时间",
  },
  "Chưa có thời gian xác nhận": {
    en: "No confirmed time yet",
    ja: "確認済み時間はまだありません",
    ko: "확인된 시간이 아직 없습니다",
    zh: "暂无确认时间",
  },
  "Nhấn để tải ảnh hoặc file PDF": {
    en: "Tap to upload a photo or PDF",
    ja: "写真またはPDFをアップロード",
    ko: "사진 또는 PDF 업로드",
    zh: "点击上传照片或 PDF",
  },
  "Hỗ trợ JPG, PNG, WEBP, GIF, PDF (Tối đa 25MB)": {
    en: "Supports JPG, PNG, WEBP, GIF, PDF (max 25MB)",
    ja: "JPG、PNG、WEBP、GIF、PDF対応（最大25MB）",
    ko: "JPG, PNG, WEBP, GIF, PDF 지원 (최대 25MB)",
    zh: "支持 JPG、PNG、WEBP、GIF、PDF（最大25MB）",
  },
  "Ảnh xem trước chứng từ": {
    en: "Evidence preview",
    ja: "証明書類のプレビュー",
    ko: "증빙 미리보기",
    zh: "凭证预览",
  },
  "Đọc hóa đơn tự động": {
    en: "Read bill automatically",
    ja: "請求書を自動読み取り",
    ko: "영수증 자동 읽기",
    zh: "自动读取账单",
  },
  "Xóa": {
    en: "Remove",
    ja: "削除",
    ko: "삭제",
    zh: "删除",
  },
  "Gợi ý từ công cụ đọc hóa đơn": {
    en: "Suggestions from bill reader",
    ja: "請求書読み取りツールの提案",
    ko: "영수증 읽기 도구 제안",
    zh: "账单读取工具建议",
  },
  "Độ tin cậy": {
    en: "Confidence",
    ja: "信頼度",
    ko: "신뢰도",
    zh: "可信度",
  },
  "Thời gian trên hóa đơn": {
    en: "Time on bill",
    ja: "請求書上の時間",
    ko: "영수증의 시간",
    zh: "账单上的时间",
  },
  "Không đọc được, cần nhập tay": {
    en: "Could not read, enter manually",
    ja: "読み取れません。手入力してください",
    ko: "읽을 수 없습니다. 직접 입력하세요",
    zh: "无法读取，请手动输入",
  },
  "Không đọc được": {
    en: "Could not read",
    ja: "読み取れません",
    ko: "읽을 수 없습니다",
    zh: "无法读取",
  },
  "Thời gian gửi hệ thống vẫn được lấy từ mốc đã xác nhận.": {
    en: "The submitted usage time still comes from the confirmed timestamp.",
    ja: "送信される利用時間は確認済み時刻から取得されます。",
    ko: "제출되는 사용 시간은 확인된 시각을 기준으로 합니다.",
    zh: "提交的使用时间仍以已确认时间为准。",
  },
  "Chỉ nhập tổng tiền hóa đơn gốc, không nhập chi tiết món/dịch vụ. Thời gian sử dụng lấy từ mốc đã xác nhận; hóa đơn quá 10 ngày sẽ không được nhận.": {
    en: "Enter only the original bill total, not item or service details. Usage time comes from the confirmed timestamp; bills older than 10 days are not accepted.",
    ja: "明細ではなく原本の合計金額のみ入力してください。利用時間は確認済み時刻から取得され、10日を超えた請求書は受付できません。",
    ko: "항목/서비스 내역이 아닌 원본 영수증 총액만 입력하세요. 사용 시간은 확인된 시각을 기준으로 하며, 10일이 지난 영수증은 접수되지 않습니다.",
    zh: "只填写原始账单总额，不填写菜品/服务明细。使用时间取自已确认时间，超过10天的账单不予接收。",
  },
  "Đang gửi hóa đơn...": {
    en: "Submitting bill...",
    ja: "請求書を送信中...",
    ko: "영수증 제출 중...",
    zh: "正在提交账单...",
  },
  "Hóa đơn đã gửi": {
    en: "Submitted bills",
    ja: "送信済み請求書",
    ko: "제출한 영수증",
    zh: "已提交账单",
  },
  "Lịch sử gần đây": {
    en: "Recent history",
    ja: "最近の履歴",
    ko: "최근 내역",
    zh: "最近记录",
  },
  "Bạn chưa gửi hóa đơn nào gần đây.": {
    en: "You have not submitted any bills recently.",
    ja: "最近送信した請求書はありません。",
    ko: "최근 제출한 영수증이 없습니다.",
    zh: "你最近还没有提交账单。",
  },
  "Hóa đơn #": {
    en: "Bill #",
    ja: "請求書 #",
    ko: "영수증 #",
    zh: "账单 #",
  },
  "Quán:": {
    en: "Venue:",
    ja: "店舗:",
    ko: "매장:",
    zh: "店铺：",
  },
  "Tổng tiền:": {
    en: "Total:",
    ja: "合計:",
    ko: "총액:",
    zh: "总金额：",
  },
  "Ngày sử dụng:": {
    en: "Usage date:",
    ja: "利用日:",
    ko: "사용일:",
    zh: "使用日期：",
  },
  "Tài khoản": {
    en: "Account",
    ja: "アカウント",
    ko: "계정",
    zh: "账户",
  },
  "Gửi hóa đơn": {
    en: "Submit bill",
    ja: "請求書を送信",
    ko: "영수증 제출",
    zh: "提交账单",
  },
  "Trong 10 ngày": {
    en: "Within 10 days",
    ja: "10日以内",
    ko: "10일 이내",
    zh: "10天内",
  },
  "Số người": {
    en: "Guests",
    ja: "人数",
    ko: "인원",
    zh: "人数",
  },
  "Tổng tiền": {
    en: "Total",
    ja: "合計金額",
    ko: "총액",
    zh: "总金额",
  },
  "Khuyến khích gửi kèm để duyệt nhanh hơn.": {
    en: "Attach proof to speed up review.",
    ja: "確認を早めるため添付をおすすめします。",
    ko: "빠른 검토를 위해 첨부를 권장합니다.",
    zh: "建议附上凭证以加快审核。",
  },
  "Đang đọc...": {
    en: "Reading...",
    ja: "読み取り中...",
    ko: "읽는 중...",
    zh: "读取中...",
  },
  "Bỏ file": {
    en: "Remove file",
    ja: "ファイルを削除",
    ko: "파일 제거",
    zh: "移除文件",
  },
  "Đã duyệt": {
    en: "Approved",
    ja: "承認済み",
    ko: "승인됨",
    zh: "已通过",
  },
  "Từ chối": {
    en: "Rejected",
    ja: "却下",
    ko: "거절됨",
    zh: "已拒绝",
  },
  "Chờ duyệt": {
    en: "Pending review",
    ja: "確認待ち",
    ko: "검토 대기",
    zh: "待审核",
  },
  "Đã thanh toán": {
    en: "Paid",
    ja: "支払い済み",
    ko: "결제 완료",
    zh: "已支付",
  },
  "Đã hủy": {
    en: "Canceled",
    ja: "キャンセル済み",
    ko: "취소됨",
    zh: "已取消",
  },
  "Đang xử lý": {
    en: "Processing",
    ja: "処理中",
    ko: "처리 중",
    zh: "处理中",
  },
  "QR đặt chỗ đã được đối tác xác nhận": {
    en: "Reservation QR confirmed by the venue",
    ja: "予約QRは店舗で確認済みです",
    ko: "예약 QR이 매장에서 확인되었습니다",
    zh: "预约二维码已由店铺确认",
  },
  "Mã ưu đãi gắn đặt chỗ đã được đối tác xác nhận": {
    en: "Reservation deal code confirmed by the venue",
    ja: "予約に紐付いた特典コードは店舗で確認済みです",
    ko: "예약에 연결된 혜택 코드가 매장에서 확인되었습니다",
    zh: "预约关联的优惠码已由店铺确认",
  },
  "Đặt chỗ đã được quản trị viên xác nhận": {
    en: "Reservation confirmed by the team",
    ja: "予約はチームにより確認済みです",
    ko: "예약이 팀에서 확인되었습니다",
    zh: "预约已由团队确认",
  },
  "Mã ưu đãi đã được đối tác xác nhận": {
    en: "Deal code confirmed by the venue",
    ja: "特典コードは店舗で確認済みです",
    ko: "혜택 코드가 매장에서 확인되었습니다",
    zh: "优惠码已由店铺确认",
  },
  "Chưa có xác nhận sử dụng từ quản trị viên hoặc đối tác": {
    en: "No usage confirmation yet",
    ja: "利用確認はまだありません",
    ko: "아직 사용 확인이 없습니다",
    zh: "暂无使用确认",
  },
  "Chọn đặt chỗ hoặc mã ưu đãi đã được xác nhận": {
    en: "Choose a confirmed reservation or deal code",
    ja: "確認済みの予約または特典コードを選択してください",
    ko: "확인된 예약 또는 혜택 코드를 선택하세요",
    zh: "请选择已确认的预约或优惠码",
  },
  "Đang tải danh sách quán, vui lòng thử lại sau vài giây.": {
    en: "Loading venue list, please try again in a few seconds.",
    ja: "店舗リストを読み込み中です。数秒後にもう一度お試しください。",
    ko: "매장 목록을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.",
    zh: "正在加载店铺列表，请稍后再试。",
  },
  "Bạn cần có ít nhất một lịch đặt chỗ trước khi gửi hóa đơn.": {
    en: "You need at least one reservation before submitting a bill.",
    ja: "請求書を送信する前に、少なくとも1件の予約が必要です。",
    ko: "영수증 제출 전에 예약이 하나 이상 필요합니다.",
    zh: "提交账单前至少需要一个预约。",
  },
  "Vui lòng chọn quán/cơ sở.": {
    en: "Please choose a venue.",
    ja: "店舗を選択してください。",
    ko: "매장을 선택해 주세요.",
    zh: "请选择店铺。",
  },
  "Vui lòng liên kết đặt chỗ hoặc mã ưu đãi đã được quản trị viên hoặc đối tác xác nhận.": {
    en: "Please link a confirmed reservation or deal code.",
    ja: "確認済みの予約または特典コードに紐付けてください。",
    ko: "확인된 예약 또는 혜택 코드를 연결해 주세요.",
    zh: "请关联已确认的预约或优惠码。",
  },
  "Vui lòng nhập tổng tiền hóa đơn gốc.": {
    en: "Please enter the original bill total.",
    ja: "原本請求額を入力してください。",
    ko: "원본 영수증 총액을 입력해 주세요.",
    zh: "请输入原始账单总额。",
  },
  "Tổng tiền hóa đơn gốc phải là số nguyên lớn hơn 0.": {
    en: "Original bill total must be an integer greater than 0.",
    ja: "原本請求額は0より大きい整数で入力してください。",
    ko: "원본 영수증 총액은 0보다 큰 정수여야 합니다.",
    zh: "原始账单总额必须是大于0的整数。",
  },
  "Tổng tiền hóa đơn gốc không được vượt quá 100.000.000đ.": {
    en: "Original bill total cannot exceed 100,000,000 VND.",
    ja: "原本請求額は100,000,000 VNDを超えられません。",
    ko: "원본 영수증 총액은 100,000,000 VND를 초과할 수 없습니다.",
    zh: "原始账单总额不能超过100,000,000越南盾。",
  },
  "Đặt chỗ hoặc mã ưu đãi này chưa có thời gian xác nhận sử dụng.": {
    en: "This reservation or deal code does not have a confirmed usage time yet.",
    ja: "この予約または特典コードには確認済み利用時間がまだありません。",
    ko: "이 예약 또는 혜택 코드에는 아직 확인된 사용 시간이 없습니다.",
    zh: "此预约或优惠码尚无确认使用时间。",
  },
  "Thời gian sử dụng không hợp lệ.": {
    en: "Usage time is invalid.",
    ja: "利用時間が無効です。",
    ko: "사용 시간이 올바르지 않습니다.",
    zh: "使用时间无效。",
  },
  "Đang đồng bộ thời gian, vui lòng thử lại sau vài giây.": {
    en: "Syncing time, please try again in a few seconds.",
    ja: "時間を同期中です。数秒後にもう一度お試しください。",
    ko: "시간을 동기화하는 중입니다. 잠시 후 다시 시도해 주세요.",
    zh: "正在同步时间，请稍后再试。",
  },
  "Thời gian sử dụng không được ở tương lai.": {
    en: "Usage time cannot be in the future.",
    ja: "利用時間は未来にできません。",
    ko: "사용 시간은 미래일 수 없습니다.",
    zh: "使用时间不能是未来时间。",
  },
  "Hóa đơn quá 10 ngày sẽ không được nhận.": {
    en: "Bills older than 10 days are not accepted.",
    ja: "10日を超えた請求書は受付できません。",
    ko: "10일이 지난 영수증은 접수되지 않습니다.",
    zh: "超过10天的账单不予接收。",
  },
  "Ảnh/chứng từ chỉ hỗ trợ JPG, PNG, WEBP, GIF hoặc PDF.": {
    en: "Evidence only supports JPG, PNG, WEBP, GIF, or PDF.",
    ja: "証明書類はJPG、PNG、WEBP、GIF、PDFのみ対応しています。",
    ko: "증빙은 JPG, PNG, WEBP, GIF 또는 PDF만 지원합니다.",
    zh: "凭证仅支持 JPG、PNG、WEBP、GIF 或 PDF。",
  },
  "Ảnh/chứng từ không được vượt quá 25MB.": {
    en: "Evidence cannot exceed 25MB.",
    ja: "証明書類は25MBを超えられません。",
    ko: "증빙은 25MB를 초과할 수 없습니다.",
    zh: "凭证不能超过25MB。",
  },
  "Bạn cần đăng nhập hoặc đăng ký thành viên trước khi gửi hóa đơn.": {
    en: "Please sign in or register as a member before submitting a bill.",
    ja: "請求書を送信する前に、ログインまたは会員登録してください。",
    ko: "영수증을 제출하기 전에 로그인하거나 회원가입해 주세요.",
    zh: "提交账单前请先登录或注册会员。",
  },
  "Chưa gửi được hóa đơn. Vui lòng thử lại.": {
    en: "Could not submit the bill. Please try again.",
    ja: "請求書を送信できませんでした。もう一度お試しください。",
    ko: "영수증을 제출하지 못했습니다. 다시 시도해 주세요.",
    zh: "无法提交账单，请重试。",
  },
  "Công cụ đọc hóa đơn đã gợi ý dữ liệu, vui lòng kiểm tra lại trước khi gửi.": {
    en: "The bill reader suggested data. Please review it before submitting.",
    ja: "請求書読み取りツールがデータを提案しました。送信前に確認してください。",
    ko: "영수증 읽기 도구가 데이터를 제안했습니다. 제출 전에 확인해 주세요.",
    zh: "账单读取工具已给出建议数据，请提交前确认。",
  },
  "Công cụ đọc hóa đơn đã điền tổng tiền. Thời gian sử dụng vẫn lấy từ mốc đã xác nhận.": {
    en: "The bill reader filled the total. Usage time still comes from the confirmed timestamp.",
    ja: "請求書読み取りツールが合計金額を入力しました。利用時間は確認済み時刻から取得されます。",
    ko: "영수증 읽기 도구가 총액을 입력했습니다. 사용 시간은 확인된 시각을 기준으로 합니다.",
    zh: "账单读取工具已填写总金额。使用时间仍取自已确认时间。",
  },
  "Đã liên kết đặt chỗ": {
    en: "Linked reservation",
    ja: "予約を連携しました",
    ko: "예약이 연결되었습니다",
    zh: "已关联预约",
  },
  "Thời gian sử dụng sẽ lấy từ mốc đã xác nhận.": {
    en: "Usage time will come from the confirmed timestamp.",
    ja: "利用時間は確認済み時刻から取得されます。",
    ko: "사용 시간은 확인된 시각을 기준으로 합니다.",
    zh: "使用时间将取自已确认时间。",
  },
  "Hóa đơn đã được gửi, nhưng ảnh hoặc chứng từ chưa tải lên được.": {
    en: "The bill was submitted, but the photo or proof could not be uploaded.",
    ja: "請求書は送信されましたが、写真または証明書類をアップロードできませんでした。",
    ko: "영수증은 제출되었지만 사진 또는 증빙을 업로드하지 못했습니다.",
    zh: "账单已提交，但照片或凭证上传失败。",
  },
  "Đã gửi hóa đơn": {
    en: "Submitted bill",
    ja: "請求書を送信しました",
    ko: "영수증 제출 완료",
    zh: "已提交账单",
  },
  "để quản trị viên duyệt.": {
    en: "for review.",
    ja: "確認待ちです。",
    ko: "검토 대기 중입니다.",
    zh: "等待审核。",
  },
  "tối đa": {
    en: "max",
    ja: "最大",
    ko: "최대",
    zh: "最高",
  },
  "từ": {
    en: "from",
    ja: "最低",
    ko: "최소",
    zh: "满",
  },
};

const localize = (value: string, language: LanguageCode) => {
  if (language === "vi") return value;
  return billPageCopy[value]?.[language] ?? translateText(value, language);
};

const partySizeLabel = (count: number, language: LanguageCode) =>
  ({
    vi: `${count} người`,
    en: `${count} guests`,
    ja: `${count}名`,
    ko: `${count}명`,
    zh: `${count}人`,
  })[language];

const billStatusLabel = (status: string | null | undefined, language: LanguageCode) => {
  switch (status) {
    case "VERIFIED":
      return localize("Đã duyệt", language);
    case "REJECTED":
      return localize("Từ chối", language);
    case "SUBMITTED":
      return localize("Chờ duyệt", language);
    case "PAID":
      return localize("Đã thanh toán", language);
    case "VOIDED":
      return localize("Đã hủy", language);
    default:
      return localize("Đang xử lý", language);
  }
};

const toDatetimeLocalValue = (date: Date) => {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
};

const emptyDateLabel = (language: LanguageCode) =>
  ({
    vi: "Chưa có",
    en: "Not set",
    ja: "未設定",
    ko: "없음",
    zh: "未设置",
  })[language];

const formatDateTime = (value: string | null | undefined, language: LanguageCode) => {
  if (!value) return emptyDateLabel(language);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return emptyDateLabel(language);

  const tzString = date.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
  const tzDate = new Date(tzString);
  const pad = (n: number) => String(n).padStart(2, "0");
  
  const day = pad(tzDate.getDate());
  const month = pad(tzDate.getMonth() + 1);
  const year = tzDate.getFullYear();
  const hours = pad(tzDate.getHours());
  const minutes = pad(tzDate.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
};


const bookingTitle = (booking: BookingRecord) => {
  const storeName = booking.store?.name ?? "NightLife";
  if (!booking.cast) return storeName;
  return `${booking.cast.publicAlias ?? booking.cast.stageName} @ ${storeName}`;
};

const isBookingAdminConfirmedForBill = (booking: BookingRecord | null | undefined) =>
  ["CONFIRMED", "CHECKED_IN", "COMPLETED"].includes(
    String(booking?.status ?? "").toUpperCase(),
  );

const bookingConfirmedUsageAt = (booking: BookingRecord | null | undefined) =>
  booking?.qr?.usedAt ??
  booking?.couponIssue?.usedAt ??
  (isBookingAdminConfirmedForBill(booking)
    ? booking?.confirmedAt ?? booking?.updatedAt ?? null
    : null);

const confirmedUsageSourceLabel = (
  booking: BookingRecord | null,
  couponIssue: CouponIssue | null,
  language: LanguageCode,
) => {
  if (booking?.qr?.usedAt) return localize("QR đặt chỗ đã được đối tác xác nhận", language);
  if (booking?.couponIssue?.usedAt) return localize("Mã ưu đãi gắn đặt chỗ đã được đối tác xác nhận", language);
  if (isBookingAdminConfirmedForBill(booking) && (booking?.confirmedAt || booking?.updatedAt)) {
    return localize("Đặt chỗ đã được quản trị viên xác nhận", language);
  }
  if (couponIssue?.usedAt) return localize("Mã ưu đãi đã được đối tác xác nhận", language);
  if (booking || couponIssue) return localize("Chưa có xác nhận sử dụng từ quản trị viên hoặc đối tác", language);
  return localize("Chọn đặt chỗ hoặc mã ưu đãi đã được xác nhận", language);
};

const sanitizeMoneyInput = (value: string) => value.replace(/[^\d]/g, "");
const parseMoneyInput = (value: string) => Number(sanitizeMoneyInput(value));
const formatMoneyInput = (value: string) => {
  const digits = sanitizeMoneyInput(value);
  return digits ? Number(digits).toLocaleString("vi-VN") : "";
};

const validateEvidenceFile = (file: File | null) => {
  if (!file) return "";

  const hasAllowedMime = allowedEvidenceMimeTypes.has(file.type);
  const hasAllowedExtension = allowedEvidenceExtension.test(file.name);

  if (!hasAllowedMime && !hasAllowedExtension) {
    return "Ảnh/chứng từ chỉ hỗ trợ JPG, PNG, WEBP, GIF hoặc PDF.";
  }

  if (file.size > maxEvidenceSizeBytes) {
    return "Ảnh/chứng từ không được vượt quá 25MB.";
  }

  return "";
};

const validateBillForm = ({
  isLoadingOptions,
  hasBookedStores,
  hasStore,
  hasConfirmedUsageSource,
  amountInput,
  amount,
  usedAt,
  isUsedAtInvalid,
  isFutureUsage,
  isPastDeadline,
  evidenceFile,
  timeReady,
}: {
  isLoadingOptions: boolean;
  hasBookedStores: boolean;
  hasStore: boolean;
  hasConfirmedUsageSource: boolean;
  amountInput: string;
  amount: number;
  usedAt: string;
  isUsedAtInvalid: boolean;
  isFutureUsage: boolean;
  isPastDeadline: boolean;
  evidenceFile: File | null;
  timeReady: boolean;
}) => {
  if (isLoadingOptions) {
    return "Đang tải danh sách quán, vui lòng thử lại sau vài giây.";
  }

  if (!hasBookedStores) {
    return "Bạn cần có ít nhất một lịch đặt chỗ trước khi gửi hóa đơn.";
  }

  if (!hasStore) {
    return "Vui lòng chọn quán/cơ sở.";
  }

  if (!hasConfirmedUsageSource) {
    return "Vui lòng liên kết đặt chỗ hoặc mã ưu đãi đã được quản trị viên hoặc đối tác xác nhận.";
  }

  if (!amountInput.trim()) {
    return "Vui lòng nhập tổng tiền hóa đơn gốc.";
  }

  if (!Number.isSafeInteger(amount) || amount < 1) {
    return "Tổng tiền hóa đơn gốc phải là số nguyên lớn hơn 0.";
  }

  if (amount > maxBillTotalVnd) {
    return "Tổng tiền hóa đơn gốc không được vượt quá 100.000.000đ.";
  }

  if (!usedAt.trim()) {
    return "Đặt chỗ hoặc mã ưu đãi này chưa có thời gian xác nhận sử dụng.";
  }

  if (isUsedAtInvalid) {
    return "Thời gian sử dụng không hợp lệ.";
  }

  if (!timeReady) {
    return "Đang đồng bộ thời gian, vui lòng thử lại sau vài giây.";
  }

  if (isFutureUsage) {
    return "Thời gian sử dụng không được ở tương lai.";
  }

  if (isPastDeadline) {
    return "Hóa đơn quá 10 ngày sẽ không được nhận.";
  }

  return validateEvidenceFile(evidenceFile);
};

const canAttachCouponIssueToBill = (issue: CouponIssue) =>
  issue.status === "USED" && Boolean(issue.usedAt);

const couponIssueOptionLabel = (issue: CouponIssue, language: LanguageCode) => {
  const storeName = issue.coupon.store?.name ?? localize("Mã ưu đãi", language);
  const status = issue.statusLabel ?? issue.status;
  return `${issue.coupon.name} - ${storeName} - ${status}`;
};

type CouponDiscountSource = {
  discountType?: "PERCENT" | "FIXED_AMOUNT" | string;
  discountValue?: number;
  maxDiscountVnd?: number | null;
  minSpendVnd?: number | null;
};

const couponDiscountLabel = (
  coupon: CouponDiscountSource | null | undefined,
  issue: CouponIssue | null | undefined,
  formatMoney: (value: number) => string,
  language: LanguageCode,
) => {
  const snapshot = issue?.discountRuleSnapshot;
  const discountType = snapshot?.type ?? coupon?.discountType;
  const discountValue =
    snapshot?.value ??
    snapshot?.sourceValue ??
    coupon?.discountValue ??
    snapshot?.discountPercent ??
    issue?.discountPercent ??
    null;
  const maxDiscountVnd = snapshot?.maxDiscountVnd ?? coupon?.maxDiscountVnd ?? null;
  const minSpendVnd = snapshot?.minSpendVnd ?? coupon?.minSpendVnd ?? null;

  if (!discountType && !discountValue) return "";

  const mainLabel =
    discountType === "FIXED_AMOUNT"
      ? `-${formatMoney(Number(discountValue ?? 0))}`
      : `-${Number(discountValue ?? 0)}%`;
  const detailParts = [
    typeof maxDiscountVnd === "number" && maxDiscountVnd > 0
      ? `${localize("tối đa", language)} ${formatMoney(maxDiscountVnd)}`
      : "",
    typeof minSpendVnd === "number" && minSpendVnd > 0
      ? `${localize("từ", language)} ${formatMoney(minSpendVnd)}`
      : "",
  ].filter(Boolean);

  return detailParts.length ? `${mainLabel} (${detailParts.join(", ")})` : mainLabel;
};

const bookedStoreOptionsFromBookings = (bookings: BookingRecord[]) => {
  const storesBySlug = new Map<string, BillStoreOption>();

  bookings.forEach((booking) => {
    const store = booking.store;
    if (!store?.slug || storesBySlug.has(store.slug)) return;

    storesBySlug.set(store.slug, {
      id: store.id,
      name: store.name,
      slug: store.slug,
    });
  });

  return Array.from(storesBySlug.values());
};

const cleanApiMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return "Bạn cần đăng nhập hoặc đăng ký thành viên trước khi gửi hóa đơn.";
    }

    return translateApiMessage(error.message, error.status);
  }

  return translateApiMessage(
    error instanceof Error ? error.message : undefined,
    undefined,
    "Chưa gửi được hóa đơn. Vui lòng thử lại.",
  );
};

export default function Page() {
  const searchParams = useSearchParams();
  const activeLanguage = useActiveLanguage();
  const t = useMemo(
    () => (value: string) => localize(value, activeLanguage),
    [activeLanguage],
  );
  const { formatMoney } = useMoneyFormatter(activeLanguage);
  const focusedBillId = searchParams.get("billId") || "";
  const requestedBookingId = searchParams.get("bookingId")?.trim() || "";
  const requestedStoreSlug = searchParams.get("storeSlug")?.trim() || "";
  const [stores, setStores] = useState<BillStoreOption[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [couponIssues, setCouponIssues] = useState<CouponIssue[]>([]);
  const [storeSlug, setStoreSlug] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [couponIssueId, setCouponIssueId] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrPreview, setOcrPreview] = useState<BillOcrPreview | null>(null);
  const [notice, setNotice] = useState<FormNotice | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadingEvidence, setIsReadingEvidence] = useState(false);
  const [submittedBills, setSubmittedBills] = useState<BillRecord[]>([]);
  const [appliedBookingId, setAppliedBookingId] = useState("");
  const [timeWindow, setTimeWindow] = useState({
    nowMs: 0,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleEvidenceFileChange = (input: HTMLInputElement) => {
    const file = input.files?.[0] ?? null;
    const fileError = validateEvidenceFile(file);
    if (fileError) {
      input.value = "";
      setEvidenceFile(null);
      setOcrPreview(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setNotice({ tone: "danger", message: t(fileError) });
      return;
    }

    setNotice(null);
    setEvidenceFile(file);
    setOcrPreview(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const readEvidenceText = async (file: File) => {
    if (
      file.type.startsWith("text/") ||
      file.type === "application/pdf" ||
      /\.(txt|csv|pdf)$/i.test(file.name)
    ) {
      try {
        return (await file.text()).slice(0, 8000);
      } catch {
        return "";
      }
    }

    return "";
  };

  const handleReadEvidence = async () => {
    if (!evidenceFile) return;
    const fileError = validateEvidenceFile(evidenceFile);
    if (fileError) {
      setNotice({ tone: "danger", message: fileError });
      return;
    }

    setIsReadingEvidence(true);
    setNotice(null);
    try {
      const preview = await billApi.previewBillOcr({
        fileName: evidenceFile.name,
        text: await readEvidenceText(evidenceFile),
      });
      setOcrPreview(preview);
      if (preview.suggestions.totalVnd) {
        setAmountInput(preview.suggestions.totalVnd.toLocaleString("vi-VN"));
      }
      setNotice({
        tone: preview.requiresManualReview ? "warning" : "success",
        message: preview.requiresManualReview
          ? t("Công cụ đọc hóa đơn đã gợi ý dữ liệu, vui lòng kiểm tra lại trước khi gửi.")
          : t("Công cụ đọc hóa đơn đã điền tổng tiền. Thời gian sử dụng vẫn lấy từ mốc đã xác nhận."),
      });
    } catch (error) {
      setNotice({ tone: "danger", message: t(cleanApiMessage(error)) });
    } finally {
      setIsReadingEvidence(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      setIsLoadingOptions(true);
      try {
        const [bookingItems, couponIssueItems, billItems] = await Promise.all([
          bookingApi.listMemberBookings().catch(() => [] as BookingRecord[]),
          couponApi.listMemberCouponIssues().catch(() => [] as CouponIssue[]),
          billApi.listMemberBills().catch(() => [] as BillRecord[]),
        ]);

        if (!active) return;
        const rememberedBooking = requestedBookingId ? getLastBooking(requestedBookingId) : null;
        const mergedBookingItems =
          rememberedBooking && !bookingItems.some((booking) => booking.id === rememberedBooking.id)
            ? [rememberedBooking, ...bookingItems]
            : bookingItems;
        const requestedBooking = requestedBookingId
          ? mergedBookingItems.find((booking) => booking.id === requestedBookingId) ?? null
          : null;
        const preferredStoreSlug = requestedBooking?.store?.slug || requestedStoreSlug;
        const bookedStoreItems = bookedStoreOptionsFromBookings(mergedBookingItems);
        const bookedStoreSlugs = new Set(bookedStoreItems.map((storeItem) => storeItem.slug));

        setStores(bookedStoreItems);
        setBookings(mergedBookingItems);
        if (requestedBooking) {
          setBookingId(requestedBooking.id);
        } else if (mergedBookingItems.length === 1 && mergedBookingItems[0]) {
          setBookingId(mergedBookingItems[0].id);
          if (mergedBookingItems[0].store?.slug) {
            setStoreSlug(mergedBookingItems[0].store.slug);
          }
        }
        if (preferredStoreSlug && mergedBookingItems.length !== 1) {
          setStoreSlug(preferredStoreSlug);
        }
        setCouponIssues(
          couponIssueItems.filter((issue) => {
            const issueStoreSlug = issue.coupon.store?.slug;
            return Boolean(
              canAttachCouponIssueToBill(issue) &&
                issueStoreSlug &&
                bookedStoreSlugs.has(issueStoreSlug),
            );
          }),
        );
        setSubmittedBills(billItems);
        setStoreSlug((current) => {
          if (
            preferredStoreSlug &&
            bookedStoreItems.some((storeItem) => storeItem.slug === preferredStoreSlug)
          ) {
            return preferredStoreSlug;
          }

          return current && bookedStoreItems.some((storeItem) => storeItem.slug === current)
            ? current
            : bookedStoreItems[0]?.slug || "";
        });
      } catch (error) {
        if (!active) return;
        setStores([]);
        setBookings([]);
        setCouponIssues([]);
        setSubmittedBills([]);
        setStoreSlug("");
        setNotice({ tone: "danger", message: cleanApiMessage(error) });
      } finally {
        if (active) {
          setIsLoadingOptions(false);
        }
      }
    };

    void loadOptions();

    return () => {
      active = false;
    };
  }, [requestedBookingId, requestedStoreSlug]);

  useEffect(() => {
    const refreshWindow = () => {
      const now = new Date();
      setTimeWindow({
        nowMs: now.getTime(),
      });
    };

    refreshWindow();
    const interval = window.setInterval(refreshWindow, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === bookingId) ?? null,
    [bookingId, bookings],
  );

  useEffect(() => {
    if (!requestedBookingId || requestedBookingId === appliedBookingId) return;

    const booking = bookings.find((item) => item.id === requestedBookingId);
    if (!booking) return;

    queueMicrotask(() => {
      setBookingId(booking.id);
      setCouponIssueId("");
      if (booking.store?.slug) {
        setStoreSlug(booking.store.slug);
      }
      setNotice({
        tone: "success",
        message: `${t("Đã liên kết đặt chỗ")} ${booking.bookingCode}. ${t("Thời gian sử dụng sẽ lấy từ mốc đã xác nhận.")}`,
      });
      setAppliedBookingId(requestedBookingId);
    });
  }, [activeLanguage, appliedBookingId, bookings, requestedBookingId, t]);

  const selectedCouponIssue = useMemo(
    () => couponIssues.find((issue) => issue.id === couponIssueId) ?? null,
    [couponIssueId, couponIssues],
  );

  const confirmedUsageAt = useMemo(() => {
    if (selectedBooking) return bookingConfirmedUsageAt(selectedBooking);
    if (selectedCouponIssue) return selectedCouponIssue.usedAt ?? null;
    return null;
  }, [selectedBooking, selectedCouponIssue]);
  const usedAt = useMemo(
    () => {
      if (!confirmedUsageAt) return "";
      const date = new Date(confirmedUsageAt);
      return Number.isNaN(date.getTime()) ? "" : toDatetimeLocalValue(date);
    },
    [confirmedUsageAt],
  );
  const confirmedUsageLabel = useMemo(
    () => confirmedUsageSourceLabel(selectedBooking, selectedCouponIssue, activeLanguage),
    [activeLanguage, selectedBooking, selectedCouponIssue],
  );

  const selectedStore = useMemo(() => {
    if (selectedBooking?.store?.slug) {
      return stores.find((storeItem) => storeItem.slug === selectedBooking.store?.slug) ?? null;
    }

    if (selectedCouponIssue?.coupon.store?.slug) {
      return (
        stores.find((storeItem) => storeItem.slug === selectedCouponIssue.coupon.store?.slug) ??
        null
      );
    }

    return stores.find((storeItem) => storeItem.slug === storeSlug) ?? null;
  }, [selectedBooking, selectedCouponIssue, storeSlug, stores]);
  const linkedCouponDiscount = useMemo(
    () =>
      couponDiscountLabel(
        selectedBooking?.coupon ?? selectedCouponIssue?.coupon,
        selectedCouponIssue,
        formatMoney,
        activeLanguage,
      ),
    [activeLanguage, formatMoney, selectedBooking?.coupon, selectedCouponIssue],
  );

  const amount = useMemo(() => parseMoneyInput(amountInput), [amountInput]);
  const visibleSubmittedBills = useMemo(() => {
    const topBills = submittedBills.slice(0, 5);
    if (!focusedBillId || topBills.some((bill) => bill.id === focusedBillId)) {
      return topBills;
    }

    const focusedBill = submittedBills.find((bill) => bill.id === focusedBillId);
    return focusedBill ? [focusedBill, ...topBills].slice(0, 6) : topBills;
  }, [focusedBillId, submittedBills]);
  const usedAtDate = useMemo(() => new Date(usedAt), [usedAt]);
  const isUsedAtInvalid = Number.isNaN(usedAtDate.getTime());
  const isFutureUsage =
    Boolean(timeWindow.nowMs) && !isUsedAtInvalid && usedAtDate.getTime() > timeWindow.nowMs;
  const isPastDeadline =
    Boolean(timeWindow.nowMs) &&
    !isUsedAtInvalid &&
    timeWindow.nowMs - usedAtDate.getTime() > tenDaysMs;
  const billValidationMessage = useMemo(
    () => {
      const message = validateBillForm({
        isLoadingOptions,
        hasBookedStores: stores.length > 0,
        hasStore: Boolean(bookingId || storeSlug),
        hasConfirmedUsageSource: Boolean(selectedBooking || selectedCouponIssue),
        amountInput,
        amount,
        usedAt,
        isUsedAtInvalid,
        isFutureUsage,
        isPastDeadline,
        evidenceFile,
        timeReady: Boolean(timeWindow.nowMs),
      });
      return message ? t(message) : "";
    },
    [
      amount,
      amountInput,
      bookingId,
      evidenceFile,
      isFutureUsage,
      isLoadingOptions,
      isPastDeadline,
      isUsedAtInvalid,
      storeSlug,
      stores.length,
      selectedBooking,
      selectedCouponIssue,
      timeWindow.nowMs,
      t,
      usedAt,
    ],
  );
  const canSubmit =
    !isSubmitting &&
    !billValidationMessage;

  const handleBookingChange = (value: string) => {
    setBookingId(value);
    if (value) {
      setCouponIssueId("");
    }
    const booking = bookings.find((item) => item.id === value);
    if (booking?.store?.slug) {
      setStoreSlug(booking.store.slug);
    }
  };

  const handleCouponIssueChange = (value: string) => {
    setCouponIssueId(value);
    const issue = couponIssues.find((item) => item.id === value);
    if (issue?.coupon.store?.slug) {
      setStoreSlug(issue.coupon.store.slug);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmountInput(sanitizeMoneyInput(value));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (billValidationMessage) {
      setNotice({
        tone: "danger",
        message: billValidationMessage,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        storeSlug,
        ...(bookingId ? { bookingId } : {}),
        ...(selectedCouponIssue
          ? {
              couponId: selectedCouponIssue.coupon.id,
              couponIssueId: selectedCouponIssue.id,
            }
          : {}),
        totalVnd: amount,
        usedAt: usedAtDate.toISOString(),
      };
      const bill = await billApi.submitMemberBill(payload);

    let uploadWarning = "";
    if (evidenceFile) {
      try {
        await billApi.uploadEvidence(bill.id, evidenceFile);
      } catch {
          uploadWarning = ` ${t("Hóa đơn đã được gửi, nhưng ảnh hoặc chứng từ chưa tải lên được.")}`;
      }
    }

      setSubmittedBills((current) => [bill, ...current]);
      setNotice({
        tone: uploadWarning ? "warning" : "success",
        message: `${t("Đã gửi hóa đơn")} ${bill.id.slice(0, 8)} ${t("để quản trị viên duyệt.")}${uploadWarning}`,
        bill,
      });
      setAmountInput("");
      setBookingId("");
      setCouponIssueId("");
      setEvidenceFile(null);
      setOcrPreview(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error) {
      setNotice({ tone: "danger", message: t(cleanApiMessage(error)) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfigProvider locale={antdLocaleByLanguage[activeLanguage]} theme={billPickerTheme}>
      <main className="nl-bill-page">
        <section className="nl-bill-shell">
          <Link href="/tai-khoan" className="nl-back-link">
            <ChevronLeft size={16} />
            <span>{t("Tài khoản")}</span>
          </Link>

          <div className="nl-bill-head">
            <div className="nl-bill-title-container">
              <div className="nl-bill-title-row">
                <h1 className="nl-bill-title">{t("Gửi hóa đơn")}</h1>
                <span className="nl-bill-rule-pill">
                  <Clock size={12} />
                  <span>{t("Trong 10 ngày")}</span>
                </span>
              </div>
              <div className="nl-bill-title-note">{t("Đối soát hóa đơn")}</div>
              <div className="nl-title-divider"></div>
              <p className="nl-bill-desc">
                {t("Gửi hóa đơn gốc để quản trị viên đối soát điểm, ưu đãi và công nợ với quán.")}
              </p>
            </div>
          </div>

          <div className="nl-bill-layout">
            <form className="nl-bill-form" noValidate onSubmit={handleSubmit}>
              {/* Hidden inputs for test compatibility */}
              <input type="hidden" id="bill-used-at" value={usedAt ? formatDateTime(confirmedUsageAt, activeLanguage) : ""} readOnly />
              <input type="hidden" id="bill-booking" value={bookingId} readOnly />

              <div className="nl-field">
                <label htmlFor="bill-store-select">
                  {t("Quán / cơ sở")} *
                </label>
                {selectedBooking || selectedCouponIssue ? (
                  <>
                    <div className="nl-static-value" id="bill-store-static">
                      {selectedStore?.name || storeSlug}
                    </div>
                    {/* Hidden input for test compatibility */}
                    <input type="hidden" id="bill-store-select" value={storeSlug} readOnly />
                  </>
                ) : (
                  <Select
                    className="nl-bill-ant-select"
                    disabled={isLoadingOptions || !stores.length}
                    id="bill-store-select"
                    onChange={(value) => setStoreSlug(value)}
                    options={
                      stores.length
                        ? stores.map((storeItem) => ({
                            label: `${storeItem.name}${storeItem.district ? ` - ${storeItem.district}` : ""}`,
                            value: storeItem.slug,
                          }))
                        : [{ label: t("Chưa có quán đã đặt"), value: "" }]
                    }
                    popupClassName="nl-bill-select-popup"
                    value={storeSlug}
                  />
                )}
                {!isLoadingOptions && !stores.length ? (
                  <span className="nl-field-help">
                    {t("Bạn cần đặt chỗ ở một quán trước khi gửi hóa đơn.")}
                  </span>
                ) : null}
              </div>

              {bookings.length ? (
                <div className="nl-field">
                  <label htmlFor="bill-booking-select">
                    {t("Liên kết đặt chỗ")}
                  </label>
                  {bookingId ? (
                    <>
                      <div className="nl-static-value" id="bill-booking-static">
                        {selectedBooking
                          ? `${selectedBooking.store?.name ?? "Booking"} - ${formatDateTime(
                              selectedBooking.scheduledAt,
                              activeLanguage,
                            )}`
                          : t("Đã liên kết")}
                      </div>
                    </>
                  ) : (
                    <Select
                      className="nl-bill-ant-select"
                      id="bill-booking-select"
                      onChange={handleBookingChange}
                      options={[
                        { label: t("Không liên kết đặt chỗ"), value: "" },
                        ...bookings.map((booking) => ({
                          label: `${booking.store?.name ?? t("Đặt chỗ")} - ${formatDateTime(
                            booking.scheduledAt,
                            activeLanguage,
                          )}`,
                          value: booking.id,
                        })),
                      ]}
                      popupClassName="nl-bill-select-popup"
                      value={bookingId}
                    />
                  )}
                </div>
              ) : null}

              {selectedBooking ? (
                <section className="nl-linked-booking" aria-label={t("Đặt chỗ đang gắn với hóa đơn")}>
                  <div className="nl-receipt-ticket">
                    <div className="nl-receipt-header">
                      <span className="nl-receipt-title">{t("Đơn hàng đang liên kết")}</span>
                      <strong className="nl-receipt-store">{bookingTitle(selectedBooking)}</strong>
                    </div>
                    <div className="nl-receipt-body">
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Mã đặt chỗ")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value highlight">#{selectedBooking.bookingCode || selectedBooking.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Giờ hẹn")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">{formatDateTime(selectedBooking.scheduledAt, activeLanguage)}</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Xác nhận sử dụng")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">
                          {bookingConfirmedUsageAt(selectedBooking)
                            ? formatDateTime(bookingConfirmedUsageAt(selectedBooking), activeLanguage)
                            : t("Chưa được xác nhận")}
                        </span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Số người")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">{partySizeLabel(selectedBooking.partySize, activeLanguage)}</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Mã ưu đãi/QR")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">
                          {selectedBooking.coupon?.name ??
                            selectedBooking.couponIssue?.code ??
                            t("QR đặt chỗ")}
                        </span>
                      </div>
                      {linkedCouponDiscount ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Mức giảm")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value discount">{linkedCouponDiscount}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : null}

              {!selectedBooking && couponIssues.length ? (
                <div className="nl-field">
                  <label htmlFor="bill-coupon-issue-select">
                    {t("Liên kết mã ưu đãi")}
                  </label>
                  {couponIssueId ? (
                    <>
                      <div className="nl-static-value" id="bill-coupon-issue-static">
                        {selectedCouponIssue
                          ? couponIssueOptionLabel(selectedCouponIssue, activeLanguage)
                          : t("Đã liên kết mã ưu đãi")}
                      </div>
                      <input type="hidden" id="bill-coupon-issue-select" value={couponIssueId} readOnly />
                    </>
                  ) : (
                    <Select
                      className="nl-bill-ant-select"
                      id="bill-coupon-issue-select"
                      onChange={handleCouponIssueChange}
                      options={[
                        { label: t("Không liên kết mã ưu đãi"), value: "" },
                        ...couponIssues.map((issue) => ({
                          label: couponIssueOptionLabel(issue, activeLanguage),
                          value: issue.id,
                        })),
                      ]}
                      popupClassName="nl-bill-select-popup"
                      value={couponIssueId}
                    />
                  )}
                </div>
              ) : null}

              <div className="nl-form-grid">
                <div className="nl-field">
                  <label htmlFor="bill-total">
                    {t("Tổng tiền hóa đơn gốc")} *
                  </label>
                  <div className="nl-amount-input-wrapper">
                    <input
                      id="bill-total"
                      inputMode="numeric"
                      placeholder={t("Vui lòng nhập tổng tiền")}
                      value={amountInput}
                      onChange={(event) => handleAmountChange(event.target.value)}
                      onBlur={() => setAmountInput((current) => formatMoneyInput(current))}
                      onFocus={() => setAmountInput((current) => sanitizeMoneyInput(current))}
                    />
                    <span className="nl-amount-suffix">₫</span>
                  </div>
                </div>

                <div className="nl-field">
                  <label>
                    {t("Thời gian xác nhận sử dụng")} *
                  </label>
                  <div
                    className={usedAt ? "nl-confirmed-time" : "nl-confirmed-time pending"}
                  >
                    <div className="nl-confirmed-time-icon">
                      {usedAt ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </div>
                    <div className="nl-confirmed-time-content">
                      <strong>
                        {usedAt
                          ? formatDateTime(confirmedUsageAt, activeLanguage)
                          : t("Chưa có thời gian xác nhận")}
                      </strong>
                      <span>{confirmedUsageLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="nl-field">
                <label>
                  {t("Ảnh / chứng từ")}
                </label>
                
                <div className="nl-upload-zone-wrapper">
                  {!evidenceFile ? (
                    <label className="nl-upload-zone">
                      <UploadCloud className="nl-upload-icon" size={28} />
                      <span className="nl-upload-title">{t("Nhấn để tải ảnh hoặc file PDF")}</span>
                      <span className="nl-upload-subtitle">{t("Hỗ trợ JPG, PNG, WEBP, GIF, PDF (Tối đa 25MB)")}</span>
                      <span className="nl-upload-hint">{t("Khuyến khích gửi kèm để duyệt nhanh hơn.")}</span>
                      <input
                        className="nl-upload-input-hidden"
                        type="file"
                        accept="image/*,.pdf"
                        onInput={(event) => handleEvidenceFileChange(event.currentTarget)}
                        onChange={(event) => handleEvidenceFileChange(event.currentTarget)}
                      />
                    </label>
                  ) : (
                    <div className="nl-upload-preview-card">
                      {previewUrl ? (
                        <div className="nl-preview-thumb-container">
                          {/* eslint-disable-next-line @next/next/no-img-element -- Local blob preview from the selected evidence file. */}
                          <img src={previewUrl} alt={t("Ảnh xem trước chứng từ")} className="nl-preview-thumb" />
                        </div>
                      ) : (
                        <div className="nl-preview-file-icon">
                          <FileText size={32} />
                        </div>
                      )}
                      <div className="nl-preview-info">
                        <span className="nl-preview-filename">{evidenceFile.name}</span>
                        <span className="nl-preview-filesize">
                          {Number(evidenceFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="nl-preview-actions">
                        {evidenceFile ? (
                          <button
                            type="button"
                            className="nl-ocr-btn-premium"
                            disabled={isReadingEvidence}
                            onClick={handleReadEvidence}
                          >
                            <Sparkles size={12} />
                            <span>{isReadingEvidence ? t("Đang đọc...") : t("Đọc hóa đơn tự động")}</span>
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="nl-delete-file-btn"
                          aria-label={t("Bỏ file")}
                          onClick={() => {
                            setEvidenceFile(null);
                            setOcrPreview(null);
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                              setPreviewUrl(null);
                            }
                          }}
                        >
                          <Trash2 size={14} />
                          <span>{t("Xóa")}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {ocrPreview ? (
                  <div className="nl-ocr-preview-premium">
                    <div className="nl-ocr-header">
                      <Sparkles size={14} className="nl-ocr-sparkle" />
                      <strong>
                        {t("Gợi ý từ công cụ đọc hóa đơn")} ({t("Độ tin cậy")} {Math.round(ocrPreview.confidence * 100)}%)
                      </strong>
                    </div>
                    <div className="nl-ocr-results-grid">
                      <div className="nl-ocr-result-item">
                        <span className="nl-ocr-label">{t("Tổng tiền")}</span>
                        <strong className="nl-ocr-val">
                          {ocrPreview.suggestions.totalVnd
                            ? formatMoney(ocrPreview.suggestions.totalVnd)
                            : t("Không đọc được, cần nhập tay")}
                        </strong>
                      </div>
                      <div className="nl-ocr-result-item">
                        <span className="nl-ocr-label">{t("Thời gian trên hóa đơn")}</span>
                        <strong className="nl-ocr-val">
                          {ocrPreview.suggestions.usedAt
                            ? formatDateTime(ocrPreview.suggestions.usedAt, activeLanguage)
                            : t("Không đọc được")}
                        </strong>
                      </div>
                    </div>
                    <div className="nl-ocr-notes">
                      <span>* {t("Thời gian gửi hệ thống vẫn được lấy từ mốc đã xác nhận.")}</span>
                      {ocrPreview.warnings.length ? (
                        <span className="nl-ocr-warn-text">{ocrPreview.warnings.slice(0, 2).map((warning) => t(warning)).join(" ")}</span>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className={isPastDeadline || isFutureUsage ? "nl-rule danger" : "nl-rule"}>
                <div className="nl-rule-icon">
                  <AlertCircle size={16} />
                </div>
                <span>
                  {t("Chỉ nhập tổng tiền hóa đơn gốc, không nhập chi tiết món/dịch vụ. Thời gian sử dụng lấy từ mốc đã xác nhận; hóa đơn quá 10 ngày sẽ không được nhận.")}
                </span>
              </div>

              {notice ? (
                <div className={`nl-notice ${notice.tone}`}>
                  <div className="nl-notice-icon">
                    {notice.tone === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <span>{notice.message}</span>
                </div>
              ) : null}

              <button type="submit" className="nl-submit-premium" disabled={!canSubmit}>
                {isSubmitting ? (
                  <>
                    <span className="spin-loader"></span>
                    <span>{t("Đang gửi hóa đơn...")}</span>
                  </>
                ) : (
                  <span>{t("Gửi hóa đơn")}</span>
                )}
              </button>
            </form>

            <aside className="nl-bill-side">
              <section className="nl-recent">
                <div className="nl-recent-header-container">
                  <h2 className="nl-recent-title">{t("Hóa đơn đã gửi")}</h2>
                  <span className="nl-recent-title-note">{t("Lịch sử gần đây")}</span>
                  <div className="nl-recent-divider"></div>
                </div>

                <div className="nl-recent-list">
                  {visibleSubmittedBills.length === 0 ? (
                    <div className="nl-recent-empty">
                      <FileText size={32} className="nl-empty-icon" />
                      <p>{t("Bạn chưa gửi hóa đơn nào gần đây.")}</p>
                    </div>
                  ) : (
                    visibleSubmittedBills.map((bill) => (
                      <article
                        key={bill.id}
                        className={focusedBillId === bill.id ? "nl-recent-card active" : "nl-recent-card"}
                      >
                        <div className="nl-recent-card-header">
                          <span className="nl-recent-number">{t("Hóa đơn #")}{bill.billNumber || bill.id.slice(0, 8).toUpperCase()}</span>
                          <span className={`nl-status-tag ${bill.status.toLowerCase()}`}>
                            {billStatusLabel(bill.status, activeLanguage)}
                          </span>
                        </div>
                        <div className="nl-recent-card-body">
                          <div className="nl-recent-card-row">
                            <span className="nl-recent-card-lbl">{t("Quán:")}</span>
                            <span className="nl-recent-card-val highlight">{bill.store?.name || "NightLife"}</span>
                          </div>
                          <div className="nl-recent-card-row">
                            <span className="nl-recent-card-lbl">{t("Tổng tiền:")}</span>
                            <span className="nl-recent-card-val gold">{formatMoney(bill.totalVnd)}</span>
                          </div>
                          <div className="nl-recent-card-row">
                            <span className="nl-recent-card-lbl">{t("Ngày sử dụng:")}</span>
                            <span className="nl-recent-card-val">{formatDateTime(bill.usedAt, activeLanguage)}</span>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </aside>
          </div>
        </section>

      <style jsx>{`
        .nl-bill-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: var(--vy-bg);
          color: var(--vy-text);
        }

        .nl-bill-shell {
          width: min(100%, 1120px);
          max-width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
          padding: 24px 18px 80px;
        }

        .nl-bill-page *,
        .nl-bill-page *::before,
        .nl-bill-page *::after {
          box-sizing: border-box;
        }

        .nl-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--vy-muted);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
          margin-bottom: 14px;
        }

        .nl-back-link:hover {
          color: var(--vy-gold);
        }

        .nl-bill-head {
          margin-top: 4px;
          margin-bottom: 24px;
        }

        .nl-bill-title-container {
          display: grid;
          gap: 2px;
          width: 100%;
        }

        .nl-bill-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .nl-bill-title {
          margin: 0;
          font-size: 21px;
          font-weight: 600;
          color: var(--vy-text);
        }

        .nl-bill-rule-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--vy-border-gold-22);
          border-radius: 20px;
          background: var(--vy-gold-soft-bg);
          color: var(--vy-gold-pale);
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
        }

        .nl-bill-title-note {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.2px;
          color: var(--vy-muted);
          text-transform: uppercase;
          margin-top: -2px;
        }

        .nl-title-divider {
          background: linear-gradient(90deg, rgba(212,178,106,.45), transparent);
          height: 1px;
          margin-top: 5px;
          margin-bottom: 8px;
          width: 100%;
        }

        .nl-bill-desc {
          margin: 4px 0 0;
          color: var(--vy-muted);
          font-size: 13px;
          line-height: 1.5;
        }

        .nl-bill-layout {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
          align-items: start;
          min-width: 0;
        }

        .nl-bill-form,
        .nl-bill-side {
          min-width: 0;
          border: 1px solid var(--vy-border);
          border-radius: 16px;
          background: var(--vy-surface-1);
          padding: 24px;
          box-shadow: var(--vy-shadow);
        }

        .nl-field {
          display: grid;
          gap: 6px;
          margin-top: 18px;
          min-width: 0;
        }

        .nl-field:first-of-type {
          margin-top: 0;
        }

        .nl-field label {
          color: var(--vy-gold);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          line-height: 1.35;
          min-height: 14px;
        }

        .nl-field-help {
          color: var(--vy-error);
          font-size: 11px;
          font-weight: 500;
          line-height: 1.45;
        }

        .nl-form-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 16px;
          align-items: stretch;
          min-width: 0;
          margin-top: 18px;
        }

        .nl-form-grid > .nl-field {
          min-width: 0;
          margin-top: 0;
          grid-template-rows: auto minmax(54px, auto);
          align-content: start;
        }

        input {
          width: 100%;
          min-width: 0;
          max-width: 100%;
          min-height: 48px;
          border: 1px solid var(--vy-border);
          border-radius: 11px;
          background: var(--vy-surface-3);
          color: var(--vy-text);
          padding: 0 16px;
          font-size: 14px;
          outline: none;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: all 0.3s ease;
        }

        input:focus {
          border-color: var(--vy-gold);
          box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.15);
        }

        .nl-static-value {
          width: 100%;
          min-height: 48px;
          border: 1px solid var(--vy-border);
          border-radius: 11px;
          background: rgba(255, 255, 255, 0.015);
          color: var(--vy-text-2);
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          user-select: none;
        }

        .nl-amount-input-wrapper {
          display: flex;
          position: relative;
          width: 100%;
          min-height: 54px;
          min-width: 0;
        }

        .nl-amount-input-wrapper input {
          height: 100%;
          min-height: 54px;
          padding-right: 32px;
          font-weight: 600;
        }

        .nl-amount-suffix {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--vy-gold);
          font-size: 15px;
          font-weight: 600;
          pointer-events: none;
        }

        .nl-confirmed-time {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 54px;
          height: 100%;
          border: 1px solid rgba(127, 211, 162, 0.22);
          border-radius: 11px;
          background: linear-gradient(135deg, rgba(127, 211, 162, 0.05), rgba(255, 255, 255, 0.01));
          padding: 10px 16px;
        }

        .nl-confirmed-time.pending {
          border-color: var(--vy-border-gold-22);
          background: linear-gradient(135deg, rgba(212, 178, 106, 0.05), rgba(255, 255, 255, 0.01));
        }

        .nl-confirmed-time-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--vy-success);
          flex-shrink: 0;
        }

        .nl-confirmed-time.pending .nl-confirmed-time-icon {
          color: var(--vy-gold);
        }

        .nl-confirmed-time-content {
          display: grid;
          gap: 2px;
          min-width: 0;
        }

        .nl-confirmed-time-content strong {
          color: var(--vy-text);
          font-size: 13.5px;
          font-weight: 700;
          line-height: 1.2;
          overflow-wrap: anywhere;
        }

        .nl-confirmed-time-content span {
          color: var(--vy-muted);
          font-size: 11px;
          line-height: 1.3;
          overflow-wrap: anywhere;
        }

        .nl-receipt-ticket {
          border: 1px solid var(--vy-border-gold-22);
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(212, 178, 106, 0.06), rgba(255, 255, 255, 0.015));
          padding: 18px;
          margin-top: 16px;
          box-shadow: var(--vy-shadow-card);
        }

        .nl-receipt-header {
          border-bottom: 1px dashed var(--vy-border-gold-22);
          padding-bottom: 12px;
          margin-bottom: 12px;
          display: grid;
          gap: 4px;
        }

        .nl-receipt-title {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 1.5px;
          color: var(--vy-gold);
          text-transform: uppercase;
        }

        .nl-receipt-store {
          font-size: 15px;
          font-weight: 700;
          color: var(--vy-text);
        }

        .nl-receipt-body {
          display: grid;
          gap: 10px;
        }

        .nl-receipt-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .nl-receipt-label {
          color: var(--vy-muted);
          font-weight: 500;
          flex-shrink: 0;
        }

        .nl-receipt-line {
          flex-grow: 1;
          border-bottom: 1px dotted var(--vy-border);
          margin: 0 10px;
          opacity: 0.5;
        }

        .nl-receipt-value {
          color: var(--vy-text);
          font-weight: 600;
          flex-shrink: 0;
        }

        .nl-receipt-value.highlight {
          color: var(--vy-gold-pale);
        }

        .nl-receipt-value.discount {
          color: var(--vy-pink);
        }

        .nl-upload-zone-wrapper {
          margin-top: 4px;
          width: 100%;
        }

        .nl-upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px dashed var(--vy-border-gold-32);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          padding: 24px 16px;
          cursor: pointer;
          text-align: center;
          transition: all 0.3s ease;
          width: 100%;
        }

        .nl-upload-zone:hover {
          border-color: var(--vy-gold);
          background: rgba(212, 178, 106, 0.02);
        }

        .nl-upload-icon {
          color: var(--vy-gold);
          margin-bottom: 8px;
          opacity: 0.8;
        }

        .nl-upload-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--vy-text);
          margin-bottom: 4px;
        }

        .nl-upload-subtitle {
          font-size: 10.5px;
          color: var(--vy-muted);
          margin-bottom: 8px;
        }

        .nl-upload-hint {
          font-size: 11px;
          color: var(--vy-faint);
        }

        .nl-upload-input-hidden {
          display: none;
        }

        .nl-upload-preview-card {
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid var(--vy-border);
          border-radius: 12px;
          background: var(--vy-surface-3);
          padding: 12px;
          width: 100%;
          min-width: 0;
        }

        .nl-preview-thumb-container {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid var(--vy-border-gold-12);
        }

        .nl-preview-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nl-preview-file-icon {
          width: 48px;
          height: 48px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--vy-muted);
          flex-shrink: 0;
        }

        .nl-preview-info {
          display: grid;
          gap: 2px;
          min-width: 0;
          flex-grow: 1;
        }

        .nl-preview-filename {
          font-size: 12.5px;
          font-weight: 600;
          color: var(--vy-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nl-preview-filesize {
          font-size: 11px;
          color: var(--vy-muted);
        }

        .nl-preview-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .nl-ocr-btn-premium {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid var(--vy-border-gold-32);
          border-radius: 8px;
          background: var(--vy-gold-soft-bg);
          color: var(--vy-gold-pale);
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nl-ocr-btn-premium:hover:not(:disabled) {
          background: rgba(212, 178, 106, 0.2);
          border-color: var(--vy-gold);
        }

        .nl-ocr-btn-premium:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .nl-delete-file-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid rgba(232, 139, 153, 0.3);
          border-radius: 8px;
          background: rgba(232, 139, 153, 0.06);
          color: var(--vy-error);
          padding: 6px 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nl-delete-file-btn:hover {
          background: rgba(232, 139, 153, 0.15);
          border-color: var(--vy-error);
        }

        .nl-ocr-preview-premium {
          margin-top: 12px;
          border: 1px solid rgba(127, 211, 162, 0.22);
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(127, 211, 162, 0.05), rgba(255, 255, 255, 0.01));
          padding: 14px;
          width: 100%;
          min-width: 0;
        }

        .nl-ocr-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .nl-ocr-sparkle {
          color: var(--vy-gold);
        }

        .nl-ocr-header strong {
          font-size: 12px;
          font-weight: 700;
          color: var(--vy-gold-pale);
        }

        .nl-ocr-results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 8px;
        }

        .nl-ocr-result-item {
          display: grid;
          gap: 2px;
        }

        .nl-ocr-label {
          font-size: 9px;
          font-weight: 600;
          color: var(--vy-muted);
          letter-spacing: 0.5px;
        }

        .nl-ocr-val {
          font-size: 13px;
          color: var(--vy-text);
          font-weight: 700;
        }

        .nl-ocr-notes {
          display: grid;
          gap: 2px;
          font-size: 11px;
          color: var(--vy-faint);
          line-height: 1.4;
        }

        .nl-ocr-warn-text {
          color: var(--vy-warn);
        }

        :global(.nl-bill-ant-select.ant-select) {
          width: 100%;
          min-width: 0;
          max-width: 100%;
        }

        :global(.nl-bill-ant-select.ant-select .ant-select-selector) {
          min-height: 48px;
          border: 1px solid var(--vy-border) !important;
          border-radius: 11px !important;
          background: var(--vy-surface-3) !important;
          color: var(--vy-text) !important;
          padding: 0 16px !important;
          box-shadow: none !important;
        }

        :global(.nl-bill-ant-select.ant-select:hover .ant-select-selector),
        :global(.nl-bill-ant-select.ant-select-focused .ant-select-selector) {
          border-color: var(--vy-gold) !important;
          box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.12) !important;
        }

        :global(.nl-bill-ant-select.ant-select-disabled .ant-select-selector) {
          opacity: 0.55 !important;
        }

        :global(.nl-bill-ant-select .ant-select-selection-item),
        :global(.nl-bill-ant-select .ant-select-selection-placeholder) {
          min-width: 0;
          color: var(--vy-text) !important;
          font-size: 14px;
          font-weight: 600;
          line-height: 46px !important;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        :global(.nl-bill-ant-select .ant-select-selection-placeholder) {
          color: var(--vy-faint) !important;
        }

        :global(.nl-bill-ant-select .ant-select-arrow),
        :global(.nl-bill-ant-select .ant-select-clear) {
          color: var(--vy-gold-pale) !important;
        }

        :global(.nl-bill-select-popup) {
          border: 1px solid var(--vy-border-gold-22) !important;
          border-radius: 11px !important;
          background: var(--vy-surface) !important;
          box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42) !important;
          overflow: hidden;
        }

        :global(.nl-bill-select-popup .ant-select-item) {
          color: var(--vy-text-2) !important;
          font-weight: 600;
          min-height: 40px;
          padding: 8px 12px !important;
        }

        :global(.nl-bill-select-popup .ant-select-item-option-active),
        :global(.nl-bill-select-popup .ant-select-item-option-selected) {
          background: var(--vy-gold-soft-bg) !important;
          color: var(--vy-gold-hi) !important;
        }

        .nl-rule,
        .nl-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border: 1px solid var(--vy-border);
          border-radius: 11px;
          background: var(--vy-surface-3);
          color: var(--vy-muted);
          padding: 12px 14px;
          font-size: 12.5px;
          line-height: 1.5;
          margin-top: 18px;
          width: 100%;
          min-width: 0;
        }

        .nl-rule-icon,
        .nl-notice-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--vy-gold);
          margin-top: 1px;
        }

        .nl-rule.danger,
        .nl-notice.danger {
          color: var(--vy-error);
          border-color: rgba(232, 139, 153, 0.25);
          background: rgba(232, 139, 153, 0.06);
        }

        .nl-rule.danger .nl-rule-icon,
        .nl-notice.danger .nl-notice-icon {
          color: var(--vy-error);
        }

        .nl-notice.success {
          color: var(--vy-success);
          border-color: rgba(127, 211, 162, 0.25);
          background: rgba(127, 211, 162, 0.06);
        }

        .nl-notice.success .nl-notice-icon {
          color: var(--vy-success);
        }

        .nl-notice.warning {
          color: var(--vy-warn);
          border-color: rgba(231, 184, 105, 0.25);
          background: rgba(231, 184, 105, 0.06);
        }

        .nl-notice.warning .nl-notice-icon {
          color: var(--vy-warn);
        }

        .nl-submit-premium {
          width: 100%;
          margin-top: 20px;
          min-height: 50px;
          border: none;
          border-radius: 11px;
          background: var(--vy-gold-grad);
          color: var(--vy-on-gold);
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(212, 178, 106, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .nl-submit-premium:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(212, 178, 106, 0.35);
        }

        .nl-submit-premium:active:not(:disabled) {
          transform: translateY(0);
        }

        .nl-submit-premium:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spin-loader {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(36, 26, 10, 0.2);
          border-top: 2px solid var(--vy-on-gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .nl-recent-header-container {
          display: grid;
          gap: 2px;
          margin-bottom: 16px;
          width: 100%;
        }

        .nl-recent-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: var(--vy-text);
        }

        .nl-recent-title-note {
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 1.2px;
          color: var(--vy-muted);
          text-transform: uppercase;
        }

        .nl-recent-divider {
          background: linear-gradient(90deg, rgba(212,178,106,.45), transparent);
          height: 1px;
          margin-top: 5px;
          width: 100%;
        }

        .nl-recent-list {
          display: grid;
          gap: 12px;
          width: 100%;
        }

        .nl-recent-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 16px;
          text-align: center;
          color: var(--vy-faint);
          width: 100%;
        }

        .nl-empty-icon {
          margin-bottom: 12px;
          opacity: 0.35;
        }

        .nl-recent-empty p {
          font-size: 13px;
          margin: 0;
        }

        .nl-recent-card {
          border: 1px solid var(--vy-border);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          padding: 14px;
          display: grid;
          gap: 10px;
          width: 100%;
          min-width: 0;
          transition: all 0.3s ease;
        }

        .nl-recent-card.active {
          border-color: var(--vy-gold);
          background: rgba(212, 178, 106, 0.05);
          box-shadow: 0 0 0 3px rgba(212, 178, 106, 0.08);
        }

        .nl-recent-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .nl-recent-number {
          font-size: 12px;
          font-weight: 700;
          color: var(--vy-text-2);
        }

        .nl-status-tag {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .nl-status-tag.submitted {
          background: rgba(231, 184, 105, 0.12);
          color: var(--vy-warn);
          border-color: rgba(231, 184, 105, 0.25);
        }

        .nl-status-tag.verified,
        .nl-status-tag.paid {
          background: rgba(127, 211, 162, 0.12);
          color: var(--vy-success);
          border-color: rgba(127, 211, 162, 0.25);
        }

        .nl-status-tag.rejected {
          background: rgba(232, 139, 153, 0.12);
          color: var(--vy-error);
          border-color: rgba(232, 139, 153, 0.25);
        }

        .nl-recent-card-body {
          display: grid;
          gap: 5px;
          width: 100%;
        }

        .nl-recent-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11.5px;
          width: 100%;
        }

        .nl-recent-card-lbl {
          color: var(--vy-muted);
        }

        .nl-recent-card-val {
          color: var(--vy-text-2);
          font-weight: 600;
        }

        .nl-recent-card-val.highlight {
          color: var(--vy-text);
        }

        .nl-recent-card-val.gold {
          color: var(--vy-gold);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 860px) {
          .nl-bill-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }

        @media (max-width: 620px) {
          .nl-bill-shell {
            padding: 16px 14px 80px;
          }

          .nl-bill-form,
          .nl-bill-side {
            padding: 16px;
            border-radius: 12px;
          }

          .nl-form-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }
        }
      `}</style>
      </main>
    </ConfigProvider>
  );
}
