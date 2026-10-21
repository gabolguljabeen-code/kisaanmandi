const URDU_MONTHS: Record<number, string> = {
  0: 'جنوری',
  1: 'فروری',
  2: 'مارچ',
  3: 'اپریل',
  4: 'مئی',
  5: 'جون',
  6: 'جولائی',
  7: 'اگست',
  8: 'ستمبر',
  9: 'اکتوبر',
  10: 'نومبر',
  11: 'دسمبر',
};

const ENGLISH_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatCurrency(amount: number, lang: string = 'en'): string {
  const formattedNumber = Math.round(amount).toLocaleString('en-US');
  if (lang === 'ur') {
    return `روپے ${formattedNumber}`;
  }
  return `Rs ${formattedNumber}`;
}

export function getCurrencySymbol(lang: string = 'en'): string {
  return lang === 'ur' ? 'روپے' : 'Rs';
}

export function formatAmountNumber(amount: number): string {
  return Math.round(amount).toLocaleString('en-US');
}


export function formatDate(dateString: string, lang: string = 'en'): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (lang === 'ur') {
    const monthName = URDU_MONTHS[monthIdx] || '';
    return `${day} ${monthName} ${year}`;
  }
  const monthName = ENGLISH_MONTHS[monthIdx] || '';
  return `${day} ${monthName} ${year}`;
}

export function formatWhatsAppUrl(phone: string, text?: string): string {
  // Replace leading 0 with 92
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '92' + clean.slice(1);
  } else if (!clean.startsWith('92')) {
    clean = '92' + clean;
  }
  const encodedText = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${clean}${encodedText}`;
}

export function formatTelUrl(phone: string): string {
  const clean = phone.replace(/[^\d+]/g, '');
  return `tel:${clean}`;
}
