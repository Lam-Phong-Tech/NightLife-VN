"use client";

export type LanguageCode = "vi" | "en" | "ja" | "ko" | "zh";

export const defaultLanguageCode: LanguageCode = "ja";
export const languageStorageKey = "vietyoru.language";
export const languageCookieName = "vietyoru_language";
export const languageChangedEvent = "vietyoru:language-change";
const sharedLanguageCookieName = "vietyoru_shared_language";

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
    vi: "Email này đã được đăng ký.",
    en: "This email is already registered.",
    ja: "このメールアドレスはすでに登録されています。",
    ko: "이 이메일은 이미 등록되어 있습니다.",
    zh: "该邮箱已被注册。",
  },
  {
    vi: "Tài khoản này không đúng vai trò để đăng nhập.",
    en: "This account does not have the right role to log in.",
    ja: "このアカウントはログインに必要な権限ロールではありません。",
    ko: "이 계정은 로그인에 필요한 역할이 아닙니다.",
    zh: "该账号的角色不符合登录要求。",
  },
  {
    vi: "Mã xác nhận đã được gửi tới email và có hiệu lực trong 15 phút.",
    en: "A verification code has been sent to your email and is valid for 15 minutes.",
    ja: "確認コードをメールに送信しました。15分間有効です。",
    ko: "인증 코드가 이메일로 전송되었으며 15분 동안 유효합니다.",
    zh: "验证码已发送至邮箱，有效期为 15 分钟。",
  },
  {
    vi: "Mã OTP đã được gửi tới email và có hiệu lực trong 15 phút.",
    en: "The OTP code has been sent to your email and is valid for 15 minutes.",
    ja: "OTPコードをメールに送信しました。15分間有効です。",
    ko: "OTP 코드가 이메일로 전송되었으며 15분 동안 유효합니다.",
    zh: "OTP 验证码已发送到邮箱，有效期为 15 分钟。",
  },
  {
    vi: "Mã OTP vừa được gửi. Vui lòng đợi một chút rồi gửi lại.",
    en: "The OTP code was just sent. Please wait a moment before sending it again.",
    ja: "OTPコードは送信済みです。少し待ってから再送してください。",
    ko: "OTP 코드가 방금 전송되었습니다. 잠시 후 다시 보내 주세요.",
    zh: "OTP 验证码刚刚发送。请稍后再重新发送。",
  },
  {
    vi: "Không gửi được mã OTP. Vui lòng thử lại.",
    en: "Could not send the OTP code. Please try again.",
    ja: "OTPコードを送信できませんでした。もう一度お試しください。",
    ko: "OTP 코드를 보낼 수 없습니다. 다시 시도해 주세요.",
    zh: "无法发送 OTP 验证码。请重试。",
  },
  {
    vi: "Chưa gửi được mã OTP qua email. Vui lòng thử lại sau hoặc liên hệ Admin.",
    en: "The OTP email could not be sent. Please try again later or contact an admin.",
    ja: "OTPメールを送信できませんでした。後でもう一度試すか、管理者に連絡してください。",
    ko: "OTP 이메일을 보낼 수 없습니다. 나중에 다시 시도하거나 관리자에게 문의해 주세요.",
    zh: "无法发送 OTP 邮件。请稍后重试或联系管理员。",
  },
  {
    vi: "Email này đã được đăng ký trong hệ thống. Vui lòng sử dụng email khác.",
    en: "This email is already registered in the system. Please use another email.",
    ja: "このメールアドレスはすでに登録されています。別のメールアドレスを使用してください。",
    ko: "이 이메일은 이미 시스템에 등록되어 있습니다. 다른 이메일을 사용해 주세요.",
    zh: "该邮箱已在系统中注册。请使用其他邮箱。",
  },
  {
    vi: "Mã OTP đã được gửi tới email của bạn.",
    en: "The OTP code has been sent to your email.",
    ja: "OTPコードをメールに送信しました。",
    ko: "OTP 코드가 이메일로 전송되었습니다.",
    zh: "OTP 验证码已发送到你的邮箱。",
  },
  {
    vi: "Mã OTP không đúng hoặc đã hết hạn.",
    en: "The OTP code is incorrect or has expired.",
    ja: "OTPコードが正しくないか、有効期限が切れています。",
    ko: "OTP 코드가 올바르지 않거나 만료되었습니다.",
    zh: "OTP 验证码不正确或已过期。",
  },
  {
    vi: "Email chưa được đăng ký hoặc tài khoản chưa hoạt động.",
    en: "This email is not registered or the account is not active.",
    ja: "このメールアドレスは未登録、またはアカウントが有効ではありません。",
    ko: "이 이메일은 등록되어 있지 않거나 계정이 활성화되어 있지 않습니다.",
    zh: "该邮箱未注册或账号未启用。",
  },
  {
    vi: "Chưa gửi được mã xác nhận qua email. Vui lòng thử lại sau hoặc liên hệ Admin.",
    en: "The verification email could not be sent. Please try again later or contact an admin.",
    ja: "確認メールを送信できませんでした。後でもう一度試すか、管理者に連絡してください。",
    ko: "인증 이메일을 보낼 수 없습니다. 나중에 다시 시도하거나 관리자에게 문의해 주세요.",
    zh: "无法发送验证邮件。请稍后重试或联系管理员。",
  },
  {
    vi: "Chỉ tài khoản người dùng mới được đặt lại mật khẩu tại trang này.",
    en: "Only user accounts can reset their password on this page.",
    ja: "このページでパスワードを再設定できるのはユーザーアカウントのみです。",
    ko: "이 페이지에서는 사용자 계정만 비밀번호를 재설정할 수 있습니다.",
    zh: "只有用户账号可以在此页面重置密码。",
  },
  {
    vi: "Mã xác nhận không đúng hoặc đã hết hạn.",
    en: "The verification code is incorrect or has expired.",
    ja: "確認コードが正しくないか、有効期限が切れています。",
    ko: "인증 코드가 올바르지 않거나 만료되었습니다.",
    zh: "验证码不正确或已过期。",
  },
  {
    vi: "Chưa cấu hình gửi email đặt lại mật khẩu. Vui lòng liên hệ Admin.",
    en: "Password reset email is not configured. Please contact an admin.",
    ja: "パスワード再設定メールが設定されていません。管理者に連絡してください。",
    ko: "비밀번호 재설정 이메일이 설정되어 있지 않습니다. 관리자에게 문의해 주세요.",
    zh: "尚未配置密码重置邮件。请联系管理员。",
  },
  {
    vi: "Đổi mật khẩu thành công. Đang chuyển về trang đăng nhập...",
    en: "Password changed successfully. Redirecting to the login page...",
    ja: "パスワードを変更しました。ログインページへ移動しています...",
    ko: "비밀번호가 변경되었습니다. 로그인 페이지로 이동 중입니다...",
    zh: "密码修改成功。正在跳转到登录页...",
  },
  {
    vi: "Đổi mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới.",
    en: "Password changed successfully. Please sign in with your new password.",
    ja: "パスワードを変更しました。新しいパスワードでログインしてください。",
    ko: "비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.",
    zh: "密码修改成功。请使用新密码登录。",
  },
  {
    vi: "Khi bạn đặt bàn, đặt cast hoặc đặt tour, lịch sử sẽ hiển thị tại đây.",
    en: "When you reserve a table, book a Cast, or book a tour, your history will appear here.",
    ja: "テーブル予約、Cast予約、ツアー予約をすると、履歴がここに表示されます。",
    ko: "테이블, Cast 또는 투어를 예약하면 내역이 여기에 표시됩니다.",
    zh: "当你预订座位、预约 Cast 或预订行程后，历史记录会显示在这里。",
  },
  {
    vi: "Mã OTP",
    en: "OTP code",
    ja: "OTPコード",
    ko: "OTP 코드",
    zh: "OTP 验证码",
  },
  {
    vi: "Nhập mã OTP",
    en: "Enter OTP code",
    ja: "OTPコードを入力",
    ko: "OTP 코드를 입력하세요",
    zh: "输入 OTP 验证码",
  },
  {
    vi: "Gửi OTP",
    en: "Send OTP",
    ja: "OTPを送信",
    ko: "OTP 보내기",
    zh: "发送 OTP",
  },
  {
    vi: "Đang gửi",
    en: "Sending",
    ja: "送信中",
    ko: "전송 중",
    zh: "正在发送",
  },
  {
    vi: "Vui lòng nhập mã OTP.",
    en: "Please enter the OTP code.",
    ja: "OTPコードを入力してください。",
    ko: "OTP 코드를 입력해 주세요.",
    zh: "请输入 OTP 验证码。",
  },
  {
    vi: "Mã OTP phải gồm 6 chữ số.",
    en: "OTP code must be 6 digits.",
    ja: "OTPコードは6桁の数字で入力してください。",
    ko: "OTP 코드는 숫자 6자리여야 합니다.",
    zh: "OTP 验证码必须为 6 位数字。",
  },
  {
    vi: "Vui lòng nhập mã xác nhận.",
    en: "Please enter the verification code.",
    ja: "確認コードを入力してください。",
    ko: "인증 코드를 입력해 주세요.",
    zh: "请输入验证码。",
  },
  {
    vi: "Mã xác nhận phải gồm 6 chữ số.",
    en: "Verification code must be 6 digits.",
    ja: "確認コードは6桁の数字で入力してください。",
    ko: "인증 코드는 숫자 6자리여야 합니다.",
    zh: "验证码必须为 6 位数字。",
  },
  {
    vi: "Không gửi được mã. Vui lòng thử lại.",
    en: "Could not send the code. Please try again.",
    ja: "コードを送信できませんでした。もう一度お試しください。",
    ko: "코드를 보낼 수 없습니다. 다시 시도해 주세요.",
    zh: "无法发送验证码。请重试。",
  },
  {
    vi: "Mã xác nhận chưa đúng. Vui lòng thử lại.",
    en: "The verification code is incorrect. Please try again.",
    ja: "確認コードが正しくありません。もう一度お試しください。",
    ko: "인증 코드가 올바르지 않습니다. 다시 시도해 주세요.",
    zh: "验证码不正确。请重试。",
  },
  {
    vi: "Phiên đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới.",
    en: "The password reset session has expired. Please request a new code.",
    ja: "パスワード再設定セッションの期限が切れました。新しいコードをリクエストしてください。",
    ko: "비밀번호 재설정 세션이 만료되었습니다. 새 코드를 요청해 주세요.",
    zh: "密码重置会话已过期。请重新获取验证码。",
  },
  {
    vi: "Mã xác nhận đã hết hạn sau 15 phút. Vui lòng yêu cầu mã mới.",
    en: "The verification code expired after 15 minutes. Please request a new code.",
    ja: "確認コードは15分後に期限切れになりました。新しいコードをリクエストしてください。",
    ko: "인증 코드는 15분 후 만료되었습니다. 새 코드를 요청해 주세요.",
    zh: "验证码已在 15 分钟后过期。请重新获取验证码。",
  },
  {
    vi: "Không đổi được mật khẩu. Vui lòng thử lại.",
    en: "Could not change the password. Please try again.",
    ja: "パスワードを変更できませんでした。もう一度お試しください。",
    ko: "비밀번호를 변경할 수 없습니다. 다시 시도해 주세요.",
    zh: "无法修改密码。请重试。",
  },
  {
    vi: "Xem thêm tại",
    en: "Learn more in",
    ja: "詳しくは",
    ko: "자세히 보기:",
    zh: "了解更多请见",
  },
  {
    vi: "LINE Login email permission",
    en: "LINE login email permission",
    ja: "LINEログインのメール許可",
    ko: "LINE 로그인 이메일 권한",
    zh: "LINE 登录邮箱授权",
  },
  {
    vi: "Chưa kết nối được dữ liệu quán.",
    en: "Could not connect to venue data.",
    ja: "店舗データに接続できませんでした。",
    ko: "매장 데이터에 연결할 수 없습니다.",
    zh: "无法连接店铺数据。",
  },
  {
    vi: "Chưa có quán phù hợp",
    en: "No matching venues yet",
    ja: "条件に合う店舗はありません",
    ko: "조건에 맞는 매장이 없습니다",
    zh: "暂无符合条件的店铺",
  },
  {
    vi: "Đổi khu vực, loại hình hoặc từ khóa để xem thêm.",
    en: "Change area, category, or keyword to see more.",
    ja: "エリア、ジャンル、キーワードを変更してさらに表示してください。",
    ko: "지역, 카테고리 또는 키워드를 바꾸면 더 볼 수 있습니다.",
    zh: "更换区域、类型或关键词以查看更多。",
  },
  {
    vi: "Không tải được danh sách ưu đãi từ backend.",
    en: "Could not load the deal list from backend.",
    ja: "バックエンドから特典一覧を読み込めませんでした。",
    ko: "백엔드에서 혜택 목록을 불러올 수 없습니다.",
    zh: "无法从后端加载优惠列表。",
  },
  {
    vi: "Bạn đã có một booking đang hoạt động tại quán này trong khung giờ đã chọn.",
    en: "You already have an active booking at this venue for the selected time slot.",
    ja: "選択した時間帯には、この店舗で有効な予約がすでにあります。",
    ko: "선택한 시간대에 이 매장의 활성 예약이 이미 있습니다.",
    zh: "你在该店铺的所选时段已有一个有效预约。",
  },
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
    vi: "Tạo tài khoản",
    en: "Create account",
    ja: "アカウントを作成",
    ko: "계정 만들기",
    zh: "创建账户",
  },
  {
    vi: "Đang xác thực...",
    en: "Verifying...",
    ja: "認証中...",
    ko: "인증 중...",
    zh: "正在验证...",
  },
  {
    vi: "Hiện mật khẩu",
    en: "Show password",
    ja: "パスワードを表示",
    ko: "비밀번호 표시",
    zh: "显示密码",
  },
  {
    vi: "Ẩn mật khẩu",
    en: "Hide password",
    ja: "パスワードを非表示",
    ko: "비밀번호 숨기기",
    zh: "隐藏密码",
  },
  {
    vi: "Không nhận được thông tin xác thực từ Google.",
    en: "Could not receive authentication information from Google.",
    ja: "Googleから認証情報を受け取れませんでした。",
    ko: "Google에서 인증 정보를 받지 못했습니다.",
    zh: "未能从 Google 获取身份验证信息。",
  },
  {
    vi: "Không kết nối được API đăng nhập Google.",
    en: "Could not connect to the Google login API.",
    ja: "GoogleログインAPIに接続できませんでした。",
    ko: "Google 로그인 API에 연결할 수 없습니다.",
    zh: "无法连接 Google 登录 API。",
  },
  {
    vi: "Không tải được nút đăng nhập Google.",
    en: "Could not load the Google login button.",
    ja: "Googleログインボタンを読み込めませんでした。",
    ko: "Google 로그인 버튼을 불러올 수 없습니다.",
    zh: "无法加载 Google 登录按钮。",
  },
  {
    vi: "Đang tải cấu hình đăng nhập Google. Vui lòng thử lại sau vài giây.",
    en: "Google login configuration is loading. Please try again in a few seconds.",
    ja: "Googleログイン設定を読み込み中です。数秒後にもう一度お試しください。",
    ko: "Google 로그인 설정을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.",
    zh: "正在加载 Google 登录配置。请稍后再试。",
  },
  {
    vi: "Google đang tải chưa xong. Vui lòng thử lại sau vài giây.",
    en: "Google is still loading. Please try again in a few seconds.",
    ja: "Googleの読み込みがまだ完了していません。数秒後にもう一度お試しください。",
    ko: "Google이 아직 로드 중입니다. 잠시 후 다시 시도해 주세요.",
    zh: "Google 仍在加载。请稍后再试。",
  },
  {
    vi: "Đang tải cấu hình đăng nhập LINE. Vui lòng thử lại sau vài giây.",
    en: "LINE login configuration is loading. Please try again in a few seconds.",
    ja: "LINEログイン設定を読み込み中です。数秒後にもう一度お試しください。",
    ko: "LINE 로그인 설정을 불러오는 중입니다. 잠시 후 다시 시도해 주세요.",
    zh: "正在加载 LINE 登录配置。请稍后再试。",
  },
  {
    vi: "Thiếu GOOGLE_CLIENT_ID trên backend hoặc NEXT_PUBLIC_GOOGLE_CLIENT_ID cho đăng nhập Google.",
    en: "GOOGLE_CLIENT_ID on the backend or NEXT_PUBLIC_GOOGLE_CLIENT_ID for Google login is missing.",
    ja: "Googleログイン用のバックエンドGOOGLE_CLIENT_IDまたはNEXT_PUBLIC_GOOGLE_CLIENT_IDが不足しています。",
    ko: "Google 로그인을 위한 백엔드 GOOGLE_CLIENT_ID 또는 NEXT_PUBLIC_GOOGLE_CLIENT_ID가 누락되었습니다.",
    zh: "缺少后端 GOOGLE_CLIENT_ID 或用于 Google 登录的 NEXT_PUBLIC_GOOGLE_CLIENT_ID。",
  },
  {
    vi: "Thiếu cấu hình LINE_CHANNEL_ID, LINE_CHANNEL_SECRET hoặc LINE_CALLBACK_URL trên backend.",
    en: "LINE_CHANNEL_ID, LINE_CHANNEL_SECRET, or LINE_CALLBACK_URL is missing on the backend.",
    ja: "バックエンドにLINE_CHANNEL_ID、LINE_CHANNEL_SECRET、またはLINE_CALLBACK_URLが不足しています。",
    ko: "백엔드에 LINE_CHANNEL_ID, LINE_CHANNEL_SECRET 또는 LINE_CALLBACK_URL이 누락되었습니다.",
    zh: "后端缺少 LINE_CHANNEL_ID、LINE_CHANNEL_SECRET 或 LINE_CALLBACK_URL。",
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
    vi: "SẮP DIỄN RA",
    en: "COMING SOON",
    ja: "近日開催",
    ko: "곧 진행",
    zh: "即将开始",
  },
  {
    vi: "Sắp diễn ra",
    en: "Coming soon",
    ja: "近日開催",
    ko: "곧 진행",
    zh: "即将开始",
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
    vi: "Chưa thể đổi lịch",
    en: "Cannot reschedule yet",
    ja: "まだ予約変更できません",
    ko: "아직 일정 변경이 불가합니다",
    zh: "暂时无法改期",
  },
  {
    vi: "Ngày giờ mới phải khác lịch đặt hiện tại.",
    en: "The new date and time must be different from the current booking.",
    ja: "新しい日時は現在の予約と異なる必要があります。",
    ko: "새 날짜와 시간은 현재 예약과 달라야 합니다.",
    zh: "新的日期和时间必须与当前预约不同。",
  },
  {
    vi: "Xác nhận đặt bàn",
    en: "Confirm table booking",
    ja: "席予約を確認",
    ko: "테이블 예약 확인",
    zh: "确认订桌",
  },
  {
    vi: "Xác nhận đặt",
    en: "Confirm booking",
    ja: "予約を確定",
    ko: "예약 확인",
    zh: "确认预约",
  },
  {
    vi: "Vẫn đặt giờ này",
    en: "Keep this time",
    ja: "この時間で予約",
    ko: "이 시간으로 예약",
    zh: "仍按此时间预约",
  },
  {
    vi: "Đóng thông báo",
    en: "Close notification",
    ja: "通知を閉じる",
    ko: "알림 닫기",
    zh: "关闭通知",
  },
  {
    vi: "Đã hiểu",
    en: "Got it",
    ja: "了解",
    ko: "확인했습니다",
    zh: "知道了",
  },
  {
    vi: "Để sau",
    en: "Later",
    ja: "後で",
    ko: "나중에",
    zh: "稍后",
  },
  {
    vi: "Trang",
    en: "Page",
    ja: "ページ",
    ko: "페이지",
    zh: "页",
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
    vi: "Chưa có banner nổi bật.",
    en: "No featured banner yet.",
    ja: "注目バナーはまだありません。",
    ko: "아직 추천 배너가 없습니다.",
    zh: "暂无精选横幅。",
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
    vi: "WEEKEND DEAL · NIGHTLIFE",
    en: "WEEKEND DEAL · NIGHTLIFE",
    ja: "週末ディール · NIGHTLIFE",
    ko: "주말 특가 · NIGHTLIFE",
    zh: "周末优惠 · NIGHTLIFE",
  },
  {
    vi: "WEEKEND DEAL",
    en: "WEEKEND DEAL",
    ja: "週末ディール",
    ko: "주말 특가",
    zh: "周末优惠",
  },
  {
    vi: "COUPON HOT",
    en: "HOT COUPONS",
    ja: "注目クーポン",
    ko: "인기 쿠폰",
    zh: "热门优惠券",
  },
  {
    vi: "Ưu đãi cuối tuần - giảm đến 30%",
    en: "Weekend deals - up to 30% off",
    ja: "週末特典 - 最大30%オフ",
    ko: "주말 혜택 - 최대 30% 할인",
    zh: "周末优惠 - 最高减 30%",
  },
  {
    vi: "Lưu mã ưu đãi trước khi đặt bàn để không bỏ lỡ deal tốt.",
    en: "Save the offer code before booking so you do not miss a good deal.",
    ja: "お得な特典を逃さないよう、予約前にクーポンコードを保存してください。",
    ko: "좋은 혜택을 놓치지 않도록 예약 전에 쿠폰 코드를 저장하세요.",
    zh: "预订前先保存优惠码，避免错过好优惠。",
  },
  {
    vi: "Nhận mã",
    en: "Get code",
    ja: "コードを受け取る",
    ko: "코드 받기",
    zh: "领取代码",
  },
  {
    vi: "nhận mã",
    en: "Get code",
    ja: "コードを受け取る",
    ko: "코드 받기",
    zh: "领取代码",
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
    vi: "Chưa có dữ liệu",
    en: "No data yet",
    ja: "まだデータがありません",
    ko: "아직 데이터가 없습니다",
    zh: "暂无数据",
  },
  {
    vi: "Chưa có dữ liệu xếp hạng.",
    en: "No ranking data yet.",
    ja: "ランキングデータはまだありません。",
    ko: "아직 랭킹 데이터가 없습니다.",
    zh: "暂无排名数据。",
  },
  {
    vi: "Chưa có banner trang chủ.",
    en: "No homepage banner yet.",
    ja: "ホームページバナーはまだありません。",
    ko: "아직 홈페이지 배너가 없습니다.",
    zh: "暂无首页横幅。",
  },
  {
    vi: "Chưa có quán từ backend.",
    en: "No venues from the backend yet.",
    ja: "バックエンドからの店舗データはまだありません。",
    ko: "아직 백엔드의 매장 데이터가 없습니다.",
    zh: "后台暂无场所数据。",
  },
  {
    vi: "Chưa có ưu đãi đang hoạt động.",
    en: "No active deals yet.",
    ja: "有効な特典はまだありません。",
    ko: "아직 진행 중인 혜택이 없습니다.",
    zh: "暂无进行中的优惠。",
  },
  {
    vi: "Chưa có bài viết/chính sách được xuất bản.",
    en: "No published posts or policies yet.",
    ja: "公開済みの記事またはポリシーはまだありません。",
    ko: "아직 게시된 글이나 정책이 없습니다.",
    zh: "暂无已发布的文章或政策。",
  },
  {
    vi: "Đang tải nội dung",
    en: "Loading content",
    ja: "コンテンツを読み込み中",
    ko: "콘텐츠를 불러오는 중",
    zh: "正在加载内容",
  },
  {
    vi: "Đang tải quán từ API...",
    en: "Loading venues from the API...",
    ja: "APIから店舗を読み込み中...",
    ko: "API에서 매장을 불러오는 중...",
    zh: "正在从 API 加载场所...",
  },
  {
    vi: "Đang tải ưu đãi từ API...",
    en: "Loading deals from the API...",
    ja: "APIから特典を読み込み中...",
    ko: "API에서 혜택을 불러오는 중...",
    zh: "正在从 API 加载优惠...",
  },
  {
    vi: "Đang tải bảng xếp hạng từ API...",
    en: "Loading rankings from the API...",
    ja: "APIからランキングを読み込み中...",
    ko: "API에서 랭킹을 불러오는 중...",
    zh: "正在从 API 加载排名...",
  },
  {
    vi: "Đang tải dịch vụ nổi bật từ API...",
    en: "Loading featured services from the API...",
    ja: "APIから注目サービスを読み込み中...",
    ko: "API에서 추천 서비스를 불러오는 중...",
    zh: "正在从 API 加载精选服务...",
  },
  {
    vi: "Đang tải nội dung CMS...",
    en: "Loading CMS content...",
    ja: "CMSコンテンツを読み込み中...",
    ko: "CMS 콘텐츠를 불러오는 중...",
    zh: "正在加载 CMS 内容...",
  },
  {
    vi: "Đang tải Video Hot từ API...",
    en: "Loading Hot Videos from the API...",
    ja: "APIからHot Videoを読み込み中...",
    ko: "API에서 Hot Video를 불러오는 중...",
    zh: "正在从 API 加载 Hot Video...",
  },
  {
    vi: "Phân trang",
    en: "Pagination",
    ja: "ページネーション",
    ko: "페이지네이션",
    zh: "分页",
  },
  {
    vi: "Phân trang blog",
    en: "Blog pagination",
    ja: "ブログのページネーション",
    ko: "블로그 페이지네이션",
    zh: "博客分页",
  },
  {
    vi: "Phân trang ưu đãi",
    en: "Deal pagination",
    ja: "特典のページネーション",
    ko: "혜택 페이지네이션",
    zh: "优惠分页",
  },
  {
    vi: "Phân trang lịch sử đặt chỗ",
    en: "Reservation history pagination",
    ja: "予約履歴のページネーション",
    ko: "예약 내역 페이지네이션",
    zh: "预订历史分页",
  },
  {
    vi: "Chưa có ảnh",
    en: "No image yet",
    ja: "まだ画像がありません",
    ko: "아직 이미지가 없습니다",
    zh: "暂无图片",
  },
  {
    vi: "Chưa có ảnh cast",
    en: "No Cast image yet",
    ja: "Cast画像はまだありません",
    ko: "아직 Cast 이미지가 없습니다",
    zh: "暂无 Cast 图片",
  },
  {
    vi: "Chưa có ảnh quán",
    en: "No venue image yet",
    ja: "店舗画像はまだありません",
    ko: "아직 매장 이미지가 없습니다",
    zh: "暂无场所图片",
  },
  {
    vi: "Chưa có ảnh tour",
    en: "No tour image yet",
    ja: "ツアー画像はまだありません",
    ko: "아직 투어 이미지가 없습니다",
    zh: "暂无行程图片",
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
    vi: "Địa chỉ",
    en: "Address",
    ja: "住所",
    ko: "주소",
    zh: "地址",
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
    vi: "Mức giảm",
    en: "Discount",
    ja: "割引",
    ko: "할인",
    zh: "折扣",
  },
  {
    vi: "email của bạn",
    en: "your email",
    ja: "登録メール",
    ko: "등록 이메일",
    zh: "你的邮箱",
  },
  {
    vi: "Thông tin đặt chỗ và mã QR đã được gửi về",
    en: "Reservation details and the QR code have been sent to",
    ja: "予約情報とQRコードを送信しました:",
    ko: "예약 정보와 QR 코드가 다음 이메일로 전송되었습니다:",
    zh: "预约信息和二维码已发送至",
  },
  {
    vi: "Vui lòng kiểm tra email trước khi tới quán.",
    en: "Please check your email before going to the venue.",
    ja: "来店前にメールをご確認ください。",
    ko: "매장 방문 전에 이메일을 확인해 주세요.",
    zh: "到店前请查看你的邮箱。",
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
    vi: "Chưa có thời gian",
    en: "No time yet",
    ja: "時間未設定",
    ko: "시간 미정",
    zh: "暂无时间",
  },
  {
    vi: "Trạng thái",
    en: "Status",
    ja: "ステータス",
    ko: "상태",
    zh: "状态",
  },
  {
    vi: "Tóm tắt đặt chỗ",
    en: "Reservation summary",
    ja: "予約概要",
    ko: "예약 요약",
    zh: "预约摘要",
  },
  {
    vi: "Mã QR đặt chỗ",
    en: "Reservation QR",
    ja: "予約QR",
    ko: "예약 QR",
    zh: "预约二维码",
  },
  {
    vi: "Booking vừa tạo không còn trong phiên này. Bạn có thể quay lại lịch sử hoặc đặt lại yêu cầu mới.",
    en: "The newly created reservation is no longer available in this session. You can go back to history or place a new request.",
    ja: "作成した予約はこのセッションで確認できません。履歴に戻るか、新しいリクエストを作成してください。",
    ko: "방금 생성한 예약을 이 세션에서 찾을 수 없습니다. 예약 내역으로 돌아가거나 새 요청을 생성해 주세요.",
    zh: "刚创建的预约已不在本次会话中。您可以返回历史记录或重新提交预约请求。",
  },
  {
    vi: "Booking này đã hủy. NightLife không thu cọc, nên bạn có thể đặt lại khi cần đổi lịch.",
    en: "This reservation was cancelled. NightLife does not take deposits, so you can book again when you need a new time.",
    ja: "この予約はキャンセル済みです。NightLifeではデポジットをいただかないため、日程変更が必要な場合は再予約できます。",
    ko: "이 예약은 취소되었습니다. NightLife는 보증금을 받지 않으므로 일정 변경이 필요하면 다시 예약할 수 있습니다.",
    zh: "此预约已取消。NightLife 不收取订金，如需改期可重新预约。",
  },
  {
    vi: "Admin đã xác nhận với quán. Mã QR giảm giá đã sẵn sàng để dùng khi tới nơi.",
    en: "Admin has confirmed with the venue. Your discount QR is ready to use when you arrive.",
    ja: "管理者が店舗と確認しました。来店時に使える割引QRが準備できています。",
    ko: "관리자가 매장과 확인했습니다. 도착 시 사용할 할인 QR이 준비되었습니다.",
    zh: "管理员已与店铺确认。您的折扣二维码已准备好，到店即可使用。",
  },
  {
    vi: "Yêu cầu đã gửi thành công. Mã QR giảm giá đã sẵn sàng, bạn có thể lưu lại để đưa nhân viên quán quét khi tới nơi.",
    en: "Your request was sent successfully. The discount QR is ready; save it so venue staff can scan it when you arrive.",
    ja: "リクエストを送信しました。割引QRが準備できています。来店時にスタッフへ提示できるよう保存してください。",
    ko: "요청이 성공적으로 전송되었습니다. 할인 QR이 준비되었으니 도착 시 직원이 스캔할 수 있도록 저장해 주세요.",
    zh: "请求已成功发送。折扣二维码已准备好，请保存并在到店时交给店员扫码。",
  },
  {
    vi: "Chưa tìm thấy booking vừa tạo trong phiên này.",
    en: "The newly created reservation was not found in this session.",
    ja: "このセッションで作成した予約が見つかりません。",
    ko: "이 세션에서 생성한 예약을 찾을 수 없습니다.",
    zh: "未在本次会话中找到刚创建的预约。",
  },
  {
    vi: "Đưa mã này cho nhân viên quán quét khi tới nơi. QR được gắn với booking và chỉ dùng một lần.",
    en: "Show this code to venue staff when you arrive. The QR is linked to this reservation and can only be used once.",
    ja: "来店時にこのコードをスタッフへ提示してください。QRはこの予約に紐づき、1回のみ利用できます。",
    ko: "도착 시 이 코드를 매장 직원에게 보여 주세요. QR은 이 예약에 연결되어 있으며 한 번만 사용할 수 있습니다.",
    zh: "到店时请将此码出示给店员扫描。该二维码与本次预约绑定，仅可使用一次。",
  },
  {
    vi: "Mã QR gắn với đúng booking này và dùng một lần tại quán. Nếu cần đổi thông tin, hãy hủy booking cũ và đặt lại.",
    en: "This QR is linked to this exact reservation and is single-use at the venue. To change details, cancel the old reservation and book again.",
    ja: "このQRはこの予約専用で、店舗で1回のみ利用できます。内容を変更する場合は、元の予約をキャンセルして再予約してください。",
    ko: "이 QR은 해당 예약에만 연결되며 매장에서 한 번만 사용할 수 있습니다. 정보를 변경하려면 기존 예약을 취소하고 다시 예약해 주세요.",
    zh: "此二维码仅绑定本次预约，并且到店只可使用一次。如需更改信息，请取消原预约后重新预订。",
  },
  {
    vi: "Không thu cọc. Có thể hủy trước giờ hẹn tối thiểu 1 giờ. Muốn đổi giờ hoặc số người: hủy và đặt lại hoặc liên hệ hỗ trợ.",
    en: "No deposit is charged. You can cancel at least 1 hour before the appointment. To change time or guest count, cancel and rebook or contact support.",
    ja: "デポジットは不要です。予約時間の1時間前までキャンセルできます。時間や人数を変更する場合は、キャンセルして再予約するかサポートへ連絡してください。",
    ko: "보증금은 없습니다. 예약 시간 최소 1시간 전까지 취소할 수 있습니다. 시간이나 인원을 변경하려면 취소 후 다시 예약하거나 지원팀에 문의해 주세요.",
    zh: "无需订金。可在预约时间至少 1 小时前取消。如需更改时间或人数，请取消后重新预订或联系支持。",
  },
  {
    vi: "Liên hệ hỗ trợ",
    en: "Contact support",
    ja: "サポートに連絡",
    ko: "지원 문의",
    zh: "联系支持",
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
    vi: "Không sửa trực tiếp đặt chỗ cũ. Mỗi thay đổi tạo bản ghi mới - hủy trước 1 giờ rồi đặt lại hoặc liên hệ Admin qua Mail.",
    en: "Old reservations are not edited directly. Each change creates a new record. Cancel at least 1 hour before and rebook, or contact Admin by email.",
    ja: "既存予約は直接編集できません。変更ごとに新しい記録を作成します。1時間前までにキャンセルして再予約するか、メールで管理者へ連絡してください。",
    ko: "기존 예약은 직접 수정하지 않습니다. 변경마다 새 기록이 생성됩니다. 1시간 전까지 취소 후 다시 예약하거나 메일로 관리자에게 문의하세요.",
    zh: "旧预约不能直接编辑。每次更改都会创建新记录。请至少提前1小时取消后重新预约，或通过邮件联系管理员。",
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
    vi: "Hỗ trợ",
    en: "Support",
    ja: "サポート",
    ko: "지원",
    zh: "支持",
  },
  {
    vi: "Admin đang điều phối.",
    en: "Admin is coordinating.",
    ja: "管理者が調整中です。",
    ko: "관리자가 조율 중입니다.",
    zh: "管理员正在协调。",
  },
];

