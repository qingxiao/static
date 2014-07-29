/*
 * 声音详情
 */
define([ 'jquery', 'underscore', 'backbone', 'helper', '../model', '../base' ], function($, _, Backbone, helper, Model, View) {
	var mainPlayer = Model.mainPlayer;
    var info_template = _.template(['<div class="line"></div>',
	        	                    '<div class="infobox-content">',
	        	                    '<%if(soundfaceMiddle.indexOf("/css/")==-1){%>',
	        	                    '<img style="cursor: pointer;" popsrc="<%=coverUrl%>" alt="简介" src="<%= soundfaceMiddle?(soundfaceMiddle):(config.STATIC_ROOT+\'/css/img/common/track_180.jpg\')%>">',
	        	                    '<%}else{%>',
	        	                    '<img src="<%= soundfaceMiddle?(soundfaceMiddle):(config.STATIC_ROOT+\'/css/img/common/track_180.jpg\')%>">',
	        	                    '<%}%>',
	        	                    '<%if(info){%>',
	        	                    '<p><%=info%><%if(haveMoreIntro){%>...  (<a class="c2" href="<%=(helper.isLogin()?"/#/":"/") + uid + "/sound/" + id+"/"%>">更多</a>)<%}%></p>',
	        	                    '<%}%>',
	        	                    '</div>'].join(''));
	var pro = View.prototype, proClone = _.clone(pro);

	_.extend(pro, {
		_$playCount: null,//播放次数容器
		_$info : null,// 请求声音详情按钮
		events : _.extend({
			"click .info" : "showInfo"
		}, proClone.events),
		initialize : function() {
			var $el = this.$el;
			proClone.initialize.apply(this, arguments);
			this._$info = $el.find(".info");
			this._$playCount = $el.find(".play-count");
			
			if(this._$info.size()){
				mainPlayer.on("change:sound", this.onChangeSound, this);				
			}
		},
		onChangeSound: function(model){
			if(this._soundId != model.soundId()) return;
			var playCount = parseInt(this._$playCount.text(), 10) + 1;
			if (this._$info.size() && !this.$el.is(".open")) {
				this.showInfo();
			}
			this._$playCount.text(playCount).show();
		},
		/*
		 * 显示详情
		 */
		showInfo : function() {
			var $el = this.$el, soundId = this._soundId;

			if ($el.is(".open")) {
				$el.removeClass("open");
			} else {
				mainPlayer.getSoundInfo(soundId, function(data) {
					var infobox = $el.find(".infobox");
					$el.addClass("open");
					infobox.html(info_template(data));
				});
			}
		}
	});
	return View;
});