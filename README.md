<div align="center">

<img src="docs/screenshots/hero.png" alt="Luxeshop: the future of shopping, in your pocket" width="100%" />

# 🛸 Luxeshop

**A next-gen shopping app for iOS, Android and the web, built with React Native and Expo.**

*Liquid Glass tabs · 87 products across 8 worlds · live order tracking · dark mode that actually follows the night*

<br />

![Expo SDK](https://img.shields.io/badge/Expo_SDK-57-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React](https://img.shields.io/badge/React-19.2-149ECA?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
<br />
![iOS](https://img.shields.io/badge/iOS-26_Liquid_Glass-111?style=for-the-badge&logo=apple&logoColor=white)
![Android](https://img.shields.io/badge/Android-Material_3-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Web](https://img.shields.io/badge/Web-ready-FF6A3D?style=for-the-badge&logo=googlechrome&logoColor=white)

[**🚀 Launch it**](#-launch-sequence) · [**✨ Features**](#-feature-tour) · [**🧠 Under the hood**](#-under-the-hood) · [**🚧 Roadmap**](#-roadmap)

</div>

---

## 👋 Welcome aboard

Luxeshop is a full shopping experience, not a static UI mock-up. You can browse 8 categories, pick the exact colour and storage of a brand-new iPhone 18 Pro, apply a promo code, and watch your order move from **Placed → Shipped → Out for delivery → Delivered** in real time.

Everything you do is remembered on your device: your cart, wishlist, orders, reviews, address, recently viewed items and theme. Close the app, come back tomorrow, and it's all still there.

> 💡 **Recruiters:** jump to [Under the hood](#-under-the-hood) for the architecture, or to [Engineering highlights](#-engineering-highlights) for the problems this project solved.

---

## 📸 Take a look

<div align="center">

| Home | Pick your colour | Live tracking | Checkout |
|:---:|:---:|:---:|:---:|
| <img src="docs/screenshots/home-light.png" width="190" /> | <img src="docs/screenshots/product-colours.png" width="190" /> | <img src="docs/screenshots/tracking.png" width="190" /> | <img src="docs/screenshots/checkout.png" width="190" /> |

| 🌙 Home after dark | 🌙 Galaxy S26 Ultra | 🌙 Sports aisle | 🌙 Your profile |
|:---:|:---:|:---:|:---:|
| <img src="docs/screenshots/home-dark.png" width="190" /> | <img src="docs/screenshots/product-dark.png" width="190" /> | <img src="docs/screenshots/category-dark.png" width="190" /> | <img src="docs/screenshots/profile-dark.png" width="190" /> |

| Smart search | Category pages | Flash sale | Wishlist |
|:---:|:---:|:---:|:---:|
| <img src="docs/screenshots/search.png" width="190" /> | <img src="docs/screenshots/category.png" width="190" /> | <img src="docs/screenshots/home-flash-sale.png" width="190" /> | <img src="docs/screenshots/wishlist.png" width="190" /> |

</div>

---

## ✨ Feature tour

### 🛍️ Shop the future
- **This season's flagships at real UK prices:** iPhone 18 Pro, 18 Pro Max, Apple's first foldable **iPhone Duo**, Galaxy S26 Ultra, Galaxy Z Fold8 and Z Fold8 Ultra.
- **Every colour has its own photo.** Tap a swatch or swipe the gallery and the two stay in sync. That's 24 official product shots across the phones.
- **Pricing follows your storage choice:** pick 1TB and the price updates instantly.
- **8 category worlds** (Electronic, Food, Accessories, Beauty, Furniture, Fashion, Health, Sports) with **87 products**, sorting, and modern 3D category icons.
- **Real deals:** crossed-out original prices, a banner calculated from what's actually on sale, and a Flash Sale countdown that really ticks down to midnight.
- **Stock awareness:** "Only 3 left" warnings, sold-out states, and quantities you can't push past what's in stock.

### 🧭 Find anything
- **Search across names, brands and categories,** with suggestions as you type.
- **Filters:** price range, category, and "4★ & up".
- **Recent searches** and a **Recently viewed** row on the home screen.

### 💳 Checkout that feels real
- **A persistent cart** that keeps colour and storage variants as separate lines.
- **Promo codes:** try `LUXE10`, `WELCOME20` or `FREESHIP` 🤫
- **Card or cash on delivery,** saved with your order.
- **Delivery address with "📍 Use my current location":** GPS plus reverse geocoding fills in your street for you.

### 📦 After you buy
- **A live tracking timeline** with expected times for every stage.
- **Cancel** before your order ships, or **Buy Again** in one tap.
- **Write a review** (stars plus comment) for anything you've ordered.
- **Notifications** for your orders and the latest drops.

### 🎨 Feels premium
- **iOS 26 Liquid Glass:** a native glass tab bar that shrinks as you scroll, plus floating glass buttons on product pages.
- **Material 3 on Android,** a clean tab bar on web: one codebase, native on each.
- **Dark mode:** follows your system, or choose Light or Dark yourself in Profile → Appearance.
- **Haptic feedback** on hearts, swatches, add to cart and checkout.
- **Smooth images** via `expo-image`, skeleton loaders, and pull-to-refresh on orders.

---

## 🚀 Launch sequence

> **You'll need:** [Node.js 20+](https://nodejs.org) and, to run it on your phone, the free **Expo Go** app ([iOS](https://apps.apple.com/app/expo-go/id982107779) · [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)).

```bash
# 1. Clone the ship
git clone https://github.com/BrightEluno/Luxeshop.git
cd Luxeshop

# 2. Fuel up
npm install

# 3. Lift off 🚀
npx expo start
```

Then choose your destination:

| Destination | How |
|---|---|
| 📱 **Your phone** | Scan the QR code with your camera (iOS) or the Expo Go app (Android) |
| 🍏 **iOS Simulator** | Press `i` in the terminal (macOS with Xcode) |
| 🤖 **Android Emulator** | Press `a` in the terminal (Android Studio) |
| 🌐 **Web browser** | Press `w`, or run `npm run web` |

> ✨ **To see Liquid Glass,** open the app on an iPhone running **iOS 26 or later**. Other devices get a polished fallback automatically.

---

## 🧠 Under the hood

### Tech stack

| Layer | Tech |
|---|---|
| Framework | **Expo SDK 57**, React Native 0.86 (New Architecture), React 19.2 with the React Compiler |
| Language | **TypeScript 6**, strict mode |
| Navigation | **Expo Router**: file-based routes, typed links, native stack, native tabs |
| UI | `expo-glass-effect` (Liquid Glass), `expo-image`, `@expo/vector-icons`, Reanimated 4 |
| Device | `expo-location` (GPS + reverse geocoding), `expo-haptics`, the native share sheet |
| State | React Context + hooks, one provider per domain |
| Storage | `@react-native-async-storage/async-storage` |

### How it fits together

```mermaid
flowchart LR
    subgraph Screens["📱 app/ (Expo Router)"]
        Tabs["(tabs)<br/>Home · Wishlist · Orders · Profile"]
        Product["product/[id]"]
        Category["category/[slug]"]
        Flow["cart → checkout → success → order/[id]"]
    end

    subgraph State["🧠 src/context"]
        Cart[Cart]
        Wishlist[Wishlist]
        Orders[Orders]
        Reviews[Reviews]
        Address[Address]
        Recent[Recently viewed]
        Theme[Theme]
    end

    subgraph Data["📦 src/data"]
        Catalog["87 products<br/>+ categories + promos"]
    end

    Screens --> State
    Screens --> Data
    State --> Data
    State <--> Disk[("💾 AsyncStorage")]
```

### Project map

```
Luxeshop/
├── app/                     # 🧭 Every file is a screen (Expo Router)
│   ├── (tabs)/              #    Home, Wishlist, Transaction, Profile + tab bar
│   ├── product/[id].tsx     #    Colours, storage, gallery, stock, share
│   ├── category/[slug].tsx  #    8 categories + Deals / Flash Sale / All
│   ├── order/[id].tsx       #    Live tracking timeline, cancel, buy again
│   ├── reviews/[id].tsx     #    Read and write reviews
│   └── cart · checkout · search · address · notifications · help …
├── components/              # 🧩 ProductCard, Price, GlassIconButton, Skeleton
├── hooks/                   # ⏱️ useNow, useCountdownToMidnight, useColorScheme
└── src/
    ├── context/             # 🧠 Cart, Orders, Wishlist, Reviews, Address, Theme…
    ├── data/                # 📦 Product catalogue, categories, promo codes
    ├── constants/colors.ts  # 🎨 Light + dark palettes
    ├── utils/               # 🔧 Price formatting, haptics
    └── assets/images/       # 🖼️ Product photos, category icons
```

---

## 🏆 Engineering highlights

These are the parts I'm proudest of, the problems that needed more than a quick fix:

- **🎨 A theme system built for dark mode.** Every screen builds its styles from a palette with names that describe each colour's purpose (`surface`, `onPrimary`, `primarySoft`…), through one `useThemedStyles` hook. The same palette drives React Navigation's containers, so nothing flashes white in the dark.
- **🔄 Persistence without race conditions.** Each context loads saved data and **merges** it with anything that changed during start-up. Opening the app straight onto a product never wipes out your history.
- **🖼️ Images that survive app updates.** Bundled image references change between builds, so saved carts and orders store only product IDs and colour names, and look the right photo up again when loaded.
- **🎠 A carousel that can't get out of sync.** Tapping a swatch locks the carousel while it animates, with a timeout so the lock always releases. Coming back to the screen snaps it to the selected colour, even if you left halfway through a scroll.
- **📦 Stock shared across variants.** A 1TB and a 2TB iPhone draw from the same stock, and quantity limits apply everywhere: product page, cart, wishlist and Buy Again.
- **⏱️ Order stages derived from time.** There's no fake background job. An order's stage is calculated from when it was placed, so it's always correct, even after the app has been closed for hours.

---

## 🎮 Easter eggs

| Code | What it does |
|---|---|
| `LUXE10` | 10% off your whole order |
| `WELCOME20` | £20 off orders over £100 |
| `FREESHIP` | Free delivery |

Also try: placing an order, then waiting **2 minutes** 👀

---

## 🚧 Roadmap

- [x] Expo SDK 57 + New Architecture
- [x] Liquid Glass navigation
- [x] 8 categories, 87 products, colour and storage variants
- [x] Cart, checkout, promo codes, payment method
- [x] Live order tracking, cancel, buy again
- [x] Reviews, search filters, recently viewed
- [x] Dark mode, haptics, location-based address
- [ ] 🔐 Sign in with Apple and Google
- [ ] ☁️ Cloud backend (Supabase) so your account syncs across devices
- [ ] 💳 Real payments with Stripe, Apple Pay and Google Pay
- [ ] 🔔 Push notifications for order updates

---

## 🙏 Credits

- **Phone photos** © Apple and Samsung, used here for demonstration only.
- **Catalogue products and photos** from [DummyJSON](https://dummyjson.com), a free product dataset for demo apps.
- **Category icons:** [Microsoft Fluent Emoji](https://github.com/microsoft/fluentui-emoji) (MIT licence).
- Built with [Expo](https://expo.dev) 💙

> Luxeshop is a portfolio project. No real payments are taken and no orders are shipped (sadly 📦).

---

<div align="center">

### 👨‍🚀 Built by [@BrightEluno](https://github.com/BrightEluno)

**If Luxeshop made you smile, give it a ⭐. It genuinely helps!**

*Open to opportunities in mobile and front-end development. Let's build something futuristic together.*

</div>
