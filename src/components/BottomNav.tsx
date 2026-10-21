import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  TrendingUp,
  ShoppingBag,
  Bell,
  PackagePlus,
  Calculator,
  Settings,
} from 'lucide-react';
import { Role } from '../../shared/types.ts';

export type TabKey = 'prices' | 'marketplace' | 'alerts' | 'listings' | 'profit' | 'settings';

interface BottomNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  role: Role;
  triggeredAlertsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  role,
  triggeredAlertsCount = 0,
}) => {
  const { t } = useTranslation();

  const farmerTabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'prices', label: t('nav.prices'), icon: TrendingUp },
    { key: 'marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { key: 'alerts', label: t('nav.alerts'), icon: Bell },
    { key: 'listings', label: t('nav.listings'), icon: PackagePlus },
    { key: 'profit', label: t('nav.profit'), icon: Calculator },
    { key: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const buyerTabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'prices', label: t('nav.prices'), icon: TrendingUp },
    { key: 'marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { key: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  const tabs = role === 'Buyer' ? buyerTabs : farmerTabs;

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[480px] md:max-w-3xl lg:max-w-4xl bg-[#FBF6EA] dark:bg-[#26241F] border-t border-[#F3E6C4]/60 dark:border-[#1B1A17] px-3 pt-2 pb-3 shadow-lg transition-colors duration-200"
    >
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.key;
          const Icon = tab.icon;
          const hasBadge = tab.key === 'alerts' && triggeredAlertsCount > 0;

          return (
            <button
              key={tab.key}
              onClick={() => onSelectTab(tab.key)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 px-0.5 transition-all rounded-xl ${
                isActive
                  ? 'text-[#1F4D2B] dark:text-[#E8A317] font-bold'
                  : 'text-[#8A7B68] dark:text-[#F3E6C4]/70 hover:text-[#3B2F24] dark:hover:text-[#FBF6EA]'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'
                  }`}
                />
                {hasBadge && (
                  <span
                    aria-label={`${triggeredAlertsCount} triggered alerts`}
                    className="absolute -top-1 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E8A317] px-1 text-[10px] font-black text-[#1F4D2B] shadow-sm animate-pulse"
                  >
                    {triggeredAlertsCount}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[12px] leading-relaxed pb-0.5 text-center">
                {tab.label}
              </span>
              {isActive && (
                <span className="h-1 w-5 rounded-full bg-[#1F4D2B] dark:bg-[#E8A317]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>

  );
};
