

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
    <div style={{"background":"#fff","padding":"8px 18px 10px","display":"flex","alignItems":"center","gap":"12px"}}><a href="/tai-khoan" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</a><span style={{"fontWeight":"800","fontSize":"16px"}}>Chính sách</span></div>

    <div style={{"background":"#fff","padding":"0 18px 12px"}}>
      <div className="hscroll" style={{"display":"flex","gap":"7px","overflowX":"auto"}}>
        <span style={{"fontSize":"11.5px","background":"#6d28d9","color":"#fff","borderRadius":"14px","padding":"6px 12px","fontWeight":"600","whiteSpace":"nowrap"}}>Bảo mật</span>
        <span style={{"fontSize":"11.5px","background":"#fff","border":"1px solid #ececec","color":"#5b5870","borderRadius":"14px","padding":"6px 12px","whiteSpace":"nowrap"}}>Hoạt động</span>
        <span style={{"fontSize":"11.5px","background":"#fff","border":"1px solid #ececec","color":"#5b5870","borderRadius":"14px","padding":"6px 12px","whiteSpace":"nowrap"}}>Điều khoản</span>
        <span style={{"fontSize":"11.5px","background":"#fff","border":"1px solid #ececec","color":"#5b5870","borderRadius":"14px","padding":"6px 12px","whiteSpace":"nowrap"}}>Liên hệ</span>
      </div>
    </div>

    <div style={{"padding":"14px 18px 22px"}}>
      {/* Privacy policy */}
      <h2 style={{"fontSize":"21px","fontWeight":"800"}}>Chính sách bảo mật</h2>
      <div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"5px"}}>Cập nhật lần cuối: 21/06/2026</div>
      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"14px"}}>NightLife tôn trọng và bảo vệ thông tin cá nhân của người dùng. Chúng tôi chỉ thu thập dữ liệu cần thiết để cung cấp dịch vụ đặt chỗ và ưu đãi.</p>

      <h3 style={{"fontSize":"15px","fontWeight":"700","marginTop":"18px"}}>1. Thông tin chúng tôi thu thập</h3>
      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"8px"}}>Tên, số điện thoại, lịch sử đặt chỗ và sử dụng mã ưu đãi nhằm phục vụ điều phối và tích điểm thành viên.</p>

      <h3 style={{"fontSize":"15px","fontWeight":"700","marginTop":"18px"}}>2. Mục đích sử dụng</h3>
      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"8px"}}>Dữ liệu dùng để xác nhận đặt chỗ, gửi thông báo qua Telegram, đối soát hóa đơn và chăm sóc khách hàng. Chúng tôi không bán dữ liệu cho bên thứ ba.</p>

      <h3 style={{"fontSize":"15px","fontWeight":"700","marginTop":"18px"}}>3. Quyền của người dùng</h3>
      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"8px"}}>Người dùng có thể yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ Admin qua LINE.</p>

      <div style={{"height":"1px","background":"#ececec","margin":"22px 0"}}></div>

      {/* Operating policy */}
      <h2 style={{"fontSize":"18px","fontWeight":"800"}}>Chính sách hoạt động</h2>
      <h3 style={{"fontSize":"15px","fontWeight":"700","marginTop":"14px"}}>1. Đặt chỗ &amp; xác nhận</h3>
      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"8px"}}>Mọi yêu cầu đặt chỗ được Admin điều phối trực tiếp với quán. Không thu cọc hay thanh toán online; giá hiển thị chỉ mang tính tham khảo.</p>

      <h3 style={{"fontSize":"15px","fontWeight":"700","marginTop":"18px"}}>2. Mã ưu đãi &amp; tích điểm</h3>
      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"8px"}}>Mỗi mã chỉ dùng một lần và hết hạn tự hủy. Điểm thưởng được cộng sau khi hóa đơn được duyệt, có hạn sử dụng một năm.</p>

      <div style={{"marginTop":"18px","background":"#faf7ff","border":"1px solid #ece4fb","borderRadius":"12px","padding":"13px","fontSize":"12px","color":"#5b5870","lineHeight":"1.6"}}>Nội dung chính sách cuối cùng sẽ do phía khách hàng cung cấp &amp; rà soát pháp lý trước khi phát hành.</div>

      <div style={{"marginTop":"18px","textAlign":"center","fontSize":"11px","color":"#a8a5b4","lineHeight":"1.7"}}>© 2026 Nightlife Hà Nội<br />Liên hệ hợp tác · Telegram · Zalo · LINE</div>
    </div>

    {/* bottom nav */}
    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
      <a href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></a>
      <a href="/lich-su-dat-cho" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Đặt chỗ</span></a>
      <a href="/tai-khoan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/user.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Tài khoản</span></a>
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
  html{scroll-behavior:smooth;}
  body{background:#e7e5df;}
  a{text-decoration:none;color:inherit;}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
  .toc a{display:block;transition:background .14s ease, color .14s ease;}
  .toc a:hover{background:#f3ecff;color:#6d28d9;}
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

    <div style={{"display":"flex","gap":"28px","padding":"30px 34px 36px"}}>

      {/* TOC */}
      <div style={{"width":"250px","flex":"none"}}>
        <div className="toc" style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"8px","position":"sticky","top":"20px"}}>
          <div style={{"fontSize":"11.5px","fontWeight":"700","color":"#8a879a","letterSpacing":".05em","textTransform":"uppercase","padding":"8px 13px 6px"}}>Mục lục</div>
          <a href="#baomat" style={{"fontSize":"13px","fontWeight":"600","color":"#6d28d9","background":"#f1ebff","borderRadius":"9px","padding":"10px 13px"}}>Chính sách bảo mật</a>
          <a href="#hoatdong" style={{"fontSize":"13px","fontWeight":"500","color":"#5b5870","borderRadius":"9px","padding":"10px 13px"}}>Chính sách hoạt động</a>
          <a href="#dieukhoan" style={{"fontSize":"13px","fontWeight":"500","color":"#5b5870","borderRadius":"9px","padding":"10px 13px"}}>Điều khoản sử dụng</a>
          <a href="#lienhe" style={{"fontSize":"13px","fontWeight":"500","color":"#5b5870","borderRadius":"9px","padding":"10px 13px"}}>Liên hệ &amp; hợp tác</a>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{"flex":"1","maxWidth":"700px"}}>

        {/* baomat */}
        <div id="baomat" style={{"scrollMarginTop":"20px"}}>
          <h2 style={{"fontSize":"28px","fontWeight":"800"}}>Chính sách bảo mật</h2>
          <div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"6px"}}>Cập nhật lần cuối: 21/06/2026</div>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"18px"}}>NightLife tôn trọng và bảo vệ thông tin cá nhân của người dùng. Chúng tôi chỉ thu thập dữ liệu cần thiết để cung cấp dịch vụ đặt chỗ và ưu đãi.</p>
          <h3 style={{"fontSize":"18px","fontWeight":"700","marginTop":"22px"}}>1. Thông tin chúng tôi thu thập</h3>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Tên, số điện thoại, lịch sử đặt chỗ và sử dụng mã ưu đãi nhằm phục vụ điều phối và tích điểm thành viên.</p>
          <h3 style={{"fontSize":"18px","fontWeight":"700","marginTop":"22px"}}>2. Mục đích sử dụng</h3>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Dữ liệu dùng để xác nhận đặt chỗ, gửi thông báo qua Telegram, đối soát hóa đơn và chăm sóc khách hàng. Chúng tôi không bán dữ liệu cho bên thứ ba.</p>
          <h3 style={{"fontSize":"18px","fontWeight":"700","marginTop":"22px"}}>3. Quyền của người dùng</h3>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Người dùng có thể yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân bằng cách liên hệ Admin qua LINE hoặc Telegram được công bố trên trang.</p>
        </div>

        <div style={{"height":"1px","background":"#ececec","margin":"32px 0"}}></div>

        {/* hoatdong */}
        <div id="hoatdong" style={{"scrollMarginTop":"20px"}}>
          <h2 style={{"fontSize":"26px","fontWeight":"800"}}>Chính sách hoạt động</h2>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"14px"}}>NightLife là nền tảng khám phá &amp; đặt chỗ. Mọi yêu cầu đặt chỗ được Admin điều phối trực tiếp với quán; chúng tôi không thu cọc hay thanh toán online.</p>
          <h3 style={{"fontSize":"18px","fontWeight":"700","marginTop":"22px"}}>1. Đặt chỗ &amp; xác nhận</h3>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Sau khi gửi yêu cầu, Admin liên hệ xác nhận với khách và quán. Khách có thể hủy trước giờ hẹn tối thiểu 1 giờ.</p>
          <h3 style={{"fontSize":"18px","fontWeight":"700","marginTop":"22px"}}>2. Ưu đãi &amp; tích điểm</h3>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Mã ưu đãi có hạn dùng theo hạng thành viên và dùng 1 lần. Hóa đơn hợp lệ được tích điểm theo tỷ lệ 1.000.000đ = 10 điểm; điểm có hạn 1 năm.</p>
          <h3 style={{"fontSize":"18px","fontWeight":"700","marginTop":"22px"}}>3. Trách nhiệm các bên</h3>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Bảng giá hiển thị chỉ mang tính tham khảo. Chất lượng dịch vụ do quán cung cấp; NightLife đóng vai trò kết nối và hỗ trợ điều phối.</p>
        </div>

        <div style={{"height":"1px","background":"#ececec","margin":"32px 0"}}></div>

        {/* dieukhoan */}
        <div id="dieukhoan" style={{"scrollMarginTop":"20px"}}>
          <h2 style={{"fontSize":"26px","fontWeight":"800"}}>Điều khoản sử dụng</h2>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"14px"}}>Khi sử dụng NightLife, bạn đồng ý cung cấp thông tin chính xác, không lạm dụng mã ưu đãi và tôn trọng quy định của từng quán. Tài khoản vi phạm có thể bị tạm khóa.</p>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Dịch vụ chỉ dành cho người từ 18 tuổi trở lên. NightLife có quyền cập nhật điều khoản và sẽ thông báo trên trang khi có thay đổi quan trọng.</p>
        </div>

        <div style={{"height":"1px","background":"#ececec","margin":"32px 0"}}></div>

        {/* lienhe */}
        <div id="lienhe" style={{"scrollMarginTop":"20px"}}>
          <h2 style={{"fontSize":"26px","fontWeight":"800"}}>Liên hệ &amp; hợp tác</h2>
          <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"14px"}}>Đối tác muốn đưa quán lên NightLife vui lòng xem trang <a href="/dang-ky-doi-tac" style={{"color":"#6d28d9","fontWeight":"600"}}>Đăng ký đối tác</a> hoặc liên hệ qua Telegram · Zalo · LINE.</p>
        </div>

        <div style={{"marginTop":"24px","background":"#faf7ff","border":"1px solid #ece4fb","borderRadius":"14px","padding":"16px 18px","fontSize":"13px","color":"#5b5870","lineHeight":"1.6"}}>Nội dung chính sách cuối cùng sẽ do phía khách hàng cung cấp &amp; rà soát pháp lý trước khi phát hành chính thức.</div>
      </div>
    </div>

    {/* FOOTER */}
    <div style={{"padding":"24px 34px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","justifyContent":"space-between","alignItems":"center","color":"#8a879a","fontSize":"12px"}}><span>© 2026 Nightlife Hà Nội · Điều khoản · Chính sách bảo mật</span><span>Liên hệ hợp tác · Telegram · Zalo · LINE</span></div>
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
  
