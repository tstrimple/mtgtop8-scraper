var scrape = require('./scrape');
var fs = require('fs');
var ids = [];
var completeCount = 0;
var ids = JSON.parse(fs.readFileSync('./errors.json'));

console.log('running', ids.length, 'errors')

scrape(ids, function(err) {
  console.log('done processing errors');
});
