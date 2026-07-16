# Handoff Report: Backend State Machine and Frontend Diff UI Analysis

## 1. Observation

Direct observations in the codebase:

### Backend: `d:/laragon/www/NightLife-VN/backend/src/nightlife-data/nightlife-data.service.ts`
- **Partner Request State Transitions** (`reviewPartnerRequest` function, lines 6842–7039):
  - Transitions the status of `partnerRequest` to `APPROVED` or `REJECTED`.
  - At line 6881–6883:
    ```typescript
    const onboarding = dto.approve
      ? await this.ensurePartnerOnboarding(tx, request)
      : null;
    ```
    This unconditionally triggers partner onboarding (which creates a new system `User` and `PartnerAccount`) for any approved request.
  - At line 6917–6922:
    ```typescript
    } else {
      await tx.store.update({
        where: { id: request.store.id },
        data: { status: 'DRAFT' },
        select: { id: true },
      });
    ```
    This unconditionally updates the store's status to `DRAFT` upon rejection, even if the store is already `ACTIVE` and this request was merely an update proposal.
- **Store Selection Query & Mapping** (`partnerRequestSelect` and `mapPartnerRequestRecord`, lines 16010–16060 & 16214–16255):
  - In `partnerRequestSelect()`, the `store` relation only retrieves minimal info:
    ```typescript
    store: {
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        category: true,
        mapUrl: true,
      },
    },
    ```
  - In `mapPartnerRequestRecord()`, the returned object only maps these minimal store attributes:
    ```typescript
    draftStoreId: request.store.id,
    draftStoreName: request.store.name,
    draftStoreSlug: request.store.slug,
    draftStoreCategory: request.store.category,
    mapUrl: request.store.mapUrl,
    ```
    It lacks the original store's description, address, city, district, phone, opening hours, and pricing information, preventing comparison (diffing) in the frontend.

### Frontend: `d:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/AdminConsole.tsx`
- **Request Listing Rendering** (`partnerTable` function, lines 3278–3400):
  - It renders all partner requests in a single grid without grouping or tabs for registration vs modification requests.
  - Reviews are processed directly inside the list via inline text input and Approve/Reject buttons. No detailed comparison modal is present.

---

## 2. Logic Chain

1. **Identifying Request Category by Prefix**:
   - Partner requests for *new registrations* are created with IDs starting with `PARTNER-`.
   - Partner requests for *listing updates* are created with IDs starting with `LISTING-`.
   - By analyzing `request.id.startsWith('PARTNER-')`, the backend can distinguish the intent: registration vs modification.
2. **Conditional Onboarding Execution**:
   - New registrations require a brand new user account and partner account setup (onboarding).
   - Listing updates are submitted by partners who already have accounts. Re-running onboarding for them throws errors (e.g. "Email already exists on the system" at line 16293) and breaks the flow.
   - Therefore, `ensurePartnerOnboarding` must only execute if `request.id` starts with `PARTNER-`.
3. **Preserving Store Status on Rejection**:
   - When a new registration request is rejected, the store must remain as `DRAFT` (not active).
   - When a modification request for an existing active store is rejected, the original store must keep its current status (typically `ACTIVE`). Reverting it to `DRAFT` would take the entire existing venue offline, which is incorrect.
4. **Providing Context for the Frontend Diff**:
   - To build a side-by-side comparison modal, the frontend needs both the proposed updates (which are in the `PartnerRequest` record) and the original store's current values.
   - By selecting detailed fields (`description`, `address`, `city`, `district`, `phone`, `openingHours`, `pricingInfo`) in `partnerRequestSelect` and packaging them as a nested `originalStore` object in `mapPartnerRequestRecord`, the API delivers all the necessary data for diffing.
5. **Admin Console Split Tab and Diff UI**:
   - Splitting registrations and modifications into separate tabs clarifies the workload.
   - Adding a comparison modal allows staff to carefully inspect changes to crucial text fields (e.g., description, phone, address, operating hours, and menus) side-by-side and highlight any discrepancies (e.g., using different colored backgrounds) before taking an action.

---

## 3. Caveats

