"use client";
import { Venue, Cast, FAQ } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

  export default function Page() {
    const onSearch: MockItem | undefined = undefined;
    const count = 3;

    const tours: MockItem[] = [
      { name: 'Tour đêm Tây Hồ', info: '3 điểm · 4 giờ · có hướng dẫn viên', price: '1.5tr / người', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#5d3da8,#3a1f6e)" },
      { name: 'Phố cổ & Ẩm thực đêm', info: '5 điểm · 3 giờ · tự do', price: '800K / người', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)" },
      { name: 'Bar Hopping Hà Nội', info: '4 quán · 5 giờ · free 1 drink/quán', price: '2.5tr / người', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#e0598a,#a8336b)" }
    ];

    return (
      <React.Fragment>
        <div className="block md:hidden">

<>
<>




</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","gap":"12px"}}><Link href="/" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</Link><span style={{"fontWeight":"800","fontSize":"16px"}}>Tour & Trải nghiệm</span></div>
    <div style={{"padding":"0 18px 12px","background":"#fff"}}><div style={{"display":"flex","alignItems":"center","gap":"9px","background":"#f3f2f5","borderRadius":"12px","padding":"11px 13px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/9A98A6/search.png" style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" /><input onInput={onSearch} placeholder="Tìm tour..." style={{"flex":"1","border":"none","fontSize":"13px","color":"#1f1d29","background":"transparent"}} /></div></div>

    <div style={{"padding":"12px 18px 6px","fontSize":"12.5px","color":"#5b5870"}}><b style={{"color":"#1f1d29"}}>{count} tour</b> phù hợp</div>
    <div style={{"padding":"0 18px 12px","display":"flex","flexDirection":"column","gap":"12px"}}>
      {tours?.map((t, index) => (<React.Fragment key={index}>
        <div style={{"display":"flex","gap":"12px","background":"#fff","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
          <div style={{"width":"108px","flex":"none","background":t.img,"position":"relative"}}></div>
          <div style={{"padding":"11px 12px 11px 0","flex":"1","minWidth":"0"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"6px"}}><span style={{"fontWeight":"600","fontSize":"14px"}}>{t.name}</span></div>
            <div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"2px"}}>{t.info}</div>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginTop":"8px"}}><span style={{"fontSize":"12px","fontWeight":"600"}}>từ {t.price}</span></div>
          </div>
        </div>
      </React.Fragment>))}
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <Link href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></Link>
      <Link href="/danh-sach-quan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/search.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Tìm quán</span></Link>
      <Link href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></Link>
      <Link href="/lich-su-dat-cho" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Đặt chỗ</span></Link>
      <Link href="/tai-khoan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/user.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Tài khoản</span></Link>
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
        <Link href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></Link>
        <div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><Link href="/" className="lk">Trang chủ</Link><Link href="/danh-sach-quan" className="lk">Tìm quán</Link><Link href="/danh-sach-cast" className="lk">Cast</Link><Link href="/xep-hang" className="lk">Bảng xếp hạng</Link><Link href="/tour" style={{"color":"#6d28d9","fontWeight":600}}>Tour</Link><Link href="/blog" className="lk">Blog</Link></div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><Link href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</Link><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    <div style={{"padding":"40px 34px","background":"#fff"}}>
      <div style={{"fontWeight":"700","fontSize":"24px","marginBottom":"20px"}}>Tour & Trải nghiệm</div>
      
      {/* results */}
      <div style={{"display":"grid","gridTemplateColumns":"repeat(4,1fr)","gap":"20px","minHeight":"50vh"}}>
        {tours?.map((t, index) => (<React.Fragment key={index}>
          <div className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
            <div style={{"height":"160px","background":t.img,"position":"relative"}}>
            </div>
            <div style={{"padding":"16px"}}>
              <div style={{"fontWeight":"600","fontSize":"16px"}}>{t.name}</div>
              <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"6px"}}>{t.info}</div>
              <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginTop":"12px"}}><span style={{"fontSize":"14px","color":"#1f1d29","fontWeight":"600"}}>từ {t.price}</span></div>
            </div>
          </div>
        </React.Fragment>))}
      </div>
    </div>
  </div>

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
</>

</div>
      </React.Fragment>
    );
  }

