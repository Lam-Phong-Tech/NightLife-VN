"use client";

import { getAuthUser } from "@/lib/auth/session";

export function hasMemberFavoriteAccess() {
  return getAuthUser()?.role?.toUpperCase() === "USER";
}

export function redirectToLoginForFavorite() {
  if (typeof window === "undefined") return;

  const currentPath =
    `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
  window.location.href = `/dang-nhap?redirect=${encodeURIComponent(currentPath)}`;
}

export function requireMemberFavoriteAccess() {
  if (hasMemberFavoriteAccess()) {
    return true;
  }

  redirectToLoginForFavorite();
  return false;
}
