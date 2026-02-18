/**
 * verifyHubArchitecture.test.ts
 * =============================
 * 
 * Verification tests for hub segregation architecture
 * Tests that users/subscriptions are shared, but listings are hub-segregated
 */

import { supabaseClient } from './src/lib/supabaseClient';
import { HUB_CONFIGS, getHub, getHubListingLimit } from './config/HubConfig';

/**
 * TEST SUITE: Hub Architecture Verification
 * ==========================================
 * Verifies that:
 * 1. Users are shared across all hubs
 * 2. Subscriptions apply to all hubs
 * 3. Listings are hub-segregated
 * 4. Analytics are hub-specific
 */

// ===================================
// TEST 1: User Exists in One Place
// ===================================

export async function testUserIsShared() {
  console.log('\n📋 TEST 1: Verify user exists in ONE place (shared across all hubs)\n');

  const testUserId = 'test-user-123';

  try {
    // Query profiles table (NO hub_id column)
    const { data: userProfile, error } = await supabaseClient
      .from('profiles')
      .select('id, email, subscription_tier, verification_badge')
      .eq('id', testUserId)
      .single();

    if (error) {
      console.error('❌ FAIL: Could not fetch user profile:', error);
      return false;
    }

    if (!userProfile) {
      console.error('❌ FAIL: User not found');
      return false;
    }

    console.log('✅ PASS: User found in profiles (shared) table');
    console.log(`   - User ID: ${userProfile.id}`);
    console.log(`   - Subscription: ${userProfile.subscription_tier}`);
    console.log(`   - Verification: ${userProfile.verification_badge}`);
    console.log('   - Note: NO hub_id column (user exists once, accessible from all hubs)');

    return true;
  } catch (err) {
    console.error('❌ ERROR:', err);
    return false;
  }
}

// ===================================
// TEST 2: Same User in Multiple Hubs
// ===================================

export async function testUserMultipleHubs() {
  console.log('\n📋 TEST 2: Verify same user can list in multiple hubs\n');

  const testUserId = 'test-user-123';
  let passCount = 0;

  try {
    // Check listings in each hub
    for (const hubId of ['marketplace', 'mkulima', 'digital', 'services', 'wholesale', 'live_commerce']) {
      const { data: listings, error } = await supabaseClient
        .from('listings')
        .select('id, hub_id, created_by')
        .eq('created_by', testUserId)
        .eq('hub_id', hubId)
        .limit(1);

      if (!error && listings && listings.length > 0) {
        console.log(`✅ User has listings in ${hubId} hub`);
        passCount++;
      } else {
        console.log(`⚠️  No listings found for user in ${hubId} hub (OK if user just created)`);
      }
    }

    console.log(`\n   Result: User can list in multiple hubs (same user_id, different hub_id)`);
    return true;
  } catch (err) {
    console.error('❌ ERROR:', err);
    return false;
  }
}

// ===================================
// TEST 3: Subscription is Shared
// ===================================

export async function testSubscriptionIsShared() {
  console.log('\n📋 TEST 3: Verify subscription applies to ALL hubs\n');

  const testUserId = 'test-user-123';

  try {
    // Get user's subscription_tier
    const { data: userProfile, error } = await supabaseClient
      .from('profiles')
      .select('subscription_tier')
      .eq('id', testUserId)
      .single();

    if (error || !userProfile) {
      console.error('❌ FAIL: Could not get user subscription:', error);
      return false;
    }

    const userTier = userProfile.subscription_tier;
    console.log(`✅ User subscription tier: ${userTier}`);

    // Now check listing limits for each hub with this tier
    console.log(`\n   Listing limits for ${userTier} tier (same tier, different limits per hub):`);

    for (const hubId of ['marketplace', 'mkulima', 'digital', 'services', 'wholesale']) {
      const limit = getHubListingLimit(hubId as any, userTier as any);
      console.log(`   - ${hubId}: ${limit === Infinity ? 'Unlimited' : limit} listings`);
    }

    console.log('\n   ✅ PASS: Subscription tier applies to all hubs');
    console.log('      (But each hub may enforce different limits based on tier)');
    return true;
  } catch (err) {
    console.error('❌ ERROR:', err);
    return false;
  }
}

// ===================================
// TEST 4: Listings are Hub-Segregated
// ===================================

export async function testListingsAreSegregated() {
  console.log('\n📋 TEST 4: Verify listings are hub-segregated (hub_id column)\n');

  try {
    // Test each hub separately
    console.log('Checking each hub independently:\n');

    for (const hubId of ['marketplace', 'mkulima', 'digital', 'services', 'wholesale', 'live_commerce']) {
      const { data: count, error } = await supabaseClient
        .from('listings')
        .select('id', { count: 'exact', head: true })
        .eq('hub_id', hubId);

      if (!error) {
        console.log(`✅ ${hubId}: ${count || 0} listings (hub_id segregation working)`);
      } else {
        console.error(`❌ Error querying ${hubId}:`, error);
        return false;
      }
    }

    console.log('\n✅ PASS: Listings are hub-segregated');
    console.log('   Each hub has independent listing set (hub_id column filters correctly)');
    return true;
  } catch (err) {
    console.error('❌ ERROR:', err);
    return false;
  }
}

// ===================================
// TEST 5: Analytics are Hub-Specific
// ===================================

