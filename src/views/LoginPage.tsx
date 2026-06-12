"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { ErrorStatePanel } from "../components/ui/ErrorStatePanel";
import { Skeleton } from "../components/ui/Skeleton";
import { useAuthStore } from "../features/auth/auth-store";
import { usePreferencesStore } from "../features/ui/preferences-store";
import { getLoginProfiles, loginWithProfile } from "../lib/api/mediaops";
import { localeOptions, useI18n } from "../i18n";
import type { Locale } from "../i18n/types";

function LanguageIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.45" />
      <path
        d="M3.8 8h12.4M3.8 12h12.4M10 3c1.85 1.9 2.8 4.23 2.8 7S11.85 15.1 10 17M10 3C8.15 4.9 7.2 7.23 7.2 10s.95 5.1 2.8 7"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LoginPage() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const setSession = useAuthStore((state) => state.setSession);
  const theme = usePreferencesStore((state) => state.theme);
  const { locale, setLocale, t } = useI18n();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [router, session]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!languageMenuRef.current?.contains(event.target as Node)) {
        setLanguageMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const profilesQuery = useQuery({
    queryKey: ["auth-profiles"],
    queryFn: getLoginProfiles,
  });

  const loginMutation = useMutation({
    mutationFn: loginWithProfile,
    onSuccess: ({ user }) => {
      setSession(user);
      router.replace("/dashboard");
    },
  });

  const profiles = profilesQuery.data?.profiles ?? [];
  const activeProfile =
    profiles.find((profile) => profile.id === selectedUserId) ??
    profiles[0] ??
    null;

  function handleSubmit() {
    const userId = selectedUserId ?? profiles[0]?.id;

    if (!userId) {
      return;
    }

    loginMutation.mutate(userId);
  }

  return (
    <div className="login-page" data-theme={theme}>
      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />
      <div className="login-shell">
        <header className="login-header">
          <div className="login-brand">
            <span className="login-brand-mark">M</span>
            <span>MediaOps</span>
          </div>
          <div ref={languageMenuRef} className="relative z-50">
            <button
              type="button"
              onClick={() => setLanguageMenuOpen((open) => !open)}
              className="focus-ring header-icon-button inline-flex"
              aria-label={t("header.languageLabel")}
              aria-haspopup="menu"
              aria-expanded={languageMenuOpen}
            >
              <LanguageIcon />
            </button>
            {languageMenuOpen ? (
              <div
                role="menu"
                className="language-popover absolute right-0 top-full z-[200] mt-2 w-44 overflow-hidden rounded-xl p-1"
              >
                {localeOptions.map((option) => {
                  const selected = option.value === locale;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="menuitemradio"
                      aria-checked={selected}
                      onClick={() => {
                        setLocale(option.value as Locale);
                        setLanguageMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${
                        selected
                          ? "bg-[var(--panel-muted)] font-semibold text-[var(--text-primary)]"
                          : "text-[var(--text-tertiary)] hover:bg-[var(--panel-muted)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span>{option.label}</span>
                      {selected ? (
                        <span className="text-xs text-[var(--brand)]">✓</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </header>

        <main className="login-main">
          <section className="login-copy">
            <p className="login-kicker">Premium dashboard template</p>
            <h1>{t("login.heroTitle")}</h1>
            <p>{t("login.heroDesc")}</p>
            <div className="login-feature-row">
              <span>{t("login.permissionControl")}</span>
              <span>{t("login.campaignAnalysis")}</span>
              <span>{t("login.localizedCopy")}</span>
            </div>
          </section>

          <section className="login-auth-card">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--brand)]">
                {t("login.eyebrow")}
              </p>
            </div>
            <h2 className="mt-3 text-[clamp(2rem,7vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--text-primary)]">
              {t("login.selectAccount")}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
              {t("login.selectAccountDesc")}
            </p>

            <div className="mt-8 space-y-3">
              {profilesQuery.isLoading && (
                <div className="space-y-3" aria-busy="true" aria-live="polite">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`profile-skeleton-${index}`}
                      className="surface-muted p-4"
                    >
                      <Skeleton className="h-6 w-40" />
                      <Skeleton className="mt-3 h-4 w-52" />
                      <Skeleton className="mt-4 h-4 w-56" />
                    </div>
                  ))}
                </div>
              )}

              {profilesQuery.isError && (
                <ErrorStatePanel
                  title="계정 목록을 불러올 수 없습니다"
                  message={profilesQuery.error.message}
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => profilesQuery.refetch()}
                    >
                      {t("common.retry")}
                    </Button>
                  }
                />
              )}

              {profiles.map((profile) => {
                const isSelected =
                  (selectedUserId ?? profiles[0]?.id) === profile.id;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelectedUserId(profile.id)}
                    aria-pressed={isSelected}
                    data-testid={`login-profile-${profile.role}`}
                    className={`focus-ring w-full rounded-2xl border p-4 text-left shadow-sm ${
                      isSelected
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-[0_16px_36px_rgba(79,70,229,0.10)]"
                        : "border-[var(--border-subtle)] bg-[var(--panel-solid)] hover:border-[var(--border-strong)] hover:bg-[var(--panel-muted)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-[var(--text-primary)]">
                          {profile.name}
                        </p>
                        <p className="text-sm text-[var(--text-tertiary)]">
                          {profile.email}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-[var(--panel-solid)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]">
                        {t(`labels.role.${profile.role}`)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[var(--text-tertiary)]">
                      {profile.role === "admin"
                        ? "모든 메뉴와 모든 기능 사용 가능"
                        : profile.role === "manager"
                          ? "캠페인 수정과 리포트 확인 가능"
                          : "조회 전용으로 일부 액션 제한"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="surface-muted mt-7 bg-[var(--panel-solid)] p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                {t("login.selectedRole")}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                {activeProfile ? t(`labels.role.${activeProfile.role}`) : "-"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--text-tertiary)]">
                {activeProfile
                  ? activeProfile.role === "viewer"
                    ? "조회 전용 계정은 대시보드, 캠페인, 리포트, 설정 화면을 읽기 전용으로 확인할 수 있습니다."
                    : "캠페인, 리포트, 설정 화면까지 접근할 수 있습니다."
                  : "계정을 선택한 뒤 진행하세요."}
              </p>
            </div>

            {loginMutation.error && (
              <p className="mt-4 text-sm text-red-600">
                {loginMutation.error.message}
              </p>
            )}

            <Button
              onClick={handleSubmit}
              loading={loginMutation.isPending}
              disabled={profilesQuery.isLoading || loginMutation.isPending}
              className="mt-6 h-12 w-full rounded-2xl"
            >
              {loginMutation.isPending
                ? t("login.signingIn")
                : t("login.enterDashboard")}
            </Button>
          </section>

          {/* <DashboardPreview /> */}
        </main>
      </div>
    </div>
  );
}
