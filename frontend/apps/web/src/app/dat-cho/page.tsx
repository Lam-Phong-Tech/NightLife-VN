
  "use client";
  import React from 'react';

  export default function Page() {
    // Mock data arrays for loops
    const couponItems: any[] = Array(5).fill({
        name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover",
        grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)', price: '1.2tr', tag: '-20%',
        label: 'Tất cả', style: { background: '#f3f2f5', color: '#5b5870' }, date: '12/10',
        time: '21:00', code: 'NIGHT10', st: 'Hoàn tất',
        favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png',
        favIconDark: 'https://img.icons8.com/ios/100/1f1d29/like.png',
        mainBg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover"
      });
    
    // Standalone mock variables
    const vName: any = undefined;
    const pickGuest: any = undefined;
    const sGuest: any = undefined;
    const pickMember: any = undefined;
    const sMember: any = undefined;
    const discountNote: any = undefined;
    const vArea: any = undefined;
    const vCat: any = undefined;
    const castName: any = undefined;
    const date: any = undefined;
    const time: any = undefined;
    const dec: any = undefined;
    const guests: any = undefined;
    const inc: any = undefined;
    const submit: any = undefined;
    const coupon: any = undefined;
    const discountPct: any = undefined;
    const vImg: any = undefined;

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

  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","gap":"12px","borderBottom":"1px solid #ececec"}}><a href="chi-tiet-quan.html" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</a><span style={{"fontWeight":"800","fontSize":"16px"}}>Đặt chỗ</span></div>

    <div style={{"padding":"14px 18px"}}>
      <div style={{"border":"1px solid #ececec","borderRadius":"12px","padding":"11px","display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"38px","height":"38px","borderRadius":"9px","background":vImg,"flex":"none"}}></span><div><div style={{"fontSize":"13.5px","fontWeight":"600"}}>{vName}</div><div style={{"fontSize":"11px","color":"#8a879a"}}>{vArea} · Cast: {castName}</div></div></div>

      <div style={{"display":"flex","gap":"6px","background":"#f3f2f5","borderRadius":"12px","padding":"4px","marginTop":"12px"}}>
        <div onClick={pickGuest} style={sGuest}>Guest</div>
        <div onClick={pickMember} style={sMember}>Hội viên</div>
      </div>
      <div style={{"marginTop":"10px","fontSize":"11.5px","color":"#6d28d9","background":"#f1ebff","borderRadius":"9px","padding":"8px 11px"}}>{discountNote}</div>

      <div style={{"display":"flex","flexDirection":"column","gap":"11px","marginTop":"14px"}}>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Họ tên</label><input id="bk-name" placeholder="Nguyễn Văn A" style={{"marginTop":"5px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#1f1d29"}} /></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Số điện thoại</label><input id="bk-phone" placeholder="0912 345 678" style={{"marginTop":"5px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#1f1d29"}} /></div>
        <div style={{"display":"flex","gap":"10px"}}>
          <div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Ngày</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"12px","color":"#3a384a"}}>{date}</div></div>
          <div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Giờ</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"12px","color":"#3a384a"}}>{time}</div></div>
          <div style={{"flex":"1"}}><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Số người</label><div style={{"marginTop":"5px","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"7px 8px","fontSize":"12px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span className="btn" onClick={dec} style={{"width":"24px","height":"24px","borderRadius":"7px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800"}}>−</span><span style={{"fontWeight":"700"}}>{guests}</span><span className="btn" onClick={inc} style={{"width":"24px","height":"24px","borderRadius":"7px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800"}}>+</span></div></div>
        </div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Mã giảm giá</label><div className="hscroll" style={{"marginTop":"5px","display":"flex","gap":"7px","overflowX":"auto"}}>{couponItems?.map((c, index) => (<React.Fragment key={index}><span className="btn" onClick={c.pick} style={c.style}>{c.label}</span></React.Fragment>))}</div></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Ghi chú</label><textarea id="bk-note" placeholder="Yêu cầu phòng VIP, nhân viên nói tiếng Nhật…" style={{"marginTop":"5px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"11px 12px","fontSize":"13px","color":"#1f1d29","minHeight":"54px","resize":"vertical"}}></textarea></div>
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

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="trang-chu.html" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="trang-chu.html" className="lk">Trang chủ</a><a href="danh-sach-quan.html" className="lk">Tìm quán</a><a href="danh-sach-cast.html" className="lk">Cast</a><a href="xep-hang.html" className="lk">Bảng xếp hạng</a><span className="lk">Tour</span><span className="lk">Blog</span></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="../../index.html" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>
    <div style={{"padding":"18px 34px 0","fontSize":"12.5px","color":"#8a879a"}}><a href="trang-chu.html" className="lk">Trang chủ</a> › <a href="chi-tiet-quan.html" className="lk">{vName}</a> › <span style={{"color":"#1f1d29"}}>Đặt chỗ</span></div>

    <div style={{"display":"flex","gap":"24px","padding":"20px 34px 32px"}}>
      {/* form */}
      <div style={{"flex":"1"}}>
        <h2 style={{"fontSize":"24px","fontWeight":"800"}}>Đặt chỗ</h2>
        <p style={{"fontSize":"13.5px","color":"#5b5870","marginTop":"6px"}}>Gửi yêu cầu — Admin sẽ liên hệ xác nhận với bạn &amp; quán. Không thu cọc / thanh toán online.</p>

        <div style={{"display":"flex","gap":"8px","background":"#f3f2f5","borderRadius":"12px","padding":"4px","marginTop":"18px","maxWidth":"380px"}}>
          <div onClick={pickGuest} style={sGuest}>Đặt nhanh (Guest)</div>
          <div onClick={pickMember} style={sMember}>Đăng nhập hội viên</div>
        </div>
        <div style={{"marginTop":"10px","fontSize":"12.5px","color":"#6d28d9","background":"#f1ebff","borderRadius":"10px","padding":"10px 14px","display":"flex","alignItems":"center","gap":"8px"}}><img src="https://img.icons8.com/fluency/96/gift.png" style={{"width":"18px","height":"18px"}} alt="" />{discountNote}</div>

        <div style={{"display":"grid","gridTemplateColumns":"1fr 1fr","gap":"14px","marginTop":"18px"}}>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Quán</label><div style={{"marginTop":"7px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"11px 13px","display":"flex","alignItems":"center","gap":"11px"}}><span style={{"width":"36px","height":"36px","borderRadius":"9px","background":vImg,"flex":"none"}}></span><div><div style={{"fontSize":"13.5px","fontWeight":"600"}}>{vName}</div><div style={{"fontSize":"11.5px","color":"#8a879a"}}>{vArea} · {vCat}</div></div></div></div>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Cast tham chiếu (nếu đặt theo cast)</label><div style={{"marginTop":"7px","border":"1px dashed #d9c9f7","borderRadius":"11px","padding":"11px 13px","display":"flex","alignItems":"center","gap":"10px","background":"#faf7ff"}}><span style={{"width":"30px","height":"30px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=70') center/cover","flex":"none"}}></span><span style={{"fontSize":"13px","fontWeight":"600","color":"#6d28d9"}}>{castName}</span><span style={{"marginLeft":"auto","fontSize":"12px","color":"#8a879a"}}>Bỏ chọn ✕</span></div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Họ tên</label><input id="bk-name" placeholder="Nguyễn Văn A" style={{"marginTop":"7px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#1f1d29"}} /></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Số điện thoại</label><input id="bk-phone" placeholder="0912 345 678" style={{"marginTop":"7px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#1f1d29"}} /></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Ngày</label><div style={{"marginTop":"7px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","gap":"9px"}}><img src="https://img.icons8.com/fluency/96/calendar.png" style={{"width":"17px","height":"17px"}} alt="" />{date}</div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Khung giờ</label><div style={{"marginTop":"7px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","gap":"9px"}}><img src="https://img.icons8.com/fluency/96/clock.png" style={{"width":"17px","height":"17px"}} alt="" />{time}</div></div>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Số người</label><div style={{"marginTop":"7px","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"8px 13px","fontSize":"13.5px","color":"#3a384a","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span className="btn" onClick={dec} style={{"width":"30px","height":"30px","borderRadius":"8px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"17px"}}>−</span><span style={{"fontWeight":"600"}}>{guests} người</span><span className="btn" onClick={inc} style={{"width":"30px","height":"30px","borderRadius":"8px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"17px"}}>+</span></div></div>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Mã giảm giá</label><div style={{"marginTop":"7px","display":"flex","gap":"8px","flexWrap":"wrap"}}>{couponItems?.map((c, index) => (<React.Fragment key={index}><span onClick={c.pick} style={c.style}>{c.label}</span></React.Fragment>))}</div></div>
          <div style={{"gridColumn":"span 2"}}><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Ghi chú</label><textarea id="bk-note" placeholder="Yêu cầu phòng VIP, có nhân viên nói tiếng Nhật…" style={{"marginTop":"7px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"12px 13px","fontSize":"13.5px","color":"#1f1d29","minHeight":"64px","resize":"vertical"}}></textarea></div>
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


</div>
      </React.Fragment>
    );
  }
  