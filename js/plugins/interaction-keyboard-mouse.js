'use strict';

module.exports = function ({slideContainer}) {
	window.addEventListener('keyup', e => {
		switch (e.keyCode) {

			// Left Arrow
			case 37:
			case 33:
				slideContainer.fire('a-slides_previous-slide');
				break;

			// Right Arrow
			case 13:
			case 39:
			case 34:
				slideContainer.fire('a-slides_trigger-event');
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

	slideContainer.on('click', function () {
		this.fire('a-slides_trigger-event');
	});
};