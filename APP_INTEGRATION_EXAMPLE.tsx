// EXAMPLE APP.TSX INTEGRATION
// ===========================
// This shows how to add PricingPage to your main App component

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // or your auth provider
import { PricingPage } from './components/PricingPage';
import { Dashboard } from './components/Dashboard';
import { Marketplace } from './components/Marketplace';
import { AuthModal } from './components/AuthModal';
import { Navigation } from './components/Navigation'; // your header/nav component
import { Footer } from './components/Footer';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  
  if (!session) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Public page wrapper
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navigation />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

// App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          
          {/* Pricing Page - Public, No Auth Required */}
          <Route
            path="/pricing"
            element={
              <PublicLayout>
                <PricingPage />
              </PublicLayout>
            }
          />
          
          {/* Authentication Routes */}
          <Route path="/auth" element={<AuthModal />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PublicLayout>
                  <Dashboard />
                </PublicLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <PublicLayout>
                  <Marketplace />
                </PublicLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

// Home page component (example)
const Home: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Offspring Decor Limited
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            The all-in-one 6-in-1 marketplace for African traders, farmers & entrepreneurs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/pricing"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              View Plans
            </a>
            <a
              href="/auth"
              className="border-2 border-green-600 text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-green-50 transition"
            >
              Sign Up
            </a>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          <FeatureCard
            icon="🏪"
            title="Marketplace Hub"
            description="Buy and sell anything from household items to fresh produce"
          />
          <FeatureCard
            icon="🌾"
            title="Mkulima Hub"
            description="Special farmer-focused hub with subsidized pricing"
          />
          <FeatureCard
            icon="💬"
            title="Live Commerce"
            description="Stream your products live and sell in real-time"
          />
          <FeatureCard
            icon="🏭"
            title="Wholesale Hub"
            description="Bulk buying and selling for businesses"
          />
          <FeatureCard
            icon="🎨"
            title="Digital Hub"
            description="Sell digital products and services"
          />
          <FeatureCard
            icon="🛠️"
            title="Service Hub"
            description="Offer and find professional services"
          />
        </div>
      </div>
    </div>
  );
};

// Feature card component (example)
const FeatureCard: React.FC<{
  icon: string;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default App;
