import React from 'react';

export interface BaseItem {
  id?: string;
  name: string;
  area?: string;
  rating?: number;
  favIcon?: string;
  favIconDark?: string;
  img?: string;
  open?: () => void;
  fav?: (e: React.MouseEvent) => void;
}

export interface Venue extends BaseItem {
  catLabel?: string;
  price?: string;
  reviews?: number;
  grad?: string;
  hasBadge?: boolean;
  badgeText?: string;
  badgeColor?: string;
  metric?: string; // used in rank list
  rank?: string;
  numColor?: string;
  crown?: string;
}

export interface Cast extends BaseItem {
  age?: number;
  desc?: string;
  jp?: boolean;
  metric?: string; // used in rank list
  rank?: string;
  numColor?: string;
  crown?: string;
}

export interface Coupon {
  id?: string;
  title: string;
  place: string;
  value: string;
  expiry: string;
  img: string;
  btnLabel: string;
  btnStyle?: React.CSSProperties;
  take?: () => void;
  label?: string;
  color?: string;
  bg?: string;
  dim?: string;
}

export interface Booking {
  id: string;
  venueName: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface Bill {
  id: string;
  bookingId: string;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'paid';
  date: string;
}

export interface PartnerAccount {
  id: string;
  username: string;
  email: string;
  role: 'partner' | 'admin';
  venueId?: string;
}
