"use client";

import { Eye, EyeOff, LockKeyhole, LogIn, Mail } from "lucide-react";
import React, { useMemo, useState } from "react";
import { activateExclusiveAuthSession, loginAdmin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { LoginPageSessionRedirect } from "@/components/auth/LoginPageSessionRedirect";

const colors = {
  bg: "#0c0c0f",
  surface1: "rgba(255,255,255,.035)",
  surface2: "rgba(255,255,255,.04)",
  borderGold12: "rgba(212,178,106,.18)",
  borderGold22: "rgba(212,178,106,.22)",
  borderGold32: "rgba(212,178,106,.32)",
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  onGold: "#241a0a",
  gold: "#d4b26a",

  goldBright: "#e3c27e",
  goldPale: "#f0dda8",
  neonPink: "#e0729e",
  danger: "#fca5a5",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const maxAdminEmailLength = 254;
const maxAdminPasswordLength = 72;

const normalizeAdminEmail = (value: string) => value.trim().toLowerCase();
const normalizeAdminPassword = (value: string) => value.trim();

function validateAdminEmail(value: string) {
  const normalized = normalizeAdminEmail(value);

  if (!normalized) {
    return "Vui lòng nhập email.";
  }

  if (normalized.length > maxAdminEmailLength) {
    return `Email không được vượt quá ${maxAdminEmailLength} ký tự.`;
  }

  if (/[\s<>()[\]\\,;:"]/.test(normalized)) {
    return "Email chưa đúng định dạng.";
  }

  const parts = normalized.split("@");
  if (parts.length !== 2) {
    return "Email chưa đúng định dạng.";
  }

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart || localPart.length > 64 || domainPart.length > 253) {
    return "Email chưa đúng định dạng.";
  }

  const domainLabels = domainPart.split(".");
  const topLevelDomain = domainLabels.at(-1) ?? "";
  const validDomain = domainLabels.length >= 2 && domainLabels.every((label) =>
    /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label),
  );

  if (
    !/^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/i.test(localPart) ||
    !validDomain ||
    !/^[a-z]{2,63}$/i.test(topLevelDomain)
  ) {
    return "Email chưa đúng định dạng.";
  }

  return "";
}

function validateAdminPassword(value: string) {
  const normalized = normalizeAdminPassword(value);

  if (!normalized) {
    return "Vui lòng nhập mật khẩu.";
  }

  if (normalized.length < 8) {
    return "Mật khẩu cần tối thiểu 8 ký tự.";
  }

  if (normalized.length > maxAdminPasswordLength) {
    return `Mật khẩu không được vượt quá ${maxAdminPasswordLength} ký tự.`;
  }

  return "";
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "/admin";
    return new URLSearchParams(window.location.search).get("redirect") || "/admin";
  }, []);
  const emailError = validateAdminEmail(email);
  const passwordError = validateAdminPassword(password);
  const showEmailError = Boolean(emailError && (touched.email || submitAttempted));
  const showPasswordError = Boolean(passwordError && (touched.password || submitAttempted));
  const hasFieldErrors = Boolean(emailError || passwordError);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const normalizedEmail = normalizeAdminEmail(email);
    const normalizedPassword = normalizeAdminPassword(password);

    setSubmitAttempted(true);
    setTouched({ email: true, password: true });
    setEmail(normalizedEmail);
    setPassword(normalizedPassword);
    setMessage("");

    if (hasFieldErrors) {
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await loginAdmin({
        email: normalizedEmail,
        password: normalizedPassword,
      });

      await activateExclusiveAuthSession(session, { redirectTo });
    } catch (error) {
      const detail =
        error instanceof ApiError ? error.message : "Khong ket noi duoc API dang nhap.";
      setMessage(`${detail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="nl-auth-page nl-admin-login-page"
      style={{
        minHeight: "100vh",
        background: colors.bg,
        color: colors.text,
        fontFamily: "var(--nl-font-sans)",
        padding: "34px",
      }}
    >
      <LoginPageSessionRedirect requestedPortal="admin" />
      <div
        className="nl-admin-login-layout"
        style={{
          minHeight: "calc(100vh - 68px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <section
          className="nl-admin-login-card"
          style={{
            alignSelf: "center",
            width: "100%",
            maxWidth: "520px",
            border: `1px solid ${colors.borderGold22}`,
            borderRadius: "20px",
            background: colors.surface1,
            padding: "40px 48px",
            boxShadow: "0 16px 34px -18px rgba(0,0,0,.7)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "28px", fontWeight: 600 }}>Đăng nhập quản trị</h2>
            </div>
          </div>

          <form
            noValidate
            autoComplete="off"
            data-form-type="other"
            data-lpignore="true"
            data-1p-ignore="true"
            data-bwignore="true"
            onSubmit={submit}
            style={{ display: "grid", gap: "20px" }}
          >
            <label
              style={{
                display: "grid",
                gap: "8px",
                color: colors.text2,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Email
              <span style={{ position: "relative", display: "block" }}>
                <Mail
                  size={20}
                  color={colors.gold}
                  style={{ position: "absolute", left: 16, top: 16 }}
                />
                <input
                  id="email"
                  name="nl-admin-login-email"
                  type="email"
                  autoComplete="off"
                  aria-autocomplete="none"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  value={email}
                  aria-invalid={showEmailError}
                  aria-describedby={showEmailError ? "admin-login-email-error" : undefined}
                  onBlur={() => setTouched((current) => ({ ...current, email: true }))}
                  onChange={(event) => {
                    setTouched((current) => ({ ...current, email: true }));
                    setEmail(event.target.value);
                    setMessage("");
                  }}
                  style={{
                    minHeight: "52px",
                    width: "100%",
                    border: `1px solid ${showEmailError ? colors.danger : colors.borderGold22}`,
                    borderRadius: "12px",
                    padding: "0 16px 0 48px",
                    color: colors.text,
                    background: colors.surface2,
                    fontSize: "16px",
                    outline: "none",
                  }}
                />
              </span>
              {showEmailError ? (
                <span
                  id="admin-login-email-error"
                  role="alert"
                  style={{ color: colors.danger, fontSize: "12px", lineHeight: 1.45, fontWeight: 600 }}
                >
                  {emailError}
                </span>
              ) : null}
            </label>
            <label
              style={{
                display: "grid",
                gap: "8px",
                color: colors.text2,
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Mật khẩu
              <span style={{ position: "relative", display: "block" }}>
                <LockKeyhole
                  size={20}
                  color={colors.gold}
                  style={{ position: "absolute", left: 16, top: 16 }}
                />
                <input
                  id="password"
                  name="nl-admin-login-passcode"
                  autoComplete="off"
                  aria-autocomplete="none"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-bwignore="true"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  aria-invalid={showPasswordError}
                  aria-describedby={showPasswordError ? "admin-login-password-error" : undefined}
                  onBlur={() => setTouched((current) => ({ ...current, password: true }))}
                  onChange={(event) => {
                    setTouched((current) => ({ ...current, password: true }));
                    setPassword(event.target.value);
                    setMessage("");
                  }}
                  style={{
                    minHeight: "52px",
                    width: "100%",
                    border: `1px solid ${showPasswordError ? colors.danger : colors.borderGold22}`,
                    borderRadius: "12px",
                    padding: "0 52px 0 48px",
                    color: colors.text,
                    background: colors.surface2,
                    fontSize: "16px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 10,
                    width: 32,
                    height: 32,
                    border: 0,
                    borderRadius: 8,
                    background: "transparent",
                    color: colors.gold,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </span>
              {showPasswordError ? (
                <span
                  id="admin-login-password-error"
                  role="alert"
                  style={{ color: colors.danger, fontSize: "12px", lineHeight: 1.45, fontWeight: 600 }}
                >
                  {passwordError}
                </span>
              ) : null}
            </label>

            {message ? (
              <div style={{ marginTop: "12px", color: colors.neonPink, fontSize: "13px" }}>
                {message}
              </div>
            ) : null}

            <button
              className="nl-admin-login-submit"
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                minHeight: "52px",
                marginTop: "24px",
                border: 0,
                borderRadius: "12px",
                background: colors.goldGrad,
                color: colors.onGold,
                fontSize: "16px",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                cursor: isSubmitting ? "wait" : "pointer",
                opacity: isSubmitting || (submitAttempted && hasFieldErrors) ? 0.72 : 1,
              }}
            >
              <LogIn size={20} />
              {isSubmitting ? "Đang đăng nhập..." : "Vào trang admin"}
            </button>
          </form>

          <div
            style={{
              marginTop: "24px",
              color: colors.muted,
              textAlign: "center",
              fontSize: "13px",
            }}
          >
            Khu vực dành riêng cho quản trị viên Vietyoru.
          </div>
        </section>
      </div>
    </main>
  );
}
