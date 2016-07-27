'use strict';

const { fire } = require('events');

module.exports = function ({slideContainer}) {
	if (location.hash) {

		const slide = slideContainer.querySelector(`.a-slides_slide[data-slide-id="${location.hash.slice(1)}"]`);

		// Find the slide with the hash to simulate deeplinking
		if (slide) {
			fire(slideContainer, 'a-slides_goto-slide', {slide});
		}

		slideContainer.scrollLeft = 0;
	} else {
		fire(slideContainer, 'a-slides_goto-slide', {slide: 0});
	}
};
