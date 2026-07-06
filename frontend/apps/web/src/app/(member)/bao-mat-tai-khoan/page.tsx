"use client";

import { getAuthUser, updateStoredAuthUser, type AuthUser } from "@/lib/auth/session";
import { updateMemberProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

const colors = {
  bg: "var(--vy-bg)",
  panel: "var(--vy-surface-2)",
  panelStrong: "var(--vy-surface-3)",
  border: "var(--vy-border-gold-22)",
  borderStrong: "var(--vy-border-gold-32)",
  text: "var(--vy-text)",
  muted: "var(--vy-muted)",
  dim: "var(--vy-faint)",
  gold: "var(--vy-gold)",
  goldPale: "var(--vy-gold-pale)",
  onGold: "var(--vy-on-gold)",
  danger: "var(--vy-error)",
  success: "var(--vy-success)",
};

type ProfileForm = {
  displayName: string;
  email: string;
  phone: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const displayNamePattern = /^[\p{L}\s]+$/u;
const phonePattern = /^[0-9+\-\s().]+$/;
const minPhoneDigits = 8;
const maxPhoneDigits = 15;
const maxPhoneLength = 20;

function formFromUser(user: AuthUser | null): ProfileForm {
  return {
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  };
}

function normalizeForm(form: ProfileForm): ProfileForm {
  return {
    displayName: form.displayName.trim().replace(/\s+/g, " "),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim().replace(/\s+/g, " "),
  };
}

function validateForm(form: ProfileForm) {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  const normalized = normalizeForm(form);

  if (!normalized.displayName) {
    errors.displayName = "Vui lòng nhập họ tên.";
  } else if (normalized.displayName.length < 2) {
    errors.displayName = "Vui lòng nhập họ tên tối thiểu 2 ký tự.";
  }

  if (normalized.displayName.length > 80) {
    errors.displayName = "Họ tên không được vượt quá 80 ký tự.";
  }

  if (normalized.displayName && !displayNamePattern.test(normalized.displayName)) {
    errors.displayName = "Họ tên chỉ được nhập chữ cái và khoảng trắng.";
  }

  if (!normalized.email) {
    errors.email = "Vui lòng nhập email.";
  } else if (!emailPattern.test(normalized.email)) {
    errors.email = "Email chưa đúng định dạng.";
  }

  if (normalized.email.length > 254) {
    errors.email = "Email không được vượt quá 254 ký tự.";
  }

  if (normalized.phone) {
    const digitCount = normalized.phone.replace(/\D/g, "").length;

    if (normalized.phone.length > maxPhoneLength) {
      errors.phone = `Số điện thoại không được vượt quá ${maxPhoneLength} ký tự.`;
    } else if (!phonePattern.test(normalized.phone)) {
      errors.phone = "Số điện thoại chỉ được nhập số và các ký tự + - ( ) .";
    } else if (digitCount < minPhoneDigits || digitCount > maxPhoneDigits) {
      errors.phone = `Số điện thoại cần từ ${minPhoneDigits} đến ${maxPhoneDigits} chữ số.`;
    }
  }

  return errors;
}

export default function Page() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<ProfileForm>(() => formFromUser(null));
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentUser = getAuthUser();
      setAuthUser(currentUser);
      setForm(formFromUser(currentUser));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const normalizedForm = useMemo(() => normalizeForm(form), [form]);
  const errors = useMemo(() => validateForm(form), [form]);
  const hasErrors = Object.values(errors).some(Boolean);
  const initialForm = useMemo(() => normalizeForm(formFromUser(authUser)), [authUser]);
  const hasChanges =
    normalizedForm.displayName !== initialForm.displayName ||
    normalizedForm.email !== initialForm.email ||
    normalizedForm.phone !== initialForm.phone;

  const updateField = (field: keyof ProfileForm, value: string) => {
    setMessage("");
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetForm = () => {
    setMessage("");
    setForm(formFromUser(authUser));
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (hasErrors) {
      setMessage(Object.values(errors).find(Boolean) ?? "Vui lòng kiểm tra lại thông tin.");
      return;
    }

    if (!hasChanges) return;

    setIsSubmitting(true);
    setMessage("");
    setForm(normalizedForm);

    try {
      const updatedProfile = await updateMemberProfile({
        displayName: normalizedForm.displayName,
        email: normalizedForm.email,
        phone: normalizedForm.phone || null,
      });

      const updatedUser = updateStoredAuthUser({
        displayName: updatedProfile.displayName ?? normalizedForm.displayName,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
      });

      if (!updatedUser) {
        setMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      setAuthUser({
        ...updatedUser,
        tier: updatedProfile.tier,
        status: updatedProfile.status,
      });
      setForm(formFromUser(updatedUser));
      setMessage("Đã lưu thông tin cá nhân.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Không lưu được thông tin. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const name = authUser?.displayName || authUser?.email?.split("@")[0] || "Chưa đăng nhập";
  const email = authUser?.email || "Chưa có email";
  const phone = authUser?.phone || "Chưa cập nhật";
  const tier = authUser?.tier || "FREE";
  const status = authUser?.status || "ACTIVE";
  const role = authUser?.role || "USER";

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "22px 18px 58px" }}>
        <Link
          href="/tai-khoan"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            color: colors.goldPale,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 850,
            marginBottom: 16,
          }}
        >
          <ArrowLeft size={16} />
          Quay lại tài khoản
        </Link>

        <div className="nl-security-layout">
          <section
            style={{
              border: `1px solid ${colors.borderStrong}`,
              borderRadius: 22,
              background:
                "radial-gradient(circle at 85% 8%,rgba(240,221,168,.20),transparent 28%), linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.035))",
              padding: 20,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "#141417",
                  color: colors.goldPale,
                  border: `1px solid ${colors.borderStrong}`,
                  flex: "none",
                }}
              >
                <UserRound size={28} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: "0 0 5px", color: colors.goldPale, fontSize: 12, fontWeight: 900 }}>
                  Bảo mật tài khoản
                </p>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 25,
                    lineHeight: 1.08,
                    fontWeight: 950,
                    overflowWrap: "anywhere",
                  }}
                >
                  {name}
                </h1>
                <p style={{ margin: "7px 0 0", color: colors.muted, fontSize: 13, overflowWrap: "anywhere" }}>
                  {email}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              <InfoRow icon={<Mail size={16} />} label="Email đăng nhập" value={email} />
              <InfoRow icon={<Phone size={16} />} label="Số điện thoại" value={phone} />
              <InfoRow icon={<ShieldCheck size={16} />} label="Quyền truy cập" value={`${role} · ${tier} · ${status}`} />
            </div>
          </section>

          <form
            onSubmit={saveProfile}
            style={{
              border: `1px solid ${colors.border}`,
              borderRadius: 22,
              background: colors.panel,
              padding: 20,
              display: "grid",
              gap: 16,
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.15, fontWeight: 950 }}>
                Thông tin cá nhân
              </h2>
              <p style={{ margin: "6px 0 0", color: colors.muted, fontSize: 13 }}>
                Cập nhật họ tên, email và số điện thoại dùng cho lịch đặt.
              </p>
            </div>

            <ProfileField
              label="Họ tên"
              value={form.displayName}
              onChange={(value) => updateField("displayName", value)}
              placeholder="Vui lòng nhập họ tên"
              error={errors.displayName}
              autoComplete="name"
            />

            <ProfileField
              label="Email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
              placeholder="Vui lòng nhập email"
              error={errors.email}
              autoComplete="email"
              inputMode="email"
            />

            <ProfileField
              label="Số điện thoại"
              value={form.phone}
              onChange={(value) => updateField("phone", value)}
              placeholder="Vui lòng nhập số điện thoại"
              error={errors.phone}
              autoComplete="tel"
              inputMode="tel"
            />

            <div
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 16,
                background: colors.panelStrong,
                padding: 13,
                color: colors.muted,
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Email và số điện thoại được dùng để nhận xác nhận lịch đặt, mã QR và thông báo hỗ trợ.
            </div>

            {message ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: `1px solid ${message.includes("Đã lưu") ? "rgba(125,211,167,.35)" : "rgba(255,107,139,.35)"}`,
                  borderRadius: 14,
                  background: message.includes("Đã lưu") ? "rgba(125,211,167,.10)" : "rgba(255,107,139,.10)",
                  color: message.includes("Đã lưu") ? colors.success : colors.danger,
                  padding: "11px 12px",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                <CheckCircle2 size={16} />
                {message}
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={hasErrors || !hasChanges || isSubmitting}
                style={{
                  minHeight: 46,
                  border: 0,
                  borderRadius: 14,
                  padding: "0 18px",
                  background:
                    hasErrors || !hasChanges || isSubmitting
                      ? "rgba(255,255,255,.12)"
                      : "linear-gradient(135deg,#f4e3b4,#d4b26a)",
                  color: hasErrors || !hasChanges || isSubmitting ? colors.dim : colors.onGold,
                  fontWeight: 950,
                  cursor: hasErrors || !hasChanges || isSubmitting ? "not-allowed" : "pointer",
                  flex: "1 1 180px",
                }}
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={!hasChanges}
                style={{
                  minHeight: 46,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 14,
                  padding: "0 18px",
                  background: "rgba(255,255,255,.04)",
                  color: hasChanges ? colors.text : colors.dim,
                  fontWeight: 900,
                  cursor: hasChanges ? "pointer" : "not-allowed",
                  flex: "1 1 140px",
                }}
              >
                Hủy chỉnh sửa
              </button>
            </div>
          </form>
        </div>
      </section>

      <style jsx global>{`
        .nl-security-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          gap: 18px;
          align-items: start;
        }

        @media (max-width: 860px) {
          .nl-security-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px minmax(0,1fr)",
        alignItems: "center",
        gap: 10,
        border: `1px solid ${colors.border}`,
        borderRadius: 14,
        padding: "10px 11px",
        background: "rgba(255,255,255,.035)",
      }}
    >
      <span style={{ color: colors.gold, display: "grid", placeItems: "center" }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <small style={{ display: "block", color: colors.dim, fontSize: 11, fontWeight: 800 }}>{label}</small>
        <strong style={{ display: "block", marginTop: 2, fontSize: 13, overflowWrap: "anywhere" }}>{value}</strong>
      </span>
    </div>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={{ color: colors.goldPale, fontSize: 12, fontWeight: 900 }}>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        style={{
          width: "100%",
          minHeight: 48,
          border: `1px solid ${error ? "rgba(255,107,139,.55)" : colors.border}`,
          borderRadius: 14,
          background: "rgba(255,255,255,.055)",
          color: colors.text,
          padding: "0 14px",
          fontSize: 14,
          fontWeight: 750,
          outline: "none",
        }}
      />
      {error ? <small style={{ color: colors.danger, fontSize: 12, fontWeight: 800 }}>{error}</small> : null}
    </label>
  );
}
