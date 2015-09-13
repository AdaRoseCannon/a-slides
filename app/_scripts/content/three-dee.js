// This is an example of a no-op config
// it will behave like this if you do not
// define it at all.
/*global THREE*/
'use strict';
const MyThree = require('./lib/three');
let anim = 0;
let appendTarget;

module.exports = {
	setup() {
		appendTarget = make.div().css({
			width: '100%',
			height: '100%'
		});
	},
	action: function* () {

		this.appendChild(appendTarget);
		const three = new MyThree(appendTarget);

		requestAnimationFrame(function animate() {
			three.animate();
			anim = requestAnimationFrame(animate);
		});

		const grid = new THREE.GridHelper( 10, 1 );
		grid.setColors( 0xff0000, 0xffffff );
		three.scene.add( grid );
		yield;
	},
	teardown() {
		cancelAnimationFrame(anim);

		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
