# Handoff Report: Propose 'recommend-home' (Đề xuất tối nay) Tab UI & Integration

This handoff report describes the analysis of the Admin Content Console tabs management, the admin rankings API, and a complete code design proposal to introduce a new **"Đề xuất tối nay"** (recommend-home scope) tab with store searching, pinning (limit of 8), reordering, and deleting features.

---

## 1. Observation
We observed the following files and details:

*   **`frontend/apps/web/src/app/admin/content/page.tsx`**:
    *   **Tab Management**: `activeTab` is defined at line 45:
        ```typescript
        const [activeTab, setActiveTab] = useState<'campaign' | 'banner' | 'featured' | 'video' | 'blog'>('campaign');
        ```
    *   **Tab Render Layout**: Renders buttons for each tab at lines 810–871.
    *   **Add Button Action**: Configured at lines 873–895 to open modals or focus search bars depending on `activeTab`.
    *   **System Feedback Context**: Utilized at line 12 and 44:
        ```typescript
        import { useSystemFeedback } from '@/components/ui/SystemFeedback';
        ...
        const feedback = useSystemFeedback();
        ```
        This API provides the following modal/toast actions (as confirmed in `frontend/apps/web/src/components/ui/SystemFeedback.tsx`):
        *   `feedback.showToast({ title, description, tone })` with tones `"success" | "warning" | "error" | "info" | "gold"`.
        *   `feedback.showModal({ title, description, tone, primaryLabel, secondaryLabel, onPrimary, onSecondary })` (which displays a custom-designed dialog and prevents background scrolling).

*   **`frontend/apps/web/src/lib/api/admin-rankings.ts`**:
    *   Provides API methods for managing ranking items:
        ```typescript
        export const adminRankingsApi = {
          list: (query: AdminRankingQuery = {}) => ...
          options: (query: AdminRankingQuery & { q?: string; limit?: number } = {}) => ...
          create: (payload: AdminRankingFormPayload) => ...
          update: (id: string, payload: AdminRankingFormPayload) => ...
          delete: (id: string) => ...
        };
        ```
    *   **Backend Filtering (Warning!)**: The backend service implementation in `backend/src/nightlife-data/nightlife-data.service.ts` for option search (`listAdminRankingTargetOptions`) contains logic where a blank/all `cityCode` defaults to filtering out Hanoi and HCM:
        ```typescript
        ...(cityCode
          ? { ... }
          : {
              NOT: {
                OR: [
                  { city: { in: ['Ho Chi Minh City', 'Hồ Chí Minh', 'HCM', 'Hanoi', 'Hà Nội', 'HN'] } },
                  { area: { is: { ...this.buildMvpAreaCodeWhere('hn') } } },
                  { area: { is: { ...this.buildMvpAreaCodeWhere('hcm') } } },
                ],
              },
            }),
        ```
        This means using `/admin/rankings/options` without a specific city excludes Hanoi/HCM stores. Therefore, we should search all active stores via the `/admin/stores` endpoint directly on the frontend, mapping them to the correct format, as campaigns and other components do.

---

## 2. Logic Chain
1. **Scope and Scope Saving**: We will save recommend items with `scope: 'recommend-home'`, `targetType: 'STORE'`, `cityCode: 'all'` or the store's respective city code, and `status: 'ACTIVE'` via `adminRankingsApi.create` and `adminRankingsApi.delete`.
2. **Tab Extension**:
    *   Update `useState` in `page.tsx` to include `'recommend'`.
    *   Add a tab button called **"Đề xuất tối nay"** between "Dịch vụ nổi bật" and "Video Hot".
    *   Configure the "Add" button to focus `recommend-search-input` when `'recommend'` is active.
