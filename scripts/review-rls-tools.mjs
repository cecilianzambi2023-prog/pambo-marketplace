import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2];
const migrationPath = path.resolve('supabase/migrations/20260219_admin_only_review_delete.sql');

const verifyQuery = `SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'reviews'
ORDER BY policyname;`;

if (mode === 'show') {
  if (!fs.existsSync(migrationPath)) {
    console.error(`Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('--- Review RLS Migration SQL ---');
  console.log('Copy and run this SQL in Supabase SQL Editor:');
  console.log('');
  console.log(sql);
  console.log('');
  console.log('--- Verification Query ---');
  console.log(verifyQuery);
  process.exit(0);
}

if (mode === 'verify') {
  console.log('Run this query in Supabase SQL Editor to verify admin-only delete policy on reviews:');
  console.log('');
  console.log(verifyQuery);
  console.log('');
  console.log('Expected:');
  console.log('- A DELETE policy named "Admin can delete reviews"');
  console.log('- No buyer/author delete policy such as "reviews_delete_author_only"');
  process.exit(0);
}

console.log('Usage:');
console.log('  npm run db:review-rls:show');
console.log('  npm run db:review-rls:verify');
process.exit(1);
