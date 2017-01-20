const fs = require('fs');
const $ = require('cheerio').load(fs.readFileSync('scripts/live-lot-web.html'));
const curated = require('./curated.json');

function parseWines(wineTable) {
  const wines = $(wineTable).find('tr').toArray();
  return wines.map((wine) => {
    const year = $($(wine).children()[0]).text();
    let str;
    str = $($(wine).children()[1]).text();
    let desc = /([^(]+)/.exec(str);
    desc = desc ? desc[1].trim() : null;
    let rating = /\((.+)\)/.exec(str);
    rating = rating ? rating[1] : null;
    str = $($(wine).children()[2]).text();
    let size = /([^(]+)/.exec(str);
    size = size ? size[1].trim() : null;
    let qty = /\((.+)\)/.exec(str);
    qty = qty ? qty[1] : 1;
    return {
      year,
      desc,
      rating,
      size,
      qty,
    };
  });
}


function parseDescription(pElts) {
  const descLines = [];
  for (let i = 0; i < pElts.length - 2; i += 1) {
    descLines[i] = $(pElts[i]).text();
  }
  return descLines;
}

const lots = [];
$('.entry-content .row').each((i, lot) => {
  const $lot = $(lot);
  const title = $lot.find('h2').text();
  const wines = parseWines($lot.find('.wines'));
  const wineCount = wines.reduce((prev, cur) => prev + (+cur.qty), 0);
  lots[i] = {
    type: 'live',
    lot: i + 1,
    title,
    short_title: title.length < 36 ? title : null,
    description: parseDescription($lot.find('p')),
    short_desc: '',
    items: [],
    wines,
    wineCount,
    notes: null,
    restrictions: null,
    image: $lot.find('img').prop('src'),
    pickup_notes: '',
  };
});

lots.forEach((lot, idx) => {
  const manual = curated[idx.toString()];
  if (manual) {
    Object.assign(lot, manual);
  }
});
fs.writeFile('scripts/data.json', JSON.stringify(lots, null, 2));
