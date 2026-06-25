export interface Venue {
  name: string;
  area: string;
  catLabel: string;
  rating: number;
  img?: string;
  grad?: string;
  price?: string;
  tag?: string;
  label?: string;
  style?: Record<string, string | number>;
  date?: string;
  time?: string;
  code?: string;
  st?: string;
  favIcon?: string;
  favIconDark?: string;
  mainBg?: string;
  open?: () => void;
  
}

export interface Cast {
  name?: string;
  area?: string;
  toggle?: () => void;
  
}

export type Coupon = Record<string, unknown>;
export type Booking = Record<string, unknown>;
export type Bill = Record<string, unknown>;
export type PartnerAccount = Record<string, unknown>;

export interface FAQ {
  toggle?: () => void;
  question?: string;
  answer?: string;
  
}
