const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// eBay Credentials
const APP_ID = 'ZixiWang-dummy-PRD-5fc9571dc-e3815a24';
const CLIENT_SECRET = 'PRD-fc9571dc2408-8084-440a-b12d-c1e9';

// ... (rest of the code from your Flask app, translated to JavaScript)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/api/search', async (req, res) => {
  const keyword = req.query.keyword;
  // ... (similar logic to construct eBay API parameters)

  try {
      const response = await axios.get(BASE_EBAY_URL, { params: EBAY_PARAMS });
      const items = response.data.findItemsAdvancedResponse[0].searchResult[0].item;
      // ... (logic to filter items)

      res.json(filtered_items);
  } catch (error) {
      res.status(500).json({ error: "Unable to fetch data" });
  }
});
