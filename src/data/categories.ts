export type Category = {
  id: string;
  name: string;
  icon:
    | "grid-outline"
    | "phone-portrait-outline"
    | "watch-outline"
    | "shirt-outline"
    | "headset-outline"
    | "bag-outline"
    | "football-outline"
    | "pricetag-outline";
};

export const categories: Category[] = [
  { id: "1", name: "Category", icon: "grid-outline" },
  { id: "2", name: "Electronics", icon: "phone-portrait-outline" },
  { id: "3", name: "Watch", icon: "watch-outline" },
  { id: "4", name: "Fashion", icon: "shirt-outline" },
  { id: "5", name: "Headset", icon: "headset-outline" },
  { id: "6", name: "Shoes", icon: "football-outline" },
  { id: "7", name: "Bag", icon: "bag-outline" },
  { id: "8", name: "Voucher", icon: "pricetag-outline" },
];
