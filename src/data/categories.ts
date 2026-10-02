export type Category = {
  id: string;
  /** Used in URLs (/category/<slug>) and on Product.category */
  slug: string;
  name: string;
  description: string;
  /** 3D icon (Microsoft Fluent Emoji, MIT licence) */
  image: any;
  /** Soft background colour behind the icon */
  tint: string;
};

const categories: Category[] = [
  {
    id: "1",
    slug: "electronic",
    name: "Electronic",
    description: "Phones, laptops, tablets and audio",
    image: require("../assets/images/categories/electronic.png"),
    tint: "#E7F0FF",
  },
  {
    id: "2",
    slug: "food",
    name: "Food",
    description: "Fresh groceries and pantry favourites",
    image: require("../assets/images/categories/food.png"),
    tint: "#FFE9E6",
  },
  {
    id: "3",
    slug: "accessories",
    name: "Accessories",
    description: "Watches, bags, sunglasses and jewellery",
    image: require("../assets/images/categories/accessories.png"),
    tint: "#ECEBFF",
  },
  {
    id: "4",
    slug: "beauty",
    name: "Beauty",
    description: "Make-up and fragrances",
    image: require("../assets/images/categories/beauty.png"),
    tint: "#FFE8F1",
  },
  {
    id: "5",
    slug: "furniture",
    name: "Furniture",
    description: "Furniture and home decor",
    image: require("../assets/images/categories/furniture.png"),
    tint: "#FFF4DC",
  },
  {
    id: "6",
    slug: "fashion",
    name: "Fashion",
    description: "Shirts, dresses and shoes",
    image: require("../assets/images/categories/fashion.png"),
    tint: "#E3F4FF",
  },
  {
    id: "7",
    slug: "health",
    name: "Health",
    description: "Skin care and nutrition",
    image: require("../assets/images/categories/health.png"),
    tint: "#E4F7EE",
  },
  {
    id: "8",
    slug: "sports",
    name: "Sports",
    description: "Balls, rackets and sports gear",
    image: require("../assets/images/categories/sports.png"),
    tint: "#FFEDE3",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export default categories;
