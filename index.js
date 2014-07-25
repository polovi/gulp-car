'use strict';

var gutil           = require('gulp-util'),
    PluginError     = gutil.PluginError,
    log             = gutil.log,
    Transform       = require('stream').Transform,
    fs              = require('fs'),
    path = require('path'),

    PLUGIN_NAME     = 'gulp-car';

function formatException(e) {
  return e.name+' in plugin \''+gutil.colors.cyan(PLUGIN_NAME)+'\''+': '+e.message
}

function gulpcar(options) {
  var stream = new Transform({ objectMode: true });

  stream._transform = function(file, unused, done) {

    if (file.isNull()) {
      stream.push(file);
      return done();
    }

    if (file.isStream()) {
      return done(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }

    var re, fileContent, match, replacementList;


    re = /(url\(\"([^\"\?\#]+)\"\))/g
    fileContent = String(file.contents)
    replacementList = []

    while (match = re.exec(fileContent)) {
      var filePath = path.join(options.dir, match[2]);

      if (path.extname(match[2]) !== '.png' && path.extname(match[2]) !== '.jpg' && path.extname(match[2]) !== '.gif' && path.extname(match[2]) !== '.svg') {
        continue;
      }

      try {
        var stats = fs.statSync(filePath);
      } catch (e) {
        log(PLUGIN_NAME + ":", gutil.colors.red("FILE NOT FOUND"), filePath);
        continue;
      }

      replacementList.push({
        s: match[1],
        r: "url(\"" + match[2].replace(path.extname(match[2]), '.' + new Date(stats.mtime).getTime() + path.extname(match[2])) + "\")"
      });
    };

    var one, _i, _len;
    for (_i = 0, _len = replacementList.length; _i < _len; _i++) {
      one = replacementList[_i];
      file.contents = new Buffer(String(file.contents).replace(one.s, one.r));
    }

    stream.push(file);
    done();

  };

  return stream;
}

module.exports = gulpcar;
