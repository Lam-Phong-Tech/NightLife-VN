

  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const onSearch: any = undefined;
    const count = 3;

    const tours: any[] = [
      { name: 'Tour đêm Tây Hồ', info: '3 điểm · 4 giờ · có hướng dẫn viên', price: '1.5tr / người', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#5d3da8,#3a1f6e)" },
      { name: 'Phố cổ & Ẩm thực đêm', info: '5 điểm · 3 giờ · tự do', price: '800K / người', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)" },
      { name: 'Bar Hopping Hà Nội', info: '4 quán · 5 giờ · free 1 drink/quán', price: '2.5tr / người', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#e0598a,#a8336b)" }
    ];

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
  input{font-family:inherit;outline:none;}
  .hscroll{scrollbar-width:none;}
  .hscroll::-webkit-scrollbar{display:none;}
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","gap":"12px"}}><a href="/" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</a><span style={{"fontWeight":"800","fontSize":"16px"}}>Tour & Trải nghiệm</span></div>
    <div style={{"padding":"0 18px 12px","background":"#fff"}}><div style={{"display":"flex","alignItems":"center","gap":"9px","background":"#f3f2f5","borderRadius":"12px","padding":"11px 13px"}}><img src="https://img.icons8.com/ios/100/9A98A6/search.png" style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" /><input onInput={onSearch} placeholder="Tìm tour..." style={{"flex":"1","border":"none","fontSize":"13px","color":"#1f1d29","background":"transparent"}} /></div></div>

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
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-quan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/search.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Tìm quán</span></a>
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
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
<style dangerouslySetInnerHTML={{__html: `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#e7e5df;}
  a{text-decoration:none;color:inherit;}
  input{font-family:inherit;outline:none;}
  .card{transition:transform .16s ease, box-shadow .16s ease;}
  .card:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(40,20,60,.14);}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    {/* header */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}>
        <a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a>
        <div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" style={{"color":"#6d28d9","fontWeight":600}}>Tour</a><a href="/blog" className="lk">Blog</a></div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
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
</>

</div>
      </React.Fragment>
    );
  }
