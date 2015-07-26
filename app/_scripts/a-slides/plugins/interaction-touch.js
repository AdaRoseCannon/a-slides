'use strict';

require('./util-polyfills');

const Hammer = require('hammmerjs');

module.exports = function ({slideContainer}) {

	const touches = new Hammer(slideContainer);
	touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });
	touches.on('swipeleft', () => slideContainer.fire('a-slides_next-slide'));
	touches.on('swiperight', () => slideContainer.fire('a-slides_previous-slide'));	
};

