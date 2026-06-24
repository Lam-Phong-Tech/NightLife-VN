
  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    
    
    // Standalone mock variables
    const vName = 'Club Lumière';
    const vArea = 'Tây Hồ';
    const vCat = 'Bar Lounge';
    const castName = 'Rina - 21';
    const date = 'T6 - 21/06';
    const time = '21:00';
    const guests = 4;
    const name = 'Khách lẻ';
    const phone = '—';
    const coupon = 'Happy Hour -30%';
    const countdown = '22:13:56';
    const toggleSave = () => alert('Đã lưu mã ưu đãi!');
    const saveLabel = 'Lưu vào ví ưu đãi';
    const vImg = "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover";

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
    <div style={{"background":"#fff","padding":"8px 18px 12px"}}><h2 style={{"fontSize":"19px","fontWeight":"800"}}>Đặt chỗ của tôi</h2></div>

    <div style={{"padding":"0 18px"}}><div style={{"background":"#e6f7ee","border":"1px solid #c3ecd4","borderRadius":"12px","padding":"11px 13px","display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"30px","height":"30px","borderRadius":"50%","background":"#1f8a52","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><img src="https://img.icons8.com/ios-filled/100/FFFFFF/checkmark.png" style={{"width":"15px","height":"15px","display":"inline-block"}} alt="" /></span><div style={{"fontSize":"11.5px","color":"#177544","fontWeight":"600"}}>Đã gửi yêu cầu! Admin sẽ liên hệ sớm.</div></div></div>

    <div style={{"padding":"14px 18px 8px"}}>
      <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"13px"}}>
        <div style={{"display":"flex","alignItems":"center","gap":"11px"}}>
          <span style={{"width":"46px","height":"46px","borderRadius":"11px","flex":"none","background":vImg}}></span>
          <div style={{"flex":"1"}}><div style={{"fontWeight":"700","fontSize":"14px"}}>{vName}</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>{vArea} · {vCat}</div></div>
          <span style={{"fontSize":"9.5px","fontWeight":"700","color":"#6d28d9","background":"#f1ebff","borderRadius":"8px","padding":"4px 8px"}}>Mới</span>
        </div>
        <div style={{"borderTop":"1px solid #f1f0f3","marginTop":"11px","paddingTop":"11px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"9px","fontSize":"12px"}}>
          <div><span style={{"color":"#8a879a"}}>Mã: </span><b style={{"fontFamily":"monospace"}}>NL-BK-7K2A91</b></div>
          <div><span style={{"color":"#8a879a"}}>Cast: </span><b>{castName}</b></div>
          <div><span style={{"color":"#8a879a"}}>Lúc: </span><b>{date} · {time}</b></div>
          <div><span style={{"color":"#8a879a"}}>Khách: </span><b>{guests} người</b></div>
          <div style={{"gridColumn":"span 2"}}><span style={{"color":"#8a879a"}}>Người đặt: </span><b>{name} · {phone}</b></div>
        </div>
      </div>

      {/* QR */}
      <div style={{"marginTop":"11px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","overflow":"hidden"}}>
        <div style={{"background":vImg,"padding":"14px 16px","color":"#fff","position":"relative"}}><div style={{"position":"absolute","inset":"0","background":"linear-gradient(140deg,rgba(123,45,107,.82),rgba(58,31,110,.82))"}}></div><div style={{"position":"relative"}}><div style={{"fontSize":"9.5px","letterSpacing":".14em","textTransform":"uppercase","color":"#ffd0e4","fontWeight":"700"}}>Mã ưu đãi</div><div style={{"fontSize":"17px","fontWeight":"800","marginTop":"3px"}}>{coupon}</div></div></div>
        <div style={{"padding":"14px","textAlign":"center"}}>
          <div style={{"width":"140px","height":"140px","margin":"0 auto","border":"1px solid #ececec","borderRadius":"12px","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/300/000000/qr-code.png" style={{"width":"116px","height":"116px","display":"inline-block"}} alt="QR" /></div>
          <div style={{"fontFamily":"monospace","fontSize":"12.5px","letterSpacing":".14em","fontWeight":"700","marginTop":"10px"}}>NL-HH30-7K2A</div>
          <div style={{"display":"inline-flex","alignItems":"center","gap":"6px","marginTop":"9px","background":"#f1ebff","color":"#6d28d9","borderRadius":"16px","padding":"6px 12px","fontSize":"11px","fontWeight":"600"}}><img src="https://img.icons8.com/fluency/96/clock.png" style={{"width":"13px","height":"13px","display":"inline-block"}} alt="" />Còn {countdown}</div>
        </div>
      </div>

      <div className="btn" onClick={toggleSave} style={{"marginTop":"11px","borderRadius":"12px","padding":"13px","textAlign":"center","fontWeight":"700","fontSize":"14px","background":"#6d28d9","color":"#fff"}}>{saveLabel}</div>
      <a href="/" className="btn" style={{"display":"block","marginTop":"9px","border":"1px solid #d6d3de","color":"#6d28d9","textAlign":"center","borderRadius":"12px","padding":"12px","fontWeight":"600","fontSize":"13.5px","background":"#fff"}}>Về trang chủ</a>
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px","marginTop":"10px"}}>
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
      <a href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></a>
      <a href="/xac-nhan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/calendar.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Đặt chỗ</span></a>
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
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><span style={{"fontSize":"13px","color":"#5b5870"}}>Tài khoản</span></div>
    </div>

    <div style={{"padding":"26px 34px 0"}}>
      <div style={{"background":"#e6f7ee","border":"1px solid #c3ecd4","borderRadius":"14px","padding":"16px 18px","display":"flex","alignItems":"center","gap":"13px"}}>
        <span style={{"width":"40px","height":"40px","borderRadius":"50%","background":"#1f8a52","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><img src="https://img.icons8.com/ios-filled/100/FFFFFF/checkmark.png" style={{"width":"20px","height":"20px","display":"inline-block"}} alt="" /></span>
        <div><div style={{"fontWeight":"700","fontSize":"15px","color":"#177544"}}>Đã gửi yêu cầu đặt chỗ!</div><div style={{"fontSize":"12.5px","color":"#3a7a59","marginTop":"2px"}}>Admin sẽ liên hệ xác nhận sớm. Bạn có thể hủy trước giờ hẹn tối thiểu 1 giờ.</div></div>
      </div>
    </div>

    <div style={{"display":"flex","gap":"24px","padding":"22px 34px 32px"}}>
      <div style={{"flex":"1"}}>
        <h2 style={{"fontSize":"22px","fontWeight":"800"}}>Chi tiết yêu cầu</h2>
        <div style={{"marginTop":"14px","background":"#fff","border":"1px solid #ececec","borderRadius":"16px","overflow":"hidden"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"14px","padding":"16px","borderBottom":"1px solid #f1f0f3"}}>
            <span style={{"width":"54px","height":"54px","borderRadius":"13px","flex":"none","background":vImg}}></span>
            <div style={{"flex":"1"}}><div style={{"fontWeight":"700","fontSize":"16px"}}>{vName}</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"2px"}}>{vArea}, Hà Nội · {vCat}</div></div>
            <span style={{"fontSize":"11.5px","fontWeight":"700","color":"#6d28d9","background":"#f1ebff","borderRadius":"10px","padding":"5px 11px"}}>Mới · chờ xác nhận</span>
          </div>
          <div style={{"padding":"16px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px","fontSize":"13.5px"}}>
            <div><div style={{"color":"#8a879a","fontSize":"12px"}}>Mã đặt chỗ</div><div style={{"fontWeight":"700","marginTop":"3px","fontFamily":"monospace","letterSpacing":".06em"}}>NL-BK-7K2A91</div></div>
            <div><div style={{"color":"#8a879a","fontSize":"12px"}}>Cast tham chiếu</div><div style={{"fontWeight":"600","marginTop":"3px"}}>{castName}</div></div>
            <div><div style={{"color":"#8a879a","fontSize":"12px"}}>Thời gian</div><div style={{"fontWeight":"600","marginTop":"3px"}}>{date} · {time}</div></div>
            <div><div style={{"color":"#8a879a","fontSize":"12px"}}>Số khách</div><div style={{"fontWeight":"600","marginTop":"3px"}}>{guests} người</div></div>
            <div><div style={{"color":"#8a879a","fontSize":"12px"}}>Người đặt</div><div style={{"fontWeight":"600","marginTop":"3px"}}>{name} · {phone}</div></div>
            <div><div style={{"color":"#8a879a","fontSize":"12px"}}>Ưu đãi áp dụng</div><div style={{"fontWeight":"700","marginTop":"3px","color":"#6d28d9"}}>{coupon}</div></div>
          </div>
        </div>

        <div style={{"marginTop":"18px","background":"#faf7ff","border":"1px solid #ece4fb","borderRadius":"14px","padding":"16px 18px","fontSize":"13px","color":"#5b5870","lineHeight":"1.7"}}>
          <b style={{"color":"#1f1d29"}}>Bước tiếp theo:</b> Giữ mã ưu đãi bên phải, đưa cho nhân viên quán quét khi tới nơi để được giảm giá. Theo dõi trạng thái trong mục <b style={{"color":"#6d28d9"}}>Đặt chỗ</b>.
        </div>

        <div style={{"display":"flex","gap":"12px","marginTop":"18px"}}>
          <a href="/" className="btn" style={{"flex":"1","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"12px","padding":"14px","fontWeight":"700","fontSize":"14px"}}>Về trang chủ</a>
          <a href="/danh-sach-quan" className="btn" style={{"flex":"1","border":"1px solid #d6d3de","color":"#6d28d9","textAlign":"center","borderRadius":"12px","padding":"14px","fontWeight":"600","fontSize":"14px","background":"#fff"}}>Tìm quán khác</a>
        </div>
      </div>

      {/* QR coupon */}
      <div style={{"width":"320px","flex":"none"}}>
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"18px","overflow":"hidden","boxShadow":"0 6px 20px rgba(40,20,60,.07)"}}>
          <div style={{"background":vImg,"padding":"20px","color":"#fff","position":"relative"}}>
            <div style={{"position":"absolute","inset":"0","background":"linear-gradient(140deg,rgba(123,45,107,.82),rgba(58,31,110,.82))"}}></div>
            <div style={{"position":"relative"}}>
              <div style={{"fontSize":"11px","letterSpacing":".14em","textTransform":"uppercase","color":"#ffd0e4","fontWeight":"700"}}>Mã ưu đãi</div>
              <div style={{"fontSize":"21px","fontWeight":"800","marginTop":"5px"}}>{coupon}</div>
              <div style={{"fontSize":"12px","color":"#f0e6f4","marginTop":"3px"}}>{vName} · {vArea}</div>
            </div>
          </div>
          <div style={{"padding":"20px","textAlign":"center"}}>
            <div style={{"width":"180px","height":"180px","margin":"0 auto","border":"1px solid #ececec","borderRadius":"14px","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/300/000000/qr-code.png" style={{"width":"150px","height":"150px","display":"inline-block"}} alt="QR" /></div>
            <div style={{"fontFamily":"monospace","fontSize":"14px","letterSpacing":".16em","fontWeight":"700","marginTop":"12px"}}>NL-HH30-7K2A</div>
            <div style={{"display":"inline-flex","alignItems":"center","gap":"7px","marginTop":"11px","background":"#f1ebff","color":"#6d28d9","borderRadius":"18px","padding":"7px 14px","fontSize":"12px","fontWeight":"600"}}><img src="https://img.icons8.com/fluency/96/clock.png" style={{"width":"15px","height":"15px","display":"inline-block"}} alt="" />Còn {countdown} · Đang giữ chỗ</div>
            <div onClick={toggleSave} className="btn" style={{"marginTop":"14px","borderRadius":"11px","padding":"12px","fontWeight":"700","fontSize":"14px","background":"#6d28d9","color":"#fff"}}>{saveLabel}</div>
          </div>
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
  