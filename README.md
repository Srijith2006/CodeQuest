# CodeQuest

A full-stack StackOverflow-style Q&A platform built with Next.js and Express, extended with social networking, a subscription/payments system, a gamified reward economy, multi-language support, and strong security controls around authentication and password recovery.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Security Notes](#security-notes)

## Features

### Core Q&A Platform
- Ask, answer, and tag questions
- Upvote/downvote on both questions and individual answers
- Filter questions by Newest, Active, and Unanswered, with tag and keyword search
- User profiles and a friends system

### Social Space
- A public feed where users can upload photos/videos and like, comment on, and share posts
- Posting frequency is gated by social connections to encourage relationship-building:
  - 0 friends → posting disabled
  - 1 friend → 1 post per day
  - 2 friends → 2 posts per day
  - More than 10 friends → unlimited posting

### Articles
- Long-form technical writing, separate from the Q&A flow
- Category and tag-based browsing with search
- Automatic read-time estimation based on word count
- View counts and a like system
- A "Featured" section computed dynamically from the most-engaged articles

### Subscriptions & Payments
- Razorpay-integrated subscription tiers controlling daily question-posting limits:

  | Plan | Price | Daily Question Limit |
  |---|---|---|
  | Free | ₹0 | 1 |
  | Bronze | ₹100/month | 5 |
  | Silver | ₹300/month | 10 |
  | Gold | ₹1000/month | Unlimited |

- Automatic invoice email sent on successful subscription, detailing plan, amount, order ID, and payment ID
- Payments are only accepted between 10:00 AM and 11:00 AM IST

### Reward & Points System
- +5 points for every answer submitted
- An additional +5 bonus once an answer reaches 5 upvotes (awarded once per answer)
- Points are deducted if an answer is deleted or downvoted
- Users can transfer points to other users by searching their profile — only available to users holding more than 10 points

### Multi-Language Support
- Six supported languages: English, Spanish, Hindi, Portuguese, Chinese, and French
- Switching to French requires OTP verification sent to the user's registered email
- Switching to any other language requires OTP verification sent via SMS to the user's registered mobile number (Twilio)

### Authentication & Account Security
- JWT-based authentication with bcrypt password hashing
- Forgot Password flow supporting both email and phone number recovery:
  - Limited to one request per day per account
  - Generates a random password containing only uppercase and lowercase letters
  - Delivered via email (Brevo) or SMS (Twilio) depending on the option chosen
- Full login history tracking per user, recording browser, operating system, device type, and IP address
- Adaptive authentication based on login context:
  - Google Chrome logins require OTP verification via email
  - Microsoft Edge logins proceed without additional verification
  - Mobile device logins are time-restricted to between 10:00 AM and 1:00 PM

## Tech Stack

**Frontend:** Next.js, TypeScript, React, Tailwind CSS
**Backend:** Node.js, Express
**Database:** MongoDB with Mongoose
**Authentication:** JSON Web Tokens (JWT), bcrypt
**Payments:** Razorpay
**Transactional Email:** Brevo (HTTPS API)
**SMS / OTP Delivery:** Twilio
**Deployment:** Vercel (frontend), Render (backend)

## Project Structure

```
stackoverflow-clone-main/
├── server/                  # Express backend
│   ├── controller/          # Route handlers (auth, question, answer, article, etc.)
│   ├── middleware/          # Auth middleware
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express route definitions
│   ├── utils/               # Shared utilities (email sending, etc.)
│   └── index.js             # App entry point
└── stack/                   # Next.js frontend
    └── src/
        ├── components/      # Reusable UI components
        ├── layout/           # Page layout wrappers
        ├── lib/              # Auth context, Axios instance, utilities
        └── pages/            # Route-based pages
```

## Getting Started

### Prerequisites
- Node.js 18 or later
- A MongoDB Atlas cluster (or local MongoDB instance)
- Accounts with Razorpay, Brevo, and Twilio for the relevant features

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd stackoverflow-clone-main

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../stack
npm install
```

### Running locally

```bash
# Start the backend (from /server)
npm run dev

# Start the frontend (from /stack, in a separate terminal)
npm run dev
```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:5000` by default.

## Environment Variables

Create a `.env` file inside `server/` with the following values (never commit this file):

```
PORT=5000
MONGODB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Payments (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Security Notes

- `.env` is excluded from version control via `.gitignore` and must never be committed
- All password reset and OTP flows enforce server-side rate limiting and verification before any sensitive action is applied
- Generated passwords avoid numbers and special characters per project specification, while still combining uppercase and lowercase letters
- Sensitive operations (point transfers, password resets, payments) are time- or threshold-gated to prevent abuse

---

Built as part of an internship project to demonstrate full-stack development, third-party API integration, and security-conscious feature design.
