# Analysis of Seed Fixtures Update: MemberFavoriteStore, SupportTicket, and SupportMessage

This report provides a detailed plan and the exact code modifications required to seed `MemberFavoriteStore`, `SupportTicket`, and `SupportMessage` models inside `backend/prisma/seed/13-api-fixtures.ts`.

---

## 1. Schema & Relation Requirements Analysis

### 1.1 `MemberFavoriteStore`
*   **Table Name**: `member_favorite_stores`
*   **Fields**:
    *   `id`: `String` (UUID, Primary Key)
    *   `userId`: `String` (UUID, references `User.id`)
    *   `storeId`: `String` (UUID, references `Store.id`)
    *   `createdAt`: `DateTime` (default `now()`)
*   **Constraints**:
    *   `@@unique([userId, storeId])` - Unique compound key
*   **Relation Requirements**:
    *   `userId` must reference a valid `User` ID (e.g., `member` or `vip` user).
    *   `storeId` must reference a valid `Store` ID (e.g., `moonlight-bar` or `velvet-club` store).
*   **Upsert Strategy**:
    *   We will upsert using the primary key `id` (using a stable UUID derived from `seedUuid('favorite-store:${userKey}:${storeSlug}')`), which maintains stylistic consistency with how `MemberFavoriteCast` is seeded in the same file.

### 1.2 `SupportTicket`
*   **Table Name**: `support_tickets`
*   **Fields**:
    *   `id`: `String` (UUID, Primary Key)
    *   `guestSessionId`: `String?` (Guest session identifier, optional)
    *   `userId`: `String?` (UUID, references `User.id` for registered users, optional)
    *   `assignedAdminId`: `String?` (UUID, references `User.id` for the admin/operator assigned, optional)
    *   `status`: `SupportTicketStatus` (enum: `PENDING`, `ACTIVE`, `CLOSED`)
    *   `createdAt`: `DateTime`
    *   `updatedAt`: `DateTime`
    *   `closedAt`: `DateTime?`
*   **Constraints**:
    *   No compound unique keys; only the primary key `id`.
*   **Relation Requirements**:
    *   `userId` is optional, but if set, must match a valid `User` ID.
    *   `assignedAdminId` is optional, but if set, must match a valid `User` ID with an admin/operator role.
*   **Upsert Strategy**:
    *   Upsert using the primary key `id` (derived from `seedUuid('support-ticket:${key}')`).

### 1.3 `SupportMessage`
*   **Table Name**: `support_messages`
*   **Fields**:
    *   `id`: `String` (UUID, Primary Key)
    *   `ticketId`: `String` (UUID, references `SupportTicket.id`)
    *   `senderId`: `String?` (UUID, references `User.id`, optional - null for guests/system)
    *   `senderType`: `SupportSenderType` (enum: `GUEST`, `USER`, `ADMIN`, `SYSTEM`)
    *   `content`: `String` (Message text content)
    *   `isRead`: `Boolean` (default `false`)
    *   `createdAt`: `DateTime`
*   **Constraints**:
    *   No compound unique keys; only the primary key `id`.
*   **Relation/Value Requirements**:
    *   `ticketId` must reference an existing `SupportTicket`.
    *   `senderId` is optional. If `senderType` is `USER` or `ADMIN`, `senderId` should reference the sending user. If `senderType` is `GUEST` or `SYSTEM`, `senderId` should be `null`.
*   **Upsert Strategy**:
    *   Upsert using the primary key `id` (derived from `seedUuid('support-message:${ticketKey}:${index}')`).

---

## 2. Proposed Mock Data Structure

We propose three distinct support ticket scenarios representing different lifecycles and actor combinations, plus three favorite store pairings:

### 2.1 `MemberFavoriteStore` Pairs
1.  **Member + Moonlight Bar**: `['member', 'moonlight-bar']`
2.  **Member + Velvet Club**: `['member', 'velvet-club']`
3.  **VIP + Moonlight Bar**: `['vip', 'moonlight-bar']`

