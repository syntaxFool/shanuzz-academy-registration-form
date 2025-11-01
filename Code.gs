/**
 * Google Apps Script for Shanuzz Academy Model Registration Form
 * This script handles form submissions and writes data to the Google Sheet
 */

// Configuration - Update these with your actual sheet details
const SHEET_ID = '1WRWKfcid2tmm2YjtkPPbTJflQIM4otQ-AaKFDTKPyxM'; // Your Google Sheet ID
const SHEET_NAME = 'formResponses'; // The tab name in your sheet

/**
 * Generate a unique reference ID in format MRF-DDMMYY-AX00001
 */
function generateUniqueId() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const now = new Date();
    
    // Format date as DDMMYY
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const dateStr = day + month + year;
    
    // Get today's date string for filtering
    const todayStr = now.toDateString();
    
    // Count existing entries for today
    let todayCount = 0;
    if (sheet.getLastRow() > 1) {
      const data = sheet.getDataRange().getValues();
      
      // Skip header row and count entries from today
      for (let i = 1; i < data.length; i++) {
        const rowDate = data[i][1]; // Time Stamp column (index 1, after Reff ID)
        if (rowDate && rowDate instanceof Date && rowDate.toDateString() === todayStr) {
          todayCount++;
        }
      }
    }
    
    // Generate next sequential number
    const sequenceNum = String(todayCount + 1).padStart(5, '0');
    
    // Format: MRF-DDMMYY-AX00001
    const uniqueId = `MRF-${dateStr}-AX${sequenceNum}`;
    
    console.log('Generated unique ID:', uniqueId);
    return uniqueId;
    
  } catch (error) {
    console.error('Error generating unique ID:', error);
    // Fallback ID if generation fails
    const fallbackNum = Date.now().toString().slice(-5);
    return `MRF-ERROR-${fallbackNum}`;
  }
}

/**
 * Handle form submission from the HTML frontend
 * This function will be called when the HTML form is submitted
 */
function submitForm(formData) {
  try {
    // Open the Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }
    
    // Generate unique reference ID
    const referenceId = generateUniqueId();
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Get the email of the current user (automatically from Google Account)
    const userEmail = Session.getActiveUser().getEmail();
    
    // Prepare row data matching the NEW sheet headers (with Reff ID first)
    const rowData = [
      referenceId,                        // Reff ID (NEW FIRST COLUMN)
      timestamp,                          // Time Stamp
      userEmail,                          // Email address (auto-captured)
      formData.privacyPolicy || '',       // Privacy Policy
      formData.contactNumber || '',       // Contact Number
      formData.dateOfService || '',       // Date Of Service Booked
      formData.fullName || '',            // Full Name
      formData.location || '',            // Location - State
      formData.howDidYouHear || '',       // How did you hear about us?
      formData.serviceBooked || '',       // Service Booked
      formData.bookingConfirmed || '',    // Booking Confirmed?
      formData.batchNo || '',             // Batch No.
      formData.studentName || '',         // Student Name
      formData.trainerName || ''          // Trainer Name
    ];
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response with reference ID
    return {
      success: true,
      message: 'Registration submitted successfully!',
      timestamp: timestamp,
      referenceId: referenceId
    };
    
  } catch (error) {
    console.error('Error submitting form:', error);
    return {
      success: false,
      message: 'Error submitting form: ' + error.toString()
    };
  }
}

/**
 * Get the current user's email address
 * This function is called by the frontend to auto-fill the email field
 */
function getUserEmail() {
  try {
    const userEmail = Session.getActiveUser().getEmail();
    return {
      success: true,
      email: userEmail
    };
  } catch (error) {
    console.error('Error getting user email:', error);
    return {
      success: false,
      email: '',
      message: 'Unable to get user email'
    };
  }
}

/**
 * Get all form responses from the sheet
 * This can be used to display existing registrations
 */
function getFormResponses() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }
    
    // Get all data from the sheet
    const data = sheet.getDataRange().getValues();
    
    // Remove header row and return data
    return data.slice(1);
    
  } catch (error) {
    console.error('Error getting form responses:', error);
    return [];
  }
}

/**
 * Web app entry point - handles GET and POST requests
 */
function doGet(e) {
  // Handle API requests
  if (e.parameter.action) {
    try {
      let result;
      switch (e.parameter.action) {
        case 'getUserEmail':
          result = getUserEmail();
          break;
        case 'submit':
          // Handle form submission via GET (JSONP)
          if (e.parameter.data) {
            const formData = JSON.parse(e.parameter.data);
            result = submitForm(formData);
          } else {
            result = {
              success: false,
              message: 'No form data provided'
            };
          }
          break;
        default:
          result = {
            success: false,
            message: 'Unknown action'
          };
      }
      
      // Handle JSONP callback for CORS
      const callback = e.parameter.callback;
      const jsonString = JSON.stringify(result);
      
      if (callback) {
        // JSONP response
        return ContentService
          .createTextOutput(callback + '(' + jsonString + ');')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        // Regular JSON response with CORS headers
        return ContentService
          .createTextOutput(jsonString)
          .setMimeType(ContentService.MimeType.JSON);
      }
      
    } catch (error) {
      const errorResult = {
        success: false,
        message: 'Error: ' + error.toString()
      };
      
      const callback = e.parameter.callback;
      const jsonString = JSON.stringify(errorResult);
      
      if (callback) {
        return ContentService
          .createTextOutput(callback + '(' + jsonString + ');')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        return ContentService
          .createTextOutput(jsonString)
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  
  // Default: return HTML form
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Shanuzz Academy Registration')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  try {
    const formData = JSON.parse(e.postData.contents);
    const result = submitForm(formData);
    
    // Add CORS headers for POST requests
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error processing request: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Test function to verify the script is working
 * Run this function to test the connection to your sheet
 */
function testConnection() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    console.log('Successfully connected to sheet:', sheet.getName());
    console.log('Sheet has', sheet.getLastRow(), 'rows of data');
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

/**
 * Setup function to initialize the sheet with headers if needed
 */
function setupSheet() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (sheet.getLastRow() === 0) {
      // Add headers if sheet is empty (NEW HEADER ORDER with Reff ID first)
      const headers = [
        'Reff ID',
        'Time Stamp',
        'Email address',
        'Privacy Policy',
        'Contact Number',
        'Date Of Service Booked',
        'Full Name',
        'Location - State',
        'How did you hear about us?',
        'Service Booked',
        'Booking Confirmed?',
        'Batch No.',
        'Student Name',
        'Trainer Name'
      ];
      
      sheet.appendRow(headers);
      console.log('Headers added to sheet');
    }
    
    return true;
  } catch (error) {
    console.error('Setup failed:', error);
    return false;
  }
}