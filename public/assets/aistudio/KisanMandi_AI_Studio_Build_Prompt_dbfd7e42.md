# KisanMandi: Google AI Studio Build Prompt

Paste everything below the `---` line into Google AI Studio (Build mode). Build it in two prompts if the first one is too large: first the backend and data (Sections 1 to 3), then the frontend (Sections 4 to 9).

---

Build a complete, mobile-first web app called **KisanMandi** for farmers in Sindh, Pakistan. It tracks wholesale crop prices across mandis, compares markets, sends in-app price alerts, estimates profit, and lets farmers list produce for direct sale to buyers.

The app must be **bilingual (Urdu and English)** with full RTL support, use a **warm, earthy design (no blue or white as the main colors)**, and run as a single full-stack app: a React frontend served by an Express backend with a mock data API and seeded fictional data. Everything runs on port **3000**.

---

## 1. Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS. Mobile-first layout, max width 480px centered on desktop, so it looks like a phone app.
- **Routing:** `react-router-dom` with bottom tab navigation.
- **Charts:** `recharts` (line chart for 14-day trends).
- **Data fetching:** TanStack Query (React Query) for caching, refetching, and pull-to-refresh.
- **Icons:** `lucide-react`.
- **Backend:** Express + TypeScript in `/server`, started with `tsx` from the same `npm run dev` command. Express serves the `/api` routes and also serves the Vite frontend (dev middleware in development, `dist/` in production). Listen on `0.0.0.0:3000`.
- **Validation:** Zod schemas in `/shared`, used by both the server and the client forms.
- **Local storage:** `localStorage` for the logged-in user id, language, theme, favorites, and the last successful price responses (offline cache).
- **i18n:** `i18next` + `react-i18next`. Files: `/src/locales/en.json` and `/src/locales/ur.json`.
- **Fonts:** Google Fonts loaded in `index.html`: `Inter` for English, `Noto Nastaliq Urdu` for Urdu.

Folder layout:

```
/src
  /components        UI pieces (cards, chips, badges, charts, bottom nav)
  /pages             one file per screen
  /lib               API client, query hooks, formatters, storage helpers
  /locales           en.json, ur.json
  /theme             tailwind theme tokens
/server
  index.ts           starts Express on 3000, mounts /api and Vite
  app.ts             routes and middleware
  db.ts              in-memory store, save and load to data.json
  seed.ts            deterministic seed data
  middleware/        auth.ts (X-User-Id and roles), errors.ts
  routes/            users, catalog, prices, listings, alerts, profit, admin, health
  services/          pricing, priceLabel, alerts, profit
/shared
  schemas.ts         Zod schemas
  types.ts           shared TypeScript types
```

---

## 2. Design System (No Blue/White)

Design it as a warm, modern agricultural brand. It should feel fresh and grounded, and stay readable in bright sunlight.

**Color tokens (define in Tailwind config)**

| Token | Hex | Use |
|---|---|---|
| `forest` | `#1F4D2B` | Primary buttons, header, active tab |
| `leaf` | `#5C8A3C` | Positive change, "At market" badge |
| `saffron` | `#E8A317` | Accents, "Best place to sell", alert badge |
| `terracotta` | `#B5532C` | Negative change, "Below market", delete actions |
| `wheat` | `#F3E6C4` | Card highlight and chips |
| `cream` | `#FBF6EA` | App background |
| `clay` | `#3B2F24` | Primary text |
| `dust` | `#8A7B68` | Secondary text |
| `night` | `#1B1A17` | Dark mode background |
| `nightCard` | `#26241F` | Dark mode cards |

Provide light and dark themes. Default to the system setting, with a manual override in Settings.

**Typography**

- English: `Inter`, base 16px.
- Urdu: `Noto Nastaliq Urdu` with `line-height: 1.8` so the script isn't clipped.
- Numbers always use Western digits (0 to 9), even in Urdu, as mandi boards do. Currency formats as `Rs 3,400` in English and `روپے 3,400` in Urdu.

**Shape and motion**

- Cards: 18px radius, soft warm shadow, no hard borders.
- Buttons: pill shape, minimum height 52px.
- Minimum tap target 44px. Use simple fade and slide transitions only.

