const Hammer = require('hammmerjs');

const touches = new Hammer($('.slide-container')[0]);
touches.set({ direction: Hammer.DIRECTION_HORIZONTAL });
touches.on('swipeleft', () => document.dispatchEvent(new CustomEvent('a-slides_next-slide')));
touches.on('swiperight', () => document.dispatchEvent(new CustomEvent('a-slides_previous-slide')));
