# Web + Mobile Smoke QA (10 Minutes)

Run this after each release candidate.

## Environment

- [ ] App opens at `http://localhost:3000/`
- [ ] No blocking console errors on first load
- [ ] API calls succeed for homepage content

## 1) Home (Top to Bottom)

- [ ] Header logo returns to Home
- [ ] Search input accepts text and search button works
- [ ] Hero CTA buttons are clickable
- [ ] Featured Products carousel scrolls and cards open
- [ ] Trust section renders all 4 cards

## 2) Navigation & Hubs

- [ ] SubNav buttons switch correctly: Marketplace, Wholesale, Farmers, Digital, Services, Live Commerce
- [ ] Live route opens: `#/live`
- [ ] Bottom mobile nav switches correctly (Home/Buy/Add/Services/Account)

## 3) Auth & Account

- [ ] Login/Register button opens Auth modal
- [ ] Modal can switch Sign In / Sign Up
- [ ] Modal closes cleanly
- [ ] Dashboard route opens for signed-in user

## 4) Listing + Detail Flows

- [ ] Marketplace products render grid
- [ ] Product card opens detail modal
- [ ] Contact supplier action is clickable
- [ ] Close detail modal returns to listing view

## 5) Live Commerce

- [ ] Live Commerce page renders list or empty state
- [ ] Clicking a live card opens stream player
- [ ] Stream player close button works
- [ ] Buy Now in player opens product flow

## 6) Footer + Legal

- [ ] Footer hub links navigate correctly
- [ ] Terms modal opens and closes
- [ ] Privacy modal opens and closes
- [ ] Cookies modal opens and closes
- [ ] Contact modal opens and closes

## 7) Mobile Release-Critical Checks

- [ ] `npm run cap:prepare` succeeds
- [ ] App icon and splash present in `resources/`
- [ ] Version is aligned (`package.json`, Android, iOS)

## Result Summary

- Pass Count: ___ / 34
- Fail Count: ___ / 34
- Readiness %: `(Pass Count / 34) * 100`
- Quick scale:
  - `90-100%` = Go candidate
  - `75-89%` = Fix minor issues then re-test
  - `<75%` = No-Go
- Blockers:
  - 
  - 
- Decision: [ ] Go  [ ] No-Go
