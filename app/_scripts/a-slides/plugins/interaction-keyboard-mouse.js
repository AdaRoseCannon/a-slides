'use strict';

window.addEventListener('keyup', e => {
	switch(e.keyCode) {

		// Left Arrow
		case 37:
			document.dispatchEvent(new CustomEvent('a-slides_previous-slide'));
			break;

		// Right Arrow
		case 13:
		case 39:
			document.dispatchEvent(new CustomEvent('a-slides_trigger-event'));
			break;
	}
});

$('.slide-container').on('click', document.dispatchEvent(new CustomEvent('a-slides_next-slide')));
