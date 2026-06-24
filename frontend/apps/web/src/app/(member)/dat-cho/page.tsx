/* eslint-disable */

  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    const couponItems: any[] = [
          { label: 'Happy Hour −30%', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '5px 12px', fontWeight: 600, fontSize: '12px' } },
          { label: 'Combo VIP 2+1', style: { background: '#fff', color: '#5b5870', border: '1px solid #ececec', borderRadius: '16px', padding: '4px 12px', fontWeight: 600, fontSize: '12px' } },
          { label: 'Welcome −8%', style: { background: '#fff', color: '#5b5870', border: '1px solid #ececec', borderRadius: '16px', padding: '4px 12px', fontWeight: 600, fontSize: '12px' } },
          { label: 'Không dùng mã', style: { background: '#fff', color: '#5b5870', border: '1px solid #ececec', borderRadius: '16px', padding: '4px 12px', fontWeight: 600, fontSize: '12px' } }
        ];
    
    // Standalone mock variables
    const vName = 'Club Lumière';
    const pickGuest: any = undefined;
    const sGuest: any = { flex: 1, textAlign: 'center', background: '#f1ebff', color: '#6d28d9', borderRadius: '10px', padding: '10px 14px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' };
    const pickMember: any = undefined;
    const sMember: any = { flex: 1, textAlign: 'center', background: 'transparent', color: '#8a879a', borderRadius: '10px', padding: '10px 14px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' };
    const discountNote = 'Guest: giảm 5% · hạn mã 24 giờ. Đăng nhập để nhận tới 10%.';
    const vArea = 'Tây Hồ';
    const vCat = 'Bar Lounge';
    const castName = 'Rina - 21';
    const date = 'T6 - 21/06';
    const time = '21:00';
    const dec: any = undefined;
    const guests = 4;
    const inc: any = undefined;
    const submit = () => window.location.href = '/xac-nhan';
    const coupon = 'Happy Hour -30%';
    const discountPct = '5%';
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
  input,textarea{font-family:inherit;outline:none;}
  input:focus,textarea:focus{border-color:#6d28d9!important;}
  .hscroll{scrollbar-width:none;}
  .hscroll::-webkit-scrollbar{display:none;}
  .btn{cursor:pointer;transition:filter .14s;}
  .btn:active{filter:brightness(.95);}
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"margin":"0 auto","width":"100%","background":"#ffffff","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","gap":"12px","borderBottom":"1px solid #ececec"}}><a href="/chi-tiet-quan" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</a><span style={{"fontWeight":"800","fontSize":"16px"}}>Đặt chỗ</span></div>

    <div style={{"padding":"14px 18px"}}>
      <div style={{"border":"1px solid #ececec","borderRadius":"12px","padding":"11px","display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"38px","height":"38px","borderRadius":"9px","background":vImg,"flex":"none"}}></span><div><div style={{"fontSize":"13.5px","fontWeight":"600"}}>{vName}</div><div style={{"fontSize":"11px","color":"#8a879a"}}>{vArea} · Cast: {castName}</div></div></div>

      <div style={{"display":"flex","gap":"6px","background":"#f3f2f5","borderRadius":"12px","padding":"4px","marginTop":"12px"}}>
        <div onClick={pickGuest} style={sGuest}>Guest</div>
        <div onClick={pickMember} style={sMember}>Hội viên</div>
      </div>
      <div style={{"marginTop":"10px","fontSize":"11.5px","color":"#6d28d9","background":"#f1ebff","borderRadius":"9px","padding":"8px 11px"}}>{discountNote}</div>

      <div style={{"display":"flex","flexDirection":"column","gap":"11px","marginTop":"14px"}}>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Họ tên</label><input id="bk-name" placeholder="Nguyễn Văn A" style={{"marginTop":"5px","width":"100%","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#1f1d29"}} /></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Số điện thoại</label><input id="bk-phone" placeholder="0912 345 678" style={{"marginTop":"5px","width":"100%","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#1f1d29"}} /></div>
        <div style={{"display":"flex","gap":"10px"}}>
          <div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Ngày</label><div style={{"marginTop":"5px","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"12px","color":"#3a384a"}}>{date}</div></div>
          <div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Giờ</label><div style={{"marginTop":"5px","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"12px","color":"#3a384a"}}>{time}</div></div>
          <div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Số người</label><div style={{"marginTop":"5px","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"7px 8px","fontSize":"12px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span className="btn" onClick={dec} style={{"width":"24px","height":"24px","borderRadius":"7px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800"}}>−</span><span style={{"fontWeight":"700"}}>{guests}</span><span className="btn" onClick={inc} style={{"width":"24px","height":"24px","borderRadius":"7px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800"}}>+</span></div></div>
        </div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Mã giảm giá</label><div className="hscroll" style={{"marginTop":"5px","display":"flex","gap":"7px","overflowX":"auto"}}>{couponItems?.map((c, index) => (<React.Fragment key={index}><span className="btn" onClick={c.pick} style={c.style}>{c.label}</span></React.Fragment>))}</div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Ghi chú</label><textarea id="bk-note" placeholder="Yêu cầu phòng VIP, nhân viên nói tiếng Nhật…" style={{"marginTop":"5px","width":"100%","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#1f1d29","minHeight":"54px","resize":"vertical"}}></textarea></div>
      </div>
    </div>

    <div style={{"background":"#fff","borderTop":"1px solid #ececec","padding":"13px 18px 20px","display":"flex","alignItems":"center","gap":"12px"}}>
      <div><div style={{"fontSize":"11px","color":"#8a879a"}}>Ưu đãi</div><div style={{"fontSize":"16px","fontWeight":"800","color":"#6d28d9"}}>{discountPct}</div></div>
      <div className="btn" onClick={submit} style={{"flex":"1","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"12px","padding":"14px","fontWeight":"700","fontSize":"14px"}}>Gửi yêu cầu</div>
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
  input,textarea{font-family:inherit;outline:none;}
  input:focus,textarea:focus{border-color:#6d28d9!important;}
  .btn{transition:filter .14s ease, transform .12s ease;cursor:pointer;}
  .btn:hover{filter:brightness(1.06);transform:translateY(-1px);}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#ffffff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>
    <div style={{"padding":"18px 34px 0","fontSize":"12.5px","color":"#8a879a"}}><a href="/" className="lk">Trang chủ</a> › <a href="/chi-tiet-quan" className="lk">{vName}</a> › <span style={{"color":"#1f1d29"}}>Đặt chỗ</span></div>

    <div style={{"display":"flex","gap":"24px","padding":"20px 34px 32px"}}>
      {/* form */}
      <div style={{"flex":"1"}}>
        <h2 style={{"fontSize":"24px","fontWeight":"800"}}>Đặt chỗ</h2>
        <p style={{"fontSize":"13.5px","color":"#5b5870","marginTop":"6px"}}>Gửi yêu cầu — Admin sẽ liên hệ xác nhận với bạn &amp; quán. Không thu cọc / thanh toán online.</p>

        <div style={{"display":"flex","gap":"8px","background":"#f3f2f5","borderRadius":"12px","padding":"4px","marginTop":"18px","maxWidth":"380px"}}>
          <div onClick={pickGuest} style={sGuest}>Đặt nhanh (Guest)</div>
          <div onClick={pickMember} style={sMember}>Đăng nhập hội viên</div>
        </div>
        <div style={{"marginTop":"10px","fontSize":"12.5px","color":"#6d28d9","background":"#f1ebff","borderRadius":"10px","padding":"10px 14px","display":"flex","alignItems":"center","gap":"8px"}}><img src="https://img.icons8.com/fluency/96/gift.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" />{discountNote}</div>

        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px","marginTop":"18px"}}>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Quán</label><div style={{"marginTop":"7px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"11px 13px","display":"flex","alignItems":"center","gap":"11px"}}><span style={{"width":"36px","height":"36px","borderRadius":"9px","background":vImg,"flex":"none"}}></span><div><div style={{"fontSize":"13.5px","fontWeight":"600"}}>{vName}</div><div style={{"fontSize":"11.5px","color":"#8a879a"}}>{vArea} · {vCat}</div></div></div></div>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Cast tham chiếu (nếu đặt theo cast)</label><div style={{"marginTop":"7px","border":"1px dashed #d9c9f7","borderRadius":"11px","padding":"11px 13px","display":"flex","alignItems":"center","gap":"10px","background":"#faf7ff"}}><span style={{"width":"30px","height":"30px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=70') center/cover","flex":"none"}}></span><span style={{"fontSize":"13px","fontWeight":"600","color":"#6d28d9"}}>{castName}</span><span style={{"marginLeft":"auto","fontSize":"12px","color":"#8a879a"}}>Bỏ chọn ✕</span></div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Họ tên</label><input id="bk-name" placeholder="Nguyễn Văn A" style={{"marginTop":"7px","width":"100%","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#1f1d29"}} /></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Số điện thoại</label><input id="bk-phone" placeholder="0912 345 678" style={{"marginTop":"7px","width":"100%","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#1f1d29"}} /></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Ngày</label><div style={{"marginTop":"7px","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","gap":"9px"}}><img src="https://img.icons8.com/fluency/96/calendar.png" style={{"width":"17px","height":"17px","display":"inline-block"}} alt="" />{date}</div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Khung giờ</label><div style={{"marginTop":"7px","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","gap":"9px"}}><img src="https://img.icons8.com/fluency/96/clock.png" style={{"width":"17px","height":"17px","display":"inline-block"}} alt="" />{time}</div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Số người</label><div style={{"marginTop":"7px","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"8px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span className="btn" onClick={dec} style={{"width":"30px","height":"30px","borderRadius":"8px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"17px"}}>−</span><span style={{"fontWeight":"600"}}>{guests} người</span><span className="btn" onClick={inc} style={{"width":"30px","height":"30px","borderRadius":"8px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"17px"}}>+</span></div></div>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Mã giảm giá</label><div style={{"marginTop":"7px","display":"flex","gap":"8px","flexWrap":"wrap"}}>{couponItems?.map((c, index) => (<React.Fragment key={index}><span onClick={c.pick} style={c.style}>{c.label}</span></React.Fragment>))}</div></div>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Ghi chú</label><textarea id="bk-note" placeholder="Yêu cầu phòng VIP, có nhân viên nói tiếng Nhật…" style={{"marginTop":"7px","width":"100%","background":"#ffffff","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#1f1d29","minHeight":"64px","resize":"vertical"}}></textarea></div>
        </div>
        <div onClick={submit} className="btn" style={{"marginTop":"18px","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"12px","padding":"14px","fontWeight":"700","fontSize":"15px"}}>Gửi yêu cầu đặt chỗ</div>
        <div style={{"marginTop":"10px","fontSize":"12px","color":"#8a879a","textAlign":"center"}}>Yêu cầu sẽ gửi tới Admin qua Telegram để điều phối với quán.</div>
      </div>

      {/* summary */}
      <div style={{"width":"300px","flex":"none"}}>
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"16px","padding":"20px","boxShadow":"0 6px 20px rgba(40,20,60,.07)","position":"sticky","top":"20px"}}>
          <div style={{"fontWeight":"700","fontSize":"15px"}}>Tóm tắt</div>
          <div style={{"marginTop":"14px","display":"flex","flexDirection":"column","gap":"10px","fontSize":"13px","color":"#3a384a"}}>
            <div style={{"display":"flex","justifyContent":"space-between"}}><span style={{"color":"#8a879a"}}>Quán</span><span style={{"fontWeight":"600"}}>{vName}</span></div>
            <div style={{"display":"flex","justifyContent":"space-between"}}><span style={{"color":"#8a879a"}}>Cast</span><span style={{"fontWeight":"600"}}>{castName}</span></div>
            <div style={{"display":"flex","justifyContent":"space-between"}}><span style={{"color":"#8a879a"}}>Thời gian</span><span style={{"fontWeight":"600"}}>{date} · {time}</span></div>
            <div style={{"display":"flex","justifyContent":"space-between"}}><span style={{"color":"#8a879a"}}>Số người</span><span style={{"fontWeight":"600"}}>{guests}</span></div>
            <div style={{"display":"flex","justifyContent":"space-between"}}><span style={{"color":"#8a879a"}}>Mã giảm</span><span style={{"fontWeight":"600"}}>{coupon}</span></div>
          </div>
          <div style={{"height":"1px","background":"#ececec","margin":"14px 0"}}></div>
          <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center"}}><span style={{"fontSize":"13px","color":"#8a879a"}}>Ưu đãi áp dụng</span><span style={{"fontSize":"15px","fontWeight":"800","color":"#6d28d9"}}>{discountPct}</span></div>
          <div style={{"marginTop":"14px","fontSize":"12px","color":"#8a879a","lineHeight":"1.6"}}>Giá hiển thị tại quán chỉ để tham khảo — không đặt món/thanh toán trên web.</div>
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
  
