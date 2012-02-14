#!/usr/bin/env node

var fs = require('fs')
  , path = require('path')
  , namp = require('../lib/index')
  , dir = __dirname + '/features'
  , _path = require('path');

var BREAK_ON_ERROR = false;

var files;

var load = function() {
  files = {};

  var list = walkSync(dir, new RegExp("text$"));

  for (var i = 0; i < list.length; i++) {
    var file = list[i];
    files[path.basename(file)] = {
      text: fs.readFileSync(file, 'utf8'),
      html: fs.readFileSync(file.replace(/[^.]+$/, 'html'), 'utf8')
    };
  }
};

var main = function() {
  if (!files) load();

  var complete = 0
    , keys = Object.keys(files)
    , i_ = 0
    , l_ = keys.length
    , filename
    , file
    , text
    , html;

main:
  for (; i_ < l_; i_++) {
    filename = keys[i_];
    file = files[filename];

    try {
      text = namp.toHTML(file.text, "NAMP", true).replace(/\s/g, '');
      html = file.html.replace(/\s/g, '');
    } catch(e) {
      console.log('%s failed.', filename);
      throw e;
    }

    var i = 0
      , l = html.length;

    for (; i < l; i++) {
      if (text[i] !== html[i]) {
        text = text.substring(
          Math.max(i - 30, 0),
          Math.min(i + 30, text.length));
        html = html.substring(
          Math.max(i - 30, 0),
          Math.min(i + 30, html.length));
        console.log(
          '\n#%d. %s failed at offset %d. Near: "%s".\n',
          i_ + 1, filename, i, text);
        console.log('\nGot:\n%s\n',
          pretty(text).trim() || text);
        console.log('\nExpected:\n%s\n',
          pretty(html).trim() || html);
        if (BREAK_ON_ERROR) {
          break main;
        } else {
          break;
        }
      }
    }

    if (i === l) {
      complete++;
      console.log('#%d. %s completed.', i_ + 1, filename);
    }
  }

  console.log('%d/%d tests completed successfully.', complete, l_);
};

main.bench = function(name, func) {
  if (!files) {
    bench_load();
    // change certain tests. to allow
    // comparison to older benchmark times.
    fs.readdirSync(__dirname + '/bench').forEach(function(name) {
      if (name.split('.').pop() === 'html') return;
      if (name === 'main.text') return;
      delete files[name];
    });

    files['main.text'].text = files['main.text'].text.replace('* * *\n\n', '');
  }

  var start = Date.now()
    , times = 1000
    , keys = Object.keys(files)
    , i = 0
    , l = keys.length
    , filename
    , file;

  while (times--) {
    for (i = 0; i < l; i++) {
      filename = keys[i];
      file = files[filename];
      func(file.text);
    }
  }

  console.log('%s completed in %dms.', name, Date.now() - start);
};

var bench = function() {
  var marked = require('marked');
  main.bench('marked', marked);

  var discount = require('discount').parse;
  main.bench('discount', discount);

  var showdown = (function() {
    var Showdown = require('showdown').Showdown;
    var convert = new Showdown.converter();
    return function(text) {
      return convert.makeHtml(text);
    };
  })();
  main.bench('showdown (reuse converter)', showdown);

  var showdown_slow = (function() {
    var Showdown = require('showdown').Showdown;
    return function(text) {
      var convert = new Showdown.converter();
      return convert.makeHtml(text);
    };
  })();
  main.bench('showdown (new converter)', showdown_slow);

  var markdownjs = require('markdown');
  main.bench('markdown-js', function(text) {
    markdownjs.parse(text);
  });

  var namp = require('../lib/index');
  main.bench('namp', function(text) {
    namp.toHTML(text, "NAMP", true);
  });
};

var time = function() {
  var marked = require('../');
  main.bench('marked', marked);
};

var bench_load = function() {
  files = {};
 
  var list = walkSync(__dirname + '/bench', new RegExp("text$"));

  for (var i = 0; i < list.length; i++) {
    file = list[i];
    files[path.basename(file)] = {
      text: fs.readFileSync(file, 'utf8'),
      html: fs.readFileSync(file.replace(/[^.]+$/, 'html'), 'utf8')
    };
  }
};

