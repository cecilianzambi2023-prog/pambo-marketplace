/**
 * ServicesHubPage.tsx
 * ====================
 * Services Hub Landing & Category Explorer
 *
 * Displays all available service categories organized in 4 main groups:
 * 1. Core Trades & Fundis (Plumber, Electrician, etc.)
 * 2. Home, Office & Facility Services
 * 3. Technical & Appliance Services
 * 4. Outdoor, Rural & Mashambani Services
 * 5. Events & Special Services
 *
 * Features:
 * - Service category browsing
 * - Quick service search
 * - Category filtering
 * - Service provider lookup
 * - "Find Service" and "Offer Service" CTAs
 */

import React, { useState } from 'react';
import { useHub, useHubBranding, useHubFeatures } from '../contexts/HubContext';
import { Search, MapPin, Star, TrendingUp, Clock, MessageSquare } from 'lucide-react';

// ============================================================
// SERVICE TYPES
// ============================================================

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  averagePrice?: string;
  demandLevel: 'high' | 'medium' | 'low';
  availableProviders?: number;
  estimatedDuration?: string;
}

interface ServiceGroup {
  title: string;
  description: string;
  color: string;
  icon: string;
  services: ServiceCategory[];
}

// ============================================================
// SERVICE DATA
// ============================================================

