# Handoff Report - UI Verification for recommend-home

## 1. Observation
- **Admin Content Page Frontend File**: `frontend/apps/web/src/app/admin/content/page.tsx`
  - *Active Tab*: `'recommend'` tab (labeled `"Đề xuất tối nay"`).
  - *Search Request*: Calls `/admin/stores` with params `{ search: q, limit: 10 }` at line 310:
    ```typescript
    const res = await apiClient<{ data: SearchStoreItem[] }>('/admin/stores', { params: { search: q, limit: 10 } });
    ```
  - *Pin Limit Enforcement*: Blocks at 8 items and displays a warning modal at lines 340-348:
    ```typescript
    if (recommendItems.length >= 8) {
      feedback.showModal({
        title: 'Giới hạn đề xuất',
        description: 'Mục "Đề xuất tối nay" chỉ hiển thị tối đa 8 quán trên trang chủ. Vui lòng gỡ bớt quán khác trước khi thêm quán này.',
        tone: 'warning',
        primaryLabel: 'Đã hiểu'
      });
      return;
    }
    ```
  - *Reordering API Calls*: Calls `adminRankingsApi.update` for the moved item and the swapped item at lines 413-426:
    ```typescript
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
    ```
  - *Deletion confirmation*: Shows warning modal and calls `adminRankingsApi.delete(id)` upon primary action click at lines 381-397:
    ```typescript
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
    ```

- **Backend Store Query Endpoint Implementation**: `backend/src/nightlife-data/nightlife-data.service.ts`
  - *Query Builder*: `listAdminStores` service method at lines 19486-19495:
    ```typescript
    const where: import('@prisma/client').Prisma.StoreWhereInput = {
      ...(includeDeleted ? {} : { deletedAt: null }),
      ...(prismaCategory && { category: prismaCategory }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };
    ```

- **Integration Tests Added**: `frontend/apps/web/__tests__/AdminRecommendHome.test.tsx`
  - Contains 4 tests verifying:
    1. Search call contains no city parameters (queries all cities).
    2. Boundary limit of 8 pins blocks adding a 9th pin and triggers `feedback.showModal`.
    3. Reordering triggers two parallel `adminRankingsApi.update` calls with swapped pin ranks.
    4. Deletion shows confirmation modal and fires `adminRankingsApi.delete` on primary action.
  - Test result:
    ```
    ✓ __tests__/AdminRecommendHome.test.tsx (4 tests) 2570ms
        ✓ 1. Search operates across all stores in all cities (no city filtering)  1236ms
        ✓ 2. Pinned limit of 8 stores is correctly blocked on 9th store with a custom modal  835ms
        ✓ 3. Reordering via Up/Down buttons works correctly and updates rankings in backend  532ms
        ✓ 4. Deletion works and prompts with a custom confirmation modal  310ms
    ```

## 2. Logic Chain
1. We inspected the store lookup parameters in the page component `/admin/content/page.tsx` (`searchRecommendStore` method) and observed that only search query text (`search`) and size `limit` are passed to the backend API (`/admin/stores`), with no city code or filtering parameters.
2. We inspected the backend controller and database query service for `/admin/stores` (`listAdminStores` method in `nightlife-data.service.ts`) and verified that the Prisma `where` clause lacks any filtering based on city code or region.
3. Therefore, store searching operates globally across all cities.
4. We verified that clicking the "+ Ghim đề xuất" button on the 9th store returns early and shows a warning modal via `feedback.showModal` with title `"Giới hạn đề xuất"`, avoiding `adminRankingsApi.create` invocation.
5. We verified that moving items via "Up"/"Down" buttons updates both items' `pinRank` coordinates sequentially via parallel `adminRankingsApi.update` requests.
6. We verified that clicking the delete icon shows `feedback.showModal` with title `"Xác nhận gỡ"`, and upon clicking `"Đã hiểu"` (the modal's default primary action button), the item is removed by calling `adminRankingsApi.delete`.

## 3. Caveats
- No caveats.

## 4. Conclusion
The frontend UI and backend API for `recommend-home` behave correctly and strictly adhere to all criteria, including search cross-city availability, 8 pinned items limit block (warning modal feedback), rank ordering swap behavior, and custom delete confirmation modal dialogs.

## 5. Verification Method
To re-run the tests locally:
```bash
cd frontend/apps/web
pnpm test __tests__/AdminRecommendHome.test.tsx
```
The test passes if all 4 assertions execute successfully.
