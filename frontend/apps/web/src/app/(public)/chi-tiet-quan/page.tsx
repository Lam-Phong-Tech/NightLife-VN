/* eslint-disable */

  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    const thumbs: any[] = [
          { bg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=360&q=70') center/cover" }
        ];
    const tabs: any[] = [
          { label: 'Giới thiệu', style: { color: '#6d28d9', fontWeight: 700, borderBottom: '2px solid #6d28d9', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Bảng giá', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Cast', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Đánh giá', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Bản đồ', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } }
        ];
    const cast: any[] = Array(5).fill({
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
    const dates: any[] = [
          { label: 'T6 · 21/06', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: 'T7 · 22/06', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: 'CN · 23/06', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } }
        ];
    const times: any[] = [
          { label: '20:00', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: '21:00', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: '22:00', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: '23:00', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } }
        ];
    
    // Standalone mock variables
    const vArea = 'Tây Hồ';
    const vName = 'Club Lumière';
    const vRating = 4.9;
    const vReviews = 312;
    const vCat = 'Bar Lounge';
    const toggleFav: any = undefined;
    const favIcon = 'https://img.icons8.com/ios/100/6D28D9/like.png';
    const vPrice = 'từ 1.2tr';
    const dec: any = undefined;
    const guests = 4;
    const inc: any = undefined;
    const book = () => window.location.href = '/dat-cho';
    const mainBg = "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover";
    const isIntro = true;
    const isPrice: any = undefined;
    const isCast = false;
    const isReview: any = undefined;
    const favIconDark = 'https://img.icons8.com/ios/100/1f1d29/like.png';
    const vPriceShort: any = undefined;

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
  .btn{cursor:pointer;transition:filter .14s;}
  .btn:active{filter:brightness(.95);}
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"margin":"0 auto","width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    {/* hero */}
    <div style={{"position":"relative","height":"200px","background":mainBg}}>
      <a href="/danh-sach-quan" style={{"position":"absolute","top":"12px","left":"14px","width":"34px","height":"34px","borderRadius":"50%","background":"rgba(255,255,255,.92)","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"18px","color":"#1f1d29"}}>‹</a>
      <span className="btn" onClick={toggleFav} style={{"position":"absolute","top":"12px","right":"14px","width":"34px","height":"34px","borderRadius":"50%","background":"rgba(255,255,255,.92)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src={favIconDark} style={{"width":"17px","height":"17px","display":"inline-block"}} alt="" /></span>
      <span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"46px","height":"46px","borderRadius":"50%","background":"rgba(255,255,255,.9)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"18px","height":"18px","marginLeft":"2px","display":"inline-block"}} alt="" /></span>
    </div>
    {/* thumbnails */}
    <div className="hscroll" style={{"display":"flex","gap":"8px","padding":"10px 18px 0","overflowX":"auto"}}>
      {thumbs?.map((t, index) => (<React.Fragment key={index}><span className="btn" onClick={t.pick} style={{"width":"60px","height":"46px","flex":"none","borderRadius":"9px","background":t.bg}}></span></React.Fragment>))}
    </div>

    <div style={{"background":"#fff","padding":"14px 18px 14px"}}>
      <h2 style={{"fontSize":"20px","fontWeight":"800"}}>{vName}</h2>
      <div style={{"display":"flex","alignItems":"center","gap":"10px","marginTop":"6px","fontSize":"12.5px","color":"#5b5870"}}><span style={{"color":"#e8923a","fontWeight":"600"}}>★ {vRating}</span><span style={{"color":"#a8a5b4"}}>({vReviews})</span> · {vArea}, Hà Nội</div>
      <div style={{"display":"flex","gap":"7px","marginTop":"11px","flexWrap":"wrap"}}><span style={{"fontSize":"11px","background":"#f1ebff","color":"#6d28d9","borderRadius":"12px","padding":"4px 10px","fontWeight":"600"}}>{vCat}</span><span style={{"fontSize":"11px","background":"#e6f7ee","color":"#1f8a52","borderRadius":"12px","padding":"4px 10px"}}>● Đang mở</span><span style={{"fontSize":"11px","background":"#f3f2f5","color":"#5b5870","borderRadius":"12px","padding":"4px 10px"}}>Tiếng Nhật</span></div>

      {/* tabs */}
      <div className="hscroll" style={{"display":"flex","gap":"20px","borderBottom":"1px solid #ececec","marginTop":"16px","fontSize":"13.5px","overflowX":"auto"}}>
        {tabs?.map((t, index) => (<React.Fragment key={index}><span className="btn" onClick={t.pick} style={{ ...{"whiteSpace":"nowrap"}, ...t.style }}>{t.label}</span></React.Fragment>))}
      </div>

      <><p style={{"fontSize":"12.5px","lineHeight":"1.65","color":"#3a384a","marginTop":"13px"}}>{vName} là lounge bar cao cấp khu {vArea} — không gian sang trọng, phòng VIP riêng tư, đội ngũ cast tuyển chọn kỹ, phục vụ khách Nhật với nhân viên thông thạo tiếng Nhật.</p></>
      <><div style={{"marginTop":"13px","background":"#faf9fb","border":"1px solid #ececec","borderRadius":"12px","overflow":"hidden","fontSize":"12.5px"}}><div style={{"display":"flex","justifyContent":"space-between","padding":"11px 14px","borderBottom":"1px solid #f1f0f3"}}><span>Set bàn thường (2 giờ)</span><span style={{"fontWeight":"600"}}>1.200.000đ</span></div><div style={{"display":"flex","justifyContent":"space-between","padding":"11px 14px","borderBottom":"1px solid #f1f0f3"}}><span>Phòng VIP (2 giờ)</span><span style={{"fontWeight":"600"}}>3.500.000đ</span></div><div style={{"display":"flex","justifyContent":"space-between","padding":"11px 14px"}}><span>Phí cast / giờ</span><span style={{"fontWeight":"600"}}>từ 500.000đ</span></div></div></>
      <><div className="hscroll" style={{"marginTop":"13px","display":"flex","gap":"9px","overflowX":"auto"}}>{cast?.map((c, index) => (<React.Fragment key={index}><div style={{"width":"84px","flex":"none","borderRadius":"11px","overflow":"hidden","position":"relative","height":"108px","background":c.img}}><div style={{"position":"absolute","bottom":"0","left":"0","right":"0","padding":"7px","background":"linear-gradient(0deg,rgba(20,8,16,.8),transparent)","color":"#fff","fontSize":"11px","fontWeight":"600"}}>{c.name}</div></div></React.Fragment>))}</div></>
      <><div style={{"marginTop":"13px","display":"flex","flexDirection":"column","gap":"10px"}}><div style={{"background":"#faf9fb","border":"1px solid #ececec","borderRadius":"12px","padding":"12px"}}><div style={{"display":"flex","alignItems":"center","gap":"9px"}}><span style={{"width":"28px","height":"28px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=160&q=70') center/cover"}}></span><div><div style={{"fontSize":"12.5px","fontWeight":"600"}}>Tanaka K.</div><div style={{"fontSize":"10px","color":"#e8923a"}}>★★★★★</div></div></div><p style={{"fontSize":"12px","color":"#3a384a","marginTop":"7px","lineHeight":"1.5"}}>Không gian đẹp, nhân viên nói tiếng Nhật rất tốt.</p></div></div></>


      {/* booking selectors */}
      <div style={{"marginTop":"16px","fontSize":"11.5px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginBottom":"7px"}}>Chọn ngày</div>
      <div className="hscroll" style={{"display":"flex","gap":"7px","overflowX":"auto"}}>{dates?.map((d, index) => (<React.Fragment key={index}><span className="btn" onClick={d.pick} style={d.style}>{d.label}</span></React.Fragment>))}</div>
      <div style={{"marginTop":"12px","fontSize":"11.5px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginBottom":"7px"}}>Khung giờ</div>
      <div className="hscroll" style={{"display":"flex","gap":"7px","overflowX":"auto"}}>{times?.map((t, index) => (<React.Fragment key={index}><span className="btn" onClick={t.pick} style={t.style}>{t.label}</span></React.Fragment>))}</div>
      <div style={{"marginTop":"12px","display":"flex","alignItems":"center","justifyContent":"space-between"}}><span style={{"fontSize":"11.5px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase"}}>Số khách</span><span style={{"display":"flex","alignItems":"center","gap":"14px"}}><span className="btn" onClick={dec} style={{"width":"30px","height":"30px","borderRadius":"8px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"17px"}}>−</span><span style={{"fontWeight":"700","fontSize":"14px","minWidth":"54px","textAlign":"center"}}>{guests} người</span><span className="btn" onClick={inc} style={{"width":"30px","height":"30px","borderRadius":"8px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"17px"}}>+</span></span></div>
    </div>

    {/* sticky CTA */}
    <div style={{"background":"#fff","borderTop":"1px solid #ececec","padding":"12px 18px 18px","display":"flex","alignItems":"center","gap":"12px"}}>
      <div><div style={{"fontSize":"11px","color":"#8a879a"}}>Đặt bàn từ</div><div style={{"fontSize":"16px","fontWeight":"800"}}>{vPriceShort}</div></div>
      <div className="btn" onClick={book} style={{"flex":"1","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"12px","padding":"14px","fontWeight":"700","fontSize":"14px"}}>Đặt chỗ ngay</div>
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
  .thumb{cursor:pointer;transition:opacity .14s;}
  .thumb:hover{opacity:.85;}
`}} />
</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>

  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    {/* header */}
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/dang-nhap" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Đăng nhập</a><div style={{"fontSize":"13px","fontWeight":"600","color":"#fff","background":"#6d28d9","borderRadius":"22px","padding":"9px 18px"}}>Đăng ký đối tác</div></div>
    </div>

    <div style={{"padding":"18px 34px 0","fontSize":"12.5px","color":"#8a879a"}}><a href="/" className="lk">Trang chủ</a> › <a href="/danh-sach-quan" className="lk">Tìm quán</a> › {vArea} › <span style={{"color":"#1f1d29"}}>{vName}</span></div>

    {/* gallery */}
    <div style={{"padding":"16px 34px 0","display":"grid","gridTemplateColumns":"2fr 1fr 1fr","gridTemplateRows":"130px 130px","gap":"10px"}}>
      <div style={{"gridRow":"span 2","borderRadius":"14px","background":mainBg,"position":"relative"}}><span style={{"position":"absolute","left":"50%","top":"50%","transform":"translate(-50%,-50%)","width":"48px","height":"48px","borderRadius":"50%","background":"rgba(255,255,255,.92)","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{"width":"19px","height":"19px","marginLeft":"2px","display":"inline-block"}} alt="" /></span><span style={{"position":"absolute","bottom":"10px","left":"10px","background":"rgba(20,8,16,.5)","color":"#fff","fontSize":"11px","fontWeight":"600","borderRadius":"10px","padding":"3px 10px"}}>▶ Video</span></div>
      {thumbs?.map((t, index) => (<React.Fragment key={index}>
        <div className="thumb" onClick={t.pick} style={{"borderRadius":"14px","background":t.bg}}></div>
      </React.Fragment>))}
    </div>

    <div style={{"display":"flex","gap":"24px","padding":"22px 34px 30px"}}>
      {/* main */}
      <div style={{"flex":"1"}}>
        <div style={{"display":"flex","alignItems":"flex-start","justifyContent":"space-between"}}>
          <div>
            <h2 style={{"fontSize":"26px","fontWeight":"800"}}>{vName}</h2>
            <div style={{"display":"flex","alignItems":"center","gap":"14px","marginTop":"8px","fontSize":"13px","color":"#5b5870"}}><span style={{"color":"#e8923a","fontWeight":"600"}}>★ {vRating}</span> <span style={{"color":"#a8a5b4"}}>{vReviews} đánh giá</span> · <span>{vArea}, Hà Nội</span></div>
            <div style={{"display":"flex","gap":"8px","marginTop":"12px","flexWrap":"wrap"}}><span style={{"fontSize":"12px","background":"#f1ebff","color":"#6d28d9","borderRadius":"14px","padding":"5px 11px","fontWeight":"600"}}>{vCat}</span><span style={{"fontSize":"12px","background":"#f3f2f5","color":"#5b5870","borderRadius":"14px","padding":"5px 11px"}}>Có VIP room</span><span style={{"fontSize":"12px","background":"#f3f2f5","color":"#5b5870","borderRadius":"14px","padding":"5px 11px"}}>Phục vụ tiếng Nhật</span><span style={{"fontSize":"12px","background":"#e6f7ee","color":"#1f8a52","borderRadius":"14px","padding":"5px 11px"}}>● Đang mở · đến 02:00</span></div>
          </div>
          <div style={{"display":"flex","gap":"10px"}}>
            <span className="btn" onClick={toggleFav} style={{"width":"42px","height":"42px","borderRadius":"11px","border":"1px solid #ececec","background":"#fff","display":"flex","alignItems":"center","justifyContent":"center"}}><img src={favIcon} style={{"width":"19px","height":"19px","display":"inline-block"}} alt="" /></span>
            <span className="btn" style={{"width":"42px","height":"42px","borderRadius":"11px","border":"1px solid #ececec","background":"#fff","display":"flex","alignItems":"center","justifyContent":"center"}}><img src="https://img.icons8.com/ios/100/6D28D9/share.png" style={{"width":"19px","height":"19px","display":"inline-block"}} alt="" /></span>
          </div>
        </div>

        {/* tabs */}
        <div style={{"display":"flex","gap":"26px","borderBottom":"1px solid #ececec","marginTop":"22px","fontSize":"14px"}}>
          {tabs?.map((t, index) => (<React.Fragment key={index}><span onClick={t.pick} style={t.style}>{t.label}</span></React.Fragment>))}
        </div>

        <>
          <p style={{"fontSize":"13.5px","lineHeight":"1.7","color":"#3a384a","marginTop":"18px"}}>{vName} là lounge bar cao cấp bậc nhất khu {vArea}, không gian sang trọng với hệ thống âm thanh - ánh sáng hiện đại, phòng VIP riêng tư và đội ngũ cast được tuyển chọn kỹ lưỡng. Phục vụ chuyên nghiệp cho khách Nhật với nhân viên thông thạo tiếng Nhật.</p>
          <div style={{"marginTop":"18px","display":"grid","gridTemplateColumns":"repeat(3,1fr)","gap":"12px"}}>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"13px"}}><div style={{"fontSize":"12px","color":"#8a879a"}}>Nói tiếng Nhật</div><div style={{"fontSize":"18px","fontWeight":"800","color":"#6d28d9","marginTop":"3px"}}>60%</div><div style={{"height":"5px","background":"#ece9f5","borderRadius":"3px","marginTop":"7px"}}><div style={{"width":"60%","height":"100%","background":"#6d28d9","borderRadius":"3px"}}></div></div></div>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"13px"}}><div style={{"fontSize":"12px","color":"#8a879a"}}>Nói tiếng Anh</div><div style={{"fontSize":"18px","fontWeight":"800","color":"#6d28d9","marginTop":"3px"}}>35%</div><div style={{"height":"5px","background":"#ece9f5","borderRadius":"3px","marginTop":"7px"}}><div style={{"width":"35%","height":"100%","background":"#6d28d9","borderRadius":"3px"}}></div></div></div>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"12px","padding":"13px"}}><div style={{"fontSize":"12px","color":"#8a879a"}}>Quốc tịch cast</div><div style={{"fontSize":"13.5px","fontWeight":"600","marginTop":"6px","lineHeight":"1.5"}}>Việt Nam · Nhật Bản · Hàn Quốc</div></div>
          </div>
        </>

        <>
          <div style={{"marginTop":"18px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","overflow":"hidden","fontSize":"13.5px"}}>
            <div style={{"display":"flex","justifyContent":"space-between","padding":"13px 18px","borderBottom":"1px solid #f1f0f3"}}><span>Set bàn thường (2 giờ)</span><span style={{"fontWeight":"600"}}>1.200.000đ</span></div>
            <div style={{"display":"flex","justifyContent":"space-between","padding":"13px 18px","borderBottom":"1px solid #f1f0f3"}}><span>Phòng VIP (2 giờ)</span><span style={{"fontWeight":"600"}}>3.500.000đ</span></div>
            <div style={{"display":"flex","justifyContent":"space-between","padding":"13px 18px"}}><span>Phí cast / giờ</span><span style={{"fontWeight":"600"}}>từ 500.000đ</span></div>
          </div>
        </>

        <>
          <div style={{"marginTop":"18px","display":"grid","gridTemplateColumns":"repeat(5,1fr)","gap":"12px"}}>
            {cast?.map((c, index) => (<React.Fragment key={index}><div style={{"borderRadius":"12px","overflow":"hidden","position":"relative","height":"150px","background":c.img}}><div style={{"position":"absolute","bottom":"0","left":"0","right":"0","padding":"9px","background":"linear-gradient(0deg,rgba(20,8,16,.8),transparent)","color":"#fff","fontSize":"12px","fontWeight":"600"}}>{c.name}</div></div></React.Fragment>))}
          </div>
        </>

        <>
          <div style={{"marginTop":"18px","display":"flex","flexDirection":"column","gap":"12px"}}>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"15px"}}><div style={{"display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"32px","height":"32px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=200&q=70') center/cover"}}></span><div><div style={{"fontSize":"13px","fontWeight":"600"}}>Tanaka K.</div><div style={{"fontSize":"11px","color":"#e8923a"}}>★★★★★</div></div><span style={{"marginLeft":"auto","fontSize":"11.5px","color":"#a8a5b4"}}>2 ngày trước</span></div><p style={{"fontSize":"13px","color":"#3a384a","marginTop":"9px","lineHeight":"1.6"}}>Không gian đẹp, nhân viên nói tiếng Nhật rất tốt. Sẽ quay lại.</p></div>
            <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"15px"}}><div style={{"display":"flex","alignItems":"center","gap":"10px"}}><span style={{"width":"32px","height":"32px","borderRadius":"50%","background":"url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=200&q=70') center/cover"}}></span><div><div style={{"fontSize":"13px","fontWeight":"600"}}>Minh H.</div><div style={{"fontSize":"11px","color":"#e8923a"}}>★★★★★</div></div><span style={{"marginLeft":"auto","fontSize":"11.5px","color":"#a8a5b4"}}>1 tuần trước</span></div><p style={{"fontSize":"13px","color":"#3a384a","marginTop":"9px","lineHeight":"1.6"}}>Đồ uống chất lượng, phòng VIP riêng tư. Giá hợp lý cho dịch vụ.</p></div>
          </div>
        </>


      </div>

      {/* booking sidebar */}
      <div style={{"width":"320px","flex":"none"}}>
        <div style={{"background":"#fff","border":"1px solid #ececec","borderRadius":"16px","padding":"20px","boxShadow":"0 6px 20px rgba(40,20,60,.07)","position":"sticky","top":"20px"}}>
          <div style={{"fontSize":"13px","color":"#8a879a"}}>Đặt bàn từ</div>
          <div style={{"fontSize":"24px","fontWeight":"800","color":"#1f1d29","marginTop":"2px"}}>{vPrice}</div>
          <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginTop":"16px","marginBottom":"8px"}}>Chọn ngày</div>
          <div style={{"display":"flex","gap":"7px","flexWrap":"wrap"}}>{dates?.map((d, index) => (<React.Fragment key={index}><span onClick={d.pick} style={d.style}>{d.label}</span></React.Fragment>))}</div>
          <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginTop":"14px","marginBottom":"8px"}}>Khung giờ</div>
          <div style={{"display":"flex","gap":"7px","flexWrap":"wrap"}}>{times?.map((t, index) => (<React.Fragment key={index}><span onClick={t.pick} style={t.style}>{t.label}</span></React.Fragment>))}</div>
          <div style={{"fontSize":"12px","fontWeight":"700","color":"#8a879a","letterSpacing":".04em","textTransform":"uppercase","marginTop":"14px","marginBottom":"8px"}}>Số khách</div>
          <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","border":"1px solid #ececec","borderRadius":"11px","padding":"8px 12px"}}>
            <span className="btn" onClick={dec} style={{"width":"32px","height":"32px","borderRadius":"9px","background":"#f3f2f5","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"18px"}}>−</span>
            <span style={{"fontWeight":"700","fontSize":"15px"}}>{guests} người</span>
            <span className="btn" onClick={inc} style={{"width":"32px","height":"32px","borderRadius":"9px","background":"#6d28d9","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"800","fontSize":"18px"}}>+</span>
          </div>
          <div onClick={book} className="btn" style={{"marginTop":"16px","background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"11px","padding":"13px","fontWeight":"700","fontSize":"14px"}}>Đặt chỗ ngay</div>
          <div className="btn" style={{"marginTop":"10px","border":"1px solid #ececec","color":"#6d28d9","textAlign":"center","borderRadius":"11px","padding":"12px","fontWeight":"600","fontSize":"13.5px","display":"flex","alignItems":"center","justifyContent":"center","gap":"8px"}}><img src="https://img.icons8.com/ios/100/6D28D9/phone.png" style={{"width":"16px","height":"16px","display":"inline-block"}} alt="" />Gọi trực tiếp</div>
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
  
