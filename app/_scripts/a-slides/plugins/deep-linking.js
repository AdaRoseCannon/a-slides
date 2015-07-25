'use strict';

require('./util-polyfills');

module.exports = function () {
	if (location.hash) {

		const slide = $(location.hash);

		// Find the slide the hash to simulate deeplinking
		if (slide) {
			document.fire('a-slides_goto-slide-by-dom', {slide});
		}
	}
};