- **No Live Database Schema Modifications**: This analysis assumes the prisma schema columns match the existing design and does not require migration since all diff fields are already in the DB schema.
- **Mock Unit Tests Adjustments**: In `nightlife-data.service.spec.ts`, the mock returned object structures for requests will need to match the expanded select fields.
- **Typescript Assertions**: The front-end type `AdminPartnerRequest` needs to be updated to include the optional `originalStore` object to satisfy type checks during build.

---

## 4. Conclusion & Proposed Changes

The backend state machine transitions and selection queries should be refactored, and the frontend AdminConsole should introduce Tab selection and a Comparison Modal.

### Proposed Code Patch for Backend

#### A. File: `d:/laragon/www/NightLife-VN/backend/src/nightlife-data/nightlife-data.service.ts`

**Update the `PartnerRequestCmsRecord` type definition (around lines 473–517):**
```typescript
type PartnerRequestCmsRecord = {
  id: string;
  status: PartnerRequestReviewStatus;
  businessName: string;
  businessType: string | null;
  area: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  passwordHash: string | null;
  note: string | null;
  storeDescription: string | null;
  storeAddress: string | null;
  storeCity: string | null;
  storeDistrict: string | null;
  openingHours: string | null;
  menuSummary: string | null;
  mediaUrls: string[];
  castProfiles: Prisma.JsonValue | null;
  draftCastIds: string[];
  draftMediaIds: string[];
  draftContentIds: string[];
  reviewReason: string | null;
  publicState: string;
  submittedAt: Date;
  reviewedAt: Date | null;
  reviewedById: string | null;
  partnerUserId: string | null;
  partnerAccountId: string | null;
  createdAt: Date;
  store: {
    id: string;
    name: string;
    slug: string;
    status: string;
    category: StoreCategory;
    mapUrl: string | null;
    description: string | null;
    address: string | null;
    city: string;
    district: string | null;
    phone: string | null;
    openingHours: Prisma.JsonValue | null;
    pricingInfo: Prisma.JsonValue | null;
  };
  notificationLog: {
    id: string;
    status: string;
    error: string | null;
    sentAt: Date | null;
  } | null;
};
```

**Modify `partnerRequestSelect()` to fetch extra store fields (around line 16041):**
```typescript
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          category: true,
          mapUrl: true,
          description: true,
          address: true,
          city: true,
          district: true,
          phone: true,
          openingHours: true,
          pricingInfo: true,
        },
      },
```

**Modify `mapPartnerRequestRecord()` to include `originalStore` (around line 16214):**
```typescript
  private mapPartnerRequestRecord(request: PartnerRequestCmsRecord) {
    return {
      id: request.id,
      notificationId: request.notificationLog?.id ?? null,
      notificationStatus: request.notificationLog?.status ?? null,
      notificationError: request.notificationLog?.error ?? null,
      notifiedAt: request.notificationLog?.sentAt?.toISOString() ?? null,
      submittedAt: request.submittedAt.toISOString(),
      status: request.status,
      reviewReason: request.reviewReason,
      reviewedAt: request.reviewedAt?.toISOString() ?? null,
      reviewedById: request.reviewedById,
      partnerUserId: request.partnerUserId,
      partnerAccountId: request.partnerAccountId,
      publicState: request.publicState,
      draftStoreId: request.store.id,
      draftStoreName: request.store.name,
      draftStoreSlug: request.store.slug,
      draftStoreCategory: request.store.category,
      draftCastIds: request.draftCastIds,
      draftMediaIds: request.draftMediaIds,
      draftContentIds: request.draftContentIds,
      draftCastCount: request.draftCastIds.length,
      draftMediaCount: request.draftMediaIds.length,
      draftContentCount: request.draftContentIds.length,
      businessName: request.businessName,
      businessType: request.businessType,
      area: request.area,
      contactName: request.contactName,
      contactPhone: request.contactPhone,
      contactEmail: request.contactEmail,
      note: request.note,
      storeDescription: request.storeDescription,
      storeAddress: request.storeAddress,
      storeCity: request.storeCity,
      storeDistrict: request.storeDistrict,
      mapUrl: request.store.mapUrl,
      openingHours: request.openingHours,
      menuSummary: request.menuSummary,
      mediaUrls: request.mediaUrls,
      originalStore: request.store
        ? {
            id: request.store.id,
            name: request.store.name,
            slug: request.store.slug,
            status: request.store.status,
            category: request.store.category,
            description: request.store.description ?? null,
            address: request.store.address ?? null,
            city: request.store.city,
            district: request.store.district ?? null,
            phone: request.store.phone ?? null,
            openingHours: request.store.openingHours ?? null,
            pricingInfo: request.store.pricingInfo ?? null,
            mapUrl: request.store.mapUrl ?? null,
          }
        : null,
    };
  }
```

