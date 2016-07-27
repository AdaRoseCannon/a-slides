
'use strict';

module.exports = {
	on(node, name, fn) {
		if (!node.funcRef) node.funcRef = new Set();

		// Store it for later
		node.funcRef.add(fn);
		node.addEventListener(name, fn);
		return node;
	},

	off(node, name, fn) {
		if (!node.funcRef) return;
		if (fn) {
			node.removeEventListener(name, fn);
		} else {
			node.funcRef.forEach(fn => node.removeEventListener(name, fn));
		}
		node.funcRef.delete(fn);
		return node;
	},

	once(node, name, fn) {
		node.on(name, function tempF(e) {
			fn.bind(node)(e);
			node.off(name, tempF);
		});
		return node;
	},

	fire(node, name, detail = {}) {
		this.dispatchEvent(new CustomEvent(name, {detail}));
		return this;
	}
};
