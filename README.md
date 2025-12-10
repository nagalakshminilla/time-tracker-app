# AI-Powered Daily Time Tracking & Analytics Dashboard

A lightweight, responsive time-tracking web app built with HTML/CSS/JS and Firebase.

**[→ Deployment Guide](./DEPLOYMENT.md)** — Step-by-step instructions to deploy to GitHub Pages in 5 minutes.

## Features
- Authentication (Firebase Auth) — Email/password and Google sign-in.
- Daily activity logging (title, category, minutes).
- Real-time validation to keep daily minutes within 1440 and a remaining-minutes indicator.
- Analytics dashboard with doughnut chart (Chart.js) and category breakdown.
- Firebase Firestore persistence: `users/{uid}/days/{date}/activities`.
- Responsive UI with smooth animations and mobile optimization.

## Local setup
1. Copy `firebase-config.template.js` → `firebase-config.js` and fill in your Firebase project values.
2. Enable Authentication (Email/Password) and Firestore in your Firebase console.
3. Open `index.html` in a browser (or serve with a simple static server).

Optional (recommended): serve via a local server for ES module and Firebase behavior, e.g. using `http-server` or GitHub Pages.

## How to use (demo)
- Click **Get Started** then **Sign in** and enter an email/password to create a demo account.
- Select a date, add activities (minutes). The Analyse button becomes enabled when total minutes reach exactly 1440.
- Click **Analyse** to view the dashboard for that date.

## AI usage notes
- UI layout, copy, and component suggestions were created with the assistance of LLMs and design tools to speed up iteration.
- Chart color palette and UX microcopy were refined with AI prompts.

## Deployment to GitHub Pages

### Prerequisites
- Git installed on your machine
- A GitHub account
- Your Firebase config credentials ready (you'll need `firebase-config.js`)

### Step 1: Initialize Git Repository Locally

```bash
cd path/to/time-trakcer-app
git init
git add .
git commit -m "Initial commit: time tracking app with Firebase & Chart.js"
```

### Step 2: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name**: `time-trakcer-app` (or your preferred name)
3. **Description**: "AI-powered daily time tracking and analytics dashboard"
4. **Public** (to enable GitHub Pages)
5. **Do NOT initialize** with README, .gitignore, or license (you already have them)
6. Click **Create repository**

### Step 3: Connect Local Repo to GitHub

After creating the repo on GitHub, you'll see instructions. In your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/time-trakcer-app.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 4: Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** (gear icon, top right)
3. In the left sidebar, click **Pages** (under "Code and automation")
4. Under **Source**, select **Deploy from a branch**
5. Select branch: `main` and folder: `/ (root)`
6. Click **Save**
7. GitHub will provide your live URL, typically: `https://YOUR_USERNAME.github.io/time-trakcer-app`

### Step 5: Verify Deployment

After 1–2 minutes:
- Visit your GitHub Pages URL
- The app should load with the landing page visible
- Sign in and test the full workflow (logging activities, viewing analytics)

### Step 6: Update Firebase Config Before Deployment

⚠️ **IMPORTANT**: Before pushing to GitHub, ensure `firebase-config.js` is in `.gitignore` (it already is):

```bash
cat .gitignore | grep firebase-config.js
```

If deploying to a public URL, you may want to:
1. Create a **restricted Firebase API key** in your Firebase console
2. Enable only the services you need (Auth, Firestore)
3. Restrict by HTTP referer to your GitHub Pages domain

**Do NOT commit real Firebase credentials to public repos.**

### Optional: Update Firebase Firestore Rules

For public demo, set these **Firestore Security Rules**:

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/days/{date}/activities/{activity} {
      allow read, write: if request.auth.uid == uid;
    }
    match /users/{uid} {
      allow read: if request.auth.uid == uid;
    }
  }
}
```

This ensures only authenticated users can read/write their own data.

### Continuous Deployment (Optional)

GitHub Pages auto-deploys any push to `main`. To update the live site:

```bash
git add .
git commit -m "Update feature or fix"
git push origin main
```

Changes deploy within 1–2 minutes.

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "404 not found" after deployment | Check Pages settings (should be `main` / `root`). Wait 2 min. |
| Firebase not initializing | Ensure `firebase-config.js` exists locally and is loaded (check browser console). |
| Sign-in fails on live site | Check Firebase Security Rules and allow your GitHub Pages domain. |
| App works locally but not on GitHub Pages | Check browser console for CORS or mixed-content (http vs https) errors. |

---

## Next Tasks
- Harden auth flows and add Google sign-in refinement.
- Improve form validation and UX (undo, bulk-edit, keyboard shortcuts).
- Add timeline visualization, export CSV, and weekly/monthly summaries.
- Create video walkthrough demonstrating the full workflow.
- Add PWA support (manifest.json, service worker for offline mode).

