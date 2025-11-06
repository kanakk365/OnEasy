# OnEasy Frontend Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or port 3000)

## 🔗 Backend Connection

The frontend is now connected to the backend API at `http://localhost:3001`

### Features Connected:

1. **Phone Login with OTP** ✅
   - Enter phone number
   - Receive OTP via MSG91 SMS
   - Verify OTP
   - Redirect to dashboard

2. **Google OAuth Login** ✅
   - Click "Continue with Google"
   - Authenticate with Google
   - Redirect to dashboard

3. **Role-based Routing** ✅
   - Admin/Super Admin → `/admin`
   - Partner/Manager → `/partner`
   - Client → `/client`

## 📝 Testing the Login Flow

### Phone Login:

1. Open `http://localhost:5173/`
2. Enter phone number (e.g., `9876543210`)
3. Click "Sign In"
4. **Check browser console** for OTP (development mode)
5. **Or check your phone** for SMS from MSG91
6. Enter the 6-digit OTP
7. You'll be redirected to the dashboard

### Test Phone Numbers (for development):

- `+919876543210`
- `+918765432109`

### OTP Display:

In development mode, you'll see:
- Alert popup with OTP
- Console log with OTP
- Actual SMS on your phone (if MSG91 is working)

## 🎨 UI Components

### Login Page (`/`)
- Phone number input with country code
- Google OAuth button
- Validates phone number
- Shows loading states
- Error handling

### OTP Verification Page (`/verify-otp`)
- 6-digit OTP input fields
- Auto-focus next input
- Paste support
- Resend OTP functionality (30s timer)
- Real-time validation

### Dashboard Pages
- **Client Dashboard** (`/client`) - For customers
- **Admin Dashboard** (`/admin`) - For admins
- **Partner Dashboard** (`/partner`) - For partners

## 🔧 Configuration

The frontend automatically connects to:
- **Backend API**: `http://localhost:3001/api/v1`

You can change this in `frontend/src/config/auth.js`:

```javascript
API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api/v1'
```

## 📱 Available Routes

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Login page | Public |
| `/verify-otp` | OTP verification | Public |
| `/referral` | Referral code entry | Public |
| `/client` | Client dashboard | Private |
| `/admin` | Admin dashboard | Private |
| `/partner` | Partner dashboard | Private |
| `/registrations` | Company registration flow | Private |
| `/company-categories` | Select company type | Private |
| `/company/:type` | Company details & packages | Private |
| `/company-form` | Multi-step registration form | Private |

## 🛠️ Troubleshooting

### Can't Connect to Backend?
1. Make sure backend is running on port 3001
2. Check backend console for errors
3. Verify CORS settings in backend `.env`

### OTP Not Showing?
1. Check browser console (F12)
2. Check backend console for OTP
3. Look for alert popup
4. Check your phone for SMS

### Google Login Not Working?
1. Backend needs `GOOGLE_CLIENT_ID` configured
2. Check browser console for errors
3. Verify Google OAuth credentials

### Page Not Redirecting After Login?
1. Check browser console for errors
2. Verify user role in response
3. Check network tab for API responses

## 📚 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── Login.jsx (✅ Connected to backend)
│   │   │   ├── OTPVerification.jsx (✅ Connected to backend)
│   │   │   ├── Client.jsx (Dashboard)
│   │   │   ├── Admin.jsx (Dashboard)
│   │   │   └── Partner.jsx (Dashboard)
│   │   ├── header/
│   │   ├── sidebar/
│   │   └── layout/
│   ├── config/
│   │   └── auth.js (API configuration)
│   ├── utils/
│   │   └── api.js (API client with auth)
│   └── stores/
│       └── (Zustand state management)
└── public/
```

## ✅ What's Working

1. ✅ Phone login with backend API
2. ✅ MSG91 OTP integration
3. ✅ OTP verification with backend
4. ✅ Google OAuth login
5. ✅ JWT token storage
6. ✅ Role-based routing
7. ✅ Protected routes with authentication
8. ✅ Automatic token refresh
9. ✅ Responsive design
10. ✅ Error handling & loading states

## 🎯 Next Steps

1. Test the complete login flow
2. Verify dashboard access for different roles
3. Test company registration flow
4. Add more features as needed

## 💡 Development Tips

- Keep backend running while developing
- Use browser console for debugging
- Check Network tab for API requests
- Use React DevTools for component inspection
- OTP will be shown in console during development

Enjoy building! 🚀


