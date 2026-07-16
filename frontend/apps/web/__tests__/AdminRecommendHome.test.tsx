import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import AdminContentPage from '../src/app/admin/content/page';
import { SystemFeedbackProvider } from '../src/components/ui/SystemFeedback';

// Mock client API calls
const mockBanners: any[] = [];
const mockStoresList = [
  {
    id: 'store-101',
    name: 'Store Hanoian',
    slug: 'store-hanoian',
    city: 'Hà Nội',
    district: 'Hoàn Kiếm',
    category: 'BAR',
    status: 'ACTIVE',
    media: [{ url: '/hanoi.jpg', purpose: 'STORE_COVER' }]
  },
  {
    id: 'store-102',
    name: 'Store Saigonist',
    slug: 'store-saigonist',
    city: 'Hồ Chí Minh',
    district: 'Quận 1',
    category: 'CLUB',
    status: 'ACTIVE',
    media: [{ url: '/saigon.jpg', purpose: 'STORE_COVER' }]
  }
];

const mockRankings = [
  { id: 'rec-1', targetId: 'store-1', targetName: 'Lounge One', targetCategory: 'LOUNGE', targetCity: 'Hồ Chí Minh', targetArea: 'Quận 1', pinRank: 1, cityCode: 'hcm', targetType: 'STORE', status: 'ACTIVE' },
  { id: 'rec-2', targetId: 'store-2', targetName: 'Club Two', targetCategory: 'CLUB', targetCity: 'Hà Nội', targetArea: 'Hoàn Kiếm', pinRank: 2, cityCode: 'hn', targetType: 'STORE', status: 'ACTIVE' },
  { id: 'rec-3', targetId: 'store-3', targetName: 'Bar Three', targetCategory: 'BAR', targetCity: 'Hồ Chí Minh', targetArea: 'Quận 3', pinRank: 3, cityCode: 'hcm', targetType: 'STORE', status: 'ACTIVE' },
  { id: 'rec-4', targetId: 'store-4', targetName: 'Karaoke Four', targetCategory: 'KARAOKE', targetCity: 'Hà Nội', targetArea: 'Ba Đình', pinRank: 4, cityCode: 'hn', targetType: 'STORE', status: 'ACTIVE' },
  { id: 'rec-5', targetId: 'store-5', targetName: 'Lounge Five', targetCategory: 'LOUNGE', targetCity: 'Hồ Chí Minh', targetArea: 'Bình Thạnh', pinRank: 5, cityCode: 'hcm', targetType: 'STORE', status: 'ACTIVE' },
  { id: 'rec-6', targetId: 'store-6', targetName: 'Club Six', targetCategory: 'CLUB', targetCity: 'Hà Nội', targetArea: 'Tây Hồ', pinRank: 6, cityCode: 'hn', targetType: 'STORE', status: 'ACTIVE' },
  { id: 'rec-7', targetId: 'store-7', targetName: 'Bar Seven', targetCategory: 'BAR', targetCity: 'Hồ Chí Minh', targetArea: 'Quận 7', pinRank: 7, cityCode: 'hcm', targetType: 'STORE', status: 'ACTIVE' },
  { id: 'rec-8', targetId: 'store-8', targetName: 'Lounge Eight', targetCategory: 'LOUNGE', targetCity: 'Hà Nội', targetArea: 'Cầu Giấy', pinRank: 8, cityCode: 'hn', targetType: 'STORE', status: 'ACTIVE' },
];

let customListResponse: any[] = [];

// Setup dynamic mocks
const mockList = vi.fn().mockImplementation((query: any) => {
  if (query?.scope === 'recommend-home') {
    return Promise.resolve(customListResponse);
  }
  return Promise.resolve([]);
});

const mockCreate = vi.fn().mockResolvedValue({});
const mockUpdate = vi.fn().mockResolvedValue({});
const mockDelete = vi.fn().mockResolvedValue({});
const mockApiClient = vi.fn();

