"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X, Search, ChevronRight, Eye, Calendar, MapPin, Tag as TagIcon, Layout, AlignLeft, Image as ImageIcon, Settings, Pencil } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import { contentApi, CmsContentItem } from '@/lib/api/content';
import { categoriesApi, CategoryItem } from '@/lib/api/categories';
import { apiFormDataClient, apiClient, resolveClientUrl } from '@/lib/api/client';

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
  const [activeTab, setActiveTab] = useState<'banner' | 'featured' | 'video' | 'blog'>('banner');
  const [isAdding, setIsAdding] = useState<'banner' | 'featured' | 'video' | 'blog' | null>(null);
  const [editBlogId, setEditBlogId] = useState<string | null>(null);
  const [editBannerId, setEditBannerId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Cẩm nang');
  const [blogLanguage, setBlogLanguage] = useState('Tiếng Việt');
  const [blogExcerpt, setBlogExcerpt] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [blogs, setBlogs] = useState<CmsContentItem[]>([]);
  const [banners, setBanners] = useState<CmsContentItem[]>([]);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);
  const [showVideoToast, setShowVideoToast] = useState(false);
  const [videoRegion, setVideoRegion] = useState('Tổng hợp');
  const [hotVideos, setHotVideos] = useState<any[]>([]);
  const [searchVideos, setSearchVideos] = useState<any[]>([]);
  const [searchVideoQuery, setSearchVideoQuery] = useState('');
  const [searchVideoPage, setSearchVideoPage] = useState(1);
  const [searchVideoTotalPages, setSearchVideoTotalPages] = useState(1);
  const [isLoadingHotVideos, setIsLoadingHotVideos] = useState(false);
  const [isSearchingVideo, setIsSearchingVideo] = useState(false);

  // Banner states
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerTag, setBannerTag] = useState('');
  const [bannerPos, setBannerPos] = useState('Trang chủ #1');
  const [bannerLink, setBannerLink] = useState('');
  const [bannerStatus, setBannerStatus] = useState('Đang hiển thị');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [bannerStatusLabel, setBannerStatusLabel] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerDescription, setBannerDescription] = useState('');

  const [bannerTagsList, setBannerTagsList] = useState<CategoryItem[]>([]);
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
    fetchBanners();
    fetchBannerTags();
  }, []);

  useEffect(() => {
    if (activeTab === 'video') {
      fetchHotVideos(videoRegion);
    }
  }, [activeTab, videoRegion]);

  useEffect(() => {
    if (activeTab === 'video') {
      const timer = setTimeout(() => {
        fetchStoreVideos(searchVideoQuery, searchVideoPage);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchVideoQuery, searchVideoPage, activeTab]);

  const fetchHotVideos = async (region: string) => {
    const code = region === 'Tổng hợp' ? 'all' : region === 'Hà Nội' ? 'hn' : 'hcm';
    try {
      setIsLoadingHotVideos(true);
      const data = await apiClient<any[]>(`/admin/content/hot-videos/${code}`);
      setHotVideos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingHotVideos(false);
    }
  };

  const fetchStoreVideos = async (query: string, page: number) => {
    try {
      setIsSearchingVideo(true);
      const data = await apiClient<any>('/admin/media/store-videos', {
        params: { search: query, page, limit: 10 }
      });
      setSearchVideos(data?.items || []);
      setSearchVideoTotalPages(data?.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingVideo(false);
    }
  };

  const handleAddHotVideo = (video: any) => {
    if (hotVideos.find(v => v.id === video.id)) return;
    setHotVideos(prev => [...prev, video]);
  };

  const handleRemoveHotVideo = (id: string) => {
    setHotVideos(prev => prev.filter(v => v.id !== id));
  };

  const handleMoveHotVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === hotVideos.length - 1) return;
    const newArr = [...hotVideos];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newArr[index], newArr[swapIndex]] = [newArr[swapIndex], newArr[index]];
    setHotVideos(newArr);
  };

  const handleSaveHotVideos = async () => {
    const code = videoRegion === 'Tổng hợp' ? 'all' : videoRegion === 'Hà Nội' ? 'hn' : 'hcm';
    try {
      await apiClient(`/admin/content/hot-videos/${code}`, {
        method: 'PUT',
        data: { mediaIds: hotVideos.map(v => v.id) }
      });
      alert('Đã lưu danh sách Video Hot thành công');
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi lưu');
    }
  };

  const fetchBlogs = async () => {
    try {
      const data = await contentApi.adminList({ type: 'BLOG' });
      if (data) setBlogs(data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    }
  };

  const fetchBanners = async () => {
    try {
      const data = await contentApi.adminList({ type: 'BANNER' as any });
      if (data) setBanners(data);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    }
  };

  const fetchBannerTags = async () => {
    try {
      const data = await categoriesApi.adminList('BANNER_TAG');
      if (data) {
        setBannerTagsList(data);
        if (data.length > 0 && !bannerTag) {
          setBannerTag(data[0]?.name || '');
        }
      }
    } catch (error) {
      console.error('Failed to fetch banner tags:', error);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) return;
    try {
      setIsSubmittingTag(true);
      await categoriesApi.adminCreate({
        name: newTagName,
        slug: newTagName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
        type: 'BANNER_TAG',
      });
      setNewTagName('');
      fetchBannerTags();
    } catch (error) {
      console.error('Failed to add tag:', error);
      alert('Có lỗi xảy ra khi thêm nhãn');
    } finally {
      setIsSubmittingTag(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhãn này?')) return;
    try {
      await categoriesApi.adminDelete(id);
      fetchBannerTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('Có lỗi xảy ra khi xóa nhãn');
    }
  };

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

  const handleEditBanner = (banner: CmsContentItem) => {
    const meta = (banner.metadata as any) || {};
    setEditBannerId(banner.id);
    setBannerTitle(banner.title);
    setBannerTag(meta.tag || '');
    setBannerPos(meta.position || 'Trang chủ #1');
    setBannerLink(meta.link || '');
    setBannerStatus(banner.status === 'PUBLISHED' ? 'Đang hiển thị' : banner.status === 'ARCHIVED' ? 'Ẩn' : 'Nháp');
    setBannerImage(meta.imageUrl || null);
    setBannerStatusLabel(meta.statusLabel || '');
    setBannerSubtitle(meta.subtitle || '');
    setBannerDescription(meta.description || '');
    setIsAdding('banner');
  };

  const closeDrawer = () => {
    setIsAdding(null);
    setEditBlogId(null);
    setEditBannerId(null);
    setBlogTitle('');
    setBlogCategory('Cẩm nang');
    setBlogLanguage('Tiếng Việt');
    setBlogExcerpt('');
    setBlogContent('');
    setBannerTitle('');
    setBannerImage(null);
    setBannerImageFile(null);
    setBannerLink('');
    setBannerStatusLabel('');
    setBannerSubtitle('');
    setBannerDescription('');
    setBannerTag('');
    setBannerPos('Trang chủ #1');
    setBannerStatus('Đang hiển thị');
  };

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim()) {
      alert('Vui lòng nhập tiêu đề banner!');
      return;
    }
    try {
      setIsSubmitting(true);
      
      let finalImageUrl = bannerImage && !bannerImage.startsWith('blob:') ? bannerImage : '';
      if (bannerImageFile) {
        const form = new FormData();
        form.append('file', bannerImageFile);
        form.append('purpose', 'BANNER');
        form.append('access', 'PUBLIC');
        try {
          const res = await apiFormDataClient<any>('/storage/upload', form);
          if (res && res.url) {
            finalImageUrl = res.url;
          }
        } catch (uploadErr) {
          console.error('Failed to upload banner image:', uploadErr);
          alert('Lỗi tải ảnh. Banner sẽ được lưu nhưng không có ảnh mới.');
        }
      }

      const payload = {
        title: bannerTitle,
        type: 'BANNER' as any,
        status: (bannerStatus === 'Đang hiển thị' ? 'PUBLISHED' : bannerStatus === 'Ẩn' ? 'ARCHIVED' : 'DRAFT') as any,
        metadata: {
          tag: bannerTag,
          position: bannerPos,
          link: bannerLink,
          imageUrl: finalImageUrl,
          statusLabel: bannerStatusLabel,
          subtitle: bannerSubtitle,
          description: bannerDescription
        }
      };

      if (editBannerId) {
        await contentApi.adminUpdate(editBannerId, payload);
      } else {
        await contentApi.adminCreate({
          ...payload,
          slug: bannerTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') + '-' + Date.now(),
        });
      }
      
      fetchBanners();
      closeDrawer();
    } catch (error) {
      console.error('Failed to save banner:', error);
      alert('Có lỗi xảy ra khi lưu banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBlog = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!blogTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = coverImage && !coverImage.startsWith('blob:') ? coverImage : null;

      if (coverImageFile) {
        const form = new FormData();
        form.append('file', coverImageFile);
        form.append('purpose', 'BLOG_COVER');
        form.append('access', 'PUBLIC');
        
        try {
          const res = await apiFormDataClient<any>('/storage/upload', form);
          if (res && res.url) {
            finalImageUrl = res.url;
          }
        } catch (uploadErr) {
          console.error('Failed to upload image:', uploadErr);
          alert('Lỗi tải ảnh bìa. Bài viết vẫn sẽ được lưu nhưng không có ảnh bìa mới.');
        }
      }

      const payload = {
        type: 'BLOG' as const,
        title: blogTitle,
        status,
        excerpt: blogExcerpt,
        body: blogContent,
        metadata: {
          category: blogCategory,
          language: blogLanguage,
          ...(finalImageUrl ? { image: finalImageUrl } : {}),
        }
      };

      if (editBlogId) {
        await contentApi.adminUpdate(editBlogId, payload);
      } else {
        await contentApi.adminCreate(payload);
      }
      alert(status === 'DRAFT' ? 'Đã lưu nháp thành công!' : 'Đã đăng bài thành công!');
      fetchBlogs();
      closeDrawer();
    } catch (error) {
      console.error('Failed to save blog:', error);
      alert('Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBlog = (blog: CmsContentItem) => {
    setEditBlogId(blog.id);
    setBlogTitle(blog.title);
    setBlogCategory((blog.metadata as any)?.category || 'Cẩm nang');
    setBlogLanguage((blog.metadata as any)?.language || 'Tiếng Việt');
    setBlogExcerpt(blog.excerpt || '');
    setBlogContent(blog.body || '');
    setCoverImage((blog.metadata as any)?.image || null);
    setIsAdding('blog');
  };

  const renderDrawerContent = () => {
    if (isAdding === 'featured') {
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
      return null; // Rendered as Modal instead
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
          onClick={() => {
            if (activeTab === 'video') {
              setShowVideoToast(true);
              setTimeout(() => setShowVideoToast(false), 3000);
              const searchInput = document.getElementById('video-search-input');
              if (searchInput) searchInput.focus();
            } else {
              setIsAdding(activeTab);
            }
          }}
          style={{
            height: '40px', display: 'flex', alignItems: 'center', gap: '8px',
            background: colors.goldGrad, color: colors.onGold, border: 'none', padding: '0 20px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
          }}
        >
          <Plus size={18} strokeWidth={3} />
          {activeTab === 'banner' ? 'Thêm banner' : activeTab === 'featured' ? 'Thêm dịch vụ' : activeTab === 'video' ? 'Thêm video hot' : 'Viết bài'}
        </button>
      </div>



      {/* BANNER CONTENT */}
      {activeTab === 'banner' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {banners.map((banner) => {
            const metadata = (banner.metadata as any) || {};
            const displayStatus = banner.status === 'PUBLISHED' ? 'Đang hiển thị' : banner.status === 'DRAFT' ? 'Nháp' : 'Ẩn';
            const bgImage = metadata.imageUrl ? `linear-gradient(180deg, rgba(24,24,31,0) 0%, rgba(24,24,31,0.8) 100%), url(${resolveClientUrl(metadata.imageUrl)})` : `linear-gradient(180deg, rgba(24,24,31,0) 0%, rgba(24,24,31,0.8) 100%), #1f1f26`;
            
            return (
            <div key={banner.id} onClick={() => handleEditBanner(banner)} style={{ 
              height: '220px', borderRadius: '16px', border: `1px solid ${colors.borderSoft}`, 
              background: bgImage, backgroundSize: 'cover', backgroundPosition: 'center',
              padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', cursor: 'pointer'
            }}>
              <div>
                {metadata.statusLabel && (
                  <span style={{ 
                    display: 'inline-block', padding: '4px 12px', borderRadius: '16px', 
                    background: 'rgba(0,0,0,0.5)', border: `1px solid ${colors.borderGold22}`, color: colors.gold, 
                    fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase'
                  }}>
                    <span style={{ color: '#ef4444', marginRight: '6px' }}>•</span>{metadata.statusLabel}
                  </span>
                )}
              </div>
              <div>
                {metadata.subtitle && <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: colors.gold, textTransform: 'uppercase', marginBottom: '8px' }}>{metadata.subtitle}</div>}
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: colors.text, margin: '0 0 4px 0' }}>{banner.title}</h3>
                {metadata.description && <div style={{ fontSize: '12px', color: '#c5c0b6', marginBottom: '12px' }}>{metadata.description}</div>}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: colors.muted }}>Vị trí: <span style={{ color: colors.text2 }}>{metadata.position || 'Không xác định'}</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 700,
                      background: colors.goldGrad, color: colors.onGold
                    }}>
                      {metadata.tag || 'Chi tiết'}
                    </span>
                    <span style={{ 
                      color: getBannerStatusStyle(displayStatus).color, 
                      padding: '2px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600,
                      border: getBannerStatusStyle(displayStatus).border
                    }}>
                      {displayStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* BLOG CONTENT */}
      {activeTab === 'blog' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {blogs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.muted, fontSize: '14px', background: colors.surface1, borderRadius: '16px', border: `1px solid ${colors.borderSoft}` }}>
              Chưa có bài viết nào
            </div>
          ) : blogs.map((blog) => (
            <div 
              key={blog.id} 
              style={{ 
                background: colors.surface1, border: `1px solid ${colors.borderSoft}`, 
                borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '20px',
              }}
            >
              <div style={{ width: '96px', height: '64px', borderRadius: '8px', background: '#271932', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                {(blog.metadata as any)?.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={(blog.metadata as any).image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : null}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: colors.text, margin: '0 0 6px 0' }}>{blog.title}</h3>
                <div style={{ fontSize: '13px', color: colors.muted }}>
                  {(blog.metadata as any)?.category || 'Không phân loại'} · {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div 
                    onClick={() => handleEditBlog(blog)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.muted, fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Pencil size={15} /> <span style={{ fontWeight: 600 }}>Sửa</span>
                  </div>
                  <div 
                    onClick={() => window.open(`/blog/${blog.slug}?preview=1`, '_blank')}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', color: colors.muted, fontSize: '13px', cursor: 'pointer' }}
                  >
                    <Eye size={15} /> <span style={{ fontWeight: 600 }}>Xem</span>
                  </div>
                </div>
                <span style={{ 
                  border: getBlogStatusStyle(blog.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp').border, 
                  color: getBlogStatusStyle(blog.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp').color, 
                  padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, display: 'inline-block', minWidth: '80px', textAlign: 'center'
                }}>
                  {blog.status === 'PUBLISHED' ? 'Đã đăng' : 'Nháp'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FEATURED CONTENT */}
      {activeTab === 'featured' && (() => {
        const activeTabStyle = { background: 'rgba(212,178,106,.15)', color: '#d4b26a', fontWeight: 700, padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', cursor: 'pointer' };
        const inactiveTabStyle = { background: 'transparent', color: '#c5c0b6', fontWeight: 500, padding: '6px 14px', borderRadius: '8px', fontSize: '12.5px', cursor: 'pointer' };
        
        return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '9px', padding: '12px 15px', background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.2)', borderRadius: '12px', marginBottom: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '1px' }}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9z"/></svg>
            <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}>Khối <b style={{ color: '#f0dda8' }}>"Dịch vụ nổi bật"</b> trên trang chủ — chọn quán theo khu vực &amp; nhóm dịch vụ, gắn nhãn, sắp thứ tự. Trang chủ hiển thị đúng thứ tự này.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
              <span style={activeTabStyle}>Tổng hợp</span>
              <span style={inactiveTabStyle}>Hà Nội</span>
              <span style={inactiveTabStyle}>TP. Hồ Chí Minh</span>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
              <span style={activeTabStyle}>Nhà hàng</span>
              <span style={inactiveTabStyle}>Spa</span>
            </div>
            <div style={{ flex: 1 }}></div>
            <span style={{ fontSize: '11px', color: '#8c8679' }}>2 quán đang hiển thị trên trang chủ</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '13px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '15px', padding: '12px' }}>
              <div style={{ width: '92px', height: '76px', flex: 'none', borderRadius: '11px', background: 'rgba(255,255,255,.05)', position: 'relative' }}>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f3f0ea' }}>Sakura Teppanyaki</div>
                <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '2px' }}>Tây Hồ · Nhà hàng Nhật</div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '9px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f0dda8', color: '#241a0a' }}>Không nhãn</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', color: '#c5c0b6' }}>Đặt bàn nhanh</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', color: '#c5c0b6' }}>Mới</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                <span style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6"/></svg></span>
                <span style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>
                <span style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '13px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '15px', padding: '12px' }}>
              <div style={{ width: '92px', height: '76px', flex: 'none', borderRadius: '11px', background: 'rgba(128,90,200,.2)', position: 'relative' }}>
                <span style={{ position: 'absolute', top: '7px', left: '7px', fontSize: '8.5px', fontWeight: 700, color: '#f3f0ea', background: 'rgba(12,12,15,.62)', border: '1px solid rgba(255,255,255,.2)', padding: '2.5px 7px', borderRadius: '6px' }}>Mới</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#f3f0ea' }}>Yakitori Hanoi</div>
                <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '2px' }}>Ba Đình · BBQ Nhật</div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '9px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '9px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', color: '#c5c0b6' }}>Không nhãn</span>
                  <span style={{ fontSize: '9px', fontWeight: 600, padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', color: '#c5c0b6' }}>Đặt bàn nhanh</span>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f0dda8', color: '#241a0a' }}>Mới</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                <span style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6"/></svg></span>
                <span style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>
                <span style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'rgba(12,12,15,.5)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input placeholder="Tìm quán để thêm vào mục nổi bật…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px', maxHeight: '210px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 10px' }}>
                <span style={{ width: '44px', height: '34px', flex: 'none', borderRadius: '8px', background: 'rgba(255,255,255,.05)' }}></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>Sushi Ginza</div>
                  <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>Hoàn Kiếm · Sushi &amp; Sashimi</div>
                </div>
                <span style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}>+ Hiện trên trang chủ</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 10px' }}>
                <span style={{ width: '44px', height: '34px', flex: 'none', borderRadius: '8px', background: 'rgba(255,255,255,.02)' }}></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>Ramen Ichiban</div>
                  <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>Cầu Giấy · Ramen</div>
                </div>
                <span style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}>+ Hiện trên trang chủ</span>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

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
              {['Tổng hợp', 'Hà Nội', 'TP. Hồ Chí Minh'].map(region => (
                <span 
                  key={region}
                  onClick={() => setVideoRegion(region)}
                  style={{ 
                    padding: '6px 20px', borderRadius: '8px', 
                    background: videoRegion === region ? colors.goldGrad : 'transparent', 
                    color: videoRegion === region ? colors.onGold : colors.muted, 
                    fontSize: '13px', fontWeight: videoRegion === region ? 700 : 600, 
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {region}
                </span>
              ))}
            </div>
            <div style={{ flex: 1 }}></div>
            <span style={{ fontSize: '13px', color: colors.muted }}>{hotVideos.length} video đang hiển thị</span>
            <div 
              onClick={handleSaveHotVideos}
              style={{ fontSize: '13px', fontWeight: 600, color: colors.bg, background: colors.goldGrad, padding: '6px 16px', borderRadius: '8px', cursor: 'pointer' }}>
              Lưu thay đổi
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {isLoadingHotVideos ? (
              <span style={{ color: colors.muted, fontSize: '13px', padding: '20px' }}>Đang tải...</span>
            ) : hotVideos.length === 0 ? (
              <span style={{ color: colors.muted, fontSize: '13px', padding: '20px' }}>Chưa có video nào. Hãy tìm và thêm từ bên dưới.</span>
            ) : hotVideos.map((v, index) => (
              <div key={v.id} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '15px', overflow: 'hidden' }}>
                <div style={{ aspectRatio: '16/9', background: '#1a1824', position: 'relative' }}>
                  {v.url ? (
                    v.url.includes('youtube.com') ? (
                       <img src={`https://img.youtube.com/vi/${v.url.match(/v=([^&]+)/)?.[1] || v.url.split('/').pop()}/mqdefault.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                    ) : (
                       <video src={v.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )
                  ) : null}
                  <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>▶</span>
                  <span style={{ position: 'absolute', left: '9px', top: '9px', fontSize: '9px', fontWeight: 800, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '3px 8px', borderRadius: '6px' }}>#{index + 1}</span>
                </div>
                <div style={{ padding: '11px 13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#f3f0ea', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.storeName || 'Không xác định'}</div>
                    <div style={{ fontSize: '10.5px', color: '#8c8679', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.title}</div>
                  </div>
                  <span onClick={() => handleMoveHotVideo(index, 'up')} style={{ width: 24, height: 22, flex: 'none', borderRadius: 6, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: index === 0 ? 'rgba(255,255,255,0.1)' : '#c5c0b6', cursor: index === 0 ? 'default' : 'pointer' }}>↑</span>
                  <span onClick={() => handleMoveHotVideo(index, 'down')} style={{ width: 24, height: 22, flex: 'none', borderRadius: 6, background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: index === hotVideos.length - 1 ? 'rgba(255,255,255,0.1)' : '#c5c0b6', cursor: index === hotVideos.length - 1 ? 'default' : 'pointer' }}>↓</span>
                  <span onClick={() => handleRemoveHotVideo(v.id)} style={{ width: 24, height: 22, flex: 'none', borderRadius: 6, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>✕</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px', marginTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'rgba(12,12,15,.5)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px' }}>
              <Search size={15} color="#8c8679" />
              <input 
                id="video-search-input" 
                value={searchVideoQuery}
                onChange={e => { setSearchVideoQuery(e.target.value); setSearchVideoPage(1); }}
                placeholder="Tìm video theo tên quán hoặc tiêu đề…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px', maxHeight: '310px', overflowY: 'auto' }}>
              {isSearchingVideo ? (
                <div style={{ fontSize: '13px', color: '#8c8679', padding: '10px' }}>Đang tìm kiếm...</div>
              ) : searchVideos.length === 0 ? (
                <div style={{ fontSize: '13px', color: '#8c8679', padding: '10px' }}>Không tìm thấy video nào</div>
              ) : searchVideos.map(vr => (
                <div key={vr.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 10px' }}>
                  <span style={{ width: 56, height: 34, flex: 'none', borderRadius: 8, background: '#1a221f', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {vr.url && vr.url.includes('youtube.com') ? (
                      <img src={`https://img.youtube.com/vi/${vr.url.match(/v=([^&]+)/)?.[1] || vr.url.split('/').pop()}/default.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="thumb" />
                    ) : (
                      <span style={{ color: '#f3f0ea', fontSize: '10px' }}>▶</span>
                    )}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{vr.storeName || 'Không xác định'}</div>
                    <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>{vr.title}</div>
                  </div>
                  <span 
                    onClick={() => handleAddHotVideo(vr)}
                    style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: hotVideos.find(h => h.id === vr.id) ? '#999' : 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 14px', borderRadius: '9px', cursor: hotVideos.find(h => h.id === vr.id) ? 'default' : 'pointer' }}
                  >
                    {hotVideos.find(h => h.id === vr.id) ? 'Đã thêm' : '+ Hiện trên trang chủ'}
                  </span>
                </div>
              ))}
            </div>
            {/* Pagination for Search */}
            {searchVideoTotalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
                <span 
                  onClick={() => setSearchVideoPage(p => Math.max(1, p - 1))}
                  style={{ fontSize: '12px', color: searchVideoPage > 1 ? colors.gold : colors.muted, cursor: searchVideoPage > 1 ? 'pointer' : 'default' }}
                >
                  &laquo; Trước
                </span>
                <span style={{ fontSize: '12px', color: colors.text }}>Trang {searchVideoPage} / {searchVideoTotalPages}</span>
                <span 
                  onClick={() => setSearchVideoPage(p => Math.min(searchVideoTotalPages, p + 1))}
                  style={{ fontSize: '12px', color: searchVideoPage < searchVideoTotalPages ? colors.gold : colors.muted, cursor: searchVideoPage < searchVideoTotalPages ? 'pointer' : 'default' }}
                >
                  Sau &raquo;
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD DRAWER */}
      <div style={{
        position: 'fixed', top: 0, right: (isAdding && isAdding !== 'blog' && isAdding !== 'banner') ? 0 : '-520px', bottom: 0, width: '520px',
        background: colors.bg, borderLeft: `1px solid ${colors.borderSoft}`,
        boxShadow: (isAdding && isAdding !== 'blog' && isAdding !== 'banner') ? '-10px 0 30px rgba(0,0,0,0.5)' : 'none',
        transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 100,
        display: 'flex', flexDirection: 'column'
      }}>
        {isAdding && isAdding !== 'blog' && isAdding !== 'banner' && (
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

      {/* NEW BANNER MODAL */}
      {isAdding === 'banner' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '600px', maxWidth: '94vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', flex: 'none' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase' }}>BANNER · TRANG CHỦ & LANDING</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f3f0ea', marginTop: '4px' }}>Thêm banner</div>
              </div>
              <span onClick={closeDrawer} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }}>
                <X size={16} />
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>TIÊU ĐỀ BANNER</div>
                <input value={bannerTitle} onChange={e => setBannerTitle(e.target.value)} placeholder="VD: Đêm nhạc acoustic · Akari Lounge" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 16px', color: '#f3f0ea', fontSize: '14px', fontWeight: 600, fontFamily: 'inherit', outline: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>NHÃN TRẠNG THÁI (VD: ĐANG DIỄN RA)</div>
                  <input value={bannerStatusLabel} onChange={e => setBannerStatusLabel(e.target.value)} placeholder="Tùy chọn" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 16px', color: '#f3f0ea', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>TIÊU ĐỀ PHỤ (SUBTITLE)</div>
                  <input value={bannerSubtitle} onChange={e => setBannerSubtitle(e.target.value)} placeholder="Tùy chọn" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 16px', color: '#f3f0ea', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>MÔ TẢ (DESCRIPTION)</div>
                <input value={bannerDescription} onChange={e => setBannerDescription(e.target.value)} placeholder="Tùy chọn" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 16px', color: '#f3f0ea', fontSize: '14px', outline: 'none' }} />
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>ẢNH BANNER</div>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  style={{ display: 'none' }} 
                  id="banner-image-upload" 
                  onChange={(e) => { 
                    const file = e.target.files?.[0]; 
                    if (file) { 
                      setBannerImageFile(file);
                      setBannerImage(URL.createObjectURL(file)); 
                    } 
                  }} 
                />
                <label htmlFor="banner-image-upload" style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', height: '180px', borderRadius: '13px', overflow: 'hidden', border: bannerImage ? 'none' : '1px dashed rgba(212,178,106,.4)', background: 'rgba(12,12,15,.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                    {bannerImage ? (
                      <>
                        <img src={resolveClientUrl(bannerImage) || ''} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span 
                          onClick={(e) => { e.preventDefault(); setBannerImage(null); setBannerImageFile(null); }} 
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,.6)', color: '#fff', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={28} style={{ color: '#cbb884' }} strokeWidth={1.5} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#cbb884' }}>Bấm để tải ảnh banner</span>
                        <span style={{ fontSize: '11px', color: '#57534b' }}>PNG / JPG · khuyến nghị 1920x720</span>
                      </>
                    )}
                  </div>
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase' }}>NHÃN SLOT</div>
                    <button 
                      onClick={() => setIsManagingTags(true)}
                      style={{ background: 'transparent', border: 'none', color: colors.gold, cursor: 'pointer', padding: 0, display: 'flex' }}
                      title="Quản lý nhãn"
                    >
                      <Settings size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {bannerTagsList.map(tag => (
                      <span 
                        key={tag.id}
                        onClick={() => setBannerTag(tag.name)}
                        style={{ 
                          fontSize: '13px', 
                          fontWeight: bannerTag === tag.name ? 700 : 500, 
                          color: bannerTag === tag.name ? '#241a0a' : '#c5c0b6', 
                          background: bannerTag === tag.name ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent', 
                          border: bannerTag === tag.name ? '1px solid transparent' : '1px solid rgba(255,255,255,.1)', 
                          padding: '6px 14px', 
                          borderRadius: '20px', cursor: 'pointer' 
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {bannerTagsList.length === 0 && (
                      <span style={{ color: colors.muted, fontSize: '13px' }}>Chưa có nhãn nào. Hãy thêm mới!</span>
                    )}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '10px' }}>VỊ TRÍ HIỂN THỊ</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {['Trang chủ #1', 'Trang chủ #2', 'Nháp'].map(pos => (
                      <span 
                        key={pos}
                        onClick={() => setBannerPos(pos)}
                        style={{ 
                          fontSize: '13px', 
                          fontWeight: bannerPos === pos ? 700 : 500, 
                          color: bannerPos === pos ? '#241a0a' : '#c5c0b6', 
                          background: bannerPos === pos ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent', 
                          border: bannerPos === pos ? '1px solid transparent' : '1px solid rgba(255,255,255,.1)', 
                          padding: '6px 14px', 
                          borderRadius: '20px', cursor: 'pointer' 
                        }}
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>LIÊN KẾT KHI BẤM</div>
                <input value={bannerLink} onChange={e => setBannerLink(e.target.value)} placeholder="https://... hoặc /uu-dai/happy-hour" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 16px', color: '#f3f0ea', fontSize: '14px', fontWeight: 500, fontFamily: 'inherit', outline: 'none' }} />
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '10px' }}>TRẠNG THÁI</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <span 
                    onClick={() => setBannerStatus('Đang hiển thị')}
                    style={{ 
                      fontSize: '13px', fontWeight: 600, color: bannerStatus === 'Đang hiển thị' ? '#241a0a' : '#c5c0b6', 
                      background: bannerStatus === 'Đang hiển thị' ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent', 
                      border: bannerStatus === 'Đang hiển thị' ? '1px solid transparent' : '1px solid rgba(255,255,255,.1)', 
                      padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' 
                    }}
                  >
                    <span style={{ fontSize: bannerStatus === 'Đang hiển thị' ? '16px' : '12px', lineHeight: 1 }}>{bannerStatus === 'Đang hiển thị' ? '•' : '○'}</span> Đang hiển thị
                  </span>
                  <span 
                    onClick={() => setBannerStatus('Ẩn')}
                    style={{ 
                      fontSize: '13px', fontWeight: 600, color: bannerStatus === 'Ẩn' ? '#241a0a' : '#c5c0b6', 
                      background: bannerStatus === 'Ẩn' ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent', 
                      border: bannerStatus === 'Ẩn' ? '1px solid transparent' : '1px solid rgba(255,255,255,.1)', 
                      padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' 
                    }}
                  >
                    <span style={{ fontSize: bannerStatus === 'Ẩn' ? '16px' : '12px', lineHeight: 1 }}>{bannerStatus === 'Ẩn' ? '•' : '○'}</span> Ẩn
                  </span>
                </div>
              </div>

            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,.07)', flex: 'none', background: 'rgba(12,12,15,.35)' }}>
              <span onClick={closeDrawer} style={{ fontSize: '13px', fontWeight: 600, color: '#9b958a', padding: '10px 16px', cursor: 'pointer' }}>Hủy</span>
              <span onClick={!isSubmitting ? handleSaveBanner : undefined} style={{ fontSize: '13px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '10px 20px', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>{isSubmitting ? 'Đang lưu...' : (editBannerId ? 'Cập nhật' : 'Thêm banner')}</span>
            </div>
          </div>
        </div>
      )}

      {/* NEW BLOG MODAL */}
      {isAdding === 'blog' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '750px', maxWidth: '94vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', flex: 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Blog &amp; cẩm nang · Trang chủ</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#f3f0ea', marginTop: '3px' }}>{editBlogId ? 'Sửa bài viết' : 'Viết bài mới'}</div>
              </div>
              <span onClick={closeDrawer} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }}>
                <X size={16} />
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Tiêu đề bài viết</div>
                <input value={blogTitle} onChange={e => setBlogTitle(e.target.value)} placeholder="Nhập tiêu đề bài viết" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit', outline: 'none' }} />
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
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  style={{ display: 'none' }} 
                  id="cover-image-upload" 
                  onChange={(e) => { 
                    const file = e.target.files?.[0]; 
                    if (file) { 
                      setCoverImage(URL.createObjectURL(file)); 
                      setCoverImageFile(file); 
                    } 
                  }} 
                />
                <label htmlFor="cover-image-upload" style={{ display: 'block', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', height: '150px', borderRadius: '13px', overflow: 'hidden', border: coverImage ? 'none' : '1px dashed rgba(212,178,106,.4)', background: 'rgba(12,12,15,.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                    {coverImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <span 
                          onClick={(e) => { e.preventDefault(); setCoverImage(null); setCoverImageFile(null); }} 
                          style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,.6)', color: '#fff', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={28} style={{ color: '#8c8679' }} strokeWidth={1.5} />
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#cbb884' }}>Bấm để tải ảnh bìa</span>
                        <span style={{ fontSize: '10.5px', color: '#57534b' }}>PNG / JPG · tỉ lệ 16:9 · hiển thị trên trang chủ</span>
                      </>
                    )}
                  </div>
                </label>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}><span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase' }}>Mô tả ngắn</span><span style={{ flex: 1 }}></span><span style={{ fontSize: '10.5px', color: '#57534b' }}>{blogExcerpt.length} / 160</span></div>
                <textarea value={blogExcerpt} onChange={e => setBlogExcerpt(e.target.value.slice(0, 160))} rows={2} placeholder="Viết nội dung mô tả ngắn..." style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '11px 15px', color: '#f3f0ea', fontSize: '13px', lineHeight: 1.55, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}></textarea>
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
              .ql-editor * {
                background-color: transparent !important;
                color: inherit !important;
              }
              
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

      {isManagingTags && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 400, background: '#18181f', borderRadius: 16, border: '1px solid rgba(255,255,255,.05)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#f3f0ea' }}>Quản lý Nhãn Slot</h3>
              <button onClick={() => setIsManagingTags(false)} style={{ background: 'transparent', border: 'none', color: '#8c8679', cursor: 'pointer', padding: 0 }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <input 
                  type="text" 
                  placeholder="Nhập tên nhãn mới..." 
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  style={{ flex: 1, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '9px', padding: '0 16px', fontSize: '13px', color: '#f3f0ea', outline: 'none' }} 
                />
                <button 
                  onClick={handleAddTag}
                  disabled={isSubmittingTag || !newTagName.trim()}
                  style={{ background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', color: '#241a0a', border: 'none', borderRadius: '9px', padding: '0 20px', fontSize: '13px', fontWeight: 700, cursor: isSubmittingTag || !newTagName.trim() ? 'not-allowed' : 'pointer', opacity: isSubmittingTag || !newTagName.trim() ? 0.5 : 1 }}
                >
                  Thêm
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {bannerTagsList.length === 0 && <div style={{ fontSize: '13px', color: '#8c8679', textAlign: 'center', padding: '10px 0' }}>Chưa có nhãn nào.</div>}
                {bannerTagsList.map(tag => (
                  <div key={tag.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.05)', borderRadius: '9px' }}>
                    <span style={{ fontSize: '13px', color: '#f3f0ea', fontWeight: 500 }}>{tag.name}</span>
                    <span onClick={() => handleDeleteTag(tag.id)} style={{ color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Xóa</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO TOAST */}
      <div style={{
        position: 'fixed',
        bottom: showVideoToast ? '40px' : '-100px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(20, 20, 25, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '30px',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        transition: 'bottom 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 1000
      }}>
        <div style={{ color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span style={{ color: '#f3f0ea', fontSize: '14px', fontWeight: 600 }}>Dùng ô tìm kiếm phía dưới để thêm</span>
      </div>

    </div>
  );
}
