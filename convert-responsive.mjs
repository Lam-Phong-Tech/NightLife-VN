import fs from 'fs';
import path from 'path';

const desktopDir = 'd:/NightLife-VN/Wirefame_Nightlight/app/desktop';
const mobileDir = 'd:/NightLife-VN/Wirefame_Nightlight/app/mobile';
const destDir = 'd:/NightLife-VN/frontend/apps/web/src/app';

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const desktopFiles = fs.existsSync(desktopDir) ? fs.readdirSync(desktopDir).filter(f => f.endsWith('.html')) : [];
const mobileFiles = fs.existsSync(mobileDir) ? fs.readdirSync(mobileDir).filter(f => f.endsWith('.html')) : [];

const allFiles = new Set([...desktopFiles, ...mobileFiles]);

function camelCase(str) {
  return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

function processHtml(content, isDesktop, routeName) {
  if (!content) return { body: '', lists: [], vars: [] };

  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let bodyContent = bodyMatch ? bodyMatch[1] : content;

  const initVarRegex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
  const initialVars = [];
  let ivMatch;
  while ((ivMatch = initVarRegex.exec(bodyContent)) !== null) {
    initialVars.push(ivMatch[1]);
  }

  // 1. Template interpolations {{ var }} to {var}
  bodyContent = bodyContent.replace(/="\{\{\s*(.*?)\s*\}\}"/g, '={$1}');
  bodyContent = bodyContent.replace(/\{\{\s*(.*?)\s*\}\}/g, '{$1}');

  if (isDesktop) {
    // Make main container full width and remove padding (Desktop only changes)
    bodyContent = bodyContent.replace(/<div style="max-width:1100px;margin-bottom:22px;[\s\S]*?<\/div>\s*<\/div>\s*/g, '');
    bodyContent = bodyContent.replace(/width:1100px;/g, 'width:100%;');
    bodyContent = bodyContent.replace(/width:max-content;/g, 'width:100%;');
    bodyContent = bodyContent.replace(/padding:34px 48px 64px;/g, 'padding:0px;');
    bodyContent = bodyContent.replace(/width:100%;background:#f5f4f2;border-radius:16px;/g, 'width:100%;background:#f5f4f2;border-radius:0px;');
  } else {
    bodyContent = bodyContent.replace(/<div style="max-width:390px;margin:0 auto 18px;[\s\S]*?<\/div>\s*<\/div>\s*/g, '');
    bodyContent = bodyContent.replace(/width:390px;/g, 'width:100%;');
    bodyContent = bodyContent.replace(/max-width:390px;/g, 'width:100%;');
    bodyContent = bodyContent.replace(/padding:34px 24px 64px;/g, 'padding:0px;');
    // Make container full-screen by removing border-radius
    bodyContent = bodyContent.replace(/border-radius:32px;/g, 'border-radius:0px;');
    
    // Remove status bar (21:00 and battery)
    bodyContent = bodyContent.replace(/<div style="height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:13px;font-weight:700;background:#fff;">[\s\S]*?<\/div>\s*/g, '');
    
    // Replace "Hà Nội" with Chat and Bell icons
    const iconsHtml = `<div style="display:flex;gap:16px;align-items:center;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f1d29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f1d29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
    </div>`;
    bodyContent = bodyContent.replace(/<span style="font-size:12px;color:#6d28d9;background:#f1ebff;border-radius:16px;padding:5px 11px;font-weight:600;">Hà Nội ▾<\/span>/g, iconsHtml);
  }

  bodyContent = bodyContent.replace(/\bclass="/g, 'className="');
  bodyContent = bodyContent.replace(/\bfor="/g, 'htmlFor="');
  bodyContent = bodyContent.replace(/\bcrossorigin\b/g, 'crossOrigin=""');

  // Restore default inline behavior for images (Tailwind makes them block by default)
  bodyContent = bodyContent.replace(/<img([^>]*?)>/gi, (match, attrs) => {
    if (attrs.includes('style="')) {
      return match.replace(/style="([^"]*)"/, (m, styles) => {
        if (!styles.includes('display:')) return `style="${styles};display:inline-block;"`;
        return m;
      });
    } else {
      return `<img${attrs} style="display:inline-block;">`;
    }
  });

  bodyContent = bodyContent.replace(/style="([^"]*)"/g, (match, styles) => {
    const obj = {};
    let spreadVar = null;
    styles.split(';').forEach(s => {
      s = s.trim();
      if (s.startsWith('{') && s.endsWith('}')) {
        spreadVar = s.substring(1, s.length - 1).trim();
        return;
      }
      const parts = s.split(':');
      if (parts.length >= 2) {
        let key = parts[0].trim();
        if (!key.startsWith('--')) {
           key = camelCase(key);
        }
        const val = parts.slice(1).join(':').trim();
        if (key) obj[key] = val;
      }
    });
    let styleStr = JSON.stringify(obj);
    styleStr = styleStr.replace(/"\{([^}]+)\}"/g, '$1');
    if (spreadVar) {
      return `style={{ ...${styleStr}, ...${spreadVar} }}`;
    }
    return `style={${styleStr}}`;
  });

  const voidElements = ['img', 'input', 'br', 'hr', 'link', 'meta'];
  voidElements.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
    bodyContent = bodyContent.replace(regex, `<${tag}$1 />`);
  });

  bodyContent = bodyContent.replace(/<sc-if[^>]*>/g, '<>');
  bodyContent = bodyContent.replace(/<\/sc-if>/g, '</>');

  // Replace old icons with new local SVG icons
  bodyContent = bodyContent.replace(/https:\/\/img\.icons8\.com\/fluency\/96\/trophy\.png/gi, '/icons/bang-xep-hang.svg');
  bodyContent = bodyContent.replace(/https:\/\/img\.icons8\.com\/fluency\/96\/discount\.png/gi, '/icons/coupon.svg');
  bodyContent = bodyContent.replace(/https:\/\/img\.icons8\.com\/fluency\/96\/like\.png/gi, '/icons/dich-vu-noi-bat.svg');
  bodyContent = bodyContent.replace(/https:\/\/img\.icons8\.com\/fluency\/96\/idea\.png/gi, '/icons/huong-dan-lay-ma.svg');
  bodyContent = bodyContent.replace(/https:\/\/img\.icons8\.com\/fluency\/96\/help\.png/gi, '/icons/huong-dan.svg');
  bodyContent = bodyContent.replace(/https:\/\/img\.icons8\.com\/fluency\/96\/dining-room\.png/gi, '/icons/nha-hang.svg'); // Just in case it was used for Nhà hàng
  bodyContent = bodyContent.replace(/https:\/\/img\.icons8\.com\/fluency\/96\/restaurant\.png/gi, '/icons/nha-hang.svg');
  bodyContent = bodyContent.replace(/https:\/\/img\.icons8\.com\/fluency\/96\/video-playlist\.png/gi, '/icons/video-noi-bat.svg');

  bodyContent = bodyContent.replace(/<sc-for list=\{([^}]+)\}\s+as="([^"]+)"[^>]*>/g, '{$1?.map(($2, index) => (<React.Fragment key={index}>');
  bodyContent = bodyContent.replace(/<\/sc-for>/g, '</React.Fragment>))}');

  bodyContent = bodyContent.replace(/<helmet>/gi, '<>');
  bodyContent = bodyContent.replace(/<\/helmet>/gi, '</>');
  bodyContent = bodyContent.replace(/<x-dc>/gi, '<>');
  bodyContent = bodyContent.replace(/<\/x-dc>/gi, '</>');
  bodyContent = bodyContent.replace(/<script[^>]*text\/x-dc[^>]*>([\s\S]*?)<\/script>/gi, '');

  // Convert HTML comments to JSX comments
  bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Fix desktop navbar if isDesktop
  if (isDesktop && routeName) {
    const activeStyle = 'style={{"color":"#6d28d9","fontWeight":600}}';
    const lkClass = 'className="lk"';
    
    const navHtml = `
      <a href="/" ${routeName === 'trang-chu' ? activeStyle : lkClass}>Trang chủ</a>
      <a href="/danh-sach-quan" ${routeName === 'danh-sach-quan' ? activeStyle : lkClass}>Tìm quán</a>
      <a href="/danh-sach-cast" ${routeName === 'danh-sach-cast' ? activeStyle : lkClass}>Cast</a>
      <a href="/xep-hang" ${routeName === 'xep-hang' ? activeStyle : lkClass}>Bảng xếp hạng</a>
      <a href="/tour" ${routeName === 'tour' ? activeStyle : lkClass}>Tour</a>
      <a href="/blog" ${(routeName === 'blog' || routeName === 'blog-chi-tiet') ? activeStyle : lkClass}>Blog</a>
    `.replace(/\n\s+/g, '');

    bodyContent = bodyContent.replace(
      /<div style=\{\{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"\}\}>.*?<\/div>/,
      `<div style={{"display":"flex","gap":"22px","fontSize":"14px","color":"#5b5870","fontWeight":"500"}}>${navHtml}</div>`
    );
  }

  // Convert href="xxx.html" to href="/xxx"
  bodyContent = bodyContent.replace(/href="([^"]+)\.html"/g, (match, p1) => {
    let route = p1.replace(/\.\.\//g, '');
    if (route === 'index') return 'href="/dang-nhap"';
    if (route === 'trang-chu') return 'href="/"';
    return `href="/${route}"`;
  });

  bodyContent = bodyContent.replace(/<style>([\s\S]*?)<\/style>/gi, (match, p1) => {
    return `<style dangerouslySetInnerHTML={{__html: \`${p1.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`}} />`;
  });

  const mapRegex = /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\?\.map\(\(([^,]+)/g;
  let match;
  const lists = [];
  while ((match = mapRegex.exec(bodyContent)) !== null) {
    lists.push(match[1].trim());
  }

  const varRegex = /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\}/g;
  const standaloneVars = new Set();
  let vMatch;
  while ((vMatch = varRegex.exec(bodyContent)) !== null) {
    standaloneVars.add(vMatch[1]);
  }
  
  const excludeVars = ['React', 'index'];
  initialVars.forEach(v => standaloneVars.add(v));
  lists.forEach(l => standaloneVars.delete(l));

  const pathRegex = /\{([a-zA-Z_$][a-zA-Z0-9_$]*)\./g;
  while ((vMatch = pathRegex.exec(bodyContent)) !== null) {
    standaloneVars.add(vMatch[1]);
  }

  const iterRegex = /\.map\(\(([^,)]+)/g;
  while ((vMatch = iterRegex.exec(bodyContent)) !== null) {
    standaloneVars.delete(vMatch[1].trim());
  }

  return {
    body: bodyContent,
    lists: lists,
    vars: Array.from(standaloneVars).filter(v => !excludeVars.includes(v) && !['true', 'false', 'null', 'undefined'].includes(v))
  };
}

allFiles.forEach(file => {
  const desktopHtml = fs.existsSync(path.join(desktopDir, file)) ? fs.readFileSync(path.join(desktopDir, file), 'utf8') : null;
  const mobileHtml = fs.existsSync(path.join(mobileDir, file)) ? fs.readFileSync(path.join(mobileDir, file), 'utf8') : null;

  let routeName = file.replace('.html', '');
  let isHome = routeName === 'trang-chu';

  const dRes = processHtml(desktopHtml, true, routeName);
  const mRes = processHtml(mobileHtml, false, routeName);
  
  let pageDir = isHome ? destDir : path.join(destDir, routeName);
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  const combinedLists = Array.from(new Set([...dRes.lists, ...mRes.lists]));
  const combinedVars = Array.from(new Set([...dRes.vars, ...mRes.vars]));

  const varDeclarations = combinedVars.map(v => {
    if (v === 'rankTitle') return `const rankTitle = "Bảng xếp hạng — Quán nổi bật tháng 6/2026";`;
    if (v === 'typeLabel') return `const typeLabel = "Quán";`;
    if (v === 'segQuan') return routeName === 'trang-chu' ? `const segQuan = activeRankTab === 'quan' ? { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)', cursor: 'pointer' } : { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };` : `const segQuan = { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)' };`;
    if (v === 'segCast') return routeName === 'trang-chu' ? `const segCast = activeRankTab === 'cast' ? { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)', cursor: 'pointer' } : { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };` : `const segCast = { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px' };`;
    if (v === 'segNhahang') return routeName === 'trang-chu' ? `const segNhahang = activeSvcTab === 'nhahang' ? { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)', cursor: 'pointer' } : { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };` : `const segNhahang = { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)' };`;
    if (v === 'segSpa') return routeName === 'trang-chu' ? `const segSpa = activeSvcTab === 'spa' ? { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)', cursor: 'pointer' } : { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };` : `const segSpa = { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px' };`;
    if (v === 'pickQuan') return routeName === 'trang-chu' ? `const pickQuan = () => setActiveRankTab('quan');` : `const pickQuan = () => {};`;
    if (v === 'pickCast') return routeName === 'trang-chu' ? `const pickCast = () => setActiveRankTab('cast');` : `const pickCast = () => {};`;
    if (v === 'pickNhahang') return routeName === 'trang-chu' ? `const pickNhahang = () => setActiveSvcTab('nhahang');` : `const pickNhahang = () => {};`;
    if (v === 'pickSpa') return routeName === 'trang-chu' ? `const pickSpa = () => setActiveSvcTab('spa');` : `const pickSpa = () => {};`;
    if (v === 'count' && routeName === 'danh-sach-quan') return `const count = 9;`;
    if (v === 'count' && routeName === 'danh-sach-cast') return `const count = 8;`;
    
    // Detail Pages Mock Vars
    if (v === 'vName') return `const vName = 'Club Lumière';`;
    if (v === 'vArea') return `const vArea = 'Tây Hồ';`;
    if (v === 'vCity' || v === 'cCity') return `const ${v} = 'Hà Nội';`;
    if (v === 'vCat') return `const vCat = 'Bar Lounge';`;
    if (v === 'vPrice') return `const vPrice = 'từ 1.2tr';`;
    if (v === 'vRating') return `const vRating = 4.9;`;
    if (v === 'vReviews') return `const vReviews = 312;`;
    if (v === 'isIntro') return `const isIntro = true;`;
    if (v === 'isMenu' || v === 'isCast' || v === 'isReviews' || v === 'isMap') return `const ${v} = false;`;
    if (v === 'guests') return `const guests = 4;`;
    if (v === 'book') return `const book = () => window.location.href = '/dat-cho';`;
    if (v === 'submit') return routeName === 'dang-nhap' ? `const submit = () => window.location.href = '/tai-khoan';` : `const submit = () => window.location.href = '/xac-nhan';`;
    if (v === 'vName' && (routeName === 'dat-cho' || routeName === 'xac-nhan')) return `const vName = 'KTV Hoàng Gia';`;
    if (v === 'vArea' && (routeName === 'dat-cho' || routeName === 'xac-nhan')) return `const vArea = 'Kim Mã';`;
    if (v === 'vCat' && (routeName === 'dat-cho' || routeName === 'xac-nhan')) return `const vCat = 'Karaoke VIP';`;
    if (v === 'vImg') return `const vImg = "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover";`;
    if (v === 'castName') return `const castName = 'Rina - 21';`;
    if (v === 'date' && (routeName === 'dat-cho' || routeName === 'xac-nhan')) return `const date = 'T6 - 21/06';`;
    if (v === 'time' && (routeName === 'dat-cho' || routeName === 'xac-nhan')) return `const time = '21:00';`;
    if (v === 'name') return `const name = 'Khách lẻ';`;
    if (v === 'phone') return `const phone = '—';`;
    if (v === 'countdown') return `const countdown = '22:13:56';`;
    if (v === 'saveLabel') return `const saveLabel = 'Lưu vào ví ưu đãi';`;
    if (v === 'toggleSave') return `const toggleSave = () => alert('Đã lưu mã ưu đãi!');`;
    if (v === 'coupon') return `const coupon = 'Happy Hour -30%';`;
    if (v === 'discountPct') return `const discountPct = '5%';`;
    if (v === 'discountNote') return `const discountNote = 'Guest: giảm 5% · hạn mã 24 giờ. Đăng nhập để nhận tới 10%.';`;
    if (v === 'sGuest') return `const sGuest: any = { flex: 1, textAlign: 'center', background: '#f1ebff', color: '#6d28d9', borderRadius: '10px', padding: '10px 14px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' };`;
    if (v === 'sMember') return `const sMember: any = { flex: 1, textAlign: 'center', background: 'transparent', color: '#8a879a', borderRadius: '10px', padding: '10px 14px', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' };`;
    if (v === 'empty' && routeName === 'vi-uu-dai') return `const empty = false;`;
    if (v === 'mainBg' && routeName === 'chi-tiet-quan') return `const mainBg = "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover";`;
    if (v === 'mainBg' && routeName === 'chi-tiet-cast') return `const mainBg = "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80') center/cover";`;

    if (v === 'favIcon') return `const favIcon = 'https://img.icons8.com/ios/100/6D28D9/like.png';`;
    if (v === 'favIconDark') return `const favIconDark = 'https://img.icons8.com/ios/100/1f1d29/like.png';`;
    if (v === 'cName') return `const cName = 'Yuki';`;
    if (v === 'cAge') return `const cAge = 24;`;
    if (v === 'cArea') return `const cArea = 'Kim Mã';`;
    if (v === 'cRating') return `const cRating = 4.8;`;
    if (v === 'cDesc') return `const cDesc = 'Phong cách đẹp';`;
    if (v === 'cJp') return `const cJp = false;`;
    if (v === 'cLang') return `const cLang = 'Việt · Anh';`;
    if (v === 'cBorn') return `const cBorn = 2002;`;
    if (v === 'isVideo') return `const isVideo = false;`;
    if (v === 'mainImg') return `const mainImg = "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80') center/cover";`;

    if (v === 'isReg') return '';
    if (v === 'pickLogin') return `const pickLogin = () => setIsReg(false);`;
    if (v === 'pickReg') return `const pickReg = () => setIsReg(true);`;
    if (v === 'title') return `const title = isReg ? 'Tạo tài khoản mới' : 'Chào mừng trở lại';`;
    if (v === 'subtitle') return `const subtitle = isReg ? 'Đăng ký để nhận ưu đãi hội viên tới 10%.' : 'Đăng nhập để tiếp tục đặt chỗ & lưu ưu đãi.';`;
    if (v === 'cta') return `const cta = isReg ? 'Đăng ký' : 'Đăng nhập';`;

    return `const ${v}: any = undefined;`; 
  }).join('\n    ');

  let mockDataString = `
  "use client";
  import React, { useState } from 'react';

  export default function Page() {
    const [activeRankTab, setActiveRankTab] = useState('quan');
    const [activeSvcTab, setActiveSvcTab] = useState('nhahang');
    const [isReg, setIsReg] = useState(false);
    // Mock data arrays for loops
    ${combinedLists.map(l => {
      if (l === 'cityTabs' || (l === 'areas' && routeName !== 'danh-sach-quan')) {
        return `const ${l}: any[] = [
          { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } },
          { label: 'Hà Nội', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } },
          { label: 'TP.HCM', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px' } }
        ];`;
      }
      if (l === 'cats' && routeName === 'danh-sach-quan') {
        return `const cats: any[] = [
          { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Karaoke / KTV', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Bar / Lounge', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Casino', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Spa / Massage', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } }
        ];`;
      }
      if (l === 'areas' && routeName === 'danh-sach-quan') {
        return `const areas: any[] = [
          { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Tây Hồ', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Hoàn Kiếm', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Kim Mã', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Đống Đa', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Trúc Bạch', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } }
        ];`;
      }
      if (l === 'venues' && routeName === 'danh-sach-quan') {
        return `const venues: any[] = [
          { name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9, reviews: 312, price: '1.2tr', hasBadge: true, badgeText: 'Ưu đãi -20%', badgeColor: '#c0246a', favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'KTV Hoàng Gia', area: 'Kim Mã', catLabel: 'Karaoke VIP', rating: 4.8, reviews: 208, price: '900K', hasBadge: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#3a8fb0,#2d5fae)", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Sakura Lounge', area: 'Trúc Bạch', catLabel: 'Lounge', rating: 4.7, reviews: 156, price: '1.5tr', hasBadge: true, badgeText: 'Mới', badgeColor: '#6d28d9', favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Casino Diamond', area: 'Tây Hồ', catLabel: 'Casino', rating: 4.6, reviews: 89, price: '2tr', hasBadge: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Hanoi Velvet', area: 'Hoàn Kiếm', catLabel: 'Bar', rating: 4.7, reviews: 140, price: '1.1tr', hasBadge: true, badgeText: 'Ưu đãi -15%', badgeColor: '#c0246a', favIcon: 'https://img.icons8.com/ios-filled/100/FF3D71/like.png', img: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0598a,#a8336b)", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Roppongi Night', area: 'Kim Mã', catLabel: 'Lounge', rating: 4.5, reviews: 102, price: '1.3tr', hasBadge: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#3a9fb0,#2d6fae)", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Spa Hồng Ngọc', area: 'Đống Đa', catLabel: 'Spa & Massage', rating: 4.6, reviews: 210, price: '500K', hasBadge: true, badgeText: 'Ưu đãi -50%', badgeColor: '#c0246a', favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#5fae8a,#2d8a6a)", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Sora Lounge', area: 'Quận 1', catLabel: 'Lounge', rating: 4.8, reviews: 190, price: '1.4tr', hasBadge: true, badgeText: 'Hot', badgeColor: '#6d28d9', favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#5d3da8,#3a1f6e)", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Diamond Bar', area: 'Quận 3', catLabel: 'Bar', rating: 4.6, reviews: 130, price: '1.6tr', hasBadge: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0985f,#c06a2d)", open: () => window.location.href = '/chi-tiet-quan' }
        ];`;
      }
      if (l === 'filters' && routeName === 'danh-sach-cast') {
        return `const filters: any[] = [
          { label: 'Tất cả', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Nói tiếng Nhật', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: '20-23 tuổi', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Tây Hồ', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } },
          { label: 'Đánh giá cao', style: { background: '#f3f2f5', color: '#5b5870', borderRadius: '16px', padding: '7px 13px', fontWeight: 600, fontSize: '12.5px', whiteSpace: 'nowrap', cursor: 'pointer' } }
        ];`;
      }
      if (l === 'cards' && routeName === 'danh-sach-cast') {
        return `const cards: any[] = [
          { name: 'Michi', age: 23, desc: 'Nói tiếng Nhật', rating: 4.9, jp: true, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0598a,#a8336b)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Yuki', age: 24, desc: 'Phong cách đẹp', rating: 4.8, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#3a9fb0,#2d6fae)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Rina', age: 21, desc: 'Trong độ tuổi 20', rating: 4.7, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Mai', age: 25, desc: 'Nói chuyện duyên', rating: 4.9, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Hana', age: 22, desc: 'Nói tiếng Nhật', rating: 4.6, jp: true, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e07a7a,#b04545)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Saki', age: 23, desc: 'Vui vẻ', rating: 4.8, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#d6336c,#7b2d6b)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Aoi', age: 24, desc: 'Dịu dàng', rating: 4.7, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#5fae8a,#2d8a6a)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Nana', age: 22, desc: 'Hát hay', rating: 4.8, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#b06ad0,#7d3da8)", open: () => window.location.href = '/chi-tiet-cast' }
        ];`;
      }
      if (l === 'offers' && routeName === 'uu-dai') {
        return `const offers: any[] = [
          { title: 'Happy Hour cuối tuần', place: 'Club Lumière · Tây Hồ', value: '-30%', expiry: 'Còn 3 ngày', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') },
          { title: 'Combo phòng VIP 2+1', place: 'KTV Hoàng Gia · Kim Mã', value: '2+1', expiry: 'Còn 8 ngày', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') },
          { title: 'Spa thư giãn nửa giá', place: 'Spa Hồng Ngọc · Đống Đa', value: '-50%', expiry: 'Sắp hết', img: "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Đã lưu ví ✓', btnStyle: { background: '#e6f7ee', color: '#177544' }, take: () => alert('Mã đã được lưu') },
          { title: 'Ladies Night -20%', place: 'Hanoi Velvet · Hoàn Kiếm', value: '-20%', expiry: 'Thứ 5 hàng tuần', img: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') },
          { title: 'Welcome Member -8%', place: 'Sora Lounge · Quận 1', value: '-8%', expiry: 'Hội viên mới', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') },
          { title: 'Khai trương -10%', place: 'Neon Garden · Bình Thạnh', value: '-10%', expiry: 'Còn 5 ngày', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=480&q=70') center/cover", btnLabel: 'Lấy mã', btnStyle: { background: '#6d28d9', color: '#fff' }, take: () => alert('Đã lưu mã') }
        ];`;
      }
      if (l === 'tabs' && routeName === 'vi-uu-dai') {
        return `const tabs: any[] = [
          { label: 'Đang giữ chỗ', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }, pick: () => {} },
          { label: 'Đã sử dụng', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }, pick: () => {} },
          { label: 'Hết hạn', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 16px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }, pick: () => {} }
        ];`;
      }
      if (l === 'list' && routeName === 'vi-uu-dai') {
        return `const list: any[] = [
          { title: 'Happy Hour -30%', place: 'KTV Hoàng Gia · Kim Mã', expiry: 'Còn 22:13:56', value: '-30%', label: 'Chờ duyệt', color: '#c0246a', bg: '#fce4ef', dim: '' },
          { title: 'Combo phòng VIP', place: 'Diamond Bar · Quận 3', expiry: 'Hôm nay', value: '1.2tr', label: 'Đã xác nhận', color: '#177544', bg: '#e6f7ee', dim: '' }
        ];`;
      }
      if (l === 'dates' && routeName === 'chi-tiet-quan') {
        return `const dates: any[] = [
          { label: 'T6 · 21/06', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: 'T7 · 22/06', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: 'CN · 23/06', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } }
        ];`;
      }
      if (l === 'times' && routeName === 'chi-tiet-quan') {
        return `const times: any[] = [
          { label: '20:00', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: '21:00', style: { background: '#6d28d9', color: '#fff', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: '22:00', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } },
          { label: '23:00', style: { background: '#fff', border: '1px solid #ececec', color: '#5b5870', borderRadius: '18px', padding: '6px 14px', fontWeight: 600, fontSize: '12px' } }
        ];`;
      }
      if (l === 'tabs' && routeName === 'chi-tiet-quan') {
        return `const tabs: any[] = [
          { label: 'Giới thiệu', style: { color: '#6d28d9', fontWeight: 700, borderBottom: '2px solid #6d28d9', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Bảng giá', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Cast', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Đánh giá', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Bản đồ', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } }
        ];`;
      }
      if (l === 'tabs' && routeName === 'chi-tiet-cast') {
        return `const tabs: any[] = [
          { label: 'Giới thiệu', style: { color: '#6d28d9', fontWeight: 700, borderBottom: '2px solid #6d28d9', paddingBottom: '12px', cursor: 'pointer' } },
          { label: 'Đánh giá', style: { color: '#8a879a', fontWeight: 500, borderBottom: '2px solid transparent', paddingBottom: '12px', cursor: 'pointer' } }
        ];`;
      }
      if (l === 'thumbs' && routeName === 'chi-tiet-quan') {
        return `const thumbs: any[] = [
          { bg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=360&q=70') center/cover" }
        ];`;
      }
      if (l === 'thumbs' && routeName === 'chi-tiet-cast') {
        return `const thumbs: any[] = [
          { bg: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=360&q=70') center/cover" },
          { bg: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=360&q=70') center/cover" }
        ];`;
      }
      if (l === 'rankList' || l === 'list') {
        if (routeName === 'trang-chu') {
          return `const ${l}: any[] = activeRankTab === 'quan' ? [
            { rank: '1', numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Club Lumière', area: 'Tây Hồ · HN', metric: '12.4k lượt', open: () => window.location.href = '/chi-tiet-quan' },
            { rank: '2', numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sora Lounge', area: 'Quận 1 · HCM', metric: '11.8k lượt', open: () => window.location.href = '/chi-tiet-quan' },
            { rank: '3', numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'KTV Hoàng Gia', area: 'Kim Mã · HN', metric: '9.7k lượt', open: () => window.location.href = '/chi-tiet-quan' },
            { rank: '4', numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Diamond Bar', area: 'Quận 3 · HCM', metric: '8.9k lượt', open: () => window.location.href = '/chi-tiet-quan' },
            { rank: '5', numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sakura Lounge', area: 'Trúc Bạch · HN', metric: '8.1k lượt', open: () => window.location.href = '/chi-tiet-quan' }
          ] : [
            { rank: '1', numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)', img: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Yuki', area: 'Tây Hồ · HN', metric: '4.9 ⭐', open: () => window.location.href = '/chi-tiet-cast' },
            { rank: '2', numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)', img: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Hana', area: 'Quận 1 · HCM', metric: '4.8 ⭐', open: () => window.location.href = '/chi-tiet-cast' },
            { rank: '3', numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)', img: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Rina', area: 'Kim Mã · HN', metric: '4.7 ⭐', open: () => window.location.href = '/chi-tiet-cast' },
            { rank: '4', numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)', img: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Mai', area: 'Quận 3 · HCM', metric: '4.6 ⭐', open: () => window.location.href = '/chi-tiet-cast' },
            { rank: '5', numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)', img: "url('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Lan', area: 'Trúc Bạch · HN', metric: '4.5 ⭐', open: () => window.location.href = '/chi-tiet-cast' }
          ];`;
        }
        return `const ${l}: any[] = [
          { rank: '1', numColor: '#713f12', crown: 'linear-gradient(140deg, #fef08a, #eab308)', img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Club Lumière', area: 'Tây Hồ · HN', metric: '12.4k lượt', open: () => window.location.href = '/chi-tiet-quan' },
          { rank: '2', numColor: '#1e293b', crown: 'linear-gradient(140deg, #e2e8f0, #94a3b8)', img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sora Lounge', area: 'Quận 1 · HCM', metric: '11.8k lượt', open: () => window.location.href = '/chi-tiet-quan' },
          { rank: '3', numColor: '#451a03', crown: 'linear-gradient(140deg, #fed7aa, #b45309)', img: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'KTV Hoàng Gia', area: 'Kim Mã · HN', metric: '9.7k lượt', open: () => window.location.href = '/chi-tiet-quan' },
          { rank: '4', numColor: '#064e3b', crown: 'linear-gradient(140deg, #a7f3d0, #22c55e)', img: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Diamond Bar', area: 'Quận 3 · HCM', metric: '8.9k lượt', open: () => window.location.href = '/chi-tiet-quan' },
          { rank: '5', numColor: '#1e3a8a', crown: 'linear-gradient(140deg, #bfdbfe, #3b82f6)', img: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=150&q=70') center/cover", name: 'Sakura Lounge', area: 'Trúc Bạch · HN', metric: '8.1k lượt', open: () => window.location.href = '/chi-tiet-quan' }
        ];`;
      }
      if (l === 'album' && routeName === 'chi-tiet-cast') {
        return `const album: any[] = [
          { bg: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=360&q=70') center/cover", video: false },
          { bg: "url('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=360&q=70') center/cover", video: false },
          { bg: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=360&q=70') center/cover", video: false },
          { bg: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=360&q=70') center/cover", video: false },
          { bg: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=360&q=70') center/cover", video: false },
          { bg: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=360&q=70') center/cover", video: true }
        ];`;
      }
      if (l === 'svc') {
        if (routeName === 'trang-chu') {
          return `const svc: any[] = activeSvcTab === 'nhahang' ? [
            { name: 'Sakura Teppanyaki', area: 'Tây Hồ · Nhà hàng Nhật', price: 'từ 800K', tag: 'Đặt bàn nhanh', grad: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
            { name: 'Yakitori Hanoi', area: 'Ba Đình · BBQ Nhật', price: 'từ 600K', tag: 'Mới', grad: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
            { name: 'Sushi Lava', area: 'Quận 1 · Omakase', price: 'từ 1.2tr', tag: 'Đánh giá cao', grad: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
            { name: 'Wagyu House', area: 'Hoàn Kiếm · Steak', price: 'từ 1.5tr', tag: 'Hot', grad: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' }
          ] : [
            { name: 'Spa Hồng Ngọc', area: 'Đống Đa · Massage', price: 'từ 500K', tag: 'Thư giãn', grad: "url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
            { name: 'Hanoi Oasis Spa', area: 'Tây Hồ · Xông hơi', price: 'từ 700K', tag: 'Ưu đãi 20%', grad: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
            { name: 'Sen Tài Thu', area: 'Ba Đình · Cổ truyền', price: 'từ 400K', tag: 'Phổ biến', grad: "url('https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
            { name: 'Aroma Clinic', area: 'Quận 1 · Chăm sóc da', price: 'từ 1.0tr', tag: 'Cao cấp', grad: "url('https://images.unsplash.com/photo-1570172619644-def2f520b22a?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' }
          ];`;
        }
        return `const svc: any[] = [
          { name: 'Sakura Teppanyaki', area: 'Tây Hồ · Nhà hàng Nhật', price: 'từ 800K', tag: 'Đặt bàn nhanh', grad: "url('https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Yakitori Hanoi', area: 'Ba Đình · BBQ Nhật', price: 'từ 600K', tag: 'Mới', grad: "url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Sushi Lava', area: 'Quận 1 · Omakase', price: 'từ 1.2tr', tag: 'Đánh giá cao', grad: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' },
          { name: 'Wagyu House', area: 'Hoàn Kiếm · Steak', price: 'từ 1.5tr', tag: 'Hot', grad: "url('https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=480&q=70') center/cover", open: () => window.location.href = '/chi-tiet-quan' }
        ];`;
      }
      if (l === 'casts' && routeName === 'chi-tiet-quan') {
        return `const casts: any[] = [
          { name: 'Yuki', age: 24, desc: 'Phong cách đẹp', rating: 4.8, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#3a9fb0,#2d6fae)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Hana', age: 22, desc: 'Nói tiếng Nhật', rating: 4.6, jp: true, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e07a7a,#b04545)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Rina', age: 21, desc: 'Trong độ tuổi 20', rating: 4.7, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#e0a23a,#c0782d)", open: () => window.location.href = '/chi-tiet-cast' },
          { name: 'Mai', age: 25, desc: 'Nói chuyện duyên', rating: 4.9, jp: false, favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png', img: "url('https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=480&q=70') center/cover,linear-gradient(140deg,#8a6ad0,#5d3da8)", open: () => window.location.href = '/chi-tiet-cast' }
        ];`;
      }
      if (l === 'couponItems') {
        return `const couponItems: any[] = [
          { label: 'Happy Hour −30%', style: { background: '#6d28d9', color: '#fff', borderRadius: '16px', padding: '5px 12px', fontWeight: 600, fontSize: '12px' } },
          { label: 'Combo VIP 2+1', style: { background: '#fff', color: '#5b5870', border: '1px solid #ececec', borderRadius: '16px', padding: '4px 12px', fontWeight: 600, fontSize: '12px' } },
          { label: 'Welcome −8%', style: { background: '#fff', color: '#5b5870', border: '1px solid #ececec', borderRadius: '16px', padding: '4px 12px', fontWeight: 600, fontSize: '12px' } },
          { label: 'Không dùng mã', style: { background: '#fff', color: '#5b5870', border: '1px solid #ececec', borderRadius: '16px', padding: '4px 12px', fontWeight: 600, fontSize: '12px' } }
        ];`;
      }
      return `const ${l}: any[] = Array(5).fill({
        name: 'Club Lumière', area: 'Tây Hồ', catLabel: 'Bar Lounge', rating: 4.9,
        img: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=480&q=70') center/cover",
        grad: 'linear-gradient(140deg, #d6336c, #7b2d6b)', price: '1.2tr', tag: '-20%',
        label: 'Tất cả', style: { background: '#f3f2f5', color: '#5b5870' }, date: '12/10',
        time: '21:00', code: 'NIGHT10', st: 'Hoàn tất',
        favIcon: 'https://img.icons8.com/ios/100/FFFFFF/like.png',
        favIconDark: 'https://img.icons8.com/ios/100/1f1d29/like.png',
        mainBg: "url('https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=1200&q=80') center/cover",
        open: () => window.location.href = '/chi-tiet-quan'
      });`;
    }).join('\n    ')}
    
    // Standalone mock variables
    ${varDeclarations}

    return (
      <React.Fragment>
        ${mRes.body ? `<div className="block md:hidden">\n${mRes.body}\n</div>` : ''}
        ${dRes.body ? `<div className="hidden md:block">\n${dRes.body}\n</div>` : ''}
      </React.Fragment>
    );
  }
  `;

  mockDataString = mockDataString.replace(/\bmaxlength=/gi, 'maxLength=');
  mockDataString = mockDataString.replace(/\btabindex=/gi, 'tabIndex=');
  mockDataString = mockDataString.replace(/\bautocomplete=/gi, 'autoComplete=');
  
  mockDataString = mockDataString.replace(/onClick="([^"]*)"/gi, 'onClick={() => {$1}}');
  mockDataString = mockDataString.replace(/onChange="([^"]*)"/gi, 'onChange={() => {$1}}');
  mockDataString = mockDataString.replace(/onSubmit="([^"]*)"/gi, 'onSubmit={(e) => { e.preventDefault(); $1 }}');
  mockDataString = mockDataString.replace(/onInput="([^"]*)"/gi, 'onInput={() => {$1}}');

  fs.writeFileSync(path.join(pageDir, 'page.tsx'), mockDataString);
  console.log(`Converted ${file} to ${isHome ? 'src/app/page.tsx' : `src/app/${routeName}/page.tsx`}`);
});

console.log('Responsive conversion completed.');
