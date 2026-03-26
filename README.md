# ⛳ Golf Charity Subscription Platform

A premium, full-stack MERN (MongoDB, Express, React, Node.js) platform designed to revolutionize charity giving through golf. Users subscribe to monthly or yearly plans, track their scores in a professional dashboard, and enter exclusive monthly draws where winnings are shared with their chosen charities.

---

## 🚀 Live Demo

- **Frontend**: [https://golf-charity-subscription-platform-1b16.onrender.com](https://golf-charity-subscription-platform-1b16.onrender.com)
- **API Server**: [https://golf-charity-subscription-platform-server.onrender.com](https://golf-charity-subscription-platform-server.onrender.com)

---

## 💳 Testing Credentials

To test the payment flow, use the following Stripe test card details:

| Field          | Value                   |
| -------------- | ----------------------- |
| **Card Number** | `4242 4242 4242 4242`   |
| **Expiry Date** | `12 / 26` (or any future) |
| **CVC**         | `123`                   |
| **ZIP Code**    | `90210`                 |

---

## ✨ Features

### 👤 User Experience
- **Premium Dashboard**: A high-end, glassmorphism-based UI for tracking scores and draw entry status.
- **Participation Summary**: Redesigned summary cards with icon-driven stats and real-time activity indicators.
- **Charity Choice**: Users can select from a curated list of charities and set their own contribution percentages (10% to 50%).
- **Score Tracking**: Log and manage the latest 5 Stableford scores to maintain draw eligibility.
- **Secure Authentication**: JWT-based login, registration, and a modernized password reset flow.

### 📧 Premium Communications
- **Redesigned Email Suite**: Fully custom, dark-mode responsive emails for:
  - **Welcome**: Dynamic onboarding guide.
  - **Password Reset**: Secure, time-limited reset links with high-visibility CTAs.
  - **Winner Notification**: Celebratory gold-themed alerts.
  - **Draw Results**: Comprehensive result summaries with dynamic number badges.

### 🛡️ Admin & Backend
- **Advanced Admin Panel**: Manage users, audit scores, publish draws, and oversee charity partnerships.
- **Automated Draw Engine**: Calculates prize pools and handles monthly winner selection logic.
- **Financial Integration**: Secure subscription handling via Stripe (Monthly/Yearly tiers).
- **Media Management**: Cloudinary-powered uploads for profile assets and winner verification proofs.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (Premium Custom Design System)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Payments**: Stripe Elements

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: JWT, Bcrypt.js, Helmet, Express-Rate-Limit
- **File Storage**: Cloudinary + Multer
- **Emails**: SendGrid API (`@sendgrid/mail`)
- **Payments**: Stripe SDK

---

## 📁 Project Structure

```text
/
├── client/          # Frontend React application (Vite)
├── server/          # Backend Express API & Controllers
├── .gitignore       # Root-level Git ignore rules
└── README.md        # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster
- SendGrid API Key
- Stripe Account
- Cloudinary Account

### 1. Clone & Install
```bash
git clone <repository-url>
cd Golf-Charity-Subscription-Platform

# Install Backend
cd server
npm install

# Install Frontend
cd ../client
npm install
```

### 2. Environment Configuration

#### Backend (`server/.env`)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_MONTHLY_PRICE_ID=your_monthly_price_id
STRIPE_YEARLY_PRICE_ID=your_yearly_price_id

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=your_verified_sender
FROM_NAME=Golf Charity Platform

# Admin
ADMIN_REGISTRATION_SECRET=your_admin_secret
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`)
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

1. **Start Backend**: `cd server && npm run dev`
2. **Start Frontend**: `cd client && npm run dev`

The platform will be live at `http://localhost:5173`.

---

## 📄 License
[MIT License](LICENSE)
