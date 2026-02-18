/**
 * Script to activate all 44 service categories in Supabase
 * 
 * Run with: npx ts-node ACTIVATE_SERVICE_CATEGORIES.ts
 * 
 * This script:
 * 1. Connects to Supabase
 * 2. Activates all categories with hub='services'
 * 3. Displays before/after statistics
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function activateServiceCategories() {
  try {
    console.log('🔍 Checking current status of service categories...\n');

    // Get statistics BEFORE
    const { data: beforeData, error: beforeError } = await supabase
      .from('categories')
      .select('id, hub, name, is_active')
      .eq('hub', 'services');

    if (beforeError) {
      throw beforeError;
    }

    const totalCategories = beforeData?.length || 0;
    const activeCategories = beforeData?.filter(c => c.is_active).length || 0;
    const inactiveCategories = totalCategories - activeCategories;

    console.log('📊 BEFORE ACTIVATION:');
    console.log(`   Total service categories: ${totalCategories}`);
    console.log(`   Active: ${activeCategories}`);
    console.log(`   Inactive: ${inactiveCategories}\n`);

    if (activeCategories === totalCategories) {
      console.log('✅ All service categories are already active!');
      return;
    }

    // Activate all
    console.log('🚀 Activating all service categories...\n');
    const { error: updateError, data: updateData } = await supabase
      .from('categories')
      .update({ is_active: true })
      .eq('hub', 'services')
      .select('id, hub, name, is_active');

    if (updateError) {
      throw updateError;
    }

    console.log(`✅ Updated ${updateData?.length || 0} categories\n`);

    // Get statistics AFTER
    const { data: afterData, error: afterError } = await supabase
      .from('categories')
      .select('id, hub, name, is_active')
      .eq('hub', 'services');

    if (afterError) {
      throw afterError;
    }

    const afterActive = afterData?.filter(c => c.is_active).length || 0;

    console.log('📊 AFTER ACTIVATION:');
    console.log(`   Total service categories: ${afterData?.length || 0}`);
    console.log(`   Active: ${afterActive}`);
    console.log(`   Inactive: ${(afterData?.length || 0) - afterActive}\n`);

    // List categories
    console.log('📋 Active service categories:');
    afterData?.filter(c => c.is_active).forEach((cat, i) => {
      console.log(`   ${i + 1}. ${cat.name}`);
    });

    console.log('\n✅ All service categories are now active and will display on your website!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
activateServiceCategories();