const dynamicPhraseEntries: TranslationEntry[] = [
  {
    vi: "Vi vu hôm nay",
    en: "Tonight's picks",
    ja: "今夜のおすすめ",
    ko: "오늘 밤 추천",
    zh: "今晚推荐",
  },
  {
    vi: "Chưa có Video Hot cho khu vực này.",
    en: "No hot videos for this area yet.",
    ja: "このエリアの注目動画はまだありません。",
    ko: "이 지역에는 아직 인기 영상이 없습니다.",
    zh: "该区域暂无热门视频。",
  },
  {
    vi: "Concierge cho một đêm trọn vẹn",
    en: "Concierge for a complete night out",
    ja: "一晩を満喫するコンシェルジュ",
    ko: "완벽한 밤을 위한 컨시어지",
    zh: "整晚无忧的礼宾服务",
  },
  {
    vi: "Xem hướng dẫn",
    en: "View guide",
    ja: "ガイドを見る",
    ko: "가이드 보기",
    zh: "查看指南",
  },
  {
    vi: "Gợi ý bàn đẹp cho nhóm 2-6 người, đặt trước để được ưu tiên.",
    en: "Recommended tables for groups of 2-6; book ahead for priority.",
    ja: "2〜6名のグループにおすすめの席です。優先案内には事前予約を。",
    ko: "2-6명 그룹에 추천하는 좌석입니다. 우선 안내를 원하면 미리 예약하세요.",
    zh: "适合2-6人小组的推荐座位，提前预订可优先安排。",
  },
  {
    vi: "Nhà hàng hot",
    en: "Hot restaurant",
    ja: "注目レストラン",
    ko: "인기 레스토랑",
    zh: "热门餐厅",
  },
  {
    vi: "Ẩm thực đêm",
    en: "Night dining",
    ja: "夜のグルメ",
    ko: "야간 다이닝",
    zh: "夜间美食",
  },
  {
    vi: "Set dinner đêm",
    en: "Night set dinner",
    ja: "夜のセットディナー",
    ko: "나이트 세트 디너",
    zh: "夜间套餐晚餐",
  },
  {
    vi: "Email chưa đúng định dạng.",
    en: "Email format is invalid.",
    ja: "メールアドレスの形式が正しくありません。",
    ko: "이메일 형식이 올바르지 않습니다.",
    zh: "邮箱格式不正确。",
  },
  {
    vi: "Email không được vượt quá 254 ký tự.",
    en: "Email must not exceed 254 characters.",
    ja: "メールアドレスは254文字以内で入力してください。",
    ko: "이메일은 254자를 초과할 수 없습니다.",
    zh: "邮箱不能超过254个字符。",
  },
  {
    vi: "Bạn chưa lấy mã nào. Khám phá Coupon Hot để nhận ưu đãi ngay.",
    en: "You have not claimed any codes yet. Explore Hot Coupons to get deals now.",
    ja: "まだコードを取得していません。注目クーポンを見て特典を受け取りましょう。",
    ko: "아직 받은 코드가 없습니다. 인기 쿠폰을 둘러보고 혜택을 받아보세요.",
    zh: "你还没有领取任何码。立即探索热门优惠券领取优惠。",
  },
  {
    vi: "Blog và cẩm nang nightlife",
    en: "Nightlife blog and guides",
    ja: "ナイトライフブログとガイド",
    ko: "나이트라이프 블로그와 가이드",
    zh: "夜生活博客与指南",
  },
  {
    vi: "Blog và cẩm nang nightlife | Vietyoru",
    en: "Nightlife blog and guides | Vietyoru",
    ja: "ナイトライフブログとガイド | Vietyoru",
    ko: "나이트라이프 블로그와 가이드 | Vietyoru",
    zh: "夜生活博客与指南 | Vietyoru",
  },
  {
    vi: "Coupon & khuyến mãi từ các quán đối tác, dẫn thẳng về trang đặt bàn để nhận QR.",
    en: "Coupons and promotions from partner venues, linked directly to booking pages for QR pickup.",
    ja: "提携店舗のクーポンとキャンペーンを、QR受け取り用の予約ページへ直接案内します。",
    ko: "제휴 매장의 쿠폰과 프로모션을 QR 수령용 예약 페이지로 바로 연결합니다.",
    zh: "合作店铺的优惠券和活动会直接连接到领取 QR 的预订页面。",
  },
  {
    vi: "Tìm quán, khu vực hoặc ưu đãi...",
    en: "Search venues, areas, or deals...",
    ja: "店舗、エリア、特典を検索...",
    ko: "매장, 지역 또는 혜택 검색...",
    zh: "搜索店铺、区域或优惠...",
  },
  {
    vi: "Bộ lọc ưu đãi",
    en: "Deal filters",
    ja: "特典フィルター",
    ko: "혜택 필터",
    zh: "优惠筛选",
  },
  {
    vi: "Đang nổi bật",
    en: "Featured now",
    ja: "注目中",
    ko: "현재 추천",
    zh: "当前精选",
  },
  {
    vi: "Ưu đãi mới",
    en: "New deals",
    ja: "新着特典",
    ko: "새 혜택",
    zh: "新优惠",
  },
  {
    vi: "Các ưu đãi sẽ được cập nhật liên tục theo khu vực.",
    en: "Deals will keep updating by area.",
    ja: "特典はエリアごとに随時更新されます。",
    ko: "혜택은 지역별로 계속 업데이트됩니다.",
    zh: "优惠会按区域持续更新。",
  },
  {
    vi: "Loại ưu đãi",
    en: "Deal type",
    ja: "特典タイプ",
    ko: "혜택 유형",
    zh: "优惠类型",
  },
  {
    vi: "Ưu đãi có thể thay đổi theo tình trạng đặt chỗ. Admin sẽ xác nhận sau khi gửi yêu cầu.",
    en: "Deals may change based on booking availability. Admin will confirm after you send the request.",
    ja: "特典は予約状況により変更される場合があります。リクエスト送信後に管理者が確認します。",
    ko: "혜택은 예약 가능 여부에 따라 변경될 수 있습니다. 요청 후 관리자가 확인합니다.",
    zh: "优惠可能会根据预订情况变化。提交请求后管理员会确认。",
  },
  {
    vi: "Danh sách ưu đãi",
    en: "Deal list",
    ja: "特典一覧",
    ko: "혜택 목록",
    zh: "优惠列表",
  },
  {
    vi: "Đang tải...",
    en: "Loading...",
    ja: "読み込み中...",
    ko: "불러오는 중...",
    zh: "正在加载...",
  },
  {
    vi: "Xóa lọc",
    en: "Clear filters",
    ja: "フィルターをクリア",
    ko: "필터 지우기",
    zh: "清除筛选",
  },
  {
    vi: "Chưa có coupon phù hợp",
    en: "No matching coupons",
    ja: "条件に合うクーポンはありません",
    ko: "조건에 맞는 쿠폰이 없습니다",
    zh: "没有匹配的优惠券",
  },
  {
    vi: "Thử đổi bộ lọc hoặc tìm theo tên quán/khu vực khác.",
    en: "Try changing filters or searching by another venue or area.",
    ja: "フィルターを変更するか、別の店舗名・エリアで検索してください。",
    ko: "필터를 바꾸거나 다른 매장명/지역으로 검색해 보세요.",
    zh: "请尝试更换筛选条件，或按其他店铺/区域搜索。",
  },
  {
    vi: "Xem tất cả ưu đãi",
    en: "View all deals",
    ja: "すべての特典を見る",
    ko: "모든 혜택 보기",
    zh: "查看全部优惠",
  },
  {
    vi: "Danh sách coupon đang có",
    en: "Available coupon list",
    ja: "利用可能なクーポン一覧",
    ko: "사용 가능한 쿠폰 목록",
    zh: "可用优惠券列表",
  },
  {
    vi: "Không giới hạn",
    en: "No limit",
    ja: "期限なし",
    ko: "제한 없음",
    zh: "不限",
  },
  {
    vi: "Đang cập nhật",
    en: "Updating",
    ja: "更新中",
    ko: "업데이트 중",
    zh: "正在更新",
  },
  {
    vi: "Cẩm nang nightlife cho mỗi lần xuống phố",
    en: "Nightlife guides for every night out",
    ja: "夜の外出に役立つナイトライフガイド",
    ko: "외출할 때마다 참고하는 나이트라이프 가이드",
    zh: "每次夜晚出行都可参考的夜生活指南",
  },
  {
    vi: "Gợi ý khu vực, etiquette, ưu đãi và mẹo đặt chỗ để khách có một buổi tối rõ ràng hơn trước khi gửi yêu cầu.",
    en: "Area tips, etiquette, deals, and booking advice so guests know the plan before sending a request.",
    ja: "リクエスト前に夜の流れが分かるよう、エリア情報、マナー、特典、予約のコツを紹介します。",
    ko: "요청을 보내기 전 밤 일정이 선명해지도록 지역 추천, 에티켓, 혜택, 예약 팁을 제공합니다.",
    zh: "提供区域建议、礼仪、优惠和预订技巧，让客人在发送请求前更清楚今晚安排。",
  },
  {
    vi: "Tất cả tag",
    en: "All tags",
    ja: "すべてのタグ",
    ko: "전체 태그",
    zh: "全部标签",
  },
  {
    vi: "Lọc",
    en: "Filter",
    ja: "絞り込む",
    ko: "필터",
    zh: "筛选",
  },
  {
    vi: "Chủ đề blog",
    en: "Blog topics",
    ja: "ブログトピック",
    ko: "블로그 주제",
    zh: "博客主题",
  },
  {
    vi: "Nổi bật",
    en: "Featured",
    ja: "注目",
    ko: "추천",
    zh: "精选",
  },
  {
    vi: "Đọc tiếp",
    en: "Read more",
    ja: "続きを読む",
    ko: "더 읽기",
    zh: "继续阅读",
  },
  {
    vi: "Danh sách bài viết",
    en: "Post list",
    ja: "記事一覧",
    ko: "게시글 목록",
    zh: "文章列表",
  },
  {
    vi: "Chưa có bài viết phù hợp.",
    en: "No matching posts.",
    ja: "条件に合う記事はありません。",
    ko: "조건에 맞는 게시글이 없습니다.",
    zh: "没有匹配的文章。",
  },
  {
    vi: "Bài liên quan",
    en: "Related posts",
    ja: "関連記事",
    ko: "관련 글",
    zh: "相关文章",
  },
  {
    vi: "Giá, tình trạng bàn, cast và ưu đãi trong bài chỉ là tham khảo. Thông tin cuối cùng sẽ được admin xác nhận khi khách gửi yêu cầu đặt chỗ.",
    en: "Prices, table availability, Cast, and deals in this article are for reference only. Final details will be confirmed by Admin when the guest sends a booking request.",
    ja: "記事内の料金、席の空き状況、キャスト、特典は参考情報です。最終情報は、予約リクエスト送信時に管理者が確認します。",
    ko: "글에 있는 가격, 좌석 상황, Cast, 혜택은 참고용입니다. 최종 정보는 고객이 예약 요청을 보낼 때 관리자가 확인합니다.",
    zh: "文章中的价格、座位状态、Cast 和优惠仅供参考。客人提交预订请求后，最终信息将由管理员确认。",
  },
  {
    vi: "Không tìm thấy bài viết",
    en: "Post not found",
    ja: "記事が見つかりません",
    ko: "게시글을 찾을 수 없습니다",
    zh: "未找到文章",
  },
  {
    vi: "Bài viết này chưa tồn tại hoặc đã được gỡ khỏi Vietyoru.",
    en: "This post does not exist yet or has been removed from Vietyoru.",
    ja: "この記事はまだ存在しないか、Vietyoruから削除されています。",
    ko: "이 글은 아직 존재하지 않거나 Vietyoru에서 삭제되었습니다.",
    zh: "这篇文章尚不存在或已从 Vietyoru 移除。",
  },
  {
    vi: "Nháp",
    en: "Draft",
    ja: "下書き",
    ko: "초안",
    zh: "草稿",
  },
  {
    vi: "Không tìm thấy chủ đề blog",
    en: "Blog topic not found",
    ja: "ブログトピックが見つかりません",
    ko: "블로그 주제를 찾을 수 없습니다",
    zh: "未找到博客主题",
  },
  {
    vi: "Chủ đề blog này chưa có trên Vietyoru.",
    en: "This blog topic is not available on Vietyoru yet.",
    ja: "このブログトピックはまだVietyoruにありません。",
    ko: "이 블로그 주제는 아직 Vietyoru에 없습니다.",
    zh: "该博客主题尚未在 Vietyoru 上提供。",
  },
  {
    vi: "Không tìm thấy tag blog",
    en: "Blog tag not found",
    ja: "ブログタグが見つかりません",
    ko: "블로그 태그를 찾을 수 없습니다",
    zh: "未找到博客标签",
  },
  {
    vi: "Tag blog này chưa có trên Vietyoru.",
    en: "This blog tag is not available on Vietyoru yet.",
    ja: "このブログタグはまだVietyoruにありません。",
    ko: "이 블로그 태그는 아직 Vietyoru에 없습니다.",
    zh: "该博客标签尚未在 Vietyoru 上提供。",
  },
  {
    vi: "Các bài viết được nhóm theo chủ đề để khách chọn nhanh nội dung phù hợp trước khi đặt chỗ.",
    en: "Posts are grouped by topic so guests can quickly choose relevant content before booking.",
    ja: "記事はトピック別に整理されているため、予約前に必要な内容をすぐ選べます。",
    ko: "글은 주제별로 정리되어 있어 예약 전 필요한 내용을 빠르게 고를 수 있습니다.",
    zh: "文章按主题分组，方便客人在预订前快速选择合适内容。",
  },
  {
    vi: "Các bài viết được gắn cùng tag để khách tìm nhanh theo nhu cầu đặt chỗ, khu vực hoặc ưu đãi.",
    en: "Posts with the same tag help guests quickly search by booking need, area, or deal.",
    ja: "同じタグの記事から、予約目的、エリア、特典に合わせてすばやく探せます。",
    ko: "같은 태그의 글을 통해 예약 목적, 지역, 혜택별로 빠르게 찾을 수 있습니다.",
    zh: "带有相同标签的文章可帮助客人按预订需求、区域或优惠快速查找。",
  },
  {
    vi: "Cẩm nang",
    en: "Guides",
    ja: "ガイド",
    ko: "가이드",
    zh: "指南",
  },
  {
    vi: "Cẩm nang nightlife",
    en: "Nightlife guides",
    ja: "ナイトライフガイド",
    ko: "나이트라이프 가이드",
    zh: "夜生活指南",
  },
  {
    vi: "Cẩm nang khu vực",
    en: "Area guide",
    ja: "エリアガイド",
    ko: "지역 가이드",
    zh: "区域指南",
  },
  {
    vi: "Văn hóa Nhật",
    en: "Japanese culture",
    ja: "日本文化",
    ko: "일본 문화",
    zh: "日本文化",
  },
  {
    vi: "Mẹo đặt chỗ",
    en: "Booking tips",
    ja: "予約のコツ",
    ko: "예약 팁",
    zh: "预订技巧",
  },
  {
    vi: "Hướng dẫn trọn vẹn một đêm ở Tây Hồ",
    en: "A complete night guide to Tay Ho",
    ja: "タイホーで一晩を楽しむ完全ガイド",
    ko: "떠이호에서의 완벽한 밤 가이드",
    zh: "西湖完整夜晚指南",
  },
  {
    vi: "Văn hóa karaoke Nhật tại Hà Nội",
    en: "Japanese karaoke culture in Hanoi",
    ja: "ハノイの日本式カラオケ文化",
    ko: "하노이의 일본식 가라오케 문화",
    zh: "河内的日式卡拉 OK 文化",
  },
  {
    vi: "5 mẹo đặt bàn nhanh dịp cuối tuần",
    en: "5 tips for faster weekend table booking",
    ja: "週末に素早く席を予約する5つのコツ",
    ko: "주말 테이블을 빠르게 예약하는 5가지 팁",
    zh: "周末快速订桌的 5 个技巧",
  },
  {
    vi: "Bản đồ Quận 1 về đêm cho khách mới",
    en: "District 1 night map for first-time guests",
    ja: "初めての方向け 1区ナイトマップ",
    ko: "처음 방문하는 손님을 위한 1군 밤 지도",
    zh: "新客人的第 1 郡夜生活地图",
  },
  {
    vi: "Cách dùng coupon và tích điểm hiệu quả",
    en: "How to use coupons and earn points effectively",
    ja: "クーポン活用とポイント獲得のコツ",
    ko: "쿠폰 사용과 포인트 적립을 효율적으로 하는 법",
    zh: "如何高效使用优惠券并累计积分",
  },
  {
    vi: "Lộ trình gợi ý cho khách muốn đi lounge, club và ăn khuya ở Tây Hồ, kèm lưu ý đặt chỗ qua Vietyoru.",
    en: "A suggested route for guests who want lounges, clubs, and late-night food in Tay Ho, with booking notes for Vietyoru.",
    ja: "タイホーでラウンジ、クラブ、夜食を楽しみたい方向けのモデルルートと、Vietyoruでの予約ポイントです。",
    ko: "떠이호에서 라운지, 클럽, 야식을 즐기고 싶은 손님을 위한 추천 코스와 Vietyoru 예약 팁입니다.",
    zh: "为想在西湖体验酒廊、俱乐部和夜宵的客人推荐路线，并附上通过 Vietyoru 预订的提示。",
  },
  {
    vi: "Các lưu ý về phòng riêng, etiquette khi đi cùng khách Nhật và cách đặt trước để tránh chờ cuối tuần.",
    en: "Notes on private rooms, etiquette with Japanese guests, and booking ahead to avoid weekend waits.",
    ja: "個室利用、日本人ゲストとのマナー、週末の待ち時間を避ける事前予約のポイントです。",
    ko: "개별룸, 일본 손님과 동행할 때의 에티켓, 주말 대기를 줄이는 사전 예약 팁입니다.",
    zh: "关于包间、与日本客人同行的礼仪，以及提前预订避免周末等待的提示。",
  },
  {
    vi: "Checklist ngắn để đặt bàn nightlife nhanh hơn: chọn khu vực, giờ đến, số khách, yêu cầu phòng và coupon.",
    en: "A short checklist for faster nightlife booking: area, arrival time, guest count, room request, and coupon.",
    ja: "ナイトライフ予約を早く進めるためのチェックリスト: エリア、到着時間、人数、部屋希望、クーポン。",
    ko: "나이트라이프 예약을 빠르게 진행하기 위한 짧은 체크리스트: 지역, 도착 시간, 인원, 룸 요청, 쿠폰.",
    zh: "更快完成夜生活订桌的简短清单：区域、到店时间、人数、房间需求和优惠券。",
  },
  {
    vi: "Gợi ý cách chia một buổi tối ở Quận 1 theo lounge, rooftop bar và điểm ăn khuya gần trung tâm.",
    en: "How to split a night in District 1 across lounges, rooftop bars, and late-night food near the center.",
    ja: "1区でラウンジ、ルーフトップバー、中心部近くの夜食スポットを組み合わせる夜の過ごし方です。",
    ko: "1군에서 라운지, 루프탑 바, 중심지 근처 야식 코스로 밤을 나누는 방법입니다.",
    zh: "如何在第 1 郡安排酒廊、屋顶酒吧和市中心附近夜宵的一晚。",
  },
  {
    vi: "Tóm tắt cách xem ưu đãi, dùng mã hợp lệ và tích điểm thành viên sau khi hóa đơn được duyệt.",
    en: "A quick guide to viewing deals, using valid codes, and earning member points after bill approval.",
    ja: "特典の確認、有効なコードの利用、請求書承認後の会員ポイント獲得をまとめたガイドです。",
    ko: "혜택 확인, 유효 코드 사용, 청구서 승인 후 멤버십 포인트 적립 방법을 요약했습니다.",
    zh: "简要说明如何查看优惠、使用有效码，并在账单通过后累计会员积分。",
  },
  {
    vi: "Đội ngũ Vietyoru",
    en: "Vietyoru team",
    ja: "Vietyoruチーム",
    ko: "Vietyoru 팀",
    zh: "Vietyoru 团队",
  },
  {
    vi: "Đặt chỗ",
    en: "Booking",
    ja: "予約",
    ko: "예약",
    zh: "预订",
  },
  {
    vi: "Cuối tuần",
    en: "Weekend",
    ja: "週末",
    ko: "주말",
    zh: "周末",
  },
  {
    vi: "Rooftop",
    en: "Rooftop",
    ja: "ルーフトップ",
    ko: "루프탑",
    zh: "屋顶",
  },
  {
    vi: "Phòng VIP",
    en: "VIP room",
    ja: "VIPルーム",
    ko: "VIP 룸",
    zh: "VIP 包间",
  },
  {
    vi: "DJ hàng đầu",
    en: "Top DJ",
    ja: "トップDJ",
    ko: "톱 DJ",
    zh: "顶级 DJ",
  },
  {
    vi: "Nhạc hay",
    en: "Great music",
    ja: "音楽が良い",
    ko: "좋은 음악",
    zh: "音乐出色",
  },
  {
    vi: "Không gian đẹp",
    en: "Beautiful space",
    ja: "雰囲気の良い空間",
    ko: "아름다운 공간",
    zh: "空间精致",
  },
  {
    vi: "Cocktail",
    en: "Cocktail",
    ja: "カクテル",
    ko: "칵테일",
    zh: "鸡尾酒",
  },
  {
    vi: "Sang trọng",
    en: "Luxury",
    ja: "ラグジュアリー",
    ko: "럭셔리",
    zh: "奢华",
  },
  {
    vi: "Sôi động",
    en: "Lively",
    ja: "賑やか",
    ko: "활기찬",
    zh: "热闹",
  },
  {
    vi: "Điểm thành viên",
    en: "Member points",
    ja: "会員ポイント",
    ko: "멤버십 포인트",
    zh: "会员积分",
  },
  {
    vi: "Cast này không tồn tại hoặc chưa được công khai trên Vietyoru.",
    en: "This Cast does not exist or is not public on Vietyoru yet.",
    ja: "このキャストは存在しないか、まだVietyoruで公開されていません。",
    ko: "이 Cast는 존재하지 않거나 아직 Vietyoru에 공개되지 않았습니다.",
    zh: "该 Cast 不存在或尚未在 Vietyoru 公开。",
  },
  {
    vi: "Cast này không tồn tại, chưa active hoặc chưa được duyệt public qua CMS.",
    en: "This Cast does not exist, is not active, or has not been approved for public CMS display.",
    ja: "このキャストは存在しない、アクティブでない、またはCMSで公開承認されていません。",
    ko: "이 Cast는 존재하지 않거나 활성 상태가 아니며 CMS 공개 승인이 완료되지 않았습니다.",
    zh: "该 Cast 不存在、未启用，或尚未通过 CMS 公开审核。",
  },
  {
    vi: "Coupon đã lưu",
    en: "Saved coupons",
    ja: "保存済みクーポン",
    ko: "저장한 쿠폰",
    zh: "已保存优惠券",
  },
  {
    vi: "Email đã lưu",
    en: "Saved email",
    ja: "保存済みメール",
    ko: "저장된 이메일",
    zh: "已保存邮箱",
  },
  {
    vi: "Đặt bàn VIP",
    en: "Book a VIP table",
    ja: "VIP席を予約",
    ko: "VIP 테이블 예약",
    zh: "预订 VIP 桌",
  },
  {
    vi: "Ưu đãi VIP",
    en: "VIP deals",
    ja: "VIP特典",
    ko: "VIP 혜택",
    zh: "VIP 优惠",
  },
  {
    vi: "Karaoke/KTV",
    en: "Karaoke/KTV",
    ja: "カラオケ/KTV",
    ko: "노래방/KTV",
    zh: "卡拉OK/KTV",
  },
  {
    vi: "Massage/Spa",
    en: "Massage/Spa",
    ja: "マッサージ/スパ",
    ko: "마사지/스파",
    zh: "按摩/水疗",
  },
  {
    vi: "Dạ chào anh, Vietyoru Hỗ trợ có thể giúp gì cho anh ạ?",
    en: "Hello, Vietyoru Support here. How can we help you?",
    ja: "こんにちは、Vietyoruサポートです。どのようにお手伝いできますか？",
    ko: "안녕하세요, Vietyoru 지원팀입니다. 무엇을 도와드릴까요?",
    zh: "您好，这里是 Vietyoru 支持。有什么可以帮您？",
  },
  {
    vi: "Mình muốn hỏi về đặt bàn tối nay ở Sakura Lounge",
    en: "I want to ask about booking a table tonight at Sakura Lounge.",
    ja: "今夜Sakura Loungeで席を予約したいです。",
    ko: "오늘 밤 Sakura Lounge 테이블 예약에 대해 문의하고 싶어요.",
    zh: "我想咨询今晚在 Sakura Lounge 订桌。",
  },
  {
    vi: "Dạ anh đi mấy người và khoảng mấy giờ để em kiểm tra bàn trống giúp anh ạ?",
    en: "How many guests and what time should we check availability for?",
    ja: "人数とご希望時間を教えてください。空席を確認します。",
    ko: "몇 분이 몇 시쯤 방문하시는지 알려주시면 빈자리를 확인해드릴게요.",
    zh: "请问几位、几点左右到店？我帮您确认空位。",
  },
  {
    vi: "4 người, khoảng 21:00 nhé",
    en: "4 guests, around 21:00 please.",
    ja: "4名で、21:00頃お願いします。",
    ko: "4명, 21:00쯤 부탁해요.",
    zh: "4位，大约21:00。",
  },
  {
    vi: "Sakura Lounge vẫn còn bàn khung 21:00 cho 4 khách ạ. Em giữ chỗ trước cho anh nhé?",
    en: "Sakura Lounge still has a 21:00 table for 4 guests. Shall we hold it for you?",
    ja: "Sakura Loungeは21:00に4名席がまだあります。仮押さえしましょうか？",
    ko: "Sakura Lounge는 21:00에 4명 좌석이 아직 있습니다. 먼저 잡아드릴까요?",
    zh: "Sakura Lounge 21:00 还有4人桌。需要先为您保留吗？",
  },
  {
    vi: "Vâng bạn giữ giúp mình",
    en: "Yes, please hold it for me.",
    ja: "はい、お願いします。",
    ko: "네, 잡아주세요.",
    zh: "好的，请帮我保留。",
  },
  {
    vi: "Em đã giữ chỗ cho anh. Anh vào mục Đặt chỗ xác nhận trong 15 phút giúp em là xong ạ. Cảm ơn anh!",
    en: "We have held the spot for you. Please confirm it in Reservations within 15 minutes. Thank you!",
    ja: "お席を仮押さえしました。15分以内に予約画面で確定してください。ありがとうございます！",
    ko: "좌석을 잡아두었습니다. 15분 안에 예약 메뉴에서 확정해주시면 됩니다. 감사합니다!",
    zh: "已为您保留座位。请在15分钟内到“预订”确认。谢谢！",
  },
  {
    vi: "Store gallery lightbox",
    en: "Store gallery lightbox",
    ja: "店舗ギャラリーの拡大表示",
    ko: "매장 갤러리 확대 보기",
    zh: "店铺图库放大查看",
  },
  {
    vi: "Thông báo",
    en: "Notifications",
    ja: "通知",
    ko: "알림",
    zh: "通知",
  },
  {
    vi: "Đánh dấu tất cả đã đọc",
    en: "Mark all as read",
    ja: "すべて既読にする",
    ko: "모두 읽음으로 표시",
    zh: "全部标为已读",
  },
  {
    vi: "Đánh dấu đã đọc",
    en: "Mark as read",
    ja: "既読にする",
    ko: "읽음으로 표시",
    zh: "标为已读",
  },
  {
    vi: "HÔM NAY",
    en: "TODAY",
    ja: "今日",
    ko: "오늘",
    zh: "今天",
  },
  {
    vi: "Hôm nay",
    en: "Today",
    ja: "今日",
    ko: "오늘",
    zh: "今天",
  },
  {
    vi: "Trước đó",
    en: "Earlier",
    ja: "以前",
    ko: "이전",
    zh: "此前",
  },
  {
    vi: "Hóa đơn",
    en: "Bills",
    ja: "請求書",
    ko: "영수증",
    zh: "账单",
  },
  {
    vi: "Đặt chỗ",
    en: "Reservations",
    ja: "予約",
    ko: "예약",
    zh: "预订",
  },
  {
    vi: "Hệ thống",
    en: "System",
    ja: "システム",
    ko: "시스템",
    zh: "系统",
  },
  {
    vi: "Xem lịch đặt",
    en: "View reservations",
    ja: "予約を見る",
    ko: "예약 보기",
    zh: "查看预订",
  },
  {
    vi: "Xem hóa đơn",
    en: "View bill",
    ja: "請求書を見る",
    ko: "영수증 보기",
    zh: "查看账单",
  },
  {
    vi: "Xem hóa đơn của tôi",
    en: "View my bills",
    ja: "自分の請求書を見る",
    ko: "내 영수증 보기",
    zh: "查看我的账单",
  },
  {
    vi: "Xem kết quả",
    en: "View result",
    ja: "結果を見る",
    ko: "결과 보기",
    zh: "查看结果",
  },
  {
    vi: "Xem lý do",
    en: "View reason",
    ja: "理由を見る",
    ko: "사유 보기",
    zh: "查看原因",
  },
  {
    vi: "Xem lịch mới",
    en: "View new reservation",
    ja: "新しい予約を見る",
    ko: "새 예약 보기",
    zh: "查看新预约",
  },
  {
    vi: "Đã gửi hóa đơn",
    en: "Bill submitted",
    ja: "請求書を送信しました",
    ko: "영수증을 보냈습니다",
    zh: "账单已提交",
  },
  {
    vi: "Hóa đơn đã được duyệt",
    en: "Bill approved",
    ja: "請求書が承認されました",
    ko: "영수증이 승인되었습니다",
    zh: "账单已通过",
  },
  {
    vi: "Hóa đơn bị từ chối",
    en: "Bill rejected",
    ja: "請求書が却下されました",
    ko: "영수증이 거절되었습니다",
    zh: "账单被拒绝",
  },
  {
    vi: "Đặt bàn thành công",
    en: "Reservation request sent",
    ja: "予約リクエストを送信しました",
    ko: "예약 요청을 보냈습니다",
    zh: "预约请求已发送",
  },
  {
    vi: "Đặt tour thành công",
    en: "Tour reservation request sent",
    ja: "ツアー予約リクエストを送信しました",
    ko: "투어 예약 요청을 보냈습니다",
    zh: "行程预订请求已发送",
  },
  {
    vi: "Đặt bàn theo cast thành công",
    en: "Cast reservation request sent",
    ja: "キャスト指名予約を送信しました",
    ko: "캐스트 예약 요청을 보냈습니다",
    zh: "Cast 预约请求已发送",
  },
  {
    vi: "Lịch đặt đã được đổi",
    en: "Reservation rescheduled",
    ja: "予約日時を変更しました",
    ko: "예약 일정이 변경되었습니다",
    zh: "预约已改期",
  },
  {
    vi: "Yêu cầu đổi lịch chưa được duyệt",
    en: "Reschedule request was not approved",
    ja: "予約変更リクエストは承認されていません",
    ko: "예약 변경 요청이 승인되지 않았습니다",
    zh: "改期请求未获批准",
  },
  {
    vi: "Lịch đặt đã hủy",
    en: "Reservation cancelled",
    ja: "予約をキャンセルしました",
    ko: "예약이 취소되었습니다",
    zh: "预约已取消",
  },
  {
    vi: "Đã check-in lịch đặt",
    en: "Reservation checked in",
    ja: "予約のチェックインが完了しました",
    ko: "예약 체크인이 완료되었습니다",
    zh: "预约已签到",
  },
  {
    vi: "Lịch đặt đã hoàn tất",
    en: "Reservation completed",
    ja: "予約が完了しました",
    ko: "예약이 완료되었습니다",
    zh: "预约已完成",
  },
  {
    vi: "Thông báo chưa đọc",
    en: "Unread notifications",
    ja: "未読通知",
    ko: "읽지 않은 알림",
    zh: "未读通知",
  },
  {
    vi: "Cài đặt",
    en: "Settings",
    ja: "設定",
    ko: "설정",
    zh: "设置",
  },
  {
    vi: "Cài đặt thông báo",
    en: "Notification settings",
    ja: "通知設定",
    ko: "알림 설정",
    zh: "通知设置",
  },
  {
    vi: "Đang tải thông báo...",
    en: "Loading notifications...",
    ja: "通知を読み込み中...",
    ko: "알림을 불러오는 중...",
    zh: "正在加载通知...",
  },
  {
    vi: "Chưa có thông báo mới. Khi Admin duyệt hóa đơn, kết quả sẽ hiện ở đây.",
    en: "No new notifications. Results will appear here when Admin reviews a bill.",
    ja: "新しい通知はありません。管理者が請求書を確認すると、結果がここに表示されます。",
    ko: "새 알림이 없습니다. 관리자가 영수증을 검토하면 결과가 여기에 표시됩니다.",
    zh: "暂无新通知。管理员审核账单后，结果会显示在这里。",
  },
  {
    vi: "Hôm qua",
    en: "Yesterday",
    ja: "昨日",
    ko: "어제",
    zh: "昨天",
  },
  {
    vi: "Đăng ký đối tác",
    en: "Partner signup",
    ja: "パートナー登録",
    ko: "파트너 등록",
    zh: "合作伙伴注册",
  },
  {
    vi: "Chính sách hoạt động",
    en: "Operating policy",
    ja: "運営ポリシー",
    ko: "운영 정책",
    zh: "运营政策",
  },
  {
    vi: "Tour",
    en: "Tour",
    ja: "ツアー",
    ko: "투어",
    zh: "行程",
  },
  {
    vi: "© 2026 Vietyoru. Bảo lưu mọi quyền.",
    en: "© 2026 Vietyoru. All rights reserved.",
    ja: "© 2026 Vietyoru. 無断転載を禁じます。",
    ko: "© 2026 Vietyoru. 모든 권리 보유.",
    zh: "© 2026 Vietyoru. 保留所有权利。",
  },
  {
    vi: "18+ · Giá và tình trạng đặt chỗ được xác nhận lại bởi admin.",
    en: "18+ · Prices and reservation availability are reconfirmed by admin.",
    ja: "18+ · 料金と予約状況は管理者が再確認します。",
    ko: "18+ · 가격과 예약 가능 여부는 관리자가 다시 확인합니다.",
    zh: "18+ · 价格和预订状态由管理员再次确认。",
  },
  {
    vi: "Sân khấu DJ",
    en: "DJ stage",
    ja: "DJステージ",
    ko: "DJ 스테이지",
    zh: "DJ 舞台",
  },
  {
    vi: "Mở muộn",
    en: "Late opening",
    ja: "深夜営業",
    ko: "늦게까지 영업",
    zh: "营业至深夜",
  },
  {
    vi: "Gói đôi",
    en: "Couple package",
    ja: "ペアプラン",
    ko: "커플 패키지",
    zh: "双人套餐",
  },
  {
    vi: "Set Nhật",
    en: "Japanese set",
    ja: "日本セット",
    ko: "일본식 세트",
    zh: "日式套餐",
  },
  {
    vi: "Set Nhật Bản",
    en: "Japanese set",
    ja: "日本セット",
    ko: "일본식 세트",
    zh: "日式套餐",
  },
  {
    vi: "Pháp lý và chính sách vận hành",
    en: "Legal and operating policies",
    ja: "法務と運営ポリシー",
    ko: "법률 및 운영 정책",
    zh: "法律与运营政策",
  },
  {
    vi: "Bản nháp placeholder. Nội dung pháp lý cuối cùng cần được khách hàng cung cấp và rà soát trước khi phát hành chính thức.",
    en: "Placeholder draft. Final legal content must be provided by the client and reviewed before official publication.",
    ja: "仮のプレースホルダーです。正式公開前に、最終的な法務内容をクライアントから提供いただき、確認する必要があります。",
    ko: "임시 초안입니다. 최종 법률 콘텐츠는 정식 공개 전에 고객이 제공하고 검토해야 합니다.",
    zh: "占位草稿。最终法律内容需由客户提供，并在正式发布前完成审核。",
  },
  {
    vi: "Tóm tắt placeholder",
    en: "Placeholder summary",
    ja: "プレースホルダー概要",
    ko: "플레이스홀더 요약",
    zh: "占位摘要",
  },
  {
    vi: "Placeholder về cách Vietyoru thu thập, sử dụng và bảo vệ dữ liệu người dùng trong quá trình đặt chỗ.",
    en: "Placeholder for how Vietyoru collects, uses, and protects user data during reservations.",
    ja: "予約プロセスでVietyoruがユーザーデータを収集、利用、保護する方法に関するプレースホルダーです。",
    ko: "예약 과정에서 Vietyoru가 사용자 데이터를 수집, 사용, 보호하는 방식에 대한 플레이스홀더입니다.",
    zh: "关于 Vietyoru 在预订过程中如何收集、使用和保护用户数据的占位说明。",
  },
  {
    vi: "Placeholder về điều kiện sử dụng nền tảng, giới hạn trách nhiệm và quy tắc đặt chỗ qua Vietyoru.",
    en: "Placeholder for platform terms, liability limits, and reservation rules through Vietyoru.",
    ja: "Vietyoruでのプラットフォーム利用条件、責任範囲、予約ルールに関するプレースホルダーです。",
    ko: "Vietyoru를 통한 플랫폼 이용 조건, 책임 한도, 예약 규칙에 대한 플레이스홀더입니다.",
    zh: "关于 Vietyoru 平台使用条件、责任限制和预订规则的占位说明。",
  },
  {
    vi: "Placeholder về cách Vietyoru điều phối đặt chỗ, xử lý ưu đãi, tích điểm và hỗ trợ sau trải nghiệm.",
    en: "Placeholder for how Vietyoru coordinates reservations, handles deals, awards points, and supports guests after the experience.",
    ja: "Vietyoruが予約調整、特典処理、ポイント付与、体験後サポートを行う方法に関するプレースホルダーです。",
    ko: "Vietyoru가 예약을 조율하고, 혜택을 처리하며, 포인트를 적립하고, 이용 후 지원하는 방식에 대한 플레이스홀더입니다.",
    zh: "关于 Vietyoru 如何协调预订、处理优惠、累积积分并提供体验后支持的占位说明。",
  },
  {
    vi: "Thông tin có thể thu thập",
    en: "Information that may be collected",
    ja: "収集される可能性のある情報",
    ko: "수집될 수 있는 정보",
    zh: "可能收集的信息",
  },
  {
    vi: "Tên, số điện thoại, thông tin đặt chỗ, lịch sử dùng ưu đãi và dữ liệu tài khoản cần thiết để vận hành dịch vụ.",
    en: "Name, phone number, reservation information, deal usage history, and account data needed to operate the service.",
    ja: "サービス運営に必要な氏名、電話番号、予約情報、特典利用履歴、アカウントデータ。",
    ko: "서비스 운영에 필요한 이름, 전화번호, 예약 정보, 혜택 사용 이력 및 계정 데이터입니다.",
    zh: "运营服务所需的姓名、电话号码、预订信息、优惠使用记录和账户数据。",
  },
  {
    vi: "Mục đích sử dụng",
    en: "Purpose of use",
    ja: "利用目的",
    ko: "이용 목적",
    zh: "使用目的",
  },
  {
    vi: "Dữ liệu được dùng để xác nhận đặt chỗ, điều phối với quán, chăm sóc khách hàng, tích điểm và phòng chống lạm dụng ưu đãi.",
    en: "Data is used to confirm reservations, coordinate with venues, support customers, award points, and prevent deal abuse.",
    ja: "データは予約確認、店舗との調整、カスタマーサポート、ポイント付与、特典の不正利用防止に使用されます。",
    ko: "데이터는 예약 확인, 매장 조율, 고객 지원, 포인트 적립 및 혜택 남용 방지에 사용됩니다.",
    zh: "数据用于确认预订、与店铺协调、客户服务、积分累计以及防止优惠滥用。",
  },
  {
    vi: "Quyền của người dùng",
    en: "User rights",
    ja: "ユーザーの権利",
    ko: "사용자 권리",
    zh: "用户权利",
  },
  {
    vi: "Người dùng có thể yêu cầu cập nhật hoặc xóa thông tin theo kênh liên hệ chính thức sau khi khách hàng cung cấp quy trình pháp lý cuối cùng.",
    en: "Users may request updates or deletion through official contact channels after the client provides the final legal process.",
    ja: "クライアントが最終的な法務手続きを提供した後、ユーザーは公式連絡窓口を通じて情報の更新または削除をリクエストできます。",
    ko: "고객이 최종 법적 절차를 제공한 후 사용자는 공식 연락 채널을 통해 정보 수정 또는 삭제를 요청할 수 있습니다.",
    zh: "客户提供最终法律流程后，用户可通过官方联系渠道请求更新或删除信息。",
  },
  {
    vi: "Điều kiện sử dụng",
    en: "Usage conditions",
    ja: "利用条件",
    ko: "이용 조건",
    zh: "使用条件",
  },
  {
    vi: "Dịch vụ dành cho người dùng đủ điều kiện theo quy định pháp luật Việt Nam. Người dùng cần cung cấp thông tin chính xác khi đặt chỗ.",
    en: "The service is for users who meet Vietnamese legal requirements. Users must provide accurate information when reserving.",
    ja: "本サービスはベトナム法令の要件を満たすユーザー向けです。予約時には正確な情報を提供する必要があります。",
    ko: "본 서비스는 베트남 법률 요건을 충족하는 사용자를 위한 것입니다. 예약 시 정확한 정보를 제공해야 합니다.",
    zh: "本服务面向符合越南法律要求的用户。用户预订时需提供准确信息。",
  },
  {
    vi: "Giá và xác nhận",
    en: "Pricing and confirmation",
    ja: "料金と確認",
    ko: "가격 및 확인",
    zh: "价格与确认",
  },
  {
    vi: "Giá, tình trạng bàn, cast và ưu đãi hiển thị chỉ mang tính tham khảo cho đến khi admin xác nhận với quán.",
    en: "Displayed prices, table availability, cast availability, and deals are references until admin confirms them with the venue.",
    ja: "表示される料金、席状況、キャスト、特典は、管理者が店舗に確認するまで参考情報です。",
    ko: "표시된 가격, 좌석 상태, 캐스트 및 혜택은 관리자가 매장에 확인하기 전까지 참고용입니다.",
    zh: "显示的价格、座位状态、Cast 和优惠在管理员与店铺确认前仅供参考。",
  },
  {
    vi: "Tài khoản và hành vi",
    en: "Account and conduct",
    ja: "アカウントと行動",
    ko: "계정 및 이용 행위",
    zh: "账户与行为",
  },
  {
    vi: "Tài khoản có dấu hiệu spam, lạm dụng mã ưu đãi hoặc cung cấp thông tin sai có thể bị tạm khóa theo quy trình chính thức.",
    en: "Accounts showing spam, deal abuse, or inaccurate information may be temporarily locked under the official process.",
    ja: "スパム、特典の不正利用、虚偽情報の提供が疑われるアカウントは、正式な手続きにより一時停止される場合があります。",
    ko: "스팸, 혜택 남용 또는 부정확한 정보 제공이 의심되는 계정은 공식 절차에 따라 일시 정지될 수 있습니다.",
    zh: "存在垃圾行为、优惠滥用或提供错误信息的账户，可能会按正式流程被暂时锁定。",
  },
  {
    vi: "Điều phối đặt chỗ",
    en: "Reservation coordination",
    ja: "予約調整",
    ko: "예약 조율",
    zh: "预订协调",
  },
  {
    vi: "Yêu cầu đặt chỗ được admin tiếp nhận và xác nhận với quán. Vietyoru không thu cọc hay thanh toán online nếu chưa có thông báo chính thức.",
    en: "Reservation requests are received by admin and confirmed with the venue. Vietyoru does not collect deposits or online payments unless officially announced.",
    ja: "予約リクエストは管理者が受け付け、店舗に確認します。正式な案内がない限り、Vietyoruはデポジットやオンライン決済を受け付けません。",
    ko: "예약 요청은 관리자가 접수하고 매장과 확인합니다. 공식 안내가 없는 한 Vietyoru는 보증금이나 온라인 결제를 받지 않습니다.",
    zh: "预订请求由管理员接收并与店铺确认。除非正式通知，Vietyoru 不收取押金或线上付款。",
  },
  {
    vi: "Ưu đãi và tích điểm",
    en: "Deals and points",
    ja: "特典とポイント",
    ko: "혜택 및 포인트",
    zh: "优惠与积分",
  },
  {
    vi: "Coupon áp dụng theo điều kiện từng chương trình. Điểm thành viên được cộng sau khi hóa đơn hợp lệ được duyệt.",
    en: "Coupons apply according to each program's conditions. Member points are added after a valid bill is approved.",
    ja: "クーポンは各プログラムの条件に従って適用されます。会員ポイントは有効な請求書が承認された後に付与されます。",
    ko: "쿠폰은 각 프로그램 조건에 따라 적용됩니다. 회원 포인트는 유효한 영수증이 승인된 후 적립됩니다.",
    zh: "优惠券按各活动条件适用。有效账单通过审核后会增加会员积分。",
  },
  {
    vi: "Hỗ trợ sau đặt chỗ",
    en: "Post-reservation support",
    ja: "予約後サポート",
    ko: "예약 후 지원",
    zh: "预订后支持",
  },
  {
    vi: "Khi có thay đổi lịch hoặc phản hồi dịch vụ, người dùng liên hệ admin để được điều phối theo quy trình vận hành đã công bố.",
    en: "For schedule changes or service feedback, users contact admin for coordination under the published operating process.",
    ja: "日時変更やサービスに関するフィードバックがある場合、ユーザーは公開済みの運営手順に従って管理者に連絡します。",
    ko: "일정 변경이나 서비스 피드백이 있는 경우 사용자는 공개된 운영 절차에 따라 관리자에게 연락해 조율받습니다.",
    zh: "如需变更日程或反馈服务，用户可联系管理员按已公布的运营流程协调处理。",
  },
  {
    vi: "Email hoặc mật khẩu không đúng.",
    en: "Email or password is incorrect.",
    ja: "メールアドレスまたはパスワードが正しくありません。",
    ko: "이메일 또는 비밀번호가 올바르지 않습니다.",
    zh: "邮箱或密码不正确。",
  },
  {
    vi: "Thứ 2",
    en: "Mon",
    ja: "月",
    ko: "월",
    zh: "周一",
  },
  {
    vi: "Thứ 3",
    en: "Tue",
    ja: "火",
    ko: "화",
    zh: "周二",
  },
  {
    vi: "Thứ 4",
    en: "Wed",
    ja: "水",
    ko: "수",
    zh: "周三",
  },
  {
    vi: "Thứ 5",
    en: "Thu",
    ja: "木",
    ko: "목",
    zh: "周四",
  },
  {
    vi: "Thứ 6",
    en: "Fri",
    ja: "金",
    ko: "금",
    zh: "周五",
  },
  {
    vi: "Thứ 7",
    en: "Sat",
    ja: "土",
    ko: "토",
    zh: "周六",
  },
  {
    vi: "CN",
    en: "Sun",
    ja: "日",
    ko: "일",
    zh: "周日",
  },
  {
    vi: "Quán tương tự",
    en: "Similar venues",
    ja: "似ている店舗",
    ko: "비슷한 매장",
    zh: "相似店铺",
  },
  {
    vi: "Xem thêm",
    en: "See more",
    ja: "もっと見る",
    ko: "더 보기",
    zh: "查看更多",
  },
  {
    vi: "Gợi ý cùng khu vực",
    en: "Recommended in the same area",
    ja: "同じエリアのおすすめ",
    ko: "같은 지역 추천",
    zh: "同区域推荐",
  },
  {
    vi: "Gợi ý cùng loại hình",
    en: "Recommended by category",
    ja: "同じジャンルのおすすめ",
    ko: "같은 유형 추천",
    zh: "同类型推荐",
  },
  {
    vi: "Gợi ý tương tự",
    en: "Similar recommendation",
    ja: "類似のおすすめ",
    ko: "비슷한 추천",
    zh: "相似推荐",
  },
  {
    vi: "Đã quá giờ",
    en: "Expired",
    ja: "期限切れ",
    ko: "시간 지남",
    zh: "已过期",
  },
  {
    vi: "Đã qua giờ",
    en: "Expired",
    ja: "期限切れ",
    ko: "시간 지남",
    zh: "已过期",
  },
  {
    vi: "Đã qua giờ đặt, bạn có thể đặt lại nếu cần.",
    en: "The reservation time has passed. You can book again if needed.",
    ja: "予約時間が過ぎました。必要に応じて再予約できます。",
    ko: "예약 시간이 지났습니다. 필요하면 다시 예약할 수 있습니다.",
    zh: "预约时间已过。如有需要，可以重新预订。",
  },
  {
    vi: "Hoàn tất · gắn điểm/hoá đơn khi đối soát",
    en: "Completed · points/bill linked after reconciliation",
    ja: "完了 · 照合後にポイント/請求書を紐付け",
    ko: "완료 · 정산 후 포인트/영수증 연결",
    zh: "已完成 · 对账后关联积分/账单",
  },
  {
    vi: "Đã hủy trước giờ hẹn · không thu cọc",
    en: "Cancelled before the reservation time · no deposit charged",
    ja: "予約時間前にキャンセル済み · デポジットなし",
    ko: "예약 시간 전에 취소됨 · 보증금 없음",
    zh: "已在预约时间前取消 · 不收押金",
  },
  {
    vi: "Trước",
    en: "Previous",
    ja: "前へ",
    ko: "이전",
    zh: "上一页",
  },
  {
    vi: "Sau",
    en: "Next",
    ja: "次へ",
    ko: "다음",
    zh: "下一页",
  },
  {
    vi: "Chưa có dịch vụ nổi bật phù hợp.",
    en: "No matching featured services yet.",
    ja: "該当する注目サービスはまだありません。",
    ko: "조건에 맞는 추천 서비스가 아직 없습니다.",
    zh: "暂无匹配的精选服务。",
  },
  {
    vi: "Giữ bàn VIP sớm, nhận xác nhận nhanh từ admin...",
    en: "Reserve a VIP table early and get quick confirmation from admin...",
    ja: "VIP席を早めに確保し、管理者からすばやく確認を受け取れます...",
    ko: "VIP 테이블을 미리 잡고 관리자에게 빠르게 확인받으세요...",
    zh: "提前保留 VIP 桌，快速获得管理员确认...",
  },
  {
    vi: "Banner nổi bật",
    en: "Featured banner",
    ja: "注目バナー",
    ko: "추천 배너",
    zh: "精选横幅",
  },
  {
    vi: "Vietyoru Hỗ trợ",
    en: "Vietyoru Support",
    ja: "Vietyoruサポート",
    ko: "Vietyoru 지원",
    zh: "Vietyoru 支持",
  },
  {
    vi: "Chăm sóc khách hàng",
    en: "Customer care",
    ja: "カスタマーサポート",
    ko: "고객 지원",
    zh: "客户服务",
  },
  {
    vi: "Đang tải lịch sử...",
    en: "Loading history...",
    ja: "履歴を読み込み中...",
    ko: "기록을 불러오는 중...",
    zh: "正在加载历史...",
  },
  {
    vi: "Nhập tin nhắn...",
    en: "Type a message...",
    ja: "メッセージを入力...",
    ko: "메시지를 입력하세요...",
    zh: "输入消息...",
  },
  {
    vi: "Nhập tin nhắn hỗ trợ",
    en: "Type a support message",
    ja: "サポートへのメッセージを入力",
    ko: "지원 메시지 입력",
    zh: "输入支持消息",
  },
  {
    vi: "Gửi tin nhắn",
    en: "Send message",
    ja: "メッセージを送信",
    ko: "메시지 보내기",
    zh: "发送消息",
  },
  {
    vi: "Thu nhỏ chat hỗ trợ",
    en: "Minimize support chat",
    ja: "サポートチャットを最小化",
    ko: "지원 채팅 최소화",
    zh: "最小化支持聊天",
  },
  {
    vi: "Đóng chat hỗ trợ",
    en: "Close support chat",
    ja: "サポートチャットを閉じる",
    ko: "지원 채팅 닫기",
    zh: "关闭支持聊天",
  },
  {
    vi: "Mở chat hỗ trợ",
    en: "Open support chat",
    ja: "サポートチャットを開く",
    ko: "지원 채팅 열기",
    zh: "打开支持聊天",
  },
  {
    vi: "Phiên chat đã được đóng bởi nhân viên hỗ trợ.",
    en: "This chat session has been closed by support staff.",
    ja: "このチャットはサポート担当者により終了されました。",
    ko: "지원 담당자가 채팅 세션을 종료했습니다.",
    zh: "该聊天会话已由支持人员关闭。",
  },
  {
    vi: "Sáng",
    en: "Morning",
    ja: "午前",
    ko: "오전",
    zh: "上午",
  },
  {
    vi: "Tối",
    en: "Evening",
    ja: "夜",
    ko: "저녁",
    zh: "晚上",
  },
  {
    vi: "Ngày mới",
    en: "New date",
    ja: "新しい日付",
    ko: "새 날짜",
    zh: "新日期",
  },
  {
    vi: "Khung giờ mới",
    en: "New time slot",
    ja: "新しい時間帯",
    ko: "새 시간대",
    zh: "新时间段",
  },
  {
    vi: "Chọn ngày",
    en: "Choose date",
    ja: "日付を選択",
    ko: "날짜 선택",
    zh: "选择日期",
  },
  {
    vi: "Chọn khung giờ",
    en: "Choose time slot",
    ja: "時間帯を選択",
    ko: "시간대 선택",
    zh: "选择时间段",
  },
  {
    vi: "Đang tải khung giờ...",
    en: "Loading time slots...",
    ja: "時間帯を読み込み中...",
    ko: "시간대를 불러오는 중...",
    zh: "正在加载时间段...",
  },
  {
    vi: "Quán không có khung giờ đặt bàn trong ngày này.",
    en: "This venue has no reservation slots on this date.",
    ja: "この日は予約可能な時間帯がありません。",
    ko: "이 날짜에는 예약 가능한 시간대가 없습니다.",
    zh: "该店铺当天没有可预订时段。",
  },
  {
    vi: "Đang tải khung giờ của quán. Vui lòng thử lại sau vài giây.",
    en: "Loading this venue's time slots. Please try again in a few seconds.",
    ja: "店舗の時間帯を読み込み中です。数秒後にもう一度お試しください。",
    ko: "매장의 시간대를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.",
    zh: "正在加载该店铺的时间段。请几秒后再试。",
  },
  {
    vi: "Thiếu thông tin quán hoặc cast để đặt chỗ.",
    en: "Missing venue or cast information for this reservation.",
    ja: "予約に必要な店舗またはキャスト情報が不足しています。",
    ko: "예약에 필요한 매장 또는 캐스트 정보가 없습니다.",
    zh: "缺少本次预订所需的店铺或 Cast 信息。",
  },
  {
    vi: "Không gửi được yêu cầu đặt bàn.",
    en: "Could not send the table reservation request.",
    ja: "席予約リクエストを送信できませんでした。",
    ko: "테이블 예약 요청을 보낼 수 없습니다.",
    zh: "无法发送订桌请求。",
  },
  {
    vi: "Không gửi được yêu cầu đặt chỗ.",
    en: "Could not send the reservation request.",
    ja: "予約リクエストを送信できませんでした。",
    ko: "예약 요청을 보낼 수 없습니다.",
    zh: "无法发送预订请求。",
  },
  {
    vi: "Bạn gửi yêu cầu đặt bàn quá nhanh. Vui lòng chờ một chút rồi thử lại.",
    en: "Too many booking requests. Please wait a moment and try again.",
    ja: "予約リクエストが多すぎます。少し待ってからもう一度お試しください。",
    ko: "예약 요청이 너무 빠릅니다. 잠시 후 다시 시도해 주세요.",
    zh: "预订请求过于频繁。请稍等片刻后再试。",
  },
  {
    vi: "Chọn buổi đặt bàn",
    en: "Choose reservation period",
    ja: "予約時間帯を選択",
    ko: "예약 시간대 선택",
    zh: "选择预订时段",
  },
  {
    vi: "Vui lòng nhập họ tên.",
    en: "Please enter your full name.",
    ja: "氏名を入力してください。",
    ko: "이름을 입력해 주세요.",
    zh: "请输入姓名。",
  },
  {
    vi: "Vui lòng nhập email.",
    en: "Please enter your email.",
    ja: "メールアドレスを入力してください。",
    ko: "이메일을 입력해 주세요.",
    zh: "请输入邮箱。",
  },
  {
    vi: "Vui lòng nhập họ tên tối thiểu 2 ký tự.",
    en: "Please enter a full name with at least 2 characters.",
    ja: "氏名は2文字以上で入力してください。",
    ko: "이름은 최소 2자 이상 입력해 주세요.",
    zh: "姓名至少需要 2 个字符。",
  },
  {
    vi: "Họ tên không được vượt quá 80 ký tự.",
    en: "Full name must not exceed 80 characters.",
    ja: "氏名は80文字以内で入力してください。",
    ko: "이름은 80자를 초과할 수 없습니다.",
    zh: "姓名不能超过 80 个字符。",
  },
  {
    vi: "Họ tên chỉ được nhập chữ cái và khoảng trắng.",
    en: "Full name can only contain letters and spaces.",
    ja: "氏名には文字とスペースのみ入力できます。",
    ko: "이름에는 문자와 공백만 입력할 수 있습니다.",
    zh: "姓名只能包含字母和空格。",
  },
  {
    vi: "Vui lòng chọn khung giờ.",
    en: "Please choose a time slot.",
    ja: "時間帯を選択してください。",
    ko: "시간대를 선택해 주세요.",
    zh: "请选择时间段。",
  },
  {
    vi: "Khung giờ đã chọn không còn khả dụng.",
    en: "The selected time slot is no longer available.",
    ja: "選択した時間帯は利用できません。",
    ko: "선택한 시간대는 더 이상 사용할 수 없습니다.",
    zh: "所选时间段已不可用。",
  },
  {
    vi: "Khung giờ đặt chỗ phải ở tương lai.",
    en: "Reservation time must be in the future.",
    ja: "予約時間は現在より後にしてください。",
    ko: "예약 시간은 현재 이후여야 합니다.",
    zh: "预约时间必须是未来时间。",
  },
  {
    vi: "Ngày đặt bàn không hợp lệ.",
    en: "Reservation date is invalid.",
    ja: "予約日が無効です。",
    ko: "예약 날짜가 올바르지 않습니다.",
    zh: "预订日期无效。",
  },
  {
    vi: "Khung giờ đặt chỗ không hợp lệ.",
    en: "Reservation time slot is invalid.",
    ja: "予約時間帯が無効です。",
    ko: "예약 시간대가 올바르지 않습니다.",
    zh: "预订时间段无效。",
  },
  {
    vi: "Phần trước dấu @ không được để trống.",
    en: "The part before @ cannot be empty.",
    ja: "@より前の部分は空にできません。",
    ko: "@ 앞부분은 비워 둘 수 없습니다.",
    zh: "@ 前面的部分不能为空。",
  },
  {
    vi: "Phần sau dấu @ không được để trống.",
    en: "The part after @ cannot be empty.",
    ja: "@より後の部分は空にできません。",
    ko: "@ 뒷부분은 비워 둘 수 없습니다.",
    zh: "@ 后面的部分不能为空。",
  },
  {
    vi: "Phần trước dấu @ không được vượt quá 64 ký tự.",
    en: "The part before @ must not exceed 64 characters.",
    ja: "@より前の部分は64文字以内にしてください。",
    ko: "@ 앞부분은 64자를 초과할 수 없습니다.",
    zh: "@ 前面的部分不能超过 64 个字符。",
  },
  {
    vi: "Phần sau dấu @ không được vượt quá 253 ký tự.",
    en: "The part after @ must not exceed 253 characters.",
    ja: "@より後の部分は253文字以内にしてください。",
    ko: "@ 뒷부분은 253자를 초과할 수 없습니다.",
    zh: "@ 后面的部分不能超过 253 个字符。",
  },
  {
    vi: "Phần sau dấu @ phải là tên miền hợp lệ, ví dụ gmail.com.",
    en: "The part after @ must be a valid domain, for example gmail.com.",
    ja: "@より後は gmail.com など有効なドメインにしてください。",
    ko: "@ 뒤에는 gmail.com 같은 유효한 도메인을 입력해 주세요.",
    zh: "@ 后面必须是有效域名，例如 gmail.com。",
  },
  {
    vi: "Vui lòng nhập email Gmail đúng định dạng, ví dụ name@gmail.com.",
    en: "Please enter a valid Gmail address, for example name@gmail.com.",
    ja: "name@gmail.com のような有効な Gmail アドレスを入力してください。",
    ko: "name@gmail.com 형식의 올바른 Gmail 주소를 입력해 주세요.",
    zh: "请输入正确格式的 Gmail 地址，例如 name@gmail.com。",
  },
  {
    vi: "Mỗi phần của tên miền sau dấu @ không được vượt quá 63 ký tự.",
    en: "Each domain label after @ must not exceed 63 characters.",
    ja: "@より後の各ドメイン部分は63文字以内にしてください。",
    ko: "@ 뒤의 각 도메인 부분은 63자를 초과할 수 없습니다.",
    zh: "@ 后面域名的每一段都不能超过 63 个字符。",
  },
  {
    vi: "Tên miền sau dấu @ chỉ được gồm chữ, số, dấu gạch ngang và không bắt đầu/kết thúc bằng dấu gạch ngang.",
    en: "The domain after @ can only include letters, numbers, and hyphens, and cannot start or end with a hyphen.",
    ja: "@より後のドメインは英数字とハイフンのみ使用でき、ハイフンで始めたり終えたりできません。",
    ko: "@ 뒤의 도메인은 문자, 숫자, 하이픈만 사용할 수 있으며 하이픈으로 시작하거나 끝날 수 없습니다.",
    zh: "@ 后面的域名只能包含字母、数字和连字符，且不能以连字符开头或结尾。",
  },
  {
    vi: "Vui lòng nhập mật khẩu.",
    en: "Please enter your password.",
    ja: "パスワードを入力してください。",
    ko: "비밀번호를 입력해 주세요.",
    zh: "请输入密码。",
  },
  {
    vi: "Mật khẩu không được vượt quá 72 ký tự.",
    en: "Password must not exceed 72 characters.",
    ja: "パスワードは72文字以内で入力してください。",
    ko: "비밀번호는 72자를 초과할 수 없습니다.",
    zh: "密码不能超过 72 个字符。",
  },
  {
    vi: "Mật khẩu cần tối thiểu 8 ký tự.",
    en: "Password must be at least 8 characters.",
    ja: "パスワードは8文字以上にしてください。",
    ko: "비밀번호는 최소 8자 이상이어야 합니다.",
    zh: "密码至少需要 8 个字符。",
  },
  {
    vi: "Mật khẩu cần có chữ thường.",
    en: "Password must include a lowercase letter.",
    ja: "パスワードには小文字を含めてください。",
    ko: "비밀번호에는 소문자가 포함되어야 합니다.",
    zh: "密码必须包含小写字母。",
  },
  {
    vi: "Mật khẩu cần có chữ hoa.",
    en: "Password must include an uppercase letter.",
    ja: "パスワードには大文字を含めてください。",
    ko: "비밀번호에는 대문자가 포함되어야 합니다.",
    zh: "密码必须包含大写字母。",
  },
  {
    vi: "Mật khẩu cần có chữ số.",
    en: "Password must include a number.",
    ja: "パスワードには数字を含めてください。",
    ko: "비밀번호에는 숫자가 포함되어야 합니다.",
    zh: "密码必须包含数字。",
  },
  {
    vi: "Vui lòng nhập lại mật khẩu.",
    en: "Please confirm your password.",
    ja: "パスワードをもう一度入力してください。",
    ko: "비밀번호를 다시 입력해 주세요.",
    zh: "请再次输入密码。",
  },
  {
    vi: "Mật khẩu nhập lại chưa khớp.",
    en: "The confirmation password does not match.",
    ja: "確認用パスワードが一致しません。",
    ko: "확인 비밀번호가 일치하지 않습니다.",
    zh: "两次输入的密码不一致。",
  },
];

