/*jshint worker:true*/
'use strict';

const World3D = require('verlet-system/3d');
const Constraint3D = require('verlet-constraint/3d'); 
const Point3D = require('verlet-point/3d');
const timeFactor = 1;
const vec3 = {
    create: require('gl-vec3/create'),
    add: require('gl-vec3/add'),
    // dot: require('gl-vec3/dot'),
    subtract: require('gl-vec3/subtract'),
    scale: require('gl-vec3/scale'),
    distance: require('gl-vec3/distance'),
    length: require('gl-vec3/length')
};

const p3DPrototype = (new Point3D()).constructor.prototype;
p3DPrototype.intersects = function (p) { return vec3.distance(this.position, p.position) <= this.radius + p.radius; };
p3DPrototype.distanceFrom = function (p) { return vec3.distance(this.position, p.position); };

function MyVerlet(size) {

	class VerletThreePoint {
		constructor({
			position,
			radius,
			mass,
			charge,
			velocity,
			meta
		}) {
			this.radius = radius;
			this.mass = mass;
			this.charge = charge;
			this.meta = meta || {};

			this.verletPoint = new Point3D({
				position: [ position.x, position.y, position.z ],
				mass,
				radius,
				charge
			}).addForce([ velocity.x, velocity.y, velocity.z ]);
		}
	}

	this.points = [];
	this.constraints = new Set();

	this.addPoint = options => {
		const p = new VerletThreePoint(options);
		p.id = this.points.push(p);
		return p;
	};

	this.connect = (p1, p2, options) => {
		if (!options) options = {
			stiffness: 0.05,
			restingDistance: p1.radius + p2.radius
		};

		const c = new Constraint3D([p1, p2], options);
		return c;
	};

	this.size = size;

	this.world = new World3D({ 
		gravity: [0, -9.8, 0],
		min: [-this.size.x/2, 0, -this.size.z/2],
		max: [this.size.x/2, this.size.y, this.size.z/2],
		friction: 0.98
	});

	let oldT = 0;

	this.animate = function animate() {
		const t = Date.now();
		const dT = Math.min(0.032, (t - oldT) / 1000);
		const vP = this.points.map(p => p.verletPoint);
		const l = vP.length;

		this.constraints.forEach(c => c.solve());

		// Perform collisions super simple and naive
		const tempVec = vec3.create([0, 0, 0]);
		for (let i = 0; i < l; i++) {
			for (let j=0; j<i; j++) {
				let p1 = vP[i], p2 = vP[j];

				if (p1.intersects(p2)) {
					vec3.subtract(tempVec, p1.position, p2.position);
					vec3.scale(tempVec, tempVec, 0.1*vec3.distance(p1.position, p2.position)/Math.pow(vec3.length(tempVec), 2));

					vec3.add(p1.position, p1.position, tempVec);
					vec3.subtract(p2.position, p2.position, tempVec);
				}
			}
		}

		this.world.integrate(vP, dT * timeFactor);
		oldT = t;
	};

}


let verlet;

// Recieve messages from the client and reply back onthe same port
self.addEventListener('message', function(event) {
		Promise.resolve()
		.then(function () {

			switch(event.data.action) {
				case 'init':
					verlet = new MyVerlet(event.data.size);
					// setInterval(verlet.animate.bind(verlet), 16);
					return;

				case 'getPoints':
					verlet.animate();
					event.data.points = verlet.points.map(p => ({
						radius: p.radius,
						position: {
							x: p.verletPoint.position[0],
							y: p.verletPoint.position[1],
							z: p.verletPoint.position[2]
						},
						meta: p.meta,
						id: p.id
					}));
					return;

				case 'addPoint':
					event.data.point = verlet.addPoint(event.data.pointOptions);
					return;

				default:
					throw Error('Invalid Action');
			}
		})
		.then(function () {
			event.data.success = true;
		}, function (err) {
			console.log(err);
			event.data.success = false;
			if (err) {
				event.data.message = err.message ? err.message : err;
			}
		})
		.then(function () {
			event.ports[0].postMessage(event.data);
		});
});

