# MJ Juicy Burger — POS & Order Management

A point-of-sale and order management system for the MJ Juicy Burger food caravan.
Because only 1–2 people work in the caravan, everything runs on one touchscreen:
taking orders, following active orders, managing the menu, checking sales and
keeping track of stock.

## Tech stack

| Part     | Technology                            |
| -------- | ------------------------------------- |
| Frontend | React, TypeScript, Vite, plain CSS    |
| Backend  | Node.js, Express, TypeScript          |
| Database | PostgreSQL with Prisma (from Step 1)  |

## Project structure

```
MJ Burger/
├─ backend/          Express API
│  ├─ src/
│  │  ├─ app.ts      Express app: middleware and routes
│  │  └─ index.ts    Starts the server
│  └─ .env.example
├─ frontend/         React application
│  ├─ public/        Images (logo, product photos)
│  ├─ src/
│  │  ├─ main.tsx    Entry point
│  │  └─ App.tsx     Main component
│  └─ .env.example
└─ README.md
```

## Getting started

You need Node.js 18 or higher.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # then fill in your own values
npm run dev
```

The API runs on http://localhost:4000
Check it with http://localhost:4000/api/health

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on http://localhost:5173

Run both at the same time in two separate terminals.

## Environment variables

Real values belong in `.env`, which is ignored by Git.
`.env.example` shows which variables are needed, with placeholder values only.

| Variable      | Where    | What it is                            |
| ------------- | -------- | ------------------------------------- |
| `PORT`        | backend  | Port for the API (4000)               |
| `CORS_ORIGIN` | backend  | Frontend address allowed to call it   |
| `DATABASE_URL`| backend  | PostgreSQL connection (Step 1)        |
| `JWT_SECRET`  | backend  | Signs login tokens (Step 3)           |
| `VITE_API_URL`| frontend | Address of the backend API            |

## Available scripts

**backend**

| Command             | What it does                          |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start with automatic restart          |
| `npm run build`     | Compile TypeScript to `dist/`         |
| `npm start`         | Run the compiled version              |
| `npm run typecheck` | Check types without building          |

**frontend**

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the development server     |
| `npm run build` | Build for production             |
| `npm run lint`  | Check the code for mistakes      |

## Build plan

- [x] **Step 0** — Project setup
- [ ] Step 1 — Database schema and seed data
- [ ] Step 2 — Express server and error handling
- [ ] Step 3 — Login and roles (ADMIN / STAFF)
- [ ] Step 4 — Menu API
- [ ] Step 5 — App shell, routing and login page
- [ ] Step 6 — POS screen
- [ ] Step 7 — Orders API
- [ ] Step 8 — Place orders from the POS
- [ ] Step 9 — Active orders
- [ ] Step 10 — Order history
- [ ] Step 11 — Menu management
- [ ] Step 12 — Sales dashboard
- [ ] Step 13 — Inventory
- [ ] Step 14 — Polish and error handling

## Note about images

`frontend/public/logo.svg` is a temporary placeholder logo.
Replace it with the real MJ Juicy Burger logo (same file name, no code changes needed).
