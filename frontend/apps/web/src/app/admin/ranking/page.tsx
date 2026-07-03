"use client";

import React, { useState, useEffect } from 'react';
import { Search, ChevronUp, ChevronDown, Bell, Info, GripVertical, Plus } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
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

interface RankingItem {
  id: string; // The RankingConfig id (if exists) or a unique string for new items
  targetId: string;
  targetType: 'CAST' | 'STORE';
  name: string;
  desc: string;
  avatar: string;
  sponsored: boolean;
}

function SortableRankingItem(props: { item: RankingItem; index: number; isStore: boolean; toggleSponsor: (id: string) => void; moveItem: (index: number, direction: 'up' | 'down') => void }) {
  const { item, index, isStore, toggleSponsor, moveItem } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const getAvatarStyle = (name: string, storeMode: boolean = false) => {
    const hue = (name.length * 45) % 360;
    return {
      background: `hsl(${hue}, 40%, 80%)`,
      color: `hsl(${hue}, 60%, 20%)`,
      borderRadius: '50%',
    };
  };

  const avatarStyle = getAvatarStyle(item.name || 'X', isStore);

  return (
    <div ref={setNodeRef} style={{
      ...style,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'transparent', border: `1px solid ${colors.borderSoft}`,
      borderRadius: '12px', padding: '12px 20px',
      marginBottom: '8px',
      boxShadow: isDragging ? '0 8px 24px rgba(0,0,0,0.5)' : 'none',
      position: 'relative'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', paddingRight: '8px' }}>
          <GripVertical size={16} color={colors.muted} />
        </div>
        
        {/* Rank number */}
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: index < 3 ? colors.goldGrad : colors.surface1,
          color: index < 3 ? colors.onGold : colors.text2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: 700
        }}>
          {index + 1}
        </div>

        {/* Avatar */}
        <div style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, ...avatarStyle }}>
          {item.avatar || item.name.substring(0, 2).toUpperCase()}
        </div>

        {/* Info */}
        <div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {item.name}
          </div>
          <div style={{ fontSize: '12px', color: colors.muted, marginTop: '2px' }}>{item.desc}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          onClick={() => toggleSponsor(item.id)}
          style={{ 
            background: 'transparent', 
            border: `1px solid ${item.sponsored ? colors.gold : colors.borderSoft}`, 
            color: item.sponsored ? colors.gold : colors.text2, 
            padding: '6px 16px', 
            borderRadius: '6px', 
            fontSize: '12px', 
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Tài trợ
        </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button onClick={() => moveItem(index, 'up')} style={{ background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '4px', padding: '2px 6px', color: colors.text2, cursor: 'pointer' }}><ChevronUp size={12} /></button>
          <button onClick={() => moveItem(index, 'down')} style={{ background: 'transparent', border: `1px solid ${colors.borderSoft}`, borderRadius: '4px', padding: '2px 6px', color: colors.text2, cursor: 'pointer' }}><ChevronDown size={12} /></button>
        </div>
      </div>
    </div>
  );
}

