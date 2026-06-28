"use client";
import { MockItem } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

const legacyCastSlugMap: Record<string, string> = {
  yuki: 'yuki-sakura-lounge',
  michi: 'yuna-neon',
  rina: 'rina-velvet',
  hana: 'hana-sakura-lounge',
  aiko: 'aya-velvet',
};

export default function Page({ params }: { params: Promise<{ slug?: string }> }) {
    void params;
    const routeParams = useParams<{ slug?: string }>();
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const tabStyle = (active: boolean): React.CSSProperties => ({
      color: active ? '#d4b26a' : '#8a879a',
      fontWeight: active ? 800 : 600,
      borderBottom: active ? '2px solid #d4b26a' : '2px solid transparent',
      paddingBottom: '12px',
      cursor: 'pointer',
    });

    // Mock data arrays for loops
    const album: MockItem[] = [
          { bg: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=360&q=70') center/cover", isVideo: false },
          { bg: "url('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=360&q=70') center/cover", isVideo: false },
          { bg: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=360&q=70') center/cover", isVideo: false },
          { bg: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=360&q=70') center/cover", isVideo: false },
          { bg: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=360&q=70') center/cover", isVideo: false },
          { bg: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=360&q=70') center/cover", isVideo: true }
        ];
    const tabs: MockItem[] = [
          { label: 'Giới thiệu', style: tabStyle(activeTab === 0), pick: () => setActiveTab(0) },
          { label: 'Đánh giá', style: tabStyle(activeTab === 1), pick: () => setActiveTab(1) }
        ];
    
    // Standalone mock variables
    const cName = 'Yuki';
    const cAge = 24;
    const cRating = 4.8;
    const cArea = 'Kim Mã';
    const cLang = 'Việt · Anh';
    const cDesc = 'Phong cách đẹp';
    const toggleFav = () => setIsFavorite((value) => !value);
    const favIcon = isFavorite
      ? 'https://img.icons8.com/ios-filled/100/FF3D71/like.png'
      : 'https://img.icons8.com/ios/100/D4B26A/like.png';
    const cBorn = 2002;
    const mainBg = "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80') center/cover";
    const favIconDark = isFavorite
      ? 'https://img.icons8.com/ios-filled/100/FF3D71/like.png'
      : 'https://img.icons8.com/ios/100/1f1d29/like.png';
    const routeSlug = typeof routeParams.slug === 'string' ? routeParams.slug : 'yuki-sakura-lounge';
    const castSlug = legacyCastSlugMap[routeSlug] ?? routeSlug;
    const bookingHref = `/dat-cho?${new URLSearchParams({
      castSlug,
      castName: cName,
      storeName: 'Club LumiÃ¨re',
      area: cArea,
    }).toString()}`;

    return (
      <React.Fragment>
        <div className="block md:hidden cast-detail-mobile-shell">

<>
<>




</>

<div className="cast-detail-mobile" style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#0c0c0f","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"position":"relative","height":"300px","background":mainBg}}>
      <Link href="/danh-sach-cast" style={{"position":"absolute","top":"12px","left":"14px","width":"34px","height":"34px","borderRadius":"50%","background":"rgba(255,255,255,.92)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"18px","color":"#1f1d29"}}>‹</Link>
      <span className="btn" onClick={toggleFav} style={{"position":"absolute","top":"12px","right":"14px","width":"34px","height":"34px","borderRadius":"50%","background":"rgba(255,255,255,.92)","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src={favIconDark} style={{"width":"17px","height":"17px","display":"inline-block"}} alt="" /></span>
      <><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"54px","height":"54px","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"22px","height":"22px","marginLeft":"2px","display":"inline-block"}} alt="" /></span></>
    </div>
    <div className="hscroll" style={{"display":"flex","gap":"7px","padding":"10px 18px 0","overflowX":"auto"}}>
      {album?.map((a, index) => (<React.Fragment key={index}><div className="btn" onClick={a.pick} style={{"width":"54px","height":"54px","flex":"none","borderRadius":"9px","background":a.bg,"position":"relative"}}><><span style={{"position":"absolute","inset":"0","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/FFFFFF/play.png" style={{"width":"14px","height":"14px","display":"inline-block"}} alt="" /></span></></div></React.Fragment>))}
    </div>

    <div style={{"background":"#fff","padding":"14px 18px"}}>
      <h2 style={{"fontSize":"20px","fontWeight":"800"}}>{cName} <span style={{"fontSize":"14px","color":"#8a879a","fontWeight":"600"}}>· {cAge} tuổi</span></h2>
      <div style={{"display":"flex","alignItems":"center","gap":"10px","marginTop":"6px","fontSize":"12.5px","color":"#5b5870"}}><span style={{"color":"#e8923a","fontWeight":"600"}}>★ {cRating}</span> · {cArea}, Hà Nội</div>
      <div style={{"display":"flex","gap":"7px","marginTop":"11px","flexWrap":"wrap"}}><><span style={{"fontSize":"11px","background":"#fde8ef","color":"#c0246a","borderRadius":"12px","padding":"4px 10px","fontWeight":"600"}}>🇯🇵 Tiếng Nhật</span></><span style={{"fontSize":"11px","background":"#f1ebff","color":"#6d28d9","borderRadius":"12px","padding":"4px 10px","fontWeight":"600"}}>{cLang}</span></div>
      <div style={{"marginTop":"13px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"9px"}}>
        <div style={{"background":"#faf9fb","border":"1px solid #ececec","borderRadius":"11px","padding":"11px"}}><div style={{"fontSize":"10.5px","color":"#8a879a"}}>Năm sinh · tuổi tự tính</div><div style={{"fontSize":"14px","fontWeight":"700","marginTop":"2px"}}>{cBorn} · {cAge}t</div></div>
        <div style={{"background":"#faf9fb","border":"1px solid #ececec","borderRadius":"11px","padding":"11px"}}><div style={{"fontSize":"10.5px","color":"#8a879a"}}>Đang làm tại</div><div style={{"fontSize":"13px","fontWeight":"600","marginTop":"3px"}}>Club Lumière</div></div>
      </div>
      <p style={{"fontSize":"12.5px","lineHeight":"1.6","color":"#3a384a","marginTop":"13px"}}>{cName} — {cDesc}. Phong cách thân thiện, biết lắng nghe, phù hợp tiếp khách công việc lẫn bạn bè.</p>
    </div>

    <div style={{"background":"#fff","borderTop":"1px solid #ececec","padding":"12px 18px 18px","display":"flex","alignItems":"center","gap":"12px"}}>
      <div><div style={{"fontSize":"11px","color":"#8a879a"}}>Phí cast từ</div><div style={{"fontSize":"16px","fontWeight":"800"}}>500K<span style={{"fontSize":"11px","color":"#8a879a"}}>/giờ</span></div></div>
      <Link href={bookingHref} className="btn" style={{"flex":"1","background":"linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)","color":"#241a0a","textAlign":"center","borderRadius":"12px","padding":"14px","fontWeight":"900","fontSize":"14px","textDecoration":"none","display":"flex","alignItems":"center","justifyContent":"center"}}>Đặt theo cast</Link>
    </div>
  </div>
</div>
</>


</div>
        <div className="hidden md:block">

<>
<>




</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><Link href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></Link><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><Link href="/" className="lk">Trang chủ</Link><Link href="/danh-sach-quan" className="lk">Tìm quán</Link><Link href="/danh-sach-cast" className="lk">Cast</Link><Link href="/xep-hang" className="lk">Bảng xếp hạng</Link><Link href="/tour" className="lk">Tour</Link><Link href="/blog" className="lk">Blog</Link></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><Link href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</Link><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>
    <div style={{"padding":"18px 34px 0","fontSize":"12.5px","color":"#8a879a"}}><Link href="/" className="lk">Trang chủ</Link> › <Link href="/danh-sach-cast" className="lk">Cast</Link> › <span style={{"color":"#1f1d29"}}>{cName}</span></div>

    <div style={{"display":"flex","gap":"24px","padding":"18px 34px 30px"}}>
      {/* album */}
      <div style={{"width":"440px","flex":"none"}}>
        <div style={{"height":"440px","borderRadius":"16px","background":mainBg,"position":"relative","overflow":"hidden"}}>
          <><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"60px","height":"60px","borderRadius":"50%","background":"rgba(255,255,255,.92)","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"24px","height":"24px","marginLeft":"3px","display":"inline-block"}} alt="" /></span></>
        </div>
        <div style={{"display":"flex","gap":"8px","marginTop":"10px"}}>
          {album?.map((a, index) => (<React.Fragment key={index}><div className="thumb" onClick={a.pick} style={{"flex":"1","height":"74px","borderRadius":"10px","background":a.bg,"position":"relative"}}><><span style={{"position":"absolute","inset":"0","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/FFFFFF/play.png" style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" /></span></></div></React.Fragment>))}
        </div>
      </div>

      {/* info */}
      <div style={{"flex":"1"}}>
        <div style={{"display":"flex","alignItems":"flex-start","justifyContent":"space-between"}}>
          <div>
            <h2 style={{"fontSize":"28px","fontWeight":"800"}}>{cName} <span style={{"fontSize":"18px","color":"#8a879a","fontWeight":"600"}}>· {cAge} tuổi</span></h2>
            <div style={{"display":"flex","alignItems":"center","gap":"14px","marginTop":"8px","fontSize":"13px","color":"#5b5870"}}><span style={{"color":"#e8923a","fontWeight":"600"}}>★ {cRating}</span> · <span>{cArea}, Hà Nội</span></div>
            <div style={{"display":"flex","gap":"8px","marginTop":"12px","flexWrap":"wrap"}}>
              <><span style={{"fontSize":"12px","background":"#fde8ef","color":"#c0246a","borderRadius":"14px","padding":"5px 11px","fontWeight":"600"}}>🇯🇵 Nói tiếng Nhật</span></>
              <span style={{"fontSize":"12px","background":"#f1ebff","color":"#6d28d9","borderRadius":"14px","padding":"5px 11px","fontWeight":"600"}}>{cLang}</span>
              <span style={{"fontSize":"12px","background":"#f3f2f5","color":"#5b5870","borderRadius":"14px","padding":"5px 11px"}}>{cDesc}</span>
            </div>
          </div>
          <span className="btn" onClick={toggleFav} style={{"width":"44px","height":"44px","borderRadius":"12px","border":"1px solid #ececec","background":"#fff","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src={favIcon} style={{"width":"20px","height":"20px","display":"inline-block"}} alt="" /></span>
        </div>

        <div style={{"display":"flex","gap":"26px","borderBottom":"1px solid #ececec","marginTop":"22px","fontSize":"14px"}}>
          {tabs?.map((t, index) => (<React.Fragment key={index}><span onClick={t.pick} style={t.style}>{t.label}</span></React.Fragment>))}
        </div>

        <>
          <p style={{"fontSize":"13.5px","lineHeight":"1.7","color":"#3a384a","marginTop":"16px"}}>{cName} là cast được yêu thích tại khu {cArea} — {cDesc}. Phong cách thân thiện, biết lắng nghe, phù hợp tiếp khách công việc lẫn bạn bè.</p>
          <div style={{"marginTop":"16px","display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"12px"}}>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"14px"}}><div style={{"fontSize":"12px","color":"#8a879a"}}>Năm sinh (tuổi tự tính)</div><div style={{"fontSize":"16px","fontWeight":"800","marginTop":"3px"}}>{cBorn} <span style={{"fontSize":"12px","color":"#6d28d9"}}>· {cAge} tuổi</span></div></div>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"14px"}}><div style={{"fontSize":"12px","color":"#8a879a"}}>Ngôn ngữ</div><div style={{"fontSize":"14px","fontWeight":"600","marginTop":"5px"}}>{cLang}</div></div>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"14px"}}><div style={{"fontSize":"12px","color":"#8a879a"}}>Đang làm tại</div><div style={{"fontSize":"14px","fontWeight":"600","marginTop":"5px"}}>Club Lumière</div></div>
          </div>
        </>


        <div style={{"marginTop":"20px","background":"#fff","border":"1px solid #ececec","borderRadius":"16px","padding":"18px","display":"flex","alignItems":"center","gap":"16px","boxShadow":"0 6px 20px rgba(40,20,60,.06)"}}>
          <div style={{"flex":"1"}}><div style={{"fontSize":"13px","color":"#8a879a"}}>Đặt theo cast tại</div><div style={{"fontSize":"16px","fontWeight":"700"}}>Club Lumière · Tây Hồ</div><div style={{"fontSize":"12px","color":"#8a879a","marginTop":"3px"}}>Phí cast từ 500.000đ / giờ · Admin xác nhận lịch</div></div>
          <Link href={bookingHref} className="btn" style={{"background":"#6d28d9","color":"#fff","borderRadius":"11px","padding":"14px 26px","fontWeight":"700","fontSize":"14px","textDecoration":"none","display":"inline-flex","alignItems":"center","justifyContent":"center"}}>Đặt theo cast</Link>
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
          <a href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/facebook-new.png" style={{"width":"18px","height":"18px"}} alt="FB" /></a>
          <a href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/tiktok.png" style={{"width":"18px","height":"18px"}} alt="TikTok" /></a>
          <a href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/instagram-new.png" style={{"width":"18px","height":"18px"}} alt="IG" /></a>
          <a href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/5b5870/youtube-play.png" style={{"width":"18px","height":"18px"}} alt="YT" /></a>
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
  
