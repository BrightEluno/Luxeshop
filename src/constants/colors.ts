export type Palette = {
  /** Screen background */
  background: string;
  /** Cards, buttons and bars that sit on the background */
  surface: string;
  text: string;
  gray: string;
  lightGray: string;
  primary: string;
  /** Soft orange for chips, selected states and secondary buttons */
  primarySoft: string;
  /** Text and icons placed on top of `primary` */
  onPrimary: string;
  star: string;
  danger: string;
  success: string;
  /** Inactive carousel dots and skeleton placeholders */
  muted: string;
};

export const lightPalette: Palette = {
  background: "#F6F7FB",
  surface: "#FFFFFF",
  text: "#111827",
  gray: "#9CA3AF",
  lightGray: "#E5E7EB",
  primary: "#FF6A3D",
  primarySoft: "#FFE7DF",
  onPrimary: "#FFFFFF",
  star: "#F59E0B",
  danger: "#DC2626",
  success: "#16A34A",
  muted: "#D1D5DB",
};

export const darkPalette: Palette = {
  background: "#0E0F13",
  surface: "#1A1C22",
  text: "#F3F4F6",
  gray: "#9CA3AF",
  lightGray: "#2C2F37",
  primary: "#FF6A3D",
  primarySoft: "#3A2219",
  onPrimary: "#FFFFFF",
  star: "#FBBF24",
  danger: "#F87171",
  success: "#4ADE80",
  muted: "#3F434C",
};
