import { db } from '../db.ts';
import { PriceLabel, TodayPriceItem, PriceCompareResponse, MarketInsightResponse, PriceStatsResponse } from '../../shared/types.ts';

export function calculateDailyChange(
  todayPrice: number,
  yesterdayPrice: number
): { change_amount: number; change_percent: number; direction: 'up' | 'down' | 'flat' } {
  const change_amount = todayPrice - yesterdayPrice;
  let change_percent = 0;
  if (yesterdayPrice > 0) {
    change_percent = Math.round(((todayPrice - yesterdayPrice) / yesterdayPrice) * 1000) / 10;
  }
  let direction: 'up' | 'down' | 'flat' = 'flat';
  if (change_amount > 0) direction = 'up';
  else if (change_amount < 0) direction = 'down';
  return { change_amount, change_percent, direction };
}

export function calculateMarketAverage(prices: number[]): number {
  if (prices.length === 0) return 0;
  const sum = prices.reduce((a, b) => a + b, 0);
  return Math.round(sum / prices.length);
}

export function getTodayDate(): string {
  // "Today" is the latest date in the prices data
  if (db.prices.length === 0) {
    return new Date().toISOString().split('T')[0];
  }
  const dates = db.prices.map((p) => p.date).sort();
  return dates[dates.length - 1];
}

export function getYesterdayDate(todayDate: string): string {
  const dates = Array.from(new Set(db.prices.map((p) => p.date))).sort();
  const idx = dates.indexOf(todayDate);
  if (idx > 0) {
    return dates[idx - 1];
  }
  return todayDate;
}


export function calculateAverageMarketPrice(cropId: string, date?: string): number {
  const targetDate = date || getTodayDate();
  const prices = db.prices.filter((p) => p.crop_id === cropId && p.date === targetDate);
  if (prices.length === 0) return 0;
  const sum = prices.reduce((acc, p) => acc + p.price, 0);
  return Math.round(sum / prices.length);
}

export function getPriceLabel(askingPrice: number, cropId: string): PriceLabel {
  const avg = calculateAverageMarketPrice(cropId);
  if (avg <= 0) return 'at_market';
  const diffPercent = ((askingPrice - avg) / avg) * 100;
  if (Math.abs(diffPercent) <= 5) return 'at_market';
  if (diffPercent > 5) return 'above_market';
  return 'below_market';
}

export function getTodayPrices(marketId?: string, category?: string): TodayPriceItem[] {
  const today = getTodayDate();
  const yesterday = getYesterdayDate(today);

  // If marketId is not specified, default to first market (m1) or return all
  const targetMarket = marketId || (db.markets[0]?.id ?? 'm1');
  const market = db.markets.find((m) => m.id === targetMarket) || db.markets[0];

  let crops = db.crops;
  if (category && category !== 'All') {
    crops = crops.filter((c) => c.category === category);
  }

  // Find all distinct dates up to today, sorted ascending
  const allDates = Array.from(new Set(db.prices.map((p) => p.date))).sort();
  const last7Dates = allDates.slice(-7);

  return crops.map((crop) => {
    const todayRecord = db.prices.find(
      (p) => p.crop_id === crop.id && p.market_id === targetMarket && p.date === today
    );
    const yesterdayRecord = db.prices.find(
      (p) => p.crop_id === crop.id && p.market_id === targetMarket && p.date === yesterday
    );

    const price = todayRecord ? todayRecord.price : 0;
    const prevPrice = yesterdayRecord ? yesterdayRecord.price : price;
    const changeAmount = price - prevPrice;
    const changePercent = prevPrice > 0 ? Number(((changeAmount / prevPrice) * 100).toFixed(1)) : 0;

    let direction: 'up' | 'down' | 'flat' = 'flat';
    if (changeAmount > 0) direction = 'up';
    else if (changeAmount < 0) direction = 'down';

    // 7-day history series for sparkline
    const history_7d = last7Dates.map((d) => {
      const rec = db.prices.find(
        (p) => p.crop_id === crop.id && p.market_id === targetMarket && p.date === d
      );
      return rec ? rec.price : price;
    });

    return {
      crop_id: crop.id,
      crop_name: crop.name,
      crop_name_ur: crop.name_ur,
      category: crop.category,
      market_id: targetMarket,
      market_name: market?.name || '',
      market_district: market?.district || '',
      date: today,
      price,
      previous_price: prevPrice,
      change_amount: changeAmount,
      change_percent: changePercent,
      direction,
      history_7d,
    };
  });
}