export default function AdminRankingsPage() {
  const [activeTab, setActiveTab] = useState('HN');
  const [casts, setCasts] = useState<RankingItem[]>([]);
  const [stores, setStores] = useState<RankingItem[]>([]);
  
  // States for Adding new items
  const [showAddCast, setShowAddCast] = useState(false);
  const [castOptions, setCastOptions] = useState<any[]>([]);
  const [showAddStore, setShowAddStore] = useState(false);
  const [storeOptions, setStoreOptions] = useState<any[]>([]);

  const fetchOptions = async (type: 'CAST' | 'STORE') => {
    try {
      const cityCode = activeTab === 'TongHop' ? 'all' : activeTab;
      const res = await apiClient<any>('/admin/rankings/options', {
        params: { targetType: type, city: cityCode, limit: 100 }
      });
      if (type === 'CAST') setCastOptions(res.data || res);
      else setStoreOptions(res.data || res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCast = (option: any) => {
    if (casts.find(c => c.targetId === option.id)) {
      setShowAddCast(false);
      return;
    }
    setCasts([...casts, {
      id: `new-cast-${option.id}`,
      targetId: option.id,
      targetType: 'CAST',
      name: option.name,
      desc: 'Cast',
      avatar: 'C',
      sponsored: false
    }]);
    setShowAddCast(false);
  };

  const handleAddStore = (option: any) => {
    if (stores.find(s => s.targetId === option.id)) {
      setShowAddStore(false);
      return;
    }
    setStores([...stores, {
      id: `new-store-${option.id}`,
      targetId: option.id,
      targetType: 'STORE',
      name: option.name,
      desc: option.category || 'Store',
      avatar: 'S',
      sponsored: false
    }]);
    setShowAddStore(false);
  };
  const [auditNote, setAuditNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      // The cityCode in DB is usually 'HN', 'HCM', 'all'
      const cityCode = activeTab === 'TongHop' ? 'all' : activeTab;
      
      const res = await apiClient<any>('/admin/rankings', {
        params: { city: cityCode }
      });
      
      // Parse the response records
      const castItems: RankingItem[] = [];
      const storeItems: RankingItem[] = [];
      
      res.data.forEach((r: any) => {
        const type = r.targetType; // 'CAST' | 'STORE'
        const isCast = type === 'CAST';
        const obj = {
          id: r.id, // RankingConfig id
          targetId: r.targetId,
          targetType: type,
          name: isCast ? (r.cast?.name || 'Unknown Cast') : (r.store?.name || 'Unknown Store'),
          desc: isCast ? 'Cast' : 'Store',
          avatar: isCast ? 'C' : 'S',
          sponsored: r.sponsored || false,
        };
        if (isCast) castItems.push(obj);
        else storeItems.push(obj);
      });
      
      // We assume backend returns them ordered by pinRank. If not, we could sort here.
      setCasts(castItems);
      setStores(storeItems);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [activeTab]);

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
    if (active.id !== over.id) {
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

    const handleSave = async () => {
    if (!auditNote.trim()) {
      alert("Vui lòng nhập Audit Note (lý do cập nhật) trước khi lưu!");
      return;
    }

    setIsSaving(true);
    try {
      const cityCode = activeTab === 'TongHop' ? 'all' : activeTab.toLowerCase();
      
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
              pinRank: i + 1,
              sponsored: cast.sponsored,
              reason: auditNote
            }
          });
        } else {
          await apiClient(`/admin/rankings/${cast.id}`, {
            method: 'PATCH',
            data: {
              pinRank: i + 1,
              sponsored: cast.sponsored,
              reason: auditNote
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
              pinRank: i + 1,
              sponsored: store.sponsored,
              reason: auditNote
            }
          });
        } else {
          await apiClient(`/admin/rankings/${store.id}`, {
            method: 'PATCH',
            data: {
              pinRank: i + 1,
              sponsored: store.sponsored,
              reason: auditNote
            }
          });
        }
      }

      alert('Lưu ranking thành công!');
      fetchRankings();
      setAuditNote('');
    } catch (error: any) {
      console.error(error);
      alert('Lỗi khi lưu ranking');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px 40px', position: 'relative', minHeight: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER & TABS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div style={{ display: 'flex', background: 'transparent', borderRadius: '8px', padding: '4px', border: `1px solid ${colors.borderSoft}` }}>
          {['HN', 'HCM', 'TongHop'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: activeTab === tab ? colors.goldGrad : 'transparent',
                color: activeTab === tab ? colors.onGold : colors.muted,
                border: 'none', padding: '8px 24px', borderRadius: '6px',
                fontSize: '13px', fontWeight: activeTab === tab ? 700 : 500,
                cursor: 'pointer'
              }}
            >
              {tab === 'HN' ? 'Hà Nội' : tab === 'HCM' ? 'TP. Hồ Chí Minh' : 'Tổng hợp'}
            </button>
          ))}
        </div>
        <div style={{ color: colors.muted, fontSize: '13px' }}>Kéo - dùng mũi tên để đổi thứ hạng</div>
      </div>

      <div style={{ 
        display: 'flex', alignItems: 'center', gap: '8px', 
        border: `1px solid ${colors.borderGold22}`, borderRadius: '8px', 
        padding: '12px 16px', marginBottom: '32px', background: 'rgba(212,178,106,.05)'
      }}>
        <Info size={16} color={colors.gold} />
        <span style={{ fontSize: '13px', color: colors.text2 }}>
          <span style={{ color: colors.gold }}>Ranking 100% thủ công</span> — Admin tự cấu hình. Quán/cast <strong style={{ color: '#fff' }}>trả tài trợ</strong> có thể lên Top, không phụ thuộc thuật toán. Thứ tự ưu tiên: <strong>Cast trước → Quán</strong>.
        </span>
      </div>

      {isLoading ? (
        <div style={{ color: colors.muted, textAlign: 'center', marginTop: '100px' }}>Đang tải...</div>
      ) : (
        <>
          {/* CAST LIST */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 24, height: 24, borderRadius: '6px', background: colors.surface1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: colors.gold, fontSize: '14px' }}>👤</span>
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: 0 }}>Xếp hạng Cast</h2>
                <span style={{ fontSize: '11px', fontWeight: 600, color: colors.gold, border: `1px solid ${colors.borderGold22}`, padding: '2px 8px', borderRadius: '12px' }}>
                  Ưu tiên 1
                </span>
              </div>
              
              <div style={{ position: 'relative' }}>
                <button onClick={() => { setShowAddCast(!showAddCast); fetchOptions('CAST'); }} style={{ background: 'transparent', border: `1px solid ${colors.gold}`, color: colors.gold, padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> Thêm Cast
                </button>
                {showAddCast && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: colors.surface2, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', width: '250px', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                    {castOptions.length === 0 ? <div style={{ padding: '12px', color: colors.muted, fontSize: '13px' }}>Không có dữ liệu...</div> : castOptions.map(opt => (
                      <div key={opt.id} onClick={() => handleAddCast(opt)} style={{ padding: '10px 12px', color: colors.text, fontSize: '13px', cursor: 'pointer', borderBottom: `1px solid ${colors.borderSoft}` }}>
                        {opt.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCasts}>
              <SortableContext items={casts.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {casts.map((item, index) => (
                    <SortableRankingItem key={item.id} item={item} index={index} isStore={false} toggleSponsor={toggleSponsorCast} moveItem={(idx, dir) => moveItem(casts, setCasts, idx, dir)} />
                  ))}
                  {casts.length === 0 && <div style={{ color: colors.muted, padding: '20px', textAlign: 'center', border: `1px dashed ${colors.borderSoft}`, borderRadius: '12px' }}>Chưa có Cast nào được xếp hạng</div>}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* STORE LIST */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: 24, height: 24, borderRadius: '6px', background: colors.surface1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: colors.gold, fontSize: '14px' }}>🏬</span>
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: colors.text, margin: 0 }}>Xếp hạng Quán</h2>
                <span style={{ fontSize: '11px', fontWeight: 600, color: colors.muted, border: `1px solid ${colors.borderSoft}`, padding: '2px 8px', borderRadius: '12px' }}>
                  Ưu tiên 2
                </span>
              </div>

              <div style={{ position: 'relative' }}>
                <button onClick={() => { setShowAddStore(!showAddStore); fetchOptions('STORE'); }} style={{ background: 'transparent', border: `1px solid ${colors.borderSoft}`, color: colors.text, padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} /> Thêm Quán
                </button>
                {showAddStore && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: colors.surface2, border: `1px solid ${colors.borderSoft}`, borderRadius: '8px', width: '250px', zIndex: 100, maxHeight: '200px', overflowY: 'auto' }}>
                    {storeOptions.length === 0 ? <div style={{ padding: '12px', color: colors.muted, fontSize: '13px' }}>Không có dữ liệu...</div> : storeOptions.map(opt => (
                      <div key={opt.id} onClick={() => handleAddStore(opt)} style={{ padding: '10px 12px', color: colors.text, fontSize: '13px', cursor: 'pointer', borderBottom: `1px solid ${colors.borderSoft}` }}>
                        {opt.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndStores}>
              <SortableContext items={stores.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {stores.map((item, index) => (
                    <SortableRankingItem key={item.id} item={item} index={index} isStore={true} toggleSponsor={toggleSponsorStore} moveItem={(idx, dir) => moveItem(stores, setStores, idx, dir)} />
                  ))}
                  {stores.length === 0 && <div style={{ color: colors.muted, padding: '20px', textAlign: 'center', border: `1px dashed ${colors.borderSoft}`, borderRadius: '12px' }}>Chưa có Quán nào được xếp hạng</div>}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* SAVE AREA */}
          <div style={{ 
            background: colors.surface1, 
            border: `1px solid ${colors.borderGold22}`, 
            borderRadius: '16px', 
            padding: '24px',
            position: 'sticky',
            bottom: '32px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '13px', color: colors.text2, marginBottom: '8px' }}>
                Ghi chú nội bộ (Audit Note) - Bắt buộc
              </label>
              <input 
                type="text"
                value={auditNote}
                onChange={(e) => setAuditNote(e.target.value)}
                placeholder="VD: Cập nhật do quán ABC tài trợ tháng 7..."
                style={{
                  width: '100%', height: '40px', background: colors.surface2, border: `1px solid ${colors.borderSoft}`,
                  borderRadius: '8px', color: colors.text, padding: '0 16px', fontSize: '14px', outline: 'none'
                }}
              />
            </div>
            
            <button 
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: colors.goldGrad,
                color: colors.onGold,
                border: 'none',
                height: '40px',
                padding: '0 32px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                alignSelf: 'flex-end'
              }}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </>
      )}

    </div>
  );
}
