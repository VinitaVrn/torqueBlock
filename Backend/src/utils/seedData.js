const seedProducts = [
  {
    sku: 'TB-PIR-DR4-120',
    brand: 'Pirelli',
    model: 'Diablo Rosso IV',
    description: 'The latest generation of the iconic DIABLO ROSSO family: the state-of-the-art sport tyre for road use with brilliant wet and dry performance.',
    size: '120/70 ZR17 (58W)',
    rimSize: '17',
    category: 'Supersport',
    specifications: {
      position: 'Front',
      speedRating: '(W) > 270 km/h',
      loadIndex: '58 (236 kg)',
      construction: 'Radial - Tubeless'
    },
    b2bPrice: 13500,
    mrp: 17200,
    stock: 24,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-PIR-DR4-180',
    brand: 'Pirelli',
    model: 'Diablo Rosso IV Rear',
    description: 'Rear fitment delivering uncompromising grip in cornering and immediate acceleration on high-powered superbikes.',
    size: '180/55 ZR17 (73W)',
    rimSize: '17',
    category: 'Supersport',
    specifications: {
      position: 'Rear',
      speedRating: '(W) > 270 km/h',
      loadIndex: '73 (365 kg)',
      construction: 'Radial - Tubeless'
    },
    b2bPrice: 17800,
    mrp: 22500,
    stock: 18,
    images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-MCH-RD6-120',
    brand: 'Michelin',
    model: 'Road 6',
    description: 'Premium Sport Touring tyre offering 15% more wet grip and 10% longer tread life compared to its predecessor, Michelin Road 5.',
    size: '120/70 ZR17 (58W)',
    rimSize: '17',
    category: 'Sport Touring',
    specifications: {
      position: 'Front',
      speedRating: '(W) > 270 km/h',
      loadIndex: '58 (236 kg)',
      construction: 'Radial 2CT+ Dual Compound'
    },
    b2bPrice: 14200,
    mrp: 18500,
    stock: 30,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-MCH-RD6-190',
    brand: 'Michelin',
    model: 'Road 6 Rear',
    description: 'Benchmark Sport Touring rear tyre engineered with Michelin Silica Technology and 2CT+ dual compound for maximum highway longevity and rain safety.',
    size: '190/55 ZR17 (75W)',
    rimSize: '17',
    category: 'Sport Touring',
    specifications: {
      position: 'Rear',
      speedRating: '(W) > 270 km/h',
      loadIndex: '75 (387 kg)',
      construction: 'Radial 2CT+ Dual Compound'
    },
    b2bPrice: 19500,
    mrp: 24900,
    stock: 15,
    images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-MTZ-TNX-110',
    brand: 'Metzeler',
    model: 'Tourance Next 2',
    description: 'The new benchmark for enduro street and adventure bikes. Outstanding handling, confidence in the wet, and high mileage resistance.',
    size: '110/80 R19 (59V)',
    rimSize: '19',
    category: 'Adventure / Dual Sport',
    specifications: {
      position: 'Front',
      speedRating: 'V (240 km/h)',
      loadIndex: '59 (243 kg)',
      construction: 'Steel Radial Tubeless'
    },
    b2bPrice: 12800,
    mrp: 16000,
    stock: 20,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-MTZ-TNX-150',
    brand: 'Metzeler',
    model: 'Tourance Next 2 Rear',
    description: 'Adventure rear tyre with dual-compound layout for heavy luggage support and superior gravel/wet asphalt traction.',
    size: '150/70 R17 (69V)',
    rimSize: '17',
    category: 'Adventure / Dual Sport',
    specifications: {
      position: 'Rear',
      speedRating: 'V (240 km/h)',
      loadIndex: '69 (325 kg)',
      construction: 'Steel Radial Tubeless'
    },
    b2bPrice: 15900,
    mrp: 19800,
    stock: 12,
    images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-BRD-S22-120',
    brand: 'Bridgestone',
    model: 'Battlax Hypersport S22',
    description: 'Hyper-sport motorcycle tyre featuring 3LC compound technology to give riders supreme road feedback and track-day capability.',
    size: '120/70 ZR17 (58W)',
    rimSize: '17',
    category: 'Supersport',
    specifications: {
      position: 'Front',
      speedRating: '(W) > 270 km/h',
      loadIndex: '58 (236 kg)',
      construction: 'Mono-Spiral Belt (MS-BELT)'
    },
    b2bPrice: 13900,
    mrp: 17500,
    stock: 22,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-BRD-S22-180',
    brand: 'Bridgestone',
    model: 'Battlax Hypersport S22 Rear',
    description: 'Five-layer compound (5LC) rear tyre providing unprecedented grip at extreme lean angles while maintaining high central tread life.',
    size: '180/55 ZR17 (73W)',
    rimSize: '17',
    category: 'Supersport',
    specifications: {
      position: 'Rear',
      speedRating: '(W) > 270 km/h',
      loadIndex: '73 (365 kg)',
      construction: '5LC Dual Compound'
    },
    b2bPrice: 18200,
    mrp: 23200,
    stock: 16,
    images: ['https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-DNL-Q4-120',
    brand: 'Dunlop',
    model: 'Sportmax Q4',
    description: 'Track-ready street tyre built with carbon fiber technology in the sidewall for razor-sharp steering precision and instant turn-in.',
    size: '120/70 ZR17 (58W)',
    rimSize: '17',
    category: 'Track / Racing',
    specifications: {
      position: 'Front',
      speedRating: '(W) > 270 km/h',
      loadIndex: '58 (236 kg)',
      construction: 'Carbon Fiber Reinforced Radial'
    },
    b2bPrice: 14800,
    mrp: 18900,
    stock: 10,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'],
    active: true
  },
  {
    sku: 'TB-APL-ALH-110',
    brand: 'Apollo',
    model: 'Alpha H1',
    description: 'High-performance steel belted radial tyre specifically developed for naked and supersport 250cc-650cc machines in Indian conditions.',
    size: '110/70 R17 (54H)',
    rimSize: '17',
    category: 'Urban / Commuter',
    specifications: {
      position: 'Front',
      speedRating: 'H (210 km/h)',
      loadIndex: '54 (212 kg)',
      construction: 'Zero Degree Steel Belt'
    },
    b2bPrice: 5800,
    mrp: 7500,
    stock: 45,
    images: ['https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=600&q=80'],
    active: true
  }
];

const seedUsers = [
  {
    name: 'Apex Superbikes Workshop',
    email: 'dealer@torqueblock.com',
    phone: '+91 98765 43210',
    companyName: 'Apex Performance Garage Ltd.',
    password: 'password123',
    addresses: [
      {
        street: '42 Industrial Suburb, Yeshwanthpur',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560022',
        country: 'India',
        isDefault: true
      }
    ]
  }
];

module.exports = { seedProducts, seedUsers };
