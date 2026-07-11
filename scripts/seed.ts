/**
 * Ovelia — Database Seed Script
 *
 * Usage:
 *   1. Install deps: npm install firebase-admin ts-node typescript
 *   2. Download your Firebase service account key from Console > Project Settings > Service Accounts
 *   3. Set GOOGLE_APPLICATION_CREDENTIALS env var to the path of the JSON key
 *   4. Run: npx ts-node scripts/seed.ts
 */

import * as admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()

const now = admin.firestore.Timestamp.now()

function ts(daysAgo = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return admin.firestore.Timestamp.fromDate(d)
}

const products = [
  // ─── Home & Living ──────────────────────────────────────────────────────
  {
    name: 'Terracotta Pillar Candle Set',
    slug: 'terracotta-pillar-candle-set',
    shortDescription: 'Three hand-poured soy wax candles in warm terracotta tones with subtle amber fragrance.',
    description: 'Elevate your home with our hand-poured terracotta pillar candle set. Made from 100% natural soy wax, each candle burns cleanly for up to 40 hours. The warm amber and sandalwood fragrance creates a cozy, inviting atmosphere. Set of 3 in varying heights — perfect for a styled arrangement on a mantle or dining table.',
    price: 38.00,
    compareAtPrice: 52.00,
    images: ['https://images.unsplash.com/photo-1602523961358-f9f03dd557db?w=800'],
    category: 'Home & Living',
    subcategory: 'Candles',
    variants: [],
    stock: 42,
    rating: 4.8,
    reviewCount: 23,
    tags: ['candle', 'soy', 'terracotta', 'home decor'],
    featured: true,
    newArrival: false,
    createdAt: ts(30),
    updatedAt: ts(5),
  },
  {
    name: 'Woven Seagrass Storage Basket',
    slug: 'woven-seagrass-storage-basket',
    shortDescription: 'Handwoven seagrass basket with leather handles — perfect for throws, toys, or plants.',
    description: 'Artfully crafted from natural seagrass, this storage basket adds organic warmth to any room. The sturdy leather handles make it easy to move around, while its generous capacity keeps your space clutter-free. Suitable for use as a laundry basket, plant pot cover, or living room storage.',
    price: 54.99,
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800'],
    category: 'Home & Living',
    subcategory: 'Storage',
    variants: [
      { id: 'v1', type: 'size', label: 'Small', value: 'S', stock: 15 },
      { id: 'v2', type: 'size', label: 'Medium', value: 'M', stock: 22 },
      { id: 'v3', type: 'size', label: 'Large', value: 'L', stock: 10 },
    ],
    stock: 47,
    rating: 4.6,
    reviewCount: 18,
    tags: ['basket', 'storage', 'seagrass', 'natural'],
    featured: true,
    newArrival: false,
    createdAt: ts(45),
    updatedAt: ts(10),
  },
  {
    name: 'Linen Throw Blanket — Dusk',
    slug: 'linen-throw-blanket-dusk',
    shortDescription: 'Softly woven linen throw in dusty rose — breathable, lightweight, and endlessly cozy.',
    description: 'Our Dusk linen throw brings effortless elegance to any sofa or armchair. Woven from 100% European linen, it grows softer with each wash. The dusty rose tone complements neutral interiors beautifully. Measures 130 × 170cm — generous enough for two.',
    price: 89.00,
    compareAtPrice: 110.00,
    images: ['https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=800'],
    category: 'Home & Living',
    subcategory: 'Textiles',
    variants: [
      { id: 'c1', type: 'color', label: 'Dusk Rose', value: '#D9A4A4', stock: 20 },
      { id: 'c2', type: 'color', label: 'Sage',      value: '#7A9B6F', stock: 15 },
      { id: 'c3', type: 'color', label: 'Cream',     value: '#F9F3EB', stock: 25 },
    ],
    stock: 60,
    rating: 4.9,
    reviewCount: 41,
    tags: ['linen', 'throw', 'blanket', 'cozy'],
    featured: true,
    newArrival: true,
    createdAt: ts(7),
    updatedAt: ts(2),
  },
  {
    name: 'Ceramic Pour-Over Coffee Set',
    slug: 'ceramic-pour-over-coffee-set',
    shortDescription: 'Handmade ceramic pour-over dripper and matching carafe in matte chalk finish.',
    description: 'Start your mornings right with our handmade ceramic pour-over set. Each piece is wheel-thrown by artisan potters and finished in a matte chalk glaze. The spiral dripper ensures an even, flavorful extraction. Set includes the pour-over filter, 600ml carafe, and one ceramic mug.',
    price: 72.00,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800'],
    category: 'Home & Living',
    subcategory: 'Kitchen',
    variants: [],
    stock: 18,
    rating: 4.7,
    reviewCount: 15,
    tags: ['coffee', 'ceramic', 'pour-over', 'kitchen'],
    featured: false,
    newArrival: true,
    createdAt: ts(10),
    updatedAt: ts(3),
  },

  {
    name: 'Minimalist Wooden Desk',
    slug: 'minimalist-wooden-desk',
    shortDescription: 'Solid oak minimalist desk with integrated cable management.',
    description: 'Create your perfect workspace with our solid oak minimalist desk. Featuring clean lines and a smooth finish, it includes a hidden compartment for seamless cable management. Built to last a lifetime.',
    price: 349.00,
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
    category: 'Home & Living',
    subcategory: 'Furniture',
    variants: [],
    stock: 12,
    rating: 4.9,
    reviewCount: 45,
    tags: ['desk', 'wood', 'furniture', 'office'],
    featured: true,
    newArrival: true,
    createdAt: ts(2),
    updatedAt: ts(1),
  },

  // ─── Apparel ────────────────────────────────────────────────────────────
  {
    name: 'Oversized Linen Shirt — Natural',
    slug: 'oversized-linen-shirt-natural',
    shortDescription: 'Relaxed-fit linen shirt in undyed natural — breathable, sustainable, and timeless.',
    description: 'Our signature oversized linen shirt is cut for effortless, relaxed wear. Made from undyed Belgian linen, it gets better with age and washing. The dropped shoulders and loose silhouette make it perfect layered over trousers or tucked into a skirt. Unisex sizing.',
    price: 95.00,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4238?w=800'],
    category: 'Apparel',
    subcategory: 'Tops',
    variants: [
      { id: 'a1', type: 'size', label: 'XS', value: 'XS', stock: 8 },
      { id: 'a2', type: 'size', label: 'S',  value: 'S',  stock: 14 },
      { id: 'a3', type: 'size', label: 'M',  value: 'M',  stock: 20 },
      { id: 'a4', type: 'size', label: 'L',  value: 'L',  stock: 16 },
      { id: 'a5', type: 'size', label: 'XL', value: 'XL', stock: 10 },
    ],
    stock: 68,
    rating: 4.8,
    reviewCount: 32,
    tags: ['linen', 'shirt', 'sustainable', 'unisex'],
    featured: true,
    newArrival: false,
    createdAt: ts(60),
    updatedAt: ts(15),
  },
  {
    name: 'Merino Wool Turtleneck',
    slug: 'merino-wool-turtleneck',
    shortDescription: 'Ultra-fine 100% merino wool turtleneck — warm, soft, and machine washable.',
    description: 'Our merino turtleneck is made from extra-fine 17.5 micron merino wool — impossibly soft against skin with no itch. The ribbed turtleneck keeps you warm without bulk. Available in four neutral tones. Machine washable on gentle cycle.',
    price: 128.00,
    images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800'],
    category: 'Apparel',
    subcategory: 'Knitwear',
    variants: [
      { id: 'b1', type: 'color', label: 'Ivory',    value: '#FFFFF0', stock: 12 },
      { id: 'b2', type: 'color', label: 'Camel',    value: '#C19A6B', stock: 10 },
      { id: 'b3', type: 'color', label: 'Charcoal', value: '#2C2C2C', stock: 14 },
      { id: 'b4', type: 'color', label: 'Navy',     value: '#1B2A4A', stock: 8  },
    ],
    stock: 44,
    rating: 4.9,
    reviewCount: 27,
    tags: ['merino', 'wool', 'knitwear', 'winter'],
    featured: false,
    newArrival: true,
    createdAt: ts(5),
    updatedAt: ts(1),
  },
  {
    name: 'Wide-Leg Linen Trousers',
    slug: 'wide-leg-linen-trousers',
    shortDescription: 'Effortlessly chic wide-leg trousers in breathable linen — summer essential.',
    description: 'Our wide-leg linen trousers strike the perfect balance between relaxed and refined. Cut from 100% linen with an elasticated waist for all-day comfort. The relaxed leg drapes beautifully and can be styled up or down. Available in Sand, Black, and Terracotta.',
    price: 115.00,
    images: ['https://images.unsplash.com/photo-1594938374182-a57ca2a43bd7?w=800'],
    category: 'Apparel',
    subcategory: 'Bottoms',
    variants: [
      { id: 't1', type: 'size', label: 'XS', value: 'XS', stock: 6 },
      { id: 't2', type: 'size', label: 'S',  value: 'S',  stock: 12 },
      { id: 't3', type: 'size', label: 'M',  value: 'M',  stock: 15 },
      { id: 't4', type: 'size', label: 'L',  value: 'L',  stock: 12 },
    ],
    stock: 45,
    rating: 4.7,
    reviewCount: 19,
    tags: ['linen', 'trousers', 'wide-leg', 'summer'],
    featured: false,
    newArrival: true,
    createdAt: ts(8),
    updatedAt: ts(2),
  },
  {
    name: 'Cashmere Blend Cardigan',
    slug: 'cashmere-blend-cardigan',
    shortDescription: '30% cashmere, 70% merino open-front cardigan in a relaxed, elevated silhouette.',
    description: 'Luxuriously soft and endlessly wearable, our cashmere blend cardigan is a wardrobe investment. The open-front design makes it easy to layer over anything, from a slip dress to tailored trousers. Ribbed cuffs and hem ensure a polished finish.',
    price: 195.00,
    compareAtPrice: 245.00,
    images: ['https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=800'],
    category: 'Apparel',
    subcategory: 'Knitwear',
    variants: [
      { id: 'k1', type: 'color', label: 'Oatmeal', value: '#D4C5A9', stock: 8 },
      { id: 'k2', type: 'color', label: 'Blush',   value: '#E8B4B8', stock: 6 },
    ],
    stock: 14,
    rating: 4.9,
    reviewCount: 9,
    tags: ['cashmere', 'cardigan', 'luxury', 'knitwear'],
    featured: true,
    newArrival: false,
    createdAt: ts(90),
    updatedAt: ts(20),
  },

  {
    name: 'Classic Denim Jacket',
    slug: 'classic-denim-jacket',
    shortDescription: 'Vintage wash denim jacket with a timeless fit.',
    description: 'A wardrobe staple, this vintage wash denim jacket offers a relaxed, comfortable fit perfect for layering. Made from 100% organic cotton denim, it gets softer with every wear.',
    price: 89.00,
    images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800'],
    category: 'Apparel',
    subcategory: 'Outerwear',
    variants: [
      { id: 'd1', type: 'size', label: 'S',  value: 'S',  stock: 10 },
      { id: 'd2', type: 'size', label: 'M',  value: 'M',  stock: 15 },
      { id: 'd3', type: 'size', label: 'L',  value: 'L',  stock: 12 },
    ],
    stock: 37,
    rating: 4.8,
    reviewCount: 56,
    tags: ['denim', 'jacket', 'outerwear', 'classic'],
    featured: true,
    newArrival: true,
    createdAt: ts(3),
    updatedAt: ts(1),
  },

  // ─── Accessories ─────────────────────────────────────────────────────────
  {
    name: 'Pebbled Leather Mini Tote',
    slug: 'pebbled-leather-mini-tote',
    shortDescription: 'Structured pebbled leather mini tote with top handles and detachable crossbody strap.',
    description: 'Our mini tote is crafted from full-grain pebbled leather with a refined structured silhouette. Interior features a zip pocket and two slip pockets. Comes with both short top handles and a long adjustable crossbody strap. Fits a tablet, wallet, and all your essentials.',
    price: 185.00,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800'],
    category: 'Accessories',
    subcategory: 'Bags',
    variants: [
      { id: 'bag1', type: 'color', label: 'Tan',    value: '#C19A6B', stock: 12 },
      { id: 'bag2', type: 'color', label: 'Black',  value: '#1A1A1A', stock: 8  },
      { id: 'bag3', type: 'color', label: 'Cream',  value: '#F9F3EB', stock: 5  },
    ],
    stock: 25,
    rating: 4.8,
    reviewCount: 31,
    tags: ['leather', 'bag', 'tote', 'accessories'],
    featured: true,
    newArrival: false,
    createdAt: ts(50),
    updatedAt: ts(8),
  },
  {
    name: 'Hammered Gold Hoop Earrings',
    slug: 'hammered-gold-hoop-earrings',
    shortDescription: 'Hand-hammered 14k gold-plated brass hoops in three sizes — everyday elegance.',
    description: 'Handcrafted by artisan jewelers, these hammered hoops catch the light beautifully with their textured finish. Available in 25mm, 35mm, and 50mm diameters. Made from brass with 14k gold plating — nickel-free and hypoallergenic. Secure click-close fastening.',
    price: 42.00,
    images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800'],
    category: 'Accessories',
    subcategory: 'Jewellery',
    variants: [
      { id: 'h1', type: 'size', label: 'Small (25mm)',  value: '25', stock: 20 },
      { id: 'h2', type: 'size', label: 'Medium (35mm)', value: '35', stock: 18 },
      { id: 'h3', type: 'size', label: 'Large (50mm)',  value: '50', stock: 12 },
    ],
    stock: 50,
    rating: 4.7,
    reviewCount: 44,
    tags: ['gold', 'earrings', 'jewellery', 'hoops'],
    featured: false,
    newArrival: false,
    createdAt: ts(120),
    updatedAt: ts(30),
  },
  {
    name: 'Raffia Sun Hat',
    slug: 'raffia-sun-hat',
    shortDescription: 'Wide-brim raffia sun hat with adjustable inner drawstring — your summer essential.',
    description: 'Handwoven from natural raffia, this wide-brim hat provides generous sun protection while looking effortlessly stylish. The adjustable inner drawstring ensures a secure fit. The supple brim can be shaped and folded for travel. One size fits most.',
    price: 58.00,
    images: ['https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800'],
    category: 'Accessories',
    subcategory: 'Hats',
    variants: [],
    stock: 32,
    rating: 4.6,
    reviewCount: 28,
    tags: ['raffia', 'hat', 'summer', 'accessories'],
    featured: false,
    newArrival: true,
    createdAt: ts(12),
    updatedAt: ts(3),
  },

  {
    name: 'Polarized Vintage Sunglasses',
    slug: 'polarized-vintage-sunglasses',
    shortDescription: 'Classic tortoiseshell sunglasses with polarized lenses.',
    description: 'Protect your eyes in style with these vintage-inspired tortoiseshell sunglasses. Featuring high-quality polarized lenses that block 100% of UVA/UVB rays while reducing glare.',
    price: 65.00,
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800'],
    category: 'Accessories',
    subcategory: 'Eyewear',
    variants: [],
    stock: 40,
    rating: 4.7,
    reviewCount: 38,
    tags: ['sunglasses', 'eyewear', 'vintage', 'accessories'],
    featured: true,
    newArrival: true,
    createdAt: ts(4),
    updatedAt: ts(2),
  },

  // ─── Stationery ──────────────────────────────────────────────────────────
  {
    name: 'Handbound Linen Journal',
    slug: 'handbound-linen-journal',
    shortDescription: 'A5 handbound journal with 200gsm cream pages, linen cover, and ribbon bookmark.',
    description: 'Our handbound linen journal is made to be written in, sketched in, and loved. Each book is bound by hand using the Coptic stitch method, allowing it to lay completely flat when open. 192 pages of 200gsm acid-free cream paper. Finished with a grosgrain ribbon bookmark and elastic closure.',
    price: 34.00,
    images: ['https://images.unsplash.com/photo-1512314889357-e157c22f938d?w=800'],
    category: 'Stationery',
    subcategory: 'Journals',
    variants: [
      { id: 'j1', type: 'color', label: 'Natural Linen', value: '#D4C5A9', stock: 25 },
      { id: 'j2', type: 'color', label: 'Sage Green',    value: '#7A9B6F', stock: 18 },
      { id: 'j3', type: 'color', label: 'Terracotta',    value: '#C17F5A', stock: 20 },
    ],
    stock: 63,
    rating: 4.9,
    reviewCount: 52,
    tags: ['journal', 'stationery', 'handbound', 'writing'],
    featured: true,
    newArrival: false,
    createdAt: ts(80),
    updatedAt: ts(12),
  },
  {
    name: 'Brass Desk Pen Set',
    slug: 'brass-desk-pen-set',
    shortDescription: 'Set of 3 weighty brass-finish pens with smooth gel ink — for the desk that inspires.',
    description: 'Our brass desk pen set adds a touch of understated luxury to any workspace. Each pen has a weighty, perfectly balanced feel thanks to the solid brass barrel. The ceramic-coated tip delivers an exceptionally smooth gel ink line. A thoughtful gift for anyone who appreciates the art of writing.',
    price: 46.00,
    images: ['https://images.unsplash.com/photo-1583521214690-73421a1829a9?w=800'],
    category: 'Stationery',
    subcategory: 'Writing',
    variants: [],
    stock: 38,
    rating: 4.6,
    reviewCount: 21,
    tags: ['pen', 'brass', 'stationery', 'desk'],
    featured: false,
    newArrival: false,
    createdAt: ts(100),
    updatedAt: ts(25),
  },
  {
    name: 'Terracotta Wax Seal Kit',
    slug: 'terracotta-wax-seal-kit',
    shortDescription: 'Artisan wax seal kit with brass Ovelia-motif stamp, 4 wax sticks, and melting spoon.',
    description: 'Add a personal, artisanal touch to your correspondence. Our terracotta wax seal kit includes a solid brass stamp with the Ovelia flower motif, four wax sticks in terracotta, cream, gold, and burgundy, and a melting spoon. Perfect for letters, invitations, and gift wrapping.',
    price: 28.00,
    images: ['https://images.unsplash.com/photo-1561461056-b4f4a8ef29fc?w=800'],
    category: 'Stationery',
    subcategory: 'Crafts',
    variants: [],
    stock: 55,
    rating: 4.8,
    reviewCount: 38,
    tags: ['wax seal', 'stationery', 'craft', 'gift'],
    featured: false,
    newArrival: true,
    createdAt: ts(14),
    updatedAt: ts(4),
  },
  {
    name: 'Linen Desk Organizer Set',
    slug: 'linen-desk-organizer-set',
    shortDescription: 'Set of 4 linen-wrapped desk organizers in varying sizes — tidy meets beautiful.',
    description: 'Keep your desk beautifully organized with our linen-wrapped organizer set. Four pieces in varying sizes accommodate pens, cards, paper clips, and more. The natural linen wrapping and rounded corners give them an elegant, artisanal feel. Made from recycled cardboard cores.',
    price: 52.00,
    images: ['https://images.unsplash.com/photo-1618015358954-4bde9ac35535?w=800'],
    category: 'Stationery',
    subcategory: 'Desk',
    variants: [],
    stock: 29,
    rating: 4.5,
    reviewCount: 16,
    tags: ['desk', 'organizer', 'linen', 'office'],
    featured: false,
    newArrival: false,
    createdAt: ts(55),
    updatedAt: ts(18),
  },
  {
    name: 'Premium Leather Notebook',
    slug: 'premium-leather-notebook',
    shortDescription: 'Full-grain leather bound notebook with dotted pages.',
    description: 'Capture your thoughts in this premium leather notebook. Made with full-grain leather that develops a beautiful patina over time. Contains 160 dotted pages of 120gsm fountain-pen friendly paper.',
    price: 45.00,
    images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
    category: 'Stationery',
    subcategory: 'Notebooks',
    variants: [
      { id: 'n1', type: 'color', label: 'Brown', value: '#8B4513', stock: 20 },
      { id: 'n2', type: 'color', label: 'Black', value: '#000000', stock: 15 },
    ],
    stock: 35,
    rating: 4.9,
    reviewCount: 82,
    tags: ['notebook', 'leather', 'stationery', 'writing'],
    featured: true,
    newArrival: true,
    createdAt: ts(1),
    updatedAt: ts(0),
  },
]

