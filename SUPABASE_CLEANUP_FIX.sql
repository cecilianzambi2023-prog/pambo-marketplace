/**
 * SUPABASE CLEANUP & FIX SCRIPT
 * =============================
 * 
 * Run this in Supabase SQL Editor to:
 * 1. Remove duplicate/conflicting service categories
 * 2. Fresh seed all 44 categories
 * 3. Ensure proper table structure
 */

-- ========================================================
-- STEP 1: DELETE OLD SERVICE CATEGORIES (cleanup)
-- ========================================================
DELETE FROM categories WHERE hub = 'services';

-- ========================================================
-- STEP 2: FRESH SEED - ALL 44 SERVICE CATEGORIES
-- ========================================================
INSERT INTO categories (hub, name, slug, description, icon, sort_order, is_active) VALUES
-- CORE TRADES & FUNDIS (15)
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

-- HOME, OFFICE & FACILITY SERVICES (11)
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

-- TECHNICAL & APPLIANCE SERVICES (7)
('services', 'Air Conditioning Technician', 'ac-technician', 'AC installation, repair, maintenance', '❄️', 27, TRUE),
('services', 'Refrigerator Repair', 'refrigerator-repair', 'Fridge repair and maintenance', '🧊', 28, TRUE),
('services', 'Washing Machine Repair', 'washing-machine-repair', 'Washing machine repair and servicing', '🧺', 29, TRUE),
('services', 'Generator Repair', 'generator-repair', 'Generator repair, servicing, maintenance', '⚙️', 30, TRUE),
('services', 'Internet & Wi-Fi Installer', 'internet-wifi-installer', 'Internet setup and Wi-Fi installation', '📡', 31, TRUE),
('services', 'Computer Repair & IT Support', 'computer-repair-it', 'PC repair, laptop fix, IT support', '💻', 32, TRUE),
('services', 'Mobile Phone Repair', 'mobile-phone-repair', 'Phone screen, battery, water damage repair', '📱', 33, TRUE),

-- OUTDOOR, RURAL & MASHAMBANI SERVICES (7)
('services', 'Landscaping & Gardening', 'landscaping-gardening', 'Garden design, lawn care, landscaping', '🌱', 34, TRUE),
('services', 'Fencing Services', 'fencing-services', 'Fence installation, repair, gates', '🚧', 35, TRUE),
('services', 'Irrigation Installer', 'irrigation-installer', 'Irrigation systems, drip lines, sprinklers', '💦', 36, TRUE),
('services', 'Farm Equipment Repair', 'farm-equipment-repair', 'Tractor, engine, agricultural equipment repair', '🚜', 37, TRUE),
('services', 'Agro-Vet Technician', 'agro-vet-technician', 'Livestock health, vaccination services', '🐄', 38, TRUE),
('services', 'Greenhouse Construction', 'greenhouse-construction', 'Greenhouse design, construction, setup', '🌾', 39, TRUE),
('services', 'Water Tank Installation', 'water-tank-installation', 'Water tank supply and installation', '🪣', 40, TRUE),

-- EVENTS & SPECIAL SERVICES (4)
('services', 'Event Setup & Tents', 'event-setup-tents', 'Tent rental, event setup, decoration', '⛺', 41, TRUE),
('services', 'Sound & Lighting Services', 'sound-lighting-services', 'Event sound systems and stage lighting', '🎤', 42, TRUE),
('services', 'Photography & Videography', 'photography-videography', 'Event photos, videos, editing', '📸', 43, TRUE),
('services', 'Security Services', 'security-services', 'Guards, alarm systems, monitoring', '👮', 44, TRUE);

-- ========================================================
-- STEP 3: VERIFICATION
-- ========================================================
-- Check how many categories were inserted
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active,
  COUNT(CASE WHEN is_active = FALSE THEN 1 END) as inactive
FROM categories 
WHERE hub = 'services';

-- Show all categories (should be 44)
SELECT id, name, slug, icon, sort_order, is_active 
FROM categories 
WHERE hub = 'services' 
ORDER BY sort_order;
