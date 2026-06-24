
  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    const tabs: any[] = [
          { label: 'Đang giữ chỗ', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }, pick: () => {} },
          { label: 'Đã sử dụng', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }, pick: () => {} },
          { label: 'Hết hạn', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }, pick: () => {} }
        ];
    const list: any[] = [
          { title: 'Happy Hour -30%', place: 'KTV Hoàng Gia · Kim Mã', expiry: 'Còn 22:13:56', value: '-30%', label: 'Chờ duyệt', color: '#c0246a', bg: '#fce4ef', dim: '' },
          { title: 'Combo phòng VIP', place: 'Diamond Bar · Quận 3', expiry: 'Hôm nay', value: '1.2tr', label: 'Đã xác nhận', color: '#177544', bg: '#e6f7ee', dim: '' }
        ];
    
    // Standalone mock variables
    const empty = false;

    return (
      <React.Fragment>
        <div className="block md:hidden">

<>
<>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<style dangerouslySetInnerHTML={{__html: `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#e7e5df;}
  a{text-decoration:none;color:inherit;}
  .hscroll{scrollbar-width:none;}
  .hscroll::-webkit-scrollbar{display:none;}
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 8px"}}><h2 style={{"fontSize":"19px","fontWeight":"800"}}>Ví ưu đãi</h2></div>
    <div className="hscroll" style={{"padding":"0 18px 12px","display":"flex","gap":"7px","overflowX":"auto","background":"#fff","borderBottom":"1px solid #ececec"}}>
      {tabs?.map((t, index) => (<React.Fragment key={index}><div onClick={t.pick} style={t.style}>{t.label}</div></React.Fragment>))}
    </div>
    <div style={{"padding":"12px 18px","display":"flex","flexDirection":"column","gap":"11px"}}>
      {list?.map((c, index) => (<React.Fragment key={index}>
        <div style={{ ...{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}, ...c.dim }}>
          <div style={{"padding":"13px","display":"flex","gap":"12px","alignItems":"center"}}>
            <div style={{"width":"58px","height":"58px","borderRadius":"11px","border":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><img src="https://img.icons8.com/ios/200/000000/qr-code.png" style={{"width":"46px","height":"46px","display":"inline-block"}} alt="" /></div>
            <div style={{"flex":"1","minWidth":"0"}}><div style={{"fontWeight":"700","fontSize":"13.5px"}}>{c.title}</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"2px"}}>{c.place}</div><span style={{"display":"inline-block","marginTop":"6px","fontSize":"9.5px","fontWeight":"700","borderRadius":"8px","padding":"3px 8px","color":c.color,"background":c.bg}}>{c.label}</span></div>
            <span style={{"fontSize":"13px","color":"#6d28d9","fontWeight":"800"}}>{c.value}</span>
          </div>
          <div style={{"borderTop":"1px dashed #e2e0e8","padding":"9px 13px","fontSize":"10.5px","color":"#8a879a"}}>{c.expiry}</div>
        </div>
      </React.Fragment>))}
      <><div style={{"textAlign":"center","color":"#8a879a","fontSize":"13px","padding":"28px 0"}}>Không có mã ở mục này.</div></>
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
      <a href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Ưu đãi</span></a>
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
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<style dangerouslySetInnerHTML={{__html: `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#e7e5df;}
  a{text-decoration:none;color:inherit;}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/tai-khoan" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Tài khoản</a></div>
    </div>

    <div style={{"padding":"26px 34px 8px"}}><h2 style={{"fontSize":"24px","fontWeight":"800"}}>Ví ưu đãi của tôi</h2><p style={{"fontSize":"13px","color":"#5b5870","marginTop":"5px"}}>Quản lý mã giảm giá đã lấy — đưa cho nhân viên quán quét khi tới nơi.</p></div>
    <div style={{"padding":"14px 34px 0","display":"flex","gap":"9px","flexWrap":"wrap"}}>
      {tabs?.map((t, index) => (<React.Fragment key={index}><div onClick={t.pick} style={t.style}>{t.label}</div></React.Fragment>))}
    </div>
    <div style={{"padding":"18px 34px 32px","display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"16px"}}>
      {list?.map((c, index) => (<React.Fragment key={index}>
        <div style={{ ...{"background":"#fff","border":"1px solid #ececec","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}, ...c.dim }}>
          <div style={{"padding":"16px","display":"flex","gap":"14px","alignItems":"center"}}>
            <div style={{"width":"72px","height":"72px","borderRadius":"12px","border":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><img src="https://img.icons8.com/ios/200/000000/qr-code.png" style={{"width":"58px","height":"58px","display":"inline-block"}} alt="" /></div>
            <div style={{"flex":"1","minWidth":"0"}}><div style={{"fontWeight":"700","fontSize":"15px"}}>{c.title}</div><div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"3px"}}>{c.place}</div><span style={{"display":"inline-block","marginTop":"8px","fontSize":"11px","fontWeight":"700","borderRadius":"9px","padding":"4px 10px","color":c.color,"background":c.bg}}>{c.label}</span></div>
          </div>
          <div style={{"borderTop":"1px dashed #e2e0e8","padding":"11px 16px","display":"flex","alignItems":"center","justifyContent":"space-between","fontSize":"12px","color":"#8a879a"}}><span>{c.expiry}</span><span style={{"color":"#6d28d9","fontWeight":"600"}}>{c.value}</span></div>
        </div>
      </React.Fragment>))}
      <><div style={{"gridColumn":"span 3","textAlign":"center","color":"#8a879a","fontSize":"14px","padding":"36px 0"}}>Không có mã ở mục này.</div></>
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
  