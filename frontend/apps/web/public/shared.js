/* nightlife.hn — dữ liệu & logic dùng chung cho prototype bấm-được.
   Đặt window.NL trước khi support.js render (nạp đồng bộ trong <head>). */
window.NL = (function () {
  // ---------- localStorage helpers ----------
  function jget(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function jset(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  var fav = {
    list: function () { return jget('nl_fav', []); },
    has: function (n) { return this.list().indexOf(n) >= 0; },
    toggle: function (n) { var l = this.list(); var i = l.indexOf(n); if (i >= 0) l.splice(i, 1); else l.push(n); jset('nl_fav', l); return this.has(n); }
  };
  var booking = {
    get: function () { return jget('nl_booking', {}); },
    patch: function (o) { var b = this.get(); for (var k in o) b[k] = o[k]; jset('nl_booking', b); return b; }
  };

  // ---------- ảnh placeholder ----------
  function photo(id, w) { return "url('https://images.unsplash.com/photo-" + id + "?auto=format&fit=crop&w=" + (w || 720) + "&q=70') center/cover"; }
  function grad(a, b) { return 'linear-gradient(140deg,' + a + ',' + b + ')'; }
  function bg(id, a, b, w) { return photo(id, w) + ',' + grad(a, b); }
  function heart(on) { return on ? 'https://img.icons8.com/ios-filled/100/FF3D71/like.png' : 'https://img.icons8.com/ios/100/FFFFFF/like.png'; }

  // ---------- style helpers ----------
  function chip(on) { return 'cursor:pointer;font-size:12.5px;border-radius:16px;padding:7px 13px;font-weight:600;white-space:nowrap;transition:all .14s;' + (on ? 'background:#6d28d9;color:#fff;' : 'background:#f3f2f5;color:#5b5870;'); }
  function pill(on) { return 'display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:13px;border-radius:18px;padding:8px 16px;font-weight:600;white-space:nowrap;transition:all .14s;' + (on ? 'background:#6d28d9;color:#fff;border:1px solid #6d28d9;' : 'background:#fff;color:#5b5870;border:1px solid #ececec;'); }
  function pillSm(on) { return 'display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:11.5px;border-radius:15px;padding:7px 12px;font-weight:600;white-space:nowrap;' + (on ? 'background:#6d28d9;color:#fff;border:1px solid #6d28d9;' : 'background:#fff;color:#5b5870;border:1px solid #ececec;'); }
  function seg(on) { return 'flex:1;text-align:center;cursor:pointer;font-size:13px;border-radius:9px;padding:9px;font-weight:600;transition:all .14s;' + (on ? 'background:#fff;color:#6d28d9;box-shadow:0 1px 3px rgba(0,0,0,.08);' : 'color:#8a879a;'); }
  function tab(on) { return 'cursor:pointer;padding-bottom:12px;font-weight:' + (on ? '700' : '500') + ';color:' + (on ? '#6d28d9' : '#8a879a') + ';border-bottom:2px solid ' + (on ? '#6d28d9' : 'transparent') + ';transition:all .14s;'; }

  // ---------- dữ liệu quán ----------
  // [slug, tên, khu vực, thành phố, cat, nhãn loại, giá, sao, số đ.giá, giảm, tag, imgId, gradA, gradB]
  var V = [
    ['club-lumiere', 'Club Lumière', 'Tây Hồ', 'hn', 'bar', 'Bar Lounge', '1.2tr', 4.9, 312, '-20%', '', '1572116469696-31de0f17cc34', '#d6336c', '#7b2d6b'],
    ['ktv-hoang-gia', 'KTV Hoàng Gia', 'Kim Mã', 'hn', 'ktv', 'Karaoke VIP', '900K', 4.8, 208, '', '', '1566417713940-fe7c737a9ef2', '#3a8fb0', '#2d5fae'],
    ['sakura-lounge', 'Sakura Lounge', 'Trúc Bạch', 'hn', 'bar', 'Lounge', '1.5tr', 4.7, 156, '', 'Mới', '1551024601-bec78aea704b', '#8a6ad0', '#5d3da8'],
    ['casino-diamond', 'Casino Diamond', 'Tây Hồ', 'hn', 'casino', 'Casino', '2tr', 4.6, 89, '', '', '1596838132731-3301c3fd4317', '#e0a23a', '#c0782d'],
    ['hanoi-velvet', 'Hanoi Velvet', 'Hoàn Kiếm', 'hn', 'bar', 'Bar', '1.1tr', 4.7, 140, '-15%', '', '1470337458703-46ad1756a187', '#e0598a', '#a8336b'],
    ['roppongi-night', 'Roppongi Night', 'Kim Mã', 'hn', 'bar', 'Lounge', '1.3tr', 4.5, 102, '', '', '1514933651103-005eec06c04b', '#3a9fb0', '#2d6fae'],
    ['spa-hong-ngoc', 'Spa Hồng Ngọc', 'Đống Đa', 'hn', 'spa', 'Spa & Massage', '500K', 4.6, 210, '-50%', '', '1516450360452-9312f5e86fc7', '#5fae8a', '#2d8a6a'],
    ['sora-lounge', 'Sora Lounge', 'Quận 1', 'hcm', 'bar', 'Lounge', '1.4tr', 4.8, 190, '', 'Hot', '1551024601-bec78aea704b', '#5d3da8', '#3a1f6e'],
    ['diamond-bar', 'Diamond Bar', 'Quận 3', 'hcm', 'bar', 'Bar', '1.6tr', 4.6, 130, '', '', '1524661135-423995f22d0b', '#e0985f', '#c06a2d']
  ];
  var VENUES = V.map(function (r) {
    return {
      slug: r[0], name: r[1], area: r[2], city: r[3], cat: r[4], catLabel: r[5],
      price: r[6], rating: r[7], reviews: r[8], disc: r[9], tag: r[10],
      imgId: r[11], gradA: r[12], gradB: r[13]
    };
  });
  function venue(slug) { for (var i = 0; i < VENUES.length; i++) if (VENUES[i].slug === slug) return VENUES[i]; return VENUES[0]; }

  var CATS = [
    ['all', 'Tất cả'], ['ktv', 'Karaoke / KTV'], ['bar', 'Bar / Lounge'],
    ['casino', 'Casino'], ['spa', 'Spa / Massage']
  ];
  var AREAS = ['Tất cả', 'Tây Hồ', 'Hoàn Kiếm', 'Kim Mã', 'Đống Đa', 'Trúc Bạch'];

  // ---------- cast ----------
  // [tên, tuổi, mô tả, sao, jp, imgId, gradA, gradB, rảnh]
  // [tên, năm sinh, mô tả, sao, jp, imgId, gradA, gradB, khu vực, ngôn ngữ] — tuổi tự tính, KHÔNG hiển thị lịch rảnh
  var C = [
    ['Michi', 2003, 'Nói tiếng Nhật', 4.9, true, '1494790108377-be9c29b29330', '#e0598a', '#a8336b', 'Tây Hồ', 'Nhật · Việt'],
    ['Yuki', 2002, 'Phong cách đẹp', 4.8, false, '1517841905240-472988babdf9', '#3a9fb0', '#2d6fae', 'Kim Mã', 'Việt · Anh'],
    ['Rina', 2005, 'Trong độ tuổi 20', 4.7, false, '1438761681033-6461ffad8d80', '#e0a23a', '#c0782d', 'Trúc Bạch', 'Việt'],
    ['Mai', 2001, 'Nói chuyện duyên', 4.9, false, '1524504388940-b1c1722653e1', '#8a6ad0', '#5d3da8', 'Tây Hồ', 'Việt · Nhật'],
    ['Hana', 2004, 'Nói tiếng Nhật', 4.6, true, '1534528741775-53994a69daeb', '#e07a7a', '#b04545', 'Hoàn Kiếm', 'Nhật · Việt'],
    ['Saki', 2003, 'Vui vẻ', 4.8, false, '1531123897727-8f129e1688ce', '#d6336c', '#7b2d6b', 'Kim Mã', 'Việt'],
    ['Aoi', 2002, 'Dịu dàng', 4.7, false, '1488426862026-3ee34a7d66df', '#5fae8a', '#2d8a6a', 'Đống Đa', 'Việt · Anh'],
    ['Nana', 2004, 'Hát hay', 4.8, false, '1529626455594-4ff0802cfb7e', '#b06ad0', '#7d3da8', 'Trúc Bạch', 'Việt']
  ];
  var THIS_YEAR = 2026;
  var CAST = C.map(function (r) {
    return { name: r[0], bornYear: r[1], age: THIS_YEAR - r[1], desc: r[2], rating: r[3], jp: r[4], imgId: r[5], gradA: r[6], gradB: r[7], area: r[8], lang: r[9] };
  });
  function cast(name) { for (var i = 0; i < CAST.length; i++) if (CAST[i].name === name) return CAST[i]; return CAST[0]; }
  var CAST_FILTERS = ['Tất cả', 'Nói tiếng Nhật', '20-23 tuổi', 'Tây Hồ', 'Đánh giá cao'];

  // ---------- bảng xếp hạng (trang chủ) ----------
  var RANK = {
    all: {
      quan: [['Club Lumière', 'Tây Hồ · HN', '12.4k lượt'], ['Sora Lounge', 'Quận 1 · HCM', '11.8k lượt'], ['KTV Hoàng Gia', 'Kim Mã · HN', '9.7k lượt'], ['Diamond Bar', 'Quận 3 · HCM', '8.9k lượt'], ['Sakura Lounge', 'Trúc Bạch · HN', '8.1k lượt']],
      cast: [['Michi · 23', 'Nói tiếng Nhật', '★ 4.9 · 1.2k'], ['Mai · 25', 'Nói chuyện duyên', '★ 4.9 · 1.1k'], ['Yuki · 24', 'Phong cách đẹp', '★ 4.8 · 980'], ['Emi · 25', 'Nói tiếng Nhật', '★ 4.9 · 910'], ['Nana · 22', 'Hát hay', '★ 4.8 · 870']]
    },
    hn: {
      quan: [['Club Lumière', 'Tây Hồ', '12.4k lượt'], ['KTV Hoàng Gia', 'Kim Mã', '9.7k lượt'], ['Sakura Lounge', 'Trúc Bạch', '8.1k lượt'], ['Hanoi Velvet', 'Hoàn Kiếm', '7.3k lượt'], ['Casino Diamond', 'Tây Hồ', '6.5k lượt']],
      cast: [['Michi · 23', 'Nói tiếng Nhật', '★ 4.9 · 860'], ['Yuki · 24', 'Phong cách đẹp', '★ 4.8 · 640'], ['Rina · 21', 'Trong độ tuổi 20', '★ 4.7 · 520'], ['Mai · 25', 'Nói chuyện duyên', '★ 4.9 · 500'], ['Hana · 22', 'Nói tiếng Nhật', '★ 4.6 · 470']]
    },
    hcm: {
      quan: [['Sora Lounge', 'Quận 1', '11.8k lượt'], ['Diamond Bar', 'Quận 3', '8.9k lượt'], ['Saigon Pearl', 'Quận 1', '7.7k lượt'], ['Neon Garden', 'Bình Thạnh', '6.9k lượt'], ['Lotus Spa', 'Quận 7', '6.2k lượt']],
      cast: [['Emi · 25', 'Nói tiếng Nhật', '★ 4.9 · 720'], ['Nana · 22', 'Hát hay', '★ 4.8 · 690'], ['Aoi · 24', 'Dịu dàng', '★ 4.7 · 610'], ['Saki · 23', 'Vui vẻ', '★ 4.8 · 580'], ['Kana · 23', 'Thân thiện', '★ 4.7 · 540']]
    }
  };
  function buildRank(rows, type) {
    var crown = ['#E8B84B', '#B9C2CC', '#C8814B', '#5BC08A', '#5BA6E0'];
    var numColor = ['#5a3d00', '#3a424d', '#5a3300', '#0a3d28', '#0a2e4d'];
    var castImg = ['1494790108377-be9c29b29330', '1517841905240-472988babdf9', '1438761681033-6461ffad8d80', '1524504388940-b1c1722653e1', '1534528741775-53994a69daeb'];
    var quanImg = ['1572116469696-31de0f17cc34', '1566417713940-fe7c737a9ef2', '1551024601-bec78aea704b', '1596838132731-3301c3fd4317', '1514933651103-005eec06c04b'];
    var pool = type === 'cast' ? castImg : quanImg;
    return rows.map(function (r, i) {
      return { rank: i + 1, name: r[0], area: r[1], metric: r[2], crown: crown[i], numColor: numColor[i], img: photo(pool[i], 160) };
    });
  }

  var SERVICES = {
    nhahang: [['Sakura Teppanyaki', 'Tây Hồ · Nhà hàng Nhật', 'từ 800K', 'Đặt bàn nhanh', '1572116469696-31de0f17cc34', '#d6336c', '#7b2d6b'], ['Yakitori Hanoi', 'Ba Đình · BBQ Nhật', 'từ 600K', 'Mới', '1596838132731-3301c3fd4317', '#e0a23a', '#c0782d'], ['Sushi Lava', 'Quận 1 · Omakase', 'từ 1.2tr', 'Đánh giá cao', '1566417713940-fe7c737a9ef2', '#3a8fb0', '#2d5fae'], ['Wagyu House', 'Hoàn Kiếm · Steak', 'từ 1.5tr', 'Hot', '1551024601-bec78aea704b', '#8a6ad0', '#5d3da8']],
    spa: [['Spa Hồng Ngọc', 'Đống Đa · Spa', 'từ 500K', '-50% online', '1551024601-bec78aea704b', '#8a6ad0', '#5d3da8'], ['Lotus Massage', 'Quận 7 · Massage', 'từ 450K', 'Mới', '1514933651103-005eec06c04b', '#3a9fb0', '#2d6fae'], ['Onsen Retreat', 'Tây Hồ · Onsen', 'từ 900K', 'Cao cấp', '1470337458703-46ad1756a187', '#e0598a', '#a8336b'], ['Zen Therapy', 'Quận 3 · Trị liệu', 'từ 700K', 'Đánh giá cao', '1516450360452-9312f5e86fc7', '#5fae8a', '#2d8a6a']]
  };
  function buildSvc(key) {
    return (SERVICES[key] || []).map(function (s) { return { name: s[0], area: s[1], price: s[2], tag: s[3], grad: bg(s[4], s[5], s[6], 360) }; });
  }

  // ---------- ưu đãi / sự kiện ----------
  // [tên, nơi, nhãn giảm, hạn, imgId, kiểu badge màu]
  var OFFERS = [
    ['Happy Hour cuối tuần', 'Club Lumière · Tây Hồ', '-30%', 'Còn 3 ngày', '1572116469696-31de0f17cc34', 'pink'],
    ['Combo phòng VIP 2+1', 'KTV Hoàng Gia · Kim Mã', '2+1', 'Còn 8 ngày', '1566417713940-fe7c737a9ef2', 'purple'],
    ['Spa thư giãn nửa giá', 'Spa Hồng Ngọc · Đống Đa', '-50%', 'Sắp hết', '1596838132731-3301c3fd4317', 'amber'],
    ['Ladies Night −20%', 'Hanoi Velvet · Hoàn Kiếm', '-20%', 'Thứ 5 hàng tuần', '1470337458703-46ad1756a187', 'pink'],
    ['Welcome Member −8%', 'Sora Lounge · Quận 1', '-8%', 'Hội viên mới', '1551024601-bec78aea704b', 'purple'],
    ['Khai trương −10%', 'Neon Garden · Bình Thạnh', '-10%', 'Còn 5 ngày', '1514933651103-005eec06c04b', 'teal']
  ];
  function buildOffers() {
    return OFFERS.map(function (o) { return { title: o[0], place: o[1], value: o[2], expiry: o[3], img: photo(o[4], 720) }; });
  }

  // ---------- ví ưu đãi ----------
  // [tên, nơi, trạng thái, hạn, giá trị]
  var WALLET = [
    ['Happy Hour −30%', 'Club Lumière · Tây Hồ', 'holding', 'Còn 22:14:08', '−30%'],
    ['Combo VIP 2+1', 'KTV Hoàng Gia · Kim Mã', 'holding', 'Còn 6 ngày', '2+1'],
    ['Welcome Member −8%', 'Sora Lounge · Quận 1', 'holding', 'Còn 5 ngày', '−8%'],
    ['Spa thư giãn −50%', 'Spa Hồng Ngọc · Đống Đa', 'used', 'Đã dùng 12/06', '−50%'],
    ['Ladies Night −20%', 'Hanoi Velvet · Hoàn Kiếm', 'used', 'Đã dùng 02/06', '−20%'],
    ['Khai trương −10%', 'Neon Garden · Bình Thạnh', 'expired', 'Hết hạn 01/06', '−10%']
  ];
  // ---------- lịch sử đặt chỗ ----------
  // [nơi, meta, trạng thái, imgId]
  var BOOKINGS = [
    ['Club Lumière', 'Tây Hồ · 21/06 · 21:00 · 4 người', 'new', '1572116469696-31de0f17cc34'],
    ['Cast: Michi @ Club Lumière', '22/06 · 20:00 · 2 người', 'new', '1494790108377-be9c29b29330'],
    ['KTV Hoàng Gia', '18/06 · 22:00 · 6 người', 'done', '1566417713940-fe7c737a9ef2'],
    ['Sakura Lounge', '15/06 · 21:30 · 3 người', 'cancelled', '1551024601-bec78aea704b'],
    ['Diamond Bar', '10/06 · 20:00 · 2 người', 'done', '1524661135-423995f22d0b']
  ];
  function bkBadge(s) { return { 'new': { label: 'Mới', color: '#6d28d9', bg: '#f1ebff' }, done: { label: 'Hoàn tất', color: '#1f8a52', bg: '#e6f7ee' }, cancelled: { label: 'Đã hủy', color: '#b03a4a', bg: '#fbe4e7' } }[s]; }
  function cpBadge(s) { return { holding: { label: 'Đang giữ chỗ', color: '#6d28d9', bg: '#f1ebff' }, used: { label: 'Đã sử dụng', color: '#5b5870', bg: '#f3f2f5' }, expired: { label: 'Hết hạn', color: '#b03a4a', bg: '#fbe4e7' } }[s]; }

  // ---------- tài khoản ----------
  var ACCOUNT = { name: 'Nguyễn Văn A', phone: '0912 345 678', email: 'vana@email.com', tier: 'Vàng', points: 1240, nextTier: 'Bạch Kim', need: 760, joined: '03/2025' };

  return {
    fav: fav, booking: booking,
    photo: photo, grad: grad, bg: bg, heart: heart,
    chip: chip, pill: pill, pillSm: pillSm, seg: seg, tab: tab,
    VENUES: VENUES, venue: venue, CATS: CATS, AREAS: AREAS,
    CAST: CAST, cast: cast, CAST_FILTERS: CAST_FILTERS,
    RANK: RANK, buildRank: buildRank, SERVICES: SERVICES, buildSvc: buildSvc,
    OFFERS: OFFERS, buildOffers: buildOffers, WALLET: WALLET, BOOKINGS: BOOKINGS,
    bkBadge: bkBadge, cpBadge: cpBadge, ACCOUNT: ACCOUNT
  };
})();
