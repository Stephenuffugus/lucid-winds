# Lucid Winds — Privacy Policy

**Last updated: May 6, 2026**

> **DRAFT — Stephen review required.** This is a starting point compiled from the codebase's actual data handling (Firebase Auth, Firestore, GA4, Open-Meteo, Leaflet/CartoDB, Pi SDK, GPS). Customize before deploying. **Not legal advice — have a lawyer review before publishing.**

## Who runs this app

Lucid Winds is operated by Stephen Furpahs (sole proprietor) — contact: stephenfurpahs@gmail.com. This is a solo-developer project hosted at lucidwinds.com.

## What data we collect

**Account data (when you sign up):**
- Email address
- Display name (chosen by you)
- Password (hashed — we never see the plaintext)
- Account number (sequential)
- Pi Network user ID + username (when you sign in via Pi)

**Gameplay data:**
- Plant collection, nursery, wild plants, breeding history
- Achievements, daily/weekly progress, in-game currency balances (Sunbeams, Dew)
- Companion bonds, hut purchases, item inventory
- Game scores and records

**Location data (only if you enable GPS):**
- Your approximate latitude/longitude when you plant in or harvest from the Wild
- Used only to plot plants on the in-game map within ~700m of where you played
- Stored as wild-plant coordinates (you can delete plants to remove)
- We DO NOT track your location continuously or in the background

**Device + connection data:**
- Browser type and version (for compatibility)
- Step counts (only with explicit pedometer permission, optional)
- Crash reports (anonymous)

**What we DON'T collect:**
- Your real name (unless you put it in your display name)
- Your physical address
- Phone number
- Government ID (Pi handles KYC for Pi-payment users — we never see KYC data)
- Health, biometric, or sensitive personal data

## How we use it

- Sync your collection across devices via Firebase Firestore
- Show your plants on the in-game map
- Calculate daily/weekly bonuses, level progression, achievements
- Process Pi Network payments for in-game upgrades (Pi handles the actual payment; we receive only a payment ID for fulfillment)
- Show real weather (via Open-Meteo) to drive in-game climate effects on plants you've planted
- Render map tiles via CartoDB Dark Matter

## Who we share it with

- **Firebase / Google Cloud** — provides our auth + database. They have a privacy policy at https://policies.google.com/privacy
- **Pi Network** — when you make a Pi payment. They handle the payment flow + receipt. Privacy policy: https://minepi.com/privacy
- **Open-Meteo** — weather queries are anonymized (lat/lng only, no user ID). https://open-meteo.com/en/terms
- **CartoDB** — map tile requests are anonymous. https://carto.com/privacy
- **Google Analytics 4 (GA4)** — anonymized usage events for game balance. Measurement ID G-XE58S4X6RX. You can opt out via your browser's GA opt-out tools.

We do NOT sell your data. We do NOT share it with advertisers. Friend connections, gifts, and Twin Bloom interactions are visible only to the friends you've explicitly added.

## Data we make publicly visible (other players can see)

- Your display name + Pi username (in friend lists, leaderboards if you opt in)
- Plants you place in the Wild (other players within ~700m can see and interact with them — water, harvest, etc.)
- Achievement trophies you unlock (in your public profile if friends visit)

## Cookies + local storage

We use browser localStorage to cache your collection so the app works offline. We don't use tracking cookies. The "lw_dev_unlocked" flag (if you ever need to enable developer mode) is stored locally only.

## Your rights

You can:
- Export your full vault data — log in, open Settings, tap "Export My Data"
- Delete your account permanently — Settings → "Delete Account" → confirm. This removes:
  - Your auth record (Firebase Auth)
  - Your private vault (Firestore)
  - Your public profile (Firestore)
  - Your active Wild plants (Firestore)
  - Your local browser data (localStorage cleared)
  - You may not be able to recover after deletion.

To request data export or deletion outside the app: email stephenfurpahs@gmail.com from the email tied to your account.

## Children

Lucid Winds is a general-audience game. We do not knowingly collect data from children under 13. If you believe a child has signed up, email us and we'll delete the account.

## Changes

If we change this policy, we'll post the new version here and notify you in-app on next sign-in. Material changes to data handling will require re-acknowledgement.

## Contact

Stephen Furpahs
stephenfurpahs@gmail.com

## Jurisdiction notes

- We comply with GDPR for EU users (right to access, deletion, portability already wired into the app)
- We comply with CCPA for California users (same rights as above)
- Pi Network handles its own jurisdictional compliance for Pi payments
