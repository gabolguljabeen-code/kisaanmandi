import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ShieldAlert, PackagePlus } from 'lucide-react';
import { Crop, DISTRICTS, District, Grade, Listing } from '../../shared/types.ts';
import { ListingCreateSchema } from '../../shared/schemas.ts';

interface ListingFormModalProps {
  crops: Crop[];
  userDistrict: District;
  userPhone: string;
  initialData?: Listing | null;
  onClose: () => void;
  onSubmit: (data: {
    crop_id: string;
    quantity: number;
    asking_price: number;
    district: District;
    grade: Grade;
    available_from: string;
    contact_phone: string;
  }) => Promise<void>;
}

export const ListingFormModal: React.FC<ListingFormModalProps> = ({
  crops,
  userDistrict,
  userPhone,
  initialData,
  onClose,
  onSubmit,
}) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const isUrdu = lang === 'ur';
  const todayStr = new Date().toISOString().split('T')[0];

  const [cropId, setCropId] = useState(initialData?.crop_id || (crops[0]?.id || ''));
  const [quantity, setQuantity] = useState(initialData ? String(initialData.quantity) : '');
  const [askingPrice, setAskingPrice] = useState(initialData ? String(initialData.asking_price) : '');
  const [district, setDistrict] = useState<District>(initialData?.district || userDistrict || 'Hyderabad');
  const [grade, setGrade] = useState<Grade>(initialData?.grade || 'A');
  const [availableFrom, setAvailableFrom] = useState(initialData?.available_from || todayStr);
  const [contactPhone, setContactPhone] = useState(initialData?.contact_phone || userPhone || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const parsedQty = parseFloat(quantity);
    const parsedPrice = parseFloat(askingPrice);

    // Validate using Zod schema
    const validation = ListingCreateSchema.safeParse({
      crop_id: cropId,
      quantity: parsedQty,
      asking_price: parsedPrice,
      district,
      grade,
      available_from: availableFrom,
      contact_phone: contactPhone,
    });

    if (!validation.success) {
      const firstErr = (validation.error as any).issues?.[0];
      if (firstErr?.message?.includes('Quantity') || isNaN(parsedQty)) {
        setErrorMsg(isUrdu ? 'مقدار صفر سے زیادہ ہونی چاہیے۔' : 'Quantity must be greater than 0.');
      } else if (firstErr?.message?.includes('Asking price') || isNaN(parsedPrice)) {
        setErrorMsg(isUrdu ? 'طلب کردہ قیمت صفر سے زیادہ ہونی چاہیے۔' : 'Asking price must be greater than 0.');
      } else if (firstErr?.path?.includes('contact_phone')) {
        setErrorMsg(isUrdu ? 'درست 11 ہندسوں کا فون نمبر (03XXXXXXXXX) درج کریں۔' : 'Phone must be in format 03XXXXXXXXX (11 digits).');
      } else {
        setErrorMsg(firstErr?.message || 'Invalid input');
      }
      return;
    }

    // Business check: availableFrom cannot be in the past
    if (availableFrom < todayStr) {
      setErrorMsg(
        isUrdu
          ? 'دستیابی کی تاریخ ماضی کی نہیں ہو سکتی۔'
          : 'Available from date cannot be in the past.'
      );
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({
        crop_id: cropId,
        quantity: parsedQty,
        asking_price: parsedPrice,
        district,
        grade,
        available_from: availableFrom,
        contact_phone: contactPhone,
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
      aria-labelledby="listing-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-[480px] max-h-[92vh] overflow-y-auto rounded-t-[24px] sm:rounded-[24px] bg-[#FBF6EA] dark:bg-[#26241F] text-[#3B2F24] dark:text-[#FBF6EA] shadow-2xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#F3E6C4]/60 dark:border-[#1B1A17]">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F4D2B] text-[#E8A317]">
              <PackagePlus className="h-4 w-4" />
            </div>
            <h2 id="listing-modal-title" className="text-lg font-bold text-[#1F4D2B] dark:text-[#E8A317]">
              {initialData ? t('myListings.editListing') : t('myListings.newListing')}
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

        {/* Safety Note Advisory */}
        <div className="mt-3.5 flex items-start space-x-2 rtl:space-x-reverse rounded-xl bg-[#E8A317]/15 border border-[#E8A317]/40 p-3 text-xs text-[#3B2F24] dark:text-[#F3E6C4]">
          <ShieldAlert className="h-4 w-4 text-[#B5532C] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#B5532C] block">{t('myListings.safetyTitle')}</span>
            <span>{t('myListings.safetyNote')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3.5">
          {errorMsg && (
            <div className="rounded-xl bg-[#B5532C]/15 p-3 text-xs font-semibold text-[#B5532C]">
              {errorMsg}
            </div>
          )}

          {/* Crop */}
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

          {/* Quantity & Asking price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                {t('myListings.quantity')}
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50"
                className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                {t('myListings.askingPrice')}
              </label>
              <input
                type="number"
                min="1"
                step="10"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
                placeholder="e.g. 3400"
                className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
                required
              />
            </div>
          </div>

          {/* District & Grade */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                {t('onboarding.district')}
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value as District)}
                className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#8A7B68] mb-1">
                {t('marketplace.grade')}
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as Grade)}
                className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-semibold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B]"
              >
                <option value="A">{t('myListings.gradeA')}</option>
                <option value="B">{t('myListings.gradeB')}</option>
                <option value="C">{t('myListings.gradeC')}</option>
              </select>
            </div>
          </div>

          {/* Available From Date */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('myListings.availableDate')}
            </label>
            <input
              type="date"
              min={todayStr}
              value={availableFrom}
              onChange={(e) => setAvailableFrom(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
              required
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-[#8A7B68] mb-1">
              {t('myListings.contactPhone')}
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="03001234567"
              className="w-full rounded-xl bg-white dark:bg-[#1B1A17] border border-[#F3E6C4]/80 dark:border-[#1B1A17] p-3 text-sm font-bold text-[#3B2F24] dark:text-[#FBF6EA] focus:outline-hidden focus:ring-2 focus:ring-[#1F4D2B] number-ltr"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#1F4D2B] text-[#FBF6EA] font-bold py-3.5 text-sm shadow-md hover:bg-[#1F4D2B]/90 active:scale-95 transition disabled:opacity-50 min-h-[52px]"
            >
              {submitting
                ? t('common.loading')
                : initialData
                ? t('myListings.updateListing')
                : t('myListings.postListing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
