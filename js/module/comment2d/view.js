/*
 * 立体评论视图
 */
define([ 'jquery', 'underscore', 'backbone', 'module/common', 'model/comment_chunkinfo','model/comment_chunk','model/comment', 'collection/comment',
         'plugin/face',
         'module/share','module/card','module/default_image','plugin/dialog','module/common/iattextbox','module/dialogs/login_box','plugin/jquery.eyscroll' ], function($, _, Backbone, modelCommon, ChunkInfoModel, CommentChunkModel, CommentModel, CommentSet, pluginFace, ShareView, card, defaultImage, dialog, iAttextbox, login_box) {
	var userFaceSrc = modelCommon.userModel.get("logoPic"); 
	var CommentView = Backbone.View.extend({
		  tagName: "li",
		  template:_.template(['<div class="commentInPop">',
	         					'<div class="left">',
	         						'<%if(avatarPath){%>',
	         						'<a card="<%=uid%>" class="userface" href="<%=(helper.isLogin())?"/#":""%>/<%=uid%>/"><img src="<%=avatarPath%>" alt=""></a>',
	         						'<%}else{%>',
	         						'<a card="<%=uid%>" class="userface is-error" href="<%=(helper.isLogin())?"/#":""%>/<%=uid%>/"></a>',
	         						'<%}%>', 
	         					'</div>',
	         					'<div class="right">',
	         						'<div class="commentInPop_content">',
	         							'<a card="<%=uid%>"  href="<%=(helper.isLogin())?"/#":""%>/<%=uid%>/"><%=nickname%>:</a><%=content%>',
	         						'</div>',
	         						'<div class="cl">',
	         							'<span class="commentInPop_createtime"><%= niceTime %></span>',
	         							'<a class="comment_replyBtn" href="javascript:;">回复</a>',
	         							'<%if(config.CURRENT_USER.uid == uid){%>',
	         							'<a comment_id="<%=id%>" class="comment_deleteBtn" href="javascript:;">删除</a>',
	         							'<%}%>',
	         						'</div>',
	         					'</div>',
	         				'</div>'].join("")),
		  events: {
			  "click .comment_deleteBtn": "onDeleteBtnClick",
			  "click .comment_replyBtn": "onReplyBtnClick"
		  },
		  onDeleteBtnClick: function(e){
			  this.$el.remove();
			  popBox.resetScroll();
			  this.model.del();
			  popBox.commentChunkModel.set("count",popBox.commentChunkModel.get("count")-1);
			  return false;
		  },
		  onReplyBtnClick: function(){
			  var model = this.model,
	              trackId = model.get("trackId"),
	              second = model.get("second"),
	              parentId = model.get("id"),
	              nickname = model.get("nickname");
	          popBox.$sumbitBtn.attr("track_id", trackId).attr("second", second).attr("parent_id", parentId).attr("nickname", nickname);
	          popBox.$text.focus();
	          popBox.$text.val('回复@' + nickname + ':');
	          return false;
		  },
		  initialize: function() {
		    this.listenTo(this.model, "change", this.render);
		  },
		  render: function() {
			  this.$el.html(this.template(this.model.attributes));
			  return this;
		  }
		});
	
	var $popBox = $(['<div class="commentPopBox">',
						'<div class="commentPopBox_wrapper">',
							'<div class="commentPop">',
								'<div class="bud"></div>',
								'<div class="commentPop_titleBar">',
									'<div class="commentPop_title"><span class="commentPopBox_count"></span>条评论在<span class="commentPopBox_position">00:00</span></div>',
									'<a class="commentPop_closeBtn close2Btn"></a>',
								'</div>',
								'<div class="commentPop_content">',
									'<ul class="commentInPopList">',
									'</ul>',
								'</div>',
								'<div class="commentPop_bottom">',
									'<div class="commentPop_bottom_top">',
										'<div class="commentBox_inputBox">',
											'<div class="effect_borderHover"></div>',
											'<div class="effect_borderDefault"></div>',
											'<input class="commentPop_text" value="" type="text" placeholder="写点什么吧...">',
											'<textarea rows="" cols=""></textarea>',
										'</div>',
									'</div>',
									'<div class="commentPop_bottom_bottom" style="display:none;">',
										'<div class="cl">',
											'<div class="fr">',
												'<a href="javascript:;" class="faceBtn"></a>',
												'<a href="javascript:;" class="submit2Btn"><span>评论</span></a>',
											'</div>',
											'<a href="javascript:;" class="qqWeiboBtn" data-type="comment" data-name="tQQ" title="腾讯微博"></a> ',
                                            '<a href="javascript:;" class="qZoneBtn" data-type="comment" data-name="qzone" title="qq空间"></a> ' ,
                                            '<a href="javascript:;" class="sinaWeiboBtn" data-type="comment" data-name="tSina" title="新浪微博"></a> ' ,
                                                '<a class="comment_config" href="/passport/profile" target="_blank">配置</a>',
										'</div>',
									'</div>',
								'</div>',
							'</div>',
						'</div>',
					'</div>'].join(''));
	var popBox = {
		$el : $popBox,
		$tempContainer : $("body"),
		$position : $popBox.find(".commentPopBox_position"),
		$closeBtn : $popBox.find(".commentPop_closeBtn"),
		$content : $popBox.find(".commentPop_content"),
		$count : $popBox.find(".commentPopBox_count"),
		$commentList : $popBox.find(".commentInPopList"),
		$text : $popBox.find(".commentPop_text"),
		$bottom : $popBox.find(".commentPop_bottom_bottom"),
		$myface:$('<div class="chunk_userface myface">'+(userFaceSrc?'<div class="userface"><img src="'+userFaceSrc+'" alt=""></div>':'<div class="userface is-error"></div>')+'</div>'),
		$onEditFace : $('<div class="chunk_userface onEditFace">'+(userFaceSrc?'<div class="userface"><img src="'+userFaceSrc+'" alt=""></div>':'<div class="userface is-error"></div>')+'</div>'),
		$sumbitBtn : $popBox.find(".submit2Btn"),
		isOnManual : false,
		isOnEdit : false,
		position : 0,
		soundId : "",
		autoHideTime : 5000,
		autoHideTimeoutId : -1,
		chunkIndex:-1,
		commentChunkModel : new CommentChunkModel(),
		shareView:null,
		autoHide: function(autoHideTime, callback){
			var _this = this;
			callback = callback || function(){};
			this.autoHideTimeoutId = setTimeout(function(){
				if(_this.isOnEdit||_this.isOnManual) return;
				_this.afterClose();
				callback();
			},autoHideTime||this.autoHideTime);
		},
		
		clearHide : function(){
			clearTimeout(this.autoHideTimeoutId);
		},
		resetScroll: function(){
			this.$content.eyscroll("reset", true);
		},
		init: function(){
			var _this = this;
			this.$content.eyscroll({
				borderWidth:7
			});
			this.initFace();
        	$(document).on("click", function(){
        		_this.$text.blur();
        		_this.close();
        	});
        	iAttextbox.bind(this.$text);
		},
		close: function(){
			this.isOnEdit = false;
			this.isOnManual = false;
			this.$el.hide();
			this.$text.blur();
			this.$text.val("");
			this.$onEditFace.hide();
			this.$bottom.hide();
		    this.afterClose();
		},
		afterClose: function(){
			var $chunk_userface = this.$el.closest(".chunk_userface");
			this.$tempContainer.append(this.$el);
		    if(!this.$commentList.children().size()){
		    	$chunk_userface.remove();
		    }
		},
		rendComment: function(model, response){
			var _this = this,
				models = model?model.get("comments").models:new CommentSet();
			_this.$commentList.html('');
			_this.$count.text(model.get("count"));
			_.each(models, function (comment, index) {
                var view = new CommentView({
                	model:comment
                });
                view.render();
                _this.$commentList.append(view.$el);
            });
			_this.resetScroll();
			_this.$count.text(models.length);
			card.render();
			defaultImage.render();
		},
		isReplying: false,
		reply: function(){
			var _this = this,
	            second = this.position,
	            parentId = this.$sumbitBtn.attr("parent_id"),
	            content = this.$text.val();
			if(this.isReplying) return;
			this.isReplying = true;
            this.shareView.getShareData(function(shareData){
                var data = $.extend({
                    trackId: _this.soundId,
                    content: content,
                    parentId: parentId,
                    second : second
                }, shareData);
                var commentModel = new CommentModel(data);
                var error = commentModel.check();
                if(error){
                    dialog.alert(error);
                    _this.isReplying = false;
                    return;
                }
                commentModel.create(function(model){
                	_this.isReplying = false;
                    _this.commentChunkModel.get("comments").unshift(model);
                    _this.commentChunkModel.set("count",_this.commentChunkModel.get("count")+1);
                    var view = new CommentView({
                        model:model
                    });
                    view.render();
                    _this.$commentList.prepend(view.$el);
                    _this.$text.val("");
                    _this.resetScroll();
                    card.render();
                    _this.$sumbitBtn.attr("parent_id","");
                }, function(model, response){
                	_this.isReplying = false;
                	if(response.msg)dialog.alert(response.msg);
                });
            });

		},
		initFace:function(){
            var $faceBtn = this.$el.find(".faceBtn");
            if(!$faceBtn.size()){
                return;
            }
            pluginFace.init($faceBtn, this.$text);
        },
        initShare:function(){
        	if(helper.isLogin()&&!this.shareView){
        		var shareView = new ShareView({
        			$el:this.$el
        		});
        		this.shareView = shareView;        		
        	}
        },
		release: function(){
			this.close();
		}
	};
	popBox.init();
	

	
	var View = Backbone.View.extend({
		_$sound : null,
		_chunkInfoModel : null,
		_chunkWidths : [],
		_isOnEdit : false,
		_isOnManual : false,
		_width : 0,
		_faceNum:1,
		events : {
			"click .chunk_userface" : "onChunkUserfaceClick",
			"mousemove" : "onMouseMove",
			"mouseenter" : "onMouseEnter",
			"mouseleave" : "onMouseLeave",
			"mouseenter .chunk" : "onChunkMouseEnter",
			"click": "onClick",
			"mouseenter .commentPopBox":"onPopBoxMouseenter",
			"mouseleave .commentPopBox":"onPopBoxMouseleave",
			"focus .commentPop_text": "onFocusCommentPopText",
			"blur .commentPop_text": "onBlurCommentPopText",
			"click .commentPop_closeBtn" : "closePop",
			"click .submit2Btn": "reply",
			"keydown .commentPop_text": "onKeydownCommentPopText"
		},
		onChunkUserfaceClick: function(e){
			var $chunkUserface = $(e.target).closest(".chunk_userface");
			$chunkUserface.append(popBox.$el);
		},
		onMouseEnter: function(e){
			if(this._isOnEffect) return false;
			this.$el.append(popBox.$myface.hide());
		},
		onMouseLeave: function(e){
			clearTimeout(this._lastOnManualTimeoutId);
			popBox.$myface.remove();
		},
		onMouseMoveTimeoutId:-1,
		onMouseMove: function(e){
			if(popBox._isOnEffect) return false;
			var _this = this;
			var chunkInfoModel = this._chunkInfoModel;
			if(!(chunkInfoModel && chunkInfoModel.get("duration"))) return;
			//ie8下性能
			clearTimeout(this.onMouseMoveTimeoutId);
			this.onMouseMoveTimeoutId = setTimeout(function(){
				var $el = _this.$el;
				var left = e.clientX - $el.offset().left;
				var top = e.pageY - $el.offset().top;
				if(Math.abs(left-_this._lastLeft) < 1) return false;
				_this._lastLeft = left;
				if(top>0){
					if(!popBox._myfaceFadeIn){
						popBox._myfaceFadeIn = true;
						popBox.$myface.fadeIn(function(){
							popBox._myfaceFadeIn = false;
						});						
					}
				}else{
					popBox.$myface.hide();
					return;
				}
				if(left<=8){
					popBox.$myface.css({
						left: 0 + "px"
					});
				}else if(left>=$el.width()-8){
					popBox.$myface.css({
						left: $el.width()-16 + "px"
					});
				}else{
					popBox.$myface.css({
						left: left - 8 + "px"
					});					
				}
				
				_this.showPopOnManual(left);
			},0);
		},
		onPopBoxMouseenter : function(){
			popBox.isOnManual = true;
			popBox.clearHide();
			popBox.$myface.hide();
			return false;
		},
		onPopBoxMouseleave : function(){
			var _this = this;
			popBox.isOnManual = false;
			popBox.autoHide(200, function(){
				_this._lastOnManualIndex = -1;
				_this._isOnManual = false;
			});
			return false;
		},
		onFocusCommentPopText: function(){
			popBox.isOnEdit = true;
			popBox.clearHide();
			popBox.$bottom.show();
			popBox.$text.parent().addClass("focus");
		},
		onBlurCommentPopText: function(){
			popBox.$text.parent().removeClass("focus");
		},
		onKeydownCommentPopText: function(e){
			if (e.keyCode == 13 && !popBox.$text.attextboxlocked()) {
				popBox.reply();
				return false;
            }
		},
		closePop: function(){
			popBox.close();
		},
		reply: function(){
			popBox.reply();
		},
        //todo 重复定义
		_isOnManual: false, //是否真正进行手动请求
		_lastOnManualIndex : -1, //最近手动请求分段的索引
		_lastOnManualTimeoutId : -1, //最近手动请求分段的延时ID
		/*
		 * 手动请求分段
		 */
		showPopOnManual : function(left){
			if(popBox.isOnEdit) return false;
			var _this = this;
			var position = _this._getPosition(left);
			var chunkInfoModel = _this._chunkInfoModel;
			var	duration = chunkInfoModel.get("duration");
			var	chunks = chunkInfoModel.get("chunks");
			var	chunkNum = chunks.length;
			var	index  = parseInt(position * chunkNum / duration);
			if(_this._lastOnManualIndex!=index){
				_this._lastOnManualIndex = index;
				clearTimeout(_this._lastOnManualTimeoutId);
				if(chunks[index] && chunks[index].length){
						_this._lastOnManualTimeoutId = setTimeout(function(){
							_this._isOnManual = true;
							_this.showPop(index, position, duration);
							_this.queryAtPosition(position, function(model, response){
								if(_this._isOnManual && index != _this._lastOnManualIndex) return;
								popBox.rendComment(model, response);
							});						
						},200);
				}else{
					_this._isOnManual = false;
				}
			}
		},
		_lastOnManualIndex : -1,
		_lastOnManualTimeoutId : -1,
		_lastOnAutoIndex : -1,
		/*
		 * 自动请求分段
		 * @param position {Number} 播放位置
		 */
		showPopAuto: function(position){
			if(popBox.isOnManual||popBox.isOnEdit||this._isOnManual) return false;
			var _this = this,
				chunkInfoModel = this._chunkInfoModel,
				duration = chunkInfoModel.get("duration"),
				chunks = chunkInfoModel.get("chunks"),
				chunkNum = chunks.length,
				index  = parseInt(position * chunkNum / duration);
			if(_this._lastOnAutoIndex!=index){
				_this._lastOnAutoIndex = index;
				if(chunks[index] && chunks[index].length){
					_this.showPop(index, position, duration);
					_this.queryAtPosition(position, function(model, response){
						popBox.rendComment(model, response);
					});
				}
			}
		},
		onClick: function(e){
			if(this._isOnEffect) return false;
			var soundId = this.getSoundId();
			if (!helper.isLogin()) {
                login_box.open(function (data) {
                    window.location.href = "/sound/" + soundId;
                    login_box.close();
                });
                return false;
            }
			this._isOnManual = false;
			var _this = this;
			var $el = this.$el;
			var top = e.pageY - $el.offset().top;
			if($(e.target).closest(".commentPop_content").size()){
				return;
			}
			if($(e.target).closest(".comment_config").size()){
				return;
			}
			if(top<0){return false;}
			popBox.isOnEdit = true;
			var chunkInfoModel = this._chunkInfoModel;
			if(!(chunkInfoModel && chunkInfoModel.get("duration"))) return false;
			var left = e.clientX - $el.offset().left;
			var index = this._getIndex(left);
			var $chunk = $el.find(".chunk").eq(index);
			var position = this._getPosition(left);
			var duration = chunkInfoModel.get("duration");
			var $to = null;
			//显示弹层
			if(!$chunk.find(popBox.$onEditFace).size()){
				$to = popBox.$onEditFace;
				$chunk.find(".chunkWrapper").prepend(popBox.$onEditFace);
			}else{
				$to = popBox.$onEditFace;
			}
			popBox.$onEditFace.show();				
			_this.showPop(index, position, duration);
			setTimeout(function(){
				popBox.$text.focus();				
			},0);
			//动画
			_this.effect($to);
			
			//更新弹层
			this.queryAtIndex(index, function(model, response){
				popBox.rendComment(model, response);
			});
			return false;
		},
		_isOnEffect : false, //是否正在执行动画效果
		/*
		 * 到目标元素的一个镜像位移效果
		 * @param $to {Jquery} 目标元素
		 */
		effect: function($to){
			var _this = this, $el = this.$el;
			this._isOnEffect = true;
			if(!(helper.browser.msie && parseInt(helper.browser.version)<=8)){				
				popBox.$myface.clone().appendTo($el).animate({
					opacity:0,
					left: $to.offset().left - $el.offset().left
				}, { duration: 200,complete:function(){
					$(this).remove();
					_this._isOnEffect = false;
				}});
			}else{
				_this._isOnEffect = false;
			}
			popBox.$myface.hide();
		},
		/*
		 * 在特定分段显示弹层
		 * @param index {Number} 分段索引
		 * @param position {Number} 播放位置
		 * @param duration {Number} 播放时长
		 */
		showPop: function(index, position, duration){
			var _this = this;
			var soundId = this._$sound.attr("sound_id");
			var $chunk = this.$el.find(".chunk").eq(index);
			if(popBox.soundId != soundId || popBox.chunkIndex != index){
				popBox.$commentList.html("");
			}
			popBox.clearHide();
			popBox.position = position;
			popBox.soundId = soundId;
			popBox.chunkIndex = index;
			popBox.$position.text(helper.getTime(position*1000));
			$chunk.prepend(popBox.$el);
			popBox.$el.toggleClass("is-budAtRight",(position/duration)>0.5);
			if(!popBox._isOnFadeIn){
				popBox._isOnFadeIn = true;
				popBox.$el.hide().fadeIn(200, function(){
					popBox._isOnFadeIn = false;
				});
			}
			popBox.autoHide(5000, function(){
				_this._lastOnManualIndex = -1;
				_this._isOnManual = false;
			});
			popBox.initShare();
		},
		/*
		 * 根据当前播放位置查询分段信息
		 * @param position {Number} 播放位置
		 * @param callback {Function} 回调
		 */
		queryAtPosition : function(position, callback){
			var chunkInfoModel = this._chunkInfoModel;
			var duration = chunkInfoModel.get("duration");
			var chunks = chunkInfoModel.get("chunks");
			var chunkNum = chunks.length;
			var index  = parseInt(position * chunkNum / duration);
			var $chunk = this.$el.find(".chunk").eq(index);
			var $popBox = $chunk.find(popBox.$el);
			if($popBox.size() && !$popBox.is(":hidden")) return;
			this.queryAtIndex(index, callback);
		},
		/*
		 * 查询指定分段信息
		 * @param index {Number} 分段索引
		 * @param callback {Function} 回调
		 */
		queryAtIndex: function(index, callback){
			var _this = this;
			var chunk = new CommentChunkModel({
				id : this._$sound.attr("sound_id")+"_"+index,
				soundId: this._$sound.attr("sound_id"),
				index : index									
			});
			chunk.query({
				success: function(model, response){
					if(popBox.commentChunkModel){
						popBox.commentChunkModel.off(null, null, _this);
					}
					popBox.commentChunkModel = model;
					popBox.commentChunkModel.on("change", _this.onPopBoxCommentChunkModelChange, _this);
					callback(model, response);
				}
			});
		},
		initialize : function() {
			var $el = this.$el;
			this._$sound = $el.closest("[sound_id]");
			this._width = $el.width();
		},
		render : function() {
			var _this = this, soundId = this.getSoundId(), chunkInfoModel = this._chunkInfoModel;
			if (!chunkInfoModel || soundId != chunkInfoModel.id) {
				chunkInfoModel = new ChunkInfoModel({
					id : soundId
				});
				this._chunkInfoModel = chunkInfoModel;
			}
			chunkInfoModel.query({
				success : function(model) {
					_this._chunkInfoModel = model;
					_this._render();
				}
			});
		},
		_render : function() {
			var _this = this, $el = this.$el, html = "", width = parseInt(this._width), chunkInfoModel = this._chunkInfoModel;
			if (!$el.data("chunkNumBinded")) {
				$el.data("chunkNumBinded", true);
				var faceWidth = (width>=500)?18:16;
				var chunks = chunkInfoModel.get("chunks"), num = chunks.length, chunkWidth = width / num, faceNum = parseInt((chunkWidth+1)/faceWidth,10);
				var chunkShortWidth = parseInt(width / num, 10), chunkLongWidth = (chunkWidth == chunkShortWidth) ? chunkShortWidth : (chunkShortWidth + 1);
				var chunkShortNum = chunkLongWidth * num - width, chunkLongNum = num - chunkShortNum;
				this._chunkWidths = [];
				this._faceNum = faceNum;
				_.each(chunks, function(comment, index) {
					var cWidth = (index < chunkLongNum) ? chunkLongWidth : chunkShortWidth, style = 'style="width:' + cWidth + 'px;"';
					_this._chunkWidths.push(cWidth);
					var commentHtml = '';
					for(var i=0,len=comment.length;i<len && i<faceNum;i++){
						commentHtml += '<div class="chunk_userface">'+(comment[i]?'<div class="userface"><img src="'+comment[i]+'" alt=""></div>':'<div class="userface is-error"></div>')+'</div>';
					}
					html += '<div class="chunk" chunkindex="' + index + '" hidefocus="true" ' + style + '><div class="chunkWrapper">'+commentHtml+'</div></div>';
				});
				$el.html(html);
				this.bindEvents();
			    defaultImage.render({$container: $el});
			}
			//$el.append(popBox.$myface.hide());
		},
		onPopBoxCommentChunkModelChange: function(){
			var comments = popBox.commentChunkModel.get("comments").models;
			var	chunks =  this._chunkInfoModel.get("chunks");
			var	index = popBox.chunkIndex;
			var	faceNum = this._faceNum;
			var	commentHtml = "";
			var	$chunk = this.$el.find(".chunk").eq(index);
			var	chunk = _.map(comments, function(comment){ return comment.get("avatarPath"); });
			chunks[index] = chunk;
			for(var i=0,len=chunk.length;i<len && i<faceNum;i++){
				commentHtml += '<div class="chunk_userface">'+(chunk[i]?'<div class="userface"><img src="'+chunk[i]+'" alt=""></div>':'<div class="userface is-error"></div>')+'</div>';
			}
			$chunk.find(".chunk_userface:not(.onEditFace)").remove();
			popBox.$onEditFace.hide().appendTo($("body"));
			$chunk.find(".chunkWrapper").html(commentHtml);
			popBox.$count.text(comments.length);
			this.updateCount();
		},
		updateCount: function(){
			var model = popBox.commentChunkModel,
				$commentBtn = this._$sound.find(".commentBtn");
			if(!$commentBtn.size()) return;
			var $count = $commentBtn.find(".count");
			if(!$count.size()) return;
			var	count = parseInt($count.text(),10);
			if(model.previous("count") > model.get("count")){
				count--;
			}else if(model.previous("count") < model.get("count")){
				count++;
			}
			$count.text(count);
		},
		_getChunkUserfaceIndex: function(left){
			return parseInt(left/16)-1;		
		},
		_getPosition: function(left){
			var chunkInfoModel = this._chunkInfoModel,
				width = this.$el.width(),
				duration = chunkInfoModel.get("duration");
			return left/width*duration;
		},
		_getIndex: function(left){
			var _left = 0;
			for(var i=0,len=this._chunkWidths.length;i<len;i++){
				_left += this._chunkWidths[i];
				if(_left>left){
					return i;
				}
			}			
		},
		setChunkInfoModel : function(chunkInfoModel) {
			this._chunkInfoModel = chunkInfoModel;
		},
		bindEvents : function() {

		},
		getSoundId : function() {
			return this._$sound.attr("sound_id");
		},
		release : function() {
			popBox.commentChunkModel.off(null, null, this);
			popBox.release();
			this.undelegateEvents();
		}
	});
	return View;
});