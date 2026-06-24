
  "use client";
  import React from 'react';

  export default function Page() {
    // Mock data arrays for loops
    const filters: any[] = [
          { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Nói tiếng Nhật', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: '20-23 tuổi', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Tây Hồ', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Đánh giá cao', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } }
        ];
    const cards: any[] = [
          { name: 'Michi', age: 23, desc: 'Nói tiếng Nhật', rating: 4.9, jp: true, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0598a,#a8336b)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Yuki', age: 24, desc: 'Phong cách đẹp', rating: 4.8, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#3a9fb0,#2d6fae)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Rina', age: 21, desc: 'Trong độ tuổi 20', rating: 4.7, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Mai', age: 25, desc: 'Nói chuyện duyên', rating: 4.9, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Hana', age: 22, desc: 'Nói tiếng Nhật', rating: 4.6, jp: true, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e07a7a,#b04545)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Saki', age: 23, desc: 'Vui vẻ', rating: 4.8, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Aoi', age: 24, desc: 'Dịu dàng', rating: 4.7, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#5fae8a,#2d8a6a)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Nana', age: 22, desc: 'Hát hay', rating: 4.8, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#b06ad0,#7d3da8)", open: () => window.location.href = '/chi-tiet-cast' }
        ];
    
    // Standalone mock variables
    const count = 8;

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
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/fluency/96/geisha.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Cast</span></a>
      <a href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></a>
      <a href="/lich-su-dat-cho" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/calendar.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Đặt chỗ</span></a>
      <a href="/tai-khoan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/user.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Tài khoản</span></a>
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
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" style={{"color":"#6d28d9","fontWeight":600}}>Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
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
  