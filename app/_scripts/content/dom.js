let appendTarget;
const content = {
	squidge: `<center><div class="squidge"><p>
		<div class="emoji-image-container bad-anim-div bad2">🌝</div><div class="emoji-image-container">🍄</div>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, Quisque pellentesqu'e malesuada ex, ut malesuada nunc elementum tincidunt. Cras pulvinar consectetur odio non pellentesque. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec quis ullamcorper mi. Pellentesque justo eros, consequat at efficitur vitae, tristique at dolor. Etiam posuere sapien urna, a egestas eros tincidunt non. Quisque blandit, lorem vulputate efficitur tempus, enim massa sodales metus, sit amet molestie risus libero aliquam eros. Praesent libero erat, euismod efficitur finibus vel, tristique eu massa. Nullam fermentum scelerisque diam ut varius. Phasellus mi purus, facilisis non tincidunt sed, luctus ut ante. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
		</p><p>
		Suspendisse hendrerit malesuada mi. Quisque elementum quis augue fringilla efficitur. Suspendisse potenti. Ut non sapien placerat erat luctus efficitur. Integer sit amet lorem vel libero tincidunt consectetur eget sit amet risus. Quisque rutrum quis erat nec efficitur. Donec id sem dignissim, gravida felis in, dapibus est.
		</p>
		<div class="emoji-image-container bad-anim-div">🌝</div>
		<p>
				Pellentesque euismod facilisis dui. Cras dictum leo non metus faucibus, at lacinia erat euismod. Nunc sed facilisis dui. Ut pellentesque, dolor pretium rhoncus varius, sapien dolor volutpat elit, at porttitor risus mauris semper tellus. Ut pulvinar arcu urna, id tincidunt tellus convallis sollicitudin. Praesent non nisi nisl. Vestibulum lacinia ligula nisi, sit amet mattis lectus sagittis sit amet. Etiam a erat rutrum, cursus magna at, mattis orci. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nunc vitae risus odio. Donec egestas feugiat ex, lobortis aliquet leo tempus sed. Nulla pellentesque nisi vel neque lobortis, in cursus felis pretium.
		</p><p>
				Aliquam felis tortor, efficitur id quam aliquet, mollis molestie est. Curabitur sed eros sodales, gravida ante et, pretium nisl. Nunc pellentesque arcu ut tristique sodales. Praesent varius pharetra dolor vitae laoreet. Donec tincidunt velit nec libero lobortis, non eleifend nunc finibus. Donec pellentesque dui scelerisque enim convallis aliquam. Pellentesque pharetra sed ligula vel maximus. Aenean eget luctus enim, a ullamcorper justo. Nulla et elementum ante, tempor dictum neque. Vivamus imperdiet imperdiet mi. Nunc sed nulla nec urna sodales finibus sed eget tortor. Aenean euismod diam mauris, eu eleifend enim auctor eu. In sit amet facilisis dolor, et commodo nisi. Aliquam quis lobortis diam. Pellentesque tristique vehicula nisl, id dignissim justo auctor vel.
		</p><p>
				Curabitur ut ultricies sapien, vel tempor nisl. Etiam pretium in ipsum eu eleifend. Morbi sodales quis nisl eu dapibus. Cras elementum interdum ligula nec viverra. Donec maximus rutrum elit, ut elementum dolor tincidunt eu. In molestie ac nulla vel mollis. Praesent rhoncus turpis lorem, vitae interdum dolor congue non. Ut congue commodo mi pellentesque luctus. In at nulla tempus, condimentum ante in, rutrum felis. Curabitur a dictum lectus. Vivamus quis urna ut est sagittis gravida. Etiam pretium auctor magna at egestas.
		</p></div></center>
	`
};
let t;

// In this context this refers to the DOM element
// which is displayed as the slideshow.
module.exports = {
	setup() {
		appendTarget = make.div();
	},
	action: function* () {
		this.appendChild(appendTarget);

		var i = 0;
		var pre = document.createElement('pre');
		appendTarget.empty().appendChild(pre);
		t = setInterval(() => {
			pre.addHTML(i++ % 2 === 1 ? 'myVar = el.clientHeight;\n' : 'el.height = (myVar + 1) + "px"\n');
		}, 800);
		yield;


		clearInterval(t);
		pre.innerHTML = '';
		t = setInterval(() => {
			pre.addHTML('myDomEl.innerHTML += "I know a song which\'ll get on your nerves...";\n');
		}, 800);
		yield;

		clearInterval(t);
		appendTarget.innerHTML = '<img src="images/fastdom.png" />';
		yield;

		appendTarget.innerHTML = `
			<div class="fastdom-container unsorted">
				<div class="fastdom read" style="order: 1;"><pre>readFunc1()</pre></div>
				<div class="fastdom write" style="order: 2;"><pre>writeFunc1()</pre></div>
				<div class="fastdom read" style="order: 1;"><pre>readFunc2()</pre></div>
				<div class="fastdom write" style="order: 2;"><pre>writeFunc2()</pre></div>
				<div class="fastdom read" style="order: 1;"><pre>readFunc3()</pre></div>
				<div class="fastdom write" style="order: 2;"><pre>writeFunc3()</pre></div>
				<div class="fastdom read" style="order: 1;"><pre>readFunc4()</pre></div>
				<div class="fastdom write" style="order: 2;"><pre>writeFunc4()</pre></div>
			</div>
		`;

		const m = new Map();
		appendTarget.$$('.fastdom').forEach(el => m.set(el, el.getBoundingClientRect()));

		appendTarget.$('.fastdom-container').classList.remove('unsorted');

		const scale = $('.slide-container.presentation') ? 1 : 0.4;

		m.forEach((rect1, el) => {
			const rect2 = el.getBoundingClientRect();
			el.style.transform = `translate(${(rect1.left - rect2.left)/scale}px, ${(rect1.top - rect2.top)/scale}px)`;
		});

		yield;

		m.forEach((rect1, el) => el.css({
			transform: `scale(1)`,
			transition: `transform 2s ease`
		}));
		yield;

		appendTarget.innerHTML = content.squidge;
		yield;

		appendTarget.innerHTML = `<div class="fancy">Lorem Ipsum is simply dummy text of the printing and 
								typesetting industry. Lorem Ipsum has been the industry's standard 
								dummy text ever since the 1500s, Quisque pellentesqu'e malesu
								ada ex,
								 ut malesuada nunc elementum tincidunt. Cras pulvinar consectetur 
								 odio non pellentesque. Vestibulum ante ipsum primis in 
								 faucibus orci luctus et ultrices posuere cubilia Curae; Donec quis
								  ullamcorper mi. Pellentesque justo eros, consequat at efficitur vitae
								  , tristique at dolor. Etiam posuere sapien urna, a egestas eros tincidunt non.
								</div>`;
		yield;

		appendTarget.innerHTML = '<div class="pretty1">🌝</div>' + 
								'<div class="pretty2">🌝</div>' + 
								'<div class="pretty3">🌝</div>' + 
								'<div class="pretty4">🌝</div>' + 
								'<div class="pretty5">🌝</div>' + 
								'<div class="pretty6">🌝</div>' + 
								'<div class="pretty7">🌝</div>' + 
								'<div class="pretty8">🌝</div>' + 
								'<div class="pretty9">🌝</div>';
		yield;

	},
	teardown() {

		clearInterval(t);
		if (appendTarget) {
			appendTarget.removeSelf();
			appendTarget = undefined;
		}
	}
};
