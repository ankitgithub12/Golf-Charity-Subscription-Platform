# Golf Charity Subscription Platform

A full-stack MERN (MongoDB, Express, React, Node.js) platform designed for golf-themed charity subscriptions. Users can subscribe to monthly or yearly plans, submit their golf scores, and participate in prize draws where winnings are shared with their chosen charities.

## 🚀 Features

- **User Authentication**: Secure JWT-based login and registration.
- **Subscription Management**: Integrated with Stripe for monthly and yearly subscription plans.
- **Score Management**: Users can submit and track their golf scores.
- **Prize Draws**: Automated draw engine with prize pool calculations and charity distributions.
- **Charity Integration**: Users can select and support various charities.
- **Admin Dashboard**: Comprehensive management of users, subscriptions, draws, and charity data.
- **Media Uploads**: Cloudinary integration for profile pictures and proof of winnings.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Styling**: Vanilla CSS (Premium Custom Design)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Charts**: Recharts
- **State Management**: React Context API
- **Payments**: Stripe Elements

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Security**: Helmet, Express-Rate-Limit, Bcrypt.js
- **File Storage**: Cloudinary (via Multer)
- **Emails**: Nodemailer
- **Payments**: Stripe SDK

## 📁 Project Structure

```text
/
├── client/          # Frontend React application
├── server/          # Backend Express API
├── .gitignore       # Root-level Git ignore rules
└── README.md        # Project documentation
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Atlas or local)
- Stripe Account
- Cloudinary Account

### 1. Clone the repository
```bash
git clone <repository-url>
cd Golf-Charity-Subscription-Platform
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and fill in the following:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_MONTHLY_PRICE_ID=your_monthly_price_id
STRIPE_YEARLY_PRICE_ID=your_yearly_price_id
CLIENT_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_API_URL=http://localhost:5000/api
```

## 🏃 Running the Application

### Start Backend
```bash
cd server
npm run dev
```

### Start Frontend
```bash
cd client
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📄 License
[MIT License](LICENSE)
