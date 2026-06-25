"use client";
import { MockItem } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

  export default function Page() {
    
    
    
    // Mock data arrays for loops
    const menu: MockItem[] = Array(5).fill({
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
    const name = 'Khách lẻ';
    const phone = '—';
    const tier: MockItem | undefined = undefined;
    const points: MockItem | undefined = undefined;
    const need: MockItem | undefined = undefined;
    const nextTier: MockItem | undefined = undefined;

    return (
      <React.Fragment>
        <div className="block md:hidden">

<>
<>




</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"padding":"14px 18px","background":"#fff"}}>
      <div style={{"background":"linear-gradient(135deg,#6d28d9,#3a1f6e)","borderRadius":"16px","padding":"18px","color":"#fff"}}>
        <div style={{"display":"flex","alignItems":"center","gap":"12px"}}><span style={{"width":"50px","height":"50px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70') center/cover","border":"2px solid rgba(255,255,255,.5)"}}></span><div style={{"flex":"1"}}><div style={{"fontSize":"16px","fontWeight":"800"}}>{name}</div><div style={{"fontSize":"11.5px","color":"#e7d9ff"}}>{phone}</div></div><span style={{"fontSize":"10px","fontWeight":"700","background":"#ffd24d","color":"#5a3d00","borderRadius":"9px","padding":"4px 9px"}}>Hạng {tier}</span></div>
        <div style={{"marginTop":"14px","background":"rgba(255,255,255,.14)","borderRadius":"11px","padding":"12px"}}><div style={{"display":"flex","justifyContent":"space-between","fontSize":"12px"}}><span style={{"color":"#e7d9ff"}}>Điểm thưởng</span><span style={{"fontWeight":"800"}}>{points}</span></div><div style={{"height":"6px","background":"rgba(255,255,255,.25)","borderRadius":"3px","marginTop":"8px"}}><div style={{"width":"62%","height":"100%","background":"#ffd24d","borderRadius":"3px"}}></div></div><div style={{"fontSize":"10.5px","color":"#e7d9ff","marginTop":"6px"}}>Cần thêm {need} điểm lên hạng {nextTier}</div></div>
      </div>
    </div>

    <div style={{"padding":"0 18px","display":"flex","flexDirection":"column"}}>
      {menu?.map((m, index) => (<React.Fragment key={index}>
        <a href={m.href} style={{"display":"flex","alignItems":"center","gap":"12px","padding":"13px 4px","borderBottom":"1px solid #ececec"}}><span style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f1ebff","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><Image width={100} height={100} src={m.icon || ""} style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span><div style={{"flex":"1"}}><div style={{"fontSize":"13.5px","fontWeight":"600"}}>{m.title}</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"1px"}}>{m.sub}</div></div><Image width={100} height={100} src="https://img.icons8.com/ios/100/B6B3C0/chevron-right.png" style={{"width":"15px","height":"15px","display":"inline-block"}} alt="" /></a>
      </React.Fragment>))}
      <Link href="/dang-nhap" style={{"display":"flex","alignItems":"center","gap":"12px","padding":"14px 4px","color":"#b03a4a"}}><span style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#fbe4e7","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><Image width={100} height={100} src="https://img.icons8.com/ios/100/B03A4A/exit.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span><div style={{"flex":"1","fontSize":"13.5px","fontWeight":"600"}}>Đăng xuất</div></Link>
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px","marginTop":"8px"}}>
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
  <div style={{"width":"100%","margin":"0 auto","background":"#f5f4f2","borderRadius":"16px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    {/* header */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><Link href="/" style={{"fontWeight":"800","fontSize":"22px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></Link><div style={{"display":"flex","gap":"24px","fontSize":"14.5px","color":"#5b5870","fontWeight":"500"}}><Link href="/" className="lk">Trang chủ</Link><Link href="/danh-sach-quan" className="lk">Tìm quán</Link><Link href="/danh-sach-cast" className="lk">Cast</Link><Link href="/xep-hang" className="lk">Bảng xếp hạng</Link><Link href="/uu-dai" className="lk">Ưu đãi</Link><Link href="/blog" className="lk">Blog</Link></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13.5px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"8px 14px","fontWeight":"600"}}>VI · 日本語</div><div style={{"fontSize":"13.5px","color":"#fff","background":"#6d28d9","borderRadius":"20px","padding":"8px 16px","fontWeight":"600"}}>Minh H.</div></div>
    </div>

    {/* content layout */}
    <div style={{"display":"flex","gap":"24px","padding":"30px 34px 40px"}}>
      {/* left column */}
      <div style={{"width":"380px","flex":"none","display":"flex","flexDirection":"column","gap":"20px"}}>
        {/* profile card */}
        <div style={{"background":"linear-gradient(rgba(58,31,110,0.4),rgba(58,31,110,0.8)),url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80') center/cover","borderRadius":"18px","padding":"26px","color":"#fff","boxShadow":"0 6px 20px rgba(0,0,0,0.15)"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"16px"}}>
            <span style={{"width":"64px","height":"64px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70') center/cover","border":"2px solid rgba(255,255,255,0.8)"}}></span>
            <div>
              <div style={{"fontSize":"20px","fontWeight":"800"}}>Minh H.</div>
              <div style={{"fontSize":"13px","color":"#e7d9ff","marginTop":"4px"}}>0912 •••• 678 · từ 2025</div>
            </div>
          </div>
          <div style={{"marginTop":"24px","display":"inline-flex","alignItems":"center","gap":"8px","background":"rgba(255,255,255,0.15)","border":"1px solid rgba(255,255,255,0.2)","padding":"8px 16px","borderRadius":"20px","fontSize":"13.5px","fontWeight":"700"}}>
            <span style={{"color":"#ffd24d","fontSize":"16px"}}>👑</span> Hạng VIP · giảm 10%
          </div>
        </div>

        {/* points card */}
        <div style={{"background":"#fff","borderRadius":"18px","padding":"26px","boxShadow":"0 4px 15px rgba(0,0,0,0.04)"}}>
          <div style={{"display":"flex","justifyContent":"space-between","alignItems":"flex-start"}}>
            <div style={{"fontSize":"14px","color":"#8a879a","fontWeight":"500"}}>Điểm thưởng</div>
            <div style={{"fontSize":"13px","color":"#8a879a"}}>Hạn: 06/2027</div>
          </div>
          <div style={{"marginTop":"8px"}}>
            <span style={{"fontSize":"38px","fontWeight":"800","color":"#6d28d9","lineHeight":"1"}}>156</span>
            <span style={{"fontSize":"15px","color":"#5b5870","fontWeight":"600","marginLeft":"4px"}}>điểm</span>
          </div>
          
          <div style={{"marginTop":"20px"}}>
            <div style={{"fontSize":"13px","color":"#5b5870","marginBottom":"8px"}}>Còn 44 điểm để giữ hạng VIP năm sau</div>
            <div style={{"height":"8px","background":"#f1ebff","borderRadius":"4px","overflow":"hidden"}}>
              <div style={{"width":"78%","height":"100%","background":"#6d28d9","borderRadius":"4px"}}></div>
            </div>
          </div>

          <div className="row" style={{"marginTop":"24px","background":"#6d28d9","color":"#fff","textAlign":"center","padding":"14px","borderRadius":"12px","fontWeight":"700","fontSize":"15px"}}>
            Đổi quà / voucher
          </div>
          <div style={{"textAlign":"center","fontSize":"11.5px","color":"#8a879a","marginTop":"12px"}}>
            1.000.000đ trên hóa đơn = 10 điểm · điểm có hạn 1 năm
          </div>
        </div>
      </div>

      {/* right column */}
      <div style={{"flex":"1","display":"flex","flexDirection":"column","gap":"20px"}}>
        {/* stats row */}
        <div style={{"display":"flex","gap":"20px"}}>
          <div style={{"flex":"1","background":"#fff","borderRadius":"16px","padding":"24px","textAlign":"center","boxShadow":"0 4px 15px rgba(0,0,0,0.04)"}}>
            <div style={{"fontSize":"26px","fontWeight":"800","color":"#1f1d29"}}>12</div>
            <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"4px"}}>Đặt chỗ</div>
          </div>
          <div style={{"flex":"1","background":"#fff","borderRadius":"16px","padding":"24px","textAlign":"center","boxShadow":"0 4px 15px rgba(0,0,0,0.04)"}}>
            <div style={{"fontSize":"26px","fontWeight":"800","color":"#1f1d29"}}>5</div>
            <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"4px"}}>Mã trong ví</div>
          </div>
          <div style={{"flex":"1","background":"#fff","borderRadius":"16px","padding":"24px","textAlign":"center","boxShadow":"0 4px 15px rgba(0,0,0,0.04)"}}>
            <div style={{"fontSize":"26px","fontWeight":"800","color":"#1f1d29"}}>8</div>
            <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"4px"}}>Hóa đơn</div>
          </div>
        </div>

        {/* menu list */}
        <div style={{"background":"#fff","borderRadius":"16px","boxShadow":"0 4px 15px rgba(0,0,0,0.04)","padding":"8px 0"}}>
          <Link href="/lich-su-dat-cho" className="row" style={{"display":"flex","alignItems":"center","padding":"18px 24px","borderBottom":"1px solid #f8f8f8"}}>
            <span style={{"fontSize":"18px","marginRight":"16px"}}>📅</span>
            <span style={{"flex":"1","fontSize":"15px","fontWeight":"600","color":"#1f1d29"}}>Lịch sử đặt chỗ</span>
            <span style={{"color":"#b6b3c0","fontSize":"16px"}}>›</span>
          </Link>
          <Link href="/vi-uu-dai" className="row" style={{"display":"flex","alignItems":"center","padding":"18px 24px","borderBottom":"1px solid #f8f8f8"}}>
            <span style={{"fontSize":"18px","marginRight":"16px","color":"#e11d48","fontWeight":"800"}}>%</span>
            <span style={{"flex":"1","fontSize":"15px","fontWeight":"600","color":"#1f1d29"}}>Ví ưu đãi</span>
            <span style={{"color":"#b6b3c0","fontSize":"16px"}}>›</span>
          </Link>
          <Link href="/gui-hoa-don" className="row" style={{"display":"flex","alignItems":"center","padding":"18px 24px","borderBottom":"1px solid #f8f8f8"}}>
            <span style={{"fontSize":"18px","marginRight":"16px"}}>🧾</span>
            <span style={{"flex":"1","fontSize":"15px","fontWeight":"600","color":"#1f1d29"}}>Hóa đơn của tôi</span>
            <span style={{"color":"#b6b3c0","fontSize":"16px"}}>›</span>
          </Link>
          <Link href="/da-luu" className="row" style={{"display":"flex","alignItems":"center","padding":"18px 24px","borderBottom":"1px solid #f8f8f8"}}>
            <span style={{"fontSize":"18px","marginRight":"16px","color":"#e11d48"}}>❤️</span>
            <span style={{"flex":"1","fontSize":"15px","fontWeight":"600","color":"#1f1d29"}}>Quán & Cast đã lưu</span>
            <span style={{"color":"#b6b3c0","fontSize":"16px"}}>›</span>
          </Link>
          <a href="#" className="row" style={{"display":"flex","alignItems":"center","padding":"18px 24px","borderBottom":"1px solid #f8f8f8"}}>
            <span style={{"fontSize":"18px","marginRight":"16px"}}>🔤</span>
            <span style={{"flex":"1","fontSize":"15px","fontWeight":"600","color":"#1f1d29"}}>Ngôn ngữ</span>
            <span style={{"color":"#8a879a","fontSize":"14px"}}>Tiếng Việt · 日本語</span>
          </a>
          <Link href="/dang-nhap" className="row" style={{"display":"flex","alignItems":"center","padding":"18px 24px"}}>
            <span style={{"fontSize":"18px","marginRight":"16px"}}>🚪</span>
            <span style={{"flex":"1","fontSize":"15px","fontWeight":"600","color":"#e11d48"}}>Đăng xuất</span>
          </Link>
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
  

