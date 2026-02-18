/**
 * UPDATE_CATEGORY_IMAGES.sql
 * =========================
 * 
 * This guide shows how to update category icons with Unsplash image URLs
 * 
 * STEP 1: Get Unsplash API Key
 * - Go to https://unsplash.com/oauth/applications
 * - Create free account
 * - Create application
 * - Copy Access Key
 * 
 * STEP 2: Run the browser script below
 * - Open http://localhost:3000/
 * - Press F12 (Developer Tools)
 * - Click "Console" tab
 * - Paste the script below
 * - Press Enter
 * 
 * The script will fetch real photos from Unsplash for each category
 * and update your Supabase database automatically!
 */

// ============================================================
// PASTE THIS INTO BROWSER CONSOLE (F12 → Console tab)
// ============================================================

(async () => {
  // Get your Unsplash API key
  const unsplashKey = prompt('Enter your Unsplash API Access Key from https://unsplash.com/oauth/applications');
  if (!unsplashKey) {
    alert('Cancelled. Unsplash API key required.');
    return;
  }

  // Import Supabase
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  
  const SUPABASE_URL = 'https://cyydmongvxzdynmdyrzp.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eWRtb25ndnh6ZHluZWR5cnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxNDIwMDAsImV4cCI6MTczOTY3ODAwMH0.W0zNfxMFfZpGSuYlZj4u_Z_L-7Q5C3eqL5N1O2P3Q4R'; // Public anon key is safe to expose
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Keyword mapping for each service
  const keywordMap = {
    'plumber': 'professional plumbing pipe repair',
    'electrician': 'professional electrician electrical work',
    'carpenter': 'professional carpentry woodworking',
    'painter': 'professional house painter interior',
    'mason': 'professional masonry brickwork',
    'interior designer': 'interior design home decoration',
    'interior painter': 'interior painting home',
    'mama fua': 'professional laundry service cleaning',
    'water delivery': 'water service delivery',
    'photographer': 'professional photographer portrait',
    'videographer': 'videographer camera recording',
    'cctv installer': 'security camera cctv installation',
    'home cleaner': 'professional house cleaning',
    'solar installer': 'solar panel installation',
    'welder': 'professional welding construction',
    'mechanic': 'professional car mechanic repair',
    'barber': 'barber shop haircut professional',
    'salon': 'salon hair styling beauty',
    'tailor': 'tailor sewing alterations',
    'event dj': 'dj music event professional',
    'event planner': 'event planning coordination',
    'catering': 'catering food service professional',
    'cook': 'professional chef cooking kitchen',
  };

  console.log('🚀 Starting category image update...');
  console.log('This will fetch real photos from Unsplash for all 44 services');

  try {
    // Get all categories
    const { data: categories, error: fetchError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('hub', 'services');

    if (fetchError) {
      console.error('❌ Error fetching categories:', fetchError);
      alert('Error: ' + fetchError.message);
      return;
    }

    console.log(`📦 Found ${categories.length} service categories`);

    let updated = 0;
    let failed = 0;

    // Update each category with an image
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const categoryName = category.name.toLowerCase();
      
      // Construct search keywords
      const keywords = keywordMap[categoryName] || `professional ${categoryName}`;
      
      console.log(`[${i + 1}/${categories.length}] 🔍 Searching for: "${keywords}"`);

      try {
        // Search Unsplash
        const searchResponse = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=1&orientation=portrait&client_id=${unsplashKey}`
        );

        if (!searchResponse.ok) {
          console.warn(`⚠️ Could not find image for "${category.name}". Using fallback.`);
          failed++;
          continue;
        }

        const searchData = await searchResponse.json();
        
        if (!searchData.results || searchData.results.length === 0) {
          console.warn(`⚠️ No results for "${category.name}"`);
          failed++;
          continue;
        }

        const imageUrl = searchData.results[0].urls.regular;
        console.log(`✅ Found: ${imageUrl}`);

        // Update database
        const { error: updateError } = await supabase
          .from('categories')
          .update({ icon: imageUrl })
          .eq('id', category.id);

        if (updateError) {
          console.error(`❌ Update error for ${category.name}:`, updateError);
          failed++;
        } else {
          updated++;
        }

      } catch (error) {
        console.error(`❌ Error processing "${category.name}":`, error);
        failed++;
      }

      // Respect rate limits (50 requests/hour = 1 per ~72ms, but let's be safe)
      if (i < categories.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    console.log(`\n✅ COMPLETE!`);
    console.log(`📊 Updated: ${updated} categories`);
    console.log(`❌ Failed: ${failed} categories`);
    console.log(`🎉 Refresh your website to see the real photos!`);

    alert(`✅ Done! Updated ${updated} categories with real photos.\nRefresh your website to see the changes.`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    alert('Error: ' + error.message);
  }
})();
