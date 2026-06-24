

  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    const offers: any[] = [
          { title: 'Happy Hour cuối tuần', place: 'Club Lumière · Tây Hồ', value: '-30%', expiry: 'Còn 3 ngày', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') },
          { title: 'Combo phòng VIP 2+1', place: 'KTV Hoàng Gia · Kim Mã', value: '2+1', expiry: 'Còn 8 ngày', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') },
          { title: 'Spa thư giãn nửa giá', place: 'Spa Hồng Ngọc · Đống Đa', value: '-50%', expiry: 'Sắp hết', img: "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Đã lưu ví ✓', btnStyle: { background: '#e6f7ee', color: '#177544' }, take: () => alert('Mã đã được lưu') },
          { title: 'Ladies Night -20%', place: 'Hanoi Velvet · Hoàn Kiếm', value: '-20%', expiry: 'Thứ 5 hàng tuần', img: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') },
          { title: 'Welcome Member -8%', place: 'Sora Lounge · Quận 1', value: '-8%', expiry: 'Hội viên mới', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') },
          { title: 'Khai trương -10%', place: 'Neon Garden · Bình Thạnh', value: '-10%', expiry: 'Còn 5 ngày', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') }
        ];
    
    // Standalone mock variables
    

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
  .btn{cursor:pointer;transition:filter .14s;}
  .btn:active{filter:brightness(.95);}
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><h2 style={{"fontSize":"19px","fontWeight":"800"}}>Ưu đãi hot</h2><a href="/vi-uu-dai" style={{"fontSize":"12px","color":"#6d28d9","fontWeight":"600"}}>Ví của tôi ›</a></div>

    <div style={{"padding":"12px 18px","display":"flex","flexDirection":"column","gap":"11px"}}>
      {offers?.map((o, index) => (<React.Fragment key={index}>
        <div style={{"background":"#fff","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","display":"flex"}}>
          <div style={{"width":"96px","flex":"none","background":o.img,"position":"relative"}}><span style={{"position":"absolute","top":"8px","left":"8px","background":"#ffd24d","color":"#5a3d00","fontSize":"12px","fontWeight":"800","borderRadius":"9px","padding":"3px 8px"}}>{o.value}</span></div>
          <div style={{"padding":"11px 12px","flex":"1"}}><div style={{"fontWeight":"700","fontSize":"13.5px"}}>{o.title}</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>{o.place}</div><div style={{"marginTop":"9px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span style={{"fontSize":"10px","color":"#c0246a","background":"#fce4ef","borderRadius":"8px","padding":"3px 8px","fontWeight":"600"}}>{o.expiry}</span><span onClick={o.take} className="btn" style={{ ...{"fontSize":"11.5px","fontWeight":"700","borderRadius":"9px","padding":"6px 12px"}, ...o.btnStyle }}>{o.btnLabel}</span></div></div>
        </div>
      </React.Fragment>))}
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
      <a href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/fluency/96/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Ưu đãi</span></a>
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
  .card{transition:transform .16s ease, box-shadow .16s ease;}
  .card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(40,20,60,.12);}
  .btn{cursor:pointer;transition:filter .14s;}
  .btn:hover{filter:brightness(1.04);}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><a href="/vi-uu-dai" className="lk" style={{"fontSize":"13px","color":"#6d28d9","fontWeight":"600"}}>Ví của tôi ›</a><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    <div style={{"padding":"26px 34px 8px"}}><h2 style={{"fontSize":"24px","fontWeight":"800"}}>Ưu đãi &amp; Sự kiện hot</h2><p style={{"fontSize":"13px","color":"#5b5870","marginTop":"5px"}}>Lấy mã miễn phí, đưa nhân viên quán quét khi tới nơi. Mã lưu trong <a href="/vi-uu-dai" style={{"color":"#6d28d9","fontWeight":"600"}}>Ví ưu đãi</a>.</p></div>

    <div style={{"padding":"18px 34px 32px","display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"16px"}}>
      {offers?.map((o, index) => (<React.Fragment key={index}>
        <div className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
          <div style={{"height":"140px","background":o.img,"position":"relative"}}><span style={{"position":"absolute","top":"12px","left":"12px","background":"#ffd24d","color":"#5a3d00","fontSize":"17px","fontWeight":"800","borderRadius":"12px","padding":"6px 12px"}}>{o.value}</span></div>
          <div style={{"padding":"15px"}}>
            <div style={{"fontWeight":"700","fontSize":"15px"}}>{o.title}</div>
            <div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"4px"}}>{o.place}</div>
            <div style={{"marginTop":"13px","display":"flex","alignItems":"center","justifyContent":"space-between"}}>
              <span style={{"fontSize":"11.5px","color":"#c0246a","background":"#fce4ef","borderRadius":"10px","padding":"4px 9px","fontWeight":"600"}}>{o.expiry}</span>
              <span onClick={o.take} className="btn" style={{ ...{"fontSize":"13px","fontWeight":"700","borderRadius":"10px","padding":"8px 16px"}, ...o.btnStyle }}>{o.btnLabel}</span>
            </div>
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
  
