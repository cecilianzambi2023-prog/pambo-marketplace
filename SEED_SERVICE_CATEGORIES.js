/**
 * Seed 44 Service Categories to Supabase
 * Run with: node SEED_SERVICE_CATEGORIES.js
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

const SERVICE_CATEGORIES = [
  // CORE TRADES (15)
  { hub: 'services', name: 'Plumber', slug: 'plumber', description: 'Pipe installation, repair, maintenance', icon: '🚰', sort_order: 1 },
  { hub: 'services', name: 'Electrician', slug: 'electrician', description: 'Electrical installation, repair, wiring', icon: '⚡', sort_order: 2 },
  { hub: 'services', name: 'Carpenter', slug: 'carpenter', description: 'Furniture, doors, shelving, custom woodwork', icon: '🪚', sort_order: 3 },
  { hub: 'services', name: 'Mason', slug: 'mason', description: 'Brickwork, concrete, foundation, plastering', icon: '🧱', sort_order: 4 },
  { hub: 'services', name: 'Welder / Fabricator', slug: 'welder-fabricator', description: 'Metal welding, gates, grills, structures', icon: '🔥', sort_order: 5 },
  { hub: 'services', name: 'Painter', slug: 'painter', description: 'Interior/exterior painting, wall finishing', icon: '🎨', sort_order: 6 },
  { hub: 'services', name: 'Tiler', slug: 'tiler', description: 'Floor and wall tiling installation', icon: '⬜', sort_order: 7 },
  { hub: 'services', name: 'Gypsum & Ceiling Installer', slug: 'gypsum-ceiling', description: 'False ceiling, plasterboard installation', icon: '🏢', sort_order: 8 },
  { hub: 'services', name: 'Glass & Aluminium Fabricator', slug: 'glass-aluminium', description: 'Windows, doors, partitions', icon: '🪟', sort_order: 9 },
  { hub: 'services', name: 'Roofing Specialist', slug: 'roofing', description: 'Roof installation, repair, maintenance', icon: '🏠', sort_order: 10 },
  { hub: 'services', name: 'Waterproofing Specialist', slug: 'waterproofing', description: 'Basement, roof, wall waterproofing', icon: '💧', sort_order: 11 },
  { hub: 'services', name: 'Borehole Drilling', slug: 'borehole-drilling', description: 'Water well drilling and maintenance', icon: '🕳️', sort_order: 12 },
  { hub: 'services', name: 'Solar Installer', slug: 'solar-installer', description: 'Solar panels, inverters, batteries', icon: '☀️', sort_order: 13 },
  { hub: 'services', name: 'CCTV Installer', slug: 'cctv-installer', description: 'Security camera systems installation', icon: '📹', sort_order: 14 },
  { hub: 'services', name: 'Gate & Grill Fabricator', slug: 'gate-grill', description: 'Custom gates, grills, steel work', icon: '🔒', sort_order: 15 },
  
  // HOME, OFFICE & FACILITY (11)
  { hub: 'services', name: 'Interior Designer', slug: 'interior-designer', description: 'Space planning and design consultation', icon: '✨', sort_order: 16 },
  { hub: 'services', name: 'Architect', slug: 'architect', description: 'Building design, plans, consultations', icon: '📐', sort_order: 17 },
  { hub: 'services', name: 'Quantity Surveyor', slug: 'quantity-surveyor', description: 'Cost estimation and project budgeting', icon: '📊', sort_order: 18 },
  { hub: 'services', name: 'Construction Supervisor', slug: 'construction-supervisor', description: 'Project oversight and quality control', icon: '👷', sort_order: 19 },
  { hub: 'services', name: 'Facility Manager', slug: 'facility-manager', description: 'Building maintenance and operations', icon: '🔐', sort_order: 20 },
  { hub: 'services', name: 'Property Valuer', slug: 'property-valuer', description: 'Property appraisal and market assessment', icon: '💰', sort_order: 21 },
  { hub: 'services', name: 'Real Estate Agent', slug: 'real-estate-agent', description: 'Property buying, selling, leasing', icon: '🔑', sort_order: 22 },
  { hub: 'services', name: 'Moving Services', slug: 'moving-services', description: 'Packing, transportation, relocation', icon: '🚚', sort_order: 23 },
  { hub: 'services', name: 'Cleaning Services', slug: 'cleaning-services', description: 'Home and office cleaning and maintenance', icon: '🧹', sort_order: 24 },
  { hub: 'services', name: 'Pest Control', slug: 'pest-control', description: 'Termites, insects, rodent control', icon: '🐀', sort_order: 25 },
  { hub: 'services', name: 'Garbage Collection', slug: 'garbage-collection', description: 'Waste management and disposal', icon: '♻️', sort_order: 26 },
  
  // TECHNICAL & APPLIANCE (7)
  { hub: 'services', name: 'Air Conditioning Technician', slug: 'ac-technician', description: 'AC installation, repair, maintenance', icon: '❄️', sort_order: 27 },
  { hub: 'services', name: 'Refrigerator Repair', slug: 'refrigerator-repair', description: 'Fridge repair and maintenance', icon: '🧊', sort_order: 28 },
  { hub: 'services', name: 'Washing Machine Repair', slug: 'washing-machine-repair', description: 'Washing machine repair and servicing', icon: '🧺', sort_order: 29 },
  { hub: 'services', name: 'Generator Repair', slug: 'generator-repair', description: 'Generator repair, servicing, maintenance', icon: '⚙️', sort_order: 30 },
  { hub: 'services', name: 'Internet & Wi-Fi Installer', slug: 'internet-wifi-installer', description: 'Internet setup and Wi-Fi installation', icon: '📡', sort_order: 31 },
  { hub: 'services', name: 'Computer Repair & IT Support', slug: 'computer-repair-it', description: 'PC repair, laptop fix, IT support', icon: '💻', sort_order: 32 },
  { hub: 'services', name: 'Mobile Phone Repair', slug: 'mobile-phone-repair', description: 'Phone screen, battery, water damage repair', icon: '📱', sort_order: 33 },
  
  // OUTDOOR, RURAL & MASHAMBANI (7)
  { hub: 'services', name: 'Landscaping & Gardening', slug: 'landscaping-gardening', description: 'Garden design, lawn care, landscaping', icon: '🌱', sort_order: 34 },
  { hub: 'services', name: 'Fencing Services', slug: 'fencing-services', description: 'Fence installation, repair, gates', icon: '🚧', sort_order: 35 },
  { hub: 'services', name: 'Irrigation Installer', slug: 'irrigation-installer', description: 'Irrigation systems, drip lines, sprinklers', icon: '💦', sort_order: 36 },
  { hub: 'services', name: 'Farm Equipment Repair', slug: 'farm-equipment-repair', description: 'Tractor, engine, agricultural equipment repair', icon: '🚜', sort_order: 37 },
  { hub: 'services', name: 'Agro-Vet Technician', slug: 'agro-vet-technician', description: 'Livestock health, vaccination services', icon: '🐄', sort_order: 38 },
  { hub: 'services', name: 'Greenhouse Construction', slug: 'greenhouse-construction', description: 'Greenhouse design, construction, setup', icon: '🌾', sort_order: 39 },
  { hub: 'services', name: 'Water Tank Installation', slug: 'water-tank-installation', description: 'Water tank supply and installation', icon: '🪣', sort_order: 40 },
  
  // EVENTS & SPECIAL (4)
  { hub: 'services', name: 'Event Setup & Tents', slug: 'event-setup-tents', description: 'Tent rental, event setup, decoration', icon: '⛺', sort_order: 41 },
  { hub: 'services', name: 'Sound & Lighting Services', slug: 'sound-lighting-services', description: 'Event sound systems and stage lighting', icon: '🎤', sort_order: 42 },
  { hub: 'services', name: 'Photography & Videography', slug: 'photography-videography', description: 'Event photos, videos, editing', icon: '📸', sort_order: 43 },
  { hub: 'services', name: 'Security Services', slug: 'security-services', description: 'Guards, alarm systems, monitoring', icon: '👮', sort_order: 44 },
];

async function seedCategories() {
  try {
    console.log('🌱 Seeding 44 Service Categories...\n');

    const { data, error } = await supabase
      .from('categories')
      .insert(SERVICE_CATEGORIES)
      .select();

    if (error) {
      if (error.message.includes('duplicate key')) {
        console.log('⚠️  Categories already exist (some duplicates found)');
        console.log('   This is OK - your database is already populated!\n');
      } else {
        throw error;
      }
    } else {
      console.log(`✅ Successfully inserted ${data?.length || SERVICE_CATEGORIES.length} categories!\n`);
    }

    // Verify insertion
    const { data: verifyData } = await supabase
      .from('categories')
      .select('COUNT(*)', { count: 'exact' })
      .eq('hub', 'services')
      .eq('is_active', true);

    const { data: countData, error: countError } = await supabase
      .from('categories')
      .select('id')
      .eq('hub', 'services')
      .eq('is_active', true);

    const count = countData?.length || 0;

    console.log('📊 VERIFICATION:');
    console.log(`   Total active service categories in DB: ${count}`);
    
    if (count === 44) {
      console.log('   ✅ All 44 categories are ready to display!\n');
    } else if (count > 0) {
      console.log(`   ⚠️  Found ${count} categories (expected 44)\n`);
    }

    console.log('🎉 Service categories seeding complete!');
    console.log('   They will now display on your website!\n');

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
