import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, CheckCircle2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Alert } from '../../shared/types.ts';
import { formatCurrency } from '../lib/formatters.ts';

interface AlertCardProps {
  alert: Alert;
  onToggleActive: (alertId: string, currentStatus: boolean) => void;
  onDelete: (alertId: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onToggleActive,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [showConfirm, setShowConfirm] = useState(false);
  const isUrdu = lang === 'ur';
  const isAbove = alert.condition === 'Above';

  return (
    <div
      className={`relative rounded-[18px] p-4 shadow-sm transition-all border ${
        alert.triggered
          ? 'bg-[#E8A317]/10 border-[#E8A317] dark:bg-[#E8A317]/15'
          : 'bg-white dark:bg-[#26241F] border-[#F3E6C4]/40 dark:border-[#1B1A17]'
      }`}
    >
      {/* Top Banner if Triggered */}
      {alert.triggered && (
        <div className="mb-2.5 flex items-center justify-between rounded-lg bg-[#E8A317] text-[#1F4D2B] px-2.5 py-1 text-xs font-black shadow-xs">
          <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
            <CheckCircle2 className="h-4 w-4 fill-[#1F4D2B] text-[#E8A317]" />
            <span>{t('alerts.triggeredBadge')}</span>
          </div>
          <span className="number-ltr font-bold text-[11px]">
            {t('alerts.currentRate')} {formatCurrency(alert.latest_price || 0, lang)}
          </span>
        </div>
      )}

      {/* Main Alert Info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <h3 className="text-base font-bold text-[#3B2F24] dark:text-[#FBF6EA]">
              {isUrdu ? alert.crop_name_ur || alert.crop_id : alert.crop_name || alert.crop_id}
            </h3>
            <span className="text-xs text-[#8A7B68] dark:text-[#F3E6C4]/60 font-medium">
              ({alert.market_name || alert.market_id})
            </span>
          </div>

          {/* Condition & Target */}
          <div className="mt-1 flex items-center space-x-2 rtl:space-x-reverse text-xs">
            <span
              className={`inline-flex items-center space-x-1 rtl:space-x-reverse rounded-full px-2 py-0.5 font-bold ${
                isAbove
                  ? 'bg-[#5C8A3C]/15 text-[#5C8A3C]'
                  : 'bg-[#B5532C]/15 text-[#B5532C]'
              }`}
            >
              {isAbove ? (
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" />
              )}
              <span>{isAbove ? t('alerts.above') : t('alerts.below')}</span>
            </span>
            <span className="number-ltr text-sm font-black text-[#1F4D2B] dark:text-[#E8A317]">
              {formatCurrency(alert.target_price, lang)}
            </span>
          </div>
        </div>

        {/* Controls: Active toggle & Delete */}
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          {/* Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={alert.active_status}
            aria-label={`Toggle alert active status for ${alert.crop_name || alert.crop_id}`}
            onClick={() => onToggleActive(alert.id, alert.active_status)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              alert.active_status ? 'bg-[#1F4D2B] dark:bg-[#E8A317]' : 'bg-[#8A7B68]/40'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                alert.active_status
                  ? 'translate-x-5 rtl:-translate-x-5'
                  : 'translate-x-0'
              }`}
            />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            aria-label="Delete alert"
            onClick={() => setShowConfirm(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8A7B68]/70 hover:text-[#B5532C] hover:bg-[#B5532C]/10 transition"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="mt-3 border-t border-[#F3E6C4]/60 dark:border-[#1B1A17] pt-2 flex items-center justify-between text-xs animate-in fade-in">
          <span className="text-[#B5532C] font-semibold">
            {t('alerts.deleteConfirmMsg')}
          </span>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setShowConfirm(false)}
              type="button"
              className="px-2.5 py-1 rounded-md bg-[#F3E6C4]/50 text-[#3B2F24] font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => {
                setShowConfirm(false);
                onDelete(alert.id);
              }}
              type="button"
              className="px-2.5 py-1 rounded-md bg-[#B5532C] text-white font-bold"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
