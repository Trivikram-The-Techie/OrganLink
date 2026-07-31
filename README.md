# OrganLink: Real-Time Transplant Coordination Network

[![Deploy to GitHub Pages](https://github.com/Trivikram-The-Techie/OrganLink/actions/workflows/deploy.yml/badge.svg)](https://github.com/Trivikram-The-Techie/OrganLink/actions/workflows/deploy.yml)

**Live Demo**: [https://trivikram-the-techie.github.io/OrganLink/](https://trivikram-the-techie.github.io/OrganLink/)

OrganLink is a real-time coordination dashboard built for medical facilities to locate compatible organ recipients, evaluate transit times, dispatch transport teams, and complete mutual contact authorization gates. 

This project was built as a hackathon prototype, featuring a hybrid database engine: it functions **out-of-the-box in simulated offline mode** (using reactive multi-tab LocalStorage synchronization) or scales instantly to **production Firebase Auth and Firestore** by supplying environment variables.

---

## 🚀 Key Features

1. **Seeded Facility waitlists**: Includes 6 cities/hospitals and 15 waitlisted candidates covering various blood groups and organs (heart, kidney, liver, lung).
2. **Automated Compatibility Filter**: Performs ABO and Rh-factor compatibility checks to filter valid candidates.
3. **Multi-Modal Transit Feasibility**: Estimates transit duration via Haversine distance. Automatically splits between **Ground Transit** (<150km) and **Air Ambulance** (>=150km) with prep/traffic overheads.
4. **Vertex AI Urgency-Transit Scoring (Simulated)**: A clear, explainable scoring algorithm combining Medical Urgency (45%), Transport Feasibility (35%), and Blood Compatibility (20%). Includes hook locations for custom ML prediction endpoints.
5. **Real-Time Cross-Tab Notification Alerts**: Sends instant alerts to the top 5 compatible recipient hospitals. Gated details remain hidden during matching.
6. **Authorization-Gated Contact Reveal**: Coordinator names, phone numbers, and addresses remain locked. They unlock automatically in real-time once both the recipient and donor hospitals confirm.
7. **Live Transit Visualizer**: Interactive SVG route maps that show coordinate pins, curved path tracks, and real-time transit telemetry (with moving en-route vessels).

---

## 🛠️ Tech Stack & Setup

- **Frontend**: React (Vite) + Tailwind CSS v4 + React Router
- **Icons**: Lucide React
- **Backend / Database / Auth**: Firebase Client SDK (Auth + Firestore)

### 1. Installation

Clone the directory and install dependencies:
```bash
npm install
```

### 2. Environment Configuration

Copy the example environment template:
```bash
cp .env.example .env
```

Open `.env` in your editor. 

* **Option A: Play Immediately (No-Setup Mock Mode)**
  Leave all variables blank. The app will automatically run on the simulated LocalStorage engine. You can open multiple incognito/normal tabs to test real-time actions and mutual confirmations.

* **Option B: Connect Real Firebase & Google Maps**
  Create a Firebase Web App and fill in your keys:
  ```env
  VITE_FIREBASE_API_KEY=your_key_here
  VITE_FIREBASE_AUTH_DOMAIN=your_auth_here.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=your_id
  VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
  VITE_FIREBASE_APP_ID=your_app_id
  
  # Google Maps API key (enables real Distance Matrix traffic lookups)
  VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
  ```

---

## 📖 Evaluation Journey (Step-by-Step Demo Guide)

To test the application's full end-to-end flow:

1. **Launch the Development Server**:
   ```bash
   npm run dev
   ```
   Open the printed URL (usually `http://localhost:5173`) in your browser.

2. **Seed the Mock Data**:
   - Go to the **System Console** (click "Demo Seeder" or visit `/admin`).
   - Click **Reset & Seed Demo Data**. This prepares the 6 mock hospitals and 15 waitlist entries.

3. **Open Two Separate Windows**:
   - Keep Tab A as a standard window.
   - Open Tab B as an Incognito/Private window.

4. **Sign In as Donor (Tab A)**:
   - Go to the login screen (`/login`).
   - In the **Demo Quick Access** section, click **Metro Donor**. This logs you in as the coordinator for Metro General Hospital.

5. **Sign In as Recipient (Tab B)**:
   - Go to `/login` in the private window.
   - Under **Demo Quick Access**, click **Mercy Recipient**. This logs you in as the coordinator for Mercy Health Center.

6. **Submit an Organ Offer (Tab A - Donor)**:
   - On the Metro Donor Dashboard, submit a new organ:
     - **Organ Type**: `Heart`
     - **Blood Group**: `A+`
     - **Viability**: `6` hours
   - Click **Run Compatibility Match**.
   - The dashboard will run calculations and show the top matches (Mercy Health Center will be ranked #1 because it has an A+ heart patient with 92 urgency and is located ~135km away, taking 139 mins by ground).

7. **Review Alert and Accept (Tab B - Recipient)**:
   - On the Mercy Recipient Dashboard, a blinking real-time match alert card will instantly appear.
   - Notice that patient details and contact info are labeled **LOCKED**.
   - Click **Accept**.

8. **Perform Mutual Confirmation (Tab A - Donor)**:
   - Look back at the Metro Donor Dashboard. The dispatch item will update to **Pending Donor Conf**.
   - Click **Confirm Mutual Match**.

9. **Witness Contact Unlock & Telemetry (Both Tabs)**:
   - Open the **Live Case Tracker** on either tab.
   - The coordinator details, phone numbers, and addresses will unlock in real-time on both screens.
   - The pipeline stepper moves to **Match Confirmed**.
   - Click **Dispatch Transport Team**. The transit map will activate, showing the en-route coordinates and telemetry.
   - Click **Mark as Delivered** when arrival is confirmed.

---

## 🎯 Architectural Hooks

* **Vertex AI Prediction Hook**: Found in [ranking.js](file:///c:/Projects/OrganLink/src/utils/ranking.js#L125-L131). The heuristics math can be swapped for a REST call to a tabular model endpoint predicting success probabilities based on transit stress.
* **Google Maps Distance Matrix Hook**: Found in [ranking.js](file:///c:/Projects/OrganLink/src/utils/ranking.js#L54-L79). The Haversine fallback falls back to live distance matrix coordinates calculation if a maps key is loaded.
* **Reactive Local DB Fallback**: Found in [firebase.js](file:///c:/Projects/OrganLink/src/firebase.js). Intercepts all Firestore and Authentication methods and runs them reactively through a multi-tab storage bus.

---
*Created as part of the OrganLink real-time network.*
