import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Sun, Moon, Globe } from 'lucide-react';
import { setAppLanguage } from '../lib/i18n.ts';
import { applyTheme } from '../lib/theme.ts';
import { getStoredTheme } from '../lib/storage.ts';

interface HeaderProps {
  isOffline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isOffline }) => {
  const { t, i18n } = useTranslation();
  const [currentTheme, setCurrentTheme] = React.useState<'system' | 'light' | 'dark'>(getStoredTheme());
  const isUrdu = i18n.language === 'ur';

  const toggleLanguage = () => {
    const nextLang = isUrdu ? 'en' : 'ur';
    setAppLanguage(nextLang);
  };

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    applyTheme(next);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#1F4D2B] text-[#FBF6EA] shadow-md transition-colors duration-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8A317] text-[#1F4D2B] shadow-sm">
            <Sprout className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-[#FBF6EA]">
              {t('app.name')}
            </h1>
            <p className="text-[10px] text-[#F3E6C4]/80 font-medium tracking-wide">
              {isUrdu ? 'سندھ ہول سیل منڈی' : 'Sindh Mandi Wholesale'}
            </p>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            type="button"
            aria-label="Toggle language between English and Urdu"
            className="flex items-center space-x-1 rtl:space-x-reverse rounded-full bg-[#1F4D2B]/80 border border-[#F3E6C4]/30 px-3 py-1.5 text-xs font-semibold text-[#F3E6C4] hover:bg-[#1F4D2B]/60 active:scale-95 transition"
          >
            <Globe className="h-3.5 w-3.5 text-[#E8A317]" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle light and dark theme"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F4D2B]/80 border border-[#F3E6C4]/30 text-[#F3E6C4] hover:bg-[#1F4D2B]/60 active:scale-95 transition"
          >
            {currentTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-[#E8A317]" />
            ) : (
              <Moon className="h-4 w-4 text-[#F3E6C4]" />
            )}
          </button>
        </div>
      </div>

      {/* Offline banner if active */}
      {isOffline && (
        <div className="bg-[#E8A317] text-[#3B2F24] px-4 py-1.5 text-xs font-semibold text-center flex items-center justify-center space-x-1 rtl:space-x-reverse shadow-inner">
          <span>⚠️ {t('prices.offlineNotice')}</span>
        </div>
      )}
    </header>
  );
};
