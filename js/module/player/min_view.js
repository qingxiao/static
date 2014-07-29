define([ 'jquery', 'underscore', 'backbone', './model', './view' ], function($, _, Backbone, Model, PlayerView) {
	var View = PlayerView.extend({
		events : {
			"click" : "onClick"
		},
		initialize : function() {
			PlayerView.prototype.initialize.apply(this, arguments);
			this._$playbtn = this.$el; // overwrite
		},
		/*
		 * 声音不存在时的处理函数
		 */
		onSoundUnexist : function(soundId) {
			PlayerView.prototype.onSoundUnexist.apply(this, arguments);
			if (soundId != this._soundId)
				return false;
			var $el = this.$el;
			$el.find(".warning").html("该声音不存在").addClass("removed").removeAttr("href");
		},
		onClick : function() {
			var $el = this.$el;
			if ($el.is(".disabled"))
				return false;
			if ($el.is(".playBtn")) {
				this.play();
			} else if ($el.is(".pauseBtn")) {
				this.pause();
			}
		}
	});
	return View;
});