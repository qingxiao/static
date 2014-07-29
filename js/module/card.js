/*
 * 名片
 * 给元素设置card属性, card="用户id"或者card="用户昵称",并且card_type="nickname"
 */
define([ 'jquery', 'underscore', 'backbone', 'model/user', 'module/common/ifollow', 'module/common/iletter' ], function($, _, Backbone, UserModel, iFollow, iLetter) {
	var card = {
		$pop : $('<div class="userCard" style="display:none;"></div>').appendTo("body"),
		init : function() {
			this.$pop.on({
				mouseenter : function() {
					var $pop = $(this);
					if ($pop.data("hideTimeoutId")) {
						clearTimeout($pop.data("hideTimeoutId"));
					}
				},
				mouseleave : function() {
					var $pop = $(this);
					var hideTimeoutId = setTimeout(function() {
						$pop.hide().html("");
					}, 100);
					$pop.data("hideTimeoutId", hideTimeoutId);
				}
			});
		},
		/*
		 * 渲染
		 * @param options {Object}
		 * options.$container {Jquery} 渲染范围，尽量提供，可提高性能
		 */
		render : function(options) {
			var op = options || {}, $container = op.$container, $els;
			if($container){
				$els = $container.find("[card]");
			}else{
				$els = $("[card]");
			}
			for ( var i = 0, len = $els.length; i < len; i++) {
				var $el = $els.eq(i);
				if (!$el.data("cardEventBinded") && $el.attr("card")) {
					this.eventBind($el);
				}
			}
		},
		eventBind : function($el) {
			var _this = this;
			$el.data("cardEventBinded", true);
			$el.on({
				mouseenter : function() {
					_this.onMouseenter($(this));
				},
				mouseleave : function() {
					_this.onMouseleave($(this));
				},
				click : function() {
					$(this).mouseleave();
				}
			});
		},
		onMouseenter : function($el) {
			if(helper.isWindowBusy()) return;
			var $pop = this.$pop;
			if ($pop.data("hideTimeoutId")) {
				clearTimeout($pop.data("hideTimeoutId"));
			}
			var str = $el.attr("card"), card_type = $el.attr("card_type") || "", isNickName = (str.charAt(0) == "n");
			var popTimeoutId = setTimeout(function() {
				var userModel = new UserModel();
				if (isNickName) {
					userModel.set("nickname", str.substring(1));
				} else {
					userModel.set("id", str);
				}
				userModel.query({
					success : function(model) {
						var content = "", json = model.toJSON();
						if ($el.parents("body").size() === 0)
							return;
						if (_.isEmpty(json)) {
							$pop.addClass("nobody");
							content = _.template([ '<div class="userCard">', '<p class="desc">该昵称目前不存在哟╮(╯▽╰)╭</p>', '</div>', '<div class="arrow"><i></i></div>' ].join(''));
						} else {
							$pop.removeClass("nobody");
							json.card_type = card_type;
							content = _.template(['<div class="userCard_info">',
									'<div class="left">',
										'<a class="userface" href="<%=(helper.isLogin())?"/#":""%>/<%=id%>/">',
											'<%if(avatarUrl60){%>',
											'<img alt="" src="<%=avatarUrl60%>">',
											'<%}%>',
										'</a>',
									'</div>',
									'<div class="right <%=(province||city)?"":"area-unexist"%>">',
										'<a class="title" href="/#/<%=id%>/">',
						                	'<%=nickname%>',
						                	'<%if (isVerified){%>',
						                	'<i class="VIcon" title="喜马拉雅认证播主">&nbsp;</i>',
						                	'<%}%>',
						                '</a>',
										'<p class="area"><%=province%> <%=(province&&city)?"•":""%> <%=city%></p>',
										'<div class="count">',
											'<a class="count_sound" href="<%=(helper.isLogin())?"/#":""%>/<%=id%>/sound/" title="声音"><%= tracksCount%></a>',
											'<a class="count_attention" href="<%=(helper.isLogin())?"/#":""%>/<%=id%>/follow/" title="关注"><%=followingsCount%></a>',
											'<a class="count_fans" href="<%=(helper.isLogin())?"/#":""%>/<%=id%>/fans/" title="粉丝"><%=followersCount%></a>',
										'</div>',
									'</div>',
								'</div>',
								'<p class="userCard_intro">',
									'<%=_.escape(isVerified?(ptitle||personalSignature||"这家伙很懒，什么都没留下"):(personalSignature||"这家伙很懒，什么都没留下"))%>',
								'</p>',
								'<%if (!(config && config.CURRENT_USER && config.CURRENT_USER.uid == id)){%>',
								'<div class="userCard_operate">',
									'<% if(isNotFollowing){%>',
									'<a class="addBtn2 small j-follow" data-options="uid:<%=id%>,is_follow:false,nickname:\'<%=nickname%>\',is_from_cache:true"><span class="default">关注</span><span class="hover">取消</span></a>',
									'<%}else{%>',
									'<a class="addBtn2 small already <%=beFollowed?"both":""%> j-follow" data-options="uid:<%=id%>,is_follow:true,nickname:\'<%=nickname%>\',is_from_cache:true" href="javascript:;"><span class="default"><%=beFollowed?"相互关注":"已关注"%></span><span class="hover">取消</span></a>',
									'<%}%>',
									'<a class="j-letter" data-options="nickname:\'<%=nickname%>\'">发私信</a>',
								'</div>',
								'<%}%>',
								'<span class="arrow_popup"><i></i></span>'].join(""));
						}

						var OFFSET_LEFT = 30, OFFSET_RIGHT = 10, OFFSET_BOTTOM = 10, OFFSET_TOP = 10, width = $el.width(), height = $el.height(), left = $el.offset().left, top = $el.offset().top, pTop = 0, pLeft = 0;
						$pop.html(content(json)).css({top:-1000}).show();
						iFollow.doBindOne($pop.find(".j-follow"));
						iLetter.bind($pop.find(".j-letter"));

						
						var pop_class = "", pWidth = $pop.width(), pHeight = $pop.height()+22;
						if (left + pWidth < document.body.clientWidth) {
							pop_class += "l";
							pLeft = left + width / 2 - OFFSET_LEFT;
						} else {
							pop_class += "r";
							pLeft = left + width / 2 - pWidth + OFFSET_RIGHT;
						}
						if (top > pHeight + OFFSET_BOTTOM + $(document).scrollTop()) {
							pop_class += "b";
							pTop = top - pHeight - OFFSET_BOTTOM;
						} else {
							pop_class += "t";
							pTop = top + height + OFFSET_TOP;
						}
						$pop.removeClass("lb").removeClass("lt").removeClass("rb").removeClass("rt").addClass(pop_class).css({
							"left" : pLeft + "px",
							"top" : pTop + "px"
						}).hide().fadeIn(100);
					}
				});
			}, 200);
			$el.data("popTimeoutId", popTimeoutId);
		},
		onMouseleave : function($el) {
			var $pop = this.$pop;
			var popTimeoutId = $el.data("popTimeoutId");
			if (popTimeoutId) {
				clearTimeout(popTimeoutId);
				var hideTimeoutId = setTimeout(function() {
					$pop.hide().html("");
				}, 100);
				$pop.data("hideTimeoutId", hideTimeoutId);
			}
		},
		hidePop: function(){
			this.$pop.hide();
		},
		/*
		 * 释放
		 */
		release : function() {
			this.hidePop();
		}
	};
	$(window).bind("scroll", function(){
		card.hidePop();
	});
	card.init();
	return card;
});