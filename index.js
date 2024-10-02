require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Parse application/json
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// URL Shortening Logic
const validUrl = require('valid-url');
const urlDatabase = {};
let urlCounter = 1;

app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // Check if submitted URL is valid
  if (!validUrl.isWebUri(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Check if URL already exists in the database
  for (let key in urlDatabase) {
    if (urlDatabase[key].original_url === originalUrl) {
      return res.json({
        original_url: originalUrl,
        short_url: key,
      });
    }
  }

  // If the URL is new, add it to the database and generate a short URL
  const shortUrl = urlCounter++;
  urlDatabase[shortUrl] = { original_url: originalUrl };

  res.json({
    original_url: originalUrl,
    short_url: shortUrl,
  });

  // Redirect route
  app.get('/api/shorturl/:shortUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;
    const urlData = urlDatabase[shortUrl];

    if (urlData) {
      return res.redirect(urlData.original_url);
    } else {
      return res.json({ error: 'invalid url' });
    }
  });
});