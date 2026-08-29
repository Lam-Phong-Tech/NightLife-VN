import { Injectable, Logger } from '@nestjs/common';

const GOOGLE_TRANSLATE_ENDPOINT =
  'https://translate.googleapis.com/translate_a/single';
const MY_MEMORY_TRANSLATE_ENDPOINT =
  'https://api.mymemory.translated.net/get';

const japaneseStreetNames = new Map<string, string>([
  ['Thái Văn Lung', 'タイヴァンルン'],
  ['Linh Lang', 'リンラン'],
  ['Lê Thánh Tôn', 'レタントン'],
  ['Phan Kế Bính', 'ファンケビン'],
  ['Kim Mã', 'キンマー'],
  ['Đào Tấn', 'ダオタン'],
  ['Kim Mã Thượng', 'キンマートゥオン'],
  ['Mê Linh', 'メーリン'],
  ['Nguyễn Công Trứ', 'グエンコンチュー'],
  ['Nguyễn Văn Ngọc', 'グエンヴァンゴック'],
  ['Phạm Viết Chánh', 'ファムヴィエットチャン'],
  ['Thi Sách', 'ティーサック'],
  ['Triệu Việt Vương', 'チェウヴィエットヴオン'],
  ['Bùi Thị Xuân', 'ブイティスアン'],
  ['Mạc Đĩnh Chi', 'マックディンチ'],
  ['Ngô Văn Năm', 'ゴーヴァンナム'],
  ['Tôn Đức Thắng', 'トンドゥックタン'],
  ['24 Ng. 12 Đào Tấn', 'ダオタン'],
  ['2F /47 P. Linh Lang', 'リンラン'],
]);

function htmlToPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function readGoogleTranslation(payload: unknown) {
  if (!Array.isArray(payload) || !Array.isArray(payload[0])) return null;

  const translated = payload[0]
    .map((segment) => (Array.isArray(segment) ? segment[0] : ''))
    .filter((segment): segment is string => typeof segment === 'string')
    .join('')
    .trim();

  return translated || null;
}

function readMyMemoryTranslation(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;

  const responseData = (payload as { responseData?: unknown }).responseData;
  if (!responseData || typeof responseData !== 'object') return null;

  const translatedText = (responseData as { translatedText?: unknown })
    .translatedText;
  return typeof translatedText === 'string' && translatedText.trim()
    ? translatedText.trim()
    : null;
}

@Injectable()
export class ContentTranslationService {
  private readonly logger = new Logger(ContentTranslationService.name);

  private async translateWithGoogle(source: string) {
    const endpoint =
      process.env.TRANSLATION_API_BASE_URL?.trim() || GOOGLE_TRANSLATE_ENDPOINT;
    const url = new URL(endpoint);
    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', 'vi');
    url.searchParams.set('tl', 'ja');
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', source);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(7_000),
    });
    if (!response.ok) {
      throw new Error(`Google provider returned ${response.status}`);
    }

    return readGoogleTranslation(await response.json());
  }

  private async translateWithMyMemory(source: string) {
    const url = new URL(MY_MEMORY_TRANSLATE_ENDPOINT);
    url.searchParams.set('q', source);
    url.searchParams.set('langpair', 'vi|ja');
    const email = process.env.MYMEMORY_TRANSLATION_EMAIL?.trim();
    if (email) url.searchParams.set('de', email);

    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(7_000),
    });
    if (!response.ok) {
      throw new Error(`MyMemory provider returned ${response.status}`);
    }

    return readMyMemoryTranslation(await response.json());
  }

  async translateVietnameseToJapanese(value?: string | null) {
    const source = value ? htmlToPlainText(value) : '';
    if (!source) return null;
    if (/[\u3040-\u30ff]/u.test(source) && !/[À-ỹ]/u.test(source)) {
      return source;
    }

    if (process.env.TRANSLATION_PROVIDER?.trim().toLowerCase() !== 'mymemory') {
      try {
        const translated = await this.translateWithGoogle(source);
        if (translated) return translated;
      } catch (error) {
        this.logger.warn(
          `Google Japanese translation failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    try {
      return await this.translateWithMyMemory(source);
    } catch (error) {
      this.logger.warn(
        `MyMemory Japanese translation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }

  async translateStreetNameToJapanese(value?: string | null) {
    const source = value?.trim();
    if (!source) return null;

    const reviewed = japaneseStreetNames.get(source);
    if (reviewed) return reviewed;

    const translated = await this.translateVietnameseToJapanese(source);
    return translated?.replace(/[・\s]+/g, '') ?? null;
  }
}

export const contentTranslationInternals = {
  htmlToPlainText,
  readGoogleTranslation,
  readMyMemoryTranslation,
};
