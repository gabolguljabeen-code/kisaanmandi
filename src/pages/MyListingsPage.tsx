import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Package, PackageCheck } from 'lucide-react';
import { Crop, Listing, User } from '../../shared/types.ts';
import { api } from '../lib/api.ts';
import { ListingCard } from '../components/ListingCard.tsx';
import { ListingFormModal } from '../components/ListingFormModal.tsx';

interface MyListingsPageProps {
  currentUser: User;
}

export const MyListingsPage: React.FC<MyListingsPageProps> = ({ currentUser }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  const [listings, setListings] = useState<Listing[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  useEffect(() => {
    api.getCrops().then((res) => setCrops(res.data)).catch(console.error);
  }, []);

  const loadMyListings = async () => {
    setLoading(true);
    try {
      const data = await api.getListings({
        userId: currentUser.id,
        status: 'all',
      });
      setListings(data);
    } catch (err) {
      console.error('Failed to load farmer listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyListings();
  }, [currentUser.id]);

  const handleCreateOrUpdate = async (formData: any) => {
    if (editingListing) {
      const updated = await api.updateListing(editingListing.id, formData);
      setListings((prev) => prev.map((l) => (l.id === editingListing.id ? updated : l)));
    } else {
      const created = await api.createListing(formData);
      setListings((prev) => [created, ...prev]);
    }
    setEditingListing(null);
  };

  const handleMarkSold = async (listingId: string) => {
    try {
      const updated = await api.updateListing(listingId, { status: 'sold' });
      setListings((prev) => prev.map((l) => (l.id === listingId ? updated : l)));
    } catch (err) {
      console.error('Failed to mark listing as sold:', err);
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      await api.deleteListing(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const displayedListings = listings.filter((l) => l.status === activeTab);

  return (
    <div className="pb-24 pt-2 px-4">
      {/* Title & Create button */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#1F4D2B] dark:text-[#E8A317]">
            {t('myListings.title')}
          </h2>
          <p className="text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70 font-medium">
            {currentUser.name} ({currentUser.district})
          </p>
        </div>
        <button
          onClick={() => {
            setEditingListing(null);
            setShowFormModal(true);
          }}
          type="button"
          className="flex items-center space-x-1.5 rtl:space-x-reverse rounded-full bg-[#1F4D2B] text-[#FBF6EA] px-3.5 py-2 text-xs font-bold hover:bg-[#1F4D2B]/90 active:scale-95 transition shadow-sm"
        >
          <Plus className="h-4 w-4 text-[#E8A317] stroke-[3]" />
          <span>{t('myListings.newListing')}</span>
        </button>
      </div>

      {/* Segmented Tabs: Active Lots & Sold Lots */}
      <div className="grid grid-cols-2 gap-2 bg-[#F3E6C4]/40 dark:bg-[#26241F] p-1 rounded-2xl mb-4 border border-[#F3E6C4]/60 dark:border-[#1B1A17]">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className={`flex items-center justify-center space-x-1.5 rtl:space-x-reverse py-2.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'active'
              ? 'bg-[#1F4D2B] text-[#FBF6EA] shadow-sm'
              : 'text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>{t('myListings.activeTab')}</span>
          <span className="ms-1 rounded-full bg-[#F3E6C4]/30 px-1.5 py-0.2 text-[10px]">
            {listings.filter((l) => l.status === 'active').length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sold')}
          className={`flex items-center justify-center space-x-1.5 rtl:space-x-reverse py-2.5 text-xs font-bold rounded-xl transition ${
            activeTab === 'sold'
              ? 'bg-[#1F4D2B] text-[#FBF6EA] shadow-sm'
              : 'text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4]/50'
          }`}
        >
          <PackageCheck className="h-4 w-4" />
          <span>{t('myListings.soldTab')}</span>
          <span className="ms-1 rounded-full bg-[#F3E6C4]/30 px-1.5 py-0.2 text-[10px]">
            {listings.filter((l) => l.status === 'sold').length}
          </span>
        </button>
      </div>

      {/* Listings List */}
      <div className="space-y-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-32 rounded-[18px] bg-white/60 dark:bg-[#26241F]/60 animate-pulse border border-[#F3E6C4]/40 dark:border-[#1B1A17]"
              />
            ))}
          </div>
        )}

        {!loading && displayedListings.length === 0 && (
          <div className="rounded-[18px] bg-white dark:bg-[#26241F] p-8 text-center border border-[#F3E6C4]/50 dark:border-[#1B1A17] space-y-2">
            <Package className="mx-auto h-8 w-8 text-[#8A7B68]/60" />
            <p className="text-xs font-semibold text-[#8A7B68]">
              {activeTab === 'active'
                ? t('myListings.noActive')
                : t('myListings.noSold')}
            </p>
          </div>
        )}

        {!loading &&
          displayedListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isOwner={listing.user_id === currentUser.id}
              onEdit={(l) => {
                setEditingListing(l);
                setShowFormModal(true);
              }}
              onMarkSold={handleMarkSold}
              onDelete={handleDelete}
            />
          ))}
      </div>

      {/* Listing Form Modal */}
      {showFormModal && (
        <ListingFormModal
          crops={crops}
          userDistrict={currentUser.district}
          userPhone={currentUser.phone}
          initialData={editingListing}
          onClose={() => {
            setShowFormModal(false);
            setEditingListing(null);
          }}
          onSubmit={handleCreateOrUpdate}
        />
      )}
    </div>
  );
};
