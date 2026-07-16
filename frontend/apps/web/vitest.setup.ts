import '@testing-library/jest-dom/vitest';
import React from 'react';
import { vi } from 'vitest';

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt = '', ...props }: { src: string; alt?: string }) =>
    React.createElement('img', { src, alt, ...props }),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) =>
    React.createElement('a', { href, ...props }, children),
}));

if (typeof window !== 'undefined') {
  const createMockStorage = () => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = String(value);
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
      get length() {
        return Object.keys(store).length;
      },
      key: (index: number) => Object.keys(store)[index] || null,
    };
  };

  Object.defineProperty(window, 'localStorage', {
    value: createMockStorage(),
    configurable: true,
    writable: true,
  });

  Object.defineProperty(window, 'sessionStorage', {
    value: createMockStorage(),
    configurable: true,
    writable: true,
  });
}
