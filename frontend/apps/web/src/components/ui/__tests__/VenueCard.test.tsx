import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VenueCard } from '../VenueCard';
import { Venue } from '@/types';

const mockVenue: Venue = {
  id: 'test-venue-1',
  name: 'Club Test',
  area: 'Hoàn Kiếm',
  catLabel: 'Bar',
  rating: 4.8,
  price: '1.2tr',
  img: 'test-img.jpg'
};

describe('VenueCard', () => {
  it('renders venue name and area correctly', () => {
    render(<VenueCard venue={mockVenue} />);
    
    expect(screen.getByText('Club Test')).toBeInTheDocument();
    expect(screen.getByText('Hoàn Kiếm · Bar')).toBeInTheDocument();
  });

  it('renders badge if hasBadge is true', () => {
    const venueWithBadge = { ...mockVenue, hasBadge: true, badgeText: 'Mới' };
    render(<VenueCard venue={venueWithBadge} />);
    
    expect(screen.getByText('Mới')).toBeInTheDocument();
  });

  it('contains correct link to detail page', () => {
    render(<VenueCard venue={mockVenue} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/stores/test-venue-1');
  });
});
