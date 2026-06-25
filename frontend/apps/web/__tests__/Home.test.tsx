import React from 'react';
import { render, screen } from '@testing-library/react';
import Page from '../src/app/page';
import { describe, it, expect, vi } from 'vitest';

// Need to mock next/image and next/link since they have special behavior
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode, href: string }) => {
    return <a href={href}>{children}</a>;
  },
}));

describe('Home Page', () => {
  it('renders search bar', () => {
    render(<Page />);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm/i);
    expect(searchInput).toBeTruthy();
  });
});
