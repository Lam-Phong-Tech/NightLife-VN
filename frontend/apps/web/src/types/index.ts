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
  [key: string]: any;
}

export interface Cast {
  name?: string;
  area?: string;
  toggle?: () => void;
  [key: string]: any;
}

export interface Coupon {
  [key: string]: any;
}

export interface Booking {
  [key: string]: any;
}

export interface Bill {
  [key: string]: any;
}

export interface PartnerAccount {
  [key: string]: any;
}

export interface FAQ {
  toggle?: () => void;
  question?: string;
  answer?: string;
  [key: string]: any;
}
