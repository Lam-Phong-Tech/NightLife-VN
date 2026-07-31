import type { LanguageCode } from "./client-translations";

type LocalizedLabels = Record<LanguageCode, string>;

const categoryLabels: Record<string, LocalizedLabels> = {
  LOUNGE: {
    vi: "Lounge",
    en: "Lounge",
    ja: "ラウンジ",
    ko: "라운지",
    zh: "休闲酒廊",
  },
  KYABAKURA: {
    vi: "Kyabakura",
    en: "Kyabakura",
    ja: "キャバクラ",
    ko: "캬바쿠라",
    zh: "陪酒俱乐部",
  },
  GIRLS_BAR: {
    vi: "Girls Bar",
    en: "Girls Bar",
    ja: "ガールズバー",
    ko: "걸즈 바",
    zh: "女孩酒吧",
  },
  SNACK: {
    vi: "Snack",
    en: "Snack",
    ja: "スナック",
    ko: "스낵 바",
    zh: "小酒馆",
  },
  BAR: {
    vi: "Bar",
    en: "Bar",
    ja: "バー",
    ko: "바",
    zh: "酒吧",
  },
  CLUB: {
    vi: "Club",
    en: "Club",
    ja: "クラブ",
    ko: "클럽",
    zh: "夜店",
  },
  KARAOKE: {
    vi: "Karaoke",
    en: "Karaoke",
    ja: "カラオケ",
    ko: "노래방",
    zh: "卡拉OK",
  },
  MASSAGE_SPA: {
    vi: "Massage",
    en: "Massage",
    ja: "マッサージ",
    ko: "마사지",
    zh: "按摩",
  },
  RESTAURANT: {
    vi: "Nhà hàng",
    en: "Restaurant",
    ja: "レストラン",
    ko: "레스토랑",
    zh: "餐厅",
  },
  CASINO: {
    vi: "Casino",
    en: "Casino",
    ja: "カジノ",
    ko: "카지노",
    zh: "赌场",
  },
};

const languageLabels: Record<string, LocalizedLabels> = {
  ja: { vi: "Tiếng Nhật Bản", en: "Japanese", ja: "日本語", ko: "일본어", zh: "日语" },
  ko: { vi: "Tiếng Hàn Quốc", en: "Korean", ja: "韓国語", ko: "한국어", zh: "韩语" },
  zh: { vi: "Tiếng Trung Quốc", en: "Chinese", ja: "中国語", ko: "중국어", zh: "中文" },
  en: { vi: "Tiếng Anh", en: "English", ja: "英語", ko: "영어", zh: "英语" },
};

const cityLabels: Record<string, LocalizedLabels> = {
  hn: { vi: "Hà Nội", en: "Hanoi", ja: "ハノイ", ko: "하노이", zh: "河内" },
  hcm: { vi: "TP.HCM", en: "Ho Chi Minh City", ja: "ホーチミン市", ko: "호찌민시", zh: "胡志明市" },
  vietnam: { vi: "Việt Nam", en: "Vietnam", ja: "ベトナム", ko: "베트남", zh: "越南" },
};

const areaLabels: Record<string, LocalizedLabels> = {
  "Ba Dinh": { vi: "Ba Đình", en: "Ba Dinh", ja: "バーディン", ko: "바딘", zh: "巴亭" },
  "Tay Ho": { vi: "Tây Hồ", en: "Tay Ho", ja: "タイホー", ko: "떠이호", zh: "西湖" },
  "Cau Giay": { vi: "Cầu Giấy", en: "Cau Giay", ja: "カウザイ", ko: "꺼우저이", zh: "纸桥" },
  "Nam Tu Liem": { vi: "Nam Từ Liêm", en: "Nam Tu Liem", ja: "ナムトゥーリエム", ko: "남뜨리엠", zh: "南慈廉" },
  "Hoan Kiem": { vi: "Hoàn Kiếm", en: "Hoan Kiem", ja: "ホアンキエム", ko: "호안끼엠", zh: "还剑" },
  "Hai Ba Trung": { vi: "Hai Bà Trưng", en: "Hai Ba Trung", ja: "ハイバーチュン", ko: "하이바쯩", zh: "征夫人" },
  "Quan 1": { vi: "Quận 1", en: "District 1", ja: "1区", ko: "1군", zh: "第1郡" },
  "Quan 3": { vi: "Quận 3", en: "District 3", ja: "3区", ko: "3군", zh: "第3郡" },
  "Quan 7": { vi: "Quận 7", en: "District 7", ja: "7区", ko: "7군", zh: "第7郡" },
  "Thao Dien": { vi: "Thảo Điền", en: "Thao Dien", ja: "タオディエン", ko: "타오디엔", zh: "草田" },
  "Binh Thanh": { vi: "Bình Thạnh", en: "Binh Thanh", ja: "ビンタン", ko: "빈타인", zh: "平盛" },
  "Phu Nhuan": { vi: "Phú Nhuận", en: "Phu Nhuan", ja: "フーニュアン", ko: "푸년", zh: "富润" },
};

const normalizeLabelKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const areaLabelAliases = Object.fromEntries(
  Object.entries(areaLabels).flatMap(([key, labels]) => [
    [normalizeLabelKey(key), labels],
    [normalizeLabelKey(labels.vi), labels],
  ]),
) as Record<string, LocalizedLabels>;

export const getFilterCategoryLabel = (category: string, language: LanguageCode) =>
  categoryLabels[category]?.[language] ?? category;

export const getFilterLanguageLabel = (languageCode: string, language: LanguageCode) =>
  languageLabels[languageCode]?.[language] ?? languageCode.toUpperCase();

export const getFilterCityLabel = (cityCode: string, language: LanguageCode) =>
  cityLabels[cityCode]?.[language] ?? cityCode;

export const getFilterAreaLabel = (areaName: string, language: LanguageCode) =>
  areaLabelAliases[normalizeLabelKey(areaName)]?.[language] ?? areaName;
