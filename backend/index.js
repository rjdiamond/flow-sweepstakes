const { google } = require('googleapis');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'https://your-frontend-domain.com' }));

const sheetId = process.env.GOOGLE_SHEET_ID;

let serviceAccount;
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
} else if (process.env.GOOGLE_SERVICE_ACCOUNT_PATH) {
  serviceAccount = require(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
} else {
  throw new Error('No Google service account credentials provided!');
}

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets('v4');

app.get('/api/sweepstakes', async (req, res) => {
  try {
    const client = await auth.getClient();
    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId: sheetId,
      range: 'Entries', // or your actual range
    });
    // Remove the header row if present
    const rows = response.data.values || [];
    // If the first row is a header, remove it
    if (rows.length > 0 && rows[0][0] === 'HolderAddress') {
      rows.shift();
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)); 
