"use client";

import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Phone, Sparkles } from "lucide-react";
import {
  getGoogleLoginConfig,
  loginGoogleMember,
  loginMember,
  registerMember,
} from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
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

const demoPhoneEmailMap = new Map([["0912345678", "member@nightlife.vn"]]);
const googleLogoSrc = "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg";
const buildTimeGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
const lineLogoSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='14' fill='%2306C755'/%3E%3Cpath fill='%23fff' d='M32 14c-11.6 0-21 7.4-21 16.6 0 8.2 7.5 15.1 17.6 16.4.7.1 1.6.5 1.8 1.1.2.5.1 1.3.1 1.8l-.3 2c-.1.6-.4 2.2 1.8 1.2 2.2-1 11.8-7 16.1-12 3-3.3 4.9-6.7 4.9-10.5C53 21.4 43.6 14 32 14Z'/%3E%3Cpath fill='%2306C755' d='M20.4 35.2h8v-3.1h-4.5v-7.3h-3.5v10.4Zm10.2 0h3.5V24.8h-3.5v10.4Zm6 0H40v-5.6l4.3 5.6h3V24.8h-3.4v5.5l-4.2-5.5h-3.1v10.4Zm12.8 0v-3h-3.9v-1h3.5v-2.8h-3.5v-.7h3.9v-2.9h-7.2v10.4h7.2Z'/%3E%3C/svg%3E";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonText = "signin_with" | "signup_with";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              shape?: "rectangular" | "pill" | "circle" | "square";
              text?: GoogleButtonText;
              width?: number;
            },
          ) => void;
        };
      };
    };
  }
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function getPhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function phoneToAuthEmail(phone: string) {
  const digits = getPhoneDigits(phone);
  return demoPhoneEmailMap.get(digits) ?? `${digits}@phone.vietyoru.local`;
}

