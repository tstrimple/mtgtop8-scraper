var cheerio = require('cheerio');
var async = require('async');

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

var parse = async.applyEach([getFormatAndDate, getEvent, getCards]);

module.exports = function(page, data, fn) {
  var $ = cheerio.load(page);
  parse($, data, fn);
}
