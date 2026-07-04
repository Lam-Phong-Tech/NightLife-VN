"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X, Search, ChevronRight, Eye, Calendar, MapPin, Tag as TagIcon, Layout, AlignLeft, Image as ImageIcon, Settings } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import { contentApi } from '@/lib/api/content';
import { categoriesApi, CategoryItem } from '@/lib/api/categories';

const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false, 
  loading: () => <div style={{ height: 190, background: 'rgba(12,12,15,.55)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', fontSize: 13, border: '1px solid rgba(255,255,255,.1)' }}>Đang tải Editor...</div>
});

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

const mockFeatured = [
  { id: '1', img: '#2c1e16', badge: 'HOT', name: 'Combo Sinh Nhật VIP', sub: 'Opera Spa Hải Phòng', labels: ['Đặt bàn nhanh', 'Mới'] },
  { id: '2', img: '#1a1d24', name: 'Gói Private Party', sub: 'Club Lumière', labels: ['Không nhãn'] },
];

const mockVideos = [
  { id: '1', venue: 'Club Lumière', title: 'Tour không gian quán', dur: '01:24', rank: '1', color: '#2a2215' },
  { id: '2', venue: 'Sakura Lounge', title: 'Dessert & cocktail signature', dur: '00:38', rank: '2', color: '#1a1824' },
  { id: '3', venue: 'Akari Lounge', title: 'Đêm nhạc acoustic cuối tuần', dur: '00:52', rank: '3', color: '#1b1e22' },
];

