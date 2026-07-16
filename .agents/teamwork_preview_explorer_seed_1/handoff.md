# Handoff Report — teamwork_preview_explorer_seed_1

## 1. Observation
*   **Target schema models** in `backend/prisma/schema.prisma`:
    *   `MemberFavoriteStore` (lines 591-603):
        ```prisma
        model MemberFavoriteStore {
          id        String   @id @default(uuid()) @db.Uuid
          userId    String   @map("user_id") @db.Uuid
          storeId   String   @map("store_id") @db.Uuid
          user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
          store     Store    @relation(fields: [storeId], references: [id], onDelete: Cascade)
          createdAt DateTime @default(now()) @map("created_at")

          @@unique([userId, storeId])
          ...
        }
        ```
    *   `SupportTicket` (lines 1307-1325):
        ```prisma
        model SupportTicket {
          id              String              @id @default(uuid()) @db.Uuid
          guestSessionId  String?             @map("guest_session_id")
          userId          String?             @map("user_id") @db.Uuid
          assignedAdminId String?             @map("assigned_admin_id") @db.Uuid
          status          SupportTicketStatus @default(PENDING)
          user            User?               @relation("SupportTicketUser", fields: [userId], references: [id], onDelete: SetNull)
          assignedAdmin   User?               @relation("SupportTicketAdmin", fields: [assignedAdminId], references: [id], onDelete: SetNull)
          messages        SupportMessage[]
          createdAt       DateTime            @default(now()) @map("created_at")
          updatedAt       DateTime            @updatedAt @map("updated_at")
          closedAt        DateTime?           @map("closed_at")
          ...
        }
        ```
    *   `SupportMessage` (lines 1327-1342):
        ```prisma
        model SupportMessage {
          id         String            @id @default(uuid()) @db.Uuid
          ticketId   String            @map("ticket_id") @db.Uuid
          senderId   String?           @map("sender_id") @db.Uuid
          senderType SupportSenderType @map("sender_type")
          content    String
          isRead     Boolean           @default(false) @map("is_read")
          ticket     SupportTicket     @relation(fields: [ticketId], references: [id], onDelete: Cascade)
          senderUser User?             @relation("SupportMessageSender", fields: [senderId], references: [id], onDelete: SetNull)
          createdAt  DateTime          @default(now()) @map("created_at")
          ...
        }
        ```
*   **Fixture context and patterns** in `backend/prisma/seed/13-api-fixtures.ts`:
    *   Provides `stores`, `casts`, `users`, `coupons`, `transactions`, `now` in `ApiFixtureContext`.
    *   Seeding of related/join tables (e.g. `MemberFavoriteCast`) uses `seedUuid(\`favorite:\${userKey}:\${castSlug}\`)` to compute a stable UUID and then performs `upsert` with `where: { id }` (lines 100-105):
        ```typescript
        const id = seedUuid(`favorite:${userKey}:${castSlug}`);
        await prisma.memberFavoriteCast.upsert({
          where: { id },
          update: { userId: user.id, castId: cast.id },
          create: { id, userId: user.id, castId: cast.id },
        });
        ```

## 2. Logic Chain
1.  **Relation requirements mapping**:
    *   `MemberFavoriteStore` requires `userId` mapping to a `User` (e.g. `member` or `vip` keys in context) and `storeId` mapping to a `Store` (e.g. `moonlight-bar` or `velvet-club` keys in context).
    *   `SupportTicket` can reference a registered user via `userId` and/or have an administrator assigned via `assignedAdminId` (mapped to operator/admin keys in context).
    *   `SupportMessage` references a `SupportTicket` via `ticketId` and optionally references a `User` via `senderId` (only set if `senderType` is `USER` or `ADMIN`).
2.  **Upsert strategies**:
    *   For `MemberFavoriteStore`, we will use the primary key `id` (stable UUIDs derived via `seedUuid('favorite-store:${userKey}:${storeSlug}')`), keeping it consistent with `MemberFavoriteCast`.
    *   For `SupportTicket`, we will use `id` (derived via `seedUuid('support-ticket:${fixture.key}')`).
    *   For `SupportMessage`, we will use `id` (derived via `seedUuid('support-message:${ticketKey}:${index}')`).
3.  **Mock data coverage**:
    *   We planned three `MemberFavoriteStore` records linking different users and stores.
    *   We planned three distinct `SupportTicket` scenarios (Closed guest ticket, Active member ticket, Pending VIP ticket) containing logical message threads to exercise the support API lifecycle.

## 3. Caveats
*   This was a read-only investigation. No direct changes have been applied to the code repository files; they are proposed in `analysis.md` and `api-fixtures-seed.patch`.
*   We assumed the seed script environment (NestJS/Prisma) compiles and behaves correctly with our proposed types and schema-generated enums.

## 4. Conclusion
We have completed the exploration and planning of the mock data structure, relationship links, and upsert key strategy. A detailed patch file `api-fixtures-seed.patch` and detailed report `analysis.md` have been generated in the agent's folder `d:\laragon\www\NightLife-VN\.agents\teamwork_preview_explorer_seed_1\`.

## 5. Verification Method
1.  Verify file presence: Ensure `analysis.md` and `api-fixtures-seed.patch` exist in `.agents/teamwork_preview_explorer_seed_1/`.
2.  Inspect contents: Verify `api-fixtures-seed.patch` imports the necessary enums (`SupportSenderType` and `SupportTicketStatus`) and performs correct prisma upserts under `seedApiFixtures`.
3.  Test execution: Apply the patch to the workspace via `git apply .agents/teamwork_preview_explorer_seed_1/api-fixtures-seed.patch` and run `npm run seed` in the `backend` directory to verify syntax correctness and runtime success.
