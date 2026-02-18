/**
 * Liquidity Snapshot Cron Job
 * ============================
 * 
 * Run this daily (e.g., via Supabase Edge Functions + pg_cron)
 * to calculate and store category liquidity metrics.
 * 
 * This creates a historical record for trend analysis.
 */

import { supabase } from '../lib/supabaseClient';
import { getCategoryLiquidity } from './liquidityEngine';

export const runDailyLiquiditySnapshot = async (): Promise<{
  success: boolean;
  categoriesProcessed: number;
  errors: string[];
}> => {
  console.log('[Liquidity Cron] Starting daily snapshot...');

  const results = {
    success: true,
    categoriesProcessed: 0,
    errors: [] as string[],
  };

  try {
    // 1. Get all unique categories from active listings
    const { data: categories, error: categoriesError } = await supabase
      .from('listings')
      .select('category, hub')
      .eq('status', 'active');

    if (categoriesError) {
      results.success = false;
      results.errors.push(`Failed to fetch categories: ${categoriesError.message}`);
      return results;
    }

    // Get unique category-hub combinations
    const uniqueCombinations = Array.from(
      new Set(categories?.map((c) => `${c.category}|${c.hub || 'marketplace'}`))
    ).map((combo) => {
      const [category, hub] = combo.split('|');
      return { category, hub };
    });

    console.log(`[Liquidity Cron] Found ${uniqueCombinations.length} category-hub combinations`);

    // 2. Calculate liquidity for each category
    for (const { category, hub } of uniqueCombinations) {
      try {
        const liquidity = await getCategoryLiquidity(category);

        if (!liquidity) {
          results.errors.push(`Failed to calculate liquidity for ${category}`);
          continue;
        }

        // 3. Store snapshot in database
        const { error: insertError } = await supabase
          .from('category_liquidity_snapshots')
          .insert({
            category: liquidity.category,
            hub: hub || 'marketplace',
            active_listings: liquidity.activeListings,
            active_sellers: liquidity.activeSellers,
            inquiries_7d: liquidity.last7DaysInquiries,
            contacts_7d: liquidity.last7DaysContacts,
            conversions_7d: 0, // TODO: Add conversion tracking
            demand_supply_ratio: liquidity.demandSupplyRatio,
            liquidity_score: liquidity.liquidityScore,
            status: liquidity.status,
            avg_response_time_hours: liquidity.topSellerResponseTime,
            avg_response_rate: 0, // TODO: Calculate from seller metrics
            snapshot_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          });

        if (insertError) {
          // Check if it's a duplicate (already ran today)
          if (insertError.code === '23505') {
            console.log(`[Liquidity Cron] Snapshot already exists for ${category} today (skipping)`);
          } else {
            results.errors.push(`Failed to insert snapshot for ${category}: ${insertError.message}`);
          }
        } else {
          results.categoriesProcessed++;
          console.log(`[Liquidity Cron] ✓ Processed ${category} (score: ${liquidity.liquidityScore})`);
        }
      } catch (error: any) {
        results.errors.push(`Error processing ${category}: ${error.message}`);
      }
    }

    console.log(`[Liquidity Cron] Snapshot complete. Processed ${results.categoriesProcessed} categories.`);

    if (results.errors.length > 0) {
      console.error(`[Liquidity Cron] Encountered ${results.errors.length} errors:`);
      results.errors.forEach((err) => console.error(`  - ${err}`));
      results.success = false;
    }

    return results;
  } catch (error: any) {
    console.error('[Liquidity Cron] Fatal error:', error);
    results.success = false;
    results.errors.push(`Fatal error: ${error.message}`);
    return results;
  }
};

/**
 * Cleanup old snapshots (optional - keep last 90 days)
 */
export const cleanupOldSnapshots = async (): Promise<void> => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { error } = await supabase
    .from('category_liquidity_snapshots')
    .delete()
    .lt('snapshot_date', ninetyDaysAgo.toISOString().split('T')[0]);

  if (error) {
    console.error('[Liquidity Cron] Failed to cleanup old snapshots:', error);
  } else {
    console.log('[Liquidity Cron] ✓ Cleaned up snapshots older than 90 days');
  }
};

/**
 * Main cron handler (call this from Supabase Edge Function)
 */
export const liquidityCronHandler = async () => {
  console.log('='.repeat(60));
  console.log('LIQUIDITY ENGINE - DAILY SNAPSHOT CRON');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log('='.repeat(60));

  const snapshotResult = await runDailyLiquiditySnapshot();

  if (snapshotResult.success) {
    console.log(`✓ Snapshot successful (${snapshotResult.categoriesProcessed} categories)`);
  } else {
    console.error(`✗ Snapshot failed with ${snapshotResult.errors.length} errors`);
  }

  // Cleanup old data
  await cleanupOldSnapshots();

  console.log('='.repeat(60));

  return snapshotResult;
};

// For local testing
if (require.main === module) {
  liquidityCronHandler().then((result) => {
    console.log('\nFinal Result:', result);
    process.exit(result.success ? 0 : 1);
  });
}
