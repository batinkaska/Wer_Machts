import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { PhoneVerificationModal } from "../components/auth/PhoneVerificationModal";
import { EyeIcon, ExternalLinkIcon, TrashIcon } from "../components/icons";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAuth } from "../contexts/AuthContext";
import { useAds } from "../hooks/useAds";
import { type LanguageCode, SUPPORTED_LANGUAGES } from "../i18n";
import { type ThemePreference, applyTheme, detectInitialThemePreference } from "../theme";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  de: "Deutsch",
  en: "English",
  ru: "Русский",
  tr: "Türkçe",
  ar: "العربية",
};

function SettingsCard({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
      {title && (
        <h2 className="border-b border-gray-100 px-4 py-3 text-base font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
          {title}
        </h2>
      )}
      <div className="divide-y divide-gray-100 dark:divide-gray-700">{children}</div>
    </div>
  );
}

function EditableRow({
  label,
  value,
  placeholder,
  onSave,
  extraAction,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSave: (next: string) => Promise<void>;
  extraAction?: ReactNode;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="flex items-center gap-3 px-4 py-3">
        <span className="w-40 shrink-0 text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={saving}
          className="text-sm font-medium text-[#5fac5e] hover:underline disabled:opacity-50"
        >
          {t("common.save")}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-sm text-gray-500 hover:underline dark:text-gray-400"
        >
          {t("common.cancel")}
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm text-gray-900 dark:text-gray-100">{value || placeholder}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {extraAction}
        <button
          type="button"
          onClick={startEditing}
          className="shrink-0 text-sm font-medium text-[#5fac5e] hover:underline"
        >
          {t("common.edit")}
        </button>
      </div>
    </div>
  );
}

function EditableTextareaRow({
  label,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSave: (next: string) => Promise<void>;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setDraft(value);
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(draft.trim());
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-2 px-4 py-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <textarea
          autoFocus
          rows={5}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-medium text-[#5fac5e] hover:underline disabled:opacity-50"
          >
            {t("common.save")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:underline dark:text-gray-400"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{value || placeholder}</p>
      </div>
      <button
        type="button"
        onClick={startEditing}
        className="shrink-0 text-sm font-medium text-[#5fac5e] hover:underline"
      >
        {t("common.edit")}
      </button>
    </div>
  );
}

function EmailRow({
  email,
  isGoogleUser,
  emailVerified,
}: {
  email: string;
  isGoogleUser: boolean;
  emailVerified: boolean;
}) {
  const { t } = useTranslation();
  const { changeEmail } = useAuth();
  const [editing, setEditing] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  function startEditing() {
    setNewEmail(email);
    setPassword("");
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const trimmed = newEmail.trim();
      await changeEmail(trimmed, password);
      setPendingEmail(trimmed);
      setEditing(false);
    } catch {
      setError(t("settings.emailChangeError"));
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-2 px-4 py-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.emailLabel")}</p>
        <input
          type="email"
          autoFocus
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t("settings.newEmailPlaceholder")}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t("settings.currentPasswordPlaceholder")}
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-medium text-[#5fac5e] hover:underline disabled:opacity-50"
          >
            {t("common.save")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:underline dark:text-gray-400"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.emailLabel")}</p>
        <p className="text-sm text-gray-900 dark:text-gray-100">{email}</p>
        {pendingEmail && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t("settings.emailPending", { email: pendingEmail })}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {emailVerified ? (
          <VerifiedBadge label={t("verifiedBadges.email")} />
        ) : (
          <Link
            to="/konto-aktivieren"
            className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
          >
            {t("settings.verifyEmailCta")}
          </Link>
        )}
        {isGoogleUser ? (
          <span className="text-xs text-gray-400 dark:text-gray-500">{t("settings.linkedViaGoogle")}</span>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className="text-sm font-medium text-[#5fac5e] hover:underline"
          >
            {t("common.change")}
          </button>
        )}
      </div>
    </div>
  );
}

