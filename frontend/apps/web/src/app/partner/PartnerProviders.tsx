'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api/client';
import * as authSession from '@/lib/auth/session';

export type PartnerStore = {
  id: string;
  name: string;
  slug: string;
  status: string;
  category?: string;
  city?: string;
  district?: string;
  address?: string;
  customerArrivalCount?: number;
  qrUsedCount?: number;
  permissions?: string[];
  [key: string]: any;
};

export type PartnerNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read?: boolean;
  unread?: boolean;
  category?: string;
  meta?: string;
  actionLabel?: string;
  panel?: string;
  tone?: 'danger' | 'success' | 'warning' | 'info' | 'gold';
  icon?: any;
  [key: string]: any;
};

export type PartnerTheme = 'dark' | 'light';
export type PartnerThemeVariables = React.CSSProperties & Record<`--partner-${string}`, string>;

const partnerThemeStorageKey = 'vy-user-theme';

export const partnerDarkThemeVariables: PartnerThemeVariables = {
  '--partner-bg': '#0c0c0f',
  '--partner-surface-1': 'rgba(255,255,255,.035)',
  '--partner-surface-2': 'rgba(255,255,255,.04)',
  '--partner-surface-3': 'rgba(255,255,255,.05)',
  '--partner-nav-bg': 'rgba(8,8,11,.9)',
  '--partner-header-bg': 'rgba(12,12,15,.72)',
  '--partner-popover-bg': 'linear-gradient(180deg,rgba(28,27,31,.98),rgba(12,12,15,.98))',
  '--partner-active-control-bg': 'rgba(212,178,106,.16)',
  '--partner-border-soft': 'rgba(255,255,255,.06)',
  '--partner-border-hair': 'rgba(255,255,255,.08)',
  '--partner-border-gold-12': 'rgba(212,178,106,.18)',
  '--partner-border-gold-22': 'rgba(212,178,106,.22)',
  '--partner-border-gold-32': 'rgba(212,178,106,.32)',
  '--partner-border-gold-40': 'rgba(212,178,106,.4)',
  '--partner-text': '#f3f0ea',
  '--partner-text-2': '#c5c0b6',
  '--partner-muted': '#8c8679',
  '--partner-on-gold': '#241a0a',
  '--partner-gold': '#d4b26a',
  '--partner-gold-bright': '#e3c27e',
  '--partner-gold-pale': '#f0dda8',
  '--partner-gold-grad': 'linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)',
  '--partner-danger': '#ffb4a8',
  '--partner-success': '#8de6b0',
  '--partner-neon-pink': '#e0729e',
};

export const partnerLightThemeVariables: PartnerThemeVariables = {
  '--partner-bg': '#f4eddf',
  '--partner-surface-1': 'rgba(255,255,255,.86)',
  '--partner-surface-2': 'rgba(255,255,255,.78)',
  '--partner-surface-3': 'rgba(255,255,255,.92)',
  '--partner-nav-bg': 'rgba(255,250,241,.96)',
  '--partner-header-bg': 'rgba(255,250,241,.88)',
  '--partner-popover-bg': 'linear-gradient(180deg,rgba(255,252,247,.98),rgba(245,237,224,.98))',
  '--partner-active-control-bg': 'rgba(180,132,48,.16)',
  '--partner-border-soft': 'rgba(112,82,34,.12)',
  '--partner-border-hair': 'rgba(112,82,34,.14)',
  '--partner-border-gold-12': 'rgba(166,119,38,.18)',
  '--partner-border-gold-22': 'rgba(166,119,38,.26)',
  '--partner-border-gold-32': 'rgba(166,119,38,.34)',
  '--partner-border-gold-40': 'rgba(166,119,38,.42)',
  '--partner-text': '#241d14',
  '--partner-text-2': '#5f5547',
  '--partner-muted': '#8b7d6a',
  '--partner-on-gold': '#23180a',
  '--partner-gold': '#a67425',
  '--partner-gold-bright': '#b98735',
  '--partner-gold-pale': '#75511b',
  '--partner-gold-grad': 'linear-gradient(135deg,#f8e8b2,#d7ab50 55%,#b98931)',
  '--partner-danger': '#ad3e35',
  '--partner-success': '#14834f',
  '--partner-neon-pink': '#d9548b',
};

