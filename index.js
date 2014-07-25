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

    var re, fileContent, match, filesList = [];

    re = /url\(\"?\'?([^\'\"\)]+)\"?\'?\)/g
    fileContent = String(file.contents);

    while (match = re.exec(fileContent)) {
      try {
        var stats = fs.statSync(path.join(options.dir, match[1]));
      } catch (e) {
        continue;
      }
      var d = new Date(stats.mtime)
      filesList[match[1]] = match[1] + '?v=' + d.getTime();
    }

    for (var search in filesList) {
      var replacement = filesList[search]
      file.contents = new Buffer(String(file.contents).replace(search, replacement));
    }

    stream.push(file);
    done();

  };

  return stream;
}

module.exports = gulpcar;
