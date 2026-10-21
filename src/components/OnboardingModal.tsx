import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, ShoppingBag, TrendingUp, Bell, ChevronRight, Check } from 'lucide-react';
import { DISTRICTS, District, Role, User } from '../../shared/types.ts';
import { UserCreateSchema } from '../../shared/schemas.ts';
import { setAppLanguage } from '../lib/i18n.ts';
import { api } from '../lib/api.ts';
import { setStoredUser } from '../lib/storage.ts';

interface OnboardingModalProps {
  onComplete: (user: User) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { t, i18n } = useTranslation();
  const hasChosenLang = typeof localStorage !== 'undefined' && localStorage.getItem('kisan_lang') !== null;
  const [step, setStep] = useState<'language' | 'signup' | 'tips'>(
    hasChosenLang ? 'signup' : 'language'
  );

  // Signup Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState<District>('Sukkur');
  const [role, setRole] = useState<Role>('Farmer');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  // Tips state
  const [currentTip, setCurrentTip] = useState(0);
  const isUrdu = i18n.language === 'ur';

  const handleSelectLanguage = (lang: 'en' | 'ur') => {
    setAppLanguage(lang);
    setStep('signup');
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validation = UserCreateSchema.safeParse({
      name,
      phone,
      district,
      role,
    });

    if (!validation.success) {
      const err = (validation.error as any).issues?.[0];
      if (err?.path?.includes('phone')) {
        setErrorMsg(isUrdu ? 'درست 11 ہندسوں کا فون نمبر (03XXXXXXXXX) درج کریں۔' : 'Phone must be in format 03XXXXXXXXX (11 digits).');
      } else if (err?.path?.includes('name')) {
        setErrorMsg(isUrdu ? 'نام 2 سے 60 حروف کے درمیان ہونا چاہیے۔' : 'Name must be between 2 and 60 characters.');
      } else {
        setErrorMsg(err?.message || 'Invalid input');
      }
      return;
    }

    try {
      setSubmitting(true);
      const user = await api.createUser({ name, phone, district, role });
      setStoredUser(user);
      setCreatedUser(user);
      setStep('tips');
    } catch (err: any) {
      const msg = isUrdu ? err?.error?.message_ur : err?.error?.message_en;
      setErrorMsg(msg || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const tips = [
    {
      icon: TrendingUp,
      title: t('onboarding.tips.tip1Title'),
      desc: t('onboarding.tips.tip1Desc'),
      color: 'bg-[#1F4D2B] text-[#FBF6EA]',
    },
    {
      icon: Bell,
      title: t('onboarding.tips.tip2Title'),
      desc: t('onboarding.tips.tip2Desc'),
      color: 'bg-[#E8A317] text-[#1F4D2B]',
    },
    {
      icon: ShoppingBag,
      title: t('onboarding.tips.tip3Title'),
      desc: t('onboarding.tips.tip3Desc'),
      color: 'bg-[#5C8A3C] text-[#FBF6EA]',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F4D2B]/90 p-4 backdrop-blur-sm animate-in fade-in"
    >
      <div className="w-full max-w-[440px] rounded-[24px] bg-[#FBF6EA] dark:bg-[#26241F] text-[#3B2F24] dark:text-[#FBF6EA] shadow-2xl p-6 overflow-hidden">
        {/* Step 1: Language Selection */}
        {step === 'language' && (
          <div className="text-center space-y-6 py-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E8A317] text-[#1F4D2B] shadow-md">
              <Sprout className="h-9 w-9 stroke-[2.2]" />
            </div>

            <div>
              <h2 id="onboarding-title" className="text-2xl font-bold tracking-tight text-[#1F4D2B] dark:text-[#E8A317]">
                KisanMandi / کسان منڈی
              </h2>
              <p className="mt-2 text-sm text-[#8A7B68] dark:text-[#F3E6C4]/70">
                Please select your preferred language
                <br />
                براہِ کرم اپنی زبان منتخب کریں
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-[#1B1A17] border-2 border-[#F3E6C4]/80 hover:border-[#1F4D2B] text-[#1F4D2B] font-bold text-lg shadow-sm hover:shadow transition active:scale-95"
              >
                <span>English</span>
                <span className="text-xs font-normal text-[#8A7B68] mt-1">Select English</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLanguage('ur')}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#1F4D2B] text-[#F3E6C4] border-2 border-[#1F4D2B] font-bold text-xl shadow-sm hover:shadow transition active:scale-95"
              >
                <span>اردو</span>
                <span className="text-xs font-normal text-[#F3E6C4]/80 mt-1">اردو منتخب کریں</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Signup Form */}
        {step === 'signup' && (
          <div>
            <div className="text-center mb-5">
              <h2 id="onboarding-title" className="text-xl font-black text-[#1F4D2B] dark:text-[#E8A317]">
                {t('onboarding.welcome')}
              </h2>
              <p className="mt-1 text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70">
                {t('onboarding.subheading')}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl bg-[#B5532C]/15 p-3 text-xs font-semibold text-[#B5532C]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                  {t('onboarding.fullName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('onboarding.fullNamePlaceholder')}
                  className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                  {t('onboarding.phone')}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('onboarding.phonePlaceholder')}
                  className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
                  required
                />
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                  {t('onboarding.district')}
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as District)}
                  className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection (2 large cards) */}
              <div>
                <label className="block text-xs font-bold text-[#8A7B68] mb-2">
                  {t('onboarding.role')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Farmer Card */}
                  <div
                    onClick={() => setRole('Farmer')}
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer rounded-2xl p-3.5 border-2 transition ${
                      role === 'Farmer'
                        ? 'border-[#1F4D2B] bg-[#1F4D2B]/10 dark:bg-[#1F4D2B]/20 shadow-xs'
                        : 'border-[#F3E6C4]/80 dark:border-[#1B1A17] bg-white dark:bg-[#1B1A17]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1F4D2B] text-[#FBF6EA]">
                        <Sprout className="h-4 w-4" />
                      </div>
                      {role === 'Farmer' && (
                        <Check className="h-4 w-4 text-[#1F4D2B] stroke-[3]" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA]">
                      {t('onboarding.farmer')}
                    </h4>
                    <p className="mt-1 text-[10px] text-[#8A7B68] dark:text-[#F3E6C4]/60 leading-tight">
                      {t('onboarding.farmerDesc')}
                    </p>
                  </div>

                  {/* Buyer Card */}
                  <div
                    onClick={() => setRole('Buyer')}
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer rounded-2xl p-3.5 border-2 transition ${
                      role === 'Buyer'
                        ? 'border-[#1F4D2B] bg-[#1F4D2B]/10 dark:bg-[#1F4D2B]/20 shadow-xs'
                        : 'border-[#F3E6C4]/80 dark:border-[#1B1A17] bg-white dark:bg-[#1B1A17]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E8A317] text-[#1F4D2B]">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      {role === 'Buyer' && (
                        <Check className="h-4 w-4 text-[#1F4D2B] stroke-[3]" />
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA]">
                      {t('onboarding.buyer')}
                    </h4>
                    <p className="mt-1 text-[10px] text-[#8A7B68] dark:text-[#F3E6C4]/60 leading-tight">
                      {t('onboarding.buyerDesc')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-[#1F4D2B] text-[#FBF6EA] font-bold py-3.5 text-sm shadow-md hover:bg-[#1F4D2B]/90 active:scale-95 transition disabled:opacity-50 min-h-[52px]"
                >
                  {submitting ? t('common.loading') : t('onboarding.continue')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Swipeable Tips Cards */}
        {step === 'tips' && (
          <div className="text-center py-2 space-y-6">
            {/* Active tip card */}
            {(() => {
              const tip = tips[currentTip];
              const Icon = tip.icon;
              return (
                <div className="space-y-4">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${tip.color} shadow-md`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1F4D2B] dark:text-[#E8A317]">
                      {tip.title}
                    </h3>
                    <p className="mt-2 text-xs text-[#8A7B68] dark:text-[#F3E6C4]/80 leading-relaxed px-4">
                      {tip.desc}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Dots */}
            <div className="flex justify-center space-x-2 rtl:space-x-reverse pt-2">
              {tips.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentTip
                      ? 'w-6 bg-[#1F4D2B] dark:bg-[#E8A317]'
                      : 'w-2 bg-[#F3E6C4]/80 dark:bg-[#1B1A17]'
                  }`}
                />
              ))}
            </div>

            {/* Next / Finish */}
            <div className="pt-2">
              {currentTip < tips.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentTip((prev) => prev + 1)}
                  className="w-full flex items-center justify-center space-x-2 rtl:space-x-reverse rounded-full bg-[#1F4D2B] text-[#FBF6EA] font-bold py-3.5 text-sm shadow-md hover:bg-[#1F4D2B]/90 active:scale-95 transition min-h-[52px]"
                >
                  <span>{isUrdu ? 'اگلا' : 'Next'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => createdUser && onComplete(createdUser)}
                  className="w-full rounded-full bg-[#E8A317] text-[#1F4D2B] font-black py-3.5 text-sm shadow-md hover:bg-[#E8A317]/90 active:scale-95 transition min-h-[52px]"
                >
                  {t('onboarding.tips.getStarted')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
