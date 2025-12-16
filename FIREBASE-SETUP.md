# Firebase Authentication Setup Guide

## Step 1: Install Firebase Package

Open terminal in the frontend directory and run:

```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\frontend
npm install firebase
```

## Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Enter project name: **BlockTrace** (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 3: Register Web App

1. In Firebase Console, click the **Web icon** (</>) to add Firebase to your web app
2. Register app with nickname: **BlockTrace Web**
3. Copy the Firebase configuration object

## Step 4: Configure Firebase in Your Project

1. Open: `frontend/src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",              // From Firebase Console
  authDomain: "YOUR_AUTH_DOMAIN",       // e.g., blocktrace-xxxxx.firebaseapp.com
  projectId: "YOUR_PROJECT_ID",         // e.g., blocktrace-xxxxx
  storageBucket: "YOUR_STORAGE_BUCKET", // e.g., blocktrace-xxxxx.appspot.com
  messagingSenderId: "YOUR_SENDER_ID",  // Numeric ID
  appId: "YOUR_APP_ID"                  // Starts with 1:
}
```

## Step 5: Enable Authentication Methods

### Email/Password Authentication:
1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Enable both options:
   - ✅ Email/Password
   - ✅ Email link (passwordless sign-in) - Optional
4. Click **Save**

### Google Authentication:
1. In same **Sign-in method** page
2. Click **Google**
3. Enable the provider
4. Select your support email
5. Click **Save**

## Step 6: Configure Email Verification

1. In Firebase Console → **Authentication** → **Templates**
2. Click **Email address verification**
3. Customize the email template (optional)
4. Note: Verification emails will be sent from `noreply@YOUR-PROJECT.firebaseapp.com`

## Step 7: Add Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (already added by default)
   - Your production domain (when deploying)

## Step 8: Test the Setup

1. Start your frontend:
```powershell
cd C:\Users\Priyanshu\Desktop\Blocktrace\blocktrace-fabric\frontend
npm run dev
```

2. Navigate to: `http://localhost:5173/signup`
3. Create a test account
4. Check your email for verification link
5. Click the verification link
6. Login with your verified account

## Features Implemented

✅ **Email/Password Signup** with email verification
✅ **Email/Password Login** (requires verified email)
✅ **Google Sign-In** (one-click authentication)
✅ **Email Verification** (automatic on signup)
✅ **Protected Routes** (requires authentication)
✅ **User Profile Display** in Navbar
✅ **Logout Functionality**
✅ **Session Persistence** across page reloads

## Authentication Flow

1. **New User:**
   - Visit `/signup` → Create account → Receive verification email
   - Verify email → Visit `/login` → Access dashboard

2. **Existing User:**
   - Visit `/login` → Enter credentials → Access dashboard
   - OR Click "Login with Google" → Instant access

3. **Session:**
   - Stays logged in across page reloads
   - Protected pages redirect to login if not authenticated
   - Email verification required to access protected routes

## Troubleshooting

### Issue: "Firebase not installed"
**Solution:** Run `npm install firebase` in frontend directory

### Issue: "Invalid API key"
**Solution:** Double-check your firebase.js config matches Firebase Console

### Issue: "Email not verified" error
**Solution:** Check spam folder for verification email, or resend verification

### Issue: "Google login popup blocked"
**Solution:** Allow popups for localhost in browser settings

### Issue: "Unauthorized domain"
**Solution:** Add your domain to authorized domains in Firebase Console

## Security Best Practices

1. ✅ Never commit firebase.js with real credentials to public repos
2. ✅ Use environment variables for production
3. ✅ Enable email verification before allowing access
4. ✅ Implement password strength requirements (min 6 chars enforced)
5. ✅ Monitor authentication attempts in Firebase Console

## Next Steps (Optional Enhancements)

- [ ] Add password reset functionality
- [ ] Implement phone authentication
- [ ] Add role-based access control (RBAC)
- [ ] Set up Firebase Security Rules
- [ ] Add user profile editing
- [ ] Implement multi-factor authentication (MFA)

## Support

For Firebase documentation: https://firebase.google.com/docs/auth
For issues: Check Firebase Console → Authentication → Users tab
