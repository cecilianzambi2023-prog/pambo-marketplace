import React, { useState } from 'react';

interface ServiceCategory {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
}

// All 90 service categories with specific, high-quality Unsplash image URLs
const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: '1',
    name: 'House Cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop',
    slug: 'house-cleaning'
  },
  {
    id: '2',
    name: 'Office Cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1600170353543-6c94025aa2cb?q=80&w=800&auto=format&fit=crop',
    slug: 'office-cleaning'
  },
  {
    id: '3',
    name: 'Carpet Cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1563453392212-921510271437?q=80&w=800&auto=format&fit=crop',
    slug: 'carpet-cleaning'
  },
  {
    id: '4',
    name: 'Pest Control',
    imageUrl:
      'https://images.unsplash.com/photo-1620021392955-a28a2a0a28f8?q=80&w=800&auto=format&fit=crop',
    slug: 'pest-control'
  },
  {
    id: '5',
    name: 'Plumbing',
    imageUrl:
      'https://images.unsplash.com/photo-1601431685280-c6da41aa370e?q=80&w=800&auto=format&fit=crop',
    slug: 'plumbing'
  },
  {
    id: '6',
    name: 'Electrical Repairs',
    imageUrl:
      'https://images.unsplash.com/photo-1497440991519-a2dff83e0b2d?q=80&w=800&auto=format&fit=crop',
    slug: 'electrical-repairs'
  },
  {
    id: '7',
    name: 'CCTV Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1617103995713-ab45396ce2a2?q=80&w=800&auto=format&fit=crop',
    slug: 'cctv-installation'
  },
  {
    id: '8',
    name: 'Solar Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1508935495248-35436ee3aa82?q=80&w=800&auto=format&fit=crop',
    slug: 'solar-installation'
  },
  {
    id: '9',
    name: 'Borehole Drilling',
    imageUrl:
      'https://images.unsplash.com/photo-1593593026268-2886b5b5c91f?q=80&w=800&auto=format&fit=crop',
    slug: 'borehole-drilling'
  },
  {
    id: '10',
    name: 'Water Tank Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1598214886343-7b4155f9f6b6?q=80&w=800&auto=format&fit=crop',
    slug: 'water-tank-installation'
  },
  {
    id: '11',
    name: 'Roofing Services',
    imageUrl:
      'https://images.unsplash.com/photo-1542641662-a5515234a410?q=80&w=800&auto=format&fit=crop',
    slug: 'roofing-services'
  },
  {
    id: '12',
    name: 'Masonry',
    imageUrl:
      'https://images.unsplash.com/photo-1581087461233-2632b7a421a9?q=80&w=800&auto=format&fit=crop',
    slug: 'masonry'
  },
  {
    id: '13',
    name: 'Tiling Services',
    imageUrl:
      'https://images.unsplash.com/photo-1580392262844-3d024647c2b3?q=80&w=800&auto=format&fit=crop',
    slug: 'tiling-services'
  },
  {
    id: '14',
    name: 'Painting Services',
    imageUrl:
      'https://images.unsplash.com/photo-1525904990922-3a2b724c9584?q=80&w=800&auto=format&fit=crop',
    slug: 'painting-services'
  },
  {
    id: '15',
    name: 'Welding & Fabrication',
    imageUrl:
      'https://images.unsplash.com/photo-1619451529526-a05d85150286?q=80&w=800&auto=format&fit=crop',
    slug: 'welding-fabrication'
  },
  {
    id: '16',
    name: 'Carpentry',
    imageUrl:
      'https://images.unsplash.com/photo-1593323733229-35c249a5518b?q=80&w=800&auto=format&fit=crop',
    slug: 'carpentry'
  },
  {
    id: '17',
    name: 'Furniture Making',
    imageUrl:
      'https://images.unsplash.com/photo-1506898667547-42e22a46e125?q=80&w=800&auto=format&fit=crop',
    slug: 'furniture-making'
  },
  {
    id: '18',
    name: 'Interior Design',
    imageUrl:
      'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800&auto=format&fit=crop',
    slug: 'interior-design'
  },
  {
    id: '19',
    name: 'Landscaping',
    imageUrl:
      'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop',
    slug: 'landscaping'
  },
  {
    id: '20',
    name: 'Gardening Services',
    imageUrl:
      'https://images.unsplash.com/photo-1466692476868-aefcdfb1b517?q=80&w=800&auto=format&fit=crop',
    slug: 'gardening-services'
  },
  {
    id: '21',
    name: 'Tree Cutting',
    imageUrl:
      'https://images.unsplash.com/photo-1621886163233-1a2212a43d59?q=80&w=800&auto=format&fit=crop',
    slug: 'tree-cutting'
  },
  {
    id: '22',
    name: 'Moving & Relocation',
    imageUrl:
      'https://images.unsplash.com/photo-1594821685222-a74485459a9a?q=80&w=800&auto=format&fit=crop',
    slug: 'moving-relocation'
  },
  {
    id: '23',
    name: 'Courier Services',
    imageUrl:
      'https://images.unsplash.com/photo-1604937452197-ea01a4b89989?q=80&w=800&auto=format&fit=crop',
    slug: 'courier-services'
  },
  {
    id: '24',
    name: 'Truck Hire',
    imageUrl:
      'https://images.unsplash.com/photo-1586528116311-01dd23c3a436?q=80&w=800&auto=format&fit=crop',
    slug: 'truck-hire'
  },
  {
    id: '25',
    name: 'Car Hire',
    imageUrl:
      'https://images.unsplash.com/photo-1551522435-a131bf5e4a42?q=80&w=800&auto=format&fit=crop',
    slug: 'car-hire'
  },
  {
    id: '26',
    name: 'Car Wash Services',
    imageUrl:
      'https://images.unsplash.com/photo-1607954942461-82c03a95444e?q=80&w=800&auto=format&fit=crop',
    slug: 'car-wash-services'
  },
  {
    id: '27',
    name: 'Car Detailing',
    imageUrl:
      'https://images.unsplash.com/photo-1583683595535-6b132868019a?q=80&w=800&auto=format&fit=crop',
    slug: 'car-detailing'
  },
  {
    id: '28',
    name: 'Car Tracking Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1611593414309-913a3036495b?q=80&w=800&auto=format&fit=crop',
    slug: 'car-tracking-installation'
  },
  {
    id: '29',
    name: 'Auto Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1553773077-916735c0a13b?q=80&w=800&auto=format&fit=crop',
    slug: 'auto-repair'
  },
  {
    id: '30',
    name: 'Panel Beating',
    imageUrl:
      'https://images.unsplash.com/photo-1579752636253-e387e35b3f71?q=80&w=800&auto=format&fit=crop',
    slug: 'panel-beating'
  },
  {
    id: '31',
    name: 'Phone Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1605384932378-0e8a73241553?q=80&w=800&auto=format&fit=crop',
    slug: 'phone-repair'
  },
  {
    id: '32',
    name: 'Laptop Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=800&auto=format&fit=crop',
    slug: 'laptop-repair'
  },
  {
    id: '33',
    name: 'Appliance Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1617192219113-a8a5e2b8b9de?q=80&w=800&auto=format&fit=crop',
    slug: 'appliance-repair'
  },
  {
    id: '34',
    name: 'Fridge Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1571175443880-49e1d25b2dcb?q=80&w=800&auto=format&fit=crop',
    slug: 'fridge-repair'
  },
  {
    id: '35',
    name: 'Washing Machine Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1623955214436-b63e18a8081f?q=80&w=800&auto=format&fit=crop',
    slug: 'washing-machine-repair'
  },
  {
    id: '36',
    name: 'Generator Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1507035895488-89345a8a7c2d?q=80&w=800&auto=format&fit=crop',
    slug: 'generator-repair'
  },
  {
    id: '37',
    name: 'Event Planning',
    imageUrl:
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop',
    slug: 'event-planning'
  },
  {
    id: '38',
    name: 'Wedding Planning',
    imageUrl:
      'https://images.unsplash.com/photo-1593259037198-c720f04c3613?q=80&w=800&auto=format&fit=crop',
    slug: 'wedding-planning'
  },
  {
    id: '39',
    name: 'Event Decoration',
    imageUrl:
      'https://images.unsplash.com/photo-1481026469463-66327c86e544?q=80&w=800&auto=format&fit=crop',
    slug: 'event-decoration'
  },
  {
    id: '40',
    name: 'Catering Services',
    imageUrl:
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop',
    slug: 'catering-services'
  },
  {
    id: '41',
    name: 'Private Chef Services',
    imageUrl:
      'https://images.unsplash.com/photo-1556910103-1c02745a72b7?q=80&w=800&auto=format&fit=crop',
    slug: 'private-chef-services'
  },
  {
    id: '42',
    name: 'DJ Services',
    imageUrl:
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop',
    slug: 'dj-services'
  },
  {
    id: '43',
    name: 'MC Services',
    imageUrl:
      'https://images.unsplash.com/photo-1569933562308-d2363e75e7a9?q=80&w=800&auto=format&fit=crop',
    slug: 'mc-services'
  },
  {
    id: '44',
    name: 'Photography',
    imageUrl:
      'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?q=80&w=800&auto=format&fit=crop',
    slug: 'photography'
  },
  {
    id: '45',
    name: 'Videography',
    imageUrl:
      'https://images.unsplash.com/photo-1549472534-a8412a83e028?q=80&w=800&auto=format&fit=crop',
    slug: 'videography'
  },
  {
    id: '46',
    name: 'Makeup Services',
    imageUrl:
      'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?q=80&w=800&auto=format&fit=crop',
    slug: 'makeup-services'
  },
  {
    id: '47',
    name: 'Barber Services',
    imageUrl:
      'https://images.unsplash.com/photo-1567894340345-42d2a1a3e8dc?q=80&w=800&auto=format&fit=crop',
    slug: 'barber-services'
  },
  {
    id: '48',
    name: 'Hair Styling',
    imageUrl:
      'https://images.unsplash.com/photo-1560066984-1382b1e392d3?q=80&w=800&auto=format&fit=crop',
    slug: 'hair-styling'
  },
  {
    id: '49',
    name: 'Nail Services',
    imageUrl:
      'https://images.unsplash.com/photo-1604654894610-df679d5e3b28?q=80&w=800&auto=format&fit=crop',
    slug: 'nail-services'
  },
  {
    id: '50',
    name: 'Massage Therapy',
    imageUrl:
      'https://images.unsplash.com/photo-1598218987635-428835d3f273?q=80&w=800&auto=format&fit=crop',
    slug: 'massage-therapy'
  },
  {
    id: '51',
    name: 'Fitness Training',
    imageUrl:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800&auto=format&fit=crop',
    slug: 'fitness-training'
  },
  {
    id: '52',
    name: 'Swimming Lessons',
    imageUrl:
      'https://images.unsplash.com/photo-1575410228382-e307584f7063?q=80&w=800&auto=format&fit=crop',
    slug: 'swimming-lessons'
  },
  {
    id: '53',
    name: 'Driving Lessons',
    imageUrl:
      'https://images.unsplash.com/photo-1565347527181-3dbab19391a2?q=80&w=800&auto=format&fit=crop',
    slug: 'driving-lessons'
  },
  {
    id: '54',
    name: 'Tuition Services',
    imageUrl:
      'https://images.unsplash.com/photo-1590650213769-8d1e3d75a5b5?q=80&w=800&auto=format&fit=crop',
    slug: 'tuition-services'
  },
  {
    id: '55',
    name: 'Online Tutoring',
    imageUrl:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop',
    slug: 'online-tutoring'
  },
  {
    id: '56',
    name: 'Graphic Design',
    imageUrl:
      'https://images.unsplash.com/photo-1607237138293-0e79c4589212?q=80&w=800&auto=format&fit=crop',
    slug: 'graphic-design'
  },
  {
    id: '57',
    name: 'Web Design',
    imageUrl:
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop',
    slug: 'web-design'
  },
  {
    id: '58',
    name: 'App Development',
    imageUrl:
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=800&auto=format&fit=crop',
    slug: 'app-development'
  },
  {
    id: '59',
    name: 'Digital Marketing',
    imageUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
    slug: 'digital-marketing'
  },
  {
    id: '60',
    name: 'Social Media Management',
    imageUrl:
      'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?q=80&w=800&auto=format&fit=crop',
    slug: 'social-media-management'
  },
  {
    id: '61',
    name: 'SEO Services',
    imageUrl:
      'https://images.unsplash.com/photo-1554474052-a27912115b18?q=80&w=800&auto=format&fit=crop',
    slug: 'seo-services'
  },
  {
    id: '62',
    name: 'Content Writing',
    imageUrl:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop',
    slug: 'content-writing'
  },
  {
    id: '63',
    name: 'Resume Writing',
    imageUrl:
      'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=800&auto=format&fit=crop',
    slug: 'resume-writing'
  },
  {
    id: '64',
    name: 'Translation Services',
    imageUrl:
      'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=800&auto=format&fit=crop',
    slug: 'translation-services'
  },
  {
    id: '65',
    name: 'Printing Services',
    imageUrl:
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=800&auto=format&fit=crop',
    slug: 'printing-services'
  },
  {
    id: '66',
    name: 'Branding Services',
    imageUrl:
      'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?q=80&w=800&auto=format&fit=crop',
    slug: 'branding-services'
  },
  {
    id: '67',
    name: 'Signage Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop',
    slug: 'signage-installation'
  },
  {
    id: '68',
    name: 'Security Guard Services',
    imageUrl:
      'https://images.unsplash.com/photo-1559941323-e4c1633519d1?q=80&w=800&auto=format&fit=crop',
    slug: 'security-guard-services'
  },
  {
    id: '69',
    name: 'Private Investigation',
    imageUrl:
      'https://images.unsplash.com/photo-1579542831221-168d60926c06?q=80&w=800&auto=format&fit=crop',
    slug: 'private-investigation'
  },
  {
    id: '70',
    name: 'Cleaning After Construction',
    imageUrl:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop',
    slug: 'cleaning-after-construction'
  },
  {
    id: '71',
    name: 'Laundry Services',
    imageUrl:
      'https://images.unsplash.com/photo-1608152213733-02082259166a?q=80&w=800&auto=format&fit=crop',
    slug: 'laundry-services'
  },
  {
    id: '72',
    name: 'Dry Cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1593113646773-9b8f64a4c49d?q=80&w=800&auto=format&fit=crop',
    slug: 'dry-cleaning'
  },
  {
    id: '73',
    name: 'Babysitting Services',
    imageUrl:
      'https://images.unsplash.com/photo-1546015026-6132b4914902?q=80&w=800&auto=format&fit=crop',
    slug: 'babysitting-services'
  },
  {
    id: '74',
    name: 'Elderly Care',
    imageUrl:
      'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=800&auto=format&fit=crop',
    slug: 'elderly-care'
  },
  {
    id: '75',
    name: 'Home Nursing',
    imageUrl:
      'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=800&auto=format&fit=crop',
    slug: 'home-nursing'
  },
  {
    id: '76',
    name: 'Pet Grooming',
    imageUrl:
      'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?q=80&w=800&auto=format&fit=crop',
    slug: 'pet-grooming'
  },
  {
    id: '77',
    name: 'Dog Training',
    imageUrl:
      'https://images.unsplash.com/photo-1534351450181-ea6f00160239?q=80&w=800&auto=format&fit=crop',
    slug: 'dog-training'
  },
  {
    id: '78',
    name: 'Airbnb Management',
    imageUrl:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop',
    slug: 'airbnb-management'
  },
  {
    id: '79',
    name: 'Property Management',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop',
    slug: 'property-management'
  },
  {
    id: '80',
    name: 'Real Estate Photography',
    imageUrl:
      'https://images.unsplash.com/photo-1560185893-a55de8534e3e?q=80&w=800&auto=format&fit=crop',
    slug: 'real-estate-photography'
  },
  {
    id: '81',
    name: 'Land Surveying',
    imageUrl:
      'https://images.unsplash.com/photo-1581092440857-55c3c223c213?q=80&w=800&auto=format&fit=crop',
    slug: 'land-surveying'
  },
  {
    id: '82',
    name: 'Architecture Services',
    imageUrl:
      'https://images.unsplash.com/photo-1556912173-35feb391d4e4?q=80&w=800&auto=format&fit=crop',
    slug: 'architecture-services'
  },
  {
    id: '83',
    name: 'Quantity Surveying',
    imageUrl:
      'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=800&auto=format&fit=crop',
    slug: 'quantity-surveying'
  },
  {
    id: '84',
    name: 'Legal Services',
    imageUrl:
      'https://images.unsplash.com/photo-1589254065909-b7086229d08c?q=80&w=800&auto=format&fit=crop',
    slug: 'legal-services'
  },
  {
    id: '85',
    name: 'Accounting Services',
    imageUrl:
      'https://images.unsplash.com/photo-1554224155-8d04421cd695?q=80&w=800&auto=format&fit=crop',
    slug: 'accounting-services'
  },
  {
    id: '86',
    name: 'Tax Consulting',
    imageUrl:
      'https://images.unsplash.com/photo-1599494016631-5f333a597f39?q=80&w=800&auto=format&fit=crop',
    slug: 'tax-consulting'
  },
  {
    id: '87',
    name: 'Business Registration',
    imageUrl:
      'https://images.unsplash.com/photo-1549923746-c502d488b3ea?q=80&w=800&auto=format&fit=crop',
    slug: 'business-registration'
  },
  {
    id: '88',
    name: 'Cybersecurity Services',
    imageUrl:
      'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=800&auto=format&fit=crop',
    slug: 'cybersecurity-services'
  },
  {
    id: '89',
    name: 'IT Support',
    imageUrl:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=800&auto=format&fit=crop',
    slug: 'it-support'
  },
  {
    id: '90',
    name: 'Data Recovery',
    imageUrl:
      'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=800&auto=format&fit=crop',
    slug: 'data-recovery'
  }
];