const readStoredPartnerTheme = (): PartnerTheme => {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = window.localStorage ? window.localStorage.getItem(partnerThemeStorageKey) : null;
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return document.documentElement.classList.contains('vy-light') ? 'light' : 'dark';
};

// Theme Context
type PartnerThemeContextType = {
  partnerTheme: PartnerTheme;
  togglePartnerTheme: () => void;
  partnerThemeVariables: PartnerThemeVariables;
};

const PartnerThemeContext = createContext<PartnerThemeContextType>({
  partnerTheme: 'dark',
  togglePartnerTheme: () => {},
  partnerThemeVariables: partnerDarkThemeVariables,
});

export function PartnerThemeProvider({ children }: { children: React.ReactNode }) {
  const [partnerTheme, setPartnerTheme] = useState<PartnerTheme>(() => readStoredPartnerTheme());

  const togglePartnerTheme = useCallback(() => {
    setPartnerTheme((prev) => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem(partnerThemeStorageKey, nextTheme);
        } catch {}
        if (nextTheme === 'light') {
          document.documentElement.classList.add('vy-light');
        } else {
          document.documentElement.classList.remove('vy-light');
        }
      }
      return nextTheme;
    });
  }, []);

  const partnerThemeVariables = partnerTheme === 'light' ? partnerLightThemeVariables : partnerDarkThemeVariables;

  return (
    <PartnerThemeContext.Provider value={{ partnerTheme, togglePartnerTheme, partnerThemeVariables }}>
      {children}
    </PartnerThemeContext.Provider>
  );
}

export function usePartnerTheme() {
  return useContext(PartnerThemeContext);
}

// Store Scope Context
type PartnerStoreScopeContextType = {
  stores: PartnerStore[];
  selectedStoreId: string;
  setSelectedStoreId: (id: string) => void;
  activeStore: PartnerStore | null;
  storeName: string;
  activeStoreStatus: string;
  storePermissions: string[];
  isStaffAccount: boolean;
  isPartnerAccount: boolean;
  currentUser: any;
  isLoadingStores: boolean;
  refreshStores: () => Promise<void>;
};

const PartnerStoreScopeContext = createContext<PartnerStoreScopeContextType>({
  stores: [],
  selectedStoreId: '',
  setSelectedStoreId: () => {},
  activeStore: null,
  storeName: 'Tất cả quán',
  activeStoreStatus: 'ACTIVE',
  storePermissions: [],
  isStaffAccount: false,
  isPartnerAccount: false,
  currentUser: null,
  isLoadingStores: true,
  refreshStores: async () => {},
});

