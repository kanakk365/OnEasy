# Frontend Environment Variables Setup

## ⚠️ IMPORTANT: Vite Environment Variables

This project uses **Vite**, not Create React App. 

### Key Differences:
- ❌ **DON'T USE**: `process.env.REACT_APP_*`
- ✅ **USE**: `import.meta.env.VITE_*`

All environment variables in Vite **MUST** be prefixed with `VITE_`

## Create .env File

Create a `.env` file in the `frontend` directory:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3001/api/v1

# Google OAuth Client ID (Optional)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Using Environment Variables in Code

```javascript
// ✅ CORRECT (Vite)
const apiUrl = import.meta.env.VITE_API_BASE_URL

// ❌ WRONG (This is for Create React App)
const apiUrl = process.env.REACT_APP_API_BASE_URL
```

## Restart Dev Server

After creating/modifying `.env`, restart the dev server:

```bash
npm run dev
```

## Default Values

If `.env` is not created, these defaults are used:
- API URL: `http://localhost:3001/api/v1`
- Google Client ID: `YOUR_GOOGLE_CLIENT_ID`


