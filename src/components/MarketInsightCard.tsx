import React from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MarketInsight } from '../../shared/types.ts';
import { formatCurrency } from '../lib/formatters.ts';

interface MarketInsightCardProps {
  insight: MarketInsight | null;
  onSelectCrop?: (cropId: string) => void;
}

export const MarketInsightCard: React.FC<MarketInsightCardProps> = ({
  insight,
  onSelectCrop,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  if (!insight || (!insight.top_gainer && !insight.top_loser)) {
    return null;
  }

  const { top_gainer, top_loser } = insight;

  return (
    <div className="mb-4 rounded-[18px] bg-[#F3E6C4]/50 dark:bg-[#26241F]/80 p-3.5 shadow-sm border border-[#F3E6C4]/60 dark:border-[#1B1A17]">
      <div className="grid grid-cols-2 gap-3 divide-x divide-[#F3E6C4]/80 dark:divide-[#1B1A17] rtl:divide-x-reverse">
        {/* Top Gainer */}
        {top_gainer ? (
          <div
            onClick={() => onSelectCrop && onSelectCrop(top_gainer.crop_id)}
            role="button"
            tabIndex={0}
            className="flex flex-col cursor-pointer ps-1 hover:opacity-90 transition gap-2"
          >
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-[#5C8A3C] font-bold text-xs">
              <TrendingUp className="h-3.5 w-3.5 shrink-0" />
              <span>{t('prices.topGainer')}</span>
            </div>
            <div className="font-bold text-sm text-[#3B2F24] dark:text-[#FBF6EA] truncate leading-normal py-0.5">
              {lang === 'ur' ? top_gainer.crop_name_ur : top_gainer.crop_name}
            </div>
            <div className="flex items-baseline space-x-1 rtl:space-x-reverse text-xs pt-0.5">
              <span className="font-semibold text-[#5C8A3C]">
                +{lang === 'ur' ? 'روپے ' : 'Rs '}
                <span className="number-ltr">{Math.abs(top_gainer.change_amount).toLocaleString('en-US')}</span>
              </span>
              <span className="number-ltr text-[10px] text-[#5C8A3C] font-bold">
                (+{top_gainer.change_percent}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#8A7B68] ps-1 flex items-center">-</div>
        )}

        {/* Top Loser */}
        {top_loser ? (
          <div
            onClick={() => onSelectCrop && onSelectCrop(top_loser.crop_id)}
            role="button"
            tabIndex={0}
            className="flex flex-col cursor-pointer ps-3 hover:opacity-90 transition gap-2"
          >
            <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-[#B5532C] font-bold text-xs">
              <TrendingDown className="h-3.5 w-3.5 shrink-0" />
              <span>{t('prices.topLoser')}</span>
            </div>
            <div className="font-bold text-sm text-[#3B2F24] dark:text-[#FBF6EA] truncate leading-normal py-0.5">
              {lang === 'ur' ? top_loser.crop_name_ur : top_loser.crop_name}
            </div>
            <div className="flex items-baseline space-x-1 rtl:space-x-reverse text-xs pt-0.5">
              <span className="font-semibold text-[#B5532C]">
                -{lang === 'ur' ? 'روپے ' : 'Rs '}
                <span className="number-ltr">{Math.abs(top_loser.change_amount).toLocaleString('en-US')}</span>
              </span>
              <span className="number-ltr text-[10px] text-[#B5532C] font-bold">
                ({top_loser.change_percent}%)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-[#8A7B68] ps-3 flex items-center">-</div>
        )}
      </div>


    </div>
  );
};

