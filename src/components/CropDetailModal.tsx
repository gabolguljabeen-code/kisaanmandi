import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  Share2,
  BellPlus,
  Award,
  MapPin,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import { MarketComparison, PriceStats, TodayPriceRow } from '../../shared/types.ts';
import { api } from '../lib/api.ts';
import { formatCurrency, formatWhatsAppUrl } from '../lib/formatters.ts';

interface CropDetailModalProps {
  item: TodayPriceRow;
  marketName: string;
  onClose: () => void;
  onOpenSetAlert?: (cropId: string, marketId: string) => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  item,
  marketName,
  onClose,
  onOpenSetAlert,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [comparison, setComparison] = useState<MarketComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, compData] = await Promise.all([
          api.getPriceStats(item.crop_id, item.market_id, 14),
          api.getPriceComparison(item.crop_id),
        ]);
        if (isMounted) {
          setStats(statsData);
          setComparison(compData);
        }
      } catch (err) {
        console.error('Failed to load crop details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [item.crop_id, item.market_id]);

  const handleShare = async () => {
    const cropTitle = lang === 'ur' ? item.crop_name_ur : item.crop_name;
    const changeSign = item.direction === 'up' ? '+' : '';
    const shareText = t('cropDetail.shareMessage', {
      crop: cropTitle,
      market: marketName,
      price: item.price.toLocaleString(),
      change: `${changeSign}${formatCurrency(item.change_amount, lang)}`,
    });

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `KisanMandi: ${cropTitle}`,
          text: shareText,
          url: window.location.href,
        });
        return;
      } catch {
        // user cancelled or share failed, fallback to whatsapp link
      }
    }
    // Fallback: Open WhatsApp with prefilled message
    window.open(formatWhatsAppUrl('03000000000', shareText), '_blank');
  };

  const chartData = (stats?.series || []).map((s) => ({
    date: s.date.slice(5), // MM-DD
    fullDate: s.date,
    price: s.price,
  }));

  const latestPoint = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-detail-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] bg-[#FBF6EA] dark:bg-[#26241F] text-[#3B2F24] dark:text-[#FBF6EA] shadow-2xl transition-all"
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F3E6C4]/60 dark:border-[#1B1A17] bg-[#FBF6EA]/95 dark:bg-[#26241F]/95 px-5 py-3.5 backdrop-blur-md">
          <div>
            <h2 id="crop-detail-title" className="text-xl font-bold tracking-tight text-[#1F4D2B] dark:text-[#E8A317]">
              {lang === 'ur' ? item.crop_name_ur : item.crop_name}
            </h2>
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70 font-medium">
              <MapPin className="h-3.5 w-3.5" />
              <span>{marketName}</span>
              <span>•</span>
              <span>{item.category}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3E6C4]/60 dark:bg-[#1B1A17] text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4] transition active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Today's Rate Hero */}
          <div className="rounded-[18px] bg-white dark:bg-[#1B1A17] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17]">
            <span className="text-xs font-semibold text-[#8A7B68] dark:text-[#F3E6C4]/70">
              {t('prices.todayPrice')}
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="flex items-baseline space-x-1.5 rtl:space-x-reverse">
                <span className="text-lg font-bold text-[#1F4D2B] dark:text-[#E8A317]">
                  {lang === 'ur' ? 'روپے' : 'Rs'}
                </span>
                <span className="number-ltr text-3xl font-black text-[#1F4D2B] dark:text-[#E8A317]">
                  {Math.round(item.price).toLocaleString('en-US')}
                </span>
              </div>
              <span className="text-xs font-medium text-[#8A7B68]">
                {lang === 'ur' ? 'فی من (40 کلو)' : 'per maund (40 kg)'}
              </span>
            </div>
          </div>


          {/* 14-Day Line Chart */}
          <div className="rounded-[18px] bg-white dark:bg-[#1B1A17] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17]">
            <h3 className="text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA] mb-3 flex items-center justify-between">
              <span>{t('cropDetail.trendTitle')}</span>
              <span className="text-xs font-normal text-[#8A7B68]">14 days</span>
            </h3>

            {loading ? (
              <div className="h-44 flex items-center justify-center text-xs text-[#8A7B68] animate-pulse">
                {t('common.loading')}
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#8A7B68' }}
                      axisLine={{ stroke: '#F3E6C4' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 10, fill: '#8A7B68' }}
                      axisLine={{ stroke: '#F3E6C4' }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [`Rs ${Number(val).toLocaleString()}`, 'Price']}
                      labelFormatter={(label: any, p: any) => p[0]?.payload?.fullDate || label}
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: '#1B1A17',
                        color: '#FBF6EA',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#1F4D2B"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#E8A317', stroke: '#1F4D2B', strokeWidth: 2 }}
                    />
                    {latestPoint && (
                      <ReferenceDot
                        x={latestPoint.date}
                        y={latestPoint.price}
                        r={5}
                        fill="#E8A317"
                        stroke="#1F4D2B"
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-40 flex items-center justify-center text-xs text-[#8A7B68]">
                No historical records
              </div>
            )}

            {/* Stats Row */}
            {stats && (
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[#F3E6C4]/60 dark:border-[#1B1A17] pt-3 text-center">
                <div>
                  <span className="text-[10px] font-semibold text-[#8A7B68]">
                    {t('cropDetail.minPrice')}
                  </span>
                  <div className="text-xs font-bold text-[#3B2F24] dark:text-[#F3E6C4] mt-0.5">
                    <span className="me-0.5">{lang === 'ur' ? 'روپے' : 'Rs'}</span>
                    <span className="number-ltr">{Math.round(stats.min).toLocaleString('en-US')}</span>
                  </div>
                </div>
                <div className="border-x border-[#F3E6C4]/60 dark:border-[#1B1A17]">
                  <span className="text-[10px] font-semibold text-[#8A7B68]">
                    {t('cropDetail.avgPrice')}
                  </span>
                  <div className="text-xs font-bold text-[#3B2F24] dark:text-[#F3E6C4] mt-0.5">
                    <span className="me-0.5">{lang === 'ur' ? 'روپے' : 'Rs'}</span>
                    <span className="number-ltr">{Math.round(stats.average).toLocaleString('en-US')}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-[#8A7B68]">
                    {t('cropDetail.maxPrice')}
                  </span>
                  <div className="text-xs font-bold text-[#3B2F24] dark:text-[#F3E6C4] mt-0.5">
                    <span className="me-0.5">{lang === 'ur' ? 'روپے' : 'Rs'}</span>
                    <span className="number-ltr">{Math.round(stats.max).toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mandi Comparison List */}
          <div className="rounded-[18px] bg-white dark:bg-[#1B1A17] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17]">
            <h3 className="text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA] mb-3">
              {t('cropDetail.marketComparison')}
            </h3>
            <div className="space-y-2">
              {comparison.map((m) => (
                <div
                  key={m.market_id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    m.is_best
                      ? 'border-[#E8A317] bg-[#E8A317]/10 dark:bg-[#E8A317]/15'
                      : 'border-[#F3E6C4]/50 dark:border-[#1B1A17] bg-[#FBF6EA]/40 dark:bg-[#26241F]/50'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                      <span className="text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA]">
                        {m.market_name}
                      </span>
                      {m.is_best && (
                        <span className="inline-flex items-center space-x-1 rounded-full bg-[#E8A317] text-[#1F4D2B] px-2 py-0.5 text-[10px] font-black shadow-xs">
                          <Award className="h-3 w-3" />
                          <span>{t('prices.bestMarketBadge')}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70 font-medium">
                      {m.district}
                    </span>
                  </div>

                  <div className="flex flex-col items-end">
                    <div className="text-base font-bold text-[#1F4D2B] dark:text-[#E8A317]">
                      <span className="text-xs font-semibold me-1">{lang === 'ur' ? 'روپے' : 'Rs'}</span>
                      <span className="number-ltr">{Math.round(m.price).toLocaleString('en-US')}</span>
                    </div>
                    {!m.is_best && m.diff_from_best !== 0 && (
                      <div className="text-[11px] font-semibold text-[#B5532C] flex items-center space-x-0.5 rtl:space-x-reverse">
                        <span>{m.diff_from_best < 0 ? '-' : '+'}</span>
                        <span>{lang === 'ur' ? 'روپے ' : 'Rs '}</span>
                        <span className="number-ltr">{Math.round(Math.abs(m.diff_from_best)).toLocaleString('en-US')}</span>
                        <span className="text-[9px] font-normal text-[#8A7B68] ms-1">
                          {t('cropDetail.vsBest')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleShare}
              type="button"
              className="flex items-center justify-center space-x-2 rtl:space-x-reverse rounded-full bg-[#F3E6C4] dark:bg-[#1B1A17] border border-[#F3E6C4]/80 px-4 py-3.5 text-sm font-bold text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/80 active:scale-95 transition min-h-[52px]"
            >
              <Share2 className="h-4 w-4 text-[#1F4D2B] dark:text-[#E8A317]" />
              <span>{t('cropDetail.share')}</span>
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenSetAlert) {
                  onOpenSetAlert(item.crop_id, item.market_id);
                }
              }}
              type="button"
              className="flex items-center justify-center space-x-2 rtl:space-x-reverse rounded-full bg-[#1F4D2B] px-4 py-3.5 text-sm font-bold text-[#FBF6EA] hover:bg-[#1F4D2B]/90 active:scale-95 transition shadow-sm min-h-[52px]"
            >
              <BellPlus className="h-4 w-4 text-[#E8A317]" />
              <span>{t('cropDetail.setAlert')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
