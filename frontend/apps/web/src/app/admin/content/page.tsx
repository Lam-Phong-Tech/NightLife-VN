"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Plus, X, Search, Eye, Image as ImageIcon, Settings, Pencil } from 'lucide-react';
import 'react-quill-new/dist/quill.snow.css';
import { contentApi, CmsContentItem } from '@/lib/api/content';
import { categoriesApi, CategoryItem } from '@/lib/api/categories';
import { apiFormDataClient, apiClient, resolveClientUrl } from '@/lib/api/client';
import { adminRankingsApi, AdminRankingConfig, AdminRankingTargetOption } from '@/lib/api/admin-rankings';
import type { RankingCity, RankingCategory } from '@/lib/api/rankings';
import { campaignsApi, CampaignItem } from '@/lib/api/campaigns';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';
import { ConfigProvider, DatePicker } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/vi';

dayjs.extend(customParseFormat);
dayjs.locale('vi');

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
};


export default function AdminContentPage() {
  const feedback = useSystemFeedback();
  const [activeTab, setActiveTab] = useState<'campaign' | 'banner' | 'featured' | 'recommend' | 'video' | 'blog'>('campaign');
  const [isAdding, setIsAdding] = useState<'campaign' | 'banner' | 'blog' | null>(null);
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
  const [videoRegion, setVideoRegion] = useState('Tất cả');
  const [hotVideos, setHotVideos] = useState<any[]>([]);
  const [searchVideos, setSearchVideos] = useState<any[]>([]);
  const [searchVideoQuery, setSearchVideoQuery] = useState('');
  const [searchVideoPage, setSearchVideoPage] = useState(1);
  const [searchVideoTotalPages, setSearchVideoTotalPages] = useState(1);
  const [isLoadingHotVideos, setIsLoadingHotVideos] = useState(false);
  const [isSearchingVideo, setIsSearchingVideo] = useState(false);

  // Featured Services states
  const [featuredCity, setFeaturedCity] = useState<'all' | 'hn' | 'hcm'>('all');
  const [featuredCategory, setFeaturedCategory] = useState<'RESTAURANT' | 'MASSAGE_SPA'>('RESTAURANT');
  const [featuredItems, setFeaturedItems] = useState<AdminRankingConfig[]>([]);
  const [searchFeaturedQuery, setSearchFeaturedQuery] = useState('');
  const [searchFeaturedItems, setSearchFeaturedItems] = useState<AdminRankingTargetOption[]>([]);
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(false);
  const [isSearchingFeatured, setIsSearchingFeatured] = useState(false);

  // Recommend Home states
  const [recommendItems, setRecommendItems] = useState<AdminRankingConfig[]>([]);
  const [searchRecommendQuery, setSearchRecommendQuery] = useState('');
  const [searchRecommendItems, setSearchRecommendItems] = useState<AdminRankingTargetOption[]>([]);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(false);
  const [isSearchingRecommend, setIsSearchingRecommend] = useState(false);

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
  const [bannerAspect, setBannerAspect] = useState('21/9');
  const [bannerOrder, setBannerOrder] = useState<number | ''>('');
  const [bannerStoreSearch, setBannerStoreSearch] = useState('');
  const [bannerStoreResults, setBannerStoreResults] = useState<any[]>([]);
  const [bannerLinkedStore, setBannerLinkedStore] = useState<any | null>(null);
  const [isDeletingBanner, setIsDeletingBanner] = useState(false);

  const [campaignDiscountType, setCampaignDiscountType] = useState<'percent' | 'amount'>('percent');
  const [campaignDiscountValue, setCampaignDiscountValue] = useState<string>('10%');
  const [campaignDates, setCampaignDates] = useState<any>(null);
  const [campaignStatus, setCampaignStatus] = useState('Hoạt động');
  const [campaignStoreSearch, setCampaignStoreSearch] = useState('');
  const [campaignStoreResults, setCampaignStoreResults] = useState<any[]>([]);
  const [campaignLinkedStore, setCampaignLinkedStore] = useState<any | null>(null);
  const [campaignName, setCampaignName] = useState('');
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [editCampaignId, setEditCampaignId] = useState<string | null>(null);
  const [isDeletingCampaign, setIsDeletingCampaign] = useState(false);

  const [bannerTagsList, setBannerTagsList] = useState<CategoryItem[]>([]);
  const [isManagingTags, setIsManagingTags] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [isSubmittingTag, setIsSubmittingTag] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBlogs();
    fetchBanners();
    fetchBannerTags();
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (activeTab === 'video') {
      fetchHotVideos(videoRegion);
    }
  }, [activeTab, videoRegion]);

  useEffect(() => {
    if (activeTab === 'video') {
      const timer = setTimeout(() => {
        fetchStoreVideos(searchVideoQuery, searchVideoPage, videoRegion);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchVideoQuery, searchVideoPage, activeTab, videoRegion]);

  useEffect(() => {
    if (activeTab === 'featured') {
      fetchFeaturedItems();
    }
  }, [activeTab, featuredCity, featuredCategory]);

  useEffect(() => {
    if (activeTab === 'featured') {
      const timer = setTimeout(() => {
        searchFeaturedStore(searchFeaturedQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchFeaturedQuery, activeTab, featuredCity, featuredCategory]);


  const fetchFeaturedItems = async () => {
    try {
      setIsLoadingFeatured(true);
      const data = await adminRankingsApi.list({
        targetType: 'STORE',
        scope: 'featured_home',
        city: featuredCity === 'all' ? undefined : featuredCity,
        category: featuredCategory as any
      });
      setFeaturedItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingFeatured(false);
    }
  };

  const searchFeaturedStore = async (q: string) => {
    try {
      setIsSearchingFeatured(true);
      const data = await adminRankingsApi.options({
        targetType: 'STORE',
        q,
        limit: 10,
        city: featuredCity === 'all' ? undefined : (featuredCity as any),
        category: featuredCategory as any
      });
      setSearchFeaturedItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingFeatured(false);
    }
  };

  const handleAddFeatured = async (store: AdminRankingTargetOption) => {
    if (featuredItems.find(item => item.targetId === store.id)) return;
    try {
      await adminRankingsApi.create({
        targetType: 'STORE',
        targetId: store.id,
        cityCode: featuredCity === 'all' ? (store.cityCode as any || 'all') : featuredCity,
        category: featuredCategory as any,
        scope: 'featured_home',
        pinRank: featuredItems.length > 0 ? (featuredItems[featuredItems.length - 1]?.pinRank || 0) + 1 : 1,
        status: 'ACTIVE'
      });
      await fetchFeaturedItems();
      setSearchFeaturedQuery('');
    } catch (err: any) {
      console.error(err?.response?.data || err);
      feedback.showToast({ title: `Không thể thêm vào danh sách nổi bật: ${err?.response?.data?.message || err.message || ''}`, tone: 'error' });
    }
  };

  const handleRemoveFeatured = async (id: string) => {
    feedback.showModal({
      title: 'Xác nhận gỡ',
      description: 'Bạn có chắc muốn gỡ khỏi trang chủ?',
      onPrimary: async () => {
        try {
          await adminRankingsApi.delete(id);
          await fetchFeaturedItems();
          feedback.closeModal();
        } catch (err) {
          feedback.showToast({ title: 'Không thể gỡ.', tone: 'error' });
        }
      }
    }); return;
    try {
      await adminRankingsApi.delete(id);
      await fetchFeaturedItems();
    } catch (err) {
      console.error(err);
      feedback.showToast({ title: 'Không thể gỡ.', tone: 'error' });
    }
  };

  const handleMoveFeatured = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === featuredItems.length - 1) return;
    
    const currentItem = featuredItems[index];
    const swapItem = direction === 'up' ? featuredItems[index - 1] : featuredItems[index + 1];
    
    if (!currentItem || !swapItem) return;

    const currentRank = currentItem.pinRank || index + 1;
    const swapRank = swapItem.pinRank || (direction === 'up' ? index : index + 2);

    try {
      await adminRankingsApi.update(swapItem.id, {
        targetType: 'STORE',
        targetId: swapItem.targetId,
        cityCode: swapItem.cityCode,
        pinRank: null
      });

      await adminRankingsApi.update(currentItem.id, {
        targetType: 'STORE',
        targetId: currentItem.targetId,
        cityCode: currentItem.cityCode,
        pinRank: swapRank
      });

      await adminRankingsApi.update(swapItem.id, {
        targetType: 'STORE',
        targetId: swapItem.targetId,
        cityCode: swapItem.cityCode,
        pinRank: currentRank
      });

      await fetchFeaturedItems();
    } catch (err) {
      console.error(err);
      feedback.showToast({ title: 'Không thể đổi vị trí.', tone: 'error' });
    }
  };

  interface SearchStoreItem {
    id: string;
    name: string;
    slug: string;
    media?: Array<{ url: string; purpose: string }>;
    district?: string;
    city: string;
    category: string;
    status: string;
  }

  async function fetchRecommendItems() {
    try {
      setIsLoadingRecommend(true);
      const data = await adminRankingsApi.list({
        targetType: 'STORE',
        scope: 'recommend-home'
      });
      const sorted = (data || []).sort((a, b) => (a.pinRank || 0) - (b.pinRank || 0));
      setRecommendItems(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRecommend(false);
    }
  }

  async function searchRecommendStore(q: string) {
    if (!q.trim()) {
      setSearchRecommendItems([]);
      return;
    }
    try {
      setIsSearchingRecommend(true);
      const res = await apiClient<{ data: SearchStoreItem[] }>('/admin/stores', { params: { search: q, limit: 10 } });
      if (res && res.data) {
        const mapped: AdminRankingTargetOption[] = (res.data || [])
          .filter((s: SearchStoreItem) => s.status === 'ACTIVE')
          .map((s: SearchStoreItem) => ({
            id: s.id,
            targetType: 'STORE',
            name: s.name,
            slug: s.slug,
            image: s.media?.find((m) => m.purpose === 'STORE_COVER' || m.purpose === 'STORE_AVATAR')?.url || s.media?.[0]?.url || null,
            area: s.district || s.city,
            city: s.city,
            cityCode: s.city === 'Hà Nội' || s.city === 'Hanoi' ? 'hn' : (s.city === 'Hồ Chí Minh' || s.city === 'Ho Chi Minh City' ? 'hcm' : 'all'),
            category: s.category,
            status: s.status
          }));
        setSearchRecommendItems(mapped);
      } else {
        setSearchRecommendItems([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingRecommend(false);
    }
  }

  const handleAddRecommend = async (store: AdminRankingTargetOption) => {
    if (recommendItems.find(item => item.targetId === store.id)) return;
    
    if (recommendItems.length >= 8) {
      feedback.showModal({
        title: 'Giới hạn đề xuất',
        description: 'Mục "Đề xuất tối nay" chỉ hiển thị tối đa 8 quán trên trang chủ. Vui lòng gỡ bớt quán khác trước khi thêm quán này.',
        tone: 'warning',
        primaryLabel: 'Đã hiểu'
      });
      return;
    }

    try {
      await adminRankingsApi.create({
        targetType: 'STORE',
        targetId: store.id,
        cityCode: (store.cityCode as RankingCity) || 'all',
        category: (store.category as RankingCategory) || null,
        scope: 'recommend-home',
        pinRank: recommendItems.length > 0 ? (recommendItems[recommendItems.length - 1]?.pinRank || 0) + 1 : 1,
        status: 'ACTIVE'
      });
      await fetchRecommendItems();
      setSearchRecommendQuery('');
    } catch (err: unknown) {
      console.error(err);
      let msg = '';
      if (err instanceof Error) {
        msg = err.message;
        if ('response' in err) {
          const resp = (err as { response?: { data?: { message?: string } } }).response;
          if (resp?.data?.message) {
            msg = resp.data.message;
          }
        }
      }
      feedback.showToast({ 
        title: `Không thể thêm vào danh sách đề xuất: ${msg}`, 
        tone: 'error' 
      });
    }
  };

  const handleRemoveRecommend = async (id: string) => {
    feedback.showModal({
      title: 'Xác nhận gỡ',
      description: 'Bạn có chắc chắn muốn gỡ quán này khỏi mục "Đề xuất tối nay"?',
      tone: 'warning',
      onPrimary: async () => {
        try {
          await adminRankingsApi.delete(id);
          await fetchRecommendItems();
          feedback.closeModal();
          feedback.showToast({ title: 'Đã gỡ thành công', tone: 'success' });
        } catch (err) {
          console.error(err);
          feedback.showToast({ title: 'Không thể gỡ.', tone: 'error' });
        }
      }
    });
  };

  const handleMoveRecommend = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === recommendItems.length - 1) return;
    
    const currentItem = recommendItems[index];
    const swapItem = direction === 'up' ? recommendItems[index - 1] : recommendItems[index + 1];
    
    if (!currentItem || !swapItem) return;

    const currentRank = currentItem.pinRank || index + 1;
    const swapRank = swapItem.pinRank || (direction === 'up' ? index : index + 2);

    try {
      // Step 1: Update swapItem to pinRank: null first
      await adminRankingsApi.update(swapItem.id, {
        targetType: 'STORE',
        targetId: swapItem.targetId,
        cityCode: swapItem.cityCode,
        pinRank: null
      });

      // Step 2: Update currentItem to swapRank
      await adminRankingsApi.update(currentItem.id, {
        targetType: 'STORE',
        targetId: currentItem.targetId,
        cityCode: currentItem.cityCode,
        pinRank: swapRank
      });

      // Step 3: Update swapItem to currentRank
      await adminRankingsApi.update(swapItem.id, {
        targetType: 'STORE',
        targetId: swapItem.targetId,
        cityCode: swapItem.cityCode,
        pinRank: currentRank
      });

      await fetchRecommendItems();
    } catch (err) {
      console.error(err);
      feedback.showToast({ title: 'Không thể đổi vị trí.', tone: 'error' });
    }
  };

  useEffect(() => {
    if (activeTab === 'recommend') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchRecommendItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'recommend') {
      const timer = setTimeout(() => {
        searchRecommendStore(searchRecommendQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchRecommendQuery, activeTab]);


  const fetchHotVideos = async (region: string) => {
    const code = region === 'Hà Nội' ? 'hn' : region === 'TP. Hồ Chí Minh' ? 'hcm' : 'all';
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

  const fetchStoreVideos = async (query: string, page: number, region?: string) => {
    try {
      setIsSearchingVideo(true);
      const cityCode = region === 'Hà Nội' ? 'hn' : (region === 'TP. Hồ Chí Minh' ? 'hcm' : 'all');
      const data = await apiClient<any>('/admin/media/store-videos', {
        params: { search: query, page, limit: 10, cityCode }
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
    const code = videoRegion === 'Hà Nội' ? 'hn' : videoRegion === 'TP. Hồ Chí Minh' ? 'hcm' : 'all';
    try {
      await apiClient(`/admin/content/hot-videos/${code}`, {
        method: 'PUT',
        data: { mediaIds: hotVideos.map(v => v.id) }
      });
      feedback.showToast({ title: 'Đã lưu danh sách Video Hot thành công', tone: 'success' });
    } catch (err) {
      console.error(err);
      feedback.showToast({ title: 'Có lỗi xảy ra khi lưu', tone: 'error' });
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

  const fetchCampaigns = async () => {
    try {
      const data = await campaignsApi.adminList();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    }
  };

  const handleEditCampaign = (campaign: CampaignItem) => {
    setEditCampaignId(campaign.id);
    setCampaignName(campaign.name);
    setCampaignDiscountType(campaign.discountType === 'PERCENT' ? 'percent' : 'amount');
    setCampaignDiscountValue(campaign.discountValue + (campaign.discountType === 'PERCENT' ? '%' : 'K'));
    setCampaignDates(campaign.startsAt ? [dayjs(campaign.startsAt), campaign.endsAt ? dayjs(campaign.endsAt) : null] : null);
    setCampaignStatus(campaign.status === 'ACTIVE' ? 'Hoạt động' : campaign.status === 'PAUSED' ? 'Tạm dừng' : 'Bản nháp');
    setCampaignLinkedStore(campaign.targetStore || null);
    setIsAdding('campaign');
  };

  const handleDeleteCampaign = async (id: string) => {
    feedback.showModal({
      title: 'Xóa campaign',
      description: 'Bạn có chắc chắn muốn xóa campaign này?',
      onPrimary: async () => {
        try {
          setIsDeletingCampaign(true);
          await campaignsApi.adminDelete(id);
          fetchCampaigns();
          feedback.closeModal();
          closeDrawer();
        } catch (e) {
          feedback.showToast({ title: 'Lỗi khi xóa campaign', tone: 'error' });
        } finally {
          setIsDeletingCampaign(false);
        }
      }
    });
  };

  const handleSaveCampaign = async () => {
    if (!campaignName) {
      feedback.showToast({ title: 'Vui lòng nhập tên chương trình', tone: 'error' });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const data = {
        name: campaignName,
        discountType: campaignDiscountType === 'percent' ? 'PERCENT' : 'FIXED_AMOUNT',
        discountValue: parseInt(campaignDiscountValue.replace(/\D/g, '')),
        status: campaignStatus === 'Hoạt động' ? 'ACTIVE' : campaignStatus === 'Tạm dừng' ? 'PAUSED' : 'DRAFT',
        startsAt: campaignDates?.[0] ? campaignDates[0].toISOString() : null,
        endsAt: campaignDates?.[1] ? campaignDates[1].toISOString() : null,
        targetStoreId: campaignLinkedStore?.id || null,
      };

      if (editCampaignId) {
        await campaignsApi.adminUpdate(editCampaignId, data as any);
      } else {
        await campaignsApi.adminCreate(data as any);
      }
      
      fetchCampaigns();
      closeDrawer();
      feedback.showToast({ title: editCampaignId ? 'Đã cập nhật campaign' : 'Đã tạo campaign', tone: 'success' });
    } catch (e) {
      console.error(e);
      feedback.showToast({ title: 'Có lỗi xảy ra khi lưu campaign', tone: 'error' });
    } finally {
      setIsSubmitting(false);
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
      feedback.showToast({ title: 'Có lỗi xảy ra khi thêm nhãn', tone: 'error' });
    } finally {
      setIsSubmittingTag(false);
    }
  };

  const handleDeleteTag = async (id: string) => {
    feedback.showModal({
      title: 'Xóa nhãn',
      description: 'Bạn có chắc chắn muốn xóa nhãn này?',
      onPrimary: async () => {
        try {
          await apiClient(`/admin/content/tags/${id}`, { method: 'DELETE' });
          fetchBannerTags();
          feedback.closeModal();
        } catch (error) {
          console.error(error);
          feedback.showToast({ title: 'Có lỗi xảy ra khi xóa nhãn', tone: 'error' });
        }
      }
    }); return;
    try {
      await categoriesApi.adminDelete(id);
      fetchBannerTags();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      feedback.showToast({ title: 'Có lỗi xảy ra khi xóa nhãn', tone: 'error' });
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
      feedback.showToast({ title: 'Có lỗi xảy ra khi thêm chuyên mục.', tone: 'error' });
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    feedback.showModal({
      title: 'Xóa chuyên mục',
      description: 'Bạn có chắc chắn muốn xóa chuyên mục này?',
      onPrimary: async () => {
        try {
          await apiClient(`/admin/content/categories/${id}`, { method: 'DELETE' });
          fetchCategories();
          feedback.closeModal();
        } catch (error) {
          console.error(error);
          feedback.showToast({ title: 'Có lỗi xảy ra khi xóa chuyên mục.', tone: 'error' });
        }
      }
    }); return;
    try {
      await categoriesApi.adminDelete(id);
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      feedback.showToast({ title: 'Có lỗi xảy ra khi xóa chuyên mục.', tone: 'error' });
    }
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
    setBannerAspect(meta.aspect || '21/9');
    setBannerOrder(meta.order ?? '');
    setBannerLinkedStore(meta.linkedStore || null);
    setIsAdding('banner');
  };

  const handleDeleteBanner = async (bannerId: string) => {
    feedback.showModal({
      title: 'Xóa banner',
      description: 'Bạn có chắc chắn muốn xóa banner này?',
      onPrimary: async () => {
        try {
          await contentApi.adminDelete(bannerId);
          fetchBanners();
          feedback.closeModal();
        } catch (e) {
          feedback.showToast({ title: 'Lỗi khi xóa banner', tone: 'error' });
        }
      }
    }); return;
    try {
      setIsDeletingBanner(true);
      await contentApi.adminDelete(bannerId);
      fetchBanners();
      closeDrawer();
    } catch (err) {
      console.error(err);
      feedback.showToast({ title: 'Lỗi khi xóa banner', tone: 'error' });
    } finally {
      setIsDeletingBanner(false);
    }
  };

  const searchBannerStores = async (q: string) => {
    setBannerStoreSearch(q);
    if (!q.trim()) { setBannerStoreResults([]); return; }
    try {
      const res = await apiClient<any>('/admin/stores', { params: { search: q, limit: 6 } });
      if (res?.data) setBannerStoreResults(res.data);
    } catch (e) { console.error(e); }
  };

  const searchCampaignStores = async (q: string) => {
    setCampaignStoreSearch(q);
    if (!q.trim()) { setCampaignStoreResults([]); return; }
    try {
      const res = await apiClient<any>('/admin/stores', { params: { search: q, limit: 6 } });
      if (res?.data) setCampaignStoreResults(res.data);
    } catch (e) { console.error(e); }
  };

  // Automatically assign next order when adding a new banner
  useEffect(() => {
    if (!editBannerId && isAdding === 'banner') {
      const posBanners = banners.filter(b => {
        const meta = (b.metadata as any) || {};
        return (meta.position || 'Trang chủ #1') === bannerPos;
      });
      const maxOrder = posBanners.reduce((max, b) => {
        const order = Number((b.metadata as any)?.order) || 0;
        return order > max ? order : max;
      }, 0);
      setBannerOrder(maxOrder + 1);
    }
  }, [bannerPos, editBannerId, banners, isAdding]);

  const closeDrawer = () => {
    setIsAdding(null);
    setCampaignName('');
    setCampaignDates(null);
    setCampaignLinkedStore(null);
    setCampaignStatus('Hoạt động');
    setCampaignDiscountType('percent');
    setCampaignDiscountValue('10%');
    setEditCampaignId(null);
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
    setBannerAspect('21/9');
    setBannerOrder('');
    setBannerLinkedStore(null);
    setBannerStoreSearch('');
    setBannerStoreResults([]);
    setSearchRecommendQuery('');
    setSearchRecommendItems([]);
  };

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim()) {
      feedback.showToast({ title: 'Vui lòng nhập tiêu đề banner!', tone: 'warning' });
      return;
    }
    try {
      setIsSubmitting(true);
      
      let finalImageUrl = bannerImage && !bannerImage.startsWith('blob:') ? bannerImage : '';
      if (bannerImageFile) {
        const form = new FormData();
        form.append('file', bannerImageFile);
        form.append('purpose', 'BANNER_GLOBAL');
        form.append('access', 'PUBLIC');
        try {
          const res = await apiFormDataClient<any>('/storage/upload', form);
          if (res && res.url) {
            finalImageUrl = res.url;
          }
        } catch (uploadErr) {
          console.error('Failed to upload banner image:', uploadErr);
          feedback.showToast({ title: 'Lỗi tải ảnh. Banner sẽ được lưu nhưng không có ảnh mới.', tone: 'error' });
        }
      }

      const payload = {
        title: bannerTitle,
        type: 'BANNER' as any,
        status: (bannerStatus === 'Đang hiển thị' ? 'PUBLISHED' : bannerStatus === 'Ẩn' ? 'ARCHIVED' : 'DRAFT') as any,
        metadata: {
          tag: bannerTag,
          position: bannerPos,
          link: bannerLinkedStore ? `/stores/${bannerLinkedStore.slug}` : (bannerLink.startsWith('/quan/') ? bannerLink.replace(/^\/quan\//, '/stores/') : bannerLink),
          linkedStore: bannerLinkedStore ? { id: bannerLinkedStore.id, name: bannerLinkedStore.name, slug: bannerLinkedStore.slug, category: bannerLinkedStore.category, area: bannerLinkedStore.area } : null,
          imageUrl: finalImageUrl,
          statusLabel: bannerStatusLabel,
          subtitle: bannerSubtitle,
          description: bannerDescription,
          aspect: bannerAspect,
          order: bannerOrder === '' ? undefined : Number(bannerOrder)
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
    } catch (error: any) {
      console.error('Failed to save banner:', error);
      feedback.showToast({ title: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu banner', tone: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBlog = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!blogTitle.trim()) {
      feedback.showToast({ title: 'Vui lòng nhập tiêu đề bài viết!', tone: 'warning' });
      return;
    }

    try {
      setIsSubmitting(true);
      let finalImageUrl = coverImage && !coverImage.startsWith('blob:') ? coverImage : null;

      let targetBlogId = editBlogId;
      if (coverImageFile && !targetBlogId) {
        const draft = await contentApi.adminCreate({
          type: 'BLOG' as const,
          title: blogTitle,
          status: 'DRAFT',
          excerpt: blogExcerpt,
          body: blogContent,
          metadata: {
            category: blogCategory,
            language: blogLanguage,
          },
        });
        targetBlogId = draft.id;
        setEditBlogId(draft.id);
      }

      if (coverImageFile && targetBlogId) {
        const form = new FormData();
        form.append('file', coverImageFile);
        form.append('purpose', 'BLOG_COVER');
        form.append('access', 'PUBLIC');
        form.append('contentId', targetBlogId);
        
        try {
          const res = await apiFormDataClient<any>('/storage/upload', form);
          if (res && res.url) {
            finalImageUrl = res.url;
          }
        } catch (uploadErr) {
          console.error('Failed to upload image:', uploadErr);
          feedback.showToast({ title: 'Lỗi tải ảnh bìa. Bài viết vẫn sẽ được lưu nhưng không có ảnh bìa mới.', tone: 'error' });
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

      if (targetBlogId) {
        await contentApi.adminUpdate(targetBlogId, payload);
      } else {
        await contentApi.adminCreate(payload);
      }
      feedback.showToast({ title: status === 'DRAFT' ? 'Đã lưu nháp thành công!' : 'Đã đăng bài thành công!', tone: 'success' });
      fetchBlogs();
      closeDrawer();
    } catch (error: any) {
      console.error('Failed to save blog:', error);
      feedback.showToast({ title: error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi lưu bài viết. Vui lòng thử lại!', tone: 'error' });
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
            onClick={() => setActiveTab('recommend')}
            style={{
              padding: '8px 24px', borderRadius: '6px', border: 'none', 
              background: activeTab === 'recommend' ? colors.goldGrad : 'transparent',
              color: activeTab === 'recommend' ? colors.onGold : colors.muted,
              fontWeight: activeTab === 'recommend' ? 700 : 500,
              fontSize: '13px', cursor: 'pointer'
            }}
          >
            Đề xuất tối nay
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
            } else if (activeTab === 'featured') {
              const searchInput = document.getElementById('featured-search-input');
              if (searchInput) searchInput.focus();
            } else if (activeTab === 'recommend') {
              const searchInput = document.getElementById('recommend-search-input');
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
          {activeTab === 'campaign' ? 'Thêm campaign' : activeTab === 'banner' ? 'Thêm banner' : activeTab === 'featured' ? 'Thêm dịch vụ' : activeTab === 'video' ? 'Thêm video hot' : activeTab === 'recommend' ? 'Thêm đề xuất' : 'Viết bài'}
        </button>
      </div>



      {/* CAMPAIGN CONTENT */}
      {activeTab === 'campaign' && (
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1.2fr 130px', gap: '12px', padding: '13px 18px', fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#57534b', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,.06)', background: 'rgba(255,255,255,.015)' }}>
            <span>Chương trình</span><span>Áp dụng</span><span>Thời gian</span><span style={{ textAlign: 'right' }}>Trạng thái</span>
          </div>
          
          {campaigns.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Chưa có campaign nào.</div>
          ) : (
            campaigns.map(camp => {
              const discountText = camp.discountType === 'PERCENT' ? `−${camp.discountValue}%` : `−${camp.discountValue}K`;
              const storeName = camp.targetStore?.name || 'Toàn hệ thống';
              const timeText = camp.startsAt ? `${dayjs(camp.startsAt).format('DD/MM')} – ${camp.endsAt ? dayjs(camp.endsAt).format('DD/MM') : '...'}` : 'Luôn áp dụng';
              
              let statusColor = '#9ca3af';
              let statusBorder = 'rgba(156,163,175,0.3)';
              let statusText: string = camp.status;
              if (camp.status === 'ACTIVE') { statusColor = '#4ade80'; statusBorder = 'rgba(74,222,128,0.3)'; statusText = 'Đang chạy'; }
              if (camp.status === 'PAUSED') { statusColor = '#facc15'; statusBorder = 'rgba(250,204,21,0.3)'; statusText = 'Tạm dừng'; }
              if (camp.status === 'DRAFT') { statusColor = '#818cf8'; statusBorder = 'rgba(129,140,248,0.3)'; statusText = 'Bản nháp'; }
              if (camp.status === 'EXPIRED') { statusColor = '#9ca3af'; statusBorder = 'rgba(156,163,175,0.3)'; statusText = 'Đã kết thúc'; }

              return (
                <div key={camp.id} onClick={() => handleEditCampaign(camp)} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1.2fr 130px', gap: '12px', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.04)', fontSize: '13px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}><span style={{ fontSize: '15px', fontWeight: 800, color: '#e3c27e', minWidth: '52px' }}>{discountText}</span><span style={{ color: '#f3f0ea', fontWeight: 500 }}>{camp.name}</span></div>
                  <span style={{ color: '#c5c0b6' }}>{storeName}</span>
                  <span style={{ color: '#8c8679', fontSize: '12px' }}>{timeText}</span>
                  <span style={{ textAlign: 'right' }}><span style={{ color: statusColor, border: `1px solid ${statusBorder}`, padding: '2px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 600 }}>{statusText}</span></span>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* BANNER CONTENT */}
      {activeTab === 'banner' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {banners.map((banner) => {
            const metadata = (banner.metadata as any) || {};
            const displayStatus = banner.status === 'PUBLISHED' ? 'Đang hiển thị' : banner.status === 'DRAFT' ? 'Nháp' : 'Ẩn';
            const bgImage = metadata.imageUrl ? `linear-gradient(180deg, rgba(24,24,31,0) 0%, rgba(24,24,31,0.8) 100%), url(${resolveClientUrl(metadata.imageUrl)})` : `linear-gradient(180deg, rgba(24,24,31,0) 0%, rgba(24,24,31,0.8) 100%), #1f1f26`;
            
            return (
            <div key={banner.id} data-noinvert onClick={() => handleEditBanner(banner)} style={{ 
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
            <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}>Khối <b style={{ color: '#f0dda8' }}>&quot;Dịch vụ nổi bật&quot;</b> trên trang chủ — chọn quán theo khu vực &amp; nhóm dịch vụ, gắn nhãn, sắp thứ tự. Trang chủ hiển thị đúng thứ tự này.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
              <span style={featuredCity === 'all' ? activeTabStyle : inactiveTabStyle} onClick={() => setFeaturedCity('all')}>Tất cả</span>
              <span style={featuredCity === 'hn' ? activeTabStyle : inactiveTabStyle} onClick={() => setFeaturedCity('hn')}>Hà Nội</span>
              <span style={featuredCity === 'hcm' ? activeTabStyle : inactiveTabStyle} onClick={() => setFeaturedCity('hcm')}>TP. Hồ Chí Minh</span>
            </div>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
              <span style={featuredCategory === 'RESTAURANT' ? activeTabStyle : inactiveTabStyle} onClick={() => setFeaturedCategory('RESTAURANT')}>Nhà hàng</span>
              <span style={featuredCategory === 'MASSAGE_SPA' ? activeTabStyle : inactiveTabStyle} onClick={() => setFeaturedCategory('MASSAGE_SPA')}>Spa</span>
            </div>
            <div style={{ flex: 1 }}></div>
            <span style={{ fontSize: '11px', color: '#8c8679' }}>{featuredItems.length} quán đang hiển thị trên trang chủ</span>
          </div>

          <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'rgba(12,12,15,.5)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input id="featured-search-input" value={searchFeaturedQuery} onChange={e => setSearchFeaturedQuery(e.target.value)} placeholder="Tìm quán để thêm vào mục nổi bật…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px', maxHeight: '210px', overflowY: 'auto' }}>
              {isSearchingFeatured ? (
                <div style={{ padding: '10px', color: '#8c8679', fontSize: '12px' }}>Đang tìm...</div>
              ) : searchFeaturedItems.map(store => (
                <div key={store.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 10px' }}>
                  <div style={{ width: '44px', height: '34px', flex: 'none', borderRadius: '8px', background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                    {store.image ? <img src={resolveClientUrl(store.image as string) || undefined} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{store.name}</div>
                    <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>{(typeof store.area === 'object' && store.area ? (store.area as { name: string }).name : store.area) || store.city} · {store.category}</div>
                  </div>
                  {featuredItems.find(f => f.targetId === store.id) ? (
                    <span style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#8c8679', padding: '7px 14px' }}>Đã thêm</span>
                  ) : (
                    <span onClick={() => handleAddFeatured(store)} style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}>+ Hiện trên trang chủ</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
            {featuredItems.map((item, idx) => {
              const labels: string[] = [];
              return (
                <div key={item.id} style={{ display: 'flex', gap: '13px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '15px', padding: '12px' }}>
                  <div style={{ width: '92px', height: '76px', flex: 'none', borderRadius: '11px', background: 'rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden' }}>
                    {item.targetImage ? (
                      <img src={resolveClientUrl(item.targetImage as string) || undefined} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                    {labels.includes('Mới') && (
                      <span style={{ position: 'absolute', top: '7px', left: '7px', fontSize: '8.5px', fontWeight: 700, color: '#f3f0ea', background: 'rgba(12,12,15,.62)', border: '1px solid rgba(255,255,255,.2)', padding: '2.5px 7px', borderRadius: '6px', zIndex: 1 }}>Mới</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f3f0ea', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.targetName}</div>
                    <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.targetArea || item.targetCity} · {item.targetCategory}</div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '9px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: '#f0dda8', color: '#241a0a' }}>Không nhãn</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                    <span onClick={() => handleMoveFeatured(idx, 'up')} style={{ width: '26px', height: '22px', borderRadius: '6px', background: idx === 0 ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === 0 ? 'rgba(255,255,255,.1)' : '#c5c0b6', cursor: idx === 0 ? 'default' : 'pointer' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg></span>
                    <span onClick={() => handleMoveFeatured(idx, 'down')} style={{ width: '26px', height: '22px', borderRadius: '6px', background: idx === featuredItems.length - 1 ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === featuredItems.length - 1 ? 'rgba(255,255,255,.1)' : '#c5c0b6', cursor: idx === featuredItems.length - 1 ? 'default' : 'pointer' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>
                    <span onClick={() => handleRemoveFeatured(item.id)} style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></span>
                  </div>
                </div>
              );
            })}
            {featuredItems.length === 0 && !isLoadingFeatured && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Chưa có quán nào trong danh sách này</div>
            )}
            {isLoadingFeatured && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Đang tải...</div>
            )}
          </div>

        </div>
        );
      })()}

      {/* RECOMMEND HOME CONTENT */}
      {activeTab === 'recommend' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'rgba(12,12,15,.5)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
              <input 
                id="recommend-search-input" 
                value={searchRecommendQuery} 
                onChange={e => setSearchRecommendQuery(e.target.value)} 
                placeholder="Tìm quán hoạt động để ghim đề xuất tối nay…" 
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px', maxHeight: '210px', overflowY: 'auto' }}>
              {isSearchingRecommend ? (
                <div style={{ padding: '10px', color: '#8c8679', fontSize: '12px' }}>Đang tìm...</div>
              ) : searchRecommendItems.map(store => (
                <div key={store.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 10px' }}>
                  <div style={{ width: '44px', height: '34px', flex: 'none', borderRadius: '8px', background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                    {store.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={resolveClientUrl(store.image as string) || undefined} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{store.name}</div>
                    <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>{(typeof store.area === 'object' && store.area ? (store.area as { name: string }).name : store.area) || store.city} · {store.category}</div>
                  </div>
                  {recommendItems.find(r => r.targetId === store.id) ? (
                    <span style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#8c8679', padding: '7px 14px' }}>Đã ghim</span>
                  ) : (
                    <span 
                      onClick={() => handleAddRecommend(store)} 
                      style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}
                    >
                      + Ghim đề xuất
                    </span>
                  )}
                </div>
              ))}
              {searchRecommendQuery.trim() !== '' && searchRecommendItems.length === 0 && !isSearchingRecommend && (
                <div style={{ padding: '10px', color: '#8c8679', fontSize: '12px' }}>Không tìm thấy quán nào phù hợp</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '9px', padding: '12px 15px', background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.2)', borderRadius: '12px', marginBottom: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '1px' }}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9z"/></svg>
            <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}>
              Khối <b style={{ color: '#f0dda8' }}>&quot;Đề xuất tối nay&quot;</b> trên trang chủ — Ghim tối đa 8 quán đang hoạt động nổi bật lên đầu trang chủ để tăng lượng truy cập và tương tác ban đêm.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
            <div style={{ flex: 1 }}></div>
            <span style={{ fontSize: '13px', color: colors.muted }}>
              Đã ghim: <b style={{ color: colors.text }}>{recommendItems.length}</b> / 8 quán
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '14px' }}>
            {recommendItems.map((item, idx) => {
              return (
                <div key={item.id} style={{ display: 'flex', gap: '13px', background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '15px', padding: '12px' }}>
                  <div style={{ width: '92px', height: '76px', flex: 'none', borderRadius: '11px', background: 'rgba(255,255,255,.05)', position: 'relative', overflow: 'hidden' }}>
                    {item.targetImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={resolveClientUrl(item.targetImage as string) || undefined} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                    <span style={{ position: 'absolute', top: '7px', left: '7px', fontSize: '8.5px', fontWeight: 800, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '2.5px 7px', borderRadius: '6px', zIndex: 1 }}>#{idx + 1}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f3f0ea', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.targetName}</div>
                    <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.targetArea || item.targetCity} · {item.targetCategory}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                    <span 
                      onClick={() => handleMoveRecommend(idx, 'up')} 
                      style={{ width: '26px', height: '22px', borderRadius: '6px', background: idx === 0 ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === 0 ? 'rgba(255,255,255,.1)' : '#c5c0b6', cursor: idx === 0 ? 'default' : 'pointer' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
                    </span>
                    <span 
                      onClick={() => handleMoveRecommend(idx, 'down')} 
                      style={{ width: '26px', height: '22px', borderRadius: '6px', background: idx === recommendItems.length - 1 ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: idx === recommendItems.length - 1 ? 'rgba(255,255,255,.1)' : '#c5c0b6', cursor: idx === recommendItems.length - 1 ? 'default' : 'pointer' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                    </span>
                    <span 
                      onClick={() => handleRemoveRecommend(item.id)} 
                      style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
                    </span>
                  </div>
                </div>
              );
            })}
            {recommendItems.length === 0 && !isLoadingRecommend && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Chưa có quán nào trong danh sách đề xuất</div>
            )}
            {isLoadingRecommend && (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#8c8679', fontSize: '13px' }}>Đang tải...</div>
            )}
          </div>
        </div>
      )}

      {/* VIDEO HOT CONTENT */}
      {activeTab === 'video' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px' }}>
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

          <div style={{ display: 'flex', gap: '12px', padding: '16px', background: 'rgba(212,178,106,.05)', border: `1px solid rgba(212,178,106,.2)`, borderRadius: '16px', alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(212,178,106,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.gold, flex: 'none' }}>
              ℹ️
            </div>
            <span style={{ fontSize: '13px', color: '#cbb884', lineHeight: 1.5 }}>Khối <b style={{ color: '#f0dda8' }}>&quot;Video Hot&quot;</b> trên trang chủ — chọn từ <b style={{ color: '#f0dda8' }}>thư viện video của các quán</b> (mục Quán → Video quán), sắp thứ tự theo khu vực.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginTop: '8px' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '12px', padding: '4px', gap: '4px' }}>
              {['Tất cả', 'Hà Nội', 'TP. Hồ Chí Minh'].map(region => (
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
        </div>
      )}
      {/* NEW BANNER MODAL */}
      {isAdding === 'banner' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '600px', maxWidth: '94vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', flex: 'none' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase' }}>BANNER · TRANG CHỦ & LANDING</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f3f0ea', marginTop: '4px' }}>{editBannerId ? 'Sửa banner' : 'Thêm banner'}</div>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
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

                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '10px' }}>THỨ TỰ HIỂN THỊ</div>
                  <input 
                    type="number" 
                    value={bannerOrder} 
                    onChange={e => setBannerOrder(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="VD: 1, 2, 3..."
                    style={{ background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', color: '#f3f0ea', fontSize: '13px', padding: '10px 14px', borderRadius: '11px', width: '100%', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase' }}>LIÊN KẾT TỚI QUÁN</div>
                  <span style={{ fontSize: '10px', color: '#57534b' }}>· chỉ gán 1 quán</span>
                </div>
                {bannerLinkedStore ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(212,178,106,.08)', border: '1px solid rgba(212,178,106,.3)', borderRadius: '11px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f3f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bannerLinkedStore.name}</div>
                      <div style={{ fontSize: '11px', color: '#8c8679', marginTop: 1 }}>{bannerLinkedStore.category} · {typeof bannerLinkedStore.area === 'object' ? bannerLinkedStore.area?.name : bannerLinkedStore.area}</div>
                    </div>
                    <span onClick={() => { setBannerLinkedStore(null); setBannerLink(''); }} style={{ fontSize: '11px', fontWeight: 600, color: '#e88b99', cursor: 'pointer', padding: '4px 10px', borderRadius: '8px', background: 'rgba(224,105,122,.08)', border: '1px solid rgba(224,105,122,.25)' }}>Bỏ chọn</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px', marginBottom: '8px' }}>
                      <Search size={14} style={{ color: '#8c8679', flex: 'none' }} />
                      <input value={bannerStoreSearch} onChange={e => searchBannerStores(e.target.value)} placeholder="Tìm quán theo tên, loại hình, khu vực..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#f3f0ea', fontSize: '13px', outline: 'none' }} />
                    </div>
                    {bannerStoreResults.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                        {bannerStoreResults.map((s: any) => (
                          <div key={s.id} onClick={() => { setBannerLinkedStore(s); setBannerLink(`/stores/${s.slug}`); setBannerStoreSearch(''); setBannerStoreResults([]); }} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{s.name}</div>
                              <div style={{ fontSize: '11px', color: '#8c8679' }}>{s.category} · {typeof s.area === 'object' ? s.area?.name : s.area}</div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#cbb884' }}>Chọn</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '10px' }}>ĐỘ DÀI BANNER</div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {[{ label: 'Cao · 16:9', value: '16/9' }, { label: 'Chuẩn · 21:9', value: '21/9' }, { label: 'Mỏng · 4:1', value: '4/1' }].map(opt => (
                    <span key={opt.value} onClick={() => setBannerAspect(opt.value)} style={{ padding: '7px 14px', fontSize: '12.5px', borderRadius: '9px', cursor: 'pointer', border: bannerAspect === opt.value ? '1px solid rgba(212,178,106,.5)' : '1px solid rgba(255,255,255,.1)', background: bannerAspect === opt.value ? 'rgba(212,178,106,.15)' : 'rgba(255,255,255,.03)', color: bannerAspect === opt.value ? '#f0dda8' : '#9b958a', fontWeight: bannerAspect === opt.value ? 700 : 500 }}>{opt.label}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', padding: '9px 12px', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: '10px', fontSize: '11px', color: '#8c8679', lineHeight: 1.5, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '14px', lineHeight: 1, flex: 'none', marginTop: '1px' }}>ⓘ</span>
                  <span>Ảnh cần đúng tỷ lệ {bannerAspect === '16/9' ? '16:9' : bannerAspect === '21/9' ? '21:9' : '4:1'} — khuyến nghị {bannerAspect === '16/9' ? '1920×1080px' : bannerAspect === '21/9' ? '1920×820px' : '1920×480px'}, ≤ 2MB. Ảnh sai tỷ lệ sẽ bị cắt giữa (center-crop); chữ và logo quan trọng nên đặt trong vùng 80% giữa ảnh.</span>
                </div>
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
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,.07)', flex: 'none', background: 'rgba(12,12,15,.35)' }}>
              <div>
                {editBannerId && (
                  <span onClick={() => !isDeletingBanner && handleDeleteBanner(editBannerId)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, color: '#e88b99', background: 'rgba(224,105,122,.06)', border: '1px solid rgba(224,105,122,.25)', cursor: isDeletingBanner ? 'not-allowed' : 'pointer', opacity: isDeletingBanner ? 0.6 : 1 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    {isDeletingBanner ? 'Đang xóa...' : 'Xóa banner'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span onClick={closeDrawer} style={{ fontSize: '13px', fontWeight: 600, color: '#9b958a', padding: '10px 16px', cursor: 'pointer' }}>Hủy</span>
                <span onClick={!isSubmitting ? handleSaveBanner : undefined} style={{ fontSize: '13px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '10px 20px', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1 }}>{isSubmitting ? 'Đang lưu...' : (editBannerId ? 'Cập nhật' : 'Thêm banner')}</span>
              </div>
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

      {/* NEW CAMPAIGN MODAL (MOCKUP) */}
      {isAdding === 'campaign' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(6,6,9,.72)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '620px', maxWidth: '94vw', maxHeight: '92vh', display: 'flex', flexDirection: 'column', background: '#141319', border: '1px solid rgba(255,255,255,.1)', borderRadius: '18px', boxShadow: '0 40px 90px -30px rgba(0,0,0,.9)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)', flex: 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.4px', color: '#8c8679', textTransform: 'uppercase' }}>Campaign &amp; Discount</div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#f3f0ea', marginTop: '3px' }}>{editCampaignId ? 'Sửa campaign' : 'Thêm campaign'}</div>
              </div>
              <span onClick={closeDrawer} style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9b958a', cursor: 'pointer' }}>
                <X size={16} />
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Tên chương trình</div>
                <input value={campaignName} onChange={e => setCampaignName(e.target.value)} placeholder="VD: Happy Hour cuối tuần" style={{ width: '100%', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '15px', fontWeight: 600, fontFamily: 'inherit', outline: 'none' }} />
              </div>
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Mức giảm</div>
                <div style={{ display: 'flex', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '4px', marginBottom: '12px' }}>
                  <button 
                    onClick={() => { setCampaignDiscountType('percent'); setCampaignDiscountValue('10%'); }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: '8px', border: 'none', 
                      background: campaignDiscountType === 'percent' ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent',
                      color: campaignDiscountType === 'percent' ? '#241a0a' : '#c5c0b6',
                      fontWeight: campaignDiscountType === 'percent' ? 700 : 500,
                      fontSize: '14px', cursor: 'pointer'
                    }}
                  >
                    Giảm %
                  </button>
                  <button 
                    onClick={() => { setCampaignDiscountType('amount'); setCampaignDiscountValue('100K'); }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: '8px', border: 'none', 
                      background: campaignDiscountType === 'amount' ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'transparent',
                      color: campaignDiscountType === 'amount' ? '#241a0a' : '#c5c0b6',
                      fontWeight: campaignDiscountType === 'amount' ? 700 : 500,
                      fontSize: '14px', cursor: 'pointer'
                    }}
                  >
                    Giảm tiền (đ)
                  </button>
                </div>
                
                {campaignDiscountType === 'percent' ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['5%', '10%', '15%', '20%', '30%', '50%'].map(val => (
                      <span 
                        key={val}
                        onClick={() => setCampaignDiscountValue(val)}
                        style={{
                          flex: '1 1 0', textAlign: 'center', padding: '10px 0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
                          background: campaignDiscountValue === val ? 'rgba(212,178,106,.08)' : 'rgba(12,12,15,.55)',
                          border: campaignDiscountValue === val ? '1px solid rgba(212,178,106,.4)' : '1px solid rgba(255,255,255,.1)',
                          color: campaignDiscountValue === val ? '#e3c27e' : '#9b958a',
                          fontWeight: campaignDiscountValue === val ? 700 : 500
                        }}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['50K', '100K', '200K', '300K', '500K'].map(val => (
                      <span 
                        key={val}
                        onClick={() => setCampaignDiscountValue(val)}
                        style={{
                          flex: '1 1 0', textAlign: 'center', padding: '10px 0', borderRadius: '10px', fontSize: '14px', cursor: 'pointer',
                          background: campaignDiscountValue === val ? 'rgba(212,178,106,.08)' : 'rgba(12,12,15,.55)',
                          border: campaignDiscountValue === val ? '1px solid rgba(212,178,106,.4)' : '1px solid rgba(255,255,255,.1)',
                          color: campaignDiscountValue === val ? '#e3c27e' : '#9b958a',
                          fontWeight: campaignDiscountValue === val ? 700 : 500
                        }}
                      >
                        {val}
                      </span>
                    ))}
                  </div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <input
                    value={campaignDiscountValue.replace(/\D/g, '')}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCampaignDiscountValue(val ? val + (campaignDiscountType === 'percent' ? '%' : 'K') : '');
                    }}
                    placeholder={campaignDiscountType === 'percent' ? "Hoặc nhập % giảm..." : "Hoặc nhập số tiền giảm..."}
                    style={{ flex: 1, background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '12px 15px', color: '#f3f0ea', fontSize: '15px', fontWeight: 600, outline: 'none' }}
                  />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#c5c0b6', width: '40px', textAlign: 'center' }}>
                    {campaignDiscountType === 'percent' ? '%' : 'K'}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Trạng thái</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span onClick={() => setCampaignStatus('Hoạt động')} style={{ background: campaignStatus === 'Hoạt động' ? '#f0dda8' : 'rgba(255,255,255,.04)', color: campaignStatus === 'Hoạt động' ? '#241a0a' : '#c5c0b6', border: campaignStatus === 'Hoạt động' ? '1px solid transparent' : '1px solid rgba(255,255,255,.1)', padding: '8px 16px', borderRadius: '11px', fontSize: '12.5px', fontWeight: campaignStatus === 'Hoạt động' ? 700 : 600, cursor: 'pointer' }}>Hoạt động</span>
                  <span onClick={() => setCampaignStatus('Tạm dừng')} style={{ background: campaignStatus === 'Tạm dừng' ? '#f0dda8' : 'rgba(255,255,255,.04)', color: campaignStatus === 'Tạm dừng' ? '#241a0a' : '#c5c0b6', border: campaignStatus === 'Tạm dừng' ? '1px solid transparent' : '1px solid rgba(255,255,255,.1)', padding: '8px 16px', borderRadius: '11px', fontSize: '12.5px', fontWeight: campaignStatus === 'Tạm dừng' ? 700 : 600, cursor: 'pointer' }}>Tạm dừng</span>
                  <span onClick={() => setCampaignStatus('Bản nháp')} style={{ background: campaignStatus === 'Bản nháp' ? '#f0dda8' : 'rgba(255,255,255,.04)', color: campaignStatus === 'Bản nháp' ? '#241a0a' : '#c5c0b6', border: campaignStatus === 'Bản nháp' ? '1px solid transparent' : '1px solid rgba(255,255,255,.1)', padding: '8px 16px', borderRadius: '11px', fontSize: '12.5px', fontWeight: campaignStatus === 'Bản nháp' ? 700 : 600, cursor: 'pointer' }}>Bản nháp</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.9px', color: '#8c8679', textTransform: 'uppercase', marginBottom: '8px' }}>Thời gian chạy</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <ConfigProvider
                    theme={{
                      token: {
                        colorPrimary: '#d4b26a',
                        colorBgContainer: 'rgba(12,12,15,.55)',
                        colorBgElevated: '#18181f',
                        colorBorder: 'rgba(255,255,255,.1)',
                        colorText: '#f3f0ea',
                        colorTextPlaceholder: '#57534b',
                        colorTextDisabled: '#8c8679',
                        colorTextHeading: '#f3f0ea',
                        colorIcon: '#f3f0ea',
                        colorIconHover: '#d4b26a',
                        borderRadius: 11,
                        controlHeight: 44,
                      },
                      components: {
                        DatePicker: {
                          activeBorderColor: '#d4b26a',
                          hoverBorderColor: 'rgba(212,178,106,.55)',
                          cellActiveWithRangeBg: 'rgba(212,178,106,.15)',
                          cellHoverWithRangeBg: 'rgba(212,178,106,.15)',
                        }
                      }
                    }}
                    locale={viVN}
                  >
                    <DatePicker.RangePicker 
                      format="DD/MM"
                      placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                      value={campaignDates}
                      onChange={setCampaignDates}
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                      style={{ flex: 1, background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '0 15px' }}
                    />
                  </ConfigProvider>
                  <span style={{ fontSize: '11px', color: '#57534b' }}>Để trống cả hai = Luôn áp dụng</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#8c8679', textTransform: 'uppercase' }}>Quán áp dụng</div>
                </div>
                {campaignLinkedStore ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(212,178,106,.08)', border: '1px solid rgba(212,178,106,.3)', borderRadius: '11px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f3f0ea', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{campaignLinkedStore.name}</div>
                      <div style={{ fontSize: '11px', color: '#8c8679', marginTop: 1 }}>{campaignLinkedStore.category} · {typeof campaignLinkedStore.area === 'object' ? campaignLinkedStore.area?.name : campaignLinkedStore.area}</div>
                    </div>
                    <span onClick={() => setCampaignLinkedStore(null)} style={{ fontSize: '11px', fontWeight: 600, color: '#e88b99', cursor: 'pointer', padding: '4px 10px', borderRadius: '8px', background: 'rgba(224,105,122,.08)', border: '1px solid rgba(224,105,122,.25)' }}>Bỏ chọn</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(12,12,15,.55)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px', marginBottom: '8px' }}>
                      <Search size={14} style={{ color: '#8c8679', flex: 'none' }} />
                      <input value={campaignStoreSearch} onChange={e => searchCampaignStores(e.target.value)} placeholder="Tìm quán theo tên, loại hình, khu vực..." style={{ flex: 1, background: 'transparent', border: 'none', color: '#f3f0ea', fontSize: '13px', outline: 'none' }} />
                    </div>
                    {campaignStoreResults.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                        {campaignStoreResults.map((s: any) => (
                          <div key={s.id} onClick={() => { setCampaignLinkedStore(s); setCampaignStoreSearch(''); setCampaignStoreResults([]); }} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.05)' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{s.name}</div>
                              <div style={{ fontSize: '11px', color: '#8c8679' }}>{s.category} · {typeof s.area === 'object' ? s.area?.name : s.area}</div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#cbb884' }}>Chọn</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,.07)', flex: 'none', background: 'rgba(12,12,15,.35)' }}>
              {editCampaignId && (
                <span onClick={() => handleDeleteCampaign(editCampaignId)} style={{ fontSize: '12.5px', fontWeight: 600, color: '#e88b99', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(224,105,122,.25)', background: 'rgba(224,105,122,.08)' }}>{isDeletingCampaign ? 'Đang xóa...' : 'Xóa campaign'}</span>
              )}
              <span style={{ flex: 1 }}></span>
              <span onClick={closeDrawer} style={{ fontSize: '12.5px', fontWeight: 600, color: '#9b958a', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>Hủy</span>
              <button disabled={isSubmitting} onClick={handleSaveCampaign} style={{ fontSize: '12.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '10px 20px', borderRadius: '10px', cursor: isSubmitting ? 'not-allowed' : 'pointer', border: 'none', outline: 'none', opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Đang lưu...' : (editCampaignId ? 'Cập nhật' : 'Tạo campaign')}
              </button>
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
