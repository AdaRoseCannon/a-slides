module.exports = {
	"slide-1": [
		`<img src="images/jank-profile.png" />`,
		`
## Slow 🐢
* Layout
* Paint

## Fast 🐰
* Composite
		`,
		`
## Great Resource:
### Paul Lewis's CSS Triggers
![](images/css-triggers.png)
# http://csstriggers.com/
		`,
	],
	"slide-2": [
		`<center><div class="squidge"><p>
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
		`,
		`
# FastDom
### Library to allow DOM operations to be done asynchronosly in read/write batches to avoid layout thrashing
		`
	],
	"slide-3" : {
		demoApp: `
			<div class="panel panel-primary pretend-web-app">
				<div class="panel-heading">My Web App</div>
				<div class="panel-body">
					<div class="panel panel-default">
						<div class="panel-body">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
						</div>
					</div>
					<div class="panel panel-success">
						<div class="panel-heading">Notifications</div>
						<div class="panel-body notifications-go-here">
						</div>
					</div>
					<div class="panel panel-default">
						<div class="panel-heading">Widget 2.</div>
						<div class="panel-body">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
						</div>
					</div>
					<div class="panel panel-default">
						<div class="panel-heading">Widget 3.</div>
						<div class="panel-body">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
						</div>
					</div>
				</div>
			</div>`,
		notification:
			`<div class="alert alert-dismissable alert-warning">
				<button type="button" class="close" data-dismiss="alert">×</button>Server Room On Fire
			</div>`
	},
	"slide-4": {
		modal: `
			<div class="modal fade">
				<div class="modal-dialog">
					<div class="modal-content">
						<div class="modal-header">
							<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
							<legend>My Modal</legend>
						</div>
						<div class="modal-body form">
							<div class="emoji-image-container bad-anim-div">🌝</div>
							<p>Pellentesque euismod facilisis dui. Cras dictum leo non metus faucibus, at lacinia erat euismod. Nunc sed facilisis dui. Ut pellentesque, dolor pretium rhoncus varius, sapien dolor volutpat elit, at porttitor risus mauris semper tellus. Ut pulvinar arcu urna, id tincidunt tellus convallis sollicitudin. Praesent non nisi nisl. Vestibulum lacinia ligula nisi, sit amet mattis lectus sagittis sit amet. Etiam a erat rutrum, cursus magna at, mattis orci. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nunc vitae risus odio. Donec egestas feugiat ex, lobortis aliquet leo tempus sed. Nulla pellentesque nisi vel neque lobortis, in cursus felis pretium.</p>
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
						</div>
					</div>
				</div>
			</div>
			<div class="panel panel-primary pretend-web-app-with-modal">
				<div class="panel-heading">My Web App</div>
				<div class="panel-body">
					<div class="workspace container-fluid">
						<div class="row">
							<div class="col-sm-6">
								<div class="panel panel-default">
									<div class="panel-body">
										Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
									</div>
								</div>
							</div>
							<div class="col-sm-6">
								<div class="panel panel-default">
									<div class="panel-body">
										Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
									</div>
								</div>
							</div>
						</div>
						<div class="panel panel-success">
							<div class="panel-heading">Notifications</div>
							<div class="panel-body notifications-go-here">
							</div>
						</div>
						<div class="panel panel-default">
							<div class="panel-heading">Widget 2.</div>
							<div class="panel-body">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
							</div>
						</div>
						<div class="panel panel-default">
							<div class="panel-heading">Widget 3.</div>
							<div class="panel-body">
								Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam interdum lectus a nunc ullamcorper dignissim. Sed ac magna non magna fringilla rutrum sit amet ullamcorper mauris.
							</div>
						</div>
					</div>
				</div>
			</div>`,
		containment: `
        {
            height: \<fixed value\>;
            width: \<fixed value or a %\>;
            overflow: hidden;
            position: absolute;
            contain: strict; // ✨ In draft ✨
        }`
	}
};