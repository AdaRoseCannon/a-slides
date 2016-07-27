'use strict';

const Hammer = require('hammerjs');
const {fire} = require('../events');

module.exports = function (config) {

	return function ({slideContainer}) {

		const touches = new Hammer(slideContainer);
		touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });

		if (config.use.indexOf('swipe-forward') !== -1) {
			touches.on('swipeleft', () => fire(slideContainer, 'a-slides_next-slide'));
		}

		if (config.use.indexOf('swipe-back') !== -1) {
			touches.on('swiperight', () => fire(slideContainer, 'a-slides_previous-slide'));
		}
	};

};