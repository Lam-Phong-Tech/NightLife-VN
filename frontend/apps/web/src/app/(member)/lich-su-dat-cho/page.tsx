

  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    const tabs: any[] = Array(5).fill({
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
    const list: any[] = [
          { rank: '1', numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Club Lumière', area: 'Tây Hồ · HN', metric: '12.4k lượt', open: () => window.location.href = '/chi-tiet-quan' },
          { rank: '2', numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sora Lounge', area: 'Quận 1 · HCM', metric: '11.8k lượt', open: () => window.location.href = '/chi-tiet-quan' },
          { rank: '3', numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'KTV Hoàng Gia', area: 'Kim Mã · HN', metric: '9.7k lượt', open: () => window.location.href = '/chi-tiet-quan' },
          { rank: '4', numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Diamond Bar', area: 'Quận 3 · HCM', metric: '8.9k lượt', open: () => window.location.href = '/chi-tiet-quan' },
          { rank: '5', numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sakura Lounge', area: 'Trúc Bạch · HN', metric: '8.1k lượt', open: () => window.location.href = '/chi-tiet-quan' }
        ];
    
    // Standalone mock variables
    const empty: any = undefined;

    return (
      <React.Fragment>
        <div className="block md:hidden">

<>
<>




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
      <a href="/" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/home.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Trang chủ</span></a>
      <a href="/danh-sach-cast" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/geisha.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Cast</span></a>
      <a href="/uu-dai" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/gift.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Ưu đãi</span></a>
      <a href="/lich-su-dat-cho" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios-filled/100/6D28D9/calendar.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#6d28d9","fontWeight":"600"}}>Đặt chỗ</span></a>
      <a href="/tai-khoan" style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"3px"}}><img src="https://img.icons8.com/ios/100/B6B3C0/user.png" style={{"width":"21px","height":"21px","display":"inline-block"}} alt="" /><span style={{"fontSize":"10px","color":"#b6b3c0"}}>Tài khoản</span></a>
    </div>
  </div>
</div>
</>


</div>
        <div className="hidden md:block">

<>
<>




</>

<div style={{"width":"100%","minWidth":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"width":"100%","background":"#f5f4f2","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.10)","color":"#1f1d29"}}>
    <div style={{"display":"flex","alignItems":"center","justifyContent":"space-between","padding":"18px 34px","background":"#fff","borderBottom":"1px solid #ececec"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"34px"}}><a href="/" style={{"fontWeight":"800","fontSize":"20px","color":"#6d28d9"}}>nightlife<span style={{"color":"#1f1d29"}}>.hn</span></a><div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}><a href="/" className="lk">Trang chủ</a><a href="/danh-sach-quan" className="lk">Tìm quán</a><a href="/danh-sach-cast" className="lk">Cast</a><a href="/xep-hang" className="lk">Bảng xếp hạng</a><a href="/tour" className="lk">Tour</a><a href="/blog" className="lk">Blog</a></div></div>
      <div style={{"display":"flex","alignItems":"center","gap":"14px"}}><div style={{"fontSize":"13px","color":"#6d28d9","background":"#f1ebff","borderRadius":"20px","padding":"6px 12px","fontWeight":"600"}}>VI · 日本語</div><a href="/tai-khoan" className="lk" style={{"fontSize":"13px","color":"#5b5870"}}>Tài khoản</a></div>
    </div>

    {/* Alert Banner */}
    <div style={{"margin":"24px 34px 0","background":"#eefcf3","border":"1px solid #d4f7de","borderRadius":"12px","padding":"16px 20px","display":"flex","alignItems":"flex-start","gap":"14px"}}>
      <div style={{"width":"32px","height":"32px","borderRadius":"50%","background":"#1b8c4c","color":"#fff","display":"flex","alignItems":"center","justifyContent":"center","fontSize":"16px","flex":"none"}}>✓</div>
      <div>
        <div style={{"color":"#106c38","fontSize":"15px","fontWeight":"700"}}>Đã gửi yêu cầu đặt chỗ!</div>
        <div style={{"color":"#2f8553","fontSize":"13.5px","marginTop":"4px"}}>Admin sẽ liên hệ xác nhận sớm. Bạn có thể hủy trước giờ hẹn tối thiểu 1 giờ.</div>
      </div>
    </div>

    <div style={{"padding":"26px 34px 8px"}}><h2 style={{"fontSize":"24px","fontWeight":"800"}}>Lịch sử đặt chỗ</h2></div>
    <div style={{"padding":"8px 34px 0","display":"flex","gap":"12px","flexWrap":"wrap"}}>
      <div style={{"background":"#6d28d9","color":"#fff","borderRadius":"24px","padding":"8px 20px","fontWeight":"600","fontSize":"13.5px","cursor":"pointer"}}>Tất cả</div>
      <div style={{"background":"#fff","color":"#5b5870","borderRadius":"24px","padding":"8px 20px","fontWeight":"600","fontSize":"13.5px","cursor":"pointer","border":"1px solid #ececec"}}>Mới</div>
      <div style={{"background":"#fff","color":"#5b5870","borderRadius":"24px","padding":"8px 20px","fontWeight":"600","fontSize":"13.5px","cursor":"pointer","border":"1px solid #ececec"}}>Hoàn tất</div>
      <div style={{"background":"#fff","color":"#5b5870","borderRadius":"24px","padding":"8px 20px","fontWeight":"600","fontSize":"13.5px","cursor":"pointer","border":"1px solid #ececec"}}>Đã hủy</div>
    </div>
    
    <div style={{"padding":"24px 34px 40px","display":"flex","flexDirection":"column","gap":"16px"}}>
      {/* Item 1 */}
      <div style={{"display":"flex","alignItems":"center","gap":"18px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"16px 20px","boxShadow":"0 3px 12px rgba(40,20,60,.03)"}}>
        <span style={{"width":"54px","height":"54px","borderRadius":"12px","flex":"none","background":"url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=200&q=70') center/cover"}}></span>
        <div style={{"flex":"1"}}>
          <div style={{"fontWeight":"700","fontSize":"15.5px","color":"#1f1d29"}}>Club Lumière</div>
          <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"4px"}}>Tây Hồ · 21/06 · 21:00 · 4 người</div>
        </div>
        <span style={{"fontSize":"12px","fontWeight":"700","borderRadius":"10px","padding":"6px 12px","color":"#6d28d9","background":"#f1ebff","marginRight":"12px"}}>Mới</span>
        <span style={{"fontSize":"13px","color":"#b03a4a","fontWeight":"600","border":"1px solid #fbe4e7","borderRadius":"10px","padding":"8px 16px","cursor":"pointer"}}>Hủy</span>
      </div>

      {/* Item 2 */}
      <div style={{"display":"flex","alignItems":"center","gap":"18px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"16px 20px","boxShadow":"0 3px 12px rgba(40,20,60,.03)"}}>
        <span style={{"width":"54px","height":"54px","borderRadius":"12px","flex":"none","background":"url('https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=200&q=70') center/cover"}}></span>
        <div style={{"flex":"1"}}>
          <div style={{"fontWeight":"700","fontSize":"15.5px","color":"#1f1d29"}}>Cast: Michi @ Club Lumière</div>
          <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"4px"}}>22/06 · 20:00 · 2 người</div>
        </div>
        <span style={{"fontSize":"12px","fontWeight":"700","borderRadius":"10px","padding":"6px 12px","color":"#6d28d9","background":"#f1ebff","marginRight":"12px"}}>Mới</span>
        <span style={{"fontSize":"13px","color":"#b03a4a","fontWeight":"600","border":"1px solid #fbe4e7","borderRadius":"10px","padding":"8px 16px","cursor":"pointer"}}>Hủy</span>
      </div>

      {/* Item 3 */}
      <div style={{"display":"flex","alignItems":"center","gap":"18px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"16px 20px","boxShadow":"0 3px 12px rgba(40,20,60,.03)"}}>
        <span style={{"width":"54px","height":"54px","borderRadius":"12px","flex":"none","background":"url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=200&q=70') center/cover"}}></span>
        <div style={{"flex":"1"}}>
          <div style={{"fontWeight":"700","fontSize":"15.5px","color":"#1f1d29"}}>KTV Hoàng Gia</div>
          <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"4px"}}>18/06 · 22:00 · 6 người</div>
        </div>
        <span style={{"fontSize":"12px","fontWeight":"700","borderRadius":"10px","padding":"8px 16px","color":"#106c38","background":"#d4f7de"}}>Hoàn tất</span>
      </div>

      {/* Item 4 */}
      <div style={{"display":"flex","alignItems":"center","gap":"18px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"16px 20px","boxShadow":"0 3px 12px rgba(40,20,60,.03)"}}>
        <span style={{"width":"54px","height":"54px","borderRadius":"12px","flex":"none","background":"url('https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=200&q=70') center/cover"}}></span>
        <div style={{"flex":"1"}}>
          <div style={{"fontWeight":"700","fontSize":"15.5px","color":"#1f1d29"}}>Sakura Lounge</div>
          <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"4px"}}>15/06 · 21:30 · 3 người</div>
        </div>
        <span style={{"fontSize":"12px","fontWeight":"700","borderRadius":"10px","padding":"8px 16px","color":"#b03a4a","background":"#fbe4e7"}}>Đã hủy</span>
      </div>

      {/* Item 5 */}
      <div style={{"display":"flex","alignItems":"center","gap":"18px","background":"#fff","border":"1px solid #ececec","borderRadius":"14px","padding":"16px 20px","boxShadow":"0 3px 12px rgba(40,20,60,.03)"}}>
        <span style={{"width":"54px","height":"54px","borderRadius":"12px","flex":"none","background":"url('https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&w=200&q=70') center/cover"}}></span>
        <div style={{"flex":"1"}}>
          <div style={{"fontWeight":"700","fontSize":"15.5px","color":"#1f1d29"}}>Diamond Bar</div>
          <div style={{"fontSize":"13px","color":"#8a879a","marginTop":"4px"}}>10/06 · 20:00 · 2 người</div>
        </div>
        <span style={{"fontSize":"12px","fontWeight":"700","borderRadius":"10px","padding":"8px 16px","color":"#106c38","background":"#d4f7de"}}>Hoàn tất</span>
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
  

