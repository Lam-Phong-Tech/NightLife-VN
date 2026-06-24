
  "use client";
  import React from 'react';

  export default function Page() {
    // Mock data arrays for loops
    const filters: any[] = Array(5).fill({
        name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover",
        grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)', price: '1.2tr', tag: '-20%',
        label: 'Tất cả', style: { background: '#f3f2f5', color: '#5b5870' }, date: '12/10',
        time: '21:00', code: 'NIGHT10', st: 'Hoàn tất',
        favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png',
        favIconDark: 'https://img.icons8.com/ios/100/1f1d29/like.png',
        mainBg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover"
      });
    const cards: any[] = Array(5).fill({
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
    const count: any = undefined;

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
    <div style={{"background":"#fff","padding":"8px 18px 6px"}}><h2 style={{"fontSize":"19px","fontWeight":"800"}}>Tìm Cast</h2><p style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"2px"}}><b style={{"color":"#1f1d29"}}>{count}</b> cast đang hoạt động</p></div>
    <div className="hscroll" style={{"padding":"10px 18px 12px","display":"flex","gap":"7px","overflowX":"auto","background":"#fff","borderBottom":"1px solid #ececec"}}>
      {filters?.map((f, index) => (<React.Fragment key={index}><div onClick={f.pick} style={f.style}>{f.label}</div></React.Fragment>))}
    </div>

    <div style={{"padding":"14px 18px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"11px"}}>
      {cards?.map((c, index) => (<React.Fragment key={index}>
        <div onClick={c.open} style={{"borderRadius":"14px","overflow":"hidden","position":"relative","height":"200px","background":c.img,"boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
          <span onClick={c.fav} style={{"position":"absolute","top":"8px","right":"8px","width":"27px","height":"27px","borderRadius":"50%","background":"rgba(0,0,0,.3)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src={c.favIcon} style={{"width":"14px","height":"14px"}} alt="" /></span>
          <><span style={{"position":"absolute","top":"8px","left":"8px","background":"rgba(255,255,255,.92)","color":"#1f1d29","fontSize":"9px","fontWeight":"700","borderRadius":"9px","padding":"2px 7px"}}>🇯🇵 Nhật</span></>
          <div style={{"position":"absolute","bottom":"0","left":"0","right":"0","padding":"11px","background":"linear-gradient(0deg,rgba(20,8,16,.85),transparent)","color":"#fff"}}><div style={{"fontWeight":"600","fontSize":"13.5px"}}>{c.name} · {c.age}</div><div style={{"fontSize":"10px","color":"#f0dde8","marginTop":"2px"}}>{c.desc} · ★ {c.rating}</div></div>
        </div>
      </React.Fragment>))}
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="trang-chu.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="danh-sach-cast.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/fluency/96/geisha.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Cast</span></a>
      <a href="uu-dai.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></a>
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
  .card{transition:transform .16s ease, box-shadow .16s ease;cursor:pointer;}
  .card:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(40,20,60,.18);}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="trang-chu.html" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="trang-chu.html" className="lk">Trang chủ</a><a href="danh-sach-quan.html" className="lk">Tìm quán</a><a href="danh-sach-cast.html" style={{"color":"#6d28d9","fontWeight":"600"}}>Cast</a><a href="xep-hang.html" className="lk">Bảng xếp hạng</a><span className="lk">Tour</span><span className="lk">Blog</span></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="dang-nhap.html" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    <div style={{"padding":"26px 34px 6px"}}><h2 style={{"fontSize":"24px","fontWeight":"800"}}>Tìm Cast tại Hà Nội</h2><p style={{"fontSize":"13.5px","color":"#5b5870","marginTop":"6px"}}><b style={{"color":"#1f1d29"}}>{count} cast</b> đang hoạt động · cập nhật hôm nay</p></div>
    <div style={{"padding":"14px 34px 22px","display":"flex","gap":"10px","flexWrap":"wrap"}}>
      {filters?.map((f, index) => (<React.Fragment key={index}><div onClick={f.pick} style={f.style}>{f.label}</div></React.Fragment>))}
    </div>

    <div style={{"padding":"0 34px 30px","display":"grid","gridTemplateColumns":"repeat(5,1fr)","gap":"14px"}}>
      {cards?.map((c, index) => (<React.Fragment key={index}>
        <div onClick={c.open} className="card" style={{"borderRadius":"14px","overflow":"hidden","position":"relative","height":"240px","background":c.img,"boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
          <span onClick={c.fav} style={{"position":"absolute","top":"9px","right":"9px","width":"28px","height":"28px","borderRadius":"50%","background":"rgba(0,0,0,.3)","display":"flex","alignItems":"center","justifyContent":"center","cursor":"pointer"}}><img src={c.favIcon} style={{"width":"15px","height":"15px"}} alt="" /></span>
          <><span style={{"position":"absolute","top":"9px","left":"9px","background":"rgba(255,255,255,.92)","color":"#1f1d29","fontSize":"9.5px","fontWeight":"700","borderRadius":"10px","padding":"3px 8px"}}>🇯🇵 Tiếng Nhật</span></>
          <div style={{"position":"absolute","bottom":"0","left":"0","right":"0","padding":"12px","background":"linear-gradient(0deg,rgba(20,8,16,.85),transparent)","color":"#fff"}}>
            <div style={{"fontWeight":"600","fontSize":"14px"}}>{c.name} · {c.age}</div>
            <div style={{"fontSize":"10.5px","color":"#f0dde8","marginTop":"3px"}}>{c.desc} · ★ {c.rating}</div>
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
  