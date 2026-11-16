// First-run data. The products are SAMPLES based on the Instagram posts;
// Sathya replaces names, prices, costs and photos from the admin panel.

export const CATEGORIES = [
  { slug: 'hair-clips', name: 'Hair Clips' },
  { slug: 'jewellery', name: 'Jewellery' },
  { slug: 'bangles-earrings', name: 'Bangles & Earrings' },
  { slug: 'chocolate-bouquets', name: 'Chocolate Bouquets' },
  { slug: 'gift-hampers', name: 'Gift Hampers' },
  { slug: 'combos', name: 'Combos & Mystery Packs' },
];

export const DEFAULT_SETTINGS = {
  shopName: 'Sathya Klassy Fashion',
  tagline: 'Cute. Trendy. Affordable.',
  announcement: 'Shipping all over India · Free shipping above ₹499',
  upiId: '',
  upiName: 'Sathya Klassy Fashion',
  whatsapp: '',
  instagram: 'sathya_klassy_fashion',
  email: '',
  shippingFee: 60,
  freeShippingAbove: 499,
  lowStockAt: 3,
  dispatchDays: '1–2',
  deliveryDays: '3–7',
};

const p = (name, category, price, mrp, cost, stock, tag, description, featured = false) => ({
  name, category, price, mrp, cost, stock, tag, description, featured, sample: true,
});

export const SAMPLE_PRODUCTS = [
  p('Mini Flower Clip Combo', 'hair-clips', 49, 79, 18, 40, 'BESTSELLER',
    'Set of small matte flower clips in soft pastel shades. Light, strong grip, perfect for daily wear and college.', true),
  p('5 pc Sunflower Clip Combo', 'hair-clips', 99, 149, 38, 30, 'COMBO',
    'Five bright sunflower claw clips in mixed colours. Great for half-up styles and gifting to friends.', true),
  p('Matte Rectangle Claw Clip', 'hair-clips', 99, 149, 35, 25, 'NEW',
    'Large matte claw clip that holds thick hair all day. Available in nude, brown and grey.'),
  p('Heart Claw Clip Set', 'hair-clips', 149, 199, 55, 20, 'TRENDING',
    'Cute heart-shaped claw clips in chocolate and blush tones. Set of 4.'),
  p('Daily Wear Pendant Chain', 'jewellery', 199, 299, 70, 15, 'NEW',
    'Delicate gold-tone chain with a small pendant. Anti-tarnish finish, light for everyday wear.', true),
  p('Bangles & Earrings Gift Box', 'bangles-earrings', 299, 399, 120, 12, 'GIFT',
    'A box of colourful bangles with matching earrings, packed ready to gift.'),
  p('Chocolate Bouquet', 'chocolate-bouquets', 699, 899, 380, 8, 'GIFTING',
    'Hand-made bouquet with Dairy Milk chocolates and roses. Add a free personal note at checkout.', true),
  p('Mystery Chocolate Pack', 'combos', 299, 399, 160, 20, 'MYSTERY',
    'A surprise pack of chocolates and a cute accessory. Every pack is different!'),
  p('Birthday Gift Hamper', 'gift-hampers', 999, 1299, 560, 6, 'BESTSELLER',
    'Pink hamper box with chocolates, a scrunchie, clips, a mini teddy and a birthday card.', true),
  p('His Royal Hamper', 'gift-hampers', 1299, 1599, 720, 5, 'FOR HIM',
    'Premium purple hamper for him with chocolates, wallet, perfume and a personal note.'),
  p('Cup Combo Gift', 'gift-hampers', 349, 449, 170, 10, 'COMBO',
    'Printed cup filled with chocolates and a flower clip, wrapped with ribbon.'),
];
