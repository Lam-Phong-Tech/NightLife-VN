import ExcelJS from 'exceljs';
import JSZip from 'jszip';

export type AdminDashboardReportQuery = {
  timeframe?: string;
  city?: string;
  category?: string;
};

export type AdminDashboardReportStore = {
  id: string;
  name: string;
  city: string;
  category: string;
};

export type AdminDashboardReportBooking = {
  id: string;
  bookingCode: string;
  status: string;
  scheduledAt: Date;
  createdAt: Date;
  partySize: number;
  subtotalVnd: number;
  discountVnd: number;
  totalVnd: number;
  user: { displayName: string | null } | null;
  guest: { displayName: string | null } | null;
  store: AdminDashboardReportStore;
  cast: { stageName: string } | null;
  coupon: { code: string } | null;
};

export type AdminDashboardReportBill = {
  id: string;
  billNumber: string | null;
  status: string;
  usedAt: Date | null;
  createdAt: Date;
  subtotalVnd: number;
  discountVnd: number;
  serviceChargeVnd: number;
  taxVnd: number;
  totalVnd: number;
  paidVnd: number;
  commissionAmountVnd: number;
  booking: { bookingCode: string } | null;
  user: { displayName: string | null } | null;
  guest: { displayName: string | null } | null;
  store: AdminDashboardReportStore;
  coupon: { code: string } | null;
};

export type AdminDashboardReportInput = {
  query: AdminDashboardReportQuery;
  generatedAt: Date;
  startDate: Date;
  endDate: Date;
  stores: AdminDashboardReportStore[];
  bookings: AdminDashboardReportBooking[];
  bills: AdminDashboardReportBill[];
  bookingsTruncated?: boolean;
  billsTruncated?: boolean;
};

const COLORS = {
  ink: 'FF17130D',
  charcoal: 'FF24211D',
  gold: 'FFD4B26A',
  goldLight: 'FFF4E3B4',
  cream: 'FFFFFBF2',
  sand: 'FFF6F0E4',
  muted: 'FF756F65',
  white: 'FFFFFFFF',
  green: 'FFE4F4EA',
  greenText: 'FF237A4B',
  blue: 'FFE7F0FB',
  blueText: 'FF2D68A7',
  amber: 'FFFFF0D0',
  amberText: 'FF9A6114',
  red: 'FFFBE5E5',
  redText: 'FFB23B3B',
  gray: 'FFF0EEE9',
  grayText: 'FF625E57',
  border: 'FFE3DCCE',
};

const fill = (argb: string): ExcelJS.FillPattern => ({
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb },
});

const border: Partial<ExcelJS.Borders> = {
  bottom: { style: 'thin', color: { argb: COLORS.border } },
};

const bookingStatusLabels: Record<string, string> = {
  REQUESTED: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  CHECKED_IN: 'Đã check-in',
  COMPLETED: 'Hoàn tất',
  CANCELLED: 'Đã hủy',
  NO_SHOW: 'Không đến',
};

const billStatusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  SUBMITTED: 'Chờ duyệt',
  PENDING_PM_BA: 'Chờ duyệt',
  VERIFIED: 'Đã xác minh',
  REJECTED: 'Từ chối',
  PAID: 'Đã thanh toán',
  VOIDED: 'Đã hủy',
};

const categoryLabels: Record<string, string> = {
  BAR: 'Bar',
  CLUB: 'Club',
  LOUNGE: 'Lounge',
  GIRLS_BAR: 'Girls bar',
  KARAOKE: 'Karaoke',
  MASSAGE_SPA: 'Massage & Spa',
  RESTAURANT: 'Nhà hàng',
  CASINO: 'Casino',
};

const timeframeLabels: Record<string, string> = {
  today: 'Hôm nay',
  week: '7 ngày gần nhất',
  month: 'Tháng này',
};

const currencyFormat = '#,##0" ₫"';
const dateFormat = 'dd/mm/yyyy';
const dateTimeFormat = 'dd/mm/yyyy hh:mm';

const fontChildOrder = new Map(
  [
    'b',
    'i',
    'strike',
    'outline',
    'shadow',
    'condense',
    'extend',
    'sz',
    'color',
    'name',
    'family',
    'charset',
    'scheme',
  ].map((name, index) => [name, index]),
);

