"use client";
import { MockItem } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

  export default function Page() {
    
    
    
    // Mock data arrays for loops
    const items: MockItem[] = Array(5).fill({
        name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover",
        grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)', price: '1.2tr', tag: '-20%',
        label: 'Tất cả', style: { background: '#f3f2f5', color: '#5b5870' }, date: '12/10',
        time: '21:00', code: 'NIGHT10', st: 'Hoàn tất',
        favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png',
        favIconDark: 'https://img.icons8.com/ios/100/1f1d29/like.png',
        mainBg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover",
        open: () => console.log('Navigate')
      });
    
    // Standalone mock variables
    const pickQuan = () => {};
    const segQuan = { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)' };
    const pickCast = () => {};
    const segCast = { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px' };

    return (
      <React.Fragment>
        <div className="block md:hidden">

<>
<>




</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px"}}><h2 style={{"fontSize":"19px","fontWeight":"800"}}>Đã lưu</h2>
      {/* tabs */}
      <div style={{"display":"flex","gap":"6px","background":"#f3f2f5","borderRadius":"12px","padding":"4px","marginTop":"11px"}}>
        <span style={{"flex":"1","display":"inline-flex","alignItems":"center","justifyContent":"center","fontSize":"13px","borderRadius":"9px","padding":"9px","fontWeight":"600","background":"#fff","color":"#6d28d9","boxShadow":"0 1px 3px rgba(0,0,0,.08)"}}>Quán</span>
        <span style={{"flex":"1","display":"inline-flex","alignItems":"center","justifyContent":"center","fontSize":"13px","borderRadius":"9px","padding":"9px","fontWeight":"600","background":"transparent","color":"#8a879a"}}>Cast</span>
      </div>
    </div>

    {/* saved venue list */}
    <div style={{"padding":"12px 18px","display":"flex","flexDirection":"column","gap":"11px"}}>
      <Link href="/stores/club-lumiere" style={{"display":"flex","gap":"12px","background":"#fff","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
        <span style={{"width":"96px","flex":"none","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=360&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)"}}></span>
        <div style={{"flex":"1","padding":"11px 12px 11px 0","display":"flex","flexDirection":"column","justifyContent":"center"}}><div style={{"display":"flex","alignItems":"flex-start","justifyContent":"space-between","gap":"8px"}}><div style={{"fontWeight":"700","fontSize":"13.5px"}}>Club Lumière</div><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/FF3D71/like.png" style={{"width":"18px","height":"18px","flex":"none","display":"inline-block"}} alt="" /></div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Tây Hồ · Bar Lounge</div><div style={{"display":"flex","alignItems":"center","gap":"8px","marginTop":"7px"}}><span style={{"fontSize":"11px","color":"#e8923a","fontWeight":"600"}}>★ 4.8</span><span style={{"fontSize":"9.5px","color":"#6d28d9","background":"#f1ebff","borderRadius":"8px","padding":"2px 7px","fontWeight":"600"}}>−30% Happy Hour</span></div></div>
      </Link>
      <Link href="/stores/club-lumiere" style={{"display":"flex","gap":"12px","background":"#fff","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
        <span style={{"width":"96px","flex":"none","background":"url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=360&q=70') center/cover,linear-gradient(140deg,#3a8fb0,#2d5fae)"}}></span>
        <div style={{"flex":"1","padding":"11px 12px 11px 0","display":"flex","flexDirection":"column","justifyContent":"center"}}><div style={{"display":"flex","alignItems":"flex-start","justifyContent":"space-between","gap":"8px"}}><div style={{"fontWeight":"700","fontSize":"13.5px"}}>KTV Hoàng Gia</div><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/FF3D71/like.png" style={{"width":"18px","height":"18px","flex":"none","display":"inline-block"}} alt="" /></div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Kim Mã · Karaoke VIP</div><div style={{"display":"flex","alignItems":"center","gap":"8px","marginTop":"7px"}}><span style={{"fontSize":"11px","color":"#e8923a","fontWeight":"600"}}>★ 4.6</span><span style={{"fontSize":"9.5px","color":"#6d28d9","background":"#f1ebff","borderRadius":"8px","padding":"2px 7px","fontWeight":"600"}}>Combo VIP 2+1</span></div></div>
      </Link>
      <Link href="/stores/club-lumiere" style={{"display":"flex","gap":"12px","background":"#fff","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
        <span style={{"width":"96px","flex":"none","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=360&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)"}}></span>
        <div style={{"flex":"1","padding":"11px 12px 11px 0","display":"flex","flexDirection":"column","justifyContent":"center"}}><div style={{"display":"flex","alignItems":"flex-start","justifyContent":"space-between","gap":"8px"}}><div style={{"fontWeight":"700","fontSize":"13.5px"}}>Sakura Lounge</div><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/FF3D71/like.png" style={{"width":"18px","height":"18px","flex":"none","display":"inline-block"}} alt="" /></div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Hoàn Kiếm · Lounge</div><div style={{"display":"flex","alignItems":"center","gap":"8px","marginTop":"7px"}}><span style={{"fontSize":"11px","color":"#e8923a","fontWeight":"600"}}>★ 4.7</span></div></div>
      </Link>
    </div>

    {/* empty state illustration */}
    <div style={{"padding":"6px 18px 18px"}}>
      <div style={{"background":"#fff","border":"1px dashed #e2e0e8","borderRadius":"14px","padding":"26px 18px","textAlign":"center"}}>
        <span style={{"width":"54px","height":"54px","borderRadius":"50%","background":"#f1ebff","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/6D28D9/like.png" style={{"width":"26px","height":"26px","display":"inline-block"}} alt="" /></span>
        <div style={{"fontSize":"13.5px","fontWeight":"700","marginTop":"11px"}}>Chưa lưu mục nào</div>
        <div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"5px","lineHeight":"1.55"}}>Nhấn biểu tượng tim trên quán hoặc cast<br />để lưu lại và xem nhanh tại đây.</div>
        <Link href="/danh-sach-quan" style={{"display":"inline-block","marginTop":"13px","background":"#6d28d9","color":"#fff","borderRadius":"10px","padding":"10px 18px","fontSize":"12.5px","fontWeight":"700"}}>Khám phá quán ›</Link>
      </div>
    </div>

    {/* bottom nav */}
    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <Link href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></Link>
      <Link href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></Link>
      <Link href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></Link>
      <Link href="/lich-su-dat-cho" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Đặt chỗ</span></Link>
      <Link href="/tai-khoan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/6D28D9/user.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Tài khoản</span></Link>
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

    {/* HEADER */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}>
        <Link href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></Link>
        <div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><Link href="/" className="lk">Trang chủ</Link><Link href="/danh-sach-quan" className="lk">Tìm quán</Link><Link href="/danh-sach-cast" className="lk">Cast</Link><Link href="/xep-hang" className="lk">Bảng xếp hạng</Link><Link href="/tour" className="lk">Tour</Link><Link href="/blog" className="lk">Blog</Link></div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><Link href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</Link><Link href="/dang-ky-doi-tac" style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</Link></div>
    </div>

    <div style={{"padding":"26px 34px 8px","display":"flex","alignItems":"center","justifyContent":"space-between","flexWrap":"wrap","gap":"12px"}}>
      <div><h2 style={{"fontSize":"24px","fontWeight":"800"}}><Image width={100} height={100} src="/icons/dich-vu-noi-bat.svg" style={{"width":"24px","height":"24px","verticalAlign":"-5px","marginRight":"8px","display":"inline-block"}} alt="" />Đã lưu</h2><p style={{"fontSize":"13px","color":"#5b5870","marginTop":"5px"}}>Quán &amp; cast bạn đã thêm vào yêu thích.</p></div>
      <div style={{"display":"flex","gap":"8px","background":"#fff","border":"1px solid #ececec","borderRadius":"18px","padding":"4px","width":"240px"}}>
        <div onClick={pickQuan} style={segQuan}>Quán</div>
        <div onClick={pickCast} style={segCast}>Cast</div>
      </div>
    </div>

    {/* GRID */}
    <div style={{"padding":"18px 34px 34px"}}>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(4,1fr)","gap":"16px"}}>
        {items?.map((v, index) => (<React.Fragment key={index}>
          <div onClick={v.open} className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
            <div style={{"height":"128px","background":v.img,"position":"relative"}}>
              <><span style={{"position":"absolute","top":"10px","left":"10px","background":"#fff","color":v.badgeColor,"fontSize":"10.5px","fontWeight":"700","borderRadius":"14px","padding":"3px 9px"}}>{v.badgeText}</span></>
              <span onClick={v.fav} className="btn" style={{"position":"absolute","top":"8px","right":"8px","width":"30px","height":"30px","borderRadius":"50%","background":"rgba(255,255,255,.92)","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src="https://img.icons8.com/ios-filled/100/FF3D71/like.png" style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" /></span>
            </div>
            <div style={{"padding":"13px"}}>
              <div style={{"fontWeight":"600","fontSize":"14.5px"}}>{v.name}</div>
              <div style={{"fontSize":"12px","color":"#8a879a","marginTop":"3px"}}>{v.sub}</div>
              <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginTop":"9px"}}><span style={{"fontSize":"12.5px","color":"#e8923a"}}>★ {v.rating}</span><span style={{"fontSize":"12.5px","color":"#1f1d29","fontWeight":"600"}}>{v.right}</span></div>
            </div>
          </div>
        </React.Fragment>))}

        {/* empty-state placeholder card (illustrative) */}
        <div style={{"background":"#fff","border":"1.5px dashed #e2e0e8","borderRadius":"16px","overflow":"hidden","opacity":".55","display":"flex","flexDirection":"column","alignItems":"center","justifyContent":"center","textAlign":"center","minHeight":"215px","padding":"18px"}}>
          <div style={{"width":"54px","height":"54px","borderRadius":"50%","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/like.png" style={{"width":"26px","height":"26px","display":"inline-block"}} alt="" /></div>
          <div style={{"fontSize":"13px","fontWeight":"600","color":"#8a879a","marginTop":"12px"}}>Chưa lưu mục nào</div>
          <div style={{"fontSize":"11.5px","color":"#a8a5b4","marginTop":"5px","lineHeight":"1.5"}}>Bấm vào trái tim ở mỗi quán / cast để lưu vào đây.</div>
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
  

