# ⚡ VALORANT ROAST UI

<div align="center">

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Backend API](https://img.shields.io/badge/Backend-valorant--roast--api-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://github.com/Piyush-raj24/valorant-roast-api)
[![Valorant API](https://img.shields.io/badge/Valorant--API-Game%20Assets-FF4655?style=for-the-badge)](https://valorant-api.com/)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio-Native%20SFX-00F0FF?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A high-fidelity, mobile-responsive cyberpunk React web application that queries live Valorant player stats and renders broadcast-grade, savage performance review cards with high-res agent artwork, map splashes, and sound effects.**

> 🛡️ **Looking for the backend service?** Check out the Spring Boot API at [Piyush-raj24/valorant-roast-api](https://github.com/Piyush-raj24/valorant-roast-api).

[Live Features](#-features) • [Quick Start](#-quick-start) • [Environment Variables](#-configuration) • [Deployment](#-deployment-to-vercel--render)

</div>

---

## 🎮 Features

1. **High-Res Agent Portraits & Avatars**: Dynamically renders full-body transparent agent portraits, circular profile avatars, and tactical role badges (Duelist, Controller, Initiator, Sentinel) powered by public Valorant API assets.
2. **Cinematic Map Splash Art Banners**: Displays widescreen HD map backdrops (Ascent, Bind, Haven, Split, Sunset, Lotus, Abyss, etc.) with minimap indicators.
3. **Custom Rank Emblems & Meme Tiers**: Visual badges ranging from 👑 *Radiant Menace* and 🟣 *Certified Smurf* down to 🥪 *Average Andy*, 📦 *Cardboard 2*, and 🪣 *Plastic 1*.
4. **"Hall of Shame" Military Stamps**: Dynamic tactical stamps applied across cards based on performance:
   - `[ 🚿 TOUCH GRASS ]` *(KD ≥ 2.2)*
   - `[ ⚠️ FAILED ENTRY ]` *(Duelist with negative KD)*
   - `[ 🦿 AIMING AT TOES ]` *(Headshot rate < 12%)*
   - `[ 🤖 NPC SPECTATOR ]` *(KD < 0.45)*
5. **Custom PFP / Meme Upload**: Upload your own Discord avatar or gaming meme to display directly on the performance review card.
6. **Animated "Tilt-O-Meter" / Toxicity Gauge**: Real-time visual progress bar showing calculated tilt factor and risk of Alt+F4.
7. **Duo Versus Mode**: Compare two friends head-to-head to determine who carried and who sold the match, producing a comparative Duo Roast card.
8. **Native Web Audio SFX**: Synthesized tactical button clicks, vandal headshot "dinks", and cinematic sub-bass reveal stingers with an audio toggle.
9. **Sharable Performance Card Generator**: Powered by `html2canvas` with 2x retina scaling for Discord, Twitter/X, and Instagram stories.
10. **100% Mobile Responsive**: Fluid clamp typography and flex layouts fitting screens from 320px smartphones to 4K displays.

---

## 💻 Quick Start

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**

### Installation
```bash
# 1. Clone repository
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

Create a `.env` file in the root directory:
```env
# Optional: defaults to production Render API if omitted
VITE_API_URL=http://localhost:8080
```

---

## 🛠️ Production Build

```bash
npm run build
npm run preview
```

---

## ☁️ Deployment

### Deploy to Vercel (Recommended)
1. Import `Piyush-raj24/valorant-roast-ui` into [Vercel](https://vercel.com/).
2. Framework: **Vite**.
3. Environment Variable: `VITE_API_URL` = `https://<your-backend-api>.onrender.com`.
4. Click **Deploy**.

---

## 🔗 Related Repositories

* **Backend Service**: [Piyush-raj24/valorant-roast-api](https://github.com/Piyush-raj24/valorant-roast-api) — Spring Boot 3 + Java 21 REST API connecting to HenrikDev v4.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) - Copyright (c) 2026 **Piyush Raj**.
