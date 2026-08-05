import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PartnerNewBillPage from '../src/app/partner/activity/new-bill/page';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockSubmitPartnerBill = vi.fn();
const mockUploadEvidence = vi.fn();
const mockPreviewBillOcr = vi.fn();

vi.mock('@/lib/api/bills', () => ({
  billApi: {
    listPartnerStores: vi.fn().mockResolvedValue([
      { id: 'store-neon', name: 'Neon Club', slug: 'neon-club' },
    ]),
    submitPartnerBill: (...args: any[]) => mockSubmitPartnerBill(...args),
    uploadEvidence: (...args: any[]) => mockUploadEvidence(...args),
    previewBillOcr: (...args: any[]) => mockPreviewBillOcr(...args),
  },
}));

vi.mock('../src/app/partner/PartnerProviders', () => ({
  usePartnerStoreScope: () => ({
    selectedStoreId: 'store-neon',
    stores: [{ id: 'store-neon', name: 'Neon Club', slug: 'neon-club' }],
  }),
}));

vi.mock('@/lib/api/client', () => ({
  apiClient: vi.fn().mockImplementation((path: string) => {
    if (path === '/partner/bookings') return Promise.resolve([]);
    if (path === '/partner/stores') return Promise.resolve([{ id: 'store-neon', name: 'Neon Club', slug: 'neon-club' }]);
    return Promise.resolve([]);
  }),
}));

describe('PartnerNewBillPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubmitPartnerBill.mockResolvedValue({
      id: 'bill-new-1',
      billNumber: 'BILL-001',
      storeId: 'store-neon',
      totalVnd: 2000000,
    });
    mockUploadEvidence.mockResolvedValue({ id: 'media-1' });
  });

  afterEach(() => {
    cleanup();
  });

  it('1. Formats amount input with thousands separators', async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerNewBillPage />
      </SystemFeedbackProvider>,
    );

    const amountInput = (await screen.findByLabelText(/Tổng tiền bill gốc/i)) as HTMLInputElement;
    fireEvent.change(amountInput, { target: { value: '2000000' } });

    await waitFor(() => {
      expect(amountInput.value).toBe('2.000.000');
    });
  });

  it('2. Triggers OCR scan preview and populates form fields', async () => {
    mockPreviewBillOcr.mockResolvedValue({
      suggestions: { totalVnd: 3500000, usedAt: '2026-08-05T14:00:00.000Z' },
      confidence: 0.9,
    });

    render(
      <SystemFeedbackProvider>
        <PartnerNewBillPage />
      </SystemFeedbackProvider>,
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const testFile = new File(['ocr-proof'], 'bill.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [testFile] } });

    await waitFor(() => {
      expect(mockPreviewBillOcr).toHaveBeenCalledWith(expect.objectContaining({ fileName: 'bill.jpg' }));
    });

    const amountInput = (await screen.findByLabelText(/Tổng tiền bill gốc/i)) as HTMLInputElement;
    await waitFor(() => {
      expect(amountInput.value).toBe('3.500.000');
    });
  });

  it('3. Submits form, uploads evidence, and redirects to activity feed', async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerNewBillPage />
      </SystemFeedbackProvider>,
    );

    const amountInput = await screen.findByLabelText(/Tổng tiền bill gốc/i);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const form = amountInput.closest('form')!;

    fireEvent.change(amountInput, { target: { value: '2000000' } });
    fireEvent.change(fileInput, {
      target: { files: [new File(['proof'], 'proof.png', { type: 'image/png' })] },
    });

    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockSubmitPartnerBill).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: 'store-neon',
          totalVnd: 2000000,
        }),
      );
      expect(mockUploadEvidence).toHaveBeenCalledWith('bill-new-1', expect.any(File));
      expect(mockPush).toHaveBeenCalledWith('/partner/activity');
    });
  });
});
