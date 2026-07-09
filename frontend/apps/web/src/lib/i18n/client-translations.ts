"use client";

export type LanguageCode = "vi" | "en" | "ja" | "ko" | "zh";

export const languageStorageKey = "vietyoru.language";
export const languageCookieName = "vietyoru_language";
export const languageChangedEvent = "vietyoru:language-change";

export const languageHtmlLang: Record<LanguageCode, string> = {
  vi: "vi",
  en: "en",
  ja: "ja",
  ko: "ko",
  zh: "zh",
};

const languageCodes: LanguageCode[] = ["vi", "en", "ja", "ko", "zh"];

type TranslationSet = Record<Exclude<LanguageCode, "vi">, string>;

type TranslationEntry = {
  vi: string;
} & TranslationSet;

const entries: TranslationEntry[] = [
  {
    vi: "Trang chủ",
    en: "Home",
    ja: "ホーム",
    ko: "홈",
    zh: "首页",
  },
  {
    vi: "Tìm quán",
    en: "Find venues",
    ja: "店舗を探す",
    ko: "매장 찾기",
    zh: "查找店铺",
  },
  {
    vi: "Tìm Cast",
    en: "Find Cast",
    ja: "キャストを探す",
    ko: "캐스트 찾기",
    zh: "查找 Cast",
  },
  {
    vi: "Cast",
    en: "Cast",
    ja: "キャスト",
    ko: "캐스트",
    zh: "Cast",
  },
  {
    vi: "Ưu đãi",
    en: "Deals",
    ja: "特典",
    ko: "혜택",
    zh: "优惠",
  },
  {
    vi: "Lịch đặt",
    en: "Reservations",
    ja: "予約",
    ko: "예약",
    zh: "预约",
  },
  {
    vi: "Tài khoản",
    en: "Account",
    ja: "アカウント",
    ko: "계정",
    zh: "账户",
  },
  {
    vi: "Bảng xếp hạng",
    en: "Ranking",
    ja: "ランキング",
    ko: "랭킹",
    zh: "排行榜",
  },
  {
    vi: "Ranking",
    en: "Ranking",
    ja: "ランキング",
    ko: "랭킹",
    zh: "排行榜",
  },
  {
    vi: "Khám phá",
    en: "Explore",
    ja: "探す",
    ko: "둘러보기",
    zh: "探索",
  },
  {
    vi: "Dịch vụ",
    en: "Services",
    ja: "サービス",
    ko: "서비스",
    zh: "服务",
  },
  {
    vi: "Pháp lý",
    en: "Legal",
    ja: "法務",
    ko: "법적 고지",
    zh: "法律",
  },
  {
    vi: "Blog",
    en: "Blog",
    ja: "ブログ",
    ko: "블로그",
    zh: "博客",
  },
  {
    vi: "Chính sách",
    en: "Policy",
    ja: "ポリシー",
    ko: "정책",
    zh: "政策",
  },
  {
    vi: "Chính sách bảo mật",
    en: "Privacy Policy",
    ja: "プライバシーポリシー",
    ko: "개인정보 처리방침",
    zh: "隐私政策",
  },
  {
    vi: "Điều khoản sử dụng",
    en: "Terms of Use",
    ja: "利用規約",
    ko: "이용약관",
    zh: "使用条款",
  },
  {
    vi: "Chọn ngôn ngữ",
    en: "Choose language",
    ja: "言語を選択",
    ko: "언어 선택",
    zh: "选择语言",
  },
  {
    vi: "Select language",
    en: "Select language",
    ja: "言語を選択",
    ko: "언어 선택",
    zh: "选择语言",
  },
  {
    vi: "Đang dùng",
    en: "In use",
    ja: "使用中",
    ko: "사용 중",
    zh: "使用中",
  },
  {
    vi: "Đang chọn",
    en: "Selected",
    ja: "選択中",
    ko: "선택됨",
    zh: "已选择",
  },
  {
    vi: "Hủy",
    en: "Cancel",
    ja: "キャンセル",
    ko: "취소",
    zh: "取消",
  },
  {
    vi: "Áp dụng VI",
    en: "Apply VI",
    ja: "VIを適用",
    ko: "VI 적용",
    zh: "应用 VI",
  },
  {
    vi: "Áp dụng EN",
    en: "Apply EN",
    ja: "ENを適用",
    ko: "EN 적용",
    zh: "应用 EN",
  },
  {
    vi: "Áp dụng JA",
    en: "Apply JA",
    ja: "JAを適用",
    ko: "JA 적용",
    zh: "应用 JA",
  },
  {
    vi: "Áp dụng KO",
    en: "Apply KO",
    ja: "KOを適用",
    ko: "KO 적용",
    zh: "应用 KO",
  },
  {
    vi: "Áp dụng ZH",
    en: "Apply ZH",
    ja: "ZHを適用",
    ko: "ZH 적용",
    zh: "应用 ZH",
  },
  {
    vi: "Đóng chọn ngôn ngữ",
    en: "Close language picker",
    ja: "言語選択を閉じる",
    ko: "언어 선택 닫기",
    zh: "关闭语言选择",
  },
  {
    vi: "Tiếng Việt",
    en: "Vietnamese",
    ja: "ベトナム語",
    ko: "베트남어",
    zh: "越南语",
  },
  {
    vi: "English",
    en: "English",
    ja: "英語",
    ko: "영어",
    zh: "英语",
  },
  {
    vi: "Vietnamese",
    en: "Vietnamese",
    ja: "ベトナム語",
    ko: "베트남어",
    zh: "越南语",
  },
  {
    vi: "International",
    en: "International",
    ja: "国際",
    ko: "국제",
    zh: "国际",
  },
  {
    vi: "Japanese",
    en: "Japanese",
    ja: "日本語",
    ko: "일본어",
    zh: "日语",
  },
  {
    vi: "Korean",
    en: "Korean",
    ja: "韓国語",
    ko: "한국어",
    zh: "韩语",
  },
  {
    vi: "Chinese",
    en: "Chinese",
    ja: "中国語",
    ko: "중국어",
    zh: "中文",
  },
  {
    vi: "Đăng nhập",
    en: "Log in",
    ja: "ログイン",
    ko: "로그인",
    zh: "登录",
  },
  {
    vi: "Đăng ký",
    en: "Sign up",
    ja: "登録",
    ko: "가입",
    zh: "注册",
  },
  {
    vi: "Đăng nhập hội viên",
    en: "Member login",
    ja: "会員ログイン",
    ko: "회원 로그인",
    zh: "会员登录",
  },
  {
    vi: "Tạo tài khoản hội viên",
    en: "Create member account",
    ja: "会員アカウントを作成",
    ko: "회원 계정 만들기",
    zh: "创建会员账户",
  },
  {
    vi: "Quay về trang chủ",
    en: "Back to home",
    ja: "ホームに戻る",
    ko: "홈으로 돌아가기",
    zh: "返回首页",
  },
  {
    vi: "Họ tên",
    en: "Full name",
    ja: "氏名",
    ko: "이름",
    zh: "姓名",
  },
  {
    vi: "Email",
    en: "Email",
    ja: "メールアドレス",
    ko: "이메일",
    zh: "电子邮箱",
  },
  {
    vi: "Mật khẩu",
    en: "Password",
    ja: "パスワード",
    ko: "비밀번호",
    zh: "密码",
  },
  {
    vi: "Nhập lại mật khẩu",
    en: "Confirm password",
    ja: "パスワードを再入力",
    ko: "비밀번호 확인",
    zh: "再次输入密码",
  },
  {
    vi: "Vui lòng nhập họ tên",
    en: "Please enter your full name",
    ja: "氏名を入力してください",
    ko: "이름을 입력해 주세요",
    zh: "请输入姓名",
  },
  {
    vi: "Vui lòng nhập email",
    en: "Please enter your email",
    ja: "メールアドレスを入力してください",
    ko: "이메일을 입력해 주세요",
    zh: "请输入电子邮箱",
  },
  {
    vi: "Vui lòng nhập mật khẩu",
    en: "Please enter your password",
    ja: "パスワードを入力してください",
    ko: "비밀번호를 입력해 주세요",
    zh: "请输入密码",
  },
  {
    vi: "Vui lòng nhập lại mật khẩu",
    en: "Please confirm your password",
    ja: "パスワードをもう一度入力してください",
    ko: "비밀번호를 다시 입력해 주세요",
    zh: "请再次输入密码",
  },
  {
    vi: "Giữ mọi cuộc hẹn nightlife trong một tài khoản.",
    en: "Keep every nightlife reservation in one account.",
    ja: "ナイトライフの予約を1つのアカウントで管理。",
    ko: "나이트라이프 예약을 한 계정에서 관리하세요.",
    zh: "用一个账户管理所有夜生活预约。",
  },
  {
    vi: "Tiếp tục đặt chỗ, lưu quán yêu thích và quản lý mã ưu đãi.",
    en: "Continue booking, save favorite venues, and manage deals.",
    ja: "予約を続け、お気に入りの店舗と特典を管理できます。",
    ko: "예약을 이어가고, 즐겨찾기와 혜택을 관리하세요.",
    zh: "继续预约、保存喜爱的店铺并管理优惠。",
  },
  {
    vi: "Tạo tài khoản để lưu ưu đãi, lịch đặt chỗ và điểm tích lũy.",
    en: "Create an account to save deals, reservations, and points.",
    ja: "特典、予約、ポイントを保存するためにアカウントを作成します。",
    ko: "혜택, 예약, 포인트를 저장하려면 계정을 만드세요.",
    zh: "创建账户以保存优惠、预约和积分。",
  },
  {
    vi: "Đăng nhập bằng Google",
    en: "Continue with Google",
    ja: "Googleで続行",
    ko: "Google로 계속하기",
    zh: "使用 Google 继续",
  },
  {
    vi: "Đăng nhập bằng LINE",
    en: "Continue with LINE",
    ja: "LINEで続行",
    ko: "LINE으로 계속하기",
    zh: "使用 LINE 继续",
  },
  {
    vi: "MEMBER ACCESS",
    en: "MEMBER ACCESS",
    ja: "会員アクセス",
    ko: "회원 전용",
    zh: "会员入口",
  },
  {
    vi: "Cần email để tạo tài khoản hội viên.",
    en: "Email is required to create a member account.",
    ja: "会員アカウントの作成にはメールアドレスが必要です。",
    ko: "회원 계정을 만들려면 이메일이 필요합니다.",
    zh: "创建会员账户需要电子邮箱。",
  },
  {
    vi: "Email từ LINE giúp bạn đăng nhập, lưu lịch đặt chỗ và bảo vệ tài khoản.",
    en: "Your LINE email helps you log in, save reservations, and protect your account.",
    ja: "LINEのメールアドレスはログイン、予約保存、アカウント保護に使われます。",
    ko: "LINE 이메일은 로그인, 예약 저장, 계정 보호에 사용됩니다.",
    zh: "LINE 邮箱用于登录、保存预约并保护账户。",
  },
  {
    vi: "Chia sẻ email qua LINE",
    en: "Share email via LINE",
    ja: "LINEでメールを共有",
    ko: "LINE으로 이메일 공유",
    zh: "通过 LINE 分享邮箱",
  },
  {
    vi: "Cho phép Vietyoru nhận email từ LINE để tạo hoặc đăng nhập tài khoản.",
    en: "Allow Vietyoru to receive your email from LINE to create or log in to your account.",
    ja: "アカウント作成またはログインのため、VietyoruがLINEからメールアドレスを受け取ることを許可します。",
    ko: "계정 생성 또는 로그인을 위해 Vietyoru가 LINE에서 이메일을 받도록 허용합니다.",
    zh: "允许 Vietyoru 从 LINE 接收您的邮箱，用于创建账户或登录。",
  },
  {
    vi: "Tôi đồng ý chia sẻ email từ LINE cho Vietyoru.",
    en: "I agree to share my LINE email with Vietyoru.",
    ja: "LINEのメールアドレスをVietyoruに共有することに同意します。",
    ko: "LINE 이메일을 Vietyoru와 공유하는 데 동의합니다.",
    zh: "我同意将 LINE 邮箱分享给 Vietyoru。",
  },
  {
    vi: "Tiếp tục với LINE",
    en: "Continue with LINE",
    ja: "LINEで続行",
    ko: "LINE으로 계속하기",
    zh: "使用 LINE 继续",
  },
  {
    vi: "Không dùng email cho quảng cáo.",
    en: "We do not use your email for advertising.",
    ja: "メールアドレスを広告目的には使用しません。",
    ko: "이메일을 광고 목적으로 사용하지 않습니다.",
    zh: "不会将邮箱用于广告。",
  },
  {
    vi: "Chỉ dùng để đăng nhập, lưu lịch đặt và gửi thông báo cần thiết.",
    en: "Used only for login, saved reservations, and essential notices.",
    ja: "ログイン、予約保存、必要な通知にのみ使用します。",
    ko: "로그인, 예약 저장, 필수 알림에만 사용합니다.",
    zh: "仅用于登录、保存预约和必要通知。",
  },
  {
    vi: "Bạn có thể yêu cầu hỗ trợ về dữ liệu cá nhân.",
    en: "You can request help with personal data at any time.",
    ja: "個人データについていつでもサポートを依頼できます。",
    ko: "개인정보 관련 지원을 언제든 요청할 수 있습니다.",
    zh: "您可以随时请求个人数据相关支持。",
  },
  {
    vi: "Điểm thưởng",
    en: "Reward points",
    ja: "ポイント",
    ko: "리워드 포인트",
    zh: "奖励积分",
  },
  {
    vi: "Quyền lợi thành viên",
    en: "Member benefits",
    ja: "会員特典",
    ko: "회원 혜택",
    zh: "会员权益",
  },
  {
    vi: "Ưu tiên xác nhận bàn VIP",
    en: "Priority VIP table confirmation",
    ja: "VIP席の優先確認",
    ko: "VIP 테이블 우선 확정",
    zh: "VIP 桌优先确认",
  },
  {
    vi: "Nhận coupon riêng theo hạng",
    en: "Receive tier-based coupons",
    ja: "ランク別クーポンを受け取る",
    ko: "등급별 쿠폰 받기",
    zh: "领取按等级发放的优惠券",
  },
  {
    vi: "Lưu lịch đặt chỗ và đặt lại nhanh",
    en: "Save reservations and rebook quickly",
    ja: "予約履歴を保存してすばやく再予約",
    ko: "예약을 저장하고 빠르게 다시 예약",
    zh: "保存预约并快速再次预订",
  },
  {
    vi: "Lịch sử đặt chỗ",
    en: "Reservation history",
    ja: "予約履歴",
    ko: "예약 내역",
    zh: "预约记录",
  },
  {
    vi: "Theo dõi yêu cầu và trạng thái xác nhận",
    en: "Track requests and confirmation status",
    ja: "リクエストと確認状況を確認",
    ko: "요청 및 확정 상태 확인",
    zh: "跟踪请求和确认状态",
  },
  {
    vi: "Ví ưu đãi",
    en: "Deal wallet",
    ja: "特典ウォレット",
    ko: "혜택 지갑",
    zh: "优惠券包",
  },
  {
    vi: "Coupon đã lưu và mã sắp hết hạn",
    en: "Saved coupons and expiring codes",
    ja: "保存済みクーポンと期限間近のコード",
    ko: "저장한 쿠폰과 곧 만료되는 코드",
    zh: "已保存优惠券和即将到期的代码",
  },
  {
    vi: "Hóa đơn của tôi",
    en: "My bills",
    ja: "請求書",
    ko: "내 영수증",
    zh: "我的账单",
  },
  {
    vi: "Gửi hóa đơn để tích điểm thành viên",
    en: "Submit bills to earn member points",
    ja: "請求書を送信して会員ポイントを獲得",
    ko: "영수증을 제출하고 회원 포인트 적립",
    zh: "提交账单以累计会员积分",
  },
  {
    vi: "Quán & Cast đã lưu",
    en: "Saved venues & Cast",
    ja: "保存済み店舗・キャスト",
    ko: "저장한 매장 & 캐스트",
    zh: "已保存店铺和 Cast",
  },
  {
    vi: "Danh sách yêu thích để đặt lại nhanh",
    en: "Favorites for quick rebooking",
    ja: "すばやく再予約できるお気に入り",
    ko: "빠른 재예약을 위한 즐겨찾기",
    zh: "用于快速再次预订的收藏",
  },
  {
    vi: "Bảo mật tài khoản",
    en: "Account security",
    ja: "アカウントのセキュリティ",
    ko: "계정 보안",
    zh: "账户安全",
  },
  {
    vi: "Trạng thái đăng nhập và quyền truy cập",
    en: "Login status and access permissions",
    ja: "ログイン状態とアクセス権限",
    ko: "로그인 상태 및 접근 권한",
    zh: "登录状态和访问权限",
  },
  {
    vi: "Thông tin cá nhân và quyền truy cập",
    en: "Personal information and access",
    ja: "個人情報とアクセス権",
    ko: "개인정보 및 접근 권한",
    zh: "个人信息和访问权限",
  },
  {
    vi: "Quay lại tài khoản",
    en: "Back to account",
    ja: "アカウントへ戻る",
    ko: "계정으로 돌아가기",
    zh: "返回账户",
  },
  {
    vi: "Email đăng nhập",
    en: "Login email",
    ja: "ログインメール",
    ko: "로그인 이메일",
    zh: "登录邮箱",
  },
  {
    vi: "Số điện thoại",
    en: "Phone number",
    ja: "電話番号",
    ko: "전화번호",
    zh: "电话号码",
  },
  {
    vi: "Quyền truy cập",
    en: "Access",
    ja: "アクセス権",
    ko: "접근 권한",
    zh: "访问权限",
  },
  {
    vi: "Thông tin cá nhân",
    en: "Personal information",
    ja: "個人情報",
    ko: "개인정보",
    zh: "个人信息",
  },
  {
    vi: "Cập nhật họ tên, email và số điện thoại dùng cho lịch đặt.",
    en: "Update the name, email, and phone number used for reservations.",
    ja: "予約に使用する氏名、メール、電話番号を更新します。",
    ko: "예약에 사용할 이름, 이메일, 전화번호를 업데이트합니다.",
    zh: "更新用于预约的姓名、邮箱和电话号码。",
  },
  {
    vi: "Vui lòng nhập số điện thoại",
    en: "Please enter your phone number",
    ja: "電話番号を入力してください",
    ko: "전화번호를 입력해 주세요",
    zh: "请输入电话号码",
  },
  {
    vi: "Số điện thoại chưa đúng định dạng.",
    en: "Phone number format is invalid.",
    ja: "電話番号の形式が正しくありません。",
    ko: "전화번호 형식이 올바르지 않습니다.",
    zh: "电话号码格式不正确。",
  },
  {
    vi: "Email và số điện thoại được dùng để nhận xác nhận lịch đặt, mã QR và thông báo hỗ trợ.",
    en: "Email and phone are used for reservation confirmations, QR codes, and support notices.",
    ja: "メールと電話番号は予約確認、QRコード、サポート通知に使用されます。",
    ko: "이메일과 전화번호는 예약 확인, QR 코드, 지원 알림에 사용됩니다.",
    zh: "邮箱和电话用于接收预约确认、二维码和支持通知。",
  },
  {
    vi: "Lưu thay đổi",
    en: "Save changes",
    ja: "変更を保存",
    ko: "변경 저장",
    zh: "保存更改",
  },
  {
    vi: "Đang lưu...",
    en: "Saving...",
    ja: "保存中...",
    ko: "저장 중...",
    zh: "正在保存...",
  },
  {
    vi: "Hủy chỉnh sửa",
    en: "Cancel edits",
    ja: "編集をキャンセル",
    ko: "수정 취소",
    zh: "取消编辑",
  },
  {
    vi: "Đã lưu thông tin cá nhân.",
    en: "Personal information saved.",
    ja: "個人情報を保存しました。",
    ko: "개인정보가 저장되었습니다.",
    zh: "个人信息已保存。",
  },
  {
    vi: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
    en: "Your session has expired. Please log in again.",
    ja: "セッションの有効期限が切れました。もう一度ログインしてください。",
    ko: "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
    zh: "登录会话已过期，请重新登录。",
  },
  {
    vi: "Không lưu được thông tin. Vui lòng thử lại.",
    en: "Could not save information. Please try again.",
    ja: "情報を保存できませんでした。もう一度お試しください。",
    ko: "정보를 저장하지 못했습니다. 다시 시도해 주세요.",
    zh: "无法保存信息，请重试。",
  },
  {
    vi: "Chưa cập nhật",
    en: "Not updated",
    ja: "未更新",
    ko: "업데이트되지 않음",
    zh: "未更新",
  },
  {
    vi: "Đặt chỗ của tôi",
    en: "My reservations",
    ja: "予約一覧",
    ko: "내 예약",
    zh: "我的预约",
  },
  {
    vi: "Lịch sử & trạng thái đặt bàn",
    en: "History & table status",
    ja: "予約履歴と状況",
    ko: "예약 내역 및 상태",
    zh: "预约历史和状态",
  },
  {
    vi: "Tất cả",
    en: "All",
    ja: "すべて",
    ko: "전체",
    zh: "全部",
  },
  {
    vi: "Mới",
    en: "New",
    ja: "新規",
    ko: "신규",
    zh: "新建",
  },
  {
    vi: "Đã xác nhận",
    en: "Confirmed",
    ja: "確認済み",
    ko: "확정됨",
    zh: "已确认",
  },
  {
    vi: "Đã check-in",
    en: "Checked in",
    ja: "チェックイン済み",
    ko: "체크인 완료",
    zh: "已签到",
  },
  {
    vi: "Hoàn tất",
    en: "Completed",
    ja: "完了",
    ko: "완료",
    zh: "已完成",
  },
  {
    vi: "Đã hủy",
    en: "Cancelled",
    ja: "キャンセル済み",
    ko: "취소됨",
    zh: "已取消",
  },
  {
    vi: "Không đến",
    en: "No-show",
    ja: "無断キャンセル",
    ko: "노쇼",
    zh: "未到店",
  },
  {
    vi: "Chat Admin",
    en: "Chat with admin",
    ja: "管理者にチャット",
    ko: "관리자 채팅",
    zh: "联系管理员",
  },
  {
    vi: "Đổi lịch",
    en: "Reschedule",
    ja: "日程変更",
    ko: "일정 변경",
    zh: "改期",
  },
  {
    vi: "Hủy đặt chỗ",
    en: "Cancel reservation",
    ja: "予約をキャンセル",
    ko: "예약 취소",
    zh: "取消预约",
  },
  {
    vi: "Chi tiết",
    en: "Details",
    ja: "詳細",
    ko: "상세",
    zh: "详情",
  },
  {
    vi: "Đặt lại",
    en: "Book again",
    ja: "再予約",
    ko: "다시 예약",
    zh: "再次预订",
  },
  {
    vi: "Đánh giá",
    en: "Review",
    ja: "レビュー",
    ko: "리뷰",
    zh: "评价",
  },
  {
    vi: "Đề xuất tối nay",
    en: "Recommended tonight",
    ja: "今夜のおすすめ",
    ko: "오늘 밤 추천",
    zh: "今晚推荐",
  },
  {
    vi: "ĐANG DIỄN RA",
    en: "LIVE NOW",
    ja: "開催中",
    ko: "진행 중",
    zh: "正在进行",
  },
  {
    vi: "SỰ KIỆN ĐÊM NAY · TÂY HỒ",
    en: "TONIGHT'S EVENT · TAY HO",
    ja: "今夜のイベント · タイホー",
    ko: "오늘 밤 이벤트 · 떠이호",
    zh: "今晚活动 · 西湖",
  },
  {
    vi: "Đêm Nhạc DJ SODA tại Club Lumière",
    en: "DJ SODA Night at Club Lumière",
    ja: "Club LumièreのDJ SODAナイト",
    ko: "Club Lumière의 DJ SODA 나이트",
    zh: "Club Lumière 的 DJ SODA 音乐夜",
  },
  {
    vi: "Xem tất cả",
    en: "View all",
    ja: "すべて見る",
    ko: "전체 보기",
    zh: "查看全部",
  },
  {
    vi: "Coupon Hot",
    en: "Hot coupons",
    ja: "注目クーポン",
    ko: "인기 쿠폰",
    zh: "热门优惠券",
  },
  {
    vi: "Đặt ngay",
    en: "Book now",
    ja: "今すぐ予約",
    ko: "지금 예약",
    zh: "立即预订",
  },
  {
    vi: "Sự kiện đêm nay",
    en: "Tonight's events",
    ja: "今夜のイベント",
    ko: "오늘 밤 이벤트",
    zh: "今晚活动",
  },
  {
    vi: "Ưu đãi đêm nay",
    en: "Tonight's deals",
    ja: "今夜の特典",
    ko: "오늘 밤 혜택",
    zh: "今晚优惠",
  },
  {
    vi: "Quán",
    en: "Venues",
    ja: "店舗",
    ko: "매장",
    zh: "店铺",
  },
  {
    vi: "Chọn khu vực dịch vụ",
    en: "Choose service area",
    ja: "サービスエリアを選択",
    ko: "서비스 지역 선택",
    zh: "选择服务区域",
  },
  {
    vi: "Xem ưu đãi",
    en: "View offer",
    ja: "特典を見る",
    ko: "혜택 보기",
    zh: "查看优惠",
  },
  {
    vi: "Sự kiện",
    en: "Events",
    ja: "イベント",
    ko: "이벤트",
    zh: "活动",
  },
  {
    vi: "Nhà hàng",
    en: "Restaurant",
    ja: "レストラン",
    ko: "레스토랑",
    zh: "餐厅",
  },
  {
    vi: "Đặt bàn VIP từ 2.500.000đ",
    en: "VIP tables from 2,500,000 VND",
    ja: "VIP席は2,500,000ドンから",
    ko: "VIP 테이블 2,500,000동부터",
    zh: "VIP 桌位 2,500,000 越南盾起",
  },
  {
    vi: "Gợi ý địa điểm, giữ bàn VIP, lưu coupon và theo dõi lịch đặt chỗ trong cùng một trải nghiệm.",
    en: "Discover venues, reserve VIP tables, save coupons, and track bookings in one experience.",
    ja: "店舗探し、VIP席予約、クーポン保存、予約確認を1つの体験で行えます。",
    ko: "장소 추천, VIP 테이블 예약, 쿠폰 저장, 예약 확인을 한 번에 이용하세요.",
    zh: "在一个体验中发现店铺、预订 VIP 桌、保存优惠券并跟踪预约。",
  },
  {
    vi: "Tìm quán hoặc cast gần bạn...",
    en: "Search nearby venues or Cast...",
    ja: "近くの店舗やキャストを検索...",
    ko: "가까운 매장 또는 캐스트 검색...",
    zh: "搜索附近店铺或 Cast...",
  },
  {
    vi: "Vui lòng nhập ghi chú nếu có",
    en: "Please enter notes if any",
    ja: "必要に応じてメモを入力してください",
    ko: "메모가 있으면 입력해 주세요",
    zh: "如有备注请输入",
  },
  {
    vi: "Số người",
    en: "Guests",
    ja: "人数",
    ko: "인원",
    zh: "人数",
  },
  {
    vi: "Ngày",
    en: "Date",
    ja: "日付",
    ko: "날짜",
    zh: "日期",
  },
  {
    vi: "Khung giờ",
    en: "Time slot",
    ja: "時間帯",
    ko: "시간대",
    zh: "时间段",
  },
  {
    vi: "Cast đã chọn",
    en: "Selected Cast",
    ja: "選択したキャスト",
    ko: "선택한 캐스트",
    zh: "已选 Cast",
  },
  {
    vi: "Không chọn cast",
    en: "No Cast selected",
    ja: "キャスト未選択",
    ko: "선택한 캐스트 없음",
    zh: "未选择 Cast",
  },
  {
    vi: "Ghi chú (tùy chọn)",
    en: "Notes (optional)",
    ja: "メモ（任意）",
    ko: "메모(선택)",
    zh: "备注（可选）",
  },
  {
    vi: "Gửi yêu cầu đặt bàn",
    en: "Send reservation request",
    ja: "予約リクエストを送信",
    ko: "예약 요청 보내기",
    zh: "发送预约请求",
  },
  {
    vi: "Miễn phí · mã QR gửi qua email sau khi đặt",
    en: "Free · QR code sent by email after booking",
    ja: "無料・予約後にQRコードをメール送信",
    ko: "무료 · 예약 후 QR 코드가 이메일로 전송됩니다",
    zh: "免费 · 预约后通过邮件发送二维码",
  },
  {
    vi: "Chưa lưu mục nào",
    en: "Nothing saved yet",
    ja: "まだ保存されていません",
    ko: "저장된 항목이 없습니다",
    zh: "尚未保存任何内容",
  },
  {
    vi: "Khám phá quán",
    en: "Explore venues",
    ja: "店舗を探す",
    ko: "매장 둘러보기",
    zh: "探索店铺",
  },
  {
    vi: "Tìm bài viết...",
    en: "Search posts...",
    ja: "記事を検索...",
    ko: "게시글 검색...",
    zh: "搜索文章...",
  },
  {
    vi: "Tìm cast theo tên, quán hoặc ngôn ngữ...",
    en: "Search Cast by name, venue, or language...",
    ja: "名前、店舗、言語でキャストを検索...",
    ko: "이름, 매장, 언어로 캐스트 검색...",
    zh: "按姓名、店铺或语言搜索 Cast...",
  },
  {
    vi: "Tìm quán, khu vực hoặc loại hình...",
    en: "Search venues, areas, or categories...",
    ja: "店舗、エリア、ジャンルを検索...",
    ko: "매장, 지역, 유형 검색...",
    zh: "搜索店铺、区域或类型...",
  },
  {
    vi: "Không có dữ liệu phù hợp.",
    en: "No matching data.",
    ja: "一致するデータがありません。",
    ko: "일치하는 데이터가 없습니다.",
    zh: "没有匹配的数据。",
  },
  {
    vi: "Hoàn tất · gắn điểm/hoá đơn khi đối soát",
    en: "Completed · points/bills are linked after review",
    ja: "完了・確認後にポイント/請求書を紐付け",
    ko: "완료 · 검토 후 포인트/영수증 연결",
    zh: "已完成 · 审核后关联积分/账单",
  },
  {
    vi: "Đã hủy trước giờ hẹn · không thu cọc",
    en: "Cancelled before appointment · no deposit charged",
    ja: "予約時間前にキャンセル・デポジットなし",
    ko: "예약 시간 전 취소 · 보증금 없음",
    zh: "预约前已取消 · 不收取订金",
  },
  {
    vi: "Đã hủy booking. Admin đã nhận thông báo.",
    en: "Booking cancelled. Admin has been notified.",
    ja: "予約をキャンセルしました。管理者に通知しました。",
    ko: "예약이 취소되었습니다. 관리자가 알림을 받았습니다.",
    zh: "预约已取消，管理员已收到通知。",
  },
  {
    vi: "Đổi lịch booking",
    en: "Reschedule booking",
    ja: "予約日時を変更",
    ko: "예약 일정 변경",
    zh: "更改预约时间",
  },
  {
    vi: "Quảng cáo",
    en: "Ad",
    ja: "広告",
    ko: "광고",
    zh: "广告",
  },
  {
    vi: "Banner nổi bật",
    en: "Featured banner",
    ja: "注目バナー",
    ko: "추천 배너",
    zh: "精选横幅",
  },
  {
    vi: "Chọn banner",
    en: "Choose banner",
    ja: "バナーを選択",
    ko: "배너 선택",
    zh: "选择横幅",
  },
  {
    vi: "Chọn banner nổi bật",
    en: "Choose featured banner",
    ja: "注目バナーを選択",
    ko: "추천 배너 선택",
    zh: "选择精选横幅",
  },
  {
    vi: "Sakura Lounge - Giảm 25% nhóm 4+",
    en: "Sakura Lounge - 25% off for groups of 4+",
    ja: "Sakura Lounge - 4名以上で25%オフ",
    ko: "Sakura Lounge - 4명 이상 25% 할인",
    zh: "Sakura Lounge - 4人以上享25%折扣",
  },
  {
    vi: "Không gian Nhật Bản · Ưu đãi nhóm cuối tuần",
    en: "Japanese-style space · Weekend group deal",
    ja: "日本風の空間 · 週末グループ特典",
    ko: "일본식 공간 · 주말 단체 혜택",
    zh: "日式空间 · 周末团体优惠",
  },
  {
    vi: "Karaoke Hoàng Gia - Tặng Đĩa Trái Cây",
    en: "Karaoke Hoang Gia - Free fruit platter",
    ja: "Karaoke Hoàng Gia - フルーツ盛り合わせプレゼント",
    ko: "Karaoke Hoàng Gia - 과일 플래터 증정",
    zh: "Karaoke Hoàng Gia - 赠送水果拼盘",
  },
  {
    vi: "Karaoke Hoàng Gia Tặng Đĩa Trái Cây",
    en: "Karaoke Hoang Gia - Free fruit platter",
    ja: "Karaoke Hoàng Gia - フルーツ盛り合わせプレゼント",
    ko: "Karaoke Hoàng Gia - 과일 플래터 증정",
    zh: "Karaoke Hoàng Gia - 赠送水果拼盘",
  },
  {
    vi: "Áp dụng khi đặt phòng trước 18:00",
    en: "Applies to room bookings before 18:00",
    ja: "18:00前のルーム予約に適用",
    ko: "18:00 전 룸 예약 시 적용",
    zh: "适用于18:00前预订包房",
  },
  {
    vi: "Xem ưu đãi",
    en: "View offer",
    ja: "特典を見る",
    ko: "혜택 보기",
    zh: "查看优惠",
  },
  {
    vi: "Chi tiết",
    en: "Details",
    ja: "詳細",
    ko: "상세",
    zh: "详情",
  },
  {
    vi: "Xem ngay",
    en: "View now",
    ja: "今すぐ見る",
    ko: "지금 보기",
    zh: "立即查看",
  },
  {
    vi: "Lướt để xem thêm ưu đãi và sự kiện nổi bật.",
    en: "Swipe to see more deals and featured events.",
    ja: "スワイプして特典や注目イベントをさらに表示。",
    ko: "스와이프해서 더 많은 혜택과 추천 이벤트를 확인하세요.",
    zh: "滑动查看更多优惠和精选活动。",
  },
  {
    vi: "Happy Hour cuối tuần",
    en: "Weekend Happy Hour",
    ja: "週末ハッピーアワー",
    ko: "주말 해피아워",
    zh: "周末欢乐时光",
  },
  {
    vi: "Combo phòng VIP 2+1",
    en: "VIP room combo 2+1",
    ja: "VIPルーム 2+1 コンボ",
    ko: "VIP 룸 2+1 콤보",
    zh: "VIP 包房 2+1 套餐",
  },
  {
    vi: "Spa thư giãn nửa giá",
    en: "Relaxing spa at half price",
    ja: "リラックススパ半額",
    ko: "릴랙스 스파 반값",
    zh: "放松 Spa 半价",
  },
  {
    vi: "Đã lưu ví ✓",
    en: "Saved to wallet ✓",
    ja: "ウォレットに保存済み ✓",
    ko: "지갑에 저장됨 ✓",
    zh: "已保存到券包 ✓",
  },
  {
    vi: "Còn 3 ngày",
    en: "3 days left",
    ja: "残り3日",
    ko: "3일 남음",
    zh: "还剩3天",
  },
  {
    vi: "Còn 8 ngày",
    en: "8 days left",
    ja: "残り8日",
    ko: "8일 남음",
    zh: "还剩8天",
  },
  {
    vi: "Sắp hết",
    en: "Ending soon",
    ja: "まもなく終了",
    ko: "곧 종료",
    zh: "即将结束",
  },
  {
    vi: "Tour / Blog / Guide",
    en: "Tour / Blog / Guide",
    ja: "ツアー / ブログ / ガイド",
    ko: "투어 / 블로그 / 가이드",
    zh: "夜游 / 博客 / 指南",
  },
  {
    vi: "Tour đêm",
    en: "Night tour",
    ja: "ナイトツアー",
    ko: "나이트 투어",
    zh: "夜游",
  },
  {
    vi: "Gợi ý lịch trình bar, lounge và ăn khuya theo khu vực.",
    en: "Suggested routes for bars, lounges, and late-night food by area.",
    ja: "エリア別にバー、ラウンジ、深夜グルメのルートを提案します。",
    ko: "지역별 바, 라운지, 야식 코스를 추천합니다.",
    zh: "按区域推荐酒吧、酒廊和宵夜路线。",
  },
  {
    vi: "Bài viết kinh nghiệm chọn quán, ưu đãi và xu hướng nightlife.",
    en: "Tips for choosing venues, deals, and nightlife trends.",
    ja: "店舗選び、特典、ナイトライフのトレンド記事。",
    ko: "매장 선택 팁, 혜택, 나이트라이프 트렌드 글.",
    zh: "关于选店、优惠和夜生活趋势的文章。",
  },
  {
    vi: "Guide",
    en: "Guide",
    ja: "ガイド",
    ko: "가이드",
    zh: "指南",
  },
  {
    vi: "Hướng dẫn đặt chỗ, lấy mã coupon và gửi hóa đơn.",
    en: "Guides for booking, claiming coupons, and submitting bills.",
    ja: "予約、クーポン取得、請求書送信のガイド。",
    ko: "예약, 쿠폰 받기, 영수증 제출 안내.",
    zh: "预约、领取优惠券和提交账单指南。",
  },
  {
    vi: "Chọn khu vực",
    en: "Choose area",
    ja: "エリアを選択",
    ko: "지역 선택",
    zh: "选择区域",
  },
  {
    vi: "Chọn loại hình",
    en: "Choose category",
    ja: "ジャンルを選択",
    ko: "유형 선택",
    zh: "选择类型",
  },
  {
    vi: "Chọn thời gian xếp hạng",
    en: "Choose ranking period",
    ja: "ランキング期間を選択",
    ko: "랭킹 기간 선택",
    zh: "选择排行周期",
  },
  {
    vi: "Chuyển bảng xếp hạng",
    en: "Switch ranking table",
    ja: "ランキングを切り替え",
    ko: "랭킹 전환",
    zh: "切换排行榜",
  },
  {
    vi: "Tuần",
    en: "Week",
    ja: "週",
    ko: "주",
    zh: "周",
  },
  {
    vi: "Tháng",
    en: "Month",
    ja: "月",
    ko: "월",
    zh: "月",
  },
  {
    vi: "Tuần này",
    en: "This week",
    ja: "今週",
    ko: "이번 주",
    zh: "本周",
  },
  {
    vi: "Tháng 6 năm 2026",
    en: "June 2026",
    ja: "2026年6月",
    ko: "2026년 6월",
    zh: "2026年6月",
  },
  {
    vi: "Tất cả loại hình",
    en: "All categories",
    ja: "すべてのジャンル",
    ko: "전체 유형",
    zh: "全部类型",
  },
  {
    vi: "Chưa phân loại",
    en: "Uncategorized",
    ja: "未分類",
    ko: "미분류",
    zh: "未分类",
  },
  {
    vi: "Tài trợ",
    en: "Sponsored",
    ja: "スポンサー",
    ko: "스폰서",
    zh: "赞助",
  },
  {
    vi: "Xem chi tiết",
    en: "View details",
    ja: "詳細を見る",
    ko: "상세 보기",
    zh: "查看详情",
  },
  {
    vi: "Xem profile",
    en: "View profile",
    ja: "プロフィールを見る",
    ko: "프로필 보기",
    zh: "查看资料",
  },
  {
    vi: "Gọi ngay",
    en: "Call now",
    ja: "今すぐ電話",
    ko: "지금 전화",
    zh: "立即拨打",
  },
  {
    vi: "Đặt theo cast",
    en: "Book with Cast",
    ja: "キャストを指定して予約",
    ko: "캐스트로 예약",
    zh: "按 Cast 预约",
  },
  {
    vi: "API ranking đang lỗi",
    en: "Ranking API is unavailable",
    ja: "ランキングAPIでエラーが発生しています",
    ko: "랭킹 API에 오류가 있습니다",
    zh: "排行榜 API 暂不可用",
  },
  {
    vi: "Không tải được bảng xếp hạng.",
    en: "Could not load the ranking table.",
    ja: "ランキングを読み込めませんでした。",
    ko: "랭킹을 불러오지 못했습니다.",
    zh: "无法加载排行榜。",
  },
  {
    vi: "Tải lại",
    en: "Reload",
    ja: "再読み込み",
    ko: "다시 불러오기",
    zh: "重新加载",
  },
  {
    vi: "Chưa có ranking phù hợp",
    en: "No matching rankings yet",
    ja: "該当するランキングはまだありません",
    ko: "일치하는 랭킹이 없습니다",
    zh: "暂无匹配排行",
  },
  {
    vi: "Thử đổi khu vực hoặc loại hình để xem bảng khác.",
    en: "Try another area or category to see a different table.",
    ja: "別のエリアやジャンルに変更してみてください。",
    ko: "다른 지역이나 유형으로 바꿔 보세요.",
    zh: "尝试更换区域或类型查看其他排行。",
  },
  {
    vi: "Xem tổng hợp",
    en: "View all areas",
    ja: "総合を見る",
    ko: "전체 보기",
    zh: "查看综合",
  },
  {
    vi: "Quay lại",
    en: "Back",
    ja: "戻る",
    ko: "뒤로",
    zh: "返回",
  },
  {
    vi: "Trạng thái lịch đặt đã cập nhật",
    en: "Reservation status updated",
    ja: "予約状況が更新されました",
    ko: "예약 상태가 업데이트되었습니다",
    zh: "预约状态已更新",
  },
  {
    vi: "Admin đang điều phối",
    en: "Admin is coordinating",
    ja: "管理者が調整中",
    ko: "관리자가 조율 중",
    zh: "管理员正在协调",
  },
  {
    vi: "QR đã cấp",
    en: "QR issued",
    ja: "QR発行済み",
    ko: "QR 발급됨",
    zh: "二维码已发放",
  },
  {
    vi: "Mới · QR đã cấp",
    en: "New · QR issued",
    ja: "新規 · QR発行済み",
    ko: "신규 · QR 발급됨",
    zh: "新建 · 二维码已发放",
  },
  {
    vi: "Đã xác nhận · QR đã cấp",
    en: "Confirmed · QR issued",
    ja: "確認済み · QR発行済み",
    ko: "확정됨 · QR 발급됨",
    zh: "已确认 · 二维码已发放",
  },
  {
    vi: "Không có dữ liệu",
    en: "No data",
    ja: "データなし",
    ko: "데이터 없음",
    zh: "无数据",
  },
  {
    vi: "Chưa tìm thấy booking",
    en: "Reservation not found",
    ja: "予約が見つかりません",
    ko: "예약을 찾을 수 없습니다",
    zh: "未找到预约",
  },
  {
    vi: "Đặt chỗ đã hủy",
    en: "Reservation cancelled",
    ja: "予約はキャンセル済みです",
    ko: "예약이 취소되었습니다",
    zh: "预约已取消",
  },
  {
    vi: "Đặt chỗ đã xác nhận",
    en: "Reservation confirmed",
    ja: "予約が確認されました",
    ko: "예약이 확정되었습니다",
    zh: "预约已确认",
  },
  {
    vi: "Đã gửi yêu cầu đặt bàn",
    en: "Reservation request sent",
    ja: "予約リクエストを送信しました",
    ko: "예약 요청을 보냈습니다",
    zh: "预约请求已发送",
  },
  {
    vi: "Mã đặt chỗ",
    en: "Reservation code",
    ja: "予約コード",
    ko: "예약 코드",
    zh: "预约码",
  },
  {
    vi: "Thời gian",
    en: "Time",
    ja: "時間",
    ko: "시간",
    zh: "时间",
  },
  {
    vi: "Người đặt",
    en: "Booked by",
    ja: "予約者",
    ko: "예약자",
    zh: "预约人",
  },
  {
    vi: "Mã ưu đãi",
    en: "Deal code",
    ja: "特典コード",
    ko: "혜택 코드",
    zh: "优惠码",
  },
  {
    vi: "QR giảm giá của bạn",
    en: "Your discount QR",
    ja: "割引QRコード",
    ko: "내 할인 QR",
    zh: "您的折扣二维码",
  },
  {
    vi: "Lưu ảnh QR",
    en: "Save QR image",
    ja: "QR画像を保存",
    ko: "QR 이미지 저장",
    zh: "保存二维码图片",
  },
  {
    vi: "Xem đặt chỗ của tôi",
    en: "View my reservations",
    ja: "予約一覧を見る",
    ko: "내 예약 보기",
    zh: "查看我的预约",
  },
  {
    vi: "Liên hệ hỗ trợ (LINE OA)",
    en: "Contact support (LINE OA)",
    ja: "サポートに連絡（LINE OA）",
    ko: "지원 문의(LINE OA)",
    zh: "联系支持（LINE OA）",
  },
  {
    vi: "Gửi hóa đơn",
    en: "Submit bill",
    ja: "請求書を送信",
    ko: "영수증 제출",
    zh: "提交账单",
  },
  {
    vi: "Gửi bill gốc để Admin đối soát điểm, ưu đãi và công nợ với quán.",
    en: "Submit the original bill so Admin can reconcile points, deals, and venue payables.",
    ja: "原本の請求書を送信し、管理者がポイント、特典、店舗精算を確認します。",
    ko: "원본 영수증을 제출하면 관리자가 포인트, 혜택, 매장 정산을 확인합니다.",
    zh: "提交原始账单，供管理员核对积分、优惠和店铺结算。",
  },
  {
    vi: "Trong 10 ngày",
    en: "Within 10 days",
    ja: "10日以内",
    ko: "10일 이내",
    zh: "10天内",
  },
  {
    vi: "Quán / cơ sở *",
    en: "Venue / business *",
    ja: "店舗 / 施設 *",
    ko: "매장 / 업소 *",
    zh: "店铺 / 场所 *",
  },
  {
    vi: "Liên kết booking",
    en: "Linked reservation",
    ja: "予約に紐付け",
    ko: "예약 연결",
    zh: "关联预约",
  },
  {
    vi: "Không liên kết booking",
    en: "No linked reservation",
    ja: "予約に紐付けない",
    ko: "예약 연결 없음",
    zh: "不关联预约",
  },
  {
    vi: "Tổng tiền bill gốc *",
    en: "Original bill total *",
    ja: "原本請求額 *",
    ko: "원본 영수증 총액 *",
    zh: "原始账单总额 *",
  },
  {
    vi: "Thời gian sử dụng *",
    en: "Usage time *",
    ja: "利用日時 *",
    ko: "이용 시간 *",
    zh: "使用时间 *",
  },
  {
    vi: "Ảnh / chứng từ",
    en: "Photo / proof",
    ja: "写真 / 証明書類",
    ko: "사진 / 증빙",
    zh: "照片 / 凭证",
  },
  {
    vi: "Chọn file",
    en: "Choose file",
    ja: "ファイルを選択",
    ko: "파일 선택",
    zh: "选择文件",
  },
  {
    vi: "Đổi file",
    en: "Change file",
    ja: "ファイルを変更",
    ko: "파일 변경",
    zh: "更换文件",
  },
  {
    vi: "Bỏ file",
    en: "Remove file",
    ja: "ファイルを削除",
    ko: "파일 제거",
    zh: "移除文件",
  },
  {
    vi: "Bỏ",
    en: "Remove",
    ja: "削除",
    ko: "제거",
    zh: "移除",
  },
  {
    vi: "Khuyến khích gửi kèm để duyệt nhanh hơn.",
    en: "Attach proof to speed up review.",
    ja: "確認を早めるため添付をおすすめします。",
    ko: "빠른 검토를 위해 첨부를 권장합니다.",
    zh: "建议附上凭证以加快审核。",
  },
  {
    vi: "AI đọc bill",
    en: "AI read bill",
    ja: "AIで請求書を読み取る",
    ko: "AI 영수증 읽기",
    zh: "AI 读取账单",
  },
  {
    vi: "Đang đọc...",
    en: "Reading...",
    ja: "読み取り中...",
    ko: "읽는 중...",
    zh: "读取中...",
  },
  {
    vi: "Tổng tiền",
    en: "Total",
    ja: "合計金額",
    ko: "총액",
    zh: "总金额",
  },
  {
    vi: "cần nhập tay",
    en: "manual input needed",
    ja: "手入力が必要",
    ko: "직접 입력 필요",
    zh: "需要手动输入",
  },
  {
    vi: "Chỉ nhập tổng tiền bill gốc, không nhập chi tiết món/dịch vụ. Bill quá 10 ngày sẽ không được nhận.",
    en: "Enter only the original bill total, not item details. Bills older than 10 days are not accepted.",
    ja: "明細ではなく原本の合計金額のみ入力してください。10日を超えた請求書は受付できません。",
    ko: "항목별 내역이 아닌 원본 영수증 총액만 입력하세요. 10일이 지난 영수증은 접수되지 않습니다.",
    zh: "只填写原始账单总额，不填写菜品/服务明细。超过10天的账单不予接收。",
  },
  {
    vi: "Đang gửi bill...",
    en: "Submitting bill...",
    ja: "請求書を送信中...",
    ko: "영수증 제출 중...",
    zh: "正在提交账单...",
  },
  {
    vi: "Gửi bill",
    en: "Submit bill",
    ja: "請求書を送信",
    ko: "영수증 제출",
    zh: "提交账单",
  },
  {
    vi: "Chọn quán",
    en: "Choose venue",
    ja: "店舗を選択",
    ko: "매장 선택",
    zh: "选择店铺",
  },
  {
    vi: "Chưa nhập",
    en: "Not entered",
    ja: "未入力",
    ko: "미입력",
    zh: "未填写",
  },
  {
    vi: "Trạng thái deadline",
    en: "Deadline status",
    ja: "期限ステータス",
    ko: "마감 상태",
    zh: "截止状态",
  },
  {
    vi: "Sai thời gian",
    en: "Invalid time",
    ja: "日時が不正です",
    ko: "시간 오류",
    zh: "时间无效",
  },
  {
    vi: "Quá hạn",
    en: "Expired",
    ja: "期限切れ",
    ko: "기한 초과",
    zh: "已过期",
  },
  {
    vi: "Hợp lệ",
    en: "Valid",
    ja: "有効",
    ko: "유효",
    zh: "有效",
  },
  {
    vi: "Lịch sử bill",
    en: "Bill history",
    ja: "請求書履歴",
    ko: "영수증 내역",
    zh: "账单历史",
  },
  {
    vi: "Chưa có bill trong phạm vi này.",
    en: "No bills in this range yet.",
    ja: "この範囲の請求書はまだありません。",
    ko: "이 범위에는 영수증이 없습니다.",
    zh: "此范围内暂无账单。",
  },
  {
    vi: "Đăng xuất",
    en: "Log out",
    ja: "ログアウト",
    ko: "로그아웃",
    zh: "退出登录",
  },
  {
    vi: "Đang cập nhật điểm thưởng...",
    en: "Updating reward points...",
    ja: "ポイントを更新中...",
    ko: "리워드 포인트 업데이트 중...",
    zh: "正在更新奖励积分...",
  },
  {
    vi: "Chưa tải được điểm thật, vui lòng thử lại.",
    en: "Could not load real points. Please try again.",
    ja: "実際のポイントを読み込めませんでした。もう一度お試しください。",
    ko: "실제 포인트를 불러오지 못했습니다. 다시 시도해 주세요.",
    zh: "无法加载真实积分，请重试。",
  },
  {
    vi: "Chưa đăng nhập",
    en: "Not logged in",
    ja: "未ログイン",
    ko: "로그인되지 않음",
    zh: "未登录",
  },
  {
    vi: "Những mục bạn bấm tim sẽ nằm ở đây để mở lại nhanh.",
    en: "Items you heart will appear here for quick access.",
    ja: "ハートを押した項目はここに保存され、すぐ開けます。",
    ko: "하트를 누른 항목이 빠르게 다시 열 수 있도록 여기에 표시됩니다.",
    zh: "您点心收藏的内容会显示在这里，方便快速打开。",
  },
  {
    vi: "Bạn chưa lưu mục nào",
    en: "You have not saved anything yet",
    ja: "まだ保存した項目はありません",
    ko: "저장한 항목이 없습니다",
    zh: "您还没有收藏任何内容",
  },
  {
    vi: "Nhấn biểu tượng trái tim trên quán hay cast để lưu vào yêu thích.",
    en: "Tap the heart on venues or Cast to save them.",
    ja: "店舗やキャストのハートを押してお気に入りに保存できます。",
    ko: "매장이나 캐스트의 하트를 눌러 즐겨찾기에 저장하세요.",
    zh: "点击店铺或 Cast 上的心形图标即可收藏。",
  },
  {
    vi: "Không tìm thấy kết quả",
    en: "No results found",
    ja: "結果が見つかりません",
    ko: "결과가 없습니다",
    zh: "未找到结果",
  },
  {
    vi: "Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem nhiều quán hơn.",
    en: "Try another keyword or remove filters to see more venues.",
    ja: "キーワードを変えるかフィルターを減らして、より多くの店舗を表示してください。",
    ko: "다른 키워드를 쓰거나 필터를 줄여 더 많은 매장을 확인하세요.",
    zh: "尝试更换关键词或减少筛选条件以查看更多店铺。",
  },
  {
    vi: "Xóa bộ lọc",
    en: "Clear filters",
    ja: "フィルターをクリア",
    ko: "필터 지우기",
    zh: "清除筛选",
  },
  {
    vi: "Chưa có ưu đãi đã lưu",
    en: "No saved offers yet",
    ja: "保存済みの特典はまだありません",
    ko: "저장된 혜택이 없습니다",
    zh: "暂无已保存优惠",
  },
  {
    vi: "Bạn chưa lưu ưu đãi nào. Khám phá Coupon Hot rồi đặt bàn để nhận QR.",
    en: "You have not saved any offers. Explore Hot coupons and book to receive a QR.",
    ja: "保存済みの特典はまだありません。注目クーポンを見て予約するとQRを受け取れます。",
    ko: "저장된 혜택이 없습니다. 인기 쿠폰을 보고 예약하면 QR을 받을 수 있습니다.",
    zh: "您还没有保存任何优惠。浏览热门优惠并预约即可获得二维码。",
  },
  {
    vi: "Xem ưu đãi",
    en: "View deals",
    ja: "特典を見る",
    ko: "혜택 보기",
    zh: "查看优惠",
  },
  {
    vi: "Chưa có đặt chỗ nào",
    en: "No reservations yet",
    ja: "予約はまだありません",
    ko: "예약이 없습니다",
    zh: "暂无预约",
  },
  {
    vi: "Khi bạn đặt bàn hoặc đặt cast, lịch sử sẽ hiển thị tại đây.",
    en: "Your table or Cast bookings will appear here.",
    ja: "席やキャストを予約すると履歴がここに表示されます。",
    ko: "테이블이나 캐스트를 예약하면 내역이 여기에 표시됩니다.",
    zh: "您预约桌位或 Cast 后，记录会显示在这里。",
  },
  {
    vi: "Chưa có đặt chỗ ở trạng thái này",
    en: "No reservations with this status",
    ja: "このステータスの予約はありません",
    ko: "이 상태의 예약이 없습니다",
    zh: "此状态下暂无预约",
  },
  {
    vi: "Hủy booking",
    en: "Cancel reservation",
    ja: "予約をキャンセル",
    ko: "예약 취소",
    zh: "取消预约",
  },
  {
    vi: "Lý do hủy",
    en: "Cancellation reason",
    ja: "キャンセル理由",
    ko: "취소 사유",
    zh: "取消原因",
  },
  {
    vi: "Ví dụ: đổi lịch, nhầm thời gian, không thể đến...",
    en: "Example: schedule change, wrong time, cannot come...",
    ja: "例: 日程変更、時間違い、来店不可...",
    ko: "예: 일정 변경, 시간 착오, 방문 불가...",
    zh: "例如：改期、时间填错、无法到店...",
  },
  {
    vi: "Xác nhận hủy",
    en: "Confirm cancellation",
    ja: "キャンセルを確認",
    ko: "취소 확인",
    zh: "确认取消",
  },
  {
    vi: "Đang hủy",
    en: "Cancelling",
    ja: "キャンセル中",
    ko: "취소 중",
    zh: "正在取消",
  },
  {
    vi: "Bạn có thể đổi lịch trước giờ hẹn tối thiểu 1 tiếng. Lịch mới sẽ được cập nhật ngay sau khi gửi.",
    en: "You can reschedule at least 1 hour before the booking time. The new schedule updates immediately after submission.",
    ja: "予約時間の1時間前まで変更できます。送信後すぐに新しい日時へ更新されます。",
    ko: "예약 시간 최소 1시간 전까지 일정을 변경할 수 있습니다. 제출 후 새 일정이 바로 반영됩니다.",
    zh: "可在预约时间至少1小时前改期。提交后新时间会立即更新。",
  },
  {
    vi: "Ngày giờ mới",
    en: "New date and time",
    ja: "新しい日時",
    ko: "새 날짜와 시간",
    zh: "新的日期和时间",
  },
  {
    vi: "Lý do đổi lịch",
    en: "Reschedule reason",
    ja: "日程変更理由",
    ko: "일정 변경 사유",
    zh: "改期原因",
  },
  {
    vi: "Ví dụ: đổi ngày đi, muốn khung giờ muộn hơn...",
    en: "Example: change date, prefer a later time...",
    ja: "例: 日付変更、遅い時間を希望...",
    ko: "예: 날짜 변경, 더 늦은 시간 희망...",
    zh: "例如：改日期、希望更晚时段...",
  },
  {
    vi: "Cập nhật lịch",
    en: "Update schedule",
    ja: "日程を更新",
    ko: "일정 업데이트",
    zh: "更新时间",
  },
  {
    vi: "Đang gửi",
    en: "Sending",
    ja: "送信中",
    ko: "전송 중",
    zh: "正在发送",
  },
  {
    vi: "Chat với Admin",
    en: "Chat with admin",
    ja: "管理者とチャット",
    ko: "관리자와 채팅",
    zh: "与管理员聊天",
  },
  {
    vi: "Đang tải tin nhắn...",
    en: "Loading messages...",
    ja: "メッセージを読み込み中...",
    ko: "메시지 불러오는 중...",
    zh: "正在加载消息...",
  },
  {
    vi: "Chưa có tin nhắn nào.",
    en: "No messages yet.",
    ja: "メッセージはまだありません。",
    ko: "아직 메시지가 없습니다.",
    zh: "暂无消息。",
  },
  {
    vi: "Tin nhắn",
    en: "Message",
    ja: "メッセージ",
    ko: "메시지",
    zh: "消息",
  },
  {
    vi: "Nhập nội dung cần đổi/hủy booking...",
    en: "Enter what you need to change or cancel...",
    ja: "変更またはキャンセルしたい内容を入力...",
    ko: "변경/취소할 내용을 입력하세요...",
    zh: "输入需要更改/取消的内容...",
  },
  {
    vi: "Đóng",
    en: "Close",
    ja: "閉じる",
    ko: "닫기",
    zh: "关闭",
  },
  {
    vi: "Gửi tin",
    en: "Send message",
    ja: "メッセージを送信",
    ko: "메시지 보내기",
    zh: "发送消息",
  },
  {
    vi: "Quá giờ",
    en: "Too late",
    ja: "期限超過",
    ko: "시간 초과",
    zh: "已超过时间",
  },
  {
    vi: "Ảnh quán",
    en: "Venue photo",
    ja: "店舗写真",
    ko: "매장 사진",
    zh: "店铺照片",
  },
  {
    vi: "Ảnh ưu đãi",
    en: "Deal image",
    ja: "特典画像",
    ko: "혜택 이미지",
    zh: "优惠图片",
  },
  {
    vi: "Ảnh cast",
    en: "Cast photo",
    ja: "キャスト写真",
    ko: "캐스트 사진",
    zh: "Cast 照片",
  },
  {
    vi: "Địa điểm",
    en: "Venue",
    ja: "店舗",
    ko: "매장",
    zh: "店铺",
  },
  {
    vi: "Bar Lounge",
    en: "Bar lounge",
    ja: "バーラウンジ",
    ko: "바 라운지",
    zh: "酒吧酒廊",
  },
  {
    vi: "Karaoke VIP",
    en: "VIP karaoke",
    ja: "VIPカラオケ",
    ko: "VIP 노래방",
    zh: "VIP 卡拉 OK",
  },
  {
    vi: "Lounge cao cấp",
    en: "Premium lounge",
    ja: "プレミアムラウンジ",
    ko: "프리미엄 라운지",
    zh: "高级酒廊",
  },
  {
    vi: "Đặt bàn",
    en: "Book a table",
    ja: "席を予約",
    ko: "테이블 예약",
    zh: "预订桌位",
  },
  {
    vi: "Gửi yêu cầu · Admin xác nhận",
    en: "Send request · Admin confirms",
    ja: "リクエスト送信 · 管理者が確認",
    ko: "요청 보내기 · 관리자 확인",
    zh: "发送请求 · 管理员确认",
  },
  {
    vi: "Đăng nhập nhận giảm 8-10%",
    en: "Log in for 8-10% off",
    ja: "ログインで8〜10%割引",
    ko: "로그인 시 8-10% 할인",
    zh: "登录享8-10%折扣",
  },
  {
    vi: "Bạn đang là Khách · ưu đãi -5%",
    en: "You are a guest · 5% off",
    ja: "ゲスト利用中 · 5%割引",
    ko: "게스트 이용 중 · 5% 할인",
    zh: "当前为访客 · 5%优惠",
  },
  {
    vi: "Khách",
    en: "Guest",
    ja: "ゲスト",
    ko: "게스트",
    zh: "访客",
  },
  {
    vi: "HỌ TÊN",
    en: "FULL NAME",
    ja: "氏名",
    ko: "이름",
    zh: "姓名",
  },
  {
    vi: "EMAIL",
    en: "EMAIL",
    ja: "メールアドレス",
    ko: "이메일",
    zh: "电子邮箱",
  },
  {
    vi: "SỐ NGƯỜI",
    en: "GUESTS",
    ja: "人数",
    ko: "인원",
    zh: "人数",
  },
  {
    vi: "NGÀY",
    en: "DATE",
    ja: "日付",
    ko: "날짜",
    zh: "日期",
  },
  {
    vi: "KHUNG GIỜ",
    en: "TIME SLOT",
    ja: "時間帯",
    ko: "시간대",
    zh: "时间段",
  },
  {
    vi: "CAST ĐÃ CHỌN",
    en: "SELECTED CAST",
    ja: "選択したキャスト",
    ko: "선택한 캐스트",
    zh: "已选 CAST",
  },
  {
    vi: "GHI CHÚ (tùy chọn)",
    en: "NOTES (optional)",
    ja: "メモ（任意）",
    ko: "메모(선택)",
    zh: "备注（可选）",
  },
  {
    vi: "Không thanh toán online, không thu cọc. Yêu cầu được gửi tới điều phối - Admin liên hệ xác nhận chỗ.",
    en: "No online payment or deposit. The request goes to coordination, and Admin will confirm your seat.",
    ja: "オンライン決済・デポジット不要。リクエストは調整担当へ送られ、管理者が席を確認します。",
    ko: "온라인 결제와 보증금은 없습니다. 요청은 조율팀으로 전달되며 관리자가 좌석을 확인합니다.",
    zh: "无需在线支付或订金。请求会发送给协调人员，管理员将确认座位。",
  },
  {
    vi: "Không thanh toán online, không thu cọc. Yêu cầu được gửi tới đội điều phối - Admin liên hệ xác nhận chỗ.",
    en: "No online payment or deposit. The request goes to the coordination team, and Admin will confirm your seat.",
    ja: "オンライン決済・デポジット不要。リクエストは調整チームへ送られ、管理者が席を確認します。",
    ko: "온라인 결제와 보증금은 없습니다. 요청은 조율팀으로 전달되며 관리자가 좌석을 확인합니다.",
    zh: "无需在线支付或订金。请求会发送给协调团队，管理员将确认座位。",
  },
  {
    vi: "GHI CHÚ",
    en: "NOTES",
    ja: "メモ",
    ko: "메모",
    zh: "备注",
  },
  {
    vi: "Ghi chú",
    en: "Notes",
    ja: "メモ",
    ko: "메모",
    zh: "备注",
  },
  {
    vi: "(tùy chọn)",
    en: "(optional)",
    ja: "（任意）",
    ko: "(선택)",
    zh: "（可选）",
  },
  {
    vi: "Coupon link",
    en: "Coupon link",
    ja: "クーポンリンク",
    ko: "쿠폰 링크",
    zh: "优惠券链接",
  },
  {
    vi: "Khong lien ket coupon",
    en: "No linked coupon",
    ja: "クーポン未連携",
    ko: "연결된 쿠폰 없음",
    zh: "未关联优惠券",
  },
  {
    vi: "Khong lien ket",
    en: "Not linked",
    ja: "未連携",
    ko: "연결 없음",
    zh: "未关联",
  },
  {
    vi: "Thời gian sử dụng",
    en: "Usage time",
    ja: "利用日時",
    ko: "이용 시간",
    zh: "使用时间",
  },
  {
    vi: "Khám phá quán, cast, ưu đãi và cẩm nang nightlife tại Việt Nam.",
    en: "Discover venues, Cast, deals, and nightlife guides in Vietnam.",
    ja: "ベトナムの店舗、キャスト、特典、ナイトライフガイドを探せます。",
    ko: "베트남의 매장, 캐스트, 혜택, 나이트라이프 가이드를 만나보세요.",
    zh: "探索越南的店铺、Cast、优惠和夜生活指南。",
  },
  {
    vi: "Nội dung pháp lý đang dùng placeholder cho đến khi khách hàng cung cấp bản chính thức.",
    en: "Legal content is using placeholders until the client provides the official copy.",
    ja: "正式文面が提供されるまで、法務コンテンツは仮文面です。",
    ko: "고객이 공식 문안을 제공할 때까지 법적 내용은 임시 문구입니다.",
    zh: "法律内容在客户提供正式文本前使用占位文案。",
  },
  {
    vi: "KHÁM PHÁ",
    en: "EXPLORE",
    ja: "探す",
    ko: "둘러보기",
    zh: "探索",
  },
  {
    vi: "© 2026 Vietyoru. 18+ · Giá và tình trạng đặt chỗ được admin xác nhận.",
    en: "© 2026 Vietyoru. 18+ · Prices and reservation availability are confirmed by Admin.",
    ja: "© 2026 Vietyoru. 18+ · 料金と予約可否は管理者が確認します。",
    ko: "© 2026 Vietyoru. 18+ · 가격과 예약 가능 여부는 관리자가 확인합니다.",
    zh: "© 2026 Vietyoru. 18+ · 价格和预约状态由管理员确认。",
  },
  {
    vi: "18+ · Giá và tình trạng đặt chỗ được xác nhận lại bởi admin.",
    en: "18+ · Prices and reservation availability are reconfirmed by Admin.",
    ja: "18+ · 料金と予約可否は管理者が再確認します。",
    ko: "18+ · 가격과 예약 가능 여부는 관리자가 재확인합니다.",
    zh: "18+ · 价格和预约状态由管理员再次确认。",
  },
  {
    vi: "Không sửa trực tiếp đặt chỗ cũ. Mỗi thay đổi tạo bản ghi mới - hủy trước 1 giờ rồi đặt lại hoặc liên hệ Admin qua LINE OA / Mail.",
    en: "Old reservations are not edited directly. Each change creates a new record. Cancel at least 1 hour before and rebook, or contact Admin via LINE OA / Mail.",
    ja: "既存予約は直接編集できません。変更ごとに新しい記録を作成します。1時間前までにキャンセルして再予約するか、LINE OA / メールで管理者へ連絡してください。",
    ko: "기존 예약은 직접 수정하지 않습니다. 변경마다 새 기록이 생성됩니다. 1시간 전까지 취소 후 다시 예약하거나 LINE OA / 메일로 관리자에게 문의하세요.",
    zh: "旧预约不能直接编辑。每次更改都会创建新记录。请至少提前1小时取消后重新预约，或通过 LINE OA / 邮件联系管理员。",
  },
  {
    vi: "Nhấn biểu tượng tim trên quán hoặc cast để lưu lại và xem nhanh tại đây.",
    en: "Tap the heart on a venue or Cast to save it and view it here quickly.",
    ja: "店舗やキャストのハートを押すと保存され、ここですぐ確認できます。",
    ko: "매장이나 캐스트의 하트를 눌러 저장하면 여기에서 빠르게 볼 수 있습니다.",
    zh: "点击店铺或 Cast 上的心形图标即可保存，并在这里快速查看。",
  },
  {
    vi: "Khám phá cast",
    en: "Explore Cast",
    ja: "キャストを探す",
    ko: "캐스트 둘러보기",
    zh: "探索 Cast",
  },
  {
    vi: "Hội viên NightLife",
    en: "NightLife member",
    ja: "NightLife会員",
    ko: "NightLife 회원",
    zh: "NightLife 会员",
  },
  {
    vi: "Booking được lưu vào lịch sử · ưu đãi 8-10%",
    en: "Booking is saved to history · 8-10% deal",
    ja: "予約は履歴に保存 · 8〜10%特典",
    ko: "예약이 내역에 저장됨 · 8-10% 혜택",
    zh: "预约已保存到历史 · 8-10%优惠",
  },
  {
    vi: "TOP",
    en: "Top",
    ja: "トップ",
    ko: "TOP",
    zh: "第",
  },
  {
    vi: "Xem ưu đãi",
    en: "View offer",
    ja: "特典を見る",
    ko: "혜택 보기",
    zh: "查看优惠",
  },
  {
    vi: "Dịch vụ nổi bật",
    en: "Featured services",
    ja: "注目サービス",
    ko: "추천 서비스",
    zh: "精选服务",
  },
  {
    vi: "Ảnh dịch vụ",
    en: "Service image",
    ja: "サービス画像",
    ko: "서비스 이미지",
    zh: "服务图片",
  },
  {
    vi: "Xem placeholder",
    en: "View placeholder",
    ja: "仮コンテンツを見る",
    ko: "임시 콘텐츠 보기",
    zh: "查看占位内容",
  },
  {
    vi: "Video Hot",
    en: "Hot videos",
    ja: "注目動画",
    ko: "인기 영상",
    zh: "热门视频",
  },
  {
    vi: "Ảnh video",
    en: "Video image",
    ja: "動画画像",
    ko: "영상 이미지",
    zh: "视频图片",
  },
  {
    vi: "Tìm cast",
    en: "Find Cast",
    ja: "キャストを探す",
    ko: "캐스트 찾기",
    zh: "查找 Cast",
  },
  {
    vi: "Tìm",
    en: "Search",
    ja: "検索",
    ko: "검색",
    zh: "搜索",
  },
  {
    vi: "Thành phố",
    en: "City",
    ja: "都市",
    ko: "도시",
    zh: "城市",
  },
  {
    vi: "Khu vực",
    en: "Area",
    ja: "エリア",
    ko: "지역",
    zh: "区域",
  },
  {
    vi: "Loại hình",
    en: "Category",
    ja: "ジャンル",
    ko: "유형",
    zh: "类型",
  },
  {
    vi: "Ngôn ngữ",
    en: "Language",
    ja: "言語",
    ko: "언어",
    zh: "语言",
  },
  {
    vi: "Khoảng giá",
    en: "Price range",
    ja: "価格帯",
    ko: "가격대",
    zh: "价格区间",
  },
  {
    vi: "/ 60 phút",
    en: "/ 60 min",
    ja: "/ 60分",
    ko: "/ 60분",
    zh: "/ 60分钟",
  },
  {
    vi: "Độ tuổi",
    en: "Age range",
    ja: "年齢",
    ko: "연령대",
    zh: "年龄",
  },
  {
    vi: "Có ưu đãi",
    en: "Has deals",
    ja: "特典あり",
    ko: "혜택 있음",
    zh: "有优惠",
  },
  {
    vi: "Có ưu đãi đang chạy",
    en: "Active deals available",
    ja: "実施中の特典あり",
    ko: "진행 중인 혜택 있음",
    zh: "有进行中的优惠",
  },
  {
    vi: "Còn lịch trống tuần này",
    en: "Available this week",
    ja: "今週空きあり",
    ko: "이번 주 예약 가능",
    zh: "本周仍有空档",
  },
  {
    vi: "Nói tiếng Nhật",
    en: "Speaks Japanese",
    ja: "日本語対応",
    ko: "일본어 가능",
    zh: "会说日语",
  },
  {
    vi: "Top ranking",
    en: "Top ranking",
    ja: "上位ランキング",
    ko: "상위 랭킹",
    zh: "高排名",
  },
  {
    vi: "Bộ lọc",
    en: "Filters",
    ja: "フィルター",
    ko: "필터",
    zh: "筛选",
  },
  {
    vi: "Bộ lọc nhanh",
    en: "Quick filters",
    ja: "クイックフィルター",
    ko: "빠른 필터",
    zh: "快捷筛选",
  },
  {
    vi: "Sắp xếp:",
    en: "Sort:",
    ja: "並び替え:",
    ko: "정렬:",
    zh: "排序：",
  },
  {
    vi: "Sắp xếp",
    en: "Sort",
    ja: "並び替え",
    ko: "정렬",
    zh: "排序",
  },
  {
    vi: "Mới nhất",
    en: "Newest",
    ja: "新着順",
    ko: "최신순",
    zh: "最新",
  },
  {
    vi: "Gần nhất",
    en: "Nearest",
    ja: "近い順",
    ko: "가까운 순",
    zh: "最近",
  },
  {
    vi: "Nổi tiếng Nhất",
    en: "Most popular",
    ja: "人気順",
    ko: "인기순",
    zh: "最受欢迎",
  },
  {
    vi: "Nổi tiếng nhất",
    en: "Most popular",
    ja: "人気順",
    ko: "인기순",
    zh: "最受欢迎",
  },
  {
    vi: "Tổng hợp",
    en: "All areas",
    ja: "総合",
    ko: "종합",
    zh: "综合",
  },
  {
    vi: "Lọc cast theo nhu cầu",
    en: "Filter Cast by your needs",
    ja: "希望条件でキャストを絞り込み",
    ko: "조건에 맞게 캐스트 필터링",
    zh: "按需求筛选 Cast",
  },
  {
    vi: "Lưới chân dung theo mẫu Vietyoru, ưu tiên ảnh, ngôn ngữ và quán làm việc.",
    en: "A Vietyoru-style portrait grid focused on photos, languages, and working venues.",
    ja: "写真、対応言語、勤務店舗を優先したVietyoru形式のポートレート一覧です。",
    ko: "사진, 언어, 근무 매장을 우선한 Vietyoru 스타일의 프로필 그리드입니다.",
    zh: "Vietyoru 风格头像列表，优先展示照片、语言和工作店铺。",
  },
  {
    vi: "Lọc quán theo nhu cầu",
    en: "Filter venues by your needs",
    ja: "希望条件で店舗を絞り込み",
    ko: "조건에 맞게 매장 필터링",
    zh: "按需求筛选店铺",
  },
  {
    vi: "Đặt lại bộ lọc",
    en: "Reset filters",
    ja: "フィルターをリセット",
    ko: "필터 초기화",
    zh: "重置筛选",
  },
  {
    vi: "Đóng bộ lọc",
    en: "Close filters",
    ja: "フィルターを閉じる",
    ko: "필터 닫기",
    zh: "关闭筛选",
  },
  {
    vi: "Mở bộ lọc",
    en: "Open filters",
    ja: "フィルターを開く",
    ko: "필터 열기",
    zh: "打开筛选",
  },
  {
    vi: "Xóa tìm kiếm",
    en: "Clear search",
    ja: "検索をクリア",
    ko: "검색어 지우기",
    zh: "清除搜索",
  },
  {
    vi: "Chọn sắp xếp",
    en: "Choose sort",
    ja: "並び替えを選択",
    ko: "정렬 선택",
    zh: "选择排序",
  },
  {
    vi: "Chọn thành phố",
    en: "Choose city",
    ja: "都市を選択",
    ko: "도시 선택",
    zh: "选择城市",
  },
  {
    vi: "Danh sách cast",
    en: "Cast list",
    ja: "キャスト一覧",
    ko: "캐스트 목록",
    zh: "Cast 列表",
  },
  {
    vi: "Gợi ý tìm kiếm",
    en: "Search suggestions",
    ja: "検索候補",
    ko: "검색 제안",
    zh: "搜索建议",
  },
  {
    vi: "Gợi ý cast",
    en: "Suggested Cast",
    ja: "おすすめキャスト",
    ko: "추천 캐스트",
    zh: "推荐 Cast",
  },
  {
    vi: "Không có gợi ý trùng khớp.",
    en: "No matching suggestions.",
    ja: "一致する候補がありません。",
    ko: "일치하는 제안이 없습니다.",
    zh: "没有匹配的建议。",
  },
  {
    vi: "Tìm gần đây",
    en: "Recent searches",
    ja: "最近の検索",
    ko: "최근 검색",
    zh: "最近搜索",
  },
  {
    vi: "Xóa lịch sử",
    en: "Clear history",
    ja: "履歴を削除",
    ko: "기록 삭제",
    zh: "清除历史",
  },
  {
    vi: "Từ khóa phổ biến",
    en: "Popular keywords",
    ja: "人気キーワード",
    ko: "인기 키워드",
    zh: "热门关键词",
  },
  {
    vi: "Còn lịch tối nay",
    en: "Available tonight",
    ja: "今夜空きあり",
    ko: "오늘 밤 예약 가능",
    zh: "今晚仍有空档",
  },
  {
    vi: "Chưa có cast phù hợp",
    en: "No matching Cast",
    ja: "条件に合うキャストがいません",
    ko: "조건에 맞는 캐스트가 없습니다",
    zh: "没有匹配的 Cast",
  },
  {
    vi: "Đổi khu vực, ngôn ngữ hoặc khoảng giá để xem thêm.",
    en: "Change area, language, or price range to see more.",
    ja: "エリア、言語、価格帯を変えるとさらに表示できます。",
    ko: "지역, 언어 또는 가격대를 바꾸면 더 볼 수 있습니다.",
    zh: "更改区域、语言或价格区间以查看更多。",
  },
  {
    vi: "4.5★ trở lên",
    en: "4.5★ and up",
    ja: "4.5★以上",
    ko: "4.5★ 이상",
    zh: "4.5★以上",
  },
  {
    vi: "Đặt",
    en: "Book",
    ja: "予約",
    ko: "예약",
    zh: "预约",
  },
  {
    vi: "Tối nay",
    en: "Tonight",
    ja: "今夜",
    ko: "오늘 밤",
    zh: "今晚",
  },
  {
    vi: "Áp dụng",
    en: "Apply",
    ja: "適用",
    ko: "적용",
    zh: "应用",
  },
  {
    vi: "Quên mật khẩu?",
    en: "Forgot password?",
    ja: "パスワードをお忘れですか？",
    ko: "비밀번호를 잊으셨나요?",
    zh: "忘记密码？",
  },
  {
    vi: "Quên mật khẩu",
    en: "Forgot password",
    ja: "パスワードを忘れた場合",
    ko: "비밀번호 찾기",
    zh: "忘记密码",
  },
  {
    vi: "Quay lại đăng nhập",
    en: "Back to login",
    ja: "ログインに戻る",
    ko: "로그인으로 돌아가기",
    zh: "返回登录",
  },
  {
    vi: "Nhập mã xác nhận",
    en: "Enter verification code",
    ja: "確認コードを入力",
    ko: "인증 코드를 입력하세요",
    zh: "输入验证码",
  },
  {
    vi: "Nhập email tài khoản, Vietyoru sẽ gửi mã gồm 6 chữ số có hiệu lực trong 15 phút.",
    en: "Enter your account email. Vietyoru will send a 6-digit code valid for 15 minutes.",
    ja: "アカウントのメールアドレスを入力してください。Vietyoruから15分間有効な6桁コードを送信します。",
    ko: "계정 이메일을 입력하면 Vietyoru가 15분 동안 유효한 6자리 코드를 보냅니다.",
    zh: "请输入账户邮箱，Vietyoru 将发送有效期 15 分钟的 6 位验证码。",
  },
  {
    vi: "Mã xác nhận",
    en: "Verification code",
    ja: "確認コード",
    ko: "인증 코드",
    zh: "验证码",
  },
  {
    vi: "Nhập mã 6 số",
    en: "Enter 6-digit code",
    ja: "6桁のコードを入力",
    ko: "6자리 코드를 입력하세요",
    zh: "输入6位数字码",
  },
  {
    vi: "Gửi mã xác nhận",
    en: "Send verification code",
    ja: "確認コードを送信",
    ko: "인증 코드 보내기",
    zh: "发送验证码",
  },
  {
    vi: "Xác nhận mã",
    en: "Verify code",
    ja: "コードを確認",
    ko: "코드 확인",
    zh: "验证代码",
  },
  {
    vi: "Đang xử lý...",
    en: "Processing...",
    ja: "処理中...",
    ko: "처리 중...",
    zh: "处理中...",
  },
  {
    vi: "Nhập email khác hoặc gửi mã mới",
    en: "Use another email or send a new code",
    ja: "別のメールを入力、または新しいコードを送信",
    ko: "다른 이메일 입력 또는 새 코드 보내기",
    zh: "输入其他邮箱或发送新代码",
  },
  {
    vi: "Tạo mật khẩu mới",
    en: "Create a new password",
    ja: "新しいパスワードを作成",
    ko: "새 비밀번호 만들기",
    zh: "创建新密码",
  },
  {
    vi: "Vui lòng xác thực mã email trước khi đặt mật khẩu mới.",
    en: "Please verify the email code before setting a new password.",
    ja: "新しいパスワードを設定する前に、メールコードを確認してください。",
    ko: "새 비밀번호를 설정하기 전에 이메일 코드를 인증해 주세요.",
    zh: "设置新密码前，请先验证邮箱验证码。",
  },
  {
    vi: "Mật khẩu mới",
    en: "New password",
    ja: "新しいパスワード",
    ko: "새 비밀번호",
    zh: "新密码",
  },
  {
    vi: "Vui lòng nhập mật khẩu mới",
    en: "Please enter a new password",
    ja: "新しいパスワードを入力してください",
    ko: "새 비밀번호를 입력해 주세요",
    zh: "请输入新密码",
  },
  {
    vi: "Nhập lại mật khẩu mới",
    en: "Confirm new password",
    ja: "新しいパスワードを再入力",
    ko: "새 비밀번호 확인",
    zh: "再次输入新密码",
  },
  {
    vi: "Vui lòng nhập lại mật khẩu mới",
    en: "Please confirm the new password",
    ja: "新しいパスワードをもう一度入力してください",
    ko: "새 비밀번호를 다시 입력해 주세요",
    zh: "请再次输入新密码",
  },
  {
    vi: "Đang cập nhật...",
    en: "Updating...",
    ja: "更新中...",
    ko: "업데이트 중...",
    zh: "正在更新...",
  },
  {
    vi: "Đổi mật khẩu",
    en: "Change password",
    ja: "パスワードを変更",
    ko: "비밀번호 변경",
    zh: "更改密码",
  },
  {
    vi: "Xem danh sách quán",
    en: "View venue list",
    ja: "店舗一覧を見る",
    ko: "매장 목록 보기",
    zh: "查看店铺列表",
  },
  {
    vi: "Coupon & khuyến mãi từ các quán đối tác · Hà Nội",
    en: "Coupons and promotions from partner venues · Hanoi",
    ja: "提携店舗のクーポン・キャンペーン · ハノイ",
    ko: "제휴 매장의 쿠폰 및 프로모션 · 하노이",
    zh: "合作店铺优惠券和活动 · 河内",
  },
  {
    vi: "Tìm ưu đãi",
    en: "Search deals",
    ja: "特典を検索",
    ko: "혜택 검색",
    zh: "搜索优惠",
  },
  {
    vi: "Đang tải ưu đãi",
    en: "Loading deals",
    ja: "特典を読み込み中",
    ko: "혜택 불러오는 중",
    zh: "正在加载优惠",
  },
  {
    vi: "Danh sách coupon đang có",
    en: "Available coupon list",
    ja: "利用可能なクーポン一覧",
    ko: "사용 가능한 쿠폰 목록",
    zh: "可用优惠券列表",
  },
  {
    vi: "Chưa có coupon đang mở",
    en: "No active coupons yet",
    ja: "現在利用可能なクーポンはありません",
    ko: "현재 이용 가능한 쿠폰이 없습니다",
    zh: "暂无可用优惠券",
  },
  {
    vi: "Hiện chưa có ưu đãi phù hợp. Bạn quay lại sau một chút nhé.",
    en: "There are no matching deals right now. Please check back shortly.",
    ja: "現在、条件に合う特典はありません。しばらくしてから再度ご確認ください。",
    ko: "현재 조건에 맞는 혜택이 없습니다. 잠시 후 다시 확인해 주세요.",
    zh: "目前没有匹配的优惠，请稍后再查看。",
  },
  {
    vi: "Tìm quán khác",
    en: "Find another venue",
    ja: "別の店舗を探す",
    ko: "다른 매장 찾기",
    zh: "查找其他店铺",
  },
  {
    vi: "Guest Discount 5%",
    en: "Guest Discount 5%",
    ja: "ゲスト割引 5%",
    ko: "게스트 할인 5%",
    zh: "游客优惠 5%",
  },
  {
    vi: "Member Discount",
    en: "Member Discount",
    ja: "会員割引",
    ko: "회원 할인",
    zh: "会员优惠",
  },
  {
    vi: "VIP Discount 10%",
    en: "VIP Discount 10%",
    ja: "VIP割引 10%",
    ko: "VIP 할인 10%",
    zh: "VIP 优惠 10%",
  },
  {
    vi: "Welcome 100K",
    en: "Welcome 100K",
    ja: "ウェルカム 100K",
    ko: "웰컴 100K",
    zh: "欢迎优惠 100K",
  },
  {
    vi: "Thư viện ảnh",
    en: "Photo gallery",
    ja: "フォトギャラリー",
    ko: "사진 갤러리",
    zh: "照片库",
  },
  {
    vi: "Thư viện ảnh của quán",
    en: "Venue photo gallery",
    ja: "店舗フォトギャラリー",
    ko: "매장 사진 갤러리",
    zh: "店铺照片库",
  },
  {
    vi: "Mở nội dung",
    en: "Open content",
    ja: "コンテンツを開く",
    ko: "콘텐츠 열기",
    zh: "打开内容",
  },
  {
    vi: "Giờ mở cửa",
    en: "Opening hours",
    ja: "営業時間",
    ko: "영업시간",
    zh: "营业时间",
  },
  {
    vi: "Khoảng giá",
    en: "Price range",
    ja: "価格帯",
    ko: "가격대",
    zh: "价格区间",
  },
  {
    vi: "Đang phục vụ",
    en: "Serving now",
    ja: "対応中",
    ko: "현재 근무 중",
    zh: "正在服务",
  },
  {
    vi: "Đang mở",
    en: "Open now",
    ja: "営業中",
    ko: "영업 중",
    zh: "营业中",
  },
  {
    vi: "Đang nghỉ",
    en: "Closed",
    ja: "休業中",
    ko: "영업 종료",
    zh: "休息中",
  },
  {
    vi: "Chỉ đường",
    en: "Directions",
    ja: "道順",
    ko: "길찾기",
    zh: "路线",
  },
  {
    vi: "Gọi điện",
    en: "Call",
    ja: "電話",
    ko: "전화",
    zh: "电话",
  },
  {
    vi: "Thực đơn",
    en: "Menu",
    ja: "メニュー",
    ko: "메뉴",
    zh: "菜单",
  },
  {
    vi: "Video quán",
    en: "Venue videos",
    ja: "店舗動画",
    ko: "매장 영상",
    zh: "店铺视频",
  },
  {
    vi: "Không gian quán",
    en: "Venue space",
    ja: "店舗空間",
    ko: "매장 공간",
    zh: "店铺空间",
  },
  {
    vi: "Vị trí",
    en: "Location",
    ja: "所在地",
    ko: "위치",
    zh: "位置",
  },
  {
    vi: "Giới thiệu",
    en: "Introduction",
    ja: "紹介",
    ko: "소개",
    zh: "介绍",
  },
  {
    vi: "Chưa có mô tả quán.",
    en: "Venue description is not available yet.",
    ja: "店舗紹介はまだありません。",
    ko: "매장 설명이 아직 없습니다.",
    zh: "暂无店铺介绍。",
  },
  {
    vi: "Cast đang làm",
    en: "Cast on duty",
    ja: "在籍キャスト",
    ko: "근무 중인 캐스트",
    zh: "在岗 Cast",
  },
  {
    vi: "Đặt bàn ngay",
    en: "Book a table now",
    ja: "今すぐ席を予約",
    ko: "지금 테이블 예약",
    zh: "立即预订桌位",
  },
  {
    vi: "Gửi yêu cầu · không thu cọc",
    en: "Send request · no deposit",
    ja: "リクエスト送信・デポジット不要",
    ko: "요청 보내기 · 보증금 없음",
    zh: "发送请求 · 无需订金",
  },
  {
    vi: "Nói tiếng Anh",
    en: "Speaks English",
    ja: "英語対応",
    ko: "영어 가능",
    zh: "会说英语",
  },
  {
    vi: "Quốc tịch cast",
    en: "Cast nationality",
    ja: "キャスト国籍",
    ko: "캐스트 국적",
    zh: "Cast 国籍",
  },
  {
    vi: "Nhật Bản · Việt Nam",
    en: "Japan · Vietnam",
    ja: "日本 · ベトナム",
    ko: "일본 · 베트남",
    zh: "日本 · 越南",
  },
  {
    vi: "Quán đang thuộc về",
    en: "Current venue",
    ja: "所属店舗",
    ko: "소속 매장",
    zh: "所属店铺",
  },
  {
    vi: "Cast tương tự",
    en: "Similar Cast",
    ja: "似ているキャスト",
    ko: "비슷한 캐스트",
    zh: "相似 Cast",
  },
  {
    vi: "Xem quán",
    en: "View venue",
    ja: "店舗を見る",
    ko: "매장 보기",
    zh: "查看店铺",
  },
  {
    vi: "Đặt cast này",
    en: "Book this Cast",
    ja: "このキャストを予約",
    ko: "이 캐스트 예약",
    zh: "预约此 Cast",
  },
  {
    vi: "Sở thích",
    en: "Interests",
    ja: "趣味",
    ko: "취미",
    zh: "兴趣",
  },
  {
    vi: "Phong cách",
    en: "Style",
    ja: "スタイル",
    ko: "스타일",
    zh: "风格",
  },
  {
    vi: "Chưa cập nhật",
    en: "Not updated",
    ja: "未更新",
    ko: "아직 업데이트되지 않음",
    zh: "尚未更新",
  },
  {
    vi: "Thanh lịch · Ấm áp",
    en: "Elegant · Warm",
    ja: "上品 · 温かい",
    ko: "우아함 · 따뜻함",
    zh: "优雅 · 温暖",
  },
  {
    vi: "Tháng sinh",
    en: "Birth month",
    ja: "誕生月",
    ko: "태어난 달",
    zh: "出生月份",
  },
  {
    vi: "Cung",
    en: "Zodiac",
    ja: "星座",
    ko: "별자리",
    zh: "星座",
  },
  {
    vi: "Đang nhận đặt tối nay",
    en: "Accepting bookings tonight",
    ja: "今夜予約受付中",
    ko: "오늘 밤 예약 접수 중",
    zh: "今晚可预约",
  },
  {
    vi: "Ranking tháng này",
    en: "This month's ranking",
    ja: "今月のランキング",
    ko: "이번 달 랭킹",
    zh: "本月排行",
  },
  {
    vi: "Ranking tháng 6",
    en: "June ranking",
    ja: "6月ランキング",
    ko: "6월 랭킹",
    zh: "6月排行",
  },
  {
    vi: "Mở gallery cast",
    en: "Open Cast gallery",
    ja: "キャストギャラリーを開く",
    ko: "캐스트 갤러리 열기",
    zh: "打开 Cast 相册",
  },
  {
    vi: "Mở video SNS",
    en: "Open SNS video",
    ja: "SNS動画を開く",
    ko: "SNS 영상 열기",
    zh: "打开 SNS 视频",
  },
  {
    vi: "Xác nhận trong 5 phút · Miễn phí huỷ trước 2 giờ",
    en: "Confirmed within 5 minutes · Free cancellation up to 2 hours before",
    ja: "5分以内に確認 · 2時間前まで無料キャンセル",
    ko: "5분 이내 확인 · 2시간 전까지 무료 취소",
    zh: "5分钟内确认 · 提前2小时可免费取消",
  },
  {
    vi: "Admin đang điều phối đặt chỗ",
    en: "Admin is coordinating the reservation",
    ja: "管理者が予約を調整中",
    ko: "관리자가 예약을 조율 중",
    zh: "管理员正在协调预约",
  },
  {
    vi: "Mail Admin",
    en: "Email admin",
    ja: "管理者へメール",
    ko: "관리자에게 메일",
    zh: "邮件联系管理员",
  },
  {
    vi: "LINE OA",
    en: "LINE OA",
    ja: "LINE公式",
    ko: "LINE 공식",
    zh: "LINE 官方账号",
  },
  {
    vi: "Admin đang điều phối.",
    en: "Admin is coordinating.",
    ja: "管理者が調整中です。",
    ko: "관리자가 조율 중입니다.",
    zh: "管理员正在协调。",
  },
];