**Fix State Transitions in `reviewPartnerRequest` (around lines 6881–6942):**
```typescript
      const isPartnerRegistration = request.id.startsWith('PARTNER-');

      const onboarding = (dto.approve && isPartnerRegistration)
        ? await this.ensurePartnerOnboarding(tx, request)
        : null;
      const listingStoreUpdate = dto.approve
        ? await this.partnerListingStoreUpdateFromRequest(tx, request)
        : {};

      if (dto.approve) {
        const storeUpdateData: any = {
          ...listingStoreUpdate,
          status: 'ACTIVE',
        };
        if (onboarding?.userId) {
          storeUpdateData.ownerId = onboarding.userId;
        }
        if (onboarding?.partnerAccountId) {
          storeUpdateData.partnerAccountId = onboarding.partnerAccountId;
        }
        await tx.store.update({
          where: { id: request.store.id },
          data: storeUpdateData,
          select: { id: true },
        });
        if (request.draftCastIds.length) {
          await tx.cast.updateMany({
            where: { id: { in: request.draftCastIds } },
            data: { status: 'ACTIVE', isPublic: true },
          });
        }
        if (request.draftMediaIds.length) {
          await tx.media.updateMany({
            where: { id: { in: request.draftMediaIds } },
            data: { status: 'READY', access: 'PUBLIC' },
          });
        }
        if (request.draftContentIds.length) {
          await tx.content.updateMany({
            where: { id: { in: request.draftContentIds } },
            data: { status: 'PUBLISHED', publishedAt: now },
          });
        }
      } else {
        if (isPartnerRegistration) {
          await tx.store.update({
            where: { id: request.store.id },
            data: { status: 'DRAFT' },
            select: { id: true },
          });
        }
        // In listing modification requests, we leave the store status active and untouched on rejection
        if (request.draftCastIds.length) {
          await tx.cast.updateMany({
            where: { id: { in: request.draftCastIds } },
            data: { status: 'DRAFT', isPublic: false },
          });
        }
        if (request.draftMediaIds.length) {
          await tx.media.updateMany({
            where: { id: { in: request.draftMediaIds } },
            data: { status: 'HIDDEN', access: 'PROTECTED' },
          });
        }
        if (request.draftContentIds.length) {
          await tx.content.updateMany({
            where: { id: { in: request.draftContentIds } },
            data: { status: 'DRAFT', publishedAt: null },
          });
        }
      }
```

---

### Proposed Code Patch for Frontend

#### B. File: `d:/laragon/www/NightLife-VN/frontend/apps/web/src/app/admin/AdminConsole.tsx`

**Update the `AdminPartnerRequest` type (around lines 327–362):**
```typescript
type AdminPartnerRequest = {
  id: string;
  notificationId: string | null;
  // ... existing fields ...
  originalStore?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    category: string;
    description: string | null;
    address: string | null;
    city: string;
    district: string | null;
    phone: string | null;
    openingHours: any | null;
    pricingInfo: any | null;
    mapUrl: string | null;
  } | null;
};
```

**Add React States for Tabs and Diff Modal inside `AdminConsole` component (around line 1722):**
```typescript
  const [partnerRequestTab, setPartnerRequestTab] = useState<"registration" | "modification">("registration");
  const [selectedRequestForDiff, setSelectedRequestForDiff] = useState<AdminPartnerRequest | null>(null);
  const [diffModalReason, setDiffModalReason] = useState<string>("");
```

