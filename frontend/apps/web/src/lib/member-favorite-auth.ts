"use client";

import { getAuthUser } from "@/lib/auth/session";

const favoriteLoginPromptId = "nl-favorite-login-prompt";

export function hasMemberFavoriteAccess() {
  return getAuthUser()?.role?.toUpperCase() === "USER";
}

function favoriteLoginHref() {
  const currentPath =
    `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
  return `/dang-nhap?redirect=${encodeURIComponent(currentPath)}`;
}

function closeFavoriteLoginPrompt() {
  document.getElementById(favoriteLoginPromptId)?.remove();
  document.removeEventListener("keydown", handleFavoriteLoginPromptKeydown);
}

function handleFavoriteLoginPromptKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") closeFavoriteLoginPrompt();
}

export function redirectToLoginForFavorite() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (hasMemberFavoriteAccess()) return;

  closeFavoriteLoginPrompt();

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
  title.textContent = "Cần đăng nhập để lưu yêu thích";

  const description = document.createElement("p");
  description.id = "nl-favorite-login-description";
  description.textContent =
    "Bạn vẫn có thể tiếp tục xem nội dung, nhưng cần đăng nhập hoặc đăng ký thành viên để tim và lưu quán hoặc Cast yêu thích.";

  const actions = document.createElement("div");
  actions.className = "nl-favorite-login-actions";

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.className = "nl-favorite-login-secondary";
  continueButton.textContent = "Tiếp tục";
  continueButton.addEventListener("click", closeFavoriteLoginPrompt);

  const loginLink = document.createElement("a");
  loginLink.className = "nl-favorite-login-primary";
  loginLink.href = favoriteLoginHref();
  loginLink.textContent = "Đăng nhập / đăng ký";

  actions.append(continueButton, loginLink);
  dialog.append(title, description, actions);
  backdrop.append(dialog);

  document.addEventListener("keydown", handleFavoriteLoginPromptKeydown);
  document.body.append(backdrop);
}

export function requireMemberFavoriteAccess() {
  if (hasMemberFavoriteAccess()) {
    return true;
  }

  redirectToLoginForFavorite();
  return false;
}