const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: '🛠️ Core Trades & Fundis',
    description: 'High-demand skilled trades and construction work',
    color: '#F59E0B', // Amber
    icon: '🔧',
    services: [
      {
        id: 'plumber',
        name: 'Plumber',
        description: 'Pipe installation, repair, maintenance',
        icon: '🚰',
        demandLevel: 'high',
        availableProviders: 1240,
        averagePrice: '1,500 - 5,000 KES',
        estimatedDuration: '1-4 hours'
      },
      {
        id: 'electrician',
        name: 'Electrician',
        description: 'Electrical installation, repair, wiring',
        icon: '⚡',
        demandLevel: 'high',
        availableProviders: 1890,
        averagePrice: '2,000 - 8,000 KES',
        estimatedDuration: '1-8 hours'
      },
      {
        id: 'carpenter',
        name: 'Carpenter',
        description: 'Furniture, doors, shelving, custom woodwork',
        icon: '🪚',
        demandLevel: 'high',
        availableProviders: 2100,
        averagePrice: '2,500 - 10,000 KES',
        estimatedDuration: '4-24 hours'
      },
      {
        id: 'mason',
        name: 'Mason',
        description: 'Brickwork, concrete, foundation, plastering',
        icon: '🧱',
        demandLevel: 'high',
        availableProviders: 1650,
        averagePrice: '3,000 - 15,000 KES',
        estimatedDuration: '8-40 hours'
      },
      {
        id: 'welder',
        name: 'Welder / Fabricator',
        description: 'Metal welding, gates, grills, structures',
        icon: '🔥',
        demandLevel: 'high',
        availableProviders: 890,
        averagePrice: '5,000 - 20,000 KES',
        estimatedDuration: '4-24 hours'
      },
      {
        id: 'painter',
        name: 'Painter',
        description: 'Interior/exterior painting, wall finishing',
        icon: '🎨',
        demandLevel: 'high',
        availableProviders: 1520,
        averagePrice: '2,000 - 8,000 KES',
        estimatedDuration: '4-16 hours'
      },
      {
        id: 'tiler',
        name: 'Tiler',
        description: 'Floor and wall tiling installation',
        icon: '⬜',
        demandLevel: 'high',
        availableProviders: 780,
        averagePrice: '3,000 - 12,000 KES',
        estimatedDuration: '8-32 hours'
      },
      {
        id: 'gypsum',
        name: 'Gypsum & Ceiling Installer',
        description: 'False ceiling, plasterboard installation',
        icon: '🏢',
        demandLevel: 'medium',
        availableProviders: 450,
        averagePrice: '4,000 - 15,000 KES',
        estimatedDuration: '8-40 hours'
      },
      {
        id: 'glass-aluminium',
        name: 'Glass & Aluminium Fabricator',
        description: 'Windows, doors, partitions in glass/aluminum',
        icon: '🪟',
        demandLevel: 'medium',
        availableProviders: 340,
        averagePrice: '10,000 - 50,000 KES',
        estimatedDuration: '4-24 hours'
      },
      {
        id: 'roofing',
        name: 'Roofing Specialist',
        description: 'Roof installation, repair, maintenance',
        icon: '🏠',
        demandLevel: 'high',
        availableProviders: 620,
        averagePrice: '8,000 - 40,000 KES',
        estimatedDuration: '8-40 hours'
      },
      {
        id: 'waterproofing',
        name: 'Waterproofing Specialist',
        description: 'Basement, roof, wall waterproofing',
        icon: '💧',
        demandLevel: 'medium',
        availableProviders: 280,
        averagePrice: '6,000 - 25,000 KES',
        estimatedDuration: '8-24 hours'
      },
      {
        id: 'borehole',
        name: 'Borehole Drilling Services',
        description: 'Water well drilling, maintenance',
        icon: '🕳️',
        demandLevel: 'medium',
        availableProviders: 150,
        averagePrice: '20,000 - 100,000 KES',
        estimatedDuration: '1-3 days'
      },
      {
        id: 'solar',
        name: 'Solar Installer',
        description: 'Solar panels, inverters, batteries',
        icon: '☀️',
        demandLevel: 'high',
        availableProviders: 420,
        averagePrice: '50,000 - 500,000 KES',
        estimatedDuration: '1-5 days'
      },
      {
        id: 'cctv',
        name: 'CCTV Installer',
        description: 'Security camera systems installation',
        icon: '📹',
        demandLevel: 'medium',
        availableProviders: 380,
        averagePrice: '15,000 - 60,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'gate-grill',
        name: 'Gate & Grill Fabricator',
        description: 'Custom gates, grills, steel work',
        icon: '🔒',
        demandLevel: 'high',
        availableProviders: 560,
        averagePrice: '8,000 - 40,000 KES',
        estimatedDuration: '8-24 hours'
      }
    ]
  },
  {
    title: '🏠 Home, Office & Facility Services',
    description: 'Professional services for buildings and spaces',
    color: '#8B5CF6', // Purple
    icon: '🏢',
    services: [
      {
        id: 'interior-designer',
        name: 'Interior Designer',
        description: 'Space planning, design consultation',
        icon: '✨',
        demandLevel: 'medium',
        availableProviders: 320,
        averagePrice: '10,000 - 50,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'architect',
        name: 'Architect',
        description: 'Building design, plans, consultations',
        icon: '📐',
        demandLevel: 'medium',
        availableProviders: 180,
        averagePrice: '50,000 - 200,000 KES',
        estimatedDuration: '24-72 hours'
      },
      {
        id: 'quantity-surveyor',
        name: 'Quantity Surveyor',
        description: 'Cost estimation, project budgeting',
        icon: '📊',
        demandLevel: 'low',
        availableProviders: 95,
        averagePrice: '30,000 - 100,000 KES',
        estimatedDuration: '8-24 hours'
      },
      {
        id: 'construction-supervisor',
        name: 'Construction Supervisor',
        description: 'Project oversight, quality control',
        icon: '👷',
        demandLevel: 'medium',
        availableProviders: 210,
        averagePrice: '5,000 - 15,000 KES/day',
        estimatedDuration: 'Ongoing'
      },
      {
        id: 'facility-manager',
        name: 'Facility Manager',
        description: 'Building maintenance & operations',
        icon: '🔐',
        demandLevel: 'medium',
        availableProviders: 140,
        averagePrice: '10,000 - 30,000 KES/month',
        estimatedDuration: 'Ongoing'
      },
      {
        id: 'property-valuer',
        name: 'Property Valuer',
        description: 'Property appraisal, market assessment',
        icon: '💰',
        demandLevel: 'low',
        availableProviders: 85,
        averagePrice: '20,000 - 80,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'real-estate-agent',
        name: 'Real Estate Agent',
        description: 'Property buying, selling, leasing',
        icon: '🔑',
        demandLevel: 'high',
        availableProviders: 2400,
        averagePrice: 'Commission based',
        estimatedDuration: 'Ongoing'
      },
      {
        id: 'moving-services',
        name: 'Moving Services',
        description: 'Packing, transportation, relocation',
        icon: '🚚',
        demandLevel: 'high',
        availableProviders: 890,
        averagePrice: '10,000 - 50,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'cleaning',
        name: 'Cleaning Services',
        description: 'Home & office cleaning, maintenance',
        icon: '🧹',
        demandLevel: 'high',
        availableProviders: 3200,
        averagePrice: '2,000 - 10,000 KES',
        estimatedDuration: '2-6 hours'
      },
      {
        id: 'pest-control',
        name: 'Pest Control Services',
        description: 'Termites, insects, rodent control',
        icon: '🐀',
        demandLevel: 'high',
        availableProviders: 620,
        averagePrice: '3,000 - 15,000 KES',
        estimatedDuration: '2-4 hours'
      },
      {
        id: 'garbage-collection',
        name: 'Garbage Collection Services',
        description: 'Waste management, disposal',
        icon: '♻️',
        demandLevel: 'high',
        availableProviders: 440,
        averagePrice: '500 - 2,000 KES/month',
        estimatedDuration: 'Recurring'
      }
    ]
  },
  {
    title: '🔌 Technical & Appliance Services',
    description: 'Electronics and equipment repair',
    color: '#06B6D4', // Cyan
    icon: '🔧',
    services: [
      {
        id: 'ac-technician',
        name: 'Air Conditioning Technician',
        description: 'AC installation, repair, maintenance',
        icon: '❄️',
        demandLevel: 'high',
        availableProviders: 780,
        averagePrice: '3,000 - 12,000 KES',
        estimatedDuration: '2-4 hours'
      },
      {
        id: 'refrigerator-repair',
        name: 'Refrigerator Repair',
        description: 'Fridge repair and maintenance',
        icon: '🧊',
        demandLevel: 'medium',
        availableProviders: 420,
        averagePrice: '2,000 - 8,000 KES',
        estimatedDuration: '1-3 hours'
      },
      {
        id: 'washing-machine',
        name: 'Washing Machine Repair',
        description: 'Washing machine repair & servicing',
        icon: '🧺',
        demandLevel: 'medium',
        availableProviders: 510,
        averagePrice: '2,000 - 8,000 KES',
        estimatedDuration: '1-3 hours'
      },
      {
        id: 'generator-repair',
        name: 'Generator Repair',
        description: 'Generator repair, servicing, maintenance',
        icon: '⚙️',
        demandLevel: 'medium',
        availableProviders: 340,
        averagePrice: '3,000 - 15,000 KES',
        estimatedDuration: '2-4 hours'
      },
      {
        id: 'internet-wifi',
        name: 'Internet & Wi-Fi Installer',
        description: 'Internet setup, Wi-Fi installation',
        icon: '📡',
        demandLevel: 'medium',
        availableProviders: 620,
        averagePrice: '2,000 - 5,000 KES',
        estimatedDuration: '1-3 hours'
      },
      {
        id: 'computer-repair',
        name: 'Computer Repair & IT Support',
        description: 'PC repair, laptop fix, IT support',
        icon: '💻',
        demandLevel: 'high',
        availableProviders: 1420,
        averagePrice: '2,000 - 10,000 KES',
        estimatedDuration: '1-2 hours'
      },
      {
        id: 'phone-repair',
        name: 'Mobile Phone Repair',
        description: 'Phone screen, battery, water damage repair',
        icon: '📱',
        demandLevel: 'high',
        availableProviders: 2100,
        averagePrice: '1,000 - 8,000 KES',
        estimatedDuration: '30 min - 2 hrs'
      }
    ]
  },
  {
    title: '🌿 Outdoor, Rural & Mashambani Services',
    description: 'Agricultural and rural property services',
    color: '#10B981', // Emerald
    icon: '🚜',
    services: [
      {
        id: 'landscaping',
        name: 'Landscaping & Gardening',
        description: 'Garden design, lawn care, landscaping',
        icon: '🌱',
        demandLevel: 'medium',
        availableProviders: 890,
        averagePrice: '5,000 - 20,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'fencing',
        name: 'Fencing Services',
        description: 'Fence installation, repair, gates',
        icon: '🚧',
        demandLevel: 'high',
        availableProviders: 620,
        averagePrice: '8,000 - 40,000 KES',
        estimatedDuration: '8-24 hours'
      },
      {
        id: 'irrigation',
        name: 'Irrigation Installer',
        description: 'Irrigation systems, drip lines, sprinklers',
        icon: '💦',
        demandLevel: 'medium',
        availableProviders: 340,
        averagePrice: '15,000 - 60,000 KES',
        estimatedDuration: '8-16 hours'
      },
      {
        id: 'farm-equipment',
        name: 'Farm Equipment Repair',
        description: 'Tractor, engine, agricultural equipment repair',
        icon: '🚜',
        demandLevel: 'medium',
        availableProviders: 280,
        averagePrice: '5,000 - 25,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'animal-health',
        name: 'Animal Health Services',
        description: 'Agro-vet, livestock health, vaccination',
        icon: '🐄',
        demandLevel: 'high',
        availableProviders: 520,
        averagePrice: '2,000 - 10,000 KES',
        estimatedDuration: '1-3 hours'
      },
      {
        id: 'greenhouse',
        name: 'Greenhouse Construction',
        description: 'Greenhouse design, construction, setup',
        icon: '🌾',
        demandLevel: 'low',
        availableProviders: 120,
        averagePrice: '30,000 - 150,000 KES',
        estimatedDuration: '2-7 days'
      },
      {
        id: 'water-tank',
        name: 'Water Tank Installation',
        description: 'Water tank supply, installation, maintenance',
        icon: '🪣',
        demandLevel: 'medium',
        availableProviders: 280,
        averagePrice: '10,000 - 50,000 KES',
        estimatedDuration: '4-8 hours'
      }
    ]
  },
  {
    title: '🎉 Events & Special Services',
    description: 'Event setup and special occasion services',
    color: '#EC4899', // Pink
    icon: '🎊',
    services: [
      {
        id: 'event-setup',
        name: 'Event Setup & Tents',
        description: 'Tent rental, event setup, decoration',
        icon: '⛺',
        demandLevel: 'high',
        availableProviders: 420,
        averagePrice: '20,000 - 100,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'sound-lighting',
        name: 'Sound & Lighting Services',
        description: 'Event sound systems, stage lighting',
        icon: '🎤',
        demandLevel: 'high',
        availableProviders: 340,
        averagePrice: '15,000 - 80,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'photography',
        name: 'Photography & Videography',
        description: 'Event photos, videos, editing',
        icon: '📸',
        demandLevel: 'high',
        availableProviders: 1200,
        averagePrice: '20,000 - 100,000 KES',
        estimatedDuration: '4-8 hours'
      },
      {
        id: 'security',
        name: 'Security Services',
        description: 'Guards, alarm systems, monitoring',
        icon: '👮',
        demandLevel: 'high',
        availableProviders: 680,
        averagePrice: '5,000 - 20,000 KES/day',
        estimatedDuration: 'Ongoing'
      }
    ]
  }
];

