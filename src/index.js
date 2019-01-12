const express = require('express');
const request = require('request-promise');
const app = express();
const router = express.Router();
const port = 4000;
const endpoint = 'https://itunes.apple.com/search?term=';

app.use('/api', router);

const itunesAPI = {
  getData: (term, types, catalog) => {
    let type = types.pop();

    return request({
      'method': 'GET',
      'uri': `${endpoint}${term}&media=${type}`,
      'json': true,
    })
    .then((response) => {
      catalog = catalog.concat(response.results);

      while (types.length > 0) {
        return itunesAPI.getData(term, types, catalog);
      }

      return catalog;
    });
  },
  processCatalog: (catalog) => {
    const result = catalog.reduce((cat, item) => {
      const {
        trackId,
        artworkUrl100,
        trackViewUrl,
        primaryGenreName,
      } = item;

      if (item.kind === undefined) {
        cat[item.wrapperType] = cat[item.wrapperType] || [];
        cat[item.wrapperType].push({
          trackId,
          artworkUrl100,
          trackViewUrl,
          primaryGenreName,
        })
      } else {
        cat[item.kind] = cat[item.kind] || [];
        cat[item.kind].push({
          trackId,
          artworkUrl100,
          trackViewUrl,
          primaryGenreName,
        });
      }
      return cat;
    }, {});

    return result;
  }
}

router.get('/search', function(req, response) {
  const types = [
    'movie',
    'podcast',
    'music',
    'musicVideo',
    'audiobook',
    'shortFilm',
    'tvShow',
    'software',
    'ebook'
  ];
  const term = req.query.term;
  let catalog = [];

  itunesAPI
    .getData(term, types, catalog)
    .then(itunesAPI.processCatalog)
    .then(processedCatalog => response.send(processedCatalog));
});

app.listen(port);
