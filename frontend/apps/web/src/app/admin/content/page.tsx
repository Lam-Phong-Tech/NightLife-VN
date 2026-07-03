"use client";

import React, { useState } from 'react';
import { Plus, X, Search, ChevronRight, Eye, Calendar, MapPin, Tag as TagIcon, Layout, AlignLeft } from 'lucide-react';

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
  blue: '#60a5fa',
};

const mockCampaigns = [
  { id: '1', discount: '-30%', name: 'Happy Hour', apply: 'Club Lumière', time: '01/06 - 07/07', status: 'Đang chạy' },
  { id: '2', discount: '-10%', name: 'VIP độc quyền', apply: 'Akari Lounge', time: '15/06 - 15/07', status: 'Đang chạy' },
  { id: '3', discount: '-5%', name: 'Ưu đãi khách mới', apply: 'Toàn hệ thống', time: 'Luôn áp dụng', status: 'Đang chạy' },
  { id: '4', discount: '2+1', name: 'Combo phòng VIP', apply: 'KTV Hoàng Gia', time: '01/07 - 31/07', status: 'Đã lên lịch' },
  { id: '5', discount: '-20%', name: 'Tết Trung Thu', apply: 'Toàn hệ thống', time: '01/09 - 17/09', status: 'Đã kết thúc' },
];

const mockBanners = [
  { id: '1', tag: 'HERO CHÍNH', title: 'Đêm nhạc DJ SODA · Club Lumière', pos: 'Trang chủ #1', status: 'Đang hiển thị' },
  { id: '2', tag: 'HERO PHỤ', title: 'Sakura Lounge · Ưu đãi thành viên', pos: 'Trang chủ #2', status: 'Đang hiển thị' },
  { id: '3', tag: 'ƯU ĐÃI', title: 'Happy Hour -30% cuối tuần', pos: 'Trang Ưu đãi', status: 'Ẩn' },
  { id: '4', tag: 'SỰ KIỆN', title: 'Countdown Party 2027', pos: 'Nháp', status: 'Ẩn' },
];

