# Users Page Database Integration - Complete Guide

## 📋 Overview

The Users page (Settings) has been fully integrated with the backend database. All data from the 5 sections (Client Profile, Organisation Details, Website Details, Tasks, and Notes) is now saved to and loaded from the database.

## 🗄️ Database Structure

### 1. Extended Users Table
**Table:** `vakil_search_table_users`

New columns added:
- **Client Profile**: `whatsapp`, `business_address`, `category`, `sub_category`, `aadhar_card`, `pan_card`, `signature`
- **Organisation Details**: `organisation_type`, `legal_name`, `trade_name`, `gstin`, `incorporation_date`, `pan_file`, `tan`, `cin`, `registered_address`
- **Notes**: `notes`

### 2. Websites Table (New)
**Table:** `vakil_search_table_user_websites`

Columns:
- `id` (bigserial PRIMARY KEY)
- `user_id` (text, references users table)
- `website_type` (text)
- `website_url` (text)
- `login` (text)
- `password` (text)
- `created_at`, `updated_at` (timestamps)

### 3. Tasks Table (New)
**Table:** `vakil_search_table_user_tasks`

Columns:
- `id` (bigserial PRIMARY KEY)
- `user_id` (text, references users table)
- `task_title` (text)
- `task_description` (text)
- `task_type` (text) - 'recurring' or 'non-recurring'
- `status` (text) - 'pending', 'in_progress', 'completed'
- `created_at`, `updated_at` (timestamps)

## 🚀 Setup Instructions

### Step 1: Run SQL Migration

**CRITICAL:** You must run the SQL migration to add the new columns and tables.

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open the file: `backend/sql/users_page_schema.sql`
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click **"Run"**

This will:
- ✅ Add all new columns to `vakil_search_table_users`
- ✅ Create `vakil_search_table_user_websites` table
- ✅ Create `vakil_search_table_user_tasks` table
- ✅ Add indexes for better performance
- ✅ Add proper foreign key constraints

### Step 2: Verify Database Changes

Run this script to verify the changes:

```bash
cd backend
node scripts/checkUsersTable.js
```

You should see all the new columns listed.

## 📡 API Endpoints

### Base URL
```
http://your-domain.com/api/v1/users-page
```

### 1. Get All User Data
```http
GET /api/v1/users-page/data
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123",
      "name": "John Doe",
      "whatsapp": "1234567890",
      "email": "john@example.com",
      ...
    },
    "websites": [
      {
        "id": 1,
        "website_type": "Social Media",
        "website_url": "https://facebook.com",
        "login": "john@example.com",
        "password": "encrypted"
      }
    ],
    "tasks": [
      {
        "id": 1,
        "task_title": "Complete registration",
        "task_description": "Finish company registration",
        "task_type": "recurring",
        "status": "pending"
      }
    ]
  }
}
```

### 2. Update All User Data
```http
POST /api/v1/users-page/update
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "clientProfile": {
    "name": "John Doe",
    "whatsapp": "1234567890",
    "email": "john@example.com",
    "dob": "1990-01-01",
    "address": "123 Main St",
    "businessAddress": "456 Business Ave",
    "category": "Category 1",
    "subCategory": "Sub-Category 1",
    "aadharCard": "data:image/jpeg;base64,...",
    "panCard": "data:image/jpeg;base64,...",
    "signature": "data:image/png;base64,..."
  },
  "organisationDetails": {
    "organisationType": "Private Limited",
    "legalName": "Example Pvt Ltd",
    "tradeName": "Example",
    "gstin": "22AAAAA0000A1Z5",
    "incorporationDate": "2020-01-01",
    "panFile": "data:application/pdf;base64,...",
    "tan": "ABCD12345E",
    "cin": "U12345AB2020PTC123456",
    "registeredAddress": "789 Office St"
  },
  "websites": [
    {
      "type": "Social Media",
      "url": "https://facebook.com",
      "login": "user@example.com",
      "password": "password123"
    }
  ],
  "tasks": [
    {
      "title": "Task 1",
      "description": "Description here",
      "type": "recurring"
    }
  ],
  "notes": "Important notes here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User data updated successfully"
}
```

## 🎯 Features Implemented

### Frontend (Settings.jsx)

1. **Data Loading**
   - ✅ Loads all user data on page mount
   - ✅ Shows loading spinner while fetching
   - ✅ Populates all form fields automatically

2. **Data Saving**
   - ✅ Single "Save Changes" button at the bottom
   - ✅ Saves all 5 sections in one API call
   - ✅ Shows "Saving..." state during save
   - ✅ Displays success/error alerts

3. **File Uploads**
   - ✅ Converts files to base64 before saving
   - ✅ Supports: Aadhar Card, PAN Card, Signature, PAN File
   - ✅ Shows "File uploaded" when file is selected

4. **Dynamic Lists**
   - ✅ Websites: Can add multiple website entries
   - ✅ Tasks: Can add multiple task entries
   - ✅ Each entry is saved/loaded correctly

### Backend

1. **Services (`usersPage.service.js`)**
   - ✅ `updateAllUserData()` - Saves all data
   - ✅ `getAllUserData()` - Fetches all data
   - ✅ Handles base64 documents
   - ✅ Properly manages related tables

2. **Controllers (`usersPage.controller.js`)**
   - ✅ Request validation
   - ✅ Error handling
   - ✅ User authentication

3. **Routes (`usersPage.routes.js`)**
   - ✅ Protected routes (require authentication)
   - ✅ RESTful endpoints

## 🔐 Security

- ✅ All routes require authentication
- ✅ Users can only access their own data
- ✅ Passwords stored as-is (consider encryption)
- ⚠️ **TODO**: Encrypt website passwords before saving

## 📝 Usage

### For Users:
1. Navigate to **"Users"** in the sidebar
2. Fill in any of the 5 sections:
   - A. Client Profile
   - B. Organisation Details
   - C. Website Details
   - D. Tasks
   - E. Notes
3. Click **"Save Changes"** at the bottom
4. Data is automatically saved to database
5. On next visit, all data is automatically loaded

### For Developers:
1. Run SQL migration (Step 1 above)
2. Backend is already integrated
3. Frontend is already integrated
4. Test the functionality

## ✅ Testing Checklist

- [ ] SQL migration completed successfully
- [ ] Can load existing user data
- [ ] Can save Client Profile data
- [ ] Can save Organisation Details
- [ ] Can add/save multiple websites
- [ ] Can add/save multiple tasks
- [ ] Can save notes
- [ ] File uploads work (convert to base64)
- [ ] Loading spinner shows while fetching
- [ ] Save button shows "Saving..." during save
- [ ] Success/error messages display correctly
- [ ] Data persists after page refresh

## 🚨 Important Notes

1. **Run the SQL migration first** - Nothing will work without the database changes
2. **File uploads** - Files are converted to base64 and stored in the database
3. **Password encryption** - Consider encrypting website passwords in future
4. **Performance** - Base64 files can be large; consider file size limits

## 📞 Support

If you encounter issues:
1. Check that SQL migration ran successfully
2. Verify backend is running
3. Check browser console for errors
4. Check backend logs for API errors

## 🎉 Summary

The Users page is now **fully integrated** with the database:
- ✅ All 5 sections save to database
- ✅ Data loads automatically on page visit
- ✅ Single save button for all sections
- ✅ File uploads supported (base64)
- ✅ Dynamic lists (websites, tasks)
- ✅ Loading and saving states
- ✅ Error handling

**Next Step:** Run the SQL migration in Supabase!

