

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
  .hscroll{scrollbar-width:none;}
  .hscroll::-webkit-scrollbar{display:none;}
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","gap":"12px"}}><a href="/tai-khoan" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</a><span style={{"fontWeight":"800","fontSize":"16px"}}>Gửi hóa đơn</span></div>

    <div style={{"padding":"14px 18px"}}>
      {/* form */}
      <div style={{"display":"flex","flexDirection":"column","gap":"11px"}}>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Quán <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}>Club Lumière · Tây Hồ<span style={{"color":"#8a879a"}}>▾</span></div></div>
        <div style={{"display":"flex","gap":"10px"}}><div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Số tiền <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","fontWeight":"600"}}>2.400.000đ</div></div><div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Thời gian <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#3a384a"}}>21/06 · 21:00</div></div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Cơ sở / chi nhánh <span style={{"color":"#8a879a","fontWeight":"500"}}>(tùy chọn)</span></label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#9a98a6"}}>VD: cơ sở Quảng An</div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Liên kết đặt chỗ / mã <span style={{"color":"#8a879a","fontWeight":"500"}}>(tùy chọn)</span></label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}>Booking #BK-2041<span style={{"color":"#8a879a"}}>▾</span></div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Ảnh chứng từ <span style={{"color":"#8a879a","fontWeight":"500"}}>(tùy chọn)</span></label><div style={{"marginTop":"5px","border":"1.5px dashed #d9c9f7","borderRadius":"10px","padding":"18px","textAlign":"center","background":"#faf7ff"}}><img src="https://img.icons8.com/fluency/96/add-image.png" style={{"width":"28px","height":"28px","display":"inline-block"}} alt="" /><div style={{"fontSize":"11.5px","color":"#6d28d9","fontWeight":"600","marginTop":"5px"}}>Chọn ảnh bill</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"2px"}}>Nên gửi để Admin đối chiếu nhanh hơn</div></div></div>
      </div>

      {/* notes */}
      <div style={{"marginTop":"12px","background":"#fdefd6","border":"1px solid #f5dca8","borderRadius":"10px","padding":"11px 12px","fontSize":"11px","color":"#8a5a00","lineHeight":"1.6"}}>Gửi trong vòng <b>10 ngày</b> kể từ ngày dùng dịch vụ. Chỉ ghi <b>tổng tiền</b>, không nhập chi tiết món.</div>

      <div style={{"marginTop":"12px","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"11px","padding":"13px","fontWeight":"700","fontSize":"14px"}}>Gửi hóa đơn</div>

      {/* history */}
      <div style={{"marginTop":"20px","fontWeight":"800","fontSize":"15px"}}>Lịch sử hóa đơn</div>
      <div className="hscroll" style={{"display":"flex","gap":"7px","marginTop":"10px","overflowX":"auto"}}>
        <span style={{"display":"inline-flex","alignItems":"center","fontSize":"11.5px","borderRadius":"15px","padding":"7px 13px","fontWeight":"600","whiteSpace":"nowrap","background":"#6d28d9","color":"#fff","border":"1px solid #6d28d9"}}>Tất cả</span>
        <span style={{"display":"inline-flex","alignItems":"center","fontSize":"11.5px","borderRadius":"15px","padding":"7px 13px","fontWeight":"600","whiteSpace":"nowrap","background":"#fff","color":"#5b5870","border":"1px solid #ececec"}}>Chờ duyệt</span>
        <span style={{"display":"inline-flex","alignItems":"center","fontSize":"11.5px","borderRadius":"15px","padding":"7px 13px","fontWeight":"600","whiteSpace":"nowrap","background":"#fff","color":"#5b5870","border":"1px solid #ececec"}}>Đã duyệt</span>
        <span style={{"display":"inline-flex","alignItems":"center","fontSize":"11.5px","borderRadius":"15px","padding":"7px 13px","fontWeight":"600","whiteSpace":"nowrap","background":"#fff","color":"#5b5870","border":"1px solid #ececec"}}>Bị từ chối</span>
      </div>

      <div style={{"marginTop":"11px","display":"flex","flexDirection":"column","gap":"9px"}}>
        {/* approved */}
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"13px","padding":"11px 12px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}><span style={{"width":"40px","height":"40px","borderRadius":"10px","flex":"none","background":"linear-gradient(140deg,#d6336c,#7b2d6b)"}}></span><div style={{"flex":"1","minWidth":"0"}}><div style={{"fontWeight":"600","fontSize":"13px"}}>Club Lumière</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"1px"}}>21/06 · 2.400.000đ</div></div><span style={{"fontSize":"9.5px","fontWeight":"700","borderRadius":"8px","padding":"4px 8px","color":"#1f8a52","background":"#e6f7ee"}}>Đã duyệt</span></div>
          <div style={{"marginTop":"8px","paddingTop":"8px","borderTop":"1px solid #f1f0f3","display":"flex","alignItems":"center","justifyContent":"space-between","fontSize":"11px","color":"#1f8a52","fontWeight":"600"}}><span>+24 điểm đã cộng</span></div>
        </div>
        {/* pending */}
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"13px","padding":"11px 12px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}><span style={{"width":"40px","height":"40px","borderRadius":"10px","flex":"none","background":"linear-gradient(140deg,#3a8fb0,#2d5fae)"}}></span><div style={{"flex":"1","minWidth":"0"}}><div style={{"fontWeight":"600","fontSize":"13px"}}>KTV Hoàng Gia</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"1px"}}>18/06 · 1.800.000đ</div></div><span style={{"fontSize":"9.5px","fontWeight":"700","borderRadius":"8px","padding":"4px 8px","color":"#b06a00","background":"#fdefd6"}}>Pending</span></div>
          <div style={{"marginTop":"8px","paddingTop":"8px","borderTop":"1px solid #f1f0f3","fontSize":"11px","color":"#8a879a"}}>Đang chờ Admin duyệt</div>
        </div>
        {/* rejected */}
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"13px","padding":"11px 12px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}><span style={{"width":"40px","height":"40px","borderRadius":"10px","flex":"none","background":"linear-gradient(140deg,#e0a23a,#c0782d)"}}></span><div style={{"flex":"1","minWidth":"0"}}><div style={{"fontWeight":"600","fontSize":"13px"}}>Diamond Bar</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"1px"}}>08/06 · 1.200.000đ</div></div><span style={{"fontSize":"9.5px","fontWeight":"700","borderRadius":"8px","padding":"4px 8px","color":"#b03a4a","background":"#fde7ea"}}>Bị từ chối</span></div>
          <div style={{"marginTop":"8px","paddingTop":"8px","borderTop":"1px solid #f1f0f3","display":"flex","alignItems":"center","justifyContent":"space-between","gap":"8px"}}><span style={{"fontSize":"11px","color":"#b03a4a","flex":"1"}}>Lý do: Ảnh mờ — vui lòng gửi lại.</span><span style={{"fontSize":"11px","color":"#6d28d9","fontWeight":"700","border":"1px solid #e0d4fb","borderRadius":"9px","padding":"6px 11px"}}>Gửi lại</span></div>
        </div>
        {/* approved 2 */}
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"13px","padding":"11px 12px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}><span style={{"width":"40px","height":"40px","borderRadius":"10px","flex":"none","background":"linear-gradient(140deg,#8a6ad0,#5d3da8)"}}></span><div style={{"flex":"1","minWidth":"0"}}><div style={{"fontWeight":"600","fontSize":"13px"}}>Sakura Lounge</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"1px"}}>12/06 · 3.500.000đ</div></div><span style={{"fontSize":"9.5px","fontWeight":"700","borderRadius":"8px","padding":"4px 8px","color":"#1f8a52","background":"#e6f7ee"}}>Đã duyệt</span></div>
          <div style={{"marginTop":"8px","paddingTop":"8px","borderTop":"1px solid #f1f0f3","fontSize":"11px","color":"#1f8a52","fontWeight":"600"}}>+35 điểm đã cộng</div>
        </div>
      </div>
      <div style={{"height":"8px"}}></div>
    </div>

    {/* bottom nav */}
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

    <div style={{"display":"flex","gap":"24px","padding":"26px 34px 32px"}}>

      {/* FORM */}
      <div style={{"width":"440px","flex":"none"}}>
        <h2 style={{"fontSize":"24px","fontWeight":"800"}}>Gửi hóa đơn</h2>
        <p style={{"fontSize":"13px","color":"#5b5870","marginTop":"5px"}}>Gửi để tích điểm thưởng &amp; đối soát dịch vụ. Admin duyệt thủ công trong 1–2 ngày.</p>

        <div style={{"marginTop":"18px","display":"flex","flexDirection":"column","gap":"14px"}}>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Quán <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}>Club Lumière · Tây Hồ<span style={{"color":"#8a879a"}}>▾</span></div></div>
          <div style={{"display":"flex","gap":"12px"}}>
            <div style={{"flex":"1"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Số tiền <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#1f1d29","fontWeight":"600"}}>2.400.000đ</div></div>
            <div style={{"flex":"1"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Thời gian dùng DV <span style={{"color":"#d6336c"}}>*</span></label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","gap":"8px"}}><img src="https://img.icons8.com/ios/100/9A98A6/calendar.png" style={{"width":"15px","height":"15px","display":"inline-block"}} alt="" />21/06/2026</div></div>
          </div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Cơ sở / chi nhánh <span style={{"color":"#8a879a","fontWeight":"500"}}>(tùy chọn)</span></label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#9a98a6"}}>VD: cơ sở Quảng An</div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Liên kết đặt chỗ / coupon <span style={{"color":"#8a879a","fontWeight":"500"}}>(tùy chọn)</span></label><div style={{"marginTop":"6px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}>Booking #BK-2041 · Happy Hour −30%<span style={{"color":"#8a879a"}}>▾</span></div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Ảnh / chứng từ <span style={{"color":"#8a879a","fontWeight":"500"}}>(khuyến khích, không bắt buộc)</span></label><div className="up" style={{"marginTop":"6px","border":"1.5px dashed #d9c9f7","borderRadius":"11px","padding":"24px","textAlign":"center","background":"#faf7ff"}}><img src="https://img.icons8.com/fluency/96/add-image.png" style={{"width":"32px","height":"32px","display":"inline-block"}} alt="" /><div style={{"fontSize":"12.5px","color":"#6d28d9","fontWeight":"600","marginTop":"6px"}}>Kéo thả hoặc chọn ảnh bill</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Nên gửi để Admin đối chiếu nhanh hơn (JPG/PNG ≤ 5MB)</div></div></div>
        </div>

        <div style={{"marginTop":"14px","background":"#fdefd6","border":"1px solid #f5dca8","borderRadius":"11px","padding":"11px 13px","fontSize":"12px","color":"#b06a00","lineHeight":"1.6"}}>Gửi trong vòng <b>10 ngày</b> kể từ ngày dùng dịch vụ. Chỉ ghi <b>tổng tiền</b>, không nhập chi tiết món.</div>
        <div className="btn" style={{"marginTop":"14px","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"11px","padding":"14px","fontWeight":"700","fontSize":"15px"}}>Gửi hóa đơn</div>
        <div style={{"marginTop":"10px","fontSize":"12px","color":"#8a879a","textAlign":"center"}}>Tích điểm: 1.000.000đ trên hóa đơn = 10 điểm.</div>
      </div>

      {/* HISTORY */}
      <div style={{"flex":"1"}}>
        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}><h2 style={{"fontSize":"18px","fontWeight":"800"}}>Lịch sử hóa đơn</h2><span style={{"fontSize":"12.5px","color":"#8a879a"}}>Đã tích: <b style={{"color":"#6d28d9"}}>156 điểm</b></span></div>
        <div style={{"display":"flex","gap":"9px","flexWrap":"wrap","marginTop":"14px"}}>
          <span style={{"fontSize":"13px","fontWeight":"600","background":"#6d28d9","color":"#fff","border":"1px solid #6d28d9","borderRadius":"18px","padding":"8px 16px"}}>Tất cả</span>
          <span style={{"fontSize":"13px","fontWeight":"600","background":"#fff","color":"#5b5870","border":"1px solid #ececec","borderRadius":"18px","padding":"8px 16px"}}>Chờ duyệt</span>
          <span style={{"fontSize":"13px","fontWeight":"600","background":"#fff","color":"#5b5870","border":"1px solid #ececec","borderRadius":"18px","padding":"8px 16px"}}>Đã duyệt</span>
          <span style={{"fontSize":"13px","fontWeight":"600","background":"#fff","color":"#5b5870","border":"1px solid #ececec","borderRadius":"18px","padding":"8px 16px"}}>Bị từ chối</span>
        </div>

        <div style={{"marginTop":"16px","display":"flex","flexDirection":"column","gap":"12px"}}>

          {/* approved */}
          <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"14px 16px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"14px"}}>
              <span style={{"width":"46px","height":"46px","borderRadius":"11px","flex":"none","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=360&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)"}}></span>
              <div style={{"flex":"1"}}><div style={{"fontWeight":"600","fontSize":"14.5px"}}>Club Lumière</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"3px"}}>21/06 · 2.400.000đ</div></div>
              <span style={{"fontSize":"11.5px","fontWeight":"700","borderRadius":"10px","padding":"5px 11px","color":"#177544","background":"#e6f7ee"}}>Đã duyệt</span>
            </div>
            <div style={{"marginTop":"10px","paddingTop":"10px","borderTop":"1px solid #f1f0f3","fontSize":"12.5px","color":"#177544","fontWeight":"600"}}>+24 điểm đã được cộng vào tài khoản.</div>
          </div>

          {/* pending */}
          <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"14px 16px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"14px"}}>
              <span style={{"width":"46px","height":"46px","borderRadius":"11px","flex":"none","background":"url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=360&q=70') center/cover,linear-gradient(140deg,#3a8fb0,#2d5fae)"}}></span>
              <div style={{"flex":"1"}}><div style={{"fontWeight":"600","fontSize":"14.5px"}}>KTV Hoàng Gia</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"3px"}}>18/06 · 1.800.000đ</div></div>
              <span style={{"fontSize":"11.5px","fontWeight":"700","borderRadius":"10px","padding":"5px 11px","color":"#b06a00","background":"#fdefd6"}}>Chờ duyệt</span>
            </div>
            <div style={{"marginTop":"10px","paddingTop":"10px","borderTop":"1px solid #f1f0f3","fontSize":"12.5px","color":"#8a879a"}}>Đang chờ Admin duyệt · dự kiến +18 điểm.</div>
          </div>

          {/* approved 2 */}
          <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"14px 16px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"14px"}}>
              <span style={{"width":"46px","height":"46px","borderRadius":"11px","flex":"none","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=360&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)"}}></span>
              <div style={{"flex":"1"}}><div style={{"fontWeight":"600","fontSize":"14.5px"}}>Sakura Lounge</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"3px"}}>12/06 · 3.500.000đ</div></div>
              <span style={{"fontSize":"11.5px","fontWeight":"700","borderRadius":"10px","padding":"5px 11px","color":"#177544","background":"#e6f7ee"}}>Đã duyệt</span>
            </div>
            <div style={{"marginTop":"10px","paddingTop":"10px","borderTop":"1px solid #f1f0f3","fontSize":"12.5px","color":"#177544","fontWeight":"600"}}>+35 điểm đã được cộng vào tài khoản.</div>
          </div>

          {/* rejected */}
          <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"14px 16px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"14px"}}>
              <span style={{"width":"46px","height":"46px","borderRadius":"11px","flex":"none","background":"url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=360&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)"}}></span>
              <div style={{"flex":"1"}}><div style={{"fontWeight":"600","fontSize":"14.5px"}}>Diamond Bar</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"3px"}}>08/06 · 1.200.000đ</div></div>
              <span style={{"fontSize":"11.5px","fontWeight":"700","borderRadius":"10px","padding":"5px 11px","color":"#b03a4a","background":"#fde7ea"}}>Bị từ chối</span>
            </div>
            <div style={{"marginTop":"10px","paddingTop":"10px","borderTop":"1px solid #f1f0f3","display":"flex","alignItems":"center","justifyContent":"space-between","gap":"12px"}}>
              <span style={{"fontSize":"12.5px","color":"#b03a4a"}}>Lý do: ảnh bill bị mờ, không đọc được tổng tiền.</span>
              <span className="btn" style={{"flex":"none","fontSize":"12.5px","color":"#6d28d9","fontWeight":"600","border":"1px solid #e0d6f7","borderRadius":"10px","padding":"7px 14px"}}>Gửi lại</span>
            </div>
          </div>

          {/* approved 3 */}
          <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"14px 16px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"14px"}}>
              <span style={{"width":"46px","height":"46px","borderRadius":"11px","flex":"none","background":"url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=360&q=70') center/cover,linear-gradient(140deg,#e0598a,#a8336b)"}}></span>
              <div style={{"flex":"1"}}><div style={{"fontWeight":"600","fontSize":"14.5px"}}>Hanoi Velvet</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"3px"}}>02/06 · 1.100.000đ</div></div>
              <span style={{"fontSize":"11.5px","fontWeight":"700","borderRadius":"10px","padding":"5px 11px","color":"#177544","background":"#e6f7ee"}}>Đã duyệt</span>
            </div>
            <div style={{"marginTop":"10px","paddingTop":"10px","borderTop":"1px solid #f1f0f3","fontSize":"12.5px","color":"#177544","fontWeight":"600"}}>+11 điểm đã được cộng vào tài khoản.</div>
          </div>

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
  
