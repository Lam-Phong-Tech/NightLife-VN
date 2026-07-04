import { PrismaClient, Store, Cast, User, Coupon } from '@prisma/client';
import crypto from 'crypto';

/**
 * Seed: Guests, Bookings, Bills, PointLedgers
 *
 * Creates realistic transactional data:
 *   - 10 guests (walk-in customers without accounts)
 *   - 20 bookings across stores (mix of USER + GUEST, various statuses)
 *   - 12 bills tied to COMPLETED bookings (PAID status)
 *   - PointLedger entries for bills that earned points
 */

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function billNumber(storeSlug: string, idx: number): string {
  const prefix = storeSlug.slice(0, 4).toUpperCase().replace(/-/g, '');
  const date = new Date();
  const yyyymm = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  return `${prefix}-${yyyymm}-${String(idx).padStart(4, '0')}`;
}

function qrCode(bookingIdx: number): string {
  return crypto.createHash('sha256')
    .update(`QR-BOOKING-SEED-${bookingIdx}-${Date.now()}`)
    .digest('hex')
    .slice(0, 32)
    .toUpperCase();
}

function qrHash(code: string): string {
  return crypto.createHash('sha256').update(`HASH-${code}`).digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// GUEST DATA
// ─────────────────────────────────────────────────────────────────────────────
interface GuestSeed {
  key: string;
  displayName: string;
  phone: string;
  email: string;
  note?: string;
}

const GUESTS: GuestSeed[] = [
  { key: 'g1', displayName: 'Tanaka Hiroshi', phone: '+81801234001', email: 'tanaka.h@guest.nightlife.vn', note: 'Prefers private booth' },
  { key: 'g2', displayName: 'Suzuki Yuki',    phone: '+81801234002', email: 'suzuki.y@guest.nightlife.vn', note: 'First visit from Japan' },
  { key: 'g3', displayName: 'Trần Minh Đức',  phone: '+84901234003', email: 'minhduc@guest.nightlife.vn', note: 'Regular weekend guest' },
  { key: 'g4', displayName: 'Nguyễn Thu Hà',  phone: '+84901234004', email: 'thuha@guest.nightlife.vn', note: 'Birthday celebration' },
  { key: 'g5', displayName: 'Watanabe Kenji',  phone: '+81901234005', email: 'watanabe.k@guest.nightlife.vn', note: 'Business entertainment' },
  { key: 'g6', displayName: 'Lê Hoàng Nam',   phone: '+84911234006', email: 'hoangnam@guest.nightlife.vn' },
  { key: 'g7', displayName: 'Sato Akiko',      phone: '+81701234007', email: 'sato.a@guest.nightlife.vn', note: 'VIP table request' },
  { key: 'g8', displayName: 'Phạm Quang Huy',  phone: '+84921234008', email: 'quanghuy@guest.nightlife.vn' },
  { key: 'g9', displayName: 'Yamamoto Ren',    phone: '+81801234009', email: 'yamamoto.r@guest.nightlife.vn', note: 'Saké only' },
  { key: 'g10', displayName: 'Đỗ Thị Lan',    phone: '+84931234010', email: 'thilan@guest.nightlife.vn', note: 'Cocktail lover' },
];

// ─────────────────────────────────────────────────────────────────────────────
// BOOKING DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────
interface BookingSeed {
  idx: number;
  storeSlug: string;
  castSlug?: string;
  userKey?: string;   // user from seedUsers (e.g. 'member', 'vip')
  guestKey?: string;  // guest from GUESTS
  status: 'REQUESTED' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  scheduledDaysOffset: number; // negative = past, positive = future
  partySize: number;
  note?: string;
  subtotalVnd: number;
  discountVnd: number;
  totalVnd: number;
  withBill?: boolean;   // create a PAID bill for this booking
  withQr?: boolean;     // create a QR code
}

const BOOKINGS: BookingSeed[] = [
  // ── Past COMPLETED bookings (generate bills) ─────────────────────
  {
    idx: 1,
    storeSlug: 'moonlight-bar',
    castSlug: 'sakura-moonlight',
    userKey: 'member',
    status: 'COMPLETED',
    scheduledDaysOffset: -15,
    partySize: 2,
    note: 'Anniversary dinner, please prepare flowers',
    subtotalVnd: 1800000,
    discountVnd: 144000,
    totalVnd: 1656000,
    withBill: true,
    withQr: true,
  },
  {
    idx: 2,
    storeSlug: 'velvet-club',
    castSlug: 'aya-velvet',
    userKey: 'vip',
    status: 'COMPLETED',
    scheduledDaysOffset: -12,
    partySize: 4,
    note: 'VIP table with champagne tower',
    subtotalVnd: 5200000,
    discountVnd: 520000,
    totalVnd: 4680000,
    withBill: true,
    withQr: true,
  },
  {
    idx: 3,
    storeSlug: 'sakura-lounge',
    castSlug: 'yuki-sakura-lounge',
    guestKey: 'g1',
    status: 'COMPLETED',
    scheduledDaysOffset: -10,
    partySize: 2,
    note: 'Business meeting setup preferred',
    subtotalVnd: 2400000,
    discountVnd: 0,
    totalVnd: 2400000,
    withBill: true,
    withQr: true,
  },
  {
    idx: 4,
    storeSlug: 'golden-voice-ktv',
    castSlug: 'mai-golden',
    guestKey: 'g3',
    status: 'COMPLETED',
    scheduledDaysOffset: -8,
    partySize: 6,
    note: 'Birthday party karaoke',
    subtotalVnd: 3600000,
    discountVnd: 100000,
    totalVnd: 3500000,
    withBill: true,
    withQr: true,
  },
  {
    idx: 5,
    storeSlug: 'hanami-dining',
    castSlug: 'kaori-hanami',
    guestKey: 'g5',
    status: 'COMPLETED',
    scheduledDaysOffset: -7,
    partySize: 3,
    note: 'Business entertainment, quiet table',
    subtotalVnd: 4200000,
    discountVnd: 0,
    totalVnd: 4200000,
    withBill: true,
  },
  {
    idx: 6,
    storeSlug: 'crimson-bar',
    castSlug: 'misaki-crimson',
    userKey: 'member',
    status: 'COMPLETED',
    scheduledDaysOffset: -5,
    partySize: 2,
    note: 'Jazz night request',
    subtotalVnd: 1500000,
    discountVnd: 120000,
    totalVnd: 1380000,
    withBill: true,
    withQr: true,
  },
  {
    idx: 7,
    storeSlug: 'neon-club',
    castSlug: 'yuna-neon',
    guestKey: 'g7',
    status: 'COMPLETED',
    scheduledDaysOffset: -4,
    partySize: 5,
    note: 'VIP booth + bottle service',
    subtotalVnd: 6800000,
    discountVnd: 0,
    totalVnd: 6800000,
    withBill: true,
    withQr: true,
  },
  {
    idx: 8,
    storeSlug: 'tokyo-kitchen',
    castSlug: 'kotone-tokyo',
    guestKey: 'g9',
    status: 'COMPLETED',
    scheduledDaysOffset: -3,
    partySize: 4,
    note: 'Sake pairing menu please',
    subtotalVnd: 3800000,
    discountVnd: 0,
    totalVnd: 3800000,
    withBill: true,
  },
  {
    idx: 9,
    storeSlug: 'dragon-rooftop-da-nang',
    castSlug: 'lina-dragon-rooftop',
    guestKey: 'g4',
    status: 'COMPLETED',
    scheduledDaysOffset: -6,
    partySize: 8,
    note: 'Birthday celebration, cake arranged',
    subtotalVnd: 7200000,
    discountVnd: 200000,
    totalVnd: 7000000,
    withBill: true,
    withQr: true,
  },
  {
    idx: 10,
    storeSlug: 'lotus-massage-spa',
    castSlug: 'sumi-lotus-massage-spa',
    guestKey: 'g10',
    status: 'COMPLETED',
    scheduledDaysOffset: -2,
    partySize: 1,
    note: 'Late night wellness package',
    subtotalVnd: 1200000,
    discountVnd: 0,
    totalVnd: 1200000,
    withBill: true,
  },
  {
    idx: 11,
    storeSlug: 'jade-lounge',
    castSlug: 'akari-jade',
    guestKey: 'g2',
    status: 'COMPLETED',
    scheduledDaysOffset: -9,
    partySize: 2,
    note: 'Wine pairing, Hoàn Kiếm view table',
    subtotalVnd: 3200000,
    discountVnd: 0,
    totalVnd: 3200000,
    withBill: true,
    withQr: true,
  },
  {
    idx: 12,
    storeSlug: 'star-ktv',
    castSlug: 'erika-star',
    guestKey: 'g6',
    status: 'COMPLETED',
    scheduledDaysOffset: -11,
    partySize: 5,
    note: 'Company outing karaoke night',
    subtotalVnd: 4500000,
    discountVnd: 0,
    totalVnd: 4500000,
    withBill: true,
  },

  // ── Upcoming CONFIRMED bookings ──────────────────────────────────
  {
    idx: 13,
    storeSlug: 'moonlight-bar',
    castSlug: 'miyuki-moonlight',
    userKey: 'vip',
    status: 'CONFIRMED',
    scheduledDaysOffset: 3,
    partySize: 2,
    note: 'Quiet corner please',
    subtotalVnd: 2000000,
    discountVnd: 200000,
    totalVnd: 1800000,
    withQr: true,
  },
  {
    idx: 14,
    storeSlug: 'sakura-lounge',
    castSlug: 'hana-sakura-lounge',
    guestKey: 'g8',
    status: 'CONFIRMED',
    scheduledDaysOffset: 5,
    partySize: 3,
    subtotalVnd: 2700000,
    discountVnd: 0,
    totalVnd: 2700000,
    withQr: true,
  },
  {
    idx: 15,
    storeSlug: 'velvet-club',
    castSlug: 'rina-velvet',
    userKey: 'member',
    status: 'CONFIRMED',
    scheduledDaysOffset: 7,
    partySize: 4,
    note: 'EDM night birthday party',
    subtotalVnd: 4800000,
    discountVnd: 384000,
    totalVnd: 4416000,
    withQr: true,
  },

  // ── REQUESTED (pending) ──────────────────────────────────────────
  {
    idx: 16,
    storeSlug: 'crimson-bar',
    guestKey: 'g2',
    status: 'REQUESTED',
    scheduledDaysOffset: 2,
    partySize: 2,
    note: 'First time visiting Hanoi',
    subtotalVnd: 1600000,
    discountVnd: 0,
    totalVnd: 1600000,
  },
  {
    idx: 17,
    storeSlug: 'harbor-ktv-hai-phong',
    castSlug: 'mika-harbor-ktv',
    userKey: 'member',
    status: 'REQUESTED',
    scheduledDaysOffset: 4,
    partySize: 6,
    subtotalVnd: 3000000,
    discountVnd: 240000,
    totalVnd: 2760000,
  },

  // ── CANCELLED ────────────────────────────────────────────────────
  {
    idx: 18,
    storeSlug: 'hanami-dining',
    guestKey: 'g6',
    status: 'CANCELLED',
    scheduledDaysOffset: -1,
    partySize: 2,
    note: 'Change of plans',
    subtotalVnd: 2000000,
    discountVnd: 0,
    totalVnd: 2000000,
  },

  // ── NO_SHOW ──────────────────────────────────────────────────────
  {
    idx: 19,
    storeSlug: 'son-tra-lounge',
    guestKey: 'g8',
    status: 'NO_SHOW',
    scheduledDaysOffset: -2,
    partySize: 2,
    subtotalVnd: 1800000,
    discountVnd: 0,
    totalVnd: 1800000,
  },

  // ── CHECKED_IN (currently at venue) ─────────────────────────────
  {
    idx: 20,
    storeSlug: 'opera-spa-hai-phong',
    castSlug: 'yuri-opera-spa',
    guestKey: 'g10',
    status: 'CHECKED_IN',
    scheduledDaysOffset: 0,
    partySize: 1,
    note: 'Sauna + full body massage',
    subtotalVnd: 1400000,
    discountVnd: 0,
    totalVnd: 1400000,
    withQr: true,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export async function seedBookingsAndBills(
  prisma: PrismaClient,
  stores: Record<string, Store>,
  casts: Record<string, Cast>,
  users: Record<string, { id: string }>,
): Promise<void> {
  console.log('  📅 Seeding guests, bookings, bills & point ledgers...');

  // 1. Create Guests
  const guestMap: Record<string, string> = {}; // key → id
  for (const g of GUESTS) {
    let guest = await prisma.guest.findFirst({ where: { email: g.email } });
    if (guest) {
      guest = await prisma.guest.update({
        where: { id: guest.id },
        data: { displayName: g.displayName, phone: g.phone, note: g.note ?? null },
      });
    } else {
      guest = await prisma.guest.create({
        data: {
          displayName: g.displayName,
          phone: g.phone,
          email: g.email,
          note: g.note ?? null,
          status: 'ACTIVE',
        },
      });
    }
    guestMap[g.key] = guest.id;
  }
  console.log(`     ✓ ${GUESTS.length} guests`);

  // 2. Create Bookings + optional BookingQr + Bills + PointLedgers
  let bookingCount = 0;
  let billCount = 0;
  let pointCount = 0;
  let qrCount = 0;

  for (const b of BOOKINGS) {
    const storeId = stores[b.storeSlug]?.id;
    if (!storeId) {
      console.warn(`     ⚠ Store not found for booking idx ${b.idx}: ${b.storeSlug}`);
      continue;
    }

    const castId  = b.castSlug  ? (casts[b.castSlug]?.id ?? null)  : null;
    const userId  = b.userKey   ? (users[b.userKey]?.id ?? null)    : null;
    const guestId = b.guestKey  ? (guestMap[b.guestKey] ?? null)    : null;

    const scheduledAt = b.scheduledDaysOffset >= 0
      ? daysFromNow(b.scheduledDaysOffset)
      : daysAgo(Math.abs(b.scheduledDaysOffset));

    // Use a deterministic field to identify existing seed bookings
    // We use note + storeId + scheduledAt approach but since upsert needs unique,
    // we'll just create (skip if already exists via try/catch pattern).
    // The seed is idempotent via the billNumber unique constraint downstream.
    let booking: { id: string };
    try {
      booking = await prisma.booking.create({
        data: {
          storeId,
          castId,
          userId,
          guestId,
          status: b.status,
          scheduledAt,
          partySize: b.partySize,
          note: b.note ?? null,
          subtotalVnd: b.subtotalVnd,
          discountVnd: b.discountVnd,
          totalVnd: b.totalVnd,
          cancelledAt: b.status === 'CANCELLED' ? daysAgo(Math.abs(b.scheduledDaysOffset)) : null,
        },
      });
      bookingCount++;
    } catch {
      // Booking already exists (re-run seed), skip
      continue;
    }

    // 3. BookingQr for confirmed/checked_in/completed bookings
    if (b.withQr) {
      const code = qrCode(b.idx);
      const hash = qrHash(code);
      try {
        await prisma.bookingQr.create({
          data: {
            bookingId: booking.id,
            storeId,
            code,
            qrPayloadHash: hash,
            discountSnapshot: { discountVnd: b.discountVnd, discountPct: b.discountVnd > 0 ? Math.round((b.discountVnd / b.subtotalVnd) * 100) : 0 },
            validFrom: scheduledAt,
            expiresAt: new Date(scheduledAt.getTime() + 6 * 60 * 60 * 1000), // 6h window
            status: b.status === 'COMPLETED' ? 'USED' : (b.status === 'CANCELLED' ? 'REVOKED' : 'ACTIVE'),
            usedAt: b.status === 'COMPLETED' ? scheduledAt : null,
          },
        });
        qrCount++;
      } catch { /* already exists */ }
    }

    // 4. Bill for COMPLETED bookings
    if (b.withBill && b.status === 'COMPLETED') {
      const bn = billNumber(b.storeSlug, b.idx);
      const serviceCharge = Math.round(b.totalVnd * 0.05);
      const tax           = Math.round(b.totalVnd * 0.10);
      const grandTotal    = b.totalVnd + serviceCharge + tax;
      const commPct       = 15; // 15% platform commission
      const commAmt       = Math.round(grandTotal * commPct / 100);
      const pointsEarned  = Math.floor(grandTotal / 100000); // 1 pt per 100k

      let bill: { id: string } | null = null;
      try {
        bill = await prisma.bill.create({
          data: {
            bookingId:    booking.id,
            storeId,
            userId,
            guestId,
            billNumber:   bn,
            status:       'PAID',
            submitterType: userId ? 'MEMBER' : 'PARTNER',
            subtotalVnd:  b.subtotalVnd,
            discountVnd:  b.discountVnd,
            serviceChargeVnd: serviceCharge,
            taxVnd:       tax,
            totalVnd:     grandTotal,
            paidVnd:      grandTotal,
            commissionAmountVnd: commAmt,
            pointsEarned: userId ? pointsEarned : 0,
            commissionRuleSnapshot: { type: 'PERCENT', value: commPct, basis: 'GRAND_TOTAL' },
            pointRuleSnapshot: { rate: 0.0001, basis: 'GRAND_TOTAL' },
            submittedAt:  scheduledAt,
            verifiedAt:   new Date(scheduledAt.getTime() + 30 * 60 * 1000),
            paidAt:       new Date(scheduledAt.getTime() + 60 * 60 * 1000),
          },
        });
        billCount++;
      } catch { /* billNumber already unique — skip */ }

      // 5. PointLedger for member user bookings that earned points
      if (bill && userId && pointsEarned > 0) {
        const prevLedger = await prisma.pointLedger.findFirst({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
        const prevBalance = prevLedger?.balanceAfter ?? 0;
        try {
          await prisma.pointLedger.create({
            data: {
              userId,
              bookingId: booking.id,
              billId:    bill.id,
              type:      'EARN',
              status:    'POSTED',
              amountVnd: grandTotal,
              points:    pointsEarned,
              balanceAfter: prevBalance + pointsEarned,
              description: `Earned ${pointsEarned} pts from booking at ${b.storeSlug}`,
              ruleSnapshot: { rate: 0.0001, basis: 'GRAND_TOTAL' },
              postedAt:  new Date(scheduledAt.getTime() + 65 * 60 * 1000),
            },
          });
          pointCount++;
        } catch { /* already exists */ }
      }
    }
  }

  console.log(`     ✓ ${bookingCount} bookings (${BOOKINGS.filter(b => b.status === 'COMPLETED').length} completed, ${BOOKINGS.filter(b => b.status === 'CONFIRMED').length} confirmed, ${BOOKINGS.filter(b => b.status === 'REQUESTED').length} requested)`);
  console.log(`     ✓ ${billCount} bills (all PAID with service charge + tax + commission)`);
  console.log(`     ✓ ${qrCount} booking QR codes`);
  console.log(`     ✓ ${pointCount} point ledger entries`);
}
