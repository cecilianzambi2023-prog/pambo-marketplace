/**
 * 01_create_categories_table.sql
 * ==============================
 * 
 * Creates the categories table for ALL hubs (marketplace, mkulima, digital, services, wholesale, live_commerce).
 * This is a single, scalable table that grows with your platform.
 * 
 * ARCHITECTURE:
 * - hub field: which hub owns these categories
 * - slug: URL-safe unique identifier per hub (e.g., /services/plumber)
 * - One table, multiple hubs, no duplication
 * - Supports growth from 50 to 500+ categories
 */

-- ========================================================
-- CREATE CATEGORIES TABLE
-- ========================================================

CREATE TABLE categories (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hub Association (must be valid hub)
  hub TEXT NOT NULL CHECK (hub IN ('marketplace', 'wholesale', 'digital', 'mkulima', 'services', 'live_commerce')),
  
  -- Category Identity
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,  -- emoji or icon code (e.g., "🚰" for plumber)
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: slug must be unique within each hub
  CONSTRAINT unique_slug_per_hub UNIQUE (hub, slug)
);

-- ========================================================
-- INDEXES (CRITICAL FOR PERFORMANCE)
-- ========================================================

-- Fast lookup: "get all categories for services hub"
CREATE INDEX idx_categories_hub ON categories(hub) WHERE is_active = TRUE;

-- Fast lookup: "get category by slug" (e.g., /services/plumber)
CREATE INDEX idx_categories_hub_slug ON categories(hub, slug) WHERE is_active = TRUE;

-- Fast lookup: when filtering listings by category
CREATE INDEX idx_categories_sort ON categories(hub, sort_order, is_active);

-- ========================================================
-- SEED DATA: 40+ SERVICE CATEGORIES
-- ========================================================

INSERT INTO categories (hub, name, slug, description, icon, sort_order) VALUES
-- CORE TRADES & FUNDIS (15 categories)
('services', 'Plumber', 'plumber', 'Pipe installation, repair, maintenance', '🚰', 1),
('services', 'Electrician', 'electrician', 'Electrical installation, repair, wiring', '⚡', 2),
('services', 'Carpenter', 'carpenter', 'Furniture, doors, shelving, custom woodwork', '🪚', 3),
('services', 'Mason', 'mason', 'Brickwork, concrete, foundation, plastering', '🧱', 4),
('services', 'Welder / Fabricator', 'welder-fabricator', 'Metal welding, gates, grills, structures', '🔥', 5),
('services', 'Painter', 'painter', 'Interior/exterior painting, wall finishing', '🎨', 6),
('services', 'Tiler', 'tiler', 'Floor and wall tiling installation', '⬜', 7),
('services', 'Gypsum & Ceiling Installer', 'gypsum-ceiling', 'False ceiling, plasterboard installation', '🏢', 8),
('services', 'Glass & Aluminium Fabricator', 'glass-aluminium', 'Windows, doors, partitions', '🪟', 9),
('services', 'Roofing Specialist', 'roofing', 'Roof installation, repair, maintenance', '🏠', 10),
('services', 'Waterproofing Specialist', 'waterproofing', 'Basement, roof, wall waterproofing', '💧', 11),
('services', 'Borehole Drilling', 'borehole-drilling', 'Water well drilling and maintenance', '🕳️', 12),
('services', 'Solar Installer', 'solar-installer', 'Solar panels, inverters, batteries', '☀️', 13),
('services', 'CCTV Installer', 'cctv-installer', 'Security camera systems installation', '📹', 14),
('services', 'Gate & Grill Fabricator', 'gate-grill', 'Custom gates, grills, steel work', '🔒', 15),