3. **8-Store Limit Warning**:
    *   Check `recommendItems.length` inside `handleAddRecommend`. If the length is 8 or more, block addition and invoke:
        ```typescript
        feedback.showModal({
          title: 'Giới hạn đề xuất',
          description: 'Mục "Đề xuất tối nay" chỉ hiển thị tối đa 8 quán trên trang chủ. Vui lòng gỡ bớt quán khác trước khi thêm quán mới.',
          tone: 'warning',
          primaryLabel: 'Đã hiểu'
        });
        ```
    *   This aligns with the user rules of avoiding browser `alert()` by using custom feedback modals.
4. **Reordering & Deleting**:
    *   Implement `handleMoveRecommend(index, 'up' | 'down')` similar to `handleMoveFeatured`. It fetches `pinRank` of current and swapped items, calls `adminRankingsApi.update` for both swaps concurrently using `Promise.all`, and then re-fetches the list.
    *   Implement `handleRemoveRecommend` to prompt the user with a custom confirmation modal using `feedback.showModal()` before calling `adminRankingsApi.delete` and showing a success toast.
5. **Store Search**:
    *   Because `adminRankingsApi.options` excludes Hanoi and HCM when no city is selected, we perform searching on `/admin/stores` which returns a list of all stores in Vietnam.
    *   Filter the stores on status `'ACTIVE'` and map them to `AdminRankingTargetOption` structure (mapping media images correctly).

---

## 3. Caveats
*   We assume that the backend ranking logic handles any custom string scope like `'recommend-home'` without hardcoded constraints (confirmed by schema index structures).
*   Search limit on `/admin/stores` is set to 10 for performance.
*   Pin limit is strictly enforced on the frontend; if there are existing elements on the DB exceeding 8, they will still render, but no new ones can be added until they are below 8.

---

## 4. Conclusion & Proposed Changes

Below are the detailed proposed changes to be made to `frontend/apps/web/src/app/admin/content/page.tsx`:

### 4.1. Update Tab State Type & Recommend States
```diff
<<<<
  const [activeTab, setActiveTab] = useState<'campaign' | 'banner' | 'featured' | 'video' | 'blog'>('campaign');
====
  const [activeTab, setActiveTab] = useState<'campaign' | 'banner' | 'featured' | 'recommend' | 'video' | 'blog'>('campaign');
>>>>
```

Add these states right after featured states (around line 81):
```typescript
  // Recommend Home states
  const [recommendItems, setRecommendItems] = useState<AdminRankingConfig[]>([]);
  const [searchRecommendQuery, setSearchRecommendQuery] = useState('');
  const [searchRecommendItems, setSearchRecommendItems] = useState<AdminRankingTargetOption[]>([]);
  const [isLoadingRecommend, setIsLoadingRecommend] = useState(false);
  const [isSearchingRecommend, setIsSearchingRecommend] = useState(false);
```

### 4.2. Update useEffect Hooks
Add these hooks after the featured hooks (around line 154):
```typescript
  useEffect(() => {
    if (activeTab === 'recommend') {
      fetchRecommendItems();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'recommend') {
      const timer = setTimeout(() => {
        searchRecommendStore(searchRecommendQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchRecommendQuery, activeTab]);
```

