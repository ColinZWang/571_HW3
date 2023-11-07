const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

// eBay credentials
const EBAY_API_ENDPOINT = 'https://svcs.ebay.com/services/search/FindingService/v1';
const EBAY_API_KEY = 'ZixiWang-dummy-PRD-5fc9571dc-e3815a24';

const OAuthToken = require('./ebay_oauth_token.js');

// Initialize with your client id and client secret
CLIENT_ID = 'ZixiWang-dummy-PRD-5fc9571dc-e3815a24'
CLIENT_SECRET = 'PRD-fc9571dc2408-8084-440a-b12d-c1e9'
const oauth = new OAuthToken(CLIENT_ID, CLIENT_SECRET);

// Fetch and store the token in memory
let eBayToken = oauth.getApplicationToken();


const EBAY_CATEGORY_MAP = {
  "Art": "550",
  "Baby": "2984",
  "Books": "267",
  "Clothing, Shoes & Accessories": "11450",
  "Computers/Tablets & Networking": "58058",
  "Health & Beauty": "26395",
  "Music": "11233",
  "Video Games & Consoles": "1249"
};

const mongoose = require('mongoose');

const password = '770sGrandAve7058';
const MONGODB_URI = `mongodb+srv://ColinZWang:${password}@colinzwang-cluster.6civtdf.mongodb.net/?retryWrites=true&w=majority`;

console.log("Attempting to connect to MongoDB...");

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: {
    version: '1',
    strict: true,
    deprecationErrors: true
  }
});

mongoose.connection.once('open', function() {
  console.log("Successfully connected to MongoDB.");
}).on('error', function(error) {
  console.log("Connection error:", error);
});

const wishListItemSchema = new mongoose.Schema({
  image: String,
  title: String,
  price: String,
  shipping: String,
  zip: String
});

const WishListItem = mongoose.model('WishListItem', wishListItemSchema);


app.use(cors()); // To allow cross-origin requests
app.use(express.json());

