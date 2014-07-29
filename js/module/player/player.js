/*
 * 播放器
 */
define([ 'jquery', 'underscore', 'backbone', './volume_view', './view', './follower_view', './mainfollower_view', './min_view', 'module/wave', 'module/comment2d/comment2d', './model' ], function($, _, Backbone, VolumeView, View, FollowerView, MainFollowerView, MinView, wave, comment2d, Model) {
	// 声音面板视图
	var mainPlayer = Model.mainPlayer;
	var volumeView = null, $volume = $(".volumePanel");
	if ($volume.size()) {
		new VolumeView({
			el : $volume[0]
		});
	}
	var player = {
		volume : volumeView,// 声音面板视图
		views : [],// 除主视图以外的视图
		mainPlayer : null,// 主视图
		/*
		 * 渲染 @param options {Object} options.$container {Jquery} 渲染范围，尽量提供，可提高性能 options.waveRenderDelay {Boolean} 推迟渲染波形
		 */
		render : function(options) {
			var op = options || {}, $container = op.$container, waveRenderDelay = op.waveRenderDelay || false, $els;
			if ($container) {
				$els = $container.find("[sound_id]");
				if ($container.is("[sound_id]")) {
					$els = $container;
				}
			} else {
				$els = $("[sound_id]");
			}
			$els = $els.add(".grobalPlayer");
			for ( var i = 0, len = $els.size(); i < len; i++) {
				this.bindView($els.eq(i));
			}
			this.renderComment2dViews();
			if (!waveRenderDelay)
				wave.render(options);
		},
		init : function() {
			this.render();
		},
		/*
		 * 绑定视图
		 */
		bindView : function($view) {
			var viewE = $view[0], view = null;
			if (this.isBinded($view))
				return;
			$view.data("viewIsBinded", true);
			if ($view.is(".grobalPlayer")) {
				this.mainPlayer = new MainFollowerView({
					el : viewE
				});
			} else if ($view.is(".follower")) {
				view = new FollowerView({
					el : viewE
				});
			} else if ($view.is(".playBtn")) {
				view = new MinView({
					el : viewE
				});
			} else {
				view = new View({
					el : viewE
				});
			}
			if (view)
				this.views.push(view);
		},
		renderComment2dViews : function() {
			var comment2dViews = [], views = this.views, view;
			for ( var i = 0, len = views.length; i < len; i++) {
				view = views[i];
				if (view.hasComment2d())
					comment2dViews.push(view.getComment2dView());
			}
			comment2d.render(comment2dViews);
		},
		soundIds : function(soundIds) {
			mainPlayer.soundIds(soundIds);
		},
		appendSoundIds : function(soundIds) {
			var ids = mainPlayer.soundIds();
			for ( var i = 0, len = soundIds.length; i < len; i++) {
				ids.push(soundIds[i]);
			}
		},
		/*
		 * 检测某一个容器是否已经绑定视图
		 */
		isBinded : function($view) {
			return $view.data("viewIsBinded");
		},
		removeSound : function(soundId) {
			mainPlayer.removeSoundId(soundId);
		},
		/*
		 * 释放指定容器内的视图 options.$container {jquery} 指定容器
		 */
		release : function(options) {
			var viewsNeedRelease = [], op = options || {}, $container = op.$container;
			if ($container !== undefined) {
				for ( var i = 0, len = this.views.length; i < len; i++) {
					var view = this.views[i], $view = view.$el;
					if ($container.find($view).size()) {
						viewsNeedRelease.push(view);
					}
				}
			} else {
				viewsNeedRelease = this.views;
			}
			for (i = 0, len = viewsNeedRelease.length; i < len; i++) {
				view = viewsNeedRelease[i];
				view.release();
			}
			if ($container !== undefined) {
				this.views = _.difference(this.views, viewsNeedRelease);
			} else {
				this.views = [];
			}
		}
	};
	return player;
});