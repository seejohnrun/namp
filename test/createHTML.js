var fstools = require('fs-tools'),
    fs = require('fs'),
    md2html = require('../lib/index');

fstools.walk(process.cwd() + "/features", '\.text$', function (path, stats, callback) {
  fs.readFile(path, 'utf-8', function (err, str) {
    if (err) {
      callback(err);
      return;
    }

    var output = require("../lib/index").toHTML( str, "NAMP", true );
    fs.writeFileSync(path.replace(".text", ".html"), output);
    callback();
  });
}, function (err) {
  if (err) {
    console.error(err);
  }

  console.log('Done!');
});