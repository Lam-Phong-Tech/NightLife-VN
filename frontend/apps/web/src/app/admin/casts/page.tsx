"use client";

import React, { useState } from 'react';
import { X, Search, ChevronRight, Plus, Check, Play, Bell, MessageCircle } from 'lucide-react';

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
  blue: '#60a5fa',
  neonPink: '#e0729e',
};

const mockCasts = [
  { id: '1', name: 'Yuki', zodiac: 'Kim Ngưu', store: 'Club Lumière', languages: 'JP - EN - VN', tags: ['Sang chảnh', 'Vui vẻ', 'Rượu vang'], status: 'Chờ duyệt' },
  { id: '2', name: 'Rin', zodiac: 'Xử Nữ', store: 'Club Lumière', languages: 'JP - EN', tags: ['Dễ thương', 'Năng động'], status: 'Chờ duyệt' },
  { id: '3', name: 'Mai', zodiac: 'Song Ngư', store: 'Sakura Lounge', languages: 'JP - VN', tags: ['Thanh lịch', 'Trò chuyện tốt'], status: 'Chờ duyệt' },
  { id: '4', name: 'Hana', zodiac: 'Cự Giải', store: 'Akari Lounge', languages: 'JP - EN', tags: ['Sôi nổi', 'Nhảy đẹp'], status: 'Chờ duyệt' },
  { id: '5', name: 'Aoi', zodiac: 'Ma Kết', store: 'Sakura Lounge', languages: 'JP - EN - VN', tags: ['Dịu dàng', 'Hát hay'], status: 'Đang hiển thị' },
  { id: '6', name: 'Mika', zodiac: 'Thiên Bình', store: 'KTV Hoàng Gia', languages: 'VN', tags: ['Hát hay', 'Nhiệt tình'], status: 'Đang hiển thị' },
  { id: '7', name: 'Nana', zodiac: 'Sư Tử', store: 'Bar Tokyo Night', languages: 'JP', tags: ['Quyến rũ'], status: 'Ẩn' },
];

