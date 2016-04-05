/* global $ */

'use strict';

module.exports = function ({slideContainer}) {
	if (location.hash) {

		const slide = $(`.slide[data-slide-id="${location.hash.slice(1)}"]`);

		// Find the slide the hash to simulate deeplinking
		if (slide) {
			slideContainer.fire('a-slides_goto-slide', {slide});
		}

		slideContainer.scrollLeft = 0;
	} else {
		slideContainer.fire('a-slides_goto-slide', {slide: 0});
	}
};
