
  "use client";
  import React from 'react';

  export default function Page() {
    // Mock data arrays for loops
    const offers: any[] = Array(5).fill({
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
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><h2 style={{"fontSize":"19px","fontWeight":"800"}}>Ưu đãi hot</h2><a href="vi-uu-dai.html" style={{"fontSize":"12px","color":"#6d28d9","fontWeight":"600"}}>Ví của tôi ›</a></div>

    <div style={{"padding":"12px 18px","display":"flex","flexDirection":"column","gap":"11px"}}>
      {offers?.map((o, index) => (<React.Fragment key={index}>
        <div style={{"background":"#fff","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","display":"flex"}}>
          <div style={{"width":"96px","flex":"none","background":o.img,"position":"relative"}}><span style={{"position":"absolute","top":"8px","left":"8px","background":"#ffd24d","color":"#5a3d00","fontSize":"12px","fontWeight":"800","borderRadius":"9px","padding":"3px 8px"}}>{o.value}</span></div>
          <div style={{"padding":"11px 12px","flex":"1"}}><div style={{"fontWeight":"700","fontSize":"13.5px"}}>{o.title}</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>{o.place}</div><div style={{"marginTop":"9px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span style={{"fontSize":"10px","color":"#c0246a","background":"#fce4ef","borderRadius":"8px","padding":"3px 8px","fontWeight":"600"}}>{o.expiry}</span><span onClick={o.take} className="btn" style={{"fontSize":"11.5px","fontWeight":"700","borderRadius":"9px","padding":"6px 12px"}}>{o.btnLabel}</span></div></div>
        </div>
      </React.Fragment>))}
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="trang-chu.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="danh-sach-cast.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
      <a href="uu-dai.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/fluency/96/gift.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Ưu đãi</span></a>
      <a href="lich-su-dat-cho.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Đặt chỗ</span></a>
      <a href="tai-khoan.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/user.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Tài khoản</span></a>
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
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="trang-chu.html" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="trang-chu.html" className="lk">Trang chủ</a><a href="danh-sach-quan.html" className="lk">Tìm quán</a><a href="danh-sach-cast.html" className="lk">Cast</a><a href="xep-hang.html" className="lk">Bảng xếp hạng</a><span style={{"color":"#6d28d9","fontWeight":"600"}}>Ưu đãi</span><span className="lk">Blog</span></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><a href="vi-uu-dai.html" className="lk" style={{"fontSize":"13px","color":"#6d28d9","fontWeight":"600"}}>Ví của tôi ›</a><a href="dang-nhap.html" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    <div style={{"padding":"26px 34px 8px"}}><h2 style={{"fontSize":"24px","fontWeight":"800"}}>Ưu đãi &amp; Sự kiện hot</h2><p style={{"fontSize":"13px","color":"#5b5870","marginTop":"5px"}}>Lấy mã miễn phí, đưa nhân viên quán quét khi tới nơi. Mã lưu trong <a href="vi-uu-dai.html" style={{"color":"#6d28d9","fontWeight":"600"}}>Ví ưu đãi</a>.</p></div>

    <div style={{"padding":"18px 34px 32px","display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"16px"}}>
      {offers?.map((o, index) => (<React.Fragment key={index}>
        <div className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
          <div style={{"height":"140px","background":o.img,"position":"relative"}}><span style={{"position":"absolute","top":"12px","left":"12px","background":"#ffd24d","color":"#5a3d00","fontSize":"17px","fontWeight":"800","borderRadius":"12px","padding":"6px 12px"}}>{o.value}</span></div>
          <div style={{"padding":"15px"}}>
            <div style={{"fontWeight":"700","fontSize":"15px"}}>{o.title}</div>
            <div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"4px"}}>{o.place}</div>
            <div style={{"marginTop":"13px","display":"flex","alignItems":"center","justifyContent":"space-between"}}>
              <span style={{"fontSize":"11.5px","color":"#c0246a","background":"#fce4ef","borderRadius":"10px","padding":"4px 9px","fontWeight":"600"}}>{o.expiry}</span>
              <span onClick={o.take} className="btn" style={{"fontSize":"13px","fontWeight":"700","borderRadius":"10px","padding":"8px 16px"}}>{o.btnLabel}</span>
            </div>
          </div>
        </div>
      </React.Fragment>))}
    </div>
  </div>
</div>
</>


</div>
      </React.Fragment>
    );
  }
  