# MJ Juicy Burger — POS & Order Management

A point-of-sale and order management system for the MJ Juicy Burger food caravan.
Because only 1–2 people work in the caravan, everything runs on one touchscreen:
taking orders, following active orders, managing the menu, checking sales and
keeping track of stock.

## Tech stack

| Part     | Technology                         |
| -------- | ---------------------------------- |
| Frontend | React, TypeScript, Vite, plain CSS |
| Backend  | Node.js, Express, TypeScript       |
| Database | PostgreSQL with Prisma             |

## Screens

| Screen             | Address      | Who          |
| ------------------ | ------------ | ------------ |
| Login              | `/login`     | everyone     |
| POS / cash register| `/pos`       | staff, admin |
| Active orders      | `/orders`    | staff, admin |
| Order history      | `/history`   | staff, admin |
| Menu management    | `/menu`      | admin        |
| Sales              | `/sales`     | admin        |
| Stock              | `/inventory` | admin        |

## Project structure

```
MJ Burger/
├─ backend/
│  ├─ prisma/
│  │  ├─ schema.prisma      The database: 6 tables
│  │  └─ seed.ts            Test data
│  ├─ src/
│  │  ├─ index.ts           Starts the server
│  │  ├─ app.ts             Express app: middleware
│  │  ├─ routes.ts          Every API address in one place
│  │  ├─ db.ts              One shared database connection
│  │  ├─ controllers/       What happens per route
│  │  ├─ middleware/        Login check and error handling
│  │  └─ validation/        Rules for incoming data (zod)
│  └─ .env.example
└─ frontend/
   ├─ public/images/        Logo and product photos
   └─ src/
      ├─ api/               All calls to the backend
      ├─ components/        Reusable pieces
      ├─ context/           Logged in user + shopping cart
      ├─ pages/             One file per screen
      ├─ types/             Shapes of the data
      └─ utils/             Money formatting
```

## Getting started

You need Node.js 20 or higher and PostgreSQL.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env          # then fill in your own values
npm run db:migrate            # creates the database and the tables
npm run db:seed               # fills it with test data
npm run dev
```

The API runs on http://localhost:4000

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app runs on http://localhost:5173

Run both at the same time in two separate terminals.

### Demo logins

These come from the seed data and are **only for testing**.
Change them before the system is used in the real caravan.

| Username | Password | Role  |
| -------- | -------- | ----- |
| `admin`  | admin123 | ADMIN |
| `staff`  | staff123 | STAFF |

## Environment variables

Real values belong in `.env`, which is ignored by Git.
`.env.example` shows which variables are needed, with placeholder values only.

| Variable       | Where    | What it is                          |
| -------------- | -------- | ----------------------------------- |
| `PORT`         | backend  | Port for the API (4000)             |
| `CORS_ORIGIN`  | backend  | Frontend address allowed to call it |
| `DATABASE_URL` | backend  | PostgreSQL connection               |
| `JWT_SECRET`   | backend  | Signs login tokens                  |
| `VITE_API_URL` | frontend | Address of the backend API          |

## Scripts

**backend**

| Command              | What it does                        |
| -------------------- | ----------------------------------- |
| `npm run dev`        | Start with automatic restart        |
| `npm run build`      | Compile TypeScript to `dist/`       |
| `npm start`          | Run the compiled version            |
| `npm run typecheck`  | Check types without building        |
| `npm run db:migrate` | Apply schema changes to the database|
| `npm run db:seed`    | Refill the test data                |
| `npm run db:reset`   | Empty the database and start over   |
| `npm run db:studio`  | Open the database in the browser    |

**frontend**

| Command         | What it does                 |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Build for production         |
| `npm run lint`  | Check the code for mistakes  |

## The database

Six tables. The arrows show which table points to which.

```
Category ──< Product ──< OrderItem >── Order >── User
Inventory (on its own)
```

Two choices worth explaining:

- **Prices are whole cents** (`850` = € 8,50). In JavaScript `0.1 + 0.2` is not
  exactly `0.3`, so working with whole numbers means a total can never be a cent off.
- **OrderItem copies the product name and price** at the moment the order is placed.
  If a price changes next month, an old receipt still shows the old price.

## The API

| Method | Address                    | Who     |
| ------ | -------------------------- | ------- |
| POST   | `/api/auth/login`          | everyone|
| GET    | `/api/auth/me`             | logged in |
| GET    | `/api/categories`          | logged in |
| POST   | `/api/categories`          | admin   |
| PUT    | `/api/categories/:id`      | admin   |
| DELETE | `/api/categories/:id`      | admin   |
| GET    | `/api/products`            | logged in |
| POST   | `/api/products`            | admin   |
| PUT    | `/api/products/:id`        | admin   |
| DELETE | `/api/products/:id`        | admin   |
| GET    | `/api/orders`              | logged in |
| GET    | `/api/orders/:id`          | logged in |
| POST   | `/api/orders`              | logged in |
| PATCH  | `/api/orders/:id/status`   | logged in |
| GET    | `/api/inventory`           | admin   |
| POST   | `/api/inventory`           | admin   |
| PUT    | `/api/inventory/:id`       | admin   |
| DELETE | `/api/inventory/:id`       | admin   |
| GET    | `/api/stats/dashboard`     | admin   |

## How an order is placed

1. The employee taps products. The cart lives only in the browser, so tapping is instant.
2. **PLACE ORDER** sends the product ids and quantities — **no prices**.
3. The backend checks the input, looks up the real prices in the database and
   calculates the total itself, so a total can never be faked.
4. Everything is saved in one transaction: the order and its lines together, or nothing.
5. The order gets the next number (starting at 101) and appears in Active Orders.
6. Active Orders refreshes itself every 5 seconds. A second screen in the kitchen
   would only have to open the same page — the backend needs no changes.

## Replacing the images

- `frontend/public/logo.svg` — the logo (placeholder with a gold crown)
- `frontend/public/images/products/placeholder.svg` — the product photo

Put real photos in `frontend/public/images/products/` and set the path per product
in Menu management (for example `/images/products/classic-burger.jpg`).

## What is not in this first version

Deliberately left out to keep the project simple:

- A separate kitchen screen (the architecture is ready for it: it is the same API)
- Uploading images from the browser (paths are typed in for now)
- Stock that goes down automatically when something is sold
- Employee management (users come from the seed data)
