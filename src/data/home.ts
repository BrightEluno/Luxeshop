export const promoBanner = {
  title: "6.6 Flash Sale",
  subtitle: "Get up to 50% off your favourite items",
  buttonText: "Shop Now",
};

export const flashSale = {
  endsIn: "02 : 12 : 56",
};

export type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  sold: number;
  discountPercent: number;
  image: any;
};

export const flashSaleProducts: Product[] = [
  {
    id: "1",
    name: "Apple Watch Series 7",
    price: 299.99,
    rating: 4.8,
    sold: 1200,
    discountPercent: 25,
    image: require("../assets/images/watch-Ultra2.png"),
  },
  {
    id: "2",
    name: "iPhone 16 Pro Max",
    price: 999.0,
    rating: 4.9,
    sold: 980,
    discountPercent: 17,
    image: require("../assets/images/iphone-17-pro.png"),
  },
  {
    id: "3",
    name: "MacBook Air 13.6 inch M4 chip 2023",
    price: 59.99,
    rating: 4.7,
    sold: 2100,
    discountPercent: 33,
    image: require("../assets/images/MacBook-Air.png"),
  },
  {
    id: "4",
    name: "iPad Pro 6th generation 11 inch 2022",
    price: 799.0,
    rating: 4.7,
    sold: 2100,
    discountPercent: 33,
    image: require("../assets/images/ipad_pro.jpg"),
  },
  {
    id: "6",
    name: "iPhone 16e",
    price: 599.0,
    rating: 4.9,
    sold: 980,
    discountPercent: 23,
    image: require("../assets/images/iphone_16e.png"),
  },
  {
    id: "7",
    name: "Galaxy S25 5G",
    price: 899.0,
    rating: 4.9,
    sold: 980,
    discountPercent: 20,
    image: require("../assets/images/Samsung-s23.png"),
  },

];
