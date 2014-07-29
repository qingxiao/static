/*
 * 评论
 */
define([ 'jquery', 'underscore', 'backbone', 'helper', 'model/sound', '../model', '../base', 'module/comment2d/view' ], function($, _, Backbone, helper, SoundModel, Model, View, Comment2dView) {
	var pro = View.prototype, proClone = _.clone(pro);
	_.extend(pro, {
		_$commentbar : null,// 二维评论条
		_comment2dView : null,// 二位评论视图
		initialize : function() {
			var $el = this.$el;
			proClone.initialize.apply(this, arguments);
			this._$commentbar = $el.find(".player_commentbar");
			this.createComment2dView();
		},
		/*
		 * 获取二维评论视图
		 */
		getComment2dView : function() {
			return this._comment2dView;
		},
		/*
		 * 判断是否有二维评论
		 */
		hasComment2d : function() {
			return !!this._comment2dView;
		},
		createComment2dView: function(){
			if (this._$commentbar.size()) {
				if(!this._$commentbar.eq(0).is(":hidden")){
					this._comment2dView = new Comment2dView({
						el : this._$commentbar[0]
					});					
				}
			}
		},
		getComment2dView: function(){
			if(!this._comment2dView){
				this.createComment2dView();
			}
			return this._comment2dView;
		},
		onSoundWhileplaying : function(sound, smSound){
			if(!proClone.onSoundWhileplaying.apply(this, arguments)) return false;
			if (this.hasComment2d()) {
				//var comment2d = Comment2D.getInstanceByContainer($commentbar);
				//comment2d.showPopAuto(smSound.position / 1000);
				if(!this._comment2dView.$el.is(":hidden")){		
					this._comment2dView.showPopAuto(smSound.position / 1000);
				}
			}
			return true;
		}
	});
	return View;
});