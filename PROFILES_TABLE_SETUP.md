# 🗄️ Profiles Table Schema & Setup

Complete SQL schema for your `profiles` table in Supabase with all necessary fields.

---

## 📊 Create Profiles Table

Copy and paste this into your Supabase SQL Editor:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  avatar TEXT,
  role VARCHAR(50) DEFAULT 'buyer',
  verified BOOLEAN DEFAULT false,
  accountStatus VARCHAR(50) DEFAULT 'active',
  joinDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bio TEXT,
  following UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Additional seller fields
  isSeller BOOLEAN DEFAULT false,
  businessName VARCHAR(255),
  businessType VARCHAR(50),
  businessCategory VARCHAR(100),
  nationalId VARCHAR(100),
  
  -- Subscription tracking
  subscriptionExpiry BIGINT DEFAULT NULL,
  
  -- Profile completeness
  profileComplete BOOLEAN DEFAULT false,
  
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_verified ON profiles(verified);
CREATE INDEX idx_profiles_accountStatus ON profiles(accountStatus);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_isSeller ON profiles(isSeller);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read their own profile
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Service role can do anything
CREATE POLICY "Service role access"
  ON profiles
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🔄 Migration: Move Existing Data from users to profiles

If you have data in an old `users` table, run this migration:

```sql
-- Backup old data (optional but recommended)
CREATE TABLE users_backup AS SELECT * FROM users;

-- Insert data from users to profiles
INSERT INTO profiles (
  id, email, full_name, phone_number, avatar, role, verified, 
  accountStatus, joinDate, bio, following, isSeller, 
  businessName, businessType, businessCategory, nationalId, subscriptionExpiry
)
SELECT 
  id, email, name, phone, avatar, role, verified, 
  accountStatus, joinDate, bio, following, isSeller, 
  businessName, businessType, businessCategory, nationalId, subscriptionExpiry
FROM users
ON CONFLICT (id) DO NOTHING;

-- Drop old users table once confirmed everything works
-- DROP TABLE users;
```

---

## 👤 Create Admin User

Create an admin account after setting up the profiles table:

```sql
-- First create auth user via Supabase Dashboard:
-- Go to Authentication → Users → Add new user
-- Email: admin@offspring.com
-- Password: [strong password]

-- Then insert matching profile record:
INSERT INTO profiles (
  id, 
  email, 
  full_name, 
  phone_number,
  role, 
  verified, 
  accountStatus,
  isSeller,
  profileComplete
)
VALUES (
  'YOUR_AUTH_USER_ID_HERE',  -- Copy the ID from Auth Users table
  'admin@offspring.com',
  'Admin User',
  '+254123456789',
  'admin',
  true,
  'active',
  false,
  true
);
```

---

## 🧪 Verify Setup

Run these queries to verify your profiles table is set up correctly:

```sql
-- Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'profiles';

-- Check row count
SELECT COUNT(*) as total_profiles FROM profiles;

-- Check admin user exists
SELECT id, email, role, verified FROM profiles WHERE role = 'admin';
```

---

## 🔑 Field Reference

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | UUID | - | Primary key (links to auth.users.id) |
| `email` | VARCHAR(255) | - | User email (unique) |
| `full_name` | VARCHAR(255) | - | User's full name |
| `phone_number` | VARCHAR(20) | - | Phone number for contact |
| `avatar` | TEXT | - | URL to profile picture |
| `role` | VARCHAR(50) | 'buyer' | User role (buyer, seller, admin, etc.) |
| `verified` | BOOLEAN | false | Email/identity verification status |
| `accountStatus` | VARCHAR(50) | 'active' | Account state (active, suspended, pending) |
| `joinDate` | TIMESTAMP | NOW() | Account creation date |
| `bio` | TEXT | - | User biography |
| `following` | UUID[] | '{}' | Array of seller IDs user follows |
| `isSeller` | BOOLEAN | false | Whether user is a seller |
| `businessName` | VARCHAR(255) | - | Seller's business name |
| `businessType` | VARCHAR(50) | - | Sole trader or registered business |
| `businessCategory` | VARCHAR(100) | - | Business category (agriculture, retail, etc.) |
| `nationalId` | VARCHAR(100) | - | National ID number |
| `subscriptionExpiry` | BIGINT | NULL | Subscription expiry timestamp |
| `profileComplete` | BOOLEAN | false | Whether profile setup is complete |
| `created_at` | TIMESTAMP | NOW() | Record creation time |
| `updated_at` | TIMESTAMP | NOW() | Last update time |

---

## 📝 Notes

1. **Field Naming**: The profiles table uses snake_case (`full_name`, `phone_number`, `account_status`)
2. **Auth Integration**: The `id` field is a foreign key to `auth.users(id)`
3. **Cascading Delete**: If user is deleted from auth, profile is auto-deleted
4. **RLS Enabled**: Row Level Security policies protect user data
5. **Auto-timestamps**: `updated_at` automatically updates on any change

---

## ✅ Post-Setup Checklist

- [ ] Create profiles table using SQL above
- [ ] (Optional) Migrate data from existing users table
- [ ] Create admin user
- [ ] Run verification queries
- [ ] Test signup flow (creates profile automatically)
- [ ] Test admin login (accesses `/admin`)
- [ ] Test user blocking (Block button in Users tab)
- [ ] Test seller verification (Approve/Reject in Verification tab)

Your database is now ready! Users created via signup will automatically have profiles inserted into this table.
