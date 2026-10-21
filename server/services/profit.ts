import { ProfitCalculationResult } from '../../shared/types.ts';

export function calculateProfit(
  marketPrice: number,
  quantity: number,
  costPerMaund: number,
  priceShiftPercent = 0
): ProfitCalculationResult {
  const price_used = Math.round(marketPrice * (1 + priceShiftPercent / 100));
  const revenue = Math.round(quantity * price_used);
  const total_cost = Math.round(quantity * costPerMaund);
  const profit = revenue - total_cost;
  const margin_percent = revenue > 0 ? Math.round(((profit / revenue) * 100) * 10) / 10 : null;

  const formattedPrice = price_used.toLocaleString();
  const formattedRev = revenue.toLocaleString();
  const formattedProfit = Math.abs(profit).toLocaleString();

  let summary_en = '';
  let summary_ur = '';

  if (profit >= 0) {
    summary_en = `Selling ${quantity} maunds at Rs ${formattedPrice} yields Rs ${formattedRev} revenue with Rs ${formattedProfit} net profit (${margin_percent}% margin).`;
    summary_ur = `${quantity} من فصل روپے ${formattedPrice} پر بیچنے سے روپے ${formattedRev} آمدنی اور روپے ${formattedProfit} خالص منافع (${margin_percent}% مارجن) حاصل ہوگا۔`;
  } else {
    summary_en = `Selling ${quantity} maunds at Rs ${formattedPrice} yields Rs ${formattedRev} revenue with Rs ${formattedProfit} net loss (${margin_percent}% margin).`;
    summary_ur = `${quantity} من فصل روپے ${formattedPrice} پر بیچنے سے روپے ${formattedRev} آمدنی اور روپے ${formattedProfit} نقصان (${margin_percent}% مارجن) ہوگا۔`;
  }

  return {
    price_used,
    revenue,
    total_cost,
    profit,
    margin_percent,
    summary_en,
    summary_ur,
  };
}