const translations = new Map<string, TranslationSet>(
  [...entries, ...dynamicPhraseEntries].map(({ vi, ...translated }) => [
    normalizeText(vi),
    translated,
  ]),
);

const reverseTranslations = new Map<string, string>();

for (const entry of [...entries, ...dynamicPhraseEntries]) {
  for (const code of ["en", "ja", "ko", "zh"] as const) {
    reverseTranslations.set(normalizeText(entry[code]), entry.vi);
  }
}

const termEntries: TranslationEntry[] = [
  {
    vi: "Ho Chi Minh City",
    en: "Ho Chi Minh City",
    ja: "ホーチミン市",
    ko: "호찌민시",
    zh: "胡志明市",
  },
  {
    vi: "Hanoi",
    en: "Hanoi",
    ja: "ハノイ",
    ko: "하노이",
    zh: "河内",
  },
  {
    vi: "Coupon Hot",
    en: "Hot Coupons",
    ja: "注目クーポン",
    ko: "인기 쿠폰",
    zh: "热门优惠券",
  },
  {
    vi: "Coupon",
    en: "Coupon",
    ja: "クーポン",
    ko: "쿠폰",
    zh: "优惠券",
  },
  {
    vi: "VIP friendly",
    en: "VIP friendly",
    ja: "VIP対応",
    ko: "VIP 친화",
    zh: "VIP 友好",
  },
  {
    vi: "VIP sofa",
    en: "VIP sofa",
    ja: "VIPソファ",
    ko: "VIP 소파",
    zh: "VIP 沙发",
  },
  {
    vi: "VIP table",
    en: "VIP table",
    ja: "VIP席",
    ko: "VIP 테이블",
    zh: "VIP 桌",
  },
  {
    vi: "VIP席を予約",
    en: "Book a VIP table",
    ja: "VIP席を予約",
    ko: "VIP 테이블 예약",
    zh: "预订 VIP 桌",
  },
  {
    vi: "席を予約",
    en: "Book a seat",
    ja: "席を予約",
    ko: "좌석 예약",
    zh: "预订座位",
  },
  {
    vi: "Night dining",
    en: "Night dining",
    ja: "夜のグルメ",
    ko: "야간 다이닝",
    zh: "夜间美食",
  },
  {
    vi: "Restaurant",
    en: "Restaurant",
    ja: "レストラン",
    ko: "레스토랑",
    zh: "餐厅",
  },
  {
    vi: "Video Hot",
    en: "Hot videos",
    ja: "注目動画",
    ko: "인기 영상",
    zh: "热门视频",
  },
  {
    vi: "Hải Phòng",
    en: "Hai Phong",
    ja: "ハイフォン",
    ko: "하이퐁",
    zh: "海防",
  },
  {
    vi: "Hai Phong",
    en: "Hai Phong",
    ja: "ハイフォン",
    ko: "하이퐁",
    zh: "海防",
  },
  {
    vi: "khu vực này",
    en: "this area",
    ja: "このエリア",
    ko: "이 지역",
    zh: "该区域",
  },
  {
    vi: "đặt trước",
    en: "book ahead",
    ja: "事前予約",
    ko: "미리 예약",
    zh: "提前预订",
  },
  {
    vi: "ưu tiên",
    en: "priority",
    ja: "優先案内",
    ko: "우선 안내",
    zh: "优先安排",
  },
  {
    vi: "hướng dẫn",
    en: "guide",
    ja: "ガイド",
    ko: "가이드",
    zh: "指南",
  },
  {
    vi: "bàn đẹp",
    en: "recommended table",
    ja: "おすすめの席",
    ko: "추천 좌석",
    zh: "推荐座位",
  },
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
    vi: "Phường",
    en: "Ward",
    ja: "Ward",
    ko: "Ward",
    zh: "坊",
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
    vi: "Bar",
    en: "Bar",
    ja: "バー",
    ko: "바",
    zh: "酒吧",
  },
  {
    vi: "Girls bar",
    en: "Girls bar",
    ja: "ガールズバー",
    ko: "걸즈 바",
    zh: "Girls Bar",
  },
  {
    vi: "FIND VENUES",
    en: "FIND VENUES",
    ja: "店舗を探す",
    ko: "매장 찾기",
    zh: "查找店铺",
  },
  {
    vi: "FIND YOUR VENUE TONIGHT",
    en: "FIND YOUR VENUE TONIGHT",
    ja: "今夜の店舗を探す",
    ko: "오늘 밤 매장 찾기",
    zh: "查找今晚的店铺",
  },
  {
    vi: "Tìm quán đêm",
    en: "Find night venues in",
    ja: "ナイトスポットを探す",
    ko: "나이트 장소 찾기",
    zh: "查找夜生活场所",
  },
  {
    vi: "Gần tôi",
    en: "Nearby",
    ja: "近く",
    ko: "가까운 곳",
    zh: "附近",
  },
  {
    vi: "Tôi đã mở quyền, thử lại",
    en: "I enabled it, try again",
    ja: "許可したので再試行",
    ko: "권한을 켰습니다. 다시 시도",
    zh: "我已开启权限，重试",
  },
  {
    vi: "Trình duyệt đang chặn vị trí cho website này. Hãy bấm biểu tượng cài đặt/ổ khóa trên thanh địa chỉ, đổi Vị trí sang Cho phép rồi quay lại thử lại.",
    en: "Your browser is blocking location for this website. Tap the site settings or lock icon in the address bar, set Location to Allow, then come back and try again.",
    ja: "このサイトの位置情報がブラウザでブロックされています。アドレスバーの設定または鍵アイコンから位置情報を許可に変更し、戻って再試行してください。",
    ko: "브라우저가 이 웹사이트의 위치 권한을 차단하고 있습니다. 주소 표시줄의 사이트 설정 또는 자물쇠 아이콘에서 위치를 허용으로 변경한 뒤 다시 시도해 주세요.",
    zh: "浏览器正在阻止此网站的位置权限。请点击地址栏中的网站设置或锁形图标，将位置改为允许，然后返回重试。",
  },
  {
    vi: "Trình duyệt đang chặn quyền vị trí. Mở quyền vị trí cho website rồi thử lại.",
    en: "Your browser is blocking location. Allow location for this website, then try again.",
    ja: "ブラウザが位置情報をブロックしています。このサイトの位置情報を許可してから再試行してください。",
    ko: "브라우저가 위치 권한을 차단하고 있습니다. 이 웹사이트의 위치 권한을 허용한 뒤 다시 시도해 주세요.",
    zh: "浏览器正在阻止位置权限。请允许此网站访问位置后重试。",
  },
  {
    vi: "Quyền vị trí đang bị chặn",
    en: "Location is blocked",
    ja: "位置情報がブロックされています",
    ko: "위치 권한이 차단됨",
    zh: "位置权限已被阻止",
  },
  {
    vi: "Lấy vị trí chỉ hoạt động khi website chạy bằng HTTPS.",
    en: "Location only works when the website is served over HTTPS.",
    ja: "位置情報はHTTPSで配信されているサイトでのみ利用できます。",
    ko: "위치 기능은 웹사이트가 HTTPS로 제공될 때만 작동합니다.",
    zh: "位置功能仅在网站通过 HTTPS 访问时可用。",
  },
  {
    vi: "Chưa lấy được vị trí hiện tại. Hãy kiểm tra GPS/mạng rồi thử lại.",
    en: "Could not read your current location. Check GPS/network and try again.",
    ja: "現在地を取得できませんでした。GPSまたはネットワークを確認して再試行してください。",
    ko: "현재 위치를 가져오지 못했습니다. GPS 또는 네트워크를 확인한 뒤 다시 시도해 주세요.",
    zh: "无法获取当前位置。请检查 GPS 或网络后重试。",
  },
  {
    vi: "Thiết bị hoặc trình duyệt hiện chưa hỗ trợ lấy vị trí.",
    en: "This device or browser does not support location access.",
    ja: "この端末またはブラウザは位置情報の取得に対応していません。",
    ko: "이 기기 또는 브라우저는 위치 정보 접근을 지원하지 않습니다.",
    zh: "此设备或浏览器暂不支持位置访问。",
  },
  {
    vi: "Theo khu vực",
    en: "By area",
    ja: "エリア別",
    ko: "지역별",
    zh: "按区域",
  },
  {
    vi: "đánh giá",
    en: "reviews",
    ja: "件の評価",
    ko: "개 리뷰",
    zh: "条评价",
  },
  {
    vi: "Ghi chú tuỳ chọn",
    en: "Optional note",
    ja: "メモ（任意）",
    ko: "메모(선택)",
    zh: "备注（可选）",
  },
  {
    vi: "Đang gửi yêu cầu...",
    en: "Sending request...",
    ja: "リクエスト送信中...",
    ko: "요청 전송 중...",
    zh: "正在发送请求...",
  },
  {
    vi: "Không thanh toán online · không thu cọc · có thể hủy trước giờ hẹn theo chính sách quán.",
    en: "No online payment · no deposit · cancel before the appointment according to venue policy.",
    ja: "オンライン決済なし・デポジット不要・店舗ポリシーに従って予約前にキャンセル可能です。",
    ko: "온라인 결제 없음 · 보증금 없음 · 매장 정책에 따라 예약 시간 전 취소 가능합니다.",
    zh: "无需线上付款 · 无需押金 · 可按店铺政策在预约前取消。",
  },
  {
    vi: "Giảm số khách",
    en: "Decrease guests",
    ja: "人数を減らす",
    ko: "인원 줄이기",
    zh: "减少人数",
  },
  {
    vi: "Tăng số khách",
    en: "Increase guests",
    ja: "人数を増やす",
    ko: "인원 늘리기",
    zh: "增加人数",
  },
  {
    vi: "Quay lại danh sách quán",
    en: "Back to venue list",
    ja: "店舗一覧に戻る",
    ko: "매장 목록으로 돌아가기",
    zh: "返回店铺列表",
  },
  {
    vi: "Lưu quán",
    en: "Save venue",
    ja: "店舗を保存",
    ko: "매장 저장",
    zh: "保存店铺",
  },
  {
    vi: "Bỏ lưu quán",
    en: "Unsave venue",
    ja: "保存を解除",
    ko: "저장 취소",
    zh: "取消保存店铺",
  },
  {
    vi: "Nhóm thực đơn",
    en: "Menu groups",
    ja: "メニューグループ",
    ko: "메뉴 그룹",
    zh: "菜单分组",
  },
  {
    vi: "Giá tham khảo theo giờ",
    en: "Reference price by hour",
    ja: "時間ごとの参考価格",
    ko: "시간 기준 참고 가격",
    zh: "按小时参考价",
  },
  {
    vi: "Giá tham khảo tại quán",
    en: "Reference price at the venue",
    ja: "店舗での参考価格",
    ko: "매장 참고 가격",
    zh: "店内参考价",
  },
  {
    vi: "/giờ",
    en: "/hour",
    ja: "/時",
    ko: "/시간",
    zh: "/小时",
  },
  {
    vi: "Chưa có cast công khai",
    en: "No public Cast yet",
    ja: "公開キャストはまだありません",
    ko: "공개된 캐스트가 아직 없습니다",
    zh: "暂无公开 Cast",
  },
  {
    vi: "Quán sẽ cập nhật hồ sơ cast khi lịch phục vụ sẵn sàng.",
    en: "The venue will update Cast profiles when service schedules are ready.",
    ja: "勤務スケジュールが整い次第、店舗がキャストプロフィールを更新します。",
    ko: "서비스 일정이 준비되면 매장에서 캐스트 프로필을 업데이트합니다.",
    zh: "服务排期准备好后，店铺会更新 Cast 资料。",
  },
  {
    vi: "Chưa có bảng giá",
    en: "No price menu yet",
    ja: "料金表はまだありません",
    ko: "가격표가 아직 없습니다",
    zh: "暂无价格表",
  },
  {
    vi: "Quán chưa công khai thực đơn tham khảo.",
    en: "The venue has not published a reference menu yet.",
    ja: "店舗は参考メニューをまだ公開していません。",
    ko: "매장이 참고 메뉴를 아직 공개하지 않았습니다.",
    zh: "店铺尚未公开参考菜单。",
  },
  {
    vi: "Giá chỉ dùng để tham khảo, có thể thay đổi theo ngày và khung giờ.",
    en: "Prices are for reference only and may change by day and time slot.",
    ja: "料金は参考情報であり、日付や時間帯により変更される場合があります。",
    ko: "가격은 참고용이며 날짜와 시간대에 따라 변경될 수 있습니다.",
    zh: "价格仅供参考，可能按日期和时段变化。",
  },
  {
    vi: "Nói tiếng Việt",
    en: "Speaks Vietnamese",
    ja: "ベトナム語対応",
    ko: "베트남어 가능",
    zh: "会说越南语",
  },
  {
    vi: "Đang cập nhật",
    en: "Updating",
    ja: "更新中",
    ko: "업데이트 중",
    zh: "更新中",
  },
  {
    vi: "Theo giờ admin",
    en: "Admin hours",
    ja: "管理者設定の時間",
    ko: "관리자 설정 시간",
    zh: "管理员设置时间",
  },
  {
    vi: "Tạm nghỉ",
    en: "Temporarily closed",
    ja: "一時休業",
    ko: "임시 휴무",
    zh: "临时休息",
  },
  {
    vi: "Nghỉ",
    en: "Closed",
    ja: "休業",
    ko: "휴무",
    zh: "休息",
  },
  {
    vi: "Chưa cập nhật",
    en: "Not updated",
    ja: "未更新",
    ko: "업데이트 전",
    zh: "未更新",
  },
  {
    vi: "Live music",
    en: "Live music",
    ja: "ライブ音楽",
    ko: "라이브 음악",
    zh: "现场音乐",
  },
  {
    vi: "Whisky bar",
    en: "Whisky bar",
    ja: "ウイスキーバー",
    ko: "위스키 바",
    zh: "威士忌吧",
  },
  {
    vi: "Izakaya",
    en: "Izakaya",
    ja: "居酒屋",
    ko: "이자카야",
    zh: "居酒屋",
  },
  {
    vi: "Ăn khuya",
    en: "Late-night dining",
    ja: "深夜営業",
    ko: "심야 식사",
    zh: "深夜餐饮",
  },
  {
    vi: "Sân khấu DJ",
    en: "DJ stage",
    ja: "DJステージ",
    ko: "DJ 스테이지",
    zh: "DJ 舞台",
  },
  {
    vi: "Mở đến 02:00",
    en: "Open until 02:00",
    ja: "02:00まで営業",
    ko: "02:00까지 영업",
    zh: "营业至 02:00",
  },
  {
    vi: "Hỗ trợ tiếng Nhật",
    en: "Japanese support",
    ja: "日本語対応",
    ko: "일본어 지원",
    zh: "日语支持",
  },
  {
    vi: "Host lounge",
    en: "Host lounge",
    ja: "ホストラウンジ",
    ko: "호스트 라운지",
    zh: "Host lounge",
  },
  {
    vi: "VIP sofa",
    en: "VIP sofa",
    ja: "VIPソファ",
    ko: "VIP 소파",
    zh: "VIP 沙发",
  },
  {
    vi: "Thư giãn",
    en: "Relax",
    ja: "リラックス",
    ko: "휴식",
    zh: "放松",
  },
  {
    vi: "Mở muộn",
    en: "Open late",
    ja: "深夜営業",
    ko: "늦게까지 영업",
    zh: "营业到很晚",
  },
  {
    vi: "Gói đôi",
    en: "Couple package",
    ja: "ペアプラン",
    ko: "커플 패키지",
    zh: "双人套餐",
  },
  {
    vi: "VIP table",
    en: "VIP table",
    ja: "VIPテーブル",
    ko: "VIP 테이블",
    zh: "VIP 桌",
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
  {
    vi: "Không tìm thấy",
    en: "Not found",
    ja: "見つかりません",
    ko: "찾을 수 없음",
    zh: "未找到",
  },
  {
    vi: "Không tìm thấy trang",
    en: "Page not found",
    ja: "ページが見つかりません",
    ko: "페이지를 찾을 수 없습니다",
    zh: "页面未找到",
  },
  {
    vi: "Trang có thể đã đổi tên hoặc không còn tồn tại. Thử tìm quán, cast hoặc quay về trang chủ.",
    en: "This page may have been renamed or no longer exists. Try searching for a venue, Cast, or return home.",
    ja: "このページは名称が変更されたか、存在しない可能性があります。店舗やキャストを検索するか、ホームへ戻ってください。",
    ko: "이 페이지는 이름이 변경되었거나 더 이상 존재하지 않을 수 있습니다. 매장이나 Cast를 검색하거나 홈으로 돌아가세요.",
    zh: "该页面可能已更名或不再存在。请尝试搜索店铺、Cast，或返回首页。",
  },
  {
    vi: "Về trang chủ",
    en: "Back to home",
    ja: "ホームへ戻る",
    ko: "홈으로 돌아가기",
    zh: "返回首页",
  },
  {
    vi: "Tìm quán hoặc cast...",
    en: "Search venues or Cast...",
    ja: "店舗またはキャストを検索...",
    ko: "매장 또는 Cast 검색...",
    zh: "搜索店铺或 Cast...",
  },
  {
    vi: "Sự cố hệ thống",
    en: "System issue",
    ja: "システム障害",
    ko: "시스템 문제",
    zh: "系统问题",
  },
  {
    vi: "Đã có lỗi xảy ra phía máy chủ",
    en: "A server error occurred",
    ja: "サーバー側でエラーが発生しました",
    ko: "서버에서 오류가 발생했습니다",
    zh: "服务器发生错误",
  },
  {
    vi: "Hệ thống đang gặp trục trặc tạm thời. Vui lòng thử lại sau ít phút. Nếu vẫn lỗi, hãy liên hệ qua LINE để được hỗ trợ.",
    en: "The system is temporarily unavailable. Please try again in a few minutes. If the issue continues, contact us on LINE for support.",
    ja: "システムで一時的な問題が発生しています。数分後にもう一度お試しください。解決しない場合はLINEでお問い合わせください。",
    ko: "시스템에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요. 계속 오류가 발생하면 LINE으로 문의해 주세요.",
    zh: "系统暂时出现问题。请几分钟后重试。如仍有错误，请通过 LINE 联系我们获取支持。",
  },
  {
    vi: "Thử lại",
    en: "Try again",
    ja: "再試行",
    ko: "다시 시도",
    zh: "重试",
  },
  {
    vi: "Không có quyền",
    en: "No access",
    ja: "アクセス権がありません",
    ko: "접근 권한 없음",
    zh: "无访问权限",
  },
  {
    vi: "Bạn không có quyền truy cập",
    en: "You do not have access",
    ja: "アクセス権限がありません",
    ko: "접근 권한이 없습니다",
    zh: "你没有访问权限",
  },
  {
    vi: "Trang này dành cho tài khoản đã đăng nhập hoặc có quyền phù hợp. Vui lòng đăng nhập đúng tài khoản.",
    en: "This page requires a signed-in account or the right permissions. Please sign in with the correct account.",
    ja: "このページはログイン済みのアカウント、または適切な権限が必要です。正しいアカウントでログインしてください。",
    ko: "이 페이지는 로그인된 계정 또는 적절한 권한이 필요합니다. 올바른 계정으로 로그인해 주세요.",
    zh: "该页面需要已登录账号或相应权限。请使用正确账号登录。",
  },
  {
    vi: "Hệ thống đang được bảo trì",
    en: "System maintenance in progress",
    ja: "システムメンテナンス中です",
    ko: "시스템 점검 중입니다",
    zh: "系统正在维护",
  },
  {
    vi: "Chúng tôi đang nâng cấp để mang lại trải nghiệm tốt hơn và sẽ trở lại trong giây lát. Cảm ơn bạn đã kiên nhẫn chờ đợi.",
    en: "We are upgrading the experience and will be back shortly. Thank you for your patience.",
    ja: "より良い体験のためにアップグレード中です。まもなく再開します。お待ちいただきありがとうございます。",
    ko: "더 나은 경험을 위해 업그레이드 중이며 곧 다시 이용하실 수 있습니다. 기다려 주셔서 감사합니다.",
    zh: "我们正在升级以提供更好的体验，稍后即会恢复。感谢你的耐心等待。",
  },
  {
    vi: "Mã sự cố:",
    en: "Incident code:",
    ja: "インシデントコード:",
    ko: "문제 코드:",
    zh: "故障代码:",
  },
  {
    vi: "Không tìm thấy quán",
    en: "Venue not found",
    ja: "店舗が見つかりません",
    ko: "매장을 찾을 수 없습니다",
    zh: "未找到店铺",
  },
  {
    vi: "Slug này không tồn tại hoặc quán chưa được công khai. Thử tìm quán khác trong danh sách.",
    en: "This slug does not exist or the venue is not public yet. Try another venue in the list.",
    ja: "このスラッグは存在しないか、店舗がまだ公開されていません。一覧から別の店舗を探してください。",
    ko: "이 slug는 존재하지 않거나 매장이 아직 공개되지 않았습니다. 목록에서 다른 매장을 찾아보세요.",
    zh: "该 slug 不存在，或店铺尚未公开。请在列表中查找其他店铺。",
  },
  {
    vi: "Không tìm thấy cast",
    en: "Cast not found",
    ja: "キャストが見つかりません",
    ko: "Cast를 찾을 수 없습니다",
    zh: "未找到 Cast",
  },
  {
    vi: "Cast này không tồn tại, chưa active hoặc chưa được duyệt public qua CMS.",
    en: "This Cast does not exist, is not active, or has not been approved for public display in the CMS.",
    ja: "このキャストは存在しない、アクティブではない、またはCMSで公開承認されていません。",
    ko: "이 Cast는 존재하지 않거나 활성화되지 않았거나 CMS에서 공개 승인을 받지 않았습니다.",
    zh: "该 Cast 不存在、未启用，或尚未在 CMS 中获准公开显示。",
  },
  {
    vi: "Xem danh sách cast",
    en: "View Cast list",
    ja: "キャスト一覧を見る",
    ko: "Cast 목록 보기",
    zh: "查看 Cast 列表",
  },
  {
    vi: "Không tải được thông tin quán",
    en: "Could not load venue details",
    ja: "店舗情報を読み込めませんでした",
    ko: "매장 정보를 불러올 수 없습니다",
    zh: "无法加载店铺信息",
  },
  {
    vi: "Hệ thống chưa lấy được dữ liệu chi tiết quán. Bạn có thể thử lại hoặc quay về danh sách quán.",
    en: "The system could not load the venue details. You can try again or return to the venue list.",
    ja: "店舗詳細データを取得できませんでした。再試行するか、店舗一覧へ戻ってください。",
    ko: "매장 상세 데이터를 불러오지 못했습니다. 다시 시도하거나 매장 목록으로 돌아가세요.",
    zh: "系统无法加载店铺详情。你可以重试或返回店铺列表。",
  },
  {
    vi: "Danh sách quán",
    en: "Venue list",
    ja: "店舗一覧",
    ko: "매장 목록",
    zh: "店铺列表",
  },
  {
    vi: "Không tải được profile cast",
    en: "Could not load Cast profile",
    ja: "キャストプロフィールを読み込めませんでした",
    ko: "Cast 프로필을 불러올 수 없습니다",
    zh: "无法加载 Cast 资料",
  },
  {
    vi: "Hệ thống chưa lấy được dữ liệu cast detail. Bạn có thể thử lại hoặc quay về danh sách cast.",
    en: "The system could not load the Cast detail data. You can try again or return to the Cast list.",
    ja: "キャスト詳細データを取得できませんでした。再試行するか、キャスト一覧へ戻ってください。",
    ko: "Cast 상세 데이터를 불러오지 못했습니다. 다시 시도하거나 Cast 목록으로 돌아가세요.",
    zh: "系统无法加载 Cast 详情。你可以重试或返回 Cast 列表。",
  },
  {
    vi: "Danh sách cast",
    en: "Cast list",
    ja: "キャスト一覧",
    ko: "Cast 목록",
    zh: "Cast 列表",
  },
  {
    vi: "Hệ thống đang cập nhật",
    en: "System update in progress",
    ja: "システム更新中です",
    ko: "시스템 업데이트 중입니다",
    zh: "系统正在更新",
  },
  {
    vi: "Trang hướng dẫn hỗ trợ đang được hoàn thiện. Bạn có thể quay về trang chủ hoặc tiếp tục tìm quán, cast và ưu đãi trong lúc chờ cập nhật.",
    en: "The support guide is being completed. You can return home or keep browsing venues, Cast, and deals while waiting for the update.",
    ja: "サポートガイドは現在準備中です。更新を待つ間、ホームへ戻るか、店舗・キャスト・特典を引き続きご覧ください。",
    ko: "지원 가이드를 준비 중입니다. 업데이트를 기다리는 동안 홈으로 돌아가거나 매장, Cast, 혜택을 계속 둘러보세요.",
    zh: "支持指南正在完善中。等待更新期间，你可以返回首页，或继续浏览店铺、Cast 和优惠。",
  },
];

