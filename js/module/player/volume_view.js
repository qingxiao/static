/*
 * 声音控制面板视图
 */
define([ 'jquery', 'underscore', 'backbone', './model', 'plugin/jquery.easydrag' ], function($, _, Backbone, Model) {
	var mainPlayer = Model.mainPlayer;
	/*
	 * 声音模块
	 */
	var View = Backbone.View.extend({
		_last_volume : 50,
		_barWidth : 32,
		_btnGap:3,
		_$volume : null,
		_$panel : null,
		_$bar : null,
		_$muteBtn : null,
		events : {
			"click .volumePanel_unmuteBtn" : "unmute",
			"click .volumePanel_muteBtn" : "mute",
			"click" : "volume"
		},
		initialize : function() {
			var $el = this.$el, _this = this;
			this._$volume = $el.find(".volumePanel_volume");
			this._$panel = $el;
			this._$bar = $el.find(".volumePanel_seekBtn");
			this._$muteBtn = $el.find(".volumePanel_muteBtn");

			this._$bar.easydrag(true, false);
			this._$bar.beforeDrag(function (e, element) {
				_this._$bar.bindEvent();
            });
			this._$bar.ondrag(function(e, element) {
				var $el = $(element), position = $el.position(), left = position.left - _this._btnGap;
				if (left <= 0) {
					left = 0;
				}
				if (left >= 26) {
					left = 26;
				}
				$el.css({
					"left" : left+3 + "px",
					"top" : "50%"
				});
				_this._$volume.width(left);
				mainPlayer.volume(parseInt(left * 100 / 26));
			});
			this._$bar.ondrop(function (e, element) {
                _this._$bar.unBindEvent();
            });

			this.render();
		},
		render : function() {
			var volume = mainPlayer.volume(), width = 26 * volume / 100, isOff = !volume;
			this._$volume.width(width);
			if (isOff) {
				this.$el.addClass("off");
				this._$bar.css({
					"left" : this._barWidth / 2 + "px"
				}).dragOff();
				this._$muteBtn.addClass("volumePanel_unmuteBtn").removeClass("volumePanel_muteBtn").attr("title", "静音");
			} else {
				this.$el.removeClass("off");
				this._$bar.css({
					"left" : width + 3 + "px",
					"top" : "50%"
				}).dragOn();
				this._$muteBtn.addClass("volumePanel_muteBtn").removeClass("volumePanel_unmuteBtn").attr("title", "静音");
			}
			this._$volume.show();
			this._$bar.show();
			$(".volumePanelBox").show();
		},
		unmute : function() {
			mainPlayer.volume(this._last_volume);
			this.render();
		},
		mute : function() {
			this._last_volume = mainPlayer.volume();
			mainPlayer.volume(0);
			this.render();
		},
		volume : function(e) {
			var $el = this.$el, 
				gap = 13,
				left = $el.offset().left, width = this._barWidth, x = e.clientX - left - gap, percent = x / width;
			if(x<0||x>32) return false;
			if (x <= 3) {
				percent = 0;
			}
			if (x >= 29) {
				percent = 1;
			}
			mainPlayer.volume(parseInt(percent * 100));
			this.render();
		}
	});

	return View;
});