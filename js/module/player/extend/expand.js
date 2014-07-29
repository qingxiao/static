/*
 * 分享
 */
define([ 'jquery', 'underscore', 'backbone', 'helper', '../model', '../base', 'module/wave', 'module/comment2d/comment2d'], function($, _, Backbone, helper, Model, View, wave, comment2d) {
	var mainPlayer = Model.mainPlayer;
	var playState = Model.playState;
	var pro = View.prototype, proClone = _.clone(pro);
	_.extend(pro, {
		_$expandBox : null,//展开的容器
		_$unexpandBox : null,//收起的容器
		initialize : function() {
			var $el = this.$el;
			this._$expandBox = $el.find(".sound_expandBox");
			this._$unexpandBox = $el.find(".sound_unexpandBox");
			proClone.initialize.apply(this, arguments);
		},
		events : _.extend({
			"click .smallPlayer" : "smallPlayerClick"
		}, proClone.events),
		smallPlayerClick: function(e){
			if(!$(e.target).parents(".pin").size()){
				if(this._$expandBox.find(".playBtn").size()){
					this.play();
				}
			}
		},
		onSoundUnexist: function(){
			if(!proClone.onSoundUnexist.apply(this, arguments)) return false;
			var smallPlayer = this._$unexpandBox.find(".smallPlayer");
			if(this._$unexpandBox.size()&&!smallPlayer.find(".smallPlayer_errmsg").size()){
				smallPlayer.addClass("disabled");
				smallPlayer.append('<div class="disabled smallPlayer_errmsg">该声音不存在</div>');
				this._$unexpandBox.find(".smallPlayer").removeClass("player-loading");
			}
			return true;
		},
		onSoundPast: function(){
			if(!proClone.onSoundPast.apply(this, arguments)) return false;
			if(this._$unexpandBox){
				this._$unexpandBox.find(".smallPlayer").removeClass("player-loading");			
			}
			return true;
		},
		rendPlaybtn: function(){
			if(!proClone.rendPlaybtn.apply(this, arguments)) return false;
			var _playState = mainPlayer.playState();
			if (playState.PLAYING == _playState) {
				this.expand();
			}
			if(this._$unexpandBox){
				this._$unexpandBox.find(".smallPlayer").toggleClass("player-loading", playState.BUFFERING == _playState);				
			}
		},
		play: function(){
			if(this._$unexpandBox){
				this._$unexpandBox.find(".smallPlayer").addClass("player-loading");			
			}
			return proClone.play.apply(this, arguments);
		},
		pause: function(){
			if(this._$unexpandBox){
				this._$unexpandBox.find(".smallPlayer").removeClass("player-loading");			
			}
			return proClone.pause.apply(this, arguments);
		},
		expand : function() {
			var _this = this;
			if(this.$el.is(".disabled")) return;
			if(this._$expandBox && !this._$expandBox.size()) return;
			if(this._$expandBox.is(":hidden")){
				this._$expandBox.show();
				this._$unexpandBox.hide();
				this._$expandBox.find(".middlePlayer").css("opacity",0.1).animate({
					"opacity":1
				},400);				
				wave.render({$container: _this.$el});
				this.createComment2dView();
				comment2d.render([this.getComment2dView()]);
				this.$el.trigger("onExpand");
			}
		}
	});
	return View;
});