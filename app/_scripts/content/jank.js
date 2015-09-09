var appendTarget;

var contentToAppend = [

`## Slow 🐢
* Layout
* Paint`,

`## Fast 🐰
* Composite
yield`

];

var cssTriggers = [
	'## Great Resource:',
	"### Paul Lewis's CSS Triggers",
	'![](images/css-triggers.png)',
	'# http://csstriggers.com/'
].join('\n');

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup() {
		appendTarget = make.div();
	},
	action: function* () {

		// Append the target to the dom
		this.appendChild(appendTarget);

		appendTarget.addMarkdown('# Performance, what is jank?');
		yield;

		appendTarget.addMarkdown('<div><img src="images/jank-profile.png" /></div>');
		yield;

		for(let content of contentToAppend) {
			const child = make.div();
			child.style.display = 'inline-block';
			child.style.float = 'left';
			child.style.padding = '0 0.5em';
			child.appendChild(make.markdown(content));
			appendTarget.appendChild(child);
			yield;
		}

		appendTarget.empty();
		appendTarget.appendChild(make.markdown(cssTriggers));
		yield;
	},
	teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