const translations = new Map<string, TranslationSet>(
  entries.map(({ vi, ...translated }) => [normalizeText(vi), translated]),
);

const reverseTranslations = new Map<string, string>();

for (const entry of entries) {
  for (const code of ["en", "ja", "ko", "zh"] as const) {
    reverseTranslations.set(normalizeText(entry[code]), entry.vi);
  }
}

const termEntries: TranslationEntry[] = [
  {
    vi: "TP. Hồ Chí Minh",
    en: "Ho Chi Minh City",
    ja: "ホーチミン市",
    ko: "호찌민시",
    zh: "胡志明市",
  },
  {
    vi: "TP.HCM",
    en: "Ho Chi Minh City",
    ja: "ホーチミン市",
    ko: "호찌민시",
    zh: "胡志明市",
  },
  {
    vi: "Hồ Chí Minh",
    en: "Ho Chi Minh City",
    ja: "ホーチミン",
    ko: "호찌민",
    zh: "胡志明",
  },
  {
    vi: "Hà Nội",
    en: "Hanoi",
    ja: "ハノイ",
    ko: "하노이",
    zh: "河内",
  },
  {
    vi: "Tây Hồ",
    en: "Tay Ho",
    ja: "タイホー",
    ko: "떠이호",
    zh: "西湖",
  },
  {
    vi: "Ba Đình",
    en: "Ba Dinh",
    ja: "バーディン",
    ko: "바딘",
    zh: "巴亭",
  },
  {
    vi: "Hoàn Kiếm",
    en: "Hoan Kiem",
    ja: "ホアンキエム",
    ko: "호안끼엠",
    zh: "还剑",
  },
  {
    vi: "Kim Mã",
    en: "Kim Ma",
    ja: "キムマー",
    ko: "낌마",
    zh: "金马",
  },
  {
    vi: "Đống Đa",
    en: "Dong Da",
    ja: "ドンダー",
    ko: "동다",
    zh: "栋多",
  },
  {
    vi: "Trúc Bạch",
    en: "Truc Bach",
    ja: "チュックバック",
    ko: "쭉박",
    zh: "竹帛",
  },
  {
    vi: "Cầu Giấy",
    en: "Cau Giay",
    ja: "カウザイ",
    ko: "꺼우저이",
    zh: "纸桥",
  },
  {
    vi: "Quận 1",
    en: "District 1",
    ja: "1区",
    ko: "1군",
    zh: "第1郡",
  },
  {
    vi: "Quận 3",
    en: "District 3",
    ja: "3区",
    ko: "3군",
    zh: "第3郡",
  },
  {
    vi: "Quận 7",
    en: "District 7",
    ja: "7区",
    ko: "7군",
    zh: "第7郡",
  },
  {
    vi: "HN",
    en: "Hanoi",
    ja: "ハノイ",
    ko: "하노이",
    zh: "河内",
  },
  {
    vi: "HCM",
    en: "Ho Chi Minh City",
    ja: "ホーチミン",
    ko: "호찌민",
    zh: "胡志明",
  },
  {
    vi: "Club Lumière",
    en: "Club Lumière",
    ja: "クラブ・リュミエール",
    ko: "클럽 뤼미에르",
    zh: "Lumière 俱乐部",
  },
  {
    vi: "KTV Hoàng Gia",
    en: "Hoang Gia KTV",
    ja: "ホアンザーKTV",
    ko: "호앙자 KTV",
    zh: "皇家KTV",
  },
  {
    vi: "Sakura Lounge",
    en: "Sakura Lounge",
    ja: "サクララウンジ",
    ko: "사쿠라 라운지",
    zh: "樱花酒廊",
  },
  {
    vi: "Sakura Club",
    en: "Sakura Club",
    ja: "サクラクラブ",
    ko: "사쿠라 클럽",
    zh: "樱花俱乐部",
  },
  {
    vi: "Neon Club",
    en: "Neon Club",
    ja: "ネオンクラブ",
    ko: "네온 클럽",
    zh: "Neon 俱乐部",
  },
  {
    vi: "Tokyo Kitchen Old Quarter",
    en: "Tokyo Kitchen Old Quarter",
    ja: "東京キッチン旧市街",
    ko: "도쿄 키친 올드쿼터",
    zh: "东京厨房老城区",
  },
  {
    vi: "Tokyo Kitchen",
    en: "Tokyo Kitchen",
    ja: "東京キッチン",
    ko: "도쿄 키친",
    zh: "东京厨房",
  },
  {
    vi: "Star KTV",
    en: "Star KTV",
    ja: "スターKTV",
    ko: "스타 KTV",
    zh: "星光KTV",
  },
  {
    vi: "Jade Lounge",
    en: "Jade Lounge",
    ja: "ジェイドラウンジ",
    ko: "제이드 라운지",
    zh: "翡翠酒廊",
  },
  {
    vi: "Crimson Bar",
    en: "Crimson Bar",
    ja: "クリムゾンバー",
    ko: "크림슨 바",
    zh: "绯红酒吧",
  },
  {
    vi: "Sora Lounge",
    en: "Sora Lounge",
    ja: "ソララウンジ",
    ko: "소라 라운지",
    zh: "Sora 酒廊",
  },
  {
    vi: "Moonlight Q1 Bar",
    en: "Moonlight Q1 Bar",
    ja: "ムーンライト1区バー",
    ko: "문라이트 1군 바",
    zh: "月光一区酒吧",
  },
  {
    vi: "Golden Voice KTV",
    en: "Golden Voice KTV",
    ja: "ゴールデンボイスKTV",
    ko: "골든 보이스 KTV",
    zh: "金嗓KTV",
  },
  {
    vi: "Lotus Massage Spa",
    en: "Lotus Massage Spa",
    ja: "ロータスマッサージスパ",
    ko: "로터스 마사지 스파",
    zh: "莲花按摩水疗",
  },
  {
    vi: "Club",
    en: "Club",
    ja: "クラブ",
    ko: "클럽",
    zh: "俱乐部",
  },
  {
    vi: "Lounge",
    en: "Lounge",
    ja: "ラウンジ",
    ko: "라운지",
    zh: "酒廊",
  },
  {
    vi: "Girls Bar",
    en: "Girls Bar",
    ja: "ガールズバー",
    ko: "걸즈 바",
    zh: "Girls Bar",
  },
  {
    vi: "Karaoke / KTV",
    en: "Karaoke / KTV",
    ja: "カラオケ / KTV",
    ko: "노래방 / KTV",
    zh: "卡拉 OK / KTV",
  },
  {
    vi: "Karaoke",
    en: "Karaoke",
    ja: "カラオケ",
    ko: "노래방",
    zh: "卡拉 OK",
  },
  {
    vi: "Massage / Spa",
    en: "Massage / Spa",
    ja: "マッサージ / スパ",
    ko: "마사지 / 스파",
    zh: "按摩 / 水疗",
  },
  {
    vi: "Massage spa",
    en: "Massage spa",
    ja: "マッサージスパ",
    ko: "마사지 스파",
    zh: "按摩水疗",
  },
  {
    vi: "Restaurant",
    en: "Restaurant",
    ja: "レストラン",
    ko: "레스토랑",
    zh: "餐厅",
  },
  {
    vi: "Casino",
    en: "Casino",
    ja: "カジノ",
    ko: "카지노",
    zh: "赌场",
  },
  {
    vi: "nhân viên a",
    en: "Staff A",
    ja: "スタッフA",
    ko: "직원 A",
    zh: "员工A",
  },
  {
    vi: "quán A",
    en: "Venue A",
    ja: "店舗A",
    ko: "매장 A",
    zh: "店铺A",
  },
  {
    vi: "Nhà hàng Nhật",
    en: "Japanese restaurant",
    ja: "日本料理店",
    ko: "일식 레스토랑",
    zh: "日式餐厅",
  },
  {
    vi: "BBQ Nhật",
    en: "Japanese BBQ",
    ja: "日本式BBQ",
    ko: "일식 BBQ",
    zh: "日式烧烤",
  },
  {
    vi: "Đặt bàn nhanh",
    en: "Quick booking",
    ja: "すぐ予約",
    ko: "빠른 예약",
    zh: "快速预约",
  },
  {
    vi: "Đánh giá cao",
    en: "Highly rated",
    ja: "高評価",
    ko: "높은 평점",
    zh: "高评分",
  },
  {
    vi: "Thư giãn",
    en: "Relaxing",
    ja: "リラックス",
    ko: "릴랙스",
    zh: "放松",
  },
  {
    vi: "Xông hơi",
    en: "Sauna",
    ja: "サウナ",
    ko: "사우나",
    zh: "桑拿",
  },
  {
    vi: "Cổ truyền",
    en: "Traditional",
    ja: "伝統式",
    ko: "전통식",
    zh: "传统",
  },
  {
    vi: "Chăm sóc da",
    en: "Skincare",
    ja: "スキンケア",
    ko: "스킨케어",
    zh: "皮肤护理",
  },
  {
    vi: "Phổ biến",
    en: "Popular",
    ja: "人気",
    ko: "인기",
    zh: "热门",
  },
  {
    vi: "Cao cấp",
    en: "Premium",
    ja: "プレミアム",
    ko: "프리미엄",
    zh: "高级",
  },
  {
    vi: "Club Lumiere",
    en: "Club Lumiere",
    ja: "クラブ・リュミエール",
    ko: "클럽 뤼미에르",
    zh: "Lumiere 俱乐部",
  },
  {
    vi: "Velvet Club",
    en: "Velvet Club",
    ja: "ベルベットクラブ",
    ko: "벨벳 클럽",
    zh: "Velvet 俱乐部",
  },
  {
    vi: "Velvet Bar",
    en: "Velvet Bar",
    ja: "ベルベットバー",
    ko: "벨벳 바",
    zh: "Velvet 酒吧",
  },
  {
    vi: "Moonlight Bar",
    en: "Moonlight Bar",
    ja: "ムーンライトバー",
    ko: "문라이트 바",
    zh: "月光酒吧",
  },
  {
    vi: "Crimson Bar Hoan Kiem",
    en: "Crimson Bar Hoan Kiem",
    ja: "クリムゾンバー・ホアンキエム",
    ko: "크림슨 바 호안끼엠",
    zh: "还剑绯红酒吧",
  },
  {
    vi: "Sakura Lounge Quan 3",
    en: "Sakura Lounge District 3",
    ja: "サクララウンジ3区",
    ko: "사쿠라 라운지 3군",
    zh: "第3郡樱花酒廊",
  },
  {
    vi: "Golden Voice KTV Quan 7",
    en: "Golden Voice KTV District 7",
    ja: "ゴールデンボイスKTV 7区",
    ko: "골든 보이스 KTV 7군",
    zh: "第7郡金嗓KTV",
  },
  {
    vi: "Việt Nam",
    en: "Vietnam",
    ja: "ベトナム",
    ko: "베트남",
    zh: "越南",
  },
  {
    vi: "Nhật Bản",
    en: "Japan",
    ja: "日本",
    ko: "일본",
    zh: "日本",
  },
  {
    vi: "Hàn Quốc",
    en: "Korea",
    ja: "韓国",
    ko: "한국",
    zh: "韩国",
  },
  {
    vi: "Trung Quốc",
    en: "China",
    ja: "中国",
    ko: "중국",
    zh: "中国",
  },
  {
    vi: "Tiếng Việt",
    en: "Vietnamese",
    ja: "ベトナム語",
    ko: "베트남어",
    zh: "越南语",
  },
  {
    vi: "Tiếng Anh",
    en: "English",
    ja: "英語",
    ko: "영어",
    zh: "英语",
  },
  {
    vi: "Tiếng Nhật",
    en: "Japanese",
    ja: "日本語",
    ko: "일본어",
    zh: "日语",
  },
  {
    vi: "Tiếng Hàn",
    en: "Korean",
    ja: "韓国語",
    ko: "한국어",
    zh: "韩语",
  },
  {
    vi: "Tiếng Trung",
    en: "Chinese",
    ja: "中国語",
    ko: "중국어",
    zh: "中文",
  },
  {
    vi: "VN",
    en: "Vietnamese",
    ja: "ベトナム語",
    ko: "베트남어",
    zh: "越南语",
  },
  {
    vi: "EN",
    en: "English",
    ja: "英語",
    ko: "영어",
    zh: "英语",
  },
  {
    vi: "JP",
    en: "Japanese",
    ja: "日本語",
    ko: "일본어",
    zh: "日语",
  },
  {
    vi: "JA",
    en: "Japanese",
    ja: "日本語",
    ko: "일본어",
    zh: "日语",
  },
  {
    vi: "KO",
    en: "Korean",
    ja: "韓国語",
    ko: "한국어",
    zh: "韩语",
  },
  {
    vi: "ZH",
    en: "Chinese",
    ja: "中国語",
    ko: "중국어",
    zh: "中文",
  },
  {
    vi: "Guest Discount",
    en: "Guest Discount",
    ja: "ゲスト割引",
    ko: "게스트 할인",
    zh: "游客优惠",
  },
  {
    vi: "Member Discount",
    en: "Member Discount",
    ja: "会員割引",
    ko: "회원 할인",
    zh: "会员优惠",
  },
  {
    vi: "VIP Discount",
    en: "VIP Discount",
    ja: "VIP割引",
    ko: "VIP 할인",
    zh: "VIP 优惠",
  },
  {
    vi: "Welcome",
    en: "Welcome",
    ja: "ウェルカム",
    ko: "웰컴",
    zh: "欢迎优惠",
  },
  {
    vi: "Happy Hour",
    en: "Happy Hour",
    ja: "ハッピーアワー",
    ko: "해피아워",
    zh: "欢乐时光",
  },
  {
    vi: "cuối tuần",
    en: "weekend",
    ja: "週末",
    ko: "주말",
    zh: "周末",
  },
  {
    vi: "VIP Room",
    en: "VIP Room",
    ja: "VIPルーム",
    ko: "VIP 룸",
    zh: "VIP 包房",
  },
  {
    vi: "Phòng riêng",
    en: "Private room",
    ja: "個室",
    ko: "프라이빗 룸",
    zh: "包间",
  },
  {
    vi: "Âm thanh hay",
    en: "Great sound",
    ja: "音響が良い",
    ko: "음향이 좋음",
    zh: "音响出色",
  },
  {
    vi: "Combo nhóm",
    en: "Group combo",
    ja: "グループコンボ",
    ko: "단체 콤보",
    zh: "团体套餐",
  },
  {
    vi: "2+1 Combo phòng",
    en: "2+1 room combo",
    ja: "ルーム 2+1 コンボ",
    ko: "룸 2+1 콤보",
    zh: "包房 2+1 套餐",
  },
  {
    vi: "Bar · Lounge",
    en: "Bar · Lounge",
    ja: "バー · ラウンジ",
    ko: "바 · 라운지",
    zh: "酒吧 · 酒廊",
  },
  {
    vi: "Bar · ホアンキエム",
    en: "Bar · Hoan Kiem",
    ja: "バー · ホアンキエム",
    ko: "바 · 호안끼엠",
    zh: "酒吧 · 还剑",
  },
  {
    vi: "Nhà hàng",
    en: "Restaurant",
    ja: "レストラン",
    ko: "레스토랑",
    zh: "餐厅",
  },
  {
    vi: "KTV",
    en: "KTV",
    ja: "KTV",
    ko: "KTV",
    zh: "KTV",
  },
  {
    vi: "Spa",
    en: "Spa",
    ja: "スパ",
    ko: "스파",
    zh: "水疗",
  },
  {
    vi: "Massage",
    en: "Massage",
    ja: "マッサージ",
    ko: "마사지",
    zh: "按摩",
  },
  {
    vi: "Admin đang điều phối",
    en: "Admin is coordinating",
    ja: "管理者が調整中",
    ko: "관리자가 조율 중",
    zh: "管理员正在协调",
  },
  {
    vi: "QR đã cấp",
    en: "QR issued",
    ja: "QR発行済み",
    ko: "QR 발급됨",
    zh: "二维码已发放",
  },
  {
    vi: "Mới",
    en: "New",
    ja: "新規",
    ko: "신규",
    zh: "新建",
  },
  {
    vi: "Hoàn tất",
    en: "Completed",
    ja: "完了",
    ko: "완료",
    zh: "已完成",
  },
  {
    vi: "Đã hủy",
    en: "Cancelled",
    ja: "キャンセル済み",
    ko: "취소됨",
    zh: "已取消",
  },
  {
    vi: "Chi tiết",
    en: "Details",
    ja: "詳細",
    ko: "상세",
    zh: "详情",
  },
  {
    vi: "Chat Admin",
    en: "Chat with admin",
    ja: "管理者にチャット",
    ko: "관리자 채팅",
    zh: "联系管理员",
  },
  {
    vi: "Đổi lịch",
    en: "Reschedule",
    ja: "日程変更",
    ko: "일정 변경",
    zh: "改期",
  },
  {
    vi: "Hủy đặt chỗ",
    en: "Cancel reservation",
    ja: "予約をキャンセル",
    ko: "예약 취소",
    zh: "取消预约",
  },
  {
    vi: "Xác nhận trong 5 phút · Miễn phí huỷ trước 2 giờ",
    en: "Confirmed within 5 minutes · Free cancellation up to 2 hours before",
    ja: "5分以内に確認 · 2時間前まで無料キャンセル",
    ko: "5분 이내 확인 · 2시간 전까지 무료 취소",
    zh: "5分钟内确认 · 提前2小时可免费取消",
  },
];

