require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Necesario para manejar el cuerpo de las peticiones POST
const dns = require('dns');
const urlParser = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false })); // Middleware para analizar el cuerpo de las peticiones POST
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Para almacenar las URLs y sus short URLs
const urls = [];
let nextId = 1;

// Endpoint para acortar una URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Expresión regular para validar el formato de la URL
  const urlRegex = /^(https?):\/\/([^/:]+)(:\d*)?(\/[^\s]*)?$/;

  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Validar la URL usando el módulo dns
  const urlObj = urlParser.parse(originalUrl);
  dns.lookup(urlObj.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    // Almacenar la URL y asignar un short_url
    const shortUrl = nextId++;
    urls.push({ original_url: originalUrl, short_url: shortUrl });
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Endpoint para redirigir a la URL original
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = parseInt(req.params.short_url);

  // Buscar la URL original en base al short_url
  const urlEntry = urls.find(entry => entry.short_url === shortUrl);
  if (urlEntry) {
    res.redirect(urlEntry.original_url);
  } else {
    res.json({ error: 'invalid url' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});