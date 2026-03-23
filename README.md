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

### Node.js
This project requires Node.js **v20.19+**, **v22.12+**, or **v24+**.

Check your version:
```
node -v
```

If you need to install or switch versions:

**Mac / Linux** — use [nvm](https://github.com/nvm-sh/nvm):
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Restart your terminal, then:
nvm install 22
nvm use 22
```

**Windows** — use [nvm-windows](https://github.com/coreybutler/nvm-windows):
- Download and run the installer from the [releases page](https://github.com/coreybutler/nvm-windows/releases)
- Then in Command Prompt or PowerShell:
```
nvm install 22
nvm use 22
```

### Git
Make sure [Git](https://git-scm.com/downloads) is installed to clone the repository.

---

## How to Run

### 1. Clone the repository
```
git clone https://github.com/nan306452-hub/Data-Visualisation-Dashboard.git
cd Data-Visualisation-Dashboard
```

### 2. Create the environment file

**Mac / Linux:**
```
echo 'DATABASE_URL="file:./dev.db"' > .env
```

**Windows (Command Prompt):**
```
echo DATABASE_URL="file:./dev.db" > .env
```

**Windows (PowerShell):**
```
'DATABASE_URL="file:./dev.db"' | Out-File -Encoding utf8 .env
```

> Alternatively on any platform, create a file called `.env` in the project root and add this line:
> ```
> DATABASE_URL="file:./dev.db"
> ```

### 3. Install dependencies
```
npm install
```

### 4. Rebuild native modules for your Node version
```
npm rebuild better-sqlite3
```

### 5. Run Prisma migration
```
npx prisma migrate dev --name init
```

### 6. Generate Prisma client
```
npx prisma generate
```

### 7. Seed the database
This creates the admin user needed to log in:
```
npx prisma db seed
```

### 8. Start the development server
```
npm run dev
```

### 9. Open the app
Go to `http://localhost:3000/login` in your browser.

---

## Login
- Username: `admin`
- Password: `password123`