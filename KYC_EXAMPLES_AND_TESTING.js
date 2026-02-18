/**
 * KYC System - Test & Usage Examples
 * Shows how to integrate and test the new seller verification system
 */

// ============================================
// EXAMPLE 1: Add KYC Form to Dashboard
// ============================================

import { SellerKYCForm } from './components/SellerKYCForm';
import { SellerVerificationBadge, TrustScoreMeter } from './components/SellerVerificationBadge';
import { AdminKYCQueue } from './components/AdminKYCQueue';

// In your Dashboard.tsx
const DashboardExample = ({ user }) => {
  const [showKYCForm, setShowKYCForm] = useState(false);

  return (
    <div className="dashboard">
      {/* Current seller status */}
      <div className="seller-status-card">
        <h2>Your Seller Profile</h2>
        
        {/* Show verification badge if verified */}
        {user.verified && (
          <SellerVerificationBadge
            seller_id={user.id}
            size="lg"
            avgRating={user.avgRating}
            responseTime={user.responseTime}
          />
        )}

        {/* Show trust score meter */}
        <TrustScoreMeter seller_id={user.id} size="md" />

        {/* Prompt to verify if not verified yet */}
        {!user.verified && (
          <button onClick={() => setShowKYCForm(true)}>
            📋 Complete Verification (Get Your Trust Badge!)
          </button>
        )}
      </div>

      {/* KYC Form Modal */}
      {showKYCForm && (
        <div className="modal">
          <SellerKYCForm
            seller_id={user.id}
            onClose={() => setShowKYCForm(false)}
            onSubmitSuccess={() => {
              setShowKYCForm(false);
              // Reload dashboard data
              loadSellerProfile();
            }}
          />
        </div>
      )}

      {/* Rest of dashboard... */}
    </div>
  );
};

// ============================================
// EXAMPLE 2: Display Badge on Product Listing
// ============================================

import { SellerVerificationBadge, VerificationBadgeSimple } from './components/SellerVerificationBadge';
import { Product, User as UserType } from './types';

/**
 * @typedef {Object} ProductCardExampleProps
 * @property {Product} product
 * @property {UserType} seller
 */

const ProductCardExample = ({ product, seller }) => {
  return (
    <div className="product-card">
      {/* Product image */}
      <img src={product.image} alt={product.title} />

      {/* Product title */}
      <h3>{product.title}</h3>

      {/* Seller info with verification badge */}
      <div className="seller-info">
        <div className="seller-header">
          <img src={seller.avatar} alt={seller.name} className="seller-avatar" />
          <div>
            <p className="seller-name">{seller.name}</p>
            
            {/* Add verification badge here */}
            <VerificationBadgeSimple seller_id={seller.id} />
          </div>
        </div>

        {/* Or use full badge with more detail */}
        <SellerVerificationBadge
          seller_id={seller.id}
          size="sm"
          avgRating={seller.avgRating}
        />
      </div>

      {/* Price and actions */}
      <div className="product-footer">
        <span className="price">{product.price} KES</span>
        <button>Buy Now</button>
      </div>
    </div>
  );
};

// ============================================
// EXAMPLE 3: Gate Listing Creation
// ============================================

import { canCreateListing } from './services/kycService';

const AddListingModalExample = ({ user, isOpen, onClose }) => {
  const [isVerified, setIsVerified] = useState(true);

  const handleCreateListing = async () => {
    // Check if seller is verified before allowing listing
    const verified = await canCreateListing(user.id);

    if (!verified) {
      alert(
        '⚠️ You must complete seller verification before creating listings.\n\nGo to Settings > Verification to get started!'
      );
      // Could also open KYC form here
      return;
    }

    // Proceed with listing creation
    submitListing();
  };

  return (
    <form onSubmit={handleCreateListing}>
      <h2>Create New Listing</h2>

      {/* Form fields... */}

      <button type="submit">
        {isVerified ? '📋 Create Listing' : '🔒 Verify First'}
      </button>
    </form>
  );
};

// ============================================
// EXAMPLE 4: Admin KYC Review Interface
// ============================================

const SuperAdminPanelExample = ({ user }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="admin-panel">
      {/* Tab navigation */}
      <div className="tabs">
        <button onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button onClick={() => setActiveTab('users')}>Users</button>
        <button onClick={() => setActiveTab('kyc-review')}>
          KYC Review Queue
        </button>
        <button onClick={() => setActiveTab('reports')}>Reports</button>
      </div>

      {/* Tab content */}
      {activeTab === 'kyc-review' && (
        <AdminKYCQueue adminId={user.id} />
      )}

      {/* Other tabs... */}
    </div>
  );
};

// ============================================
// EXAMPLE 5: Test the KYC Service Directly
// ============================================

import { getSellerKYCStatus, calculateTrustScore } from './services/kycService';

// Usage in tests or components:
async function testKYCService() {
  const sellerId = '123-abc-456';

  // Get KYC status
  const status = await getSellerKYCStatus(sellerId);
  console.log('KYC Status:', status);
  // Output:
  // {
  //   seller_id: '123-abc-456',
  //   verified: true,
  //   verified_documents_count: 2,
  //   documents: [ ... ],
  //   pending_review_count: 1,
  //   primary_document: { ... },
  //   trust_score: 65,
  //   verification_expiry: '2027-02-14'
  // }

  // Calculate trust score
  const score = await calculateTrustScore(sellerId);
  console.log('Trust Score:', score);
  // Output: 72

  // Check if seller can create listings
  const canCreate = await canCreateListing(sellerId);
  console.log('Can Create Listing:', canCreate);
  // Output: true (if verified)
}

