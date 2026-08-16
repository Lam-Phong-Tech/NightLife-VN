import type { LanguageCode } from "./client-translations";
import { vietnamLocationLatinNames } from "./generated-vietnam-location-labels";

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
  hp: { vi: "Hải Phòng", en: "Hai Phong", ja: "ハイフォン", ko: "하이퐁", zh: "海防" },
  dn: { vi: "Đà Nẵng", en: "Da Nang", ja: "ダナン", ko: "다낭", zh: "岘港" },
  vietnam: { vi: "Việt Nam", en: "Vietnam", ja: "ベトナム", ko: "베트남", zh: "越南" },
};

const vietnamCityNames: Record<string, string> = {
  caobang: "Cao Bằng",
  dienbien: "Điện Biên",
  hatinh: "Hà Tĩnh",
  laichau: "Lai Châu",
  langson: "Lạng Sơn",
  nghean: "Nghệ An",
  quangninh: "Quảng Ninh",
  sonla: "Sơn La",
  thanhhoa: "Thanh Hóa",
  hn: "Hà Nội",
  hue: "Huế",
  laocai: "Lào Cai",
  thainguyen: "Thái Nguyên",
  phutho: "Phú Thọ",
  bacninh: "Bắc Ninh",
  hungyen: "Hưng Yên",
  hp: "Hải Phòng",
  ninhbinh: "Ninh Bình",
  quangtri: "Quảng Trị",
  dn: "Đà Nẵng",
  quangngai: "Quảng Ngãi",
  gialai: "Gia Lai",
  khanhhoa: "Khánh Hòa",
  lamdong: "Lâm Đồng",
  daklak: "Đắk Lắk",
  hcm: "Hồ Chí Minh",
  dongnai: "Đồng Nai",
  tayninh: "Tây Ninh",
  cantho: "Cần Thơ",
  vinhlong: "Vĩnh Long",
  dongthap: "Đồng Tháp",
  camau: "Cà Mau",
  angiang: "An Giang",
  tuyenquang: "Tuyên Quang",
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
  "Phường Sài Gòn": { vi: "Phường Sài Gòn", en: "Sai Gon Ward", ja: "サイゴン区", ko: "사이공 구", zh: "西贡坊" },
  "Sài Gòn": { vi: "Sài Gòn", en: "Sai Gon", ja: "サイゴン", ko: "사이공", zh: "西贡" },
  "Cống Vị": { vi: "Cống Vị", en: "Cong Vi", ja: "コンビ", ko: "꽁비", zh: "贡维" },
  "Phường Giảng Võ": { vi: "Phường Giảng Võ", en: "Giang Vo Ward", ja: "ザンボー区", ko: "장보 구", zh: "讲武坊" },
  "Giảng Võ": { vi: "Giảng Võ", en: "Giang Vo", ja: "ザンボー", ko: "장보", zh: "讲武" },
  "Phường Ngọc Hà": { vi: "Phường Ngọc Hà", en: "Ngoc Ha Ward", ja: "ゴックハ区", ko: "응옥하 구", zh: "玉河坊" },
  "Ngọc Hà": { vi: "Ngọc Hà", en: "Ngoc Ha", ja: "ゴックハ", ko: "응옥하", zh: "玉河" },
  "Phường Hai Bà Trưng": { vi: "Phường Hai Bà Trưng", en: "Hai Ba Trung Ward", ja: "ハイバーチュン区", ko: "하이바쯩 구", zh: "二征夫人坊" },
  "Hai Bà Trưng": { vi: "Hai Bà Trưng", en: "Hai Ba Trung", ja: "ハイバーチュン", ko: "하이바쯩", zh: "二征夫人" },
  "Hồng Bàng": { vi: "Hồng Bàng", en: "Hong Bang", ja: "ホンバン", ko: "홍방", zh: "鸿庞" },
  "Hải Châu": { vi: "Hải Châu", en: "Hai Chau", ja: "ハイチャウ", ko: "하이쩌우", zh: "海洲" },
  "Sơn Trà": { vi: "Sơn Trà", en: "Son Tra", ja: "ソンチャ", ko: "선짜", zh: "山茶" },
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

const stripAdministrativePrefix = (value: string) =>
  value.replace(/^(?:Phường|Ward)\s+/i, '').trim();

const stripVietnameseDiacritics = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd');

const vietnamLocationLatinName = (value: string) =>
  vietnamLocationLatinNames[normalizeLabelKey(value)] ??
  stripVietnameseDiacritics(value);

const administrativeLocationPrefix = [
  { pattern: /^tỉnh\s+/i, en: "Province", ja: "県", ko: "주", zh: "省" },
  { pattern: /^thành phố\s+/i, en: "City", ja: "市", ko: "시", zh: "市" },
  { pattern: /^quận\s+/i, en: "District", ja: "区", ko: "구", zh: "郡" },
  { pattern: /^huyện\s+/i, en: "District", ja: "郡", ko: "군", zh: "县" },
  { pattern: /^thị xã\s+/i, en: "Town", ja: "市", ko: "시", zh: "市" },
  { pattern: /^thị trấn\s+/i, en: "Township", ja: "町", ko: "읍", zh: "镇" },
  { pattern: /^phường\s+/i, en: "Ward", ja: "区", ko: "구", zh: "坊" },
  { pattern: /^xã\s+/i, en: "Commune", ja: "村", ko: "면", zh: "乡" },
  { pattern: /^ấp\s+/i, en: "Hamlet", ja: "集落", ko: "마을", zh: "邑" },
] as const;

const translateVietnamAdministrativeLabel = (
  value: string,
  language: LanguageCode,
) => {
  if (language === "vi") return value;

  const prefix = administrativeLocationPrefix.find(({ pattern }) =>
    pattern.test(value.trim()),
  );

  if (!prefix) return vietnamLocationLatinName(value);

  const baseName = vietnamLocationLatinName(
    value.replace(prefix.pattern, "").trim(),
  );
  if (language === "en") return `${baseName} ${prefix.en}`;
  return `${baseName}${prefix[language]}`;
};

/**
 * Admin ward options come from provinces.open-api.vn and therefore include
 * wards that are not present in the nightlife area seed. Keep this fallback
 * local and deterministic: it translates the administrative label without
 * adding a network request or shipping a second translation runtime.
 */
const translateDynamicWardLabel = (value: string, language: LanguageCode) => {
  if (!/^(?:Phường|Ward)\s+/i.test(value.trim())) return null;
  if (language === 'vi') return value;

  const wardName = stripAdministrativePrefix(value);
  const romanizedName = stripVietnameseDiacritics(wardName);

  return {
    en: `${romanizedName} Ward`,
    ja: `${romanizedName}区`,
    ko: `${romanizedName} 구`,
    zh: `${romanizedName}坊`,
  }[language];
};

export const getFilterCategoryLabel = (category: string, language: LanguageCode) =>
  categoryLabels[category]?.[language] ?? category;

export const getFilterLanguageLabel = (languageCode: string, language: LanguageCode) =>
  languageLabels[languageCode]?.[language] ?? languageCode.toUpperCase();

export const getFilterCityLabel = (cityCode: string, language: LanguageCode) =>
  cityLabels[cityCode]?.[language] ??
  (vietnamCityNames[cityCode]
    ? translateVietnamAdministrativeLabel(vietnamCityNames[cityCode], language)
    : cityCode);

export const getFilterAreaLabel = (areaName: string, language: LanguageCode) =>
  areaLabelAliases[normalizeLabelKey(areaName)]?.[language] ??
  translateDynamicWardLabel(areaName, language) ??
  translateVietnamAdministrativeLabel(areaName, language);

const generalAreaValues = new Set([
  "",
  "tổng hợp",
  "tong hop",
  "tong_hop",
  "theo khu vực",
  "theo khu vuc",
  "all",
  "trung tâm",
  "trung tam",
]);

/**
 * Pick the most specific usable location returned by public store APIs.
 * Store records can keep a generic area such as "Tổng hợp" alongside their
 * actual ward, which must not be surfaced in customer-facing venue metadata.
 */
export const getPreferredStoreAreaName = (values: {
  ward?: string | null;
  areaWard?: string | null;
  areaName?: string | null;
  district?: string | null;
}) => {
  const candidates = [values.ward, values.areaWard, values.areaName, values.district];

  return candidates.find((value) => {
    if (!value?.trim()) return false;
    return !generalAreaValues.has(normalizeLabelKey(value).replace(/\s+/g, " "));
  }) ?? undefined;
};
