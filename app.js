var scrape = require('./scrape');
var fs = require('fs');
var ids = [];
var completeCount = 0;
var total = 7500;

var ignoredIds = fs.readFileSync('./ignore.json');

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

for(var id = 1; id <= total; id++) {
  if(!contains(ignoredIds, id)) {
    ids.push(id);
  }
}

scrape(ids, function(err) {
  console.log('done processing all files');
});