const promoCodes = [
  {
    code:         'WELCOME15',
    type:         'percentage',
    value:        15,
    minOrderValue:0,
    isActive:     true,
    usageCount:   0,
    maxUsage:     100,
    description:  'Welcome 15% off for new customers',
  },
  {
    code:         'SUMMER25',
    type:         'fixed',
    value:        25,
    minOrderValue:100,
    isActive:     true,
    usageCount:   0,
    description:  '$25 off orders over $100',
  },
  {
    code:         'FREESHIP',
    type:         'fixed',
    value:        6.99,
    minOrderValue:0,
    isActive:     true,
    usageCount:   0,
    description:  'Free standard shipping',
  },
]

async function seed() {
  console.log('🌱 Seeding Ovelia database...\n')

  // Seed products
  console.log('📦 Seeding products...')
  for (const product of products) {
    const ref = db.collection('products').doc()
    await ref.set({ id: ref.id, ...product })
    console.log(`  ✅ ${product.name}`)
  }

  // Seed promo codes
  console.log('\n🏷️  Seeding promo codes...')
  for (const code of promoCodes) {
    const ref = db.collection('promoCodes').doc()
    await ref.set({ id: ref.id, ...code })
    console.log(`  ✅ ${code.code}`)
  }

  console.log('\n🎉 Seed complete!')
  console.log(`   ${products.length} products seeded`)
  console.log(`   ${promoCodes.length} promo codes seeded`)
  console.log('\nNext steps:')
  console.log('  1. Create a Firebase Auth user (email/password) for your admin account')
  console.log('  2. Call the setAdminRole Cloud Function with that user\'s UID')
  console.log('  3. Run: npm run dev')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