export function PartnerStoreScopeProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<PartnerStore[]>([]);
  const [selectedStoreId, setSelectedStoreIdState] = useState<string>('');
  const [isLoadingStores, setIsLoadingStores] = useState<boolean>(true);

  let currentUser: any = null;
  try {
    const getAuthUserFn = authSession.getAuthUser;
    if (typeof getAuthUserFn === 'function') {
      currentUser = getAuthUserFn();
    }
  } catch {}

  const isStaffAccount = currentUser?.role === 'STAFF';
  const isPartnerAccount = currentUser?.role === 'PARTNER';

  const setSelectedStoreId = useCallback((id: string) => {
    setSelectedStoreIdState(id);
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        window.sessionStorage.setItem('vy-partner-selected-store-id', id);
      } catch {}
    }
  }, []);

  const refreshStores = useCallback(async () => {
    setIsLoadingStores(true);
    try {
      const storeData = await apiClient<PartnerStore[]>('/partner/stores');
      setStores(storeData);
      setSelectedStoreIdState((current) => {
        if (current && storeData.some((s) => s.id === current)) return current;
        let storedId: string | null = null;
        if (typeof window !== 'undefined' && window.sessionStorage) {
          try {
            storedId = window.sessionStorage.getItem('vy-partner-selected-store-id');
          } catch {}
        }
        if (storedId && storeData.some((s) => s.id === storedId)) return storedId;
        return storeData[0]?.id || '';
      });
    } catch {
      setStores([]);
    } finally {
      setIsLoadingStores(false);
    }
  }, []);

  useEffect(() => {
    refreshStores();
  }, [refreshStores]);

  const activeStore = useMemo(() => {
    return stores.find((s) => s.id === selectedStoreId) || stores[0] || null;
  }, [stores, selectedStoreId]);

  const storeName = activeStore?.name || 'Tất cả quán';
  const activeStoreStatus = activeStore?.status || 'ACTIVE';
  const storePermissions = activeStore?.permissions || [];

  return (
    <PartnerStoreScopeContext.Provider
      value={{
        stores,
        selectedStoreId,
        setSelectedStoreId,
        activeStore,
        storeName,
        activeStoreStatus,
        storePermissions,
        isStaffAccount,
        isPartnerAccount,
        currentUser,
        isLoadingStores,
        refreshStores,
      }}
    >
      {children}
    </PartnerStoreScopeContext.Provider>
  );
}

export function usePartnerStoreScope() {
  return useContext(PartnerStoreScopeContext);
}

// Notification Context
type PartnerNotificationContextType = {
  partnerNotifications: PartnerNotification[];
  unreadNotificationCount: number;
  isNotificationOpen: boolean;
  setIsNotificationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  markAllNotificationsRead: () => void;
  refreshPartnerNotifications: () => Promise<void>;
  openPartnerNotification: (notification: PartnerNotification) => void;
};

const PartnerNotificationContext = createContext<PartnerNotificationContextType>({
  partnerNotifications: [],
  unreadNotificationCount: 0,
  isNotificationOpen: false,
  setIsNotificationOpen: () => {},
  markAllNotificationsRead: () => {},
  refreshPartnerNotifications: async () => {},
  openPartnerNotification: () => {},
});

export function PartnerNotificationProvider({ children }: { children: React.ReactNode }) {
  const [partnerNotifications, setPartnerNotifications] = useState<PartnerNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  const refreshPartnerNotifications = useCallback(async () => {
    try {
      const notifications = await apiClient<PartnerNotification[]>('/partner/notifications');
      setPartnerNotifications(notifications);
    } catch {
      // Ignore notification fetch errors silently
    }
  }, []);

  useEffect(() => {
    refreshPartnerNotifications();
  }, [refreshPartnerNotifications]);

  const unreadNotificationCount = useMemo(() => {
    return partnerNotifications.filter(
      (item) => !item.read && item.unread !== false && !readNotificationIds.includes(item.id),
    ).length;
  }, [partnerNotifications, readNotificationIds]);

  const markAllNotificationsRead = useCallback(() => {
    setReadNotificationIds(partnerNotifications.map((item) => item.id));
    setPartnerNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true, unread: false })),
    );
  }, [partnerNotifications]);

  const openPartnerNotification = useCallback((notification: PartnerNotification) => {
    setReadNotificationIds((prev) => [...prev, notification.id]);
    setIsNotificationOpen(false);
  }, []);

  return (
    <PartnerNotificationContext.Provider
      value={{
        partnerNotifications,
        unreadNotificationCount,
        isNotificationOpen,
        setIsNotificationOpen,
        markAllNotificationsRead,
        refreshPartnerNotifications,
        openPartnerNotification,
      }}
    >
      {children}
    </PartnerNotificationContext.Provider>
  );
}

export function usePartnerNotification() {
  return useContext(PartnerNotificationContext);
}

// Combined Providers wrapper
export function PartnerProviders({ children }: { children: React.ReactNode }) {
  return (
    <PartnerThemeProvider>
      <PartnerStoreScopeProvider>
        <PartnerNotificationProvider>{children}</PartnerNotificationProvider>
      </PartnerStoreScopeProvider>
    </PartnerThemeProvider>
  );
}
