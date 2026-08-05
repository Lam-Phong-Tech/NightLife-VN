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
import { ApiError, getAuthToken, resolveClientUrl, translateApiMessage } from "@/lib/api/client";
import {
  billApi,
  type BillOcrPreview,
  type BillRecord,
  type BillStoreOption,
  type UploadedBillEvidence,
} from "@/lib/api/bills";
import { bookingApi, getLastBooking, type BookingRecord } from "@/lib/api/bookings";
import { couponApi, type CouponIssue } from "@/lib/api/coupons";
import { useMoneyFormatter } from "@/components/providers/CurrencyProvider";
import {
  useActiveLanguage,
  type LanguageCode,
} from "@/lib/i18n/use-active-language";
import { translateText } from "@/lib/i18n/client-translations";
import { useUserActionFeedback } from "@/lib/user-action-feedback";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  FileText,
  Info,
  Maximize2,
  RotateCcw,
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
      activeBorderColor: "var(--vy-border-gold-22)",
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

type BookingLinkedBill = NonNullable<BookingRecord["bill"]>;
type ExistingBill = BillRecord | BookingLinkedBill;
type BillListTab = "UNSENT" | "PENDING" | "APPROVED" | "CANCELLED";

const billPageCopy: Record<string, Partial<Record<LanguageCode, string>>> = {
  "Booking đã được xác nhận check-in": {
    en: "Booking check-in confirmed",
    ja: "予約のチェックインが確認されました",
    ko: "예약 체크인이 확인되었습니다",
    zh: "预订签到已确认",
  },
  "Ảnh/PDF hiện chưa có text OCR. Hệ thống không đọc trực tiếp ảnh này; vui lòng nhập tổng tiền thủ công và dùng file làm chứng từ.": {
    en: "This image/PDF has no OCR text yet. The system cannot read this file directly; please enter the total manually and keep the file as evidence.",
    ja: "この画像/PDFにはまだOCRテキストがありません。システムはこのファイルを直接読み取れないため、合計金額を手入力し、ファイルは証憑として使用してください。",
    ko: "이 이미지/PDF에는 아직 OCR 텍스트가 없습니다. 시스템이 이 파일을 직접 읽을 수 없으므로 총액을 직접 입력하고 파일은 증빙으로 사용해 주세요.",
    zh: "此图片/PDF 暂无 OCR 文本。系统无法直接读取该文件，请手动输入总金额，并将文件作为凭证。",
  },
  "Không có dữ liệu OCR để tự điền. Vui lòng nhập tổng tiền thủ công.": {
    en: "There is no OCR data to autofill. Please enter the total manually.",
    ja: "自動入力できるOCRデータがありません。合計金額を手入力してください。",
    ko: "자동 입력할 OCR 데이터가 없습니다. 총액을 직접 입력해 주세요.",
    zh: "没有可用于自动填写的 OCR 数据。请手动输入总金额。",
  },
  "Đối soát hóa đơn": {
    en: "Bill reconciliation",
    ja: "請求書の照合",
    ko: "영수증 정산",
    zh: "账单对账",
  },
  "Gửi hóa đơn sau mỗi chuyến đi để tích lũy điểm thưởng, thăng hạng thành viên VIP và nhận nhiều ưu đãi đặc quyền.": {
    en: "Submit your bill after every visit to earn reward points, upgrade to VIP status, and unlock exclusive perks.",
    ja: "ご利用後に請求書を送信してポイントを貯め、VIPランクへの昇格や限定特典を獲得しましょう。",
    ko: "방문 후 영수증을 제출하고 리워드 포인트를 적립하여 VIP 등급 승급 및 전용 혜택을 누려보세요.",
    zh: "每次消费后提交账单即可累积奖励积分，提升至 VIP 会员等级并解锁专属尊享特权。",
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
  "Vui lòng tải lên ảnh/chứng từ mới để gửi lại hóa đơn.": {
    en: "Please upload a new image/proof to resubmit the bill.",
    ja: "新しい画像/証明書をアップロードして請求書を再送信してください。",
    ko: "새 이미지/증빙 để 영수증을 재제출해 주세요.",
    zh: "请上传新的图片/凭证以重新提交账单。",
  },
  "Xem ảnh gốc": {
    en: "View original image",
    ja: "元の画像を表示",
    ko: "원본 이미지 보기",
    zh: "查看原图",
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
  "Chưa gửi": {
    en: "Unsent",
    ja: "未送信",
    ko: "미제출",
    zh: "未发送",
  },
  "Duyệt": {
    en: "Approved",
    ja: "承認済み",
    ko: "승인됨",
    zh: "已批准",
  },
  "Hủy/Từ chối": {
    en: "Cancelled/Rejected",
    ja: "キャンセル/拒否",
    ko: "취소/거절",
    zh: "取消/拒绝",
  },
  "Gửi lại hóa đơn": {
    en: "Resubmit bill",
    ja: "請求書を再送信",
    ko: "영수증 재제출",
    zh: "重新提交账单",
  },
  "Vui lòng tải lên ảnh/chứng từ mới để gửi lại hóa đơn.": {
    en: "Please upload a new image/proof to resubmit the bill.",
    ja: "新しい画像/証明書をアップロードして請求書を再送信してください。",
    ko: "새 이미지/증빙 để 영수증을 재제출해 주세요.",
    zh: "请上传新的图片/凭证以重新提交账单。",
  },
  "Đã duyệt": {
    en: "Approved",
    ja: "承認済み",
    ko: "승인됨",
    zh: "已 approved",
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
  "Hóa đơn của đặt chỗ hoặc mã ưu đãi này đã được gửi cho Admin duyệt. Bạn không thể gửi lại hóa đơn này.": {
    en: "The bill for this reservation or deal code has already been submitted for admin review. You cannot submit it again.",
    ja: "この予約または特典コードの請求書はすでに管理者レビューに送信されています。再送信はできません。",
    ko: "이 예약 또는 혜택 코드의 영수증은 이미 관리자 검토로 제출되었습니다. 다시 제출할 수 없습니다.",
    zh: "此预订或优惠码的账单已提交给管理员审核，不能重复提交。",
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
  "Danh sách hóa đơn": {
    en: "Bill list",
    ja: "請求書一覧",
    ko: "청구서 목록",
    zh: "账单列表",
  },
  "Trạng thái hóa đơn": {
    en: "Bill status",
    ja: "請求書のステータス",
    ko: "청구서 상태",
    zh: "账单状态",
  },
  "Chưa gửi": {
    en: "Not sent",
    ja: "未送信",
    ko: "미제출",
    zh: "未提交",
  },
  "Duyệt": {
    en: "Approved",
    ja: "承認済み",
    ko: "승인됨",
    zh: "已批准",
  },
  "Đang tải danh sách hóa đơn...": {
    en: "Loading bills...",
    ja: "請求書を読み込んでいます...",
    ko: "청구서를 불러오는 중...",
    zh: "正在加载账单...",
  },
  "Nhập hóa đơn": {
    en: "Enter bill",
    ja: "請求書を入力",
    ko: "청구서 입력",
    zh: "填写账单",
  },
  "Chưa có booking nào đã check-in cần gửi hóa đơn.": {
    en: "There are no checked-in bookings that need a bill yet.",
    ja: "請求書の送信が必要なチェックイン済みの予約はまだありません。",
    ko: "청구서를 제출해야 하는 체크인 완료 예약이 아직 없습니다.",
    zh: "暂时没有需要提交账单的已签到预订。",
  },
  "Chưa có hóa đơn trong trạng thái này.": {
    en: "There are no bills in this status yet.",
    ja: "このステータスの請求書はまだありません。",
    ko: "이 상태의 청구서가 아직 없습니다.",
    zh: "此状态下暂时没有账单。",
  },
};

const localize = (value: string, language: LanguageCode) => {
  if (language === "vi") return value;
  return billPageCopy[value]?.[language] ?? translateText(value, language);
};

type BillFeedbackKey =
  | "cannotReadBill"
  | "readBillSuccess"
  | "readBillAutoFailed"
  | "readBillFailed"
  | "readBillConfirmTitle"
  | "readBillConfirmDescription"
  | "readBillConfirmLabel"
  | "billSubmitted"
  | "billSubmitSuccess"
  | "billSubmitFailed"
  | "billSubmitBlocked"
  | "billSubmitConfirmTitle"
  | "billSubmitConfirmDescription"
  | "billSubmitConfirmLabel";

const billFeedbackCopy: Record<LanguageCode, Record<BillFeedbackKey, string>> = {
  vi: {
    cannotReadBill: "Không đọc được hóa đơn",
    readBillSuccess: "Đã đọc hóa đơn",
    readBillAutoFailed: "Không đọc được hóa đơn tự động",
    readBillFailed: "Đọc hóa đơn thất bại",
    readBillConfirmTitle: "Đọc dữ liệu hóa đơn?",
    readBillConfirmDescription: "Hệ thống sẽ đọc file đã chọn và gợi ý tổng tiền nếu có thể.",
    readBillConfirmLabel: "Đọc hóa đơn",
    billSubmitted: "Đã gửi hóa đơn",
    billSubmitSuccess: "Gửi hóa đơn thành công",
    billSubmitFailed: "Gửi hóa đơn thất bại",
    billSubmitBlocked: "Chưa thể gửi hóa đơn",
    billSubmitConfirmTitle: "Xác nhận gửi hóa đơn?",
    billSubmitConfirmDescription: "Bạn có chắc muốn gửi hóa đơn này để quản trị viên duyệt không?",
    billSubmitConfirmLabel: "Gửi hóa đơn",
  },
  en: {
    cannotReadBill: "Could not read the bill",
    readBillSuccess: "Bill read successfully",
    readBillAutoFailed: "Could not read the bill automatically",
    readBillFailed: "Bill reading failed",
    readBillConfirmTitle: "Read bill data?",
    readBillConfirmDescription: "The system will read the selected file and suggest the total when possible.",
    readBillConfirmLabel: "Read bill",
    billSubmitted: "Bill submitted",
    billSubmitSuccess: "Bill submitted successfully",
    billSubmitFailed: "Bill submission failed",
    billSubmitBlocked: "Cannot submit bill yet",
    billSubmitConfirmTitle: "Confirm bill submission?",
    billSubmitConfirmDescription: "Are you sure you want to submit this bill for admin review?",
    billSubmitConfirmLabel: "Submit bill",
  },
  ja: {
    cannotReadBill: "請求書を読み取れません",
    readBillSuccess: "請求書を読み取りました",
    readBillAutoFailed: "請求書を自動で読み取れません",
    readBillFailed: "請求書の読み取りに失敗しました",
    readBillConfirmTitle: "請求書データを読み取りますか？",
    readBillConfirmDescription: "選択したファイルを読み取り、可能な場合は合計金額を提案します。",
    readBillConfirmLabel: "請求書を読む",
    billSubmitted: "請求書を送信しました",
    billSubmitSuccess: "請求書を送信しました",
    billSubmitFailed: "請求書の送信に失敗しました",
    billSubmitBlocked: "まだ請求書を送信できません",
    billSubmitConfirmTitle: "請求書を送信しますか？",
    billSubmitConfirmDescription: "この請求書を管理者レビューに送信してもよろしいですか？",
    billSubmitConfirmLabel: "請求書を送信",
  },
  ko: {
    cannotReadBill: "영수증을 읽을 수 없습니다",
    readBillSuccess: "영수증을 읽었습니다",
    readBillAutoFailed: "영수증을 자동으로 읽을 수 없습니다",
    readBillFailed: "영수증 읽기에 실패했습니다",
    readBillConfirmTitle: "영수증 데이터를 읽을까요?",
    readBillConfirmDescription: "선택한 파일을 읽고 가능한 경우 총액을 제안합니다.",
    readBillConfirmLabel: "영수증 읽기",
    billSubmitted: "영수증이 제출되었습니다",
    billSubmitSuccess: "영수증 제출 완료",
    billSubmitFailed: "영수증 제출 실패",
    billSubmitBlocked: "아직 영수증을 제출할 수 없습니다",
    billSubmitConfirmTitle: "영수증 제출을 확인할까요?",
    billSubmitConfirmDescription: "이 영수증을 관리자 검토용으로 제출하시겠습니까?",
    billSubmitConfirmLabel: "영수증 제출",
  },
  zh: {
    cannotReadBill: "无法读取账单",
    readBillSuccess: "账单读取成功",
    readBillAutoFailed: "无法自动读取账单",
    readBillFailed: "账单读取失败",
    readBillConfirmTitle: "读取账单数据？",
    readBillConfirmDescription: "系统将读取所选文件，并在可用时建议总金额。",
    readBillConfirmLabel: "读取账单",
    billSubmitted: "账单已提交",
    billSubmitSuccess: "账单提交成功",
    billSubmitFailed: "账单提交失败",
    billSubmitBlocked: "暂时无法提交账单",
    billSubmitConfirmTitle: "确认提交账单？",
    billSubmitConfirmDescription: "确定要提交此账单给管理员审核吗？",
    billSubmitConfirmLabel: "提交账单",
  },
};

const billFeedbackText = (key: BillFeedbackKey, language: LanguageCode) =>
  billFeedbackCopy[language]?.[key] ?? billFeedbackCopy.vi[key];

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
    case "PENDING_PM_BA":
      return localize("Chờ duyệt", language);
    case "PAID":
      return localize("Đã thanh toán", language);
    case "VOIDED":
      return localize("Đã hủy", language);
    default:
      return localize("Đang xử lý", language);
  }
};

const cancelledBookingStatuses = new Set(["CANCELLED", "NO_SHOW"]);
const bookingCancelledLabel = (status: string | null | undefined, language: LanguageCode) => {
  switch (String(status ?? "").toUpperCase()) {
    case "NO_SHOW":
      return localize("Không đến", language);
    case "CANCELLED":
      return localize("Đã hủy", language);
    default:
      return localize("Đã hủy", language);
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
  ["CHECKED_IN", "COMPLETED"].includes(String(booking?.status ?? "").toUpperCase());

const bookingConfirmedUsageAt = (booking: BookingRecord | null | undefined) =>
  booking?.qr?.usedAt ??
  booking?.couponIssue?.usedAt ??
  (isBookingAdminConfirmedForBill(booking)
    ? booking?.updatedAt ?? booking?.confirmedAt ?? booking?.scheduledAt ?? null
    : null) ??
  null;

const confirmedUsageSourceLabel = (
  booking: BookingRecord | null,
  couponIssue: CouponIssue | null,
  language: LanguageCode,
) => {
  if (booking?.qr?.usedAt) return localize("QR đặt chỗ đã được đối tác xác nhận", language);
  if (booking?.couponIssue?.usedAt) return localize("Mã ưu đãi gắn đặt chỗ đã được đối tác xác nhận", language);
  if (isBookingAdminConfirmedForBill(booking) && booking?.updatedAt) {
    return localize("Booking đã được xác nhận check-in", language);
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
  isCompletedBooking,
  hasExistingBill,
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
  isCompletedBooking: boolean;
  hasExistingBill: boolean;
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

  if (isCompletedBooking) {
    return "Booking đã hoàn tất nên không thể gửi hóa đơn nữa.";
  }

  if (hasExistingBill) {
    return "Hóa đơn của đặt chỗ hoặc mã ưu đãi này đã được gửi cho Admin duyệt. Bạn không thể gửi lại hóa đơn này.";
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

const billCode = (bill: ExistingBill) =>
  bill.billNumber?.trim() || bill.id.slice(0, 8).toUpperCase();

const billListCode = (bill: ExistingBill) =>
  bill.booking?.bookingCode ||
  (bill.booking?.id ? bill.booking.id.slice(0, 8).toUpperCase() : null) ||
  billCode(bill);

const findBillForBooking = (
  booking: BookingRecord | null | undefined,
  bills: BillRecord[],
): ExistingBill | null => {
  if (!booking) return null;
  const linkedBill = bills.find(
    (bill) =>
      bill.booking?.id === booking.id ||
      Boolean(booking.couponIssue?.id && bill.couponIssue?.id === booking.couponIssue.id),
  );
  return linkedBill ?? booking.bill ?? booking.couponIssue?.bill ?? null;
};

const findBillForCouponIssue = (
  couponIssueId: string | null | undefined,
  bills: BillRecord[],
): BillRecord | null => {
  if (!couponIssueId) return null;
  return bills.find((bill) => bill.couponIssue?.id === couponIssueId) ?? null;
};

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

const resolveAuthenticatedMediaUrl = (rawUrl?: string | null) => {
  if (!rawUrl) return "";
  const resolved = resolveClientUrl(rawUrl) || rawUrl;
  if (!resolved) return "";
  if (resolved.startsWith("data:") || resolved.startsWith("blob:")) {
    return resolved;
  }
  const token = getAuthToken();
  if (!token || resolved.includes("token=")) {
    return resolved;
  }
  const separator = resolved.includes("?") ? "&" : "?";
  return `${resolved}${separator}token=${encodeURIComponent(token)}`;
};

export default function Page() {
  const searchParams = useSearchParams();
  const activeLanguage = useActiveLanguage();
  const userFeedback = useUserActionFeedback();
  const t = useMemo(
    () => (value: string) => localize(value, activeLanguage),
    [activeLanguage],
  );
  const { formatMoney } = useMoneyFormatter(activeLanguage);
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
  const [activeListTab, setActiveListTab] = useState<BillListTab>("UNSENT");
  const [selectedBillId, setSelectedBillId] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [resubmitBill, setResubmitBill] = useState<BillRecord | null>(null);
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
      /\.(txt|csv)$/i.test(file.name)
    ) {
      try {
        return (await file.text()).slice(0, 8000);
      } catch {
        return "";
      }
    }

    return "";
  };

  const readEvidencePreview = async () => {
    if (!evidenceFile) return;
    const fileError = validateEvidenceFile(evidenceFile);
    if (fileError) {
      setNotice({ tone: "danger", message: fileError });
      userFeedback.error({
        title: billFeedbackText("cannotReadBill", activeLanguage),
        description: t(fileError),
      });
      return;
    }

    setIsReadingEvidence(true);
    setNotice(null);
    try {
      const preview = await billApi.previewBillOcr({
        fileName: evidenceFile.name,
        text: await readEvidenceText(evidenceFile),
      });
      const hasExtractedText = Boolean(preview.input?.hasExtractedText);
      const amountConfidence = preview.extractedFields?.totalVnd?.confidence ?? 0;
      const canPrefillAmount = Boolean(
        hasExtractedText && preview.suggestions.totalVnd && amountConfidence >= 0.75,
      );
      setOcrPreview(preview);
      if (canPrefillAmount && preview.suggestions.totalVnd) {
        setAmountInput(preview.suggestions.totalVnd.toLocaleString("vi-VN"));
      }
      const noticeMessage = !hasExtractedText
        ? t(
            "Ảnh/PDF hiện chưa có text OCR. Hệ thống không đọc trực tiếp ảnh này; vui lòng nhập tổng tiền thủ công và dùng file làm chứng từ.",
          )
        : canPrefillAmount
          ? preview.requiresManualReview
            ? t("Công cụ đọc hóa đơn đã gợi ý dữ liệu, vui lòng kiểm tra lại trước khi gửi.")
            : t("Công cụ đọc hóa đơn đã điền tổng tiền. Thời gian sử dụng vẫn lấy từ mốc đã xác nhận.")
          : t("Không có dữ liệu OCR để tự điền. Vui lòng nhập tổng tiền thủ công.");
      setNotice({
        tone: canPrefillAmount && !preview.requiresManualReview ? "success" : "warning",
        message: noticeMessage,
      });
      if (canPrefillAmount && !preview.requiresManualReview) {
        userFeedback.success({
          title: billFeedbackText("readBillSuccess", activeLanguage),
          description: t("Tổng tiền đã được điền theo dữ liệu hóa đơn."),
        });
      } else {
        userFeedback.warning({
          title: billFeedbackText("readBillAutoFailed", activeLanguage),
          description: !hasExtractedText
            ? t("Không có dữ liệu OCR để tự điền. Vui lòng nhập tổng tiền thủ công.")
            : t("Vui lòng kiểm tra lại dữ liệu gợi ý trước khi gửi."),
        });
      }
    } catch (error) {
      const message = t(cleanApiMessage(error));
      setNotice({ tone: "danger", message });
      userFeedback.error({
        title: billFeedbackText("readBillFailed", activeLanguage),
        description: message,
      });
    } finally {
      setIsReadingEvidence(false);
    }
  };

  const handleReadEvidence = () => {
    if (!evidenceFile) return;
    userFeedback.confirmAction({
      title: billFeedbackText("readBillConfirmTitle", activeLanguage),
      description: billFeedbackText("readBillConfirmDescription", activeLanguage),
      confirmLabel: billFeedbackText("readBillConfirmLabel", activeLanguage),
      onConfirm: readEvidencePreview,
    });
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const amountInputRef = React.useRef<HTMLInputElement>(null);

  const handleResubmitBill = (bill: BillRecord) => {
    setSelectedBillId("");
    setResubmitBill(bill);
    setIsFormOpen(true);
    if (bill.store?.slug) {
      setStoreSlug(bill.store.slug);
    }
    const bId = bill.booking?.id;
    if (bId) {
      setBookingId(bId);
    }
    if (bill.couponIssue?.id) {
      setCouponIssueId(bill.couponIssue.id);
    }
    if (bill.totalVnd) {
      setAmountInput(formatMoneyInput(String(bill.totalVnd)));
    }
    setEvidenceFile(null);
    setPreviewUrl(null);
    setOcrPreview(null);
    userFeedback.info({
      title: t("Gửi lại hóa đơn"),
      description: t("Vui lòng tải lên ảnh/chứng từ mới để gửi lại hóa đơn."),
    });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
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
        const billedCouponIssueIds = new Set(
          billItems
            .map((bill) => bill.couponIssue?.id)
            .filter((id): id is string => Boolean(id)),
        );

        setStores(bookedStoreItems);
        setBookings(mergedBookingItems);
        if (requestedBooking) {
          setBookingId(requestedBooking.id);
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
                bookedStoreSlugs.has(issueStoreSlug) &&
                !billedCouponIssueIds.has(issue.id),
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
  const billableBookings = useMemo(
    () =>
      bookings.filter((booking) => {
        const existingBill = findBillForBooking(booking, submittedBills);
        return (
          isBookingAdminConfirmedForBill(booking) &&
          Boolean(bookingConfirmedUsageAt(booking)) &&
          (!existingBill || booking.id === bookingId)
        );
      }),
    [bookingId, bookings, submittedBills],
  );
  const unsentBookings = useMemo(
    () => billableBookings.filter((booking) => !findBillForBooking(booking, submittedBills)),
    [billableBookings, submittedBills],
  );
  const pendingBills = useMemo(
    () => submittedBills.filter((bill) => ["SUBMITTED", "PENDING_PM_BA"].includes(bill.status)),
    [submittedBills],
  );
  const approvedBills = useMemo(
    () => submittedBills.filter((bill) => ["VERIFIED", "PAID"].includes(bill.status)),
    [submittedBills],
  );
  const rejectedBills = useMemo(
    () => submittedBills.filter((bill) => ["REJECTED", "VOIDED"].includes(bill.status)),
    [submittedBills],
  );
  const cancelledBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          cancelledBookingStatuses.has(String(booking.status ?? "").toUpperCase()) &&
          !findBillForBooking(booking, submittedBills),
      ),
    [bookings, submittedBills],
  );
  const selectedBill = useMemo(
    () => submittedBills.find((bill) => bill.id === selectedBillId) ?? null,
    [selectedBillId, submittedBills],
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
  const selectedExistingBill = useMemo(
    () => {
      if (resubmitBill) return null;
      return (
        findBillForBooking(selectedBooking, submittedBills) ??
        findBillForCouponIssue(selectedCouponIssue?.id, submittedBills)
      );
    },
    [resubmitBill, selectedBooking, selectedCouponIssue?.id, submittedBills],
  );
  const selectedExistingBillMessage = selectedExistingBill
    ? `${t("Hóa đơn của đặt chỗ hoặc mã ưu đãi này đã được gửi cho Admin duyệt. Bạn không thể gửi lại hóa đơn này.")} #${billCode(selectedExistingBill)}`
    : "";

  const confirmedUsageAt = useMemo(() => {
    if (resubmitBill) {
      return (
        resubmitBill.usedAt ||
        (resubmitBill.booking ? bookingConfirmedUsageAt(resubmitBill.booking) : null) ||
        resubmitBill.createdAt
      );
    }
    if (selectedBooking) return bookingConfirmedUsageAt(selectedBooking);
    if (selectedCouponIssue) return selectedCouponIssue.usedAt ?? null;
    return null;
  }, [resubmitBill, selectedBooking, selectedCouponIssue]);
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
  const selectedBillDiscountLabel = useMemo(() => {
    if (!selectedBill) return "";
    const label = couponDiscountLabel(
      selectedBill.coupon ?? selectedBill.booking?.coupon ?? null,
      selectedBill.couponIssue ?? selectedBill.booking?.couponIssue ?? null,
      formatMoney,
      activeLanguage,
    );
    if (label) return label;
    if (selectedBill.discountVnd && selectedBill.discountVnd > 0) {
      return `-${formatMoney(selectedBill.discountVnd)}`;
    }
    return "";
  }, [selectedBill, formatMoney, activeLanguage]);

  const resubmitBillDiscountLabel = useMemo(() => {
    if (!resubmitBill) return "";
    const label = couponDiscountLabel(
      resubmitBill.coupon ?? resubmitBill.booking?.coupon ?? null,
      resubmitBill.couponIssue ?? resubmitBill.booking?.couponIssue ?? null,
      formatMoney,
      activeLanguage,
    );
    if (label) return label;
    if (resubmitBill.discountVnd && resubmitBill.discountVnd > 0) {
      return `-${formatMoney(resubmitBill.discountVnd)}`;
    }
    return "";
  }, [resubmitBill, formatMoney, activeLanguage]);

  const amount = useMemo(() => parseMoneyInput(amountInput), [amountInput]);
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
        hasBookedStores: stores.length > 0 || Boolean(resubmitBill),
        hasStore: Boolean(bookingId || storeSlug || resubmitBill),
        hasConfirmedUsageSource: Boolean(selectedBooking || selectedCouponIssue || resubmitBill),
        isCompletedBooking:
          Boolean(selectedBooking) && !isBookingAdminConfirmedForBill(selectedBooking),
        hasExistingBill: Boolean(selectedExistingBill),
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
      resubmitBill,
      storeSlug,
      stores.length,
      selectedBooking,
      selectedCouponIssue,
      selectedExistingBill,
      timeWindow.nowMs,
      t,
      usedAt,
    ],
  );
  const canSubmit =
    !isSubmitting &&
    !selectedExistingBill &&
    !billValidationMessage;

  const handleCouponIssueChange = (value: string) => {
    setCouponIssueId(value);
    const issue = couponIssues.find((item) => item.id === value);
    if (issue?.coupon.store?.slug) {
      setStoreSlug(issue.coupon.store.slug);
    }
  };

  const handleAmountChange = (value: string) => {
    setAmountInput(formatMoneyInput(value));
  };

  const handleOpenBooking = (booking: BookingRecord) => {
    setSelectedBillId("");
    setResubmitBill(null);
    setIsFormOpen(true);
    setBookingId(booking.id);
    setCouponIssueId("");
    setAmountInput("");
    setNotice(null);
    if (booking.store?.slug) {
      setStoreSlug(booking.store.slug);
    }
  };

  const handleOpenBill = (bill: BillRecord) => {
    setSelectedBillId(bill.id);
    setResubmitBill(null);
    setIsFormOpen(false);
    setBookingId("");
    setCouponIssueId("");
    setAmountInput("");
    setNotice(null);
  };

  const handleBackToList = () => {
    setSelectedBillId("");
    setResubmitBill(null);
    setIsFormOpen(false);
    setBookingId("");
    setCouponIssueId("");
    setAmountInput("");
    setNotice(null);
  };

  const submitBill = async () => {
    setIsSubmitting(true);
    try {
      const targetBookingId = resubmitBill?.booking?.id || bookingId;
      const targetCouponIssueId = selectedCouponIssue?.id || resubmitBill?.couponIssue?.id || couponIssueId;
      const targetCouponId = selectedCouponIssue?.coupon?.id || resubmitBill?.coupon?.id;

      const payload = {
        storeSlug: resubmitBill?.store?.slug || storeSlug,
        ...(targetBookingId
          ? { bookingId: targetBookingId }
          : {
              ...(targetCouponId ? { couponId: targetCouponId } : {}),
              ...(targetCouponIssueId ? { couponIssueId: targetCouponIssueId } : {}),
            }),
        totalVnd: amount,
        usedAt: usedAtDate.toISOString(),
      };
      let uploadWarning = "";
      let uploadedEvidence: UploadedBillEvidence | null = null;

      if (resubmitBill && evidenceFile) {
        uploadedEvidence = await billApi.uploadEvidence(resubmitBill.id, evidenceFile);
      }

      const bill = resubmitBill
        ? await billApi.resubmitMemberBill(resubmitBill.id, { totalVnd: amount })
        : await billApi.submitMemberBill(payload);

      if (!resubmitBill && evidenceFile) {
        try {
          uploadedEvidence = await billApi.uploadEvidence(bill.id, evidenceFile);
        } catch {
          uploadWarning = ` ${t("Hóa đơn đã được gửi, nhưng ảnh hoặc chứng từ chưa tải lên được.")}`;
        }
      }

      const billWithEvidence: BillRecord = uploadedEvidence
        ? {
            ...bill,
            media: [
              {
                id: uploadedEvidence.id,
                storageKey: uploadedEvidence.storageKey,
                originalName: uploadedEvidence.originalName,
                mimeType: uploadedEvidence.mimeType,
                access: uploadedEvidence.access,
                url: uploadedEvidence.url,
              },
            ],
          }
        : resubmitBill?.media?.length
          ? { ...bill, media: resubmitBill.media }
          : bill;

      setSubmittedBills((current) =>
        resubmitBill
          ? current.map((item) => (item.id === billWithEvidence.id ? billWithEvidence : item))
          : [billWithEvidence, ...current],
      );
      const showBillToast = uploadWarning ? userFeedback.warning : userFeedback.success;
      showBillToast({
        title: uploadWarning
          ? billFeedbackText("billSubmitted", activeLanguage)
          : billFeedbackText("billSubmitSuccess", activeLanguage),
        description: uploadWarning
          ? t("Hóa đơn đã được gửi nhưng chứng từ chưa tải lên được.")
          : t("Hóa đơn đã được gửi để quản trị viên duyệt."),
      });
      setNotice({
        tone: uploadWarning ? "warning" : "success",
        message: `${t("Đã gửi hóa đơn")} ${billWithEvidence.id.slice(0, 8)} ${t("để quản trị viên duyệt.")}${uploadWarning}`,
        bill: billWithEvidence,
      });
      setAmountInput("");
      setSelectedBillId("");
      setResubmitBill(null);
      setBookingId("");
      setCouponIssueId("");
      setIsFormOpen(false);
      setEvidenceFile(null);
      setOcrPreview(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (error) {
      const message = t(cleanApiMessage(error));
      setNotice({ tone: "danger", message });
      userFeedback.error({
        title: billFeedbackText("billSubmitFailed", activeLanguage),
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);

    if (billValidationMessage) {
      setNotice({
        tone: "danger",
        message: billValidationMessage,
      });
      userFeedback.error({
        title: billFeedbackText("billSubmitBlocked", activeLanguage),
        description: billValidationMessage,
      });
      return;
    }

    userFeedback.confirmAction({
      title: billFeedbackText("billSubmitConfirmTitle", activeLanguage),
      description: billFeedbackText("billSubmitConfirmDescription", activeLanguage),
      confirmLabel: billFeedbackText("billSubmitConfirmLabel", activeLanguage),
      onConfirm: submitBill,
    });
  };

  return (
    <ConfigProvider locale={antdLocaleByLanguage[activeLanguage]} theme={billPickerTheme}>
      <main className="nl-bill-page">
        <section className="nl-bill-shell">
          <div className="nl-bill-head">
            <Link href="/tai-khoan" className="nl-back-round" aria-label={t("Quay lại tài khoản")}>
              <ChevronLeft size={18} />
            </Link>
            <div className="nl-bill-header-copy">
              <h1 className="nl-bill-header-title">{t("Gửi hóa đơn")}</h1>
              <p className="nl-bill-header-subtitle">{t("Đối soát hóa đơn")}</p>
            </div>
            <span className="nl-bill-rule-pill">
              <Clock size={12} />
              <span>{t("Trong 10 ngày")}</span>
            </span>
          </div>

          {!isFormOpen && !bookingId && !selectedBill ? (
            <section className="nl-bill-list" aria-label={t("Danh sách hóa đơn") }>
              <div className="nl-bill-filter-chips" role="tablist" aria-label={t("Trạng thái hóa đơn") }>
                {[
                  { id: "UNSENT" as const, label: t("Chưa gửi"), count: unsentBookings.length },
                  { id: "PENDING" as const, label: t("Chờ duyệt"), count: pendingBills.length },
                  { id: "APPROVED" as const, label: t("Duyệt"), count: approvedBills.length },
                  { id: "CANCELLED" as const, label: t("Hủy/Từ chối"), count: rejectedBills.length + cancelledBookings.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeListTab === tab.id ? "nl-bill-filter-chip active" : "nl-bill-filter-chip"}
                    onClick={() => setActiveListTab(tab.id)}
                    role="tab"
                    aria-selected={activeListTab === tab.id}
                  >
                    <span>{tab.label}</span>
                    <span className="nl-bill-chip-count">{tab.count}</span>
                  </button>
                ))}
              </div>

              {isLoadingOptions ? (
                <div className="nl-bill-list-empty">{t("Đang tải danh sách hóa đơn...")}</div>
              ) : activeListTab === "UNSENT" ? (
                unsentBookings.length ? (
                  <div className="nl-bill-list-items">
                    {unsentBookings.map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        className="nl-bill-list-item"
                        onClick={() => handleOpenBooking(booking)}
                      >
                        <div className="nl-bill-list-item-main">
                          <strong>{bookingTitle(booking)}</strong>
                          <span>#{booking.bookingCode || booking.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="nl-bill-list-item-meta">
                          <span>{formatDateTime(bookingConfirmedUsageAt(booking), activeLanguage)}</span>
                          <span className="nl-status-tag draft">{t("Nhập hóa đơn")}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="nl-bill-list-empty">{t("Chưa có booking nào đã check-in cần gửi hóa đơn.")}</div>
                )
              ) : activeListTab === "CANCELLED" ? (
                rejectedBills.length || cancelledBookings.length ? (
                  <div className="nl-bill-list-items">
                    {rejectedBills.map((bill) => (
                      <button
                        key={bill.id}
                        type="button"
                        className="nl-bill-list-item"
                        onClick={() => handleOpenBill(bill)}
                      >
                        <div className="nl-bill-list-item-main">
                          <strong>{bill.store?.name || "NightLife"}</strong>
                          <span>#{billListCode(bill)}</span>
                        </div>
                        <div className="nl-bill-list-item-meta">
                          <span>{formatMoney(bill.totalVnd)}</span>
                          <span className={`nl-status-tag ${bill.status.toLowerCase()}`}>
                            {billStatusLabel(bill.status, activeLanguage)}
                          </span>
                        </div>
                      </button>
                    ))}
                    {cancelledBookings.map((booking) => (
                      <button
                        key={booking.id}
                        type="button"
                        className="nl-bill-list-item"
                        onClick={() => handleOpenBooking(booking)}
                      >
                        <div className="nl-bill-list-item-main">
                          <strong>{bookingTitle(booking)}</strong>
                          <span>#{booking.bookingCode || booking.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="nl-bill-list-item-meta">
                          <span>{formatDateTime(booking.scheduledAt, activeLanguage)}</span>
                          <span className="nl-status-tag voided">
                            {bookingCancelledLabel(booking.status, activeLanguage)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="nl-bill-list-empty">{t("Chưa có hóa đơn hoặc booking bị hủy/từ chối.")}</div>
                )
              ) : (activeListTab === "PENDING" ? pendingBills : approvedBills).length ? (
                <div className="nl-bill-list-items">
                  {(activeListTab === "PENDING" ? pendingBills : approvedBills).map((bill) => (
                    <button
                      key={bill.id}
                      type="button"
                      className="nl-bill-list-item"
                      onClick={() => handleOpenBill(bill)}
                    >
                      <div className="nl-bill-list-item-main">
                        <strong>{bill.store?.name || "NightLife"}</strong>
                        <span>#{billListCode(bill)}</span>
                      </div>
                      <div className="nl-bill-list-item-meta">
                        <span>{formatMoney(bill.totalVnd)}</span>
                        <span className={`nl-status-tag ${bill.status.toLowerCase()}`}>
                          {billStatusLabel(bill.status, activeLanguage)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="nl-bill-list-empty">{t("Chưa có hóa đơn trong trạng thái này.")}</div>
              )}

              <div className="nl-bill-footer">
                <div className="nl-info-note">
                  <Info size={15} />
                  <span>{t("Gửi hóa đơn sau mỗi chuyến đi để tích lũy điểm thưởng, thăng hạng thành viên VIP và nhận nhiều ưu đãi đặc quyền.")}</span>
                </div>
              </div>
            </section>
          ) : selectedBill ? (
            <>
              <button type="button" className="nl-bill-list-back" onClick={handleBackToList}>
                <ChevronLeft size={16} />
                <span>{t("Danh sách hóa đơn")}</span>
              </button>
              <div className="nl-bill-layout">
                <section className="nl-bill-form nl-bill-detail" aria-label={t("Chi tiết hóa đơn")}>
                  <div className="nl-receipt-ticket">
                    <div className="nl-receipt-header">
                      <span className="nl-receipt-title">{t("Chi tiết hóa đơn")}</span>
                      <strong className="nl-receipt-store notranslate" translate="no" data-no-translate="true">
                        {selectedBill.store?.name || "NightLife"}
                      </strong>
                    </div>
                    <div className="nl-receipt-body">
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Mã hóa đơn")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value highlight">#{billCode(selectedBill)}</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Trạng thái")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className={`nl-status-tag ${selectedBill.status.toLowerCase()}`}>
                          {billStatusLabel(selectedBill.status, activeLanguage)}
                        </span>
                      </div>
                      {selectedBill.booking ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Mã đặt chỗ")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value highlight">
                            #{selectedBill.booking.bookingCode || selectedBill.booking.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      ) : null}
                      {selectedBill.coupon || selectedBill.couponIssue || selectedBill.booking?.coupon || selectedBill.booking?.couponIssue ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Mã ưu đãi/QR")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value nl-receipt-value-wrap">
                            {selectedBill.coupon?.name ??
                              selectedBill.booking?.coupon?.name ??
                              selectedBill.couponIssue?.code ??
                              selectedBill.booking?.couponIssue?.code ??
                              selectedBill.coupon?.code ??
                              t("QR đặt chỗ")}
                          </span>
                        </div>
                      ) : null}
                      {selectedBillDiscountLabel ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Mức giảm")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value discount">{selectedBillDiscountLabel}</span>
                        </div>
                      ) : null}
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Tổng tiền")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value highlight">{formatMoney(selectedBill.totalVnd)}</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Ngày sử dụng")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">{formatDateTime(selectedBill.usedAt, activeLanguage)}</span>
                      </div>
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Ngày gửi")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">{formatDateTime(selectedBill.submittedAt, activeLanguage)}</span>
                      </div>
                      {selectedBill.booking?.scheduledAt ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Đặt chỗ liên kết")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value nl-receipt-value-wrap">
                            {formatDateTime(selectedBill.booking.scheduledAt, activeLanguage)}
                          </span>
                        </div>
                      ) : null}
                      {selectedBill.rejectReason ? (
                        <div className="nl-detail-note danger">
                          <AlertCircle size={16} />
                          <span>{selectedBill.rejectReason}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {selectedBill.media?.length ? (
                    <div className="nl-detail-media">
                      <span className="nl-receipt-title">{t("Ảnh / chứng từ")}</span>
                      <div className="nl-detail-media-grid">
                        {selectedBill.media.map((media) => {
                          const mediaUrl = resolveAuthenticatedMediaUrl(media.url);
                          const isImg =
                            media.mimeType?.startsWith("image/") ||
                            /\.(jpeg|jpg|gif|png|webp)$/i.test((mediaUrl.split("?")[0] || "")) ||
                            /\.(jpeg|jpg|gif|png|webp)$/i.test((media.originalName || "").split("?")[0] || "");

                          return isImg ? (
                            <a
                              key={media.id}
                              href={mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="nl-detail-media-img-wrapper"
                              title={t("Xem ảnh gốc")}
                            >
                              <img
                                src={mediaUrl}
                                alt={media.originalName || t("Ảnh xem trước chứng từ")}
                                className="nl-detail-media-img"
                              />
                              <div className="nl-detail-media-overlay">
                                <Maximize2 size={18} />
                                <span>{t("Xem ảnh gốc")}</span>
                              </div>
                            </a>
                          ) : (
                            <a
                              key={media.id}
                              href={mediaUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="nl-detail-media-link"
                            >
                              <FileText size={16} />
                              <span>{media.originalName || media.mimeType || t("Tải file chứng từ")}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  {(() => {
                    if (selectedBill.status !== "REJECTED") return null;
                    const rawUsedAt =
                      selectedBill.usedAt ||
                      selectedBill.booking?.scheduledAt ||
                      selectedBill.createdAt;
                    if (!rawUsedAt) return null;
                    const usedAtDate = new Date(rawUsedAt);
                    const now = new Date();
                    const diffMs = now.getTime() - usedAtDate.getTime();
                    const isWithin10Days =
                      diffMs >= 0 && diffMs <= 10 * 24 * 60 * 60 * 1000;
                    if (!isWithin10Days) return null;

                    return (
                      <div className="nl-detail-resubmit-box">
                        <div className="nl-detail-resubmit-actions">
                          <button
                            type="button"
                            className="nl-bill-resubmit-btn primary"
                            onClick={() => handleResubmitBill(selectedBill)}
                          >
                            <RotateCcw size={16} />
                            <span>{t("Gửi lại hóa đơn")}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </section>
              </div>
            </>
          ) : (
            <>
              <button type="button" className="nl-bill-list-back" onClick={handleBackToList}>
                <ChevronLeft size={16} />
                <span>{t("Danh sách hóa đơn")}</span>
              </button>
              <div className="nl-bill-layout">
            <form className="nl-bill-form" noValidate onSubmit={handleSubmit}>
              {/* Hidden inputs for test compatibility */}
              <input type="hidden" id="bill-used-at" value={usedAt ? formatDateTime(confirmedUsageAt, activeLanguage) : ""} readOnly />
              <input type="hidden" id="bill-booking" value={bookingId} readOnly />

              {selectedBooking || selectedCouponIssue || resubmitBill ? (
                /* Hidden input for test compatibility & form state */
                <input type="hidden" id="bill-store-select" value={storeSlug} readOnly />
              ) : (
                <div className="nl-field">
                  <label htmlFor="bill-store-select">
                    {t("Quán / cơ sở")} *
                  </label>
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
                  {!isLoadingOptions && !stores.length ? (
                    <span className="nl-field-help">
                      {t("Bạn cần đặt chỗ ở một quán trước khi gửi hóa đơn.")}
                    </span>
                  ) : null}
                </div>
              )}

              {resubmitBill ? (
                <section className="nl-linked-booking" aria-label={t("Đơn hàng đang liên kết")}>
                  <div className="nl-receipt-ticket">
                    <div className="nl-receipt-header">
                      <span className="nl-receipt-title">{t("Đơn hàng đang liên kết")}</span>
                      <strong className="nl-receipt-store notranslate" translate="no" data-no-translate="true">
                        {resubmitBill.store?.name || "NightLife"}
                      </strong>
                    </div>
                    <div className="nl-receipt-body">
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Mã hóa đơn")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value highlight">#{billCode(resubmitBill)}</span>
                      </div>
                      {resubmitBill.booking ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Mã đặt chỗ")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value highlight">
                            #{resubmitBill.booking.bookingCode || resubmitBill.booking.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      ) : null}
                      {resubmitBill.booking?.scheduledAt ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Giờ hẹn")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value">
                            {formatDateTime(resubmitBill.booking.scheduledAt, activeLanguage)}
                          </span>
                        </div>
                      ) : null}
                      <div className="nl-receipt-row">
                        <span className="nl-receipt-label">{t("Xác nhận sử dụng")}</span>
                        <div className="nl-receipt-line"></div>
                        <span className="nl-receipt-value">
                          {resubmitBill.usedAt
                            ? formatDateTime(resubmitBill.usedAt, activeLanguage)
                            : resubmitBill.booking && bookingConfirmedUsageAt(resubmitBill.booking)
                            ? formatDateTime(bookingConfirmedUsageAt(resubmitBill.booking), activeLanguage)
                            : formatDateTime(resubmitBill.createdAt, activeLanguage)}
                        </span>
                      </div>
                      {resubmitBill.booking?.partySize ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Số người")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value">
                            {partySizeLabel(resubmitBill.booking.partySize, activeLanguage)}
                          </span>
                        </div>
                      ) : null}
                      {resubmitBill.coupon || resubmitBill.couponIssue || resubmitBill.booking?.coupon || resubmitBill.booking?.couponIssue ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Mã ưu đãi/QR")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value nl-receipt-value-wrap">
                            {resubmitBill.coupon?.name ??
                              resubmitBill.booking?.coupon?.name ??
                              resubmitBill.couponIssue?.code ??
                              resubmitBill.booking?.couponIssue?.code ??
                              resubmitBill.coupon?.code ??
                              t("QR đặt chỗ")}
                          </span>
                        </div>
                      ) : null}
                      {resubmitBillDiscountLabel ? (
                        <div className="nl-receipt-row">
                          <span className="nl-receipt-label">{t("Mức giảm")}</span>
                          <div className="nl-receipt-line"></div>
                          <span className="nl-receipt-value discount">{resubmitBillDiscountLabel}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </section>
              ) : selectedBooking ? (
                <section className="nl-linked-booking" aria-label={t("Đặt chỗ đang gắn với hóa đơn")}>
                  <div className="nl-receipt-ticket">
                    <div className="nl-receipt-header">
                      <span className="nl-receipt-title">{t("Đơn hàng đang liên kết")}</span>
                      <strong className="nl-receipt-store notranslate" translate="no" data-no-translate="true">{bookingTitle(selectedBooking)}</strong>
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
                        <span className="nl-receipt-value nl-receipt-value-wrap">
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

              {!resubmitBill && !selectedBooking && couponIssues.length ? (
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
                      ref={amountInputRef}
                      id="bill-total"
                      inputMode="numeric"
                      placeholder={t("Vui lòng nhập tổng tiền")}
                      value={amountInput}
                      onChange={(event) => handleAmountChange(event.target.value)}
                    />
                    <span className="nl-amount-suffix">₫</span>
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
                        ref={fileInputRef}
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
                        {t(
                          ocrPreview.suggestions.totalVnd || ocrPreview.suggestions.usedAt
                            ? "Gợi ý từ công cụ đọc hóa đơn"
                            : "Không đọc được, cần nhập tay",
                        )}{" "}
                        ({t("Độ tin cậy")} {Math.round(ocrPreview.confidence * 100)}%)
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

              {selectedExistingBillMessage ? (
                <div className="nl-notice warning">
                  <div className="nl-notice-icon">
                    <AlertCircle size={16} />
                  </div>
                  <span>{selectedExistingBillMessage}</span>
                </div>
              ) : (
                <button type="submit" className="nl-submit-premium" disabled={!canSubmit}>
                  {isSubmitting ? (
                    <>
                      <span className="spin-loader"></span>
                      <span>{resubmitBill ? t("Đang gửi lại hóa đơn...") : t("Đang gửi hóa đơn...")}</span>
                    </>
                  ) : (
                    <span>{resubmitBill ? t("Gửi lại hóa đơn") : t("Gửi hóa đơn")}</span>
                  )}
                </button>
              )}
            </form>

              </div>
            </>
          )}
        </section>

      <style jsx>{`
        .nl-bill-page {
          width: 100%;
          min-height: auto;
          overflow-x: hidden;
          background: var(--vy-bg);
          color: var(--vy-text);
        }

        .nl-bill-shell {
          width: min(100%, 1120px);
          max-width: 100%;
          box-sizing: border-box;
          margin: 0 auto;
          padding: 24px 18px 34px;
        }

        .nl-bill-page *,
        .nl-bill-page *::before,
        .nl-bill-page *::after {
          box-sizing: border-box;
        }

        .nl-bill-head {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 4px;
          margin-bottom: 20px;
        }

        .nl-back-round {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--vy-border-gold-22);
          border-radius: 999px;
          background: var(--vy-surface-2);
          color: var(--vy-gold-hi);
          text-decoration: none;
        }

        .nl-back-round:hover {
          border-color: var(--vy-border-gold-40);
          color: var(--vy-gold-hi);
        }

        .nl-bill-header-copy {
          min-width: 0;
          flex: 1;
        }

        .nl-bill-header-title {
          margin: 0;
          color: var(--vy-text);
          font-size: 16px;
          font-weight: 780;
          line-height: 1.1;
        }

        .nl-bill-header-subtitle {
          margin: 3px 0 0;
          color: var(--vy-text-2);
          font-size: 11px;
          line-height: 1.35;
        }

        .nl-bill-rule-pill {
          flex: none;
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

        .nl-bill-list {
          display: grid;
          gap: 16px;
        }

        .nl-bill-filter-chips {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 4px;
        }

        .nl-bill-filter-chips::-webkit-scrollbar {
          display: none;
        }

        .nl-bill-filter-chip {
          flex: none;
          min-height: 34px;
          border-radius: 999px;
          padding: 8px 14px;
          font-size: 12px;
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          color: #c5c0b6;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 720;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .nl-bill-filter-chip.active {
          border-color: transparent;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
          color: #241a0a;
        }

        .nl-bill-filter-chip.active * {
          background: transparent !important;
          color: #241a0a !important;
        }

        html.vy-light .nl-bill-filter-chip {
          border-color: rgba(30, 24, 12, 0.14);
          background: rgba(28, 22, 10, 0.045);
          color: #4a453c;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        @media (hover: hover) and (pointer: fine) {
          html.vy-light .nl-bill-filter-chip:hover:not(.active) {
            border-color: rgba(30, 24, 12, 0.22);
            background: rgba(28, 22, 10, 0.08);
            color: #211e19;
          }
        }

        html.vy-light .nl-bill-filter-chip.active {
          border-color: transparent !important;
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a) !important;
          color: #241a0a !important;
        }

        .nl-bill-chip-count {
          font-size: 11px;
          opacity: 0.85;
        }

        .nl-bill-footer {
          margin-top: 16px;
        }

        .nl-info-note {
          border: 1px solid var(--vy-border);
          border-radius: 14px;
          background: var(--vy-surface-1);
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 11px 13px;
        }

        .nl-info-note svg {
          flex: none;
          margin-top: 1px;
          color: #d9bd84;
        }

        .nl-info-note span {
          margin: 0;
          color: #8c8679;
          font-size: 11px;
          line-height: 1.55;
        }

        .nl-bill-list-back {
          border: 0;
          font: inherit;
          cursor: pointer;
        }

        .nl-bill-list-items {
          display: grid;
          gap: 10px;
        }

        .nl-bill-list-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 15px;
          border: 1px solid var(--vy-border);
          border-radius: 8px;
          background: var(--vy-surface-1);
          color: var(--vy-text);
          text-align: left;
        }

        button.nl-bill-list-item {
          cursor: pointer;
        }

        button.nl-bill-list-item:hover {
          border-color: var(--vy-border-gold-40);
          background: var(--vy-gold-soft-bg);
        }

        .nl-bill-list-item.static {
          cursor: default;
        }

        .nl-bill-list-item-main,
        .nl-bill-list-item-meta {
          display: grid;
          gap: 4px;
          min-width: 0;
        }

        .nl-bill-list-item-main strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }

        .nl-bill-list-item-main span,
        .nl-bill-list-item-meta > span:first-child {
          color: var(--vy-muted);
          font-size: 12px;
        }

        .nl-bill-list-item-meta {
          justify-items: end;
          flex: 0 0 auto;
        }

        .nl-bill-list-empty {
          padding: 34px 18px;
          border: 1px dashed var(--vy-border-gold-22);
          border-radius: 8px;
          color: var(--vy-muted);
          text-align: center;
          font-size: 13px;
        }

        .nl-bill-list-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin: 0 0 14px;
          padding: 0;
          background: transparent;
          color: var(--vy-gold-pale);
          font-size: 13px;
        }

        .nl-bill-layout {
          display: flex;
          justify-content: center;
          min-width: 0;
          width: 100%;
        }

        .nl-bill-form {
          width: min(100%, 860px);
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
          border-color: var(--vy-border);
          box-shadow: none;
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
          min-width: 0;
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

        .nl-receipt-value-wrap {
          flex: 1 1 auto;
          min-width: 0;
          max-width: 58%;
          text-align: right;
          white-space: normal;
          overflow-wrap: anywhere;
          line-height: 1.35;
        }

        .nl-receipt-value.highlight {
          color: var(--vy-gold-pale);
        }

        .nl-receipt-value.discount {
          color: var(--vy-pink);
        }

        .nl-bill-detail {
          display: grid;
          gap: 16px;
        }

        .nl-detail-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          border-radius: 10px;
          border: 1px solid var(--vy-border);
          padding: 12px 14px;
          color: var(--vy-muted);
          background: var(--vy-surface-3);
          font-size: 12px;
          line-height: 1.45;
        }

        .nl-detail-note.danger {
          color: var(--vy-error);
          border-color: rgba(232, 139, 153, 0.25);
          background: rgba(232, 139, 153, 0.06);
        }

        .nl-detail-media {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border: 1px solid var(--vy-border);
          border-radius: 14px;
          background: var(--vy-surface-3);
          padding: 14px;
        }

        .nl-detail-media-grid {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .nl-detail-media-img-wrapper {
          position: relative;
          display: block;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.4);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .nl-detail-media-img-wrapper:hover {
          border-color: var(--vy-gold-bright, #d4b26a);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .nl-detail-media-img {
          width: 100%;
          max-height: 420px;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }

        .nl-detail-media-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #f4e3b4;
          font-size: 12px;
          font-weight: 700;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .nl-detail-media-img-wrapper:hover .nl-detail-media-overlay {
          opacity: 1;
        }

        @media (min-width: 640px) {
          .nl-detail-media-img {
            max-height: 480px;
          }
        }

        .nl-detail-media-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--vy-gold-pale);
          text-decoration: none;
          font-size: 13px;
          font-weight: 700;
          overflow-wrap: anywhere;
        }

        .nl-detail-media-link:hover {
          color: var(--vy-gold-hi);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .nl-detail-resubmit-box {
          margin-top: 14px;
        }

        .nl-detail-resubmit-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .nl-detail-resubmit-actions .nl-bill-resubmit-btn.primary {
          grid-column: 1 / -1;
        }

        .nl-bill-resubmit-btn {
          width: 100%;
          min-height: 44px;
          border-radius: 12px;
          font-size: 13.5px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 10px 12px;
        }

        .nl-bill-resubmit-btn.primary {
          border: 1px solid var(--vy-gold-dim, #b6924a);
          background: linear-gradient(135deg, #f4e3b4, #d4b26a 55%, #b6924a);
          color: #241a0a;
          box-shadow: 0 4px 14px rgba(212, 178, 106, 0.2);
        }

        .nl-bill-resubmit-btn.secondary {
          border: 1px solid rgba(244, 227, 180, 0.25);
          background: rgba(255, 255, 255, 0.05);
          color: var(--vy-gold-pale, #f4e3b4);
        }

        .nl-bill-resubmit-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(244, 227, 180, 0.45);
          color: var(--vy-gold-hi, #fff0c6);
          transform: translateY(-1px);
        }

        .nl-bill-resubmit-btn.primary:hover {
          filter: brightness(1.08);
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(212, 178, 106, 0.3);
        }

        .nl-bill-resubmit-btn:active {
          transform: scale(0.98);
        }

        .nl-bill-resubmit-btn:active {
          transform: translateY(0);
        }

        .nl-upload-zone-wrapper {
          margin-top: 4px;
          width: 100%;
        }

        .nl-field .nl-upload-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0;
          border: 1px dashed var(--vy-border-gold-32);
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          padding: 24px 16px;
          cursor: pointer;
          text-align: center;
          text-transform: none;
          letter-spacing: 0;
          transition: all 0.3s ease;
          width: 100%;
        }

        .nl-field .nl-upload-zone:hover {
          border-color: var(--vy-gold);
          background: rgba(212, 178, 106, 0.02);
        }

        .nl-upload-icon {
          color: var(--vy-gold);
          margin-bottom: 8px;
          opacity: 0.8;
          align-self: center;
          flex: none;
        }

        .nl-upload-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--vy-text);
          margin-bottom: 4px;
          display: block;
          width: 100%;
          text-align: center;
        }

        .nl-upload-subtitle {
          font-size: 10.5px;
          color: var(--vy-muted);
          margin-bottom: 8px;
          display: block;
          width: 100%;
          text-align: center;
          line-height: 1.35;
        }

        .nl-upload-hint {
          font-size: 11px;
          color: var(--vy-faint);
          display: block;
          width: 100%;
          text-align: center;
          line-height: 1.35;
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

        :global(.nl-bill-ant-select.ant-select:hover .ant-select-selector) {
          border-color: var(--vy-gold) !important;
        }

        :global(.nl-bill-ant-select.ant-select-focused .ant-select-selector) {
          border-color: var(--vy-border) !important;
          box-shadow: none !important;
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

        .nl-status-tag {
          font-size: 9px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
          text-transform: uppercase;
          border: 1px solid transparent;
        }

        .nl-status-tag.submitted,
        .nl-status-tag.pending_pm_ba {
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

        .nl-status-tag.rejected,
        .nl-status-tag.voided {
          background: rgba(232, 139, 153, 0.12);
          color: var(--vy-error);
          border-color: rgba(232, 139, 153, 0.25);
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 860px) {
          .nl-bill-layout {
            display: block;
          }
        }

        @media (max-width: 620px) {
          .nl-bill-shell {
            padding: 16px 14px 18px;
          }

          .nl-bill-tabs {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 4px;
          }

          .nl-bill-tab {
            min-height: 44px;
            gap: 4px;
            font-size: 11px;
          }

          .nl-bill-tab-count {
            min-width: 18px;
            height: 18px;
            font-size: 10px;
          }

          .nl-bill-form {
            width: 100%;
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
