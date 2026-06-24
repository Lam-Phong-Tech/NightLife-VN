
  "use client";
  import React from 'react';

  export default function Page() {
    // Mock data arrays for loops
    const recs: any[] = Array(5).fill({
        name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover",
        grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)', price: '1.2tr', tag: '-20%',
        label: 'Tất cả', style: { background: '#f3f2f5', color: '#5b5870' }, date: '12/10',
        time: '21:00', code: 'NIGHT10', st: 'Hoàn tất',
        favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png',
        favIconDark: 'https://img.icons8.com/ios/100/1f1d29/like.png',
        mainBg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover"
      });
    const cityTabs: any[] = [
          { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } },
          { label: 'Hà Nội', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } },
          { label: 'TP.HCM', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } }
        ];
    const rankList: any[] = [
          { rank: '1', numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Club Lumière', area: 'Tây Hồ · HN', metric: '12.4k lượt' },
          { rank: '2', numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sora Lounge', area: 'Quận 1 · HCM', metric: '11.8k lượt' },
          { rank: '3', numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'KTV Hoàng Gia', area: 'Kim Mã · HN', metric: '9.7k lượt' },
          { rank: '4', numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Diamond Bar', area: 'Quận 3 · HCM', metric: '8.9k lượt' },
          { rank: '5', numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sakura Lounge', area: 'Trúc Bạch · HN', metric: '8.1k lượt' }
        ];
    const svc: any[] = [
          { name: 'Sakura Teppanyaki', area: 'Tây Hồ · Nhà hàng Nhật', price: 'từ 800K', tag: 'Đặt bàn nhanh', grad: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover" },
          { name: 'Yakitori Hanoi', area: 'Ba Đình · BBQ Nhật', price: 'từ 600K', tag: 'Mới', grad: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=480&q=70') center/cover" },
          { name: 'Sushi Lava', area: 'Quận 1 · Omakase', price: 'từ 1.2tr', tag: 'Đánh giá cao', grad: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover" },
          { name: 'Wagyu House', area: 'Hoàn Kiếm · Steak', price: 'từ 1.5tr', tag: 'Hot', grad: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=480&q=70') center/cover" }
        ];
    
    // Standalone mock variables
    const rankTitle = "Bảng xếp hạng — Quán nổi bật tháng 6/2026";
    const pickQuan: any = undefined;
    const segQuan = { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)' };
    const pickCast: any = undefined;
    const segCast = { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px' };
    const pickNhahang: any = undefined;
    const segNhahang = { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)' };
    const pickSpa: any = undefined;
    const segSpa = { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px' };
    const handleBannerScroll: any = undefined;
    const dot0: any = undefined;
    const dot1: any = undefined;
    const dot2: any = undefined;

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
    {/* header + search */}
    <div style={{"background":"#fff","padding":"8px 18px 16px"}}>
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between"}}>
        <a href="trang-chu.html" style={{"fontWeight":"800","fontSize":"18px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a>
        <div style={{"display":"flex","gap":"16px","alignItems":"center"}}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f1d29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f1d29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
    </div>
      </div>
      <a href="danh-sach-quan.html" style={{"marginTop":"14px","display":"flex","alignItems":"center","gap":"10px","background":"#f3f2f5","borderRadius":"13px","padding":"13px 14px"}}><img src="https://img.icons8.com/ios/100/9A98A6/search.png" style={{"width":"17px","height":"17px"}} alt="" /><span style={{"fontSize":"13.5px","color":"#9a98a6"}}>Tìm quán hoặc cast gần bạn…</span></a>
    </div>

    {/* categories */}
    <div style={{"padding":"14px 18px 4px","display":"grid","gridTemplateColumns":"repeat(4,1fr)","gap":"10px 8px"}}>
      <a href="danh-sach-quan.html" style={{"textAlign":"center"}}><span style={{"width":"52px","height":"52px","borderRadius":"16px","background":"#fff","boxShadow":"0 2px 10px rgba(40,20,60,.05)","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto"}}><img src="https://img.icons8.com/fluency/96/cocktail.png" style={{"width":"26px","height":"26px"}} alt="" /></span><div style={{"fontSize":"11px","color":"#5b5870","marginTop":"6px"}}>Tìm quán</div></a>
      <a href="danh-sach-cast.html" style={{"textAlign":"center"}}><span style={{"width":"52px","height":"52px","borderRadius":"16px","background":"#fff","boxShadow":"0 2px 10px rgba(40,20,60,.05)","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto"}}><img src="https://img.icons8.com/fluency/96/geisha.png" style={{"width":"26px","height":"26px"}} alt="" /></span><div style={{"fontSize":"11px","color":"#5b5870","marginTop":"6px"}}>Tìm Cast</div></a>
      <a href="uu-dai.html" style={{"textAlign":"center"}}><span style={{"width":"52px","height":"52px","borderRadius":"16px","background":"#fff","boxShadow":"0 2px 10px rgba(40,20,60,.05)","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto"}}><img src="https://img.icons8.com/fluency/96/gift.png" style={{"width":"26px","height":"26px"}} alt="" /></span><div style={{"fontSize":"11px","color":"#5b5870","marginTop":"6px"}}>Ưu đãi</div></a>
      <a href="danh-sach-quan.html" style={{"textAlign":"center"}}><span style={{"width":"52px","height":"52px","borderRadius":"16px","background":"#fff","boxShadow":"0 2px 10px rgba(40,20,60,.05)","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto"}}><img src="https://img.icons8.com/fluency/96/confetti.png" style={{"width":"26px","height":"26px"}} alt="" /></span><div style={{"fontSize":"11px","color":"#5b5870","marginTop":"6px"}}>Sự kiện</div></a>
      <a href="danh-sach-quan.html" style={{"textAlign":"center"}}><span style={{"width":"52px","height":"52px","borderRadius":"16px","background":"#fff","boxShadow":"0 2px 10px rgba(40,20,60,.05)","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto"}}><img src="https://img.icons8.com/fluency/96/restaurant.png" style={{"width":"26px","height":"26px"}} alt="" /></span><div style={{"fontSize":"11px","color":"#5b5870","marginTop":"6px"}}>Nhà hàng</div></a>
      <a href="danh-sach-quan.html" style={{"textAlign":"center"}}><span style={{"width":"52px","height":"52px","borderRadius":"16px","background":"#fff","boxShadow":"0 2px 10px rgba(40,20,60,.05)","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto"}}><img src="https://img.icons8.com/fluency/96/spa-flower.png" style={{"width":"26px","height":"26px"}} alt="" /></span><div style={{"fontSize":"11px","color":"#5b5870","marginTop":"6px"}}>Spa</div></a>
      <a href="huong-dan.html" style={{"textAlign":"center"}}><span style={{"width":"52px","height":"52px","borderRadius":"16px","background":"#fff","boxShadow":"0 2px 10px rgba(40,20,60,.05)","display":"flex","alignItems":"center","justifyContent":"center","margin":"0 auto"}}><img src="https://img.icons8.com/fluency/96/book.png" style={{"width":"26px","height":"26px"}} alt="" /></span><div style={{"fontSize":"11px","color":"#5b5870","marginTop":"6px"}}>Hướng dẫn</div></a>
    </div>

    {/* banner quảng cáo trượt */}
    <div style={{"padding":"10px 18px 10px"}}>
      <div style={{"position":"relative","overflow":"hidden","borderRadius":"16px","boxShadow":"0 4px 15px rgba(0,0,0,.08)"}}>
        {/* Banner container */}
        <div id="ad-banner-container" className="hscroll" onScroll={handleBannerScroll} style={{"display":"flex","overflowX":"auto","scrollSnapType":"x mandatory","scrollBehavior":"smooth","borderRadius":"16px"}}>
          
          {/* Slide 1 */}
          <a href="chi-tiet-quan.html" style={{"flex":"none","width":"100%","height":"115px","scrollSnapAlign":"start","position":"relative","background":"linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.72)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80') center/cover","display":"flex","flexDirection":"column","justifyContent":"flex-end","padding":"12px 16px","color":"#fff"}}>
            <div style={{"position":"absolute","top":"10px","left":"12px","background":"#6d28d9","color":"#fff","fontSize":"9px","fontWeight":"700","textTransform":"uppercase","padding":"2px 8px","borderRadius":"20px","letterSpacing":"0.5px"}}>Quảng cáo</div>
            <div style={{"fontWeight":"700","fontSize":"13.5px","textShadow":"0 1px 4px rgba(0,0,0,0.6)"}}>Đêm Nhạc DJ SODA tại Club Lumière</div>
            <div style={{"fontSize":"11px","color":"#f3f4f6","marginTop":"2px","textShadow":"0 1px 2px rgba(0,0,0,0.6)","display":"flex","justifyContent":"space-between","alignItems":"center","width":"100%"}}>
              <span>Đang diễn ra · Đặt bàn VIP ngay!</span>
              <span style={{"background":"#fff","color":"#6d28d9","padding":"3px 10px","borderRadius":"6px","fontWeight":"700","fontSize":"10px","flexShrink":"0","marginLeft":"8px"}}>Đặt ngay</span>
            </div>
          </a>

          {/* Slide 2 */}
          <a href="chi-tiet-quan.html" style={{"flex":"none","width":"100%","height":"115px","scrollSnapAlign":"start","position":"relative","background":"linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.72)),url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80') center/cover","display":"flex","flexDirection":"column","justifyContent":"flex-end","padding":"12px 16px","color":"#fff"}}>
            <div style={{"position":"absolute","top":"10px","left":"12px","background":"#6d28d9","color":"#fff","fontSize":"9px","fontWeight":"700","textTransform":"uppercase","padding":"2px 8px","borderRadius":"20px","letterSpacing":"0.5px"}}>Quảng cáo</div>
            <div style={{"fontWeight":"700","fontSize":"13.5px","textShadow":"0 1px 4px rgba(0,0,0,0.6)"}}>Sakura Lounge - Giảm 25% nhóm 4+</div>
            <div style={{"fontSize":"11px","color":"#f3f4f6","marginTop":"2px","textShadow":"0 1px 2px rgba(0,0,0,0.6)","display":"flex","justifyContent":"space-between","alignItems":"center","width":"100%"}}>
              <span>Không gian Nhật Bản cực sang xịn</span>
              <span style={{"background":"#fff","color":"#6d28d9","padding":"3px 10px","borderRadius":"6px","fontWeight":"700","fontSize":"10px","flexShrink":"0","marginLeft":"8px"}}>Nhận mã</span>
            </div>
          </a>

          {/* Slide 3 */}
          <a href="chi-tiet-quan.html" style={{"flex":"none","width":"100%","height":"115px","scrollSnapAlign":"start","position":"relative","background":"linear-gradient(rgba(0,0,0,0.15),rgba(0,0,0,0.72)),url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=600&q=80') center/cover","display":"flex","flexDirection":"column","justifyContent":"flex-end","padding":"12px 16px","color":"#fff"}}>
            <div style={{"position":"absolute","top":"10px","left":"12px","background":"#6d28d9","color":"#fff","fontSize":"9px","fontWeight":"700","textTransform":"uppercase","padding":"2px 8px","borderRadius":"20px","letterSpacing":"0.5px"}}>Quảng cáo</div>
            <div style={{"fontWeight":"700","fontSize":"13.5px","textShadow":"0 1px 4px rgba(0,0,0,0.6)"}}>Karaoke Hoàng Gia - Tặng Đĩa Trái Cây</div>
            <div style={{"fontSize":"11px","color":"#f3f4f6","marginTop":"2px","textShadow":"0 1px 2px rgba(0,0,0,0.6)","display":"flex","justifyContent":"space-between","alignItems":"center","width":"100%"}}>
              <span>Áp dụng khi đặt phòng trước 18:00</span>
              <span style={{"background":"#fff","color":"#6d28d9","padding":"3px 10px","borderRadius":"6px","fontWeight":"700","fontSize":"10px","flexShrink":"0","marginLeft":"8px"}}>Chi tiết</span>
            </div>
          </a>

        </div>

        {/* Pagination Dots */}
        <div style={{"position":"absolute","bottom":"10px","right":"16px","display":"flex","gap":"5px","zIndex":"10","alignItems":"center"}}>
          <span style={dot0}></span>
          <span style={dot1}></span>
          <span style={dot2}></span>
        </div>
      </div>
    </div>

    {/* đề xuất */}
    <div style={{"padding":"16px 18px 8px","fontWeight":"700","fontSize":"15px"}}>Đề xuất tối nay</div>
    <div className="hscroll" style={{"padding":"0 18px 8px","display":"flex","gap":"12px","overflowX":"auto"}}>
      {recs?.map((v, index) => (<React.Fragment key={index}>
        <div onClick={v.open} style={{"flex":"none","width":"160px","background":"#fff","borderRadius":"14px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)","cursor":"pointer"}}>
          <div style={{"height":"96px","background":v.img,"position":"relative"}}><span onClick={v.fav} style={{"position":"absolute","top":"7px","right":"7px","width":"27px","height":"27px","borderRadius":"50%","background":"rgba(0,0,0,.28)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src={v.favIcon} style={{"width":"15px","height":"15px"}} alt="" /></span></div>
          <div style={{"padding":"10px"}}><div style={{"fontWeight":"600","fontSize":"13px"}}>{v.name}</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>{v.area} · {v.catLabel}</div><div style={{"fontSize":"11.5px","color":"#e8923a","marginTop":"6px"}}>★ {v.rating}</div></div>
        </div>
      </React.Fragment>))}
    </div>

    {/* coupon */}
    <div style={{"padding":"12px 18px 8px","fontWeight":"700","fontSize":"15px"}}>Coupon Hot</div>
    <div style={{"padding":"0 18px 4px","display":"flex","flexDirection":"column","gap":"10px"}}>
      <a href="chi-tiet-quan.html" style={{"display":"flex","alignItems":"center","gap":"12px","background":"#fff","borderRadius":"13px","padding":"11px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}><span style={{"width":"48px","height":"48px","borderRadius":"11px","flex":"none","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=360&q=70') center/cover"}}></span><div style={{"flex":"1"}}><div style={{"fontWeight":"700","fontSize":"13.5px"}}>Happy Hour −30%</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>Club Lumière · Tây Hồ</div></div><span style={{"fontSize":"12px","color":"#6d28d9","fontWeight":"600"}}>Lấy mã ›</span></a>
      <a href="chi-tiet-quan.html" style={{"display":"flex","alignItems":"center","gap":"12px","background":"#fff","borderRadius":"13px","padding":"11px","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}><span style={{"width":"48px","height":"48px","borderRadius":"11px","flex":"none","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=360&q=70') center/cover"}}></span><div style={{"flex":"1"}}><div style={{"fontWeight":"700","fontSize":"13.5px"}}>Combo phòng VIP 2+1</div><div style={{"fontSize":"11px","color":"#8a879a","marginTop":"2px"}}>KTV Hoàng Gia · Kim Mã</div></div><span style={{"fontSize":"12px","color":"#6d28d9","fontWeight":"600"}}>Lấy mã ›</span></a>
    </div>

    {/* xếp hạng (tương tác) */}
    <div style={{"padding":"16px 18px 6px","fontWeight":"700","fontSize":"15px"}}>{rankTitle}</div>
    <div className="hscroll" style={{"padding":"0 18px 10px","display":"flex","gap":"7px","overflowX":"auto"}}>
      {cityTabs?.map((c, index) => (<React.Fragment key={index}><div onClick={c.pick} style={c.style}>{c.label}</div></React.Fragment>))}
      <div style={{"marginLeft":"auto","display":"flex","gap":"6px","background":"#fff","border":"1px solid #ececec","borderRadius":"16px","padding":"3px","flex":"none"}}>
        <div onClick={pickQuan} style={segQuan}>Quán</div>
        <div onClick={pickCast} style={segCast}>Cast</div>
      </div>
    </div>
    <div style={{"padding":"0 18px 8px","display":"flex","flexDirection":"column","gap":"8px"}}>
      {rankList?.map((r, index) => (<React.Fragment key={index}>
        <div onClick={r.open} style={{"display":"flex","alignItems":"center","gap":"11px","background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"9px 11px","cursor":"pointer"}}>
          <span style={{"width":"26px","height":"26px","borderRadius":"8px","flex":"none","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"12.5px","color":r.numColor,"background":r.crown}}>{r.rank}</span>
          <span style={{"width":"38px","height":"38px","borderRadius":"50%","flex":"none","background":r.img}}></span>
          <div style={{"flex":"1","minWidth":"0"}}><div style={{"fontWeight":"600","fontSize":"13px"}}>{r.name}</div><div style={{"fontSize":"10.5px","color":"#8a879a","marginTop":"1px"}}>{r.area}</div></div>
          <span style={{"fontSize":"11px","color":"#6d28d9","fontWeight":"600"}}>{r.metric}</span>
        </div>
      </React.Fragment>))}
    </div>

    {/* dịch vụ (tương tác) */}
    <div style={{"padding":"14px 18px 6px","display":"flex","alignItems":"center","justifyContent":"space-between"}}>
      <span style={{"fontWeight":"700","fontSize":"15px"}}>Dịch vụ nổi bật</span>
      <span style={{"display":"flex","gap":"6px","background":"#fff","border":"1px solid #ececec","borderRadius":"16px","padding":"3px"}}>
        <span onClick={pickNhahang} style={segNhahang}>Nhà hàng</span>
        <span onClick={pickSpa} style={segSpa}>Spa</span>
      </span>
    </div>
    <div style={{"padding":"0 18px 8px","display":"grid","gridTemplateColumns":"1fr 1fr","gap":"10px"}}>
      {svc?.map((s, index) => (<React.Fragment key={index}>
        <div style={{"background":"#fff","borderRadius":"13px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
          <div style={{"height":"78px","background":s.grad,"position":"relative"}}><span style={{"position":"absolute","top":"8px","left":"8px","background":"#fff","color":"#6d28d9","fontSize":"9.5px","fontWeight":"700","borderRadius":"10px","padding":"2px 8px"}}>{s.tag}</span></div>
          <div style={{"padding":"9px"}}><div style={{"fontWeight":"600","fontSize":"12.5px"}}>{s.name}</div><div style={{"fontSize":"10px","color":"#8a879a","marginTop":"2px"}}>{s.area}</div><div style={{"fontSize":"11px","color":"#1f1d29","fontWeight":"600","marginTop":"5px"}}>{s.price}</div></div>
        </div>
      </React.Fragment>))}
    </div>

    {/* video */}
    <div style={{"padding":"14px 18px 6px","fontWeight":"700","fontSize":"15px"}}>Video Hot</div>
    <div className="hscroll" style={{"padding":"0 18px 8px","display":"flex","gap":"11px","overflowX":"auto"}}>
      <a href="chi-tiet-quan.html" style={{"flex":"none","width":"150px"}}><div style={{"height":"90px","borderRadius":"13px","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"34px","height":"34px","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"15px","height":"15px","marginLeft":"2px"}} alt="" /></span></div><div style={{"fontSize":"11.5px","fontWeight":"600","marginTop":"7px"}}>Club Lumière</div></a>
      <a href="chi-tiet-quan.html" style={{"flex":"none","width":"150px"}}><div style={{"height":"90px","borderRadius":"13px","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"34px","height":"34px","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"15px","height":"15px","marginLeft":"2px"}} alt="" /></span></div><div style={{"fontSize":"11.5px","fontWeight":"600","marginTop":"7px"}}>Sakura Lounge</div></a>
    </div>

    {/* bottom nav */}
    <div style={{"height":"64px","background":"#fff","borderTop":"1px solid #ececec","display":"flex","alignItems":"center","justifyContent":"space-around","paddingBottom":"6px"}}>
      <a href="trang-chu.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/home.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Trang chủ</span></a>
      <a href="danh-sach-cast.html" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
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
  .hscroll{scrollbar-width:thin;scrollbar-color:#c9c6cf transparent;}
  .hscroll::-webkit-scrollbar{height:7px;}
  .hscroll::-webkit-scrollbar-thumb{background:#c9c6cf;border-radius:4px;}
  .card{transition:transform .16s ease, box-shadow .16s ease;cursor:pointer;}
  .card:hover{transform:translateY(-4px);box-shadow:0 14px 34px rgba(40,20,60,.14);}
  .lk{transition:color .14s ease;}
  .lk:hover{color:#6d28d9;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>

    {/* HEADER */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}>
        <a href="trang-chu.html" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a>
        <div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="trang-chu.html" style={{"color":"#6d28d9","fontWeight":"600"}}>Trang chủ</a><a href="danh-sach-quan.html" className="lk">Tìm quán</a><a href="danh-sach-cast.html" className="lk">Cast</a><a href="xep-hang.html" className="lk">Bảng xếp hạng</a><span className="lk">Tour</span><span className="lk">Blog</span></div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="../../index.html" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    {/* HERO */}
    <div style={{"padding":"34px","background":"#fff"}}>
      <div style={{"position":"relative","height":"280px","borderRadius":"20px","overflow":"hidden","background":"linear-gradient(120deg,rgba(58,31,110,.72),rgba(123,45,107,.5)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=720&q=70') center/cover","padding":"42px","display":"flex","flexDirection":"column","justifyContent":"center","color":"#fff"}}>
        <div style={{"fontSize":"12px","letterSpacing":".16em","textTransform":"uppercase","fontWeight":"600","color":"#ffd0e4"}}>Gợi ý hôm nay</div>
        <h2 style={{"fontSize":"42px","fontWeight":"800","lineHeight":"1.06","marginTop":"10px","maxWidth":"560px"}}>Tối nay đi đâu<br />ở Hà Nội?</h2>
        <p style={{"marginTop":"10px","fontSize":"15px","color":"#f0e6f4","maxWidth":"440px"}}>KTV · Bar · Casino · Spa · Nhà hàng — đặt chỗ trong vài giây.</p>
      </div>
      <a href="danh-sach-quan.html" style={{"margin":"-32px 34px 0","position":"relative","display":"flex","gap":"10px","background":"#fff","border":"1px solid #ececec","borderRadius":"16px","padding":"12px","boxShadow":"0 12px 30px rgba(40,20,60,.12)","alignItems":"center"}}>
        <div style={{"display":"flex","alignItems":"center","gap":"8px","padding":"0 16px","borderRight":"1px solid #eee","color":"#6d28d9","fontSize":"14px","fontWeight":"600"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/marker.png" style={{"width":"14px","height":"14px","marginRight":"6px"}} alt="" />Hà Nội</div>
        <div style={{"flex":"1","display":"flex","alignItems":"center","color":"#9a98a6","fontSize":"14px","paddingLeft":"8px"}}>Tìm quán hoặc cast gần bạn…</div>
        <div style={{"fontWeight":"600","fontSize":"14px","color":"#fff","background":"#6d28d9","borderRadius":"11px","padding":"12px 26px"}}>Tìm</div>
      </a>
    </div>

    {/* CATEGORIES */}
    <div style={{"display":"grid","gridTemplateColumns":"repeat(6,1fr)","gap":"12px","padding":"14px 34px 26px"}}>
      <a href="danh-sach-quan.html" className="card" style={{"textAlign":"center","padding":"18px 8px","background":"#fff","borderRadius":"16px","boxShadow":"0 2px 10px rgba(40,20,60,.05)"}}><img src="https://img.icons8.com/fluency/96/cocktail.png" style={{"width":"28px","height":"28px","display":"block","margin":"0 auto"}} alt="" /><div style={{"fontSize":"12.5px","color":"#5b5870","marginTop":"8px","fontWeight":"500"}}>Tìm quán</div></a>
      <a href="danh-sach-cast.html" className="card" style={{"textAlign":"center","padding":"18px 8px","background":"#fff","borderRadius":"16px","boxShadow":"0 2px 10px rgba(40,20,60,.05)"}}><img src="https://img.icons8.com/fluency/96/geisha.png" style={{"width":"28px","height":"28px","display":"block","margin":"0 auto"}} alt="" /><div style={{"fontSize":"12.5px","color":"#5b5870","marginTop":"8px","fontWeight":"500"}}>Tìm Cast</div></a>
      <a href="uu-dai.html" className="card" style={{"textAlign":"center","padding":"18px 8px","background":"#fff","borderRadius":"16px","boxShadow":"0 2px 10px rgba(40,20,60,.05)"}}><img src="https://img.icons8.com/fluency/96/gift.png" style={{"width":"28px","height":"28px","display":"block","margin":"0 auto"}} alt="" /><div style={{"fontSize":"12.5px","color":"#5b5870","marginTop":"8px","fontWeight":"500"}}>Ưu đãi</div></a>
      <a href="danh-sach-quan.html" className="card" style={{"textAlign":"center","padding":"18px 8px","background":"#fff","borderRadius":"16px","boxShadow":"0 2px 10px rgba(40,20,60,.05)"}}><img src="https://img.icons8.com/fluency/96/confetti.png" style={{"width":"28px","height":"28px","display":"block","margin":"0 auto"}} alt="" /><div style={{"fontSize":"12.5px","color":"#5b5870","marginTop":"8px","fontWeight":"500"}}>Sự kiện</div></a>
      <a href="danh-sach-quan.html" className="card" style={{"textAlign":"center","padding":"18px 8px","background":"#fff","borderRadius":"16px","boxShadow":"0 2px 10px rgba(40,20,60,.05)"}}><img src="https://img.icons8.com/fluency/96/restaurant.png" style={{"width":"28px","height":"28px","display":"block","margin":"0 auto"}} alt="" /><div style={{"fontSize":"12.5px","color":"#5b5870","marginTop":"8px","fontWeight":"500"}}>Nhà hàng</div></a>
      <a href="danh-sach-quan.html" className="card" style={{"textAlign":"center","padding":"18px 8px","background":"#fff","borderRadius":"16px","boxShadow":"0 2px 10px rgba(40,20,60,.05)"}}><img src="https://img.icons8.com/fluency/96/spa-flower.png" style={{"width":"28px","height":"28px","display":"block","margin":"0 auto"}} alt="" /><div style={{"fontSize":"12.5px","color":"#5b5870","marginTop":"8px","fontWeight":"500"}}>Spa</div></a>
    </div>

    {/* ĐỀ XUẤT */}
    <div style={{"padding":"8px 34px 28px"}}>
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"16px"}}>
        <div style={{"fontWeight":"700","fontSize":"20px"}}><img src="https://img.icons8.com/fluency/96/crescent-moon.png" style={{"width":"22px","height":"22px","verticalAlign":"-5px","marginRight":"8px"}} alt="" />Đề xuất tối nay đi đâu</div>
        <a href="danh-sach-quan.html" style={{"fontSize":"13px","color":"#8a879a"}} className="lk">Tuyển chọn bởi biên tập ▸</a>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(4,1fr)","gap":"14px"}}>
        {recs?.map((v, index) => (<React.Fragment key={index}>
          <div onClick={v.open} className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
            <div style={{"height":"118px","background":v.img,"position":"relative"}}><span onClick={v.fav} style={{"position":"absolute","top":"8px","right":"8px","width":"30px","height":"30px","borderRadius":"50%","background":"rgba(0,0,0,.28)","display":"flex","alignItems":"center","justifyContent":"center","cursor":"pointer"}}><img src={v.favIcon} style={{"width":"16px","height":"16px"}} alt="" /></span></div>
            <div style={{"padding":"12px"}}><div style={{"fontWeight":"600","fontSize":"14px"}}>{v.name}</div><div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"3px"}}>{v.area} · {v.catLabel}</div><div style={{"marginTop":"8px","fontSize":"12.5px","color":"#e8923a"}}>★ {v.rating} <span style={{"color":"#1f1d29","fontWeight":"600","marginLeft":"6px"}}>từ {v.price}</span></div></div>
          </div>
        </React.Fragment>))}
      </div>
    </div>

    {/* COUPON HOT */}
    <div style={{"padding":"8px 34px 28px"}}>
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"16px"}}>
        <div style={{"fontWeight":"700","fontSize":"20px"}}><img src="https://img.icons8.com/fluency/96/discount.png" style={{"width":"22px","height":"22px","verticalAlign":"-5px","marginRight":"8px"}} alt="" />Coupon Hot</div>
        <span style={{"fontSize":"12.5px","color":"#8a879a"}}>Cách lấy mã &amp; tích điểm →</span>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"16px"}}>
        <a href="chi-tiet-quan.html" className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}><div style={{"height":"118px","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","top":"12px","left":"12px","background":"#ffd24d","color":"#5a3d00","fontSize":"18px","fontWeight":"800","borderRadius":"12px","padding":"6px 12px"}}>-30%</span></div><div style={{"padding":"14px"}}><div style={{"fontWeight":"700","fontSize":"15px"}}>Happy Hour cuối tuần</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"4px"}}>Club Lumière · Tây Hồ</div><div style={{"marginTop":"12px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span style={{"fontSize":"11.5px","color":"#c0246a","background":"#fce4ef","borderRadius":"10px","padding":"4px 9px","fontWeight":"600"}}>Còn 3 ngày</span><span style={{"fontSize":"13px","color":"#6d28d9","fontWeight":"600"}}>Lấy mã ›</span></div></div></a>
        <a href="chi-tiet-quan.html" className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}><div style={{"height":"118px","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=720&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","top":"12px","left":"12px","background":"#ffd24d","color":"#5a3d00","fontSize":"18px","fontWeight":"800","borderRadius":"12px","padding":"6px 12px"}}>2+1</span></div><div style={{"padding":"14px"}}><div style={{"fontWeight":"700","fontSize":"15px"}}>Combo phòng VIP</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"4px"}}>KTV Hoàng Gia · Kim Mã</div><div style={{"marginTop":"12px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span style={{"fontSize":"11.5px","color":"#6d28d9","background":"#f1ebff","borderRadius":"10px","padding":"4px 9px","fontWeight":"600"}}>Còn 8 ngày</span><span style={{"fontSize":"13px","color":"#6d28d9","fontWeight":"600"}}>Lấy mã ›</span></div></div></a>
        <a href="chi-tiet-quan.html" className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}><div style={{"height":"118px","background":"url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=720&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","top":"12px","left":"12px","background":"#ffd24d","color":"#5a3d00","fontSize":"18px","fontWeight":"800","borderRadius":"12px","padding":"6px 12px"}}>-50%</span></div><div style={{"padding":"14px"}}><div style={{"fontWeight":"700","fontSize":"15px"}}>Spa thư giãn nửa giá</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"4px"}}>Spa Hồng Ngọc · Đống Đa</div><div style={{"marginTop":"12px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span style={{"fontSize":"11.5px","color":"#b06a00","background":"#fdefd6","borderRadius":"10px","padding":"4px 9px","fontWeight":"600"}}>Sắp hết</span><span style={{"fontSize":"13px","color":"#6d28d9","fontWeight":"600"}}>Lấy mã ›</span></div></div></a>
      </div>
    </div>

    {/* BẢNG XẾP HẠNG (interactive) */}
    <div style={{"padding":"8px 34px 28px"}}>
      <div style={{"fontWeight":"700","fontSize":"20px","marginBottom":"14px"}}><img src="https://img.icons8.com/fluency/96/trophy.png" style={{"width":"22px","height":"22px","verticalAlign":"-5px","marginRight":"8px"}} alt="" />{rankTitle}</div>
      <div style={{"display":"flex","alignItems":"center","gap":"10px","flexWrap":"wrap","marginBottom":"14px"}}>
        {cityTabs?.map((c, index) => (<React.Fragment key={index}><div onClick={c.pick} style={c.style}>{c.label}</div></React.Fragment>))}
        <div style={{"marginLeft":"auto","display":"flex","gap":"8px","background":"#fff","border":"1px solid #ececec","borderRadius":"18px","padding":"4px"}}>
          <div onClick={pickQuan} style={segQuan}>Quán</div>
          <div onClick={pickCast} style={segCast}>Cast</div>
        </div>
      </div>
      <div style={{"display":"flex","flexDirection":"column","gap":"10px"}}>
        {rankList?.map((r, index) => (<React.Fragment key={index}>
          <div onClick={r.open} className="card" style={{"display":"flex","alignItems":"center","gap":"14px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"12px 14px"}}>
            <span style={{"width":"30px","height":"30px","borderRadius":"9px","flex":"none","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"14px","color":r.numColor,"background":r.crown}}>{r.rank}</span>
            <span style={{"width":"46px","height":"46px","borderRadius":"50%","flex":"none","background":r.img}}></span>
            <div style={{"flex":"1"}}><div style={{"fontWeight":"600","fontSize":"15px"}}>{r.name}</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"2px"}}>{r.area}</div></div>
            <div style={{"fontSize":"12.5px","color":"#6d28d9","fontWeight":"600"}}>{r.metric}</div>
            <img src="https://img.icons8.com/ios/100/B6B3C0/chevron-right.png" style={{"width":"16px","height":"16px"}} alt="" />
          </div>
        </React.Fragment>))}
      </div>
    </div>

    {/* DỊCH VỤ NỔI BẬT (interactive) */}
    <div style={{"padding":"8px 34px 28px"}}>
      <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","marginBottom":"14px","flexWrap":"wrap","gap":"12px"}}>
        <div style={{"fontWeight":"700","fontSize":"20px"}}><img src="https://img.icons8.com/fluency/96/like.png" style={{"width":"22px","height":"22px","verticalAlign":"-5px","marginRight":"8px"}} alt="" />Dịch vụ nổi bật</div>
        <div style={{"display":"flex","gap":"8px","background":"#fff","border":"1px solid #ececec","borderRadius":"18px","padding":"4px"}}>
          <div onClick={pickNhahang} style={segNhahang}>Nhà hàng</div>
          <div onClick={pickSpa} style={segSpa}>Spa &amp; Massage</div>
        </div>
      </div>
      <div style={{"display":"grid","gridTemplateColumns":"repeat(4,1fr)","gap":"14px"}}>
        {svc?.map((s, index) => (<React.Fragment key={index}>
          <div className="card" style={{"background":"#fff","borderRadius":"16px","overflow":"hidden","boxShadow":"0 3px 12px rgba(40,20,60,.06)"}}>
            <div style={{"height":"118px","background":s.grad,"position":"relative"}}><span style={{"position":"absolute","top":"10px","left":"10px","background":"#fff","color":"#6d28d9","fontSize":"10.5px","fontWeight":"700","borderRadius":"12px","padding":"3px 9px"}}>{s.tag}</span></div>
            <div style={{"padding":"12px"}}><div style={{"fontWeight":"600","fontSize":"14px"}}>{s.name}</div><div style={{"fontSize":"11.5px","color":"#8a879a","marginTop":"3px"}}>{s.area}</div><div style={{"fontSize":"12.5px","color":"#1f1d29","fontWeight":"600","marginTop":"8px"}}>{s.price}</div></div>
          </div>
        </React.Fragment>))}
      </div>
    </div>

    {/* VIDEO HOT */}
    <div style={{"padding":"8px 34px 22px"}}>
      <div style={{"fontWeight":"700","fontSize":"20px","marginBottom":"14px"}}><img src="https://img.icons8.com/fluency/96/video-playlist.png" style={{"width":"22px","height":"22px","verticalAlign":"-5px","marginRight":"8px"}} alt="" />Video Hot</div>
      <div className="hscroll" style={{"display":"flex","gap":"14px","overflowX":"auto","paddingBottom":"8px"}}>
        <a href="chi-tiet-quan.html" style={{"flex":"none","width":"230px"}}><div style={{"height":"130px","borderRadius":"14px","background":"url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=720&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"42px","height":"42px","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"18px","height":"18px","marginLeft":"2px"}} alt="" /></span><span style={{"position":"absolute","bottom":"8px","right":"8px","background":"rgba(0,0,0,.5)","color":"#fff","fontSize":"10.5px","borderRadius":"8px","padding":"2px 7px"}}>0:45</span></div><div style={{"fontSize":"12.5px","fontWeight":"600","marginTop":"9px"}}>Club Lumière · Tây Hồ</div></a>
        <a href="chi-tiet-quan.html" style={{"flex":"none","width":"230px"}}><div style={{"height":"130px","borderRadius":"14px","background":"url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=720&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"42px","height":"42px","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"18px","height":"18px","marginLeft":"2px"}} alt="" /></span><span style={{"position":"absolute","bottom":"8px","right":"8px","background":"rgba(0,0,0,.5)","color":"#fff","fontSize":"10.5px","borderRadius":"8px","padding":"2px 7px"}}>1:12</span></div><div style={{"fontSize":"12.5px","fontWeight":"600","marginTop":"9px"}}>Sora Lounge · Quận 1</div></a>
        <a href="chi-tiet-quan.html" style={{"flex":"none","width":"230px"}}><div style={{"height":"130px","borderRadius":"14px","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=720&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"42px","height":"42px","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"18px","height":"18px","marginLeft":"2px"}} alt="" /></span><span style={{"position":"absolute","bottom":"8px","right":"8px","background":"rgba(0,0,0,.5)","color":"#fff","fontSize":"10.5px","borderRadius":"8px","padding":"2px 7px"}}>0:58</span></div><div style={{"fontSize":"12.5px","fontWeight":"600","marginTop":"9px"}}>Sakura Lounge · Trúc Bạch</div></a>
        <a href="chi-tiet-quan.html" style={{"flex":"none","width":"230px"}}><div style={{"height":"130px","borderRadius":"14px","background":"url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=720&q=70') center/cover","position":"relative"}}><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"42px","height":"42px","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"18px","height":"18px","marginLeft":"2px"}} alt="" /></span><span style={{"position":"absolute","bottom":"8px","right":"8px","background":"rgba(0,0,0,.5)","color":"#fff","fontSize":"10.5px","borderRadius":"8px","padding":"2px 7px"}}>1:30</span></div><div style={{"fontSize":"12.5px","fontWeight":"600","marginTop":"9px"}}>Casino Diamond · Tây Hồ</div></a>
      </div>
    </div>

    {/* HƯỚNG DẪN */}
    <div style={{"padding":"8px 34px 30px"}}>
      <div style={{"background":"linear-gradient(135deg,#f6f1ff,#fdeef5)","border":"1px solid #ece4fb","borderRadius":"20px","padding":"26px 28px"}}>
        <div style={{"fontWeight":"700","fontSize":"20px","marginBottom":"4px"}}><img src="https://img.icons8.com/fluency/96/idea.png" style={{"width":"22px","height":"22px","verticalAlign":"-5px","marginRight":"8px"}} alt="" />Hướng dẫn lấy mã &amp; tích điểm</div>
        <div style={{"fontSize":"13px","color":"#6e6b7a","marginBottom":"20px"}}>3 bước đơn giản — dành cho người dùng mới.</div>
        <div style={{"display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"16px"}}>
          <div style={{"background":"#fff","borderRadius":"14px","padding":"18px"}}><div style={{"width":"34px","height":"34px","borderRadius":"10px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"16px"}}>1</div><div style={{"fontWeight":"600","fontSize":"14.5px","marginTop":"12px"}}>Chọn coupon &amp; "Lấy mã"</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"6px","lineHeight":"1.6"}}>Mã được lưu vào ví ưu đãi trong tài khoản của bạn.</div></div>
          <div style={{"background":"#fff","borderRadius":"14px","padding":"18px"}}><div style={{"width":"34px","height":"34px","borderRadius":"10px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"16px"}}>2</div><div style={{"fontWeight":"600","fontSize":"14.5px","marginTop":"12px"}}>Đặt chỗ &amp; nhập mã</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"6px","lineHeight":"1.6"}}>Áp mã khi đặt bàn hoặc đặt cast để được giảm giá ngay.</div></div>
          <div style={{"background":"#fff","borderRadius":"14px","padding":"18px"}}><div style={{"width":"34px","height":"34px","borderRadius":"10px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"16px"}}>3</div><div style={{"fontWeight":"600","fontSize":"14.5px","marginTop":"12px"}}>Tích điểm sau check-in</div><div style={{"fontSize":"12.5px","color":"#8a879a","marginTop":"6px","lineHeight":"1.6"}}>Mỗi lượt sử dụng cộng điểm để đổi ưu đãi hạng cao hơn.</div></div>
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
  