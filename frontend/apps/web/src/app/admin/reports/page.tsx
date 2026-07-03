"use client";

import React, { useState } from 'react';
import { Download } from 'lucide-react';

const colors = {
  bg: '#0f0f13',
  surface1: '#18181f',
  surface2: '#202028',
  borderSoft: 'rgba(255,255,255,.05)',
  borderGold22: 'rgba(212,178,106,.22)',
  text: '#f3f0ea',
  text2: '#c5c0b6',
  muted: '#8c8679',
  onGold: '#241a0a',
  gold: '#d4b26a',
  goldGrad: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  green: '#4ade80',
  red: '#f87171',
};

// Mock data for tables
const dataDay = [
  { day: '30/06', gop: '22.000.000đ', thuan: '20.200.000đ', hh: '3.100.000đ', gg: '1.800.000đ', bill: 7 },
  { day: '29/06', gop: '18.400.000đ', thuan: '17.000.000đ', hh: '2.800.000đ', gg: '1.400.000đ', bill: 5 },
  { day: '28/06', gop: '14.200.000đ', thuan: '13.100.000đ', hh: '2.000.000đ', gg: '1.100.000đ', bill: 4 },
  { day: '27/06', gop: '26.500.000đ', thuan: '24.400.000đ', hh: '3.700.000đ', gg: '2.100.000đ', bill: 8 },
  { day: '26/06', gop: '19.800.000đ', thuan: '18.200.000đ', hh: '2.800.000đ', gg: '1.600.000đ', bill: 6 },
  { day: '25/06', gop: '12.400.000đ', thuan: '11.400.000đ', hh: '1.700.000đ', gg: '1.000.000đ', bill: 3 },
  { day: '24/06', gop: '9.600.000đ', thuan: '8.900.000đ', hh: '1.300.000đ', gg: '700.000đ', bill: 3 },
];

const dataStore = [
  { store: 'Club Lumière', gop: '88.500.000đ', thuan: '81.400.000đ', hh: '15.900.000đ', gg: '7.100.000đ', bill: 26 },
  { store: 'Akari Lounge', gop: '62.000.000đ', thuan: '56.900.000đ', hh: '12.400.000đ', gg: '5.100.000đ', bill: 19 },
  { store: 'Sakura Lounge', gop: '54.300.000đ', thuan: '50.100.000đ', hh: '8.100.000đ', gg: '4.200.000đ', bill: 17 },
  { store: 'KTV Hoàng Gia', gop: '48.700.000đ', thuan: '45.600.000đ', hh: '5.800.000đ', gg: '3.100.000đ', bill: 15 },
  { store: 'Bar Tokyo Night', gop: '36.200.000đ', thuan: '33.500.000đ', hh: '5.400.000đ', gg: '2.700.000đ', bill: 12 },
  { store: 'Lotus Club Saigon', gop: '22.300.000đ', thuan: '20.500.000đ', hh: '3.200.000đ', gg: '1.800.000đ', bill: 7 },
];

const dataPromo = [
  { promo: '-30% Happy Hour', gop: '68.400.000đ', thuan: '47.900.000đ', hh: '9.200.000đ', gg: '20.500.000đ', bill: 22 },
  { promo: '-10% VIP độc quyền', gop: '42.100.000đ', thuan: '37.900.000đ', hh: '6.800.000đ', gg: '4.200.000đ', bill: 11 },
  { promo: '-8% Thành viên', gop: '55.600.000đ', thuan: '51.200.000đ', hh: '8.300.000đ', gg: '4.400.000đ', bill: 18 },
  { promo: '-5% Khách mới', gop: '31.200.000đ', thuan: '29.600.000đ', hh: '4.400.000đ', gg: '1.600.000đ', bill: 14 },
  { promo: '2+1 Combo VIP', gop: '24.800.000đ', thuan: '22.300.000đ', hh: '3.700.000đ', gg: '2.500.000đ', bill: 6 },
];

// Mock chart bars heights (0-100%)
const chartBars = [
  40, 60, 30, 45, 55, 65, 60, 45, 50, 48, 70, 55, 50, 65, 60, 
  55, 75, 55, 55, 80, 65, 60, 75, 60, 65, 85, 65, 60, 80, 60
];

