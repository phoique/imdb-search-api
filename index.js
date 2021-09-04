const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const SearchFilm = require('./SearchFilm');
const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api', (req, res) => {
  res.status(200).json({
    status: true,
    statusCode: 200,
    desc: "IMDB Search Web Service OK."
  });
});

app.get('/api/search', async (req, res) => {
  const { text } = req.query;

  var main_response = {
    status: true,
    statusCode: 200,
    desc: '',
    result: []
  };

  if(!text) {
    main_response.status = false;
    main_response.statusCode = 422;
    main_response.desc = "Text cannot be blank!";
    main_response.result = false;
    return res.status(main_response.statusCode).json(main_response);
  }

  const searchFilm = await new SearchFilm().search(text);
  if(searchFilm && searchFilm.length > 0) {
    main_response.result = searchFilm;
  }
  else {
    main_response.status = false;
    main_response.statusCode = 404;
    main_response.desc = "There are no results!";
    main_response.result = false;
  }

  return res.status(main_response.statusCode).json(main_response);
});

/**
 * 404
*/
 app.use(function (req, res) {
  return res.status(404).json(
    {
      status: false,
      errorCode: 7,
      httpStatus: 404,
      desc: 'The request link is incorrect!'
    }
  );
});

const port = 3001;
app.listen(port, () => {
  console.log(`IMDB Search Web Service - ${port}!`);
});