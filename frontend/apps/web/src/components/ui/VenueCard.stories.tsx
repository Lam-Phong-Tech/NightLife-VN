import type { Meta, StoryObj } from '@storybook/react';
import { VenueCard } from './VenueCard';
import { Venue } from '@/types';

const meta = {
  title: 'UI/VenueCard',
  component: VenueCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
    },
  },
} satisfies Meta<typeof VenueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockVenue: Venue = {
  id: 'venue-mock',
  name: 'Sora Lounge',
  area: 'Quận 1',
  catLabel: 'Lounge VIP',
  rating: 4.8,
  reviews: 312,
  price: '2.5tr',
  hasBadge: true,
  badgeText: 'Mới Nhất',
  badgeColor: '#e0598a',
  img: "url('https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=480&q=70') center/cover",
};

export const Vertical: Story = {
  args: {
    venue: mockVenue,
    variant: 'vertical',
  },
};

export const Horizontal: Story = {
  args: {
    venue: mockVenue,
    variant: 'horizontal',
  },
};

export const WithoutBadge: Story = {
  args: {
    venue: {
      ...mockVenue,
      hasBadge: false,
    },
    variant: 'vertical',
  },
};
