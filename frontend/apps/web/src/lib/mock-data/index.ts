import { Venue, Cast, Coupon, FilterTab } from '@/types';

export const recs: Venue[] = [
  { name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9, img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover", favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', price: '1.2tr', grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)' },
  { name: 'Sakura Club', area: 'Ba Đình', catLabel: 'KTV', rating: 4.7, img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=480&q=70') center/cover", favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', price: '2.5tr', grad: 'linear-gradient(140deg, #6d28d9, #4c1d95)' },
  { name: 'VIP Lounge', area: 'Hoàn Kiếm', catLabel: 'Lounge', rating: 4.8, img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover", favIcon: 'https://img.icons8.com/ios-filled/100/d6336c/like.png', price: '1.8tr', grad: 'linear-gradient(140deg, #f59e0b, #b45309)' },
  { name: 'Tokyo Night', area: 'Ba Đình', catLabel: 'Bar', rating: 4.5, img: "url('https://images.unsplash.com/photo-1542282811-943ef1a67702?auto=format&fit=crop&w=480&q=70') center/cover", favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', price: '900k', grad: 'linear-gradient(140deg, #059669, #064e3b)' }
];

export const cityTabs: FilterTab[] = [
  { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } },
  { label: 'Hà Nội', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } },
  { label: 'TP.HCM', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } }
];

export const cats: FilterTab[] = [
  { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Karaoke / KTV', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Bar / Lounge', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Casino', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Spa / Massage', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } }
];

