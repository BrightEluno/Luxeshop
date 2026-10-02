export type StorageOption = {
  label: string;
  price: number;
};

export type ColorOption = {
  name: string;
  hex: string;
  /** Product photo in this colour */
  image: any;
};

export type ProductReview = {
  user: string;
  rating: number;
  comment: string;
};

export type Product = {
  id: string;
  name: string;
  brand?: string;
  /** Category slug, see src/data/categories.ts */
  category: string;
  /** Starting price (cheapest storage option) in GBP, after any discount */
  price: number;
  /** Price before the discount; shown crossed out when set */
  originalPrice?: number;
  /** Units available; 0 means sold out */
  stock: number;
  rating: number;
  sold: number;
  discountPercent: number;
  /** Thumbnail used in lists; for products with colours, the first colour's image */
  image: any;
  isNew?: boolean;
  description?: string;
  /** Omit for products without storage options (e.g. watches) */
  storage?: StorageOption[];
  /** Omit for products that come in a single finish */
  colors?: ColorOption[];
  /** Extra gallery photos for products without colour options */
  images?: any[];
  reviews?: ProductReview[];
};

const iphone18ProColors: ColorOption[] = [
  { name: "Burgundy", hex: "#42242B", image: require("../assets/images/products/iphone-18-pro/burgundy.png") },
  { name: "Black", hex: "#19191A", image: require("../assets/images/products/iphone-18-pro/black.png") },
  { name: "Silver", hex: "#CFCFCE", image: require("../assets/images/products/iphone-18-pro/silver.png") },
  { name: "Glacier", hex: "#98A5B8", image: require("../assets/images/products/iphone-18-pro/glacier.png") },
];

const iphone18ProMaxColors: ColorOption[] = [
  { name: "Burgundy", hex: "#42242B", image: require("../assets/images/products/iphone-18-pro-max/burgundy.png") },
  { name: "Black", hex: "#19191A", image: require("../assets/images/products/iphone-18-pro-max/black.png") },
  { name: "Silver", hex: "#CFCFCE", image: require("../assets/images/products/iphone-18-pro-max/silver.png") },
  { name: "Glacier", hex: "#98A5B8", image: require("../assets/images/products/iphone-18-pro-max/glacier.png") },
];

const iphoneDuoColors: ColorOption[] = [
  { name: "Night Sky", hex: "#323C48", image: require("../assets/images/products/iphone-duo/nightsky.png") },
  { name: "Star White", hex: "#E4E2E0", image: require("../assets/images/products/iphone-duo/starwhite.png") },
];

// Swatch colours taken from Samsung's own colour chips
const galaxyS26UltraColors: ColorOption[] = [
  { name: "Cobalt Violet", hex: "#686884", image: require("../assets/images/products/galaxy-s26-ultra/cobalt-violet.png") },
  { name: "Black", hex: "#494D53", image: require("../assets/images/products/galaxy-s26-ultra/black.png") },
  { name: "Sky Blue", hex: "#B3CBD9", image: require("../assets/images/products/galaxy-s26-ultra/sky-blue.png") },
  { name: "White", hex: "#F3F4F5", image: require("../assets/images/products/galaxy-s26-ultra/white.png") },
  { name: "Pink Gold", hex: "#EAD2C6", image: require("../assets/images/products/galaxy-s26-ultra/pink-gold.png") },
  { name: "Silver Shadow", hex: "#C7C8CA", image: require("../assets/images/products/galaxy-s26-ultra/silver-shadow.png") },
];

const galaxyZFold8UltraColors: ColorOption[] = [
  { name: "Violet Shadow", hex: "#564C5C", image: require("../assets/images/products/galaxy-z-fold8-ultra/violet-shadow.png") },
  { name: "Graphite", hex: "#5F6367", image: require("../assets/images/products/galaxy-z-fold8-ultra/graphite.png") },
  { name: "Green Shadow", hex: "#3B4E47", image: require("../assets/images/products/galaxy-z-fold8-ultra/green-shadow.png") },
  { name: "Cream", hex: "#F1F1EE", image: require("../assets/images/products/galaxy-z-fold8-ultra/cream.png") },
];

const galaxyZFold8Colors: ColorOption[] = [
  { name: "Graphite", hex: "#5F6367", image: require("../assets/images/products/galaxy-z-fold8/graphite.png") },
  { name: "Cream", hex: "#F1F1EE", image: require("../assets/images/products/galaxy-z-fold8/cream.png") },
  { name: "Lavender", hex: "#BCB7CA", image: require("../assets/images/products/galaxy-z-fold8/lavender.png") },
  { name: "Pistachio", hex: "#ABC4C0", image: require("../assets/images/products/galaxy-z-fold8/pistachio.png") },
];

