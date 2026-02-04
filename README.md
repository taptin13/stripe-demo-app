# Stripe Connect Express Demo

A complete Node.js application demonstrating Stripe Connect Express account integration with user signup, restaurant registration, and Stripe account onboarding.

## Features

- ✅ **User Authentication**: Signup and login with JWT-based sessions
- ✅ **Restaurant Management**: Create and manage restaurant profiles
- ✅ **Stripe Connect Express**: Create Express accounts for restaurants
- ✅ **Account Onboarding**: Complete Stripe onboarding flow
- ✅ **Status Tracking**: Monitor account verification and capabilities
- ✅ **Modern UI**: Clean, responsive interface

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Authentication**: JWT, bcrypt
- **Payments**: Stripe Connect Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Stripe account (get API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys))

## Installation

1. **Clone or navigate to the project directory**

```bash
cd StripeDemo
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env` and add your Stripe keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
JWT_SECRET=your_random_secret_key_here
NODE_ENV=development
PORT=3000
```

To get Stripe API keys:
- Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- Copy your **Secret Key** (starts with `sk_test_`)
- Use test mode keys for development

**Note:** This demo only requires the Secret Key. The Publishable Key is not needed since all Stripe operations happen server-side.

**Using Restricted Keys (Recommended for Production):**
- Create a restricted key at [API Keys](https://dashboard.stripe.com/test/apikeys)
- Required permissions:
  - ✅ Accounts: Read & Write
  - ✅ Account Links: Write
- Use format: `rk_test_...`

## Running the Application

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage Flow

### 1. User Signup/Login
- Navigate to `http://localhost:3000`
- Click "Sign Up" to create a new account
- Or "Login" if you already have an account

### 2. Register a Restaurant
- After login, go to the Dashboard
- Click "Create Restaurant"
- Fill in restaurant details (name, email, address, etc.)
- Submit the form

### 3. Connect Stripe Account
- From the Dashboard, click on your restaurant
- Click "Create Stripe Account"
- You'll be redirected to Stripe's onboarding flow
- Complete the required information
- Return to the app to see the account status

### 4. Monitor Status
- View charges and payouts enabled status
- Check for any pending requirements
- Refresh onboarding link if needed

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user (protected)

### Restaurants
- `POST /api/restaurants` - Create restaurant (protected)
- `GET /api/restaurants` - Get all user's restaurants (protected)
- `GET /api/restaurants/:id` - Get single restaurant (protected)
- `PUT /api/restaurants/:id` - Update restaurant (protected)
- `DELETE /api/restaurants/:id` - Delete restaurant (protected)

### Stripe Connect
- `POST /api/restaurants/:id/stripe/create` - Create Stripe Express account (protected)
- `GET /api/restaurants/:id/stripe/status` - Check account status (protected)
- `GET /api/restaurants/:id/stripe/refresh` - Refresh onboarding link (protected)

## Database Schema

### Users Table
- `id` (INTEGER, PRIMARY KEY)
- `email` (TEXT, UNIQUE)
- `password` (TEXT, hashed)
- `name` (TEXT)
- `created_at` (DATETIME)

### Restaurants Table
- `id` (INTEGER, PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY)
- `name` (TEXT)
- `email` (TEXT)
- `phone`, `address`, `city`, `state`, `postal_code`, `country`
- `stripe_account_id` (TEXT)
- `stripe_charges_enabled` (BOOLEAN)
- `stripe_payouts_enabled` (BOOLEAN)
- `onboarding_link` (TEXT)
- `created_at`, `updated_at` (DATETIME)

## Stripe Connect Express Flow

1. **Account Creation**: Creates a Stripe Express account with restaurant details
2. **Onboarding Link**: Generates an account link for the onboarding flow
3. **User Onboarding**: Restaurant owner completes Stripe's onboarding process
4. **Return URL**: User returns to app after completing onboarding
5. **Status Check**: App verifies account capabilities (charges_enabled, payouts_enabled)
6. **Ready**: Account is ready to accept payments

## Testing

Use Stripe's test mode:
- Test card: `4242 4242 4242 4242`
- Use any future expiry date
- Use any 3-digit CVC
- Use any postal code

For Express account testing:
- Use test phone numbers and addresses
- Test SSN: `000-00-0000`
- Test ID numbers as shown in Stripe docs

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens stored in HTTP-only cookies
- Stripe secret key kept server-side only
- All Stripe routes require authentication
- User can only access their own restaurants

## Project Structure

```
StripeDemo/
├── public/              # Frontend HTML pages
│   ├── index.html
│   ├── signup.html
│   ├── login.html
│   ├── dashboard.html
│   ├── restaurants.html
│   └── restaurant-detail.html
├── routes/              # API route handlers
│   ├── auth.js
│   ├── restaurants.js
│   └── stripe.js
├── db.js               # Database initialization
├── middleware.js       # Authentication middleware
├── server.js          # Express server setup
├── package.json
├── .env.example       # Environment variables template
├── .gitignore
└── README.md
```

## Troubleshooting

**Database errors**: Delete `stripe_demo.db` file and restart the server

**Authentication issues**: Clear browser cookies and try again

**Stripe errors**: 
- Verify API keys in `.env`
- Check Stripe Dashboard for account status
- Ensure test mode is enabled

**Port already in use**: Change `PORT` in `.env` file

## Next Steps

To extend this demo:
- Add payment processing endpoints
- Implement transfer creation for connected accounts
- Add webhook handling for account updates
- Create admin dashboard
- Add email notifications
- Implement dashboard OAuth flow (alternative to Express)

## Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Express Accounts Guide](https://stripe.com/docs/connect/express-accounts)
- [Account Links API](https://stripe.com/docs/api/account_links)
- [Testing Connect](https://stripe.com/docs/connect/testing)

## License

MIT

## Support

For issues or questions:
- Check Stripe documentation
- Review server logs
- Verify environment variables
- Test with Stripe CLI for webhooks
