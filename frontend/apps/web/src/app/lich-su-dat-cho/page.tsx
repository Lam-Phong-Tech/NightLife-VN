
  "use client";
  import React from 'react';

  export default function Page() {
    // Mock data arrays for loops
    const tabs: any[] = Array(5).fill({
        name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover",
        grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)', price: '1.2tr', tag: '-20%',
        label: 'Tất cả', style: { background: '#f3f2f5', color: '#5b5870' }, date: '12/10',
        time: '21:00', code: 'NIGHT10', st: 'Hoàn tất',
        favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png',
        favIconDark: 'https://img.icons8.com/ios/100/1f1d29/like.png',
        mainBg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover"
      });
    const list: any[] = [
          { rank: '1', numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Club Lumière', area: 'Tây Hồ · HN', metric: '12.4k lượt' },
          { rank: '2', numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sora Lounge', area: 'Quận 1 · HCM', metric: '11.8k lượt' },
          { rank: '3', numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'KTV Hoàng Gia', area: 'Kim Mã · HN', metric: '9.7k lượt' },
          { rank: '4', numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Diamond Bar', area: 'Quận 3 · HCM', metric: '8.9k lượt' },
          { rank: '5', numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sakura Lounge', area: 'Trúc Bạch · HN', metric: '8.1k lượt' }
        ];
    
    // Standalone mock variables
    const empty: any = undefined;

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
    <div style={{"background":"#fff","padding":"8px 18px 8px"}}><h2 style={{"fontSize":"19px","fontWeight":"800"}}>Đặt chỗ của tôi</h2></div>
    <div className="hscroll" style={{"padding":"0 18px 12px","display":"flex","gap":"7px","overflowX":"auto","background":"#fff","borderBottom":"1px solid #ececec"}}>
      {tabs?.map((t, index) => (<React.Fragment key={index}><div onClick={t.pick} style={t.style}>{t.label}</div></React.Fragment>))}
    </div>
    <div style={{"padding":"12px 18px","display":"flex","flexDirection":"column","gap":"10px"}}>
      {list?.map((b, index) => (<React.Fragment key={index}>
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"13px","padding":"11px 12px","display":"flex","alignItems":"center","gap":"11px"}}>
          <span style={{"width":"44px","height":"44px","borderRadius":"11px","flex":"none","background":b.img}}></span>
          <div style={{"flex":"1","minWidth":"0"}}><div style={{"fontWeight":"600","fontSize":"13px"}}>{b.place}</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"1px"}}>{b.meta}</div></div>
          <span style={{"fontSize":"9.5px","fontWeight":"700","borderRadius":"8px","padding":"4px 8px","color":b.color,"background":b.bg}}>{b.label}</span>
        </div>
      </React.Fragment>))}
      <><div style={{"textAlign":"center","color":"#8a879a","fontSize":"13px","padding":"28px 0"}}>Chưa có đặt chỗ ở trạng thái này.</div></>
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="trang-chu.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="danh-sach-cast.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
      <a href="uu-dai.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></a>
      <a href="lich-su-dat-cho.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/calendar.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Đặt chỗ</span></a>
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
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="trang-chu.html" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="trang-chu.html" className="lk">Trang chủ</a><a href="danh-sach-quan.html" className="lk">Tìm quán</a><a href="danh-sach-cast.html" className="lk">Cast</a><a href="xep-hang.html" className="lk">Bảng xếp hạng</a><a href="uu-dai.html" className="lk">Ưu đãi</a><span className="lk">Blog</span></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="tai-khoan.html" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Tài khoản</a></div>
    </div>

    <div style={{"padding":"26px 34px 8px"}}><h2 style={{"fontSize":"24px","fontWeight":"800"}}>Lịch sử đặt chỗ</h2></div>
    <div style={{"padding":"8px 34px 0","display":"flex","gap":"9px","flexWrap":"wrap"}}>
      {tabs?.map((t, index) => (<React.Fragment key={index}><div onClick={t.pick} style={t.style}>{t.label}</div></React.Fragment>))}
    </div>
    <div style={{"padding":"16px 34px 32px","display":"flex","flexDirection":"column","gap":"12px"}}>
      {list?.map((b, index) => (<React.Fragment key={index}>
        <div style={{"display":"flex","alignItems":"center","gap":"16px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"14px 16px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
          <span style={{"width":"50px","height":"50px","borderRadius":"12px","flex":"none","background":b.img}}></span>
          <div style={{"flex":"1"}}><div style={{"fontWeight":"600","fontSize":"15px"}}>{b.place}</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"3px"}}>{b.meta}</div></div>
          <span style={{"fontSize":"11.5px","fontWeight":"700","borderRadius":"10px","padding":"5px 11px","color":b.color,"background":b.bg}}>{b.label}</span>
          <><span style={{"fontSize":"12.5px","color":"#b03a4a","fontWeight":"600","border":"1px solid #f1cdd3","borderRadius":"10px","padding":"8px 14px","cursor":"pointer"}}>Hủy</span></>
        </div>
      </React.Fragment>))}
      <><div style={{"textAlign":"center","color":"#8a879a","fontSize":"14px","padding":"36px 0"}}>Chưa có đặt chỗ ở trạng thái này.</div></>
    </div>
  </div>
</div>
</>


</div>
      </React.Fragment>
    );
  }
  