'use strict';

const { fire, on } = require('events');

module.exports = function ({slideContainer}) {
	window.addEventListener('keyup', e => {
		switch (e.keyCode) {

			// Left Arrow
			case 37:
			case 33:
				fire(slideContainer, 'a-slides_previous-slide');
				break;

			// Right Arrow
			case 13:
			case 39:
			case 34:
				fire(slideContainer, 'a-slides_trigger-event');
				break;

			case 66:
			case 70:
				slideContainer.classList.toggle('presentation');
				break;

			case 27:
				slideContainer.classList.remove('presentation');
				break;
		}
	});

	on(slideContainer, 'click', function () {
		fire(this, 'a-slides_trigger-event');
	});
};