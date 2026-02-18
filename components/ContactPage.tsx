import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, X } from 'lucide-react';
import { PLATFORM_CONFIG } from '../constants';

interface ContactPageProps {
  onClose?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to your backend
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 lg:px-8 relative">
          <h1 className="text-4xl font-bold mb-4">Get In Touch</h1>
          <p className="text-gray-400 text-lg">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
              title="Close"
            >
              <X size={28} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          
          {/* Contact Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            
            <div className="flex gap-4">
              <div className="bg-orange-100 p-4 rounded-lg h-fit">
                <Mail className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600">info@pambo.biz</p>
                <p className="text-gray-600">support@pambo.biz</p>
                <p className="text-sm text-gray-500 mt-1">We typically respond within 24 hours</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-orange-100 p-4 rounded-lg h-fit">
                <MapPin className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600">Nairobi, Kenya</p>
                <p className="text-gray-600">{PLATFORM_CONFIG.companyName}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="bg-orange-100 p-4 rounded-lg h-fit">
                <Phone className="text-orange-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">WhatsApp Business: Available 9 AM - 6 PM EAT</p>
                <p className="text-gray-600">Email is preferred for detailed inquiries</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gray-100 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Support Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                    → Help Center & FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                    → Seller Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                    → Report an Issue
                  </a>
                </li>
                <li>
                  <a href="#" className="text-orange-600 hover:text-orange-700 font-medium">
                    → Payment Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-8 rounded-lg text-center">
                <p className="font-semibold mb-2">✓ Message Received!</p>
                <p className="text-sm">Thank you for contacting us. We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="How can we help?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    placeholder="Please describe your inquiry in detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white font-bold py-3 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Send size={20} />
                  Send Message
                </button>

                <p className="text-xs text-gray-500 text-center">
                  We respect your privacy. Your information will only be used to respond to your inquiry.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
