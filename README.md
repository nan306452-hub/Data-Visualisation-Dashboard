# Data-Visualisation-Dashboard

A web-based inventory dashboard for uploading, processing, and visualising product data.

## Features
- Upload CSV and XLSX files
- Store product and daily metric data in a database
- View inventory, procurement, and sales trends
- Compare selected products across multiple metrics
- Search and filter products
- Login/logout protection

## Tech Stack
- Next.js
- React
- Tailwind CSS
- Prisma ORM
- SQLite
- Recharts

## How to Run
1. Install dependencies:
   `npm install`

2. Run Prisma migration:
   `npx prisma migrate dev`

3. Start the development server:
   `npm run dev`

4. Open `http://localhost:3000/login`

## Login
- Username: `admin`
- Password: `password123`