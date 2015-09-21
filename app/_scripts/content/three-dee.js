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

		window.three = three;

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

		let p1, p2, p3;
		let s1, s2, s3;
		makePoint()
		.then(function (point) {
			s1 = textSprite(1);
			three.connectPhysicsToThree(s1, point);
			p1 = point;
		});

		yield;

		// Not accurate my pretty verlet thing will make them equalateral
		// Not right angle
		appendTarget.addMarkdown('`p2 = { x:3, y:0, z:0 }`');
		appendTarget.addMarkdown('`p3 = { x:0, y:3, z:0 }`');

		Promise.all([makePoint(), makePoint()])
		.then(function ([ip2, ip3]) {
			p2 = ip2;
			p3 = ip3;
			const options = {
				stiffness: 0.2,
				restingDistance: 3
			};
			s2 = textSprite(2);
			s3 = textSprite(3);
			three.connectPhysicsToThree(s2, p2);
			three.connectPhysicsToThree(s3, p3);
			verlet.connectPoints(p1, p2, options);
			verlet.connectPoints(p2, p3, options);
			verlet.connectPoints(p3, p1, options);
		});

		let v1 = new THREE.Vector3();
		let v2 = new THREE.Vector3();
		let v3 = new THREE.Vector3();

		// TODO: Add face
		appendTarget.addMarkdown('`face = [p1, p2, p3]`');

		const geometry = new THREE.Geometry();
		geometry.vertices.push(v1, v2, v3);
		geometry.faces.push(new THREE.Face3(0, 1, 2));
		geometry.computeBoundingSphere();
		geometry.computeFaceNormals();
		geometry.dynamic = true;

		const mesh = new THREE.Mesh(geometry, three.materials.boring);
		three.scene.add(mesh);

		const loader = new THREE.JSONLoader();
		const bMesh = new THREE.Mesh(
			loader.parse(require('../../models/bunny2.json').geometries[0].data).geometry,
			three.materials.wireframe
		);
		bMesh.scale.set(2,2,2);
		bMesh.rotation.set(-Math.PI/2,0,Math.PI);
		const edges = new THREE.FaceNormalsHelper(bMesh, 0.1, 0x00ff00, 1);

		const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
		directionalLight.position.set( 1, 1, 0 );
		three.scene.add( directionalLight );

		function myAnim() {
			three.scene.rotateY(0.02);
			v1.copy(s1.position);
			v2.copy(s2.position);
			v3.copy(s3.position);
			geometry.verticesNeedUpdate = true;
			geometry.normalsNeedUpdate = true;
			geometry.computeFaceNormals();
			geometry.computeBoundingSphere();
			edges.update();
		}

		three.on('prerender', myAnim);

		yield;


		three.off('prerender', myAnim);
		three.scene.rotation.y = 0;

		three.scene.remove(s1);
		three.scene.remove(s2);
		three.scene.remove(s3);
		three.scene.remove(mesh);

		three.scene.add(bMesh);

		yield;

		window.edges = edges;
		three.scene.add(edges);

		// Not accurate my pretty verlet thing will make them equalateral
		// Not right angle
		appendTarget.addMarkdown('`// The Normal is orthogonal to the face`');
		appendTarget.addMarkdown('`normal = { x:0, y:0, z:1 }`');
		yield;


		three.scene.remove(edges);
		three.on('prerender', function () {
			three.scene.rotateY(0.02);
		});

		yield;

		bMesh.material = three.materials.boring;
		yield;
		
		bMesh.material = three.materials.shiny;
		yield;

		bMesh.material = three.materials.boring;
		yield;

		directionalLight.position.set( -1, 1, 0 );
		yield;

		directionalLight.position.set( 0, 1, 1 );
		yield;

		directionalLight.position.set( 0, 1, -1 );
		yield;

		three.useFog();
		yield;
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
