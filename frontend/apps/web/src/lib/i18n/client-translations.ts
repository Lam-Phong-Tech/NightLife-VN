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
    vi: "Lấy mã",
    en: "Get code",
    ja: "コードを取得",
    ko: "코드 받기",
    zh: "领取代码",
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

export function translateText(value: string, language: LanguageCode) {
  const source = getVietnameseSource(value);
  if (language === "vi") return source;

  const translated = translations.get(normalizeText(source))?.[language];
  return translated ?? source;
}

export function translateWithWhitespace(value: string, language: LanguageCode) {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const translated = translateText(value, language);
  return `${leading}${translated}${trailing}`;
}
