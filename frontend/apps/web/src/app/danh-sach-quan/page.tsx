
  "use client";
  import React from 'react';

  export default function Page() {
    // Mock data arrays for loops
    const cats: any[] = Array(5).fill({
        name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover",
        grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)', price: '1.2tr', tag: '-20%',
        label: 'Tất cả', style: { background: '#f3f2f5', color: '#5b5870' }, date: '12/10',
        time: '21:00', code: 'NIGHT10', st: 'Hoàn tất',
        favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png',
        favIconDark: 'https://img.icons8.com/ios/100/1f1d29/like.png',
        mainBg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover"
      });
    const areas: any[] = [
          { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } },
          { label: 'Hà Nội', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } },
          { label: 'TP.HCM', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } }
        ];
    const venues: any[] = Array(5).fill({
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
    const onSearch: any = undefined;
    const count: any = undefined;
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
  input{font-family:inherit;outline:none;}
  .hscroll{scrollbar-width:none;}
  .hscroll::-webkit-scrollbar{display:none;}
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"background":"#fff","padding":"8px 18px 12px","display":"flex","alignItems":"center","gap":"12px"}}><a href="trang-chu.html" style={{"fontSize":"22px","color":"#5b5870","lineHeight":"1"}}>‹</a><span style={{"fontWeight":"800","fontSize":"16px"}}>Tìm quán · Hà Nội</span></div>
    <div style={{"padding":"0 18px 12px","background":"#fff"}}><div style={{"display":"flex","alignItems":"center","gap":"9px","background":"#f3f2f5","borderRadius":"12px","padding":"11px 13px"}}><img src="https://img.icons8.com/ios/100/9A98A6/search.png" style={{"width":"16px","height":"16px"}} alt="" /><input onInput={onSearch} placeholder="Tên quán, khu vực…" style={{"flex":"1","border":"none","fontSize":"13px","color":"#1f1d29","background":"transparent"}} /></div></div>

    {/* filter chips */}
    <div className="hscroll" style={{"padding":"12px 18px 4px","display":"flex","gap":"7px","overflowX":"auto","background":"#fff"}}>
      {cats?.map((c, index) => (<React.Fragment key={index}><div onClick={c.pick} style={c.style}>{c.label}</div></React.Fragment>))}
    </div>
    <div className="hscroll" style={{"padding":"8px 18px 12px","display":"flex","gap":"7px","overflowX":"auto","background":"#fff","borderBottom":"1px solid #ececec"}}>
      {areas?.map((a, index) => (<React.Fragment key={index}><div onClick={a.pick} style={a.style}>{a.label}</div></React.Fragment>))}
    </div>

    <div style={{"padding":"12px 18px 6px","fontSize":"12.5px","color":"#5b5870"}}><b style={{"color":"#1f1d29"}}>{count} quán</b> phù hợp</div>
    <div style={{"padding":"0 18px 12px","display":"flex","flexDirection":"column","gap":"12px"}}>
      {venues?.map((v, index) => (<React.Fragment key={index}>
        <div onClick={v.open} style={{"display":"flex","gap":"12px","background":"#fff","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
          <div style={{"width":"108px","flex":"none","background":v.img,"position":"relative"}}><span onClick={v.fav} style={{"position":"absolute","top":"7px","left":"7px","width":"26px","height":"26px","borderRadius":"50%","background":"rgba(0,0,0,.28)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src={v.favIcon} style={{"width":"14px","height":"14px"}} alt="" /></span></div>
          <div style={{"padding":"11px 12px 11px 0","flex":"1","minWidth":"0"}}>
            <div style={{"display":"flex","alignItems":"center","gap":"6px"}}><span style={{"fontWeight":"600","fontSize":"14px"}}>{v.name}</span><><span style={{"fontSize":"9px","fontWeight":"700","color":v.badgeColor,"background":"#f3f2f5","borderRadius":"8px","padding":"2px 6px"}}>{v.badgeText}</span></></div>
            <div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"2px"}}>{v.area} · {v.catLabel}</div>
            <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginTop":"8px"}}><span style={{"fontSize":"12px","color":"#e8923a"}}>★ {v.rating} <span style={{"color":"#a8a5b4"}}>({v.reviews})</span></span><span style={{"fontSize":"12px","fontWeight":"600"}}>từ {v.price}</span></div>
          </div>
        </div>
      </React.Fragment>))}
      <><div style={{"textAlign":"center","color":"#8a879a","fontSize":"13px","padding":"30px 0"}}>Không có quán nào khớp bộ lọc.</div></>
    </div>

    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="trang-chu.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/search.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Tìm quán</span></div>
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
  input{font-family:inherit;outline:none;}
  .card{transition:transform .16s ease, box-shadow .16s ease;}
  .card:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(40,20,60,.14);}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    {/* header */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}>
        <a href="trang-chu.html" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a>
        <div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="trang-chu.html" className="lk">Trang chủ</a><a href="danh-sach-quan.html" style={{"color":"#6d28d9","fontWeight":"600"}}>Tìm quán</a><a href="danh-sach-cast.html" className="lk">Cast</a><a href="xep-hang.html" className="lk">Bảng xếp hạng</a><span className="lk">Tour</span><span className="lk">Blog</span></div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="../../index.html" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    {/* search bar */}
    <div style={{"padding":"20px 34px","background":"#fff","borderBottom":"1px solid #ececec","display":"flex","gap":"10px","alignItems":"center"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"8px","padding":"0 16px","height":"46px","border":"1px solid #ececec","borderRadius":"11px","color":"#6d28d9","fontSize":"14px","fontWeight":"600"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/marker.png" style={{"width":"15px","height":"15px"}} alt="" />Hà Nội</div>
      <div style={{"flex":"1","display":"flex","alignItems":"center","gap":"10px","height":"46px","padding":"0 16px","border":"1px solid #ececec","borderRadius":"11px"}}><img src="https://img.icons8.com/ios/100/9A98A6/search.png" style={{"width":"17px","height":"17px"}} alt="" /><input onInput={onSearch} placeholder="Tìm theo tên quán…" style={{"flex":"1","border":"none","fontSize":"14px","color":"#1f1d29","background":"transparent"}} /></div>
      <div style={{"display":"flex","alignItems":"center","gap":"8px","height":"46px","padding":"0 26px","background":"#6d28d9","color":"#fff","borderRadius":"11px","fontWeight":"600","fontSize":"14px"}}>Tìm</div>
    </div>

    <div style={{"display":"flex","gap":"0"}}>
      {/* filter sidebar */}
      <div style={{"width":"262px","flex":"none","background":"#fff","borderRight":"1px solid #ececec","padding":"24px"}}>
        <div style={{"fontWeight":"700","fontSize":"15px","marginBottom":"18px"}}>Bộ lọc</div>
        <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".06em","textTransform":"uppercase","marginBottom":"12px"}}>Loại hình</div>
        <div style={{"display":"flex","flexWrap":"wrap","gap":"8px","marginBottom":"24px"}}>
          {cats?.map((c, index) => (<React.Fragment key={index}><div onClick={c.pick} style={c.style}>{c.label}</div></React.Fragment>))}
        </div>
        <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".06em","textTransform":"uppercase","marginBottom":"12px"}}>Khu vực</div>
        <div style={{"display":"flex","flexWrap":"wrap","gap":"8px","marginBottom":"24px"}}>
          {areas?.map((a, index) => (<React.Fragment key={index}><div onClick={a.pick} style={a.style}>{a.label}</div></React.Fragment>))}
        </div>
        <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".06em","textTransform":"uppercase","marginBottom":"14px"}}>Đánh giá</div>
        <div style={{"display":"flex","flexDirection":"column","gap":"10px","fontSize":"13.5px","color":"#3a384a"}}>
          <div style={{"display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"18px","height":"18px","borderRadius":"50%","border":"1.5px solid #6d28d9","display":"flex","alignItems":"center","justifyContent":"center"}}><span style={{"width":"9px","height":"9px","borderRadius":"50%","background":"#6d28d9"}}></span></span><span style={{"color":"#e8923a"}}>★★★★★</span> từ 4.5</div>
          <div style={{"display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"18px","height":"18px","borderRadius":"50%","border":"1.5px solid #d6d3de"}}></span><span style={{"color":"#e8923a"}}>★★★★</span><span style={{"color":"#d8d6e0"}}>★</span> từ 4.0</div>
        </div>
      </div>

      {/* results */}
      <div style={{"flex":"1","padding":"22px 28px 30px"}}>
        <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"18px"}}>
          <div style={{"fontSize":"14px","color":"#5b5870"}}><b style={{"color":"#1f1d29"}}>{count} quán</b> phù hợp</div>
          <div style={{"fontSize":"13.5px","color":"#5b5870","border":"1px solid #ececec","borderRadius":"9px","padding":"8px 14px","background":"#fff"}}>Sắp xếp: <b style={{"color":"#1f1d29"}}>Nổi bật</b> ▾</div>
        </div>
        <div style={{"display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"16px"}}>
          {venues?.map((v, index) => (<React.Fragment key={index}>
            <div onClick={v.open} className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
              <div style={{"height":"128px","background":v.img,"position":"relative"}}>
                <><span style={{"position":"absolute","top":"10px","left":"10px","background":"#fff","color":v.badgeColor,"fontSize":"10.5px","fontWeight":"700","borderRadius":"14px","padding":"3px 9px"}}>{v.badgeText}</span></>
                <span onClick={v.fav} style={{"position":"absolute","top":"8px","right":"8px","width":"30px","height":"30px","borderRadius":"50%","background":"rgba(0,0,0,.28)","display":"flex","alignItems":"center","justifyContent":"center","cursor":"pointer"}}><img src={v.favIcon} style={{"width":"16px","height":"16px"}} alt="" /></span>
              </div>
              <div style={{"padding":"13px"}}>
                <div style={{"fontWeight":"600","fontSize":"14.5px"}}>{v.name}</div>
                <div style={{"fontSize":"12px","color":"#8a879a","marginTop":"3px"}}>{v.area} · {v.catLabel}</div>
                <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginTop":"9px"}}><span style={{"fontSize":"12.5px","color":"#e8923a"}}>★ {v.rating} <span style={{"color":"#a8a5b4"}}>({v.reviews})</span></span><span style={{"fontSize":"12.5px","color":"#1f1d29","fontWeight":"600"}}>từ {v.price}</span></div>
              </div>
            </div>
          </React.Fragment>))}
        </div>
        <><div style={{"textAlign":"center","color":"#8a879a","fontSize":"14px","padding":"40px 0"}}>Không có quán nào khớp bộ lọc. Thử bỏ bớt điều kiện.</div></>
      </div>
    </div>
  </div>
</div>
</>


</div>
      </React.Fragment>
    );
  }
  