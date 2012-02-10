var fs = require('fs');

var input = fs.readFile("SYNTAX.markdown", "utf8", function (err, data) {
	if (err)
	{
		console.err(err);
		process.exit(1);
	}

	var output = require("../lib/index").parse( data, "all" );

	fs.writeFile("SYNTAX.html", output);
});