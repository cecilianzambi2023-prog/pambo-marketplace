# Kenya Wholesale Hub Restore Status

## What happened (why it looked removed)
The Kenya Wholesale Hub was **not physically deleted** from code.
It was effectively hidden by a routing/branding overwrite when `wholesale` was remapped to `ImportLink Global`:
- `#/wholesale` was changed to point to ImportLink content
- navigation labels changed from local wholesale to ImportLink Global
- footer links and subnav no longer exposed Kenya-local wholesale as a separate module

## What has now been restored
1. **Separate modules in app navigation and routes**
   - Kenya Wholesale Hub: `#/wholesale`
   - ImportLink Global: `#/importlink-global`
2. **Separate frontend pages**
   - Kenya-local module restored in `pages/WholesaleHub.tsx`
   - ImportLink kept separate in `pages/ImportLinkGlobalHub.tsx`
3. **Separate backend APIs**
   - Kenya Wholesale API: `/api/kenya-wholesale/*`
   - ImportLink Global API: `/api/importlink-global/*`
4. **Kenya Wholesale schema migration added**
   - `supabase/migrations/20260218_restore_kenya_wholesale_hub.sql`
   - Includes seller profiles, followers, product comments, media limits (10 photos/2 videos), and moderation fields.

## Timeline to complete full restoration
- **Done now (completed):** route split, UI split, backend route split, schema migration file creation.
- **Next 30-60 minutes:** run Supabase migration and verify table availability.
- **Next 1-2 hours:** endpoint validation (seller page, followers, comments, moderation), plus seed data checks.
- **Next 1 day (optional hardening):** admin panel UI wiring for moderation actions if you want full click-flow from dashboard.

## Current blockers
1. **Supabase migration not yet applied**
   - Current API data endpoints fail because DB tables/columns are not in schema cache yet.
2. **Pre-existing backend TypeScript issue unrelated to this restore**
   - `backend/src/middleware/subscriptionMiddleware.ts` has an existing type error during `npm run build`.
   - This does not block frontend build but blocks clean backend TypeScript compile.

## Immediate next action
Run both SQL migrations in Supabase SQL Editor:
1. `supabase/migrations/add_bulk_offerings_tables.sql` (if not already applied)
2. `supabase/migrations/20260218_restore_kenya_wholesale_hub.sql`

Then smoke test:
- `/api/kenya-wholesale/health`
- `/api/kenya-wholesale/listings`
- `/api/kenya-wholesale/sellers/:sellerId`
- `/api/kenya-wholesale/listings/:listingId/comments`
- `/api/kenya-wholesale/admin/*` moderation endpoints
