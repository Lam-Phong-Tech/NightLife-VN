import { translateText, type LanguageCode } from "@/lib/i18n/client-translations";

type CastProfileCopy = {
  acceptingTonight: string;
  areaUpdating: string;
  backToCastList: string;
  birthMonth: string;
  bookThisCast: string;
  closeGallery: string;
  currentVenue: string;
  defaultStyle: string;
  favorite: string;
  gallery: string;
  galleryCount: (count: number) => string;
  home: string;
  interests: string;
  introduction: string;
  language: string;
  mediaNext: string;
  mediaPrevious: string;
  openGallery: string;
  openSnsVideo: string;
  openVideo: string;
  photoNext: string;
  photoPrevious: string;
  rankingJune: string;
  rankingThisMonth: string;
  removeFavorite: string;
  similarCast: string;
  storeOpen: string;
  style: string;
  viewAll: string;
  viewVenue: string;
  zodiac: string;
};

const castProfileCopy: Record<LanguageCode, CastProfileCopy> = {
  vi: {
    acceptingTonight: "Đang nhận đặt tối nay",
    areaUpdating: "Khu vực đang cập nhật",
    backToCastList: "Quay lại danh sách cast",
    birthMonth: "Tháng sinh",
    bookThisCast: "Đặt cast này",
    closeGallery: "Đóng gallery",
    currentVenue: "Quán đang thuộc về",
    defaultStyle: "Thanh lịch · Ấm áp",
    favorite: "Lưu cast",
    gallery: "Thư viện ảnh",
    galleryCount: (count) => `${count} ảnh`,
    home: "Trang chủ",
    interests: "Sở thích",
    introduction: "Giới thiệu",
    language: "Ngôn ngữ",
    mediaNext: "Media sau",
    mediaPrevious: "Media trước",
    openGallery: "Mở gallery cast",
    openSnsVideo: "Mở video SNS",
    openVideo: "Mở video cast",
    photoNext: "Ảnh tiếp theo",
    photoPrevious: "Ảnh trước",
    rankingJune: "#1 Ranking tháng 6",
    rankingThisMonth: "#1 Ranking tháng này",
    removeFavorite: "Bỏ lưu cast",
    similarCast: "Cast tương tự",
    storeOpen: "Đang mở",
    style: "Phong cách",
    viewAll: "Xem tất cả",
    viewVenue: "Xem quán",
    zodiac: "Cung",
  },
  en: {
    acceptingTonight: "Accepting bookings tonight",
    areaUpdating: "Area updating",
    backToCastList: "Back to Cast list",
    birthMonth: "Birth month",
    bookThisCast: "Book this Cast",
    closeGallery: "Close gallery",
    currentVenue: "Current venue",
    defaultStyle: "Elegant · Warm",
    favorite: "Save Cast",
    gallery: "Photo gallery",
    galleryCount: (count) => `${count} ${count === 1 ? "photo" : "photos"}`,
    home: "Home",
    interests: "Interests",
    introduction: "Introduction",
    language: "Language",
    mediaNext: "Next media",
    mediaPrevious: "Previous media",
    openGallery: "Open Cast gallery",
    openSnsVideo: "Open SNS video",
    openVideo: "Open Cast video",
    photoNext: "Next photo",
    photoPrevious: "Previous photo",
    rankingJune: "#1 Ranking in June",
    rankingThisMonth: "#1 Ranking this month",
    removeFavorite: "Remove saved Cast",
    similarCast: "Similar Cast",
    storeOpen: "Open now",
    style: "Style",
    viewAll: "View all",
    viewVenue: "View venue",
    zodiac: "Zodiac",
  },
  ja: {
    acceptingTonight: "今夜予約受付中",
    areaUpdating: "エリア更新中",
    backToCastList: "キャスト一覧へ戻る",
    birthMonth: "誕生月",
    bookThisCast: "このキャストを予約",
    closeGallery: "ギャラリーを閉じる",
    currentVenue: "現在の店舗",
    defaultStyle: "上品 · 温かい",
    favorite: "キャストを保存",
    gallery: "フォトギャラリー",
    galleryCount: (count) => `${count}枚`,
    home: "ホーム",
    interests: "興味",
    introduction: "紹介",
    language: "言語",
    mediaNext: "次のメディア",
    mediaPrevious: "前のメディア",
    openGallery: "キャストギャラリーを開く",
    openSnsVideo: "SNS動画を開く",
    openVideo: "キャスト動画を開く",
    photoNext: "次の写真",
    photoPrevious: "前の写真",
    rankingJune: "6月ランキング #1",
    rankingThisMonth: "今月ランキング #1",
    removeFavorite: "保存を解除",
    similarCast: "似ているキャスト",
    storeOpen: "営業中",
    style: "スタイル",
    viewAll: "すべて見る",
    viewVenue: "店舗を見る",
    zodiac: "星座",
  },
  ko: {
    acceptingTonight: "오늘 밤 예약 가능",
    areaUpdating: "지역 업데이트 중",
    backToCastList: "캐스트 목록으로 돌아가기",
    birthMonth: "생월",
    bookThisCast: "이 Cast 예약",
    closeGallery: "갤러리 닫기",
    currentVenue: "현재 매장",
    defaultStyle: "우아함 · 따뜻함",
    favorite: "Cast 저장",
    gallery: "사진 갤러리",
    galleryCount: (count) => `${count}장`,
    home: "홈",
    interests: "관심사",
    introduction: "소개",
    language: "언어",
    mediaNext: "다음 미디어",
    mediaPrevious: "이전 미디어",
    openGallery: "Cast 갤러리 열기",
    openSnsVideo: "SNS 동영상 열기",
    openVideo: "Cast 동영상 열기",
    photoNext: "다음 사진",
    photoPrevious: "이전 사진",
    rankingJune: "6월 랭킹 #1",
    rankingThisMonth: "이번 달 랭킹 #1",
    removeFavorite: "저장 해제",
    similarCast: "비슷한 Cast",
    storeOpen: "영업 중",
    style: "스타일",
    viewAll: "전체 보기",
    viewVenue: "매장 보기",
    zodiac: "별자리",
  },
  zh: {
    acceptingTonight: "今晚可预订",
    areaUpdating: "区域更新中",
    backToCastList: "返回 Cast 列表",
    birthMonth: "出生月份",
    bookThisCast: "预约此 Cast",
    closeGallery: "关闭相册",
    currentVenue: "当前场所",
    defaultStyle: "优雅 · 温暖",
    favorite: "收藏 Cast",
    gallery: "照片相册",
    galleryCount: (count) => `${count} 张照片`,
    home: "首页",
    interests: "兴趣",
    introduction: "介绍",
    language: "语言",
    mediaNext: "下一个媒体",
    mediaPrevious: "上一个媒体",
    openGallery: "打开 Cast 相册",
    openSnsVideo: "打开 SNS 视频",
    openVideo: "打开 Cast 视频",
    photoNext: "下一张照片",
    photoPrevious: "上一张照片",
    rankingJune: "6月排名 #1",
    rankingThisMonth: "本月排名 #1",
    removeFavorite: "取消收藏 Cast",
    similarCast: "相似 Cast",
    storeOpen: "营业中",
    style: "风格",
    viewAll: "查看全部",
    viewVenue: "查看场所",
    zodiac: "星座",
  },
};

