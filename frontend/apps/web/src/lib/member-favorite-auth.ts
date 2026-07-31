"use client";

import { getAuthUser } from "@/lib/auth/session";
import {
  readStoredLanguage,
  type LanguageCode,
} from "@/lib/i18n/client-translations";

const favoriteLoginPromptId = "nl-favorite-login-prompt";

export type MemberLoginPromptIntent = "favorite" | "booking-history" | "account";

type LoginPromptCopy = {
  title: string;
  description: string;
  continueLabel: string;
  loginLabel: string;
};

const loginPromptCopy: Record<LanguageCode, Record<MemberLoginPromptIntent, LoginPromptCopy>> = {
  vi: {
    favorite: {
      title: "Cần đăng nhập để lưu yêu thích",
      description: "Đăng nhập hoặc đăng ký thành viên để tìm và lưu quán hoặc Cast yêu thích.",
      continueLabel: "Tiếp tục",
      loginLabel: "Đăng nhập / đăng ký",
    },
    "booking-history": {
      title: "Đăng nhập để xem lịch đặt",
      description: "Đăng nhập hoặc đăng ký để xem các lịch đặt và mã QR của bạn.",
      continueLabel: "Để sau",
      loginLabel: "Đăng nhập / đăng ký",
    },
    account: {
      title: "Đăng nhập để xem tài khoản",
      description: "Đăng nhập hoặc đăng ký để xem và quản lý thông tin tài khoản của bạn.",
      continueLabel: "Để sau",
      loginLabel: "Đăng nhập / đăng ký",
    },
  },
  en: {
    favorite: {
      title: "Sign in to save favorites",
      description: "Sign in or create a member account to find and save favorite venues or Cast.",
      continueLabel: "Continue",
      loginLabel: "Sign in / Register",
    },
    "booking-history": {
      title: "Sign in to view bookings",
      description: "Sign in or register to view your bookings and QR codes.",
      continueLabel: "Not now",
      loginLabel: "Sign in / Register",
    },
    account: {
      title: "Sign in to view your account",
      description: "Sign in or register to view and manage your account information.",
      continueLabel: "Not now",
      loginLabel: "Sign in / Register",
    },
  },
  ja: {
    favorite: {
      title: "お気に入りを保存するにはログインが必要です",
      description: "ログインまたは会員登録して、お気に入りの店舗やキャストを保存できます。",
      continueLabel: "続ける",
      loginLabel: "ログイン / 登録",
    },
    "booking-history": {
      title: "予約履歴を見るにはログインが必要です",
      description: "ログインまたは会員登録して、予約履歴とQRコードを確認できます。",
      continueLabel: "後で",
      loginLabel: "ログイン / 登録",
    },
    account: {
      title: "アカウントを見るにはログインが必要です",
      description: "ログインまたは会員登録して、アカウント情報を確認・管理できます。",
      continueLabel: "後で",
      loginLabel: "ログイン / 登録",
    },
  },
  ko: {
    favorite: {
      title: "즐겨찾기를 저장하려면 로그인이 필요합니다",
      description: "로그인하거나 회원가입하여 좋아하는 매장과 캐스트를 저장하세요.",
      continueLabel: "계속 보기",
      loginLabel: "로그인 / 가입",
    },
    "booking-history": {
      title: "예약 내역을 보려면 로그인이 필요합니다",
      description: "로그인하거나 회원가입하여 예약 내역과 QR 코드를 확인하세요.",
      continueLabel: "나중에",
      loginLabel: "로그인 / 가입",
    },
    account: {
      title: "계정을 보려면 로그인이 필요합니다",
      description: "로그인하거나 회원가입하여 계정 정보를 확인하고 관리하세요.",
      continueLabel: "나중에",
      loginLabel: "로그인 / 가입",
    },
  },
  zh: {
    favorite: {
      title: "登录后即可收藏",
      description: "登录或注册会员账号后，即可查找并收藏喜欢的店铺或 Cast。",
      continueLabel: "继续浏览",
      loginLabel: "登录 / 注册",
    },
    "booking-history": {
      title: "登录后查看预约记录",
      description: "登录或注册后即可查看您的预约记录和二维码。",
      continueLabel: "暂不登录",
      loginLabel: "登录 / 注册",
    },
    account: {
      title: "登录后查看账户",
      description: "登录或注册后即可查看和管理您的账户信息。",
      continueLabel: "暂不登录",
      loginLabel: "登录 / 注册",
    },
  },
};

export function hasMemberFavoriteAccess() {
  return getAuthUser()?.role?.toUpperCase() === "USER";
}

function memberLoginHref(redirectTo?: string) {
  const currentPath =
    `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
  const params = new URLSearchParams({
    lang: readStoredLanguage(),
    redirect: redirectTo || currentPath,
  });
  return `/dang-nhap?${params.toString()}`;
}

function closeFavoriteLoginPrompt() {
  document.getElementById(favoriteLoginPromptId)?.remove();
  document.removeEventListener("keydown", handleFavoriteLoginPromptKeydown);
}

function handleFavoriteLoginPromptKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeFavoriteLoginPrompt();
}

export function promptMemberLogin({
  intent,
  redirectTo,
}: {
  intent: MemberLoginPromptIntent;
  redirectTo?: string;
}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  closeFavoriteLoginPrompt();

  const activeLanguage = readStoredLanguage();
  const copy = loginPromptCopy[activeLanguage][intent];

  const backdrop = document.createElement("div");
  backdrop.id = favoriteLoginPromptId;
  backdrop.className = "nl-favorite-login-backdrop";
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeFavoriteLoginPrompt();
  });

  const dialog = document.createElement("section");
  dialog.className = "nl-favorite-login-dialog";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "nl-favorite-login-title");
  dialog.setAttribute("aria-describedby", "nl-favorite-login-description");

  const title = document.createElement("h2");
  title.id = "nl-favorite-login-title";
  title.textContent = copy.title;

  const description = document.createElement("p");
  description.id = "nl-favorite-login-description";
  description.textContent = copy.description;

  const actions = document.createElement("div");
  actions.className = "nl-favorite-login-actions";

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.className = "nl-favorite-login-secondary";
  continueButton.textContent = copy.continueLabel;
  continueButton.addEventListener("click", closeFavoriteLoginPrompt);

  const loginLink = document.createElement("a");
  loginLink.className = "nl-favorite-login-primary";
  loginLink.href = memberLoginHref(redirectTo);
  loginLink.textContent = copy.loginLabel;

  actions.append(continueButton, loginLink);
  dialog.append(title, description, actions);
  backdrop.append(dialog);

  document.addEventListener("keydown", handleFavoriteLoginPromptKeydown);
  document.body.append(backdrop);
  continueButton.focus();
}

export function redirectToLoginForFavorite() {
  if (hasMemberFavoriteAccess()) return;
  promptMemberLogin({ intent: "favorite" });
}

export function requireMemberFavoriteAccess() {
  if (hasMemberFavoriteAccess()) {
    return true;
  }

  redirectToLoginForFavorite();
  return false;
}
