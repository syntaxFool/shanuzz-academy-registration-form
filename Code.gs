/**
 * Google Apps Script for Shanuzz Academy Model Registration Form
 * This script handles form submissions and writes data to the Google Sheet
 * 
 * AUTHENTICATION REQUIREMENTS:
 * - Frontend uses CSV-based authentication from a separate Google Sheet
 * - Authentication CSV must have headers: name, username, pin
 * - Only authenticated users can submit the registration form
 * - User data is included in form submissions for audit purposes
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
 * Validate that form data contains required authentication information
 */
function validateAuthenticationData(formData) {
  const requiredFields = ['user'];
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!formData[field] || formData[field].trim() === '') {
      missingFields.push(field);
    }
  }
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      message: `Missing authentication data: ${missingFields.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Handle form submission from the HTML frontend
 * This function will be called when the HTML form is submitted
 */
function submitForm(formData) {
  try {
    // Validate authentication data first
    const authValidation = validateAuthenticationData(formData);
    if (!authValidation.valid) {
      return {
        success: false,
        message: authValidation.message
      };
    }
    
    // Open the Google Sheet
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`Sheet "${SHEET_NAME}" not found`);
    }
    
    // Generate unique reference ID
    const referenceId = generateUniqueId();
    
    // Get current timestamp
    const timestamp = new Date();
    
    // Get the submitter's Google account email (for audit purposes)
    const submitterEmail = Session.getActiveUser().getEmail();
    
    // Prepare row data matching the EXACT sheet headers from formResponses
    const rowData = [
      referenceId,                        // Reff ID
      timestamp,                          // Time Stamp
      formData.user || '',                // User (authenticated user's name)
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
    
    // Log the submission for debugging
    console.log('Submitting registration for user:', formData.user);
    console.log('Reference ID:', referenceId);
    console.log('Submitter Google Account:', submitterEmail);
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response with reference ID
    return {
      success: true,
      message: 'Registration submitted successfully!',
      timestamp: timestamp,
      referenceId: referenceId,
      submittedBy: formData.user
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
 * Get system information (for debugging/auditing)
 * This function can be used to check system status
 */
function getSystemInfo() {
  try {
    const submitterEmail = Session.getActiveUser().getEmail();
    const timestamp = new Date();
    
    return {
      success: true,
      submitterEmail: submitterEmail,
      timestamp: timestamp,
      message: 'System operational'
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return {
      success: false,
      message: 'Unable to get system information'
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
        case 'getSystemInfo':
          result = getSystemInfo();
          break;
        case 'submit':
          // Handle form submission via GET (JSONP)
          if (e.parameter.data) {
            const formData = JSON.parse(e.parameter.data);
            // Validate that user authentication data is present
            if (!formData.user) {
              result = {
                success: false,
                message: 'Authentication data missing. Please log in again.'
              };
            } else {
              result = submitForm(formData);
            }
          } else {
            result = {
              success: false,
              message: 'No form data provided'
            };
          }
          break;
        case 'testConnection':
          result = {
            success: testConnection(),
            message: testConnection() ? 'Connection successful' : 'Connection failed'
          };
          break;
        case 'getDashboardData':
          result = {
            success: true,
            data: getDashboardData()
          };
          break;
        default:
          result = {
            success: false,
            message: 'Unknown action: ' + e.parameter.action
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
  
  // Default: return HTML based on 'page' parameter
  const page = e.parameter.page || 'form';
  
  if (page === 'dashboard') {
    return HtmlService.createHtmlOutputFromFile('dashboard')
      .setTitle('Shanuzz Academy Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } else {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Shanuzz Academy Registration')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
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
      // Add headers if sheet is empty (EXACT MATCH with formResponses sheet)
      const headers = [
        'Reff ID',
        'Time Stamp',
        'User',
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

/**
 * Get dashboard data for the follow-up dashboard
 * Returns data from the viewDash CSV source
 */
function getDashboardData() {
  try {
    // viewDash CSV URL
    const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHcK1BazSJcfsEu6w02q-ODJ6kGqZyYebGqjNcPnW0brlJQruCtz6YBqk_41p3AqLq9NMa0lSNMcS3/pub?gid=923344444&single=true&output=csv';
    
    // Fetch the CSV data
    const response = UrlFetchApp.fetch(csvUrl);
    const csvText = response.getContentText();
    
    if (!csvText || csvText.trim() === '') {
      return [];
    }
    
    // Parse CSV data
    const lines = csvText.trim().split('\n');
    if (lines.length <= 1) {
      return []; // No data rows, only headers
    }
    
    // Get headers from first line (viewDash structure)
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    
    console.log('viewDash Headers found:', headers);
    
    // Convert data rows to objects
    const formattedData = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = parseCSVLine(line);
      const rowObject = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        
        // Clean up the value
        value = value.trim();
        
        // Format dates properly for "Last Date Of Service Booked"
        if (header === 'Last Date Of Service Booked' && value && value !== '') {
          try {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              value = date.toISOString().split('T')[0]; // YYYY-MM-DD format
            }
          } catch (e) {
            // Keep original value if date parsing fails
          }
        }
        
        rowObject[header] = value;
      });
      
      // Only add rows that have contact information
      if (rowObject['Full Name'] && rowObject['Full Name'].trim() !== '') {
        formattedData.push(rowObject);
      }
    }
    
    console.log('viewDash data retrieved:', formattedData.length, 'records');
    return formattedData;
    
  } catch (error) {
    console.error('Error getting viewDash data:', error);
    throw new Error('Failed to retrieve dashboard data: ' + error.toString());
  }
}

/**
 * Parse a single CSV line, handling quoted fields properly
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
}

/**
 * Export data to CSV file and return download URL
 */
function exportToCSV(csvContent, filename) {
  try {
    const blob = Utilities.newBlob(csvContent, 'text/csv', filename);
    const file = DriveApp.createFile(blob);
    
    // Make file publicly accessible
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return download URL
    return `https://drive.google.com/uc?export=download&id=${file.getId()}`;
    
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export CSV: ' + error.toString());
  }
}

/**
 * Export text data to file and return download URL
 */
function exportToText(textContent, filename) {
  try {
    const blob = Utilities.newBlob(textContent, 'text/plain', filename);
    const file = DriveApp.createFile(blob);
    
    // Make file publicly accessible
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Return download URL
    return `https://drive.google.com/uc?export=download&id=${file.getId()}`;
    
  } catch (error) {
    console.error('Error exporting text:', error);
    throw new Error('Failed to export text: ' + error.toString());
  }
}