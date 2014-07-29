/*
 * 主播放器
 */
define([ 'jquery', 'underscore', 'backbone', './model', './follower_view', 'helper' ], function($, _, Backbone, Model, PlayerView, helper) {
	var mainPlayer = Model.mainPlayer;

	var View = PlayerView.extend({
		events : _.extend({
			"click .prevBtn:not(.disabled)" : "prev",
			"click .nextBtn:not(.disabled)" : "next",
			"click .orderplayBtn" : "clickOrderPlayBtn",
			"click .randomplayBtn" : "clickRandomPlayBtn",
			"click .loopplayBtn" : "clickLoopPlayBtn"
		}, PlayerView.prototype.events),
		initialize : function() {
			PlayerView.prototype.initialize.apply(this, arguments);
			this._$playModelbtn = this.$el.find(".j-player_model");
			mainPlayer.on("change:sound", function(model, sound) {
				this.renderBtns();
				this.$el.show();
			}, this);
			mainPlayer.on("change:soundIds", this.renderBtns, this);
		},
		/*
		 * 上一首
		 */
		prev : function() {
			mainPlayer.prev();
		},
		/*
		 * 下一首
		 */
		next : function() {
			mainPlayer.next();
		},
		/*
		 * overwrite 播放
		 */
		play : function() {
			mainPlayer.play();
		},
		/*
		 * 判断是否需要渲染视图
		 */
		needRender : function() {
			return true;
		},
		clickOrderPlayBtn : function(){
			this._$playModelbtn.addClass("loopplayBtn").removeClass("orderplayBtn").removeClass("randomplayBtn").attr("title","单曲循环");
			this.loopPlay();
		},
		clickRandomPlayBtn : function(){
			this._$playModelbtn.addClass("orderplayBtn").removeClass("loopplayBtn").removeClass("randomplayBtn").attr("title","顺序播放");
			this.orderPlay();
		},
		clickLoopPlayBtn : function(){
			this._$playModelbtn.addClass("randomplayBtn").removeClass("orderplayBtn").removeClass("loopplayBtn").attr("title","随机播放");
			this.randomPlay();
		},
		orderPlay : function(){
			mainPlayer.orderPlay();
		},
		randomPlay : function(){
			mainPlayer.randomPlay();
		},
		loopPlay : function(){
			mainPlayer.loopPlay();
		},
		/*
		 * 渲染视图
		 */
		render : function(model, sound) {
			PlayerView.prototype.render.apply(this, arguments);
			var $el = this.$el;
			if (sound && sound.id) {
				var cutedTitle = helper.cutString(sound.title, 30);
				$el.find(".title").text(cutedTitle).attr("href", (helper.isLogin() ? "/#/" : "/") + sound.uid + "/sound/" + sound.id + "/").attr("title", sound.title);
				if ($el.is(":hidden")) {
					$el.fadeIn(200);
					$el.trigger("onfirstshow");
					$(".volumePanelBox").show();
				}
			}
		},
		/*
		 * 渲染上一首，下一首，播发的状态
		 */
		renderBtns : function() {
			var $el = this.$el, $prebtn = $el.find(".prevBtn"), $nextbtn = $el.find(".nextBtn"), $playbtn = this._$playbtn;
			if (!mainPlayer.preable()) {
				$prebtn.addClass("is-btn-disabled").attr("title", "");
			} else {
				$prebtn.removeClass("is-btn-disabled").attr("title", "上一首");
			}
			if (!mainPlayer.nextable()) {
				$nextbtn.addClass("is-btn-disabled").attr("title", "");
			} else {
				$nextbtn.removeClass("is-btn-disabled").attr("title", "下一首");
			}
			if (!mainPlayer.playable()) {
				$playbtn.addClass("is-btn-disabled").attr("title", "");
			} else {
				$playbtn.removeClass("is-btn-disabled").attr("title", "播放");
			}
		}
	});
	return View;
});