//...[other imports]

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

  if (params.category) {
    const ebayCategory = EBAY_CATEGORY_MAP[params.category];
    if (ebayCategory) {
        ebayURL.searchParams.set('categoryId', ebayCategory);
    }
  }


  let filterIndex = 0;
  if (params.distance) {
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).name`, 'MaxDistance');
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).value`, params.distance);
    filterIndex++;
  }
  if (params.freeshipping) {
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).name`, 'FreeShippingOnly');
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).value`, 'true');
    filterIndex++;
  }
  if (params.localpickup) {
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).name`, 'LocalPickupOnly');
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).value`, 'true');
    filterIndex++;
  }
  
  ebayURL.searchParams.set(`itemFilter(${filterIndex}).name`, 'HideDuplicateItems');
  ebayURL.searchParams.set(`itemFilter(${filterIndex}).value`, 'true');
  filterIndex++;

  let conditionValueIndex = 0;
  if (params.newCondition|| params.usedCondition || params.unspecifiedCondition){
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).name`, 'Condition');
  }
  if (params.newCondition) {
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).value(${conditionValueIndex++})`, 'New');
  }
  if (params.usedCondition) {
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).value(${conditionValueIndex++})`, 'Used');
  }
  if (params.unspecifiedCondition) {
    ebayURL.searchParams.set(`itemFilter(${filterIndex}).value(${conditionValueIndex++})`, 'Unspecified');
  }

  ebayURL.searchParams.set('outputSelector(0)', 'SellerInfo');
  ebayURL.searchParams.set('outputSelector(1)', 'StoreInfo');


  console.log('Sending Ebay URL: ',ebayURL)

  axios.get(ebayURL.href)
    .then(response => {
        const data = response.data.findItemsAdvancedResponse[0];
        const searchResultItems = data.searchResult[0].item || [];

        // Extracting the required values from the response
        const extractedResults = searchResultItems.map((item, index) => {
            return {
                index: index + 1,
                itemId: item.itemId && item.itemId[0],
                image: item.galleryURL && item.galleryURL[0],
                title: item.title && item.title[0],
                price: item.sellingStatus && item.sellingStatus[0].currentPrice && item.sellingStatus[0].currentPrice[0].__value__,
                shipping: (item.shippingInfo && item.shippingInfo[0].shippingServiceCost && parseFloat(item.shippingInfo[0].shippingServiceCost[0].__value__) === 0.0) ? "Free Shipping" : 
                          (item.shippingInfo && item.shippingInfo[0].shippingServiceCost ? `$${item.shippingInfo[0].shippingServiceCost[0].__value__}` : "N/A"),
                zip: item.postalCode && item.postalCode[0]
            };
        });

        // console.log(extractedResults); 
        res.json(extractedResults);
    })
    .catch(error => {
        res.status(500).json({ message: 'Error making request to eBay', error: error.message });
    });
});

app.post('/wishlist', async (req, res) => {
  console.log("POST request received for /wishlist with data:", req.body);

  const item = new WishListItem(req.body);
  try {
    const savedItem = await item.save();
    console.log("Item saved successfully:", savedItem);
    res.status(200).send(savedItem);
  } catch (err) {
    console.error("Error saving wishlist item:", err);
    res.status(500).send(err);
  }
});

app.get('/wishlist', async (req, res) => {
  console.log("GET request received for /wishlist");

  try {
    const items = await WishListItem.find({});
    console.log("Fetched wishlist items:", items);
    res.status(200).send(items);
  } catch (err) {
    console.error("Error fetching wishlist items:", err);
    res.status(500).send(err);
  }
});

app.delete('/wishlist/:id', async (req, res) => {
  console.log(`DELETE request received for /wishlist/${req.params.id}`);

  try {
    await WishListItem.findByIdAndDelete(req.params.id);
    console.log(`Item with ID ${req.params.id} removed successfully.`);
    res.status(200).send({ message: 'Item removed.' });
  } catch (err) {
    console.error("Error deleting wishlist item:", err);
    res.status(500).send(err);
  }
});

app.get('/product/:itemId', async (req, res) => {
  const itemId = req.params.itemId;
  console.log("Backend received Item ID:", itemId);

  // Define constants
  const EBAY_API_ENDPOINT = 'https://open.api.ebay.com/shopping';

  // Construct the URL with search parameters
  const ebayURL = new URL(EBAY_API_ENDPOINT);
  ebayURL.searchParams.set('callname', 'GetSingleItem');
  ebayURL.searchParams.set('responseencoding', 'JSON');
  ebayURL.searchParams.set('appid', EBAY_API_KEY);
  ebayURL.searchParams.set('siteid', '0');
  ebayURL.searchParams.set('version', '967');
  ebayURL.searchParams.set('ItemID', itemId);
  ebayURL.searchParams.set('IncludeSelector', 'Description,Details,Item Specifics');

  console.log('Constructed eBay API URL:', ebayURL.toString());

  const headers = {
    'X-EBAY-API-IAF-TOKEN': await oauth.getApplicationToken()
  };
  
  // Use the constructed URL and headers for your API call
  try {
    const response = await axios.get(ebayURL.toString(), { headers: headers });
    console.log('Received response from eBay API:', response.data);

    // Extract required details from the eBay API response
    const item = response.data.Item;  // Assuming the response object has an 'Item' attribute
    const productDetails = {
        ProductImages: item.PictureURL,
        Price: item.CurrentPrice?.Value,
        Location: item.Location,
        ItemSpecifics: item.ItemSpecifics?.NameValueList.map(spec => ({ name: spec.Name, value: spec.Value })),
        ReturnPolicy: {
            ReturnsAccepted: item.ReturnPolicy?.ReturnsAccepted,
            ReturnsWithin: item.ReturnPolicy?.ReturnsWithin
        },
        handlingTime: item.HandlingTime,
        shippingServiceCost: item.ShippingCostSummary?.ShippingServiceCost,
        shipToLocations: item.ShipToLocations,
        expeditedShipping: item.ShippingCostSummary?.ExpeditedShipping,
        oneDayShippingAvailable: item.ShippingCostSummary?.OneDayShippingAvailable,
        FeedbackScore: item.Seller.FeedbackScore,
        PositiveFeedbackPercent: item.Seller.PositiveFeedbackPercent,
        FeedbackRatingStar: item.Seller.FeedbackRatingStar,
        TopRatedSeller: item.Seller.TopRatedSeller,
        StoreName: item.Storefront.StoreName,
        StoreURL: item.Storefront.StoreURL

    };

    console.log(productDetails);
    res.json(productDetails);
} catch (error) {
    console.error('Error fetching data from eBay API:', error);
    res.status(500).send('Internal server error');
}


});



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});