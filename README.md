# Wer macht's? – Service Marketplace (Web & iOS)

A full-stack service marketplace: users post jobs ("looking for a painter", "need help moving") and service providers send bids. Once a bid is accepted, both sides can chat, pay securely, and leave reviews.

**Live:** [www.wermacht.app](https://www.wermacht.app)

![Wer macht's? screenshot](assets/kapak2.png)

## Features

- **Ads & bids:** create, search and filter ads (category, price, shipping, location); providers submit and update bids
- **Payments:** card payments via Stripe (Payment Intents), Pro subscription with billing portal, featured ads, webhook-based status sync
- **Messaging:** real-time chat between ad owner and bidder
- **Profiles & trust:** public profiles, followers, reviews and star ratings, verified and Pro badges, phone verification
- **Notifications:** in-app notifications and email notifications (Resend)
- **Multilingual:** German, English, Turkish, Russian, Arabic (i18next)
- **Legal & privacy:** imprint, terms, privacy policy, GDPR cookie consent, online contract cancellation (Kündigungsbutton)
- **Security:** Firestore & Storage security rules, Firebase App Check, rate limiting in Cloud Functions

## Tech Stack

| Area | Technologies |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, React Router, GSAP |
| Backend | Firebase Cloud Functions (Node.js 20, TypeScript) |
| Database & Storage | Cloud Firestore, Firebase Storage |
| Auth | Firebase Authentication (email, Google, phone verification) |
| Payments | Stripe API, Stripe Webhooks |
| Mobile | Capacitor (iOS) |
| Hosting | Vercel (web), Firebase (backend) |
| Tooling | Oxlint, Playwright (screenshots) |

## Project Structure

```
├── web/                 # React + Vite frontend, Capacitor iOS app
│   ├── src/pages/       # Routes (ads, bids, messages, payment, profile, ...)
│   ├── src/components/  # UI components
│   ├── src/hooks/       # Firestore data hooks
│   └── src/i18n/        # Translations (de, en, tr, ru, ar)
├── functions/           # Cloud Functions (Stripe, emails, notifications, ...)
├── assets/              # Images used in this README
├── firestore.rules      # Firestore security rules
└── storage.rules        # Storage security rules
```

## Getting Started

```bash
# Frontend
cd web
cp .env.example .env     # add your Firebase and Stripe keys
npm install
npm run dev

# Cloud Functions
cd functions
npm install
npm run serve            # runs the Firebase emulator
```

## Author

**Batin Yigit Kaska** – [github.com/batinkaska](https://github.com/batinkaska)