function PasswordRow({ isGoogleUser }: { isGoogleUser: boolean }) {
  const { t } = useTranslation();
  const { changePassword } = useAuth();
  const [editing, setEditing] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function startEditing() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError(t("settings.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("settings.passwordsDontMatch"));
      return;
    }
    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setEditing(false);
    } catch {
      setError(t("settings.passwordChangeError"));
    } finally {
      setSaving(false);
    }
  }

  if (isGoogleUser) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.passwordLabel")}</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">{t("settings.passwordNotRequired")}</p>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="space-y-2 px-4 py-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.passwordLabel")}</p>
        <input
          type="password"
          autoFocus
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t("settings.currentPasswordPlaceholder")}
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t("settings.newPasswordPlaceholder")}
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          placeholder={t("settings.confirmPasswordPlaceholder")}
        />
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-medium text-[#5fac5e] hover:underline disabled:opacity-50"
          >
            {t("common.save")}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:underline dark:text-gray-400"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.passwordLabel")}</p>
        <p className="text-sm text-gray-900 dark:text-gray-100">••••••••••••</p>
      </div>
      <button
        type="button"
        onClick={startEditing}
        className="shrink-0 text-sm font-medium text-[#5fac5e] hover:underline"
      >
        {t("common.change")}
      </button>
    </div>
  );
}

