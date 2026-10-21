import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';
import { Crop, DISTRICTS, District, Grade, Listing } from '../../shared/types.ts';
import { api } from '../lib/api.ts';
import { ListingCard } from '../components/ListingCard.tsx';

export const MarketplacePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';

  const [crops, setCrops] = useState<Crop[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCropId, setSelectedCropId] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc'>('newest');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useEffect(() => {
    api.getCrops().then((res) => setCrops(res.data)).catch(console.error);
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings({
        cropId: selectedCropId || undefined,
        district: selectedDistrict || undefined,
        grade: selectedGrade || undefined,
        sort: sortBy,
        status: 'active',
      });
      setListings(data);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [selectedCropId, selectedDistrict, selectedGrade, sortBy]);

  const filteredListings = listings.filter((l) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (l.crop_name && l.crop_name.toLowerCase().includes(q)) ||
      (l.crop_name_ur && l.crop_name_ur.includes(q)) ||
      (l.seller_name && l.seller_name.toLowerCase().includes(q)) ||
      l.district.toLowerCase().includes(q)
    );
  });

  const activeFiltersCount =
    (selectedCropId ? 1 : 0) + (selectedDistrict ? 1 : 0) + (selectedGrade ? 1 : 0);

  const resetFilters = () => {
    setSelectedCropId('');
    setSelectedDistrict('');
    setSelectedGrade('');
    setShowFilterSheet(false);
  };

  return (
    <div className="pb-24 pt-2 px-4">
      {/* Title */}
      <div className="mb-3">
        <h2 className="text-xl font-bold tracking-tight text-[#1F4D2B] dark:text-[#E8A317]">
          {t('marketplace.title')}
        </h2>
        <p className="text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70 font-medium">
          {isUrdu
            ? 'سندھ بھر کے کاشتکاروں سے براہ راست فصلوں کی خریداری'
            : 'Direct harvest procurement straight from Sindh farmers'}
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('marketplace.search')}
            className="w-full rounded-2xl bg-white dark:bg-[#26241F] border border-[#F3E6C4]/60 dark:border-[#1B1A17] py-3 ps-10 pe-4 text-xs font-semibold text-[#3B2F24] dark:text-[#FBF6EA] placeholder-[#8A7B68] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] shadow-xs"
          />
          <Search className="absolute top-3.5 start-3.5 h-4 w-4 text-[#8A7B68] pointer-events-none" />
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilterSheet(true)}
          type="button"
          aria-label={t('marketplace.filters')}
          className={`relative flex h-11 items-center space-x-1.5 rtl:space-x-reverse rounded-2xl px-3.5 text-xs font-bold transition shadow-xs ${
            activeFiltersCount > 0
              ? 'bg-[#1F4D2B] text-[#FBF6EA]'
              : 'bg-white dark:bg-[#26241F] border border-[#F3E6C4]/70 dark:border-[#1B1A17] text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/40'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>{t('marketplace.filters')}</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#E8A317] text-[10px] font-black text-[#1F4D2B]">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Sort row */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-[#8A7B68]">
        <span>
          {filteredListings.length}{' '}
          {isUrdu ? 'دستیاب فصلیں' : 'available farm lots'}
        </span>
        <button
          onClick={() => setSortBy((prev) => (prev === 'newest' ? 'price_asc' : 'newest'))}
          type="button"
          className="flex items-center space-x-1 rtl:space-x-reverse font-bold text-[#1F4D2B] dark:text-[#E8A317] hover:underline"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          <span>
            {sortBy === 'newest'
              ? t('marketplace.newest')
              : t('marketplace.priceAsc')}
          </span>
        </button>
      </div>

      {/* Listings List */}
      <div className="mt-3 space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-36 rounded-[18px] bg-white/60 dark:bg-[#26241F]/60 animate-pulse border border-[#F3E6C4]/40 dark:border-[#1B1A17]"
              />
            ))}
          </div>
        )}

        {!loading && filteredListings.length === 0 && (
          <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-8 text-center border border-[#F3E6C4]/50 dark:border-[#1B1A17]">
            <p className="text-sm font-semibold text-[#8A7B68]">
              {t('marketplace.noListings')}
            </p>
          </div>
        )}

        {!loading &&
          filteredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
      </div>

      {/* Bottom Sheet Filter Modal */}
      {showFilterSheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-dialog-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-[480px] rounded-t-[24px] sm:rounded-[24px] bg-[#FBF6EA] dark:bg-[#26241F] text-[#3B2F24] dark:text-[#FBF6EA] shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#F3E6C4]/60 dark:border-[#1B1A17]">
              <h3 id="filter-dialog-title" className="text-base font-bold text-[#1F4D2B] dark:text-[#E8A317]">
                {t('marketplace.filters')}
              </h3>
              <button
                onClick={() => setShowFilterSheet(false)}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3E6C4]/60 dark:bg-[#1B1A17] hover:bg-[#F3E6C4] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Crop Filter */}
              <div>
                <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                  {t('alerts.crop')}
                </label>
                <select
                  value={selectedCropId}
                  onChange={(e) => setSelectedCropId(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
                >
                  <option value="">{isUrdu ? 'تمام فصلیں' : 'All Crops'}</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isUrdu ? `${c.name_ur} (${c.name})` : `${c.name} (${c.name_ur})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                  {t('onboarding.district')}
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
                >
                  <option value="">{t('marketplace.allDistricts')}</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Filter */}
              <div>
                <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                  {t('marketplace.grade')}
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
                >
                  <option value="">{t('marketplace.allGrades')}</option>
                  <option value="A">{t('myListings.gradeA')}</option>
                  <option value="B">{t('myListings.gradeB')}</option>
                  <option value="C">{t('myListings.gradeC')}</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-full bg-[#F3E6C4] dark:bg-[#1B1A17] border border-[#F3E6C4]/80 py-3 text-xs font-bold text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/70 transition"
                >
                  {t('common.reset')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFilterSheet(false)}
                  className="rounded-full bg-[#1F4D2B] text-[#FBF6EA] py-3 text-xs font-bold hover:bg-[#1F4D2B]/90 transition shadow-sm"
                >
                  {t('common.apply')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
