import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Moon, Sun, Monitor, User as UserIcon, LogOut, CheckCircle2 } from 'lucide-react';
import { DISTRICTS, District, User } from '../../shared/types.ts';
import { setAppLanguage } from '../lib/i18n.ts';
import { applyTheme } from '../lib/theme.ts';
import { getStoredTheme, setStoredUser, clearUserSession } from '../lib/storage.ts';
import { api } from '../lib/api.ts';

interface SettingsPageProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  onUserUpdated,
  onLogout,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';

  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(getStoredTheme());
  const [name, setName] = useState(currentUser.name);
  const [district, setDistrict] = useState<District>(currentUser.district);
  const [phone, setPhone] = useState(currentUser.phone);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLanguageChange = (newLang: 'en' | 'ur') => {
    setAppLanguage(newLang);
  };

  const handleThemeChange = (newTheme: 'system' | 'light' | 'dark') => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const updated = await api.updateUser(currentUser.id, { name, district, phone });
      setStoredUser(updated);
      onUserUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      const msg = isUrdu ? err?.error?.message_ur : err?.error?.message_en;
      setErrorMsg(msg || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-24 pt-2 px-4 space-y-4">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#1F4D2B] dark:text-[#E8A317]">
          {t('settings.title')}
        </h2>
        <p className="text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70 font-medium">
          {t('app.tagline')}
        </p>
      </div>

      {/* Language Section */}
      <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17]">
        <label className="text-xs font-bold text-[#8A7B68] flex items-center space-x-1.5 rtl:space-x-reverse mb-2.5">
          <Globe className="h-4 w-4 text-[#1F4D2B] dark:text-[#E8A317]" />
          <span>{t('settings.language')}</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition border ${
              lang === 'en'
                ? 'bg-[#1F4D2B] text-[#FBF6EA] border-[#1F4D2B] shadow-xs'
                : 'bg-[#F3E6C4]/30 dark:bg-[#1B1A17] border-[#F3E6C4]/60 dark:border-[#1B1A17] text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => handleLanguageChange('ur')}
            className={`py-2.5 px-3 rounded-xl text-sm font-bold transition border ${
              lang === 'ur'
                ? 'bg-[#1F4D2B] text-[#FBF6EA] border-[#1F4D2B] shadow-xs'
                : 'bg-[#F3E6C4]/30 dark:bg-[#1B1A17] border-[#F3E6C4]/60 dark:border-[#1B1A17] text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
            }`}
          >
            اردو
          </button>
        </div>
      </div>

      {/* Theme Section */}
      <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17]">
        <label className="text-xs font-bold text-[#8A7B68] flex items-center space-x-1.5 rtl:space-x-reverse mb-2.5">
          <Sun className="h-4 w-4 text-[#E8A317]" />
          <span>{t('settings.theme')}</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleThemeChange('system')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition border ${
              theme === 'system'
                ? 'bg-[#1F4D2B] text-[#FBF6EA] border-[#1F4D2B] shadow-xs'
                : 'bg-[#F3E6C4]/30 dark:bg-[#1B1A17] border-[#F3E6C4]/60 dark:border-[#1B1A17] text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
            }`}
          >
            <Monitor className="h-4 w-4 mb-1" />
            <span className="text-[11px]">{t('settings.systemTheme')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition border ${
              theme === 'light'
                ? 'bg-[#1F4D2B] text-[#FBF6EA] border-[#1F4D2B] shadow-xs'
                : 'bg-[#F3E6C4]/30 dark:bg-[#1B1A17] border-[#F3E6C4]/60 dark:border-[#1B1A17] text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
            }`}
          >
            <Sun className="h-4 w-4 mb-1" />
            <span className="text-[11px]">{t('settings.lightTheme')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs font-bold transition border ${
              theme === 'dark'
                ? 'bg-[#1F4D2B] text-[#FBF6EA] border-[#1F4D2B] shadow-xs'
                : 'bg-[#F3E6C4]/30 dark:bg-[#1B1A17] border-[#F3E6C4]/60 dark:border-[#1B1A17] text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
            }`}
          >
            <Moon className="h-4 w-4 mb-1" />
            <span className="text-[11px]">{t('settings.darkTheme')}</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17]">
        <label className="text-xs font-bold text-[#8A7B68] flex items-center space-x-1.5 rtl:space-x-reverse mb-3">
          <UserIcon className="h-4 w-4 text-[#1F4D2B] dark:text-[#E8A317]" />
          <span>{t('settings.profile')}</span>
        </label>

        {saveSuccess && (
          <div className="mb-3 flex items-center space-x-1.5 rtl:space-x-reverse rounded-xl bg-[#5C8A3C]/15 p-2.5 text-xs font-bold text-[#5C8A3C] animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>{t('settings.profileSaved')}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-3 rounded-xl bg-[#B5532C]/15 p-2.5 text-xs font-bold text-[#B5532C]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('settings.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-[#F3E6C4]/20 dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-2.5 text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('settings.district')}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value as District)}
              className="w-full rounded-xl bg-[#F3E6C4]/20 dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-2.5 text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('settings.phone')}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl bg-[#F3E6C4]/20 dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-2.5 text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[#8A7B68] font-medium">
              {t('settings.role')}:{' '}
              <strong className="text-[#1F4D2B] dark:text-[#E8A317]">{currentUser.role}</strong>
            </span>
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#1F4D2B] text-[#FBF6EA] font-bold px-5 py-2 hover:bg-[#1F4D2B]/90 active:scale-95 transition shadow-xs disabled:opacity-50"
            >
              {saving ? t('common.loading') : t('settings.saveProfile')}
            </button>
          </div>
        </form>
      </div>

      {/* Logout & App Version */}
      <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17] flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] block">
            {t('app.name')}
          </span>
          <span className="text-[10px] text-[#8A7B68] font-medium">
            {t('app.version')} • Sindh Mandi Network
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="flex items-center space-x-1.5 rtl:space-x-reverse rounded-full bg-[#B5532C]/10 text-[#B5532C] px-4 py-2 text-xs font-bold hover:bg-[#B5532C]/20 active:scale-95 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t('settings.logout')}</span>
        </button>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-[340px] rounded-2xl bg-[#FBF6EA] dark:bg-[#26241F] p-5 text-center shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[#3B2F24] dark:text-[#FBF6EA]">
              {t('settings.logoutConfirm')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-full bg-[#F3E6C4]/60 text-[#3B2F24] py-2.5 text-xs font-bold"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearUserSession();
                  onLogout();
                }}
                className="rounded-full bg-[#B5532C] text-white py-2.5 text-xs font-bold shadow-sm"
              >
                {t('settings.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