/**
 * Pretty print HTML
 * Copyright (c) 2011, Christopher Jeffrey
 */

var pretty = (function() {
  var indent = function(num) {
    return Array((num >= 0 ? num : 0) + 1).join('  ');
  };

  var closing = {
    base: true,
    link: true,
    meta: true,
    hr: true,
    br: true,
    wbr: true,
    img: true,
    embed: true,
    param: true,
    source: true,
    track: true,
    area: true,
    col: true,
    input: true,
    keygen: true,
    command: true
  };

  var remove = /<(pre|textarea|title|p|li|a)(?:\s[^>]+)?>[\s\S]+?<\/\1>/g
    , replace = /<!(\d+)%*\/>/g
    , wrap = /([ \t]*)<p>([\s\S]+?)<\/p>/g;

  return function(str) {
    var hash = []
      , out = []
      , cap
      , depth = 0
      , text
      , full
      , tag
      , name;

    // temporarily remove elements before
    // processing, also remove whitespace
    str = str.replace(remove, function(element, name) {
        element = element
          .replace(/(<[^\/][^>]*>)\s+|\s+(<\/)/g, '$1$2')
          .replace(/[\r\n]/g, '');
      return '<!' + (hash.push(element) - 1)
                  + (Array(element.length - 3).join('%')) + '/>';
    });

    // indent elements
    str = str
      .replace(/(>)\s+|\s+(<)/g, '$1$2')
      .replace(/[\r\n]/g, '');

    while (cap = /^([\s\S]*?)(<([^>]+)>)/.exec(str)) {
      str = str.substring(cap[0].length);
      text = cap[1];
      full = cap[2];
      tag = cap[3];
      name = tag.split(' ')[0];

      if (text) {
        out.push(indent(depth) + text);
      }

      if (name[0] !== '/') {
        out.push(indent(depth) + full);
        if (!closing[name]
            && name[0] !== '!'
            && name[0] !== '?'
            && tag[tag.length-1] !== '/') {
          depth++;
        }
      } else {
        depth--;
        out.push(indent(depth) + full);
      }
    }
    str = out.join('\n');

    // restore the elements to
    // their original locations
    str = str.replace(replace, function($0, $1) {
      return hash[$1];
    });

    // wrap paragraphs
    str = str.replace(wrap, function($0, $1, $2) {
      var indent = $1 + '  '
        , text = indent + $2;

      text = text
        .replace(/[\t\r\n]+/g, '')
        .replace(/(<\/[^>]+>|\/>)(?=\s*<\w)/g, '$1\n' + indent)
        .replace(/(.{75,}?\s+(?![^<]+>))/g, '$1\n' + indent)
        .replace(/([^<>\n]{50,}?)(<[^<]{15,}>)/g, '$1\n' + indent + '$2');

      return $1 + '<p>\n' + text + '\n' + $1 + '</p>';
    });

    return str;
  };
})();

if (!module.parent) {
  if (~process.argv.indexOf('--bench')) {
    bench();
  } else if (~process.argv.indexOf('--time')) {
    time();
  } else {
    main();
  }
} else {
  module.exports = main;
}


function walkSync(baseDir, extRE) {
    baseDir = baseDir.replace(/\/$/, '');

    var walkSync = function(baseDir) {
            var files = [],
                curFiles, nextDirs, isDir = function(fname) {
                    return fs.statSync(_path.join(baseDir, fname)).isDirectory();
                },
                prependBaseDir = function(fname) {
                    return _path.join(baseDir, fname);
                };

            curFiles = fs.readdirSync(baseDir);
            nextDirs = curFiles.filter(isDir);
            curFiles = curFiles.map(prependBaseDir);

            files = files.concat(curFiles);

            while (nextDirs.length) {
                files = files.concat(walkSync(_path.join(baseDir, nextDirs.shift())));
            }

            return files;
        };

    // convert absolute paths to relative
    var fileList = walkSync(baseDir).filter(function(val) {
        return val.match(extRE) ? val.replace(baseDir + '/', '') : 0;
    });

    return fileList;
};