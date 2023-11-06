const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

// eBay credentials
const EBAY_API_ENDPOINT = 'https://svcs.ebay.com/services/search/FindingService/v1';
const EBAY_API_KEY = 'ZixiWang-dummy-PRD-5fc9571dc-e3815a24';

app.use(cors()); // To allow cross-origin requests
app.use(express.json());

app.get('/search', (req, res) => {
  const params = req.query;

  const ebayURL = new URL(EBAY_API_ENDPOINT);
  ebayURL.searchParams.set('OPERATION-NAME', 'findItemsAdvanced');
  ebayURL.searchParams.set('SERVICE-VERSION', '1.0.0');
  ebayURL.searchParams.set('SECURITY-APPNAME', EBAY_API_KEY);
  ebayURL.searchParams.set('RESPONSE-DATA-FORMAT', 'JSON');
  ebayURL.searchParams.set('REST-PAYLOAD', '');
  ebayURL.searchParams.set('paginationInput.entriesPerPage', '50');
  ebayURL.searchParams.set('keywords', params.keyword);
  ebayURL.searchParams.set('buyerPostalCode', params.zipcode);
  // Add more parameters based on user's form input ...

  axios.get(ebayURL.href)
    .then(response => {
        const data = response.data.findItemsAdvancedResponse[0];
        const searchResultItems = data.searchResult[0].item || [];

        // Extracting the required values from the response
        const extractedResults = searchResultItems.map((item, index) => {
            return {
                index: index + 1,
                image: item.galleryURL && item.galleryURL[0],
                title: item.title && item.title[0],
                price: item.sellingStatus && item.sellingStatus[0].currentPrice && item.sellingStatus[0].currentPrice[0].__value__,
                shipping: (item.shippingInfo && item.shippingInfo[0].shippingServiceCost && parseFloat(item.shippingInfo[0].shippingServiceCost[0].__value__) === 0.0) ? "Free Shipping" : 
                          (item.shippingInfo && item.shippingInfo[0].shippingServiceCost ? `$${item.shippingInfo[0].shippingServiceCost[0].__value__}` : "N/A"),
                zip: item.postalCode && item.postalCode[0]
            };
        });

        console.log(extractedResults); 
        res.json(extractedResults);
    })
    .catch(error => {
        res.status(500).json({ message: 'Error making request to eBay', error: error.message });
    });
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