-- HOME, OFFICE & FACILITY SERVICES (11 categories)
('services', 'Interior Designer', 'interior-designer', 'Space planning and design consultation', '✨', 16),
('services', 'Architect', 'architect', 'Building design, plans, consultations', '📐', 17),
('services', 'Quantity Surveyor', 'quantity-surveyor', 'Cost estimation and project budgeting', '📊', 18),
('services', 'Construction Supervisor', 'construction-supervisor', 'Project oversight and quality control', '👷', 19),
('services', 'Facility Manager', 'facility-manager', 'Building maintenance and operations', '🔐', 20),
('services', 'Property Valuer', 'property-valuer', 'Property appraisal and market assessment', '💰', 21),
('services', 'Real Estate Agent', 'real-estate-agent', 'Property buying, selling, leasing', '🔑', 22),
('services', 'Moving Services', 'moving-services', 'Packing, transportation, relocation', '🚚', 23),
('services', 'Cleaning Services', 'cleaning-services', 'Home and office cleaning and maintenance', '🧹', 24),
('services', 'Pest Control', 'pest-control', 'Termites, insects, rodent control', '🐀', 25),
('services', 'Garbage Collection', 'garbage-collection', 'Waste management and disposal', '♻️', 26),

-- TECHNICAL & APPLIANCE SERVICES (7 categories)
('services', 'Air Conditioning Technician', 'ac-technician', 'AC installation, repair, maintenance', '❄️', 27),
('services', 'Refrigerator Repair', 'refrigerator-repair', 'Fridge repair and maintenance', '🧊', 28),
('services', 'Washing Machine Repair', 'washing-machine-repair', 'Washing machine repair and servicing', '🧺', 29),
('services', 'Generator Repair', 'generator-repair', 'Generator repair, servicing, maintenance', '⚙️', 30),
('services', 'Internet & Wi-Fi Installer', 'internet-wifi-installer', 'Internet setup and Wi-Fi installation', '📡', 31),
('services', 'Computer Repair & IT Support', 'computer-repair-it', 'PC repair, laptop fix, IT support', '💻', 32),
('services', 'Mobile Phone Repair', 'mobile-phone-repair', 'Phone screen, battery, water damage repair', '📱', 33),

-- OUTDOOR, RURAL & MASHAMBANI SERVICES (7 categories)
('services', 'Landscaping & Gardening', 'landscaping-gardening', 'Garden design, lawn care, landscaping', '🌱', 34),
('services', 'Fencing Services', 'fencing-services', 'Fence installation, repair, gates', '🚧', 35),
('services', 'Irrigation Installer', 'irrigation-installer', 'Irrigation systems, drip lines, sprinklers', '💦', 36),
('services', 'Farm Equipment Repair', 'farm-equipment-repair', 'Tractor, engine, agricultural equipment repair', '🚜', 37),
('services', 'Agro-Vet Technician', 'agro-vet-technician', 'Livestock health, vaccination services', '🐄', 38),
('services', 'Greenhouse Construction', 'greenhouse-construction', 'Greenhouse design, construction, setup', '🌾', 39),
('services', 'Water Tank Installation', 'water-tank-installation', 'Water tank supply and installation', '🪣', 40),

-- EVENTS & SPECIAL SERVICES (4 categories)
('services', 'Event Setup & Tents', 'event-setup-tents', 'Tent rental, event setup, decoration', '⛺', 41),
('services', 'Sound & Lighting Services', 'sound-lighting-services', 'Event sound systems and stage lighting', '🎤', 42),
('services', 'Photography & Videography', 'photography-videography', 'Event photos, videos, editing', '📸', 43),
('services', 'Security Services', 'security-services', 'Guards, alarm systems, monitoring', '👮', 44);

-- ========================================================
-- TOTAL: 44 SERVICE CATEGORIES SEEDED
-- ========================================================

-- Verify insertion
SELECT COUNT(*) as total_categories FROM categories WHERE hub = 'services' AND is_active = TRUE;
-- Expected: 44

-- Example queries that will be fast:
-- Get all services categories: SELECT * FROM categories WHERE hub = 'services' ORDER BY sort_order;
-- Get category by slug: SELECT * FROM categories WHERE hub = 'services' AND slug = 'plumber';
-- Get sorted for UI: SELECT id, name, slug, icon FROM categories WHERE hub = 'services' AND is_active = TRUE ORDER BY sort_order;
