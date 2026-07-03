"use client";

import React, { useState } from 'react';
import { Info, Check } from 'lucide-react';

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
};

type PartnerRequest = {
  id: string;
  code: string;
  name: string;
  type: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  desc: string;
  time: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
};

const mockRequests: PartnerRequest[] = [
  { id: '1', code: 'PR-51', name: 'Lotus Club Saigon', type: 'Club · TP. Hồ Chí Minh', contact: 'Trần Văn Long', phone: '091 ** 882', email: 'long.tran@lotusclub.vn', address: '6 Lê Lợi, Quận 1', desc: 'Club cao cấp tại trung tâm Quận 1, sức chứa 300 khách, hệ thống âm thanh Funktion-One, sảnh VIP riêng. Mong muốn tiếp cận khách Nhật & quốc tế.', time: '29/06 - 2 giờ trước', status: 'Chờ duyệt' },
  { id: '2', code: 'PR-52', name: 'Neon Saigon', type: 'Lounge · TP.HCM', contact: 'Lê Tuấn', phone: '098 ** 123', email: 'tuan@neon.vn', address: 'Bùi Viện, Quận 1', desc: 'Lounge chill nhẹ nhàng', time: '29/06 - 5 giờ trước', status: 'Chờ duyệt' },
  { id: '3', code: 'PR-53', name: 'Moonlight KTV', type: 'Karaoke · Hà Nội', contact: 'Nguyễn Thị A', phone: '090 ** 456', email: 'contact@moonlight.vn', address: 'Cầu Giấy, HN', desc: 'KTV phục vụ khách đoàn', time: '28/06 - hôm qua', status: 'Chờ duyệt' },
  { id: '4', code: 'PR-48', name: 'Lotus Club Saigon', type: 'Club · TP. Hồ Chí Minh', contact: 'Trần Văn Long', phone: '091 ** 882', email: 'long.tran@lotusclub.vn', address: '6 Lê Lợi, Quận 1', desc: 'Club cao cấp tại trung tâm Quận 1...', time: '27/06', status: 'Đã duyệt' },
  { id: '5', code: 'PR-47', name: 'Ruby Bar', type: 'Bar · Hà Nội', contact: 'Hoàng B', phone: '093 ** 789', email: 'ruby@bar.vn', address: 'Hoàn Kiếm, HN', desc: 'Bar nhỏ ấm cúng', time: '26/06', status: 'Đã duyệt' },
  { id: '6', code: 'PR-46', name: 'Sunset Spa', type: 'Massage · Hà Nội', contact: 'Đỗ Thu Hà', phone: '091 ** 908', email: 'ha@sunsetspa.vn', address: '30 Xuân Diệu, Tây Hồ', desc: 'Spa & massage trị liệu, không thuộc nhóm nightlife core.', time: '24/06', status: 'Từ chối' },
];

