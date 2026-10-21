import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown, Sliders } from 'lucide-react';
import { Crop, Market, ProfitCalculationResult } from '../../shared/types.ts';
import { api } from '../lib/api.ts';
import { formatCurrency } from '../lib/formatters.ts';

export const ProfitPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';

  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [cropId, setCropId] = useState('c3'); // default Onion
  const [marketId, setMarketId] = useState('m1'); // default Zaitoon
  const [quantity, setQuantity] = useState('50'); // default 50 maunds
  const [costPerMaund, setCostPerMaund] = useState('2000'); // default cost
  const [priceShift, setPriceShift] = useState(0); // slider -20 to +20
  const [result, setResult] = useState<ProfitCalculationResult | null>(null);

  useEffect(() => {
    Promise.all([api.getCrops(), api.getMarkets()]).then(([cRes, mData]) => {
      setCrops(cRes.data);
      setMarkets(mData);
    });
  }, []);

  const calculate = async () => {
    const qty = parseFloat(quantity);
    const cost = parseFloat(costPerMaund);

    if (!cropId || !marketId || isNaN(qty) || qty <= 0 || isNaN(cost) || cost < 0) {
      return;
    }

    try {
      const res = await api.calculateProfit({
        crop_id: cropId,
        market_id: marketId,
        quantity: qty,
        cost_per_maund: cost,
        price_shift_percent: priceShift,
      });
      setResult(res);
    } catch (err) {
      console.error('Calculation error:', err);
    }
  };

  useEffect(() => {
    calculate();
  }, [cropId, marketId, quantity, costPerMaund, priceShift]);

  const isProfit = (result?.profit || 0) >= 0;

  return (
    <div className="pb-24 pt-2 px-4">
      {/* Title */}
      <div className="mb-4">
        <h2 className="text-xl font-bold tracking-tight text-[#1F4D2B] dark:text-[#E8A317]">
          {t('profit.title')}
        </h2>
        <p className="text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70 font-medium">
          {t('profit.subtitle')}
        </p>
      </div>

      {/* Inputs Card */}
      <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17] space-y-3.5">
        <div className="grid grid-cols-2 gap-3">
          {/* Crop */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('profit.crop')}
            </label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full rounded-xl bg-[#F3E6C4]/20 dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-2.5 text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>
                  {isUrdu ? c.name_ur : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Market */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('profit.market')}
            </label>
            <select
              value={marketId}
              onChange={(e) => setMarketId(e.target.value)}
              className="w-full rounded-xl bg-[#F3E6C4]/20 dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-2.5 text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
            >
              {markets.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Quantity */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('profit.quantity')}
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full rounded-xl bg-[#F3E6C4]/20 dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-2.5 text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
            />
          </div>

          {/* Cost per maund */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('profit.cost')}
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={costPerMaund}
              onChange={(e) => setCostPerMaund(e.target.value)}
              className="w-full rounded-xl bg-[#F3E6C4]/20 dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-2.5 text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
            />
          </div>
        </div>

        {/* What-If Slider */}
        <div className="border-t border-[#F3E6C4]/60 dark:border-[#1B1A17] pt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-[#3B2F24] dark:text-[#F3E6C4] flex items-center space-x-1 rtl:space-x-reverse">
              <Sliders className="h-3.5 w-3.5 text-[#E8A317]" />
              <span>{t('profit.whatIf')}</span>
            </span>
            <span
              className={`number-ltr font-black px-2 py-0.5 rounded-full text-xs ${
                priceShift > 0
                  ? 'bg-[#5C8A3C]/20 text-[#5C8A3C]'
                  : priceShift < 0
                  ? 'bg-[#B5532C]/20 text-[#B5532C]'
                  : 'bg-[#F3E6C4]/50 text-[#8A7B68]'
              }`}
            >
              {priceShift > 0 ? `+${priceShift}%` : `${priceShift}%`}
            </span>
          </div>
          <input
            type="range"
            min="-20"
            max="20"
            step="1"
            value={priceShift}
            onChange={(e) => setPriceShift(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#F3E6C4] dark:bg-[#1B1A17] rounded-lg appearance-none cursor-pointer accent-[#1F4D2B] dark:accent-[#E8A317]"
          />
          <div className="flex justify-between text-[10px] text-[#8A7B68] font-bold mt-1">
            <span>-20% ({isUrdu ? 'کمی' : 'Drop'})</span>
            <span>0%</span>
            <span>+20% ({isUrdu ? 'اضافہ' : 'Rise'})</span>
          </div>
        </div>
      </div>

      {/* Live Calculation Output Card */}
      {result && (
        <div className="mt-4 rounded-[18px] bg-white dark:bg-[#26241F] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17] space-y-4 animate-in fade-in">
          {/* Main Net Profit / Loss Banner */}
          <div
            className={`rounded-2xl p-4 text-center ${
              isProfit
                ? 'bg-[#5C8A3C]/15 text-[#5C8A3C] dark:bg-[#5C8A3C]/20'
                : 'bg-[#B5532C]/15 text-[#B5532C] dark:bg-[#B5532C]/20'
            }`}
          >
            <div className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse text-xs font-bold">
              {isProfit ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{isProfit ? t('profit.netProfit') : t('profit.netLoss')}</span>
            </div>
            <div className="number-ltr mt-1 text-3xl font-black">
              {formatCurrency(Math.abs(result.profit), lang)}
            </div>
            <div className="mt-1 text-xs font-bold opacity-80">
              {t('profit.margin')}:{' '}
              <span className="number-ltr">
                {result.margin_percent !== null ? `${result.margin_percent}%` : '-'}
              </span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-[#F3E6C4]/60 dark:border-[#1B1A17] pt-3 text-center">
            <div>
              <span className="text-[10px] font-semibold text-[#8A7B68]">
                {t('profit.priceUsed')}
              </span>
              <div className="number-ltr text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] mt-0.5">
                {formatCurrency(result.price_used, lang)}
              </div>
            </div>
            <div className="border-x border-[#F3E6C4]/60 dark:border-[#1B1A17]">
              <span className="text-[10px] font-semibold text-[#8A7B68]">
                {t('profit.revenue')}
              </span>
              <div className="number-ltr text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] mt-0.5">
                {formatCurrency(result.revenue, lang)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#8A7B68]">
                {t('profit.totalCost')}
              </span>
              <div className="number-ltr text-xs font-bold text-[#3B2F24] dark:text-[#FBF6EA] mt-0.5">
                {formatCurrency(result.total_cost, lang)}
              </div>
            </div>
          </div>

          {/* Plain-Language Translated Summary Sentence */}
          <div className="rounded-xl bg-[#F3E6C4]/30 dark:bg-[#1B1A17] p-3 text-xs leading-relaxed text-[#3B2F24] dark:text-[#F3E6C4] font-medium">
            💡 {isUrdu ? result.summary_ur : result.summary_en}
          </div>
        </div>
      )}
    </div>
  );
};
