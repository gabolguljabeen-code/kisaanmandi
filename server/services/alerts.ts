import { AlertCondition } from '../../shared/types.ts';

export function isAlertTriggered(
  condition: AlertCondition,
  latestPrice: number,
  targetPrice: number,
  activeStatus: boolean
): boolean {
  if (!activeStatus) return false;
  if (condition === 'Above') {
    return latestPrice >= targetPrice;
  }
  if (condition === 'Below') {
    return latestPrice <= targetPrice;
  }
  return false;
}
