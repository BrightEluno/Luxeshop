export type Category = {
  id: string;
  name: string;
  image: any;
};

const categories: Category[] = [
  {
    id: "1",
    name: "Electronic",
    image: require("../assets/images/electronic.png"),
  },
  {
    id: "2",
    name: "Food",
    image: require("../assets/images/food.png"),
  },
  {
    id: "3",
    name: "Accessories",
    image: require("../assets/images/accesories.png"),
  },
  {
    id: "4",
    name: "Beauty",
    image: require("../assets/images/beauty.png"),
  },
  {
    id: "5",
    name: "Furniture",
    image: require("../assets/images/furniture.png"),
  },
  {
    id: "6",
    name: "Fashion",
    image: require("../assets/images/fashion.png"),
  },
  {
    id: "7",
    name: "Health",
    image: require("../assets/images/health.png"),
  },
  {
    id: "8",
    name: "Stationery",
    image: require("../assets/images/stationery.png"),
  },
];

export default categories;
