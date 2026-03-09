# Virtual SMS SaaS Platform

All website/backend/database files are now grouped inside the `site/` folder.

## Tech Stack
- Frontend: HTML, CSS, Vanilla JavaScript (dark modern UI)
- Backend: Node.js + Express
- Database: MySQL

## Folder Layout

```text
site/
├── server.js
├── db.js
├── auth.js
├── authController.js
├── userController.js
├── numberController.js
├── adminController.js
├── providerController.js
├── walletService.js
├── authRoutes.js
├── userRoutes.js
├── numberRoutes.js
├── adminRoutes.js
├── providerRoutes.js
├── index.html
├── styles.css
├── app.js
├── schema.sql
├── .env.example
├── package.json
└── package-lock.json
```

## Setup
From repository root:

1. Install dependencies:
   ```bash
   npm --prefix site install
   ```
2. Create database schema:
   ```bash
   mysql -u root -p < site/schema.sql
   ```
3. Create environment file:
   ```bash
   cp site/.env.example site/.env
   ```
4. Run backend:
   ```bash
   npm run dev
   ```
5. Run frontend:
   ```bash
   npm run frontend
   ```

## API Base URL
Frontend expects backend at `http://localhost:5000/api`.
