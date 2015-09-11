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
			overflow: "hidden",
			"flex-direction": 'column'
		});
	},
	action: function* () {

		// Append the target to the dom
		this.appendChild(appendTarget);

		appendTarget
		.addHTML(`<h2 style="text-align: center; font-weight: 100; font-size: 5em; margin: 0;">SIMD</h2>
				  <h3 style="text-align: center; font-weight: 100;">(Pronounced SIM-DEE)</h3>`);
		yield;

		appendTarget.empty()
		.addHTML(`<img src="images/SIMD.png" />`);
		yield;
	},
	teardown() {
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
