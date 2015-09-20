/*global THREE*/

'use strict';
const MyThree = require('./lib/three');
const VerletWrapper = require('./lib/verletwrapper');
const textSprite = require('./lib/textSprite');
let anim = 0;
let appendTarget, renderTarget;

// Run the verlet physics
const verlet = new VerletWrapper();
verlet.init({
	size: {
		x: 10,
		y: 10,
		z: 10,
	},
	gravity: false
});

module.exports = {
	setup() {
		renderTarget = make.div().css({
			width: '50%',
			height: '100%',
			position: 'absolute',
			top: 0,
			left: 0
		});
		appendTarget = make.div().css({
			width: '50%',
			height: '100%',
			position: 'absolute',
			top: 0,
			left: '50%',
			padding: '1em',
			'font-size': '80%'
		});
	},
	action: function* () {

		this.appendChild(appendTarget);
		this.appendChild(renderTarget);
		const three = new MyThree(renderTarget);

		appendTarget.addMarkdown('`// Example Data Type`');

		const grid = new THREE.GridHelper( 5, 1 );
		grid.setColors( 0xff0000, 0xffffff );
		three.scene.add( grid );

		three.camera.position.z = -10;
			
		requestAnimationFrame(function animate() {
			verlet.getPoints().then(points => {
				three.updateObjects(points);
				three.animate();
			});
			anim = requestAnimationFrame(animate);
		});

		// Add a central point which will attract all the others
		verlet.addPoint({
			position: {x: 0, y: 4, z: 0},
			velocity: {x: 0, y: 0, z: 0},
			radius: 0,
			mass: 0,
			attraction: 0.002
		});

		yield;

		function makePoint() {
			return verlet.addPoint({
				position: {x: 8*Math.random() - 4, y: 8*Math.random() - 4, z: 8*Math.random() - 4},
				velocity: {x: 0, y: 0, z: 0},
				radius: 0.3,
				mass: 1
			})
			.then(p => p.point);
		}

		appendTarget.addMarkdown('`p1 = { x:0, y:0, z:0 }`');

		let p1;
		makePoint()
		.then(function (point) {
			const s = textSprite(1);
			three.connectPhysicsToThree(s, point);
			p1 = point;
		});

		yield;

		// Not accurate my pretty verlet thing will make them equalateral
		// Not right angle
		appendTarget.addMarkdown('`p2 = { x:3, y:0, z:0 }`');
		appendTarget.addMarkdown('`p3 = { x:0, y:3, z:0 }`');

		Promise.all([makePoint(), makePoint()])
		.then(function ([p2, p3]) {
			const options = {
				stiffness: 0.2,
				restingDistance: 3
			};
			const s2 = textSprite(2);
			const s3 = textSprite(3);
			three.connectPhysicsToThree(s2, p2);
			three.connectPhysicsToThree(s3, p3);
			verlet.connectPoints(p1, p2, options);
			verlet.connectPoints(p2, p3, options);
			verlet.connectPoints(p3, p1, options);
		});

		yield;

		// TODO: Add face
		appendTarget.addMarkdown('`face = [p1, p2, p3]`');

		yield;

		// TODO: Show Normals

		// Not accurate my pretty verlet thing will make them equalateral
		// Not right angle
		appendTarget.addMarkdown('`// The Normal is orthogonal to the face`');
		appendTarget.addMarkdown('`normal = { x:0, y:0, z:1 }`');
		yield;

		// TODO: Replace single face with model
		// Remove text
		// Show Model Skin
		// MATERIALS
		// remove wireframe
		// LIGHTS
		// Pan lights
		// FOG
		// Add Fog
	},
	teardown() {
		cancelAnimationFrame(anim);
		verlet.reset();
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
			renderTarget.removeSelf();
			renderTarget = undefined;
		}
	}
};
