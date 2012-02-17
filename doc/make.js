var fs = require('fs');

var input = fs.readFile("SYNTAX.md", "utf8", function (err, data) {
	if (err)
	{
		console.err(err);
		process.exit(1);
	}

	var output = require("../lib/index").toHTML( data, {highlight: true, conref: false} );

	fs.writeFile("SYNTAX.html", output[0]);

	console.log("By the way, I found this metadata:\n" + require('util').inspect(output[1]));
});