**Layout**

- Sticky top header with the app name, language toggle (EN / اردو), and theme toggle.
- Fixed bottom tab bar with 4 to 6 tabs, depending on role.

---

## 3. Language and RTL

- First visit: show a language screen with two large buttons, **English** and **اردو**. Save the choice in `localStorage`.
- When Urdu is selected, set `document.documentElement.dir = "rtl"` and `lang = "ur"`. Use Tailwind's `rtl:` variants or logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) so layouts mirror correctly.
- Keep phone numbers, prices, and dates in LTR inside RTL text (`dir="ltr"` on those spans).
- Date format: `12 Oct 2026` in English, and the same date using Urdu month names in Urdu.
- Every visible string must come from the locale files. Don't hardcode any text.

**Starter Urdu strings**

| Key | English | اردو |
|---|---|---|
| tab.prices | Prices | قیمتیں |
| tab.marketplace | Marketplace | منڈی |
| tab.alerts | Alerts | الرٹس |
| tab.listings | My Listings | میری فصل |
| tab.profit | Profit | منافع |
| tab.settings | Settings | ترتیبات |
| price.today | Today's price | آج کی قیمت |
| price.change | Daily change | روزانہ تبدیلی |
| market.best | Best place to sell today | آج بیچنے کی بہترین جگہ |
| alert.triggered | Triggered | مطلوبہ قیمت پہنچ گئی |
| listing.call | Call | کال کریں |
| listing.whatsapp | WhatsApp | واٹس ایپ |
| status.sold | Sold | فروخت ہو گئی |

---

## 4. Roles and Onboarding

**First launch (signup)**

Collect:
- Full name (2 to 60 characters)
- Phone (`03XXXXXXXXX`, 11 digits, validated)
- District (dropdown: Hyderabad, Sukkur, Larkana, Karachi, Nawabshah, Mirpurkhas, Dadu, Khairpur, Jacobabad, Thatta)
- Role: **Farmer** or **Buyer** (two large cards with icons)

Save via `POST /api/users`, then store the returned id in `localStorage`. Skip signup on later visits. Show three short swipeable tip cards before the first screen: Prices, Alerts, Marketplace.

**Navigation by role**

- **Farmer tabs:** Prices, Marketplace, Alerts, My Listings, Profit, Settings
- **Buyer tabs:** Prices, Marketplace, Settings

The server enforces this too (see Section 5).

---

## 5. Backend API

Build this before the frontend screens. The frontend must not contain business logic that the server owns (ownership, price labels, alert evaluation, daily change).

**Conventions**

- All routes under `/api`, JSON only.
- Protected routes need the header `X-User-Id: <user id>`. Missing or unknown user: 401.
- Farmer-only routes: 403 `forbidden_role` for Buyers.
- Owner-only routes (PATCH and DELETE on listings and alerts): 403 `not_owner` for non-owners.
- Money is an integer in **Rs per maund (40 kg)**. Dates are `YYYY-MM-DD`.
- "Today" is the latest date in the prices data.
- Store data in memory, seeded at startup. Save every successful write to `/server/data.json`. Reseed if the file is missing or `SEED_RESET=true`.

**Error format**

```json
{
  "error": {
    "code": "validation_error",
    "message_en": "Quantity must be greater than 0.",
    "message_ur": "مقدار صفر سے زیادہ ہونی چاہیے۔",
    "details": [{ "field": "quantity", "message_en": "...", "message_ur": "..." }]
  }
}
```

Codes: `bad_request` (400), `unauthorized` (401), `forbidden_role` and `not_owner` (403), `not_found` (404), `phone_exists` (409), `validation_error` (422), `server_error` (500).

**Data model**

- **users:** `id, name, phone, district, role (Farmer|Buyer), created_at`
- **crops:** `id, name, name_ur, category, base_price` (`base_price` is for the seed only and is never returned)
- **markets:** `id, name, district`
- **prices:** `id, crop_id, market_id, date, price`
- **listings:** `id, user_id, crop_id, quantity, asking_price, district, grade (A|B|C), available_from, status (active|sold), contact_phone, created_at, updated_at`
- **alerts:** `id, user_id, crop_id, market_id, condition (Above|Below), target_price, active_status`

