import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, BellRing, Bell } from 'lucide-react';
import { Alert, Crop, Market } from '../../shared/types.ts';
import { api } from '../lib/api.ts';
import { AlertCard } from '../components/AlertCard.tsx';
import { AlertFormModal } from '../components/AlertFormModal.tsx';

interface AlertsPageProps {
  onRefreshTriggeredCount?: () => void;
  prefillCropId?: string;
  prefillMarketId?: string;
  onClearPrefill?: () => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  onRefreshTriggeredCount,
  prefillCropId,
  prefillMarketId,
  onClearPrefill,
}) => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(Boolean(prefillCropId));

  useEffect(() => {
    Promise.all([api.getCrops(), api.getMarkets()])
      .then(([cropsRes, marketsData]) => {
        setCrops(cropsRes.data);
        setMarkets(marketsData);
      })
      .catch(console.error);
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
      if (onRefreshTriggeredCount) onRefreshTriggeredCount();
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleToggleActive = async (alertId: string, currentStatus: boolean) => {
    try {
      const updated = await api.updateAlert(alertId, { active_status: !currentStatus });
      setAlerts((prev) => prev.map((a) => (a.id === alertId ? updated : a)));
      if (onRefreshTriggeredCount) onRefreshTriggeredCount();
    } catch (err) {
      console.error('Failed to toggle alert status:', err);
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      await api.deleteAlert(alertId);
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      if (onRefreshTriggeredCount) onRefreshTriggeredCount();
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const handleCreateSubmit = async (data: {
    crop_id: string;
    market_id: string;
    condition: 'Above' | 'Below';
    target_price: number;
  }) => {
    const created = await api.createAlert(data);
    setAlerts((prev) => [created, ...prev]);
    if (onRefreshTriggeredCount) onRefreshTriggeredCount();
  };

  // Triggered alerts at top
  const sortedAlerts = [...alerts].sort((a, b) => {
    if (a.triggered && !b.triggered) return -1;
    if (!a.triggered && b.triggered) return 1;
    return 0;
  });

  const triggeredCount = alerts.filter((a) => a.triggered).length;

  return (
    <div className="pb-24 pt-2 px-4">
      {/* Header and New Alert button */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1F4D2B] dark:text-[#E8A317]">
            {t('alerts.title')}
          </h2>
          <p className="text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70 font-medium">
            {t('alerts.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          type="button"
          className="flex items-center space-x-1.5 rtl:space-x-reverse rounded-full bg-[#1F4D2B] text-[#FBF6EA] px-3.5 py-2 text-xs font-bold hover:bg-[#1F4D2B]/90 active:scale-95 transition shadow-sm"
        >
          <Plus className="h-4 w-4 text-[#E8A317] stroke-[3]" />
          <span>{t('alerts.createAlert')}</span>
        </button>
      </div>

      {/* Triggered Count Summary Banner */}
      {triggeredCount > 0 && (
        <div className="mb-4 rounded-xl bg-[#E8A317] text-[#1F4D2B] px-3.5 py-2.5 text-xs font-black shadow-xs flex items-center justify-between">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <BellRing className="h-4 w-4 animate-bounce" />
            <span>{t('alerts.triggeredCount', { count: triggeredCount })}</span>
          </div>
          <span className="text-[10px] font-bold underline cursor-pointer">
            {isUrdu ? 'ابھی جائزہ لیں' : 'Review now'}
          </span>
        </div>
      )}

      {/* Alerts list */}
      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-24 rounded-[18px] bg-white/60 dark:bg-[#26241F]/60 animate-pulse border border-[#F3E6C4]/40 dark:border-[#1B1A17]"
              />
            ))}
          </div>
        )}

        {!loading && sortedAlerts.length === 0 && (
          <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-8 text-center border border-[#F3E6C4]/50 dark:border-[#1B1A17] space-y-2">
            <Bell className="mx-auto h-8 w-8 text-[#8A7B68]/60" />
            <p className="text-xs font-semibold text-[#8A7B68]">
              {t('alerts.noAlerts')}
            </p>
          </div>
        )}

        {!loading &&
          sortedAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
      </div>

      {/* Create Alert Modal */}
      {showCreateModal && (
        <AlertFormModal
          crops={crops}
          markets={markets}
          initialCropId={prefillCropId}
          initialMarketId={prefillMarketId}
          onClose={() => {
            setShowCreateModal(false);
            if (onClearPrefill) onClearPrefill();
          }}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
};
