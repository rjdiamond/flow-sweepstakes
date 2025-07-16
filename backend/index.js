const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({ origin: 'https://your-frontend-domain.com' }));

const sheets = google.sheets('v4');
const sheetId = process.env.GOOGLE_SHEET_ID;
const serviceAccount = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : require(process.env.GOOGLE_SERVICE_ACCOUNT_PATH);

app.get('/api/sweepstakes', async (req, res) => {
  try {
    const client = await auth.getClient();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1DqTcuFMnXvRIVHlwTFyT71gmps62n8jCF7GhHExefMc';
    const range = 'A2:C100'; // Adjust as needed
    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range,
    });
    res.json(response.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`)); 