export default function AdminRevenuePage() {
  const [timeTab, setTimeTab] = useState<'Tuần' | 'Tháng 6' | 'Năm'>('Tháng 6');
  const [dataTab, setDataTab] = useState<'day' | 'store' | 'promo'>('day');

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%', overflowY: 'auto' }}>
      
      {/* HEADER CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Time Filter */}
          <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px' }}>
            {['Tuần', 'Tháng 6', 'Năm'].map(tab => (
              <button 
                key={tab}
                onClick={() => setTimeTab(tab as any)}
                style={{
                  padding: '8px 24px', borderRadius: '6px', border: 'none', 
                  background: timeTab === tab ? colors.goldGrad : 'transparent',
                  color: timeTab === tab ? colors.onGold : colors.muted,
                  fontWeight: timeTab === tab ? 700 : 500,
                  fontSize: '13px', cursor: 'pointer'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Area Filter */}
          <select style={{ 
            background: colors.surface1, border: `1px solid ${colors.borderSoft}`, color: colors.muted,
            padding: '0 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, outline: 'none', cursor: 'pointer'
          }}>
            <option>Tất cả khu vực</option>
            <option>Hà Nội</option>
            <option>TP. Hồ Chí Minh</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            background: colors.surface1, border: `1px solid ${colors.borderSoft}`, color: colors.muted,
            padding: '0 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>
            P2
          </button>
          <button style={{
            background: colors.surface1, border: `1px solid ${colors.borderSoft}`, color: colors.text,
            padding: '0 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Download size={16} /> Xuất Excel / PDF
          </button>
        </div>
      </div>

      {/* KPI BOXES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {/* DOANH THU GỘP */}
        <div style={{ 
          padding: '24px', borderRadius: '16px', background: colors.surface1,
          border: `1px solid ${colors.borderGold22}`, position: 'relative', overflow: 'hidden'
        }}>
          {/* Subtle gold gradient background hint */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, rgba(212,178,106,0.1) 0%, transparent 100%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: '12px', fontWeight: 700, color: colors.gold, letterSpacing: '1px', marginBottom: '12px', position: 'relative' }}>DOANH THU GỘP</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: colors.gold, marginBottom: '8px', position: 'relative' }}>312.000.000₫</div>
          <div style={{ fontSize: '12px', color: colors.green, fontWeight: 600, position: 'relative' }}>▲ 18% <span style={{ color: colors.muted }}>so tháng 5</span></div>
        </div>

        {/* DOANH THU THUẦN */}
        <div style={{ padding: '24px', borderRadius: '16px', background: colors.surface1, border: `1px solid ${colors.borderSoft}` }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', marginBottom: '12px' }}>DOANH THU THUẦN</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: colors.text, marginBottom: '8px' }}>288.000.000₫</div>
          <div style={{ fontSize: '12px', color: colors.muted }}>Sau giảm giá khách</div>
        </div>

        {/* HOA HỒNG ADMIN */}
        <div style={{ padding: '24px', borderRadius: '16px', background: colors.surface1, border: `1px solid ${colors.borderSoft}` }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', marginBottom: '12px' }}>HOA HỒNG ADMIN</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: colors.text, marginBottom: '8px' }}>41.800.000₫</div>
          <div style={{ fontSize: '12px', color: colors.muted }}>Sản thực nhận</div>
        </div>

        {/* TIỀN GIẢM GIÁ */}
        <div style={{ padding: '24px', borderRadius: '16px', background: colors.surface1, border: `1px solid ${colors.borderSoft}` }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', marginBottom: '12px' }}>TIỀN GIẢM GIÁ</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: colors.red, marginBottom: '8px' }}>24.000.000₫</div>
          <div style={{ fontSize: '12px', color: colors.muted }}>Ưu đãi cho khách</div>
        </div>
      </div>

      {/* CHART */}
      <div style={{ padding: '24px', borderRadius: '16px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: colors.text }}>Doanh thu theo ngày · {timeTab.toLowerCase()}</div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: colors.muted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '2px', background: colors.goldGrad }}></div> Gộp
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '2px', background: 'rgba(212,178,106,0.3)' }}></div> Hoa hồng
            </div>
          </div>
        </div>
        
        {/* Mock Chart Area */}
        <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '20px', position: 'relative' }}>
          {/* Grid lines */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: colors.borderSoft }} />
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: colors.borderSoft }} />
          <div style={{ position: 'absolute', bottom: '20px', left: 0, right: 0, height: '1px', background: colors.borderSoft }} />
          
          {/* Bars */}
          {chartBars.map((height, idx) => (
            <div key={idx} style={{ 
              width: '2%', height: `${height}%`, background: 'linear-gradient(180deg, #d4b26a 0%, rgba(212,178,106,0.3) 100%)', 
              borderRadius: '2px 2px 0 0', position: 'relative', zIndex: 1,
              opacity: (idx === 15 || idx === 19 || idx === 22 || idx === 25 || idx === 28) ? 1 : 0.6
            }} />
          ))}

          {/* X Axis Labels */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: colors.muted }}>
            <span style={{ width: '2%', textAlign: 'center' }}>1</span>
            <span style={{ width: '2%', textAlign: 'center', position: 'absolute', left: '13.3%' }}>4</span>
            <span style={{ width: '2%', textAlign: 'center', position: 'absolute', left: '26.6%' }}>7</span>
            <span style={{ width: '2%', textAlign: 'center', position: 'absolute', left: '40%' }}>10</span>
            <span style={{ width: '2%', textAlign: 'center', position: 'absolute', left: '53.3%' }}>13</span>
            <span style={{ width: '2%', textAlign: 'center', position: 'absolute', left: '66.6%' }}>16</span>
            <span style={{ width: '2%', textAlign: 'center', position: 'absolute', left: '80%' }}>19</span>
            <span style={{ width: '2%', textAlign: 'center', position: 'absolute', left: '93.3%' }}>22</span>
            <span style={{ width: '2%', textAlign: 'center', position: 'absolute', left: '106.6%' }}>25</span>
            <span style={{ width: '2%', textAlign: 'center', right: '0' }}>28</span>
          </div>
        </div>
      </div>

      {/* TABLE TABS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px', border: `1px solid ${colors.borderSoft}` }}>
          <button 
            onClick={() => setDataTab('day')}
            style={{
              padding: '8px 20px', borderRadius: '6px', border: 'none', 
              background: dataTab === 'day' ? colors.goldGrad : 'transparent',
              color: dataTab === 'day' ? colors.onGold : colors.muted,
              fontWeight: dataTab === 'day' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Theo ngày
          </button>
          <button 
            onClick={() => setDataTab('store')}
            style={{
              padding: '8px 20px', borderRadius: '6px', border: 'none', 
              background: dataTab === 'store' ? colors.goldGrad : 'transparent',
              color: dataTab === 'store' ? colors.onGold : colors.muted,
              fontWeight: dataTab === 'store' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Theo quán
          </button>
          <button 
            onClick={() => setDataTab('promo')}
            style={{
              padding: '8px 20px', borderRadius: '6px', border: 'none', 
              background: dataTab === 'promo' ? colors.goldGrad : 'transparent',
              color: dataTab === 'promo' ? colors.onGold : colors.muted,
              fontWeight: dataTab === 'promo' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Theo mã giảm
          </button>
        </div>
        <div style={{ fontSize: '11px', color: colors.muted, letterSpacing: '0.5px' }}>
          Ưu tiên xem: ngày → quán → mã giảm → khác
        </div>
      </div>

      {/* DATA TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
            <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'left' }}>
              {dataTab === 'day' ? 'NGÀY' : dataTab === 'store' ? 'QUÁN' : 'MÃ GIẢM GIÁ'}
            </th>
            <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>GỘP</th>
            <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>THUẦN</th>
            <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>HOA HỒNG</th>
            <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>GIẢM GIÁ</th>
            <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>BILL</th>
          </tr>
        </thead>
        <tbody>
          {dataTab === 'day' && dataDay.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: 700, color: colors.text, textAlign: 'left' }}>{row.day}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.gop}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.thuan}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: 700, color: colors.gold }}>{row.hh}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.red }}>{row.gg}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.bill}</td>
            </tr>
          ))}
          
          {dataTab === 'store' && dataStore.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: 700, color: colors.text, textAlign: 'left' }}>{row.store}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.gop}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.thuan}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: 700, color: colors.gold }}>{row.hh}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.red }}>{row.gg}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.bill}</td>
            </tr>
          ))}

          {dataTab === 'promo' && dataPromo.map((row, idx) => (
            <tr key={idx} style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: 700, color: colors.text, textAlign: 'left' }}>{row.promo}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.gop}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.thuan}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', fontWeight: 700, color: colors.gold }}>{row.hh}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.red }}>{row.gg}</td>
              <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{row.bill}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}
