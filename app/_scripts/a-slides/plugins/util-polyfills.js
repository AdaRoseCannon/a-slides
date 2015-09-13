/**
 * Polyfill some utility functions.
 */

const marked = require('marked');

window.$ = expr => document.querySelector(expr);
window.$$ = expr => [...document.querySelectorAll(expr)];

Node.prototype.$ = function(expr) { return this.querySelector(expr) ;};
Node.prototype.$$ = function(expr) { return [...this.querySelectorAll(expr)] ;};

Node.prototype.on = window.on = function (name, fn) {
	if (!this.funcRef) this.funcRef = new Set();

	// Store it for later
	this.funcRef.add(fn);
	this.addEventListener(name, fn);
	return this;
};

Node.prototype.prevAll = function () {
	const nodes = [...this.parentNode.children];
	const pos = nodes.indexOf(this);
	return nodes.slice(0, pos);
};

Node.prototype.off = window.off = function (name, fn) {
	if (!this.funcRef) return;
	if (fn) {
		this.removeEventListener(name, fn);
	} else {
		this.funcRef.forEach(fn => this.removeEventListener(name, fn));
	}
	this.funcRef.delete(fn);
	return this;
};

Node.prototype.once = window.once = function (name, fn) {
	this.on(name, function tempF(e) {
		fn.bind(this)(e);
		this.off(name, tempF);
	});
	return this;
};

Node.prototype.removeSelf = function () {
	this.parentNode.removeChild(this);
	return this;
};

Node.prototype.addMarkdown = function (...str) {
	this.appendChild(make.markdown(str.join('\n')));
	return this;
};

Node.prototype.addHTML = function (...str) {
	this.appendChild(
		document
			.createRange()
			.createContextualFragment(
				str.join('\n')
			)
	);
	return this;
};

Node.prototype.empty = function () {
	while(this.firstChild) this.removeChild(this.firstChild);
	return this;
};

Node.prototype.css = function (props) {
	function units(prop, i) {
		if (typeof i === "number") {
			if (prop.match(/width|height|top|left|right|bottom/)) {
				return i + "px";
			}
		}
		return i;
	}
	for (let n in props) {
		this.style[n] = units(n, props[n]);
	}
	return this;
};

Node.prototype.fire = function (name, detail = {}) {
	this.dispatchEvent(new CustomEvent(name, {detail}));
	return this;
};

const make = {};
make.div = () => document.createElement('div');
make.br = () => document.createElement('br');
make.p = () => document.createElement('p');
make.text = text => document.createTextNode(text);
make.markdown = text => document.createRange().createContextualFragment(marked(text));
make.html = html => document.createRange().createContextualFragment(html);

window.make = make;
