import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, MessageSquare, MapPin, Calendar, CheckCircle2, Trash2, Edit3 } from 'lucide-react';
import { Listing } from '../../shared/types.ts';
import { formatCurrency, formatDate, formatTelUrl, formatWhatsAppUrl } from '../lib/formatters.ts';

interface ListingCardProps {
  listing: Listing;
  isOwner?: boolean;
  onEdit?: (listing: Listing) => void;
  onMarkSold?: (listingId: string) => void;
  onDelete?: (listingId: string) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isOwner,
  onEdit,
  onMarkSold,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmSold, setShowConfirmSold] = useState(false);

  const isSold = listing.status === 'sold';

  let badgeClasses = 'bg-[#F3E6C4] text-[#3B2F24]';
  let badgeLabel = t('marketplace.priceLabel.at_market');

  if (listing.price_label === 'at_market') {
    badgeClasses = 'bg-[#5C8A3C]/15 text-[#5C8A3C] font-bold';
    badgeLabel = t('marketplace.priceLabel.at_market');
  } else if (listing.price_label === 'above_market') {
    badgeClasses = 'bg-[#E8A317]/20 text-[#3B2F24] dark:text-[#E8A317] font-bold';
    badgeLabel = t('marketplace.priceLabel.above_market');
  } else if (listing.price_label === 'below_market') {
    badgeClasses = 'bg-[#B5532C]/15 text-[#B5532C] font-bold';
    badgeLabel = t('marketplace.priceLabel.below_market');
  }

  const cropTitle = isUrdu ? listing.crop_name_ur || listing.crop_id : listing.crop_name || listing.crop_id;
  const whatsAppText = isUrdu
    ? `السلام علیکم، میں آپ کی فصل ${cropTitle} (${listing.quantity} من) کے بارے میں کسان منڈی پر بات کرنا چاہتا ہوں۔`
    : `Assalam-o-Alaikum, I am inquiring about your listing for ${cropTitle} (${listing.quantity} maunds) on KisanMandi.`;

  return (
    <div className="relative rounded-[18px] bg-white dark:bg-[#26241F] p-4 shadow-sm border border-[#F3E6C4]/40 dark:border-[#1B1A17] transition-all">
      {/* Sold Overlay Banner */}
      {isSold && (
        <div className="mb-3 inline-flex items-center space-x-1.5 rtl:space-x-reverse rounded-lg bg-[#8A7B68]/20 dark:bg-[#1B1A17] px-2.5 py-1 text-xs font-black text-[#8A7B68] dark:text-[#F3E6C4]">
          <CheckCircle2 className="h-4 w-4" />
          <span>{t('status.sold')}</span>
        </div>
      )}

      {/* Header: Crop name, Grade & Price Label Badge */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <h3 className="text-base font-bold text-[#3B2F24] dark:text-[#FBF6EA]">
              {cropTitle}
            </h3>
            <span className="rounded-full bg-[#F3E6C4]/60 dark:bg-[#1B1A17] px-2 py-0.5 text-[11px] font-bold text-[#3B2F24] dark:text-[#F3E6C4]">
              {t('marketplace.grade')} {listing.grade}
            </span>
          </div>
          <div className="mt-1 flex items-center space-x-2 rtl:space-x-reverse text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70 font-medium">
            <span className="flex items-center space-x-1 rtl:space-x-reverse">
              <MapPin className="h-3.5 w-3.5" />
              <span>{listing.district}</span>
            </span>
            <span>•</span>
            <span>{listing.seller_name}</span>
          </div>
        </div>

        {/* Market Label Badge */}
        <span className={`rounded-full px-2.5 py-1 text-[11px] shadow-xs ${badgeClasses}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Quantity & Asking Price */}
      <div className="mt-3.5 flex items-baseline justify-between border-y border-[#F3E6C4]/40 dark:border-[#1B1A17] py-2.5">
        <div>
          <span className="text-[10px] font-semibold text-[#8A7B68]">
            {t('marketplace.quantity')}
          </span>
          <div className="number-ltr text-lg font-bold text-[#3B2F24] dark:text-[#FBF6EA]">
            {listing.quantity} <span className="text-xs font-normal text-[#8A7B68]">{t('marketplace.maunds')}</span>
          </div>
        </div>

        <div className="text-end">
          <span className="text-[10px] font-semibold text-[#8A7B68]">
            {t('marketplace.askingPrice')}
          </span>
          <div className="number-ltr text-lg font-black text-[#1F4D2B] dark:text-[#E8A317]">
            {formatCurrency(listing.asking_price, lang)}
            <span className="text-xs font-normal text-[#8A7B68] ms-1">{lang === 'ur' ? 'فی من' : '/ md'}</span>
          </div>
        </div>
      </div>

      {/* Available date */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-[#8A7B68] dark:text-[#F3E6C4]/70">
        <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
          <Calendar className="h-3.5 w-3.5" />
          <span>{t('marketplace.availableFrom')}:</span>
          <span className="number-ltr font-semibold text-[#3B2F24] dark:text-[#F3E6C4]">
            {formatDate(listing.available_from, lang)}
          </span>
        </div>
      </div>

      {/* Actions */}
      {!isOwner ? (
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <a
            href={formatTelUrl(listing.contact_phone)}
            className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse rounded-full bg-[#1F4D2B] text-[#FBF6EA] text-xs font-bold py-2.5 hover:bg-[#1F4D2B]/90 active:scale-95 transition min-h-[44px]"
          >
            <Phone className="h-3.5 w-3.5 text-[#E8A317]" />
            <span>{t('marketplace.call')}</span>
          </a>
          <a
            href={formatWhatsAppUrl(listing.contact_phone, whatsAppText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-1.5 rtl:space-x-reverse rounded-full bg-[#F3E6C4] dark:bg-[#1B1A17] border border-[#F3E6C4]/80 text-[#3B2F24] dark:text-[#F3E6C4] text-xs font-bold py-2.5 hover:bg-[#F3E6C4]/80 active:scale-95 transition min-h-[44px]"
          >
            <MessageSquare className="h-3.5 w-3.5 text-[#5C8A3C]" />
            <span>{t('marketplace.whatsapp')}</span>
          </a>
        </div>
      ) : (
        /* Owner Action Controls */
        <div className="mt-3.5 flex items-center justify-between border-t border-[#F3E6C4]/40 dark:border-[#1B1A17] pt-2.5">
          {!isSold && onMarkSold && (
            <button
              onClick={() => setShowConfirmSold(true)}
              type="button"
              className="text-xs font-bold text-[#5C8A3C] hover:underline flex items-center space-x-1 rtl:space-x-reverse"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t('myListings.markSold')}</span>
            </button>
          )}
          <div className="flex items-center space-x-2 rtl:space-x-reverse ms-auto">
            {!isSold && onEdit && (
              <button
                onClick={() => onEdit(listing)}
                type="button"
                className="flex items-center space-x-1 rtl:space-x-reverse rounded-full bg-[#F3E6C4]/60 dark:bg-[#1B1A17] px-3 py-1.5 text-xs font-bold text-[#3B2F24] dark:text-[#F3E6C4] hover:bg-[#F3E6C4] transition"
              >
                <Edit3 className="h-3 w-3" />
                <span>{t('common.edit')}</span>
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                type="button"
                className="flex items-center space-x-1 rtl:space-x-reverse rounded-full bg-[#B5532C]/10 px-3 py-1.5 text-xs font-bold text-[#B5532C] hover:bg-[#B5532C]/20 transition"
              >
                <Trash2 className="h-3 w-3" />
                <span>{t('common.delete')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm Mark Sold Dialog */}
      {showConfirmSold && (
        <div className="mt-3 border-t border-[#F3E6C4]/60 dark:border-[#1B1A17] pt-2 flex items-center justify-between text-xs animate-in fade-in">
          <span className="text-[#3B2F24] dark:text-[#FBF6EA] font-semibold">
            {t('myListings.markSoldConfirm')}
          </span>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setShowConfirmSold(false)}
              type="button"
              className="px-2.5 py-1 rounded-md bg-[#F3E6C4]/50 text-[#3B2F24] font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => {
                setShowConfirmSold(false);
                if (onMarkSold) onMarkSold(listing.id);
              }}
              type="button"
              className="px-2.5 py-1 rounded-md bg-[#5C8A3C] text-white font-bold"
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {showConfirmDelete && (
        <div className="mt-3 border-t border-[#F3E6C4]/60 dark:border-[#1B1A17] pt-2 flex items-center justify-between text-xs animate-in fade-in">
          <span className="text-[#B5532C] font-semibold">
            {t('myListings.deleteConfirm')}
          </span>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button
              onClick={() => setShowConfirmDelete(false)}
              type="button"
              className="px-2.5 py-1 rounded-md bg-[#F3E6C4]/50 text-[#3B2F24] font-medium"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={() => {
                setShowConfirmDelete(false);
                if (onDelete) onDelete(listing.id);
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