const mockBlogs = [
  { id: '1', title: 'Top 5 club sôi động nhất Hà Nội 2026', cat: 'Cẩm nang', date: '28/06/2026', views: '2.4k', status: 'Đã đăng', color: '#33261a' },
  { id: '2', title: 'Hướng dẫn khách Nhật đặt bàn nightlife an toàn', cat: 'Hướng dẫn', date: '25/08/2026', views: '1.8k', status: 'Đã đăng', color: '#271932' },
  { id: '3', title: 'Văn hóa Karaoke & KTV tại Việt Nam', cat: 'Blog', date: '--', views: '--', status: 'Nháp', color: '#1a2328' },
  { id: '4', title: 'Cách chọn Cast phù hợp cho buổi tối của bạn', cat: 'Cẩm nang', date: '--', views: '--', status: 'Nháp', color: '#321921' },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'campaign' | 'banner' | 'blog'>('campaign');
  const [isAdding, setIsAdding] = useState<'campaign' | 'banner' | 'blog' | null>(null);

  const getCampaignStatusStyle = (status: string) => {
    if (status === 'Đang chạy') return { color: colors.green, border: `1px solid rgba(74,222,128,0.3)` };
    if (status === 'Đã lên lịch') return { color: colors.blue, border: `1px solid rgba(96,165,250,0.3)` };
    return { color: colors.muted, border: `1px solid ${colors.borderSoft}` };
  };

  const getBannerStatusStyle = (status: string) => {
    if (status === 'Đang hiển thị') return { color: colors.green, border: `1px solid rgba(74,222,128,0.3)` };
    return { color: colors.muted, border: `1px solid ${colors.borderSoft}` };
  };

  const getBlogStatusStyle = (status: string) => {
    if (status === 'Đã đăng') return { color: colors.green, border: `1px solid rgba(74,222,128,0.3)` };
    if (status === 'Nháp') return { color: colors.gold, border: `1px solid ${colors.borderGold22}` };
    return { color: colors.muted, border: `1px solid ${colors.borderSoft}` };
  };

  const closeDrawer = () => setIsAdding(null);

  const renderDrawerContent = () => {
    if (isAdding === 'campaign') {
      return (
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '16px', background: colors.surface1, border: `1px dashed ${colors.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted }}>
              <TagIcon size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <input type="text" placeholder="Tên Campaign (VD: Happy Hour)" style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '24px', fontWeight: 700, outline: 'none', marginBottom: '8px' }} />
              <input type="text" placeholder="% Giảm giá hoặc loại KM" style={{ width: '100%', background: 'transparent', border: 'none', color: colors.gold, fontSize: '15px', fontWeight: 700, outline: 'none' }} />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}><Calendar size={14} /> Thời gian áp dụng</div>
              <input type="text" placeholder="VD: 01/06 - 07/07" style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 600, outline: 'none' }} />
            </div>
            <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}><MapPin size={14} /> Quán áp dụng</div>
              <select style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                <option value="" disabled selected hidden>Chọn quán...</option>
                <option>Toàn hệ thống</option>
                <option>Club Lumière</option>
                <option>Akari Lounge</option>
              </select>
            </div>
          </div>
        </div>
      );
    }
    
    if (isAdding === 'banner') {
      return (
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <div style={{ width: '100%', height: 200, borderRadius: '16px', background: colors.surface1, border: `1px dashed ${colors.borderSoft}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: colors.muted, marginBottom: '32px', cursor: 'pointer' }}>
            <Plus size={32} style={{ marginBottom: '8px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>Tải lên ảnh Banner (1920x800)</span>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <input type="text" placeholder="Tiêu đề Banner..." style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '24px', fontWeight: 700, outline: 'none', marginBottom: '16px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}><TagIcon size={14} /> Tag / Loại Banner</div>
              <select style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                <option value="" disabled selected hidden>Chọn Tag...</option>
                <option>HERO CHÍNH</option>
                <option>HERO PHỤ</option>
                <option>ƯU ĐÃI</option>
                <option>SỰ KIỆN</option>
              </select>
            </div>
            <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '8px', display: 'flex', gap: '6px', alignItems: 'center' }}><Layout size={14} /> Vị trí hiển thị</div>
              <select style={{ width: '100%', background: 'transparent', border: 'none', color: colors.text, fontSize: '15px', fontWeight: 600, outline: 'none', cursor: 'pointer' }}>
                <option value="" disabled selected hidden>Chọn vị trí...</option>
                <option>Trang chủ #1</option>
                <option>Trang chủ #2</option>
                <option>Trang Ưu đãi</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (isAdding === 'blog') {
      return (
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', alignItems: 'flex-start' }}>
            <div style={{ width: 120, height: 80, borderRadius: '12px', background: colors.surface1, border: `1px dashed ${colors.borderSoft}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.muted, flexShrink: 0, cursor: 'pointer' }}>
              <Plus size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <textarea placeholder="Nhập tiêu đề bài viết..." style={{ width: '100%', height: '60px', background: 'transparent', border: 'none', color: colors.text, fontSize: '20px', fontWeight: 700, outline: 'none', resize: 'none' }} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <select style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, color: colors.text2, fontSize: '12px', padding: '6px 12px', borderRadius: '6px', outline: 'none', cursor: 'pointer' }}>
                  <option value="" disabled selected hidden>Chuyên mục</option>
                  <option>Cẩm nang</option>
                  <option>Hướng dẫn</option>
                  <option>Blog</option>
                </select>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ padding: '16px', background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '12px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '12px', color: colors.muted, marginBottom: '12px', display: 'flex', gap: '6px', alignItems: 'center', borderBottom: `1px solid ${colors.borderSoft}`, paddingBottom: '12px' }}>
                <AlignLeft size={14} /> Nội dung
              </div>
              <textarea placeholder="Bắt đầu viết nội dung ở đây..." style={{ width: '100%', flex: 1, background: 'transparent', border: 'none', color: colors.text, fontSize: '14px', outline: 'none', resize: 'none', lineHeight: 1.6 }} />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%' }}>
      
      {/* TABS & BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', background: colors.surface1, borderRadius: '8px', padding: '4px' }}>
          <button 
            onClick={() => setActiveTab('campaign')}
            style={{
              padding: '8px 24px', borderRadius: '6px', border: 'none', 
              background: activeTab === 'campaign' ? colors.goldGrad : 'transparent',
              color: activeTab === 'campaign' ? colors.onGold : colors.muted,
              fontWeight: activeTab === 'campaign' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Campaign & Discount
          </button>
          <button 
            onClick={() => setActiveTab('banner')}
            style={{
              padding: '8px 24px', borderRadius: '6px', border: 'none', 
              background: activeTab === 'banner' ? colors.goldGrad : 'transparent',
              color: activeTab === 'banner' ? colors.onGold : colors.muted,
              fontWeight: activeTab === 'banner' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Banner
          </button>
          <button 
            onClick={() => setActiveTab('blog')}
            style={{
              padding: '8px 24px', borderRadius: '6px', border: 'none', 
              background: activeTab === 'blog' ? colors.goldGrad : 'transparent',
              color: activeTab === 'blog' ? colors.onGold : colors.muted,
              fontWeight: activeTab === 'blog' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Blog
          </button>
        </div>

        <button 
          onClick={() => setIsAdding(activeTab)}
          style={{
            height: '40px', display: 'flex', alignItems: 'center', gap: '8px',
            background: colors.goldGrad, color: colors.onGold, border: 'none', padding: '0 20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
          }}
        >
          <Plus size={18} strokeWidth={3} />
          {activeTab === 'campaign' ? 'Thêm campaign' : activeTab === 'banner' ? 'Thêm banner' : 'Viết bài'}
        </button>
      </div>

      {/* CAMPAIGN CONTENT */}
      {activeTab === 'campaign' && (
        <div style={{ background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.borderSoft}` }}>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>CHƯƠNG TRÌNH</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>ÁP DỤNG</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px' }}>THỜI GIAN</th>
                <th style={{ padding: '16px 24px', fontSize: '11px', fontWeight: 700, color: colors.muted, letterSpacing: '1px', textAlign: 'right' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {mockCampaigns.map((camp, idx) => (
                <tr key={idx} style={{ borderBottom: idx === mockCampaigns.length - 1 ? 'none' : `1px solid ${colors.borderSoft}` }}>
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: colors.gold }}>{camp.discount}</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>{camp.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{camp.apply}</td>
                  <td style={{ padding: '20px 24px', fontSize: '14px', color: colors.text2 }}>{camp.time}</td>
                  <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                    <span style={{ 
                      border: getCampaignStatusStyle(camp.status).border, 
                      color: getCampaignStatusStyle(camp.status).color, 
                      padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-block'
                    }}>
                      {camp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* BANNER CONTENT */}
      {activeTab === 'banner' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {mockBanners.map((banner, idx) => (
            <div key={idx} style={{ 
              height: '220px', borderRadius: '16px', border: `1px solid ${colors.borderSoft}`, 
              background: 'linear-gradient(180deg, rgba(24,24,31,0) 0%, rgba(24,24,31,0.8) 100%), #1f1f26', 
              padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative'
            }}>
              <div>
                <span style={{ 
                  display: 'inline-block', padding: '4px 12px', borderRadius: '16px', 
                  border: `1px solid ${colors.borderGold22}`, color: colors.gold, 
                  fontSize: '11px', fontWeight: 800, letterSpacing: '1px' 
                }}>
                  {banner.tag}
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: colors.text, margin: '0 0 16px 0' }}>{banner.title}</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', color: colors.muted }}>Vị trí: <span style={{ color: colors.text2 }}>{banner.pos}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {banner.status === 'Đang hiển thị' && <div style={{ width: 6, height: 6, borderRadius: '50%', background: colors.green }} />}
                    <span style={{ 
                      color: getBannerStatusStyle(banner.status).color, 
                      padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                      border: getBannerStatusStyle(banner.status).border
                    }}>
                      {banner.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BLOG CONTENT */}
      {activeTab === 'blog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mockBlogs.map((blog, idx) => (
            <div key={idx} style={{ 
              background: colors.surface1, border: `1px solid ${colors.borderSoft}`, 
              borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '20px'
            }}>
              <div style={{ width: '96px', height: '64px', borderRadius: '8px', background: blog.color, flexShrink: 0 }}></div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, margin: '0 0 6px 0' }}>{blog.title}</h3>
                <div style={{ fontSize: '13px', color: colors.muted }}>{blog.cat} · {blog.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.muted, fontSize: '13px' }}>
                  <Eye size={16} /> {blog.views}
                </div>
                <span style={{ 
                  border: getBlogStatusStyle(blog.status).border, 
                  color: getBlogStatusStyle(blog.status).color, 
                  padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-block', minWidth: '80px', textAlign: 'center'
                }}>
                  {blog.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD DRAWER */}
      <div style={{
        position: 'fixed', top: 0, right: isAdding ? 0 : '-520px', bottom: 0, width: '520px',
        background: colors.bg, borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: isAdding ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100,
        display: 'flex', flexDirection: 'column'
      }}>
        {isAdding && (
          <>
            <div style={{ padding: '24px', borderBottom: `1px solid ${colors.borderSoft}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: colors.gold, textTransform: 'uppercase' }}>
                THÊM MỚI {isAdding}
              </div>
              <button onClick={closeDrawer} style={{ width: 32, height: 32, borderRadius: '8px', background: colors.surface2, color: colors.muted, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {renderDrawerContent()}

            <div style={{ padding: '24px', borderTop: `1px solid ${colors.borderSoft}`, display: 'flex', gap: '16px' }}>
              <button style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: colors.goldGrad, color: colors.onGold, border: 'none', height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
              }}>
                Lưu {isAdding}
              </button>
              <button onClick={closeDrawer} style={{
                width: '80px', background: 'transparent', color: colors.text, border: `1px solid ${colors.borderSoft}`,
                height: '48px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
              }}>
                Hủy
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
