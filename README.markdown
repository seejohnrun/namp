This is not another markdown parser.

Well, okay, yes it is. But it handles a lot more than you're probably used to. This generator can process Markdown files written in:

* [The standard Gruber syntax](http://daringfireball.net/projects/markdown/)
* [The GitHub Flavored Markdown syntax](http://github.github.com/github-flavored-markdown/) (including language-specific codeblock fences)
* [The PHP Markdown Extra syntax](http://michelf.com/projects/php-markdown/extra/)
* [Maruku meta-data support](http://maruku.rubyforge.org/maruku.html#meta)

It also does some "non-traditional" work, too, that I find pretty damn useful:

* Support for [content references (conrefs) in Markdown](https://github.com/gjtorikian/markdown_conrefs). Disabled by default, see below for configuration instructions.
* _Inline_ metadata support (something Maruku does not do). By this I mean you can add an ID to anything; for example, this format:  
 `Here is [a very special]{: #special .words1 .class1 lie=false} piece of text!`  
Produces this text:  
`<p>Here is <span id="special" class="words1 class1" lie="false">a very special</span> piece of text`  
Maruku only allowed you to do inline IDs for stylized text, like `code`, **strong**, or _emphasis_. Now, if you wrap your text in `[ ]` brackets, you can continue to add Maruku metadata syntax and expect it to work.
  
* Strikethroughs, using `~~`. For example, `This is a ~~strikethrough~~` turns into `This is a <del>strikethrough</del>`
* Conversion of `Note: `, `Tip: `, and `Warning: ` blocks into [Twitter Bootstrap alert blocks](http://twitter.github.com/bootstrap/components.html#alerts). Awesome!
* Build-time highlighting of `<pre>` code blocks. Enabled by default, see below for configuration instructions.

Holy cow, that's a lot! Unfortunately, due to the quantity of these rules, this turns out to be one of the slowest Markdown processers for Node.js. For 1,000 files, it takes about two seconds; for 10,000, it takes about twenty. There's more information on running these benchmarks below. If you're looking for a quicker parser, try [marked](https://github.com/chjj/marked); or, perhaps, you'd prefer [the original project Namp was forked from](https://github.com/evilstreak/markdown-js), which contains all the parsers above, not including my add-ons.

Note: For a demonstration of all these syntaxes, take a look at the _/doc_ folder.