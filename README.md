# Introduction

This is **no**t **a**nother **m**arkdown **p**arser.

Well, okay, yes it is. But it handles a lot more than you're probably used to finding in just a single package. This generator can process Markdown files written in:

* [The standard Gruber syntax](http://daringfireball.net/projects/markdown/)
* [The GitHub Flavored Markdown syntax](http://github.github.com/github-flavored-markdown/) (including language-specific codeblock fences)
* [The PHP Markdown Extra syntax](http://michelf.com/projects/php-markdown/extra/)
* Supports [Maruku metadata](http://maruku.rubyforge.org/maruku.html#meta)

It also does some "non-traditional" work, too, that I find pretty damn useful:

* _Inline_ metadata support (something Maruku does not do). By this I mean you can add an ID to anything; for example, this format:  
 `Here is [a very special]{: #special .words1 .class1 lie=false} piece of text!`  
Produces this text:  
`<p>Here is <span id="special" class="words1 class1" lie="false">a very special</span> piece of text`  
Maruku only allowed you to do inline IDs for stylized text, like `code`, **strong**, or _emphasis_. Now, if you wrap your text in `[ ]` brackets, you can continue to add Maruku metadata syntax and expect it to work.
  
* Strikethroughs, using `~~`. For example, `This is a ~~strikethrough~~` turns into `This is a <del>strikethrough</del>`
* Tables, with support for `left`,`right`, and `center` alignment
* Conversion of `Note: `, `Tip: `, and `Warning: ` blocks into [Twitter Bootstrap alert blocks](http://twitter.github.com/bootstrap/components.html#alerts). Awesome!
* Build-time highlighting of `<pre>` code blocks. Enabled by default, see below for configuration instructions.

Holy cow, that's a lot! Unfortunately, due to the quantity of these rules, this turns out to be one of the slowest Markdown processers for Node.js. For 1,000 files, it takes about two seconds; for 10,000, it takes about twenty. There's more information on running these benchmarks below. If you're looking for a quicker parser, try [marked](https://github.com/chjj/marked); or, perhaps, you'd prefer [the original project Namp was forked from](https://github.com/evilstreak/markdown-js), which contains all the parsers above, not including my add-ons.

Note: For a demonstration of all these syntaxes, take a look at the _/doc_ folder.

## Usage and Configuration

First, install from npm:

	npm install namp

Then, add the module via a `require()` statement, feed it a file, and let it go:

```javascript
var namp = require('namp');
var fs = require('fs');

fs.readFile("SYNTAX.md", "utf8", function (err, data) {
	if (!err) {
		var output = namp.toHTML(data, {highlight: true } );
		fs.writeFileSync("SYNTAX.html", output.html);

		console.log("Finished! By the way, I found this metadata:\n" + require('util').inspect(output.metadata));
	}
});
```

That's it! Notice that the converter, `toHTML()`, takes two parameters:

* `data`, the contents of the Markdown file
* `options`, an object containing the following properties:  
  - `highlight` enables build-time syntax highlighting for code blocks (this is `true` by default). This uses [the highlight.js processor](http://softwaremaniacs.org/soft/highlight/en/), so you'll still need to define your own CSS for colors

The result of the `toHTML()` method is an object with two properties:

* `html`, the transformed HTML
* `metadata`, an object containing the document metadata values (`undefined` if there's none)

## Document Metadata Handling

A special note must be made for the way document metadata blocks are handled. These are a list of arbitrary `Key: Value` mappings defined at the very start of a document. They are optional, but can be useful as content to be used in other locations. _doc/SYNTAX.md_ shows how you can define these properties.

## Tests and Benchmarks

Surprisingly, the _test_ folder contains various functional tests for namp. These are mostly pilfered from `marked`, with some additional tests to support the namp addons. To run the suite, execute the following on the commandline:

	node test/index.js

If you're interested in seeing some bench marks, run

	node test/test.js --index

These benchmark tests require additional Markdown modules that are NOT included in the _package.json_ module. Install them at your own will.
