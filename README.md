# Virtual SMS SaaS Platform

A full-stack SaaS starter for selling virtual SMS activation numbers.

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript (dark modern dashboard UI)
- **Backend:** Node.js + Express
- **Database:** MySQL

## Project Structure

```text
.
├── backend/
│   ├── .env.example
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── services/
├── database/
│   └── schema.sql
├── frontend/
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
└── package.json
```

## Features Included

- User registration and login (JWT auth)
- Wallet balance and top-up flow
- Buy SMS activation number
- Show received SMS messages
- API provider webhook-ready endpoint
- Admin panel endpoints (stats and users)
- Transaction history

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create database and tables:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Configure environment:
   ```bash
   cp backend/.env.example backend/.env
   ```
4. Start backend:
   ```bash
   npm run dev
   ```
5. Start frontend:
   ```bash
   npm run frontend
   ```

## API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### User
- `GET /api/user/profile`
- `POST /api/user/wallet/topup`
- `GET /api/user/transactions`

### Numbers
- `GET /api/numbers/available`
- `POST /api/numbers/buy`
- `GET /api/numbers/messages`

### Admin
- `GET /api/admin/stats`
- `GET /api/admin/users`

### Provider Integration
- `POST /api/provider/webhook`

## Notes

- Frontend API base URL is configurable from the dashboard header.
- Use a strong `JWT_SECRET` and production-grade database credentials before deployment.
