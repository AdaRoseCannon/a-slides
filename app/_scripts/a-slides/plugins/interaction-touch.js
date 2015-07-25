'use strict';

require('./util-polyfills');

const Hammer = require('hammmerjs');

module.exports = function ({slideContainer}) {

	const touches = new Hammer(slideContainer);
	touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });
	touches.on('swipeleft', () => document.fire('a-slides_next-slide'));
	touches.on('swiperight', () => document.fire('a-slides_previous-slide'));	
};

