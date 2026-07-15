"use client";

import { resetPassword } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.045)",
  panelStrong: "rgba(255,255,255,.075)",
  border: "rgba(212,178,106,.22)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  danger: "#fca5a5",
  success: "#86efac",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

type ResetSession = {
  email: string;
  resetToken: string;
  expiresAt: string;
};

const passwordRules = [
  { test: (value: string) => value.length >= 8, message: "Mật khẩu cần tối thiểu 8 ký tự." },
  { test: (value: string) => /[a-z]/.test(value), message: "Mật khẩu cần có chữ thường." },
  { test: (value: string) => /[A-Z]/.test(value), message: "Mật khẩu cần có chữ hoa." },
  { test: (value: string) => /\d/.test(value), message: "Mật khẩu cần có chữ số." },
];

function normalizePassword(value: string) {
  return value.trim();
}

function getResetSession(): ResetSession | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.sessionStorage.getItem("nightlife_password_reset");
    if (!value) return null;

    const parsed = JSON.parse(value) as ResetSession;
    if (!parsed.email || !parsed.resetToken || !parsed.expiresAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [resetSession, setResetSession] = useState<ResetSession | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const session = getResetSession();
      setResetSession(session);

      if (!session) {
        setMessageTone("error");
        setMessage("Phiên đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới.");
        return;
      }

      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        window.sessionStorage.removeItem("nightlife_password_reset");
        setMessageTone("error");
        setMessage("Mã xác nhận đã hết hạn sau 15 phút. Vui lòng yêu cầu mã mới.");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const expiresAtLabel = useMemo(() => {
    if (!resetSession?.expiresAt) return "";

    const date = new Date(resetSession.expiresAt);
    if (!Number.isFinite(date.getTime())) return "";

    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    }).format(date);
  }, [resetSession]);

  const validate = () => {
    const normalizedPassword = normalizePassword(password);
    const normalizedConfirmPassword = normalizePassword(confirmPassword);

    if (!resetSession) {
      return "Phiên đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu mã mới.";
    }

    if (!normalizedPassword) {
      return "Vui lòng nhập mật khẩu mới.";
    }

    if (normalizedPassword.length > 72) {
      return "Mật khẩu không được vượt quá 72 ký tự.";
    }

    const failedRule = passwordRules.find((rule) => !rule.test(normalizedPassword));
    if (failedRule) {
      return failedRule.message;
    }

    if (!normalizedConfirmPassword) {
      return "Vui lòng nhập lại mật khẩu.";
    }

    if (normalizedPassword !== normalizedConfirmPassword) {
      return "Mật khẩu nhập lại chưa khớp.";
    }

    return "";
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedPassword = normalizePassword(password);
    const normalizedConfirmPassword = normalizePassword(confirmPassword);
    setPassword(normalizedPassword);
    setConfirmPassword(normalizedConfirmPassword);
    const validationMessage = validate();

    if (validationMessage) {
      setMessageTone("error");
      setMessage(validationMessage);
      return;
    }

    if (!resetSession) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      await resetPassword({
        email: resetSession.email,
        resetToken: resetSession.resetToken,
        password: normalizedPassword,
        confirmPassword: normalizedConfirmPassword,
      });
      window.sessionStorage.removeItem("nightlife_password_reset");
      setMessageTone("success");
      setMessage("Đổi mật khẩu thành công. Đang chuyển về trang đăng nhập...");
      window.setTimeout(() => {
        router.replace("/dang-nhap?reset=success");
      }, 900);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : "Không đổi được mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="nl-auth-page nl-reset-auth-page" style={{ minHeight: "100dvh", background: colors.bg, color: colors.text }}>
      <section
        className="nl-reset-auth-shell"
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "clamp(46px, 7dvh, 68px) 16px clamp(34px, 5dvh, 52px)",
          background:
            "linear-gradient(180deg,rgba(12,12,15,.65),rgba(12,12,15,.96)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80') center/cover",
        }}
      >
        <div style={{ width: "100%", maxWidth: 430 }}>
          <Link
            href="/quen-mat-khau"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: colors.goldPale,
              fontSize: 13,
              fontWeight: 850,
              marginBottom: 12,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={17} />
            Quay lại nhập mã
          </Link>

          <div
            className="nl-reset-auth-card"
            style={{
              border: `1px solid ${colors.border}`,
              background: colors.panel,
              borderRadius: 18,
              padding: 20,
              minHeight: "min(500px, calc(100dvh - 124px))",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: "0 22px 60px rgba(0,0,0,.32)",
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: colors.goldGrad,
                color: colors.onGold,
                marginBottom: 14,
              }}
            >
              <ShieldCheck size={25} />
            </div>

            <h1 style={{ margin: 0, fontSize: 25, lineHeight: 1.12, fontWeight: 950 }}>
              Tạo mật khẩu mới
            </h1>
            <p style={{ margin: "7px 0 0", color: colors.muted, fontSize: 13.2, lineHeight: 1.5 }}>
              {resetSession
                ? `Đang đặt lại mật khẩu cho ${resetSession.email}${expiresAtLabel ? `, phiên hết hạn lúc ${expiresAtLabel}` : ""}.`
                : "Vui lòng xác thực mã email trước khi đặt mật khẩu mới."}
            </p>

            <form
              autoComplete="off"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              onSubmit={submit}
              style={{ display: "grid", gap: 12, marginTop: 18 }}
            >
              <Field
                icon={<LockKeyhole size={16} />}
                label="Mật khẩu mới"
                value={password}
                onChange={setPassword}
                placeholder="Vui lòng nhập mật khẩu mới"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
                action={
                  <button
                    type="button"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowPassword((current) => !current)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 32,
                      height: 32,
                      border: 0,
                      borderRadius: 8,
                      background: "transparent",
                      color: colors.gold,
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                }
              />
              <Field
                icon={<LockKeyhole size={16} />}
                label="Nhập lại mật khẩu mới"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Vui lòng nhập lại mật khẩu mới"
                type={showPassword ? "text" : "password"}
                autoComplete="off"
              />

              {message ? (
                <div
                  style={{
                    color: messageTone === "success" ? colors.success : colors.danger,
                    background: messageTone === "success" ? "rgba(134,239,172,.10)" : "rgba(252,165,165,.08)",
                    border:
                      messageTone === "success"
                        ? "1px solid rgba(134,239,172,.28)"
                        : "1px solid rgba(252,165,165,.24)",
                    borderRadius: 12,
                    padding: "10px 12px",
                    fontSize: 12.5,
                    lineHeight: 1.5,
                  }}
                >
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting || !resetSession}
                style={{
                  border: 0,
                  borderRadius: 14,
                  background: colors.goldGrad,
                  color: colors.onGold,
                  padding: "15px 18px",
                  fontWeight: 950,
                  fontSize: 15,
                  cursor: isSubmitting || !resetSession ? "default" : "pointer",
                  opacity: isSubmitting || !resetSession ? 0.72 : 1,
                }}
              >
                {isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  autoComplete,
  action,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  action?: React.ReactNode;
}) {
  return (
    <label className="nl-reset-auth-label" style={{ display: "grid", gap: 7, color: colors.muted, fontSize: 12, fontWeight: 850 }}>
      {label}
      <span
        className="nl-reset-auth-field"
        style={{
          display: "grid",
          gridTemplateColumns: `${icon ? "22px " : ""}minmax(0,1fr)${action ? " 34px" : ""}`,
          alignItems: "center",
          gap: 8,
          border: `1px solid ${colors.border}`,
          background: colors.panelStrong,
          borderRadius: 12,
          padding: "0 12px",
          boxSizing: "border-box",
          maxWidth: "100%",
          color: colors.gold,
        }}
      >
        {icon}
        <input
          className="nl-reset-auth-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete ?? "off"}
          aria-autocomplete="none"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          data-form-type="other"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          maxLength={72}
          style={{
            width: "100%",
            minWidth: 0,
            border: 0,
            outline: 0,
            background: "transparent",
            color: colors.text,
            padding: "14px 0",
            fontSize: 16,
            fontWeight: 750,
          }}
        />
        {action}
      </span>
    </label>
  );
}
