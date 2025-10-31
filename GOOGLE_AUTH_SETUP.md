# Google Authentication Setup Guide

## Prerequisites

1. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API or Google Identity API
   - Create OAuth 2.0 credentials

## Configuration Steps

### 1. Create Environment File

Create a `.env` file in your project root with:

```env
# Google OAuth Configuration
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here

# API Configuration
REACT_APP_API_BASE_URL=http://localhost:3001/api
```

### 2. Get Google Client ID

1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Navigate to "Credentials" in the left sidebar
3. Click "Create Credentials" → "OAuth 2.0 Client IDs"
4. Choose "Web application"
5. Add authorized origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Copy the Client ID and add it to your `.env` file

### 3. Update Auth Configuration

Replace `YOUR_GOOGLE_CLIENT_ID` in `src/config/auth.js` with your actual Google Client ID.

### 4. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login page
3. Click the "Google" button to test the authentication

## Features Implemented

✅ **Phone Number Login**
- Country code selection (+91, +1, +44)
- Form validation
- Loading states
- Error handling

✅ **Google OAuth Login**
- Google Identity Services integration
- JWT token handling
- User data storage
- Automatic redirection

✅ **User Experience**
- Loading spinners
- Error messages
- Disabled states during loading
- Responsive design

## Next Steps

1. Set up your backend API to handle authentication
2. Implement proper user role management
3. Add logout functionality
4. Add session management
5. Implement proper error handling for network issues

## Troubleshooting

- **Google login not working**: Check if your Client ID is correct and authorized origins are set
- **CORS issues**: Make sure your domain is added to authorized origins
- **Token errors**: Verify that the Google Identity Services script is loaded properly


