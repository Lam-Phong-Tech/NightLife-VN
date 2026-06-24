

  "use client";
  import React, { useState } from 'react';

import { castFilters, castCards } from '@/lib/mock-data';
import { CastCard } from '@/components/ui/CastCard';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';

export default function Page() {
  const [activeRankTab, setActiveRankTab] = useState('quan');
  const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
  const [isReg, setIsReg] = useState(false);
  const filters = castFilters;
  const cards = castCards;
    
    // Standalone mock variables
    const count = 8;

    return (
      <React.Fragment>
        <div className="block md:hidden">

<>
<>




</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 6px"}}><h2 style={{"fontSize":"19px","fontWeight":"800"}}>Tìm Cast</h2><p style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"2px"}}><b style={{"color":"#1f1d29"}}>{count}</b> cast đang hoạt động</p></div>
    <div className="hscroll" style={{"padding":"10px 18px 12px","display":"flex","gap":"7px","overflowX":"auto","background":"#fff","borderBottom":"1px solid #ececec"}}>
      {filters?.map((f, index) => (<React.Fragment key={index}><div onClick={f.pick} style={f.style}>{f.label}</div></React.Fragment>))}
    </div>

    <div style={{"padding":"14px 18px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"11px"}}>
      {cards?.map((c, index) => (<React.Fragment key={index}>
        <div onClick={c.open} style={{"borderRadius":"14px","overflow":"hidden","position":"relative","height":"200px","background":c.img,"boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
          <span onClick={c.fav} style={{"position":"absolute","top":"8px","right":"8px","width":"27px","height":"27px","borderRadius":"50%","background":"rgba(0,0,0,.3)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src={c.favIcon} style={{"width":"14px","height":"14px","display":"inline-block"}} alt="" /></span>
          <><span style={{"position":"absolute","top":"8px","left":"8px","background":"rgba(255,255,255,.92)","color":"#1f1d29","fontSize":"9px","fontWeight":"700","borderRadius":"9px","padding":"2px 7px"}}>🇯🇵 Nhật</span></>
          <div style={{"position":"absolute","bottom":"0","left":"0","right":"0","padding":"11px","background":"linear-gradient(0deg,rgba(20,8,16,.85),transparent)","color":"#fff"}}><div style={{"fontWeight":"600","fontSize":"13.5px"}}>{c.name} · {c.age}</div><div style={{"fontSize":"10px","color":"#f0dde8","marginTop":"2px"}}>{c.desc} · ★ {c.rating}</div></div>
        </div>
      </React.Fragment>))}
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/fluency/96/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Cast</span></a>
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
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" style={{"color":"#6d28d9","fontWeight":600}}>Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    <div style={{"padding":"26px 34px 6px"}}><h2 style={{"fontSize":"24px","fontWeight":"800"}}>Tìm Cast tại Hà Nội</h2><p style={{"fontSize":"13.5px","color":"#5b5870","marginTop":"6px"}}><b style={{"color":"#1f1d29"}}>{count} cast</b> đang hoạt động · cập nhật hôm nay</p></div>
    <div style={{"padding":"14px 34px 22px","display":"flex","gap":"10px","flexWrap":"wrap"}}>
      {filters?.map((f, index) => (<React.Fragment key={index}><div onClick={f.pick} style={f.style}>{f.label}</div></React.Fragment>))}
    </div>

    <div style={{"padding":"0 34px 30px","display":"grid","gridTemplateColumns":"repeat(5,1fr)","gap":"14px"}}>
      {cards?.map((c, index) => (<React.Fragment key={index}>
        <div onClick={c.open} className="card" style={{"borderRadius":"14px","overflow":"hidden","position":"relative","height":"240px","background":c.img,"boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
          <span onClick={c.fav} style={{"position":"absolute","top":"9px","right":"9px","width":"28px","height":"28px","borderRadius":"50%","background":"rgba(0,0,0,.3)","display":"flex","alignItems":"center","justifyContent":"center","cursor":"pointer"}}><img src={c.favIcon} style={{"width":"15px","height":"15px","display":"inline-block"}} alt="" /></span>
          <><span style={{"position":"absolute","top":"9px","left":"9px","background":"rgba(255,255,255,.92)","color":"#1f1d29","fontSize":"9.5px","fontWeight":"700","borderRadius":"10px","padding":"3px 8px"}}>🇯🇵 Tiếng Nhật</span></>
          <div style={{"position":"absolute","bottom":"0","left":"0","right":"0","padding":"12px","background":"linear-gradient(0deg,rgba(20,8,16,.85),transparent)","color":"#fff"}}>
            <div style={{"fontWeight":"600","fontSize":"14px"}}>{c.name} · {c.age}</div>
            <div style={{"fontSize":"10.5px","color":"#f0dde8","marginTop":"3px"}}>{c.desc} · ★ {c.rating}</div>
          </div>
        </div>
      </React.Fragment>))}
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
  

