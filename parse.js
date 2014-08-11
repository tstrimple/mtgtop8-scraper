var cheerio = require('cheerio');
var async = require('async');
var util = require('util');

function isDate(item) {
  var matches = item.match(/(\d+)(-|\/)(\d+)(?:-|\/)(?:(\d+)\s+(\d+):(\d+)(?::(\d+))?(?:\.(\d+))?)?/);

  if (!item || item[2] !== "/") {
    return false;
  }

  return (new Date(item) !== 'Invalid Date');
}

function getFormatAndDate($, data, fn) {
  var parts = $('td.S14').text().trim().split(' ');
  data.format = parts[0];

  for (var i = 1; i < parts.length; i++) {
    if (isDate(parts[i].trim())) {
      data.date = parts[i].trim();
    }
  };

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

function getDeckName($, data, done) {
  var deck = $('td.S16').text().trim();
  var startTrim = deck.indexOf('] ');
  if(startTrim > 0) {
    deck = deck.substr(startTrim + 2, deck.length);
  } else {
    deck = deck.substr(3, deck.length);    
  }

  var parts = deck.split('-');
  if(parts.length > 0) {
    data.deck = parts[0].trim();
  }

  if(parts.length > 1) {
    data.player = parts[1].trim();
  }
  
  done(null, data);
}

var parse = async.applyEach([getFormatAndDate, getEvent, getCards, getDeckName]);

module.exports = function(page, data, fn) {
  var $ = cheerio.load(page);
  parse($, data, fn);
}
