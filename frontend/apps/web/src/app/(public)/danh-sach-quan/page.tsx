

  "use client";
  import React, { useState } from 'react';

import { cats, areas, venues } from '@/lib/mock-data';
import { VenueCard } from '@/components/ui/VenueCard';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';

export default function Page() {
  const [activeRankTab, setActiveRankTab] = useState('quan');
  const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
  const [isReg, setIsReg] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Simulate loading state for demonstration
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
    
    // Standalone mock variables
    const onSearch: any = undefined;
    const count = 9;
    const empty: any = undefined;

    return (
      <React.Fragment>
        <div className="block md:hidden">

<>
<>




</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","gap":"12px"}}><a href="/" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</a><span style={{"fontWeight":"800","fontSize":"16px"}}>Tìm quán · Hà Nội</span></div>
    <div style={{"padding":"0 18px 12px","background":"#fff"}}><div style={{"display":"flex","alignItems":"center","gap":"9px","background":"#f3f2f5","borderRadius":"12px","padding":"11px 13px"}}><img src="https://img.icons8.com/ios/100/9A98A6/search.png" style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" /><input onInput={onSearch} placeholder="Tên quán, khu vực…" style={{"flex":"1","border":"none","fontSize":"13px","color":"#1f1d29","background":"transparent"}} /></div></div>

    {/* filter chips */}
    <div className="hscroll" style={{"padding":"12px 18px 4px","display":"flex","gap":"7px","overflowX":"auto","background":"#fff"}}>
      {cats?.map((c, index) => (<React.Fragment key={index}><div onClick={c.pick} style={c.style}>{c.label}</div></React.Fragment>))}
    </div>
    <div className="hscroll" style={{"padding":"8px 18px 12px","display":"flex","gap":"7px","overflowX":"auto","background":"#fff","borderBottom":"1px solid #ececec"}}>
      {areas?.map((a, index) => (<React.Fragment key={index}><div onClick={a.pick} style={a.style}>{a.label}</div></React.Fragment>))}
    </div>

    <div style={{"padding":"12px 18px 6px","fontSize":"12.5px","color":"#5b5870"}}><b style={{"color":"#1f1d29"}}>{count} quán</b> phù hợp</div>
    <div style={{ padding: '0 18px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {isLoading ? (
        <LoadingSkeleton />
      ) : venues?.length > 0 ? (
        venues.map((v, index) => (
          <React.Fragment key={index}>
            <VenueCard venue={v} variant="horizontal" />
          </React.Fragment>
        ))
      ) : (
        <EmptyState />
      )}
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/search.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Tìm quán</span></div>
      <a href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></a>
      <a href="/lich-su-dat-cho" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Đặt chỗ</span></a>
      <a href="/tai-khoan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/user.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Tài khoản</span></a>
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
    {/* header */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}>
        <a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a>
        <div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" style={{"color":"#6d28d9","fontWeight":600}}>Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    {/* search bar */}
    <div style={{"padding":"20px 34px","background":"#fff","borderBottom":"1px solid #ececec","display":"flex","gap":"10px","alignItems":"center"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"8px","padding":"0 16px","height":"46px","border":"1px solid #ececec","borderRadius":"11px","color":"#6d28d9","fontSize":"14px","fontWeight":"600"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/marker.png" style={{"width":"15px","height":"15px","display":"inline-block"}} alt="" />Hà Nội</div>
      <div style={{"flex":"1","display":"flex","alignItems":"center","gap":"10px","height":"46px","padding":"0 16px","border":"1px solid #ececec","borderRadius":"11px"}}><img src="https://img.icons8.com/ios/100/9A98A6/search.png" style={{"width":"17px","height":"17px","display":"inline-block"}} alt="" /><input onInput={onSearch} placeholder="Tìm theo tên quán…" style={{"flex":"1","border":"none","fontSize":"14px","color":"#1f1d29","background":"transparent"}} /></div>
      <div style={{"display":"flex","alignItems":"center","gap":"8px","height":"46px","padding":"0 26px","background":"#6d28d9","color":"#fff","borderRadius":"11px","fontWeight":"600","fontSize":"14px"}}>Tìm</div>
    </div>

    <div style={{"display":"flex","gap":"0"}}>
      {/* filter sidebar */}
      <div style={{"width":"262px","flex":"none","background":"#fff","borderRight":"1px solid #ececec","padding":"24px"}}>
        <div style={{"fontWeight":"700","fontSize":"15px","marginBottom":"18px"}}>Bộ lọc</div>
        <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".06em","textTransform":"uppercase","marginBottom":"12px"}}>Loại hình</div>
        <div style={{"display":"flex","flexWrap":"wrap","gap":"8px","marginBottom":"24px"}}>
          {cats?.map((c, index) => (<React.Fragment key={index}><div onClick={c.pick} style={c.style}>{c.label}</div></React.Fragment>))}
        </div>
        <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".06em","textTransform":"uppercase","marginBottom":"12px"}}>Khu vực</div>
        <div style={{"display":"flex","flexWrap":"wrap","gap":"8px","marginBottom":"24px"}}>
          {areas?.map((a, index) => (<React.Fragment key={index}><div onClick={a.pick} style={a.style}>{a.label}</div></React.Fragment>))}
        </div>
        <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".06em","textTransform":"uppercase","marginBottom":"14px"}}>Đánh giá</div>
        <div style={{"display":"flex","flexDirection":"column","gap":"10px","fontSize":"13.5px","color":"#3a384a"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"18px","height":"18px","borderRadius":"50%","border":"1.5px solid #6d28d9","display":"flex","alignItems":"center","justifyContent":"center"}}><span style={{"width":"9px","height":"9px","borderRadius":"50%","background":"#6d28d9"}}></span></span><span style={{"color":"#e8923a"}}>★★★★★</span> từ 4.5</div>
          <div style={{"display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"18px","height":"18px","borderRadius":"50%","border":"1.5px solid #d6d3de"}}></span><span style={{"color":"#e8923a"}}>★★★★</span><span style={{"color":"#d8d6e0"}}>★</span> từ 4.0</div>
        </div>
      </div>

      {/* results */}
      <div style={{"flex":"1","padding":"22px 28px 30px"}}>
        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"18px"}}>
          <div style={{"fontSize":"14px","color":"#5b5870"}}><b style={{"color":"#1f1d29"}}>{count} quán</b> phù hợp</div>
          <div style={{"fontSize":"13.5px","color":"#5b5870","border":"1px solid #ececec","borderRadius":"9px","padding":"8px 14px","background":"#fff"}}>Sắp xếp: <b style={{"color":"#1f1d29"}}>Nổi bật</b> ▾</div>
        </div>
        <div style={{"display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"16px"}}>
          {venues?.map((v, index) => (<React.Fragment key={index}>
            <a href={`/stores/${v.id || 'store-1'}`} className="card" style={{"display": "block", "textDecoration": "none", "color": "inherit", "background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
              <div style={{"height":"128px","background":v.img,"position":"relative"}}>
                <><span style={{"position":"absolute","top":"10px","left":"10px","background":"#fff","color":v.badgeColor,"fontSize":"10.5px","fontWeight":"700","borderRadius":"14px","padding":"3px 9px"}}>{v.badgeText}</span></>
                <span onClick={v.fav} style={{"position":"absolute","top":"8px","right":"8px","width":"30px","height":"30px","borderRadius":"50%","background":"rgba(0,0,0,.28)","display":"flex","alignItems":"center","justifyContent":"center","cursor":"pointer"}}><img src={v.favIcon} style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" /></span>
              </div>
              <div style={{"padding":"13px"}}>
                <div style={{"fontWeight":"600","fontSize":"14.5px"}}>{v.name}</div>
                <div style={{"fontSize":"12px","color":"#8a879a","marginTop":"3px"}}>{v.area} · {v.catLabel}</div>
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginTop":"9px"}}><span style={{"fontSize":"12.5px","color":"#e8923a"}}>★ {v.rating} <span style={{"color":"#a8a5b4"}}>({v.reviews})</span></span><span style={{"fontSize":"12.5px","color":"#1f1d29","fontWeight":"600"}}>từ {v.price}</span></div>
              </div>
            </a>
          </React.Fragment>))}
        </div>
        <><div style={{"textAlign":"center","color":"#8a879a","fontSize":"14px","padding":"40px 0"}}>Không có quán nào khớp bộ lọc. Thử bỏ bớt điều kiện.</div></>
      </div>
    </div>
  </div>
</div>
</>



<div style={{"background":"#fff","borderTop":"1px solid #ececec","padding":"60px 0 20px","fontFamily":"'Inter',sans-serif","color":"#5b5870"}}>
  <div style={{"maxWidth":"1100px","margin":"0 auto","padding":"0 34px"}}>
    <div style={{"display":"flex","justifyContent":"space-between","gap":"40px","marginBottom":"60px"}}>
      <div style={{"maxWidth":"300px"}}>
        <a href="/" style={{"fontWeight":"800","fontSize":"28px","color":"#6d28d9","textDecoration":"none"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a>
        <div style={{"fontSize":"14px","color":"#5b5870","marginTop":"16px","lineHeight":"1.6"}}>Khám phá cuộc sống về đêm tại Việt Nam</div>
        <div style={{"display":"flex","gap":"10px","marginTop":"20px"}}>
          <a href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><img src="https://img.icons8.com/ios-filled/100/5b5870/facebook-new.png" style={{"width":"18px","height":"18px"}} alt="FB" /></a>
          <a href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><img src="https://img.icons8.com/ios-filled/100/5b5870/tiktok.png" style={{"width":"18px","height":"18px"}} alt="TikTok" /></a>
          <a href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><img src="https://img.icons8.com/ios-filled/100/5b5870/instagram-new.png" style={{"width":"18px","height":"18px"}} alt="IG" /></a>
          <a href="#" style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f5f4f2","display":"flex","alignItems":"center","justifyContent":"center","color":"#5b5870"}}><img src="https://img.icons8.com/ios-filled/100/5b5870/youtube-play.png" style={{"width":"18px","height":"18px"}} alt="YT" /></a>
        </div>
      </div>
      <div style={{"display":"flex","justifyContent":"space-between","flex":"1","maxWidth":"600px"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"20px","fontSize":"14px","fontWeight":"500"}}>
          <a href="/danh-sach-quan" className="lk" style={{"color":"#1f1d29"}}>Tìm quán</a>
          <a href="/uu-dai" className="lk" style={{"color":"#1f1d29"}}>Ưu đãi</a>
          <a href="/blog" className="lk" style={{"color":"#1f1d29"}}>Blog</a>
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"20px","fontSize":"14px","fontWeight":"500"}}>
          <a href="/danh-sach-cast" className="lk" style={{"color":"#1f1d29"}}>Cast</a>
          <a href="/tour" className="lk" style={{"color":"#1f1d29"}}>Tour</a>
          <a href="/dang-ky-doi-tac" className="lk" style={{"color":"#1f1d29"}}>Đăng ký đối tác</a>
        </div>
        <div style={{"display":"flex","flexDirection":"column","gap":"20px","fontSize":"14px","fontWeight":"500"}}>
          <a href="/xep-hang" className="lk" style={{"color":"#1f1d29"}}>Bảng xếp hạng</a>
          <a href="/legal" className="lk" style={{"color":"#1f1d29"}}>Chính sách BM</a>
          <a href="/legal" className="lk" style={{"color":"#1f1d29"}}>Điều khoản DV</a>
        </div>
      </div>
    </div>
    <div style={{"background":"#fef1f2","border":"1px solid #fecdd3","borderRadius":"12px","padding":"16px 20px","color":"#be123c","fontSize":"13.5px","display":"flex","alignItems":"center","justifyContent":"center","gap":"10px","marginBottom":"40px","textAlign":"center"}}>
      <img src="https://img.icons8.com/color/96/high-importance--v1.png" style={{"width":"20px","height":"20px"}} alt="!" />
      <span><b style={{"fontWeight":"700"}}>Cảnh báo:</b> Website này chỉ dành cho người <b style={{"fontWeight":"700"}}>từ 18 tuổi trở lên</b>. Bằng cách tiếp tục sử dụng, bạn xác nhận đã đủ điều kiện độ tuổi theo quy định pháp luật Việt Nam.</span>
    </div>
    <div style={{"borderTop":"1px solid #ececec","paddingTop":"24px","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","gap":"6px","fontSize":"12px","color":"#9a98a6","position":"relative"}}>
      <div>© 2026 Nightlife Hà Nội. Bảo lưu mọi quyền.</div>
      <div>v2.0.0 • Nightlife Platform</div>
      <div onClick={() => window.scrollTo({top:0,behavior:'smooth'})} style={{"position":"absolute","right":"0","top":"24px","width":"44px","height":"44px","borderRadius":"50%","background":"#fb4b81","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","cursor":"pointer","boxShadow":"0 4px 12px rgba(251,75,129,.3)"}}>
        <img src="https://img.icons8.com/ios-filled/100/ffffff/up.png" style={{"width":"24px","height":"24px"}} alt="Top" />
      </div>
    </div>
  </div>
</div>
</div>
      </React.Fragment>
    );
  }
  

