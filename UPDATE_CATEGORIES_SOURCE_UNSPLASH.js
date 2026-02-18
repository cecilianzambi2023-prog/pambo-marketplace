/**
 * UPDATE_CATEGORIES_WITH_SOURCE_UNSPLASH.js
 * ==========================================
 * 
 * Updates all 44 service categories with Source Unsplash image URLs
 * No API key needed - instant, lightweight, royalty-free
 * 
 * HOW TO USE:
 * 1. Go to http://localhost:3000/
 * 2. Press F12 (Developer Tools)
 * 3. Click "Console" tab
 * 4. Paste this entire script
 * 5. Press Enter
 * 6. Watch as all 44 categories get real professional photos
 * 7. Refresh the page to see them!
 */

(async () => {
  // Starting Source Unsplash image update for all 44 services

  // Import Supabase client
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  
  const SUPABASE_URL = 'https://cyydmongvxzdynmdyrzp.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eWRtb25ndnh6ZHluZWR5cnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxNDIwMDAsImV4cCI6MTczOTY3ODAwMH0.W0zNfxMFfZpGSuYlZj4u_Z_L-7Q5C3eqL5N1O2P3Q4R';
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Keyword mapping for all 44 services with Source Unsplash URLs
  const categoryImages = {
    'Plumber': 'https://source.unsplash.com/?plumber,pipes,professional',
    'Electrician': 'https://source.unsplash.com/?electrician,electrical,work',
    'Carpenter': 'https://source.unsplash.com/?carpenter,woodworking,tools',
    'Painter': 'https://source.unsplash.com/?painter,house,painting',
    'Mason': 'https://source.unsplash.com/?mason,brickwork,construction',
    'Interior Designer': 'https://source.unsplash.com/?interior,design,home',
    'Interior Painter': 'https://source.unsplash.com/?interior,painting,home',
    'Mama Fua': 'https://source.unsplash.com/?laundry,cleaning,service',
    'Water Delivery': 'https://source.unsplash.com/?water,delivery,service',
    'Photographer': 'https://source.unsplash.com/?photographer,portrait,studio',
    'Videographer': 'https://source.unsplash.com/?videographer,camera,video',
    'CCTV Installer': 'https://source.unsplash.com/?security,cctv,camera',
    'Home Cleaner': 'https://source.unsplash.com/?cleaning,professional,service',
    'Solar Installer': 'https://source.unsplash.com/?solar,panels,installation',
    'Welder': 'https://source.unsplash.com/?welder,welding,metal',
    'Mechanic': 'https://source.unsplash.com/?mechanic,car,repair',
    'Barber': 'https://source.unsplash.com/?barber,haircut,shop',
    'Salon': 'https://source.unsplash.com/?salon,hair,beauty',
    'Tailor': 'https://source.unsplash.com/?tailor,sewing,alterations',
    'Event DJ': 'https://source.unsplash.com/?dj,music,event',
    'Event Planner': 'https://source.unsplash.com/?event,planning,celebration',
    'Catering': 'https://source.unsplash.com/?catering,food,service',
    'Cook': 'https://source.unsplash.com/?chef,cooking,kitchen',
    'Tutor': 'https://source.unsplash.com/?tutor,education,learning',
    'Accountant': 'https://source.unsplash.com/?accountant,office,business',
    'Consultant': 'https://source.unsplash.com/?consultant,business,professional',
    'Handyman': 'https://source.unsplash.com/?handyman,repair,tools',
    'Landscaper': 'https://source.unsplash.com/?landscaping,garden,outdoor',
    'Plumbing': 'https://source.unsplash.com/?plumbing,pipes,repair',
    'Electrical': 'https://source.unsplash.com/?electrical,electrician,work',
    'Construction': 'https://source.unsplash.com/?construction,worker,building',
    'Renovation': 'https://source.unsplash.com/?renovation,home,construction',
    'Tiling': 'https://source.unsplash.com/?tiling,flooring,installation',
    'Flooring': 'https://source.unsplash.com/?flooring,installation,professional',
    'Roofing': 'https://source.unsplash.com/?roofing,repair,professional',
    'Installation': 'https://source.unsplash.com/?installation,service,professional',
    'Appliance Repair': 'https://source.unsplash.com/?appliance,repair,service',
    'Glass Installation': 'https://source.unsplash.com/?glass,window,installation',
    'Door Installation': 'https://source.unsplash.com/?door,installation,professional',
    'Pest Control': 'https://source.unsplash.com/?pest,control,service',
    'Pool Cleaning': 'https://source.unsplash.com/?pool,cleaning,maintenance',
    'Gardening': 'https://source.unsplash.com/?gardening,plants,outdoor',
    'Tree Removal': 'https://source.unsplash.com/?tree,removal,landscaping',
    'Moving Service': 'https://source.unsplash.com/?moving,service,professional',
  };

  try {
    // Fetch all service categories
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('hub', 'services');

    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError);
      alert('Error: ' + fetchError.message);
      return;
    }

    // Found service categories

    let updated = 0;
    let failed = 0;

    // Update each category
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const imageUrl = categoryImages[category.name];

      if (!imageUrl) {
        // Category has no URL mapped, skipping
        failed++;
        continue;
      }

      // Updating category

      const { error: updateError } = await supabase
        .from('categories')
        .update({ icon: imageUrl })
        .eq('id', category.id);

      if (updateError) {
        console.error(`  ❌ Error:`, updateError.message);
        failed++;
      } else {
        // Successfully updated with image
        updated++;
      }
    }

    // Update complete. Refresh the page to see new images.

    alert(`✅ SUCCESS!\n\nUpdated ${updated} categories with real Unsplash photos.\n\nRefresh your website to see them!`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    alert('Error: ' + error.message);
  }
})();