**Endpoints**

Health and admin:
- `GET /api/health`: returns status and record counts.
- `POST /api/admin/reset`: reseeds all data (disable when `NODE_ENV=production`).

Users:
- `POST /api/users`: body `{ name, phone, district, role }`. Returns 201. Phone must be unique (409 if not).
- `GET /api/users/:id`: self only.
- `PATCH /api/users/:id`: self only. Updates name, district, or phone.

Catalog (public):
- `GET /api/crops`
- `GET /api/markets`

Prices (public):
- `GET /api/prices?marketId=&cropId=&days=14`: history for one crop in one market, oldest first. `days` max 60.
- `GET /api/prices/today?marketId=&category=`: one row per crop with `price`, `previous_price`, `change_amount`, `change_percent` (1 decimal), and `direction` (`up|down|flat`).
- `GET /api/prices/stats?marketId=&cropId=&days=14`: `min`, `max`, `average` (1 decimal), and `series`.
- `GET /api/prices/compare?cropId=`: all markets for one crop, sorted best price first, with `diff_from_best`, `is_best`, and `best_market_id`.
- `GET /api/prices/insight?marketId=`: top gainer and top loser for the day.

Listings:
- `GET /api/listings?cropId=&district=&grade=&sort=newest|price_asc&status=active|sold`: defaults `status=active`, `sort=newest`. Each item includes `seller_name`, `crop_name`, `crop_name_ur`, `average_market_price`, and `price_label` (`at_market|above_market|below_market`).
- `GET /api/listings/:id`
- `POST /api/listings` (Farmer only): body `{ crop_id, quantity, asking_price, district, grade, available_from, contact_phone }`. Returns 201.
- `PATCH /api/listings/:id` (owner only): any subset of the fields, plus `status`.
- `DELETE /api/listings/:id` (owner only): returns 204.

Alerts:
- `GET /api/alerts` (Farmer, own alerts): each item includes `latest_price` and `triggered`.
- `POST /api/alerts` (Farmer only): body `{ crop_id, market_id, condition, target_price, active_status? }`. Returns 201.
- `PATCH /api/alerts/:id` (owner only): toggle `active_status`, or change any field.
- `DELETE /api/alerts/:id` (owner only): returns 204.
- `GET /api/alerts/triggered`: returns `{ count, items }`. Evaluates every active alert against the latest price on every call. Used for the badge.

Profit (public):
- `POST /api/profit`: body `{ crop_id, market_id, quantity, cost_per_maund, price_shift_percent? }`. `price_shift_percent` is an integer from -20 to 20, default 0. Returns `price_used`, `revenue`, `total_cost`, `profit`, `margin_percent` (null if revenue is 0), and bilingual summary sentences.

**Business rules**

- **Daily change:** `change_amount = today − yesterday`. `change_percent = round(change ÷ yesterday × 100, 1)`.
- **Market average:** the average of today's price for a crop across all markets, rounded to a whole rupee.
- **Price label:** `diff = (asking − average) ÷ average × 100`. If `|diff| ≤ 5`, `at_market`. If above 5, `above_market`. If below −5, `below_market`.
- **Alert trigger:** only active alerts are evaluated, using the latest price for that crop and market. `Above` triggers when `latest ≥ target`. `Below` triggers when `latest ≤ target`.
- **Profit:** `price_used = market_price × (1 + shift ÷ 100)`, rounded. `revenue = qty × price_used`. `cost = qty × cost_per_maund`. `profit = revenue − cost`. `margin = profit ÷ revenue × 100`.
- **Sold listings** are hidden from the default listing view and appear under the "Sold" filter.

**Validation**

- Name: 2 to 60 characters.
- Phone: `^03\d{9}$`.
- Quantity and price: greater than 0.
- Grade: `A`, `B`, or `C`.
- `available_from`: not before today.
- Crop, market, and district must exist in the allowed lists.

**Seed data (fictional only)**

Seed order: markets, crops, users, prices, listings, alerts.

