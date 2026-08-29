import type {
  LegalPage,
  LegalPageKey,
  LegalPageSection,
} from "@/lib/api/content";
import type { LanguageCode } from "@/lib/i18n/locales";

type LegalPageTranslation = {
  version: number;
  title: string;
  excerpt: string;
  sections: LegalPageSection[];
};

// Legal copy must be reviewed and versioned rather than translated by a DOM
// extension. Google Translate rewrites React-owned text nodes, which caused
// duplicated policy lines, broken whitespace and navigation crashes.
const japaneseLegalPages: Record<LegalPageKey, LegalPageTranslation> = {
  PRIVACY_POLICY: {
    version: 6,
    title: "プライバシーポリシー",
    excerpt:
      "Vietyoru（以下「本プラットフォーム」）は、ユーザーの個人情報保護を重視しています。本プライバシーポリシーは、当システム上のサービス利用時に、お客様の情報をどのように収集、利用、保護するかを定めるものです。",
    sections: [
      {
        heading: "収集する情報",
        body:
          "最適な予約サービスとサポートを提供するため、以下の情報を収集します：\n- 氏名および連絡先情報（メールアドレス、電話番号、LINE/Zaloアカウント）。\n- 予約情報（来店時間、人数、選択した店舗／キャスト名）。\n- システムアクセスデータ（IPアドレス、Cookieデータ、アクセス端末の種類）。",
      },
      {
        heading: "情報の利用目的",
        body:
          "収集した情報は、以下の目的にのみ使用します：\n- お客様の予約の確認、変更、またはキャンセル。\n- 円滑なお迎えのため、必要な情報を提携店舗へ共有。\n- カスタマーサポートセンターを通じたお問い合わせ対応。\n- システム品質およびユーザー体験の向上、新しいキャンペーン情報の更新。",
      },
      {
        heading: "第三者への提供について",
        body:
          "Vietyoruは、以下の場合を除き、お客様の個人情報を第三者に販売、交換、または提供しません：\n- お客様が予約した提携店舗（予約確認に必要な最小限の情報のみを提供）。\n- 法令に基づき、関係当局から適法な要請があった場合。",
      },
      {
        heading: "セキュリティ対策",
        body:
          "当社は、お客様の個人情報の漏えい、紛失、不正アクセスを防止するため、SSLによるデータ暗号化を含む高度な技術的対策と厳格な管理プロセスを導入しています。",
      },
      {
        heading: "お問い合わせ",
        body:
          "個人情報に関するご質問、訂正、削除のご依頼は、ウェブサイトのお問い合わせフォームまたは公式カスタマーサポート窓口からご連絡ください。",
      },
    ],
  },
  TERMS_OF_USE: {
    version: 3,
    title: "利用規約",
    excerpt:
      "本書は、Vietyoruが提供するナイトライフ施設の情報提供および予約サービスの利用条件を定めるものです。",
    sections: [
      {
        heading: "Vietyoruのサービス範囲と役割",
        body:
          "- Vietyoruは、お客様と提携ナイトライフ施設（バー、ラウンジ、カラオケ／KTVなど）の間で、情報提供および予約連携を支援する仲介プラットフォームです。\n- Vietyoruは情報連携を行う事業者であり、提携施設を直接所有または運営するものではありません。",
      },
      {
        heading: "免責事項",
        body:
          "- 情報の正確性：料金、メニュー、営業時間、スタッフ（キャスト）情報は継続的に更新されますが、来店時の各店舗の実際の方針により変更される場合があります。最終料金は店舗でご確認ください。\n- 店舗で発生した問題：店舗利用中にお客様とレストラン／バー／キャストとの間で発生した紛争、事故、損害について、Vietyoruは直接的な法的責任を負いません。当事者間で協議し、規定に従って解決するものとします。",
      },
      {
        heading: "禁止行為",
        body:
          "Vietyoruのサービス利用時、以下の行為を禁止します：\n- 虚偽情報の提供、架空予約（スパム予約）。\n- 事前連絡なしのキャンセルや無断キャンセル（ノーショー）を繰り返す行為。\n- キャスト、提携施設のスタッフ、Vietyoru運営チームへの嫌がらせ、脅迫、侮辱、迷惑行為。\n- システム運営へ不正に介入、妨害、または影響を与えるツールの使用。",
      },
      {
        heading: "サービスの変更および中断",
        body:
          "Vietyoruは、システム保守または不可抗力が生じた場合、事前通知なくサービスの一部または全部を一時停止・変更することがあります。",
      },
    ],
  },
  OPERATING_POLICY: {
    version: 2,
    title: "予約・キャンセルポリシー",
    excerpt:
      "お客様の権利を最大限に保護し、提携施設とのサービスの信頼性を維持するため、Vietyoruは以下の予約・キャンセルポリシーを定めます。",
    sections: [
      {
        heading: "予約規定",
        body:
          "- 予約手数料：Vietyoruでの予約および席の確保は完全無料です（事前デポジット不要）。\n- 店舗を個別予約するお客様：予約完了後、「確認コード／QRコード」がメールまたは画面に表示されます。来店時にスタッフへご提示ください。\n- ガイド付きツアーを予約するお客様：Vietyoruの専属ガイドがお迎えから体験中まで直接サポートするため、店舗へQRコードを提示する必要はありません。",
      },
      {
        heading: "キャンセルおよび予約内容変更ポリシー",
        body:
          "- キャンセル料：Vietyoruでの予約キャンセルは完全無料です。\n- キャンセル連絡期限：予定変更により来店できない場合、予約時間の2時間前までにマイページまたは確認メール内のリンクからキャンセルしてください。\n- 人数／予約時間の変更：Vietyoruカスタマーサポート（LINE／Zalo／メール）へ直接ご連絡ください。",
      },
      {
        heading: "遅刻および無断キャンセル（ノーショー）",
        body:
          "- 席の確保時間：店舗は予約時間から最大15分間席を確保します。事前連絡なく15分以上遅れた場合、他のお客様を案内するため予約を取り消すことがあります。\n- 違反対応（ノーショー）：無断で来店せず、事前キャンセルを繰り返した場合、Vietyoruでの自動予約機能を停止することがあります。",
      },
    ],
  },
};

export function localizeLegalPage(page: LegalPage, language: LanguageCode): LegalPage {
  if (language !== "ja") return page;

  const translation = japaneseLegalPages[page.key];
  // Never show a reviewed legal translation after the source policy changes.
  // A new admin publication increments version and deliberately falls back to
  // Vietnamese until its matching legal translation is reviewed.
  if (translation.version !== page.version) return page;

  return {
    ...page,
    title: translation.title,
    excerpt: translation.excerpt,
    sections: translation.sections,
  };
}

export type LegalBodyBlocks = {
  paragraphs: string[];
  bullets: string[];
};

export function parseLegalBody(body: string): LegalBodyBlocks {
  return body.split(/\r?\n/).reduce<LegalBodyBlocks>(
    (result, rawLine) => {
      const line = rawLine.trim();
      if (!line) return result;

      if (/^[-–—•]\s*/.test(line)) {
        result.bullets.push(line.replace(/^[-–—•]\s*/, ""));
      } else {
        result.paragraphs.push(line);
      }

      return result;
    },
    { paragraphs: [], bullets: [] },
  );
}