const castLabelTranslations: Record<string, Partial<Record<LanguageCode, string>>> = {
  "Ấm áp": { en: "Warm", ja: "温かい", ko: "따뜻함", zh: "温暖" },
  "Chưa cập nhật": { en: "Updating", ja: "更新中", ko: "업데이트 중", zh: "更新中" },
  "Cùng khu vực": { en: "Same area", ja: "同じエリア", ko: "같은 지역", zh: "同一区域" },
  "Cùng quán": { en: "Same venue", ja: "同じ店舗", ko: "같은 매장", zh: "同一场所" },
  "Dance": { en: "Dance", ja: "ダンス", ko: "댄스", zh: "舞蹈" },
  "Đa ngôn ngữ": { en: "Multilingual", ja: "多言語", ko: "다국어", zh: "多语言" },
  "Đang ranking": { en: "Ranking now", ja: "ランキング中", ko: "랭킹 중", zh: "排名中" },
  "Độ tuổi 20": { en: "20s", ja: "20代", ko: "20대", zh: "20多岁" },
  "Độ tuổi 30": { en: "30s", ja: "30代", ko: "30대", zh: "30多岁" },
  "Điềm tĩnh": { en: "Calm", ja: "落ち着いた", ko: "차분함", zh: "沉稳" },
  "Gentle": { en: "Gentle", ja: "優しい", ko: "부드러움", zh: "温柔" },
  "Hợp khách Nhật": { en: "Good for Japanese guests", ja: "日本のお客様向け", ko: "일본 고객에게 적합", zh: "适合日本客人" },
  "Hợp tag": { en: "Matching tags", ja: "タグ一致", ko: "태그 매칭", zh: "标签匹配" },
  "Japanese style": { en: "Japanese style", ja: "和風", ko: "일본 스타일", zh: "日式风格" },
  "Năng động": { en: "Energetic", ja: "活発", ko: "활기찬", zh: "活力" },
  "Song ngữ": { en: "Bilingual", ja: "バイリンガル", ko: "이중 언어", zh: "双语" },
  "Thanh lịch": { en: "Elegant", ja: "上品", ko: "우아함", zh: "优雅" },
  "Thân thiện": { en: "Friendly", ja: "フレンドリー", ko: "친절함", zh: "友好" },
  "Tinh tế": { en: "Refined", ja: "洗練", ko: "세련됨", zh: "精致" },
};

export function getCastProfileCopy(language: LanguageCode) {
  return castProfileCopy[language] ?? castProfileCopy.vi;
}

export function localizeCastText(value: string, language: LanguageCode) {
  if (language === "vi") return value;
  return castLabelTranslations[value]?.[language] ?? translateText(value, language);
}
