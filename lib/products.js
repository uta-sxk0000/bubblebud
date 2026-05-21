const productAsset = (folder, file) => `/assets/products/${folder}/${file}`;

export const categories = [
  {
    name: "Accessories",
    slug: "accessories",
    image: "/assets/collection-loved.jpg",
    copy: "Soft daily carry pieces with polished details.",
  },
  {
    name: "Beauty",
    slug: "beauty",
    image: "/assets/collection-makeup.png",
    copy: "Travel-ready cosmetic storage for everyday routines.",
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    image: "/assets/collection-flowers.png",
    copy: "Giftable pieces that make small spaces feel warmer.",
  },
  {
    name: "Tech",
    slug: "tech",
    image: "/assets/product-night-light.jpg",
    copy: "Useful desk and bedside finds with a soft glow.",
  },
  {
    name: "Home Essentials",
    slug: "home",
    image: "/assets/promo-plush.jpg",
    copy: "Easy upgrades for cozy modern living.",
  },
  {
    name: "Plushies",
    slug: "plushies",
    image: "/assets/products/soft-plush-costume-hello-kitty-12-inches/01.jpg",
    copy: "Giftable plush friends with a premium soft feel.",
  },
];

export const products = [
  {
    id: "hello-kitty-plush-12",
    slug: "soft-plush-costume-hello-kitty-12-inches",
    title: "Soft-Plush Costume Hello Kitty 12 inch",
    category: "Plushies",
    price: 26.99,
    compareAt: 35.99,
    badge: "New Arrival",
    rating: 5,
    reviewCount: 64,
    colors: ["Classic Hello Kitty"],
    variants: ["12 inch plush"],
    tags: ["hello kitty", "plushies", "sanrio", "gift", "doll", "new"],
    description:
      "Meet the BubbleBud 12 inch Hello Kitty plushie, a snuggly friend crafted with soft, high-quality materials and sweet character details.",
    details: [
      "12 inch huggable plush size",
      "Soft costume-style Hello Kitty design",
      "Gift-ready for birthdays, holidays, and just-because surprises",
      "Made for beds, desks, cozy corners, and collectors",
    ],
    care: "Spot clean gently with a damp cloth. Air dry completely before display or storage.",
    shipping: "Ships in 1-3 business days. Delivery timing depends on your location.",
    reviews: [
      {
        id: "hello-kitty-plush-12-r1",
        name: "Sophia",
        rating: 5,
        title: "So soft and giftable",
        body: "The plush feels soft, the size is perfect for hugging, and it looks adorable on a bed or shelf.",
        date: "2026-05-20",
        verified: true,
      },
      {
        id: "hello-kitty-plush-12-r2",
        name: "Ariana",
        rating: 5,
        title: "Perfect Hello Kitty surprise",
        body: "Bought it as a gift and it instantly felt special. The costume detail makes it extra cute.",
        date: "2026-05-18",
        verified: true,
      },
    ],
    gallery: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg"].map((file) =>
      productAsset("soft-plush-costume-hello-kitty-12-inches", file)
    ),
  },
  {
    id: "laptop-14",
    slug: "quilted-floral-laptop-bag-14x10-inches-zipper-closure",
    title: "Quilted Floral Laptop Bag 14x10 Inches",
    category: "Accessories",
    price: 15.96,
    compareAt: 25.67,
    badge: "Best Seller",
    rating: 5,
    reviewCount: 182,
    colors: ["Blush floral", "Pearl cream"],
    variants: ["14 x 10 inches"],
    tags: ["laptop", "bag", "floral", "accessories", "best seller"],
    description:
      "A soft quilted laptop sleeve with a sweet floral print, padded body, and smooth zipper closure for everyday school, work, and travel days.",
    details: ["14 x 10 inch fit", "Padded quilted fabric", "Secure top zipper", "Lightweight floral exterior"],
    care: "Spot clean gently with a damp cloth and air dry flat.",
    shipping: "Ships in 1-3 business days. Delivery timing depends on your region.",
    reviews: [
      {
        id: "laptop-14-r1",
        name: "Avery",
        rating: 5,
        title: "Exactly like the pictures",
        body: "The padding feels soft and the zipper runs smoothly. It fits my laptop with a little room for a notebook.",
        date: "2026-04-18",
        verified: true,
      },
      {
        id: "laptop-14-r2",
        name: "Jasmine",
        rating: 5,
        title: "Cute and practical",
        body: "The floral print is adorable without feeling too loud. I use it for school every day.",
        date: "2026-03-29",
        verified: true,
      },
    ],
    gallery: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg", "07.jpg", "08.jpg"].map((file) =>
      productAsset("quilted-floral-laptop-bag-14x10-inches-zipper-closure", file)
    ),
  },
  {
    id: "makeup-8",
    slug: "portable-makeup-bag-travel-cosmetic-bag-8-inches",
    title: "Portable Makeup Bag Travel Cosmetic Bag",
    category: "Beauty",
    price: 15.76,
    compareAt: 23.67,
    badge: "New",
    rating: 4.8,
    reviewCount: 146,
    colors: ["Soft pink", "Cream"],
    variants: ["8 inches"],
    tags: ["makeup", "beauty", "travel", "pouch", "new"],
    description:
      "A compact travel cosmetic pouch made for little essentials: lip balm, gloss, skincare minis, brushes, and the tiny things that disappear in bigger bags.",
    details: ["8 inch travel size", "Soft quilted pouch", "Roomy single compartment", "Easy-grip zipper pull"],
    care: "Wipe clean with mild soap. Do not machine wash.",
    shipping: "Ships in 1-3 business days with tracking after fulfillment.",
    reviews: [
      {
        id: "makeup-8-r1",
        name: "Mia",
        rating: 5,
        title: "Perfect little makeup bag",
        body: "It holds my lip gloss, mini lotion, blush, and a few brushes. The fabric feels soft and pretty.",
        date: "2026-04-23",
        verified: true,
      },
      {
        id: "makeup-8-r2",
        name: "Nora",
        rating: 4,
        title: "Sweet travel pouch",
        body: "Super cute for my purse. I wish it had one tiny inside pocket, but I still love it.",
        date: "2026-04-05",
        verified: true,
      },
    ],
    gallery: ["01.png", "02.png", "03.png", "04.png", "05.png", "06.png", "07.png", "08.png", "09.png", "10.png"].map((file) =>
      productAsset("portable-makeup-bag-travel-cosmetic-bag-8-inches", file)
    ),
  },
  {
    id: "purple-bouquet",
    slug: "crochet-rose-flower-bouquet-gift-with-fairy-lights-16-inches",
    title: "Crochet Rose Flower Bouquet with Fairy Lights",
    category: "Lifestyle",
    price: 49.99,
    compareAt: 55.64,
    badge: "Gift Pick",
    rating: 5,
    reviewCount: 98,
    colors: ["Purple mix", "Colorful"],
    variants: ["16 inches"],
    tags: ["bouquet", "gift", "flowers", "lifestyle", "fairy lights"],
    description:
      "A handmade-style crochet rose bouquet wrapped as a keepsake gift. It gives the feeling of fresh flowers, without the wilting.",
    details: ["Approx. 16 inches tall", "Crochet rose blooms", "Gift-ready wrapping", "Warm fairy light accent"],
    care: "Keep dry and dust lightly. Remove or protect batteries before storage.",
    shipping: "Made with care and packed securely before shipping.",
    reviews: [
      {
        id: "purple-bouquet-r1",
        name: "Sofia",
        rating: 5,
        title: "Beautiful gift",
        body: "I sent this for a birthday and it looked so thoughtful. The lights made it feel extra special.",
        date: "2026-04-12",
        verified: true,
      },
      {
        id: "purple-bouquet-r2",
        name: "Emily",
        rating: 5,
        title: "Keepsake flowers",
        body: "I wanted flowers that would last. The bouquet is colorful and looks lovely on my desk.",
        date: "2026-03-18",
        verified: true,
      },
    ],
    gallery: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.png", "06.png", "07.jpg", "08.jpg", "09.jpg", "10.jpg", "11.jpg"].map((file) =>
      productAsset(
        "crochet-rose-flower-bouquet-gift-for-valentines-day-mothers-day-birthday-wedding-home-decor-handmade-artificial-knitting-flowers-decoration-colorful",
        file
      )
    ),
  },
  {
    id: "small-bouquet",
    slug: "crochet-rose-flower-bouquet-small",
    title: "Crochet Rose Flower Bouquet Gift - Small",
    category: "Lifestyle",
    price: 12.99,
    compareAt: 19.79,
    badge: "Under $15",
    rating: 4.7,
    reviewCount: 74,
    colors: ["Pink mix", "Cream wrap"],
    variants: ["Small"],
    tags: ["bouquet", "gift", "flowers", "small", "home"],
    description:
      "A petite crochet flower bouquet for desks, birthdays, care packages, and everyday reminders that someone is loved.",
    details: ["Small hand-held size", "Crochet flower arrangement", "Decorative paper wrap", "Lightweight keepsake gift"],
    care: "Keep away from water and direct heat. Dust gently when needed.",
    shipping: "Ships carefully wrapped to help protect the bouquet shape.",
    reviews: [
      {
        id: "small-bouquet-r1",
        name: "Kayla",
        rating: 5,
        title: "Adorable mini bouquet",
        body: "It is small, sweet, and perfect for a care package. The wrapping looks gift-ready.",
        date: "2026-04-27",
        verified: true,
      },
      {
        id: "small-bouquet-r2",
        name: "Lena",
        rating: 4,
        title: "Very cute",
        body: "The colors are soft and pretty. It made my shelf look so cozy.",
        date: "2026-03-31",
        verified: true,
      },
    ],
    gallery: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg"].map((file) =>
      productAsset("crochet-rose-flower-bouquet-small", file)
    ),
  },
  {
    id: "night-light",
    slug: "bubblebud-3d-led-night-light-with-erasable-pen",
    title: "BubbleBud 3D LED Night Light",
    category: "Tech",
    price: 7.64,
    compareAt: 29.99,
    badge: "Sale",
    rating: 4.6,
    reviewCount: 211,
    colors: ["Warm glow"],
    variants: ["USB base"],
    tags: ["night light", "tech", "desk", "led", "sale"],
    description:
      "A cute acrylic LED night light with a write-on surface, perfect for desk notes, bedside reminders, and small glowing messages.",
    details: ["LED acrylic display", "Includes erasable pen", "USB-powered base", "Soft room-friendly glow"],
    care: "Clean acrylic with a microfiber cloth. Use only dry-erase style markers.",
    shipping: "Ships in 1-3 business days. USB cable included when available.",
    reviews: [
      {
        id: "night-light-r1",
        name: "Riley",
        rating: 5,
        title: "Fun desk light",
        body: "The glow is soft and the erasable pen is such a cute touch for little notes.",
        date: "2026-04-02",
        verified: true,
      },
      {
        id: "night-light-r2",
        name: "Hannah",
        rating: 4,
        title: "Nice night light",
        body: "It is brighter than I expected but still cozy. Looks cute near my vanity.",
        date: "2026-03-25",
        verified: true,
      },
    ],
    gallery: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg", "07.jpg", "08.jpg", "09.jpg", "10.jpg", "11.jpg", "12.jpg", "13.jpg", "14.jpg", "15.jpg"].map((file) =>
      productAsset("bubblebud-3d-led-night-light-with-erasable-pen", file)
    ),
  },
  {
    id: "makeup-9",
    slug: "makeup-bag-9-inches-travel-cosmetic-bag-for-women",
    title: "Makeup Bag 9-Inches Travel Cosmetic Bag",
    category: "Beauty",
    price: 16.82,
    badge: "Travel Favorite",
    rating: 4.9,
    reviewCount: 128,
    colors: ["Blush floral", "Neutral"],
    variants: ["9 inches"],
    tags: ["makeup", "beauty", "travel", "cosmetic", "bag"],
    description:
      "A slightly larger travel pouch with a soft quilted look and enough room for daily cosmetics, skincare, and small accessories.",
    details: ["9 inch travel size", "Quilted soft-sided body", "Zipper closure", "Great for bags, drawers, and carry-ons"],
    care: "Spot clean only. Let dry completely before use.",
    shipping: "Ships in 1-3 business days from the current store stock.",
    reviews: [
      {
        id: "makeup-9-r1",
        name: "Isabella",
        rating: 5,
        title: "Roomy but still compact",
        body: "This size is perfect for my everyday cosmetics. It feels light but not flimsy.",
        date: "2026-04-09",
        verified: true,
      },
      {
        id: "makeup-9-r2",
        name: "Tara",
        rating: 5,
        title: "Love the quilted look",
        body: "I keep it in my tote and it makes everything easier to find.",
        date: "2026-03-16",
        verified: true,
      },
    ],
    gallery: ["01.png", "02.jpg", "03.png", "04.jpg", "05.png"].map((file) =>
      productAsset("makeup-bag-9-inches-travel-cosmetic-bag-for-women", file)
    ),
  },
  {
    id: "laptop-12",
    slug: "quilted-floral-laptop-bag-12x10-inches-zipper-closure",
    title: "Quilted Floral Laptop Bag 12x10 Inches",
    category: "Accessories",
    price: 22.87,
    badge: "Low Stock",
    rating: 4.8,
    reviewCount: 86,
    colors: ["Floral pink"],
    variants: ["12 x 10 inches"],
    tags: ["laptop", "tablet", "bag", "accessories", "floral"],
    description:
      "A floral quilted sleeve for smaller laptops and tablets, built to keep tech tidy without losing the soft BubbleBud look.",
    details: ["12 x 10 inch fit", "Padded floral quilting", "Smooth zipper closure", "Slim enough for backpacks"],
    care: "Spot clean gently and avoid soaking the padding.",
    shipping: "Ships in 1-3 business days. Packed flat where possible.",
    reviews: [
      {
        id: "laptop-12-r1",
        name: "Mei",
        rating: 5,
        title: "Great tablet sleeve",
        body: "I use it for my tablet and planner. The zipper feels secure and the print is really sweet.",
        date: "2026-04-14",
        verified: true,
      },
      {
        id: "laptop-12-r2",
        name: "Brooke",
        rating: 4,
        title: "Pretty and useful",
        body: "Good padding for the price. It fits nicely in my backpack.",
        date: "2026-03-22",
        verified: true,
      },
    ],
    gallery: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg"].map((file) =>
      productAsset("quilted-floral-laptop-bag-12x10-inches-zipper-closure", file)
    ),
  },
  {
    id: "flower-lights-11",
    slug: "crochet-rose-flower-bouquet-with-fairy-lights-11-inches",
    title: "Crochet Rose Flower Bouquet with Fairy Lights",
    category: "Home Essentials",
    price: 17.89,
    badge: "Trending",
    rating: 5,
    reviewCount: 119,
    colors: ["Rose mix", "Warm lights"],
    variants: ["11 inches"],
    tags: ["flowers", "gift", "home", "lights", "trending"],
    description:
      "A mini crochet rose bouquet with a gentle light accent, made for shelves, bedside tables, dorm rooms, and thoughtful gifting.",
    details: ["Approx. 11 inches tall", "Crochet flower stems", "Decorative wrap", "Optional fairy light styling"],
    care: "Keep dry and store away from heavy objects to preserve the bouquet shape.",
    shipping: "Ships securely wrapped to reduce bending during transit.",
    reviews: [
      {
        id: "flower-lights-11-r1",
        name: "Paige",
        rating: 5,
        title: "So charming",
        body: "The mini lights make it feel magical. It was a sweet gift for my roommate.",
        date: "2026-04-20",
        verified: true,
      },
      {
        id: "flower-lights-11-r2",
        name: "Clara",
        rating: 5,
        title: "Perfect small gift",
        body: "Cute size, pretty colors, and it looks handmade in the best way.",
        date: "2026-03-28",
        verified: true,
      },
    ],
    gallery: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg", "07.jpg", "08.jpg"].map((file) =>
      productAsset("crochet-rose-flower-bouquet-with-fairy-lights-11-inches", file)
    ),
  },
].map((product) => ({
  ...product,
  rating: 0,
  reviewCount: 0,
  reviews: [],
  image: product.gallery[0],
  hoverImage: product.gallery[1] || product.gallery[0],
  url: `/products/${product.slug}`,
}));

export const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product, count = 4) {
  return products
    .filter((item) => item.id !== product.id)
    .sort((a, b) => {
      const categoryScore = Number(b.category === product.category) - Number(a.category === product.category);
      if (categoryScore) return categoryScore;
      return b.rating - a.rating;
    })
    .slice(0, count);
}

export function getReviewSummary(product, extraReviews = []) {
  const reviews = [...(extraReviews || []), ...(product.reviews || [])];
  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return {
    average: reviews.length ? total / reviews.length : product.rating || 0,
    count: reviews.length || product.reviewCount || 0,
  };
}