function DeleteAccountRow({ isGoogleUser }: { isGoogleUser: boolean }) {
  const { t } = useTranslation();
  const { deleteAccount, logout } = useAuth();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setDeleting(true);
    try {
      await deleteAccount(isGoogleUser ? undefined : password);
      await logout();
      navigate("/");
    } catch {
      setError(t("settings.deleteAccountError"));
    } finally {
      setDeleting(false);
    }
  }

  if (confirming) {
    return (
      <form onSubmit={handleDelete} className="space-y-2 px-4 py-3">
        <p className="text-sm font-medium text-red-600 dark:text-red-400">{t("settings.deleteAccountConfirm")}</p>
        {!isGoogleUser && (
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder={t("settings.passwordConfirmPlaceholder")}
          />
        )}
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={deleting}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
          >
            {t("settings.deletePermanently")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="text-sm text-gray-500 hover:underline dark:text-gray-400"
          >
            {t("common.cancel")}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex justify-end px-4 py-3">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline dark:text-red-400"
      >
        <TrashIcon className="h-4 w-4" />
        {t("settings.deleteAccount")}
      </button>
    </div>
  );
}

function LanguageCard() {
  const { t, i18n } = useTranslation();
  const { appUser, updateProfile } = useAuth();

  async function handleChange(lang: LanguageCode) {
    await i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
    if (appUser) {
      await updateProfile({ language: lang });
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("settings.languageHeading")}</h2>
      <SettingsCard>
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => handleChange(lang)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                i18n.language === lang
                  ? "border-[#5fac5e] bg-green-50 font-medium text-[#4d9a4c] dark:bg-green-950"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {LANGUAGE_NAMES[lang]}
            </button>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

function AppearanceCard() {
  const { t } = useTranslation();
  const { appUser, updateProfile } = useAuth();
  const current = appUser?.theme ?? detectInitialThemePreference();

  async function handleChange(pref: ThemePreference) {
    localStorage.setItem("theme", pref);
    applyTheme(pref);
    if (appUser) {
      await updateProfile({ theme: pref });
    }
  }

  const options: { value: ThemePreference; label: string }[] = [
    { value: "light", label: t("settings.appearanceLight") },
    { value: "dark", label: t("settings.appearanceDark") },
    { value: "system", label: t("settings.appearanceSystem") },
  ];

  return (
    <div className="space-y-2">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {t("settings.appearanceHeading")}
      </h2>
      <SettingsCard>
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleChange(opt.value)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                current === opt.value
                  ? "border-[#5fac5e] bg-green-50 font-medium text-[#4d9a4c] dark:bg-green-950"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { firebaseUser, appUser, updateProfile, emailVerified } = useAuth();
  const { ads } = useAds({ ownerId: firebaseUser?.uid });
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verifyPhone") === "1") {
      setShowPhoneModal(true);
      const next = new URLSearchParams(searchParams);
      next.delete("verifyPhone");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!appUser || !firebaseUser) return null;

  const PRIVACY_LINKS = [
    { to: "/impressum", label: t("legal.impressum") },
    { to: "/datenschutz", label: t("legal.privacy") },
    { to: "/agb", label: t("legal.agb") },
  ];

  const isGoogleUser = firebaseUser.providerData.some((p) => p.providerId === "google.com");
  const activeCount = ads.filter((a) => a.status === "open").length;
  const recentCount = ads.filter(
    (a) => Date.now() - a.createdAt.toDate().getTime() <= THIRTY_DAYS_MS,
  ).length;
  const notifyOnNewMessage = appUser.notifyOnNewMessage ?? true;
  const followersVisible = appUser.followersVisible ?? true;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("settings.pageTitle")}</h1>

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("settings.profileInfoHeading")}</h2>
        <SettingsCard>
          <EditableRow
            label={t("settings.profileNameLabel")}
            value={appUser.displayName}
            placeholder={t("settings.noNamePlaceholder")}
            onSave={(v) => updateProfile({ displayName: v })}
          />
          <EditableRow
            label={t("settings.deliveryAddressLabel")}
            value={appUser.deliveryAddress ?? ""}
            placeholder={t("settings.noDeliveryAddressPlaceholder")}
            onSave={(v) => updateProfile({ deliveryAddress: v })}
          />
        </SettingsCard>
      </div>

      {appUser.accountType === "business" && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("settings.businessInfoHeading")}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.businessInfoNotice")}</p>
          <SettingsCard>
            <EditableRow
              label={t("settings.businessNameLabel")}
              value={appUser.businessName ?? ""}
              placeholder={t("settings.noBusinessNamePlaceholder")}
              onSave={(v) => updateProfile({ businessName: v })}
            />
            <EditableTextareaRow
              label={t("settings.impressumLabel")}
              value={appUser.impressum ?? ""}
              placeholder={t("settings.noImpressumPlaceholder")}
              onSave={(v) => updateProfile({ impressum: v })}
            />
            <EditableRow
              label={t("settings.taxIdLabel")}
              value={appUser.taxId ?? ""}
              placeholder={t("settings.noTaxIdPlaceholder")}
              onSave={(v) => updateProfile({ taxId: v })}
            />
            <EditableTextareaRow
              label={t("settings.withdrawalPolicyLabel")}
              value={appUser.withdrawalPolicy ?? ""}
              placeholder={t("settings.noWithdrawalPolicyPlaceholder")}
              onSave={(v) => updateProfile({ withdrawalPolicy: v })}
            />
            <EditableTextareaRow
              label={t("settings.businessTermsLabel")}
              value={appUser.businessTerms ?? ""}
              placeholder={t("settings.noBusinessTermsPlaceholder")}
              onSave={(v) => updateProfile({ businessTerms: v })}
            />
          </SettingsCard>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("settings.accountSettingsHeading")}</h2>
        <p className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <EyeIcon className="h-4 w-4" />
          {t("settings.visibleOnlyToYou")}
        </p>
        <SettingsCard>
          <EditableRow
            label={t("settings.phoneLabel")}
            value={appUser.phone ?? ""}
            placeholder={t("settings.noPhonePlaceholder")}
            onSave={(v) => updateProfile({ phone: v })}
            extraAction={
              appUser.phoneVerified ? (
                <VerifiedBadge label={t("verifiedBadges.phone")} />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(true)}
                  className="text-sm font-medium text-amber-600 hover:underline dark:text-amber-400"
                >
                  {t("settings.verifyPhoneCta")}
                </button>
              )
            }
          />
          <EmailRow email={appUser.email} isGoogleUser={isGoogleUser} emailVerified={emailVerified} />
          <PasswordRow isGoogleUser={isGoogleUser} />
          <div className="px-4 py-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("settings.activityLabel")}</p>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {t("settings.activeAdsCount", { count: activeCount })}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {t("settings.recentAdsCount", { count: recentCount })}
            </p>
          </div>
          <DeleteAccountRow isGoogleUser={isGoogleUser} />
        </SettingsCard>
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("settings.notificationsHeading")}</h2>
        <SettingsCard>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("settings.messageNotifTitle")}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t("settings.messageNotifDescription")}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifyOnNewMessage}
              onClick={() => updateProfile({ notifyOnNewMessage: !notifyOnNewMessage })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                notifyOnNewMessage ? "bg-[#5fac5e]" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  notifyOnNewMessage ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </SettingsCard>
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("settings.visibilityHeading")}</h2>
        <SettingsCard>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("settings.followersVisibilityTitle")}</p>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{t("settings.followersVisibilityDescription")}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={followersVisible}
              onClick={() => updateProfile({ followersVisible: !followersVisible })}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                followersVisible ? "bg-[#5fac5e]" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  followersVisible ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </SettingsCard>
      </div>

      <LanguageCard />

      <AppearanceCard />

      <div className="space-y-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("settings.privacyHeading")}</h2>
        <SettingsCard>
          {PRIVACY_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="whitespace-pre-line text-sm font-medium text-gray-900 dark:text-gray-100">
                {link.label}
              </span>
              <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-[#5fac5e]">
                {t("settings.open")}
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </SettingsCard>
      </div>

      {showPhoneModal && (
        <PhoneVerificationModal
          reasonText={t("settings.verifyPhoneReason")}
          onClose={() => setShowPhoneModal(false)}
          onVerified={() => setShowPhoneModal(false)}
        />
      )}
    </div>
  );
}
