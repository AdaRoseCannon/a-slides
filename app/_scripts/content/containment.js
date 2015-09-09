let appendTarget;
const templates =  {
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

		appendTarget.addHTML(templates.modal);

		setTimeout(() => appendTarget.$('.modal').css({
			transform: 'scaleX(1)'
		}), 500);
		yield;

		appendTarget.empty().addMarkdown(templates.containment);
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
