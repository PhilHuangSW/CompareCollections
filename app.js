const express = require('express');
const ejsMate = require('ejs-mate');
const path = require('path');
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);
const fetch = require('node-fetch');
const parser = require('xml2json');
const morgan = require('morgan');

const app = express();

// Middleware
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.xml());
app.use(morgan('tiny'));
app.use(express.static(path.join(__dirname, '/public')));


// Routes
app.get('/', (req, res) => {
  res.render('home');
})

app.post('/personal', async (req, res) => {
  const { username } = req.body;
  const url = ('https://boardgamegeek.com/xmlapi2/collection?username=' + username + '&own=1&excludesubtype=boardgameexpansion&stats=1')
  let personalArray = [];
  try {
    const data = await fetch(url);
    const dataText = await data.text();
    const personal = await parser.toJson(dataText, { object: true });
    personalArray = personal.items.item
    if (personalArray.length > 0) {
      res.render('personal', { personalArray, username });
    } else {
      res.render('error', { username });
    }
  } catch (e) {
    console.log(e);
    console.log('help I crashed');
    res.render('error', { username });
  }
})

app.post('/compare', async (req, res) => {
  const { main, compare } = req.body;
  const mainUrl = ('https://boardgamegeek.com/xmlapi2/collection?username=' + main + '&own=1&excludesubtype=boardgameexpansion&stats=1');
  const compareUrl = ('https://boardgamegeek.com/xmlapi2/collection?username=' + compare + '&own=1&excludesubtype=boardgameexpansion&stats=1');
  let filtered = [];
  let mainCollection = [];
  let compareCollection = [];
  let matched = false;

  try {
    const mainData = await fetch(mainUrl);
    const compareData = await fetch(compareUrl);
    const mainDataText = await mainData.text();
    const compareDataText = await compareData.text();
    const mainJson = await parser.toJson(mainDataText, { object: true });
    const compareJson = await parser.toJson(compareDataText, { object: true });
    mainCollection = mainJson.items.item;
    compareCollection = compareJson.items.item;
    for (let i = 0; i < mainCollection.length; i++) {
      for (let j = 0; j < compareCollection.length; j++) {
        if (mainCollection[i].name.$t === compareCollection[j].name.$t) {
          matched = true;
        }
        if (matched === true) {
          break;
        }
      }
      if (matched === false) {
        filtered.push(mainCollection[i])
      }
      matched = false;
    }
    res.render('compare', { filtered, mainCollection, compareCollection, main, compare })
  } catch (e) {
    console.log(e);
    console.log('Help! I crashed somehow!');
    res.render('error')
  }
})

app.listen(8080, () => {
  console.log('Listening on port 8080!');
})























  // const danData = await fetch('https://boardgamegeek.com/xmlapi2/collection?username=danshoehsu&own=1&excludesubtype=boardgameexpansion');
  // const danDataText = danData.text();
  // const dan = parser.toJson(danDataText, { object: true });
  // next();
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