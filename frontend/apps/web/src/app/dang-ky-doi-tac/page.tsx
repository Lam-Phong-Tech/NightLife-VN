
  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    
    
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
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#fff","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"height":"40px","background":"#3a1f6e","display":"flex","alignItems":"center","justifyContent":"space-between","padding":"0 22px","fontSize":"13px","fontWeight":"700","color":"#fff"}}><span>21:00</span><span style={{"width":"22px","height":"11px","border":"1.5px solid #fff","borderRadius":"3px","display":"inline-block","position":"relative"}}><span style={{"position":"absolute","inset":"1.5px","right":"6px","background":"#fff","borderRadius":"1px"}}></span></span></div>

    {/* pitch hero */}
    <div style={{"background":"linear-gradient(150deg,rgba(58,31,110,.82),rgba(26,16,48,.8)),url('https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=720&q=70') center/cover","padding":"0 22px 22px","color":"#fff"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"10px","paddingTop":"12px"}}><a href="/" style={{"fontSize":"20px","color":"#fff","lineHeight":"1"}}>‹</a><div style={{"fontWeight":"800","fontSize":"18px"}}>nightlife<span style={{"color":"#c9a7ff"}}>.hn</span></div></div>
      <div style={{"fontSize":"10px","letterSpacing":".16em","textTransform":"uppercase","color":"#d9c9f7","fontWeight":"700","marginTop":"16px"}}>Hợp tác cùng NightLife</div>
      <h2 style={{"fontSize":"23px","fontWeight":"800","lineHeight":"1.2","marginTop":"8px","maxWidth":"260px"}}>Đưa quán đến hàng nghìn khách mỗi đêm</h2>
      <div style={{"fontSize":"11.5px","color":"#cbbfe0","marginTop":"10px"}}>Không yêu cầu giấy phép kinh doanh khi đăng ký.</div>
    </div>

    {/* benefits */}
    <div style={{"padding":"16px 18px 0","marginTop":"-12px","background":"#fff","borderRadius":"22px 22px 0 0","position":"relative"}}>
      <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
        <div style={{"display":"flex","gap":"11px","alignItems":"center","background":"#faf7ff","border":"1px solid #ece4fb","borderRadius":"12px","padding":"11px 12px"}}><img src="https://img.icons8.com/fluency/96/conference-call.png" style={{"width":"26px","height":"26px","flex":"none","display":"inline-block"}} alt="" /><div><div style={{"fontWeight":"700","fontSize":"13px"}}>Tiếp cận khách mục tiêu</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"1px"}}>Khách Nhật &amp; khách cao cấp tìm quán mỗi tối.</div></div></div>
        <div style={{"display":"flex","gap":"11px","alignItems":"center","background":"#faf7ff","border":"1px solid #ece4fb","borderRadius":"12px","padding":"11px 12px"}}><img src="https://img.icons8.com/fluency/96/qr-code.png" style={{"width":"26px","height":"26px","flex":"none","display":"inline-block"}} alt="" /><div><div style={{"fontWeight":"700","fontSize":"13px"}}>Tài khoản đối tác</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"1px"}}>Tự quét mã, đối soát dịch vụ, đăng thông tin.</div></div></div>
        <div style={{"display":"flex","gap":"11px","alignItems":"center","background":"#faf7ff","border":"1px solid #ece4fb","borderRadius":"12px","padding":"11px 12px"}}><img src="https://img.icons8.com/fluency/96/bar-chart.png" style={{"width":"26px","height":"26px","flex":"none","display":"inline-block"}} alt="" /><div><div style={{"fontWeight":"700","fontSize":"13px"}}>Lên Top xếp hạng</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"1px"}}>Gói tài trợ giúp quán hiển thị nổi bật.</div></div></div>
      </div>
    </div>

    {/* form */}
    <div style={{"padding":"16px 18px 0"}}>
      <h3 style={{"fontSize":"17px","fontWeight":"800"}}>Đăng ký hợp tác</h3>
      <p style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"4px"}}>Gửi thông tin — Admin sẽ liên hệ &amp; kiểm duyệt trước khi hiển thị.</p>
      <div style={{"display":"flex","flexDirection":"column","gap":"11px","marginTop":"14px"}}>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Tên quán / cơ sở</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#9a98a6"}}>VD: Club Lumière</div></div>
        <div style={{"display":"flex","gap":"10px"}}><div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Loại hình</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"12.5px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}>Bar / Lounge<span style={{"color":"#8a879a"}}>▾</span></div></div><div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Khu vực</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"12.5px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}>Hà Nội<span style={{"color":"#8a879a"}}>▾</span></div></div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Người liên hệ</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#9a98a6"}}>Họ tên</div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>SĐT / Telegram</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#9a98a6"}}>0912 345 678</div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Mô tả ngắn</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#9a98a6","minHeight":"58px"}}>Mô tả quán, dịch vụ nổi bật…</div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Hình ảnh quán <span style={{"color":"#8a879a","fontWeight":"500"}}>(tùy chọn)</span></label><div style={{"marginTop":"5px","border":"1.5px dashed #d9c9f7","borderRadius":"10px","padding":"16px","textAlign":"center","background":"#faf7ff"}}><img src="https://img.icons8.com/fluency/96/add-image.png" style={{"width":"26px","height":"26px","display":"inline-block"}} alt="" /><div style={{"fontSize":"11.5px","color":"#6d28d9","fontWeight":"600","marginTop":"5px"}}>Tải ảnh lên</div></div></div>
      </div>
      <div style={{"marginTop":"13px","background":"#f1ebff","border":"1px solid #e0d4fb","borderRadius":"10px","padding":"10px 12px","fontSize":"11px","color":"#6d28d9","lineHeight":"1.6"}}>Không yêu cầu giấy phép kinh doanh khi đăng ký. Admin sẽ kiểm duyệt nội dung trước khi hiển thị.</div>
      <div style={{"marginTop":"13px","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"11px","padding":"13px","fontWeight":"700","fontSize":"14px"}}>Gửi đăng ký</div>
      <div style={{"marginTop":"9px","fontSize":"11px","color":"#8a879a","textAlign":"center"}}>Yêu cầu sẽ gửi tới Admin qua Telegram để kiểm duyệt.</div>
      <div style={{"height":"18px"}}></div>
    </div>

    {/* bottom nav */}
    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
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
  .btn{transition:filter .14s ease, transform .12s ease;cursor:pointer;}
  .btn:hover{filter:brightness(1.06);transform:translateY(-1px);}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
  .up{transition:background .14s ease;cursor:pointer;}
  .up:hover{background:#f3ecff;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>

    {/* HEADER */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}>
        <a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a>
        <div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><a href="/dang-ky-doi-tac" style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</a></div>
    </div>

    <div style={{"display":"flex","gap":"0"}}>

      {/* PITCH */}
      <div style={{"width":"44%","flex":"none","background":"linear-gradient(150deg,rgba(58,31,110,.82),rgba(26,16,48,.8)),url('https://images.unsplash.com/photo-1513735492246-483525079686?auto=format&fit=crop&w=720&q=70') center/cover","padding":"44px","color":"#fff"}}>
        <div style={{"fontSize":"12px","letterSpacing":".16em","textTransform":"uppercase","color":"#d9c9f7","fontWeight":"700"}}>Hợp tác cùng NightLife</div>
        <h2 style={{"fontSize":"32px","fontWeight":"800","lineHeight":"1.18","marginTop":"12px","maxWidth":"340px"}}>Đưa quán của bạn đến hàng nghìn khách mỗi đêm</h2>
        <p style={{"fontSize":"13.5px","color":"#cbbfe0","marginTop":"12px","lineHeight":"1.6","maxWidth":"340px"}}>Nền tảng khám phá &amp; đặt chỗ cho khách Nhật và khách cao cấp tại Hà Nội &amp; TP.HCM.</p>

        <div style={{"marginTop":"28px","display":"flex","flexDirection":"column","gap":"14px"}}>
          <div style={{"display":"flex","gap":"13px","alignItems":"flex-start","background":"rgba(255,255,255,.08)","border":"1px solid rgba(255,255,255,.14)","borderRadius":"14px","padding":"14px"}}><img src="https://img.icons8.com/fluency/96/conference-call.png" style={{"width":"28px","height":"28px","flex":"none","display":"inline-block"}} alt="" /><div><div style={{"fontWeight":"600","fontSize":"14.5px"}}>Tiếp cận khách mục tiêu</div><div style={{"fontSize":"12.5px","color":"#cbbfe0","marginTop":"3px","lineHeight":"1.5"}}>Khách Nhật &amp; khách cao cấp tìm quán mỗi tối.</div></div></div>
          <div style={{"display":"flex","gap":"13px","alignItems":"flex-start","background":"rgba(255,255,255,.08)","border":"1px solid rgba(255,255,255,.14)","borderRadius":"14px","padding":"14px"}}><img src="https://img.icons8.com/fluency/96/qr-code.png" style={{"width":"28px","height":"28px","flex":"none","display":"inline-block"}} alt="" /><div><div style={{"fontWeight":"600","fontSize":"14.5px"}}>Tài khoản đối tác riêng</div><div style={{"fontSize":"12.5px","color":"#cbbfe0","marginTop":"3px","lineHeight":"1.5"}}>Tự quét mã, đối soát dịch vụ, cập nhật thông tin quán.</div></div></div>
          <div style={{"display":"flex","gap":"13px","alignItems":"flex-start","background":"rgba(255,255,255,.08)","border":"1px solid rgba(255,255,255,.14)","borderRadius":"14px","padding":"14px"}}><img src="https://img.icons8.com/fluency/96/bar-chart.png" style={{"width":"28px","height":"28px","flex":"none","display":"inline-block"}} alt="" /><div><div style={{"fontWeight":"600","fontSize":"14.5px"}}>Lên Top bảng xếp hạng</div><div style={{"fontSize":"12.5px","color":"#cbbfe0","marginTop":"3px","lineHeight":"1.5"}}>Gói tài trợ giúp quán hiển thị nổi bật hơn.</div></div></div>
        </div>

        <div style={{"marginTop":"28px","display":"inline-flex","alignItems":"center","gap":"8px","background":"rgba(255,255,255,.16)","border":"1px solid rgba(255,255,255,.3)","borderRadius":"20px","padding":"8px 14px","fontSize":"12.5px","fontWeight":"600"}}><img src="https://img.icons8.com/ios-filled/100/FFFFFF/checkmark.png" style={{"width":"15px","height":"15px","display":"inline-block"}} alt="" />Không yêu cầu giấy phép kinh doanh khi đăng ký</div>
      </div>

      {/* FORM */}
      <div style={{"flex":"1","background":"#fff","padding":"40px"}}>
        <h2 style={{"fontSize":"22px","fontWeight":"800"}}>Đăng ký hợp tác</h2>
        <p style={{"fontSize":"13px","color":"#8a879a","marginTop":"5px"}}>Gửi thông tin — Admin sẽ liên hệ &amp; kiểm duyệt trước khi hiển thị.</p>

        <div style={{"marginTop":"20px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px"}}>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Tên quán / cơ sở <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#9a98a6"}}>VD: Club Lumière</div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Loại hình</label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}>Bar / Lounge<span style={{"color":"#8a879a"}}>▾</span></div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Khu vực</label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}>Hà Nội · Tây Hồ<span style={{"color":"#8a879a"}}>▾</span></div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Người liên hệ <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#9a98a6"}}>Họ tên</div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>SĐT / Telegram <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#9a98a6"}}>0912 345 678</div></div>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Mô tả ngắn</label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#9a98a6","minHeight":"72px"}}>Mô tả quán, dịch vụ nổi bật, đối tượng khách…</div></div>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Hình ảnh quán <span style={{"color":"#8a879a","fontWeight":"500"}}>(tùy chọn)</span></label><div className="up" style={{"marginTop":"6px","border":"1.5px dashed #d9c9f7","borderRadius":"11px","padding":"20px","textAlign":"center","background":"#faf7ff"}}><img src="https://img.icons8.com/fluency/96/add-image.png" style={{"width":"30px","height":"30px","display":"inline-block"}} alt="" /><div style={{"fontSize":"12.5px","color":"#6d28d9","fontWeight":"600","marginTop":"6px"}}>Kéo thả hoặc tải ảnh lên</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Ảnh đẹp giúp quán nổi bật trên trang khám phá</div></div></div>
        </div>

        <div className="btn" style={{"marginTop":"18px","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"12px","padding":"14px","fontWeight":"700","fontSize":"15px"}}>Gửi đăng ký</div>
        <div style={{"marginTop":"10px","fontSize":"12px","color":"#8a879a","textAlign":"center"}}>Yêu cầu sẽ gửi tới Admin qua Telegram để kiểm duyệt. Đã có tài khoản? <a href="/dang-nhap" style={{"color":"#6d28d9","fontWeight":"600"}}>Đăng nhập đối tác</a></div>
      </div>
    </div>
  </div>
</div>
</>


</div>
      </React.Fragment>
    );
  }
  