export default function AdminPartnersPage() {
  const [activeTab, setActiveTab] = useState<'Chờ duyệt' | 'Đã duyệt' | 'Từ chối'>('Chờ duyệt');
  
  const filteredRequests = mockRequests.filter(r => r.status === activeTab);
  const [selectedId, setSelectedId] = useState<string>(filteredRequests[0]?.id);

  // If tab changes and selected is not in tab, select first item of new tab
  React.useEffect(() => {
    if (!filteredRequests.find(r => r.id === selectedId)) {
      if (filteredRequests.length > 0) setSelectedId(filteredRequests[0].id);
    }
  }, [activeTab, filteredRequests, selectedId]);

  const selectedReq = mockRequests.find(r => r.id === selectedId);

  const getStatusStyle = (status: string) => {
    if (status === 'Đã duyệt') return { color: colors.green, border: `1px solid rgba(74,222,128,0.3)` };
    if (status === 'Từ chối') return { color: colors.red, border: `1px solid rgba(248,113,113,0.3)` };
    return { color: colors.gold, border: `1px solid ${colors.borderGold22}` };
  };

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 'calc(100vh - 80px)' }}>
      
      {/* LEFT SIDEBAR (LIST) */}
      <div style={{ width: '360px', borderRight: `1px solid ${colors.borderSoft}`, display: 'flex', flexDirection: 'column' }}>
        
        {/* TABS */}
        <div style={{ padding: '24px 20px 16px' }}>
          <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px' }}>
            <button 
              onClick={() => setActiveTab('Chờ duyệt')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: '6px', border: 'none', 
                background: activeTab === 'Chờ duyệt' ? colors.goldGrad : 'transparent',
                color: activeTab === 'Chờ duyệt' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'Chờ duyệt' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Chờ duyệt {mockRequests.filter(r => r.status === 'Chờ duyệt').length}
            </button>
            <button 
              onClick={() => setActiveTab('Đã duyệt')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: '6px', border: 'none', 
                background: activeTab === 'Đã duyệt' ? colors.goldGrad : 'transparent',
                color: activeTab === 'Đã duyệt' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'Đã duyệt' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Đã duyệt
            </button>
            <button 
              onClick={() => setActiveTab('Từ chối')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: '6px', border: 'none', 
                background: activeTab === 'Từ chối' ? colors.goldGrad : 'transparent',
                color: activeTab === 'Từ chối' ? colors.onGold : colors.muted,
                fontWeight: activeTab === 'Từ chối' ? 700 : 500,
                fontSize: '13px', cursor: 'pointer'
              }}
            >
              Từ chối
            </button>
          </div>
        </div>

        {/* LIST */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRequests.map(req => {
              const isSelected = req.id === selectedId;
              const statusStyle = getStatusStyle(req.status);
              return (
                <div 
                  key={req.id}
                  onClick={() => setSelectedId(req.id)}
                  style={{
                    padding: '16px', borderRadius: '12px', cursor: 'pointer',
                    background: isSelected ? 'rgba(212,178,106,.05)' : colors.surface1,
                    border: `1px solid ${isSelected ? colors.borderGold22 : colors.borderSoft}`,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: isSelected ? colors.gold : colors.text }}>{req.name}</div>
                    <span style={{ 
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px',
                      color: statusStyle.color, border: statusStyle.border 
                    }}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '8px' }}>{req.type}</div>
                  <div style={{ fontSize: '12px', color: colors.muted, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${colors.muted}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.muted }} />
                    </div>
                    {req.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (DETAILS) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: colors.bg, overflowY: 'auto' }}>
        {selectedReq ? (
          <div style={{ padding: '40px', maxWidth: '900px', width: '100%' }}>
            
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.muted, marginBottom: '8px' }}>YÊU CẦU HỢP TÁC · {selectedReq.code}</div>
                <h2 style={{ fontSize: '28px', fontWeight: 700, color: colors.text, margin: '0 0 4px 0' }}>{selectedReq.name}</h2>
                <div style={{ fontSize: '14px', color: colors.muted }}>{selectedReq.type}</div>
              </div>
              <span style={{ 
                padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                color: getStatusStyle(selectedReq.status).color, border: getStatusStyle(selectedReq.status).border 
              }}>
                {selectedReq.status}
              </span>
            </div>

            {/* INFO GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
              <div>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px' }}>Người liên hệ</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text }}>{selectedReq.contact}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px' }}>Số điện thoại</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.gold }}>{selectedReq.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text }}>{selectedReq.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '4px' }}>Địa chỉ</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text }}>{selectedReq.address}</div>
              </div>
            </div>

            {/* DESC */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px' }}>Giới thiệu quán</div>
              <div style={{ padding: '20px', borderRadius: '12px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, fontSize: '14px', color: colors.text2, lineHeight: 1.6 }}>
                {selectedReq.desc}
              </div>
            </div>

            {/* IMAGES */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px' }}>Ảnh gửi kèm</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                <div style={{ aspectRatio: '1', borderRadius: '12px', background: '#2c241b' }}></div>
                <div style={{ aspectRatio: '1', borderRadius: '12px', background: '#1f1b26' }}></div>
                <div style={{ aspectRatio: '1', borderRadius: '12px', background: '#1c2427' }}></div>
                <div style={{ aspectRatio: '1', borderRadius: '12px', background: '#271b1e' }}></div>
              </div>
            </div>

            {/* INFO BOX */}
            <div style={{ 
              padding: '16px', borderRadius: '12px', border: `1px solid rgba(96,165,250,0.3)`, 
              background: 'rgba(96,165,250,0.05)', display: 'flex', gap: '12px', alignItems: 'center',
              marginBottom: selectedReq.status === 'Chờ duyệt' ? '32px' : '0'
            }}>
              <Info size={16} color={colors.blue} />
              <div style={{ fontSize: '13px', color: colors.text2 }}>
                MVP không yêu cầu giấy phép KD. Duyệt → Admin nhập thông tin quán (tạo hồ sơ nháp) rồi bổ sung giá/giờ/ảnh.
              </div>
            </div>

            {/* ACTIONS / STATUS BOTTOM */}
            {selectedReq.status === 'Chờ duyệt' && (
              <div style={{ display: 'flex', gap: '16px' }}>
                <button style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: colors.goldGrad, color: colors.onGold, border: 'none', height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                }}>
                  <Check size={18} strokeWidth={3} />
                  Duyệt & nhập thông tin quán
                </button>
                <button style={{
                  width: '120px', background: 'transparent', color: colors.text, border: `1px solid ${colors.borderSoft}`,
                  height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
                }}>
                  Từ chối
                </button>
              </div>
            )}

            {selectedReq.status === 'Đã duyệt' && (
              <div style={{ 
                marginTop: '16px', padding: '16px', borderRadius: '12px', border: `1px solid rgba(74,222,128,0.3)`, 
                background: 'rgba(74,222,128,0.05)', display: 'flex', gap: '12px', alignItems: 'center'
              }}>
                <Check size={16} color={colors.green} />
                <div style={{ fontSize: '13px', color: colors.text }}>
                  Đã duyệt - hồ sơ quán nháp đã được tạo trong mục Quán.
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, fontSize: '14px' }}>
            Chọn một yêu cầu để xem chi tiết
          </div>
        )}
      </div>

    </div>
  );
}
