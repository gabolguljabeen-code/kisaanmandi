export type District =
  | 'Hyderabad'
  | 'Sukkur'
  | 'Larkana'
  | 'Karachi'
  | 'Nawabshah'
  | 'Mirpurkhas'
  | 'Dadu'
  | 'Khairpur'
  | 'Jacobabad'
  | 'Thatta';

export const DISTRICTS: District[] = [
  'Hyderabad',
  'Sukkur',
  'Larkana',
  'Karachi',
  'Nawabshah',
  'Mirpurkhas',
  'Dadu',
  'Khairpur',
  'Jacobabad',
  'Thatta',
];

export type CropCategory = 'Grains' | 'Vegetables' | 'Fruits' | 'Pulses' | 'Cash Crops';

export type UserRole = 'Farmer' | 'Buyer';

export interface User {
  id: string;
  name: string;
  phone: string;
  district: District;
  role: UserRole;
  created_at: string;
}

export interface Crop {
  id: string;
  name: string;
  name_ur: string;
  category: CropCategory;
  base_price?: number;
}

export interface Market {
  id: string;
  name: string;
  district: District;
}

export interface PriceRecord {
  id: string;
  crop_id: string;
  market_id: string;
  date: string; // YYYY-MM-DD
  price: number; // Rs per maund
}

export type ListingGrade = 'A' | 'B' | 'C';
export type ListingStatus = 'active' | 'sold';
export type PriceLabel = 'at_market' | 'above_market' | 'below_market';

export interface Listing {
  id: string;
  user_id: string;
  crop_id: string;
  quantity: number; // maunds
  asking_price: number; // Rs per maund
  district: District;
  grade: ListingGrade;
  available_from: string; // YYYY-MM-DD
  status: ListingStatus;
  contact_phone: string;
  created_at: string;
  updated_at: string;
  seller_name?: string;
  crop_name?: string;
  crop_name_ur?: string;
  average_market_price?: number;
  price_label?: PriceLabel;
}

export type AlertCondition = 'Above' | 'Below';

export interface Alert {
  id: string;
  user_id: string;
  crop_id: string;
  market_id: string;
  condition: AlertCondition;
  target_price: number;
  active_status: boolean;
  crop_name?: string;
  crop_name_ur?: string;
  market_name?: string;
  market_district?: string;
  latest_price?: number;
  triggered?: boolean;
}

export interface TodayPriceItem {
  crop_id: string;
  crop_name: string;
  crop_name_ur: string;
  category: CropCategory;
  market_id: string;
  market_name: string;
  market_district: string;
  date: string;
  price: number;
  previous_price: number;
  change_amount: number;
  change_percent: number;
  direction: 'up' | 'down' | 'flat';
  history_7d: number[];
}

export interface MarketCompareItem {
  market_id: string;
  market_name: string;
  district: string;
  price: number;
  diff_from_best: number;
  is_best: boolean;
}

export interface PriceCompareResponse {
  crop_id: string;
  best_market_id: string;
  best_price: number;
  markets: MarketCompareItem[];
}

export interface PriceStatsResponse {
  crop_id: string;
  market_id: string;
  min: number;
  max: number;
  average: number;
  series: { date: string; price: number }[];
}

export interface MarketInsightResponse {
  market_id: string;
  top_gainer: {
    crop_id: string;
    crop_name: string;
    crop_name_ur: string;
    change_amount: number;
    change_percent: number;
    price: number;
  } | null;
  top_loser: {
    crop_id: string;
    crop_name: string;
    crop_name_ur: string;
    change_amount: number;
    change_percent: number;
    price: number;
  } | null;
}

export interface ProfitCalcRequest {
  crop_id: string;
  market_id: string;
  quantity: number;
  cost_per_maund: number;
  price_shift_percent?: number;
}

export interface ProfitCalcResponse {
  price_used: number;
  revenue: number;
  total_cost: number;
  profit: number;
  margin_percent: number | null;
  summary_en: string;
  summary_ur: string;
}

export interface ApiErrorResponse {
  error: {
    code:
      | 'bad_request'
      | 'unauthorized'
      | 'forbidden_role'
      | 'not_owner'
      | 'not_found'
      | 'phone_exists'
      | 'validation_error'
      | 'server_error';
    message_en: string;
    message_ur: string;
    details?: {
      field: string;
      message_en: string;
      message_ur: string;
    }[];
  };
}

export type Role = UserRole;
export type Grade = ListingGrade;
export type TodayPriceRow = TodayPriceItem;
export type ListingEnriched = Listing;
export type AlertEnriched = Alert;
export type MarketComparison = MarketCompareItem;
export type MarketInsight = MarketInsightResponse;
export type PriceStats = PriceStatsResponse;
export type ProfitCalculationRequest = ProfitCalcRequest;
export type ProfitCalculationResult = ProfitCalcResponse;

