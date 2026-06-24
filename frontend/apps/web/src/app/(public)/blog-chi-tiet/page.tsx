/* eslint-disable */

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
  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 10px","display":"flex","alignItems":"center","gap":"12px"}}><a href="/blog" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</a><a href="/blog" style={{"fontWeight":"700","fontSize":"14px","color":"#8a879a"}}>Blog</a></div>

    <div style={{"padding":"6px 18px 18px"}}>
      <span style={{"fontSize":"10px","color":"#1f7a8c","background":"#e0f2f5","borderRadius":"8px","padding":"3px 9px","fontWeight":"700"}}>Cẩm nang khu vực</span>
      <h2 style={{"fontSize":"21px","fontWeight":"800","marginTop":"10px","lineHeight":"1.2"}}>Hướng dẫn trọn vẹn một đêm ở Tây Hồ cho khách Nhật</h2>
      <div style={{"display":"flex","alignItems":"center","gap":"9px","marginTop":"10px","fontSize":"11.5px","color":"#8a879a"}}><span style={{"width":"26px","height":"26px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)"}}></span>Đội ngũ NightLife · 21/06/2026 · 6 phút đọc</div>

      <div style={{"height":"190px","borderRadius":"14px","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#7b2d6b,#3a1f6e)","marginTop":"14px"}}></div>

      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"14px"}}>Tây Hồ về đêm là một trong những khu sôi động và sang trọng bậc nhất Hà Nội, đặc biệt được khách Nhật ưa chuộng nhờ nhiều lounge và bar có nhân viên nói tiếng Nhật.</p>

      <h3 style={{"fontSize":"16px","fontWeight":"700","marginTop":"18px"}}>1. Bắt đầu với một lounge cao cấp</h3>
      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"8px"}}>Khởi đầu buổi tối tại Club Lumière hoặc Sakura Lounge — không gian tinh tế, phù hợp tiếp khách đối tác. Nên đặt chỗ trước qua NightLife để nhận ưu đãi và được sắp xếp phòng VIP.</p>

      <h3 style={{"fontSize":"16px","fontWeight":"700","marginTop":"18px"}}>2. Lưu ý về giá &amp; đặt chỗ</h3>
      <p style={{"fontSize":"13.5px","lineHeight":"1.75","color":"#3a384a","marginTop":"8px"}}>Bảng giá trên trang chỉ mang tính tham khảo. Mọi đặt chỗ được Admin điều phối trực tiếp với quán, và bạn có thể dùng mã giảm giá theo hạng thành viên.</p>

      <div style={{"marginTop":"16px","background":"#faf7ff","border":"1px solid #ece4fb","borderRadius":"12px","padding":"13px","display":"flex","gap":"11px","alignItems":"flex-start"}}><img src="/icons/huong-dan-lay-ma.svg" style={{"width":"24px","height":"24px","flex":"none","display":"inline-block"}} alt="" /><div style={{"fontSize":"12px","color":"#5b5870","lineHeight":"1.6"}}>Mẹo: đăng nhập hội viên để nhận giảm tới 10% và tích điểm cho mỗi hóa đơn.</div></div>

      {/* related */}
      <div style={{"marginTop":"22px","fontWeight":"800","fontSize":"15px"}}>Bài liên quan</div>
      <div style={{"marginTop":"11px","display":"flex","flexDirection":"column","gap":"11px"}}>
        <a href="/blog-chi-tiet" style={{"display":"flex","gap":"11px","alignItems":"center","background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"9px"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)"}}></span><div style={{"flex":"1","minWidth":"0"}}><div style={{"fontSize":"12.5px","fontWeight":"600","lineHeight":"1.35"}}>Văn hoá karaoke Nhật tại Hà Nội</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"3px"}}>20/06 · 7 phút đọc</div></div></a>
        <a href="/blog-chi-tiet" style={{"display":"flex","gap":"11px","alignItems":"center","background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"9px"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)"}}></span><div style={{"flex":"1","minWidth":"0"}}><div style={{"fontSize":"12.5px","fontWeight":"600","lineHeight":"1.35"}}>Bản đồ Quận 1 về đêm cho khách Nhật</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"3px"}}>19/06 · 6 phút đọc</div></div></a>
        <a href="/blog-chi-tiet" style={{"display":"flex","gap":"11px","alignItems":"center","background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"9px"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)"}}></span><div style={{"flex":"1","minWidth":"0"}}><div style={{"fontSize":"12.5px","fontWeight":"600","lineHeight":"1.35"}}>5 mẹo đặt bàn nhanh cuối tuần</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"3px"}}>16/06 · 4 phút đọc</div></div></a>
      </div>
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
  .card{transition:transform .16s ease, box-shadow .16s ease;cursor:pointer;}
  .card:hover{transform:translateY(-3px);box-shadow:0 12px 28px rgba(40,20,60,.12);}
  .btn{transition:filter .14s ease;cursor:pointer;}
  .btn:hover{filter:brightness(1.05);}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
  .related:hover .rt{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>

    {/* HEADER */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}>
        <a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a>
        <div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" style={{"color":"#6d28d9","fontWeight":600}}>Blog</a></div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><a href="/dang-ky-doi-tac" style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</a></div>
    </div>

    <div style={{"padding":"18px 34px 0","fontSize":"12.5px","color":"#8a879a"}}><a href="/" className="lk">Trang chủ</a> › <a href="/blog" className="lk">Blog</a> › <span style={{"color":"#1f1d29"}}>Cẩm nang khu vực</span></div>

    <div style={{"padding":"18px 34px 0"}}>
      <span style={{"fontSize":"11px","color":"#1f7a8c","background":"#e0f2f5","borderRadius":"9px","padding":"4px 10px","fontWeight":"700"}}>Cẩm nang khu vực</span>
      <h2 style={{"fontSize":"30px","fontWeight":"800","marginTop":"12px","lineHeight":"1.18"}}>Hướng dẫn trọn vẹn một đêm ở Tây Hồ cho khách Nhật</h2>
      <div style={{"display":"flex","alignItems":"center","gap":"10px","marginTop":"12px","fontSize":"12.5px","color":"#8a879a"}}><span style={{"width":"30px","height":"30px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)"}}></span>Đội ngũ NightLife · 21/06/2026 · 6 phút đọc</div>
    </div>

    <div style={{"display":"flex","gap":"28px","padding":"18px 34px 32px"}}>

      {/* ARTICLE */}
      <div style={{"flex":"1"}}>
        <div style={{"height":"320px","borderRadius":"16px","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#7b2d6b,#3a1f6e)"}}></div>

        <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"22px"}}>Tây Hồ về đêm là một trong những khu sôi động và sang trọng bậc nhất Hà Nội, đặc biệt được khách Nhật ưa chuộng nhờ nhiều lounge và bar có nhân viên nói tiếng Nhật. Bài viết này gợi ý một lộ trình hoàn chỉnh, từ bữa tối nhẹ đến ly cuối ngày, kèm những lưu ý đặt chỗ giúp buổi tối của bạn diễn ra suôn sẻ.</p>

        <h3 style={{"fontSize":"19px","fontWeight":"700","marginTop":"24px"}}>1. Bắt đầu với một lounge cao cấp</h3>
        <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Khởi đầu buổi tối tại Club Lumière hoặc Sakura Lounge — không gian tinh tế, phù hợp tiếp khách đối tác. Nên đặt chỗ trước qua NightLife để nhận ưu đãi và được sắp xếp phòng VIP. Đội ngũ phục vụ tại đây phần lớn thông thạo tiếng Nhật, giúp khách cảm thấy thoải mái như ở quê nhà.</p>

        <h3 style={{"fontSize":"19px","fontWeight":"700","marginTop":"24px"}}>2. Lưu ý về giá &amp; đặt chỗ</h3>
        <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Bảng giá trên trang chỉ mang tính tham khảo. Mọi đặt chỗ được Admin điều phối trực tiếp với quán, và bạn có thể dùng mã giảm giá theo hạng thành viên. Với khách đi nhóm, hãy đặt sớm vào cuối tuần vì phòng VIP thường kín chỗ trước 20:00.</p>

        <h3 style={{"fontSize":"19px","fontWeight":"700","marginTop":"24px"}}>3. Khép lại đêm muộn</h3>
        <p style={{"fontSize":"14.5px","lineHeight":"1.85","color":"#3a384a","marginTop":"10px"}}>Sau lounge, một quán ăn khuya hoặc spa thư giãn là lựa chọn lý tưởng để kết thúc buổi tối. Nhiều cơ sở quanh Tây Hồ mở đến 02:00, và bạn có thể tích điểm cho mỗi hóa đơn để đổi ưu đãi cho lần ghé tiếp theo.</p>

        <div style={{"marginTop":"24px","background":"#faf7ff","border":"1px solid #ece4fb","borderRadius":"14px","padding":"16px 18px","display":"flex","alignItems":"center","gap":"13px"}}><img src="/icons/huong-dan-lay-ma.svg" style={{"width":"28px","height":"28px","flex":"none","display":"inline-block"}} alt="" /><div style={{"fontSize":"13px","color":"#5b5870","lineHeight":"1.6"}}>Mẹo: đăng nhập hội viên để nhận giảm tới 10% và tích điểm cho mỗi hóa đơn — xem ngay <a href="/uu-dai" style={{"color":"#6d28d9","fontWeight":"600"}}>trang Ưu đãi</a>.</div></div>
      </div>

      {/* SIDEBAR */}
      <div style={{"width":"300px","flex":"none","display":"flex","flexDirection":"column","gap":"16px"}}>
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"16px","padding":"18px","flex":"1"}}>
          <div style={{"fontWeight":"700","fontSize":"15px","marginBottom":"12px"}}>Bài liên quan</div>
          <div style={{"display":"flex","flexDirection":"column","gap":"14px"}}>
            <a href="/blog-chi-tiet" className="related" style={{"display":"flex","gap":"11px","alignItems":"center"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)"}}></span><div className="rt" style={{"fontSize":"13px","fontWeight":"600","lineHeight":"1.35","transition":"color .14s"}}>Văn hoá karaoke Nhật tại Hà Nội</div></a>
            <a href="/blog-chi-tiet" className="related" style={{"display":"flex","gap":"11px","alignItems":"center"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)"}}></span><div className="rt" style={{"fontSize":"13px","fontWeight":"600","lineHeight":"1.35","transition":"color .14s"}}>Bản đồ Quận 1 về đêm cho khách Nhật</div></a>
            <a href="/blog-chi-tiet" className="related" style={{"display":"flex","gap":"11px","alignItems":"center"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)"}}></span><div className="rt" style={{"fontSize":"13px","fontWeight":"600","lineHeight":"1.35","transition":"color .14s"}}>5 mẹo đặt bàn nhanh cuối tuần</div></a>
            <a href="/blog-chi-tiet" className="related" style={{"display":"flex","gap":"11px","alignItems":"center"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#3a8fb0,#2d5fae)"}}></span><div className="rt" style={{"fontSize":"13px","fontWeight":"600","lineHeight":"1.35","transition":"color .14s"}}>Top 10 Lounge sang trọng tại Hà Nội</div></a>
            <a href="/blog-chi-tiet" className="related" style={{"display":"flex","gap":"11px","alignItems":"center"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#c0246a,#fce4ef)"}}></span><div className="rt" style={{"fontSize":"13px","fontWeight":"600","lineHeight":"1.35","transition":"color .14s"}}>Review Club Lumière chi tiết</div></a>
            <a href="/blog-chi-tiet" className="related" style={{"display":"flex","gap":"11px","alignItems":"center"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1542314831-c6a4d14eff40?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#b06a00,#fdefd6)"}}></span><div className="rt" style={{"fontSize":"13px","fontWeight":"600","lineHeight":"1.35","transition":"color .14s"}}>Cách nhận biết quán pub chuẩn gu Nhật</div></a>
            <a href="/blog-chi-tiet" className="related" style={{"display":"flex","gap":"11px","alignItems":"center"}}><span style={{"width":"54px","height":"54px","borderRadius":"10px","flex":"none","background":"url('https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=70') center/cover,linear-gradient(140deg,#6d28d9,#3a1f6e)"}}></span><div className="rt" style={{"fontSize":"13px","fontWeight":"600","lineHeight":"1.35","transition":"color .14s"}}>Trải nghiệm văn hoá Izakaya về đêm</div></a>
          </div>
        </div>

        <a href="/chi-tiet-quan" className="card" style={{"borderRadius":"16px","overflow":"hidden","background":"url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=720&q=70') center/cover,linear-gradient(140deg,#6d28d9,#3a1f6e)","padding":"22px","color":"#fff","display":"block"}}><div style={{"fontSize":"11px","letterSpacing":".14em","textTransform":"uppercase","color":"#d9c9f7","fontWeight":"700"}}>Quảng cáo</div><div style={{"fontSize":"18px","fontWeight":"800","marginTop":"8px","lineHeight":"1.25"}}>Club Lumière — ưu đãi −30% cuối tuần</div><div className="btn" style={{"marginTop":"14px","background":"#fff","color":"#6d28d9","textAlign":"center","borderRadius":"10px","padding":"11px","fontWeight":"700","fontSize":"13px"}}>Xem ngay</div></a>
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
  
