'use strict';

require('./util-polyfills');

module.exports = function ({slideContainer}) {
	window.addEventListener('keyup', e => {
		switch(e.keyCode) {

			// Left Arrow
			case 37:
				slideContainer.fire('a-slides_previous-slide');
				break;

			// Right Arrow
			case 13:
			case 39:
				slideContainer.fire('a-slides_trigger-event');
				break;
		}
	});

	slideContainer.on('click', function () {
		this.fire('a-slides_trigger-event');
	});
};