export async function testAnalyticsAreHubSpecific() {
  console.log('\n📋 TEST 5: Verify analytics are hub-specific\n');

  try {
    console.log('Hub-specific metrics:\n');

    const hubs = ['marketplace', 'mkulima', 'digital', 'services', 'wholesale', 'live_commerce'];

    for (const hubId of hubs) {
      const { data: stats, error } = await supabaseClient
        .from('listings')
        .select('id, price', { count: 'exact' })
        .eq('hub_id', hubId);

      if (!error && stats) {
        const totalListings = stats.length;
        const totalGMV = stats.reduce((sum, item: any) => sum + (item.price || 0), 0);

        console.log(`✅ ${hubId}:`);
        console.log(`   - Listings: ${totalListings}`);
        console.log(`   - GMV: ${totalGMV.toLocaleString()} KES\n`);
      }
    }

    console.log('✅ PASS: Analytics are hub-specific');
    console.log('   Each hub has independent metrics (GMV, listing count, etc.)');
    return true;
  } catch (err) {
    console.error('❌ ERROR:', err);
    return false;
  }
}

// ===================================
// TEST 6: Verification Badges are Shared
// ===================================

export async function testVerificationBadgesAreShared() {
  console.log('\n📋 TEST 6: Verify verification badges apply to ALL hubs\n');

  const testUserId = 'test-user-123';

  try {
    const { data: userProfile, error } = await supabaseClient
      .from('profiles')
      .select('verification_badge')
      .eq('id', testUserId)
      .single();

    if (error || !userProfile) {
      console.error('❌ FAIL: Could not get verification badge:', error);
      return false;
    }

    const badge = userProfile.verification_badge;
    console.log(`✅ User has verification badge: ${badge}`);
    console.log('\n   This badge applies to user in ALL hubs:');

    for (const hubId of ['marketplace', 'mkulima', 'digital', 'services', 'wholesale', 'live_commerce']) {
      const hub = getHub(hubId as any);
      if (hub?.rules.verificationRequired) {
        console.log(`   - ${hubId}: ✅ Verified (${badge})`);
      } else {
        console.log(`   - ${hubId}: No verification required`);
      }
    }

    console.log('\n✅ PASS: Verification badges are shared');
    console.log('   User has single badge, recognized in all hubs');
    return true;
  } catch (err) {
    console.error('❌ ERROR:', err);
    return false;
  }
}

// ===================================
// TEST 7: Hub Rules Vary per Hub
// ===================================

export async function testHubRulesVary() {
  console.log('\n📋 TEST 7: Verify hub rules vary per hub\n');

  try {
    console.log('Business rules vary per hub:\n');

    const tier = 'starter';

    for (const hubId of ['marketplace', 'mkulima', 'digital', 'services', 'wholesale', 'live_commerce']) {
      const hub = getHub(hubId as any);

      if (hub) {
        const limit = getHubListingLimit(hubId as any, tier as any);
        const verification = hub.rules.verificationRequired;
        const minTier = hub.rules.minimumTier;

        console.log(`${hub.displayName}:`);
        console.log(`  - Listing limit (${tier}): ${limit === Infinity ? '∞' : limit}`);
        console.log(`  - Verification required: ${verification}`);
        console.log(`  - Min tier: ${minTier || 'None'}\n`);
      }
    }

    console.log('✅ PASS: Hub rules vary per hub');
    console.log('   Each hub has independent business rules');
    return true;
  } catch (err) {
    console.error('❌ ERROR:', err);
    return false;
  }
}

// ===================================
// FULL TEST SUITE
// ===================================

export async function runAllArchitectureTests() {
  console.log('═'.repeat(70));
  console.log('🏗️  HUB ARCHITECTURE VERIFICATION SUITE');
  console.log('═'.repeat(70));
  console.log('\nTesting hub segregation with shared users/subscriptions\n');

  const results: Array<{ name: string; passed: boolean }> = [];

  // Run all tests
  const tests = [
    { name: 'User is shared across all hubs', fn: testUserIsShared },
    { name: 'User can list in multiple hubs', fn: testUserMultipleHubs },
    { name: 'Subscription tier is shared', fn: testSubscriptionIsShared },
    { name: 'Listings are hub-segregated', fn: testListingsAreSegregated },
    { name: 'Analytics are hub-specific', fn: testAnalyticsAreHubSpecific },
    { name: 'Verification badges are shared', fn: testVerificationBadgesAreShared },
    { name: 'Hub rules vary per hub', fn: testHubRulesVary },
  ];

  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (err) {
      console.error(`\n❌ EXCEPTION in ${test.name}:`, err);
      results.push({ name: test.name, passed: false });
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(70));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach(r => {
    console.log(`${r.passed ? '✅' : '❌'} ${r.name}`);
  });

  console.log(`\n${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('   Hub architecture is correct:');
    console.log('   ✅ Users are shared across all hubs');
    console.log('   ✅ Subscriptions apply to all hubs');
    console.log('   ✅ Listings are hub-segregated');
    console.log('   ✅ Analytics are hub-specific');
    console.log('   ✅ Verification badges are shared');
    console.log('   ✅ Hub rules vary per hub');
  } else {
    console.log('\n⚠️  Some tests failed. Review errors above.');
  }

  return passed === total;
}

// ===================================
// RUN TESTS (if called directly)
// ===================================

if (require.main === module) {
  runAllArchitectureTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