const termTranslations = [...termEntries].sort((left, right) => right.vi.length - left.vi.length);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildTermPattern(term: string) {
  const escaped = escapeRegExp(term);
  if (/^[A-Z]{2,3}$/i.test(term)) {
    return new RegExp(`(^|[^A-Za-z0-9])(${escaped})(?=$|[^A-Za-z0-9])`, "g");
  }

  return new RegExp(escaped, "g");
}

function replaceTerms(value: string, language: Exclude<LanguageCode, "vi">) {
  let output = value
    .replace(/\b(?:Quận|District)\s+(\d+)\b/gi, (_match, district: string) =>
      translateDistrictLabel(district, language),
    )
    .replace(/\bPhường\s+(\d+)\b/gi, (_match, ward: string) =>
      translateWardLabel(ward, language),
    );

  for (const entry of termTranslations) {
    const replacement = entry[language];
    if (!replacement) continue;
    const pattern = buildTermPattern(entry.vi);
    if (/^[A-Z]{2,3}$/i.test(entry.vi)) {
      output = output.replace(pattern, (_match: string, prefix: string) => `${prefix}${replacement}`);
    } else {
      output = output.replace(pattern, replacement);
    }
  }

  return output;
}

function lowercaseFirst(value: string) {
  return value.length > 0 ? `${value[0]?.toLocaleLowerCase() ?? ""}${value.slice(1)}` : value;
}

