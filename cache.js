var fs = require('fs');
var util = require('util');
var request = require('request');

module.exports = function() {
  var format = './cache/%s.html';
  var source = 'http://www.mtgtop8.com/event?e=%d'

  return {
    get: function(id, fn) {
      var cache = util.format(format, id);
      fs.readFile(cache, { encoding: 'utf8' }, fn);
    },

    exists: function(id) {
      var cache = util.format(format, id);
      return fs.existsSync(cache);
    },

    invalidate: function(id, fn) {
      var cache = util.format(format, id);
      fs.unlink(cache);
    },

    update: function(id, fn) {
      var url = util.format(source, id);
      var cache = util.format(format, id);
      var r = request(url);

      r.pipe(fs.createWriteStream(cache));
      
      r.on('end', function() {
          fn();
      });

      r.on('close', function() {
        fn();
      });

      r.on('error', function(err) {
        console.log('error updating ', id); 
        fn(err);
      });
    }

  };
}
