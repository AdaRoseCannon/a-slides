// Returns a config for a et of images

'use strict';
module.exports = function (...slides) {
	let appendTarget;

	return {
		setup() {
			appendTarget = make.div().css({
				width: '100%',
				height: '100%'
			});
		},
		action: function* () {

			const t = slides.slice();

			this.appendChild(appendTarget);

			while(t.length) {
				let i = t.shift();
				appendTarget.innerHTML = !i ? '' : `<img src="${i}" style="object-fit: contain; width: 100%; height: 100%;" />`;
				yield;
			}

			yield;
		},
		teardown() {

			if (appendTarget) {
				appendTarget.removeSelf();
				appendTarget = undefined;
			}
		}
	};
};
