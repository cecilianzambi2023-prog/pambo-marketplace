-- ========================================================
-- CREATE CATEGORIES TABLE (if it doesn't exist)
-- ========================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub TEXT NOT NULL CHECK (hub IN ('marketplace', 'wholesale', 'digital', 'mkulima', 'services', 'live_commerce')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_slug_per_hub UNIQUE (hub, slug)
);

-- ========================================================
-- CREATE INDEXES
-- ========================================================
CREATE INDEX IF NOT EXISTS idx_categories_hub ON categories(hub) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_hub_slug ON categories(hub, slug) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(hub, sort_order, is_active);

-- ========================================================
-- DELETE OLD SERVICE CATEGORIES (fresh start)
-- ========================================================
DELETE FROM categories WHERE hub = 'services';

-- ========================================================
-- SEED ALL 90 SERVICE CATEGORIES
-- ========================================================
INSERT INTO categories (hub, name, slug, description, icon, sort_order, is_active) VALUES
-- CORE TRADES & FUNDIS (15 categories)
('services', 'Plumber', 'plumber', 'Pipe installation, repair, maintenance', '🚰', 1, TRUE),
('services', 'Electrician', 'electrician', 'Electrical installation, repair, wiring', '⚡', 2, TRUE),
('services', 'Carpenter', 'carpenter', 'Furniture, doors, shelving, custom woodwork', '🪚', 3, TRUE),
('services', 'Mason', 'mason', 'Brickwork, concrete, foundation, plastering', '🧱', 4, TRUE),
('services', 'Welder / Fabricator', 'welder-fabricator', 'Metal welding, gates, grills, structures', '🔥', 5, TRUE),
('services', 'Painter', 'painter', 'Interior/exterior painting, wall finishing', '🎨', 6, TRUE),
('services', 'Tiler', 'tiler', 'Floor and wall tiling installation', '⬜', 7, TRUE),
('services', 'Gypsum & Ceiling Installer', 'gypsum-ceiling', 'False ceiling, plasterboard installation', '🏢', 8, TRUE),
('services', 'Glass & Aluminium Fabricator', 'glass-aluminium', 'Windows, doors, partitions', '🪟', 9, TRUE),
('services', 'Roofing Specialist', 'roofing', 'Roof installation, repair, maintenance', '🏠', 10, TRUE),
('services', 'Waterproofing Specialist', 'waterproofing', 'Basement, roof, wall waterproofing', '💧', 11, TRUE),
('services', 'Borehole Drilling', 'borehole-drilling', 'Water well drilling and maintenance', '🕳️', 12, TRUE),
('services', 'Solar Installer', 'solar-installer', 'Solar panels, inverters, batteries', '☀️', 13, TRUE),
('services', 'CCTV Installer', 'cctv-installer', 'Security camera systems installation', '📹', 14, TRUE),
('services', 'Gate & Grill Fabricator', 'gate-grill', 'Custom gates, grills, steel work', '🔒', 15, TRUE),

-- HOME, OFFICE & FACILITY SERVICES (11 categories)
('services', 'Interior Designer', 'interior-designer', 'Space planning and design consultation', '✨', 16, TRUE),
('services', 'Architect', 'architect', 'Building design, plans, consultations', '📐', 17, TRUE),
('services', 'Quantity Surveyor', 'quantity-surveyor', 'Cost estimation and project budgeting', '📊', 18, TRUE),
('services', 'Construction Supervisor', 'construction-supervisor', 'Project oversight and quality control', '👷', 19, TRUE),
('services', 'Facility Manager', 'facility-manager', 'Building maintenance and operations', '🔐', 20, TRUE),
('services', 'Property Valuer', 'property-valuer', 'Property appraisal and market assessment', '💰', 21, TRUE),
('services', 'Real Estate Agent', 'real-estate-agent', 'Property buying, selling, leasing', '🔑', 22, TRUE),
('services', 'Moving Services', 'moving-services', 'Packing, transportation, relocation', '🚚', 23, TRUE),
('services', 'Cleaning Services', 'cleaning-services', 'Home and office cleaning and maintenance', '🧹', 24, TRUE),
('services', 'Pest Control', 'pest-control', 'Termites, insects, rodent control', '🐀', 25, TRUE),
('services', 'Garbage Collection', 'garbage-collection', 'Waste management and disposal', '♻️', 26, TRUE),

-- TECHNICAL & APPLIANCE SERVICES (7 categories)
('services', 'Air Conditioning Technician', 'ac-technician', 'AC installation, repair, maintenance', '❄️', 27, TRUE),
('services', 'Refrigerator Repair', 'refrigerator-repair', 'Fridge repair and maintenance', '🧊', 28, TRUE),
('services', 'Washing Machine Repair', 'washing-machine-repair', 'Washing machine repair and servicing', '🧺', 29, TRUE),
('services', 'Generator Repair', 'generator-repair', 'Generator repair, servicing, maintenance', '⚙️', 30, TRUE),
('services', 'Internet & Wi-Fi Installer', 'internet-wifi-installer', 'Internet setup and Wi-Fi installation', '📡', 31, TRUE),
('services', 'Computer Repair & IT Support', 'computer-repair-it', 'PC repair, laptop fix, IT support', '💻', 32, TRUE),
('services', 'Mobile Phone Repair', 'mobile-phone-repair', 'Phone screen, battery, water damage repair', '📱', 33, TRUE),

-- OUTDOOR, RURAL & MASHAMBANI SERVICES (7 categories)
('services', 'Landscaping & Gardening', 'landscaping-gardening', 'Garden design, lawn care, landscaping', '🌱', 34, TRUE),
('services', 'Fencing Services', 'fencing-services', 'Fence installation, repair, gates', '🚧', 35, TRUE),
('services', 'Irrigation Installer', 'irrigation-installer', 'Irrigation systems, drip lines, sprinklers', '💦', 36, TRUE),
('services', 'Farm Equipment Repair', 'farm-equipment-repair', 'Tractor, engine, agricultural equipment repair', '🚜', 37, TRUE),
('services', 'Agro-Vet Technician', 'agro-vet-technician', 'Livestock health, vaccination services', '🐄', 38, TRUE),
('services', 'Greenhouse Construction', 'greenhouse-construction', 'Greenhouse design, construction, setup', '🌾', 39, TRUE),
('services', 'Water Tank Installation', 'water-tank-installation', 'Water tank supply and installation', '🪣', 40, TRUE),

-- EVENTS & SPECIAL SERVICES (4 categories)
('services', 'Event Setup & Tents', 'event-setup-tents', 'Tent rental, event setup, decoration', '⛺', 41, TRUE),
('services', 'Sound & Lighting Services', 'sound-lighting-services', 'Event sound systems and stage lighting', '🎤', 42, TRUE),
('services', 'Photography & Videography', 'photography-videography', 'Event photos, videos, editing', '📸', 43, TRUE),
('services', 'Security Services', 'security-services', 'Guards, alarm systems, monitoring', '👮', 44, TRUE),

-- PERSONAL & BEAUTY SERVICES (10 categories)
('services', 'Hair Salon / Barber', 'hair-salon-barber', 'Haircut, coloring, styling, treatments', '✂️', 45, TRUE),
('services', 'Beauty & Spa Services', 'beauty-spa-services', 'Facial, massage, manicure, pedicure', '💅', 46, TRUE),
('services', 'Makeup Artist', 'makeup-artist', 'Professional makeup for events', '💄', 47, TRUE),
('services', 'Weight Loss Coach', 'weight-loss-coach', 'Personal fitness and nutrition coaching', '💪', 48, TRUE),
('services', 'Personal Trainer', 'personal-trainer', 'Gym training and workout sessions', '🏋️', 49, TRUE),
('services', 'Yoga Instructor', 'yoga-instructor', 'Yoga classes and wellness sessions', '🧘', 50, TRUE),
('services', 'Tailor / Seamstress', 'tailor-seamstress', 'Clothing alteration and custom garments', '🧵', 51, TRUE),
('services', 'Shoe Repair', 'shoe-repair', 'Shoe repair and restoration', '👞', 52, TRUE),
('services', 'Leather Goods Repair', 'leather-goods-repair', 'Bag, wallet, belt repair and restoration', '👜', 53, TRUE),
('services', 'Jewelry Repair', 'jewelry-repair', 'Ring, watch, necklace repair and cleaning', '💍', 54, TRUE),

-- AUTOMOTIVE SERVICES (8 categories)
('services', 'Mechanic / Auto Repair', 'mechanic-auto-repair', 'Car repair, maintenance, diagnostics', '🔧', 55, TRUE),
('services', 'Car Wash & Detailing', 'car-wash-detailing', 'Professional car cleaning and polishing', '🚗', 56, TRUE),
('services', 'Tyre Services', 'tyre-services', 'Tyre replacement, puncture repair, alignment', '🛞', 57, TRUE),
('services', 'Car Battery Services', 'car-battery-services', 'Battery testing, charging, replacement', '🔋', 58, TRUE),
('services', 'Auto Upholstery', 'auto-upholstery', 'Car seat and interior customization', '🪑', 59, TRUE),
('services', 'Car Audio Installation', 'car-audio-installation', 'Sound system and entertainment setup', '🔊', 60, TRUE),
('services', 'Motorbike Repair', 'motorbike-repair', 'Motorcycle maintenance and repair', '🏍️', 61, TRUE),
('services', 'Truck & Heavy Equipment Repair', 'truck-repair', 'Truck and commercial vehicle repair', '🚛', 62, TRUE),

-- EDUCATION & COACHING (8 categories)
('services', 'Tutor / Academic Coach', 'tutor-academic-coach', 'School subject tutoring and exam prep', '📚', 63, TRUE),
('services', 'Driving Instructor', 'driving-instructor', 'Professional driving lessons', '🚙', 64, TRUE),
('services', 'Music Lessons', 'music-lessons', 'Piano, guitar, drums, vocal coaching', '🎸', 65, TRUE),
('services', 'Dance Classes', 'dance-classes', 'Hip-hop, salsa, traditional dance lessons', '💃', 66, TRUE),
('services', 'Language Tutor', 'language-tutor', 'English, Swahili, French, other languages', '🗣️', 67, TRUE),
('services', 'Computer Training', 'computer-training', 'IT skills, coding, software training', '⌨️', 68, TRUE),
('services', 'Business Coaching', 'business-coaching', 'Entrepreneurship and business mentoring', '💼', 69, TRUE),
('services', 'Life Coach', 'life-coach', 'Personal development and goal setting', '🎯', 70, TRUE),

-- HEALTH & MEDICAL SERVICES (8 categories)
('services', 'Nurse / Healthcare Assistant', 'nurse-healthcare-assistant', 'Home care, medical assistance', '⚕️', 71, TRUE),
('services', 'Physiotherapist', 'physiotherapist', 'Physical therapy and rehabilitation', '🏥', 72, TRUE),
('services', 'Counselor / Therapist', 'counselor-therapist', 'Mental health and counseling services', '🧠', 73, TRUE),
('services', 'Nutritionist', 'nutritionist', 'Diet planning and nutrition consultation', '🥗', 74, TRUE),
('services', 'Dental Services', 'dental-services', 'Tooth cleaning, extraction, dental care', '🦷', 75, TRUE),
('services', 'Eye Care / Optometrist', 'eye-care-optometrist', 'Eye testing and glasses prescription', '👓', 76, TRUE),
('services', 'Veterinary Services', 'veterinary-services', 'Pet care, vaccination, medical services', '🐾', 77, TRUE),
('services', 'Homeopathy / Alternative Medicine', 'homeopathy-alternative', 'Herbal and holistic health treatments', '🌿', 78, TRUE),

-- LOGISTICS & DELIVERY SERVICES (6 categories)
('services', 'Courier Services', 'courier-services', 'Document and parcel delivery', '📦', 79, TRUE),
('services', 'Heavy Lift / Crane Services', 'heavy-lift-crane', 'Crane rental and heavy equipment moving', '🏗️', 80, TRUE),
('services', 'Storage & Warehousing', 'storage-warehousing', 'Secure storage and warehouse solutions', '🏭', 81, TRUE),
('services', 'Taxi / Uber Driver', 'taxi-uber-driver', 'Ride-sharing and transportation services', '🚕', 82, TRUE),
('services', 'Motorcycle Taxi (Boda Boda)', 'boda-boda', 'Quick transportation and delivery', '🏍️', 83, TRUE),
('services', 'Tuk Tuk Services', 'tuk-tuk-services', 'Local transportation and courier', '🛺', 84, TRUE),

-- BUSINESS & PROFESSIONAL SERVICES (6 categories)
('services', 'Accountant / Bookkeeper', 'accountant-bookkeeper', 'Accounting, tax, financial management', '📊', 85, TRUE),
('services', 'Lawyer / Legal Consultant', 'lawyer-legal-consultant', 'Legal advice and representation', '⚖️', 86, TRUE),
('services', 'Marketing & Social Media Consultant', 'marketing-social-media', 'Digital marketing and social media strategy', '📱', 87, TRUE),
('services', 'Website Designer / Developer', 'website-designer-developer', 'Web design, development, e-commerce', '🌐', 88, TRUE),
('services', 'Graphic Designer', 'graphic-designer', 'Logo, branding, design services', '🎨', 89, TRUE),
('services', 'Virtual Assistant', 'virtual-assistant', 'Administrative and office support', '💻', 90, TRUE);

-- ========================================================
-- VERIFICATION (Should show 90 total categories)
-- ========================================================
SELECT 
  'VERIFICATION' as status,
  COUNT(*) as total_categories,
  COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active,
  COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive
FROM categories 
WHERE hub = 'services';
