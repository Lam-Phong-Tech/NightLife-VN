
  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    const menu: any[] = Array(5).fill({
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
    const name = 'Khách lẻ';
    const phone = '—';
    const tier: any = undefined;
    const points: any = undefined;
    const need: any = undefined;
    const nextTier: any = undefined;

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
    <div style={{"padding":"14px 18px","background":"#fff"}}>
      <div style={{"background":"linear-gradient(135deg,#6d28d9,#3a1f6e)","borderRadius":"16px","padding":"18px","color":"#fff"}}>
        <div style={{"display":"flex","alignItems":"center","gap":"12px"}}><span style={{"width":"50px","height":"50px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70') center/cover","border":"2px solid rgba(255,255,255,.5)"}}></span><div style={{"flex":"1"}}><div style={{"fontSize":"16px","fontWeight":"800"}}>{name}</div><div style={{"fontSize":"11.5px","color":"#e7d9ff"}}>{phone}</div></div><span style={{"fontSize":"10px","fontWeight":"700","background":"#ffd24d","color":"#5a3d00","borderRadius":"9px","padding":"4px 9px"}}>Hạng {tier}</span></div>
        <div style={{"marginTop":"14px","background":"rgba(255,255,255,.14)","borderRadius":"11px","padding":"12px"}}><div style={{"display":"flex","justifyContent":"space-between","fontSize":"12px"}}><span style={{"color":"#e7d9ff"}}>Điểm thưởng</span><span style={{"fontWeight":"800"}}>{points}</span></div><div style={{"height":"6px","background":"rgba(255,255,255,.25)","borderRadius":"3px","marginTop":"8px"}}><div style={{"width":"62%","height":"100%","background":"#ffd24d","borderRadius":"3px"}}></div></div><div style={{"fontSize":"10.5px","color":"#e7d9ff","marginTop":"6px"}}>Cần thêm {need} điểm lên hạng {nextTier}</div></div>
      </div>
    </div>

    <div style={{"padding":"0 18px","display":"flex","flexDirection":"column"}}>
      {menu?.map((m, index) => (<React.Fragment key={index}>
        <a href={m.href} style={{"display":"flex","alignItems":"center","gap":"12px","padding":"13px 4px","borderBottom":"1px solid #ececec"}}><span style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#f1ebff","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><img src={m.icon} style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span><div style={{"flex":"1"}}><div style={{"fontSize":"13.5px","fontWeight":"600"}}>{m.title}</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"1px"}}>{m.sub}</div></div><img src="https://img.icons8.com/ios/100/B6B3C0/chevron-right.png" style={{"width":"15px","height":"15px","display":"inline-block"}} alt="" /></a>
      </React.Fragment>))}
      <a href="/dang-nhap" style={{"display":"flex","alignItems":"center","gap":"12px","padding":"14px 4px","color":"#b03a4a"}}><span style={{"width":"36px","height":"36px","borderRadius":"10px","background":"#fbe4e7","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><img src="https://img.icons8.com/ios/100/B03A4A/exit.png" style={{"width":"18px","height":"18px","display":"inline-block"}} alt="" /></span><div style={{"flex":"1","fontSize":"13.5px","fontWeight":"600"}}>Đăng xuất</div></a>
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px","marginTop":"8px"}}>
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
  body{background:#e7e5df;}
  a{text-decoration:none;color:inherit;}
  .row{transition:background .14s;cursor:pointer;}
  .row:hover{background:#faf7ff;}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><span style={{"fontSize":"13px","color":"#6d28d9","fontWeight":"600"}}>{name}</span></div>
    </div>

    <div style={{"display":"flex","gap":"24px","padding":"26px 34px 34px"}}>
      {/* profile */}
      <div style={{"width":"360px","flex":"none"}}>
        <div style={{"background":"linear-gradient(135deg,#6d28d9,#3a1f6e)","borderRadius":"18px","padding":"24px","color":"#fff"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><span style={{"width":"60px","height":"60px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70') center/cover","border":"2px solid rgba(255,255,255,.5)"}}></span><div><div style={{"fontSize":"18px","fontWeight":"800"}}>{name}</div><div style={{"fontSize":"12.5px","color":"#e7d9ff","marginTop":"2px"}}>{phone}</div></div><span style={{"marginLeft":"auto","fontSize":"11px","fontWeight":"700","background":"#ffd24d","color":"#5a3d00","borderRadius":"10px","padding":"5px 11px"}}>Hạng {tier}</span></div>
          <div style={{"marginTop":"18px","background":"rgba(255,255,255,.14)","borderRadius":"12px","padding":"14px"}}>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","fontSize":"12.5px"}}><span style={{"color":"#e7d9ff"}}>Điểm thưởng</span><span style={{"fontWeight":"800","fontSize":"16px"}}>{points}</span></div>
            <div style={{"height":"6px","background":"rgba(255,255,255,.25)","borderRadius":"3px","marginTop":"10px"}}><div style={{"width":"62%","height":"100%","background":"#ffd24d","borderRadius":"3px"}}></div></div>
            <div style={{"fontSize":"11px","color":"#e7d9ff","marginTop":"7px"}}>Cần thêm <b style={{"color":"#fff"}}>{need} điểm</b> để lên hạng {nextTier}</div>
          </div>
        </div>
        <div style={{"marginTop":"16px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"16px","display":"grid","gridTemplateColumns":"1fr 1fr 1fr","gap":"10px","textAlign":"center"}}>
          <div><div style={{"fontSize":"20px","fontWeight":"800","color":"#6d28d9"}}>12</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Lượt đặt</div></div>
          <div><div style={{"fontSize":"20px","fontWeight":"800","color":"#6d28d9"}}>3</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Mã đang giữ</div></div>
          <div><div style={{"fontSize":"20px","fontWeight":"800","color":"#6d28d9"}}>8</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Yêu thích</div></div>
        </div>
      </div>

      {/* menu */}
      <div style={{"flex":"1","background":"#fff","border":"1px solid #ececec","borderRadius":"16px","overflow":"hidden"}}>
        {menu?.map((m, index) => (<React.Fragment key={index}>
          <a href={m.href} className="row" style={{"display":"flex","alignItems":"center","gap":"14px","padding":"16px 20px","borderBottom":"1px solid #f3f2f5"}}>
            <span style={{"width":"38px","height":"38px","borderRadius":"10px","background":"#f1ebff","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><img src={m.icon} style={{"width":"19px","height":"19px","display":"inline-block"}} alt="" /></span>
            <div style={{"flex":"1"}}><div style={{"fontSize":"14px","fontWeight":"600"}}>{m.title}</div><div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"2px"}}>{m.sub}</div></div>
            <img src="https://img.icons8.com/ios/100/B6B3C0/chevron-right.png" style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" />
          </a>
        </React.Fragment>))}
        <a href="/dang-nhap" className="row" style={{"display":"flex","alignItems":"center","gap":"14px","padding":"16px 20px","color":"#b03a4a"}}><span style={{"width":"38px","height":"38px","borderRadius":"10px","background":"#fbe4e7","display":"flex","alignItems":"center","justifyContent":"center","flex":"none"}}><img src="https://img.icons8.com/ios/100/B03A4A/exit.png" style={{"width":"19px","height":"19px","display":"inline-block"}} alt="" /></span><div style={{"flex":"1","fontSize":"14px","fontWeight":"600"}}>Đăng xuất</div></a>
      </div>
    </div>
  </div>
</div>
</>


</div>
      </React.Fragment>
    );
  }
  