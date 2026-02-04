# Application Flow Diagram

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    1. USER SIGNUP/LOGIN                      │
│                                                              │
│  Landing Page (/)                                           │
│      ↓                                                      │
│  Sign Up (/signup) ──→ Create User ──→ JWT Cookie          │
│      OR                                                     │
│  Login (/login)   ──→ Verify User ──→ JWT Cookie           │
│      ↓                                                      │
│  Dashboard (/dashboard)                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  2. RESTAURANT REGISTRATION                  │
│                                                              │
│  Dashboard                                                   │
│      ↓                                                      │
│  "Create Restaurant" Button                                 │
│      ↓                                                      │
│  Restaurant Form (/restaurants)                             │
│      - Name, Email, Phone                                   │
│      - Address, City, State, ZIP                            │
│      - Country                                              │
│      ↓                                                      │
│  POST /api/restaurants                                      │
│      ↓                                                      │
│  Save to Database                                           │
│      ↓                                                      │
│  Redirect to Restaurant Detail                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                3. STRIPE CONNECT INTEGRATION                 │
│                                                              │
│  Restaurant Detail Page (/restaurants/:id)                  │
│      ↓                                                      │
│  "Create Stripe Account" Button                             │
│      ↓                                                      │
│  POST /api/restaurants/:id/stripe/create                    │
│      ↓                                                      │
│  ┌──────────────────────────────────┐                      │
│  │ Stripe API: Create Express Account│                      │
│  │  - Type: express                  │                      │
│  │  - Business info from restaurant  │                      │
│  │  - Email, name, address           │                      │
│  └──────────────────────────────────┘                      │
│      ↓                                                      │
│  Save stripe_account_id to DB                               │
│      ↓                                                      │
│  Generate Account Link (onboarding_url)                     │
│      ↓                                                      │
│  Open Stripe Onboarding in New Tab                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              4. STRIPE ONBOARDING FLOW                       │
│                                                              │
│  ┌────────────────────────────────┐                         │
│  │  Stripe Hosted Onboarding      │                         │
│  │                                │                         │
│  │  → Personal Information        │                         │
│  │  → Business Details            │                         │
│  │  → Banking Information         │                         │
│  │  → Verification Documents      │                         │
│  │  → Terms of Service            │                         │
│  └────────────────────────────────┘                         │
│      ↓                                                      │
│  User Completes or Exits                                    │
│      ↓                                                      │
│  Return to App (return_url)                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 5. STATUS CHECK & MONITORING                 │
│                                                              │
│  Restaurant Detail Page                                      │
│      ↓                                                      │
│  GET /api/restaurants/:id/stripe/status                     │
│      ↓                                                      │
│  ┌──────────────────────────────────┐                      │
│  │ Stripe API: Retrieve Account     │                      │
│  │  - charges_enabled               │                      │
│  │  - payouts_enabled               │                      │
│  │  - requirements (if incomplete)  │                      │
│  └──────────────────────────────────┘                      │
│      ↓                                                      │
│  Display Status:                                            │
│    ✓ Active (if fully verified)                            │
│    ⏳ Pending (if incomplete)                               │
│    ❌ Requires Action                                       │
│      ↓                                                      │
│  If Incomplete: Show "Refresh Link" Button                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Structure

```
┌─────────────────────┐
│       users         │
├─────────────────────┤
│ id (PK)            │
│ email (UNIQUE)     │
│ password (HASHED)  │
│ name               │
│ created_at         │
└─────────────────────┘
         │ 1
         │
         │ has many
         │
         ↓ N
┌─────────────────────┐
│    restaurants      │
├─────────────────────┤
│ id (PK)            │
│ user_id (FK)       │───→ References users.id
│ name               │
│ email              │
│ phone              │
│ address            │
│ city               │
│ state              │
│ postal_code        │
│ country            │
│                    │
│ stripe_account_id  │───→ Links to Stripe
│ stripe_charges_enabled │
│ stripe_payouts_enabled │
│ onboarding_link    │
│ created_at         │
│ updated_at         │
└─────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────────┐
│   Browser    │
└──────────────┘
       ↓
   Login/Signup
       ↓
┌──────────────────────────┐
│  POST /api/auth/login    │
│  POST /api/auth/signup   │
└──────────────────────────┘
       ↓
   Verify Credentials
       ↓
┌──────────────────────────┐
│   Generate JWT Token     │
│   (userId + secret)      │
└──────────────────────────┘
       ↓
   Set HTTP-Only Cookie
       ↓
┌──────────────────────────┐
│   Every Request:         │
│   Cookie → Middleware    │
│   → Verify Token         │
│   → Extract userId       │
│   → Attach to req        │
└──────────────────────────┘
       ↓
   Protected Routes
   (restaurants, stripe)
```

