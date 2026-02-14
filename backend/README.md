# Backend (Node.js + Express)

Minimal API base: Express, MongoDB (Mongoose), JWT auth.

## Setup

1. Copy `config/dev.env.example` to `config/dev.env` and set:
   - `Database_URL` – MongoDB connection string
   - `JWT_ADMIN_PK` – Secret for admin JWT signing
   - `JWT_USER_PK` – Secret for user (customer/driver) JWT signing

2. Install and run:

```bash
npm install
npm run dev
```

Server runs at `http://127.0.0.1:8000` by default.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | - | Health check |
| POST | /admin/signup | - | Create admin (body: email, password, name) |
| POST | /admin/login | - | Admin login |
| POST | /admin/logout | Bearer (admin) | Admin logout |
| GET | /admin/me | Bearer (admin) | Current admin |
| POST | /user/signup | - | Create user (body: email, password, name, userType?) |
| POST | /user/login | - | User login |
| POST | /user/logout | Bearer (user) | User logout |
| GET | /user/me | Bearer (user) | Current user |

## Structure

- **controllers/** – AuthController (admin), UserController (user), HealthController
- **routes/** – adminRoutes.js, userRoutes.js, defaultRoutes.js (apiBuilder)
- **middleware/** – adminAuth.js (JWT_ADMIN_PK), userAuth.js (JWT_USER_PK)
- **db/models/** – admin, user (userType: Customer/Driver)
- **db/services/** – AdminService, UserService
- **utils/** – apiBuilder (useAdminAuth(), useUserAuth()), constants, util, morgan, logger

To add routes: `.useAdminAuth()` or `.useUserAuth()` then `.build()` in the relevant route file.
