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

## Prerequisites
- Node.js **v20.19+**, **v22.12+**, or **v24+**
  - If you need to manage multiple Node versions, use [nvm](https://github.com/nvm-sh/nvm):
    ```
    nvm install 22
    nvm use 22
    ```

## How to Run

1. Clone the repository:
   ```
   git clone https://github.com/nan306452-hub/Data-Visualisation-Dashboard.git
   cd Data-Visualisation-Dashboard
   ```

2. Create the environment file:
   ```
   echo 'DATABASE_URL="file:./dev.db"' > .env
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Rebuild native modules for your Node version:
   ```
   npm rebuild better-sqlite3
   ```

5. Run Prisma migration:
   ```
   npx prisma migrate dev --name init
   ```

6. Generate Prisma client:
   ```
   npx prisma generate
   ```

7. Seed the database (creates the admin user):
   ```
   npx prisma db seed
   ```

8. Start the development server:
   ```
   npm run dev
   ```

9. Open `http://localhost:3000/login`

## Login
- Username: `admin`
- Password: `password123`