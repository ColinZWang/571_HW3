const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

// eBay Credentials
const APP_ID = 'ZixiWang-dummy-PRD-5fc9571dc-e3815a24';
const CLIENT_SECRET = 'PRD-fc9571dc2408-8084-440a-b12d-c1e9'; // Store securely in production
const BASE_EBAY_URL = 'https://svcs.ebay.com/services/search/FindingService/v1';

app.use(bodyParser.json());

app.get('/search', async (req, res) => {
    const { keyword, zipcode } = req.query;
    
    // Construct eBay endpoint with required parameters
    const eBayEndpoint = `${BASE_EBAY_URL}?OPERATION-NAME=findItemsByKeywords&SERVICE-VERSION=1.0.0&SECURITY-APPNAME=${APP_ID}&RESPONSE-DATA-FORMAT=JSON&REST-PAYLOAD&keywords=${keyword}&buyerPostalCode=${zipcode}`;

    try {
        const response = await axios.get(eBayEndpoint);
        console.log('Response from eBay:', response.data);
        if (response.data && response.data.findItemsByKeywordsResponse) {
            res.json(response.data.findItemsByKeywordsResponse);
        } else {
            res.status(500).json({ message: 'Error fetching data from eBay' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data from eBay', error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
