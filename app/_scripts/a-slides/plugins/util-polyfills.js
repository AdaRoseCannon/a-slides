/**
 * Polyfill some utility functions.
 */

const marked = require('marked');

window.$ = expr => document.querySelector(expr);
window.$$ = expr => [...document.querySelectorAll(expr)];

Node.prototype.$ = function(expr) { return this.querySelector(expr) ;};
Node.prototype.$$ = function(expr) { return [...this.querySelectorAll(expr)] ;};

Node.prototype.on = window.on = function (name, fn) {
	if (!this.funcRef) this.funcRef = new Map();

	// Make a new function and store it for later
	this.funcRef.set(fn, fn.bind(this));
	this.addEventListener(name, this.funcRef.get(fn));
};

Node.prototype.prevAll = function () {
	const nodes = [...this.parentNode.children];
	const pos = nodes.indexOf(this);
	return nodes.slice(0, pos);
};

Node.prototype.off = window.on = function (name, fn) {
	if (!this.funcRef) return;
	if (fn) {
		this.removeEventListener(name, fn ? this.funcRef.get(fn) : undefined);
	} else {
		this.funcRef.forEach(fn => this.removeEventListener(name, fn));
	}
	this.funcRef.delete(fn);
};

Node.prototype.once = window.once = function (name, fn) {
	if (!this.funcRef) this.funcRef = new Map();
	this.on(name, function tempF() {
		fn.bind(this)();
		this.off(name, tempF);
	});
};

Node.prototype.removeSelf = function () {
	this.parentNode.removeChild(this);
};

Node.prototype.fire = function (name, detail = {}) {
	this.dispatchEvent(new CustomEvent(name, detail));
};

const make = {};
make.div = () => document.createElement('div');
make.br = () => document.createElement('br');
make.p = () => document.createElement('p');
make.text = text => document.createTextNode(text);
make.markdown = text => document.createRange().createContextualFragment(marked(text));

window.make = make;
