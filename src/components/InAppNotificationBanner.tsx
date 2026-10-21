import React from 'react';
import { useTranslation } from 'react-i18next';
import { BellRing, X } from 'lucide-react';
import { Alert } from '../../shared/types.ts';
import { formatCurrency } from '../lib/formatters.ts';

interface InAppNotificationBannerProps {
  alert: Alert | null;
  onClose: () => void;
  onOpenAlerts: () => void;
}

export const InAppNotificationBanner: React.FC<InAppNotificationBannerProps> = ({
  alert,
  onClose,
  onOpenAlerts,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';

  // Auto-dismiss after 8 seconds
  React.useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onClose();
    }, 8000);
    return () => clearTimeout(timer);
  }, [alert, onClose]);

  if (!alert) return null;

  const cropName = isUrdu ? alert.crop_name_ur || alert.crop_id : alert.crop_name || alert.crop_id;
  const marketName = alert.market_name || alert.market_id;

  return (
    <div
      role="alert"
      className="px-4 pt-2.5 pb-1 animate-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-start justify-between rounded-2xl bg-[#E8A317] text-[#1F4D2B] p-3.5 shadow-xl border-2 border-[#1F4D2B]/20 gap-3">
        <div
          onClick={onOpenAlerts}
          role="button"
          tabIndex={0}
          className="flex items-start space-x-2.5 rtl:space-x-reverse cursor-pointer flex-1 min-w-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1F4D2B] text-[#E8A317] shrink-0 mt-0.5">
            <BellRing className="h-4 w-4 animate-bounce" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <div className="text-xs font-black leading-snug">
              {t('alerts.triggeredBadge')}!
            </div>
            <div className="text-[11px] font-bold opacity-90 leading-relaxed">
              {t('alerts.inAppBanner', {
                crop: cropName,
                market: marketName,
                price: formatCurrency(alert.latest_price || 0, lang),
              })}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          aria-label="Close notification"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1F4D2B]/20 hover:bg-[#1F4D2B]/30 transition text-[#1F4D2B] shrink-0 mt-0.5"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