### 2.2 `SupportTicket` Scenarios
1.  **Ticket 1 (Closed Guest Ticket)**:
    *   `key`: `guest-closed`
    *   `guestSessionId`: `'session-guest-123'`
    *   `userId`: `null`
    *   `assignedAdminId`: operator user
    *   `status`: `CLOSED`
    *   `closedAt`: 5 days ago
    *   `messages`:
        *   Guest: `"Hello, I cannot see my discount coupon on checkout."`
        *   Operator (Admin): `"Hi! Please make sure you are using the correct guest email that received the coupon."`
        *   Guest: `"Ah! I was using my personal email instead of the work one. It works now. Thank you!"`
        *   System (System): `"This support ticket was closed by the operator."`

2.  **Ticket 2 (Active Member Ticket)**:
    *   `key`: `member-active`
    *   `guestSessionId`: `null`
    *   `userId`: member user
    *   `assignedAdminId`: operator user
    *   `status`: `ACTIVE`
    *   `closedAt`: `null`
    *   `messages`:
        *   Member (User): `"Can I request a change for my booking VIP-100?"`
        *   Operator (Admin): `"Yes, you can do that in your booking details screen. I will guide you."`

3.  **Ticket 3 (Pending VIP Ticket)**:
    *   `key`: `vip-pending`
    *   `guestSessionId`: `null`
    *   `userId`: vip user
    *   `assignedAdminId`: `null` (Unassigned)
    *   `status`: `PENDING`
    *   `closedAt`: `null`
    *   `messages`:
        *   VIP (User): `"I need to book a private lounge for 20 people tonight."`

---

## 3. Proposed Code Modifications

### 3.1 Imports Update
We need to import `SupportSenderType` and `SupportTicketStatus` from `@prisma/client`.

```typescript
import {
  BookingChangeRequestStatus,
  Coupon,
  CouponIssueStatus,
  Prisma,
  PrismaClient,
  Store,
  SupportSenderType,    // Add this
  SupportTicketStatus,  // Add this
  User,
} from '@prisma/client';
```

### 3.2 Seeding Logic Code Snippet
To be inserted in `seedApiFixtures` in `backend/prisma/seed/13-api-fixtures.ts`, right before the final `console.log(...)` statement:

