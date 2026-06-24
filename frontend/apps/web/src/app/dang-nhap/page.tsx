
  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    
    
    // Standalone mock variables
    const pickLogin = () => setIsReg(false);
    const pickReg = () => setIsReg(true);
    const title = isReg ? 'Tạo tài khoản mới' : 'Chào mừng trở lại';
    const subtitle = isReg ? 'Đăng ký để nhận ưu đãi hội viên tới 10%.' : 'Đăng nhập để tiếp tục đặt chỗ & lưu ưu đãi.';
    const submit = () => window.location.href = '/tai-khoan';
    const cta = isReg ? 'Đăng ký' : 'Đăng nhập';
    
    const sLogin: any = undefined;
    const sReg: any = undefined;

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
  input:focus{border-color:#6d28d9!important;}
  .btn{cursor:pointer;transition:filter .14s;}
  .btn:active{filter:brightness(.95);}
`}} />
</>

<div style={{"width":"100%","minHeight":"100vh","boxSizing":"border-box","padding":"0px","background":"#e7e5df","fontFamily":"'Inter',sans-serif"}}>
  <div style={{"margin":"0 auto","width":"100%","background":"#fff","borderRadius":"0px","overflow":"hidden","boxShadow":"0 12px 40px rgba(0,0,0,.16)","color":"#1f1d29","border":"1px solid #e3e0da"}}>
    <div style={{"height":"40px","display":"flex","alignItems":"center","justifyContent":"space-between","padding":"0 22px","fontSize":"13px","fontWeight":"700"}}><span>21:00</span><span style={{"width":"22px","height":"11px","border":"1.5px solid #1f1d29","borderRadius":"3px","display":"inline-block","position":"relative"}}><span style={{"position":"absolute","inset":"1.5px","right":"6px","background":"#1f1d29","borderRadius":"1px"}}></span></span></div>

    <div style={{"height":"160px","background":"linear-gradient(140deg,rgba(58,31,110,.78),rgba(123,45,107,.6)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=720&q=70') center/cover","padding":"22px","color":"#fff","display":"flex","flexDirection":"column","justifyContent":"flex-end"}}><div style={{"fontWeight":"800","fontSize":"20px"}}>nightlife<span style={{"opacity":".8"}}>.hn</span></div><div style={{"fontSize":"12.5px","color":"#f0e6f4","marginTop":"4px"}}>Đăng nhập để đặt chỗ & lưu ưu đãi</div></div>

    <div style={{"padding":"18px"}}>
      <div style={{"display":"flex","gap":"6px","background":"#f3f2f5","borderRadius":"12px","padding":"4px"}}>
        <div onClick={pickLogin} style={sLogin}>Đăng nhập</div>
        <div onClick={pickReg} style={sReg}>Đăng ký</div>
      </div>
      <h2 style={{"fontSize":"19px","fontWeight":"800","marginTop":"16px"}}>{title}</h2>
      <div style={{"marginTop":"14px","display":"flex","flexDirection":"column","gap":"11px"}}>
        <><div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Họ tên</label><input placeholder="Nguyễn Văn A" style={{"marginTop":"5px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"12px","fontSize":"13.5px"}} /></div></>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Số điện thoại</label><input placeholder="0912 345 678" style={{"marginTop":"5px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"12px","fontSize":"13.5px"}} /></div>
        <div><label style={{"fontSize":"11.5px","fontWeight":"600","color":"#5b5870"}}>Mật khẩu</label><input type="password" placeholder="••••••••" style={{"marginTop":"5px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"10px","padding":"12px","fontSize":"13.5px"}} /></div>
        <div onClick={submit} className="btn" style={{"background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"12px","padding":"14px","fontWeight":"700","fontSize":"14px","marginTop":"2px"}}>{cta}</div>
      </div>
      <div style={{"display":"flex","alignItems":"center","gap":"10px","margin":"16px 0","color":"#b6b3c0","fontSize":"11.5px"}}><span style={{"flex":"1","height":"1px","background":"#ececec"}}></span>hoặc<span style={{"flex":"1","height":"1px","background":"#ececec"}}></span></div>
      <div style={{"display":"flex","gap":"10px"}}>
        <div className="btn" style={{"flex":"1","border":"1px solid #ececec","borderRadius":"11px","padding":"11px","display":"flex","alignItems":"center","justifyContent":"center","gap":"7px","fontSize":"12.5px","fontWeight":"600"}}><img src="https://img.icons8.com/color/96/google-logo.png" style={{"width":"17px","height":"17px","display":"inline-block"}} alt="" />Google</div>
        <div className="btn" style={{"flex":"1","border":"1px solid #ececec","borderRadius":"11px","padding":"11px","display":"flex","alignItems":"center","justifyContent":"center","gap":"7px","fontSize":"12.5px","fontWeight":"600"}}><img src="https://img.icons8.com/color/96/line-me.png" style={{"width":"17px","height":"17px","display":"inline-block"}} alt="" />LINE</div>
      </div>
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
  input:focus{border-color:#6d28d9!important;}
  .btn{cursor:pointer;transition:filter .14s, transform .12s;}
  .btn:hover{filter:brightness(1.05);transform:translateY(-1px);}
`}} />
</>

