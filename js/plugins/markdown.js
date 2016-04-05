/* global $$ */

'use strict';

const marked = require('marked');

// Render the slides markdown.
module.exports = function () {
	const m = new Map();

	// store all of the innerHTMLs
	$$('.marked').forEach(o => m.set(o, o.innerHTML));

	// then write them all out
	m.forEach((v, k) => k.innerHTML = marked(v));
};
