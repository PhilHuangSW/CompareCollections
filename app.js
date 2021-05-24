const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
const fetch = require('node-fetch');
const parser = require('xml2json');

const app = express();

// Middleware
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.xml());

let phil = [];
let dan = [];

const retrieveCollection = async (req, res, next) => {
  try {
    const data = await fetch('https://boardgamegeek.com/xmlapi2/collection?username=Youya&own=1&excludesubtype=boardgameexpansion');
    const dataText = await data.text();
    const phils = await parser.toJson(dataText, { object: true });
    phil = phils.items.item

    const danData = await fetch('https://boardgamegeek.com/xmlapi2/collection?username=danshoehsu&own=1&excludesubtype=boardgameexpansion');
    const danDataText = await danData.text();
    const dans = await parser.toJson(danDataText, { object: true });
    dan = dans.items.item
    next()
  }
  catch (e) {
    // console.log(e)
    next(e)
  }
  // const danData = await fetch('https://boardgamegeek.com/xmlapi2/collection?username=danshoehsu&own=1&excludesubtype=boardgameexpansion');
  // const danDataText = danData.text();
  // const dan = parser.toJson(danDataText, { object: true });
  // next();
}
// fetch('https://boardgamegeek.com/xmlapi2/collection?username=Youya&own=1&excludesubtype=boardgameexpansion')
//   .then(response => response.text())
//   .then(str => {
//     phil = parser.toJson(str, { object: true })
//     // console.log(phil)
//     // console.log(phil.items.item[0].name.$t)
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// fetch('https://boardgamegeek.com/xmlapi2/collection?username=danshoehsu&own=1&excludesubtype=boardgameexpansion')
//   .then(response => response.text())
//   .then(str => {
//     dan = parser.toJson(str, { object: true })
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// phil.items.item is the array
// var j = parser.toJson(xml);
// console.log("to json -> %s", json);


// phil = JSON.stringify(phil);

app.get('/', (req, res) => {
  res.render('home');
})

app.get('/phil', retrieveCollection, (req, res) => {
  res.render('phil', { phil, dan })
})

app.get('/collection', retrieveCollection, (req, res) => {
  // const c = await fetch('https://netrunnerdb.com/api/2.0/public/card/02043');
  // const ca = await c.json();
  // const xml = await phil.json();
  let filtered = [];
  let matched = false

  for (let ph in phil) {
    for (let da in dan) {
      if (phil[ph].name.$t == dan[da].name.$t) {
        matched = true
      }
    }
    if (matched === false) {
      filtered.push([phil[ph].name.$t, phil[ph].image])
    }
    matched = false
  }
  res.render('collection', { filtered, phil, dan })
})

app.listen(8080, () => {
  console.log('Listening on port 8080!');
})