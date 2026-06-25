import React from 'react';

export interface Venue {
  name?: string;
  area?: string;
  catLabel?: string;
  rating?: number;
  jp?: boolean;
  img?: string;
  grad?: string;
  price?: string;
  tag?: string;
  label?: string;
  style?: React.CSSProperties;
  date?: string;
  time?: string;
  code?: string;
  st?: string;
  favIcon?: string;
  favIconDark?: string;
  mainBg?: string;
  open?: (e?: React.SyntheticEvent) => void;
  id?: string | number;
  hasBadge?: boolean;
  badgeColor?: string;
  badgeText?: string;
  fav?: (e?: React.SyntheticEvent) => void;
  reviews?: number;
  rank?: number;
  metric?: string | number;
  numColor?: string;
  crown?: string;
}

export interface Cast {
  name?: string;
  area?: string;
  toggle?: (e?: React.SyntheticEvent) => void;
  id?: string | number;
  fav?: (e?: React.SyntheticEvent) => void;
  favIcon?: string;
  age?: number;
  desc?: string;
  rating?: number;
  jp?: boolean;
  rank?: number;
  img?: string;
  open?: (e?: React.SyntheticEvent) => void;
}

export interface Coupon {
  img?: string;
  title?: string;
  sub?: string;
  right?: string;
  meta?: string;
  dim?: boolean;
  place?: string;
  btnLabel?: string;
  take?: (e?: React.SyntheticEvent) => void;
  value?: string | number;
  expiry?: string;
  btnStyle?: React.CSSProperties;
}

export type Booking = Record<string, unknown>;
export type Bill = Record<string, unknown>;
export type PartnerAccount = Record<string, unknown>;

export interface FAQ {
  toggle?: (e?: React.SyntheticEvent) => void;
  question?: string;
  answer?: string;
}

export interface FilterTab {
  label?: string;
  active?: boolean;
  textAlign?: string;
  flex?: number;
  video?: string;
  pick?: (e?: React.SyntheticEvent) => void;
  style?: React.CSSProperties;
}

export interface MockItem {
  id?: string | number;
  name?: string;
  label?: string;
  title?: string;
  sub?: string;
  right?: string;
  meta?: string;
  dim?: boolean;
  value?: string | number;
  desc?: string;
  price?: string | number;
  img?: string;
  bg?: string;
  style?: React.CSSProperties;
  onClick?: (e?: React.SyntheticEvent) => void;
  open?: (e?: React.SyntheticEvent) => void;
  take?: (e?: React.SyntheticEvent) => void;
  fav?: (e?: React.SyntheticEvent) => void;
  pick?: (e?: React.SyntheticEvent) => void;
  toggle?: (e?: React.SyntheticEvent) => void;
  date?: string;
  time?: string;
  code?: string;
  st?: string;
  area?: string;
  catLabel?: string;
  rating?: number;
  jp?: boolean;
  grad?: string;
  tag?: string;
  favIcon?: string;
  favIconDark?: string;
  mainBg?: string;
  rank?: string | number;
  numColor?: string;
  crown?: string;
  metric?: string | number;
  icon?: string;
  val?: string | number;
  place?: string;
  btnLabel?: string;
  expiry?: string;
  btnStyle?: React.CSSProperties;
  albumIcon?: string;
  type?: string;
  href?: string;
  color?: string;
  count?: number;
  hasBadge?: boolean;
  badgeColor?: string;
  badgeText?: string;
  isVideo?: boolean;
  active?: boolean;
  textAlign?: string;
  flex?: number;
  video?: string;
  cJp?: boolean;
  isIntro?: boolean;
  isPrice?: boolean;
  isCast?: boolean;
  isReview?: boolean;
  isReg?: boolean;
  step?: number;
  status?: string;
  point?: number;
  phone?: string;
  mail?: string;
  gender?: string;
  tier?: string;
  points?: number;
  need?: number;
  nextTier?: string;
  reviews?: number;
}
