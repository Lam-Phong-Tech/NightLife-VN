/* eslint-disable */

  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    const faqs: any[] = Array(5).fill({
        name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover",
        grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)', price: '1.2tr', tag: '-20%',
        label: 'Tất cả', style: { background: '#f3f2f5', color: '#5b5870' }, date: '12/10',
        time: '21:00', code: 'NIGHT10', st: 'Hoàn tất',
        favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png',
        favIconDark: 'https://img.icons8.com/ios/100/1f1d29/like.png',
        mainBg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover",
        open: () => window.location.href = '/chi-tiet-quan'
      });
    
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

    {/* status bar */}
    {/* header */}
    <div style={{"background":"#fff","padding":"8px 18px 14px","display":"flex","alignItems":"center","gap":"12px"}}>
      <a href="/" style={{"width":"34px","height":"34px","borderRadius":"10px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}>
        <img src="https://img.icons8.com/ios/100/1f1d29/left.png" style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" />
      </a>
      <div>
        <div style={{"fontWeight":"800","fontSize":"17px"}}>Hướng dẫn sử dụng</div>
        <div style={{"fontSize":"11px","color":"#8a879a","marginTop":"1px"}}>Mọi thứ bạn cần biết về nightlife.hn</div>
      </div>
    </div>

    {/* welcome banner */}
    <div style={{"padding":"14px 18px 0"}}>
      <div style={{"background":"linear-gradient(135deg,#6d28d9,#9333ea)","borderRadius":"18px","padding":"20px","color":"#fff","position":"relative","overflow":"hidden"}}>
        <div style={{"position":"absolute","right":"-20px","bottom":"-22px","width":"100px","height":"100px","borderRadius":"50%","background":"rgba(255,255,255,.07)"}}></div>
        <div style={{"position":"absolute","right":"24px","bottom":"-38px","width":"68px","height":"68px","borderRadius":"50%","background":"rgba(255,255,255,.05)"}}></div>
        <div style={{"fontSize":"11px","opacity":".75","marginBottom":"4px","fontWeight":"500"}}>Chào mừng đến với</div>
        <div style={{"fontWeight":"800","fontSize":"22px","marginBottom":"8px"}}>nightlife<span style={{"opacity":".55"}}>.hn</span></div>
        <div style={{"fontSize":"12px","opacity":".9","lineHeight":"1.6"}}>Khám phá ẩm thực &amp; vui chơi đêm — đặt chỗ, săn coupon, tích điểm mỗi ngày.</div>
      </div>
    </div>

    {/* section: 3 bước nhanh */}
    <div style={{"padding":"20px 18px 6px","fontWeight":"700","fontSize":"15px"}}>Lấy mã &amp; tích điểm — 3 bước</div>
    <div style={{"padding":"0 18px 4px","display":"flex","flexDirection":"column","gap":"9px"}}>
      <div style={{"background":"#fff","borderRadius":"14px","padding":"14px","boxShadow":"0 3px 12px rgba(40,20,60,.06)","display":"flex","alignItems":"flex-start","gap":"12px"}}>
        <span style={{"width":"32px","height":"32px","borderRadius":"10px","flex":"none","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"14px"}}>1</span>
        <div style={{"paddingTop":"3px"}}>
          <div style={{"fontWeight":"600","fontSize":"13px"}}>Chọn coupon &amp; "Lấy mã"</div>
          <div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"3px"}}>Mã được lưu tự động vào ví của bạn.</div>
        </div>
      </div>
      <div style={{"background":"#fff","borderRadius":"14px","padding":"14px","boxShadow":"0 3px 12px rgba(40,20,60,.06)","display":"flex","alignItems":"flex-start","gap":"12px"}}>
        <span style={{"width":"32px","height":"32px","borderRadius":"10px","flex":"none","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"14px"}}>2</span>
        <div style={{"paddingTop":"3px"}}>
          <div style={{"fontWeight":"600","fontSize":"13px"}}>Đặt chỗ &amp; áp mã để được giảm ngay</div>
          <div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"3px"}}>Chọn mã phù hợp ở bước thanh toán.</div>
        </div>
      </div>
      <div style={{"background":"#fff","borderRadius":"14px","padding":"14px","boxShadow":"0 3px 12px rgba(40,20,60,.06)","display":"flex","alignItems":"flex-start","gap":"12px"}}>
        <span style={{"width":"32px","height":"32px","borderRadius":"10px","flex":"none","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"14px"}}>3</span>
        <div style={{"paddingTop":"3px"}}>
          <div style={{"fontWeight":"600","fontSize":"13px"}}>Check-in để tích điểm đổi hạng cao hơn</div>
          <div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"3px"}}>Điểm tích lũy mở ra ưu đãi hạng cao hơn.</div>
        </div>
      </div>
    </div>

    <div style={{"margin":"18px 18px 0","height":"1px","background":"#ececec"}}></div>

    {/* section: đặt chỗ */}
    <div style={{"padding":"16px 18px 6px","fontWeight":"700","fontSize":"15px"}}>Đặt chỗ Online</div>
    <div style={{"padding":"0 18px 4px"}}>
      <div style={{"background":"#fff","borderRadius":"14px","padding":"14px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}>
            <span style={{"width":"38px","height":"38px","borderRadius":"11px","flex":"none","background":"#ede9fe","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/100/6D28D9/search.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span>
            <div><div style={{"fontWeight":"600","fontSize":"13px"}}>Tìm &amp; chọn quán</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Lọc theo khu vực, loại hình, mức giá.</div></div>
          </div>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}>
            <span style={{"width":"38px","height":"38px","borderRadius":"11px","flex":"none","background":"#ede9fe","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/100/6D28D9/calendar.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span>
            <div><div style={{"fontWeight":"600","fontSize":"13px"}}>Chọn ngày, giờ &amp; số người</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Đặt trước tối thiểu 2 tiếng.</div></div>
          </div>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}>
            <span style={{"width":"38px","height":"38px","borderRadius":"11px","flex":"none","background":"#ede9fe","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/100/6D28D9/checkmark.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span>
            <div><div style={{"fontWeight":"600","fontSize":"13px"}}>Xác nhận &amp; nhận SMS</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Mã xác nhận gửi về số điện thoại ngay lập tức.</div></div>
          </div>
        </div>
      </div>
    </div>

    <div style={{"margin":"18px 18px 0","height":"1px","background":"#ececec"}}></div>

    {/* section: tìm cast */}
    <div style={{"padding":"16px 18px 6px","fontWeight":"700","fontSize":"15px"}}>Tìm &amp; Đặt Cast</div>
    <div style={{"padding":"0 18px 4px"}}>
      <div style={{"background":"#fff","borderRadius":"14px","padding":"14px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"12px"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}>
            <span style={{"width":"38px","height":"38px","borderRadius":"11px","flex":"none","background":"#fef3eb","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/100/e8923a/geisha.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span>
            <div><div style={{"fontWeight":"600","fontSize":"13px"}}>Xem profile, album &amp; video</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Đánh giá đầy đủ trước khi chọn Cast.</div></div>
          </div>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}>
            <span style={{"width":"38px","height":"38px","borderRadius":"11px","flex":"none","background":"#fef3eb","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/100/e8923a/marker.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span>
            <div><div style={{"fontWeight":"600","fontSize":"13px"}}>Lọc theo khu vực</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Hà Nội · TP.HCM · Đà Nẵng · Hải Phòng.</div></div>
          </div>
          <div style={{"display":"flex","alignItems":"center","gap":"11px"}}>
            <span style={{"width":"38px","height":"38px","borderRadius":"11px","flex":"none","background":"#fef3eb","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/100/e8923a/appointment-reminders.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span>
            <div><div style={{"fontWeight":"600","fontSize":"13px"}}>Liên hệ &amp; giữ lịch trước</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Nhắn tin qua ứng dụng để xác nhận lịch.</div></div>
          </div>
        </div>
        <div style={{"marginTop":"12px","background":"#fef9f0","borderRadius":"10px","padding":"10px 12px","fontSize":"11.5px","color":"#7c6a40","lineHeight":"1.5"}}>
          <span style={{"fontWeight":"700"}}>Lưu ý:</span> Cast không hiển thị lịch rảnh. Vui lòng nhắn tin trực tiếp để xác nhận khả dụng.
        </div>
      </div>
    </div>

    <div style={{"margin":"18px 18px 0","height":"1px","background":"#ececec"}}></div>

    {/* section: hạng thành viên */}
    <div style={{"padding":"16px 18px 6px","fontWeight":"700","fontSize":"15px"}}>Hạng thành viên</div>
    <div style={{"padding":"0 18px 4px"}}>
      <div style={{"background":"#fff","borderRadius":"14px","padding":"14px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
        <div style={{"display":"flex","flexDirection":"column","gap":"8px"}}>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"10px 12px","background":"#fdf8f1","borderRadius":"10px","borderLeft":"3px solid #b45309"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
              <span style={{"width":"28px","height":"28px","borderRadius":"8px","background":"#b45309","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/ffffff/star.png" style={{"width":"14px","height":"14px","display":"inline-block"}} alt="" /></span>
              <span style={{"fontWeight":"700","fontSize":"13px","color":"#b45309"}}>Đồng</span>
            </div>
            <span style={{"fontSize":"11px","color":"#8a879a"}}>0 – 999 điểm</span>
          </div>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"10px 12px","background":"#f4f5f6","borderRadius":"10px","borderLeft":"3px solid #64748b"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
              <span style={{"width":"28px","height":"28px","borderRadius":"8px","background":"#64748b","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/ffffff/star.png" style={{"width":"14px","height":"14px","display":"inline-block"}} alt="" /></span>
              <span style={{"fontWeight":"700","fontSize":"13px","color":"#475569"}}>Bạc</span>
            </div>
            <span style={{"fontSize":"11px","color":"#8a879a"}}>1.000 – 4.999 điểm</span>
          </div>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"10px 12px","background":"#fffbeb","borderRadius":"10px","borderLeft":"3px solid #d97706"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
              <span style={{"width":"28px","height":"28px","borderRadius":"8px","background":"#d97706","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/ffffff/star.png" style={{"width":"14px","height":"14px","display":"inline-block"}} alt="" /></span>
              <span style={{"fontWeight":"700","fontSize":"13px","color":"#d97706"}}>Vàng</span>
            </div>
            <span style={{"fontSize":"11px","color":"#8a879a"}}>5.000 – 14.999 điểm</span>
          </div>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"10px 12px","background":"linear-gradient(90deg,#f5f1ff,#fce8f8)","borderRadius":"10px","borderLeft":"3px solid #6d28d9"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"9px"}}>
              <span style={{"width":"28px","height":"28px","borderRadius":"8px","background":"#6d28d9","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/ffffff/diamond.png" style={{"width":"14px","height":"14px","display":"inline-block"}} alt="" /></span>
              <span style={{"fontWeight":"700","fontSize":"13px","color":"#6d28d9"}}>Kim Cương</span>
            </div>
            <span style={{"fontSize":"11px","color":"#8a879a"}}>15.000+ điểm</span>
          </div>
        </div>
        <div style={{"marginTop":"12px","padding":"10px 12px","background":"#f5f4f2","borderRadius":"10px","fontSize":"11px","color":"#5b5870","lineHeight":"1.6"}}>
          Check-in = <b>10đ</b> &nbsp;·&nbsp; Đặt chỗ = <b>50đ</b> &nbsp;·&nbsp; Áp coupon = <b>20đ thưởng</b>
        </div>
      </div>
    </div>

    <div style={{"margin":"18px 18px 0","height":"1px","background":"#ececec"}}></div>

    {/* section: FAQ */}
    <div style={{"padding":"16px 18px 6px","fontWeight":"700","fontSize":"15px"}}>Câu hỏi thường gặp</div>
    <div style={{"padding":"0 18px 20px","display":"flex","flexDirection":"column","gap":"8px"}}>
      {faqs?.map((f, index) => (<React.Fragment key={index}>
        <div onClick={f.toggle} style={{"background":"#fff","borderRadius":"13px","padding":"14px","boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","gap":"10px"}}>
            <span style={{"fontWeight":"600","fontSize":"13px","flex":"1"}}>{f.q}</span>
            <span style={{"width":"22px","height":"22px","borderRadius":"6px","flex":"none","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"700","fontSize":"14px","color":"#6d28d9"}}>{f.icon}</span>
          </div>
          <div style={f.ansStyle}>
            <div style={{"fontSize":"12px","color":"#5b5870","marginTop":"10px","lineHeight":"1.65","paddingTop":"10px","borderTop":"1px solid #f3f2f5"}}>{f.a}</div>
          </div>
        </div>
      </React.Fragment>))}
    </div>

    {/* bottom nav */}
    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
      <a href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></a>
      <a href="/lich-su-dat-cho" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Đặt chỗ</span></a>
      <a href="/tai-khoan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/user.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Tài khoản</span></a>
    </div>
  </div>
</div>
</>


</div>
        
      </React.Fragment>
    );
  }
  