<div style={{"display":"flex","width":"100%","minHeight":"100vh","boxSizing":"border-box","background":"#fff","fontFamily":"'Inter',sans-serif","color":"#1f1d29"}}>
  {/* visual */}
  <div style={{"flex":"1","maxWidth":"50vw","background":"linear-gradient(140deg,rgba(58,31,110,.85),rgba(123,45,107,.75)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80') center/cover","padding":"60px","color":"#fff","display":"flex","flexDirection":"column","justifyContent":"space-between"}}>
    <a href="/" style={{"fontWeight":"800","fontSize":"24px","color":"#fff"}}>nightlife<span style={{"opacity":".8"}}>.hn</span></a>
    <div>
      <h2 style={{"fontSize":"42px","fontWeight":"800","lineHeight":"1.15","letterSpacing":"-0.02em"}}>Khám phá Hà Nội về<br />đêm cùng bạn</h2>
      <p style={{"fontSize":"15px","color":"#f0e6f4","marginTop":"16px","lineHeight":"1.6","maxWidth":"400px"}}>Đăng nhập để lưu quán yêu thích, đặt chỗ nhanh và nhận ưu đãi độc quyền.</p>
      <div style={{"display":"flex","gap":"40px","marginTop":"36px"}}>
        <div><div style={{"fontSize":"24px","fontWeight":"800"}}>500+</div><div style={{"fontSize":"13px","color":"#e7d9ff","marginTop":"6px"}}>Quán & dịch vụ</div></div>
        <div><div style={{"fontSize":"24px","fontWeight":"800"}}>1.2k</div><div style={{"fontSize":"13px","color":"#e7d9ff","marginTop":"6px"}}>Cast hoạt động</div></div>
        <div><div style={{"fontSize":"24px","fontWeight":"800"}}>4.8★</div><div style={{"fontSize":"13px","color":"#e7d9ff","marginTop":"6px"}}>Đánh giá TB</div></div>
      </div>
    </div>
    <div style={{"fontSize":"13px","color":"#e7d9ff"}}>© 2026 Nightlife Hà Nội</div>
  </div>

  {/* form container */}
  <div style={{"flex":"1","display":"flex","alignItems":"center","justifyContent":"center","padding":"40px"}}>
    <div style={{"width":"100%","maxWidth":"420px"}}>
      {/* switch */}
      <div style={{"display":"flex","background":"#f3f2f5","borderRadius":"12px","padding":"4px","marginBottom":"40px"}}>
        <div onClick={pickLogin} style={isReg ? {flex:1,textAlign:'center',padding:'12px 0',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',color:'#8a879a'} : {flex:1,textAlign:'center',padding:'12px 0',borderRadius:'10px',fontSize:'14px',fontWeight:700,cursor:'pointer',background:'#fff',color:'#6d28d9',boxShadow:'0 1px 3px rgba(0,0,0,.1)'}}>Đăng nhập</div>
        <div onClick={pickReg} style={isReg ? {flex:1,textAlign:'center',padding:'12px 0',borderRadius:'10px',fontSize:'14px',fontWeight:700,cursor:'pointer',background:'#fff',color:'#6d28d9',boxShadow:'0 1px 3px rgba(0,0,0,.1)'} : {flex:1,textAlign:'center',padding:'12px 0',borderRadius:'10px',fontSize:'14px',fontWeight:600,cursor:'pointer',color:'#8a879a'}}>Đăng ký</div>
      </div>

      <h2 style={{"fontSize":"26px","fontWeight":"800"}}>{title}</h2>
      <p style={{"fontSize":"13.5px","color":"#8a879a","marginTop":"6px"}}>{subtitle}</p>

      <div style={{"marginTop":"28px","display":"flex","flexDirection":"column","gap":"16px"}}>
        <>
          <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Họ tên</label><input placeholder="Nguyễn Văn A" style={{"marginTop":"8px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"14px 16px","fontSize":"14.5px"}} /></div>
        </>
        <div><label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Số điện thoại / Email</label><input placeholder="0912 345 678" defaultValue="test@nightlife.vn" style={{"marginTop":"8px","width":"100%","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"14px 16px","fontSize":"14.5px"}} /></div>
        <div>
          <label style={{"fontSize":"12.5px","fontWeight":"600","color":"#5b5870"}}>Mật khẩu</label>
          <div style={{"position":"relative","marginTop":"8px"}}>
            <input type="password" placeholder="••••••••" defaultValue="12345678" style={{"width":"100%","border":"1px solid #e2e0e8","borderRadius":"11px","padding":"14px 16px","fontSize":"14.5px","paddingRight":"48px"}} />
            <div style={{"position":"absolute","right":"16px","top":"50%","transform":"translateY(-50%)","fontSize":"13.5px","color":"#6d28d9","fontWeight":"600","cursor":"pointer"}}>Hiện</div>
          </div>
        </div>
        <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","fontSize":"13.5px","marginTop":"2px"}}>
          <label style={{"display":"flex","alignItems":"center","gap":"8px","cursor":"pointer","color":"#5b5870"}}><input type="checkbox" defaultChecked style={{"width":"16px","height":"16px","accentColor":"#6d28d9","cursor":"pointer"}} /> Ghi nhớ</label>
          <a href="#" style={{"color":"#6d28d9","fontWeight":"600"}}>Quên mật khẩu?</a>
        </div>
        <div onClick={submit} className="btn" style={{"background":"#6d28d9","color":"#fff","textAlign":"center","borderRadius":"12px","padding":"15px","fontWeight":"700","fontSize":"15px","marginTop":"8px"}}>{cta}</div>
      </div>

      <div style={{"display":"flex","alignItems":"center","gap":"12px","margin":"28px 0","color":"#b6b3c0","fontSize":"12px"}}><span style={{"flex":"1","height":"1px","background":"#ececec"}}></span>hoặc<span style={{"flex":"1","height":"1px","background":"#ececec"}}></span></div>
      <div style={{"display":"flex","gap":"12px"}}>
        <div className="btn" style={{"flex":"1","border":"1px solid #ececec","borderRadius":"12px","padding":"13px","display":"flex","alignItems":"center","justifyContent":"center","gap":"8px","fontSize":"14px","fontWeight":"600"}}><img src="https://img.icons8.com/color/96/google-logo.png" style={{"width":"20px","height":"20px","display":"inline-block"}} alt="" />Google</div>
        <div className="btn" style={{"flex":"1","border":"1px solid #ececec","borderRadius":"12px","padding":"13px","display":"flex","alignItems":"center","justifyContent":"center","gap":"8px","fontSize":"14px","fontWeight":"600"}}><img src="https://img.icons8.com/color/96/telegram-app.png" style={{"width":"20px","height":"20px","display":"inline-block"}} alt="" />Telegram</div>
      </div>
      <div style={{"textAlign":"center","fontSize":"13.5px","color":"#8a879a","marginTop":"32px"}}>Bạn là chủ quán? <a href="/dang-ky-doi-tac" style={{"color":"#6d28d9","fontWeight":"600"}}>Đăng ký đối tác</a></div>
    </div>
  </div>
</div>
</>


</div>
      </React.Fragment>
    );
  }
  