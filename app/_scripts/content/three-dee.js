// This is an example of a no-op config
// it will behave like this if you do not
// define it at all.
/*global THREE*/
'use strict';
const MyThree = require('./lib/three');
const VerletWrapper = require('./lib/verletwrapper');
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

		const grid = new THREE.GridHelper( 5, 1 );
		grid.setColors( 0xff0000, 0xffffff );
		three.scene.add( grid );

		// Run the verlet physics
		const verlet = new VerletWrapper();

		three.camera.position.z = -10;

		verlet.init({
			x: 10,
			y: 10,
			z: 10,
		})
		.then(function setUpMarching() {
			
			requestAnimationFrame(function animate() {
				verlet.getPoints().then(points => {
					three.updateObjects(points);
					three.animate();
				});
				anim = requestAnimationFrame(animate);
			});

			let i = 0;
			setInterval(() => {

				if (i++ < 32) verlet.addPoint({
					position: {x: 0, y: 1, z: 0},
					velocity: {x: 0.4 * (Math.random() - 0.5), y: 0, z: 0.44 * (Math.random() - 0.5)},
					radius: 0.3 + Math.random()/10,
					mass: 1
				})
				.then(function ({point}) {
					const s = three.createSphere(point.radius);
					three.connectPhysicsToThree(s, point);
				});
			}, 500);

		});
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
