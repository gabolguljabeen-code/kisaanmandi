import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { CropCategory, Market, TodayPriceRow } from '../../shared/types.ts';
import { api } from '../lib/api.ts';
import { getStoredWatchlist, toggleWatchlistCrop } from '../lib/storage.ts';
import { PriceCard } from '../components/PriceCard.tsx';
import { MarketInsightCard } from '../components/MarketInsightCard.tsx';
import { CropDetailModal } from '../components/CropDetailModal.tsx';

interface PricesPageProps {
  onOpenSetAlert?: (cropId: string, marketId: string) => void;
  onRefreshTriggeredAlerts?: () => void;
  onOfflineStatusChange?: (isOffline: boolean) => void;
}

const CATEGORIES: ('All' | CropCategory)[] = [
  'All',
  'Grains',
  'Vegetables',
  'Fruits',
  'Pulses',
  'Cash Crops',
];

export const PricesPage: React.FC<PricesPageProps> = ({
  onOpenSetAlert,
  onRefreshTriggeredAlerts,
  onOfflineStatusChange,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';

  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string>(() => {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('kisan_selected_market')) || 'm1';
  });
  const [selectedCategory, setSelectedCategory] = useState<'All' | CropCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [prices, setPrices] = useState<TodayPriceRow[]>([]);
  const [insight, setInsight] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<string[]>(getStoredWatchlist());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCropItem, setSelectedCropItem] = useState<TodayPriceRow | null>(null);

  // Load Markets
  useEffect(() => {
    api
      .getMarkets()
      .then((data) => {
        setMarkets(data);
        if (!selectedMarketId && data.length > 0) {
          setSelectedMarketId(data[0].id);
        }
      })
      .catch((err) => console.error('Failed to load markets:', err));
  }, []);

  // Fetch prices and insight
  const loadPrices = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [pricesRes, insightData] = await Promise.all([
        api.getPricesToday(selectedMarketId, selectedCategory),
        api.getPriceInsight(selectedMarketId).catch((err) => {
          console.warn('Insight fetch failed, continuing without insight:', err);
          return null;
        }),
      ]);

      setPrices(pricesRes.data);
      setInsight(insightData);
      if (onOfflineStatusChange) {
        onOfflineStatusChange(pricesRes.isOffline);
      }
      if (onRefreshTriggeredAlerts) {
        onRefreshTriggeredAlerts();
      }
    } catch (err: any) {
      console.error('Failed to load prices:', err);
      setError(isUrdu ? 'منڈی قیمتیں لوڈ نہیں ہو سکیں۔' : 'Failed to load mandi prices.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [selectedMarketId, selectedCategory]);

  const handleSelectMarket = (id: string) => {
    setSelectedMarketId(id);
    localStorage.setItem('kisan_selected_market', id);
  };

  const handleToggleWatchlist = (cropId: string) => {
    const updated = toggleWatchlistCrop(cropId);
    setWatchlist(updated);
  };

  // Filter & Watchlist sort
  const filteredAndSorted = useMemo(() => {
    let list = prices;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.crop_name.toLowerCase().includes(q) ||
          p.crop_name_ur.includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort watchlisted first
    return [...list].sort((a, b) => {
      const aWatch = watchlist.includes(a.crop_id);
      const bWatch = watchlist.includes(b.crop_id);
      if (aWatch && !bWatch) return -1;
      if (!aWatch && bWatch) return 1;
      return 0;
    });
  }, [prices, searchQuery, watchlist]);

  const currentMarket = markets.find((m) => m.id === selectedMarketId);

  return (
    <div className="pb-24 pt-2">
      {/* Market Selector Chips */}
      <div className="px-4">
        <div className="no-scrollbar flex space-x-2 rtl:space-x-reverse overflow-x-auto py-1 pe-6">
          {markets.map((m) => {
            const isSelected = m.id === selectedMarketId;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMarket(m.id)}
                type="button"
                className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#1F4D2B] text-[#FBF6EA] shadow-sm scale-102'
                    : 'bg-white dark:bg-[#26241F] text-[#3B2F24] dark:text-[#F3E6C4] border border-[#F3E6C4]/60 dark:border-[#1B1A17] hover:bg-[#F3E6C4]/40'
                }`}
              >
                <span>{m.name}</span>
                <span className="opacity-75 text-[10px] ms-1 font-medium">({m.district})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Pull-to-refresh & Search Box */}
      <div className="mt-3 px-4 flex items-center space-x-2 rtl:space-x-reverse">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('prices.searchPlaceholder')}
            className="w-full rounded-2xl bg-white dark:bg-[#26241F] border border-[#F3E6C4]/60 dark:border-[#1B1A17] py-3 ps-10 pe-4 text-xs font-semibold text-[#3B2F24] dark:text-[#FBF6EA] placeholder-[#8A7B68] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] shadow-xs"
          />
          <Search className="absolute top-3.5 start-3.5 h-4 w-4 text-[#8A7B68] pointer-events-none" />
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => loadPrices(true)}
          disabled={refreshing}
          aria-label={t('prices.pullToRefresh')}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3E6C4]/70 dark:bg-[#26241F] border border-[#F3E6C4]/80 dark:border-[#1B1A17] text-[#1F4D2B] dark:text-[#E8A317] hover:bg-[#F3E6C4] active:scale-95 transition"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category Chips */}
      <div className="mt-3 px-4">
        <div className="no-scrollbar flex space-x-1.5 rtl:space-x-reverse overflow-x-auto py-1 pe-6">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                type="button"
                className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#F3E6C4] dark:bg-[#1B1A17] text-[#1F4D2B] dark:text-[#E8A317] shadow-xs'
                    : 'text-[#8A7B68] dark:text-[#F3E6C4]/60 hover:text-[#3B2F24] dark:hover:text-[#FBF6EA]'
                }`}
              >
                {t(`categories.${cat}`)}
              </button>
            );
          })}
        </div>
      </div>


      {/* Main Content Area */}
      <div className="mt-3 px-4">
        {/* Market Insight (Top Gainer / Top Loser) */}
        {!searchQuery && (
          <MarketInsightCard
            insight={insight}
            onSelectCrop={(cId) => {
              const found = prices.find((p) => p.crop_id === cId);
              if (found) setSelectedCropItem(found);
            }}
          />
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-28 rounded-[18px] bg-white/60 dark:bg-[#26241F]/60 animate-pulse border border-[#F3E6C4]/40 dark:border-[#1B1A17]"
              />
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {error && !loading && (
          <div className="rounded-[18px] bg-[#B5532C]/10 border border-[#B5532C]/30 p-6 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-[#B5532C]" />
            <p className="text-xs font-bold text-[#B5532C]">{error}</p>
            <button
              onClick={() => loadPrices()}
              type="button"
              className="rounded-full bg-[#B5532C] text-white px-5 py-2 text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition"
            >
              {t('prices.retry')}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredAndSorted.length === 0 && (
          <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-8 text-center border border-[#F3E6C4]/50 dark:border-[#1B1A17]">
            <p className="text-sm font-semibold text-[#8A7B68]">
              {t('prices.noCropsFound')}
            </p>
          </div>
        )}

        {/* Price Cards List */}
        {!loading && !error && filteredAndSorted.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredAndSorted.map((item) => (
              <PriceCard
                key={item.crop_id}
                item={item}
                isWatchlisted={watchlist.includes(item.crop_id)}
                onToggleWatchlist={handleToggleWatchlist}
                onClick={(selected) => setSelectedCropItem(selected)}
              />
            ))}
          </div>
        )}
      </div>


      {/* Crop Detail Modal */}
      {selectedCropItem && (
        <CropDetailModal
          item={selectedCropItem}
          marketName={currentMarket?.name || 'Mandi'}
          onClose={() => setSelectedCropItem(null)}
          onOpenSetAlert={onOpenSetAlert}
        />
      )}
    </div>
  );
};