vi.mock("@/lib/api/client", () => {
  return {
    apiFormDataClient: vi.fn(),
    apiClient: (endpoint: string, options?: any) => mockApiClient(endpoint, options),
    resolveClientUrl: (url: string) => url,
  };
});

vi.mock("@/lib/api/admin-rankings", () => ({
  adminRankingsApi: {
    list: (query: any) => mockList(query),
    options: vi.fn().mockResolvedValue([]),
    create: (payload: any) => mockCreate(payload),
    update: (id: string, payload: any) => mockUpdate(id, payload),
    delete: (id: string) => mockDelete(id),
  },
}));

vi.mock("@/lib/api/categories", () => ({
  categoriesApi: {
    list: vi.fn().mockResolvedValue([]),
    listBannerTags: vi.fn().mockResolvedValue([]),
    adminList: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/api/content", () => ({
  contentApi: {
    adminList: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("@/lib/api/campaigns", () => ({
  campaignsApi: {
    list: vi.fn().mockResolvedValue([]),
    adminList: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: () => {
    return function MockDynamicComponent() {
      return <div data-testid="mock-dynamic">Quill Editor Mock</div>;
    };
  },
}));

describe("Admin Recommend Home content page UI verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    customListResponse = [...mockRankings.slice(0, 5)]; // Start with 5 items by default
    mockApiClient.mockImplementation((endpoint: string, options?: any) => {
      if (endpoint === '/admin/content/banners') {
        return Promise.resolve(mockBanners);
      }
      if (endpoint === '/admin/stores') {
        return Promise.resolve({ data: mockStoresList });
      }
      return Promise.resolve([]);
    });
  });

  it("1. Search operates across all stores in all cities (no city filtering)", async () => {
    render(
      <SystemFeedbackProvider>
        <AdminContentPage />
      </SystemFeedbackProvider>
    );

    // Switch to recommend tab
    const recommendTab = screen.getByText("Đề xuất tối nay");
    fireEvent.click(recommendTab);

    // Verify Tab Header
    expect(await screen.findByText("Đề xuất tối nay")).toBeInTheDocument();

    // Verify search input is present
    const searchInput = screen.getByPlaceholderText("Tìm quán hoạt động để ghim đề xuất tối nay…");
    expect(searchInput).toBeInTheDocument();

    // Type a query in search input
    fireEvent.change(searchInput, { target: { value: 'Store' } });

    // Wait for the debounce search trigger (500ms)
    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalledWith('/admin/stores', expect.objectContaining({
        params: { search: 'Store', limit: 10 }
      }));
    });

    // Check that search results for both Hanoi and Ho Chi Minh are rendered
    expect(await screen.findByText("Store Hanoian")).toBeInTheDocument();
    expect(await screen.findByText("Store Saigonist")).toBeInTheDocument();
  });

  it("2. Pinned limit of 8 stores is correctly blocked on 9th store with a custom modal", async () => {
    // Fill the list with 8 items
    customListResponse = [...mockRankings]; 

    render(
      <SystemFeedbackProvider>
        <AdminContentPage />
      </SystemFeedbackProvider>
    );

    // Switch to recommend tab
    fireEvent.click(screen.getByText("Đề xuất tối nay"));

    // Verify list indicates 8 / 8
    expect(await screen.findByText("8")).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('/ 8 quán'))).toBeInTheDocument();

    // Search for stores to add
    const searchInput = screen.getByPlaceholderText("Tìm quán hoạt động để ghim đề xuất tối nay…");
    fireEvent.change(searchInput, { target: { value: 'Store' } });

    // Click "+ Ghim đề xuất" on the search result
    const pinButtons = await screen.findAllByText("+ Ghim đề xuất");
    expect(pinButtons[0]).toBeDefined();
    fireEvent.click(pinButtons[0]!);

    // Verify showModal was triggered on the 9th store block
    expect(await screen.findByText("Giới hạn đề xuất")).toBeInTheDocument();
    expect(screen.getByText(/Mục "Đề xuất tối nay" chỉ hiển thị tối đa 8 quán/)).toBeInTheDocument();

    // Verify create was NOT called
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("3. Reordering via Up/Down buttons works correctly and updates rankings in backend", async () => {
    render(
      <SystemFeedbackProvider>
        <AdminContentPage />
      </SystemFeedbackProvider>
    );

    // Switch to recommend tab
    fireEvent.click(screen.getByText("Đề xuất tối nay"));

    // Verify active items are rendered
    expect(await screen.findByText("Lounge One")).toBeInTheDocument();
    expect(screen.getByText("Club Two")).toBeInTheDocument();

    // Find the Up/Down buttons. There are buttons for each item.
    // Index 1 (Club Two) has idx=1. Let's find move buttons.
    // We can simulate clicking the 'Up' button on the second item ('Club Two').
    // In code: idx === 0 has up arrow disabled style but still has onClick.
    // Let's get all up buttons (they contain SVGs with path d="M18 15l-6-6-6 6").
    // We click the up button of index 1.
    // Let's find up buttons in the UI
    const upButtons = Array.from(document.querySelectorAll('span')).filter(span => {
      const svg = span.querySelector('svg');
      return svg && svg.innerHTML.includes('M18 15l-6-6-6 6');
    });

    // Let's click the up button of index 1 (Club Two)
    expect(upButtons[1]).toBeDefined();
    fireEvent.click(upButtons[1]!);

    // Verify adminRankingsApi.update is called for both currentItem and swapItem
    // swapRank for currentItem (Club Two, index 1) will be 1 (Lounge One's rank)
    // currentRank for swapItem (Lounge One, index 0) will be 2 (Club Two's rank)
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(3);
    });
    expect(mockUpdate).toHaveBeenNthCalledWith(1, 'rec-1', expect.objectContaining({
      pinRank: null
    }));
    expect(mockUpdate).toHaveBeenNthCalledWith(2, 'rec-2', expect.objectContaining({
      pinRank: 1
    }));
    expect(mockUpdate).toHaveBeenNthCalledWith(3, 'rec-1', expect.objectContaining({
      pinRank: 2
    }));
  });

  it("4. Deletion works and prompts with a custom confirmation modal", async () => {
    render(
      <SystemFeedbackProvider>
        <AdminContentPage />
      </SystemFeedbackProvider>
    );

    // Switch to recommend tab
    fireEvent.click(screen.getByText("Đề xuất tối nay"));

    // Wait for elements to load
    expect(await screen.findByText("Lounge One")).toBeInTheDocument();

    // Find delete buttons (they contain SVGs with path "M6 6l12 12M18 6L6 18")
    const deleteButtons = Array.from(document.querySelectorAll('span')).filter(span => {
      const svg = span.querySelector('svg');
      return svg && svg.innerHTML.includes('M6 6l12 12M18 6L6 18');
    });

    // Click delete on the first item (Lounge One)
    expect(deleteButtons[0]).toBeDefined();
    fireEvent.click(deleteButtons[0]!);

    // Verify custom confirmation modal appears
    expect(await screen.findByText("Xác nhận gỡ")).toBeInTheDocument();
    expect(screen.getByText(/Bạn có chắc chắn muốn gỡ quán này khỏi mục "Đề xuất tối nay"\?/)).toBeInTheDocument();

    // Verify delete API is NOT called yet
    expect(mockDelete).not.toHaveBeenCalled();

    // Click the confirmation button (defaults to "Đã hiểu" if primaryLabel is omitted in modal options)
    const confirmButton = screen.getByText("Đã hiểu");
    fireEvent.click(confirmButton);

    // Verify delete API is called
    expect(mockDelete).toHaveBeenCalledWith('rec-1');
  });
});
