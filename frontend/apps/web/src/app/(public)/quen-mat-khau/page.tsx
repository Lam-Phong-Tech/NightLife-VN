"use client";

import {
  requestPasswordReset,
  verifyPasswordResetCode,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.045)",
  panelStrong: "rgba(255,255,255,.075)",
  border: "rgba(212,178,106,.22)",
  borderStrong: "rgba(212,178,106,.34)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  danger: "#fca5a5",
  success: "#86efac",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function validateEmailInput(value: string) {
  if (!value) {
    return "Vui lòng nhập email.";
  }

  if (!emailPattern.test(value)) {
    return "Email chưa đúng định dạng.";
  }

  if (value.length > 254) {
    return "Email không được vượt quá 254 ký tự.";
  }

  return "";
}

function initialEmail() {
  if (typeof window === "undefined") return "";
  return normalizeEmail(new URLSearchParams(window.location.search).get("email") ?? "");
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("success");
  const [expiresInMinutes, setExpiresInMinutes] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedEmail = useMemo(() => normalizeEmail(email), [email]);

  const requestCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailError = validateEmailInput(normalizedEmail);
    setEmail(normalizedEmail);

    if (emailError) {
      setMessageTone("error");
      setMessage(emailError);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await requestPasswordReset({ email: normalizedEmail });
      setExpiresInMinutes(response.expiresInMinutes);
      setStep("code");
      setMessageTone("success");
      setMessage(response.message);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : "Không gửi được mã. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailError = validateEmailInput(normalizedEmail);
    const normalizedCode = code.trim();
    setEmail(normalizedEmail);
    setCode(normalizedCode);

    if (emailError) {
      setMessageTone("error");
      setMessage(emailError);
      return;
    }

    if (!normalizedCode) {
      setMessageTone("error");
      setMessage("Vui lòng nhập mã xác nhận.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setMessageTone("error");
      setMessage("Mã xác nhận phải gồm 6 chữ số.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await verifyPasswordResetCode({
        email: normalizedEmail,
        code: normalizedCode,
      });

      window.sessionStorage.setItem(
        "nightlife_password_reset",
        JSON.stringify({
          email: normalizedEmail,
          resetToken: response.resetToken,
          expiresAt: response.expiresAt,
        }),
      );
      router.push(`/dat-lai-mat-khau?email=${encodeURIComponent(normalizedEmail)}`);
    } catch (error) {
      setMessageTone("error");
      setMessage(error instanceof ApiError ? error.message : "Mã xác nhận chưa đúng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="nl-reset-auth-page" style={{ minHeight: "100dvh", background: colors.bg, color: colors.text }}>
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
            href="/dang-nhap"
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
            Quay lại đăng nhập
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
              {step === "email" ? "Quên mật khẩu" : "Nhập mã xác nhận"}
            </h1>
            <p style={{ margin: "7px 0 0", color: colors.muted, fontSize: 13.2, lineHeight: 1.5 }}>
              {step === "email"
                ? "Nhập email tài khoản, Vietyoru sẽ gửi mã gồm 6 chữ số có hiệu lực trong 15 phút."
                : `Mã đã được gửi tới ${normalizedEmail}. Nếu quá ${expiresInMinutes} phút chưa nhập, hãy yêu cầu mã mới.`}
            </p>

            <form onSubmit={step === "email" ? requestCode : verifyCode} style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <Field
                icon={<Mail size={16} />}
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="Vui lòng nhập email"
                disabled={step === "code"}
                type="email"
                autoComplete="email"
              />

              {step === "code" ? (
                <Field
                  label="Mã xác nhận"
                  value={code}
                  onChange={(value) => setCode(value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Nhập mã 6 số"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                />
              ) : null}

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
                disabled={isSubmitting}
                style={{
                  border: 0,
                  borderRadius: 14,
                  background: colors.goldGrad,
                  color: colors.onGold,
                  padding: "15px 18px",
                  fontWeight: 950,
                  fontSize: 15,
                  cursor: isSubmitting ? "default" : "pointer",
                  opacity: isSubmitting ? 0.72 : 1,
                }}
              >
                {isSubmitting ? "Đang xử lý..." : step === "email" ? "Gửi mã xác nhận" : "Xác nhận mã"}
              </button>

              {step === "code" ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setMessage("");
                  }}
                  style={{
                    border: `1px solid ${colors.border}`,
                    borderRadius: 14,
                    background: colors.panelStrong,
                    color: colors.goldPale,
                    padding: "13px 16px",
                    fontWeight: 850,
                    cursor: isSubmitting ? "default" : "pointer",
                  }}
                >
                  Nhập email khác hoặc gửi mã mới
                </button>
              ) : null}
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
  disabled,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  type?: React.HTMLInputTypeAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  autoComplete?: string;
  maxLength?: number;
}) {
  return (
    <label className="nl-reset-auth-label" style={{ display: "grid", gap: 7, color: colors.muted, fontSize: 12, fontWeight: 850 }}>
      {label}
      <span
        className="nl-reset-auth-field"
        style={{
          display: "grid",
          gridTemplateColumns: icon ? "22px minmax(0,1fr)" : "minmax(0,1fr)",
          alignItems: "center",
          gap: 8,
          border: `1px solid ${colors.border}`,
          background: colors.panelStrong,
          borderRadius: 12,
          padding: "0 12px",
          color: colors.gold,
        }}
      >
        {icon}
        <input
          className="nl-reset-auth-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          maxLength={maxLength}
          style={{
            width: "100%",
            minWidth: 0,
            border: 0,
            outline: 0,
            background: "transparent",
            color: colors.text,
            padding: "14px 0",
            fontSize: 14,
            fontWeight: 750,
          }}
        />
      </span>
    </label>
  );
}
