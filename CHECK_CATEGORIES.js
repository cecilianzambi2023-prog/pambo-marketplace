/**
 * Check what service categories exist in database
 * Run with: node CHECK_CATEGORIES.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkCategories() {
  try {
    console.log('🔍 Checking service categories in database...\n');

    // Get all service categories
    const { data: allCategories, error } = await supabase
      .from('categories')
      .select('id, hub, name, slug, is_active')
      .eq('hub', 'services')
      .order('sort_order');

    if (error) {
      throw error;
    }

    const total = allCategories?.length || 0;
    const active = allCategories?.filter(c => c.is_active).length || 0;
    const inactive = total - active;

    console.log('📊 DATABASE STATUS:');
    console.log(`   Total service categories: ${total}`);
    console.log(`   Active: ${active}`);
    console.log(`   Inactive: ${inactive}\n`);

    if (total === 0) {
      console.log('❌ No service categories found in database');
      console.log('   You need to seed them first!\n');
      console.log('   Options:');
      console.log('   1. Use Supabase SQL Editor (see instructions above)');
      console.log('   2. Add SUPABASE_SERVICE_ROLE_KEY to .env.local then run SEED script');
      return;
    }

    if (total === 44 && active === 44) {
      console.log('✅ Perfect! All 44 service categories exist and are active!');
      console.log('   They should now display on your website.\n');
      console.log('📋 Categories found:');
      allCategories?.slice(0, 10).forEach(cat => {
        console.log(`   • ${cat.name} (${cat.slug})`);
      });
      if (total > 10) {
        console.log(`   ... and ${total - 10} more`);
      }
      return;
    }

    if (inactive > 0) {
      console.log('⚠️  Some categories are INACTIVE. Activating them now...\n');
      const { error: updateError } = await supabase
        .from('categories')
        .update({ is_active: true })
        .eq('hub', 'services')
        .eq('is_active', false);

      if (updateError) {
        console.log('RLS Policy preventing update. Need admin access.');
        return;
      }

      console.log(`✅ Activated ${inactive} categories!\n`);
    }

    console.log(`📋 Found ${total} service categories:`);
    allCategories?.forEach(cat => {
      const status = cat.is_active ? '✅' : '❌';
      console.log(`   ${status} ${cat.name} (${cat.slug})`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkCategories();
