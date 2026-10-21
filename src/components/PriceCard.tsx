import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { TodayPriceRow } from '../../shared/types.ts';
import { Sparkline } from './Sparkline.tsx';
import { formatCurrency } from '../lib/formatters.ts';

interface PriceCardProps {
  item: TodayPriceRow;
  isWatchlisted: boolean;
  onToggleWatchlist: (cropId: string) => void;
  onClick: (item: TodayPriceRow) => void;
}

export const PriceCard: React.FC<PriceCardProps> = ({
  item,
  isWatchlisted,
  onToggleWatchlist,
  onClick,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUp = item.direction === 'up';
  const isDown = item.direction === 'down';
  const changeSign = isUp ? '+' : '';
  const formattedChangeAmount = `${changeSign}${formatCurrency(item.change_amount, lang)}`;
  const formattedChangePercent = `${changeSign}${item.change_percent}%`;

  return (
    <div
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(item);
        }
      }}
      className="group relative flex cursor-pointer flex-col justify-between rounded-[18px] bg-white dark:bg-[#26241F] p-4 shadow-sm hover:shadow-md transition-all duration-200 border border-[#F3E6C4]/30 dark:border-[#1B1A17] active:scale-[0.99]"
    >
      {/* Top Header: Crop Name & Category & Watchlist */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <h3 className="text-base font-bold text-[#3B2F24] dark:text-[#FBF6EA]">
              {lang === 'ur' ? item.crop_name_ur : item.crop_name}
            </h3>
            <span className="text-xs text-[#8A7B68] dark:text-[#F3E6C4]/60 font-normal">
              ({lang === 'ur' ? item.crop_name : item.crop_name_ur})
            </span>
          </div>
          <span className="mt-1 self-start rounded-full bg-[#F3E6C4]/70 dark:bg-[#1B1A17] px-2.5 py-0.5 text-[11px] font-semibold text-[#3B2F24] dark:text-[#F3E6C4]">
            {item.category}
          </span>
        </div>

        <button
          type="button"
          aria-label={isWatchlisted ? t('prices.removeFromWatchlist') : t('prices.addToWatchlist')}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(item.crop_id);
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
            isWatchlisted
              ? 'text-[#E8A317] bg-[#E8A317]/10'
              : 'text-[#8A7B68]/50 hover:text-[#E8A317] hover:bg-[#F3E6C4]/40'
          }`}
        >
          <Star
            className={`h-5 w-5 ${isWatchlisted ? 'fill-[#E8A317] text-[#E8A317]' : 'stroke-[1.8]'}`}
          />
        </button>
      </div>

      {/* Middle & Bottom: Price, Change, and Sparkline */}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="flex items-baseline space-x-1 rtl:space-x-reverse">
            <span className="text-sm font-bold text-[#1F4D2B] dark:text-[#E8A317]">
              {lang === 'ur' ? 'روپے' : 'Rs'}
            </span>
            <span className="number-ltr text-2xl font-black text-[#1F4D2B] dark:text-[#E8A317] tracking-tight">
              {Math.round(item.price).toLocaleString('en-US')}
            </span>
            <span className="text-[11px] font-medium text-[#8A7B68] dark:text-[#F3E6C4]/70 ms-1">
              {lang === 'ur' ? 'فی من' : '/ maund'}
            </span>
          </div>

          {/* Daily Change Badge */}
          <div className="mt-1.5 flex items-center space-x-1 rtl:space-x-reverse">
            <span
              className={`inline-flex items-center space-x-1 rtl:space-x-reverse rounded-full px-2 py-0.5 text-xs font-bold ${
                isUp
                  ? 'bg-[#5C8A3C]/15 text-[#5C8A3C] dark:bg-[#5C8A3C]/25'
                  : isDown
                  ? 'bg-[#B5532C]/15 text-[#B5532C] dark:bg-[#B5532C]/25'
                  : 'bg-[#8A7B68]/15 text-[#8A7B68]'
              }`}
            >
              {isUp && <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />}
              {isDown && <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" />}
              {!isUp && !isDown && <Minus className="h-3.5 w-3.5 stroke-[2]" />}
              <span>{changeSign}{lang === 'ur' ? 'روپے' : 'Rs'}</span>
              <span className="number-ltr">{Math.abs(item.change_amount).toLocaleString('en-US')}</span>
              <span className="number-ltr">({changeSign}{item.change_percent}%)</span>
            </span>
          </div>
        </div>


        {/* 7-Day Sparkline */}
        <div className="flex flex-col items-end pb-0.5">
          <Sparkline
            data={item.history_7d || []}
            direction={item.direction}
            width={76}
            height={32}
          />
          <span className="text-[9px] text-[#8A7B68] dark:text-[#F3E6C4]/50 mt-1 font-medium">
            {lang === 'ur' ? '7 روزہ رجحان' : '7-day trend'}
          </span>
        </div>
      </div>
    </div>
  );
};
