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
