import React, { useState } from 'react';

interface ServiceCategory {
  id: string;
  name: string;
  imageUrl: string;
  slug: string;
}

// FIX: Replaced all 90 images with higher-quality, more professional, and directly relevant photos.
const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: '1',
    name: 'House Cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop',
    slug: 'house-cleaning'
  },
  {
    id: '2',
    name: 'Office Cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=400&auto=format&fit=crop',
    slug: 'office-cleaning'
  },
  {
    id: '3',
    name: 'Carpet Cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1628269677938-95885517f461?q=80&w=400&auto=format&fit=crop',
    slug: 'carpet-cleaning'
  },
  {
    id: '4',
    name: 'Pest Control',
    imageUrl:
      'https://images.unsplash.com/photo-1599388136394-819999a38bcb?q=80&w=400&auto=format&fit=crop',
    slug: 'pest-control'
  },
  {
    id: '5',
    name: 'Plumbing',
    imageUrl:
      'https://images.unsplash.com/photo-1505798577917-a65157d3320a?q=80&w=400&auto=format&fit=crop',
    slug: 'plumbing'
  },
  {
    id: '6',
    name: 'Electrical Repairs',
    imageUrl:
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop',
    slug: 'electrical-repairs'
  },
  {
    id: '7',
    name: 'CCTV Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1588626049439-3868536f0e4d?q=80&w=400&auto=format&fit=crop',
    slug: 'cctv-installation'
  },
  {
    id: '8',
    name: 'Solar Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1624398127976-0331a3cd378a?q=80&w=400&auto=format&fit=crop',
    slug: 'solar-installation'
  },
  {
    id: '9',
    name: 'Borehole Drilling',
    imageUrl:
      'https://images.unsplash.com/photo-1597405220261-b46c1f513518?q=80&w=400&auto=format&fit=crop',
    slug: 'borehole-drilling'
  },
  {
    id: '10',
    name: 'Water Tank Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1621335279207-13313025281c?q=80&w=400&auto=format&fit=crop',
    slug: 'water-tank-installation'
  },
  {
    id: '11',
    name: 'Roofing Services',
    imageUrl:
      'https://images.unsplash.com/photo-1564883462842-34f8f55a183e?q=80&w=400&auto=format&fit=crop',
    slug: 'roofing-services'
  },
  {
    id: '12',
    name: 'Masonry',
    imageUrl:
      'https://images.unsplash.com/photo-1559305101-83c8443306d1?q=80&w=400&auto=format&fit=crop',
    slug: 'masonry'
  },
  {
    id: '13',
    name: 'Tiling Services',
    imageUrl:
      'https://images.unsplash.com/photo-1610011511699-8a3a415a7732?q=80&w=400&auto=format&fit=crop',
    slug: 'tiling-services'
  },
  {
    id: '14',
    name: 'Painting Services',
    imageUrl:
      'https://images.unsplash.com/photo-1600132800366-0683a486b8df?q=80&w=400&auto=format&fit=crop',
    slug: 'painting-services'
  },
  {
    id: '15',
    name: 'Welding & Fabrication',
    imageUrl:
      'https://images.unsplash.com/photo-1533013217429-4e8b3f889a74?q=80&w=400&auto=format&fit=crop',
    slug: 'welding-fabrication'
  },
  {
    id: '16',
    name: 'Carpentry',
    imageUrl:
      'https://images.unsplash.com/photo-1572018837128-4ad2b3c2e1f4?q=80&w=400&auto=format&fit=crop',
    slug: 'carpentry'
  },
  {
    id: '17',
    name: 'Furniture Making',
    imageUrl:
      'https://images.unsplash.com/photo-1631049901353-8334a1e35560?q=80&w=400&auto=format&fit=crop',
    slug: 'furniture-making'
  },
  {
    id: '18',
    name: 'Interior Design',
    imageUrl:
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400&auto=format&fit=crop',
    slug: 'interior-design'
  },
  {
    id: '19',
    name: 'Landscaping',
    imageUrl:
      'https://images.unsplash.com/photo-1599793169228-59424f114e8c?q=80&w=400&auto=format&fit=crop',
    slug: 'landscaping'
  },
  {
    id: '20',
    name: 'Gardening Services',
    imageUrl:
      'https://images.unsplash.com/photo-1617431289136-189f78326e6d?q=80&w=400&auto=format&fit=crop',
    slug: 'gardening-services'
  },
  {
    id: '21',
    name: 'Tree Cutting',
    imageUrl:
      'https://images.unsplash.com/photo-1550186527-df8073b6481c?q=80&w=400&auto=format&fit=crop',
    slug: 'tree-cutting'
  },
  {
    id: '22',
    name: 'Moving & Relocation',
    imageUrl:
      'https://images.unsplash.com/photo-1587584646039-eac96f536733?q=80&w=400&auto=format&fit=crop',
    slug: 'moving-relocation'
  },
  {
    id: '23',
    name: 'Courier Services',
    imageUrl:
      'https://images.unsplash.com/photo-1613919098939-6523049a4632?q=80&w=400&auto=format&fit=crop',
    slug: 'courier-services'
  },
  {
    id: '24',
    name: 'Truck Hire',
    imageUrl:
      'https://images.unsplash.com/photo-1605721911519-6134b2f2e5a2?q=80&w=400&auto=format&fit=crop',
    slug: 'truck-hire'
  },
  {
    id: '25',
    name: 'Car Hire',
    imageUrl:
      'https://images.unsplash.com/photo-1594495894542-a46cc73e081a?q=80&w=400&auto=format&fit=crop',
    slug: 'car-hire'
  },
  {
    id: '26',
    name: 'Car Wash Services',
    imageUrl:
      'https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?q=80&w=400&auto=format&fit=crop',
    slug: 'car-wash-services'
  },
  {
    id: '27',
    name: 'Car Detailing',
    imageUrl:
      'https://images.unsplash.com/photo-1615789591457-74a63395c990?q=80&w=400&auto=format&fit=crop',
    slug: 'car-detailing'
  },
  {
    id: '28',
    name: 'Car Tracking Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1558945483-34e8f3527b4f?q=80&w=400&auto=format&fit=crop',
    slug: 'car-tracking-installation'
  },
  {
    id: '29',
    name: 'Auto Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1567037812234-d3a1b73b5083?q=80&w=400&auto=format&fit=crop',
    slug: 'auto-repair'
  },
  {
    id: '30',
    name: 'Panel Beating',
    imageUrl:
      'https://images.unsplash.com/photo-1627443990618-1616854b73b2?q=80&w=400&auto=format&fit=crop',
    slug: 'panel-beating'
  },
  {
    id: '31',
    name: 'Phone Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1575844264627-7c11a63c6230?q=80&w=400&auto=format&fit=crop',
    slug: 'phone-repair'
  },
  {
    id: '32',
    name: 'Laptop Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1589578236662-de81432857a2?q=80&w=400&auto=format&fit=crop',
    slug: 'laptop-repair'
  },
  {
    id: '33',
    name: 'Appliance Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1630492822521-7faf3543b5e4?q=80&w=400&auto=format&fit=crop',
    slug: 'appliance-repair'
  },
  {
    id: '34',
    name: 'Fridge Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1634849260195-8a2a4b734b07?q=80&w=400&auto=format&fit=crop',
    slug: 'fridge-repair'
  },
  {
    id: '35',
    name: 'Washing Machine Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1622088339335-e4a5538947f6?q=80&w=400&auto=format&fit=crop',
    slug: 'washing-machine-repair'
  },
  {
    id: '36',
    name: 'Generator Repair',
    imageUrl:
      'https://images.unsplash.com/photo-1603399021273-05b63435163e?q=80&w=400&auto=format&fit=crop',
    slug: 'generator-repair'
  },
  {
    id: '37',
    name: 'Event Planning',
    imageUrl:
      'https://images.unsplash.com/photo-1519167758481-83f550bb4e3f?q=80&w=400&auto=format&fit=crop',
    slug: 'event-planning'
  },
  {
    id: '38',
    name: 'Wedding Planning',
    imageUrl:
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=400&auto=format&fit=crop',
    slug: 'wedding-planning'
  },
  {
    id: '39',
    name: 'Event Decoration',
    imageUrl:
      'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=400&auto=format&fit=crop',
    slug: 'event-decoration'
  },
  {
    id: '40',
    name: 'Catering Services',
    imageUrl:
      'https://images.unsplash.com/photo-1504113888839-1c8eb50233d3?q=80&w=400&auto=format&fit=crop',
    slug: 'catering-services'
  },
  {
    id: '41',
    name: 'Private Chef Services',
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e326b207432a?q=80&w=400&auto=format&fit=crop',
    slug: 'private-chef-services'
  },
  {
    id: '42',
    name: 'DJ Services',
    imageUrl:
      'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=400&auto=format&fit=crop',
    slug: 'dj-services'
  },
  {
    id: '43',
    name: 'MC Services',
    imageUrl:
      'https://images.unsplash.com/photo-1534832747372-41443697e076?q=80&w=400&auto=format&fit=crop',
    slug: 'mc-services'
  },
  {
    id: '44',
    name: 'Photography',
    imageUrl:
      'https://images.unsplash.com/photo-1512756290469-ec264b7fbf87?q=80&w=400&auto=format&fit=crop',
    slug: 'photography'
  },
  {
    id: '45',
    name: 'Videography',
    imageUrl:
      'https://images.unsplash.com/photo-1554203273-392815a5a146?q=80&w=400&auto=format&fit=crop',
    slug: 'videography'
  },
  {
    id: '46',
    name: 'Makeup Services',
    imageUrl:
      'https://images.unsplash.com/photo-1642899471375-23370f1a9425?q=80&w=400&auto=format&fit=crop',
    slug: 'makeup-services'
  },
  {
    id: '47',
    name: 'Barber Services',
    imageUrl:
      'https://images.unsplash.com/photo-1621605815971-fbc54d584323?q=80&w=400&auto=format&fit=crop',
    slug: 'barber-services'
  },
  {
    id: '48',
    name: 'Hair Styling',
    imageUrl:
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=400&auto=format&fit=crop',
    slug: 'hair-styling'
  },
  {
    id: '49',
    name: 'Nail Services',
    imageUrl:
      'https://images.unsplash.com/photo-1519415943484-2fa18734d217?q=80&w=400&auto=format&fit=crop',
    slug: 'nail-services'
  },
  {
    id: '50',
    name: 'Massage Therapy',
    imageUrl:
      'https://images.unsplash.com/photo-1519824145371-296894a0d72b?q=80&w=400&auto=format&fit=crop',
    slug: 'massage-therapy'
  },
  {
    id: '51',
    name: 'Fitness Training',
    imageUrl:
      'https://images.unsplash.com/photo-1599058917212-d750089bc074?q=80&w=400&auto=format&fit=crop',
    slug: 'fitness-training'
  },
  {
    id: '52',
    name: 'Swimming Lessons',
    imageUrl:
      'https://images.unsplash.com/photo-1595180250634-b152d5b51d8b?q=80&w=400&auto=format&fit=crop',
    slug: 'swimming-lessons'
  },
  {
    id: '53',
    name: 'Driving Lessons',
    imageUrl:
      'https://images.unsplash.com/photo-1579624328224-74519904d93b?q=80&w=400&auto=format&fit=crop',
    slug: 'driving-lessons'
  },
  {
    id: '54',
    name: 'Tuition Services',
    imageUrl:
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=400&auto=format&fit=crop',
    slug: 'tuition-services'
  },
  {
    id: '55',
    name: 'Online Tutoring',
    imageUrl:
      'https://images.unsplash.com/photo-1516542076529-1ea085533868?q=80&w=400&auto=format&fit=crop',
    slug: 'online-tutoring'
  },
  {
    id: '56',
    name: 'Graphic Design',
    imageUrl:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=400&auto=format&fit=crop',
    slug: 'graphic-design'
  },
  {
    id: '57',
    name: 'Web Design',
    imageUrl:
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?q=80&w=400&auto=format&fit=crop',
    slug: 'web-design'
  },
  {
    id: '58',
    name: 'App Development',
    imageUrl:
      'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=400&auto=format&fit=crop',
    slug: 'app-development'
  },
  {
    id: '59',
    name: 'Digital Marketing',
    imageUrl:
      'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=400&auto=format&fit=crop',
    slug: 'digital-marketing'
  },
  {
    id: '60',
    name: 'Social Media Management',
    imageUrl:
      'https://images.unsplash.com/photo-1518406432532-9cbef5697723?q=80&w=400&auto=format&fit=crop',
    slug: 'social-media-management'
  },
  {
    id: '61',
    name: 'SEO Services',
    imageUrl:
      'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=400&auto=format&fit=crop',
    slug: 'seo-services'
  },
  {
    id: '62',
    name: 'Content Writing',
    imageUrl:
      'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?q=80&w=400&auto=format&fit=crop',
    slug: 'content-writing'
  },
  {
    id: '63',
    name: 'Resume Writing',
    imageUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=400&auto=format&fit=crop',
    slug: 'resume-writing'
  },
  {
    id: '64',
    name: 'Translation Services',
    imageUrl:
      'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?q=80&w=400&auto=format&fit=crop',
    slug: 'translation-services'
  },
  {
    id: '65',
    name: 'Printing Services',
    imageUrl:
      'https://images.unsplash.com/photo-1504204282239-01a432174643?q=80&w=400&auto=format&fit=crop',
    slug: 'printing-services'
  },
  {
    id: '66',
    name: 'Branding Services',
    imageUrl:
      'https://images.unsplash.com/photo-1606503153255-59d8b8b82176?q=80&w=400&auto=format&fit=crop',
    slug: 'branding-services'
  },
  {
    id: '67',
    name: 'Signage Installation',
    imageUrl:
      'https://images.unsplash.com/photo-1614091092048-52279b858137?q=80&w=400&auto=format&fit=crop',
    slug: 'signage-installation'
  },
  {
    id: '68',
    name: 'Security Guard Services',
    imageUrl:
      'https://images.unsplash.com/photo-1622126827339-41712162b70d?q=80&w=400&auto=format&fit=crop',
    slug: 'security-guard-services'
  },
  {
    id: '69',
    name: 'Private Investigation',
    imageUrl:
      'https://images.unsplash.com/photo-1573497019941-8c0082f9f4ac?q=80&w=400&auto=format&fit=crop',
    slug: 'private-investigation'
  },
  {
    id: '70',
    name: 'Cleaning After Construction',
    imageUrl:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=400&auto=format&fit=crop',
    slug: 'cleaning-after-construction'
  },
  {
    id: '71',
    name: 'Laundry Services',
    imageUrl:
      'https://images.unsplash.com/photo-1545174787-93530b19d84e?q=80&w=400&auto=format&fit=crop',
    slug: 'laundry-services'
  },
  {
    id: '72',
    name: 'Dry Cleaning',
    imageUrl:
      'https://images.unsplash.com/photo-1566422247953-541b6534b8c2?q=80&w=400&auto=format&fit=crop',
    slug: 'dry-cleaning'
  },
  {
    id: '73',
    name: 'Babysitting Services',
    imageUrl:
      'https://images.unsplash.com/photo-151548804236-a24967990184?q=80&w=400&auto=format&fit=crop',
    slug: 'babysitting-services'
  },
  {
    id: '74',
    name: 'Elderly Care',
    imageUrl:
      'https://images.unsplash.com/photo-1576765608866-5b510443457a?q=80&w=400&auto=format&fit=crop',
    slug: 'elderly-care'
  },
  {
    id: '75',
    name: 'Home Nursing',
    imageUrl:
      'https://images.unsplash.com/photo-1612282415843-c7e4a1a3e8e4?q=80&w=400&auto=format&fit=crop',
    slug: 'home-nursing'
  },
  {
    id: '76',
    name: 'Pet Grooming',
    imageUrl:
      'https://images.unsplash.com/photo-1597839219213-a48cb3937986?q=80&w=400&auto=format&fit=crop',
    slug: 'pet-grooming'
  },
  {
    id: '77',
    name: 'Dog Training',
    imageUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=400&auto=format&fit=crop',
    slug: 'dog-training'
  },
  {
    id: '78',
    name: 'Airbnb Management',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=400&auto=format&fit=crop',
    slug: 'airbnb-management'
  },
  {
    id: '79',
    name: 'Property Management',
    imageUrl:
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop',
    slug: 'property-management'
  },
  {
    id: '80',
    name: 'Real Estate Photography',
    imageUrl:
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=400&auto=format&fit=crop',
    slug: 'real-estate-photography'
  },
  {
    id: '81',
    name: 'Land Surveying',
    imageUrl:
      'https://images.unsplash.com/photo-1639322537228-f72ae7b67863?q=80&w=400&auto=format&fit=crop',
    slug: 'land-surveying'
  },
  {
    id: '82',
    name: 'Architecture Services',
    imageUrl:
      'https://images.unsplash.com/photo-1511306399243-67a5a73e13f2?q=80&w=400&auto=format&fit=crop',
    slug: 'architecture-services'
  },
  {
    id: '83',
    name: 'Quantity Surveying',
    imageUrl:
      'https://images.unsplash.com/photo-1541845157-a6d2d100c931?q=80&w=400&auto=format&fit=crop',
    slug: 'quantity-surveying'
  },
  {
    id: '84',
    name: 'Legal Services',
    imageUrl:
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=400&auto=format&fit=crop',
    slug: 'legal-services'
  },
  {
    id: '85',
    name: 'Accounting Services',
    imageUrl:
      'https://images.unsplash.com/photo-1614088487313-255a6628cb39?q=80&w=400&auto=format&fit=crop',
    slug: 'accounting-services'
  },
  {
    id: '86',
    name: 'Tax Consulting',
    imageUrl:
      'https://images.unsplash.com/photo-1554224154-22dec7ec8818?q=80&w=400&auto=format&fit=crop',
    slug: 'tax-consulting'
  },
  {
    id: '87',
    name: 'Business Registration',
    imageUrl:
      'https://images.unsplash.com/photo-1560520031-3a4dc5e25a73?q=80&w=400&auto=format&fit=crop',
    slug: 'business-registration'
  },
  {
    id: '88',
    name: 'Cybersecurity Services',
    imageUrl:
      'https://images.unsplash.com/photo-1544890225-2fde0e66e7a9?q=80&w=400&auto=format&fit=crop',
    slug: 'cybersecurity-services'
  },
  {
    id: '89',
    name: 'IT Support',
    imageUrl:
      'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=400&auto=format&fit=crop',
    slug: 'it-support'
  },
  {
    id: '90',
    name: 'Data Recovery',
    imageUrl:
      'https://images.unsplash.com/photo-1593431930263-1d54f59635b4?q=80&w=400&auto=format&fit=crop',
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
