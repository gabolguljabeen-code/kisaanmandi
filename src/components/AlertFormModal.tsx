import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, BellPlus } from 'lucide-react';
import { Crop, Market } from '../../shared/types.ts';
import { AlertCreateSchema } from '../../shared/schemas.ts';

interface AlertFormModalProps {
  crops: Crop[];
  markets: Market[];
  initialCropId?: string;
  initialMarketId?: string;
  onClose: () => void;
  onSubmit: (data: {
    crop_id: string;
    market_id: string;
    condition: 'Above' | 'Below';
    target_price: number;
  }) => Promise<void>;
}

export const AlertFormModal: React.FC<AlertFormModalProps> = ({
  crops,
  markets,
  initialCropId,
  initialMarketId,
  onClose,
  onSubmit,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';

  const [cropId, setCropId] = useState(initialCropId || (crops[0]?.id || ''));
  const [marketId, setMarketId] = useState(initialMarketId || (markets[0]?.id || ''));
  const [condition, setCondition] = useState<'Above' | 'Below'>('Above');
  const [targetPrice, setTargetPrice] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const parsedPrice = parseFloat(targetPrice);

    const validation = AlertCreateSchema.safeParse({
      crop_id: cropId,
      market_id: marketId,
      condition,
      target_price: parsedPrice,
    });

    if (!validation.success) {
      const err = (validation.error as any).issues?.[0];
      if (err?.message?.includes('greater than 0') || isNaN(parsedPrice)) {
        setErrorMsg(isUrdu ? 'ہدف قیمت صفر سے زیادہ ہونی چاہیے۔' : 'Target price must be greater than 0.');
      } else {
        setErrorMsg(err?.message || 'Invalid input');
      }
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        crop_id: cropId,
        market_id: marketId,
        condition,
        target_price: parsedPrice,
      });
      onClose();
    } catch (err: any) {
      const msg = isUrdu ? err?.error?.message_ur : err?.error?.message_en;
      setErrorMsg(msg || t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-[480px] rounded-t-[24px] sm:rounded-[24px] bg-[#FBF6EA] dark:bg-[#26241F] text-[#3B2F24] dark:text-[#FBF6EA] shadow-2xl p-5">
        <div className="flex items-center justify-between pb-4 border-b border-[#F3E6C4]/60 dark:border-[#1B1A17]">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8A317] text-[#1F4D2B]">
              <BellPlus className="h-4 w-4" />
            </div>
            <h2 id="alert-modal-title" className="text-lg font-bold text-[#1F4D2B] dark:text-[#E8A317]">
              {t('alerts.createAlert')}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3E6C4]/60 dark:bg-[#1B1A17] hover:bg-[#F3E6C4] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-4">
          {errorMsg && (
            <div className="rounded-xl bg-[#B5532C]/15 p-3 text-xs font-semibold text-[#B5532C]">
              {errorMsg}
            </div>
          )}

          {/* Crop select */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('alerts.crop')}
            </label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {isUrdu ? `${c.name_ur} (${c.name})` : `${c.name} (${c.name_ur})`}
                </option>
              ))}
            </select>
          </div>

          {/* Market select */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('alerts.market')}
            </label>
            <select
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.district})
                </option>
              ))}
            </select>
          </div>

          {/* Condition Segmented Control */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1.5">
              {t('alerts.condition')}
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#F3E6C4]/40 dark:bg-[#1B1A17] p-1 rounded-xl border border-[#F3E6C4]/60 dark:border-[#1B1A17]">
              <button
                type="button"
                onClick={() => setCondition('Above')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  condition === 'Above'
                    ? 'bg-[#1F4D2B] text-[#FBF6EA] shadow-sm'
                    : 'text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
                }`}
              >
                {t('alerts.above')}
              </button>
              <button
                type="button"
                onClick={() => setCondition('Below')}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  condition === 'Below'
                    ? 'bg-[#1F4D2B] text-[#FBF6EA] shadow-sm'
                    : 'text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
                }`}
              >
                {t('alerts.below')}
              </button>
            </div>
          </div>

          {/* Target Price */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('alerts.targetPrice')}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="10"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={t('alerts.targetPricePlaceholder')}
                className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#1F4D2B] text-[#FBF6EA] font-bold py-3.5 text-sm shadow-md hover:bg-[#1F4D2B]/90 active:scale-95 transition disabled:opacity-50 min-h-[52px]"
            >
              {submitting ? t('common.loading') : t('alerts.createAlert')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