**Support custom reason in `reviewPartnerRequest` handler (around line 2557):**
```typescript
  const reviewPartnerRequest = async (requestId: string, approve: boolean, customReason?: string) => {
    const reason =
      customReason?.trim() ||
      partnerReviewReasons[requestId]?.trim() ||
      (approve
        ? "Ho so hop le, duyet public noi dung partner."
        : "");

    if (!reason) {
      setStatusMessage("Nhap ly do truoc khi tu choi partner request.");
      return;
    }

    setReviewingPartnerRequestId(requestId);

    try {
      await apiClient(`/admin/partner-requests/${requestId}/review`, {
        method: "PATCH",
        data: { approve, reason },
      });
      setStatusMessage(approve ? "Da duyet partner request va public draft." : "Da tu choi partner request.");
      setPartnerReviewReasons((current) => ({ ...current, [requestId]: "" }));
      await loadAdminData();
    } catch (error) {
      setStatusMessage(error instanceof ApiError ? error.message : "Khong review duoc partner request.");
    } finally {
      setReviewingPartnerRequestId(null);
    }
  };
```

**Implement tab logic inside `partnerTable` (around lines 3278–3301):**

1. Define a filtered request list based on the active sub-tab:
   ```typescript
   const filteredRequestsByTab = useMemo(() => {
     return orderedPartnerRequests.filter((req) => {
       const isReg = req.id.startsWith("PARTNER-");
       return partnerRequestTab === "registration" ? isReg : !isReg;
     });
   }, [orderedPartnerRequests, partnerRequestTab]);
   ```

2. Render tab buttons inside `partnerTable`:
   ```typescript
   // Inside partnerTable:
   <div style={{ display: "flex", gap: 12, borderBottom: `1px solid ${colors.borderSoft}`, marginBottom: 14, padding: "10px 18px" }}>
     <button
       type="button"
       onClick={() => setPartnerRequestTab("registration")}
       style={{
         padding: "8px 16px",
         borderRadius: 6,
         background: partnerRequestTab === "registration" ? colors.goldBright : "transparent",
         color: partnerRequestTab === "registration" ? "#000" : colors.text,
         border: `1px solid ${partnerRequestTab === "registration" ? colors.goldBright : colors.borderSoft}`,
         fontWeight: 700,
         cursor: "pointer",
       }}
     >
       Đăng ký mới ({partnerRequests.filter(r => r.id.startsWith("PARTNER-")).length})
     </button>
     <button
       type="button"
       onClick={() => setPartnerRequestTab("modification")}
       style={{
         padding: "8px 16px",
         borderRadius: 6,
         background: partnerRequestTab === "modification" ? colors.goldBright : "transparent",
         color: partnerRequestTab === "modification" ? "#000" : colors.text,
         border: `1px solid ${partnerRequestTab === "modification" ? colors.goldBright : colors.borderSoft}`,
         fontWeight: 700,
         cursor: "pointer",
       }}
     >
       Yêu cầu sửa đổi ({partnerRequests.filter(r => r.id.startsWith("LISTING-")).length})
     </button>
   </div>
   ```

3. Replace `.map` target in the table content rendering (line 3301):
   ```typescript
   {filteredRequestsByTab.slice(0, activeView === "partners" ? 12 : 6).map((request) => (
     ...
   ))}
   ```

4. Render the "Xem thay đổi" button inside the actions panel (next to Duyệt / Từ chối):
   ```typescript
   {request.id.startsWith("LISTING-") && (
     <button
       type="button"
       onClick={() => {
         setSelectedRequestForDiff(request);
         setDiffModalReason(partnerReviewReasons[request.id] ?? "");
       }}
       style={{
         ...buttonStyle("secondary"),
         borderColor: colors.goldBright,
         color: colors.goldBright,
         marginLeft: 4,
       }}
     >
       Xem thay đổi
     </button>
   )}
   ```

**Add the Modal Render Block at the bottom of the main JSX layout:**

Add this modal container and diff rows inside the main component render tree (e.g. next to the booking cancel modal):

