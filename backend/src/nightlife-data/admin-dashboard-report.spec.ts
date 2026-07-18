import JSZip from 'jszip';

import { buildAdminDashboardReport } from './admin-dashboard-report';

describe('buildAdminDashboardReport', () => {
  it('emits schema-compatible styles without redundant worksheet filters', async () => {
    const generatedAt = new Date('2026-07-18T09:00:00.000Z');
    const store = {
      id: 'store_01',
      name: 'Velvet Club',
      city: 'Hồ Chí Minh',
      category: 'CLUB',
    };
    const buffer = await buildAdminDashboardReport({
      query: { timeframe: 'today', city: 'all', category: 'all' },
      generatedAt,
      startDate: new Date('2026-07-17T17:00:00.000Z'),
      endDate: new Date('2026-07-18T17:00:00.000Z'),
      stores: [store],
      bookings: [
        {
          id: 'booking_01',
          bookingCode: 'BK-TEST01',
          status: 'COMPLETED',
          scheduledAt: generatedAt,
          createdAt: generatedAt,
          partySize: 2,
          subtotalVnd: 1_000_000,
          discountVnd: 100_000,
          totalVnd: 900_000,
          user: { displayName: 'Khách kiểm thử' },
          guest: null,
          store,
          cast: { stageName: 'Aya' },
          coupon: { code: 'TEST10' },
        },
      ],
      bills: [
        {
          id: 'bill_01',
          billNumber: 'BILL-TEST01',
          status: 'PAID',
          usedAt: generatedAt,
          createdAt: generatedAt,
          subtotalVnd: 1_000_000,
          discountVnd: 100_000,
          serviceChargeVnd: 0,
          taxVnd: 0,
          totalVnd: 900_000,
          paidVnd: 900_000,
          commissionAmountVnd: 90_000,
          booking: { bookingCode: 'BK-TEST01' },
          user: { displayName: 'Khách kiểm thử' },
          guest: null,
          store,
          coupon: { code: 'TEST10' },
        },
      ],
    });

    const archive = await JSZip.loadAsync(buffer);
    const stylesXml = await archive.file('xl/styles.xml')!.async('string');
    const workbookXml = await archive.file('xl/workbook.xml')!.async('string');
    const bookingSheetXml = await archive
      .file('xl/worksheets/sheet2.xml')!
      .async('string');
    const billSheetXml = await archive
      .file('xl/worksheets/sheet3.xml')!
      .async('string');
    const storeSheetXml = await archive
      .file('xl/worksheets/sheet4.xml')!
      .async('string');
    const bookingTableXml = await archive
      .file('xl/tables/table1.xml')!
      .async('string');

    const order = new Map(
      ['b', 'i', 'sz', 'color', 'name', 'family', 'charset', 'scheme'].map(
        (name, index) => [name, index],
      ),
    );
    const fontBlocks = Array.from(
      stylesXml.matchAll(/<font>([\s\S]*?)<\/font>/g),
    );
    expect(fontBlocks.length).toBeGreaterThan(1);
    for (const [, children] of fontBlocks) {
      const childNames = Array.from(
        children.matchAll(/<([A-Za-z][\w.-]*)\b[^>]*\/>/g),
        (match) => match[1],
      );
      const positions = childNames.map((name) => order.get(name)!);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    }

    expect(workbookXml).not.toContain('fullCalcOnLoad="1"');
    expect(bookingSheetXml).not.toContain('<autoFilter');
    expect(billSheetXml).not.toContain('<autoFilter');
    expect(storeSheetXml).not.toContain('<autoFilter');
    expect(bookingTableXml).toContain('<autoFilter ref="A5:N6"');
  });
});
