var async = require('async');
var util = require('util');
var cache = require('./cache')();
var parse = require('./parse');
var fs = require('fs');
var ids = [];
var errors = [];
var completeCount = 0;
var total = 1;

module.exports = function(ids, fn) {
  total = ids.length;

  // call "processId" for each id (limiting to 20 at a time)
  async.eachLimit(ids, 20, processId, function(err) {
    saveErrors();
    fn(err);
  });
}

function saveErrors() {
  fs.writeFileSync('./errors.json', JSON.stringify(errors));
}

function saveResults(id, data, fn) {
  var results = util.format('./results/%s.json', id);
  fs.writeFile(results, JSON.stringify(data), fn);
}

function processId(id, next) {
  process.stdout.write(' ' + ((completeCount / total) * 100).toFixed() + '%\r');

  // Check if the file exists in "./cache"
  if(!cache.exists(id)) {

    // update the cache with this file
    return cache.update(id, function(err) {
      if(err) {
        return next(err);
      }

      process.nextTick(function() {
        processId(id, next);
      });
    });
  }

  // Read the file from "./cache"
  cache.get(id, function(err, page) {
    if(err) {
      return next(err);
    }
    
    try {
      var data = { id: id };
      
      parse(page, data, function(err) {
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