function translateDelimitedText(
  value: string,
  language: Exclude<LanguageCode, "vi">,
) {
  const delimiters = [" — ", " · "];

  for (const delimiter of delimiters) {
    if (!value.includes(delimiter)) continue;

    const parts = value.split(delimiter);
    const translatedParts = parts.map((part) => translateText(part, language));
    const hasTranslation = translatedParts.some((part, index) => part !== parts[index]);

    if (hasTranslation) return translatedParts.join(delimiter);
  }

  return null;
}

function translateDistrictLabel(
  district: string,
  language: Exclude<LanguageCode, "vi">,
) {
  return {
    en: `District ${district}`,
    ja: `${district}区`,
    ko: `${district}군`,
    zh: `第${district}郡`,
  }[language];
}

function translateWardLabel(ward: string, language: Exclude<LanguageCode, "vi">) {
  return {
    en: `Ward ${ward}`,
    ja: `Ward ${ward}`,
    ko: `Ward ${ward}`,
    zh: `第${ward}坊`,
  }[language];
}

function translatePattern(
  value: string,
  language: Exclude<LanguageCode, "vi">,
): string | null {
  const normalized = normalizeText(value);

  const districtMatch = normalized.match(/^(?:Quận|District)\s+(\d+)$/i);
  if (districtMatch) {
    return translateDistrictLabel(districtMatch[1] ?? "", language);
  }

  const updatedAtMatch = normalized.match(/^Cập nhật:\s*(.+)$/i);
  if (updatedAtMatch) {
    const date = updatedAtMatch[1] ?? "";
    return {
      en: `Updated: ${date}`,
      ja: `更新日: ${date}`,
      ko: `업데이트: ${date}`,
      zh: `更新：${date}`,
    }[language];
  }

  const djNightMatch = normalized.match(/^Đêm nhạc DJ tại\s+(.+)$/i);
  if (djNightMatch) {
    const venue = translateText(djNightMatch[1] ?? "", language);
    return {
      en: `DJ night at ${venue}`,
      ja: `${venue}のDJナイト`,
      ko: `${venue} DJ 나이트`,
      zh: `${venue} DJ之夜`,
    }[language];
  }

  const maxCharactersMatch = normalized.match(
    /^(Họ tên|Email|Số điện thoại|Ghi chú)\s+tối đa\s+(\d+)\s+ký tự\.$/i,
  );
  if (maxCharactersMatch) {
    const field = translateText(maxCharactersMatch[1] ?? "", language);
    const count = maxCharactersMatch[2] ?? "";
    return {
      en: `${field} can be up to ${count} characters.`,
      ja: `${field}は最大${count}文字です。`,
      ko: `${field}은(는) 최대 ${count}자까지 입력할 수 있습니다.`,
      zh: `${field}最多 ${count} 个字符。`,
    }[language];
  }

  const minNameMatch = normalized.match(/^Vui lòng nhập họ tên từ\s+(\d+)\s+ký tự\.$/i);
  if (minNameMatch) {
    const count = minNameMatch[1] ?? "";
    return {
      en: `Please enter a full name of at least ${count} characters.`,
      ja: `氏名は${count}文字以上で入力してください。`,
      ko: `이름은 최소 ${count}자 이상 입력해 주세요.`,
      zh: `请输入至少 ${count} 个字符的姓名。`,
    }[language];
  }

  const dateWindowMatch = normalized.match(/^Ngày đặt bàn chỉ được chọn từ hôm nay đến\s+(\d+)\s+ngày tới\.$/i);
  if (dateWindowMatch) {
    const count = dateWindowMatch[1] ?? "";
    return {
      en: `Reservation date can only be selected from today through the next ${count} days.`,
      ja: `予約日は今日から${count}日以内で選択してください。`,
      ko: `예약 날짜는 오늘부터 ${count}일 이내로만 선택할 수 있습니다.`,
      zh: `预约日期只能选择从今天起 ${count} 天内。`,
    }[language];
  }

  const guestRangeMatch = normalized.match(/^Số người chỉ được từ\s+(\d+)\s+đến\s+(\d+)\.$/i);
  if (guestRangeMatch) {
    const min = guestRangeMatch[1] ?? "";
    const max = guestRangeMatch[2] ?? "";
    return {
      en: `Guests must be between ${min} and ${max}.`,
      ja: `人数は${min}〜${max}名で選択してください。`,
      ko: `인원은 ${min}명에서 ${max}명 사이여야 합니다.`,
      zh: `人数必须在 ${min} 到 ${max} 之间。`,
    }[language];
  }

  const emptyAreaMatch = normalized.match(/^Chưa có\s+(.+?)\s+cho khu vực này\.$/i);
  if (emptyAreaMatch) {
    const subject = translateText(emptyAreaMatch[1] ?? "", language);
    return {
      en: `No ${lowercaseFirst(subject)} for this area yet.`,
      ja: `このエリアの${subject}はまだありません。`,
      ko: `이 지역에는 아직 ${subject}이(가) 없습니다.`,
      zh: `该区域暂无${subject}。`,
    }[language];
  }

  const confirmNearBookingTitleMatch = normalized.match(/^Xác nhận\s+(đặt bàn|đặt cast)\s+sát giờ$/i);
  if (confirmNearBookingTitleMatch) {
    const action = confirmNearBookingTitleMatch[1]?.toLowerCase() === "đặt cast" ? "cast" : "table";
    return {
      en: action === "cast" ? "Confirm last-minute Cast booking" : "Confirm last-minute table booking",
      ja: action === "cast" ? "直前のCast予約を確認" : "直前の席予約を確認",
      ko: action === "cast" ? "임박한 캐스트 예약 확인" : "임박한 테이블 예약 확인",
      zh: action === "cast" ? "确认临近时间预约 Cast" : "确认临近时间订桌",
    }[language];
  }

  const confirmBookingTitleMatch = normalized.match(/^Xác nhận\s+(đặt bàn|đặt cast)$/i);
  if (confirmBookingTitleMatch) {
    const action = confirmBookingTitleMatch[1]?.toLowerCase() === "đặt cast" ? "cast" : "table";
    return {
      en: action === "cast" ? "Confirm Cast booking" : "Confirm table booking",
      ja: action === "cast" ? "Cast予約を確認" : "席予約を確認",
      ko: action === "cast" ? "캐스트 예약 확인" : "테이블 예약 확인",
      zh: action === "cast" ? "确认预约 Cast" : "确认订桌",
    }[language];
  }

  const nearBookingConfirmMatch = normalized.match(
    /^Lịch\s+(.+?)\s+ngày\s+(.+?)\s+đang rất gần giờ bắt đầu\.\s+Bạn có chắc muốn\s+(đặt bàn|đặt cast)\s+giờ này không\?$/i,
  );
  if (nearBookingConfirmMatch) {
    const time = nearBookingConfirmMatch[1] ?? "";
    const date = nearBookingConfirmMatch[2] ?? "";
    const action = nearBookingConfirmMatch[3]?.toLowerCase() === "đặt cast" ? "cast" : "table";
    return {
      en:
        action === "cast"
          ? `The Cast booking at ${time} on ${date} is very close to the start time. Do you still want to book this time?`
          : `The table booking at ${time} on ${date} is very close to the start time. Do you still want to book this time?`,
      ja:
        action === "cast"
          ? `${date} ${time}のCast予約は開始時間が近づいています。この時間で予約しますか？`
          : `${date} ${time}の席予約は開始時間が近づいています。この時間で予約しますか？`,
      ko:
        action === "cast"
          ? `${date} ${time} 캐스트 예약 시간이 곧 시작됩니다. 이 시간으로 예약하시겠습니까?`
          : `${date} ${time} 테이블 예약 시간이 곧 시작됩니다. 이 시간으로 예약하시겠습니까?`,
      zh:
        action === "cast"
          ? `${date} ${time} 的 Cast 预约距离开始时间很近。仍要预约这个时间吗？`
          : `${date} ${time} 的订桌距离开始时间很近。仍要预约这个时间吗？`,
    }[language];
  }

  const bookingConfirmMatch = normalized.match(
    /^Bạn có chắc muốn gửi yêu cầu\s+(đặt bàn|đặt cast)\s+lúc\s+(.+?)\s+ngày\s+(.+?)\?$/i,
  );
  if (bookingConfirmMatch) {
    const action = bookingConfirmMatch[1]?.toLowerCase() === "đặt cast" ? "cast" : "table";
    const time = bookingConfirmMatch[2] ?? "";
    const date = bookingConfirmMatch[3] ?? "";
    return {
      en:
        action === "cast"
          ? `Do you want to send a Cast booking request for ${time} on ${date}?`
          : `Do you want to send a table booking request for ${time} on ${date}?`,
      ja:
        action === "cast"
          ? `${date} ${time}のCast予約リクエストを送信しますか？`
          : `${date} ${time}の席予約リクエストを送信しますか？`,
      ko:
        action === "cast"
          ? `${date} ${time} 캐스트 예약 요청을 보내시겠습니까?`
          : `${date} ${time} 테이블 예약 요청을 보내시겠습니까?`,
      zh:
        action === "cast"
          ? `要发送 ${date} ${time} 的 Cast 预约请求吗？`
          : `要发送 ${date} ${time} 的订桌请求吗？`,
    }[language];
  }

  const tourBookingRequestMatch = normalized.match(
    /^Yêu cầu đặt tour(?:\s+(.+?))?(?:\s+lúc\s+(.+?))?\s+đã được ghi nhận\.\s+Admin sẽ kiểm tra quán và cast theo từng điểm trong hành trình\.$/i,
  );
  if (tourBookingRequestMatch) {
    const rawTourTarget = tourBookingRequestMatch[1]?.trim() ?? "";
    const target = rawTourTarget ? translateText(rawTourTarget, language) : "";
    const time = tourBookingRequestMatch[2] ?? "";

    if (target && time) {
      return {
        en: `Your tour reservation request for ${target} at ${time} has been received. Admin will check each venue and cast stop in the itinerary.`,
        ja: `${target}の${time}のツアー予約リクエストを受け付けました。管理者が行程内の各店舗とキャストを確認します。`,
        ko: `${target} ${time} 투어 예약 요청이 접수되었습니다. 관리자가 일정의 각 매장과 캐스트를 확인합니다.`,
        zh: `已收到你预订 ${target} ${time} 行程的请求。管理员会检查行程中的每个场所和 Cast。`,
      }[language];
    }

    if (target) {
      return {
        en: `Your tour reservation request for ${target} has been received. Admin will check each venue and cast stop in the itinerary.`,
        ja: `${target}のツアー予約リクエストを受け付けました。管理者が行程内の各店舗とキャストを確認します。`,
        ko: `${target} 투어 예약 요청이 접수되었습니다. 관리자가 일정의 각 매장과 캐스트를 확인합니다.`,
        zh: `已收到你预订 ${target} 行程的请求。管理员会检查行程中的每个场所和 Cast。`,
      }[language];
    }

    return {
      en: "Your tour reservation request has been received. Admin will check each venue and cast stop in the itinerary.",
      ja: "ツアー予約リクエストを受け付けました。管理者が行程内の各店舗とキャストを確認します。",
      ko: "투어 예약 요청이 접수되었습니다. 관리자가 일정의 각 매장과 캐스트를 확인합니다.",
      zh: "已收到你的行程预订请求。管理员会检查行程中的每个场所和 Cast。",
    }[language];
  }

  const bookingRecordedMatch = normalized.match(
    /^Lịch đặt tại\s+(.+?)\s+đã được ghi nhận\.\s+Admin sẽ xác nhận sớm\.$/i,
  );
  if (bookingRecordedMatch) {
    const storeName = translateText(bookingRecordedMatch[1] ?? "", language);
    return {
      en: `Your reservation at ${storeName} has been received. Admin will confirm soon.`,
      ja: `${storeName}の予約リクエストを受け付けました。管理者がまもなく確認します。`,
      ko: `${storeName} 예약 요청이 접수되었습니다. 관리자가 곧 확인합니다.`,
      zh: `已收到你在 ${storeName} 的预订请求。管理员会尽快确认。`,
    }[language];
  }

  const ownBookingRequestMatch = normalized.match(
    /^Yêu cầu đặt bàn của bạn đã được ghi nhận\.\s+Admin sẽ xác nhận sớm\.$/i,
  );
  if (ownBookingRequestMatch) {
    return {
      en: "Your reservation request has been received. Admin will confirm soon.",
      ja: "予約リクエストを受け付けました。管理者がまもなく確認します。",
      ko: "예약 요청이 접수되었습니다. 관리자가 곧 확인합니다.",
      zh: "已收到你的预约请求。管理员会尽快确认。",
    }[language];
  }

  const bookingRequestWithTimeMatch = normalized.match(
    /^Yêu cầu đặt(?:\s+bàn tại)?\s+(.+?)\s+lúc\s+(.+?)\s+đã được ghi nhận\.\s+Admin sẽ xác nhận sớm\.$/i,
  );
  if (bookingRequestWithTimeMatch) {
    const target = translateText(bookingRequestWithTimeMatch[1] ?? "", language);
    const time = bookingRequestWithTimeMatch[2] ?? "";
    return {
      en: `Your reservation request for ${target} at ${time} has been received. Admin will confirm soon.`,
      ja: `${target}の${time}の予約リクエストを受け付けました。管理者がまもなく確認します。`,
      ko: `${target} ${time} 예약 요청이 접수되었습니다. 관리자가 곧 확인합니다.`,
      zh: `已收到你预订 ${target} ${time} 的请求。管理员会尽快确认。`,
    }[language];
  }

  const bookingRequestMatch = normalized.match(
    /^Yêu cầu đặt(?:\s+bàn tại)?\s+(.+?)\s+đã được ghi nhận\.\s+Admin sẽ xác nhận sớm\.$/i,
  );
  if (bookingRequestMatch) {
    const target = translateText(bookingRequestMatch[1] ?? "", language);
    return {
      en: `Your reservation request for ${target} has been received. Admin will confirm soon.`,
      ja: `${target}の予約リクエストを受け付けました。管理者がまもなく確認します。`,
      ko: `${target} 예약 요청이 접수되었습니다. 관리자가 곧 확인합니다.`,
      zh: `已收到你预订 ${target} 的请求。管理员会尽快确认。`,
    }[language];
  }

  const billSubmittedMatch = normalized.match(
    /^Hóa đơn\s+(.+?)\s+tại\s+(.+?)(?:\s+\((.+?)\))?\s+đã được gửi,\s+đang chờ Admin duyệt\.$/i,
  );
  if (billSubmittedMatch) {
    const billNumber = billSubmittedMatch[1] ?? "";
    const storeName = translateText(billSubmittedMatch[2] ?? "", language);
    const amount = billSubmittedMatch[3] ? ` (${billSubmittedMatch[3]})` : "";
    return {
      en: `Bill ${billNumber} at ${storeName}${amount} has been submitted and is waiting for Admin review.`,
      ja: `${storeName}の請求書 ${billNumber}${amount} を送信しました。管理者の確認待ちです。`,
      ko: `${storeName}의 영수증 ${billNumber}${amount}이 제출되었으며 관리자 검토 대기 중입니다.`,
      zh: `${storeName} 的账单 ${billNumber}${amount} 已提交，正在等待管理员审核。`,
    }[language];
  }

  const billVerifiedMatch = normalized.match(
    /^Admin đã duyệt hóa đơn\s+(.+?)\s+tại\s+(.+?)\.(?:\s+Bạn được cộng\s+(.+?)\s+điểm\.)?$/i,
  );
  if (billVerifiedMatch) {
    const billNumber = billVerifiedMatch[1] ?? "";
    const storeName = translateText(billVerifiedMatch[2] ?? "", language);
    const points = billVerifiedMatch[3] ?? "";
    if (points) {
      return {
        en: `Admin approved bill ${billNumber} at ${storeName}. You earned ${points} points.`,
        ja: `管理者が${storeName}の請求書 ${billNumber} を承認しました。${points}ポイントが付与されました。`,
        ko: `관리자가 ${storeName}의 영수증 ${billNumber}을 승인했습니다. ${points}포인트가 적립되었습니다.`,
        zh: `管理员已通过 ${storeName} 的账单 ${billNumber}。你获得了 ${points} 积分。`,
      }[language];
    }

    return {
      en: `Admin approved bill ${billNumber} at ${storeName}.`,
      ja: `管理者が${storeName}の請求書 ${billNumber} を承認しました。`,
      ko: `관리자가 ${storeName}의 영수증 ${billNumber}을 승인했습니다.`,
      zh: `管理员已通过 ${storeName} 的账单 ${billNumber}。`,
    }[language];
  }

  const billRejectedMatch = normalized.match(
    /^Admin đã từ chối hóa đơn\s+(.+?)\s+tại\s+(.+?)\.\s+(?:Lý do:\s+(.+?)\.|Vui lòng kiểm tra lại chứng từ\.)$/i,
  );
  if (billRejectedMatch) {
    const billNumber = billRejectedMatch[1] ?? "";
    const storeName = translateText(billRejectedMatch[2] ?? "", language);
    const reason = billRejectedMatch[3] ?? "";
    if (reason) {
      return {
        en: `Admin rejected bill ${billNumber} at ${storeName}. Reason: ${reason}.`,
        ja: `管理者が${storeName}の請求書 ${billNumber} を却下しました。理由: ${reason}。`,
        ko: `관리자가 ${storeName}의 영수증 ${billNumber}을 거절했습니다. 사유: ${reason}.`,
        zh: `管理员已拒绝 ${storeName} 的账单 ${billNumber}。原因：${reason}。`,
      }[language];
    }

    return {
      en: `Admin rejected bill ${billNumber} at ${storeName}. Please check the evidence again.`,
      ja: `管理者が${storeName}の請求書 ${billNumber} を却下しました。証憑を再確認してください。`,
      ko: `관리자가 ${storeName}의 영수증 ${billNumber}을 거절했습니다. 증빙을 다시 확인해 주세요.`,
      zh: `管理员已拒绝 ${storeName} 的账单 ${billNumber}。请重新检查凭证。`,
    }[language];
  }

  const bookingChangedMatch = normalized.match(
    /^Lịch đặt tại\s+(.+?)(?:\s+từ\s+(.+?)\s+sang\s+(.+?)|\s+sang\s+(.+?))?\s+đã được cập nhật\.$/i,
  );
  if (bookingChangedMatch) {
    const target = translateText(bookingChangedMatch[1] ?? "", language);
    const previousTime = bookingChangedMatch[2] ?? "";
    const nextTime = bookingChangedMatch[3] ?? bookingChangedMatch[4] ?? "";
    if (previousTime && nextTime) {
      return {
        en: `Your reservation at ${target} was changed from ${previousTime} to ${nextTime}.`,
        ja: `${target}の予約は${previousTime}から${nextTime}に変更されました。`,
        ko: `${target} 예약이 ${previousTime}에서 ${nextTime}(으)로 변경되었습니다.`,
        zh: `${target} 的预约已从 ${previousTime} 改为 ${nextTime}。`,
      }[language];
    }

    if (nextTime) {
      return {
        en: `Your reservation at ${target} was changed to ${nextTime}.`,
        ja: `${target}の予約は${nextTime}に変更されました。`,
        ko: `${target} 예약이 ${nextTime}(으)로 변경되었습니다.`,
        zh: `${target} 的预约已改为 ${nextTime}。`,
      }[language];
    }

    return {
      en: `Your reservation at ${target} has been updated.`,
      ja: `${target}の予約が更新されました。`,
      ko: `${target} 예약이 업데이트되었습니다.`,
      zh: `${target} 的预约已更新。`,
    }[language];
  }

  const bookingRescheduleRejectedMatch = normalized.match(
    /^Yêu cầu đổi lịch tại\s+(.+?)\s+chưa được Admin duyệt\.(?:\s+Ghi chú:\s+(.+?)\.)?$/i,
  );
  if (bookingRescheduleRejectedMatch) {
    const target = translateText(bookingRescheduleRejectedMatch[1] ?? "", language);
    const note = bookingRescheduleRejectedMatch[2] ?? "";
    if (note) {
      return {
        en: `The reschedule request at ${target} was not approved by Admin. Note: ${note}.`,
        ja: `${target}の予約変更リクエストは管理者に承認されていません。メモ: ${note}。`,
        ko: `${target} 예약 변경 요청이 관리자에게 승인되지 않았습니다. 메모: ${note}.`,
        zh: `${target} 的改期请求未获管理员批准。备注：${note}。`,
      }[language];
    }

    return {
      en: `The reschedule request at ${target} was not approved by Admin.`,
      ja: `${target}の予約変更リクエストは管理者に承認されていません。`,
      ko: `${target} 예약 변경 요청이 관리자에게 승인되지 않았습니다.`,
      zh: `${target} 的改期请求未获管理员批准。`,
    }[language];
  }

  const ownBookingCancelledMatch = normalized.match(
    /^Bạn đã hủy lịch đặt tại\s+(.+?)(?:\s+lúc\s+(.+?))?\.(?:\s+Lý do:\s+(.+?)\.)?$/i,
  );
  if (ownBookingCancelledMatch) {
    const target = translateText(ownBookingCancelledMatch[1] ?? "", language);
    const time = ownBookingCancelledMatch[2] ?? "";
    const reason = ownBookingCancelledMatch[3] ?? "";
    const timeText = time ? ` ${time}` : "";
    const reasonText = reason
      ? {
          en: ` Reason: ${reason}.`,
          ja: ` 理由: ${reason}。`,
          ko: ` 사유: ${reason}.`,
          zh: ` 原因：${reason}。`,
        }[language]
      : "";
    return {
      en: `You cancelled the reservation at ${target}${timeText}.${reasonText}`,
      ja: `${target}${timeText}の予約をキャンセルしました。${reasonText}`,
      ko: `${target}${timeText} 예약을 취소했습니다.${reasonText}`,
      zh: `你已取消 ${target}${timeText} 的预约。${reasonText}`,
    }[language];
  }

  const bookingStatusMatch = normalized.match(
    /^Lịch đặt tại\s+(.+?)(?:\s+lúc\s+(.+?))?\s+đã\s+(được hủy|được check-in|hoàn tất)\.(?:\s+Lý do:\s+(.+?)\.)?$/i,
  );
  if (bookingStatusMatch) {
    const target = translateText(bookingStatusMatch[1] ?? "", language);
    const time = bookingStatusMatch[2] ?? "";
    const status = bookingStatusMatch[3] ?? "";
    const reason = bookingStatusMatch[4] ?? "";
    const timeText = time ? ` ${time}` : "";
    if (status === "được hủy") {
      const reasonText = reason
        ? {
            en: ` Reason: ${reason}.`,
            ja: ` 理由: ${reason}。`,
            ko: ` 사유: ${reason}.`,
            zh: ` 原因：${reason}。`,
          }[language]
        : "";
      return {
        en: `The reservation at ${target}${timeText} was cancelled.${reasonText}`,
        ja: `${target}${timeText}の予約はキャンセルされました。${reasonText}`,
        ko: `${target}${timeText} 예약이 취소되었습니다.${reasonText}`,
        zh: `${target}${timeText} 的预约已取消。${reasonText}`,
      }[language];
    }

    if (status === "được check-in") {
      return {
        en: `The reservation at ${target}${timeText} has been checked in.`,
        ja: `${target}${timeText}の予約はチェックイン済みです。`,
        ko: `${target}${timeText} 예약이 체크인되었습니다.`,
        zh: `${target}${timeText} 的预约已签到。`,
      }[language];
    }

    return {
      en: `The reservation at ${target}${timeText} has been completed.`,
      ja: `${target}${timeText}の予約が完了しました。`,
      ko: `${target}${timeText} 예약이 완료되었습니다.`,
      zh: `${target}${timeText} 的预约已完成。`,
    }[language];
  }

  const bookingGenericUpdateMatch = normalized.match(/^Lịch đặt tại\s+(.+?)\s+vừa có cập nhật mới\.$/i);
  if (bookingGenericUpdateMatch) {
    const target = translateText(bookingGenericUpdateMatch[1] ?? "", language);
    return {
      en: `Your reservation at ${target} has a new update.`,
      ja: `${target}の予約に新しい更新があります。`,
      ko: `${target} 예약에 새 업데이트가 있습니다.`,
      zh: `${target} 的预约有新的更新。`,
    }[language];
  }

  const unreadNotificationMatch = normalized.match(/^(\d+)\s+thông báo chưa đọc$/i);
  if (unreadNotificationMatch) {
    const count = unreadNotificationMatch[1] ?? "";
    return {
      en: `${count} unread notifications`,
      ja: `未読通知 ${count}件`,
      ko: `읽지 않은 알림 ${count}개`,
      zh: `${count} 条未读通知`,
    }[language];
  }

  const openUntilMatch = normalized.match(/^(?:Đang mở đến|Mở đến)\s+(.+)$/i);
  if (openUntilMatch) {
    const time = openUntilMatch[1] ?? "";
    return {
      en: `Open until ${time}`,
      ja: `${time}まで営業`,
      ko: `${time}까지 영업`,
      zh: `营业至 ${time}`,
    }[language];
  }

  const hourCountMatch = normalized.match(/^(\d+)\s+giờ$/i);
  if (hourCountMatch) {
    const count = hourCountMatch[1] ?? "";
    return {
      en: `${count} hours`,
      ja: `${count}時間`,
      ko: `${count}시간`,
      zh: `${count}小时`,
    }[language];
  }

  if (/^vừa xong$/i.test(normalized)) {
    return {
      en: "Just now",
      ja: "たった今",
      ko: "방금",
      zh: "刚刚",
    }[language];
  }

  const minuteCountMatch = normalized.match(/^(\d+)\s+phút$/i);
  if (minuteCountMatch) {
    const count = minuteCountMatch[1] ?? "";
    return {
      en: `${count} minutes`,
      ja: `${count}分`,
      ko: `${count}분`,
      zh: `${count}分钟`,
    }[language];
  }

  const dayCountMatch = normalized.match(/^(\d+)\s+ngày$/i);
  if (dayCountMatch) {
    const count = dayCountMatch[1] ?? "";
    return {
      en: `${count} days`,
      ja: `${count}日`,
      ko: `${count}일`,
      zh: `${count}天`,
    }[language];
  }

  const readTimeMatch = normalized.match(/^(\d+)\s+phút đọc$/i);
  if (readTimeMatch) {
    const count = readTimeMatch[1] ?? "";
    return {
      en: `${count} min read`,
      ja: `${count}分で読めます`,
      ko: `${count}분 읽기`,
      zh: `${count} 分钟阅读`,
    }[language];
  }

  const matchingDealsMatch = normalized.match(/^(\d+)\s+ưu đãi phù hợp$/i);
  if (matchingDealsMatch) {
    const count = matchingDealsMatch[1] ?? "";
    return {
      en: `${count} matching deals`,
      ja: `一致する特典 ${count}件`,
      ko: `조건에 맞는 혜택 ${count}개`,
      zh: `${count} 个匹配优惠`,
    }[language];
  }

  const expiryMatch = normalized.match(/^HSD\s+(.+)$/i);
  if (expiryMatch) {
    const date = expiryMatch[1] ?? "";
    return {
      en: `Valid until ${date}`,
      ja: `有効期限 ${date}`,
      ko: `${date}까지 유효`,
      zh: `有效期至 ${date}`,
    }[language];
  }

  const castAreaMatch = normalized.match(/^Cast\s+(.+)$/i);
  if (castAreaMatch) {
    const area = translateText(castAreaMatch[1] ?? "", language);
    return {
      en: `Cast in ${area}`,
      ja: `${area}のキャスト`,
      ko: `${area} Cast`,
      zh: `${area} Cast`,
    }[language];
  }

  const featuredCategoryMatch = normalized.match(/^Nổi bật\s+·\s+(.+)$/i);
  if (featuredCategoryMatch) {
    const category = translateText(featuredCategoryMatch[1] ?? "", language);
    return {
      en: `Featured · ${category}`,
      ja: `注目 · ${category}`,
      ko: `추천 · ${category}`,
      zh: `精选 · ${category}`,
    }[language];
  }

  const delimitedText = translateDelimitedText(normalized, language);
  if (delimitedText) return delimitedText;

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

function readCookieLanguage(cookieName: string): LanguageCode | null {
  if (typeof document === "undefined") return null;

  const cookieLanguages = document.cookie
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item.startsWith(`${cookieName}=`))
    .map((item) => item.slice(cookieName.length + 1))
    .flatMap((rawValue) => {
      try {
        const decodedValue = decodeURIComponent(rawValue);
        return isLanguageCode(decodedValue) ? [decodedValue] : [];
      } catch {
        return isLanguageCode(rawValue) ? [rawValue] : [];
      }
    });

  return cookieLanguages[cookieLanguages.length - 1] ?? null;
}