export const areas: FilterTab[] = [
  { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Tây Hồ', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Hoàn Kiếm', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Kim Mã', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Đống Đa', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Trúc Bạch', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } }
];

export const venues: Venue[] = [
  { name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9, reviews: 312, price: '1.2tr', hasBadge: true, badgeText: 'Ưu đãi -20%', badgeColor: '#c0246a', favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)" },
  { name: 'KTV Hoàng Gia', area: 'Kim Mã', catLabel: 'Karaoke VIP', rating: 4.8, reviews: 208, price: '900K', hasBadge: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#3a8fb0,#2d5fae)" },
  { name: 'Sakura Lounge', area: 'Trúc Bạch', catLabel: 'Lounge', rating: 4.7, reviews: 156, price: '1.5tr', hasBadge: true, badgeText: 'Mới', badgeColor: '#6d28d9', favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)" },
  { name: 'Casino Diamond', area: 'Tây Hồ', catLabel: 'Casino', rating: 4.6, reviews: 89, price: '2tr', hasBadge: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)" },
  { name: 'Hanoi Velvet', area: 'Hoàn Kiếm', catLabel: 'Bar', rating: 4.7, reviews: 140, price: '1.1tr', hasBadge: true, badgeText: 'Ưu đãi -15%', badgeColor: '#c0246a', favIcon: 'https://img.icons8.com/ios-filled/100/FF3D71/like.png', img: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0598a,#a8336b)" }
];

export const castFilters: FilterTab[] = [
  { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: 'Nói tiếng Nhật', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
  { label: '20-23 tuổi', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } }
];

export const castCards: Cast[] = [
  { name: 'Michi', age: 23, desc: 'Nói tiếng Nhật', rating: 4.9, jp: true, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0598a,#a8336b)" },
  { name: 'Yuki', age: 24, desc: 'Phong cách đẹp', rating: 4.8, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#3a9fb0,#2d6fae)" },
  { name: 'Rina', age: 21, desc: 'Trong độ tuổi 20', rating: 4.7, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)" }
];

export const offers: Coupon[] = [
  { title: 'Happy Hour cuối tuần', place: 'Club Lumière · Tây Hồ', value: '-30%', expiry: 'Còn 3 ngày', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Xem ưu đãi', btnStyle: { background: '#6d28d9', color: '#fff' } },
  { title: 'Combo phòng VIP 2+1', place: 'KTV Hoàng Gia · Kim Mã', value: '2+1', expiry: 'Còn 8 ngày', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Xem ưu đãi', btnStyle: { background: '#6d28d9', color: '#fff' } },
  { title: 'Spa thư giãn nửa giá', place: 'Spa Hồng Ngọc · Đống Đa', value: '-50%', expiry: 'Sắp hết', img: "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Đã lưu ví ✓', btnStyle: { background: '#e6f7ee', color: '#177544' } }
];

export const rankListQuan: Venue[] = [
  { rank: 1, numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Club Lumière', area: 'Tây Hồ · HN', href: '/stores/club-lumiere' },
  { rank: 2, numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sora Lounge', area: 'Quận 1 · HCM', href: '/stores/sora-lounge' },
  { rank: 3, numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'KTV Hoàng Gia', area: 'Kim Mã · HN', href: '/stores/ktv-hoang-gia' },
  { rank: 4, numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Diamond Bar', area: 'Quận 3 · HCM', href: '/stores/diamond-bar' },
  { rank: 5, numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sakura Lounge', area: 'Trúc Bạch · HN', href: '/stores/sakura-lounge' },
  { rank: 6, numColor: '#14532d', crown: 'linear-gradient(140deg, #bbf7d0, #16a34a)', img: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Jade Lounge', area: 'Hoàn Kiếm · HN', href: '/stores/jade-lounge' },
  { rank: 7, numColor: '#312e81', crown: 'linear-gradient(140deg, #c4b5fd, #7c3aed)', img: "url('https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Star KTV', area: 'Cầu Giấy · HN', href: '/stores/star-ktv' }
];

export const rankListCast: Cast[] = [
  { rank: 1, numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)', img: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Yuki', area: 'Tây Hồ · HN', href: '/casts/yuki' },
  { rank: 2, numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)', img: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Hana', area: 'Quận 1 · HCM', href: '/casts/hana' },
  { rank: 3, numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)', img: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Rina', area: 'Kim Mã · HN', href: '/casts/rina' },
  { rank: 4, numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)', img: "url('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Michi', area: 'Club Lumière · HN', href: '/casts/michi' },
  { rank: 5, numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)', img: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Aiko', area: 'Sora Lounge · HCM', href: '/casts/aiko' },
  { rank: 6, numColor: '#14532d', crown: 'linear-gradient(140deg, #bbf7d0, #16a34a)', img: "url('https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Yuna', area: 'Neon Club · HN', href: '/casts/yuna-neon' },
  { rank: 7, numColor: '#312e81', crown: 'linear-gradient(140deg, #c4b5fd, #7c3aed)', img: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Akari', area: 'Jade Lounge · HN', href: '/casts/akari-jade' }
];

export const svcData: Venue[] = [
  { name: 'Sakura Teppanyaki', area: 'Tây Hồ · Nhà hàng Nhật', price: 'từ 800K', badgeText: 'Đặt bàn nhanh', grad: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover" },
  { name: 'Yakitori Hanoi', area: 'Ba Đình · BBQ Nhật', price: 'từ 600K', badgeText: 'Mới', grad: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=480&q=70') center/cover" },
  { name: 'Sushi Lava', area: 'Quận 1 · Omakase', price: 'từ 1.2tr', badgeText: 'Đánh giá cao', grad: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover" },
  { name: 'Wagyu House', area: 'Hoàn Kiếm · Steak', price: 'từ 1.5tr', badgeText: 'Hot', grad: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=480&q=70') center/cover" }
];

export const spaData: Venue[] = [
  { name: 'Spa Hồng Ngọc', area: 'Đống Đa · Massage', price: 'từ 500K', badgeText: 'Thư giãn', grad: "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=480&q=70') center/cover" },
  { name: 'Hanoi Oasis Spa', area: 'Tây Hồ · Xông hơi', price: 'từ 700K', badgeText: 'Ưu đãi 20%', grad: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=480&q=70') center/cover" },
  { name: 'Sen Tài Thu', area: 'Ba Đình · Cổ truyền', price: 'từ 400K', badgeText: 'Phổ biến', grad: "url('https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=480&q=70') center/cover" },
  { name: 'Aroma Clinic', area: 'Quận 1 · Chăm sóc da', price: 'từ 1.0tr', badgeText: 'Cao cấp', grad: "url('https://images.unsplash.com/photo-1570172619644-def2f520b22a?auto=format&fit=crop&w=480&q=70') center/cover" }
];

export const adBanners = [
  {
    tag: 'Quảng cáo',
    title: 'Đêm Nhạc DJ SODA tại Club Lumière',
    desc: 'Đặt bàn VIP từ 2.500.000đ',
    btnText: 'Đặt ngay',
    img: "linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.72)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80') center/cover"
  },
  {
    tag: 'Quảng cáo',
    title: 'Sakura Lounge - Giảm 25% nhóm 4+',
    desc: 'Không gian Nhật Bản · Ưu đãi nhóm cuối tuần',
    btnText: 'Xem ưu đãi',
    img: "linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.72)),url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80') center/cover"
  },
  {
    tag: 'Quảng cáo',
    title: 'Karaoke Hoàng Gia - Tặng Đĩa Trái Cây',
    desc: 'Áp dụng khi đặt phòng trước 18:00',
    btnText: 'Chi tiết',
    img: "linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.72)),url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=600&q=80') center/cover"
  }
];

export const hotVideos = [
  { name: 'Club Lumière · Tây Hồ', time: '0:45', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=70') center/cover" },
  { name: 'Sora Lounge · Quận 1', time: '1:12', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=720&q=70') center/cover" },
  { name: 'Sakura Lounge · Trúc Bạch', time: '0:58', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=720&q=70') center/cover" },
  { name: 'Casino Diamond · Tây Hồ', time: '1:30', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=720&q=70') center/cover" }
];

export const homeCategories = [
  { name: 'Tìm quán', icon: '/SVG/tim quan.svg', href: '/danh-sach-quan' },
  { name: 'Tìm Cast', icon: '/SVG/tim cast.svg', href: '/danh-sach-cast' },
  { name: 'Ưu đãi', icon: '/SVG/uu daI.svg', href: '/uu-dai' },
  { name: 'Sự kiện', icon: '/SVG/su kien.svg', href: '/danh-sach-quan' },
  { name: 'Nhà hàng', icon: '/icons/nha-hang.svg', href: '/nha-hang' },
  { name: 'Spa', icon: '/SVG/spa.svg', href: '/spa' },
  { name: 'Hướng dẫn', icon: 'https://img.icons8.com/fluency/96/book.png', href: '/huong-dan' }
];
