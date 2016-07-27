
'use strict';

function on(node, name, fn) {
	if (!node.funcRef) node.funcRef = new Set();

	// Store it for later
	node.funcRef.add(fn);
	node.addEventListener(name, fn);
	return node;
}

function off(node, name, fn) {
	if (!node.funcRef) return;
	if (fn) {
		node.removeEventListener(name, fn);
	} else {
		node.funcRef.forEach(fn => node.removeEventListener(name, fn));
	}
	node.funcRef.delete(fn);
	return node;
}

module.exports = {on, off,

	once(node, name, fn) {
		on(node, name, function tempF(e) {
			fn.bind(node)(e);
			off(node, name, tempF);
		});
		return node;
	},

	fire(node, name, detail = {}) {
		node.dispatchEvent(new CustomEvent(name, {detail}));
		return node;
	}
};
