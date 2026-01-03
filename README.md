# Donorly

A MERN stack app to post and discover local help opportunities (donations + urgent requests) on a map.

## Features

- Map-based pins for **Donations** and **Requests** (Food, Blood, Clothes/Others)
- Optional photo upload for posts
- Authentication (register/login) with user profiles
- Admin dashboard (user moderation/management)
- Feedback + success stories modules
- AI chat assistant (Gemini) for quick guidance
- AI medical report summarization (attach **image** or **PDF**) with structured Markdown output

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

## Environment Setup (Quick Reference)

Create these two files locally (they are intentionally not committed):

- `server/.env` (copy from `server/.env.example`)
  - `MONGO_URI` (MongoDB connection string)
  - `JWT_SECRET` (required)
  - `GEMINI_API_KEY` (optional, enables AI assistant)
  - `CLIENT_URL` (recommended; used for CORS)

- `client/.env` (copy from `client/.env.example`)
  - `VITE_API_URL` (backend base URL, e.g. `http://localhost:5000`)

Notes:
- Vite only exposes env vars prefixed with `VITE_` to the browser.
- After changing env vars, restart the dev servers.

### 3) Run locally

Backend:
- `cd server && npm run dev`

Frontend:
- `cd client && npm run dev`

Alternative (from repo root):
- `npm run server:dev`
- `npm run client:dev`

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

## Deployment Notes

- Set `VITE_API_URL` to your deployed backend URL.
- Set `CLIENT_URL` on the backend to your deployed frontend URL.

## AI Assistant: Medical Report Summarization (Image/PDF)

The in-app chat assistant supports attachments for summarizing medical reports.

Supported attachments:
- Images: `image/*` (photos/screenshots of reports)
- PDFs: `application/pdf`

How it works:
1. Open the chat assistant.
2. Click the paperclip icon and attach a medical report (image/PDF).
3. Add any context in the message (optional), then send.

Behavior:
- If the attachment looks like a medical document, the assistant summarizes it in a **structured Markdown format** (sections + bullet points).
- If it does not look like a medical document, it will politely refuse.

Notes:
- The backend is configured with an increased JSON body limit (currently `20mb`) to support base64 attachments.
- The summary is informational only and not medical advice.
