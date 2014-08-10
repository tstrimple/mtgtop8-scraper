var scrape = require('./scrape');
var fs = require('fs');
var ids = [];
var completeCount = 0;
var total = 7946; // 8/8/2014 (Pro Tour M15)

var ignoredIds = fs.readFileSync('./ignore.json');

// Function to check if an object is in another object
function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

// Create an array of Ids from 1 to "total"
// excluding any listed in "./ignore.json"
for(var id = 1; id <= total; id++) {
  if(!contains(ignoredIds, id)) {
    ids.push(id);
  }
}

// Call "scrape" from "./scrape.js"
scrape(ids, function(err) {
  console.log('done processing all files');
});
