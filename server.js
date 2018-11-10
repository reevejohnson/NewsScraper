const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');

const db = require('./models');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://heroku_bfjvlp5j:r1ficksjcddlv24rrdm1edl7b7@ds127044.mlab.com:27044/heroku_bfjvlp5j'
mongoose.connect(MONGODB_URI);

app.get('/scrape', (req, res) => {
  axios.get('https://www.eonline.com/news/beyonce/articles').then(response => {
    const $ = cheerio.load(response.data);

      $('li.story').each((i, element) => {
        const result = {};
        result.title = $(element).children('span').children('h3').children('a').text().replace(/[\n\t\r\']/g,'').trim();
        result.link = `https://www.eonline.com${$(element).children('a').attr('href')}`;
        result.image = $(element).children('a').children('span').children('img').attr('src');

        db.Article.create(result)
          .then(dbArticle => {
            console.log(dbArticle);
          })
          .catch(err => {
            return res.json(err);
          });

          console.log(result);
        });

    res.send('Scrape Complete');
  });
});

app.get('/articles', (req, res) => {
  db.Article.find({})
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    })
});

app.get('/articles/:id', (req, res) => {
  db.Article.findOne({ _id: req.params.id })
    .populate('note')
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    })
});

app.post('/articles/:id', (req, res) => {
  db.Note.create(req.body)
    .then(dbNote => {
      return db.Article.findOneAndUpdate({_id: req.params.id}, {note: dbNote._id}, {new: true});
    })
    .then(dbArticle => {
      res.json(dbArticle);
    })
    .catch(err => {
      res.json(err);
    })
});

app.delete('/articles', (req, res) => {
    db.Article.remove({})
      .then(dbArticles => {
        res.json(dbArticles);
      })
      .catch(err => {
        res.json(err);
      })
});

app.listen(PORT, () => {
    console.log(`App running on port ${PORT}!`)
});