// UK RRPs (SIM-free, inc. VAT) as of October 2026
export const flashSaleProducts: Product[] = [
  {
    id: "8",
    name: "iPhone 18 Pro",
    category: "electronic",
    price: 1199.0,
    rating: 4.9,
    sold: 640,
    discountPercent: 0,
    stock: 42,
    isNew: true,
    image: iphone18ProColors[0].image,
    description:
      "Apple's newest Pro iPhone, announced September 2026. 6.3-inch display, A20 Pro chip and a triple-camera system.",
    storage: [
      { label: "256GB", price: 1199.0 },
      { label: "512GB", price: 1399.0 },
      { label: "1TB", price: 1799.0 },
      { label: "2TB", price: 2399.0 },
    ],
    colors: iphone18ProColors,
  },
  {
    id: "9",
    name: "iPhone 18 Pro Max",
    category: "electronic",
    price: 1299.0,
    rating: 4.9,
    sold: 870,
    discountPercent: 0,
    stock: 35,
    isNew: true,
    image: iphone18ProMaxColors[0].image,
    description:
      "The biggest Pro iPhone, announced September 2026. 6.9-inch display, A20 Pro chip and Apple's longest battery life.",
    storage: [
      { label: "256GB", price: 1299.0 },
      { label: "512GB", price: 1499.0 },
      { label: "1TB", price: 1899.0 },
      { label: "2TB", price: 2499.0 },
    ],
    colors: iphone18ProMaxColors,
  },
  {
    id: "10",
    name: "iPhone Duo",
    category: "electronic",
    price: 1999.0,
    rating: 4.8,
    sold: 210,
    discountPercent: 0,
    stock: 4,
    isNew: true,
    image: iphoneDuoColors[0].image,
    description:
      "Apple's first foldable iPhone. 5.4-inch outer display that opens to a 7.6-inch inner display, with a titanium frame.",
    storage: [
      { label: "256GB", price: 1999.0 },
      { label: "512GB", price: 2199.0 },
      { label: "1TB", price: 2599.0 },
      { label: "2TB", price: 3199.0 },
    ],
    colors: iphoneDuoColors,
  },
  {
    id: "11",
    name: "Galaxy S26 Ultra",
    category: "electronic",
    price: 1359.0,
    rating: 4.8,
    sold: 1540,
    discountPercent: 0,
    stock: 60,
    isNew: true,
    image: galaxyS26UltraColors[0].image,
    description:
      "Samsung's flagship for 2026 with a built-in S Pen, 200MP camera and Galaxy AI.",
    storage: [
      { label: "256GB", price: 1359.0 },
      { label: "512GB", price: 1529.0 },
      { label: "1TB", price: 1859.0 },
    ],
    colors: galaxyS26UltraColors,
  },
  {
    id: "12",
    name: "Galaxy Z Fold8 Ultra",
    category: "electronic",
    price: 1899.0,
    rating: 4.8,
    sold: 430,
    discountPercent: 0,
    stock: 3,
    isNew: true,
    image: galaxyZFold8UltraColors[0].image,
    description:
      "Samsung's premium foldable. 8.0-inch inner display with a near-invisible crease and a 200MP triple camera.",
    storage: [
      { label: "256GB", price: 1899.0 },
      { label: "512GB", price: 2069.0 },
      { label: "1TB", price: 2409.0 },
    ],
    colors: galaxyZFold8UltraColors,
  },
  {
    id: "13",
    name: "Galaxy Z Fold8",
    category: "electronic",
    price: 1699.0,
    rating: 4.7,
    sold: 520,
    discountPercent: 0,
    stock: 25,
    isNew: true,
    image: galaxyZFold8Colors[0].image,
    description:
      "Samsung's 2026 foldable with a 7.6-inch inner display and the new crease-free Flex Titanium screen.",
    storage: [{ label: "256GB", price: 1699.0 }],
    colors: galaxyZFold8Colors,
  },
  {
    id: "1",
    name: "Apple Watch Ultra 2",
    category: "electronic",
    price: 599.0,
    originalPrice: 799.0,
    rating: 4.8,
    sold: 1200,
    discountPercent: 25,
    stock: 12,
    image: require("../assets/images/watch-Ultra2.png"),
  },
  {
    id: "3",
    name: "MacBook Air 13-inch (M4, 2025)",
    category: "electronic",
    price: 899.0,
    originalPrice: 999.0,
    rating: 4.7,
    sold: 2100,
    discountPercent: 10,
    stock: 9,
    image: require("../assets/images/MacBook-Air.png"),
  },
  {
    id: "4",
    name: "iPad Pro 11-inch (M4)",
    category: "electronic",
    price: 799.0,
    originalPrice: 999.0,
    rating: 4.7,
    sold: 2100,
    discountPercent: 20,
    stock: 0,
    image: require("../assets/images/ipad-pro-m4.png"),
  },
];