### 4.3. Add Recommended Handlers
Add these handler definitions after the featured handlers (around line 266):
```typescript
  const fetchRecommendItems = async () => {
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
  };

  const searchRecommendStore = async (q: string) => {
    if (!q.trim()) {
      setSearchRecommendItems([]);
      return;
    }
    try {
      setIsSearchingRecommend(true);
      const res = await apiClient<any>('/admin/stores', { params: { search: q, limit: 10 } });
      if (res && res.data) {
        const mapped: AdminRankingTargetOption[] = (res.data || [])
          .filter((s: any) => s.status === 'ACTIVE')
          .map((s: any) => ({
            id: s.id,
            targetType: 'STORE',
            name: s.name,
            slug: s.slug,
            image: s.media?.find((m: any) => m.purpose === 'STORE_COVER' || m.purpose === 'STORE_AVATAR')?.url || s.media?.[0]?.url || null,
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
  };

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
        cityCode: store.cityCode as any || 'all',
        category: store.category as any,
        scope: 'recommend-home',
        pinRank: recommendItems.length > 0 ? (recommendItems[recommendItems.length - 1]?.pinRank || 0) + 1 : 1,
        status: 'ACTIVE'
      });
      await fetchRecommendItems();
      setSearchRecommendQuery('');
    } catch (err: any) {
      console.error(err?.response?.data || err);
      feedback.showToast({ 
        title: `Không thể thêm vào danh sách đề xuất: ${err?.response?.data?.message || err.message || ''}`, 
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
      await Promise.all([
        adminRankingsApi.update(currentItem.id, {
          targetType: 'STORE',
          targetId: currentItem.targetId,
          cityCode: currentItem.cityCode,
          pinRank: swapRank
        }),
        adminRankingsApi.update(swapItem.id, {
          targetType: 'STORE',
          targetId: swapItem.targetId,
          cityCode: swapItem.cityCode,
          pinRank: currentRank
        })
      ]);
      await fetchRecommendItems();
    } catch (err) {
      console.error(err);
      feedback.showToast({ title: 'Không thể đổi vị trí.', tone: 'error' });
    }
  };
```

### 4.4. Clear Recommend Search on Drawer Close (around line 656)
```typescript
    setSearchRecommendQuery('');
    setSearchRecommendItems([]);
```

### 4.5. Render Tab Button & Add Button Logic
Modify the tabs bar (around line 846):
```tsx
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
```

Modify the "Add" button handler (around line 873):
```typescript
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
          // ... Style attributes stay unchanged
        >
          <Plus size={18} strokeWidth={3} />
          {activeTab === 'campaign' ? 'Thêm campaign' : activeTab === 'banner' ? 'Thêm banner' : activeTab === 'featured' ? 'Thêm dịch vụ' : activeTab === 'video' ? 'Thêm video hot' : activeTab === 'recommend' ? 'Thêm đề xuất' : 'Viết bài'}
        </button>
```

### 4.6. Render Recommended Content Tab View
Insert this view under the featured view (around line 1138):
```tsx
      {/* RECOMMEND HOME CONTENT */}
      {activeTab === 'recommend' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '9px', padding: '12px 15px', background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.2)', borderRadius: '12px', marginBottom: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d4b26a" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none', marginTop: '1px' }}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9z"/></svg>
            <span style={{ fontSize: '11.5px', color: '#cbb884', lineHeight: 1.5 }}>
              Khối <b style={{ color: '#f0dda8' }}>"Đề xuất tối nay"</b> trên trang chủ — Ghim tối đa 8 quán đang hoạt động nổi bật lên đầu trang chủ để tăng lượng truy cập và tương tác ban đêm.
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

          <div style={{ background: 'rgba(212,178,106,.05)', border: '1px solid rgba(212,178,106,.26)', borderRadius: '14px', padding: '14px', marginTop: '14px' }}>
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
                    {store.image ? <img src={resolveClientUrl(store.image as string) || undefined} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f0ea' }}>{store.name}</div>
                    <div style={{ fontSize: '11px', color: '#8c8679', marginTop: '1px' }}>{(typeof store.area === 'object' && store.area ? (store.area as any).name : store.area) || store.city} · {store.category}</div>
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
        </div>
      )}
```

---

## 5. Verification Method

To verify these changes:
1. **Compilation Check**: Run the build script in `frontend/apps/web/`:
   ```powershell
   pnpm --filter web build
   ```
2. **Frontend Linter Check**: Ensure there are no code formatting or type safety issues:
   ```powershell
   pnpm --filter web lint
   pnpm --filter web check-types
   ```
3. **Run Unit Tests**: Check that existing web tests run cleanly:
   ```powershell
   pnpm --filter web test
   ```
4. **Invalidation conditions**:
   * If `vitest` unit tests or Next.js build compilation fails, the implementation is incorrect.
   * If any browser-default warning or warning component from standard HTML is used, this breaks user constraints. Ensure `feedback.showModal` or `feedback.showToast` is used exclusively.
