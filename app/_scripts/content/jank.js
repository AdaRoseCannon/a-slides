var appendTarget;

var contentToAppend = [

'# Performance, what is jank?',

'<img src="images/jank-profile.png" />',

`## Slow 🐢
* Layout
* Paint`,

`## Fast 🐰
* Composite
yield`

];

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup() {
		appendTarget = make.div();
	},
	action: function* () {

		// Append the target to the dom
		this.appendChild(appendTarget);

		// Add the text line by line on click
		for(let content of contentToAppend) {
			const child = make.div();
			child.style.display = 'inline-block';
			child.style.float = 'left';
			child.style.padding = '0 0.5em';
			child.appendChild(make.markdown(content));
			appendTarget.appendChild(child);
			yield;
		}
	},
	teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
