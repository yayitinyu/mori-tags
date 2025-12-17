# Mori Tags - AI Tag Manager

[English](README.md) | [中文](README_zh.md)

A modern, glassmorphism-styled AI tag management tool built with Remix, Cloudflare Pages, and D1 Database.

## Features

- **Tag Management**: Browse and select AI drawing tags (English/Chinese).
- **Prompt Builder**: Select tags to build prompts, copy to clipboard, or clear.
- **Smart Search/Filter**: Efficient tag filtering with client-side optimization.
- **Collections**: Save favorite tag combinations with image previews.
- **User System**: Admin authentication and account management (change username/password).
- **Responsive Design**: Mobile-friendly layout with a beautiful pink glassmorphism theme.

## Tech Stack

- **Framework**: [Remix](https://remix.run) (Vite)
- **Deployment**: Cloudflare Pages
- **Database**: Cloudflare D1 (SQLite)
- **Styling**: Vanilla CSS + Glassmorphism

---

## 🚀 Production Deployment Guide

To deploy this application to the internet, follow these steps:

### 1. Prerequisites
- A [Cloudflare](https://dash.cloudflare.com/) account.
- `npm` installed locally.

### 2. Login to Cloudflare
Open your terminal in the project folder and login:
```bash
npx wrangler login
```

### 3. Create Remote Database
Create a D1 database on Cloudflare:
```bash
npx wrangler d1 create mori-tags-db
```
*Take note of the `database_id` output by this command.*

### 4. Update Configuration
Open `wrangler.toml` and update the `[[d1_databases]]` section with your **new** `database_id`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "mori-tags-db"
database_id = "YOUR-GENERATED-ID-HERE" 
```

### 5. Deploy Schema & Data
Initialize the remote database with the schema:
```bash
npx wrangler d1 execute DB --remote --file=./schema.sql
```
*(Optional) Seed data if you have the migration file:*
```bash
npx wrangler d1 execute DB --remote --file=./seed.sql
```

### 6. Deploy Application
Build and deploy the site to Cloudflare Pages:
```bash
npm run deploy
```
This will give you a live URL (e.g., `https://mori-tags.pages.dev`).

### 7. First Login
Visit your live site. Login with username `admin`.
*   If this is the first user, it will create the account.
*   The password you enter will become the admin password.
*   Go to **Settings** (click your username) to change your password later.

---

## 🛠️ Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Local Database Setup**
   ```bash
   npx wrangler d1 execute DB --local --file=./schema.sql
   # Seed data
   # npx wrangler d1 execute DB --local --file=./seed.sql
   ```

3. **Run Dev Server**
   ```bash
   npm run dev
   ```