export default function Page() {
  const [isReg, setIsReg] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [googleClientId, setGoogleClientId] = useState(buildTimeGoogleClientId);
  const [isGoogleConfigLoading, setIsGoogleConfigLoading] = useState(!buildTimeGoogleClientId);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
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
    setMessage("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedPhone = normalizePhone(phone);
    const phoneDigits = getPhoneDigits(phone);
    const authEmail = phoneToAuthEmail(phone);
    const trimmedDisplayName = displayName.trim();

    if (!normalizedPhone || !password) {
      setMessageTone("error");
      setMessage("Vui lòng nhập số điện thoại và mật khẩu.");
      return;
    }

    if (phoneDigits.length < 9) {
      setMessageTone("error");
      setMessage("Số điện thoại cần tối thiểu 9 chữ số.");
      return;
    }

    if (isReg && password.length < 8) {
      setMessageTone("error");
      setMessage("Mật khẩu đăng ký cần tối thiểu 8 ký tự.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      if (isReg) {
        await registerMember({
          email: authEmail,
          password,
          displayName: trimmedDisplayName || undefined,
        });
        setIsReg(false);
        setPassword("");
        setShowPassword(false);
        setMessageTone("success");
        setMessage("Đăng ký thành công. Vui lòng đăng nhập để vào hệ thống.");
        return;
      }

      const session = await loginMember({ email: authEmail, password });
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

  const handleGoogleCredential = useCallback(
    async (response: GoogleCredentialResponse) => {
      if (!response.credential) {
        setMessageTone("error");
        setMessage("Không nhận được thông tin xác thực từ Google.");
        return;
      }

      setIsGoogleSubmitting(true);
      setMessage("");

      try {
        const session = await loginGoogleMember({
          credential: response.credential,
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
    if (!googleClientId || !googleButtonRef.current) {
      return;
    }

    let mounted = true;

    const renderGoogleButton = () => {
      if (!mounted || !window.google || !googleButtonRef.current) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredential,
        ux_mode: "popup",
      });

      googleButtonRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "filled_black",
        size: "large",
        shape: "rectangular",
        text: isReg ? "signup_with" : "signin_with",
        width: Math.max(130, Math.min(360, googleButtonRef.current.offsetWidth || 180)),
      });
    };

    if (window.google) {
      renderGoogleButton();
      return () => {
        mounted = false;
      };
    }

    const existingScript = document.getElementById("google-identity-services");

    if (existingScript) {
      existingScript.addEventListener("load", renderGoogleButton, {
        once: true,
      });
      return () => {
        mounted = false;
        existingScript.removeEventListener("load", renderGoogleButton);
      };
    }

    const script = document.createElement("script");
    script.id = "google-identity-services";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    script.onerror = () => {
      if (!mounted) {
        return;
      }

      setMessageTone("error");
      setMessage("Không tải được nút đăng nhập Google.");
    };
    document.head.appendChild(script);

    return () => {
      mounted = false;
      script.onload = null;
      script.onerror = null;
    };
  }, [googleClientId, handleGoogleCredential, isReg]);

  const startLineConsent = () => {
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

              <form onSubmit={submit} style={{ marginTop: 24, display: "grid", gap: 14 }}>
                {isReg ? (
                  <Field
                    label="Họ tên"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Nguyễn Văn A"
                    autoComplete="name"
                    name="name"
                  />
                ) : null}
                <Field
                  icon={<Phone size={16} />}
                  label="Số điện thoại"
                  value={phone}
                  onChange={setPhone}
                  placeholder="0912 345 678"
                  autoComplete="tel"
                  inputMode="tel"
                  name="phone"
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
                  {googleClientId ? (
                    <div
                      aria-label="Đăng nhập bằng Google"
                      style={{
                        height: 46,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        minWidth: 0,
                        padding: "0 14px",
                        border: `1px solid ${colors.borderStrong}`,
                        borderRadius: 13,
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,.075), rgba(255,255,255,.035)), #101013",
                        overflow: "hidden",
                        opacity: isGoogleSubmitting ? 0.68 : 1,
                        pointerEvents: isGoogleSubmitting ? "none" : "auto",
                        boxShadow:
                          "inset 0 1px 0 rgba(255,255,255,.08), 0 12px 28px rgba(0,0,0,.22)",
                        cursor: "pointer",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        title="Google"
                        style={{
                          width: 20,
                          height: 20,
                          flex: "none",
                          background: `url("${googleLogoSrc}") center / contain no-repeat`,
                        }}
                      />
                      <span
                        aria-hidden="true"
                        style={{
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: colors.text,
                          fontSize: 13.5,
                          fontWeight: 850,
                          lineHeight: 1,
                        }}
                      >
                        Google
                      </span>
                      <div
                        ref={googleButtonRef}
                        className="nl-google-login-button"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          zIndex: 2,
                          overflow: "hidden",
                        }}
                      />
                    </div>
                  ) : (
                    <SocialButton
                      logoSrc={googleLogoSrc}
                      logoAlt="Google"
                      label="Google"
                      onClick={() => {
                        setMessageTone("error");
                        setMessage(
                          isGoogleConfigLoading
                            ? "Đang tải cấu hình đăng nhập Google. Vui lòng thử lại sau vài giây."
                            : "Thiếu GOOGLE_CLIENT_ID trên backend hoặc NEXT_PUBLIC_GOOGLE_CLIENT_ID cho đăng nhập Google.",
                        );
                      }}
                    />
                  )}
                  <SocialButton
                    logoSrc={lineLogoSrc}
                    logoAlt="LINE"
                    label="LINE"
                    onClick={startLineConsent}
                  />
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
      <style jsx global>{`
        .nl-google-login-button,
        .nl-google-login-button > div,
        .nl-google-login-button iframe {
          width: 100% !important;
          height: 100% !important;
        }

        .nl-google-login-button iframe {
          border-radius: 13px !important;
        }

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
}: {
  logoSrc: string;
  logoAlt: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Đăng nhập bằng ${label}`}
      onClick={onClick}
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
        cursor: "pointer",
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