---

## 🎨 Frontend Architecture

```
public/
├── index.html                 Landing/Home Page
│   ↓ Sign Up Button
│
├── signup.html               User Registration
│   ↓ POST /api/auth/signup
│   ↓ Success → Dashboard
│
├── login.html                User Login
│   ↓ POST /api/auth/login
│   ↓ Success → Dashboard
│
├── dashboard.html            Main Dashboard
│   ├── GET /api/auth/user   (Load user info)
│   ├── GET /api/restaurants (Load restaurants)
│   ↓ "Create Restaurant"
│
├── restaurants.html          Restaurant Form
│   ↓ POST /api/restaurants
│   ↓ Success → Restaurant Detail
│
└── restaurant-detail.html    Restaurant + Stripe
    ├── GET /api/restaurants/:id
    ├── GET /api/restaurants/:id/stripe/status
    ├── POST /api/restaurants/:id/stripe/create
    └── GET /api/restaurants/:id/stripe/refresh
```

---

## 🔌 Stripe Connect Flow

```
┌─────────────┐
│     App     │
└─────────────┘
       ↓
   Create Express Account
       ↓
┌───────────────────────────┐
│  stripe.accounts.create({ │
│    type: 'express',        │
│    country: 'US',          │
│    email: restaurant.email,│
│    business_profile: {...} │
│  })                        │
└───────────────────────────┘
       ↓
   Returns: account.id
       ↓
   Save to Database
       ↓
┌───────────────────────────┐
│ stripe.accountLinks.create│
│   account: account.id,    │
│   type: 'account_onboarding'│
│   refresh_url: ...        │
│   return_url: ...         │
│ })                        │
└───────────────────────────┘
       ↓
   Returns: onboarding_url
       ↓
   User Opens Link
       ↓
┌─────────────────────────┐
│   Stripe Onboarding     │
│   (Hosted by Stripe)    │
└─────────────────────────┘
       ↓
   User Completes
       ↓
   Redirects to return_url
       ↓
┌─────────────────────────┐
│ App checks status:      │
│ stripe.accounts.retrieve│
└─────────────────────────┘
       ↓
   charges_enabled ✓
   payouts_enabled ✓
       ↓
   Ready for payments!
```

---

## 📡 API Request/Response Examples

### Create Restaurant
```
POST /api/restaurants
Authorization: Cookie (JWT)

Request:
{
  "name": "Test Restaurant",
  "email": "test@restaurant.com",
  "phone": "555-0100",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "postal_code": "94102",
  "country": "US"
}

Response:
{
  "success": true,
  "message": "Restaurant created successfully",
  "restaurantId": 1
}
```

### Create Stripe Account
```
POST /api/restaurants/1/stripe/create
Authorization: Cookie (JWT)

Response:
{
  "success": true,
  "onboarding_url": "https://connect.stripe.com/...",
  "stripe_account_id": "acct_xxxxxxxxxxxxx"
}
```

### Check Status
```
GET /api/restaurants/1/stripe/status
Authorization: Cookie (JWT)

Response:
{
  "status": "account_created",
  "charges_enabled": true,
  "payouts_enabled": true,
  "stripe_account_id": "acct_xxxxxxxxxxxxx",
  "requirements": {
    "currently_due": [],
    "past_due": []
  }
}
```

---

## 🎯 Key Integration Points

1. **User → Restaurant**: One-to-Many relationship
2. **Restaurant → Stripe**: One-to-One via stripe_account_id
3. **Auth → All Routes**: JWT middleware protection
4. **Frontend → Backend**: Fetch API with cookies
5. **Backend → Stripe**: Stripe Node.js SDK

---

This diagram shows the complete flow from user signup through Stripe account creation and onboarding!