const mockVideoSearch = [
  { id: '4', venue: 'KTV Hoàng Gia', title: 'Phòng VIP tổng thống · 01:05', color: '#271b20' },
  { id: '5', venue: 'Bar Tokyo Night', title: 'Quầy bar signature · 00:44', color: '#1a221f' },
];

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'campaign' | 'banner' | 'featured' | 'video' | 'blog'>('campaign');
  const [isAdding, setIsAdding] = useState<'campaign' | 'banner' | 'featured' | 'video' | 'blog' | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Cẩm nang');
  const [blogLanguage, setBlogLanguage] = useState('Tiếng Việt');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.adminList('BLOG');
      if (data) {
        setCategories(data);
        if (data.length > 0 && data[0] && !blogCategory) {
          setBlogCategory(data[0].name);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      setIsSubmittingCategory(true);
      await categoriesApi.adminCreate({
        name: newCategoryName,
        slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
        type: 'BLOG',
      });
      setNewCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
      alert('Có lỗi xảy ra khi thêm chuyên mục.');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chuyên mục này?')) return;
    try {
      await categoriesApi.adminDelete(id);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Có lỗi xảy ra khi xóa chuyên mục.');
    }
  };

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

  const handleSaveBlog = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!blogTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    try {
      setIsSubmitting(true);
      await contentApi.adminCreate({
        type: 'BLOG',
        title: blogTitle,
        status,
        excerpt: blogExcerpt,
        body: blogContent,
        metadata: {
          category: blogCategory,
          language: blogLanguage,
        }
      });
      alert(status === 'DRAFT' ? 'Đã lưu nháp thành công!' : 'Đã đăng bài thành công!');
      closeDrawer();
      setBlogTitle('');
      setBlogCategory('Cẩm nang');
      setBlogLanguage('Tiếng Việt');
      setBlogExcerpt('');
      setBlogContent('');
    } catch (error) {
      console.error('Failed to save blog:', error);
      alert('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      return null;
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
            onClick={() => setActiveTab('featured')}
            style={{
              padding: '8px 24px', borderRadius: '6px', border: 'none', 
              background: activeTab === 'featured' ? colors.goldGrad : 'transparent',
              color: activeTab === 'featured' ? colors.onGold : colors.muted,
              fontWeight: activeTab === 'featured' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Dịch vụ nổi bật
          </button>
          <button 
            onClick={() => setActiveTab('video')}
            style={{
              padding: '8px 24px', borderRadius: '6px', border: 'none', 
              background: activeTab === 'video' ? colors.goldGrad : 'transparent',
              color: activeTab === 'video' ? colors.onGold : colors.muted,
              fontWeight: activeTab === 'video' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Video Hot
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
          {activeTab === 'campaign' ? 'Thêm campaign' : activeTab === 'banner' ? 'Thêm banner' : activeTab === 'featured' ? 'Thêm dịch vụ' : activeTab === 'video' ? 'Thêm video' : 'Viết bài'}
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

      {/* FEATURED CONTENT */}
      {activeTab === 'featured' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mockFeatured.map((f, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '16px', background: colors.surface1, border: `1px solid ${colors.borderSoft}`, borderRadius: '16px', padding: '16px' }}>
              <div style={{ width: 100, height: 80, flex: 'none', borderRadius: '12px', background: f.img, position: 'relative' }}>
                {f.badge && <span style={{ position: 'absolute', top: 8, left: 8, fontSize: '10px', fontWeight: 700, color: colors.text, background: 'rgba(12,12,15,.7)', border: `1px solid rgba(255,255,255,.2)`, padding: '2px 8px', borderRadius: '6px' }}>{f.badge}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: colors.text }}>{f.name}</div>
                <div style={{ fontSize: '13px', color: colors.muted, marginTop: '4px' }}>{f.sub}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {f.labels.map(l => (
                    <span key={l} style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${colors.borderSoft}`, color: colors.text2 }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <div style={{ background: 'rgba(212,178,106,.05)', border: `1px solid rgba(212,178,106,.26)`, borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(12,12,15,.5)', border: `1px solid rgba(255,255,255,.1)`, borderRadius: '12px', padding: '12px 16px' }}>
              <Search size={18} color={colors.muted} />
              <input placeholder="Tìm quán để thêm vào mục nổi bật…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: colors.text, fontSize: '14px', fontFamily: 'inherit' }} />
            </div>
          </div>
        </div>
      )}

      {/* VIDEO HOT CONTENT */}
      {activeTab === 'video' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'rgba(212,178,106,.05)', border: `1px solid rgba(212,178,106,.2)`, borderRadius: '16px', alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(212,178,106,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.gold, flex: 'none' }}>
              ℹ️
            </div>
            <span style={{ fontSize: '13px', color: '#cbb884', lineHeight: 1.5 }}>Khối <b style={{ color: '#f0dda8' }}>"Video Hot"</b> trên trang chủ — chọn từ <b style={{ color: '#f0dda8' }}>thư viện video của các quán</b> (mục Quán → Video quán), sắp thứ tự theo khu vực.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
              <span style={{ padding: '6px 20px', borderRadius: '8px', background: colors.goldGrad, color: colors.onGold, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Hà Nội</span>
              <span style={{ padding: '6px 20px', borderRadius: '8px', color: colors.muted, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>TP. Hồ Chí Minh</span>
            </div>
            <div style={{ flex: 1 }}></div>
            <span style={{ fontSize: '13px', color: colors.muted }}>3 video đang hiển thị trên trang chủ</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {mockVideos.map(v => (
              <div key={v.id} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '15px', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/9', background: v.color, position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>▶</span>
                  <span style={{ position: 'absolute', right: '9px', bottom: '9px', fontSize: '9px', fontWeight: 600, color: '#f3f0ea', background: 'rgba(12,12,15,.65)', padding: '2.5px 7px', borderRadius: '6px' }}>{v.dur}</span>
                  <span style={{ position: 'absolute', left: '9px', top: '9px', fontSize: '9px', fontWeight: 800, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '3px 8px', borderRadius: '6px' }}>#{v.rank}</span>
                </div>
                <div style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f3f0ea', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.venue}</div>
                    <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</div>
                  </div>
                  <span style={{ width: 24, height: 22, flex: 'none', borderRadius: 6, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>↑</span>
                  <span style={{ width: 24, height: 22, flex: 'none', borderRadius: 6, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>↓</span>
                  <span style={{ width: 24, height: 22, flex: 'none', borderRadius: 6, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>✕</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'rgba(12,12,15,.5)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px' }}>
              <Search size={15} color="#8c8679" />
              <input placeholder="Tìm video theo tên quán hoặc tiêu đề…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px', maxHeight: '210px', overflowY: 'auto' }}>
              {mockVideoSearch.map(vr => (
                <div key={vr.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 10px' }}>
                  <span style={{ width: 56, height: 34, flex: 'none', borderRadius: 8, background: vr.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#f3f0ea', fontSize: '10px' }}>▶</span></span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{vr.venue}</div>
                    <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>{vr.title}</div>
                  </div>
                  <span style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}>+ Hiện trên trang chủ</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADD DRAWER */}
      <div style={{
        position: 'fixed', top: 0, right: isAdding && isAdding !== 'blog' ? 0 : '-520px', bottom: 0, width: '520px',
        background: colors.bg, borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: isAdding && isAdding !== 'blog' ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100,
        display: 'flex', flexDirection: 'column'
      }}>
        {isAdding && isAdding !== 'blog' && (
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

      {/* NEW BLOG MODAL */}
      {isAdding === 'blog' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '750px', maxWidth: '94vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', flex: 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Blog &amp; cẩm nang · Trang chủ</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#f3f0ea', marginTop: '3px' }}>Viết bài mới</div>
              </div>
              <span onClick={closeDrawer} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }}>
                <X size={16} />
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Tiêu đề bài viết</div>
                <input value={blogTitle} onChange={e => setBlogTitle(e.target.value)} placeholder="VD: Top 10 lounge lãng mạn cho buổi hẹn tại Hà Nội" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit', outline: 'none' }} />
                <div style={{ fontSize: '11px', color: '#57534b', marginTop: '7px' }}>vietyoru.vn/blog/<span style={{ color: '#b99a55' }}>{blogTitle ? blogTitle.toLowerCase().replace(/\s+/g, '-') : 'tieu-de-bai-viet'}</span></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase' }}>Chuyên mục</div>
                    <div onClick={() => setIsManagingCategories(true)} style={{ fontSize: '10px', fontWeight: 600, color: '#cbb884', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Settings size={12} /> Quản lý</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {categories.length > 0 ? categories.map(cat => (
                      <span 
                        key={cat.id}
                        onClick={() => setBlogCategory(cat.name)}
                        style={{ 
                          fontSize: '12.5px', 
                          fontWeight: blogCategory === cat.name ? 700 : 600, 
                          color: blogCategory === cat.name ? '#241a0a' : '#9b958a', 
                          background: blogCategory === cat.name ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.03)', 
                          border: blogCategory === cat.name ? 'none' : '1px solid rgba(255,255,255,.08)', 
                          padding: blogCategory === cat.name ? '6px 14px' : '5px 13px', 
                          borderRadius: '9px', cursor: 'pointer' 
                        }}
                      >
                        {cat.name}
                      </span>
                    )) : <span style={{ fontSize: '12.5px', color: '#8c8679' }}>Chưa có chuyên mục</span>}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Ngôn ngữ hiển thị</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['Tiếng Việt', 'English', '日本語', '한국어', '中文'].map(lang => (
                      <span 
                        key={lang}
                        onClick={() => setBlogLanguage(lang)}
                        style={{ 
                          fontSize: '12.5px', 
                          fontWeight: blogLanguage === lang ? 700 : 600, 
                          color: blogLanguage === lang ? '#241a0a' : '#9b958a', 
                          background: blogLanguage === lang ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.03)', 
                          border: blogLanguage === lang ? 'none' : '1px solid rgba(255,255,255,.08)', 
                          padding: blogLanguage === lang ? '6px 14px' : '5px 13px', 
                          borderRadius: '9px', cursor: 'pointer' 
                        }}
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Ảnh bìa</div>
                <div style={{ position: 'relative', height: '150px', borderRadius: '13px', overflow: 'hidden', border: '1px dashed rgba(212,178,106,.4)', background: 'rgba(12,12,15,.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                  <ImageIcon size={28} style={{ color: '#8c8679' }} strokeWidth={1.5} />
                  <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#cbb884' }}>Bấm để tải ảnh bìa</span>
                  <span style={{ fontSize: '10.5px', color: '#57534b' }}>PNG / JPG · tỉ lệ 16:9 · hiển thị trên trang chủ</span>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}><span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase' }}>Mô tả ngắn</span><span style={{ flex: 1 }}></span><span style={{ fontSize: '10.5px', color: '#57534b' }}>{blogExcerpt.length} / 160</span></div>
                <textarea value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value.slice(0, 160))} rows={2} placeholder="1–2 câu tóm tắt — hiển thị dưới tiêu đề trên trang chủ và kết quả tìm kiếm…" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '11px 15px', color: '#f3f0ea', fontSize: '13px', lineHeight: 1.55, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}></textarea>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase' }}>Nội dung</span>
                </div>
                <ReactQuill 
                  theme="snow" 
                  value={blogContent} 
                  onChange={setBlogContent} 
                  placeholder="Viết nội dung bài..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                />
                <div style={{ display: 'flex', marginTop: '6px' }}><span style={{ fontSize: '10.5px', color: '#57534b' }}>Hỗ trợ phong phú — Tiêu đề, In đậm, Danh sách, Hình ảnh, Link</span><span style={{ flex: 1 }}></span><span style={{ fontSize: '10.5px', color: '#57534b' }}>{blogContent.length > 0 ? blogContent.split(/\s+/).length : 0} từ</span></div>
              </div>
            </div>
            
            <style>{`
              .ql-toolbar.ql-snow {
                border: 1px solid rgba(255,255,255,.1);
                border-top-left-radius: 11px;
                border-top-right-radius: 11px;
                background: rgba(255,255,255,.04);
                padding: 10px;
              }
              .ql-container.ql-snow {
                border: 1px solid rgba(255,255,255,.1);
                border-bottom-left-radius: 11px;
                border-bottom-right-radius: 11px;
                border-top: none;
                background: rgba(12,12,15,.55);
                color: #f3f0ea;
                font-family: inherit;
                font-size: 14px;
                min-height: 190px;
              }
              .ql-editor {
                min-height: 190px;
                line-height: 1.65;
              }
              .ql-snow .ql-stroke { stroke: #c5c0b6; }
              .ql-snow .ql-fill { fill: #c5c0b6; }
              .ql-snow .ql-picker { color: #c5c0b6; }
              .ql-editor.ql-blank::before { color: #8c8679; font-style: normal; }
              
              /* Hover, Focus, Active states for Quill */
              .ql-snow.ql-toolbar button:hover .ql-stroke, .ql-snow .ql-toolbar button:hover .ql-stroke, 
              .ql-snow.ql-toolbar button:focus .ql-stroke, .ql-snow .ql-toolbar button:focus .ql-stroke, 
              .ql-snow.ql-toolbar button.ql-active .ql-stroke, .ql-snow .ql-toolbar button.ql-active .ql-stroke, 
              .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke, 
              .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke, 
              .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke, 
              .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke, 
              .ql-snow.ql-toolbar button:hover .ql-stroke-miter, .ql-snow .ql-toolbar button:hover .ql-stroke-miter, 
              .ql-snow.ql-toolbar button:focus .ql-stroke-miter, .ql-snow .ql-toolbar button:focus .ql-stroke-miter, 
              .ql-snow.ql-toolbar button.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar button.ql-active .ql-stroke-miter, 
              .ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke-miter, 
              .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-stroke-miter, 
              .ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke-miter, 
              .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke-miter {
                stroke: #d4b26a;
              }
              .ql-snow.ql-toolbar button:hover .ql-fill, .ql-snow .ql-toolbar button:hover .ql-fill, 
              .ql-snow.ql-toolbar button:focus .ql-fill, .ql-snow .ql-toolbar button:focus .ql-fill, 
              .ql-snow.ql-toolbar button.ql-active .ql-fill, .ql-snow .ql-toolbar button.ql-active .ql-fill, 
              .ql-snow.ql-toolbar .ql-picker-label:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-label:hover .ql-fill, 
              .ql-snow.ql-toolbar .ql-picker-label.ql-active .ql-fill, .ql-snow .ql-toolbar .ql-picker-label.ql-active .ql-fill, 
              .ql-snow.ql-toolbar .ql-picker-item:hover .ql-fill, .ql-snow .ql-toolbar .ql-picker-item:hover .ql-fill, 
              .ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-fill, .ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-fill {
                fill: #d4b26a;
              }
              .ql-snow.ql-toolbar button:hover, .ql-snow .ql-toolbar button:hover, 
              .ql-snow.ql-toolbar button:focus, .ql-snow .ql-toolbar button:focus, 
              .ql-snow.ql-toolbar button.ql-active, .ql-snow .ql-toolbar button.ql-active, 
              .ql-snow.ql-toolbar .ql-picker-label:hover, .ql-snow .ql-toolbar .ql-picker-label:hover, 
              .ql-snow.ql-toolbar .ql-picker-label.ql-active, .ql-snow .ql-toolbar .ql-picker-label.ql-active, 
              .ql-snow.ql-toolbar .ql-picker-item:hover, .ql-snow .ql-toolbar .ql-picker-item:hover, 
              .ql-snow.ql-toolbar .ql-picker-item.ql-selected, .ql-snow .ql-toolbar .ql-picker-item.ql-selected {
                color: #d4b26a;
              }
              .ql-snow .ql-picker-options {
                background-color: #1a1a24;
                border-color: rgba(255,255,255,.1);
              }
            `}</style>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,.07)', flex: 'none', background: 'rgba(12,12,15,.35)' }}>
              <span style={{ flex: 1 }}></span>
              <span onClick={closeDrawer} style={{ fontSize: '12.5px', fontWeight: 600, color: '#9b958a', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>Hủy</span>
              <span onClick={() => !isSubmitting && handleSaveBlog('DRAFT')} style={{ fontSize: '12.5px', fontWeight: 700, color: '#e3c27e', background: 'rgba(212,178,106,.08)', border: '1px solid rgba(212,178,106,.38)', padding: '10px 17px', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>{isSubmitting ? 'Đang lưu...' : 'Lưu nháp'}</span>
              <span onClick={() => !isSubmitting && handleSaveBlog('PUBLISHED')} style={{ fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '10px 17px', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>{isSubmitting ? 'Đang lưu...' : 'Đăng bài'}</span>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE CATEGORIES MODAL */}
      {isManagingCategories && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '400px', maxWidth: '94vw', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f3f0ea' }}>Quản lý chuyên mục</div>
              <span onClick={() => setIsManagingCategories(false)} style={{ cursor: 'pointer', color: '#9b958a' }}><X size={16} /></span>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input 
                  value={newCategoryName} 
                  onChange={e => setNewCategoryName(e.target.value)} 
                  placeholder="Nhập tên chuyên mục mới..." 
                  style={{ flex: 1, background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '9px', padding: '10px 12px', color: '#f3f0ea', fontSize: '13px', outline: 'none' }} 
                />
                <button 
                  onClick={handleAddCategory}
                  disabled={isSubmittingCategory}
                  style={{ background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', color: '#241a0a', border: 'none', borderRadius: '9px', padding: '0 16px', fontSize: '13px', fontWeight: 700, cursor: isSubmittingCategory ? 'not-allowed' : 'pointer', opacity: isSubmittingCategory ? 0.7 : 1 }}
                >
                  Thêm
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {categories.length === 0 && <div style={{ fontSize: '13px', color: '#8c8679', textAlign: 'center', padding: '10px 0' }}>Chưa có chuyên mục nào.</div>}
                {categories.map(cat => (
                  <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '9px' }}>
                    <span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{cat.name}</span>
                    <span onClick={() => handleDeleteCategory(cat.id)} style={{ color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Xóa</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
