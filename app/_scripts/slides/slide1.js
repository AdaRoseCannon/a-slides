/**
 * This example appends a new line of text then goes onto the next slide
 */

var contentToAppend;
var appendTarget;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup() {

		/**
		 * This is called before the slide animates in
		 */

		contentToAppend = [
			'Some stuff will happen on interaction',
			'This should be appended',
			'line',
			'by',
			'line'
		];

		// Make a div to be the target of the new text
		appendTarget = make.div();
	},
	action: function* () {

		/**
		 * This is called once after setup and
		 * on each interaction until the generator
		 * is done.
		 **/

		// Append the target to the dom
		this.appendChild(appendTarget);

		// Add the text line by line on click
		while(contentToAppend.length) {
			appendTarget.appendChild(make.text(contentToAppend.shift()));
			appendTarget.appendChild(make.br());
			yield;
		}

		appendTarget.appendChild(make.markdown("## Yay for generators!"));
		yield;

	},
	teardown() {

		/**
		 * This is called before setup
		 * and after slide has transitioned away
		 */
		if (appendTarget) {

			// Remove element
			appendTarget.removeSelf();

			// Free it up for garbage collection
			appendTarget = undefined;
		}
	}
};