export function getPriceStats(cropId: string, marketId: string, days = 14): PriceStatsResponse {
  const allDates = Array.from(new Set(db.prices.map((p) => p.date))).sort();
  const selectedDates = allDates.slice(-Math.min(days, 60));

  const records = db.prices.filter(
    (p) => p.crop_id === cropId && p.market_id === marketId && selectedDates.includes(p.date)
  );

  // Sort oldest first
  records.sort((a, b) => a.date.localeCompare(b.date));

  const prices = records.map((r) => r.price);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 0;
  const average = prices.length
    ? Number((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(1))
    : 0;

  return {
    crop_id: cropId,
    market_id: marketId,
    min,
    max,
    average,
    series: records.map((r) => ({ date: r.date, price: r.price })),
  };
}

export function compareMarketsForCrop(cropId: string): PriceCompareResponse {
  const today = getTodayDate();
  const marketRecords = db.markets.map((m) => {
    const rec = db.prices.find(
      (p) => p.crop_id === cropId && p.market_id === m.id && p.date === today
    );
    return {
      market_id: m.id,
      market_name: m.name,
      district: m.district,
      price: rec ? rec.price : 0,
    };
  });

  // Sort best price first (for sellers, highest price is best place to sell)
  marketRecords.sort((a, b) => b.price - a.price);

  const bestPrice = marketRecords[0]?.price || 0;
  const bestMarketId = marketRecords[0]?.market_id || '';

  const markets = marketRecords.map((m) => {
    const diff = m.price - bestPrice; // 0 for best, negative (e.g. -50) for others
    return {
      market_id: m.market_id,
      market_name: m.market_name,
      district: m.district,
      price: m.price,
      diff_from_best: diff,
      is_best: m.market_id === bestMarketId,
    };
  });

  return {
    crop_id: cropId,
    best_market_id: bestMarketId,
    best_price: bestPrice,
    markets,
  };
}

export function getMarketInsight(marketId: string): MarketInsightResponse {
  const today = getTodayDate();
  const yesterday = getYesterdayDate(today);

  const items = db.crops.map((crop) => {
    const todayRec = db.prices.find(
      (p) => p.crop_id === crop.id && p.market_id === marketId && p.date === today
    );
    const yestRec = db.prices.find(
      (p) => p.crop_id === crop.id && p.market_id === marketId && p.date === yesterday
    );
    const price = todayRec ? todayRec.price : 0;
    const prev = yestRec ? yestRec.price : price;
    const diff = price - prev;
    const percent = prev > 0 ? Number(((diff / prev) * 100).toFixed(1)) : 0;

    return {
      crop_id: crop.id,
      crop_name: crop.name,
      crop_name_ur: crop.name_ur,
      change_amount: diff,
      change_percent: percent,
      price,
    };
  });

  // Filter positive gainers and losers
  const sortedGainers = [...items].sort((a, b) => b.change_percent - a.change_percent);
  const sortedLosers = [...items].sort((a, b) => a.change_percent - b.change_percent);

  const topGainer = sortedGainers[0]?.change_percent > 0 ? sortedGainers[0] : sortedGainers[0] || null;
  const topLoser = sortedLosers[0]?.change_percent < 0 ? sortedLosers[0] : sortedLosers[0] || null;

  return {
    market_id: marketId,
    top_gainer: topGainer,
    top_loser: topLoser,
  };
}
