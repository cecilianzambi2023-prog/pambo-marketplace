# Global Wholesale Hub (7th in 1) — MVP Spec

## 1) Product Positioning

**Goal:** Add a cross-border B2B wholesale hub for import buyers in Kenya/East Africa.

**Not goal (MVP):** Build a full Alibaba clone with global open marketplace and complex trade finance.

**MVP Positioning Statement:**
- Source countries: **China, Turkey** (expand later)
- Buyer market: **Kenya first**
- Model: **Verified supplier listings + RFQ + milestone payment + managed dispute flow**

---

## 2) MVP Scope (Must Have)

### 2.1 Supplier Side
- Supplier onboarding with KYB-lite:
  - Business name
  - Country
  - Registration doc upload
  - Contact verification
- Supplier status:
  - `pending_review`
  - `verified`
  - `rejected`
- Create wholesale listing with:
  - MOQ
  - Unit price tiers
  - Lead time
  - Incoterm (`EXW`, `FOB`, `CIF`)
  - Product specs

### 2.2 Buyer Side
- Browse and filter by:
  - country
  - category
  - MOQ
  - lead time
- RFQ / inquiry flow:
  - Buyer sends quantity + destination + requirements
- Negotiation thread:
  - Text + attachment support

### 2.3 Order & Payment (MVP)
- Order flow:
  1. Buyer confirms quoted terms
  2. Buyer pays **deposit** (e.g., 30%)
  3. Supplier marks production/shipping milestones
  4. Buyer pays balance before release / at agreed milestone
- Payment methods:
  - Buyer deposit via card/bank (or your available gateway stack)
  - Local payout bridge to supplier is **manual/controlled** in MVP
- Escrow-like hold ledger (platform-controlled release)

### 2.4 Trust & Disputes
- Evidence requirements:
  - invoice/proforma
  - packing list
  - tracking docs
- Dispute statuses:
  - `opened`
  - `under_review`
  - `resolved_refund`
  - `resolved_release`
- Admin mediation SLA target: **48 hours first response**

---

## 3) Out of Scope (Phase 2+)

- Automatic international supplier payouts at scale
- Trade credit / BNPL / letters of credit
- Multi-warehouse fulfillment orchestration
- Full customs brokerage automation
- Open onboarding for all countries

---

## 4) Data Model Additions (Proposed)

## `wholesale_suppliers`
- `id` UUID PK
- `user_id` UUID FK -> users
- `business_name` TEXT
- `country_code` TEXT
- `verification_status` TEXT (`pending_review|verified|rejected`)
- `verification_notes` TEXT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

## `wholesale_listings`
- `id` UUID PK
- `supplier_id` UUID FK -> wholesale_suppliers
- `title` TEXT
- `category` TEXT
- `description` TEXT
- `country_of_origin` TEXT
- `moq` INTEGER
- `unit` TEXT (`pcs|kg|carton|set`)
- `price_tiers` JSONB
- `lead_time_days_min` INTEGER
- `lead_time_days_max` INTEGER
- `incoterm` TEXT (`EXW|FOB|CIF`)
- `port_of_loading` TEXT
- `status` TEXT (`active|paused|archived`)
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

## `wholesale_rfqs`
- `id` UUID PK
- `buyer_id` UUID FK -> users
- `listing_id` UUID FK -> wholesale_listings (nullable for open RFQ)
- `quantity` NUMERIC
- `target_price` NUMERIC
- `destination_country` TEXT
- `destination_city` TEXT
- `requirements` TEXT
- `status` TEXT (`open|negotiating|closed|converted`)
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

## `wholesale_quotes`
- `id` UUID PK
- `rfq_id` UUID FK -> wholesale_rfqs
- `supplier_id` UUID FK -> wholesale_suppliers
- `quoted_quantity` NUMERIC
- `unit_price` NUMERIC
- `currency` TEXT
- `incoterm` TEXT
- `lead_time_days` INTEGER
- `valid_until` TIMESTAMPTZ
- `terms_json` JSONB
- `status` TEXT (`sent|accepted|rejected|expired`)
- `created_at` TIMESTAMPTZ

## `wholesale_orders`
- `id` UUID PK
- `buyer_id` UUID FK -> users
- `supplier_id` UUID FK -> wholesale_suppliers
- `quote_id` UUID FK -> wholesale_quotes
- `order_status` TEXT (`pending_deposit|in_production|shipped|delivered|completed|cancelled|disputed`)
- `total_amount` NUMERIC
- `currency` TEXT
- `deposit_amount` NUMERIC
- `balance_amount` NUMERIC
- `shipping_terms_json` JSONB
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

