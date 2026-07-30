"use client";

import {
  getAuthUser,
  updateStoredAuthUser,
  type AuthLoginMethod,
  type AuthUser,
} from "@/lib/auth/session";
import { changeMemberPassword, updateMemberProfile } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { normalizeEmailAddress, validateEmailAddress } from "@/lib/email-validation";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
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
};

type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const emptyPasswordForm: PasswordForm = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const displayNamePattern = /^[\p{L}\s]+$/u;

function formFromUser(user: AuthUser | null): ProfileForm {
  return {
    displayName: user?.displayName || "",
    email: user?.email || "",
  };
}

function normalizeForm(form: ProfileForm): ProfileForm {
  return {
    displayName: form.displayName.trim().replace(/\s+/g, " "),
    email: normalizeEmailAddress(form.email),
  };
}

function validateProfileForm(form: ProfileForm) {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  const normalized = normalizeForm(form);

  if (!normalized.displayName) {
    errors.displayName = "Vui lòng nhập họ tên.";
  } else if (normalized.displayName.length < 2) {
    errors.displayName = "Họ tên cần tối thiểu 2 ký tự.";
  } else if (normalized.displayName.length > 80) {
    errors.displayName = "Họ tên không được vượt quá 80 ký tự.";
  } else if (!displayNamePattern.test(normalized.displayName)) {
    errors.displayName = "Họ tên chỉ được nhập chữ cái và khoảng trắng.";
  }

  const emailError = validateEmailAddress(normalized.email);
  if (emailError) errors.email = emailError;

  return errors;
}

function validatePasswordForm(form: PasswordForm) {
  const errors: Partial<Record<keyof PasswordForm, string>> = {};
  const oldPassword = form.oldPassword.trim();
  const newPassword = form.newPassword.trim();
  const confirmPassword = form.confirmPassword.trim();

  if (!oldPassword) errors.oldPassword = "Vui lòng nhập mật khẩu hiện tại.";
  if (!newPassword) {
    errors.newPassword = "Vui lòng nhập mật khẩu mới.";
  } else if (newPassword.length < 8) {
    errors.newPassword = "Mật khẩu mới cần tối thiểu 8 ký tự.";
  } else if (newPassword.length > 72) {
    errors.newPassword = "Mật khẩu mới không được vượt quá 72 ký tự.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới.";
  } else if (newPassword && confirmPassword !== newPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận chưa khớp.";
  }

  return errors;
}

function loginMethodLabel(method: AuthLoginMethod) {
  if (method === "GOOGLE") return "Google";
  if (method === "LINE") return "LINE";
  return "Email và mật khẩu";
}

