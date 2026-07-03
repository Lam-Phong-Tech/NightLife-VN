"use client";

import { Check, ChevronDown, Globe, X } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type LanguageCode = "vi" | "en" | "ja" | "ko" | "zh";

type LanguageOption = {
  code: LanguageCode;
  badge: string;
  label: string;
  helper: string;
  htmlLang: string;
};

const storageKey = "vietyoru.language";
const cookieName = "vietyoru_language";

const colors = {
  modalBg: "#16141b",
  bg: "#0c0c0f",
  border: "rgba(255,255,255,.08)",
  borderStrong: "rgba(212,178,106,.6)",
  rowBorder: "rgba(255,255,255,.06)",
  text: "#f3f0ea",
  text2: "#c5c0b6",
  muted: "#8c8679",
  gold: "#d4b26a",
  goldSoft: "#e3c27e",
  onGold: "#241a0a",
  goldGrad: "linear-gradient(135deg,#f4e3b4,#d4b26a 55%,#b6924a)",
  goldBadge: "linear-gradient(135deg,#f0dda8,#d4b26a)",
};

const defaultLanguage: LanguageOption = {
  code: "vi",
  badge: "VI",
  label: "Tiếng Việt",
  helper: "Vietnamese",
  htmlLang: "vi",
};

const languages: LanguageOption[] = [
  defaultLanguage,
  { code: "en", badge: "EN", label: "English", helper: "International", htmlLang: "en" },
  { code: "ja", badge: "JA", label: "日本語", helper: "Japanese", htmlLang: "ja" },
  { code: "ko", badge: "KO", label: "한국어", helper: "Korean", htmlLang: "ko" },
  { code: "zh", badge: "ZH", label: "中文", helper: "Chinese", htmlLang: "zh" },
];

function isLanguageCode(value: string | null): value is LanguageCode {
  return languages.some((language) => language.code === value);
}

function getLanguage(code: LanguageCode) {
  return languages.find((language) => language.code === code) || defaultLanguage;
}

function readStoredLanguage(): LanguageCode {
  if (typeof window === "undefined") return "vi";

  try {
    const storedLanguage = window.localStorage.getItem(storageKey);
    if (isLanguageCode(storedLanguage)) return storedLanguage;
  } catch {
    return "vi";
  }

  return "vi";
}

