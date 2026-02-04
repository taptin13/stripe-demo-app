#!/usr/bin/env node

/**
 * Setup Validation Script
 * Checks if the Stripe Connect Express demo is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Validating Stripe Connect Express Demo Setup...\n');

let errors = [];
let warnings = [];

// Check if .env exists
if (!fs.existsSync('.env')) {
  errors.push('❌ .env file not found. Copy .env.example to .env');
} else {
  console.log('✅ .env file exists');
  
  // Check if Stripe keys are configured
  const envContent = fs.readFileSync('.env', 'utf8');
  
  if (envContent.includes('your_key_here') || envContent.includes('sk_test_your')) {
    warnings.push('⚠️  Stripe keys not configured in .env file');
    console.log('⚠️  Please add your Stripe API keys to .env');
  } else if (envContent.includes('STRIPE_SECRET_KEY=sk_test_')) {
    console.log('✅ Stripe secret key configured');
  }
  
  if (!envContent.includes('JWT_SECRET=') || envContent.includes('your_jwt_secret')) {
    warnings.push('⚠️  JWT_SECRET not configured properly');
  } else {
    console.log('✅ JWT secret configured');
  }
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
  errors.push('❌ node_modules not found. Run: npm install');
} else {
  console.log('✅ Dependencies installed');
}

// Check if required files exist
const requiredFiles = [
  'server.js',
  'db.js',
  'middleware.js',
  'package.json',
  'routes/auth.js',
  'routes/restaurants.js',
  'routes/stripe.js',
  'public/index.html',
  'public/signup.html',
  'public/login.html',
  'public/dashboard.html',
  'public/restaurants.html',
  'public/restaurant-detail.html'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    errors.push(`❌ Missing file: ${file}`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('✅ All required files present');
}

// Check if required dependencies are in package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['express', 'stripe', 'dotenv', 'bcrypt', 'jsonwebtoken', 'sqlite3', 'body-parser', 'cookie-parser'];
let allDepsPresent = true;

requiredDeps.forEach(dep => {
  if (!packageJson.dependencies[dep]) {
    errors.push(`❌ Missing dependency: ${dep}`);
    allDepsPresent = false;
  }
});

if (allDepsPresent) {
  console.log('✅ All dependencies defined');
}

console.log('\n' + '='.repeat(60) + '\n');

if (errors.length > 0) {
  console.log('❌ ERRORS FOUND:\n');
  errors.forEach(err => console.log(err));
  console.log('\nPlease fix these errors before starting the server.\n');
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(warn => console.log(warn));
  console.log('\n📝 ACTION REQUIRED:\n');
  console.log('1. Open .env file');
  console.log('2. Go to https://dashboard.stripe.com/test/apikeys');
  console.log('3. Copy your Test Mode API keys');
  console.log('4. Replace the placeholder values in .env\n');
  console.log('Then run: npm start\n');
  process.exit(0);
}

console.log('✅ All checks passed!\n');
console.log('🚀 Ready to start the server:\n');
console.log('   npm start        (production mode)');
console.log('   npm run dev      (development mode with auto-reload)\n');
console.log('📖 Then open: http://localhost:3000\n');
console.log('📚 For setup instructions, see: SETUP.md or CHECKLIST.md\n');
