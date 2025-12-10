# Deployment Guide – Time Tracker App

## Quick Start (5 minutes)

### For First-Time Deployment:

```bash
# 1. Initialize Git (from project root)
cd time-trakcer-app
git init
git add .
git commit -m "Initial commit: time tracking app"

# 2. Create repo at github.com/new, then connect:
git remote add origin https://github.com/YOUR_USERNAME/time-trakcer-app.git
git branch -M main
git push -u origin main

# 3. Enable GitHub Pages:
# - Go to Repo → Settings → Pages
# - Source: main / (root)
# - Save

# 4. Visit https://YOUR_USERNAME.github.io/time-trakcer-app
```

**Done!** Your app is live.

---

## Detailed Setup Instructions

### 1. Local Repository Setup

```bash
# Navigate to project directory
cd path/to/time-trakcer-app

# Initialize Git
git init

# Add all files (respects .gitignore automatically)
git add .

# Initial commit
git commit -m "Initial commit: time tracking app with Firebase & Chart.js"
```

**Verify setup:**
```bash
git log --oneline
# Should show: Initial commit: time tracking app with Firebase & Chart.js

git remote -v
# Should be empty (we'll add remote next)
```

---

### 2. Create GitHub Repository

**Via Web UI (easiest):**

1. Open [github.com/new](https://github.com/new)
2. Fill in:
   - **Repository name**: `time-trakcer-app`
   - **Description**: `AI-powered daily time tracking and analytics dashboard`
   - **Visibility**: Public
   - **Initialize**: Leave unchecked (you already have files)
3. Click **Create repository**

**Via GitHub CLI (optional):**
```bash
gh repo create time-trakcer-app --public --remote=origin --source=. --remote-name=origin --push
```

---

### 3. Push Code to GitHub

After creating the empty repo on GitHub, you'll see a setup page. Follow these commands:

```bash
# Add GitHub repo as remote
git remote add origin https://github.com/YOUR_USERNAME/time-trakcer-app.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username.

**Verify:**
- Go to your GitHub repo in browser
- All files (index.html, styles.css, app.js, etc.) should be visible
- Check that `firebase-config.js` is **NOT** in the files (it's in .gitignore)

---

### 4. Enable GitHub Pages

1. Go to your repo on GitHub
2. Click **Settings** (top right, gear icon)
3. In left sidebar, scroll down to **"Code and automation"** → click **Pages**
4. Under **Source**, select:
   - **Deploy from a branch** (if not already selected)
   - **Branch**: `main`
   - **Folder**: `/ (root)`
5. Click **Save**

GitHub will show a message:
> "Your site is live at https://YOUR_USERNAME.github.io/time-trakcer-app"

**Wait 1–2 minutes** for initial deployment.

---

### 5. Test Your Live App

1. Open `https://YOUR_USERNAME.github.io/time-trakcer-app` in browser
2. You should see the landing page with "Get Started" button
3. Test the full workflow:
   - Sign in with email/password
   - Add an activity
   - Log minutes until it reaches 1440
   - Click **Analyse**
   - Verify the analytics dashboard loads

---

### 6. Secure Your Firebase Config

⚠️ **Critical**: Your `firebase-config.js` must **never** be committed to GitHub.

**Verify it's protected:**
```bash
# Check .gitignore
cat .gitignore | grep firebase-config

# Should output: firebase-config.js
```

**For Public Deployments:**

In your [Firebase Console](https://console.firebase.google.com):

1. Go to **Project Settings** → **API Keys**
2. Click the default API key → **Edit**
3. Under **API restrictions**, set:
   - **Restrict key usage by referrer (HTTP)**
   - Add: `*.github.io/*`
4. Save

This prevents API key abuse from other domains.

**Update Firestore Rules** (Security → Rules):

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid}/days/{date}/activities/{activity} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

### 7. Continuous Deployment

Every push to `main` automatically redeploys:

```bash
# Make changes locally
echo "/* Update */" >> styles.css

# Commit and push
git add .
git commit -m "Update: style tweaks"
git push origin main

# Your live site updates in 1–2 minutes
```

---

## Troubleshooting

### "404 Not Found" After Deployment

**Cause:** GitHub Pages not enabled or repo not public.

**Fix:**
1. Go to Settings → Pages
2. Verify **Source** is set to `main` / `(root)`
3. Verify repo is **Public** (not Private)
4. Wait 2 minutes and refresh

### Firebase Not Initializing (Blank Page / Console Errors)

**Cause:** `firebase-config.js` missing or misconfigured.

**Debug:**
```bash
# Check browser console (F12 → Console tab)
# Look for errors like:
# "Cannot read property 'firebaseConfig' of undefined"

# Verify file exists locally:
ls firebase-config.js

# Ensure it's filled with real Firebase values
cat firebase-config.js
```

**Fix:**
- Copy `firebase-config.template.js` → `firebase-config.js`
- Fill in your Firebase project credentials
- Test locally first (`open index.html`)
- Do **NOT** commit `firebase-config.js`

### Sign-In Fails on Live Site

**Cause:** Firebase Security Rules or CORS blocking.

**Debug:**
- Open browser DevTools (F12)
- Try signing in, watch the **Network** tab
- Look for errors from `firebaseio.com`

**Fix:**
1. Check Firestore Rules (allow authenticated users)
2. Verify Firebase API key restrictions include your GitHub Pages domain
3. Ensure Authentication methods (Email/Password) are enabled in Firebase Console

### Mixed Content Error (http vs https)

**Cause:** Loading resources over http from https page.

**Fix:**
- All CDN links (Firebase, Chart.js) should use `https://`
- Check `index.html` script tags (they already do by default)

---

## Updating Your App

### Add a New Feature

```bash
# Make changes
# (edit HTML, CSS, JS, etc.)

# Test locally in browser
# Open index.html

# Once satisfied:
git add .
git commit -m "Add feature: XYZ"
git push origin main

# Live site updates automatically
```

### Sync Changes from Team

```bash
# If someone else pushed changes:
git pull origin main
```

---

## Advanced: Custom Domain (Optional)

If you own a domain:

1. Add to your repo: `.github/workflows/deploy.yml` (already included)
2. In GitHub Settings → Pages:
   - Under **Custom domain**, enter your domain (e.g., `timetracker.example.com`)
   - Add DNS records to your registrar (GitHub shows instructions)
3. Commit a `CNAME` file if needed:

```bash
echo "timetracker.example.com" > CNAME
git add CNAME
git commit -m "Add custom domain"
git push origin main
```

---

## Summary Checklist

- [ ] Git initialized locally (`git init`)
- [ ] All files staged and committed (`git commit`)
- [ ] GitHub repo created (empty, public)
- [ ] Remote added (`git remote add origin ...`)
- [ ] Code pushed to `main` (`git push -u origin main`)
- [ ] GitHub Pages enabled (Settings → Pages → main / root)
- [ ] App live at `https://YOUR_USERNAME.github.io/time-trakcer-app`
- [ ] Firebase config secured (.gitignore, API key restrictions)
- [ ] Full workflow tested (sign in, log activity, analyze)

---

## Need Help?

- **GitHub Docs**: [GitHub Pages Documentation](https://docs.github.com/en/pages)
- **Firebase Docs**: [Firebase Hosting & Security Rules](https://firebase.google.com/docs/firestore/security)
- **Troubleshoot**: Check browser console (F12) and GitHub Pages build logs (repo → Settings → Pages)

---

**Last Updated**: December 2025  
**App**: Time Tracker v1.0 with Firebase & Chart.js