function storeLanguage(language: LanguageOption) {
  try {
    window.localStorage.setItem(storageKey, language.code);
  } catch {
    // The visual picker should still work if browser storage is unavailable.
  }

  document.cookie = `${cookieName}=${language.code}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = language.htmlLang;
}

export function LanguagePicker({ isMobile }: { isMobile: boolean }) {
  const [activeCode, setActiveCode] = useState<LanguageCode>(() => readStoredLanguage());
  const [draftCode, setDraftCode] = useState<LanguageCode>(() => readStoredLanguage());
  const [isOpen, setIsOpen] = useState(false);

  const activeLanguage = useMemo(() => getLanguage(activeCode), [activeCode]);
  const draftLanguage = useMemo(() => getLanguage(draftCode), [draftCode]);

  useEffect(() => {
    document.documentElement.lang = activeLanguage.htmlLang;
  }, [activeLanguage.htmlLang]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDraftCode(activeCode);
        setIsOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeCode, isOpen]);

  const openPicker = () => {
    setDraftCode(activeCode);
    setIsOpen(true);
  };

  const closePicker = () => {
    setDraftCode(activeCode);
    setIsOpen(false);
  };

  const applyLanguage = () => {
    const nextLanguage = getLanguage(draftCode);
    setActiveCode(nextLanguage.code);
    storeLanguage(nextLanguage);
    setIsOpen(false);
  };

  const triggerSize = isMobile ? 36 : 40;
  const triggerStyle: React.CSSProperties = {
    minHeight: `${triggerSize}px`,
    height: `${triggerSize}px`,
    padding: isMobile ? "0 12px" : "0 13px",
    borderRadius: `${triggerSize / 2}px`,
    border: `1px solid ${colors.borderStrong}`,
    color: colors.goldSoft,
    background: isMobile ? "rgba(255,255,255,.02)" : "rgba(255,255,255,.04)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: isMobile ? "5px" : "6px",
    fontSize: isMobile ? "12px" : "12.5px",
    fontWeight: 700,
    lineHeight: 1,
    boxShadow: "0 0 0 3px rgba(212,178,106,.13)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    touchAction: "manipulation",
    fontFamily: "var(--nl-font-sans)",
  };

  const modalStyle: React.CSSProperties = isMobile
    ? {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.modalBg,
        borderTop: `1px solid ${colors.border}`,
        borderRadius: "24px 24px 0 0",
        padding: "12px 18px calc(20px + env(safe-area-inset-bottom))",
        boxShadow: "0 -18px 44px rgba(0,0,0,.55)",
      }
    : {
        width: "min(444px, calc(100vw - 32px))",
        background: colors.modalBg,
        border: `1px solid ${colors.border}`,
        borderRadius: "20px",
        padding: "24px 22px",
        boxShadow: "0 30px 70px -20px rgba(0,0,0,.85)",
      };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`Chọn ngôn ngữ, hiện tại ${activeLanguage.label}`}
        onClick={openPicker}
        style={triggerStyle}
      >
        <Globe size={isMobile ? 14 : 16} strokeWidth={1.8} style={{ flex: "none" }} />
        <span style={{ display: "inline-flex", alignItems: "center", height: "1em" }}>
          {activeLanguage.badge}
        </span>
        {!isMobile ? <ChevronDown size={13} strokeWidth={2.2} style={{ flex: "none" }} /> : null}
      </button>

      {isOpen && typeof document !== "undefined" ? createPortal(
        <div
          className="nl-language-picker-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closePicker();
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            alignItems: isMobile ? "flex-end" : "center",
            justifyContent: "center",
            background: "transparent",
            backdropFilter: "none",
            padding: isMobile ? "0" : "26px",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-picker-title"
            style={modalStyle}
          >
            {isMobile ? (
              <div
                aria-hidden="true"
                style={{
                  width: "42px",
                  height: "4px",
                  borderRadius: "3px",
                  background: "rgba(255,255,255,.18)",
                  margin: "0 auto 14px",
                }}
              />
            ) : null}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                marginBottom: isMobile ? "8px" : "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                {!isMobile ? (
                  <span
                    aria-hidden="true"
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      background: "rgba(212,178,106,.12)",
                      border: "1px solid rgba(212,178,106,.3)",
                      color: colors.goldSoft,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                    }}
                  >
                    <Globe size={19} strokeWidth={1.6} />
                  </span>
                ) : null}
                <div style={{ minWidth: 0 }}>
                  <h2
                    id="language-picker-title"
                    style={{
                      color: colors.text,
                      fontSize: isMobile ? "17px" : "19px",
                      fontWeight: 700,
                      lineHeight: 1.2,
                      margin: 0,
                    }}
                  >
                    Chọn ngôn ngữ
                  </h2>
                  <div
                    style={{
                      color: colors.muted,
                      fontSize: isMobile ? "8.5px" : "9px",
                      fontWeight: 700,
                      letterSpacing: "1.6px",
                      textTransform: "uppercase",
                      marginTop: "4px",
                    }}
                  >
                    Select language
                  </div>
                </div>
              </div>
              <button
                type="button"
                aria-label="Đóng chọn ngôn ngữ"
                onClick={closePicker}
                style={{
                  width: isMobile ? "30px" : "32px",
                  height: isMobile ? "30px" : "32px",
                  borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.05)",
                  color: "#9b958a",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flex: "none",
                }}
              >
                <X size={isMobile ? 13 : 14} strokeWidth={2.2} />
              </button>
            </div>

            <div>
              {languages.map((language, index) => {
                const isDraft = language.code === draftCode;
                const isActive = language.code === activeCode;
                const showSelectedLabel = isActive || isDraft;

                return (
                  <button
                    key={language.code}
                    type="button"
                    aria-pressed={isDraft}
                    onClick={() => setDraftCode(language.code)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: isMobile ? "13px" : "14px",
                      padding: isMobile ? "10px 2px" : "11px 4px",
                      border: 0,
                      borderBottom:
                        index === languages.length - 1 ? "0" : `1px solid ${colors.rowBorder}`,
                      background: "transparent",
                      color: colors.text,
                      cursor: "pointer",
                      textAlign: "left",
                      fontFamily: "var(--nl-font-sans)",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: isMobile ? "40px" : "42px",
                        height: isMobile ? "40px" : "42px",
                        borderRadius: "50%",
                        border: isDraft ? "0" : "1px solid rgba(212,178,106,.4)",
                        background: isDraft ? colors.goldGrad : "transparent",
                        color: isDraft ? colors.onGold : colors.gold,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? "12.5px" : "13px",
                        fontWeight: isDraft ? 800 : 700,
                        letterSpacing: ".5px",
                        flex: "none",
                      }}
                    >
                      {language.badge}
                    </span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          minWidth: 0,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            color: colors.text,
                            fontSize: isMobile ? "15px" : "15.5px",
                            fontWeight: isDraft ? 700 : 600,
                            lineHeight: 1.2,
                          }}
                        >
                          {language.label}
                        </span>
                        {showSelectedLabel ? (
                          <span
                            style={{
                              color: colors.onGold,
                              background: colors.goldBadge,
                              borderRadius: isMobile ? "5px" : "6px",
                              padding: isMobile ? "2px 6px" : "2px 7px",
                              fontSize: isMobile ? "8.5px" : "9px",
                              fontWeight: 800,
                              lineHeight: 1.2,
                              textTransform: "uppercase",
                            }}
                          >
                            {isActive ? "Đang dùng" : "Đang chọn"}
                          </span>
                        ) : null}
                      </span>
                      <span
                        style={{
                          display: "block",
                          color: colors.muted,
                          fontSize: isMobile ? "11.5px" : "12px",
                          marginTop: "3px",
                        }}
                      >
                        {language.helper}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        border: isDraft ? "0" : "2px solid rgba(212,178,106,.3)",
                        background: isDraft ? colors.goldGrad : "transparent",
                        color: colors.onGold,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "none",
                      }}
                    >
                      {isDraft ? <Check size={12} strokeWidth={3} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: isMobile ? "14px" : "16px",
                paddingTop: isMobile ? "0" : "16px",
                borderTop: isMobile ? "0" : `1px solid ${colors.rowBorder}`,
              }}
            >
              {!isMobile ? (
                <button
                  type="button"
                  onClick={closePicker}
                  style={{
                    flex: 1,
                    minHeight: "44px",
                    borderRadius: "11px",
                    border: "1px solid rgba(255,255,255,.14)",
                    background: "rgba(255,255,255,.05)",
                    color: colors.text2,
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "var(--nl-font-sans)",
                  }}
                >
                  Hủy
                </button>
              ) : null}
              <button
                type="button"
                onClick={applyLanguage}
                style={{
                  flex: isMobile ? "1" : "1.7",
                  minHeight: isMobile ? "48px" : "44px",
                  borderRadius: isMobile ? "12px" : "11px",
                  border: 0,
                  background: colors.goldGrad,
                  color: colors.onGold,
                  fontSize: isMobile ? "14.5px" : "14px",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "var(--nl-font-sans)",
                }}
              >
                Áp dụng {draftLanguage.badge}
              </button>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
