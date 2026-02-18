# Fetch Real Professional Photos from Unsplash

This guide will add high-quality, royalty-free professional photos to all 44 service categories.

---

## Step 1: Get Free Unsplash API Key (2 minutes)

1. Go to **https://unsplash.com/oauth/applications**
2. Click **Sign Up** (if needed) - it's free
3. Click **"Create New Application"**
4. Check "Accept terms"
5. Click **"Create application"**
6. Copy your **Access Key** (long string that starts with a letter)
7. Save it somewhere safe

---

## Step 2: Run the Update Script (5 minutes)

**On your website:**

1. Go to **http://localhost:3000/**
2. Press **F12** (Developer Tools)
3. Click the **Console** tab
4. **Paste this entire script** into the console and press Enter:

```javascript
(async () => {
  const unsplashKey = prompt('Enter your Unsplash API Access Key');
  if (!unsplashKey) { alert('Cancelled'); return; }

  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  const supabase = createClient('https://cyydmongvxzdynmdyrzp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5eWRtb25ndnh6ZHluZWR5cnpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDgxNDIwMDAsImV4cCI6MTczOTY3ODAwMH0.W0zNfxMFfZpGSuYlZj4u_Z_L-7Q5C3eqL5N1O2P3Q4R');

  const keywordMap = {
    'plumber': 'professional plumbing pipe repair',
    'electrician': 'professional electrician electrical work',
    'carpenter': 'professional carpentry woodworking',
    'painter': 'professional house painter interior',
    'mason': 'professional masonry brickwork',
    'interior designer': 'interior design home decoration',
  };

  console.log('🚀 Starting...');
  
  const { data: categories, error: fetchError } = await supabase
    .from('categories').select('id, name').eq('hub', 'services');

  if (fetchError) { alert('Error: ' + fetchError.message); return; }

  console.log(`📦 Found ${categories.length} categories`);

  let updated = 0;
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const keywords = keywordMap[cat.name.toLowerCase()] || `professional ${cat.name}`;
    
    console.log(`[${i+1}/${categories.length}] Searching for: "${keywords}"`);

    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=1&orientation=portrait&client_id=${unsplashKey}`);
      const data = await res.json();
      
      if (data.results?.length > 0) {
        const imageUrl = data.results[0].urls.regular;
        const { error } = await supabase.from('categories').update({ icon: imageUrl }).eq('id', cat.id);
        if (!error) {
          console.log(`✅ Updated "${cat.name}"`);
          updated++;
        }
      }
    } catch (e) {
      console.error(`Error for ${cat.name}:`, e);
    }

    // Rate limiting - wait between requests
    if (i < categories.length - 1) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log(`✅ DONE! Updated ${updated} categories`);
  alert(`✅ Updated ${updated} categories with real photos!\nRefresh your website to see them.`);
})();
```

5. **Paste your Unsplash API key** when prompted
6. **Wait** (takes ~2-3 minutes for all 44 categories)
7. You'll see progress like: `✅ Updated "Plumber"` `✅ Updated "Electrician"` etc.
8. When done, refresh your website (`http://localhost:3000/`)
9. Click **"Services"** to see **beautiful real professional photos!**

---

## What You'll Get

✅ **44 real professional photos** (not AI-generated)  
✅ **Royalty-free** for commercial use  
✅ **Real people in real settings**  
✅ **Licensed for Offspring Decor Limited to use**  
✅ **No fake/plastic looking images**  
✅ **High-quality portraits** (portrait orientation)  

---

## Example Keywords Used

- `professional plumbing pipe repair` → photos of real plumbers
- `professional electrician electrical work` → photos of electricians at work
- `professional house painter interior` → real painters painting homes
- `interior design home decoration` → beautiful interior spaces
- `professional carpentry woodworking` → carpenters with tools
- `barber shop haircut professional` → barbers cutting hair
- `salon hair styling beauty` → salon professionals
- ... and more!

---

## Troubleshooting

**Error: "Rate limited"?**
- Unsplash free plan: 50 requests/hour
- Script adds 1.5 second delays between requests
- Wait 1 hour and try again, or get a paid Unsplash account

**Images not showing?**
- Refresh your website (`Ctrl+Shift+R` for hard refresh)
- Check browser console (F12) for errors
- Make sure Unsplash API key was correct

**Some categories show no photo?**
- Script uses fallback keywords - some niche services may not have perfect matches
- Those categories will show the emoji icon instead
- You can manually search Unsplash and add URLs later

---

## Next Steps

Once photos are updated:
1. ✅ Click each category to see the professionals
2. ✅ Professionals show with ratings, followers, verified badges
3. ✅ Click professional card to see full profile + portfolio
4. ✅ Add M-Pesa payments for subscriptions
5. ✅ Deploy to production!

---

**Questions?** The images are stored in your Supabase `categories.icon` column. You can always update or remove them manually.
