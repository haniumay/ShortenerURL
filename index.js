require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

// body parsing middleware for the POST form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// in-memory storage
const urls = [];

// create a short url
app.post('/api/shorturl', function (req, res) {
  const original = req.body.url;

  let parsed;
  try {
    parsed = new URL(original);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsed.hostname, function (err) {
    if (err) return res.json({ error: 'invalid url' });

    let index = urls.indexOf(original);
    if (index === -1) {
      urls.push(original);
      index = urls.length - 1;
    }

    res.json({ original_url: original, short_url: index + 1 });
  });
});

// redirect to the original url
app.get('/api/shorturl/:short_url', function (req, res) {
  const id = parseInt(req.params.short_url, 10);
  const target = urls[id - 1];

  if (!target) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(target);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
