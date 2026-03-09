# StayNest

StayNest is a full-stack homestay booking platform where guests can discover properties, hosts can manage listings and bookings, and both parties can communicate in real time for booking discussions.

This repository includes:

- A Node.js + Express + MongoDB backend API
- A React + Vite frontend web app
- API test collection files for Bruno

## What StayNest Offers

- User registration and login with email/password
- Email verification required before login
- Google OAuth login and role selection flow
- Role-based access for guest, host, and admin
- Property listing, search, filtering, and detail pages
- Host dashboard for property management
- Booking requests and booking history
- Booking-specific in-app messaging (guest <-> host) via Socket.IO
- Reviews and ratings
- Wishlist support
- Profile management and profile image upload
- Admin dashboard and moderation/management endpoints
- Support query and phone callback request forms

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios + Fetch
- Formik + Yup
- Socket.IO Client
- React Toastify
- Google Analytics (`react-ga4`)

### Backend

- Node.js
- Express
- MongoDB + Mongoose
- JWT authentication
- Passport (Google OAuth + JWT strategy)
- Socket.IO
- Cloudinary + Multer (image upload)
- Nodemailer (verification/support email flows)
- Helmet, CORS, rate limiting, cookie/session middleware

## Repository Structure

```text
StayNest_Capstone/
  backend/                # Express API, models, routes, controllers
  frontend/stayNest/      # React app (Vite)
  stayNest_api_testing/   # Bruno API request collection
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB connection string (local or cloud)
- Cloudinary account (for image uploads)
- Google OAuth credentials (for social login)
- Email provider credentials (for verification/support emails)

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env` with values like:

```env
NODE_ENV=development
PORT=5000
HOST=localhost

MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
```

### Frontend (`frontend/stayNest/.env`)

Create `frontend/stayNest/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_ANALYTICS_ID=your_ga_measurement_id
```

## Installation and Run

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend/stayNest
npm install
```

### 3. Run backend (Terminal 1)

```bash
cd backend
npm run dev
```

Backend starts on `http://localhost:5000` by default.

### 4. Run frontend (Terminal 2)

```bash
cd frontend/stayNest
npm run dev
```

Frontend starts on `http://localhost:5173` (or next free Vite port).

## Available Scripts

### Backend (`backend/package.json`)

- `npm run dev` - start server with nodemon
- `npm start` - start server with node

### Frontend (`frontend/stayNest/package.json`)

- `npm run dev` - run Vite development server
- `npm run build` - build production bundle
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Authentication and Roles

- Email/password users must verify email before login.
- Google OAuth users are treated as verified and can complete role selection.
- Role behavior:
- `guest`: browse, book, review, wishlist, message host in booking chat
- `host`: all guest actions + manage own property listings
- `admin`: platform-level dashboard and moderation/management APIs

## Real-Time Chat (Booking Messaging)

StayNest supports in-app messaging between guest and host for a specific booking.

- Transport: Socket.IO
- Scope: booking room (`booking:<bookingId>`) + user room (`user:<userId>`)
- REST fallback/endpoints used for history/send/read status:
- `GET /api/messages/unread-count`
- `GET /api/messages/booking/:bookingId`
- `POST /api/messages/booking/:bookingId`
- `PATCH /api/messages/booking/:bookingId/read`

## API Overview

Main API groups:

- `/api/users` - registration, login, profile, host conversion, email verify
- `/api/auth` - Google OAuth, current user, role update
- `/api/properties` - property CRUD and listing/search
- `/api/bookings` - booking creation and management
- `/api/reviews` - review CRUD
- `/api/wishlist` - wishlist operations
- `/api/upload` - property/profile image upload
- `/api/support` - support query and callback requests
- `/api/admin` - admin dashboards and moderation
- `/api/messages` - booking chat and unread counts

Detailed API documentation: `backend/docs/API.md`

## API Testing (Bruno)

Bruno requests are included in `stayNest_api_testing/`.

To use:

- Open Bruno
- Import/open `stayNest_api_testing/bruno.json`
- Select the `Local` environment in `stayNest_api_testing/environments/Local.bru`
- Run requests in sequence (register -> login -> protected endpoints)

## Deployment Notes

- Existing backend deployment reference: `https://s85-rajeev-ranjan-mandal-capstone.onrender.com`
- Set production `FRONTEND_URL` and OAuth callback URL correctly.
- Use secure secrets and do not commit `.env` files.
- Enable HTTPS in production for secure cookies and OAuth callbacks.

## Security Highlights

- JWT-based API auth
- Password hashing with bcrypt
- Email verification before credential login
- OAuth integration via Passport
- CORS allowlist configuration
- Helmet security headers
- Route-level and global rate limiting
- Input validation middleware

## Troubleshooting

- CORS errors:
- Ensure `FRONTEND_URL` in backend `.env` matches your active frontend origin.
- API/network errors in frontend:
- Verify `VITE_API_URL` points to backend `/api` base URL.
- OAuth redirect issues:
- Confirm `GOOGLE_CALLBACK_URL` and Google Console redirect URI match exactly.
- Port already in use:
- Change port in `.env` or stop existing process using that port.

## Future Improvements

- Add automated unit/integration tests (backend + frontend)
- Add CI pipeline for lint/build/test/audit checks
- Harden dependency vulnerability management (`npm audit` remediation)
- Improve observability (structured logs + monitoring)

## License

This project currently has no explicit license file in the repository.

## Deployed Link -: 
https://stayneest.netlify.app/ 