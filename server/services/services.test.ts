import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDailyChange, calculateMarketAverage } from './pricing.ts';
import { calculatePriceLabel } from './priceLabel.ts';
import { isAlertTriggered } from './alerts.ts';
import { calculateProfit } from './profit.ts';

test('pricing: calculateDailyChange calculates amount, percent and direction', () => {
  const up = calculateDailyChange(3400, 3280);
  assert.equal(up.change_amount, 120);
  assert.equal(up.change_percent, 3.7);
  assert.equal(up.direction, 'up');

  const down = calculateDailyChange(3100, 3200);
  assert.equal(down.change_amount, -100);
  assert.equal(down.change_percent, -3.1);
  assert.equal(down.direction, 'down');

  const flat = calculateDailyChange(3000, 3000);
  assert.equal(flat.change_amount, 0);
  assert.equal(flat.change_percent, 0);
  assert.equal(flat.direction, 'flat');
});

test('pricing: calculateMarketAverage returns rounded whole number', () => {
  assert.equal(calculateMarketAverage([3400, 3450, 3380]), 3410);
});

test('priceLabel: calculates at_market, above_market, below_market within 5% band', () => {
  const avg = 3000;
  // +3.3% is <= 5% -> at_market
  assert.equal(calculatePriceLabel(3100, avg), 'at_market');
  // -3.3% is >= -5% -> at_market
  assert.equal(calculatePriceLabel(2900, avg), 'at_market');
  // +10% is > 5% -> above_market
  assert.equal(calculatePriceLabel(3300, avg), 'above_market');
  // -10% is < -5% -> below_market
  assert.equal(calculatePriceLabel(2700, avg), 'below_market');
});

test('alerts: isAlertTriggered respects condition and activeStatus', () => {
  // Above condition
  assert.equal(isAlertTriggered('Above', 3500, 3400, true), true);
  assert.equal(isAlertTriggered('Above', 3300, 3400, true), false);
  // Below condition
  assert.equal(isAlertTriggered('Below', 3300, 3400, true), true);
  assert.equal(isAlertTriggered('Below', 3500, 3400, true), false);
  // Inactive alert never triggers
  assert.equal(isAlertTriggered('Above', 4000, 3000, false), false);
});

test('profit: calculateProfit computes revenue, costs, profit, and what-if shift', () => {
  const res = calculateProfit(2800, 50, 2000, 0);
  assert.equal(res.price_used, 2800);
  assert.equal(res.revenue, 140000);
  assert.equal(res.total_cost, 100000);
  assert.equal(res.profit, 40000);
  assert.equal(res.margin_percent, 28.6);
  assert.ok(res.summary_en.includes('50 maunds'));
  assert.ok(res.summary_ur.includes('50 من'));

  // What-if -20%
  const resShifted = calculateProfit(2800, 50, 2000, -20);
  assert.equal(resShifted.price_used, 2240);
  assert.equal(resShifted.revenue, 112000);
  assert.equal(resShifted.total_cost, 100000);
  assert.equal(resShifted.profit, 12000);
});
