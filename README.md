# KisanMandi (کسان منڈی)

A mobile-first wholesale mandi crop prices and direct agricultural marketplace web application designed for farmers and buyers across Sindh, Pakistan.

---

## 🌟 Key Features

1. **Bilingual & Full RTL Support**:
   - Seamless language toggle between **English** and **اردو**.
   - Nastaliq typography (`Noto Nastaliq Urdu`) with 1.8 line height and correct Western digits (0-9) as used on real mandi boards (`Rs 3,400` / `روپے 3,400`).
   - Mirroring layouts using logical RTL styling.

2. **Warm, Earthy Design System (No Blue/White)**:
   - Carefully selected palette: `forest` (#1F4D2B), `leaf` (#5C8A3C), `saffron` (#E8A317), `terracotta` (#B5532C), `wheat` (#F3E6C4), `cream` (#FBF6EA), `clay` (#3B2F24), `dust` (#8A7B68), `night` (#1B1A17), and `nightCard` (#26241F).
   - Daylight and Night themes with system-setting default and manual toggle.

3. **Wholesale Mandi Rates**:
   - Today's price per maund (40 kg) across Sindh wholesale markets: Hyderabad, Sukkur, Larkana.
   - 7-day sparkline trend and 14-day interactive line chart with min/max/average statistics.
   - Saffron "Best place to sell today" highlight and market-to-market price differentials.
   - Daily change in Rs and percent with color indicators.
   - Top gainer and top loser insights.
   - Pull-to-refresh and watchlist star pinning.

4. **Role-Based Navigation**:
   - **Farmer (6 tabs)**: Prices, Marketplace, Alerts, My Listings, Profit, Settings.
   - **Buyer (3 tabs)**: Prices, Marketplace, Settings.

5. **In-App Price Alerts**:
   - Create thresholds (Above/Below) for specific crops and mandis.
   - Real-time trigger evaluation with saffron alert counter badge on navigation and in-app banners.

6. **Direct Produce Marketplace**:
   - Filter by crop, district, and quality grade (A, B, C).
   - Price benchmark labels: "At market", "Above market", "Below market".
   - Direct seller contact via telephone (`tel:`) or WhatsApp (`https://wa.me/92...`).

7. **My Listings (Farmers)**:
   - Create and edit listings with safety advisory warnings.
   - Segmented active vs sold tabs with "Mark as sold" workflow.
   - Server-enforced role and owner permissions.

8. **Farm Profit Calculator**:
   - Calculates gross revenue, production costs, and net margin.
   - Live interactive slider for -20% to +20% price sensitivity scenario analysis.
   - Plain-language translated summary.

9. **Offline Resilience**:
   - Automatically caches last successful rates and crops in `localStorage`.
   - Displays offline warning banner when disconnected.

---

## 📁 Folder Structure

```
/src
  /components        Reusable UI cards, modals, headers, sparklines, bottom nav
  /pages             Screen components (Prices, Marketplace, Alerts, Listings, Profit, Settings)
  /lib               API client, i18n, storage, theme, and formatters
  /locales           en.json and ur.json translation catalogs
  App.tsx            Root layout and state container
  index.css          Tailwind theme configuration and font rules
  main.tsx           React DOM entry point
/server
  index.ts           Starts Express on port 3000, mounts Vite dev / static dist
  app.ts             Express application and route mounting
  db.ts              In-memory database with data.json file persistence
  seed.ts            Deterministic fictional seed data generator
  middleware/        auth.ts (X-User-Id and role checks), errors.ts (custom AppError)
  routes/            users, catalog, prices, listings, alerts, profit, admin, health
  services/          pricing, priceLabel, alerts, profit
/shared
  schemas.ts         Zod validation schemas shared between client and server
  types.ts           Shared TypeScript models, interfaces, and enums
```

---

## 🌾 Fictional Seed Data

### 1. Crops (8 across 4 Categories)
- **Wheat (گندم)**: Grains, base Rs 3,400
- **Basmati Rice (باسمتی چاول)**: Grains, base Rs 9,000
- **Onion (پیاز)**: Vegetables, base Rs 2,800
- **Tomato (ٹماٹر)**: Vegetables, base Rs 3,200
- **Mango (آم)**: Fruits, base Rs 6,500
- **Banana (کیلا)**: Fruits, base Rs 1,800
- **Mung Bean (مونگ)**: Pulses, base Rs 12,000
- **Cotton (کپاس)**: Cash Crops, base Rs 8,500

### 2. Wholesale Markets (3)
- **Zaitoon Wholesale Mandi** (Hyderabad)
- **Rohri Demo Mandi** (Sukkur)
- **Larkana Sample Mandi** (Larkana)

### 3. Demo Users (6)
- `u1`: **Ali Demo** (03000000001, Sukkur, Farmer)
- `u2`: **Sana Sample** (03000000002, Hyderabad, Buyer)
- `u3`: **Bilal Test** (03000000003, Larkana, Farmer)
- `u4`: **Hina Example** (03000000004, Hyderabad, Farmer)
- `u5`: **Imran Sample** (03000000005, Karachi, Buyer)
- `u6`: **Zainab Demo** (03000000006, Nawabshah, Farmer)

---

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

3. **Run Unit & Integration Tests**:
   ```bash
   npm test
   ```

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```
