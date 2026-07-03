"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, Sparkles } from "lucide-react";
import {
  getGoogleLoginConfig,
  getLineLoginConfig,
  loginGoogleMember,
  loginMember,
  registerMember,
} from "@/lib/api/auth";
import { ApiError, translateApiMessage } from "@/lib/api/client";
import { setAuthSession } from "@/lib/auth/session";

const colors = {
  bg: "#0c0c0f",
  panel: "rgba(255,255,255,.045)",
  panelStrong: "rgba(255,255,255,.075)",
  border: "rgba(212,178,106,.22)",
  borderStrong: "rgba(212,178,106,.34)",
  text: "#f3f0ea",
  muted: "#b6b1a6",
  dim: "#8c8679",
  gold: "#d4b26a",
  goldPale: "#f0dda8",
  onGold: "#241a0a",
  danger: "#fca5a5",
  success: "#86efac",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
};

const googleLogoSrc = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";
const buildTimeGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const lineLogoSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2306C755'/%3E%3Cpath fill='%23fff' d='M32 14c-11.6 0-21 7.4-21 16.6 0 8.2 7.5 15.1 17.6 16.4.7.1 1.6.5 1.8 1.1.2.5.1 1.3.1 1.8l-.3 2c-.1.6-.4 2.2 1.8 1.2 2.2-1 11.8-7 16.1-12 3-3.3 4.9-6.7 4.9-10.5C53 21.4 43.6 14 32 14Z'/%3E%3Cpath fill='%2306C755' d='M20.4 35.2h8v-3.1h-4.5v-7.3h-3.5v10.4Zm10.2 0h3.5V24.8h-3.5v10.4Zm6 0H40v-5.6l4.3 5.6h3V24.8h-3.4v5.5l-4.2-5.5h-3.1v10.4Zm12.8 0v-3h-3.9v-1h3.5v-2.8h-3.5v-.7h3.9v-2.9h-7.2v10.4h7.2Z'/%3E%3C/svg%3E";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const passwordRules = [
  { test: (value: string) => value.length >= 8, message: "Mật khẩu cần tối thiểu 8 ký tự." },
  { test: (value: string) => /[a-z]/.test(value), message: "Mật khẩu cần có chữ thường." },
  { test: (value: string) => /[A-Z]/.test(value), message: "Mật khẩu cần có chữ hoa." },
  { test: (value: string) => /\d/.test(value), message: "Mật khẩu cần có chữ số." },
];

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function validateAuthForm({
  isReg,
  displayName,
  email,
  password,
  confirmPassword,
}: {
  isReg: boolean;
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) {
  const normalizedEmail = normalizeEmail(email);
  const trimmedName = displayName.trim();

  if (isReg && trimmedName.length < 2) {
    return "Vui lòng nhập họ tên tối thiểu 2 ký tự.";
  }

  if (isReg && trimmedName.length > 80) {
    return "Họ tên không được vượt quá 80 ký tự.";
  }

  if (!normalizedEmail) {
    return "Vui lòng nhập email.";
  }

  if (!emailPattern.test(normalizedEmail)) {
    return "Email chưa đúng định dạng.";
  }

  if (normalizedEmail.length > 254) {
    return "Email không được vượt quá 254 ký tự.";
  }

  if (!password) {
    return "Vui lòng nhập mật khẩu.";
  }

  if (password.length > 72) {
    return "Mật khẩu không được vượt quá 72 ký tự.";
  }

  if (isReg) {
    const failedRule = passwordRules.find((rule) => !rule.test(password));

    if (failedRule) {
      return failedRule.message;
    }

    if (!confirmPassword) {
      return "Vui lòng nhập lại mật khẩu.";
    }

    if (password !== confirmPassword) {
      return "Mật khẩu nhập lại chưa khớp.";
    }
  } else if (password.length < 8) {
    return "Mật khẩu cần tối thiểu 8 ký tự.";
  }

  return "";
}

export default function Page() {
  const [isReg, setIsReg] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState(() => {
    if (typeof window === "undefined") return "";

    return translateApiMessage(
      new URLSearchParams(window.location.search).get("line_error"),
      undefined,
      "",
    );
  });
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(buildTimeGoogleClientId);
  const [isGoogleConfigLoading, setIsGoogleConfigLoading] = useState(!buildTimeGoogleClientId);
  const [googleReadyClientId, setGoogleReadyClientId] = useState("");
  const [isLineConfigLoading, setIsLineConfigLoading] = useState(true);
  const [isLineConfigured, setIsLineConfigured] = useState(false);
  const googleTokenClientRef = useRef<GoogleTokenClient | null>(null);
  const isGoogleReady = googleReadyClientId === googleClientId && Boolean(googleClientId);
  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return "/tai-khoan";

    const redirect = new URLSearchParams(window.location.search).get("redirect");

    if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
      return "/tai-khoan";
    }

    return redirect;
  }, []);

  const title = isReg ? "Tạo tài khoản hội viên" : "Đăng nhập hội viên";
  const subtitle = isReg
    ? "Tạo tài khoản để lưu ưu đãi, lịch đặt chỗ và điểm tích luỹ."
    : "Tiếp tục đặt chỗ, lưu quán yêu thích và quản lý mã ưu đãi.";

  const switchMode = (nextIsReg: boolean) => {
    setIsReg(nextIsReg);
    setConfirmPassword("");
    setMessage("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = normalizeEmail(email);
    const trimmedDisplayName = displayName.trim();
    const validationMessage = validateAuthForm({
      isReg,
      displayName,
      email,
      password,
      confirmPassword,
    });

    if (validationMessage) {
      setMessageTone("error");
      setMessage(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (isReg) {
        const session = await registerMember({
          email: normalizedEmail,
          password,
          displayName: trimmedDisplayName,
        });
        setAuthSession(session);
        window.location.href = redirectTo;
        return;
      }

      const session = await loginMember({ email: normalizedEmail, password });
      setAuthSession(session);
      window.location.href = redirectTo;
    } catch (error) {
      const detail =
        error instanceof ApiError
          ? error.message
          : isReg
            ? "Không kết nối được API đăng ký."
            : "Không kết nối được API đăng nhập.";
      setMessageTone("error");
      setMessage(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleTokenResponse = useCallback(
    async (response: GoogleTokenResponse) => {
      if (response.error || !response.access_token) {
        setMessageTone("error");
        setMessage("Không nhận được thông tin xác thực từ Google.");
        return;
      }

      setIsGoogleSubmitting(true);
      setMessage("");

      try {
        const session = await loginGoogleMember({
          accessToken: response.access_token,
        });
        setAuthSession(session);
        window.location.href = redirectTo;
      } catch (error) {
        const detail =
          error instanceof ApiError ? error.message : "Không kết nối được API đăng nhập Google.";
        setMessageTone("error");
        setMessage(detail);
      } finally {
        setIsGoogleSubmitting(false);
      }
    },
    [redirectTo],
  );

  useEffect(() => {
    if (buildTimeGoogleClientId) {
      return;
    }

    let mounted = true;

    getGoogleLoginConfig()
      .then((config) => {
        if (!mounted) {
          return;
        }

        setGoogleClientId(config.clientId || "");
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setGoogleClientId("");
      })
      .finally(() => {
        if (mounted) {
          setIsGoogleConfigLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    getLineLoginConfig()
      .then((config) => {
        if (!mounted) {
          return;
        }

        setIsLineConfigured(config.configured);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setIsLineConfigured(false);
      })
      .finally(() => {
        if (mounted) {
          setIsLineConfigLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    googleTokenClientRef.current = null;

    if (!googleClientId) {
      return () => {
        mounted = false;
      };
    }

    const initializeGoogleTokenClient = () => {
      if (!mounted || !googleClientId || !window.google?.accounts.oauth2) {
        return;
      }

      googleTokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "openid email profile",
        callback: handleGoogleTokenResponse,
      });
      setGoogleReadyClientId(googleClientId);
    };

    if (window.google?.accounts.oauth2) {
      initializeGoogleTokenClient();
      return () => {
        mounted = false;
      };
    }

    const existingScript = document.getElementById("google-identity-services");

    if (existingScript) {
      existingScript.addEventListener("load", initializeGoogleTokenClient, {
        once: true,
      });
      return () => {
        mounted = false;
        existingScript.removeEventListener("load", initializeGoogleTokenClient);
      };
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleTokenClient;
    script.onerror = () => {
      if (!mounted) {
        return;
      }

      setGoogleReadyClientId("");
      setMessageTone("error");
      setMessage("Không tải được nút đăng nhập Google.");
    };
    document.head.appendChild(script);

    return () => {
      mounted = false;
      script.onload = null;
      script.onerror = null;
    };
  }, [googleClientId, handleGoogleTokenResponse]);

  const startGoogleLogin = () => {
    if (isGoogleSubmitting) {
      return;
    }

    if (isGoogleConfigLoading) {
      setMessageTone("error");
      setMessage("Đang tải cấu hình đăng nhập Google. Vui lòng thử lại sau vài giây.");
      return;
    }

    if (!googleClientId) {
      setMessageTone("error");
      setMessage(
        "Thiếu GOOGLE_CLIENT_ID trên backend hoặc NEXT_PUBLIC_GOOGLE_CLIENT_ID cho đăng nhập Google.",
      );
      return;
    }

    if (!isGoogleReady || !googleTokenClientRef.current) {
      setMessageTone("error");
      setMessage("Google đang tải chưa xong. Vui lòng thử lại sau vài giây.");
      return;
    }

    setMessage("");
    googleTokenClientRef.current.requestAccessToken({
      prompt: "select_account",
    });
  };

  const startLineConsent = () => {
    if (isLineConfigLoading) {
      setMessageTone("error");
      setMessage("Đang tải cấu hình đăng nhập LINE. Vui lòng thử lại sau vài giây.");
      return;
    }

    if (!isLineConfigured) {
      setMessageTone("error");
      setMessage(
        "Thiếu cấu hình LINE_CHANNEL_ID, LINE_CHANNEL_SECRET hoặc LINE_CALLBACK_URL trên backend.",
      );
      return;
    }

    const params = new URLSearchParams({ redirect: redirectTo });
    window.location.href = `/line-email-consent?${params.toString()}`;
  };

  return (
    <main
      className="nl-login-page"
      style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}
    >
      <div
        className="nl-login-shell"
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "minmax(0,1.05fr) minmax(0,.95fr)",
        }}
      >
        <section
          className="nl-login-visual"
          style={{
            position: "relative",
            minHeight: "100vh",
            padding: "34px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background:
              "linear-gradient(180deg,rgba(12,12,15,.2),rgba(12,12,15,.88)),url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1400&q=80') center/cover",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              flexDirection: "column",
              textDecoration: "none",
              width: "fit-content",
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                lineHeight: 1,
                background: colors.goldGrad,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Vietyoru
            </span>
            <span
              style={{ marginTop: 5, color: colors.goldPale, fontSize: 9, letterSpacing: ".38em" }}
            >
              VIETNAM NIGHTLIFE GUIDE
            </span>
          </Link>

          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: colors.goldPale,
                border: `1px solid ${colors.borderStrong}`,
                borderRadius: 999,
                padding: "7px 12px",
                fontSize: 12,
                fontWeight: 800,
                background: "rgba(12,12,15,.42)",
              }}
            >
              <Sparkles size={15} />
              MEMBER ACCESS
            </span>
            <h1
              style={{
                marginTop: 18,
                maxWidth: 560,
                fontSize: 46,
                lineHeight: 1.05,
                fontWeight: 900,
              }}
            >
              Giữ mọi cuộc hẹn nightlife trong một tài khoản.
            </h1>
          </div>
        </section>

        <section
          className="nl-login-form-section"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "34px",
          }}
        >
          <div style={{ width: "100%", maxWidth: 430 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: colors.muted,
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 24,
              }}
            >
              <ArrowLeft size={17} />
              Quay về trang chủ
            </Link>

            <div
              className="nl-login-card"
              style={{
                border: `1px solid ${colors.border}`,
                background: colors.panel,
                borderRadius: 18,
                padding: 22,
                boxShadow: "0 22px 60px rgba(0,0,0,.32)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  background: colors.panelStrong,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 14,
                  padding: 5,
                }}
              >
                <Tab active={!isReg} label="Đăng nhập" onClick={() => switchMode(false)} />
                <Tab active={isReg} label="Đăng ký" onClick={() => switchMode(true)} />
              </div>

              <h2 style={{ marginTop: 24, fontSize: 26, lineHeight: 1.12, fontWeight: 900 }}>
                {title}
              </h2>
              <p style={{ marginTop: 8, color: colors.muted, fontSize: 13.5, lineHeight: 1.6 }}>
                {subtitle}
              </p>

              <form noValidate onSubmit={submit} style={{ marginTop: 24, display: "grid", gap: 14 }}>
                {isReg ? (
                  <Field
                    label="Họ tên"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    name="name"
                    required
                    minLength={2}
                    maxLength={80}
                  />
                ) : null}
                <Field
                  icon={<Mail size={16} />}
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="member@nightlife.vn"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  name="email"
                  required
                  maxLength={254}
                />
                <Field
                  icon={<LockKeyhole size={16} />}
                  label="Mật khẩu"
                  value={password}
                  onChange={setPassword}
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isReg ? "new-password" : "current-password"}
                  name="password"
                  required
                  minLength={8}
                  maxLength={72}
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
                {isReg ? (
                  <Field
                    icon={<LockKeyhole size={16} />}
                    label="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    name="confirmPassword"
                    required
                    minLength={8}
                    maxLength={72}
                  />
                ) : null}

                {message ? (
                  <div
                    style={{
                      color: messageTone === "success" ? colors.success : colors.danger,
                      background:
                        messageTone === "success"
                          ? "rgba(134,239,172,.10)"
                          : "rgba(252,165,165,.08)",
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
                    fontWeight: 900,
                    fontSize: 15,
                    cursor: isSubmitting ? "default" : "pointer",
                    opacity: isSubmitting ? 0.72 : 1,
                  }}
                >
                  {isSubmitting ? "Đang xác thực..." : isReg ? "Tạo tài khoản" : "Đăng nhập"}
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <SocialButton
                    logoSrc={googleLogoSrc}
                    logoAlt="Google"
                    label="Google"
                    onClick={startGoogleLogin}
                    disabled={
                      isGoogleSubmitting ||
                      isGoogleConfigLoading ||
                      !googleClientId ||
                      !isGoogleReady
                    }
                  />
                  <SocialButton
                    logoSrc={lineLogoSrc}
                    logoAlt="LINE"
                    label="LINE"
                    onClick={startLineConsent}
                    disabled={isLineConfigLoading}
                  />
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
      <style jsx global>{`
        @media (max-width: 767px) {
          .nl-login-page {
            overflow-x: hidden;
          }

          .nl-login-page .nl-login-shell {
            display: block !important;
            min-height: 100vh !important;
          }

          .nl-login-page .nl-login-visual {
            min-height: 300px !important;
            padding: 22px 20px !important;
            justify-content: space-between !important;
          }

          .nl-login-page .nl-login-visual h1 {
            max-width: 330px !important;
            font-size: 34px !important;
            line-height: 1.08 !important;
            margin-top: 18px !important;
          }

          .nl-login-page .nl-login-form-section {
            min-height: auto !important;
            padding: 20px !important;
            align-items: flex-start !important;
          }

          .nl-login-page .nl-login-card {
            width: 100% !important;
            padding: 18px !important;
            border-radius: 16px !important;
            background: rgba(255, 255, 255, 0.055) !important;
          }
        }
      `}</style>
    </main>
  );
}

function Tab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        border: 0,
        borderRadius: 10,
        padding: "11px 12px",
        background: active ? colors.goldGrad : "transparent",
        color: active ? colors.onGold : colors.muted,
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  inputMode,
  name,
  required,
  minLength,
  maxLength,
  action,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  name?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  action?: React.ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={{ color: colors.muted, fontSize: 12.5, fontWeight: 800 }}>{label}</span>
      <span
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          gap: 9,
          border: `1px solid ${colors.border}`,
          borderRadius: 12,
          background: colors.panelStrong,
          padding: "0 13px",
          color: colors.text,
        }}
      >
        {icon ? <span style={{ color: colors.gold, display: "inline-flex" }}>{icon}</span> : null}
        <input
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
          minLength={minLength}
          maxLength={maxLength}
          style={{
            flex: 1,
            minWidth: 0,
            border: 0,
            outline: "none",
            background: "transparent",
            color: colors.text,
            fontSize: 14,
          }}
        />
        {action ? (
          <span style={{ color: colors.gold, display: "inline-flex" }}>{action}</span>
        ) : null}
      </span>
    </label>
  );
}

function SocialButton({
  logoSrc,
  logoAlt,
  label,
  onClick,
  disabled = false,
}: {
  logoSrc: string;
  logoAlt: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={`Đăng nhập bằng ${label}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        minHeight: 46,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        minWidth: 0,
        padding: "0 14px",
        border: `1px solid ${colors.borderStrong}`,
        borderRadius: 13,
        background:
          "linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.035)), #101013",
        color: colors.text,
        fontFamily: "inherit",
        fontSize: 13.5,
        fontWeight: 850,
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.68 : 1,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 12px 28px rgba(0,0,0,.22)",
      }}
    >
      <span
        aria-hidden="true"
        title={logoAlt}
        style={{
          width: 20,
          height: 20,
          flex: "none",
          background: `url("${logoSrc}") center / contain no-repeat`,
        }}
      />
      <span
        style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {label}
      </span>
    </button>
  );
}
