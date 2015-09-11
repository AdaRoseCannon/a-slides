var appendTarget;


// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup() {
		appendTarget = make.div().css({
			position: 'absolute',
			width: '100%',
			height: '100%',
			top: 0,
			left: 0,
			background: 'rgba(255,255,255,0.95)',
			display: 'flex',
			"align-items": 'center',
			"justify-content": 'center',
			opacity: 0,
			transform: 'scale(0.5, 0.5)',
			transition: 'transform 1s ease, opacity 1s ease',
		});
	},
	action: function* () {

		appendTarget
		.addMarkdown(`
			workerMessage({
				action: 'doThing',
				myVar: 4
			})
			.then(data => {
				console.log(data.response);
			});
		`);

		// Append the target to the dom
		this.appendChild(appendTarget);

		yield;

		appendTarget.style.transform = 'scale(1, 1)';
		appendTarget.style.opacity = 1;

		yield;
	},
	teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
