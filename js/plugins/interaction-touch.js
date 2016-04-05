'use strict';

const Hammer = require('hammerjs');

module.exports = function (config) {

	return function ({slideContainer}) {

		const touches = new Hammer(slideContainer);
		touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });

		if (config.use.indexOf('swipe-forward') !== -1) {
			touches.on('swipeleft', () => slideContainer.fire('a-slides_next-slide'));
		}

		if (config.use.indexOf('swipe-back') !== -1) {
			touches.on('swiperight', () => slideContainer.fire('a-slides_previous-slide'));	
		}
	};

};