function readLanguageCookie(): LanguageCode | null {
  return readCookieLanguage(sharedLanguageCookieName) ?? readCookieLanguage(languageCookieName);
}

function getSharedLanguageCookieDomain(hostname: string) {
  const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");
  const sharedHostname = normalizedHostname.replace(/^(auth|admin|partner|api)\./, "");

  if (
    !sharedHostname ||
    sharedHostname === "localhost" ||
    sharedHostname.endsWith(".localhost") ||
    sharedHostname.includes(":") ||
    /^\d{1,3}(\.\d{1,3}){3}$/.test(sharedHostname)
  ) {
    return null;
  }

  return sharedHostname;
}

function isPortalLanguageHost(hostname: string) {
  const normalizedHostname = hostname.toLowerCase().replace(/^www\./, "");
  return /^(auth|admin|partner)\./.test(normalizedHostname);
}

function writeCookieLanguage(cookieName: string, language: LanguageCode) {
  if (typeof document === "undefined") return;

  const cookieValue = `${cookieName}=${encodeURIComponent(
    language,
  )}; path=/; max-age=31536000; SameSite=Lax`;
  document.cookie = cookieValue;

  if (typeof window === "undefined") return;

  const sharedDomain = getSharedLanguageCookieDomain(window.location.hostname);
  if (sharedDomain) {
    document.cookie = `${cookieValue}; domain=.${sharedDomain}`;
  }
}

