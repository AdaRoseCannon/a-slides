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

function MyVerlet(options) {

	class VerletThreePoint {
		constructor({
			position,
			radius,
			mass,
			attraction,
			velocity,
			meta
		}) {
			this.radius = radius;
			this.mass = mass;
			this.attraction = attraction;
			this.meta = meta || {};

			this.verletPoint = new Point3D({
				position: [ position.x, position.y, position.z ],
				mass,
				radius,
				attraction
			}).addForce([ velocity.x, velocity.y, velocity.z ]);
		}
	}

	this.points = [];
	this.constraints = new Set();

	this.addPoint = options => {
		const p = new VerletThreePoint(options);
		p.id = this.points.push(p);

		// if a point is attractive add a pulling force
		this.points.forEach(p0 => {
			if (p.attraction || p0.attraction && p !== p0) {
				this.connect(p, p0, {
					stiffness: (p.attraction || 0) + (p0.attraction || 0),
					restingDistance: p.radius + p0.radius
				});
			}
		});

		return p;
	};

	this.connect = (p1, p2, options) => {
		if (!options) options = {
			stiffness: 0.05,
			restingDistance: p1.radius + p2.radius
		};

		const c = new Constraint3D([p1.verletPoint, p2.verletPoint], options);
		this.constraints.add(c);
		return c;
	};

	this.size = options.size;

	this.world = new World3D({ 
		gravity: options.gravity ? [0, -9.8, 0] : undefined,
		min: [-this.size.x/2, 0, -this.size.z/2],
		max: [this.size.x/2, this.size.y, this.size.z/2],
		friction: 0.98
	});

	let oldT = 0;

	this.animate = function animate() {
		const t = Date.now();
		const dT = Math.min(0.032, (t - oldT) / 1000);
		const vP = this.points.map(p => p.verletPoint);

		this.constraints.forEach(c => c.solve());

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
					verlet = new MyVerlet(event.data.options);
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

				case 'reset':
					verlet.points.splice(0);
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

