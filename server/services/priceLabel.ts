import { PriceLabel } from '../../shared/types.ts';

export function calculatePriceLabel(askingPrice: number, marketAverage: number): PriceLabel {
  if (!marketAverage || marketAverage <= 0) {
    return 'at_market';
  }
  const diffPercent = ((askingPrice - marketAverage) / marketAverage) * 100;
  if (Math.abs(diffPercent) <= 5) {
    return 'at_market';
  }
  if (diffPercent > 5) {
    return 'above_market';
  }
  return 'below_market';
}