export default function AdminCastsPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedCast, setSelectedCast] = useState<typeof mockCasts[0] | null>(null);
  const [isAddingCast, setIsAddingCast] = useState(false);

  const filteredCasts = mockCasts.filter(cast => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return cast.status === 'Chờ duyệt';
    if (activeTab === 'visible') return cast.status === 'Đang hiển thị';
    if (activeTab === 'hidden') return cast.status === 'Ẩn';
    return true;
  });

  const getStatusStyle = (status: string) => {
    if (status === 'Đang hiển thị') return { color: colors.green, border: `1px solid rgba(74,222,128,0.3)` };
    if (status === 'Chờ duyệt') return { color: colors.gold, border: `1px solid ${colors.borderGold22}` };
    if (status === 'Ẩn') return { color: colors.muted, border: `1px solid ${colors.borderSoft}` };
    return { color: colors.muted, border: `1px solid ${colors.borderSoft}` };
  };

  const getAvatarStyle = (name: string) => {
    const hue = (name.length * 55) % 360;
    return {
      background: `hsl(${hue}, 40%, 80%)`,
      color: `hsl(${hue}, 60%, 20%)`
    };
  };

  const closeDrawer = () => {
    setSelectedCast(null);
    setIsAddingCast(false);
  };

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* TABS */}
          <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setActiveTab('all')}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none', 
                background: activeTab === 'all' ? colors.goldGrad : 'transparent',
                color: activeTab === 'all' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'all' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Tất cả 7
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none', 
                background: activeTab === 'pending' ? colors.goldGrad : 'transparent',
                color: activeTab === 'pending' ? colors.onGold : colors.gold,
                fontWeight: activeTab === 'pending' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Chờ duyệt 4
            </button>
            <button 
              onClick={() => setActiveTab('visible')}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none', 
                background: activeTab === 'visible' ? colors.goldGrad : 'transparent',
                color: activeTab === 'visible' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'visible' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Hiển thị 2
            </button>
            <button 
              onClick={() => setActiveTab('hidden')}
              style={{
                padding: '8px 16px', borderRadius: '6px', border: 'none', 
                background: activeTab === 'hidden' ? colors.goldGrad : 'transparent',
                color: activeTab === 'hidden' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'hidden' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Ẩn 1
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color={colors.muted} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Tìm quán, cast, booking, bill..." 
              style={{
                height: '40px', width: '280px', borderRadius: '8px', border: `1px solid ${colors.borderSoft}`,
                background: colors.surface1, color: colors.text, padding: '0 16px 0 42px', fontSize: '13px', outline: 'none',
              }}
            />
          </div>
          <select style={{
            height: '40px', borderRadius: '8px', border: `1px solid ${colors.borderSoft}`,
            background: colors.surface1, color: colors.text, padding: '0 16px', fontSize: '13px', outline: 'none', cursor: 'pointer'
          }}>
            <option>HN</option>
            <option>HCM</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', height: '40px', borderRadius: '8px', border: `1px solid ${colors.borderSoft}`, background: colors.surface1, fontSize: '13px', color: colors.text }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.green }} />
            Telegram Online
          </div>
          <button style={{ width: 40, height: 40, borderRadius: '8px', border: `1px solid ${colors.borderSoft}`, background: colors.surface1, color: colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Bell size={18} />
          </button>
          <button 
            onClick={() => { setSelectedCast(null); setIsAddingCast(true); }}
            style={{
              height: '40px', display: 'flex', alignItems: 'center', gap: '8px',
              background: colors.goldGrad, color: colors.onGold, border: 'none', padding: '0 20px',
              borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Plus size={18} strokeWidth={3} />
            Thêm cast
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>CAST</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>QUÁN TRỰC THUỘC</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>NGÔN NGỮ</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>TAGS</th>
              <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>TRẠNG THÁI</th>
              <th style={{ padding: '16px 24px', width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredCasts.map((cast, idx) => {
              const statusStyle = getStatusStyle(cast.status);
              const avatarStyle = getAvatarStyle(cast.name);
              
              return (
                <tr 
                  key={idx} 
                  onClick={() => { setIsAddingCast(false); setSelectedCast(cast); }}
                  style={{ 
                    borderBottom: `1px solid ${colors.borderSoft}`, cursor: 'pointer',
                    background: selectedCast?.id === cast.id ? colors.surface2 : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                  onMouseLeave={(e) => e.currentTarget.style.background = selectedCast?.id === cast.id ? colors.surface2 : 'transparent'}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800,
                        ...avatarStyle
                      }}>
                        {cast.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: colors.text }}>{cast.name}</div>
                        <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{cast.zodiac}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{cast.store}</td>
                  <td style={{ padding: '16px 24px', fontSize: '14px', color: colors.text2 }}>{cast.languages}</td>
                  <td style={{ padding: '16px 24px', fontSize: '13px', color: colors.text2 }}>
                    {cast.tags.join(', ')}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      border: statusStyle.border, color: statusStyle.color, 
                      padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-block'
                    }}>
                      {cast.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', color: colors.muted }}>
                    <ChevronRight size={16} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SIDE DRAWER (Modal) */}
      <div style={{
        position: 'fixed', top: 0, right: (selectedCast || isAddingCast) ? 0 : '-520px', bottom: 0, width: '520px',
        background: colors.bg, borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: (selectedCast || isAddingCast) ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100,
        display: 'flex', flexDirection: 'column'
      }}>
        {(selectedCast || isAddingCast) && (
          <>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: colors.gold }}>
                {isAddingCast ? 'THÊM CAST MỚI' : 'HỒ SƠ CAST'}
              </div>
              <button onClick={closeDrawer} style={{ width: 32, height: 32, borderRadius: '8px', background: colors.surface2, color: colors.muted, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
              {selectedCast?.status === 'Chờ duyệt' && (
                <div style={{ 
                  padding: '16px', border: `1px solid ${colors.borderGold22}`, borderRadius: '12px', 
                  display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '24px',
                  background: 'rgba(212,178,106,.05)'
                }}>
                  <div style={{ color: colors.gold, marginTop: '2px' }}>⚠️</div>
                  <div style={{ fontSize: '13px', color: colors.text2, lineHeight: 1.5 }}>
                    Nội dung chờ <span style={{ color: colors.gold, fontWeight: 700 }}>kiểm duyệt</span> trước khi public. Kiểm tra ảnh, thông tin & lời chào.
                  </div>
                </div>
              )}

              {/* CAST HEADER INFO */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                <div style={{ 
                  width: 80, height: 80, borderRadius: '16px', 
                  background: isAddingCast ? colors.surface1 : getAvatarStyle(selectedCast?.name || 'A').background,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', fontWeight: 800, color: isAddingCast ? colors.muted : getAvatarStyle(selectedCast?.name || 'A').color,
                  border: isAddingCast ? `1px dashed ${colors.borderSoft}` : 'none'
                }}>
                  {isAddingCast ? <Plus size={24} /> : selectedCast?.name.charAt(0)}
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  {isAddingCast ? (
                    <>
                      <input type="text" placeholder="Tên Cast" style={{ background: 'transparent', border: 'none', color: colors.text, fontSize: '24px', fontWeight: 700, outline: 'none', marginBottom: '8px', width: '100%' }} />
                      <select style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, color: colors.text2, fontSize: '13px', padding: '6px 12px', borderRadius: '6px', outline: 'none', width: '180px' }}>
                        <option value="" disabled selected hidden>Chọn quán trực thuộc</option>
                        <option>Sakura Lounge</option>
                        <option>Club Lumière</option>
                        <option>Akari Lounge</option>
                      </select>
                    </>
                  ) : (
                    <>
                      <h2 style={{ fontSize: '24px', fontWeight: 700, color: colors.text, margin: '0 0 4px 0' }}>{selectedCast?.name}</h2>
                      <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '8px' }}>Trực thuộc <span style={{ fontWeight: 700 }}>{selectedCast?.store}</span></div>
                      <div style={{ display: 'flex' }}>
                        <span style={{ 
                          border: getStatusStyle(selectedCast?.status || '').border, 
                          color: getStatusStyle(selectedCast?.status || '').color, 
                          padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 
                        }}>
                          {selectedCast?.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* GRID INFO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Tháng sinh · cung HĐ</div>
                  {isAddingCast ? (
                    <input type="text" placeholder="Tháng 1 · Ma Kết" style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
                  ) : (
                    <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text }}>Tháng 1 · {selectedCast?.zodiac}</div>
                  )}
                </div>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Chiều cao</div>
                  {isAddingCast ? (
                    <input type="text" placeholder="166 cm" style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
                  ) : (
                    <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text }}>162 cm</div>
                  )}
                </div>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Số đo</div>
                  {isAddingCast ? (
                    <input type="text" placeholder="87 – 61 – 89" style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
                  ) : (
                    <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text }}>85 – 59 – 87</div>
                  )}
                </div>
                <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Ngôn ngữ</div>
                  {isAddingCast ? (
                    <input type="text" placeholder="JP · EN · VN" style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
                  ) : (
                    <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text }}>{selectedCast?.languages.replace(/-/g, '·')}</div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Sở thích</div>
                {isAddingCast ? (
                  <input type="text" placeholder="Hát, piano, thời trang..." style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', outline: 'none' }} />
                ) : (
                  <div style={{ fontSize: '15px', color: colors.text2 }}>Nhảy, thời trang</div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Tags / từ khóa</div>
                {isAddingCast ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ padding: '6px 12px', borderRadius: '20px', border: `1px dashed ${colors.borderSoft}`, color: colors.muted, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <Plus size={14} /> Thêm tag
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedCast?.tags.map(tag => (
                      <div key={tag} style={{ padding: '6px 16px', borderRadius: '20px', border: `1px solid ${colors.borderGold22}`, color: colors.gold, fontSize: '13px' }}>
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px' }}>Lời chào (greeting)</div>
                {isAddingCast ? (
                  <textarea 
                    placeholder="Nhập lời chào..." 
                    style={{ width: '100%', height: '64px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', color: colors.text, fontSize: '14px', padding: '16px', outline: 'none', resize: 'none' }} 
                  />
                ) : (
                  <div style={{ padding: '16px', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', fontSize: '14px', color: colors.text }}>
                    Cùng quẩy nào! 💃
                  </div>
                )}
              </div>

              {/* ALBUM ẢNH & VIDEO */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px' }}>Album ảnh & video</div>
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  <div style={{ 
                    width: 120, height: 160, borderRadius: '12px', flexShrink: 0,
                    background: isAddingCast ? colors.surface1 : colors.blue, opacity: isAddingCast ? 1 : 0.7,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {!isAddingCast && (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <Play size={16} fill="currentColor" />
                      </div>
                    )}
                  </div>
                  <div style={{ width: 120, height: 160, borderRadius: '12px', background: 'rgba(212,178,106,.05)', flexShrink: 0 }}></div>
                  <div style={{ width: 120, height: 160, borderRadius: '12px', background: colors.surface2, flexShrink: 0 }}></div>
                  <div style={{ 
                    width: 120, height: 160, borderRadius: '12px', 
                    background: 'transparent', border: `1px dashed ${colors.borderSoft}`, 
                    flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: colors.muted, cursor: 'pointer'
                  }}>
                    <Plus size={24} />
                  </div>
                </div>
              </div>

            </div>

            {/* Actions Footer */}
            <div style={{ padding: '24px', borderTop: `1px solid ${colors.borderSoft}`, display: 'flex', gap: '16px' }}>
              {selectedCast?.status === 'Chờ duyệt' ? (
                <>
                  <button style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: colors.goldGrad, color: colors.onGold, border: 'none', height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                  }}>
                    <Check size={18} strokeWidth={3} />
                    Duyệt & hiển thị
                  </button>
                  <button style={{
                    width: '80px', background: 'transparent', color: colors.text, border: `1px solid ${colors.borderSoft}`,
                    height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    Ẩn
                  </button>
                </>
              ) : (
                <>
                  <button style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    background: colors.goldGrad, color: colors.onGold, border: 'none', height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                  }}>
                    {isAddingCast ? 'Thêm mới Cast' : 'Lưu hồ sơ'}
                  </button>
                  <button onClick={closeDrawer} style={{
                    width: '80px', background: 'transparent', color: colors.text, border: `1px solid ${colors.borderSoft}`,
                    height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                  }}>
                    {isAddingCast ? 'Hủy' : 'Ẩn'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