const canonicalizeFontChildren = (stylesXml: string) =>
  stylesXml.replace(/<font>([\s\S]*?)<\/font>/g, (fontXml, children: string) => {
    const tagPattern = /<([A-Za-z][\w.-]*)\b[^>]*\/>/g;
    const tags = Array.from(children.matchAll(tagPattern)).map(
      (match, index) => ({
        xml: match[0],
        name: match[1],
        index,
      }),
    );
    const residue = children.replace(tagPattern, '').trim();

    if (
      residue ||
      !tags.length ||
      tags.some((tag) => !fontChildOrder.has(tag.name))
    ) {
      return fontXml;
    }

    tags.sort(
      (left, right) =>
        fontChildOrder.get(left.name)! - fontChildOrder.get(right.name)! ||
        left.index - right.index,
    );
    return `<font>${tags.map((tag) => tag.xml).join('')}</font>`;
  });

const normalizeExcelStyles = async (buffer: Buffer) => {
  const archive = await JSZip.loadAsync(buffer);
  const stylesPart = archive.file('xl/styles.xml');
  if (!stylesPart) {
    throw new Error('Generated Excel report is missing xl/styles.xml');
  }

  const stylesXml = await stylesPart.async('string');
  const normalizedStylesXml = canonicalizeFontChildren(stylesXml);
  archive.file('xl/styles.xml', normalizedStylesXml);

  return archive.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
};

const toDateOnly = (value: Date) =>
  new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));

const toExcelDateTime = (value: Date) =>
  new Date(
    Date.UTC(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      value.getHours(),
      value.getMinutes(),
      value.getSeconds(),
    ),
  );

const dateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;

const customerName = (
  user: { displayName: string | null } | null,
  guest: { displayName: string | null } | null,
) => user?.displayName || guest?.displayName || 'Khách vãng lai';

const statusStyle = (status: string) => {
  if (['COMPLETED', 'VERIFIED', 'PAID'].includes(status)) {
    return { fill: COLORS.green, font: COLORS.greenText };
  }
  if (['CONFIRMED', 'CHECKED_IN'].includes(status)) {
    return { fill: COLORS.blue, font: COLORS.blueText };
  }
  if (['REQUESTED', 'SUBMITTED', 'PENDING_PM_BA'].includes(status)) {
    return { fill: COLORS.amber, font: COLORS.amberText };
  }
  if (['CANCELLED', 'NO_SHOW', 'REJECTED', 'VOIDED'].includes(status)) {
    return { fill: COLORS.red, font: COLORS.redText };
  }
  return { fill: COLORS.gray, font: COLORS.grayText };
};

