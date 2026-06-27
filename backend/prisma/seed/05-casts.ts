import { PrismaClient, Cast, Store } from '@prisma/client';

/**
 * 20 Casts — 2 per store.
 * Japanese katakana stage names (priority), trilingual publicBio (JP/EN/VN).
 * Tags cover: style, personality, skills, age bracket.
 * Languages: subsets of ['ja', 'en', 'vi'].
 */
interface CastSeed {
  slug: string;
  stageName: string;
  storeSlug: string;
  bio: string;
  publicAlias: string;
  publicHeadline: string;
  publicBio: string;
  tags: string[];
  languages: string[];
  hourlyRateVnd: number;
}

const CASTS: CastSeed[] = [
  // ── Moonlight Bar (HCM Q1) ──
  {
    slug: 'sakura-moonlight',
    stageName: 'サクラ',
    storeSlug: 'moonlight-bar',
    bio: 'Sakura — experienced bartender & entertainer',
    publicAlias: 'Sakura',
    publicHeadline: '🌸 おもてなしの心を大切に',
    publicBio:
      '🇯🇵 カクテル作りが得意です。お客様に最高の夜をお届けします。趣味はダンスと映画鑑賞。\n' +
      '🇬🇧 Skilled at crafting cocktails. I deliver the best nights for our guests. Hobbies: dance & movies.\n' +
      '🇻🇳 Giỏi pha chế cocktail. Mang đến đêm tuyệt vời nhất cho khách. Sở thích: nhảy và xem phim.',
    tags: ['cute', 'bilingual', 'cocktail-expert', '20s'],
    languages: ['ja', 'vi', 'en'],
    hourlyRateVnd: 500000,
  },
  {
    slug: 'miyuki-moonlight',
    stageName: 'ミユキ',
    storeSlug: 'moonlight-bar',
    bio: 'Miyuki — charming conversationalist',
    publicAlias: 'Miyuki',
    publicHeadline: '✨ 会話を楽しみましょう',
    publicBio:
      '🇯🇵 おしゃべりが大好きです。日本語と英語が話せます。一緒に楽しい時間を過ごしましょう！\n' +
      "🇬🇧 I love chatting! I speak Japanese and English. Let's have a great time together!\n" +
      '🇻🇳 Tôi thích trò chuyện! Nói được tiếng Nhật và tiếng Anh. Hãy cùng nhau tận hưởng!',
    tags: ['elegant', 'conversationalist', 'tall', '20s'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 450000,
  },

  // ── Velvet Club (HCM Q1) ──
  {
    slug: 'rina-velvet',
    stageName: 'リナ',
    storeSlug: 'velvet-club',
    bio: 'Rina — energetic club performer',
    publicAlias: 'Rina',
    publicHeadline: '🎵 一緒に踊りましょう！',
    publicBio:
      '🇯🇵 ダンスとDJが大好き！クラブの雰囲気を最高に盛り上げます。\n' +
      '🇬🇧 I love dancing and DJing! I make the club atmosphere electric.\n' +
      '🇻🇳 Yêu nhảy và DJ! Tạo không khí club sôi động nhất.',
    tags: ['energetic', 'dancer', 'DJ', '20s'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 600000,
  },
  {
    slug: 'aya-velvet',
    stageName: 'アヤ',
    storeSlug: 'velvet-club',
    bio: 'Aya — glamorous hostess',
    publicAlias: 'Aya',
    publicHeadline: '💎 最高のVIP体験を',
    publicBio:
      '🇯🇵 VIPテーブルのスペシャリスト。ワインとシャンパンに詳しいです。\n' +
      '🇬🇧 VIP table specialist. Knowledgeable about wine and champagne.\n' +
      '🇻🇳 Chuyên gia phục vụ bàn VIP. Am hiểu về rượu vang và champagne.',
    tags: ['glamorous', 'VIP-specialist', 'wine-expert', '20s'],
    languages: ['ja', 'en', 'vi'],
    hourlyRateVnd: 700000,
  },

  // ── Sakura Lounge (HCM Q3) ──
  {
    slug: 'yuki-sakura-lounge',
    stageName: 'ユキ',
    storeSlug: 'sakura-lounge',
    bio: 'Yuki — refined lounge hostess',
    publicAlias: 'Yuki',
    publicHeadline: '❄️ 静かな時間をどうぞ',
    publicBio:
      '🇯🇵 日本酒ソムリエの資格を持っています。穏やかな空間で最高のおもてなしを。\n' +
      '🇬🇧 Certified sake sommelier. The finest hospitality in a tranquil setting.\n' +
      '🇻🇳 Chứng chỉ sommelier sake. Phục vụ tận tâm nhất trong không gian yên tĩnh.',
    tags: ['refined', 'sake-expert', 'calm', '20s'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 550000,
  },
  {
    slug: 'hana-sakura-lounge',
    stageName: 'ハナ',
    storeSlug: 'sakura-lounge',
    bio: 'Hana — sweet and attentive hostess',
    publicAlias: 'Hana',
    publicHeadline: '🌺 笑顔でお迎えします',
    publicBio:
      '🇯🇵 笑顔が一番のおもてなし。趣味は料理とガーデニング。\n' +
      '🇬🇧 A smile is the best hospitality. Hobbies: cooking & gardening.\n' +
      '🇻🇳 Nụ cười là sự phục vụ tốt nhất. Sở thích: nấu ăn & làm vườn.',
    tags: ['sweet', 'attentive', 'petite', '20s'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 500000,
  },

  // ── Golden Voice KTV (HCM Q7) ──
  {
    slug: 'mai-golden',
    stageName: 'マイ',
    storeSlug: 'golden-voice-ktv',
    bio: 'Mai — talented singer & KTV host',
    publicAlias: 'Mai',
    publicHeadline: '🎤 歌って楽しもう！',
    publicBio:
      '🇯🇵 J-POPからアニソンまで何でも歌います！カラオケ盛り上げのプロです。\n' +
      '🇬🇧 I sing everything from J-POP to anime songs! Professional at making karaoke fun.\n' +
      '🇻🇳 Hát mọi thể loại từ J-POP đến nhạc anime! Chuyên gia tạo không khí karaoke.',
    tags: ['singer', 'J-POP', 'energetic', '20s'],
    languages: ['ja', 'vi', 'en'],
    hourlyRateVnd: 400000,
  },
  {
    slug: 'nana-golden',
    stageName: 'ナナ',
    storeSlug: 'golden-voice-ktv',
    bio: 'Nana — fun KTV companion',
    publicAlias: 'Nana',
    publicHeadline: '🎶 一緒に歌いましょう',
    publicBio:
      '🇯🇵 楽しい時間を一緒に過ごしましょう！ベトナム語と日本語のデュエットが得意。\n' +
      "🇬🇧 Let's have fun together! Great at Vietnamese-Japanese duets.\n" +
      '🇻🇳 Hãy cùng vui! Giỏi song ca Việt-Nhật.',
    tags: ['fun', 'duet-specialist', 'cheerful', '20s'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 400000,
  },

  // ── Hanami Dining (HCM Q3) ──
  {
    slug: 'rumi-hanami',
    stageName: 'ルミ',
    storeSlug: 'hanami-dining',
    bio: 'Rumi — elegant dining hostess',
    publicAlias: 'Rumi',
    publicHeadline: '🍶 お食事のお供に',
    publicBio:
      '🇯🇵 和食の知識が豊富です。お料理に合うお酒のペアリングをご提案します。\n' +
      '🇬🇧 Rich knowledge of Japanese cuisine. I suggest perfect drink pairings for your dishes.\n' +
      '🇻🇳 Am hiểu về ẩm thực Nhật. Gợi ý kết hợp đồ uống hoàn hảo cho món ăn.',
    tags: ['elegant', 'food-expert', 'mature', '30s'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 500000,
  },
  {
    slug: 'kaori-hanami',
    stageName: 'カオリ',
    storeSlug: 'hanami-dining',
    bio: 'Kaori — graceful dining companion',
    publicAlias: 'Kaori',
    publicHeadline: '🌿 心を込めておもてなし',
    publicBio:
      '🇯🇵 接待のサポートが得意です。日本のビジネスマナーを理解しています。\n' +
      '🇬🇧 Expert at business entertainment support. I understand Japanese business etiquette.\n' +
      '🇻🇳 Giỏi hỗ trợ tiếp khách doanh nghiệp. Hiểu phong cách doanh nhân Nhật Bản.',
    tags: ['graceful', 'business', 'bilingual', '20s'],
    languages: ['ja', 'en', 'vi'],
    hourlyRateVnd: 550000,
  },

  // ── Crimson Bar (HN Hoàn Kiếm) ──
  {
    slug: 'misaki-crimson',
    stageName: 'ミサキ',
    storeSlug: 'crimson-bar',
    bio: 'Misaki — lively bar hostess in Hanoi',
    publicAlias: 'Misaki',
    publicHeadline: '🍷 ハノイの夜を一緒に',
    publicBio:
      '🇯🇵 ハノイ在住3年。旧市街の穴場スポットに詳しいです！\n' +
      '🇬🇧 Living in Hanoi for 3 years. I know all the hidden gems in the Old Quarter!\n' +
      '🇻🇳 Sống ở Hà Nội 3 năm. Biết hết các địa điểm ẩn trong phố cổ!',
    tags: ['lively', 'local-guide', 'friendly', '20s'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 450000,
  },
  {
    slug: 'rei-crimson',
    stageName: 'レイ',
    storeSlug: 'crimson-bar',
    bio: 'Rei — mysterious and charming',
    publicAlias: 'Rei',
    publicHeadline: '🌙 ミステリアスな夜を',
    publicBio:
      '🇯🇵 ウイスキーとジャズが大好き。静かな会話を楽しみたい方にぴったりです。\n' +
      '🇬🇧 I love whisky and jazz. Perfect for those who enjoy quiet conversations.\n' +
      '🇻🇳 Yêu whisky và jazz. Hoàn hảo cho những ai thích trò chuyện yên tĩnh.',
    tags: ['mysterious', 'whisky-lover', 'jazz', '20s'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 500000,
  },

  // ── Neon Club (HN Tây Hồ) ──
  {
    slug: 'yuna-neon',
    stageName: 'ユナ',
    storeSlug: 'neon-club',
    bio: 'Yuna — party queen at Neon Club',
    publicAlias: 'Yuna',
    publicHeadline: '🎉 パーティーを盛り上げよう！',
    publicBio:
      '🇯🇵 パーティーの女王！テキーラショットからシャンパンタワーまでお任せください。\n' +
      '🇬🇧 The party queen! From tequila shots to champagne towers, leave it to me.\n' +
      '🇻🇳 Nữ hoàng tiệc tùng! Từ shot tequila đến tháp champagne, hãy để tôi lo.',
    tags: ['party', 'energetic', 'showgirl', '20s'],
    languages: ['ja', 'vi', 'en'],
    hourlyRateVnd: 600000,
  },
  {
    slug: 'sora-neon',
    stageName: 'ソラ',
    storeSlug: 'neon-club',
    bio: 'Sora — cool DJ companion',
    publicAlias: 'Sora',
    publicHeadline: '🎧 音楽で繋がろう',
    publicBio:
      "🇯🇵 音楽が全て。EDM、ハウス、テクノ。一緒にビートに乗りましょう！\n" +
      "🇬🇧 Music is everything. EDM, House, Techno. Let's ride the beat together!\n" +
      '🇻🇳 Âm nhạc là tất cả. EDM, House, Techno. Hòa mình vào nhịp beat cùng nhau!',
    tags: ['cool', 'DJ', 'music-lover', '20s'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 550000,
  },

  // ── Jade Lounge (HN Hoàn Kiếm) ──
  {
    slug: 'akari-jade',
    stageName: 'アカリ',
    storeSlug: 'jade-lounge',
    bio: 'Akari — sophisticated lounge hostess',
    publicAlias: 'Akari',
    publicHeadline: '💚 上質なひとときを',
    publicBio:
      '🇯🇵 ソムリエの経験があります。ワインとチーズのペアリングはお任せください。\n' +
      '🇬🇧 Experienced sommelier. Leave wine and cheese pairings to me.\n' +
      '🇻🇳 Có kinh nghiệm sommelier. Hãy để tôi lo việc kết hợp rượu vang và phô mai.',
    tags: ['sophisticated', 'sommelier', 'elegant', '20s'],
    languages: ['ja', 'en', 'vi'],
    hourlyRateVnd: 600000,
  },
  {
    slug: 'hikaru-jade',
    stageName: 'ヒカル',
    storeSlug: 'jade-lounge',
    bio: 'Hikaru — warm and welcoming',
    publicAlias: 'Hikaru',
    publicHeadline: '✨ 温かいおもてなし',
    publicBio:
      '🇯🇵 ゆっくりとした時間をお過ごしいただけるよう、心を込めてお手伝いします。\n' +
      '🇬🇧 I wholeheartedly help you enjoy a relaxed and comfortable time.\n' +
      '🇻🇳 Tận tâm giúp bạn tận hưởng thời gian thư giãn và thoải mái.',
    tags: ['warm', 'caring', 'relaxing', '20s'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 450000,
  },

  // ── Star KTV (HN Cầu Giấy) ──
  {
    slug: 'erika-star',
    stageName: 'エリカ',
    storeSlug: 'star-ktv',
    bio: 'Erika — talented vocalist',
    publicAlias: 'Erika',
    publicHeadline: '⭐ 歌の力で元気を！',
    publicBio:
      '🇯🇵 音楽大学出身。クラシックからポップスまで幅広いレパートリー。\n' +
      '🇬🇧 Music academy graduate. Wide repertoire from classical to pop.\n' +
      '🇻🇳 Tốt nghiệp nhạc viện. Repertoire rộng từ cổ điển đến pop.',
    tags: ['vocalist', 'trained', 'versatile', '20s'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 500000,
  },
  {
    slug: 'tsubasa-star',
    stageName: 'ツバサ',
    storeSlug: 'star-ktv',
    bio: 'Tsubasa — cheerful KTV companion',
    publicAlias: 'Tsubasa',
    publicHeadline: '🕊️ 楽しい時間をお約束',
    publicBio:
      "🇯🇵 明るい性格が取り柄です！一緒に歌って笑って最高の時間を過ごしましょう。\n" +
      "🇬🇧 My bright personality is my best trait! Let's sing, laugh, and have the best time.\n" +
      '🇻🇳 Tính cách vui vẻ là điểm mạnh! Hãy cùng hát, cười và có khoảng thời gian tuyệt vời.',
    tags: ['cheerful', 'bright', 'anime-songs', '20s'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 400000,
  },

  // ── Tokyo Kitchen (HN Tây Hồ) ──
  {
    slug: 'kotone-tokyo',
    stageName: 'コトネ',
    storeSlug: 'tokyo-kitchen',
    bio: 'Kotone — knowledgeable dining hostess',
    publicAlias: 'Kotone',
    publicHeadline: '🍣 本格和食のご案内',
    publicBio:
      '🇯🇵 日本で5年間の飲食店経験。本格的な和食の楽しみ方をご案内します。\n' +
      '🇬🇧 5 years of restaurant experience in Japan. I guide you through authentic Japanese dining.\n' +
      '🇻🇳 5 năm kinh nghiệm nhà hàng tại Nhật. Hướng dẫn bạn thưởng thức ẩm thực Nhật chính thống.',
    tags: ['knowledgeable', 'experienced', 'food-lover', '30s'],
    languages: ['ja', 'en', 'vi'],
    hourlyRateVnd: 500000,
  },
  {
    slug: 'aoi-tokyo',
    stageName: 'アオイ',
    storeSlug: 'tokyo-kitchen',
    bio: 'Aoi — gentle and caring hostess',
    publicAlias: 'Aoi',
    publicHeadline: '💙 優しさでおもてなし',
    publicBio:
      '🇯🇵 お客様が笑顔になれるように、心を込めておもてなしします。お茶とスイーツが大好き。\n' +
      '🇬🇧 I serve with heart to make every guest smile. I love tea and sweets.\n' +
      '🇻🇳 Phục vụ bằng cả tấm lòng để mỗi khách đều mỉm cười. Yêu trà và bánh ngọt.',
    tags: ['gentle', 'caring', 'tea-lover', '20s'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 450000,
  },

  // ── Dragon Rooftop Da Nang (DN Hai Chau) ──
  {
    slug: 'lina-dragon-rooftop',
    stageName: 'リナ',
    storeSlug: 'dragon-rooftop-da-nang',
    bio: 'Lina — rooftop party host in Da Nang',
    publicAlias: 'Lina',
    publicHeadline: 'Rooftop party guide by the Han River',
    publicBio:
      '🇬🇧 I host birthday groups and VIP tables with a bright, energetic style.\n' +
      '🇻🇳 Đồng hành bàn VIP, sinh nhật và nhóm bạn tại rooftop Đà Nẵng.',
    tags: ['party', 'rooftop', 'vip-table', '20s'],
    languages: ['vi', 'en', 'ja'],
    hourlyRateVnd: 520000,
  },
  {
    slug: 'mai-dragon-rooftop',
    stageName: 'マイ',
    storeSlug: 'dragon-rooftop-da-nang',
    bio: 'Mai — dance and club companion',
    publicAlias: 'Mai',
    publicHeadline: 'High-energy club companion',
    publicBio:
      '🇬🇧 EDM nights, dance floors, and lively group hosting are my favorite.\n' +
      '🇻🇳 Hợp nhóm thích EDM, nhảy và không khí club sôi động.',
    tags: ['dancer', 'edm', 'energetic', '20s'],
    languages: ['vi', 'ja'],
    hourlyRateVnd: 500000,
  },

  // ── Son Tra Lounge (DN Son Tra) ──
  {
    slug: 'nami-son-tra',
    stageName: 'ナミ',
    storeSlug: 'son-tra-lounge',
    bio: 'Nami — calm lounge hostess near My Khe',
    publicAlias: 'Nami',
    publicHeadline: 'Quiet lounge time near the beach',
    publicBio:
      '🇬🇧 I enjoy slow conversations, cocktails, and relaxed terrace seating.\n' +
      '🇻🇳 Phù hợp khách thích trò chuyện nhẹ nhàng, cocktail và không gian biển.',
    tags: ['calm', 'cocktail', 'beach', '20s'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 480000,
  },
  {
    slug: 'eri-son-tra',
    stageName: 'エリ',
    storeSlug: 'son-tra-lounge',
    bio: 'Eri — attentive VIP lounge host',
    publicAlias: 'Eri',
    publicHeadline: 'Private-room lounge support',
    publicBio:
      '🇬🇧 I support private rooms, bottle service, and business entertainment.\n' +
      '🇻🇳 Hỗ trợ phòng riêng, gọi đồ và tiếp khách trong lounge cao cấp.',
    tags: ['attentive', 'vip-room', 'business', '20s'],
    languages: ['vi', 'ja', 'en'],
    hourlyRateVnd: 560000,
  },

  // ── Harbor KTV Hai Phong (HP Hong Bang) ──
  {
    slug: 'mika-harbor-ktv',
    stageName: 'ミカ',
    storeSlug: 'harbor-ktv-hai-phong',
    bio: 'Mika — cheerful KTV host in Hai Phong',
    publicAlias: 'Mika',
    publicHeadline: 'KTV duet and group mood maker',
    publicBio:
      '🇬🇧 I help groups choose songs and keep the KTV room lively.\n' +
      '🇻🇳 Biết khuấy động phòng karaoke, chọn bài và song ca cùng khách.',
    tags: ['ktv', 'singer', 'cheerful', '20s'],
    languages: ['vi', 'ja'],
    hourlyRateVnd: 430000,
  },
  {
    slug: 'hana-harbor-ktv',
    stageName: 'ハナ',
    storeSlug: 'harbor-ktv-hai-phong',
    bio: 'Hana — warm KTV companion',
    publicAlias: 'Hana HP',
    publicHeadline: 'Warm hosting for private karaoke rooms',
    publicBio:
      '🇬🇧 Friendly hosting for private karaoke rooms and business groups.\n' +
      '🇻🇳 Phù hợp phòng riêng, nhóm tiếp khách và khách thích không khí ấm áp.',
    tags: ['ktv', 'warm', 'private-room', '20s'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 450000,
  },

  // ── Opera Spa Hai Phong (HP Ngo Quyen) ──
  {
    slug: 'sumi-opera-spa',
    stageName: 'スミ',
    storeSlug: 'opera-spa-hai-phong',
    bio: 'Sumi — wellness concierge',
    publicAlias: 'Sumi',
    publicHeadline: 'Late-night spa and wellness support',
    publicBio:
      '🇬🇧 I help guests choose massage, sauna, and quiet-room packages.\n' +
      '🇻🇳 Hỗ trợ chọn gói massage, xông hơi và phòng thư giãn mở muộn.',
    tags: ['spa', 'wellness', 'calm', '20s'],
    languages: ['vi', 'ja', 'en'],
    hourlyRateVnd: 420000,
  },
  {
    slug: 'yuri-opera-spa',
    stageName: 'ユリ',
    storeSlug: 'opera-spa-hai-phong',
    bio: 'Yuri — attentive wellness host',
    publicAlias: 'Yuri',
    publicHeadline: 'Quiet care near Hai Phong Opera House',
    publicBio:
      '🇬🇧 Gentle support for guests who prefer quiet wellness experiences.\n' +
      '🇻🇳 Phù hợp khách muốn trải nghiệm spa yên tĩnh gần Nhà hát Lớn.',
    tags: ['spa', 'gentle', 'quiet', '20s'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 420000,
  },
];

export async function seedCasts(
  prisma: PrismaClient,
  stores: Record<string, Store>,
): Promise<Record<string, Cast>> {
  console.log('  💃 Seeding casts...');
  const result: Record<string, Cast> = {};

  for (const c of CASTS) {
    const storeId = stores[c.storeSlug]?.id;
    if (!storeId) {
      console.warn(`     ⚠ Store not found for cast ${c.slug}: ${c.storeSlug}`);
      continue;
    }

    result[c.slug] = await prisma.cast.upsert({
      where: { slug: c.slug },
      update: {
        stageName: c.stageName,
        bio: c.bio,
        publicAlias: c.publicAlias,
        publicHeadline: c.publicHeadline,
        publicBio: c.publicBio,
        tags: c.tags,
        languages: c.languages,
        hourlyRateVnd: c.hourlyRateVnd,
        status: 'ACTIVE',
        isPublic: true,
      },
      create: {
        storeId,
        slug: c.slug,
        stageName: c.stageName,
        bio: c.bio,
        publicAlias: c.publicAlias,
        publicHeadline: c.publicHeadline,
        publicBio: c.publicBio,
        tags: c.tags,
        languages: c.languages,
        hourlyRateVnd: c.hourlyRateVnd,
        status: 'ACTIVE',
        isPublic: true,
      },
    });
  }

  console.log(`     ✓ ${Object.keys(result).length} casts (JP names, trilingual bios, multilingual tags)`);
  return result;
}