const termTranslations = [...termEntries].sort((left, right) => right.vi.length - left.vi.length);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceTerms(value: string, language: Exclude<LanguageCode, "vi">) {
  let output = value;

  for (const entry of termTranslations) {
    const replacement = entry[language];
    if (!replacement) continue;
    output = output.replace(new RegExp(escapeRegExp(entry.vi), "g"), replacement);
  }

  return output;
}

function translatePattern(
  value: string,
  language: Exclude<LanguageCode, "vi">,
): string | null {
  const normalized = normalizeText(value);
  const topMatch = normalized.match(/^TOP\s+(\d+)$/i) ?? normalized.match(/^Top\s+(\d+)$/i);

  if (topMatch) {
    const rank = topMatch[1] ?? "";
    return {
      en: `Top ${rank}`,
      ja: `トップ ${rank}`,
      ko: `TOP ${rank}`,
      zh: `第 ${rank} 名`,
    }[language];
  }

  const bannerMatch = normalized.match(/^Banner\s+(\d+)$/i);
  if (bannerMatch) {
    const index = bannerMatch[1] ?? "";
    return {
      en: `Banner ${index}`,
      ja: `バナー ${index}`,
      ko: `배너 ${index}`,
      zh: `横幅 ${index}`,
    }[language];
  }

  const featuredBannerMatch = normalized.match(/^Banner nổi bật\s+(\d+)$/i);
  if (featuredBannerMatch) {
    const index = featuredBannerMatch[1] ?? "";
    return {
      en: `Featured banner ${index}`,
      ja: `注目バナー ${index}`,
      ko: `추천 배너 ${index}`,
      zh: `精选横幅 ${index}`,
    }[language];
  }

  const applyLanguageMatch = normalized.match(/^Áp dụng\s+(VI|EN|JA|KO|ZH)$/i);
  if (applyLanguageMatch) {
    const code = (applyLanguageMatch[1] ?? "").toUpperCase();
    return {
      en: `Apply ${code}`,
      ja: `${code}を適用`,
      ko: `${code} 적용`,
      zh: `应用 ${code}`,
    }[language];
  }

  const openNowMatch = normalized.match(/^Đang mở\s+·\s+(.+)$/i);
  if (openNowMatch) {
    const time = openNowMatch[1] ?? "";
    return {
      en: `Open now · ${time}`,
      ja: `営業中 · ${time}`,
      ko: `영업 중 · ${time}`,
      zh: `营业中 · ${time}`,
    }[language];
  }

  const contentCountMatch = normalized.match(/^(\d+)\s+nội dung$/i);
  if (contentCountMatch) {
    const count = contentCountMatch[1] ?? "";
    return {
      en: `${count} items`,
      ja: `${count}件`,
      ko: `${count}개 콘텐츠`,
      zh: `${count} 个内容`,
    }[language];
  }

  const photoCountMatch = normalized.match(/^(\d+)\s+ảnh$/i);
  if (photoCountMatch) {
    const count = photoCountMatch[1] ?? "";
    return {
      en: `${count} photos`,
      ja: `${count}枚の写真`,
      ko: `사진 ${count}장`,
      zh: `${count} 张照片`,
    }[language];
  }

  const openContentMatch = normalized.match(/^Mở nội dung\s+(\d+)$/i);
  if (openContentMatch) {
    const index = openContentMatch[1] ?? "";
    return {
      en: `Open content ${index}`,
      ja: `コンテンツ ${index} を開く`,
      ko: `콘텐츠 ${index} 열기`,
      zh: `打开内容 ${index}`,
    }[language];
  }

  const sentCodeMatch = normalized.match(
    /^Mã đã được gửi tới\s+(.+?)\.\s+Nếu quá\s+(.+?)\s+phút chưa nhập,\s+hãy yêu cầu mã mới\.$/i,
  );
  if (sentCodeMatch) {
    const email = sentCodeMatch[1] ?? "";
    const minutes = sentCodeMatch[2] ?? "";
    return {
      en: `A code has been sent to ${email}. If you do not enter it within ${minutes} minutes, request a new code.`,
      ja: `${email} にコードを送信しました。${minutes}分以内に入力できない場合は、新しいコードをリクエストしてください。`,
      ko: `${email}(으)로 코드가 전송되었습니다. ${minutes}분 안에 입력하지 못하면 새 코드를 요청해 주세요.`,
      zh: `验证码已发送至 ${email}。如果超过 ${minutes} 分钟未输入，请重新获取验证码。`,
    }[language];
  }

  const resetSessionMatch = normalized.match(
    /^Đang đặt lại mật khẩu cho\s+(.+?)(?:,\s+phiên hết hạn lúc\s+(.+))?\.$/i,
  );
  if (resetSessionMatch) {
    const email = resetSessionMatch[1] ?? "";
    const expiresAt = resetSessionMatch[2] ?? "";
    if (expiresAt) {
      return {
        en: `Resetting password for ${email}; the session expires at ${expiresAt}.`,
        ja: `${email} のパスワードを再設定中です。セッション期限は ${expiresAt} です。`,
        ko: `${email}의 비밀번호를 재설정 중입니다. 세션은 ${expiresAt}에 만료됩니다.`,
        zh: `正在为 ${email} 重置密码，会话将于 ${expiresAt} 过期。`,
      }[language];
    }

    return {
      en: `Resetting password for ${email}.`,
      ja: `${email} のパスワードを再設定中です。`,
      ko: `${email}의 비밀번호를 재설정 중입니다.`,
      zh: `正在为 ${email} 重置密码。`,
    }[language];
  }

  const castRankingMonthMatch = normalized.match(/^#(\d+)\s+Ranking tháng\s+(.+)$/i);
  if (castRankingMonthMatch) {
    const rank = castRankingMonthMatch[1] ?? "";
    const month = normalizeText(castRankingMonthMatch[2] ?? "").toLowerCase();
    if (month === "này") {
      return {
        en: `#${rank} this month's ranking`,
        ja: `今月のランキング #${rank}`,
        ko: `이번 달 랭킹 #${rank}`,
        zh: `本月排行 #${rank}`,
      }[language];
    }

    const monthText = /^\d+$/.test(month)
      ? {
          en: `month ${month}`,
          ja: `${month}月`,
          ko: `${month}월`,
          zh: `${month}月`,
        }[language]
      : replaceTerms(castRankingMonthMatch[2] ?? "", language);
    return {
      en: `#${rank} ${monthText} ranking`,
      ja: `${monthText}ランキング #${rank}`,
      ko: `${monthText} 랭킹 #${rank}`,
      zh: `${monthText}排行 #${rank}`,
    }[language];
  }

  const guestMatch = normalized.match(/^(\d+)\s+người$/i);
  if (guestMatch) {
    const count = guestMatch[1] ?? "";
    return {
      en: `${count} guests`,
      ja: `${count}名`,
      ko: `${count}명`,
      zh: `${count}人`,
    }[language];
  }

  const guestPaxMatch = normalized.match(/^(\d+)\s+người\s+cast$/i);
  if (guestPaxMatch) {
    const count = guestPaxMatch[1] ?? "";
    return {
      en: `${count} Cast members`,
      ja: `${count}人のキャスト`,
      ko: `캐스트 ${count}명`,
      zh: `${count} 位 Cast`,
    }[language];
  }

  const castCountMatch = normalized.match(/^(\d+)\s+cast$/i);
  if (castCountMatch) {
    const count = castCountMatch[1] ?? "";
    return {
      en: `${count} Cast`,
      ja: `${count}人のキャスト`,
      ko: `캐스트 ${count}명`,
      zh: `${count} 位 Cast`,
    }[language];
  }

  const venueCountMatch = normalized.match(/^(\d+)\s+quán$/i);
  if (venueCountMatch) {
    const count = venueCountMatch[1] ?? "";
    return {
      en: `${count} venues`,
      ja: `${count}店舗`,
      ko: `매장 ${count}곳`,
      zh: `${count} 家店铺`,
    }[language];
  }

  const viewCastMatch = normalized.match(/^Xem\s+(\d+)\s+cast$/i);
  if (viewCastMatch) {
    const count = viewCastMatch[1] ?? "";
    return {
      en: `View ${count} Cast`,
      ja: `${count}人のキャストを見る`,
      ko: `캐스트 ${count}명 보기`,
      zh: `查看 ${count} 位 Cast`,
    }[language];
  }

  const viewVenueMatch = normalized.match(/^Xem\s+(\d+)\s+quán$/i);
  if (viewVenueMatch) {
    const count = viewVenueMatch[1] ?? "";
    return {
      en: `View ${count} venues`,
      ja: `${count}店舗を見る`,
      ko: `매장 ${count}곳 보기`,
      zh: `查看 ${count} 家店铺`,
    }[language];
  }

  const filterActiveMatch = normalized.match(/^(\d+)\s+bộ lọc đang bật$/i);
  if (filterActiveMatch) {
    const count = filterActiveMatch[1] ?? "";
    return {
      en: `${count} filters active`,
      ja: `${count}件のフィルターが有効`,
      ko: `필터 ${count}개 적용 중`,
      zh: `${count} 个筛选已启用`,
    }[language];
  }

  const sortWithValueMatch = normalized.match(/^Sắp xếp:\s*(.+)$/i);
  if (sortWithValueMatch) {
    const sortValue = translateText(sortWithValueMatch[1] ?? "", language);
    return {
      en: `Sort: ${sortValue}`,
      ja: `並び替え: ${sortValue}`,
      ko: `정렬: ${sortValue}`,
      zh: `排序：${sortValue}`,
    }[language];
  }

  const findCastNightMatch = normalized.match(/^Tìm cast đêm\s+(.+)$/i);
  if (findCastNightMatch) {
    const city = replaceTerms(findCastNightMatch[1] ?? "", language);
    return {
      en: `Find night Cast in ${city}`,
      ja: `${city}の夜キャストを探す`,
      ko: `${city} 밤 캐스트 찾기`,
      zh: `查找${city}夜间 Cast`,
    }[language];
  }

  const priceFromMatch = normalized.match(/^từ\s+(.+)$/i);
  if (priceFromMatch) {
    const price = priceFromMatch[1] ?? "";
    return {
      en: `from ${price}`,
      ja: `${price}〜`,
      ko: `${price}부터`,
      zh: `${price}起`,
    }[language];
  }

  const pointsNeededMatch = normalized.match(/^Cần thêm\s+(.+?)\s+điểm để lên hạng\s+(.+)$/i);
  if (pointsNeededMatch) {
    const points = pointsNeededMatch[1] ?? "";
    const tier = pointsNeededMatch[2] ?? "";
    return {
      en: `Need ${points} more points to reach ${tier}`,
      ja: `${tier}まであと${points}ポイント`,
      ko: `${tier}까지 ${points}포인트 필요`,
      zh: `还需 ${points} 积分升级至 ${tier}`,
    }[language];
  }

  const tierReadyMatch = normalized.match(/^Đã đủ điểm để lên hạng\s+(.+)$/i);
  if (tierReadyMatch) {
    const tier = tierReadyMatch[1] ?? "";
    return {
      en: `Enough points to reach ${tier}`,
      ja: `${tier}にアップグレード可能`,
      ko: `${tier} 등급으로 올라갈 수 있습니다`,
      zh: `积分已足够升级至 ${tier}`,
    }[language];
  }

  const confidenceMatch = normalized.match(/^Độ tin cậy\s+(.+)$/i);
  if (confidenceMatch) {
    const confidence = confidenceMatch[1] ?? "";
    return {
      en: `Confidence ${confidence}`,
      ja: `信頼度 ${confidence}`,
      ko: `신뢰도 ${confidence}`,
      zh: `可信度 ${confidence}`,
    }[language];
  }

  const changed = replaceTerms(value, language);
  return changed === value ? null : changed;
}

export function isLanguageCode(value: string | null): value is LanguageCode {
  return languageCodes.includes(value as LanguageCode);
}

export function readStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return "vi";

  try {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);
    if (isLanguageCode(storedLanguage)) return storedLanguage;
  } catch {
    return "vi";
  }

  const cookieValue = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${languageCookieName}=`))
    ?.split("=")
    .at(1);

  return isLanguageCode(cookieValue ?? null) ? (cookieValue as LanguageCode) : "vi";
}

export function storeLanguagePreference(language: LanguageCode) {
  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // Language selection should still work when storage is unavailable.
  }

  document.cookie = `${languageCookieName}=${language}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = languageHtmlLang[language];
}

export function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function getVietnameseSource(value: string) {
  const normalized = normalizeText(value);
  return reverseTranslations.get(normalized) ?? value;
}

export function translateText(value: string, language: LanguageCode): string {
  const source = getVietnameseSource(value);
  if (language === "vi") return source;

  const translated = translations.get(normalizeText(source))?.[language];
  return translated ?? translatePattern(source, language) ?? source;
}

export function translateWithWhitespace(value: string, language: LanguageCode) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const translated = translateText(value, language);
  return `${leading}${translated}${trailing}`;
}