const applySheetHeader = (
  sheet: ExcelJS.Worksheet,
  lastColumn: string,
  title: string,
  subtitle: string,
) => {
  sheet.mergeCells(`A1:${lastColumn}2`);
  const titleCell = sheet.getCell('A1');
  titleCell.value = title;
  titleCell.fill = fill(COLORS.ink);
  titleCell.font = {
    name: 'Aptos Display',
    size: 20,
    bold: true,
    color: { argb: COLORS.goldLight },
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  sheet.mergeCells(`A3:${lastColumn}3`);
  const subtitleCell = sheet.getCell('A3');
  subtitleCell.value = subtitle;
  subtitleCell.fill = fill(COLORS.sand);
  subtitleCell.font = {
    name: 'Aptos',
    size: 10,
    color: { argb: COLORS.muted },
  };
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' };

  sheet.getRow(1).height = 25;
  sheet.getRow(2).height = 14;
  sheet.getRow(3).height = 24;
  sheet.getRow(4).height = 9;
  sheet.views = [{ state: 'frozen', ySplit: 5, showGridLines: false }];
  sheet.pageSetup = {
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    margins: {
      left: 0.3,
      right: 0.3,
      top: 0.5,
      bottom: 0.5,
      header: 0.2,
      footer: 0.2,
    },
  };
  sheet.headerFooter.oddFooter = '&LNightLife VN&CTrang &P / &N&RNgày xuất: &D';
};

const applyTableHeader = (row: ExcelJS.Row) => {
  row.height = 30;
  row.eachCell((cell) => {
    cell.fill = fill(COLORS.charcoal);
    cell.font = {
      name: 'Aptos',
      size: 10,
      bold: true,
      color: { argb: COLORS.goldLight },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = border;
  });
};

const applyBodyRows = (
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  lastColumn: number,
) => {
  if (endRow < startRow) return;
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    row.height = 23;
    for (let column = 1; column <= lastColumn; column += 1) {
      const cell = row.getCell(column);
      cell.font = { name: 'Aptos', size: 10, color: { argb: COLORS.ink } };
      cell.alignment = { vertical: 'middle' };
      cell.border = border;
      if (rowNumber % 2 === 0) cell.fill = fill(COLORS.cream);
    }
  }
};

const addNoDataRow = (
  sheet: ExcelJS.Worksheet,
  lastColumn: string,
  message: string,
) => {
  sheet.mergeCells(`A6:${lastColumn}6`);
  const cell = sheet.getCell('A6');
  cell.value = message;
  cell.font = {
    name: 'Aptos',
    size: 11,
    italic: true,
    color: { argb: COLORS.muted },
  };
  cell.alignment = { horizontal: 'center', vertical: 'middle' };
  cell.fill = fill(COLORS.cream);
  cell.border = border;
  sheet.getRow(6).height = 34;
};

const reportFilterLabel = (
  input: Pick<
    AdminDashboardReportInput,
    'query' | 'generatedAt' | 'startDate' | 'endDate'
  >,
) => {
  const timeframe =
    timeframeLabels[input.query.timeframe || 'today'] || 'Tùy chọn';
  const city =
    !input.query.city || input.query.city === 'all'
      ? 'Tất cả khu vực'
      : input.query.city;
  const category =
    !input.query.category || input.query.category === 'all'
      ? 'Tất cả loại hình'
      : categoryLabels[input.query.category.toUpperCase()] ||
        input.query.category;
  const endInclusive = new Date(input.endDate.getTime() - 1);
  return `${timeframe} · ${input.startDate.toLocaleDateString('vi-VN')} – ${endInclusive.toLocaleDateString('vi-VN')} · ${city} · ${category} · Xuất lúc ${input.generatedAt.toLocaleString('vi-VN')}`;
};

const writeDetailSheets = (
  workbook: ExcelJS.Workbook,
  input: AdminDashboardReportInput,
  subtitle: string,
) => {
  const bookingSheet = workbook.addWorksheet('Booking', {
    properties: { tabColor: { argb: COLORS.gold } },
  });
  applySheetHeader(
    bookingSheet,
    'N',
    'CHI TIẾT BOOKING',
    `${subtitle}${input.bookingsTruncated ? ' · Dữ liệu đã chạm giới hạn xuất.' : ''}`,
  );
  bookingSheet.columns = [
    { key: 'code', width: 17 },
    { key: 'date', width: 13 },
    { key: 'time', width: 10 },
    { key: 'store', width: 28 },
    { key: 'city', width: 20 },
    { key: 'category', width: 16 },
    { key: 'customer', width: 23 },
    { key: 'cast', width: 20 },
    { key: 'partySize', width: 10 },
    { key: 'status', width: 17 },
    { key: 'coupon', width: 16 },
    { key: 'subtotal', width: 17 },
    { key: 'discount', width: 17 },
    { key: 'total', width: 18 },
  ];
  const bookingHeaders = [
    'Mã booking',
    'Ngày',
    'Giờ',
    'Quán',
    'Thành phố',
    'Loại hình',
    'Khách hàng',
    'Cast',
    'Số khách',
    'Trạng thái',
    'Coupon',
    'Tạm tính',
    'Giảm giá',
    'Tổng sau giảm',
  ];
  bookingSheet.getRow(5).values = bookingHeaders;
  applyTableHeader(bookingSheet.getRow(5));

  if (input.bookings.length) {
    bookingSheet.addTable({
      name: 'BookingData',
      ref: 'A5',
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: bookingHeaders.map((name) => ({ name })),
      rows: input.bookings.map((booking) => [
        booking.bookingCode || booking.id.slice(0, 8),
        toDateOnly(booking.scheduledAt),
        toExcelDateTime(booking.scheduledAt),
        booking.store.name,
        booking.store.city,
        categoryLabels[booking.store.category] || booking.store.category,
        customerName(booking.user, booking.guest),
        booking.cast?.stageName || '—',
        booking.partySize || 1,
        bookingStatusLabels[booking.status] || booking.status,
        booking.coupon?.code || '—',
        booking.subtotalVnd,
        booking.discountVnd,
        booking.totalVnd,
      ]),
    });
    applyTableHeader(bookingSheet.getRow(5));
    applyBodyRows(bookingSheet, 6, 5 + input.bookings.length, 14);
    for (let index = 0; index < input.bookings.length; index += 1) {
      const rowNumber = index + 6;
      const statusCell = bookingSheet.getCell(`J${rowNumber}`);
      const colors = statusStyle(input.bookings[index].status);
      statusCell.fill = fill(colors.fill);
      statusCell.font = {
        name: 'Aptos',
        size: 10,
        bold: true,
        color: { argb: colors.font },
      };
    }
  } else {
    addNoDataRow(bookingSheet, 'N', 'Không có booking trong kỳ báo cáo.');
  }
  bookingSheet.getColumn(2).numFmt = dateFormat;
  bookingSheet.getColumn(3).numFmt = 'hh:mm';
  [12, 13, 14].forEach((column) => {
    bookingSheet.getColumn(column).numFmt = currencyFormat;
  });
  bookingSheet.getColumn(9).alignment = { horizontal: 'center' };
  const billSheet = workbook.addWorksheet('Hóa đơn', {
    properties: { tabColor: { argb: COLORS.greenText } },
  });
  applySheetHeader(
    billSheet,
    'N',
    'CHI TIẾT HÓA ĐƠN',
    `${subtitle}${input.billsTruncated ? ' · Dữ liệu đã chạm giới hạn xuất.' : ''}`,
  );
  billSheet.columns = [
    { key: 'billNumber', width: 18 },
    { key: 'bookingCode', width: 17 },
    { key: 'usedAt', width: 20 },
    { key: 'store', width: 28 },
    { key: 'customer', width: 23 },
    { key: 'status', width: 18 },
    { key: 'subtotal', width: 17 },
    { key: 'discount', width: 17 },
    { key: 'serviceCharge', width: 15 },
    { key: 'tax', width: 15 },
    { key: 'total', width: 18 },
    { key: 'paid', width: 18 },
    { key: 'commission', width: 18 },
    { key: 'coupon', width: 16 },
  ];
  const billHeaders = [
    'Mã hóa đơn',
    'Mã booking',
    'Ngày sử dụng',
    'Quán',
    'Khách hàng',
    'Trạng thái',
    'Tạm tính',
    'Giảm giá',
    'Phí dịch vụ',
    'Thuế',
    'Tổng hóa đơn',
    'Đã thanh toán',
    'Hoa hồng',
    'Coupon',
  ];
  billSheet.getRow(5).values = billHeaders;
  applyTableHeader(billSheet.getRow(5));
  if (input.bills.length) {
    billSheet.addTable({
      name: 'BillData',
      ref: 'A5',
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: billHeaders.map((name) => ({ name })),
      rows: input.bills.map((bill) => [
        bill.billNumber || bill.id.slice(0, 8),
        bill.booking?.bookingCode || '—',
        toExcelDateTime(bill.usedAt || bill.createdAt),
        bill.store.name,
        customerName(bill.user, bill.guest),
        billStatusLabels[bill.status] || bill.status,
        bill.subtotalVnd,
        bill.discountVnd,
        bill.serviceChargeVnd,
        bill.taxVnd,
        bill.totalVnd,
        bill.paidVnd,
        bill.commissionAmountVnd,
        bill.coupon?.code || '—',
      ]),
    });
    applyTableHeader(billSheet.getRow(5));
    applyBodyRows(billSheet, 6, 5 + input.bills.length, 14);
    for (let index = 0; index < input.bills.length; index += 1) {
      const rowNumber = index + 6;
      const statusCell = billSheet.getCell(`F${rowNumber}`);
      const colors = statusStyle(input.bills[index].status);
      statusCell.fill = fill(colors.fill);
      statusCell.font = {
        name: 'Aptos',
        size: 10,
        bold: true,
        color: { argb: colors.font },
      };
    }
  } else {
    addNoDataRow(billSheet, 'N', 'Không có hóa đơn trong kỳ báo cáo.');
  }
  billSheet.getColumn(3).numFmt = dateTimeFormat;
  [7, 8, 9, 10, 11, 12, 13].forEach((column) => {
    billSheet.getColumn(column).numFmt = currencyFormat;
  });
  return { bookingSheet, billSheet };
};

const writeStoreSheet = (
  workbook: ExcelJS.Workbook,
  input: AdminDashboardReportInput,
  subtitle: string,
) => {
  const sheet = workbook.addWorksheet('Theo quán', {
    properties: { tabColor: { argb: COLORS.blueText } },
  });
  applySheetHeader(sheet, 'L', 'HIỆU SUẤT THEO QUÁN', subtitle);
  sheet.columns = [
    { width: 28 },
    { width: 20 },
    { width: 16 },
    { width: 12 },
    { width: 12 },
    { width: 12 },
    { width: 16 },
    { width: 14 },
    { width: 19 },
    { width: 17 },
    { width: 18 },
    { width: 20 },
  ];
  const headers = [
    'Quán',
    'Thành phố',
    'Loại hình',
    'Booking',
    'Số khách',
    'Hoàn tất',
    'Tỷ lệ hoàn tất',
    'Hủy / No-show',
    'Doanh thu',
    'Giảm giá',
    'Hoa hồng',
    'Hóa đơn trung bình',
  ];
  sheet.getRow(5).values = headers;
  applyTableHeader(sheet.getRow(5));

  const verifiedBillStatuses = new Set(['VERIFIED', 'PAID']);
  const rows = input.stores
    .map((store) => {
      const bookings = input.bookings.filter(
        (booking) => booking.store.id === store.id,
      );
      const bills = input.bills.filter(
        (bill) =>
          bill.store.id === store.id && verifiedBillStatuses.has(bill.status),
      );
      const completed = bookings.filter(
        (booking) => booking.status === 'COMPLETED',
      ).length;
      const cancelled = bookings.filter((booking) =>
        ['CANCELLED', 'NO_SHOW'].includes(booking.status),
      ).length;
      const revenue = bills.reduce((sum, bill) => sum + bill.totalVnd, 0);
      return {
        store,
        bookings: bookings.length,
        guests: bookings.reduce(
          (sum, booking) => sum + (booking.partySize || 1),
          0,
        ),
        completed,
        completionRate: bookings.length ? completed / bookings.length : 0,
        cancelled,
        revenue,
        discount: bills.reduce((sum, bill) => sum + bill.discountVnd, 0),
        commission: bills.reduce(
          (sum, bill) => sum + bill.commissionAmountVnd,
          0,
        ),
        averageBill: bills.length ? revenue / bills.length : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings);

  if (rows.length) {
    sheet.addTable({
      name: 'StorePerformance',
      ref: 'A5',
      headerRow: true,
      totalsRow: false,
      style: { theme: 'TableStyleMedium2', showRowStripes: true },
      columns: headers.map((name) => ({ name })),
      rows: rows.map((row) => [
        row.store.name,
        row.store.city,
        categoryLabels[row.store.category] || row.store.category,
        row.bookings,
        row.guests,
        row.completed,
        row.completionRate,
        row.cancelled,
        row.revenue,
        row.discount,
        row.commission,
        row.averageBill,
      ]),
    });
    applyTableHeader(sheet.getRow(5));
    applyBodyRows(sheet, 6, 5 + rows.length, 12);
  } else {
    addNoDataRow(sheet, 'L', 'Không có quán phù hợp với bộ lọc.');
  }

  sheet.getColumn(7).numFmt = '0.0%';
  [9, 10, 11, 12].forEach((column) => {
    sheet.getColumn(column).numFmt = currencyFormat;
  });
  return { sheet, rows };
};

const writeOverviewSheet = (
  sheet: ExcelJS.Worksheet,
  input: AdminDashboardReportInput,
  subtitle: string,
  storeRows: ReturnType<typeof writeStoreSheet>['rows'],
) => {
  applySheetHeader(sheet, 'L', 'BÁO CÁO VẬN HÀNH NIGHTLIFE VN', subtitle);
  sheet.views = [{ state: 'frozen', ySplit: 3, showGridLines: false }];
  sheet.columns = Array.from({ length: 12 }, (_, index) => ({
    width: [15, 14, 14, 18, 3, 18, 14, 14, 3, 24, 15, 18][index],
  }));

  const verifiedBillStatuses = new Set(['VERIFIED', 'PAID']);
  const verifiedBills = input.bills.filter((bill) =>
    verifiedBillStatuses.has(bill.status),
  );
  const totalBookings = input.bookings.length;
  const totalGuests = input.bookings.reduce(
    (sum, booking) => sum + (booking.partySize || 1),
    0,
  );
  const completedBookings = input.bookings.filter(
    (booking) => booking.status === 'COMPLETED',
  ).length;
  const completionRate = totalBookings ? completedBookings / totalBookings : 0;
  const revenue = verifiedBills.reduce((sum, bill) => sum + bill.totalVnd, 0);
  const commission = verifiedBills.reduce(
    (sum, bill) => sum + bill.commissionAmountVnd,
    0,
  );
  const averageBill = verifiedBills.length ? revenue / verifiedBills.length : 0;
  const pendingBills = input.bills.filter((bill) =>
    ['SUBMITTED', 'PENDING_PM_BA'].includes(bill.status),
  ).length;

  const cards = [
    {
      label: 'TỔNG BOOKING',
      value: totalBookings,
      format: '#,##0',
      range: ['A5:C5', 'A6:C7'],
    },
    {
      label: 'TỔNG SỐ KHÁCH',
      value: totalGuests,
      format: '#,##0',
      range: ['D5:F5', 'D6:F7'],
    },
    {
      label: 'TỶ LỆ HOÀN TẤT',
      value: completionRate,
      format: '0.0%',
      range: ['G5:I5', 'G6:I7'],
    },
    {
      label: 'DOANH THU XÁC NHẬN',
      value: revenue,
      format: currencyFormat,
      range: ['J5:L5', 'J6:L7'],
    },
    {
      label: 'HOA HỒNG',
      value: commission,
      format: currencyFormat,
      range: ['A9:C9', 'A10:C11'],
    },
    {
      label: 'HÓA ĐƠN TRUNG BÌNH',
      value: averageBill,
      format: currencyFormat,
      range: ['D9:F9', 'D10:F11'],
    },
    {
      label: 'QUÁN TRONG PHẠM VI',
      value: input.stores.length,
      format: '#,##0',
      range: ['G9:I9', 'G10:I11'],
    },
    {
      label: 'HÓA ĐƠN CHỜ DUYỆT',
      value: pendingBills,
      format: '#,##0',
      range: ['J9:L9', 'J10:L11'],
    },
  ];

  cards.forEach((card) => {
    const [labelRange, valueRange] = card.range;
    sheet.mergeCells(labelRange);
    sheet.mergeCells(valueRange);
    const labelCell = sheet.getCell(labelRange.split(':')[0]);
    const valueCell = sheet.getCell(valueRange.split(':')[0]);
    labelCell.value = card.label;
    labelCell.fill = fill(COLORS.charcoal);
    labelCell.font = {
      name: 'Aptos',
      size: 9,
      bold: true,
      color: { argb: COLORS.goldLight },
    };
    labelCell.alignment = { horizontal: 'left', vertical: 'middle' };
    valueCell.value = card.value;
    valueCell.numFmt = card.format;
    valueCell.fill = fill(COLORS.cream);
    valueCell.font = {
      name: 'Aptos Display',
      size: 22,
      bold: true,
      color: { argb: COLORS.ink },
    };
    valueCell.alignment = { horizontal: 'left', vertical: 'middle' };
    valueCell.border = {
      bottom: { style: 'medium', color: { argb: COLORS.gold } },
    };
  });
  [5, 9].forEach((row) => (sheet.getRow(row).height = 22));
  [6, 7, 10, 11].forEach((row) => (sheet.getRow(row).height = 24));

  sheet.mergeCells('A13:D13');
  sheet.getCell('A13').value = 'XU HƯỚNG THEO NGÀY';
  sheet.mergeCells('F13:H13');
  sheet.getCell('F13').value = 'CƠ CẤU TRẠNG THÁI';
  sheet.mergeCells('J13:L13');
  sheet.getCell('J13').value = 'TOP QUÁN THEO DOANH THU';
  ['A13', 'F13', 'J13'].forEach((address) => {
    const cell = sheet.getCell(address);
    cell.fill = fill(COLORS.gold);
    cell.font = {
      name: 'Aptos',
      size: 10,
      bold: true,
      color: { argb: COLORS.ink },
    };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  });
  sheet.getRow(13).height = 25;

  const dailyHeaders = ['Ngày', 'Booking', 'Khách', 'Doanh thu'];
  const statusHeaders = ['Trạng thái', 'Số lượng', 'Tỷ trọng'];
  const storeHeaders = ['Quán', 'Booking', 'Doanh thu'];
  dailyHeaders.forEach((value, index) => {
    sheet.getRow(14).getCell(index + 1).value = value;
  });
  statusHeaders.forEach((value, index) => {
    sheet.getRow(14).getCell(index + 6).value = value;
  });
  storeHeaders.forEach((value, index) => {
    sheet.getRow(14).getCell(index + 10).value = value;
  });
  sheet.getCell('E14').value = null;
  sheet.getCell('I14').value = null;
  [
    ['A', 'D'],
    ['F', 'H'],
    ['J', 'L'],
  ].forEach(([startColumn, endColumn]) => {
    const start = sheet.getCell(`${startColumn}14`).col;
    const end = sheet.getCell(`${endColumn}14`).col;
    for (let column = start; column <= end; column += 1) {
      const cell = sheet.getRow(14).getCell(column);
      cell.fill = fill(COLORS.charcoal);
      cell.font = {
        name: 'Aptos',
        size: 10,
        bold: true,
        color: { argb: COLORS.goldLight },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
        wrapText: true,
      };
      cell.border = border;
    }
  });
  sheet.getRow(14).height = 30;

  const bookingByDay = new Map<string, { bookings: number; guests: number }>();
  input.bookings.forEach((booking) => {
    const key = dateKey(booking.scheduledAt);
    const current = bookingByDay.get(key) || { bookings: 0, guests: 0 };
    current.bookings += 1;
    current.guests += booking.partySize || 1;
    bookingByDay.set(key, current);
  });
  const revenueByDay = new Map<string, number>();
  verifiedBills.forEach((bill) => {
    const key = dateKey(bill.usedAt || bill.createdAt);
    revenueByDay.set(key, (revenueByDay.get(key) || 0) + bill.totalVnd);
  });

  const dailyRows: Array<{
    date: Date;
    bookings: number;
    guests: number;
    revenue: number;
  }> = [];
  for (
    let date = new Date(input.startDate);
    date < input.endDate;
    date.setDate(date.getDate() + 1)
  ) {
    const day = new Date(date);
    const key = dateKey(day);
    const booking = bookingByDay.get(key) || { bookings: 0, guests: 0 };
    dailyRows.push({
      date: toDateOnly(day),
      bookings: booking.bookings,
      guests: booking.guests,
      revenue: revenueByDay.get(key) || 0,
    });
  }
  dailyRows.forEach((row, index) => {
    const rowNumber = 15 + index;
    sheet.getRow(rowNumber).values = [
      row.date,
      row.bookings,
      row.guests,
      row.revenue,
    ];
    sheet.getCell(`A${rowNumber}`).numFmt = 'dd/mm';
    sheet.getCell(`D${rowNumber}`).numFmt = currencyFormat;
  });

  const statusRows = Object.entries(bookingStatusLabels).map(
    ([status, label]) => {
      const count = input.bookings.filter(
        (booking) => booking.status === status,
      ).length;
      return {
        status,
        label,
        count,
        share: totalBookings ? count / totalBookings : 0,
      };
    },
  );
  statusRows.forEach((row, index) => {
    const rowNumber = 15 + index;
    sheet.getCell(`F${rowNumber}`).value = row.label;
    sheet.getCell(`G${rowNumber}`).value = row.count;
    sheet.getCell(`H${rowNumber}`).value = row.share;
    sheet.getCell(`H${rowNumber}`).numFmt = '0.0%';
    const colors = statusStyle(row.status);
    sheet.getCell(`F${rowNumber}`).fill = fill(colors.fill);
    sheet.getCell(`F${rowNumber}`).font = {
      name: 'Aptos',
      size: 10,
      bold: true,
      color: { argb: colors.font },
    };
  });

  storeRows.slice(0, 10).forEach((row, index) => {
    const rowNumber = 15 + index;
    sheet.getCell(`J${rowNumber}`).value = row.store.name;
    sheet.getCell(`K${rowNumber}`).value = row.bookings;
    sheet.getCell(`L${rowNumber}`).value = row.revenue;
    sheet.getCell(`L${rowNumber}`).numFmt = currencyFormat;
  });
  if (!storeRows.length) {
    sheet.mergeCells('J15:L15');
    sheet.getCell('J15').value = 'Không có dữ liệu';
  }

  const summaryEndRow = Math.max(
    14 + dailyRows.length,
    14 + statusRows.length,
    14 + Math.min(storeRows.length, 10),
    15,
  );
  for (let rowNumber = 15; rowNumber <= summaryEndRow; rowNumber += 1) {
    ['A', 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L'].forEach((column) => {
      const cell = sheet.getCell(`${column}${rowNumber}`);
      cell.border = border;
      cell.alignment = { vertical: 'middle' };
      if (!cell.fill || cell.fill.type !== 'pattern') {
        cell.fill = fill(rowNumber % 2 === 0 ? COLORS.cream : COLORS.white);
      }
    });
    sheet.getRow(rowNumber).height = 22;
  }

  const noteRow = summaryEndRow + 2;
  sheet.mergeCells(`A${noteRow}:L${noteRow + 1}`);
  const noteCell = sheet.getCell(`A${noteRow}`);
  const truncationNotes = [
    input.bookingsTruncated ? 'booking' : '',
    input.billsTruncated ? 'hóa đơn' : '',
  ].filter(Boolean);
  noteCell.value = truncationNotes.length
    ? `Lưu ý: Báo cáo đã chạm giới hạn xuất đối với ${truncationNotes.join(' và ')}. Hãy thu hẹp bộ lọc để xem đầy đủ dữ liệu. Doanh thu chỉ tính hóa đơn Đã xác minh/Đã thanh toán.`
    : 'Ghi chú: Doanh thu và hoa hồng chỉ tính các hóa đơn Đã xác minh hoặc Đã thanh toán. Các bảng chi tiết có bộ lọc và có thể sắp xếp trực tiếp trong Excel.';
  noteCell.fill = fill(COLORS.sand);
  noteCell.font = {
    name: 'Aptos',
    size: 10,
    italic: true,
    color: { argb: COLORS.muted },
  };
  noteCell.alignment = { vertical: 'middle', wrapText: true };
  noteCell.border = {
    left: { style: 'medium', color: { argb: COLORS.gold } },
  };
  sheet.getRow(noteRow).height = 22;
  sheet.getRow(noteRow + 1).height = 22;
};

export async function buildAdminDashboardReport(
  input: AdminDashboardReportInput,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'NightLife VN Admin';
  workbook.lastModifiedBy = 'NightLife VN Admin';
  workbook.created = input.generatedAt;
  workbook.modified = input.generatedAt;
  const subtitle = reportFilterLabel(input);
  const overviewSheet = workbook.addWorksheet('Tổng quan', {
    properties: { tabColor: { argb: COLORS.gold } },
  });
  writeDetailSheets(workbook, input, subtitle);
  const storeResult = writeStoreSheet(workbook, input, subtitle);
  writeOverviewSheet(overviewSheet, input, subtitle, storeResult.rows);

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
  return Buffer.from(await normalizeExcelStyles(buffer));
}
