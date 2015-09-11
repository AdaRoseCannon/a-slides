var appendTarget;


// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup() {
		appendTarget = make.div();
	},
	action: function* () {

		// Append the target to the dom
		this.appendChild(appendTarget);

		appendTarget.empty()
		.addHTML(`<img src="images/wile.jpg" style="width: 100%; height: 100%;">`);
		yield;

		appendTarget.empty()
		.addHTML(`<img src="images/wile.gif" style="width: 100%; height: 100%;">`);
		yield;

		appendTarget.empty()
		.addHTML(`<img src="images/choco.jpg" style="width: 100%; height: 100%;">`);
		yield;

		appendTarget.empty()
		.addHTML(`<video src="images/angela.webm" style="width: 100%; height: 100%;" autoplay loop>`);
		yield;
	},
	teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
