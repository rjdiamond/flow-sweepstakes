import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets('v4');
    const client = await auth.getClient();
    const response = await sheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId: sheetId,
      range: 'Entries', // or your actual range
    });

    // Remove the header row if present
    const rows = response.data.values || [];
    if (rows.length > 0 && rows[0][0] === 'HolderAddress') {
      rows.shift();
    }
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
