define([ 'jquery', 'backbone', 'helper' ], function($, Backbone, helper) {
	var nav = {
		$el : $(".menu").eq(0),
		map : (function(){
			var map = {
				"explore/":"explore",
				"explore/u":"u",
				"explore/sound":"sound",
				"explore/album":"album"
			};
			map[config.CURRENT_USER.uid+"/feed"] = "index";
			return map;
		}()),
		set: function(pageName){
			var item_name = this.map[pageName];
			var $item = this.$el.find(".menu_"+item_name);
			this.$el.find(".on").removeClass("on");
			if($item.size()){
				$item.addClass("on");
			}
		}
	};
	var Router = Backbone.Router.extend({
		_page : null,
		pageName : "",
		$el : $("#mainbox"),
		isRefreshing : false,
		routes : {
			"*action" : "default"
		},
		"default" : function(pageName) {
			pageName = pageName || config.CURRENT_USER.uid+"/feed";
			if (this._page)
				this._page.release();
			this.toPage(pageName);
			nav.set(pageName);
		},
		toPage : function(pageName,type) {
			var _this = this;
			this.pageName = pageName;
			this.$el.html('<div class="pageLoading"></div>');
			helper.scrollTop();
			var encodedReg = /^[\d\w\!\#\$\&\'\(\)\*\+\,\-\.\/\:\;\=\?\@\_\~\%]+$/, isEncoded = encodedReg.test(pageName), needEncode = helper.browser.msie && (!isEncoded);
			this.baiduCount(pageName);
			$.ajax({
				type : type||"POST",
				url : "/" + (needEncode ? encodeURI(pageName) : pageName),
				dataType : "script",
				pageName : pageName,
				statusCode : {
					404 : function() {
						router.to404();
					}
				},
				dataFilter: function(data, type){
					if(this.pageName != _this.pageName) {
						return false;
					}
					return data;
				}
			});
		},
		to404 : function() {
			var $el = this.$el;
			$.get("/404s", function(html) {
				$el.html(html);
			});
		},
		setPage : function(page) {
			this._page = page;
		},
		baiduCount : function(pageName) {
			if (window._hmt) {
				_hmt.push([ '_trackPageview', '/' + pageName + '_login' ]);
			}
		}
	});
	var router = new Router();
	// 登录状态下启动路由
	if (helper.isLogin() && !(location.pathname && location.pathname != "/")) {
		Backbone.history.start();
		// 点击链接刷新当前页
		$("body").on("click", "a", function(e) {
			var attr = $(this).attr('href'), newFragment;
			if (attr) {
				newFragment = Backbone.history.getFragment(attr);
				if (Backbone.history.fragment == newFragment || Backbone.history.fragment == newFragment.replace("\#\/", "")) {
					if (router.isRefreshing !== false)
						return false;
					Backbone.history.fragment = null;
					Backbone.history.navigate(newFragment, true);
					router.isRefreshing = setTimeout(function() {
						router.isRefreshing = false;
					}, 800);
					return false;
				}
			}
		});
	}
	return router;
});