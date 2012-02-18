var fs = require('fs');

var output = require("../lib/index").toHTML("SYNTAX.md", {highlight: true, conref: true} );

fs.writeFileSync("SYNTAX.html", output.html);

console.log("Finished! By the way, I found this metadata:\n" + require('util').inspect(output.metadata));