// ============================================
// EXAMPLE 6: Upload Document Programmatically
// ============================================

import { uploadKYCDocument } from './services/kycService';

async function uploadDocumentExample(sellerId, file) {
  const result = await uploadKYCDocument(
    sellerId,
    file,
    'national_id', // document type
    '12345678', // document number
    '2020-01-15', // issued date
    '2025-01-15' // expiry date (optional)
  );

  if (result.success) {
    console.log('Document uploaded:', result.document);
    console.log(result.message);
    // Message: "Document uploaded successfully. Admin will review within 24-48 hours."
  } else {
    console.error('Upload failed:', result.error);
  }
}

// ============================================
// EXAMPLE 7: Admin Approval Flow
// ============================================

import { getPendingKYCDocuments, approveKYCDocument, rejectKYCDocument } from './services/kycService';

async function adminReviewProcess(adminId) {
  // Get all pending documents
  const pending = await getPendingKYCDocuments(20, 0);
  console.log(`Found ${pending.total} pending documents`);

  if (pending.documents.length > 0) {
    const doc = pending.documents[0];

    // Approve the first document
    const approveResult = await approveKYCDocument(doc.id, adminId, 'Document clearly visible');
    console.log('Approved:', approveResult.message);
    // Message: "Document approved! Seller will be notified."

    // Or reject with feedback
    const rejectResult = await rejectKYCDocument(
      doc.id,
      adminId,
      'Photo is blurry. Please upload a clearer image.'
    );
    console.log('Rejected:', rejectResult.message);
    // Message: "Document rejected. Seller can re-upload."
  }
}

// ============================================
// EXAMPLE 8: Display Seller Directory with Verification
// ============================================

const SellerDirectoryExample = ({ sellers }) => {
  return (
    <div className="seller-directory">
      <h1>Browse Verified Sellers</h1>

      <div className="seller-grid">
        {sellers.map(seller => (
          <div key={seller.id} className="seller-card">
            <img src={seller.avatar} alt={seller.name} />

            <h3>{seller.name}</h3>

            {/* Display verification badge with tooltip */}
            <SellerVerificationBadge
              seller_id={seller.id}
              size="md"
              showTooltip={true}
              avgRating={seller.ratings?.average || 0}
              responseTime={seller.metrics?.avgResponseTime || 0}
            />

            <p className="category">{seller.businessCategory}</p>

            <div className="contact-buttons">
              <button>💬 Contact</button>
              <button>📍 View Products</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// TESTING CHECKLIST
// ============================================

export const KYC_TESTING_CHECKLIST = `
SELLER FLOW:
  [ ] Login as seller
  [ ] Go to Dashboard - should see "Complete Verification" prompt
  [ ] Click button - KYC form opens
  [ ] Select document type (National ID)
  [ ] Upload clear JPG/PNG of ID
  [ ] Enter ID number and dates
  [ ] Submit - should show success message
  [ ] Refresh page - document appears in "Your Documents"
  [ ] Status shows "⏳ Pending Review"

ADMIN FLOW:
  [ ] Login as admin
  [ ] Go to Admin Panel > KYC Queue
  [ ] See seller's document in pending list
  [ ] Click to preview document image
  [ ] See seller info (name, phone, email)
  [ ] Click "Approve" button
  [ ] Document status changes to approved
  [ ] See success message

SELLER VERIFICATION:
  [ ] Switch back to seller account
  [ ] Refresh page - document now shows "✅ Approved"
  [ ] Go to profile - "Verified" badge appears
  [ ] Try creating listing - should work now
  [ ] Badge appears on listing card

BADGE DISPLAY:
  [ ] Verified badge shows on seller profile
  [ ] Subscription tier badge shows (bronze/silver/gold/platinum)
  [ ] Trust score displays (percentage)
  [ ] Hover tooltip shows details
  [ ] Rating stars display correctly
  [ ] Response time displays

MULTIPLE DOCUMENTS:
  [ ] Upload business permit (as seller)
  [ ] Upload tax certificate
  [ ] Admin approves both
  [ ] Seller profile shows 2 documents verified
  [ ] Details show all approved documents
  [ ] Trust score increases with more docs

REJECTION FLOW:
  [ ] Admin rejects a document
  [ ] Adds rejection reason
  [ ] Seller sees ❌ Rejected with reason
  [ ] Seller can re-upload
  [ ] After re-upload and approval, works

BUILD & DEPLOYMENT:
  [ ] npm run build - no errors
  [ ] Check for typescript errors
  [ ] All imports resolve correctly
  [ ] No console errors in browser dev tools
  [ ] Responsive design on mobile
  [ ] Works on Chrome, Firefox, Safari
`;

export default {
  DashboardExample,
  ProductCardExample,
  AddListingModalExample,
  SuperAdminPanelExample,
  SellerDirectoryExample,
};