## `wholesale_payments`
- `id` UUID PK
- `order_id` UUID FK -> wholesale_orders
- `payment_stage` TEXT (`deposit|balance|refund`)
- `amount` NUMERIC
- `currency` TEXT
- `provider` TEXT
- `provider_ref` TEXT
- `payment_status` TEXT (`pending|paid|failed|refunded`)
- `received_at` TIMESTAMPTZ

## `wholesale_disputes`
- `id` UUID PK
- `order_id` UUID FK -> wholesale_orders
- `opened_by_user_id` UUID FK -> users
- `reason_code` TEXT
- `description` TEXT
- `status` TEXT (`opened|under_review|resolved_release|resolved_refund`)
- `resolution_notes` TEXT
- `resolved_at` TIMESTAMPTZ
- `created_at` TIMESTAMPTZ

---

## 5) API Surface (MVP)

### Supplier
- `POST /api/wholesale/suppliers/apply`
- `GET /api/wholesale/suppliers/me`
- `POST /api/wholesale/listings`
- `PATCH /api/wholesale/listings/:id`

### Buyer
- `GET /api/wholesale/listings`
- `POST /api/wholesale/rfqs`
- `POST /api/wholesale/rfqs/:id/quotes/:quoteId/accept`

### Orders/Payments
- `GET /api/wholesale/orders/:id`
- `POST /api/wholesale/orders/:id/pay-deposit`
- `POST /api/wholesale/orders/:id/pay-balance`
- `POST /api/wholesale/orders/:id/milestones`

### Disputes
- `POST /api/wholesale/orders/:id/disputes`
- `GET /api/wholesale/disputes/:id`
- `POST /api/admin/wholesale/disputes/:id/resolve`

---

## 6) Payment & Risk Controls

- Use platform ledger for escrow-like state tracking:
  - `held`
  - `releasable`
  - `released`
  - `refunded`
- Release rules:
  - Deposit can only be released by admin action in MVP
  - Balance release requires milestone + buyer confirmation OR dispute timeout
- Hard rules:
  - No off-platform payment links in chat
  - Auto-flag suspicious behavior patterns

---

## 7) Compliance Requirements (Kenya-First, Global Source)

- Enforce KYB-lite for all suppliers
- Enforce KYC for buyers above threshold volume
- Sanctions/blocked-country list check before supplier verification
- Terms update:
  - Cross-border trade disclaimer
  - Customs/taxes responsibility by incoterm
  - Dispute jurisdiction clause

---

## 8) Admin Operations Dashboard (MVP)

- Supplier review queue
- High-risk order queue
- Payment hold/release controls
- Dispute queue with SLA timers
- KPI widgets:
  - RFQ to quote rate
  - Quote to paid-deposit conversion
  - Dispute rate
  - Refund ratio

---

## 9) Rollout Plan (Execution)

## Phase 0 (1–2 weeks): Foundation
- Schema + APIs + admin moderation basics
- Supplier verification workflow

## Phase 1 (2–3 weeks): Closed Beta
- 20–50 suppliers (China/Turkey)
- 100–300 Kenyan buyers
- Manual payout operations

## Phase 2 (2–4 weeks): Controlled Growth
- Add logistics partner integration (tracking docs)
- Add landed-cost estimator (freight + duties estimate)

---

## 10) MVP Launch Gates (Go/No-Go)

- Supplier verification turnaround < 72h
- Deposit payment success rate > 90%
- Dispute rate < 5% of paid orders
- Median first quote response time < 24h
- Fraud loss ratio below defined threshold

---

## 11) Suggested 7-in-1 Naming

- Hub name: **Global Wholesale**
- In-app subtitle: **Import Direct from Verified Suppliers**

---

## 12) Build Priority Checklist

- [ ] Create DB migrations for wholesale tables
- [ ] Add supplier verification admin screens
- [ ] Build listing + RFQ + quote APIs
- [ ] Build deposit/balance payment states
- [ ] Add dispute workflow + evidence attachments
- [ ] Add anti-fraud checks + moderation rules
- [ ] Pilot with limited categories and countries

---

## 13) Strategic Advice

This is a good 7th module **if you keep the first version narrow and controlled**:
- Narrow countries
- Narrow categories
- Strict verification
- Managed payouts

That gives you Alibaba-like value without Alibaba-level complexity on day one.
