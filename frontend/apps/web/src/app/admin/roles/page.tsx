"use client";

import React, { useState, useEffect } from 'react';
import { Plus, X, Search, ChevronLeft, ChevronRight, Eye, EyeOff, ChevronUp, ChevronDown, Edit2, Key, Ban, RotateCcw, Trash2, AlertCircle } from 'lucide-react';
import { getAuthUser } from '@/lib/auth/session';

const colors = {
  bg: '#0c0c0f',
  surface1: 'rgba(255,255,255,.02)',
  borderSoft: 'rgba(255,255,255,.06)',
  borderSoft2: 'rgba(255,255,255,.04)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldGrad: 'linear-gradient(135deg,#f0dda8,#d4b26a)',
  blue: '#60a5fa',
  pink: '#f472b6',
  green: '#4ade80'
};

export type AccountRec = {
  id: number;
  ini: string;
  name: string;
  email: string;
  role: string;
  kind: string;
  avaBg: string;
  key?: string;
  disabled?: boolean;
};

const allAcc = [
  {id:1, ini:'SA', name:'Super Admin', email:'superadmin@vietyoru.vn', role:'Super Admin', kind:'super_admin', last:'● Đang online', avaBg:'linear-gradient(135deg,#e85050,#b52b2b)'},
  {id:101, ini:'A', name:'Nguyễn Admin', email:'admin@vietyoru.vn', role:'Admin', kind:'admin', last:'● Đang online', avaBg:'linear-gradient(135deg,#f4e3b4,#b6924a)'},
  {id:2, ini:'O', name:'Trần Vận Hành', email:'operator@vietyoru.vn', role:'Operator', kind:'operator', last:'2 giờ trước', avaBg:'linear-gradient(135deg,#8fb6e4,#4f6f9c)'},
  {id:3, ini:'LH', name:'Lê Thu Hà', email:'ha.le@vietyoru.vn', role:'Operator', kind:'operator', last:'Hôm qua', avaBg:'linear-gradient(135deg,#8fb6e4,#4f6f9c)'},
  {id:4, ini:'LT', name:'Lễ tân · Club Lumière', email:'staff.lumiere1@vietyoru.vn', role:'Staff', kind:'staff', last:'10 phút trước', avaBg:'linear-gradient(135deg,#e79ab8,#b0607f)'},
  {id:5, ini:'PV', name:'Phục vụ · Sakura Lounge', email:'staff.sakura2@vietyoru.vn', role:'Staff', kind:'staff', last:'1 giờ trước', avaBg:'linear-gradient(135deg,#e79ab8,#b0607f)'},
  {id:6, ini:'CL', name:'Club Lumière', email:'partner.lumiere@vietyoru.vn', role:'Đối tác', kind:'partner', last:'15 phút trước', avaBg:'linear-gradient(135deg,#c9a86a,#8f6b32)'},
  {id:7, ini:'SL', name:'Sakura Lounge', email:'partner.sakura@vietyoru.vn', role:'Đối tác', kind:'partner', last:'1 ngày trước', avaBg:'linear-gradient(135deg,#e79ab8,#b0607f)'},
  {id:8, ini:'AK', name:'Akari Lounge', email:'partner.akari@vietyoru.vn', role:'Đối tác', kind:'partner', last:'30 phút trước', avaBg:'linear-gradient(135deg,#f4e3b4,#d4b26a)'},
  {id:9, ini:'TN', name:'Bar Tokyo Night', email:'partner.tokyonight@vietyoru.vn', role:'Đối tác', kind:'partner', last:'3 giờ trước', avaBg:'linear-gradient(135deg,#8fb6e4,#4f6f9c)'},
  {id:10, ini:'DK', name:'Dragon KTV', email:'partner.dragon@vietyoru.vn', role:'Đối tác', kind:'partner', last:'6 giờ trước', avaBg:'linear-gradient(135deg,#c9a86a,#8f6b32)'},
  {id:11, ini:'SB', name:'Sky Bar 20', email:'partner.skybar@vietyoru.vn', role:'Đối tác', kind:'partner', last:'Hôm qua', avaBg:'linear-gradient(135deg,#8fb6e4,#4f6f9c)'},
  {id:12, ini:'GH', name:'The Gin House', email:'partner.ginhouse@vietyoru.vn', role:'Đối tác', kind:'partner', last:'4 ngày trước', avaBg:'linear-gradient(135deg,#8fd4b4,#4f9c78)'},
  {id:13, ini:'MK', name:'Moonlight KTV', email:'partner.moonlight@vietyoru.vn', role:'Đối tác', kind:'partner', last:'5 ngày trước', avaBg:'linear-gradient(135deg,#c9a86a,#8f6b32)'},
  {id:14, ini:'NB', name:'Neon Bar Saigon', email:'partner.neon@vietyoru.vn', role:'Đối tác', kind:'partner', last:'1 tuần trước', avaBg:'linear-gradient(135deg,#e79ab8,#b0607f)'},
  {id:15, ini:'LC', name:'Lotus Club Saigon', email:'partner.lotus@vietyoru.vn', role:'Đối tác', kind:'partner', last:'2 ngày trước', avaBg:'linear-gradient(135deg,#e79ab8,#b0607f)'},
  {id:16, ini:'KH', name:'KTV Hoàng Gia', email:'partner.hoanggia@vietyoru.vn', role:'Chờ kích hoạt', kind:'muted', last:'Chưa kích hoạt', avaBg:'linear-gradient(135deg,#6f6b62,#44403a)'},
  {id:17, ini:'ZS', name:'Zen Spa & Onsen', email:'partner.zenspa@vietyoru.vn', role:'Chờ kích hoạt', kind:'muted', last:'Chưa kích hoạt', avaBg:'linear-gradient(135deg,#6f6b62,#44403a)'},
  {id:18, ini:'BN', name:'Blue Note Lounge', email:'partner.bluenote@vietyoru.vn', role:'Chờ kích hoạt', kind:'muted', last:'Chưa kích hoạt', avaBg:'linear-gradient(135deg,#6f6b62,#44403a)'},
  {id:19, ini:'HO', name:'Hana Onsen', email:'partner.hana@vietyoru.vn', role:'Chờ kích hoạt', kind:'muted', last:'Chưa kích hoạt', avaBg:'linear-gradient(135deg,#6f6b62,#44403a)'}
];

export default function AdminRolesPage() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(() => {
    if (typeof window !== 'undefined') {
      const user = getAuthUser();
      return user?.role === 'SUPER_ADMIN';
    }
    return false;
  });
  
  useEffect(() => {
    const user = getAuthUser();
    if (user?.role === 'SUPER_ADMIN') {
      setIsSuperAdmin(true);
    }
  }, []);

  const [accQ, setAccQ] = useState('');
  const [accRole, setAccRole] = useState('all');
  const [accPage, setAccPage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [extraAccs, setExtraAccs] = useState<AccountRec[]>([]);

  // Add form states
  const [afName, setAfName] = useState('');
  const [afEmail, setAfEmail] = useState('');
  const [afPw, setAfPw] = useState('');
  const [afPwShow, setAfPwShow] = useState(false);
  const [afKind, setAfKind] = useState('partner');
  const [afVenue, setAfVenue] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Edit states
  const [edOpen, setEdOpen] = useState(false);
  const [edOrig, setEdOrig] = useState('');
  const [edName, setEdName] = useState('');
  const [edEmail, setEdEmail] = useState('');

  // Password states
  const [cpOpen, setCpOpen] = useState(false);
  const [cpName, setCpName] = useState('');
  const [cpEmail, setCpEmail] = useState('');
  const [cpPw, setCpPw] = useState('');
  const [cpPwShow, setCpPwShow] = useState(false);

  // Delete states
  const [hdOpen, setHdOpen] = useState(false);
  const [hdName, setHdName] = useState('');
  const [hdEmail, setHdEmail] = useState('');
  const [hdKey, setHdKey] = useState('');

  // Status & Edits tracking (Mocking Backend)
  const [accStatus, setAccStatus] = useState<Record<string, boolean>>({});
  const [accEdits, setAccEdits] = useState<Record<string, {name:string, email:string}>>({});
  const [accGone, setAccGone] = useState<Record<string, boolean>>({});

  // Computed data
  const S_allAcc = [...extraAccs, ...allAcc].filter(a => !accGone[a.email]).filter(a => isSuperAdmin || a.kind !== 'super_admin').map(a => {
    const ov = accEdits[a.email];
    return { ...a, key: a.email, name: ov?.name || a.name, email: ov?.email || a.email, disabled: !!accStatus[a.email] };
  });
  const accF = S_allAcc.filter(a => 
    (accRole === 'all' || (accRole === 'disabled' ? a.disabled : (!a.disabled && a.kind === accRole))) && 
    (!accQ || (a.name + ' ' + a.email).toLowerCase().includes(accQ.toLowerCase()))
  );
  
  const PER = 6;
  const pages = Math.max(1, Math.ceil(accF.length / PER));
  const pg = Math.min(accPage, pages - 1);
  const pagedAccs = accF.slice(pg * PER, pg * PER + PER);

  const roleCount = (kind: string) => kind === 'all' ? S_allAcc.length : kind === 'disabled' ? S_allAcc.filter(a => a.disabled).length : S_allAcc.filter(a => a.kind === kind).length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const genPw = () => {
    const A='ABCDEFGHJKMNPQRSTUVWXYZ',aa='abcdefghjkmnpqrstuvwxyz',dd='23456789',ss='!@#$%&*'; 
    const pick=(s:string,n:number)=>Array.from({length:n},()=>s.charAt(Math.floor(Math.random()*s.length))); 
    const arr=pick(A,3).concat(pick(aa,4),pick(dd,3),pick(ss,2)); 
    for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=arr[i] as string; arr[i]=arr[j] as string; arr[j]=t; }
    setAfPw(arr.join('')); setAfPwShow(true);
  };

  const rst = (kind: string) => {
    const m: Record<string, string[]> = {
      super_admin: ['rgba(232,80,80,.1)','rgba(232,80,80,.3)','#e85050'],
      info: ['rgba(111,159,216,.12)','rgba(111,159,216,.28)','#8fb6e4'],
      gold: ['rgba(212,178,106,.12)','rgba(212,178,106,.3)','#e3c27e'],
      success: ['rgba(95,191,134,.1)','rgba(95,191,134,.28)','#7fd3a2'],
      pink: ['rgba(231,154,184,.1)','rgba(231,154,184,.3)','#e79ab8'],
      muted: ['rgba(255,255,255,.05)','rgba(255,255,255,.12)','#9b958a']
    };
    const fallback = ['rgba(255,255,255,.05)','rgba(255,255,255,.12)','#9b958a'];
    const c = m[kind==='super_admin'?'super_admin':kind==='admin'?'gold':kind==='operator'?'info':kind==='partner'?'success':kind==='staff'?'pink':'muted'] || fallback;
    return { background: c[0], border: `1px solid ${c[1]}`, color: c[2], fontSize: '10.5px', fontWeight: 600, padding: '3px 10px', borderRadius: '7px', display: 'inline-flex' };
  };

  let psc = 0;
  if(afPw.length>=8) psc=1;
  if(afPw.length>=10&&/[a-z]/.test(afPw)&&/[A-Z]/.test(afPw)&&/\d/.test(afPw)) psc=2;
  if(afPw.length>=12&&/[a-z]/.test(afPw)&&/[A-Z]/.test(afPw)&&/\d/.test(afPw)&&/[^A-Za-z0-9]/.test(afPw)) psc=3;
  const pOff='rgba(255,255,255,.08)', pCol=psc===1?'#e08a7e':psc===2?'#e3c27e':'#7fd3a2';
  const afPwBar1 = psc>=1?pCol:pOff;
  const afPwBar2 = psc>=2?pCol:pOff;
  const afPwBar3 = psc>=3?pCol:pOff;

  const ok = !!(afName && afName.trim() && afEmail && afEmail.indexOf('@')>0 && afPw.length>=8);
  const handleSave = () => {
    if(!ok) { showToast(!afName||!afName.trim()?'Nhập tên hiển thị':(!afEmail||afEmail.indexOf('@')<=0)?'Nhập email hợp lệ':'Mật khẩu tối thiểu 8 ký tự'); return; }
    const kmap: Record<string, [string, string]> = {
      admin:['Super Admin','linear-gradient(135deg,#f4e3b4,#b6924a)'],
      operator:['Operator','linear-gradient(135deg,#8fb6e4,#4f6f9c)'],
      partner:['Đối tác','linear-gradient(135deg,#c9a86a,#8f6b32)'],
      staff:['Staff','linear-gradient(135deg,#e79ab8,#b0607f)']
    };
    const nm = (afKind==='partner'&&afVenue&&afVenue.trim())?afVenue.trim():(afKind==='staff'&&afVenue&&afVenue.trim())?(afName.trim()+' · '+afVenue.trim()):afName.trim();
    const ini = nm.split(' ').filter(Boolean).map((w:string)=>w.charAt(0)).join('').slice(-2).toUpperCase();
    const roleData = kmap[afKind] || ['Đối tác', 'linear-gradient(135deg,#c9a86a,#8f6b32)'];
    const rec = {id:Date.now(), ini, name:nm, email:afEmail.trim(), role:roleData[0], kind:afKind, avaBg:roleData[1]};
    setExtraAccs([rec, ...extraAccs]);
    setIsAdding(false);
    showToast('Đã tạo tài khoản '+roleData[0]+' — đã gửi email thông báo');
  };


  return (
    <div style={{ padding: '22px 26px 44px', minHeight: '100%', overflowY: 'auto' }}>
      <div>
        
        {/* LEFT COLUMN: ACCOUNTS */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#f3f0ea' }}>Tài khoản</span>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(212,178,106,.4), transparent)' }}></span>
            <span onClick={() => { setAfName(''); setAfEmail(''); setAfPw(''); setAfPwShow(false); setAfKind('partner'); setAfVenue(''); setIsAdding(true); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 13px', borderRadius: '9px', cursor: 'pointer' }}>
              <Plus size={13} strokeWidth={2.4} /> Thêm
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '12px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#8c8679' }} />
              <input value={accQ} onChange={e => { setAccQ(e.target.value); setAccPage(0); }} placeholder="Tìm theo tên hoặc email…" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px 10px 37px', color: '#f3f0ea', fontSize: '12.5px', fontFamily: 'inherit', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'Tất cả' }, 
                ...(isSuperAdmin ? [{ id: 'super_admin', label: 'Super Admin' }] : []),
                { id: 'admin', label: 'Admin' }, 
                { id: 'operator', label: 'Operator' }, { id: 'partner', label: 'Đối tác' }, 
                { id: 'staff', label: 'Staff' }, { id: 'muted', label: 'Chờ kích hoạt' },
                { id: 'disabled', label: 'Đã vô hiệu' }
              ].map(r => (
                <span key={r.id} onClick={() => { setAccRole(r.id); setAccPage(0); }} style={{ fontSize: '11px', fontWeight: 600, padding: '5.5px 11px', borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', ...(accRole === r.id ? { color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)' } : { color: '#9b958a', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }) }}>
                  {r.label} · {roleCount(r.id)}
                </span>
              ))}
            </div>
          </div>
          
          <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
            {pagedAccs.map((a, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderBottom: `1px solid ${colors.borderSoft2}`, opacity: a.disabled ? 0.55 : 1 }}>
                <span style={{ width: '40px', height: '40px', flex: 'none', borderRadius: '11px', background: a.avaBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#241a0a', fontWeight: 700, fontSize: '15px' }}>{a.ini}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f3f0ea' }}>{a.name}</div>
                  <div style={{ fontSize: '11px', color: '#57534b', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
                </div>
                <div style={{ textAlign: 'right', flex: 'none' }}>
                  <span style={rst(a.kind)}>{a.role}</span>
                  {a.disabled ? (
                    <div style={{ fontSize: '10.5px', color: '#e88b99', marginTop: '5px' }}>Đã vô hiệu hóa</div>
                  ) : null}
                </div>
                <div style={{ display: 'flex', gap: '5px', flex: 'none' }}>
                  <span onClick={() => { setEdOrig(a.email); setEdName(a.name); setEdEmail(a.email); setEdOpen(true); }} title="Sửa tên / email" style={{ width: 27, height: 27, flex: 'none', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>
                    <Edit2 size={12} strokeWidth={1.9} />
                  </span>
                  <span onClick={() => { setCpName(a.name); setCpEmail(a.email); setCpPw(''); setCpPwShow(false); setCpOpen(true); }} title="Đổi mật khẩu" style={{ width: 27, height: 27, flex: 'none', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>
                    <Key size={12} strokeWidth={1.9} />
                  </span>
                  {!a.disabled ? (
                    <span onClick={() => { setAccStatus(prev => ({ ...prev, [a.key]: true })); showToast('Đã vô hiệu hóa tài khoản — có thể khôi phục bất cứ lúc nào'); }} title="Vô hiệu hóa (xóa mềm) — có thể khôi phục" style={{ width: 27, height: 27, flex: 'none', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>
                      <Ban size={12} strokeWidth={1.9} />
                    </span>
                  ) : (
                    <span onClick={() => { const st = {...accStatus}; delete st[a.key]; setAccStatus(st); showToast('Đã khôi phục tài khoản ' + a.email); }} title="Khôi phục tài khoản" style={{ width: 27, height: 27, flex: 'none', borderRadius: 8, background: 'rgba(95,191,134,.06)', border: '1px solid rgba(95,191,134,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7fd3a2', cursor: 'pointer' }}>
                      <RotateCcw size={12} strokeWidth={2} />
                    </span>
                  )}
                  {isSuperAdmin && (
                    <span onClick={() => { setHdName(a.name); setHdEmail(a.email); setHdKey(a.key); setHdOpen(true); }} title="Xóa vĩnh viễn (xóa cứng)" style={{ width: 27, height: 27, flex: 'none', borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>
                      <Trash2 size={12} strokeWidth={1.9} />
                    </span>
                  )}
                </div>
              </div>
            ))}
            {accF.length === 0 && (
              <div style={{ padding: '28px', textAlign: 'center', fontSize: '12px', color: '#57534b' }}>Không tìm thấy tài khoản phù hợp</div>
            )}
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 16px', background: 'rgba(255,255,255,.015)' }}>
              <span style={{ fontSize: '11px', color: '#8c8679' }}>{accF.length ? `Hiển thị ${pg*PER+1}–${Math.min((pg+1)*PER, accF.length)} / ${accF.length} tài khoản` : '0 tài khoản'}</span>
              <span style={{ flex: 1 }}></span>
              <span onClick={() => setAccPage(Math.max(0, pg-1))} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', ...(pg === 0 ? { color: '#9b958a', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', opacity: 0.3, pointerEvents: 'none' } : { color: '#9b958a', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }) }}>
                <ChevronLeft size={14} />
              </span>
              {Array.from({ length: pages }).map((_, i) => (
                <span key={i} onClick={() => setAccPage(i)} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: '11px', fontWeight: 700, cursor: 'pointer', ...(i === pg ? { color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)' } : { color: '#9b958a', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }) }}>
                  {i + 1}
                </span>
              ))}
              <span onClick={() => setAccPage(Math.min(pages-1, pg+1))} style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', ...(pg >= pages-1 ? { color: '#9b958a', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', opacity: 0.3, pointerEvents: 'none' } : { color: '#9b958a', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }) }}>
                <ChevronRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>

      {isAdding && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '540px', maxWidth: '94vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', flex: 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Phân quyền · Tài khoản</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#f3f0ea', marginTop: '3px' }}>Thêm tài khoản</div>
              </div>
              <span onClick={() => setIsAdding(false)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }}>
                <X size={16} />
              </span>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Tên hiển thị</div>
                <input value={afName} onChange={e => setAfName(e.target.value)} placeholder="VD: Lê Vận Hành" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Email đăng nhập</div>
                <input value={afEmail} onChange={e => setAfEmail(e.target.value)} placeholder="ten@vietyoru.vn" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
              </div>
              
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Mật khẩu</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input value={afPw} onChange={e => setAfPw(e.target.value)} type={afPwShow ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 44px 12px 15px', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit', outline: 'none', letterSpacing: '.5px' }} />
                    <span onClick={() => setAfPwShow(!afPwShow)} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>
                      {afPwShow ? <EyeOff size={15} /> : <Eye size={15} />}
                    </span>
                  </div>
                  <span onClick={genPw} style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#caa765', background: 'rgba(212,178,106,.08)', border: '1px solid rgba(212,178,106,.3)', padding: '0 14px', borderRadius: '11px', cursor: 'pointer' }}>
                    Tạo ngẫu nhiên
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '9px' }}>
                  <span style={{ flex: 1, height: 3, borderRadius: 3, background: afPwBar1 }}></span>
                  <span style={{ flex: 1, height: 3, borderRadius: 3, background: afPwBar2 }}></span>
                  <span style={{ flex: 1, height: 3, borderRadius: 3, background: afPwBar3 }}></span>
                  <span style={{ flex: 'none', minWidth: 52, textAlign: 'right', fontSize: '10.5px', fontWeight: 600, color: !afPw ? '#57534b' : (psc===0?'#e08a7e':pCol) }}>
                    {!afPw ? '' : (psc===0?'Quá ngắn':psc===1?'Yếu':psc===2?'Khá':'Mạnh')}
                  </span>
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Vai trò</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'admin', label: 'Admin' }, 
                    { id: 'operator', label: 'Operator' }, 
                    { id: 'partner', label: 'Đối tác (chủ quán)' }, 
                    { id: 'staff', label: 'Staff (NV quán)' }
                  ].filter(k => isSuperAdmin || k.id !== 'admin').map(k => (
                    <span key={k.id} onClick={() => setAfKind(k.id)} style={{ fontSize: '11.5px', fontWeight: 600, padding: '7px 13px', borderRadius: '9px', cursor: 'pointer', whiteSpace: 'nowrap', ...(afKind === k.id ? { color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)' } : { color: '#9b958a', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.09)' }) }}>
                      {k.label}
                    </span>
                  ))}
                </div>
                <div style={{ fontSize: '11px', color: '#57534b', marginTop: '8px', lineHeight: 1.5 }}>
                  {afKind === 'admin' ? 'ADMIN — quản trị cấp cao nhất, toàn quyền quản lý hệ thống. Cân nhắc kỹ khi cấp.' : afKind === 'operator' ? 'OPERATOR — nhân viên vận hành: hỗ trợ, kiểm duyệt nội dung, CSKH.' : afKind === 'partner' ? 'PARTNER — chủ quán / quản lý cơ sở: toàn bộ quyền đối tác của quán mình.' : 'STAFF — nhân viên quán (lễ tân, phục vụ): xác nhận booking, quét mã QR, xác nhận check-in.'}
                </div>
              </div>
              
              {(afKind === 'partner' || afKind === 'staff') && (
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Quán liên kết</div>
                  <input value={afVenue} onChange={e => setAfVenue(e.target.value)} placeholder="VD: Club Lumière" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '9px', padding: '11px 14px', background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.2)', borderRadius: '11px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '1px' }}><path d="M4 4h16v12H5.2L4 17.2z"/><path d="M8 8h8M8 11h5"/></svg>
                <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}>
                  Tài khoản đăng nhập bằng <b style={{ color: '#f0dda8' }}>email &amp; mật khẩu vừa đặt</b> — hệ thống gửi email thông báo kèm hướng dẫn. Nên yêu cầu đổi mật khẩu ở lần đăng nhập đầu.
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,.07)', flex: 'none', background: 'rgba(12,12,15,.35)' }}>
              <span style={{ flex: 1 }}></span>
              <span onClick={() => setIsAdding(false)} style={{ fontSize: '12.5px', fontWeight: 600, color: '#9b958a', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>Hủy</span>
              <span onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '10px 19px', borderRadius: '10px', cursor: 'pointer', ...(ok ? {} : { opacity: .45 }) }}>
                Tạo tài khoản
              </span>
            </div>
          </div>
        </div>
      )}

      {edOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 81, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '480px', maxWidth: '94vw', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Phân quyền · Tài khoản</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#f3f0ea', marginTop: '3px' }}>Sửa tài khoản</div>
              </div>
              <span onClick={() => setEdOpen(false)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }}>
                <X size={16} />
              </span>
            </div>
            <div style={{ padding: '20px 24px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Tên hiển thị</div>
                <input value={edName} onChange={e => setEdName(e.target.value)} style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Email đăng nhập</div>
                <input value={edEmail} onChange={e => setEdEmail(e.target.value)} style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }} />
              </div>
              {edEmail !== edOrig && (
                <div style={{ display: 'flex', gap: '9px', padding: '11px 14px', background: 'rgba(224,164,78,.06)', border: '1px solid rgba(224,164,78,.25)', borderRadius: '11px' }}>
                  <AlertCircle size={15} color="#e7b869" style={{ flex: 'none', marginTop: '1px' }} />
                  <span style={{ fontSize: '11.5px', color: '#e2c9a0', lineHeight: 1.5 }}>
                    Email là <b style={{ color: '#e7b869' }}>định danh đăng nhập</b> — đổi email sẽ gửi thư xác minh tới địa chỉ mới, tài khoản bị <b style={{ color: '#e7b869' }}>đăng xuất mọi thiết bị</b> và phải đăng nhập lại bằng email mới. Mật khẩu giữ nguyên.
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,.07)', background: 'rgba(12,12,15,.35)' }}>
              <span style={{ flex: 1 }}></span>
              <span onClick={() => setEdOpen(false)} style={{ fontSize: '12.5px', fontWeight: 600, color: '#9b958a', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>Hủy</span>
              <span onClick={() => { setAccEdits(prev => ({ ...prev, [edOrig]: { name: edName, email: edEmail } })); setEdOpen(false); showToast('Đã lưu thay đổi cho ' + edName); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '10px 19px', borderRadius: '10px', cursor: 'pointer', opacity: edName.trim() && edEmail.includes('@') ? 1 : 0.45, pointerEvents: edName.trim() && edEmail.includes('@') ? 'auto' : 'none' }}>
                Lưu thay đổi
              </span>
            </div>
          </div>
        </div>
      )}

      {cpOpen && (() => {
        let cps = 0;
        if(cpPw.length>=8) cps=1;
        if(cpPw.length>=10&&/[a-z]/.test(cpPw)&&/[A-Z]/.test(cpPw)&&/\d/.test(cpPw)) cps=2;
        if(cpPw.length>=12&&/[a-z]/.test(cpPw)&&/[A-Z]/.test(cpPw)&&/\d/.test(cpPw)&&/[^A-Za-z0-9]/.test(cpPw)) cps=3;
        const cCol = cps===1?'#e08a7e':cps===2?'#e3c27e':'#7fd3a2';
        const cb1 = cps>=1?cCol:pOff;
        const cb2 = cps>=2?cCol:pOff;
        const cb3 = cps>=3?cCol:pOff;

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 82, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ width: '480px', maxWidth: '94vw', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Phân quyền · Bảo mật</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#f3f0ea', marginTop: '3px' }}>Đổi mật khẩu</div>
                </div>
                <span onClick={() => setCpOpen(false)} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }}>
                  <X size={16} />
                </span>
              </div>
              <div style={{ padding: '20px 24px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '10px 13px' }}>
                  <Key size={15} color="#caa765" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#f3f0ea' }}>{cpName}</div>
                    <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cpEmail}</div>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Mật khẩu mới</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input value={cpPw} onChange={e => setCpPw(e.target.value)} type={cpPwShow ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 44px 12px 15px', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit', outline: 'none', letterSpacing: '.5px' }} />
                      <span onClick={() => setCpPwShow(!cpPwShow)} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>
                        {cpPwShow ? <EyeOff size={15} /> : <Eye size={15} />}
                      </span>
                    </div>
                    <span onClick={() => {
                      const A='ABCDEFGHJKMNPQRSTUVWXYZ',aa='abcdefghjkmnpqrstuvwxyz',dd='23456789',ss='!@#$%&*'; 
                      const pick=(s:string,n:number)=>Array.from({length:n},()=>s.charAt(Math.floor(Math.random()*s.length))); 
                      const arr=pick(A,3).concat(pick(aa,4),pick(dd,3),pick(ss,2)); 
                      for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=arr[i] as string; arr[i]=arr[j] as string; arr[j]=t; }
                      setCpPw(arr.join('')); setCpPwShow(true);
                    }} style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: '#caa765', background: 'rgba(212,178,106,.08)', border: '1px solid rgba(212,178,106,.3)', padding: '0 14px', borderRadius: '11px', cursor: 'pointer' }}>
                      Tạo ngẫu nhiên
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginTop: '9px' }}>
                    <span style={{ flex: 1, height: 3, borderRadius: 3, background: cb1 }}></span>
                    <span style={{ flex: 1, height: 3, borderRadius: 3, background: cb2 }}></span>
                    <span style={{ flex: 1, height: 3, borderRadius: 3, background: cb3 }}></span>
                    <span style={{ flex: 'none', minWidth: 52, textAlign: 'right', fontSize: '10.5px', fontWeight: 600, color: !cpPw ? '#57534b' : (cps===0?'#e08a7e':cCol) }}>
                      {!cpPw ? '' : (cps===0?'Quá ngắn':cps===1?'Yếu':cps===2?'Khá':'Mạnh')}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '9px', padding: '11px 14px', background: 'rgba(224,164,78,.06)', border: '1px solid rgba(224,164,78,.25)', borderRadius: '11px' }}>
                  <AlertCircle size={15} color="#e7b869" style={{ flex: 'none', marginTop: '1px' }} />
                  <span style={{ fontSize: '11.5px', color: '#e2c9a0', lineHeight: 1.5 }}>
                    Sau khi đổi, tài khoản bị <b style={{ color: '#e7b869' }}>đăng xuất khỏi mọi thiết bị</b> và phải đăng nhập lại bằng mật khẩu mới.
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,.07)', background: 'rgba(12,12,15,.35)' }}>
                <span style={{ flex: 1 }}></span>
                <span onClick={() => setCpOpen(false)} style={{ fontSize: '12.5px', fontWeight: 600, color: '#9b958a', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>Hủy</span>
                <span onClick={() => { setCpOpen(false); showToast('Đã đổi mật khẩu cho ' + cpName); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', padding: '10px 19px', borderRadius: '10px', cursor: 'pointer', opacity: cpPw.length >= 8 ? 1 : 0.45, pointerEvents: cpPw.length >= 8 ? 'auto' : 'none' }}>
                  Đổi mật khẩu
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {hdOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 84, background: 'rgba(6,6,9,.75)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '470px', maxWidth: '94vw', background: '#141319', border: '1px solid rgba(224,105,122,.3)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 0', display: 'flex', gap: '13px' }}>
              <span style={{ width: '42px', height: '42px', flex: 'none', borderRadius: '12px', background: 'rgba(224,105,122,.12)', border: '1px solid rgba(224,105,122,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={18} color="#e88b99" strokeWidth={1.9} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#f3f0ea' }}>Xóa vĩnh viễn tài khoản?</div>
                <div style={{ fontSize: '12px', color: '#c5c0b6', marginTop: '5px' }}>
                  <b style={{ color: '#f3f0ea' }}>{hdName}</b> · {hdEmail}
                </div>
              </div>
            </div>
            <div style={{ margin: '15px 24px 0', padding: '12px 14px', background: 'rgba(224,105,122,.07)', border: '1px solid rgba(224,105,122,.3)', borderRadius: '11px', fontSize: '11.5px', color: '#d9a1a8', lineHeight: 1.6 }}>
              Hành động <b style={{ color: '#e88b99' }}>không thể hoàn tác</b>. Quyền truy cập bị thu hồi ngay; dữ liệu nghiệp vụ liên quan (booking, hoá đơn) được giữ lại và ẩn danh hóa. Nếu chỉ cần tạm khóa, hãy dùng <b style={{ color: '#e7b869' }}>Vô hiệu hóa (xóa mềm)</b>.
            </div>
            <div style={{ display: 'flex', gap: '10px', padding: '18px 24px 20px', justifyContent: 'flex-end' }}>
              <span onClick={() => setHdOpen(false)} style={{ fontSize: '12.5px', fontWeight: 600, color: '#9b958a', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>Hủy</span>
              <span onClick={() => { setAccGone(prev => ({ ...prev, [hdKey]: true })); setHdOpen(false); showToast('Đã xóa vĩnh viễn tài khoản ' + hdEmail); }} style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', background: 'linear-gradient(135deg,#e0697a,#b64553)', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer' }}>
                Xóa vĩnh viễn
              </span>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', left: '50%', bottom: '28px', transform: 'translateX(-50%)', zIndex: 90, display: 'flex', alignItems: 'center', gap: '10px', background: '#17161c', border: '1px solid rgba(212,178,106,.3)', color: '#f3f0ea', fontSize: '13.5px', fontWeight: 500, padding: '13px 22px', borderRadius: '12px', boxShadow: '0 20px 44px -18px rgba(0,0,0,.85)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#7fd3a2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}
