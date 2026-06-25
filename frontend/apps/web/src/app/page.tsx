"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { 
  recs, cityTabs, rankListQuan, rankListCast, svcData, spaData, 
  adBanners, hotVideos, homeCategories, offers
} from '@/lib/mock-data';
import { VenueCard } from '@/components/ui/VenueCard';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { RankingCard } from '@/components/ui/RankingCard';
import { SearchBar } from '@/components/ui/SearchBar';

export default function Page() {
  const [activeRankTab, setActiveRankTab] = useState('quan');
  const [activeSvcTab, setActiveSvcTab] = useState('nhahang');

const rankList = activeRankTab === 'quan' ? rankListQuan : rankListCast;
  const svc = activeSvcTab === 'nhahang' ? svcData : spaData;
    
  const rankTitle = "Bảng xếp hạng — Quán nổi bật tháng 6/2026";
  const pickQuan = () => setActiveRankTab('quan');
  const pickCast = () => setActiveRankTab('cast');
  const pickNhahang = () => setActiveSvcTab('nhahang');
  const pickSpa = () => setActiveSvcTab('spa');

  const activeTabStyle = { background: '#fff', color: '#6d28d9', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', boxShadow: '0 2px 6px rgba(0,0,0,.08)', cursor: 'pointer' };
  const inactiveTabStyle = { background: 'transparent', color: '#8a879a', borderRadius: '16px', padding: '4px 14px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' };

  return (
    <React.Fragment>
      {/* MOBILE VIEW */}
      <div className="block md:hidden">
        <div style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box', padding: '0px', background: '#e7e5df', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ margin: '0 auto', width: '100%', background: '#f5f4f2', borderRadius: '0px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.16)', color: '#1f1d29', border: '1px solid #e3e0da' }}>
            
            {/* header + search */}
            <div style={{ background: '#fff', padding: '8px 18px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/" style={{ fontWeight: '800', fontSize: '18px', color: '#6d28d9' }}>nightlife<span style={{ color: '#1f1d29' }}>.hn</span></Link>
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Image width={20} height={20} src="/SVG/chat.svg" style={{ display: 'inline-block' }} alt="Chat" />
                  <Image width={20} height={20} src="/SVG/Notification.svg" style={{ display: 'inline-block' }} alt="Notification" />
                </span>
              </div>
              <div style={{ marginTop: '14px' }}>
                <Link href="/danh-sach-quan" style={{ textDecoration: 'none' }}>
                  <SearchBar placeholder="Tìm quán hoặc cast gần bạn…" style={{ padding: '13px 14px', background: '#f3f2f5', borderRadius: '13px', border: 'none', pointerEvents: 'none' }} />
                </Link>
              </div>
            </div>

            {/* categories */}
            <div style={{ padding: '14px 18px 4px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px 8px' }}>
              {homeCategories.map((c, idx) => (
                <Link key={idx} href={c.href} style={{ textAlign: 'center' }}>
                  <span style={{ width: '52px', height: '52px', borderRadius: '16px', background: '#fff', boxShadow: '0 2px 10px rgba(40,20,60,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    {c.icon.startsWith('/') || c.icon.startsWith('http') ? (
                       <Image width={26} height={26} src={c.icon} style={{ display: 'inline-block' }} alt={c.name} />
                    ) : null}
                  </span>
                  <div style={{ fontSize: '11px', color: '#5b5870', marginTop: '6px' }}>{c.name}</div>
                </Link>
              ))}
            </div>

            {/* banner quảng cáo trượt */}
            <div style={{ padding: '10px 18px 10px' }}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,.08)' }}>
                <div className="hscroll" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', borderRadius: '16px' }}>
                  {adBanners.map((ad, idx) => (
                    <Link key={idx} href="/stores/club-lumiere" style={{ flex: 'none', width: '100%', height: '115px', scrollSnapAlign: 'start', position: 'relative', background: ad.img, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '12px 16px', color: '#fff' }}>
                      <div style={{ position: 'absolute', top: '10px', left: '12px', background: '#6d28d9', color: '#fff', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '20px', letterSpacing: '0.5px' }}>{ad.tag}</div>
                      <div style={{ fontWeight: '700', fontSize: '13.5px', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{ad.title}</div>
                      <div style={{ fontSize: '11px', color: '#f3f4f6', marginTop: '2px', textShadow: '0 1px 2px rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>{ad.desc}</span>
                        <span style={{ background: '#fff', color: '#6d28d9', padding: '3px 10px', borderRadius: '6px', fontWeight: '700', fontSize: '10px', flexShrink: '0', marginLeft: '8px' }}>{ad.btnText}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* đề xuất */}
            <div style={{ padding: '16px 18px 8px', fontWeight: '700', fontSize: '15px' }}>Đề xuất tối nay</div>
            <div className="hscroll" style={{ padding: '0 18px 8px', display: 'flex', gap: '12px', overflowX: 'auto' }}>
              {recs.map((v, index) => (
                <div key={index} style={{ flex: 'none', width: '160px' }}>
                  <VenueCard venue={v} variant="vertical" />
                </div>
              ))}
            </div>

            {/* coupon */}
            <div style={{ padding: '12px 18px 8px', fontWeight: '700', fontSize: '15px' }}>Coupon Hot</div>
            <div style={{ padding: '0 18px 4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {offers.slice(0, 2).map((off, index) => (
                <Link key={index} href="/stores/club-lumiere" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', borderRadius: '13px', padding: '11px', boxShadow: '0 3px 12px rgba(40,20,60,.06)' }}>
                  <span style={{ width: '48px', height: '48px', borderRadius: '11px', flex: 'none', background: off.img }}></span>
                  <div style={{ flex: '1' }}>
                    <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{off.title}</div>
                    <div style={{ fontSize: '11px', color: '#8a879a', marginTop: '2px' }}>{off.place}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#6d28d9', fontWeight: '600' }}>Lấy mã ›</span>
                </Link>
              ))}
            </div>

            {/* xếp hạng */}
            <div style={{ padding: '16px 18px 6px', fontWeight: '700', fontSize: '15px' }}>{rankTitle}</div>
            <div className="hscroll" style={{ padding: '0 18px 10px', display: 'flex', gap: '7px', overflowX: 'auto' }}>
              {cityTabs.map((c, index) => (
                <div key={index} style={c.style}>{c.label}</div>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', background: '#fff', border: '1px solid #ececec', borderRadius: '16px', padding: '3px', flex: 'none' }}>
                <div onClick={pickQuan} style={activeRankTab === 'quan' ? activeTabStyle : inactiveTabStyle}>Quán</div>
                <div onClick={pickCast} style={activeRankTab === 'cast' ? activeTabStyle : inactiveTabStyle}>Cast</div>
              </div>
            </div>
            <div style={{ padding: '0 18px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rankList.map((r, index) => (
                <RankingCard key={index} item={r} />
              ))}
            </div>

            {/* dịch vụ */}
            <div style={{ padding: '14px 18px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '700', fontSize: '15px' }}>Dịch vụ nổi bật</span>
              <span style={{ display: 'flex', gap: '6px', background: '#fff', border: '1px solid #ececec', borderRadius: '16px', padding: '3px' }}>
                <span onClick={pickNhahang} style={activeSvcTab === 'nhahang' ? activeTabStyle : inactiveTabStyle}>Nhà hàng</span>
                <span onClick={pickSpa} style={activeSvcTab === 'spa' ? activeTabStyle : inactiveTabStyle}>Spa</span>
              </span>
            </div>
            <div style={{ padding: '0 18px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {svc.map((s, index) => (
                <div key={index} style={{ background: '#fff', borderRadius: '13px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(40,20,60,.06)' }}>
                  <div style={{ height: '78px', background: s.grad, position: 'relative' }}>
                    <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#fff', color: '#6d28d9', fontSize: '9.5px', fontWeight: '700', borderRadius: '10px', padding: '2px 8px' }}>{s.badgeText || s.tag}</span>
                  </div>
                  <div style={{ padding: '9px' }}>
                    <div style={{ fontWeight: '600', fontSize: '12.5px' }}>{s.name}</div>
                    <div style={{ fontSize: '10px', color: '#8a879a', marginTop: '2px' }}>{s.area}</div>
                    <div style={{ fontSize: '11px', color: '#1f1d29', fontWeight: '600', marginTop: '5px' }}>{s.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* video */}
            <div style={{ padding: '14px 18px 6px', fontWeight: '700', fontSize: '15px' }}>Video Hot</div>
            <div className="hscroll" style={{ padding: '0 18px 8px', display: 'flex', gap: '11px', overflowX: 'auto' }}>
              {hotVideos.map((vid, idx) => (
                <Link key={idx} href="/stores/club-lumiere" style={{ flex: 'none', width: '150px' }}>
                  <div style={{ height: '90px', borderRadius: '13px', background: vid.img, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '34px', height: '34px', borderRadius: '50%', background: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image width={15} height={15} src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{ marginLeft: '2px', display: 'inline-block' }} alt="" />
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: '600', marginTop: '7px' }}>{vid.name.split('·')[0]}</div>
                </Link>
              ))}
            </div>

            {/* bottom nav */}
            <BottomNav />
          </div>
        </div>
      </div>

      {/* DESKTOP VIEW */}
      <div className="hidden md:block">
        <div style={{ width: '100%', minWidth: '100%', minHeight: '100vh', boxSizing: 'border-box', padding: '0px', background: '#e7e5df', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ width: '100%', background: '#f5f4f2', borderRadius: '0px', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.10)', color: '#1f1d29' }}>
            
            {/* HEADER */}
            <Header />

            {/* HERO */}
            <div style={{ padding: '34px', background: '#fff' }}>
              <div style={{ position: 'relative', height: '280px', borderRadius: '20px', overflow: 'hidden', background: "linear-gradient(120deg,rgba(58,31,110,.72),rgba(123,45,107,.5)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=720&q=70') center/cover", padding: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff' }}>
                <div style={{ fontSize: '12px', letterSpacing: '.16em', textTransform: 'uppercase', fontWeight: '600', color: '#ffd0e4' }}>Gợi ý hôm nay</div>
                <h2 style={{ fontSize: '42px', fontWeight: '800', lineHeight: '1.06', marginTop: '10px', maxWidth: '560px' }}>Tối nay đi đâu<br />ở Hà Nội?</h2>
                <p style={{ marginTop: '10px', fontSize: '15px', color: '#f0e6f4', maxWidth: '440px' }}>KTV · Bar · Casino · Spa · Nhà hàng — đặt chỗ trong vài giây.</p>
              </div>
              <div style={{ margin: '-32px 34px 0', position: 'relative', display: 'flex', gap: '10px', background: '#fff', border: '1px solid #ececec', borderRadius: '16px', padding: '12px', boxShadow: '0 12px 30px rgba(40,20,60,.12)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', borderRight: '1px solid #eee', color: '#6d28d9', fontSize: '14px', fontWeight: '600' }}>
                  <Image width={14} height={14} src="https://img.icons8.com/ios-filled/100/6D28D9/marker.png" style={{ marginRight: '6px', display: 'inline-block' }} alt="" />
                  Hà Nội
                </div>
                <div style={{ flex: '1' }}>
                  <Link href="/danh-sach-quan" style={{ textDecoration: 'none' }}>
                     <SearchBar placeholder="Tìm quán hoặc cast gần bạn…" style={{ background: 'transparent' }} />
                  </Link>
                </div>
                <Link href="/danh-sach-quan" style={{ fontWeight: '600', fontSize: '14px', color: '#fff', background: '#6d28d9', borderRadius: '11px', padding: '12px 26px' }}>Tìm</Link>
              </div>
            </div>

            {/* CATEGORIES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '12px', padding: '14px 34px 26px' }}>
              {homeCategories.slice(0, 6).map((c, idx) => (
                <Link key={idx} href={c.href} className="card" style={{ textAlign: 'center', padding: '18px 8px', background: '#fff', borderRadius: '16px', boxShadow: '0 2px 10px rgba(40,20,60,.05)' }}>
                  {c.icon.startsWith('/') || c.icon.startsWith('http') ? (
                     <Image width={28} height={28} src={c.icon} style={{ display: 'block', margin: '0 auto' }} alt="" />
                  ) : null}
                  <div style={{ fontSize: '12.5px', color: '#5b5870', marginTop: '8px', fontWeight: '500' }}>{c.name}</div>
                </Link>
              ))}
            </div>

            {/* ĐỀ XUẤT */}
            <div style={{ padding: '8px 34px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '20px' }}>
                  <Image width={22} height={22} src="https://img.icons8.com/fluency/96/crescent-moon.png" style={{ verticalAlign: '-5px', marginRight: '8px', display: 'inline-block' }} alt="" />Đề xuất tối nay đi đâu
                </div>
                <Link href="/danh-sach-quan" style={{ fontSize: '13px', color: '#8a879a' }} className="lk">Tuyển chọn bởi biên tập ▸</Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                {recs.map((v, index) => (
                  <div key={index}>
                    <VenueCard venue={v} variant="vertical" />
                  </div>
                ))}
              </div>
            </div>

            {/* COUPON HOT */}
            <div style={{ padding: '8px 34px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ fontWeight: '700', fontSize: '20px' }}>
                  <Image width={22} height={22} src="/icons/coupon.svg" style={{ verticalAlign: '-5px', marginRight: '8px', display: 'inline-block' }} alt="" />Coupon Hot
                </div>
                <span style={{ fontSize: '12.5px', color: '#8a879a' }}>Cách lấy mã &amp; tích điểm →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                {offers.map((off, idx) => (
                  <Link key={idx} href="/stores/club-lumiere" className="card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(40,20,60,.06)' }}>
                    <div style={{ height: '118px', background: off.img, position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#ffd24d', color: '#5a3d00', fontSize: '18px', fontWeight: '800', borderRadius: '12px', padding: '6px 12px' }}>{off.value}</span>
                    </div>
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '700', fontSize: '15px' }}>{off.title}</div>
                      <div style={{ fontSize: '12.5px', color: '#8a879a', marginTop: '4px' }}>{off.place}</div>
                      <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11.5px', color: '#c0246a', background: '#fce4ef', borderRadius: '10px', padding: '4px 9px', fontWeight: '600' }}>{off.expiry}</span>
                        <span style={{ fontSize: '13px', color: '#6d28d9', fontWeight: '600' }}>{off.btnLabel} ›</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* BẢNG XẾP HẠNG (interactive) */}
            <div style={{ padding: '8px 34px 28px' }}>
              <div style={{ fontWeight: '700', fontSize: '20px', marginBottom: '14px' }}>
                <Image width={22} height={22} src="/icons/bang-xep-hang.svg" style={{ verticalAlign: '-5px', marginRight: '8px', display: 'inline-block' }} alt="" />{rankTitle}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {cityTabs.map((c, index) => (
                  <div key={index} style={c.style}>{c.label}</div>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', background: '#fff', border: '1px solid #ececec', borderRadius: '18px', padding: '4px' }}>
                  <div onClick={pickQuan} style={activeRankTab === 'quan' ? activeTabStyle : inactiveTabStyle}>Quán</div>
                  <div onClick={pickCast} style={activeRankTab === 'cast' ? activeTabStyle : inactiveTabStyle}>Cast</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {rankList.map((r, index) => (
                  <RankingCard key={index} item={r} />
                ))}
              </div>
            </div>

            {/* DỊCH VỤ NỔI BẬT (interactive) */}
            <div style={{ padding: '8px 34px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontWeight: '700', fontSize: '20px' }}>
                  <Image width={22} height={22} src="/icons/dich-vu-noi-bat.svg" style={{ verticalAlign: '-5px', marginRight: '8px', display: 'inline-block' }} alt="" />Dịch vụ nổi bật
                </div>
                <div style={{ display: 'flex', gap: '8px', background: '#fff', border: '1px solid #ececec', borderRadius: '18px', padding: '4px' }}>
                  <div onClick={pickNhahang} style={activeSvcTab === 'nhahang' ? activeTabStyle : inactiveTabStyle}>Nhà hàng</div>
                  <div onClick={pickSpa} style={activeSvcTab === 'spa' ? activeTabStyle : inactiveTabStyle}>Spa &amp; Massage</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px' }}>
                {svc.map((s, index) => (
                  <div key={index} className="card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 3px 12px rgba(40,20,60,.06)' }}>
                    <div style={{ height: '118px', background: s.grad, position: 'relative' }}>
                      <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#fff', color: '#6d28d9', fontSize: '10.5px', fontWeight: '700', borderRadius: '12px', padding: '3px 9px' }}>{s.badgeText || s.tag}</span>
                    </div>
                    <div style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{s.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#8a879a', marginTop: '3px' }}>{s.area}</div>
                      <div style={{ fontSize: '12.5px', color: '#1f1d29', fontWeight: '600', marginTop: '8px' }}>{s.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* VIDEO HOT */}
            <div style={{ padding: '8px 34px 22px' }}>
              <div style={{ fontWeight: '700', fontSize: '20px', marginBottom: '14px' }}>
                <Image width={22} height={22} src="/icons/video-noi-bat.svg" style={{ verticalAlign: '-5px', marginRight: '8px', display: 'inline-block' }} alt="" />Video Hot
              </div>
              <div className="hscroll" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '8px' }}>
                {hotVideos.map((vid, idx) => (
                  <Link key={idx} href="/stores/club-lumiere" style={{ flex: 'none', width: '230px' }}>
                    <div style={{ height: '130px', borderRadius: '14px', background: vid.img, position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image width={18} height={18} src="https://img.icons8.com/ios-filled/100/6D28D9/play.png" style={{ marginLeft: '2px', display: 'inline-block' }} alt="" />
                      </span>
                      <span style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,.5)', color: '#fff', fontSize: '10.5px', borderRadius: '8px', padding: '2px 7px' }}>{vid.time}</span>
                    </div>
                    <div style={{ fontSize: '12.5px', fontWeight: '600', marginTop: '9px' }}>{vid.name}</div>
                  </Link>
                ))}
              </div>
            </div>

            {/* HƯỚNG DẪN */}
            <div style={{ padding: '8px 34px 30px' }}>
              <div style={{ background: 'linear-gradient(135deg,#f6f1ff,#fdeef5)', border: '1px solid #ece4fb', borderRadius: '20px', padding: '26px 28px' }}>
                <div style={{ fontWeight: '700', fontSize: '20px', marginBottom: '4px' }}>
                  <Image width={22} height={22} src="/icons/huong-dan-lay-ma.svg" style={{ verticalAlign: '-5px', marginRight: '8px', display: 'inline-block' }} alt="" />Hướng dẫn lấy mã &amp; tích điểm
                </div>
                <div style={{ fontSize: '13px', color: '#6e6b7a', marginBottom: '20px' }}>3 bước đơn giản — dành cho người dùng mới.</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#6d28d9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>1</div>
                    <div style={{ fontWeight: '600', fontSize: '14.5px', marginTop: '12px' }}>Chọn coupon &amp; &quot;Lấy mã&quot;</div>
                    <div style={{ fontSize: '12.5px', color: '#8a879a', marginTop: '6px', lineHeight: '1.6' }}>Mã được lưu vào ví ưu đãi trong tài khoản của bạn.</div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#6d28d9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>2</div>
                    <div style={{ fontWeight: '600', fontSize: '14.5px', marginTop: '12px' }}>Đặt chỗ &amp; nhập mã</div>
                    <div style={{ fontSize: '12.5px', color: '#8a879a', marginTop: '6px', lineHeight: '1.6' }}>Áp mã khi đặt bàn hoặc đặt cast để được giảm giá ngay.</div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#6d28d9', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px' }}>3</div>
                    <div style={{ fontWeight: '600', fontSize: '14.5px', marginTop: '12px' }}>Tích điểm sau check-in</div>
                    <div style={{ fontSize: '12.5px', color: '#8a879a', marginTop: '6px', lineHeight: '1.6' }}>Mỗi lượt sử dụng cộng điểm để đổi ưu đãi hạng cao hơn.</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
