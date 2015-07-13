
if (location.hash) {

	const slide = document.querySelector(location.hash);

	// Find the slide the hash to simulate deeplinking
	if (slide) {
		document.dispatchEvent(new CustomEvent('a-slides_goto-slide-by-dom', {slide}));
	}
}
