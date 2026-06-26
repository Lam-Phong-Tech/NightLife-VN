import { apiClient } from './client';
import type { AuthResponse } from '../auth/session';

export type LoginPayload = {
  email: string;
  password: string;
};

export const loginPartner = (payload: LoginPayload) => {
  return apiClient<AuthResponse>('/auth/login/partner', {
    method: 'POST',
    data: payload,
  });
};

export const loginAdmin = (payload: LoginPayload) => {
  return apiClient<AuthResponse>('/auth/login/admin', {
    method: 'POST',
    data: payload,
  });
};

export const loginMember = (payload: LoginPayload) => {
  return apiClient<AuthResponse>('/auth/login/member', {
    method: 'POST',
    data: payload,
  });
};

