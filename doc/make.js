var fs = require('fs');

fs.readFile("SYNTAX.md", "utf8", function (err, data) {
	if (!err) {
		var output = require("../lib/index").toHTML(data, {highlight: true } );
		fs.writeFileSync("SYNTAX.html", output.html);

		console.log("Finished! By the way, I found this metadata:\n" + require('util').inspect(output.metadata));
	}
});