Crops (8 across 4 categories):

| id | English | Urdu | Category | base_price |
|---|---|---|---|---|
| c1 | Wheat | گندم | Grains | 3400 |
| c2 | Basmati Rice | باسمتی چاول | Grains | 9000 |
| c3 | Onion | پیاز | Vegetables | 2800 |
| c4 | Tomato | ٹماٹر | Vegetables | 3200 |
| c5 | Mango | آم | Fruits | 6500 |
| c6 | Banana | کیلا | Fruits | 1800 |
| c7 | Mung Bean | مونگ | Pulses | 12000 |
| c8 | Cotton | کپاس | Cash Crops | 8500 |

Markets (3 districts):

| id | Name | District |
|---|---|---|
| m1 | Zaitoon Wholesale Mandi | Hyderabad |
| m2 | Rohri Demo Mandi | Sukkur |
| m3 | Larkana Sample Mandi | Larkana |

Prices: 14 consecutive days for every crop × market pair (336 rows). Use this deterministic formula, then round to the nearest 10:

```
price = base × (1 + 0.04 × sin(dayIndex × 0.9 + cropIndex) + 0.02 × marketIndex − 0.005 × dayIndex)
```

`dayIndex` runs 0 to 13, with 13 as today. `cropIndex` is 0 to 7. `marketIndex` is 0 to 2.

Users (6):

| id | Name | Phone | District | Role |
|---|---|---|---|---|
| u1 | Ali Demo | 03000000001 | Sukkur | Farmer |
| u2 | Sana Sample | 03000000002 | Hyderabad | Buyer |
| u3 | Bilal Test | 03000000003 | Larkana | Farmer |
| u4 | Hina Example | 03000000004 | Hyderabad | Farmer |
| u5 | Imran Sample | 03000000005 | Karachi | Buyer |
| u6 | Zainab Demo | 03000000006 | Nawabshah | Farmer |

Listings (12):
- Cover all 8 crops with at least one of each grade.
- Owners are u1, u3, u4, and u6.
- Three are `sold`, nine are `active`.
- Set asking prices relative to today's market average so all three labels appear: 4 at `average × 1.10`, 4 at `average × 1.00`, 4 at `average × 0.90`. Round to the nearest 10.
- `available_from` is 3 to 30 days from today.

Alerts (5):
- a1: u1, Onion, Zaitoon, Above, target = today's price − 100 (triggers)
- a2: u3, Wheat, Rohri, Below, target = today's price + 100 (triggers)
- a3: u4, Tomato, Larkana, Above, target = today's price + 500 (does not trigger)
- a4: u6, Mango, Zaitoon, Below, target = today's price − 500 (does not trigger)
- a5: u1, Cotton, Rohri, Above, target = today's price − 100, `active_status = false`

---

## 6. Screens and Features

### Prices tab (all users)
- Market selector: horizontal scrolling chips with market name and district. Remember the last selection.
- Search box: instant filter by English or Urdu crop name.
- Category chips: All, Grains, Vegetables, Fruits, Pulses, Cash Crops.
- Price cards: crop name in both languages, category chip, today's price per maund (large and bold), daily change in amount (`+Rs 120`) and percent (`+3.6%`), colored green, terracotta, or dust. Include a small 7-day sparkline.
- Pull-to-refresh: refetch prices and alerts.
- Star icon on each card to add it to the watchlist. Watchlisted crops appear at the top.
- Market insight card: "Top gainer" and "Top loser" for today, in both languages.
- Skeleton loaders while loading. Friendly empty state. Retry button on error.

### Crop detail
- 14-day line chart (recharts) for the selected crop and market. Dot on the latest point. Tooltip shows date and price.
- Stats row: Minimum, Maximum, Average.
- Market comparison list sorted best first. Top row gets a saffron "Best place to sell today" badge. Each row shows the difference from the best market (`−Rs 50 vs best`).
- Buttons: **Share** (builds a text summary like "Wheat in Hyderabad: Rs 3,400 per maund, +Rs 120 today" and uses `navigator.share`, falling back to a WhatsApp link) and **Set alert**.

