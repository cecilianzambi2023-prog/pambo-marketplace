import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface CookiePolicyProps {
  onClose?: () => void;
}

export const CookiePolicy: React.FC<CookiePolicyProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-8 sticky top-0 z-10">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-4 mb-4">
            {onClose && (
              <button onClick={onClose} className="hover:bg-gray-800 p-2 rounded-lg transition">
                <ArrowLeft size={24} />
              </button>
            )}
            <h1 className="text-3xl font-bold">Cookie Policy</h1>
          </div>
          <p className="text-gray-400">Last Updated: February 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <div className="space-y-8 text-gray-700">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small files placed on your device by websites you visit. They are widely used to make 
              websites work more efficiently as well as to provide information to the owners of the site. Cookies 
              allow web applications to respond to you as an individual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
            <p className="leading-relaxed mb-3">
              Pambo uses cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Authentication:</strong> To keep you logged in to your account</li>
              <li><strong>Preferences:</strong> To remember your settings and preferences</li>
              <li><strong>Analytics:</strong> To understand how visitors use our platform</li>
              <li><strong>Security:</strong> To prevent fraudulent activities</li>
              <li><strong>Performance:</strong> To optimize website performance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Session Cookies:</h3>
                <p className="leading-relaxed">
                  These are temporary cookies that are deleted when you close your browser. They are used to 
                  maintain your session while you're using Pambo.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Persistent Cookies:</h3>
                <p className="leading-relaxed">
                  These cookies remain on your device for a set period or until you delete them. They help us 
                  recognize you when you return to Pambo.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Third-Party Cookies:</h3>
                <p className="leading-relaxed">
                  These are set by third-party services we use for analytics and advertising purposes.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Your Cookie Choices</h2>
            <p className="leading-relaxed mb-3">
              Most browsers allow you to control cookies through their settings. You can usually:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>View what cookies you have on your device</li>
              <li>Delete cookies from your computer</li>
              <li>Prevent websites from placing cookies on your device</li>
            </ul>
            <p className="leading-relaxed mt-4 text-sm text-gray-600">
              Please note that disabling cookies may affect the functionality of Pambo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <p className="font-semibold">Offspring Decor Limited</p>
              <p>Nairobi, Kenya</p>
              <p>Email: info@pambo.biz</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
