# Private Limited Registration Flow - Complete Implementation

## Overview
This document describes the complete user flow for Private Limited company registration with payment tracking and registration management.

## User Flow

### 1. First Time User (No Existing Registration)

```
User → Login → Company Categories → Private Limited 
  ↓
Check existing registrations (API call)
  ↓
No registrations found → Show Packages
  ↓
Select Package → Razorpay Payment
  ↓
Payment Success → Multi-Step Form (3 steps)
  ↓
Fill Form → Click Submit
  ↓
API saves to database with payment ID
  ↓
Success Modal (3 seconds)
  ↓
Redirect to Private Limited Dashboard
```

### 2. Returning User (Has Existing Registration)

```
User → Login → Company Categories → Private Limited
  ↓
Check existing registrations (API call)
  ↓
Registrations found → Redirect to Dashboard
  ↓
Dashboard shows:
  - Company Name
  - Submission Date
  - Status
  - Ticket ID
  - Package details
```

## Key Features

### ✅ Payment ID Storage
- Payment ID (`razorpay_payment_id`) is stored in `vakil_search_table_tickets`
- Linked to user's registration
- Used for tracking and verification

### ✅ Duplicate Prevention
- Automatic check on page load
- If user has existing registration → redirect to dashboard
- Packages not shown again

### ✅ Dashboard Display
Shows for each registration:
- **Company Name**: From business_name field
- **Submission Date**: From created_at field  
- **Status**: From status field (pending/approved/completed)
- **Ticket ID**: Unique identifier
- **Directors Count**: Number of directors
- **Authorized Capital**: Company capital details
- **Last Updated**: From updated_at field

### ✅ Form Data Saved
All form data is saved including:
- Step 1: Name options, company type, nature of business
- Step 2: Capital details, address, NOC, documents
- Step 3: Directors information with all personal details
- Payment details: order_id, payment_id
- Package details: name, price

## Components

### Frontend

1. **PrivateLimitedDashboard.jsx**
   - Lists all user registrations
   - Shows status, date, company name
   - "Back to Dashboard" button
   - Empty state for new users

2. **CompanyDetails.jsx**
   - Checks for existing registrations on mount
   - Redirects if registrations exist
   - Shows loading while checking
   - Shows packages if no registrations

3. **PrivateLimitedForm.jsx**
   - Collects 3 steps of data
   - Submits to API
   - Shows success modal
   - Redirects to dashboard after submission

4. **privateLimitedApi.js**
   - `submitPrivateLimitedRegistration()` - Submit form
   - `getMyRegistrations()` - Get user's registrations
   - `getRegistrationByTicketId()` - Get specific registration

### Backend

1. **privateLimited.service.js**
   - Creates ticket with payment ID
   - Saves registration details
   - Saves directors information
   - Retrieval methods

2. **privateLimited.controller.js**
   - POST `/api/v1/private-limited/register`
   - GET `/api/v1/private-limited/registrations`
   - GET `/api/v1/private-limited/registration/:ticketId`

3. **privateLimited.routes.js**
   - Protected routes (require auth)
   - All endpoints documented

## Database Schema

### Tables Used

1. **vakil_search_table_tickets**
   - ticket_id (primary key)
   - user_id
   - razorpay_order_id
   - razorpay_payment_id ✨ NEW
   - status
   - created_at, updated_at

2. **vakil_search_table_registration_details**
   - ticket_id (foreign key)
   - business_name
   - business_name_option2
   - authorized_capital
   - paid_up_capital
   - All company details...

3. **vakil_search_table_registration_directors**
   - ticket_id (foreign key)
   - director_name
   - All director personal details...
   - All documents as base64

## Routes

### Frontend Routes
```
/company/:type                  → CompanyDetails (checks for existing)
/private-limited-dashboard      → PrivateLimitedDashboard  
/private-limited-form           → PrivateLimitedForm
```

### Backend API Routes
```
POST   /api/v1/private-limited/register         → Submit registration
GET    /api/v1/private-limited/registrations    → Get all user registrations
GET    /api/v1/private-limited/registration/:id → Get specific registration
```

## How It Works

### Step-by-Step Process

#### 1. User Visits Private Limited Page
```javascript
// CompanyDetails.jsx
useEffect(() => {
  checkExistingRegistrations();
}, []);

const checkExistingRegistrations = async () => {
  const result = await getMyRegistrations();
  if (result.success && result.data.length > 0) {
    navigate('/private-limited-dashboard'); // Redirect!
  }
};
```

#### 2. No Existing Registrations
- Shows packages
- User selects package
- Makes payment via Razorpay
- Payment success → Shows form

#### 3. Form Submission
```javascript
// PrivateLimitedForm.jsx
const handleSubmit = async () => {
  const result = await submitPrivateLimitedRegistration(formData);
  if (result.success) {
    // Show success modal
    // Redirect to dashboard after 3 seconds
    navigate('/private-limited-dashboard');
  }
};
```

#### 4. Backend Saves Data
```javascript
// Backend creates:
1. Ticket with payment IDs
2. Registration details
3. Director records
// Returns ticket_id and confirmation
```

#### 5. Dashboard Shows Registrations
```javascript
// PrivateLimitedDashboard.jsx
- Fetches user's registrations
- Displays in cards:
  * Company Name
  * Ticket ID
  * Submission Date
  * Status
  * View Details button
```

## Testing Flow

### Test Case 1: New User
1. Login as new user
2. Navigate to Private Limited
3. Should see packages
4. Complete payment
5. Fill 3-step form
6. Submit
7. See success modal
8. Redirected to dashboard
9. See registration with company name and date

### Test Case 2: Returning User
1. Login as user with existing registration
2. Navigate to Private Limited
3. Should NOT see packages
4. Automatically redirected to dashboard
5. See existing registration(s)

### Test Case 3: Payment Tracking
1. Complete registration
2. Check database `vakil_search_table_tickets`
3. Verify `razorpay_payment_id` is saved
4. Verify linked to correct user_id

## Required Database Migration

**IMPORTANT**: Run this first!

```sql
-- File: backend/sql/private_limited_schema_update.sql
-- Execute in Supabase SQL Editor
```

This adds all required columns for:
- Name options
- Capital details
- Director personal info
- Address fields
- Document storage (base64)
- Payment tracking

## Environment Setup

### Frontend
```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
```

### Backend
```env
SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-key
JWT_SECRET=your-secret
BODY_LIMIT=25mb
```

## Success Criteria ✅

- [x] Payment ID stored in database
- [x] User can't see packages again after submission
- [x] Dashboard shows company name
- [x] Dashboard shows submission date
- [x] Dashboard shows status
- [x] Automatic redirect for returning users
- [x] Form data saved to database
- [x] Directors information saved
- [x] Documents stored as base64

## Next Steps

1. **Run SQL migration** in Supabase
2. **Test the complete flow**:
   - New user registration
   - Returning user access
   - Database verification
3. **Admin Panel** (future):
   - View all registrations
   - Update status
   - Download documents

## Support

For issues:
- Check browser console for errors
- Verify API endpoint is correct
- Check database has all required columns
- Ensure JWT token is valid
- Verify payment IDs are being saved