function writeLanguageCookie(language: LanguageCode) {
  writeCookieLanguage(languageCookieName, language);
  writeCookieLanguage(sharedLanguageCookieName, language);
}

function readLocalStorageLanguage(): LanguageCode | null {
  try {
    const storedLanguage = window.localStorage.getItem(languageStorageKey);
    return isLanguageCode(storedLanguage) ? storedLanguage : null;
  } catch {
    return null;
  }
}

function writeLocalStorageLanguage(language: LanguageCode) {
  try {
    window.localStorage.setItem(languageStorageKey, language);
  } catch {
    // Language selection should still work when storage is unavailable.
  }
}

function readUrlLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null;

  try {
    const urlLanguage = new URLSearchParams(window.location.search).get("lang");
    return isLanguageCode(urlLanguage) ? urlLanguage : null;
  } catch {
    return null;
  }
}

export function readStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return defaultLanguageCode;

  const urlLanguage = readUrlLanguage();
  const cookieLanguage = readLanguageCookie();
  const localStorageLanguage = readLocalStorageLanguage();

  if (urlLanguage && !isPortalLanguageHost(window.location.hostname)) {
    writeLocalStorageLanguage(urlLanguage);
    writeLanguageCookie(urlLanguage);
    return urlLanguage;
  }

  if (isPortalLanguageHost(window.location.hostname) && cookieLanguage) {
    writeLocalStorageLanguage(cookieLanguage);
    writeLanguageCookie(cookieLanguage);
    return cookieLanguage;
  }

  if (localStorageLanguage) {
    writeLanguageCookie(localStorageLanguage);
    return localStorageLanguage;
  }

  if (cookieLanguage) {
    writeLocalStorageLanguage(cookieLanguage);
    return cookieLanguage;
  }

  return defaultLanguageCode;
}

export function storeLanguagePreference(language: LanguageCode) {
  writeLocalStorageLanguage(language);
  writeLanguageCookie(language);
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
