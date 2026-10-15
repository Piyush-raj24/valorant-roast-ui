# ⚡ VALORANT ROAST UI

<div align="center">

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A modern, mobile-responsive, cyberpunk-themed React web application that queries live Valorant player stats and generates sharable, savage performance review cards.**

[Features](#-features) • [Quick Start](#-quick-start) • [Environment Variables](#-configuration) • [Deployment](#-deployment-to-vercel--render)

</div>

---

## 🎮 Features

- **Tactical Valorant Cyberpunk Aesthetic**: Engineered with Valorant's signature brand palette (Radianite Red `#ff4655`, Dark Charcoal `#0f1923`, and Cyber Cyan `#00f0ff`) using custom typography (`Teko`, `Rajdhani`, `Inter`).
- **100% Mobile-Friendly & Responsive**: Fluid clamp typography, dynamic multi-column grids, and zero horizontal overflow on screens down to 320px.
- **Sharable Performance Card Generator**: Powered by `html2canvas` to render high-resolution 2x retina PNG cards suitable for Discord, Twitter/X, and Instagram stories.
- **Dynamic Tier Calculation**: Visual status badges ranging from *Radiant Menace* and *Certified Smurf* down to *Average Andy* and *Plastic 1*.
- **Instant Demo Presets**: Test live burns with 1-click presets (`TenZ#SEN`, `Whiff#BOT`, `Average#Andy`) without typing.
- **Copy to Clipboard & Share on X**: One-click sharing with animated toast notifications and pre-populated tweet intents.
- **Cold-Start Detection**: Displays a friendly notification if the free-tier Render backend is spinning up from idle state.
- **Local Persistence**: Automatically remembers your last searched Riot ID and server region in `localStorage`.

---

## 📸 Component Showcase

```
+-------------------------------------------------------+
|  [// VCT ANALYTICS & ROAST ENGINE]                    |
|                                                       |
|             VALORANT ROAST                            |
|  Enter your Riot ID. Get evaluated and roasted.       |
|                                                       |
|  [ AP v ] [ Name#Tag (e.g. WinSake#INDIA) ] [ROAST ME] |
|  Instant Demos: [TenZ#SEN] [Whiff#BOT] [Average#Andy] |
+-------------------------------------------------------+
|  +-------------------------------------------------+  |
|  | PERFORMANCE REVIEW // ASCENT        REGION: AP  |  |
|  | WINSAKE#INDIA                [SWEATY TRYHARD]   |  |
|  |                                                 |  |
|  | [KD: 1.45] [AGENT: JETT] [HS%: 24.2%]           |  |
|  | [K/D/A: 18/12/4] [HS: 14] [BODY: 32]           |  |
|  |                                                 |  |
|  | "A 1.45 K/D on Jett. Sweaty enough to brag on   |  |
|  | Discord, but not enough to leave Plat."         |  |
|  +-------------------------------------------------+  |
|  [DOWNLOAD CARD]    [COPY ROAST]    [SHARE ON X]      |
+-------------------------------------------------------+
```

---

## 💻 Quick Start

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/Piyush-raj24/valorant-roast-ui.git
cd valorant-roast-ui

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## ⚙️ Configuration

Configure the backend API URL using `.env` or cloud environment variables:

Create a `.env` file in the root directory:
```env
# Optional: defaults to https://valorant-roast-api.onrender.com if omitted
VITE_API_URL=http://localhost:8080
```

---

## 🛠️ Build & Production Preview

```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ☁️ Deployment to Vercel / Render

### Option A: Deploy to Vercel (Recommended)
1. Import your GitHub repository `Piyush-raj24/valorant-roast-ui` into [Vercel](https://vercel.com/).
2. Framework Preset: **Vite**.
3. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://valorant-roast-api.onrender.com` (or your deployed API URL).
4. Click **Deploy**.

### Option B: Deploy to Render (Static Site)
1. Create a new **Static Site** on [Render](https://render.com/).
2. Connect `Piyush-raj24/valorant-roast-ui`.
3. Set:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add environment variable `VITE_API_URL` pointing to your backend URL.
5. Click **Create Static Site**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - Copyright (c) 2026 **Piyush Raj**.
