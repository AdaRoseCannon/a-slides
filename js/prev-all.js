'use strict';

module.exports = function prevAll(el) {
	const nodes = Array.from(el.parentNode.children);
	const pos = nodes.indexOf(el);
	return nodes.slice(0, pos);
};