```typescript
      {/* Side-by-Side Comparison (Diff View) Modal */}
      {selectedRequestForDiff && (() => {
        const req = selectedRequestForDiff;
        const originalStore = req.originalStore;

        const isFieldChanged = (val1: any, val2: any) => {
          if (val1 === val2) return false;
          if (!val1 && !val2) return false;
          if ((val1 === null || val1 === undefined || val1 === "") && (val2 === null || val2 === undefined || val2 === "")) return false;
          return String(val1 ?? "").trim().toLowerCase() !== String(val2 ?? "").trim().toLowerCase();
        };

        const nameChanged = isFieldChanged(originalStore?.name, req.businessName);
        const categoryChanged = isFieldChanged(originalStore?.category, req.businessType);
        const descriptionChanged = isFieldChanged(originalStore?.description, req.storeDescription);
        
        const originalStoreAddress = [originalStore?.address, originalStore?.district, originalStore?.city].filter(Boolean).join(", ");
        const proposedAddress = [req.storeAddress, req.storeDistrict, req.storeCity].filter(Boolean).join(", ");
        const addressChanged = isFieldChanged(originalStoreAddress, proposedAddress);

        const phoneChanged = isFieldChanged(originalStore?.phone, req.contactPhone);
        
        const origHoursStr = originalStore?.openingHours && typeof originalStore.openingHours === 'object' 
          ? (originalStore.openingHours as any).summary 
          : originalStore?.openingHours;
        const hoursChanged = isFieldChanged(origHoursStr, req.openingHours);

        const origMenuStr = originalStore?.pricingInfo && typeof originalStore.pricingInfo === 'object'
          ? (originalStore.pricingInfo as any).menuSummary
          : originalStore?.pricingInfo;
        const menuChanged = isFieldChanged(origMenuStr, req.menuSummary);

        const handleDiffModalReview = async (approve: boolean) => {
          await reviewPartnerRequest(req.id, approve, diffModalReason);
          setSelectedRequestForDiff(null);
        };

        const DiffRow = ({ label, value, changed, isNew }: { label: string; value: any; changed: boolean; isNew?: boolean }) => (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: changed
                ? isNew
                  ? "rgba(212,178,106,.15)"
                  : "rgba(255,255,255,.03)"
                : "transparent",
              border: changed
                ? `1px solid ${isNew ? colors.borderGold32 : colors.borderSoft}`
                : "1px solid transparent",
            }}
          >
            <span style={{ display: "block", fontSize: 11, color: colors.muted, fontWeight: 700, textTransform: "uppercase" }}>
              {label}
            </span>
            <span
              style={{
                display: "block",
                marginTop: 4,
                fontSize: 13,
                color: changed && isNew ? colors.goldBright : colors.text2,
                fontWeight: changed && isNew ? 700 : 400,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {value || <em style={{ color: colors.muted }}>Trống</em>}
            </span>
          </div>
        );

        return (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              display: "grid",
              placeItems: "center",
              padding: 24,
              background: "rgba(0,0,0,.8)",
              backdropFilter: "blur(10px)",
            }}
          >
            <div
              style={{
                width: "min(100%, 960px)",
                maxHeight: "90vh",
                border: `1px solid ${colors.borderGold32}`,
                borderRadius: 14,
                background: "#121216",
                boxShadow: "0 24px 70px rgba(0,0,0,.6)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: "16px 20px",
                  borderBottom: `1px solid ${colors.borderSoft}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, color: colors.goldBright, fontSize: 18, fontWeight: 800 }}>
                    So sánh thay đổi thông tin quán
                  </h2>
                  <span style={{ fontSize: 12, color: colors.muted }}>
                    Yêu cầu ID: {req.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRequestForDiff(null)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: colors.muted,
                    fontSize: 24,
                    cursor: "pointer",
                  }}
                >
                  &times;
                </button>
              </div>

              {/* Side-by-side Columns */}
              <div style={{ flex: 1, overflowY: "auto", padding: 20, display: "grid", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* Left Column: Original Store */}
                  <div>
                    <h3 style={{ fontSize: 13, color: colors.muted, borderBottom: `1px solid ${colors.borderSoft}`, paddingBottom: 6, marginBottom: 12, fontWeight: 900 }}>
                      DỮ LIỆU HIỆN TẠI (STORE GỐC)
                    </h3>
                    <div style={{ display: "grid", gap: 14 }}>
                      <DiffRow label="Tên quán" value={originalStore?.name} changed={nameChanged} />
                      <DiffRow label="Loại hình" value={originalStore?.category} changed={categoryChanged} />
                      <DiffRow label="Địa chỉ" value={originalStoreAddress} changed={addressChanged} />
                      <DiffRow label="Số điện thoại" value={originalStore?.phone} changed={phoneChanged} />
                      <DiffRow label="Mô tả" value={originalStore?.description} changed={descriptionChanged} />
                      <DiffRow label="Giờ mở cửa" value={origHoursStr} changed={hoursChanged} />
                      <DiffRow label="Menu / Giá" value={origMenuStr} changed={menuChanged} />
                    </div>
                  </div>

                  {/* Right Column: Proposed Partner Request */}
                  <div>
                    <h3 style={{ fontSize: 13, color: colors.goldBright, borderBottom: `1px solid ${colors.borderGold22}`, paddingBottom: 6, marginBottom: 12, fontWeight: 900 }}>
                      ĐỀ XUẤT THAY ĐỔI
                    </h3>
                    <div style={{ display: "grid", gap: 14 }}>
                      <DiffRow label="Tên quán" value={req.businessName} changed={nameChanged} isNew />
                      <DiffRow label="Loại hình" value={req.businessType} changed={categoryChanged} isNew />
                      <DiffRow label="Địa chỉ" value={proposedAddress} changed={addressChanged} isNew />
                      <DiffRow label="Số điện thoại" value={req.contactPhone} changed={phoneChanged} isNew />
                      <DiffRow label="Mô tả" value={req.storeDescription} changed={descriptionChanged} isNew />
                      <DiffRow label="Giờ mở cửa" value={req.openingHours} changed={hoursChanged} isNew />
                      <DiffRow label="Menu / Giá" value={req.menuSummary} changed={menuChanged} isNew />
                    </div>
                  </div>
                </div>

                {/* Reason Inputs */}
                <div style={{ borderTop: `1px solid ${colors.borderSoft}`, paddingTop: 16 }}>
                  <label style={{ display: "grid", gap: 6, color: colors.text2, fontSize: 12, fontWeight: 800 }}>
                    Lý do phê duyệt / từ chối
                    <textarea
                      value={diffModalReason}
                      onChange={(e) => setDiffModalReason(e.target.value)}
                      rows={3}
                      placeholder="Nhập phản hồi cho partner..."
                      style={inputStyle({ padding: 10, minHeight: 70 })}
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  padding: "14px 20px",
                  borderTop: `1px solid ${colors.borderSoft}`,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  background: "rgba(0,0,0,.15)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedRequestForDiff(null)}
                  style={buttonStyle("secondary")}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={req.status !== "PENDING_REVIEW" || reviewingPartnerRequestId === req.id}
                  onClick={() => void handleDiffModalReview(false)}
                  style={buttonStyle("danger")}
                >
                  Từ chối
                </button>
                <button
                  type="button"
                  disabled={req.status !== "PENDING_REVIEW" || reviewingPartnerRequestId === req.id}
                  onClick={() => void handleDiffModalReview(true)}
                  style={buttonStyle("primary")}
                >
                  Duyệt & Áp dụng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
```

---

## 5. Verification Method

To verify these implementations once coded:

### A. Backend Verification
- **Unit Test Execution**:
  - Run the tests of the `nightlife-data` service:
    ```bash
    npm run test -- src/nightlife-data/nightlife-data.service.spec.ts
    ```
  - Verify that approving listing updates (`LISTING-` prefix) does not call `ensurePartnerOnboarding` nor trigger `user.create` or `partnerAccount.create`.
  - Verify that rejecting updates keeps the store state intact (remains `ACTIVE` or what it was) and does not force it to `DRAFT`.
  - Check the output logs for the list admin requests endpoint and confirm that `originalStore` exists in the return payload, fully filled with its address, phone, descriptions, and other key details.

### B. Frontend Verification
- **Compilation Check**:
  - Run web application build or typecheck:
    ```bash
    pnpm run check-types
    ```
    Ensure no TypeScript compiler or syntax errors exist in `AdminConsole.tsx` regarding the updated interface.
- **Visual & Interaction Check**:
  - Open the Admin Console.
  - Choose the "Partner Requests" section.
  - Verify that tabs for **Đăng ký mới** and **Yêu cầu sửa đổi** exist and correctly filter the lists.
  - For modification requests, verify the "Xem thay đổi" button is visible.
  - Click "Xem thay đổi" to launch the modal. Confirm the side-by-side layout functions correctly, displaying modified fields highlighted in a distinct colored panel.
  - Verify that entering feedback and clicking Approve/Reject inside the modal performs the API operation correctly, close the modal, and updates the local request list state.
