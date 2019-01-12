const express = require('express');
const https = require('https');
const app = express();
const router = express.Router();
const port = 4000;

const endpoint = 'https://itunes.apple.com/search?term=';

app.use('/api', router);

router.get('/search', function(request, response) {
  const term = request.query.term;

  https.get(`${endpoint}${term}`, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      response.send(JSON.parse(data));
    });
  })
  .on('error', (err) => {
    response.send(err.message);
  });
});

app.listen(port);