export default function Page() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>(() => formFromUser(null));
  const [passwordForm, setPasswordForm] = useState<PasswordForm>(emptyPasswordForm);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentUser = getAuthUser();
      setAuthUser(currentUser);
      setProfileForm(formFromUser(currentUser));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const loginMethod = authUser?.loginMethod ?? "PASSWORD";
  const canChangePassword = loginMethod === "PASSWORD";
  const normalizedProfileForm = useMemo(() => normalizeForm(profileForm), [profileForm]);
  const profileErrors = useMemo(() => validateProfileForm(profileForm), [profileForm]);
  const hasProfileErrors = Object.values(profileErrors).some(Boolean);
  const initialProfileForm = useMemo(() => normalizeForm(formFromUser(authUser)), [authUser]);
  const hasProfileChanges =
    normalizedProfileForm.displayName !== initialProfileForm.displayName ||
    normalizedProfileForm.email !== initialProfileForm.email;

  const passwordErrors = useMemo(() => validatePasswordForm(passwordForm), [passwordForm]);
  const hasPasswordInput = Object.values(passwordForm).some((value) => value.trim());
  const hasPasswordErrors = Object.values(passwordErrors).some(Boolean);

  const updateProfileField = (field: keyof ProfileForm, value: string) => {
    setProfileMessage("");
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const updatePasswordField = (field: keyof PasswordForm, value: string) => {
    setPasswordMessage("");
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const resetProfileForm = () => {
    setProfileMessage("");
    setProfileForm(formFromUser(authUser));
  };

  const saveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSavingProfile) return;

    if (hasProfileErrors) {
      setProfileMessage(
        Object.values(profileErrors).find(Boolean) ?? "Vui lòng kiểm tra lại thông tin.",
      );
      return;
    }

    if (!hasProfileChanges) return;

    setIsSavingProfile(true);
    setProfileMessage("");
    setProfileForm(normalizedProfileForm);

    try {
      const updatedProfile = await updateMemberProfile({
        displayName: normalizedProfileForm.displayName,
        email: normalizedProfileForm.email,
      });

      const updatedUser = updateStoredAuthUser({
        displayName: updatedProfile.displayName ?? normalizedProfileForm.displayName,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
      });

      if (!updatedUser) {
        setProfileMessage("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return;
      }

      setAuthUser({
        ...updatedUser,
        tier: updatedProfile.tier,
        status: updatedProfile.status,
        loginMethod: updatedProfile.loginMethod ?? updatedUser.loginMethod,
      });
      setProfileForm(formFromUser(updatedUser));
      setProfileMessage("Đã lưu thông tin tài khoản.");
    } catch (error) {
      setProfileMessage(
        error instanceof ApiError ? error.message : "Không lưu được thông tin. Vui lòng thử lại.",
      );
    } finally {
      setIsSavingProfile(false);
    }
  };

  const submitPasswordChange = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canChangePassword || isChangingPassword) return;

    if (hasPasswordErrors) {
      setPasswordMessage(
        Object.values(passwordErrors).find(Boolean) ?? "Vui lòng kiểm tra lại mật khẩu.",
      );
      return;
    }

    setIsChangingPassword(true);
    setPasswordMessage("");

    try {
      await changeMemberPassword({
        oldPassword: passwordForm.oldPassword.trim(),
        newPassword: passwordForm.newPassword.trim(),
      });
      setPasswordForm(emptyPasswordForm);
      setPasswordMessage("Đã đổi mật khẩu tài khoản.");
    } catch (error) {
      setPasswordMessage(
        error instanceof ApiError ? error.message : "Không đổi được mật khẩu. Vui lòng thử lại.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const name = authUser?.displayName || authUser?.email?.split("@")[0] || "Chưa đăng nhập";
  const email = authUser?.email || "Chưa có email";
  const tier = authUser?.tier || "FREE";
  const status = authUser?.status || "ACTIVE";
  const role = authUser?.role || "USER";

  return (
    <main style={{ minHeight: "auto", background: colors.bg, color: colors.text }}>
      <section style={{ maxWidth: 1040, margin: "0 auto", padding: "22px 18px 32px" }}>
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
                  background: "var(--vy-surface)",
                  color: colors.goldPale,
                  border: `1px solid ${colors.borderStrong}`,
                  flex: "none",
                }}
              >
                <UserRound size={28} />
              </span>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: "0 0 5px",
                    color: colors.goldPale,
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
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
                <p
                  style={{
                    margin: "7px 0 0",
                    color: colors.muted,
                    fontSize: 13,
                    overflowWrap: "anywhere",
                  }}
                >
                  {email}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
              <InfoRow icon={<Mail size={16} />} label="Email đăng nhập" value={email} />
              <InfoRow
                icon={<KeyRound size={16} />}
                label="Phương thức đăng nhập"
                value={loginMethodLabel(loginMethod)}
              />
              <InfoRow
                icon={<ShieldCheck size={16} />}
                label="Quyền truy cập"
                value={`${role} · ${tier} · ${status}`}
              />
            </div>
          </section>

          <section style={{ display: "grid", gap: 14 }}>
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
                  Thông tin tài khoản
                </h2>
                <p style={{ margin: "6px 0 0", color: colors.muted, fontSize: 13 }}>
                  Cập nhật họ tên và email dùng cho tài khoản hội viên.
                </p>
              </div>

              <ProfileField
                label="Họ tên"
                value={profileForm.displayName}
                onChange={(value) => updateProfileField("displayName", value)}
                placeholder="Vui lòng nhập họ tên"
                error={profileErrors.displayName}
                autoComplete="name"
              />

              <ProfileField
                label="Email"
                value={profileForm.email}
                onChange={(value) => updateProfileField("email", value)}
                placeholder="Vui lòng nhập email"
                error={profileErrors.email}
                autoComplete="email"
                inputMode="email"
              />

              {profileMessage ? (
                <FormMessage message={profileMessage} successText="Đã lưu" />
              ) : null}

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="submit"
                  disabled={hasProfileErrors || !hasProfileChanges || isSavingProfile}
                  style={primaryButtonStyle(
                    hasProfileErrors || !hasProfileChanges || isSavingProfile,
                  )}
                >
                  {isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={resetProfileForm}
                  disabled={!hasProfileChanges}
                  style={secondaryButtonStyle(!hasProfileChanges)}
                >
                  Hủy chỉnh sửa
                </button>
              </div>
            </form>

            {canChangePassword ? (
              <form
                onSubmit={submitPasswordChange}
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
                    Đổi mật khẩu
                  </h2>
                  <p style={{ margin: "6px 0 0", color: colors.muted, fontSize: 13 }}>
                    Dùng cho tài khoản đăng nhập bằng email và mật khẩu.
                  </p>
                </div>

                <PasswordField
                  label="Mật khẩu hiện tại"
                  value={passwordForm.oldPassword}
                  onChange={(value) => updatePasswordField("oldPassword", value)}
                  error={hasPasswordInput ? passwordErrors.oldPassword : undefined}
                  autoComplete="current-password"
                  showPassword={showPasswords}
                />
                <PasswordField
                  label="Mật khẩu mới"
                  value={passwordForm.newPassword}
                  onChange={(value) => updatePasswordField("newPassword", value)}
                  error={hasPasswordInput ? passwordErrors.newPassword : undefined}
                  autoComplete="new-password"
                  showPassword={showPasswords}
                />
                <PasswordField
                  label="Xác nhận mật khẩu mới"
                  value={passwordForm.confirmPassword}
                  onChange={(value) => updatePasswordField("confirmPassword", value)}
                  error={hasPasswordInput ? passwordErrors.confirmPassword : undefined}
                  autoComplete="new-password"
                  showPassword={showPasswords}
                />

                <button
                  type="button"
                  onClick={() => setShowPasswords((current) => !current)}
                  style={{
                    justifySelf: "start",
                    border: `1px solid ${colors.border}`,
                    borderRadius: 12,
                    background: "rgba(255,255,255,.04)",
                    color: colors.goldPale,
                    minHeight: 38,
                    padding: "0 13px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}
                  {showPasswords ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                </button>

                {passwordMessage ? (
                  <FormMessage message={passwordMessage} successText="Đã đổi" />
                ) : null}

                <button
                  type="submit"
                  disabled={!hasPasswordInput || hasPasswordErrors || isChangingPassword}
                  style={primaryButtonStyle(
                    !hasPasswordInput || hasPasswordErrors || isChangingPassword,
                  )}
                >
                  {isChangingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </form>
            ) : (
              <div
                style={{
                  border: `1px solid ${colors.border}`,
                  borderRadius: 22,
                  background: colors.panel,
                  padding: 20,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    display: "grid",
                    placeItems: "center",
                    color: colors.goldPale,
                    background: "rgba(212,178,106,.12)",
                    border: `1px solid ${colors.border}`,
                    flex: "none",
                  }}
                >
                  <LockKeyhole size={20} />
                </span>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18, lineHeight: 1.2, fontWeight: 950 }}>
                    Đăng nhập qua {loginMethodLabel(loginMethod)}
                  </h2>
                  <p
                    style={{
                      margin: "7px 0 0",
                      color: colors.muted,
                      fontSize: 13,
                      lineHeight: 1.55,
                    }}
                  >
                    Tài khoản này xác thực qua {loginMethodLabel(loginMethod)}, nên không có mục đổi
                    mật khẩu tại Vietyoru.
                  </p>
                </div>
              </div>
            )}
          </section>
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

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    minHeight: 46,
    border: 0,
    borderRadius: 14,
    padding: "0 18px",
    background: disabled ? "rgba(255,255,255,.12)" : "linear-gradient(135deg,#f4e3b4,#d4b26a)",
    color: disabled ? colors.dim : colors.onGold,
    fontWeight: 950,
    cursor: disabled ? "not-allowed" : "pointer",
    flex: "1 1 180px",
  };
}

function secondaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    minHeight: 46,
    border: `1px solid ${colors.border}`,
    borderRadius: 14,
    padding: "0 18px",
    background: "rgba(255,255,255,.04)",
    color: disabled ? colors.dim : colors.text,
    fontWeight: 900,
    cursor: disabled ? "not-allowed" : "pointer",
    flex: "1 1 140px",
  };
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
        <small style={{ display: "block", color: colors.dim, fontSize: 11, fontWeight: 800 }}>
          {label}
        </small>
        <strong style={{ display: "block", marginTop: 2, fontSize: 13, overflowWrap: "anywhere" }}>
          {value}
        </strong>
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
        style={fieldStyle(Boolean(error))}
      />
      {error ? (
        <small style={{ color: colors.danger, fontSize: 12, fontWeight: 800 }}>{error}</small>
      ) : null}
    </label>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  error,
  autoComplete,
  showPassword,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoComplete?: string;
  showPassword: boolean;
}) {
  return (
    <label style={{ display: "grid", gap: 7 }}>
      <span style={{ color: colors.goldPale, fontSize: 12, fontWeight: 900 }}>{label}</span>
      <input
        value={value}
        type={showPassword ? "text" : "password"}
        onChange={(event) => onChange(event.target.value)}
        placeholder={label}
        autoComplete={autoComplete}
        style={fieldStyle(Boolean(error))}
      />
      {error ? (
        <small style={{ color: colors.danger, fontSize: 12, fontWeight: 800 }}>{error}</small>
      ) : null}
    </label>
  );
}

function fieldStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%",
    minHeight: 48,
    border: `1px solid ${hasError ? "rgba(255,107,139,.55)" : colors.border}`,
    borderRadius: 14,
    background: "rgba(255,255,255,.055)",
    color: colors.text,
    padding: "0 14px",
    fontSize: 14,
    fontWeight: 750,
    outline: "none",
  };
}

function FormMessage({ message, successText }: { message: string; successText: string }) {
  const isSuccess = message.includes(successText);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        border: `1px solid ${isSuccess ? "rgba(125,211,167,.35)" : "rgba(255,107,139,.35)"}`,
        borderRadius: 14,
        background: isSuccess ? "rgba(125,211,167,.10)" : "rgba(255,107,139,.10)",
        color: isSuccess ? colors.success : colors.danger,
        padding: "11px 12px",
        fontSize: 13,
        fontWeight: 800,
      }}
    >
      <CheckCircle2 size={16} />
      {message}
    </div>
  );
}