### Alerts tab (farmers)
- Badge on the tab showing the triggered count (saffron circle).
- Triggered alerts at the top with a "Triggered" label and today's price.
- Each alert card shows crop, market, condition, target, active toggle, and delete (with a confirm dialog).
- Create or edit alert form: crop, market, Above or Below (segmented control), target price. Validate inline in the active language.
- Show an in-app banner when a new alert triggers during the session.

### Marketplace (all users)
- Search by crop name.
- Filters in a bottom sheet: crop, district, grade.
- Sort: Newest or Price low to high.
- Listing cards: crop, quantity, asking price, price label badge, district, grade, available-from date.
- Listing detail: all fields, seller name, and two buttons:
  - **Call:** `tel:` link
  - **WhatsApp:** `https://wa.me/92XXXXXXXXXX` (replace the leading 0 with 92)

### My Listings (farmers)
- Tabs: Active and Sold.
- Each listing has Edit, Mark as sold, and Delete (only for the owner; the server enforces this).
- Create listing button opens a validated form: crop, quantity (maunds, greater than 0), asking price per maund (greater than 0), district, grade (A/B/C), available-from date (not in the past), contact phone.
- Before posting, show a short safety note: "Never share bank or OTP details with buyers."

### Profit calculator (farmers)
- Inputs: crop, market, quantity (maunds), cost per maund.
- Live results: revenue, total cost, profit or loss, margin %. Profit shows in green, loss in terracotta.
- What-if slider from −20% to +20%. All outputs recalculate as it moves.
- Plain-language summary, translated into both languages.

### Settings
- Language (EN / اردو), theme (system, light, dark).
- Edit profile: name, district, phone.
- Logout (clears `localStorage`).
- App version.

### Offline mode
- Cache the last successful responses for `/api/prices/today` and `/api/crops` in `localStorage`.
- If a request fails, show the cached data with a banner: "Showing last saved prices" (or the Urdu equivalent).

---

## 7. Quality Bar

- No hardcoded user-facing strings. Everything comes from the locale files.
- Money is formatted with commas and the correct currency label for the active language.
- Forms show inline validation in the active language. Use the same Zod schemas as the server.
- Every list has a loading skeleton, an empty state, and an error state with retry.
- TypeScript strict mode. No `any`.
- Responsive from 360px wide (common low-end Android) up to desktop. Test at 360px.
- The app runs from one command: `npm install` then `npm run dev`. The preview opens on port 3000.

---

## 8. Acceptance Test

1. Open the app, choose Urdu, and confirm RTL layout and Urdu text on every screen.
2. Sign up as a farmer in Sukkur. Confirm the 6 farmer tabs appear.
3. Sign up as a buyer. Confirm only Prices, Marketplace, and Settings appear.
4. On Prices, select Zaitoon Wholesale Mandi. Confirm 8 crops, daily change in Rs and %, and sparklines.
5. Pull to refresh. Confirm prices reload.
6. Open Wheat. Confirm the 14-day chart, min/max/avg, and the saffron "Best place" badge on the top market.
7. Open the Alerts tab. Confirm the badge shows 2 triggered alerts (a1 and a2).
8. Toggle a1 off. Confirm the badge drops to 1.
9. As a farmer, create a listing with a past date. Confirm the form rejects it with an Urdu error.
10. Create a valid listing. Confirm the price label (At, Above, or Below market) is correct.
11. Log in as a different farmer and try to edit that listing. Confirm the server returns 403 and the edit button is hidden.
12. Open a listing. Confirm Call and WhatsApp work, and the WhatsApp number starts with 92.
13. In Profit, enter 50 maunds at Rs 2,800 per maund for Onion. Confirm the numbers. Move the slider to −20% and confirm they update.
14. Reload the page. Confirm the user, language, theme, and watchlist persist.
15. Stop the server and reload. Confirm the cached prices and the offline banner appear.

---

## 9. Deliverables

- Full source in the folder layout above
- `README.md` with setup steps, folder explanation, and the list of fictional seed data
- `package.json` with `dev` (tsx server with Vite middleware), `build`, and `start` scripts
- No real names, phone numbers, or prices anywhere in the seed data
