"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useSystemFeedback } from '@/components/ui/SystemFeedback';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RankingItem {
  id: string;
  targetId: string;
  targetType: 'CAST' | 'STORE';
  name: string;
  desc: string;
  avatar: string;
  image?: string | null;
  sponsored: boolean;
}

type RankingCityTab = 'HN' | 'HCM' | 'ALL';
type RankingToast = {
  type: 'success' | 'error' | 'warning';
  message: string;
};
type AdminRankingCategory =
  | 'BAR'
  | 'CLUB'
  | 'LOUNGE'
  | 'GIRLS_BAR'
  | 'KARAOKE'
  | 'MASSAGE_SPA'
  | 'RESTAURANT'
  | 'CASINO';

const RANKING_CATEGORIES = new Set<AdminRankingCategory>([
  'BAR',
  'CLUB',
  'LOUNGE',
  'GIRLS_BAR',
  'KARAOKE',
  'MASSAGE_SPA',
  'RESTAURANT',
  'CASINO',
]);

const cityParamToTab = (value?: string | null): RankingCityTab => {
  const token = (value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
  if (['hn', 'hanoi', 'ha-noi'].includes(token)) return 'HN';
  if (['hcm', 'tphcm', 'tp-hcm', 'ho-chi-minh', 'ho-chi-minh-city', 'saigon', 'sai-gon'].includes(token)) return 'HCM';
  return 'ALL';
};

const tabToCityCode = (tab: RankingCityTab) => {
  if (tab === 'HN') return 'hn';
  if (tab === 'HCM') return 'hcm';
  return 'all';
};

const tabToTopbarCityParam = (tab: RankingCityTab) => {
  if (tab === 'HN') return 'Hanoi';
  if (tab === 'HCM') return 'Ho Chi Minh City';
  return '';
};

const normalizeRankingCategory = (value?: string | null): AdminRankingCategory | undefined => {
  const normalized = (value || '').trim().toUpperCase();
  if (!normalized || normalized === 'ALL') return undefined;
  return RANKING_CATEGORIES.has(normalized as AdminRankingCategory)
    ? (normalized as AdminRankingCategory)
    : undefined;
};

function SortableRankingItem(props: {
  item: RankingItem;
  index: number;
  isStore: boolean;
  toggleSponsor: (id: string) => void;
  moveItem: (index: number, direction: 'up' | 'down') => void;
  removeItem: (id: string) => void;
}) {
  const { item, index, isStore, toggleSponsor, moveItem, removeItem } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const feedback = useSystemFeedback();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const getAvatarStyle = (name: string, storeMode: boolean = false) => {
    const hue = (name.length * 45) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 60%, 70%), hsl(${hue}, 40%, 40%))`;
  };

  const rank = index + 1;
  const numStyle = rank === 1
    ? { color: '#241a0a', background: 'linear-gradient(135deg,#f4e3b4,#d4b26a)' }
    : rank <= 3
      ? { color: '#d4b26a', background: 'rgba(212,178,106,.12)', border: '1px solid rgba(212,178,106,.3)' }
      : { color: '#9b958a', background: 'rgba(255,255,255,.05)' };

  const rowBg = index === 0 ? 'linear-gradient(135deg,rgba(212,178,106,.13),rgba(255,255,255,.02))' : 'rgba(255,255,255,.025)';
  const rowBd = index === 0 ? 'rgba(212,178,106,.34)' : 'rgba(255,255,255,.06)';
  const sponsorColor = item.sponsored ? '#241a0a' : '#8c8679';
  const sponsorBg = item.sponsored ? 'linear-gradient(135deg,#f0dda8,#d4b26a)' : 'rgba(255,255,255,.04)';
  const sponsorBorder = item.sponsored ? '1px solid rgba(212,178,106,.7)' : '1px solid rgba(255,255,255,.08)';

  const onRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    feedback.showModal({
      title: 'Xóa khỏi xếp hạng',
      description: 'Bạn có chắc chắn muốn gỡ '+item.name+' khỏi bảng xếp hạng không?',
      destructive: true,
      onPrimary: () => {
        removeItem(item.id);
      }
    });
  };

  const onToggleSponsor = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSponsor(item.id);
  };

  return (
    <div ref={setNodeRef} style={{
      ...style,
      display: 'flex', alignItems: 'center', gap: '14px',
      background: rowBg,
      border: `1px solid ${rowBd}`,
      borderRadius: '14px', padding: '11px 14px', marginBottom: '9px',
      boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
      position: 'relative'
    }}>
      <div {...attributes} {...listeners} style={{ display: 'flex', alignItems: 'center', cursor: 'grab' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#57534b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="18" r="1"/></svg>
      </div>

      <span style={{ 
        width: '32px', height: '32px', flex: 'none', borderRadius: '9px', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        fontWeight: 800, fontSize: '15px', 
        ...(numStyle as any)
      }}>
        {rank}
      </span>

      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          style={{
            width: '40px',
            height: '40px',
            flex: 'none',
            borderRadius: isStore ? '10px' : '50%',
            objectFit: 'cover',
            border: '1.5px solid rgba(212,178,106,.3)',
            background: getAvatarStyle(item.name, isStore),
          }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement | null;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      <span
        style={{
          width: '40px',
          height: '40px',
          flex: 'none',
          borderRadius: isStore ? '10px' : '50%',
          background: getAvatarStyle(item.name, isStore),
          border: '1.5px solid rgba(212,178,106,.3)',
          display: item.image ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#241a0a',
          fontWeight: 700,
          fontSize: '14px',
        }}
      >
        {isStore ? item.name.substring(0, 2).toUpperCase() : ''}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, fontSize: '14.5px', color: '#f3f0ea' }}>{item.name}</span>
          {item.sponsored && (
            <span style={{ flex: 'none', fontSize: '10px', fontWeight: 800, letterSpacing: '.5px', color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '3px 7px', borderRadius: '7px' }}>
              Tài trợ
            </span>
          )}
        </div>
        <div style={{ fontSize: '11.5px', color: '#8c8679', marginTop: '2px' }}>{item.desc}</div>
      </div>

      <button
        type="button"
        onClick={onToggleSponsor}
        title={item.sponsored ? 'Tắt tài trợ' : 'Bật tài trợ'}
        aria-pressed={item.sponsored}
        aria-label={item.sponsored ? `Tắt tài trợ ${item.name}` : `Bật tài trợ ${item.name}`}
        style={{ width: '30px', height: '30px', flex: 'none', borderRadius: '9px', background: sponsorBg, border: sponsorBorder, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sponsorColor, cursor: 'pointer', padding: 0 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill={item.sponsored ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.8 5.8 21 7 14.2 2 9.3 8.9 8.3 12 2" />
        </svg>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <span onClick={() => moveItem(index, 'up')} style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 15l6-6 6 6"/></svg>
        </span>
        <span onClick={() => moveItem(index, 'down')} style={{ width: '26px', height: '22px', borderRadius: '6px', background: 'rgba(255,255,255,.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5c0b6', cursor: 'pointer' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
        </span>
      </div>

      <span onClick={onRemove} title="Gỡ khỏi bảng xếp hạng" style={{ width: '26px', height: '26px', flex: 'none', borderRadius: '8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8679', cursor: 'pointer' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </span>
    </div>
  );
}

function AdminRankingsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = cityParamToTab(searchParams.get('city'));
  const activeCategory = normalizeRankingCategory(searchParams.get('category'));
  const [casts, setCasts] = useState<RankingItem[]>([]);
  const [stores, setStores] = useState<RankingItem[]>([]);
  
  const [showAddCast, setShowAddCast] = useState(false);
  const [castSearch, setCastSearch] = useState('');
  const [castOptions, setCastOptions] = useState<any[]>([]);
  
  const [showAddStore, setShowAddStore] = useState(false);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeOptions, setStoreOptions] = useState<any[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  const [toast, setToast] = useState<RankingToast | null>(null);

  const showToast = useCallback((message: string, type: RankingToast['type'] = 'success') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const updateCityTab = (tab: RankingCityTab) => {
    const params = new URLSearchParams(searchParams.toString());
    const city = tabToTopbarCityParam(tab);
    if (city) params.set('city', city);
    else params.delete('city');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const fetchOptions = useCallback(async (type: 'CAST' | 'STORE') => {
    try {
      const cityCode = tabToCityCode(activeTab);
      const res = await apiClient<any>('/admin/rankings/options', {
        params: { targetType: type, city: cityCode, category: activeCategory, limit: 100 }
      });
      const items = Array.isArray(res) ? res : (res?.data || []);
      if (type === 'CAST') setCastOptions(items);
      else setStoreOptions(items);
    } catch (e) {
      console.error(e);
    }
  }, [activeCategory, activeTab]);

  const filteredCastOptions = castOptions.filter(opt => 
    !casts.find(c => c.targetId === opt.id) &&
    (!castSearch || opt.name.toLowerCase().includes(castSearch.toLowerCase()))
  );

  const filteredStoreOptions = storeOptions.filter(opt => 
    !stores.find(s => s.targetId === opt.id) &&
    (!storeSearch || opt.name.toLowerCase().includes(storeSearch.toLowerCase()))
  );

  const handleAddCast = (option: any) => {
    if (casts.find(c => c.targetId === option.id)) return;
    if (casts.length >= 5) {
      showToast('Chỉ được xếp hạng tối đa 5 Cast.', 'warning');
      return;
    }
    setCasts([...casts, {
      id: `new-${Date.now()}`,
      targetId: option.id,
      targetType: 'CAST',
      name: option.name,
      desc: option.store?.name || 'Cast',
      avatar: 'C',
      image: option.image || null,
      sponsored: false
    }]);
    setCastSearch('');
  };

  const handleAddStore = (option: any) => {
    if (stores.find(s => s.targetId === option.id)) return;
    if (stores.length >= 5) {
      showToast('Chỉ được xếp hạng tối đa 5 Quán.', 'warning');
      return;
    }
    setStores([...stores, {
      id: `new-${Date.now()}`,
      targetId: option.id,
      targetType: 'STORE',
      name: option.name,
      desc: option.category || 'Store',
      avatar: 'S',
      image: option.image || null,
      sponsored: false
    }]);
    setStoreSearch('');
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchRankings = useCallback(async () => {
    setIsLoading(true);
    try {
      const cityCode = tabToCityCode(activeTab);
      
      const res = await apiClient<any>('/admin/rankings', {
        params: { city: cityCode, category: activeCategory }
      });
      
      const castItems: RankingItem[] = [];
      const storeItems: RankingItem[] = [];
      
      const items = Array.isArray(res) ? res : (res?.data || []);
      items.forEach((r: any) => {
        const type = r.targetType;
        const isCast = type === 'CAST';
        const obj = {
          id: r.id,
          targetId: r.targetId,
          targetType: type as any,
          name: r.targetName || (isCast ? 'Unknown Cast' : 'Unknown Store'),
          desc: isCast ? (r.targetArea || r.targetCity || 'Cast') : (r.targetCategory || r.targetArea || 'Store'),
          avatar: isCast ? 'C' : 'S',
          image: r.targetImage || null,
          sponsored: r.sponsored || false,
        };
        if (isCast) castItems.push(obj);
        else storeItems.push(obj);
      });
      
      setCasts(castItems);
      setStores(storeItems);
    } catch (e: any) {
      console.error(e);
      feedback.toast({ type: 'error', message: e.message || 'Không tải được danh sách xếp hạng' });
    } finally {
      setIsLoading(false);
    }
  }, [activeCategory, activeTab]);

  useEffect(() => {
    void Promise.resolve().then(async () => {
      await fetchRankings();
      setDeletedItemIds([]);
    });
  }, [fetchRankings]);

  useEffect(() => {
    if (!showAddCast && !showAddStore) return;
    void Promise.resolve().then(() => {
      if (showAddCast) void fetchOptions('CAST');
      if (showAddStore) void fetchOptions('STORE');
    });
  }, [activeCategory, activeTab, fetchOptions, showAddCast, showAddStore]);

  const handleDragEndCasts = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setCasts((items: RankingItem[]) => {
        const oldIndex = items.findIndex((i: any) => i?.id === active?.id);
        const newIndex = items.findIndex((i: any) => i?.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndStores = (event: any) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setStores((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const moveItem = (list: any[], setList: any, index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const newList = [...list];
    const item = newList.splice(index, 1)[0];
    newList.splice(direction === 'up' ? index - 1 : index + 1, 0, item);
    setList(newList);
  };

  const toggleSponsorCast = (id: string) => {
    setCasts(casts.map(item => item.id === id ? { ...item, sponsored: !item.sponsored } : item));
  };
  
  const toggleSponsorStore = (id: string) => {
    setStores(stores.map(item => item.id === id ? { ...item, sponsored: !item.sponsored } : item));
  };

  const removeCast = (id: string) => {
    if (!id.startsWith('new-')) setDeletedItemIds(prev => [...prev, id]);
    setCasts(casts.filter(item => item.id !== id));
  };

  const removeStore = (id: string) => {
    if (!id.startsWith('new-')) setDeletedItemIds(prev => [...prev, id]);
    setStores(stores.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const cityCode = tabToCityCode(activeTab);
      
      for (const id of deletedItemIds) {
        await apiClient(`/admin/rankings/${id}`, { method: 'DELETE' });
      }

      for (let i = 0; i < casts.length; i++) {
        const cast = casts[i];
        if (!cast) continue;
        if (cast.id.startsWith('new-')) {
          await apiClient('/admin/rankings', {
            method: 'POST',
            data: {
              targetId: cast.targetId,
              targetType: 'CAST',
              cityCode: cityCode,
              category: activeCategory,
              pinRank: i + 1,
              sponsored: cast.sponsored
            }
          });
        } else {
          await apiClient(`/admin/rankings/${cast.id}`, {
            method: 'PATCH',
            data: {
              cityCode: cityCode,
              category: activeCategory,
              pinRank: i + 1,
              sponsored: cast.sponsored
            }
          });
        }
      }
      
      for (let i = 0; i < stores.length; i++) {
        const store = stores[i];
        if (!store) continue;
        if (store.id.startsWith('new-')) {
          await apiClient('/admin/rankings', {
            method: 'POST',
            data: {
              targetId: store.targetId,
              targetType: 'STORE',
              cityCode: cityCode,
              category: activeCategory,
              pinRank: i + 1,
              sponsored: store.sponsored
            }
          });
        } else {
          await apiClient(`/admin/rankings/${store.id}`, {
            method: 'PATCH',
            data: {
              cityCode: cityCode,
              category: activeCategory,
              pinRank: i + 1,
              sponsored: store.sponsored
            }
          });
        }
      }

      showToast('Lưu ranking thành công.', 'success');
      setDeletedItemIds([]);
      fetchRankings();
    } catch (error: any) {
      console.error(error);
      showToast('Lỗi khi lưu ranking. Vui lòng thử lại.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const getTabStyle = (tab: string) => {
    const isActive = activeTab === tab;
    return {
      fontSize: '12.5px', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
      ...(isActive 
        ? { color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', fontWeight: 600 } 
        : { color: '#9b958a', background: 'transparent', fontWeight: 500 })
    };
  };

  return (
    <div style={{ padding: '22px 26px 44px', maxWidth: '1000px', margin: '0 auto' }}>
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            top: '88px',
            right: '28px',
            zIndex: 80,
            minWidth: '280px',
            maxWidth: '360px',
            borderRadius: '14px',
            border:
              toast.type === 'error'
                ? '1px solid rgba(224,105,122,.46)'
                : toast.type === 'warning'
                  ? '1px solid rgba(224,164,78,.5)'
                  : '1px solid rgba(127,211,162,.42)',
            background:
              toast.type === 'error'
                ? 'linear-gradient(135deg,rgba(224,105,122,.16),rgba(19,18,24,.96))'
                : toast.type === 'warning'
                  ? 'linear-gradient(135deg,rgba(224,164,78,.16),rgba(19,18,24,.96))'
                  : 'linear-gradient(135deg,rgba(127,211,162,.14),rgba(19,18,24,.96))',
            boxShadow: '0 24px 60px -28px rgba(0,0,0,.9)',
            padding: '14px 14px 14px 15px',
            color: '#f3f0ea',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '11px',
          }}
        >
          <span
            style={{
              width: '30px',
              height: '30px',
              flex: 'none',
              borderRadius: '10px',
              background:
                toast.type === 'error'
                  ? 'rgba(224,105,122,.18)'
                  : toast.type === 'warning'
                    ? 'rgba(224,164,78,.18)'
                    : 'rgba(127,211,162,.16)',
              color: toast.type === 'error' ? '#e88b99' : toast.type === 'warning' ? '#e3c27e' : '#7fd3a2',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {toast.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>
            )}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: toast.type === 'success' ? '#7fd3a2' : toast.type === 'warning' ? '#e3c27e' : '#e88b99', marginBottom: '2px' }}>
              {toast.type === 'success' ? 'Thành công' : toast.type === 'warning' ? 'Lưu ý' : 'Không lưu được'}
            </div>
            <div style={{ fontSize: '12.5px', lineHeight: 1.45, color: '#c5c0b6' }}>{toast.message}</div>
          </div>
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => setToast(null)}
            style={{ width: '26px', height: '26px', borderRadius: '8px', border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.04)', color: '#8c8679', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
      ) : null}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '14px' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '11px', padding: '3px', gap: '2px' }}>
          <span onClick={() => updateCityTab('HN')} style={getTabStyle('HN')}>Hà Nội</span>
          <span onClick={() => updateCityTab('HCM')} style={getTabStyle('HCM')}>TP. Hồ Chí Minh</span>
          <span onClick={() => updateCityTab('ALL')} style={getTabStyle('ALL')}>Tổng hợp</span>
        </div>
        <div style={{ flex: 1 }}></div>
        <span style={{ fontSize: '11.5px', color: '#8c8679' }}>Kéo · dùng mũi tên để đổi thứ hạng</span>
      </div>
      


      {isLoading ? (
        <div style={{ color: '#8c8679', textAlign: 'center', marginTop: '100px' }}>Đang tải dữ liệu xếp hạng...</div>
      ) : (
        <>
          {/* CAST LIST */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(224,114,158,.14)', border: '1px solid rgba(224,114,158,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e79ab8' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/></svg>
            </span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#f3f0ea' }}>Xếp hạng Cast</span>
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1px', color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '3px 9px', borderRadius: '7px' }}>ƯU TIÊN</span>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,178,106,.4),transparent)' }}></span>
            <span 
              onClick={() => { setShowAddCast(!showAddCast); if (!showAddCast) fetchOptions('CAST'); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap', ...(showAddCast ? { color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)' } : { color: '#e3c27e', background: 'rgba(212,178,106,.1)', border: '1px solid rgba(212,178,106,.35)' }) }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Thêm cast
            </span>
          </div>
          
          {showAddCast && (
            <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'rgba(12,12,15,.5)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                <input value={castSearch} onChange={(e) => setCastSearch(e.target.value)} placeholder="Tìm cast theo nghệ danh..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                {filteredCastOptions.map(opt => (
                  <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 10px' }}>
                    {opt.image ? (
                      <img
                        src={opt.image}
                        alt={opt.name}
                        loading="lazy"
                        style={{
                          width: '34px',
                          height: '34px',
                          flex: 'none',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '1.5px solid rgba(212,178,106,.3)',
                          background: 'linear-gradient(135deg,#f4e3b4,#d4b26a)',
                        }}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <span style={{ 
                      width: '34px', 
                      height: '34px', 
                      flex: 'none', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg,#f4e3b4,#d4b26a)', 
                      border: '1.5px solid rgba(212,178,106,.3)',
                      display: opt.image ? 'none' : 'block' 
                    }}></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{opt.name}</div>
                      <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>{opt.store?.name || 'Cast'}</div>
                    </div>
                    <span onClick={() => handleAddCast(opt)} style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}>+ Thêm vào Top</span>
                  </div>
                ))}
                {filteredCastOptions.length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#8c8679', padding: '14px' }}>Không còn cast phù hợp.</div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', marginBottom: '30px' }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCasts}>
              <SortableContext items={casts.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {casts.map((item, index) => (
                  <SortableRankingItem key={item.id} item={item} index={index} isStore={false} toggleSponsor={toggleSponsorCast} moveItem={(idx, dir) => moveItem(casts, setCasts, idx, dir)} removeItem={removeCast} />
                ))}
                {casts.length === 0 && <div style={{ color: '#8c8679', padding: '20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,.1)', borderRadius: '12px' }}>Chưa có Cast nào được xếp hạng</div>}
              </SortableContext>
            </DndContext>
          </div>

          {/* STORE LIST */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <span style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'rgba(212,178,106,.14)', border: '1px solid rgba(212,178,106,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d4b26a' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M3 9h18"/></svg>
            </span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#f3f0ea' }}>Xếp hạng Quán</span>
            <span style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg,rgba(212,178,106,.4),transparent)' }}></span>
            <span 
              onClick={() => { setShowAddStore(!showAddStore); if (!showAddStore) fetchOptions('STORE'); }} 
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', whiteSpace: 'nowrap', ...(showAddStore ? { color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)' } : { color: '#e3c27e', background: 'rgba(212,178,106,.1)', border: '1px solid rgba(212,178,106,.35)' }) }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>Thêm quán
            </span>
          </div>

          {showAddStore && (
            <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: 'rgba(12,12,15,.5)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '11px', padding: '10px 14px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8c8679" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
                <input value={storeSearch} onChange={(e) => setStoreSearch(e.target.value)} placeholder="Tìm quán theo tên..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#f3f0ea', fontSize: '13px', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                {filteredStoreOptions.map(opt => (
                  <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '11px', padding: '8px 10px' }}>
                    {opt.image ? (
                      <img
                        src={opt.image}
                        alt={opt.name}
                        loading="lazy"
                        style={{
                          width: '34px',
                          height: '34px',
                          flex: 'none',
                          borderRadius: '9px',
                          objectFit: 'cover',
                          border: '1.5px solid rgba(212,178,106,.3)',
                          background: 'linear-gradient(135deg,#f4e3b4,#d4b26a)',
                        }}
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement | null;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span style={{ 
                      width: '34px', 
                      height: '34px', 
                      flex: 'none', 
                      borderRadius: '9px', 
                      background: 'linear-gradient(135deg,#f4e3b4,#d4b26a)', 
                      border: '1.5px solid rgba(212,178,106,.3)',
                      display: opt.image ? 'none' : 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      color: '#241a0a', 
                      fontWeight: 700, 
                      fontSize: '12px' 
                    }}>{opt.name.substring(0,2).toUpperCase()}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{opt.name}</div>
                      <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>{opt.category || 'Store'}</div>
                    </div>
                    <span onClick={() => handleAddStore(opt)} style={{ flex: 'none', fontSize: '11.5px', fontWeight: 700, color: '#241a0a', background: 'linear-gradient(135deg,#f0dda8,#d4b26a)', padding: '7px 14px', borderRadius: '9px', cursor: 'pointer' }}>+ Thêm vào Top</span>
                  </div>
                ))}
                {filteredStoreOptions.length === 0 && (
                  <div style={{ textAlign: 'center', fontSize: '12px', color: '#8c8679', padding: '14px' }}>Không còn quán phù hợp.</div>
                )}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px', marginBottom: '30px' }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndStores}>
              <SortableContext items={stores.map(s => s.id)} strategy={verticalListSortingStrategy}>
                {stores.map((item, index) => (
                  <SortableRankingItem key={item.id} item={item} index={index} isStore={true} toggleSponsor={toggleSponsorStore} moveItem={(idx, dir) => moveItem(stores, setStores, idx, dir)} removeItem={removeStore} />
                ))}
                {stores.length === 0 && <div style={{ color: '#8c8679', padding: '20px', textAlign: 'center', border: '1px dashed rgba(255,255,255,.1)', borderRadius: '12px' }}>Chưa có Quán nào được xếp hạng</div>}
              </SortableContext>
            </DndContext>
          </div>

          {/* SAVE AREA */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              style={{ background: 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)', color: '#241a0a', border: 'none', height: '40px', padding: '0 32px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminRankingsPage() {
  return (
    <React.Suspense fallback={<div style={{ padding: '22px 26px', color: '#8c8679' }}>Đang tải dữ liệu xếp hạng...</div>}>
      <AdminRankingsClient />
    </React.Suspense>
  );
}
