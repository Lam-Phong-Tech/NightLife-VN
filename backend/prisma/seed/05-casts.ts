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
  styleTags: string[];
  languages: string[];
  hourlyRateVnd: number;
  heightCm?: number;
  birthMonth?: number;
  zodiacSign?: string;
  measurements?: string;
  hobbies: string[];
  youtubeLinks: string[];
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
    styleTags: ['cute', 'elegant', 'natural'],
    languages: ['ja', 'vi', 'en'],
    hourlyRateVnd: 500000,
    heightCm: 162,
    birthMonth: 3,
    zodiacSign: 'Pisces',
    measurements: 'B83-W58-H85',
    hobbies: ['dance', 'movies', 'cocktail-making'],
    youtubeLinks: ['https://www.youtube.com/embed/KRvv0QdruMQ'],
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
    styleTags: ['elegant', 'mature', 'classic'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 450000,
    heightCm: 168,
    birthMonth: 7,
    zodiacSign: 'Cancer',
    hobbies: ['reading', 'cooking', 'travel'],
    youtubeLinks: ['https://www.youtube.com/embed/KRvv0QdruMQ'],
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
    styleTags: ['energetic', 'sexy', 'modern'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 600000,
    heightCm: 165,
    birthMonth: 11,
    zodiacSign: 'Scorpio',
    measurements: 'B86-W60-H88',
    hobbies: ['dancing', 'DJing', 'fitness'],
    youtubeLinks: ['https://www.youtube.com/embed/KRvv0QdruMQ'],
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
    styleTags: ['glamorous', 'luxury', 'mature'],
    languages: ['ja', 'en', 'vi'],
    hourlyRateVnd: 700000,
    heightCm: 170,
    birthMonth: 5,
    zodiacSign: 'Taurus',
    measurements: 'B88-W62-H90',
    hobbies: ['wine-tasting', 'shopping', 'golf'],
    youtubeLinks: ['https://www.youtube.com/embed/KRvv0QdruMQ'],
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
    styleTags: ['refined', 'traditional', 'elegant'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 550000,
    heightCm: 160,
    birthMonth: 1,
    zodiacSign: 'Aquarius',
    hobbies: ['sake-tasting', 'calligraphy', 'flower-arrangement'],
    youtubeLinks: ['https://www.youtube.com/embed/L_jWHffIx5E'],
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
    styleTags: ['sweet', 'cute', 'friendly'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 500000,
    heightCm: 155,
    birthMonth: 4,
    zodiacSign: 'Aries',
    hobbies: ['cooking', 'gardening', 'baking'],
    youtubeLinks: ['https://www.youtube.com/embed/L_jWHffIx5E'],
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
    styleTags: ['energetic', 'pop', 'trendy'],
    languages: ['ja', 'vi', 'en'],
    hourlyRateVnd: 400000,
    heightCm: 163,
    birthMonth: 8,
    zodiacSign: 'Leo',
    hobbies: ['singing', 'anime', 'concerts'],
    youtubeLinks: ['https://www.youtube.com/embed/HQmmM_qwG4k'],
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
    styleTags: ['cheerful', 'casual', 'friendly'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 400000,
    heightCm: 158,
    birthMonth: 2,
    zodiacSign: 'Pisces',
    hobbies: ['karaoke', 'shopping', 'cafes'],
    youtubeLinks: ['https://www.youtube.com/embed/HQmmM_qwG4k'],
  },
  {
    slug: 'mika-golden-ktv',
    stageName: 'Mika',
    storeSlug: 'golden-voice-ktv',
    bio: 'Mika - KTV host for private groups in Quan 7',
    publicAlias: 'Mika KTV',
    publicHeadline: 'KTV host cho tiec nhom Quan 7',
    publicBio:
      'EN Cheerful KTV host for group parties, song picking, and duet support.\n' +
      'VI Biet khuay dong phong karaoke, chon bai va song ca cung khach.',
    tags: ['ktv', 'karaoke', 'group', '20s'],
    styleTags: ['casual', 'cheerful', 'party'],
    languages: ['vi', 'ja'],
    hourlyRateVnd: 820000,
    heightCm: 160,
    birthMonth: 9,
    zodiacSign: 'Virgo',
    hobbies: ['music', 'party-planning', 'socializing'],
    youtubeLinks: ['https://www.youtube.com/embed/HQmmM_qwG4k'],
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
    styleTags: ['elegant', 'traditional', 'sophisticated'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 500000,
    heightCm: 166,
    birthMonth: 10,
    zodiacSign: 'Libra',
    hobbies: ['cooking', 'wine-pairing', 'fine-dining'],
    youtubeLinks: ['https://www.youtube.com/embed/iik25wqIuFo'],
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
    styleTags: ['graceful', 'professional', 'elegant'],
    languages: ['ja', 'en', 'vi'],
    hourlyRateVnd: 550000,
    heightCm: 164,
    birthMonth: 12,
    zodiacSign: 'Sagittarius',
    hobbies: ['tea-ceremony', 'reading', 'travel'],
    youtubeLinks: ['https://www.youtube.com/embed/iik25wqIuFo'],
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
    styleTags: ['casual', 'lively', 'friendly'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 450000,
    heightCm: 159,
    birthMonth: 6,
    zodiacSign: 'Gemini',
    hobbies: ['exploring', 'photography', 'street-food'],
    youtubeLinks: ['https://www.youtube.com/embed/pRpeEdMmmQ0'],
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
    styleTags: ['mysterious', 'elegant', 'chic'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 500000,
    heightCm: 167,
    birthMonth: 10,
    zodiacSign: 'Scorpio',
    hobbies: ['jazz-music', 'whisky-tasting', 'reading'],
    youtubeLinks: ['https://www.youtube.com/embed/pRpeEdMmmQ0'],
  },
  {
    slug: 'linh-crimson-bar',
    stageName: 'Linh',
    storeSlug: 'crimson-bar',
    bio: 'Linh - cocktail companion in Hoan Kiem',
    publicAlias: 'Linh Crimson',
    publicHeadline: 'Cocktail companion khu Hoan Kiem',
    publicBio:
      'EN Friendly cocktail companion for private tables and quiet conversations in Hoan Kiem.\n' +
      'VI Phu hop khach thich cocktail, tro chuyen nhe nhang va khong gian bar tai Hoan Kiem.',
    tags: ['bar', 'cocktail', 'chill', '20s'],
    styleTags: ['chill', 'friendly', 'casual'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 780000,
    heightCm: 161,
    birthMonth: 4,
    zodiacSign: 'Taurus',
    hobbies: ['mixology', 'music', 'art'],
    youtubeLinks: ['https://www.youtube.com/embed/pRpeEdMmmQ0'],
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
    styleTags: ['glamorous', 'sexy', 'party'],
    languages: ['ja', 'vi', 'en'],
    hourlyRateVnd: 600000,
    heightCm: 169,
    birthMonth: 8,
    zodiacSign: 'Leo',
    hobbies: ['clubbing', 'fashion', 'dancing'],
    youtubeLinks: ['https://www.youtube.com/embed/ApXoWvfEYVU'],
  },
  {
    slug: 'sora-neon',
    stageName: 'ソラ',
    storeSlug: 'neon-club',
    bio: 'Sora — cool DJ companion',
    publicAlias: 'Sora',
    publicHeadline: '🎧 音楽で繋がろう',
    publicBio:
      '🇯🇵 音楽が全て。EDM、ハウス、テクノ。一緒にビートに乗りましょう！\n' +
      "🇬🇧 Music is everything. EDM, House, Techno. Let's ride the beat together!\n" +
      '🇻🇳 Âm nhạc là tất cả. EDM, House, Techno. Hòa mình vào nhịp beat cùng nhau!',
    tags: ['cool', 'DJ', 'music-lover', '20s'],
    styleTags: ['cool', 'edgy', 'streetwear'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 550000,
    heightCm: 165,
    birthMonth: 1,
    zodiacSign: 'Capricorn',
    hobbies: ['DJing', 'music-production', 'skateboarding'],
    youtubeLinks: ['https://www.youtube.com/embed/ApXoWvfEYVU'],
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
    styleTags: ['sophisticated', 'elegant', 'luxury'],
    languages: ['ja', 'en', 'vi'],
    hourlyRateVnd: 600000,
    heightCm: 168,
    birthMonth: 9,
    zodiacSign: 'Virgo',
    hobbies: ['wine-tasting', 'gourmet-food', 'travel'],
    youtubeLinks: ['https://www.youtube.com/embed/L_jWHffIx5E'],
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
    styleTags: ['warm', 'friendly', 'comforting'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 450000,
    heightCm: 160,
    birthMonth: 3,
    zodiacSign: 'Pisces',
    hobbies: ['baking', 'reading', 'movies'],
    youtubeLinks: ['https://www.youtube.com/embed/L_jWHffIx5E'],
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
    styleTags: ['elegant', 'artistic', 'classic'],
    languages: ['ja', 'en'],
    hourlyRateVnd: 500000,
    heightCm: 164,
    birthMonth: 11,
    zodiacSign: 'Sagittarius',
    hobbies: ['singing', 'piano', 'concerts'],
    youtubeLinks: ['https://www.youtube.com/embed/nfWlot6h_JM'],
  },
  {
    slug: 'tsubasa-star',
    stageName: 'ツバサ',
    storeSlug: 'star-ktv',
    bio: 'Tsubasa — cheerful KTV companion',
    publicAlias: 'Tsubasa',
    publicHeadline: '🕊️ 楽しい時間をお約束',
    publicBio:
      '🇯🇵 明るい性格が取り柄です！一緒に歌って笑って最高の時間を過ごしましょう。\n' +
      "🇬🇧 My bright personality is my best trait! Let's sing, laugh, and have the best time.\n" +
      '🇻🇳 Tính cách vui vẻ là điểm mạnh! Hãy cùng hát, cười và có khoảng thời gian tuyệt vời.',
    tags: ['cheerful', 'bright', 'anime-songs', '20s'],
    styleTags: ['cheerful', 'cute', 'casual'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 400000,
    heightCm: 157,
    birthMonth: 5,
    zodiacSign: 'Gemini',
    hobbies: ['anime', 'karaoke', 'gaming'],
    youtubeLinks: ['https://www.youtube.com/embed/nfWlot6h_JM'],
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
    styleTags: ['traditional', 'professional', 'elegant'],
    languages: ['ja', 'en', 'vi'],
    hourlyRateVnd: 500000,
    heightCm: 162,
    birthMonth: 9,
    zodiacSign: 'Virgo',
    hobbies: ['cooking', 'food-tours', 'tea-ceremony'],
    youtubeLinks: ['https://www.youtube.com/embed/M7lc1UVf-VE'],
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
    styleTags: ['gentle', 'cute', 'traditional'],
    languages: ['ja', 'vi'],
    hourlyRateVnd: 450000,
    heightCm: 158,
    birthMonth: 2,
    zodiacSign: 'Aquarius',
    hobbies: ['baking', 'cafe-hopping', 'reading'],
    youtubeLinks: ['https://www.youtube.com/embed/M7lc1UVf-VE'],
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
    styleTags: ['party', 'glamorous', 'energetic'],
    languages: ['vi', 'en', 'ja'],
    hourlyRateVnd: 520000,
    heightCm: 166,
    birthMonth: 7,
    zodiacSign: 'Cancer',
    hobbies: ['partying', 'fashion', 'beach'],
    youtubeLinks: ['https://www.youtube.com/embed/XqZsoesa55w'],
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
    styleTags: ['energetic', 'sexy', 'modern'],
    languages: ['vi', 'ja'],
    hourlyRateVnd: 500000,
    heightCm: 163,
    birthMonth: 12,
    zodiacSign: 'Sagittarius',
    hobbies: ['dancing', 'music', 'fitness'],
    youtubeLinks: ['https://www.youtube.com/embed/XqZsoesa55w'],
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
    styleTags: ['calm', 'elegant', 'casual'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 480000,
    heightCm: 161,
    birthMonth: 4,
    zodiacSign: 'Taurus',
    hobbies: ['beach-walks', 'reading', 'yoga'],
    youtubeLinks: ['https://www.youtube.com/embed/XqZsoesa55w'],
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
    styleTags: ['professional', 'elegant', 'attentive'],
    languages: ['vi', 'ja', 'en'],
    hourlyRateVnd: 560000,
    heightCm: 168,
    birthMonth: 10,
    zodiacSign: 'Scorpio',
    hobbies: ['wine-tasting', 'golf', 'travel'],
    youtubeLinks: ['https://www.youtube.com/embed/XqZsoesa55w'],
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
    styleTags: ['cheerful', 'casual', 'friendly'],
    languages: ['vi', 'ja'],
    hourlyRateVnd: 430000,
    heightCm: 159,
    birthMonth: 6,
    zodiacSign: 'Gemini',
    hobbies: ['karaoke', 'shopping', 'movies'],
    youtubeLinks: ['https://www.youtube.com/embed/nfWlot6h_JM'],
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
    styleTags: ['warm', 'elegant', 'professional'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 450000,
    heightCm: 162,
    birthMonth: 3,
    zodiacSign: 'Aries',
    hobbies: ['music', 'cooking', 'travel'],
    youtubeLinks: ['https://www.youtube.com/embed/nfWlot6h_JM'],
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
    styleTags: ['calm', 'professional', 'gentle'],
    languages: ['vi', 'ja', 'en'],
    hourlyRateVnd: 420000,
    heightCm: 160,
    birthMonth: 8,
    zodiacSign: 'Leo',
    hobbies: ['yoga', 'meditation', 'wellness'],
    youtubeLinks: ['https://www.youtube.com/embed/ScMzIvxBSi4'],
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
    styleTags: ['gentle', 'caring', 'elegant'],
    languages: ['vi', 'en'],
    hourlyRateVnd: 420000,
    heightCm: 158,
    birthMonth: 1,
    zodiacSign: 'Capricorn',
    hobbies: ['reading', 'tea', 'nature'],
    youtubeLinks: ['https://www.youtube.com/embed/ScMzIvxBSi4'],
  },
  {
    slug: 'sumi-lotus-massage-spa',
    stageName: 'Sumi',
    storeSlug: 'lotus-massage-spa',
    bio: 'Sumi - massage spa coordinator in Quan 3',
    publicAlias: 'Sumi Spa',
    publicHeadline: 'Massage spa coordinator Quan 3',
    publicBio:
      'EN Wellness companion for late-night massage, sauna, and quiet-room packages.\n' +
      'VI Ho tro chon goi massage, xong hoi va phong thu gian tai Quan 3.',
    tags: ['massage-spa', 'relax', 'wellness', '20s'],
    styleTags: ['relax', 'professional', 'calm'],
    languages: ['vi'],
    hourlyRateVnd: 680000,
    heightCm: 165,
    birthMonth: 5,
    zodiacSign: 'Taurus',
    hobbies: ['wellness', 'yoga', 'skincare'],
    youtubeLinks: ['https://www.youtube.com/embed/ScMzIvxBSi4'],
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
        styleTags: c.styleTags ?? [],
        languages: c.languages,
        hourlyRateVnd: c.hourlyRateVnd,
        heightCm: c.heightCm ?? null,
        birthMonth: c.birthMonth ?? null,
        zodiacSign: c.zodiacSign ?? null,
        measurements: c.measurements ?? null,
        hobbies: c.hobbies ?? [],
        youtubeLinks: c.youtubeLinks ?? [],
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
        styleTags: c.styleTags ?? [],
        languages: c.languages,
        hourlyRateVnd: c.hourlyRateVnd,
        heightCm: c.heightCm ?? null,
        birthMonth: c.birthMonth ?? null,
        zodiacSign: c.zodiacSign ?? null,
        measurements: c.measurements ?? null,
        hobbies: c.hobbies ?? [],
        youtubeLinks: c.youtubeLinks ?? [],
        status: 'ACTIVE',
        isPublic: true,
      },
    });
  }

  console.log(
    `     ✓ ${Object.keys(result).length} casts (JP names, trilingual bios, multilingual tags)`,
  );
  return result;
}
