# 🚀 How to Host the Dashboard in Google Apps Script

Follow these step-by-step instructions to deploy your dashboard as a Google Apps Script web app.

## 📋 Prerequisites
- Google account
- Access to Google Apps Script (script.google.com)
- Your existing registration form project in Apps Script

## 🔧 Setup Instructions

### Step 1: Open Your Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Open your existing "Shanuzz Academy Registration Form" project
3. You should see your existing `Code.gs` file

### Step 2: Add the Dashboard HTML File
1. Click the **"+"** button next to "Files"
2. Select **"HTML"**
3. Name it: `dashboard`
4. Delete the default content
5. Copy and paste the entire content from `dashboard-apps-script.html`
6. Click **Save** (Ctrl+S)

### Step 3: Update Your Code.gs
Your `Code.gs` file should already be updated with the new dashboard functions. If not:
1. Replace the content of `Code.gs` with the updated version
2. Make sure all the new functions are included:
   - `getDashboardData()`
   - `exportToCSV()`
   - `exportToText()`
3. Click **Save** (Ctrl+S)

### Step 4: Deploy as Web App
1. Click **"Deploy"** button (top right)
2. Select **"New deployment"**
3. Click the gear icon ⚙️ next to "Type"
4. Select **"Web app"**
5. Fill in the deployment settings:
   - **Description**: "Shanuzz Academy Dashboard v1.0"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (or "Anyone with Google account" for security)
6. Click **"Deploy"**
7. **IMPORTANT**: Copy both URLs that appear:
   - **Registration Form**: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
   - **Dashboard**: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?page=dashboard`

### Step 5: Test Your Dashboard
1. Open the dashboard URL in a new browser tab
2. You should see the dashboard loading data from your Google Sheet
3. Test the filters and export functions

## 🔗 URL Structure

After deployment, you'll have two URLs:

### Registration Form (Default)
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Dashboard
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?page=dashboard
```

## 🛡️ Security Settings

### For Public Access (Anyone can view):
- Execute as: "Me"
- Who has access: "Anyone"
- ⚠️ **Note**: Anyone with the URL can access the dashboard

### For Restricted Access (Google accounts only):
- Execute as: "Me" 
- Who has access: "Anyone with Google account"
- 🔒 **Better security**: Only signed-in Google users can access

### For Private Access (Specific people only):
- Execute as: "Me"
- Who has access: "Only myself"
- Add specific email addresses in the sharing settings
- 🔐 **Highest security**: Only authorized users

## 📊 Dashboard Features

Your hosted dashboard will include:

### ✅ Real-time Data
- Automatically loads data from your Google Sheet
- No need to manually refresh (auto-updates every 5 minutes)

### ✅ Smart Filtering
- Filter by service type, booking status, location, priority
- Instant results as you change filters

### ✅ Priority System
- **High Priority**: Overdue appointments, unconfirmed services due soon
- **Medium Priority**: Services due within 2 weeks
- **Low Priority**: Future confirmed appointments

### ✅ Action Buttons
- **Call**: Opens phone dialer on mobile devices
- **Reschedule**: Quick rescheduling interface
- **Export**: Download filtered data as CSV or call lists

### ✅ Statistics Cards
- Urgent follow-ups count
- Pending bookings count
- Confirmed services count
- Total registrations

## 🔄 Updating the Dashboard

When you need to make changes:

1. Edit the files in Apps Script
2. Click **Save**
3. Go to **Deploy** → **Manage deployments**
4. Click **Edit** (pencil icon) on your deployment
5. Change version to **"New version"**
6. Click **"Deploy"**
7. The URLs remain the same, but content is updated

## 📱 Mobile Friendly

The dashboard is fully responsive and works great on:
- 💻 Desktop computers
- 📱 Mobile phones
- 📟 Tablets

The "Call" buttons will automatically open the phone dialer on mobile devices!

## 🆘 Troubleshooting

### Dashboard doesn't load:
1. Check if the Google Sheet ID in `Code.gs` is correct
2. Verify the sheet name is `formResponses`
3. Make sure the deployment is set to "Anyone" access

### No data appears:
1. Check if your Google Sheet has data
2. Verify the headers match exactly
3. Look at the browser console for error messages (F12 → Console)

### Export doesn't work:
1. Make sure Google Drive API is enabled
2. Check if the script has permission to create files
3. Verify deployment permissions are set correctly

## 🎉 You're Done!

Your dashboard is now live and accessible from anywhere! Share the dashboard URL with your team members who need to track follow-ups.

**Registration Form URL**: Use this for new registrations
**Dashboard URL**: Use this for tracking and follow-ups

Both URLs work independently and access the same Google Sheet data in real-time!