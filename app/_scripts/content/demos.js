var appendTarget;


// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup() {
		appendTarget = make.div().css({
			display: 'flex',
			width: '100%',
			height: '100%',
			"justify-content": 'center',
			"align-items": 'center',
			overflow: "hidden"
		});
	},
	action: function* () {

		// Append the target to the dom
		this.appendChild(appendTarget);

		appendTarget.empty()
		.addHTML(`<iframe src="https://adaroseedwards.github.io/SoundThing/index.html" style="width: 100%; height: 100%;" seamless=true>`);
		yield;

		appendTarget.empty()
		.addHTML(`<img src="images/cardboard.jpg" />`);
		yield;
	},
	teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