interface ServiceCategoryGridProps {
  onSelectCategory: (categoryName: string) => void;
}

export const ServiceCategoryGrid: React.FC<ServiceCategoryGridProps> = ({ onSelectCategory }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleCardClick = (category: ServiceCategory) => {
    onSelectCategory(category.name);
  };

  return (
    <div className="w-full bg-gray-50 py-12 px-4 rounded-lg border border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Browse Service Categories
          </h2>
          <p className="text-gray-600 text-lg">
            Explore 90+ professional services available across Kenya
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
          {SERVICE_CATEGORIES.map((category) => (
            <div
              key={category.id}
              onMouseEnter={() => setHoveredId(category.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleCardClick(category)}
              className="group cursor-pointer transition-all duration-300 ease-out"
              role="button"
              tabIndex={0}
              aria-label={`Select category: ${category.name}`}
            >
              <div
                className={`bg-white rounded-xl overflow-hidden transition-all duration-300 ${
                  hoveredId === category.id ? 'shadow-xl scale-105' : 'shadow-md'
                }`}
              >
                <div className="relative w-full aspect-video bg-gray-200 overflow-hidden rounded-t-xl">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      hoveredId === category.id ? 'scale-110' : 'scale-100'
                    }`}
                  />

                  <div
                    className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                      hoveredId === category.id ? 'opacity-30' : 'opacity-20'
                    }`}
                  />
                </div>

                <div className="p-4 bg-white">
                  <h3
                    className={`text-sm md:text-base font-semibold text-gray-900 line-clamp-2 transition-colors duration-300 ${
                      hoveredId === category.id ? 'text-orange-600' : 'text-gray-900'
                    }`}
                  >
                    {category.name}
                  </h3>
                  <div
                    className={`mt-2 h-1 bg-orange-500 rounded-full transition-all duration-300 ${
                      hoveredId === category.id ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