```typescript
  // --- Seed MemberFavoriteStore ---
  const favoriteStorePairs = [
    ['member', 'moonlight-bar'],
    ['member', 'velvet-club'],
    ['vip', 'moonlight-bar'],
  ] as const;
  for (const [userKey, storeSlug] of favoriteStorePairs) {
    const user = users[userKey];
    const store = stores[storeSlug];
    if (!user || !store) {
      throw new Error(
        `Missing favorite store fixture relation: ${userKey}/${storeSlug}`,
      );
    }
    const id = seedUuid(`favorite-store:${userKey}:${storeSlug}`);
    await prisma.memberFavoriteStore.upsert({
      where: { id },
      update: { userId: user.id, storeId: store.id },
      create: { id, userId: user.id, storeId: store.id, createdAt: seedDate(now, -1, 10) },
    });
  }

  // --- Seed SupportTicket & SupportMessage ---
  const supportTicketFixtures = [
    {
      key: 'guest-closed',
      guestSessionId: 'session-guest-123',
      userKey: null,
      assignedAdminKey: 'operator',
      status: SupportTicketStatus.CLOSED,
      createdAt: seedDate(now, -5, 10),
      closedAt: seedDate(now, -5, 11),
      messages: [
        {
          senderType: SupportSenderType.GUEST,
          senderKey: null,
          content: 'Hello, I cannot see my discount coupon on checkout.',
          createdAt: seedDate(now, -5, 10),
        },
        {
          senderType: SupportSenderType.ADMIN,
          senderKey: 'operator',
          content: 'Hi! Please make sure you are using the correct guest email that received the coupon.',
          createdAt: seedDate(now, -5, 10, 15),
        },
        {
          senderType: SupportSenderType.GUEST,
          senderKey: null,
          content: 'Ah! I was using my personal email instead of the work one. It works now. Thank you!',
          createdAt: seedDate(now, -5, 10, 30),
        },
        {
          senderType: SupportSenderType.SYSTEM,
          senderKey: null,
          content: 'This support ticket was closed by the operator.',
          createdAt: seedDate(now, -5, 11),
        },
      ],
    },
    {
      key: 'member-active',
      guestSessionId: null,
      userKey: 'member',
      assignedAdminKey: 'operator',
      status: SupportTicketStatus.ACTIVE,
      createdAt: seedDate(now, -2, 14),
      closedAt: null,
      messages: [
        {
          senderType: SupportSenderType.USER,
          senderKey: 'member',
          content: 'Can I request a change for my booking VIP-100?',
          createdAt: seedDate(now, -2, 14),
        },
        {
          senderType: SupportSenderType.ADMIN,
          senderKey: 'operator',
          content: 'Yes, you can do that in your booking details screen. I will guide you.',
          createdAt: seedDate(now, -2, 14, 10),
        },
      ],
    },
    {
      key: 'vip-pending',
      guestSessionId: null,
      userKey: 'vip',
      assignedAdminKey: null,
      status: SupportTicketStatus.PENDING,
      createdAt: seedDate(now, -1, 9),
      closedAt: null,
      messages: [
        {
          senderType: SupportSenderType.USER,
          senderKey: 'vip',
          content: 'I need to book a private lounge for 20 people tonight.',
          createdAt: seedDate(now, -1, 9),
        },
      ],
    },
  ];

  for (const ticketFixture of supportTicketFixtures) {
    const user = ticketFixture.userKey ? users[ticketFixture.userKey] : null;
    const assignedAdmin = ticketFixture.assignedAdminKey ? users[ticketFixture.assignedAdminKey] : null;

    if (ticketFixture.userKey && !user) {
      throw new Error(`Missing user for support ticket: ${ticketFixture.userKey}`);
    }
    if (ticketFixture.assignedAdminKey && !assignedAdmin) {
      throw new Error(`Missing assigned admin/operator for support ticket: ${ticketFixture.assignedAdminKey}`);
    }

    const ticketId = seedUuid(`support-ticket:${ticketFixture.key}`);
    await prisma.supportTicket.upsert({
      where: { id: ticketId },
      update: {
        guestSessionId: ticketFixture.guestSessionId,
        userId: user?.id ?? null,
        assignedAdminId: assignedAdmin?.id ?? null,
        status: ticketFixture.status,
        closedAt: ticketFixture.closedAt,
      },
      create: {
        id: ticketId,
        guestSessionId: ticketFixture.guestSessionId,
        userId: user?.id ?? null,
        assignedAdminId: assignedAdmin?.id ?? null,
        status: ticketFixture.status,
        closedAt: ticketFixture.closedAt,
        createdAt: ticketFixture.createdAt,
      },
    });

    for (const [index, msgFixture] of ticketFixture.messages.entries()) {
      const msgId = seedUuid(`support-message:${ticketFixture.key}:${index}`);
      let senderId: string | null = null;
      if (msgFixture.senderType === SupportSenderType.USER && user) {
        senderId = user.id;
      } else if (msgFixture.senderType === SupportSenderType.ADMIN && assignedAdmin) {
        senderId = assignedAdmin.id;
      }

      await prisma.supportMessage.upsert({
        where: { id: msgId },
        update: {
          content: msgFixture.content,
          senderType: msgFixture.senderType,
          senderId,
        },
        create: {
          id: msgId,
          ticketId,
          content: msgFixture.content,
          senderType: msgFixture.senderType,
          senderId,
          createdAt: msgFixture.createdAt,
        },
      });
    }
  }
```

### 3.3 Log Message Update
We can also update the success message on line 590:
```typescript
  console.log(
    '     ✓ categories, favorites, change requests, chat, partner review, notifications, support tickets and audit fixtures',
  );
```

---

## 4. Verification Recommendations (`verify.ts`)

To ensure the seed coverage logic recognizes these three new models, we recommend updating `verify.ts` in the following places:

1.  Add counts to `modelCounts` in `verifySeedCoverage`:
    ```typescript
    MemberFavoriteStore: await prisma.memberFavoriteStore.count(),
    SupportTicket: await prisma.supportTicket.count(),
    SupportMessage: await prisma.supportMessage.count(),
    ```
2.  Add model names to `demoRequiredModels`:
    ```typescript
    'MemberFavoriteStore',
    'SupportTicket',
    'SupportMessage',
    ```
3.  Add status checks for support ticket statuses:
    ```typescript
    const ticketStatuses = await prisma.supportTicket.findMany({
      distinct: ['status'],
      select: { status: true }
    });
    requireStatuses('SupportTicket', ticketStatuses, ['PENDING', 'ACTIVE', 'CLOSED']);
    ```
