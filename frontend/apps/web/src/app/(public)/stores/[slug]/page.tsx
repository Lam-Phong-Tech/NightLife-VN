"use client";
import { Cast, MockItem } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { ChevronLeft, Heart, Play } from 'lucide-react';

const legacyStoreSlugMap: Record<string, string> = {
  'club-lumiere': 'neon-club',
  'ktv-hoang-gia': 'golden-voice-ktv',
  'diamond-bar': 'crimson-bar',
  'sora-lounge': 'jade-lounge',
};

export default function Page() {
  const routeParams = useParams<{ slug?: string }>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [guestCount, setGuestCount] = useState(4);
  const [activeStoreTab, setActiveStoreTab] = useState(0);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(1);
  const tabStyle = (active: boolean): React.CSSProperties => ({
    color: active ? '#d4b26a' : '#8a879a',
    fontWeight: active ? 800 : 600,
    borderBottom: active ? '2px solid #d4b26a' : '2px solid transparent',
    paddingBottom: '12px',
    cursor: 'pointer',
  });
  const slotStyle = (active: boolean): React.CSSProperties => ({
    background: active ? '#d4b26a' : 'rgba(255,255,255,.045)',
    color: active ? '#241a0a' : '#d8d1c1',
    border: active ? '1px solid #d4b26a' : '1px solid rgba(212,178,106,.24)',
    borderRadius: '18px',
    padding: '8px 14px',
    fontWeight: 700,
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  });
  const thumbs: MockItem[] = [
    { bg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=360&q=70') center/cover" },
    { bg: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=360&q=70') center/cover" }
        ];
    const tabs: MockItem[] = [
          { label: 'Giới thiệu', style: tabStyle(activeStoreTab === 0), pick: () => setActiveStoreTab(0) },
          { label: 'Bảng giá', style: tabStyle(activeStoreTab === 1), pick: () => setActiveStoreTab(1) },
          { label: 'Cast', style: tabStyle(activeStoreTab === 2), pick: () => setActiveStoreTab(2) },
          { label: 'Đánh giá', style: tabStyle(activeStoreTab === 3), pick: () => setActiveStoreTab(3) },
          { label: 'Bản đồ', style: tabStyle(activeStoreTab === 4), pick: () => setActiveStoreTab(4) }
        ];
    const cast: Cast[] = [
      {
        name: 'Rina',
        age: 22,
        desc: 'Tiếng Nhật tốt',
        area: 'Tây Hồ',
        rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=480&q=70') center/cover",
      },
      {
        name: 'Michi',
        age: 24,
        desc: 'VIP room host',
        area: 'Tây Hồ',
        rating: 4.8,
        img: "url('https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=480&q=70') center/cover",
      },
      {
        name: 'Hana',
        age: 23,
        desc: 'Nói Anh / Nhật',
        area: 'Tây Hồ',
        rating: 4.7,
        img: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&q=70') center/cover",
      },
      {
        name: 'Linh',
        age: 25,
        desc: 'Event support',
        area: 'Tây Hồ',
        rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=70') center/cover",
      },
      {
        name: 'Yumi',
        age: 21,
        desc: 'Table service',
        area: 'Tây Hồ',
        rating: 4.8,
        img: "url('https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=480&q=70') center/cover",
      },
    ];
    const dates: MockItem[] = [
          { label: 'T6 · 21/06', style: slotStyle(selectedDateIndex === 0), pick: () => setSelectedDateIndex(0) },
          { label: 'T7 · 22/06', style: slotStyle(selectedDateIndex === 1), pick: () => setSelectedDateIndex(1) },
          { label: 'CN · 23/06', style: slotStyle(selectedDateIndex === 2), pick: () => setSelectedDateIndex(2) }
        ];
    const times: MockItem[] = [
          { label: '20:00', style: slotStyle(selectedTimeIndex === 0), pick: () => setSelectedTimeIndex(0) },
          { label: '21:00', style: slotStyle(selectedTimeIndex === 1), pick: () => setSelectedTimeIndex(1) },
          { label: '22:00', style: slotStyle(selectedTimeIndex === 2), pick: () => setSelectedTimeIndex(2) },
          { label: '23:00', style: slotStyle(selectedTimeIndex === 3), pick: () => setSelectedTimeIndex(3) }
        ];

    // Standalone mock variables
    const vArea = 'Tây Hồ';
    const vName = 'Club Lumière';
    const vRating = 4.9;
    const vReviews = 312;
    const vCat = 'Bar Lounge';
    const toggleFav = () => setIsFavorite((value) => !value);
    const favIcon = isFavorite
      ? 'https://img.icons8.com/ios-filled/100/FF3D71/like.png'
      : 'https://img.icons8.com/ios/100/D4B26A/like.png';
    const vPrice = 'từ 1.2tr';
    const dec = () => setGuestCount((value) => Math.max(1, value - 1));
    const guests = guestCount;
    const inc = () => setGuestCount((value) => Math.min(20, value + 1));
    const routeSlug = typeof routeParams.slug === 'string' ? routeParams.slug : 'neon-club';
    const storeSlug = legacyStoreSlugMap[routeSlug] ?? routeSlug;
    const bookingHref = `/dat-cho?${new URLSearchParams({
      storeSlug,
      storeName: vName,
      area: vArea,
      guests: String(guests),
      time: times[selectedTimeIndex]?.label ?? '21:00',
    }).toString()}`;
    const couponHref = '/uu-dai';
    const mainBg = "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover";
    const vPriceShort = vPrice;
    const mapEmbedSrc = 'https://www.google.com/maps?q=Club%20Lumiere%20Tay%20Ho%20Hanoi&output=embed';
    const locationNote = 'Gần hồ Tây, thuận tiện gọi xe sau 22:00. Admin sẽ gửi vị trí chi tiết sau khi xác nhận đặt chỗ.';

    return (
      <React.Fragment>
        <div className="block md:hidden store-detail-mobile-shell">

<>
<>




</>

<div className="store-detail-mobile" style={{"width":"100%","minHeight":"100svh","boxSizing":"border-box","padding":"0px","background":"#0c0c0f","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"margin":"0","width":"100%","minHeight":"100svh","background":"#111114","borderRadius":"0px","overflow":"hidden","boxShadow":"none","color":"#f3f0ea","border":"0"}}>
    {/* hero */}
    <div style={{"position":"relative","height":"200px","background":mainBg}}>
      <Link href="/danh-sach-quan" aria-label="Quay lại danh sách quán" style={{"position":"absolute","top":"14px","left":"14px","width":"42px","height":"42px","borderRadius":"50%","background":"rgba(255,255,255,.94)","display":"flex","alignItems":"center","justifyContent":"center","color":"#241a0a","boxShadow":"0 10px 24px rgba(0,0,0,.22)","zIndex":2}}><ChevronLeft size={23} strokeWidth={2.5} /></Link>
      <button type="button" aria-label={isFavorite ? "Bỏ lưu quán" : "Lưu quán"} className="btn" onClick={toggleFav} style={{"position":"absolute","top":"14px","right":"14px","width":"42px","height":"42px","border":"0","borderRadius":"50%","background":"rgba(255,255,255,.94)","display":"flex","alignItems":"center","justifyContent":"center","color":isFavorite ? "#e0729e" : "#241a0a","boxShadow":"0 10px 24px rgba(0,0,0,.22)","zIndex":2}}><Heart size={21} strokeWidth={2.2} fill={isFavorite ? "#e0729e" : "none"} /></button>
      <button type="button" aria-label="Xem video quán" style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"54px","height":"54px","border":"0","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center","color":"#d4b26a","boxShadow":"0 12px 30px rgba(0,0,0,.28)"}}><Play size={23} fill="#d4b26a" style={{"marginLeft":"3px"}} /></button>
    </div>
    {/* thumbnails */}
    <div className="hscroll" style={{"display":"flex","gap":"8px","padding":"10px 18px 0","overflowX":"auto"}}>
      {thumbs?.map((t, index) => (<React.Fragment key={index}><span className="btn" onClick={t.pick} style={{"width":"60px","height":"46px","flex":"none","borderRadius":"9px","background":t.bg}}></span></React.Fragment>))}
    </div>

    <div style={{"background":"#141417","padding":"14px 18px 14px"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"12px"}}>
        <div aria-label={`${vName} logo`} style={{"width":"54px","height":"54px","borderRadius":"14px","background":"linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)","color":"#241a0a","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"18px","fontWeight":"900","border":"1px solid rgba(244,227,180,.5)","flex":"none"}}>CL</div>
        <div style={{"minWidth":0,"flex":"1"}}>
          <h2 style={{"fontSize":"20px","fontWeight":"800"}}>{vName}</h2>
          <div style={{"display":"flex","alignItems":"center","gap":"10px","marginTop":"6px","fontSize":"12.5px","color":"#5b5870","flexWrap":"wrap"}}><span style={{"color":"#e8923a","fontWeight":"600"}}>★ {vRating}</span><span style={{"color":"#a8a5b4"}}>({vReviews})</span> · {vArea}, Hà Nội</div>
        </div>
      </div>
      <div style={{"display":"flex","gap":"7px","marginTop":"11px","flexWrap":"wrap"}}><span style={{"fontSize":"11px","background":"#f1ebff","color":"#6d28d9","borderRadius":"12px","padding":"4px 10px","fontWeight":"600"}}>{vCat}</span><span style={{"fontSize":"11px","background":"#e6f7ee","color":"#1f8a52","borderRadius":"12px","padding":"4px 10px"}}>● Đang mở</span><span style={{"fontSize":"11px","background":"#f3f2f5","color":"#5b5870","borderRadius":"12px","padding":"4px 10px"}}>Tiếng Nhật</span></div>

      {/* tabs */}
      <div className="hscroll" style={{"display":"flex","gap":"20px","borderBottom":"1px solid #ececec","marginTop":"16px","fontSize":"13.5px","overflowX":"auto"}}>
        {tabs?.map((t, index) => (<React.Fragment key={index}><span className="btn" onClick={t.pick} style={{ ...{"whiteSpace":"nowrap"}, ...t.style }}>{t.label}</span></React.Fragment>))}
      </div>

      {activeStoreTab === 0 ? (
        <>
          <p style={{"fontSize":"12.5px","lineHeight":"1.65","color":"#d8d1c1","marginTop":"13px"}}>{vName} là lounge bar cao cấp khu {vArea} — không gian sang trọng, phòng VIP riêng tư, đội ngũ cast tuyển chọn kỹ, phục vụ khách Nhật với nhân viên thông thạo tiếng Nhật.</p>
          <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"8px","marginTop":"13px"}}>
            {[
              ["Giá từ", vPriceShort],
              ["Cast nổi bật", `${cast.length} hồ sơ`],
              ["Đánh giá", `${vRating}/5`],
              ["Khu vực", vArea],
            ].map(([label, value]) => (
              <div key={label} style={{"background":"#19191d","border":"1px solid rgba(212,178,106,.18)","borderRadius":"12px","padding":"11px"}}>
                <div style={{"fontSize":"11px","color":"#8a879a"}}>{label}</div>
                <div style={{"fontSize":"13px","fontWeight":"800","marginTop":"4px","color":"#f0dda8"}}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{"marginTop":"10px","background":"rgba(212,178,106,.09)","border":"1px solid rgba(212,178,106,.2)","borderRadius":"12px","padding":"11px","fontSize":"12px","lineHeight":"1.55","color":"#d8d1c1"}}>
            <b style={{"color":"#f0dda8"}}>Gợi ý:</b> phù hợp tiếp khách VIP, nhóm nhỏ muốn phòng riêng, hoặc khách Nhật cần hỗ trợ ngôn ngữ.
          </div>
          <div style={{"marginTop":"10px","background":"linear-gradient(135deg,rgba(212,178,106,.16),rgba(255,255,255,.04))","border":"1px solid rgba(212,178,106,.24)","borderRadius":"12px","padding":"12px","fontSize":"12px","lineHeight":"1.55","color":"#d8d1c1"}}>
            <div style={{"fontSize":"10px","fontWeight":"900","letterSpacing":".12em","textTransform":"uppercase","color":"#d4b26a"}}>Campaign</div>
            <div style={{"marginTop":"6px","display":"flex","alignItems":"center","justifyContent":"space-between","gap":"10px"}}>
              <div><b style={{"color":"#f0dda8"}}>Happy Hour -20%</b><br /><span>Áp dụng khi đặt chỗ trước 20:00.</span></div>
              <Link href={couponHref} className="btn" style={{"flex":"none","border":"1px solid rgba(212,178,106,.32)","borderRadius":"10px","padding":"8px 10px","color":"#f0dda8","fontSize":"11px","fontWeight":"900","textDecoration":"none"}}>Coupon</Link>
            </div>
          </div>
        </>
      ) : null}
      {activeStoreTab === 1 ? (
        <div style={{"marginTop":"13px"}}>
          <div style={{"fontSize":"12px","fontWeight":"800","color":"#f0dda8","marginBottom":"8px"}}>Bảng giá tham khảo</div>
          <div style={{"background":"#19191d","border":"1px solid rgba(212,178,106,.22)","borderRadius":"12px","overflow":"hidden","fontSize":"12.5px","color":"#f3f0ea"}}><div style={{"display":"flex","justifyContent":"space-between","padding":"11px 14px","borderBottom":"1px solid rgba(212,178,106,.12)"}}><span>Set bàn thường (2 giờ)</span><span style={{"fontWeight":"700","color":"#f0dda8"}}>1.200.000đ</span></div><div style={{"display":"flex","justifyContent":"space-between","padding":"11px 14px","borderBottom":"1px solid rgba(212,178,106,.12)"}}><span>Phòng VIP (2 giờ)</span><span style={{"fontWeight":"700","color":"#f0dda8"}}>3.500.000đ</span></div><div style={{"display":"flex","justifyContent":"space-between","padding":"11px 14px","borderBottom":"1px solid rgba(212,178,106,.12)"}}><span>Combo sinh nhật</span><span style={{"fontWeight":"700","color":"#f0dda8"}}>từ 2.000.000đ</span></div><div style={{"display":"flex","justifyContent":"space-between","padding":"11px 14px"}}><span>Phí cast / giờ</span><span style={{"fontWeight":"700","color":"#f0dda8"}}>từ 500.000đ</span></div></div>
          <div style={{"marginTop":"9px","fontSize":"11.5px","lineHeight":"1.5","color":"#b6b1a6"}}>Giá cuối cùng được admin xác nhận theo ngày, khung giờ và số khách.</div>
        </div>
      ) : null}
      {activeStoreTab === 2 ? (
        <div style={{"marginTop":"13px"}}>
          <div style={{"fontSize":"12px","fontWeight":"800","color":"#f0dda8","marginBottom":"8px"}}>Cast đang hoạt động</div>
          <div className="hscroll" style={{"display":"flex","gap":"9px","overflowX":"auto"}}>{cast?.map((c, index) => (<React.Fragment key={index}><div style={{"width":"104px","flex":"none","borderRadius":"12px","overflow":"hidden","background":"#19191d","border":"1px solid rgba(212,178,106,.18)"}}><div style={{"position":"relative","height":"116px","background":c.img}}><div style={{"position":"absolute","top":"8px","left":"8px","background":"rgba(12,12,15,.72)","color":"#f0dda8","fontSize":"10px","borderRadius":"999px","padding":"3px 7px"}}>★ {c.rating}</div></div><div style={{"padding":"8px"}}><div style={{"color":"#fff","fontSize":"12px","fontWeight":"800"}}>{c.name} · {c.age}</div><div style={{"marginTop":"3px","fontSize":"10.5px","color":"#b6b1a6","lineHeight":"1.35"}}>{c.desc}</div></div></div></React.Fragment>))}</div>
        </div>
      ) : null}
      {activeStoreTab === 3 ? (
        <div style={{"marginTop":"13px","display":"flex","flexDirection":"column","gap":"10px"}}>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","background":"rgba(212,178,106,.1)","border":"1px solid rgba(212,178,106,.22)","borderRadius":"12px","padding":"11px 12px"}}><div><div style={{"fontSize":"22px","fontWeight":"900","color":"#f0dda8"}}>{vRating}</div><div style={{"fontSize":"11px","color":"#d8d1c1"}}>{vReviews} đánh giá</div></div><div style={{"fontSize":"13px","color":"#f0c767"}}>★★★★★</div></div>
          <div style={{"background":"#19191d","border":"1px solid rgba(212,178,106,.18)","borderRadius":"12px","padding":"12px"}}><div style={{"display":"flex","alignItems":"center","gap":"9px"}}><span style={{"width":"28px","height":"28px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=160&q=70') center/cover"}}></span><div><div style={{"fontSize":"12.5px","fontWeight":"700","color":"#f3f0ea"}}>Tanaka K.</div><div style={{"fontSize":"10px","color":"#f0c767"}}>★★★★★</div></div></div><p style={{"fontSize":"12px","color":"#d8d1c1","marginTop":"7px","lineHeight":"1.5"}}>Không gian đẹp, nhân viên nói tiếng Nhật rất tốt.</p></div>
        </div>
      ) : null}
      {activeStoreTab === 4 ? (
        <div style={{"marginTop":"13px","border":"1px solid rgba(212,178,106,.22)","borderRadius":"12px","overflow":"hidden","background":"#19191d"}}>
          <iframe
            title={`${vName} Google Map`}
            src={mapEmbedSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{"display":"block","width":"100%","height":"178px","border":"0","background":"#19191d"}}
          />
          <div style={{"padding":"12px","fontSize":"12.5px","lineHeight":"1.55","color":"#d8d1c1"}}><div style={{"fontWeight":"800","color":"#f0dda8"}}>{vName} · {vArea}</div><div style={{"marginTop":"4px"}}>{locationNote}</div><div style={{"marginTop":"8px","display":"grid","gap":"4px","fontSize":"11.5px"}}><span>Giờ mở cửa: 18:00 - 02:00</span><span>Gửi vị trí: sau khi admin xác nhận đơn đặt</span><span>Bãi xe: hỗ trợ tại cửa quán</span></div></div>
        </div>
      ) : null}


      {/* booking selectors */}
      <div style={{"marginTop":"16px","fontSize":"11.5px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginBottom":"7px"}}>Chọn ngày</div>
      <div className="hscroll" style={{"display":"flex","gap":"7px","overflowX":"auto"}}>{dates?.map((d, index) => (<React.Fragment key={index}><span className="btn" onClick={d.pick} style={d.style}>{d.label}</span></React.Fragment>))}</div>
      <div style={{"marginTop":"12px","fontSize":"11.5px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginBottom":"7px"}}>Khung giờ</div>
      <div className="hscroll" style={{"display":"flex","gap":"7px","overflowX":"auto"}}>{times?.map((t, index) => (<React.Fragment key={index}><span className="btn" onClick={t.pick} style={t.style}>{t.label}</span></React.Fragment>))}</div>
      <div style={{"marginTop":"12px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span style={{"fontSize":"11.5px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase"}}>Số khách</span><span style={{"display":"flex","alignItems":"center","gap":"14px"}}><span className="btn" onClick={dec} style={{"width":"30px","height":"30px","borderRadius":"8px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"17px"}}>−</span><span style={{"fontWeight":"700","fontSize":"14px","minWidth":"54px","textAlign":"center"}}>{guests} người</span><span className="btn" onClick={inc} style={{"width":"30px","height":"30px","borderRadius":"8px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"17px"}}>+</span></span></div>
    </div>

    {/* sticky CTA */}
    <div className="store-mobile-cta" style={{"background":"#141417","borderTop":"1px solid rgba(212,178,106,.18)","padding":"12px 18px 18px","display":"grid","gridTemplateColumns":"minmax(0,1fr) auto auto","alignItems":"center","gap":"8px"}}>
      <div><div style={{"fontSize":"11px","color":"#8a879a"}}>Đặt bàn từ</div><div style={{"fontSize":"16px","fontWeight":"800"}}>{vPriceShort}</div></div>
      <Link href={bookingHref} className="btn" style={{"background":"linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)","color":"#241a0a","textAlign":"center","borderRadius":"12px","padding":"12px 11px","fontWeight":"900","fontSize":"12px","textDecoration":"none","display":"flex","alignItems":"center","justifyContent":"center","whiteSpace":"nowrap"}}>Đặt chỗ</Link>
      <Link href={couponHref} className="btn" style={{"border":"1px solid rgba(212,178,106,.32)","color":"#f0dda8","textAlign":"center","borderRadius":"12px","padding":"12px 11px","fontWeight":"900","fontSize":"12px","textDecoration":"none","display":"flex","alignItems":"center","justifyContent":"center","whiteSpace":"nowrap"}}>Coupon</Link>
    </div>
  </div>
</div>
<style jsx global>{`
  @media (max-width: 767px) {
    .nl-page-content:has(.store-detail-mobile) {
      padding-bottom: calc(150px + env(safe-area-inset-bottom)) !important;
    }

    .nl-page-content .store-detail-mobile-shell,
    .nl-page-content .store-detail-mobile {
      width: 100vw !important;
      max-width: 100vw !important;
      min-height: 100svh !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #0c0c0f !important;
      overflow-x: hidden !important;
    }

    .nl-page-content .store-detail-mobile > div {
      width: 100% !important;
      min-height: 100svh !important;
      border: 0 !important;
      box-shadow: none !important;
    }

    .nl-page-content .store-mobile-cta {
      position: fixed !important;
      left: 0 !important;
      right: 0 !important;
      bottom: calc(74px + env(safe-area-inset-bottom)) !important;
      z-index: 70 !important;
      box-shadow: 0 -18px 36px rgba(0, 0, 0, 0.28) !important;
    }
  }
`}</style>
</>


</div>
        <div className="hidden md:block">

<>
<>




</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    {/* header */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><Link href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></Link><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><Link href="/" className="lk">Trang chủ</Link><Link href="/danh-sach-quan" className="lk">Tìm quán</Link><Link href="/danh-sach-cast" className="lk">Cast</Link><Link href="/xep-hang" className="lk">Bảng xếp hạng</Link><Link href="/tour" className="lk">Tour</Link><Link href="/blog" className="lk">Blog</Link></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><Link href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</Link><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    <div style={{"padding":"18px 34px 0","fontSize":"12.5px","color":"#8a879a"}}><Link href="/" className="lk">Trang chủ</Link> › <Link href="/danh-sach-quan" className="lk">Tìm quán</Link> › {vArea} › <span style={{"color":"#1f1d29"}}>{vName}</span></div>

    {/* gallery */}
    <div style={{"padding":"16px 34px 0","display":"grid","gridTemplateColumns":"2fr 1fr 1fr","gridTemplateRows":"130px 130px","gap":"10px"}}>
      <div style={{"gridRow":"span 2","borderRadius":"14px","background":mainBg,"position":"relative"}}><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"48px","height":"48px","borderRadius":"50%","background":"rgba(255,255,255,.92)","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"19px","height":"19px","marginLeft":"2px","display":"inline-block"}} alt="" /></span><span style={{"position":"absolute","bottom":"10px","left":"10px","background":"rgba(20,8,16,.5)","color":"#fff","fontSize":"11px","fontWeight":"600","borderRadius":"10px","padding":"3px 10px"}}>▶ Video</span></div>
      {thumbs?.map((t, index) => (<React.Fragment key={index}>
        <div className="thumb" onClick={t.pick} style={{"borderRadius":"14px","background":t.bg}}></div>
      </React.Fragment>))}
    </div>

    <div style={{"display":"flex","gap":"24px","padding":"22px 34px 30px"}}>
      {/* main */}
      <div style={{"flex":"1"}}>
        <div style={{"display":"flex","alignItems":"flex-start","justifyContent":"space-between"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"14px"}}>
            <div aria-label={`${vName} logo`} style={{"width":"68px","height":"68px","borderRadius":"16px","background":"linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)","color":"#241a0a","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"22px","fontWeight":"900","border":"1px solid rgba(244,227,180,.5)","boxShadow":"0 14px 28px rgba(0,0,0,.18)","flex":"none"}}>CL</div>
            <div>
              <h2 style={{"fontSize":"26px","fontWeight":"800"}}>{vName}</h2>
              <div style={{"display":"flex","alignItems":"center","gap":"14px","marginTop":"8px","fontSize":"13px","color":"#5b5870"}}><span style={{"color":"#e8923a","fontWeight":"600"}}>★ {vRating}</span> <span style={{"color":"#a8a5b4"}}>{vReviews} đánh giá</span> · <span>{vArea}, Hà Nội</span></div>
              <div style={{"display":"flex","gap":"8px","marginTop":"12px","flexWrap":"wrap"}}><span style={{"fontSize":"12px","background":"#f1ebff","color":"#6d28d9","borderRadius":"14px","padding":"5px 11px","fontWeight":"600"}}>{vCat}</span><span style={{"fontSize":"12px","background":"#f3f2f5","color":"#5b5870","borderRadius":"14px","padding":"5px 11px"}}>Có VIP room</span><span style={{"fontSize":"12px","background":"#f3f2f5","color":"#5b5870","borderRadius":"14px","padding":"5px 11px"}}>Phục vụ tiếng Nhật</span><span style={{"fontSize":"12px","background":"#e6f7ee","color":"#1f8a52","borderRadius":"14px","padding":"5px 11px"}}>● Đang mở · đến 02:00</span></div>
            </div>
          </div>
          <div style={{"display":"flex","gap":"10px"}}>
            <span className="btn" onClick={toggleFav} style={{"width":"42px","height":"42px","borderRadius":"11px","border":"1px solid #ececec","background":"#fff","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src={favIcon} style={{"width":"19px","height":"19px","display":"inline-block"}} alt="" /></span>
            <span className="btn" style={{"width":"42px","height":"42px","borderRadius":"11px","border":"1px solid #ececec","background":"#fff","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/6D28D9/share.png" style={{"width":"19px","height":"19px","display":"inline-block"}} alt="" /></span>
          </div>
        </div>

        {/* tabs */}
        <div style={{"display":"flex","gap":"26px","borderBottom":"1px solid #ececec","marginTop":"22px","fontSize":"14px"}}>
          {tabs?.map((t, index) => (<React.Fragment key={index}><span onClick={t.pick} style={t.style}>{t.label}</span></React.Fragment>))}
        </div>

        {activeStoreTab === 0 ? (
          <>
            <p style={{"fontSize":"13.5px","lineHeight":"1.7","color":"#3a384a","marginTop":"18px"}}>{vName} là lounge bar cao cấp bậc nhất khu {vArea}, không gian sang trọng với hệ thống âm thanh - ánh sáng hiện đại, phòng VIP riêng tư và đội ngũ cast được tuyển chọn kỹ lưỡng. Phục vụ chuyên nghiệp cho khách Nhật với nhân viên thông thạo tiếng Nhật.</p>
            <div style={{"marginTop":"18px","display":"grid","gridTemplateColumns":"1.2fr .8fr","gap":"14px"}}>
              <div style={{"background":"rgba(255,255,255,.045)","border":"1px solid rgba(212,178,106,.22)","borderRadius":"16px","padding":"16px"}}>
                <div style={{"fontSize":"12px","fontWeight":"800","letterSpacing":".08em","textTransform":"uppercase","color":"#d4b26a"}}>Tổng quan dịch vụ</div>
                <div style={{"display":"grid","gridTemplateColumns":"repeat(2,1fr)","gap":"10px","marginTop":"13px"}}>
                  {[
                    ["Giá tham khảo", vPrice],
                    ["Cast đang hoạt động", `${cast.length} hồ sơ`],
                    ["Đánh giá", `${vRating}/5 · ${vReviews} lượt`],
                    ["Khu vực", `${vArea}, Hà Nội`],
                  ].map(([label, value]) => (
                    <div key={label} style={{"border":"1px solid rgba(212,178,106,.18)","borderRadius":"12px","padding":"12px","background":"rgba(12,12,15,.36)"}}>
                      <div style={{"fontSize":"11.5px","color":"#8a879a"}}>{label}</div>
                      <div style={{"fontSize":"14px","fontWeight":"800","color":"#f0dda8","marginTop":"4px"}}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{"background":"rgba(212,178,106,.09)","border":"1px solid rgba(212,178,106,.22)","borderRadius":"16px","padding":"16px"}}>
                <div style={{"fontSize":"14px","fontWeight":"900","color":"#f0dda8"}}>Điểm nổi bật</div>
                <div style={{"display":"grid","gap":"9px","marginTop":"12px","fontSize":"13px","lineHeight":"1.5","color":"#d8d1c1"}}>
                  <div>• Phòng VIP riêng tư, phù hợp tiếp khách.</div>
                  <div>• Nhân sự hỗ trợ tiếng Nhật và tiếng Anh.</div>
                  <div>• Admin xác nhận đặt chỗ, không cần thanh toán online.</div>
                </div>
              </div>
            </div>
            <div style={{"marginTop":"14px","background":"linear-gradient(135deg,rgba(212,178,106,.14),rgba(255,255,255,.035))","border":"1px solid rgba(212,178,106,.24)","borderRadius":"16px","padding":"16px","display":"flex","alignItems":"center","justifyContent":"space-between","gap":"18px"}}>
              <div>
                <div style={{"fontSize":"12px","fontWeight":"900","letterSpacing":".08em","textTransform":"uppercase","color":"#d4b26a"}}>Campaign</div>
                <div style={{"fontSize":"18px","fontWeight":"900","color":"#f0dda8","marginTop":"7px"}}>Happy Hour cuối tuần -20%</div>
                <p style={{"marginTop":"6px","fontSize":"13px","lineHeight":"1.55","color":"#d8d1c1"}}>Lưu coupon cho bàn đặt trước 20:00. Admin xác nhận điều kiện áp dụng sau khi nhận yêu cầu đặt chỗ.</p>
              </div>
              <Link href={couponHref} className="btn" style={{"flex":"none","border":"1px solid rgba(212,178,106,.32)","borderRadius":"12px","padding":"12px 16px","fontWeight":"900","fontSize":"13px","color":"#f0dda8","textDecoration":"none"}}>Lấy coupon</Link>
            </div>
            <div style={{"marginTop":"14px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px"}}>
              <div style={{"background":"rgba(212,178,106,.09)","border":"1px solid rgba(212,178,106,.22)","borderRadius":"16px","padding":"16px","fontSize":"13px","lineHeight":"1.65","color":"#d8d1c1"}}>
                <div style={{"fontSize":"14px","fontWeight":"900","color":"#f0dda8"}}>Gợi ý trải nghiệm</div>
                <p style={{"marginTop":"10px"}}>Phù hợp tiếp khách VIP, nhóm nhỏ muốn phòng riêng, hoặc khách Nhật cần hỗ trợ ngôn ngữ trong suốt buổi tối.</p>
              </div>
              <div style={{"background":"rgba(255,255,255,.045)","border":"1px solid rgba(212,178,106,.22)","borderRadius":"16px","padding":"16px","fontSize":"13px","lineHeight":"1.65","color":"#d8d1c1"}}>
                <div style={{"fontSize":"14px","fontWeight":"900","color":"#f0dda8"}}>Thông tin vận hành</div>
                <div style={{"marginTop":"10px","display":"grid","gap":"7px"}}><div><b>Giờ mở cửa:</b> 18:00 - 02:00</div><div><b>Gửi vị trí:</b> sau khi admin xác nhận đơn đặt</div><div><b>Bãi xe:</b> hỗ trợ tại cửa quán</div></div>
              </div>
            </div>
          </>
        ) : null}

        {activeStoreTab === 1 ? (
          <div style={{"marginTop":"18px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px"}}>
            <div style={{"background":"rgba(255,255,255,.045)","border":"1px solid rgba(212,178,106,.22)","borderRadius":"16px","overflow":"hidden","fontSize":"13.5px"}}>
              <div style={{"padding":"14px 18px","fontWeight":"900","color":"#f0dda8","borderBottom":"1px solid rgba(212,178,106,.14)"}}>Giá dịch vụ</div>
              <div style={{"display":"flex","justifyContent":"space-between","padding":"13px 18px","borderBottom":"1px solid rgba(212,178,106,.12)"}}><span>Set bàn thường (2 giờ)</span><span style={{"fontWeight":"800","color":"#f0dda8"}}>1.200.000đ</span></div>
              <div style={{"display":"flex","justifyContent":"space-between","padding":"13px 18px","borderBottom":"1px solid rgba(212,178,106,.12)"}}><span>Phòng VIP (2 giờ)</span><span style={{"fontWeight":"800","color":"#f0dda8"}}>3.500.000đ</span></div>
              <div style={{"display":"flex","justifyContent":"space-between","padding":"13px 18px","borderBottom":"1px solid rgba(212,178,106,.12)"}}><span>Combo sinh nhật</span><span style={{"fontWeight":"800","color":"#f0dda8"}}>từ 2.000.000đ</span></div>
              <div style={{"display":"flex","justifyContent":"space-between","padding":"13px 18px"}}><span>Phí cast / giờ</span><span style={{"fontWeight":"800","color":"#f0dda8"}}>từ 500.000đ</span></div>
            </div>
            <div style={{"background":"rgba(212,178,106,.09)","border":"1px solid rgba(212,178,106,.22)","borderRadius":"16px","padding":"16px","fontSize":"13px","lineHeight":"1.65","color":"#d8d1c1"}}>
              <div style={{"fontSize":"15px","fontWeight":"900","color":"#f0dda8"}}>Lưu ý giá</div>
              <p style={{"marginTop":"10px"}}>Bảng giá chỉ là tham khảo để khách chọn gói phù hợp. Admin sẽ xác nhận lại theo số khách, khung giờ, phòng VIP và yêu cầu cast.</p>
              <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px","marginTop":"14px"}}><div style={{"border":"1px solid rgba(212,178,106,.16)","borderRadius":"12px","padding":"10px"}}><b>Không cọc</b><br />Gửi yêu cầu trước</div><div style={{"border":"1px solid rgba(212,178,106,.16)","borderRadius":"12px","padding":"10px"}}><b>24h</b><br />Admin xác nhận</div></div>
            </div>
          </div>
        ) : null}

        {activeStoreTab === 2 ? (
          <div style={{"marginTop":"18px"}}>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"12px"}}><div style={{"fontSize":"14px","fontWeight":"900","color":"#f0dda8"}}>Cast đề xuất hôm nay</div><div style={{"fontSize":"12px","color":"#8a879a"}}>{cast.length} hồ sơ đang hoạt động</div></div>
            <div style={{"display":"grid","gridTemplateColumns":"repeat(5,1fr)","gap":"12px"}}>
              {cast?.map((c, index) => (<React.Fragment key={index}><div style={{"borderRadius":"14px","overflow":"hidden","background":"rgba(255,255,255,.045)","border":"1px solid rgba(212,178,106,.18)"}}><div style={{"position":"relative","height":"156px","background":c.img}}><span style={{"position":"absolute","top":"9px","left":"9px","background":"rgba(255,255,255,.92)","color":"#6d28d9","borderRadius":"999px","padding":"3px 8px","fontSize":"10.5px","fontWeight":"700"}}>★ {c.rating}</span></div><div style={{"padding":"11px"}}><div style={{"fontSize":"13px","fontWeight":"900","color":"#f3f0ea"}}>{c.name} · {c.age}</div><div style={{"fontSize":"12px","color":"#b6b1a6","marginTop":"4px","lineHeight":"1.4"}}>{c.desc}</div></div></div></React.Fragment>))}
            </div>
          </div>
        ) : null}

        {activeStoreTab === 3 ? (
          <div style={{"marginTop":"18px","display":"flex","flexDirection":"column","gap":"12px"}}>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"16px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><div><div style={{"fontSize":"28px","fontWeight":"800","color":"#1f1d29"}}>{vRating}</div><div style={{"fontSize":"12px","color":"#8a879a"}}>{vReviews} đánh giá đã xác thực</div></div><div style={{"color":"#e8923a","fontSize":"18px"}}>★★★★★</div></div>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"15px"}}><div style={{"display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"32px","height":"32px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=200&q=70') center/cover"}}></span><div><div style={{"fontSize":"13px","fontWeight":"600"}}>Tanaka K.</div><div style={{"fontSize":"11px","color":"#e8923a"}}>★★★★★</div></div><span style={{"marginLeft":"auto","fontSize":"11.5px","color":"#a8a5b4"}}>2 ngày trước</span></div><p style={{"fontSize":"13px","color":"#3a384a","marginTop":"9px","lineHeight":"1.6"}}>Không gian đẹp, nhân viên nói tiếng Nhật rất tốt. Sẽ quay lại.</p></div>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"15px"}}><div style={{"display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"32px","height":"32px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=70') center/cover"}}></span><div><div style={{"fontSize":"13px","fontWeight":"600"}}>Minh H.</div><div style={{"fontSize":"11px","color":"#e8923a"}}>★★★★★</div></div><span style={{"marginLeft":"auto","fontSize":"11.5px","color":"#a8a5b4"}}>1 tuần trước</span></div><p style={{"fontSize":"13px","color":"#3a384a","marginTop":"9px","lineHeight":"1.6"}}>Đồ uống chất lượng, phòng VIP riêng tư. Giá hợp lý cho dịch vụ.</p></div>
          </div>
        ) : null}

        {activeStoreTab === 4 ? (
          <div style={{"marginTop":"18px","display":"grid","gridTemplateColumns":"1.2fr .8fr","gap":"14px"}}>
            <iframe
              title={`${vName} Google Map`}
              src={mapEmbedSrc}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{"display":"block","width":"100%","minHeight":"260px","border":"0","borderRadius":"16px","background":"#19191d"}}
            />
            <div style={{"background":"rgba(255,255,255,.045)","border":"1px solid rgba(212,178,106,.22)","borderRadius":"16px","padding":"18px","fontSize":"13.5px","lineHeight":"1.65","color":"#d8d1c1"}}>
              <div style={{"fontSize":"16px","fontWeight":"800","color":"#f0dda8"}}>{vName} · {vArea}</div>
              <p style={{"marginTop":"10px"}}>{locationNote}</p>
              <div style={{"marginTop":"14px","display":"grid","gap":"8px"}}><div><b>Giờ mở cửa:</b> 18:00 - 02:00</div><div><b>Gửi vị trí:</b> sau khi admin xác nhận đơn đặt</div><div><b>Bãi xe:</b> hỗ trợ tại cửa quán</div></div>
            </div>
          </div>
        ) : null}


      </div>

      {/* booking sidebar */}
      <div style={{"width":"320px","flex":"none"}}>
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"16px","padding":"20px","boxShadow":"0 6px 20px rgba(40,20,60,.07)","position":"sticky","top":"20px"}}>
          <div style={{"fontSize":"13px","color":"#8a879a"}}>Đặt bàn từ</div>
          <div style={{"fontSize":"24px","fontWeight":"800","color":"#1f1d29","marginTop":"2px"}}>{vPrice}</div>
          <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginTop":"16px","marginBottom":"8px"}}>Chọn ngày</div>
          <div style={{"display":"flex","gap":"7px","flexWrap":"wrap"}}>{dates?.map((d, index) => (<React.Fragment key={index}><span onClick={d.pick} style={d.style}>{d.label}</span></React.Fragment>))}</div>
          <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginTop":"14px","marginBottom":"8px"}}>Khung giờ</div>
          <div style={{"display":"flex","gap":"7px","flexWrap":"wrap"}}>{times?.map((t, index) => (<React.Fragment key={index}><span onClick={t.pick} style={t.style}>{t.label}</span></React.Fragment>))}</div>
          <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginTop":"14px","marginBottom":"8px"}}>Số khách</div>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","border":"1px solid #ececec","borderRadius":"11px","padding":"8px 12px"}}>
            <span className="btn" onClick={dec} style={{"width":"32px","height":"32px","borderRadius":"9px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"18px"}}>−</span>
            <span style={{"fontWeight":"700","fontSize":"15px"}}>{guests} người</span>
            <span className="btn" onClick={inc} style={{"width":"32px","height":"32px","borderRadius":"9px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"18px"}}>+</span>
          </div>
          <Link href={bookingHref} className="btn" style={{"display":"block","marginTop":"16px","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"11px","padding":"13px","fontWeight":"700","fontSize":"14px","textDecoration":"none"}}>Đặt chỗ ngay</Link>
          <Link href={couponHref} className="btn" style={{"display":"block","marginTop":"10px","border":"1px solid rgba(212,178,106,.32)","color":"#f0dda8","textAlign":"center","borderRadius":"11px","padding":"12px","fontWeight":"800","fontSize":"13px","textDecoration":"none","background":"rgba(212,178,106,.08)"}}>Lấy coupon</Link>
        </div>
      </div>
    </div>
  </div>
</div>
</>



<div style={{"background":"#fff","borderTop":"1px solid #ececec","padding":"60px 0 20px","fontFamily":"'Inter',sans-serif","color":"#5b5870"}}>
  <div style={{"maxWidth":"1100px","margin":"0 auto","padding":"0 34px"}}>
    <div style={{"display":"flex","justifyContent":"space-between","gap":"40px","marginBottom":"60px"}}>
      <div style={{"maxWidth":"300px"}}>
        <Link href="/" style={{"fontWeight":"800","fontSize":"28px","color":"#6d28d9","textDecoration":"none"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></Link>
        <div style={{"fontSize":"14px","color":"#5b5870","marginTop":"16px","lineHeight":"1.6"}}>Khám phá cuộc sống về đêm tại Việt Nam</div>
        <div style={{"display":"flex","gap":"10px","marginTop":"20px"}}>
          <Link href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/facebook-new.png" style={{"width":"18px","height":"18px"}} alt="FB" /></Link>
          <Link href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/tiktok.png" style={{"width":"18px","height":"18px"}} alt="TikTok" /></Link>
          <Link href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/instagram-new.png" style={{"width":"18px","height":"18px"}} alt="IG" /></Link>
          <Link href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/youtube-play.png" style={{"width":"18px","height":"18px"}} alt="YT" /></Link>
        </div>
      </div>
      <div style={{"display":"flex","justifyContent":"space-between","flex":"1","maxWidth":"600px"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"20px","fontSize":"14px","fontWeight":"500"}}>
          <Link href="/danh-sach-quan" className="lk" style={{"color":"#1f1d29"}}>Tìm quán</Link>
          <Link href="/uu-dai" className="lk" style={{"color":"#1f1d29"}}>Ưu đãi</Link>
          <Link href="/blog" className="lk" style={{"color":"#1f1d29"}}>Blog</Link>
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"20px","fontSize":"14px","fontWeight":"500"}}>
          <Link href="/danh-sach-cast" className="lk" style={{"color":"#1f1d29"}}>Cast</Link>
          <Link href="/tour" className="lk" style={{"color":"#1f1d29"}}>Tour</Link>
          <Link href="/dang-ky-doi-tac" className="lk" style={{"color":"#1f1d29"}}>Đăng ký đối tác</Link>
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"20px","fontSize":"14px","fontWeight":"500"}}>
          <Link href="/xep-hang" className="lk" style={{"color":"#1f1d29"}}>Bảng xếp hạng</Link>
          <Link href="/legal" className="lk" style={{"color":"#1f1d29"}}>Chính sách BM</Link>
          <Link href="/legal" className="lk" style={{"color":"#1f1d29"}}>Điều khoản DV</Link>
        </div>
      </div>
    </div>
    <div style={{"background":"#fef1f2","border":"1px solid #fecdd3","borderRadius":"12px","padding":"16px 20px","color":"#be123c","fontSize":"13.5px","display":"flex","alignItems":"center","justifyContent":"center","gap":"10px","marginBottom":"40px","textAlign":"center"}}>
      <Image width={100} height={100} src="https://img.icons8.com/color/96/high-importance--v1.png" style={{"width":"20px","height":"20px"}} alt="!" />
      <span><b style={{"fontWeight":"700"}}>Cảnh báo:</b> Website này chỉ dành cho người <b style={{"fontWeight":"700"}}>từ 18 tuổi trở lên</b>. Bằng cách tiếp tục sử dụng, bạn xác nhận đã đủ điều kiện độ tuổi theo quy định pháp luật Việt Nam.</span>
    </div>
    <div style={{"borderTop":"1px solid #ececec","paddingTop":"24px","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","gap":"6px","fontSize":"12px","color":"#9a98a6","position":"relative"}}>
      <div>© 2026 Nightlife Hà Nội. Bảo lưu mọi quyền.</div>
      <div>v2.0.0 • Nightlife Platform</div>
      <div onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{"position":"absolute","right":"0","top":"24px","width":"44px","height":"44px","borderRadius":"50%","background":"#fb4b81","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","cursor":"pointer","boxShadow":"0 4px 12px rgba(251,75,129,.3)"}}>
        <Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/ffffff/up.png" style={{"width":"24px","height":"24px"}} alt="Top" />
      </div>
    </div>
  </div>
</div>
</div>
      </React.Fragment>
    );
  }
