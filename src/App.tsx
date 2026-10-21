import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { BottomNav, TabKey } from './components/BottomNav.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { InAppNotificationBanner } from './components/InAppNotificationBanner.tsx';
import { PricesPage } from './pages/PricesPage.tsx';
import { MarketplacePage } from './pages/MarketplacePage.tsx';
import { AlertsPage } from './pages/AlertsPage.tsx';
import { MyListingsPage } from './pages/MyListingsPage.tsx';
import { ProfitPage } from './pages/ProfitPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { Alert, User } from '../shared/types.ts';
import { getStoredUser, setStoredUser, clearUserSession } from './lib/storage.ts';
import { applyTheme } from './lib/theme.ts';
import { api } from './lib/api.ts';
import './lib/i18n.ts';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [currentTab, setCurrentTab] = useState<TabKey>('prices');
  const [isOffline, setIsOffline] = useState(false);
  const [triggeredCount, setTriggeredCount] = useState(0);
  const [latestTriggeredAlert, setLatestTriggeredAlert] = useState<Alert | null>(null);
  const [prefillAlertCrop, setPrefillAlertCrop] = useState<{ cropId: string; marketId: string } | null>(null);

  // Initialize theme on mount
  useEffect(() => {
    applyTheme();
  }, []);

  // Check URL parameters for autostart / testing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' || params.get('user') === 'u1') {
      // Auto-assign u1 (Ali Demo - Farmer in Sukkur)
      const demoUser: User = {
        id: 'u1',
        name: 'Ali Demo',
        phone: '03000000001',
        district: 'Sukkur',
        role: 'Farmer',
        created_at: new Date().toISOString(),
      };
      setStoredUser(demoUser);
      setCurrentUser(demoUser);
    } else if (params.get('demo') === 'buyer' || params.get('user') === 'u2') {
      const buyerUser: User = {
        id: 'u2',
        name: 'Sana Sample',
        phone: '03000000002',
        district: 'Hyderabad',
        role: 'Buyer',
        created_at: new Date().toISOString(),
      };
      setStoredUser(buyerUser);
      setCurrentUser(buyerUser);
    }
  }, []);

  // Fetch triggered alerts count for badge
  const fetchTriggeredAlerts = useCallback(async () => {
    if (!currentUser || currentUser.role !== 'Farmer') {
      setTriggeredCount(0);
      return;
    }
    try {
      const res = await api.getTriggeredAlerts();
      setTriggeredCount(res.count);
      // If there are triggered alerts and not on alerts tab, banner the first one
      if (res.items.length > 0) {
        const first = res.items[0];
        setLatestTriggeredAlert(first);
      }
    } catch {
      // Offline fallback
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTriggeredAlerts();
    const timer = setInterval(fetchTriggeredAlerts, 45000);
    return () => clearInterval(timer);
  }, [fetchTriggeredAlerts]);

  // Ensure Buyer cannot stay on farmer-only tab
  useEffect(() => {
    if (currentUser?.role === 'Buyer') {
      if (currentTab === 'alerts' || currentTab === 'listings' || currentTab === 'profit') {
        setCurrentTab('prices');
      }
    }
  }, [currentUser?.role, currentTab]);

  const handleOpenSetAlert = (cropId: string, marketId: string) => {
    setPrefillAlertCrop({ cropId, marketId });
    setCurrentTab('alerts');
  };

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    setCurrentTab('prices');
  };

  return (
    <div className="min-h-screen bg-[#F3E6C4]/30 dark:bg-black text-[#3B2F24] dark:text-[#FBF6EA] flex justify-center sm:py-6 sm:px-4">
      {/* Mobile container - adaptive max-width for responsive tablet/desktop */}
      <div className="relative w-full max-w-[480px] md:max-w-3xl lg:max-w-4xl min-h-screen sm:min-h-[860px] bg-[#FBF6EA] dark:bg-[#1B1A17] sm:rounded-[36px] sm:shadow-2xl flex flex-col border-x sm:border border-[#F3E6C4]/60 dark:border-[#26241F] sm:overflow-hidden transition-colors duration-200">
        {/* Sticky Header */}
        <Header isOffline={isOffline} />



        {/* In-App Alert Notification Banner */}
        {latestTriggeredAlert && currentTab !== 'alerts' && (
          <InAppNotificationBanner
            alert={latestTriggeredAlert}
            onClose={() => setLatestTriggeredAlert(null)}
            onOpenAlerts={() => {
              setLatestTriggeredAlert(null);
              setCurrentTab('alerts');
            }}
          />
        )}

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'prices' && (
            <PricesPage
              onOpenSetAlert={handleOpenSetAlert}
              onRefreshTriggeredAlerts={fetchTriggeredAlerts}
              onOfflineStatusChange={setIsOffline}
            />
          )}

          {currentTab === 'marketplace' && <MarketplacePage />}

          {currentTab === 'alerts' && currentUser?.role === 'Farmer' && (
            <AlertsPage
              onRefreshTriggeredCount={fetchTriggeredAlerts}
              prefillCropId={prefillAlertCrop?.cropId}
              prefillMarketId={prefillAlertCrop?.marketId}
              onClearPrefill={() => setPrefillAlertCrop(null)}
            />
          )}

          {currentTab === 'listings' && currentUser?.role === 'Farmer' && (
            <MyListingsPage currentUser={currentUser} />
          )}

          {currentTab === 'profit' && currentUser?.role === 'Farmer' && <ProfitPage />}

          {currentTab === 'settings' && currentUser && (
            <SettingsPage
              currentUser={currentUser}
              onUserUpdated={(u) => setCurrentUser(u)}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        {currentUser && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            role={currentUser.role}
            triggeredAlertsCount={triggeredCount}
          />
        )}

        {/* First Launch Onboarding Modal */}
        {!currentUser && (
          <OnboardingModal
            onComplete={(user) => {
              setCurrentUser(user);
              setCurrentTab('prices');
            }}
          />
        )}
      </div>
    </div>
  );
}
