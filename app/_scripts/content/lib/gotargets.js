'use strict';
const textSprite = require('./textSprite');
const EventEmitter = require('fast-event-emitter');
const util = require('util');

/*global THREE*/

module.exports = function GoTargetConfig(three, goTargetsConfig) {

	function GoTarget(id, config, node) {

		EventEmitter.call(this);
		this.id = id;
		node.name = id + '_anchor';

		if (config.sprite) {
			const map = THREE.ImageUtils.loadTexture( "images/" + config.sprite );
			const material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: false, transparent: true } );
			const reticuleSprite = new THREE.Sprite(material);

			node.add(reticuleSprite);
			reticuleSprite.scale.set(node.scale.x, node.scale.y, node.scale.z);
			reticuleSprite.name = id;
			this.sprite = reticuleSprite;
		}

		if (config.text) {
			this.textSprite = textSprite(config.text, {
				fontsize: 18,
				fontface: 'Iceland',
				borderThickness: 20
			});
			this.textSprite.visible = false;
			node.add(this.textSprite);
		}

		this.position = node.position;
		this._anchor = node;
		this.hasHover = false;

		this.on('hover', () => {
			this.hasHover = true;
			if (this.textSprite) {
				this.textSprite.visible = true;
			}
		});

		this.on('hoverOut', () => {
			this.hasHover = false;
			if (this.textSprite) {
				this.textSprite.visible = false;
			}
		});

		this.hide = () =>{
			this.sprite.visible = false;
		};

		this.show = () =>{
			this.sprite.visible = true;
		};
	}
	util.inherits(GoTarget, EventEmitter);

	this.targets = {};

	three.on('prerender', () => {
		const raycaster = new THREE.Raycaster();
		raycaster.setFromCamera(new THREE.Vector2(0,0), three.camera);
		const hits = raycaster.intersectObjects(
			this.getTargets()
			.map(target => target.sprite)
			.filter(sprite => sprite.visible)
		);

		let target = false;

		if (hits.length) {

			// Show hidden text sprite child
			target = this.getTarget(hits[0].object.name);
			if (target) target.emit('hover');
		}

		// if it is not the one just marked for highlight
		// and it used to be highlighted un highlight it.
		Object.keys(this.targets)
		.map(key => this.targets[key])
		.filter(eachTarget => eachTarget !== target)
		.forEach(eachNotHit => {
			if (eachNotHit.hasHover) eachNotHit.emit('hoverOut');
		});
	});

	const interact = (event) => {
		this.getTargets()
		.forEach(target => {
			if (target.hasHover) {
				target.emit(event.type);
			}
		});
	};

	three.domElement.addEventListener('click', interact);
	three.domElement.addEventListener('mousedown', interact);
	three.domElement.addEventListener('mouseup', interact);
	three.domElement.addEventListener('touchup', interact);
	three.domElement.addEventListener('touchdown', interact);
	three.deviceOrientationController
	.addEventListener('userinteractionend', function () {
		interact({type: 'click'});
	});

	this.getTarget = (id) => {
		return this.targets[id];
	};

	this.collectGoTargets = (root) => {
		if (root.children) {
			root.children.forEach(node => {
				if (node.name.match(/^gotarget\d+$/i)) {
					const id = node.name;
					if (!goTargetsConfig[id]) throw('No Config For ' + id);
					this.targets[id] = new GoTarget(id, goTargetsConfig[id], node);
				} else {
					this.collectGoTargets(node);
				}
			});
		}
		return this;
	};

	this.getTargets = () => Object.keys(this.targets).map(k => this.targets[k]);
};
