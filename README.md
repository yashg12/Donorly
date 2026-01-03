# Donorly

A MERN stack app to post and discover local help opportunities (donations + urgent requests) on a map.

## Features

- Map-based pins for **Donations** and **Requests** (Food, Blood, Clothes/Others)
- Optional photo upload for posts
- Authentication (register/login) with user profiles
- Admin dashboard (user moderation/management)
- Feedback + success stories modules
- AI chat assistant (Gemini) for quick guidance

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, Leaflet / React-Leaflet
- **Backend:** Node.js, Express
- **Database:** MongoDB + Mongoose
- **Auth:** JSON Web Tokens (JWT)

## Repository Structure

- `client/` — React frontend
- `server/` — Express + Mongoose backend

## Installation & Setup

### Prerequisites

- Node.js (LTS recommended)
- MongoDB (local service) **or** MongoDB Atlas

### 1) Install dependencies

- `cd server && npm install`
- `cd ../client && npm install`

### 2) Configure environment variables

Backend:
- Copy `server/.env.example` → `server/.env`
- Set:
  - `MONGO_URI=...`
  - `JWT_SECRET=...` (required)
  - `GEMINI_API_KEY=...` (optional, for AI assistant)

Frontend:
- Copy `client/.env.example` → `client/.env`
- Set:
  - `VITE_API_URL=http://localhost:5000`

### 3) Run locally

Backend:
- `cd server && npm run dev`

Frontend:
- `cd client && npm run dev`

### (Optional) Seed test data

- `cd server && node seed-database.js`

## Pre-Push Smoke Test

From repo root:
- `npm run smoke`

This verifies:
- the frontend build succeeds
- the backend can initialize and register routes (without requiring MongoDB)

## Security Notes

- Do **not** commit `.env` files. Only commit `.env.example`.
- Set a strong `JWT_SECRET` before deploying.
