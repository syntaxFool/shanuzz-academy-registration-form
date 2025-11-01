# Shanuzz Academy Model Registration Form

This project contains a Google Apps Script (GAS) backend and a standalone HTML frontend for the Shanuzz Academy Model Registration Form.

## Files

1. **Code.gs** - Google Apps Script file
2. **registration-form.html** - Standalone HTML form

## Setup Instructions

### 1. Google Apps Script Setup

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Replace the default code with the content from `Code.gs`
4. Update the configuration variables:
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // Replace with your Google Sheet ID
   const SHEET_NAME = 'formResponses'; // The tab name in your sheet
   ```

### 2. Google Sheet Setup

1. Open your Google Sheet: "Shanuzz Academy Model Registration Form (Responses)"
2. Make sure the tab is named exactly: `formResponses`
3. Ensure the headers match exactly:
   ```
   Time Stamp | Email address | Privacy Policy | Contact Number | Date Of Service Booked | Full Name | Location - State | How did you hear about us? | Service Booked | Booking Confirmed? | Batch No. | Student Name | Trainer Name
   ```

### 3. Deploy the Google Apps Script

1. In Google Apps Script, click "Deploy" > "New Deployment"
2. Choose type: "Web app"
3. Set execute as: "Me"
4. Set access to: "Anyone"
5. Click "Deploy"
6. Copy the web app URL

### 4. HTML Form Setup

1. Open `registration-form.html`
2. Find this line and replace with your web app URL:
   ```javascript
   const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Save the file

## Features

### Google Apps Script (Code.gs)
- ✅ Handles form submissions
- ✅ Writes data to Google Sheet with proper headers
- ✅ Automatic timestamp generation
- ✅ Error handling and validation
- ✅ Test functions for debugging
- ✅ Setup function for initializing headers

### HTML Form (registration-form.html)
- ✅ Beautiful, responsive design
- ✅ All form fields matching sheet headers
- ✅ Client-side validation
- ✅ Loading states and user feedback
- ✅ Local storage for form persistence
- ✅ Indian states dropdown
- ✅ Service options dropdown
- ✅ Mobile-friendly responsive design

## Form Fields

The form includes all the required fields from your sheet:

1. **Time Stamp** - Auto-generated
2. **Email address** - Required field
3. **Privacy Policy** - Checkbox (required)
4. **Contact Number** - Required field
5. **Date Of Service Booked** - Date picker
6. **Full Name** - Required field
7. **Location - State** - Dropdown with Indian states
8. **How did you hear about us?** - Dropdown options
9. **Service Booked** - Dropdown with service options
10. **Booking Confirmed?** - Yes/No/Pending dropdown
11. **Batch No.** - Text field
12. **Student Name** - Auto-filled from Full Name
13. **Trainer Name** - Text field

## Usage

1. Set up the Google Apps Script and deploy it as a web app
2. Update the HTML file with your script URL
3. Open the HTML file in any web browser
4. Fill out the form and submit
5. Data will be automatically added to your Google Sheet

## Testing

Run the `testConnection()` function in Google Apps Script to verify the sheet connection is working properly.

## Security Notes

- The web app is set to "Anyone" access for public form submission
- Consider adding additional validation or rate limiting if needed
- All form data is validated both client-side and server-side