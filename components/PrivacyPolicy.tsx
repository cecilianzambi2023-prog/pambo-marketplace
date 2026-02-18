import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose?: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
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
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-gray-400">Last Updated: February 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
        <div className="space-y-8 text-gray-700">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Offspring Decor Limited ("we", "us", "our") operates the Pambo platform. This page informs you of our 
              policies regarding the collection, use, and disclosure of personal data when you use our service and 
              the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information Collection and Use</h2>
            <p className="leading-relaxed mb-4">
              We collect several different types of information for various purposes to improve our service to you:
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Personal Data:</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address</li>
                  <li>First and last name</li>
                  <li>Phone number</li>
                  <li>Address, state, province, postal code, city</li>
                  <li>Cookies and usage data</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Use of Data</h2>
            <p className="leading-relaxed mb-3">
              Pambo uses the collected data for various purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>For customer support and issue resolution</li>
              <li>To gather analysis or valuable information to improve our service</li>
              <li>To process transactions and send related information</li>
              <li>To send promotional emails (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Security of Data</h2>
            <p className="leading-relaxed">
              The security of your data is important to us but remember that no method of transmission over the 
              Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable 
              means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Change Links</h2>
            <p className="leading-relaxed">
              Our service may contain links to other sites that are not operated by us. If you click on a third party 
              link, you will be directed to that third party's site. We strongly advise you to review the Privacy 
              Policy of every site you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Children's Privacy</h2>
            <p className="leading-relaxed">
              Pambo does not knowingly collect personally identifiable information from anyone under the age of 18. 
              If we become aware that a child under 18 has provided us with personal data, we immediately delete such 
              information and terminate the child's account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Changes to This Privacy Policy</h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
              new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
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