// ============================================================
// MAIN COMPONENT
// ============================================================

interface ServicesHubPageProps {
  onServiceSelect?: (serviceId: string) => void;
}

export const ServicesHubPage: React.FC<ServicesHubPageProps> = ({ onServiceSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const { currentHub } = useHub();
  const branding = useHubBranding();

  // Filter services based on search
  const filteredGroups = SERVICE_GROUPS.map((group) => ({
    ...group,
    services: group.services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter((group) => group.services.length > 0);

  // Get all services matching search
  const allFilteredServices = filteredGroups.flatMap((g) => g.services);

  return (
    <div className="services-hub-page">
      {/* HERO SECTION */}
      <div className="shp-hero">
        <div className="hero-content">
          <h1>🛠️ Services Hub</h1>
          <p className="hero-subtitle">
            Find trusted professionals for any service. From plumbing to events, we connect you with
            quality service providers.
          </p>

          {/* SEARCH BAR */}
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search services... (e.g., Plumber, Electrician, Cleaning)"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* CTA BUTTONS */}
          <div className="hero-ctas">
            <button className="cta-find">Find a Service Provider</button>
            <button className="cta-offer">Offer Your Services</button>
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <div className="stats-section">
        <div className="stat-card">
          <TrendingUp size={24} />
          <div>
            <div className="stat-number">58</div>
            <div className="stat-label">Service Types</div>
          </div>
        </div>
        <div className="stat-card">
          <Star size={24} />
          <div>
            <div className="stat-number">18,500+</div>
            <div className="stat-label">Service Providers</div>
          </div>
        </div>
        <div className="stat-card">
          <MapPin size={24} />
          <div>
            <div className="stat-number">Nationwide</div>
            <div className="stat-label">Delivery</div>
          </div>
        </div>
        <div className="stat-card">
          <Clock size={24} />
          <div>
            <div className="stat-number">Same Day</div>
            <div className="stat-label">Service Available</div>
          </div>
        </div>
      </div>

      {/* SERVICE CATEGORIES */}
      <div className="categories-section">
        {allFilteredServices.length === 0 ? (
          <div className="no-results">
            <p>No services found matching "{searchQuery}"</p>
            <button onClick={() => setSearchQuery('')}>Clear search</button>
          </div>
        ) : (
          filteredGroups.map((group) => (
            <div key={group.title} className="service-group">
              {/* GROUP HEADER */}
              <div className="group-header" style={{ borderColor: group.color }}>
                <div className="group-title-row">
                  <span className="group-icon">{group.icon}</span>
                  <div>
                    <h2>{group.title}</h2>
                    <p>{group.description}</p>
                  </div>
                  <button
                    className="expand-btn"
                    onClick={() =>
                      setExpandedGroup(expandedGroup === group.title ? null : group.title)
                    }
                  >
                    {expandedGroup === group.title ? '−' : '+'}
                  </button>
                </div>
              </div>

              {/* SERVICE GRID */}
              {(expandedGroup === group.title || expandedGroup === null) && (
                <div className="service-grid">
                  {group.services.map((service) => (
                    <div
                      key={service.id}
                      className="service-card"
                      onClick={() => onServiceSelect?.(service.id)}
                    >
                      {/* SERVICE HEADER */}
                      <div className="service-card-header">
                        <span className="service-icon">{service.icon}</span>
                        <div className="service-demand" style={{ backgroundColor: group.color }}>
                          {service.demandLevel === 'high'
                            ? '🔥 High Demand'
                            : service.demandLevel === 'medium'
                              ? '📊 Medium'
                              : '📈 Available'}
                        </div>
                      </div>

                      {/* SERVICE INFO */}
                      <h3>{service.name}</h3>
                      <p className="service-description">{service.description}</p>

                      {/* SERVICE STATS */}
                      <div className="service-stats">
                        {service.availableProviders && (
                          <div className="stat">
                            <Star size={14} />
                            <span>{service.availableProviders} providers</span>
                          </div>
                        )}
                        {service.averagePrice && (
                          <div className="stat">
                            <span className="price-label">💰 {service.averagePrice}</span>
                          </div>
                        )}
                        {service.estimatedDuration && (
                          <div className="stat">
                            <Clock size={14} />
                            <span>{service.estimatedDuration}</span>
                          </div>
                        )}
                      </div>

                      {/* CARD FOOTER */}
                      <div className="service-footer">
                        <button className="find-btn">Find Provider</button>
                        <button className="offer-btn">Offer Service</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GROUP FOOTER */}
              <div className="group-footer">
                <span>{group.services.length} services available</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Search Service</h3>
            <p>Browse our 58+ service categories or search for specific services</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Choose Provider</h3>
            <p>View profiles, reviews, and rates of available service providers</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Book Service</h3>
            <p>Schedule your service and communicate directly with the provider</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Get Service Done</h3>
            <p>Provider completes the work. You pay securely upon completion</p>
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .services-hub-page {
          background: #fafafa;
          color: #1a1a1a;
        }

        /* HERO */
        .shp-hero {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 60px 24px;
          text-align: center;
        }

        .hero-content h1 {
          font-size: 48px;
          font-weight: 700;
          margin: 0 0 16px 0;
        }

        .hero-subtitle {
          font-size: 18px;
          margin: 0 0 32px 0;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          opacity: 0.95;
          line-height: 1.6;
        }

        /* SEARCH */
        .search-container {
          position: relative;
          max-width: 500px;
          margin: 0 auto 32px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

        .search-input {
          width: 100%;
          border: none;
          padding: 16px 16px 16px 48px;
          font-size: 16px;
          outline: none;
        }

        .search-input::placeholder {
          color: #999;
        }

        /* CTA BUTTONS */
        .hero-ctas {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-find,
        .cta-offer {
          padding: 14px 32px;
          font-size: 16px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cta-find {
          background: white;
          color: #667eea;
        }

        .cta-find:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .cta-offer {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid white;
        }

        .cta-offer:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* STATS */
        .stats-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          padding: 40px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stat-card {
          display: flex;
          gap: 16px;
          align-items: center;
          padding: 24px;
          background: white;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: #667eea;
          box-shadow: 0 8px 24px rgba(102, 126, 234, 0.1);
        }

        .stat-card svg {
          color: #667eea;
          flex-shrink: 0;
        }

        .stat-number {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .stat-label {
          font-size: 13px;
          color: #999;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* CATEGORIES */
        .categories-section {
          padding: 40px 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .service-group {
          margin-bottom: 40px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .group-header {
          padding: 24px;
          background: #f9f9f9;
          border-left: 4px solid #667eea;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background 0.2s;
        }

        .group-header:hover {
          background: #f0f0f0;
        }

        .group-title-row {
          display: flex;
          gap: 16px;
          align-items: center;
          flex: 1;
        }

        .group-icon {
          font-size: 32px;
          flex-shrink: 0;
        }

        .group-header h2 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1a1a1a;
        }

        .group-header p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .expand-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* GRID */
        .service-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          padding: 24px;
        }

        .service-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .service-card:hover {
          border-color: #667eea;
          box-shadow: 0 12px 32px rgba(102, 126, 234, 0.15);
          transform: translateY(-4px);
        }

        .service-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .service-icon {
          font-size: 32px;
        }

        .service-demand {
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          color: white;
        }

        .service-card h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #1a1a1a;
        }

        .service-description {
          font-size: 13px;
          color: #666;
          margin: 0 0 16px 0;
          flex: 1;
        }

        /* STATS */
        .service-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e0e0e0;
        }

        .stat {
          display: flex;
          gap: 6px;
          align-items: center;
          font-size: 12px;
          color: #666;
        }

        .stat svg {
          color: #667eea;
        }

        .price-label {
          font-weight: 600;
          color: #10b981;
        }

        .service-footer {
          display: flex;
          gap: 8px;
        }

        .find-btn,
        .offer-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .find-btn {
          background: #667eea;
          color: white;
        }

        .find-btn:hover {
          background: #5568d3;
        }

        .offer-btn {
          background: #f0f0f0;
          color: #1a1a1a;
        }

        .offer-btn:hover {
          background: #e0e0e0;
        }

        .group-footer {
          padding: 12px 24px;
          background: #f9f9f9;
          border-top: 1px solid #e0e0e0;
          font-size: 12px;
          color: #999;
          text-align: right;
        }

        /* NO RESULTS */
        .no-results {
          text-align: center;
          padding: 60px 24px;
        }

        .no-results p {
          font-size: 16px;
          color: #666;
          margin-bottom: 16px;
        }

        .no-results button {
          background: #667eea;
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
        }

        /* HOW IT WORKS */
        .how-it-works {
          padding: 60px 24px;
          background: white;
          text-align: center;
        }

        .how-it-works h2 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 40px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .step {
          padding: 32px 24px;
          background: #f9f9f9;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: #667eea;
          color: white;
          border-radius: 50%;
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 16px;
        }

        .step h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #1a1a1a;
        }

        .step p {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.6;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 32px;
          }

          .service-grid {
            grid-template-columns: 1fr;
          }

          .group-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default ServicesHubPage;
