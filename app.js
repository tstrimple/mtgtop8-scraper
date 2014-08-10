var scrape = require('./scrape');
var fs = require('fs');
var ids = [];
var startid = 0;
var completeCount = 0;
var total = 7959; // 03-08-2014 -- SCG Dallas

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

for(var id = startid; id <= total; id++) {
  if(!contains(ignoredIds, id)) {
    ids.push(id);
  }
}

scrape(ids, function(err) {
  console.log('done processing all files');
});
