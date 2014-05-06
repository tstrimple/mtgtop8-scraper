var cheerio = require('cheerio');
var async = require('async');
var util = require('util');
var cache = require('./cache')({ format: './cache/%s.html', source: 'http://www.mtgtop8.com/event?e=%d' });
var fs = require('fs');
var ids = [];
var resultsFormat = './results/%s.json';
var errors = [];
var completeCount = 0;
var total = 7500;

for(var id = 1; id <= total; id++) {
  ids.push(id);
}

async.eachLimit(ids, 20, processId, function(err) {
  saveErrors();
  if(err) throw err;
});

function saveErrors() {
  fs.writeFileSync('./errors.json', errors.join('\r\n'));
}

function saveResults(id, data, fn) {
  var results = util.format(resultsFormat, id);
  fs.writeFile(results, JSON.stringify(data), fn);
}

function processId(id, next) {
  process.stdout.write(' ' + ((completeCount / total) * 100).toFixed() + '%\r');
  if(!cache.exists(id)) {
    return cache.update(id, function(err) {
      if(err) {
        return next(err);
      }

      process.nextTick(function() {
        processId(id, next);
      });
    });
  }

  cache.get(id, function(err, page) {
    if(err) {
      return next(err);
    }

    var data = { id: id };
    
    try {
      var $ = cheerio.load(page);

      parsePage($, data, function(err) {
        completeCount++;
        if(data.format === '//' || data.mainboard.length === 0) {
          errors.push(id);
          cache.invalidate(data.id);
        } else {
          saveResults(id, data);
        }

        next(err);
      });

    } catch(err) {
      throw err;
      next(err);
    }
  });
}


function getFormatAndDate($, data, fn) {
  var parts = $('td.S14').text().trim().split(' ');
  data.format = parts[0];
  data.date = parts[1];
  fn(null, data);
}

function getEvent($, data, done) {
  data.event = $('td.S18').text().trim();
  done(null, data);
}

function getCards($, data, done) {
  data.mainboard = [];
  data.sideboard = [];
  $('td.O13').each(function(i, elem) {
    var section = $(this).text().toLowerCase();
    var cards = getCardsFromSection($, $(this));
    if(section === 'sideboard') {
      data.sideboard = data.sideboard.concat(cards);
    } else {
      data.mainboard = data.mainboard.concat(cards);
    }
  });

  done(null, data);
}

function getCardsFromSection($, section) {
  var cards = [];
  section.parent().parent().find('td.G14').each(function(i, elem) {
    var parts = $(this).text().trim().split(/\W+/);
    var card = { count: parts.shift(), name: parts.join(' ') };
    cards.push(card);
  });

  return cards;
}

var parsePage = async.applyEach([getFormatAndDate, getEvent, getCards]);

