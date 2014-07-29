define([ 'underscore', 'backbone', 'jquery' ], function(_, Backbone, $) {
	var matched, browser;
	jQuery.uaMatch = function(ua) {
		ua = ua.toLowerCase();
		var match = /(chrome)[ \/]([\w.]+)/.exec(ua) || /(webkit)[ \/]([\w.]+)/.exec(ua) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) || /(msie) ([\w.]+)/.exec(ua) || ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) || [];
		return {
			browser : match[1] || "",
			version : match[2] || "0"
		};
	};
	/** ********************************************************************************* */
	/***************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************
	 * jq操作cookie /* $.cookie('name', 'test',{expires: 7}); 设置cookies /* $.cookie('name'); 取得cookies /* $.cookie('name', null); /
	 **************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
	jQuery.cookie = function(name, value, options) {
		if (typeof value != 'undefined') {
			options = options || {};
			if (value === null) {
				value = '';
				options = $.extend({}, options);
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString();
			}
			var path = options.path ? '; path=' + (options.path) : '';
			var domain = options.domain ? '; domain=' + (options.domain) : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [ name, '=', encodeURIComponent(value), expires, path, domain, secure ].join('');
		} else {
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for ( var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};
	matched = jQuery.uaMatch(navigator.userAgent);
	browser = {};

	/*
	 * 任务管理器类 @param processFn {Function} 处理程序 @param callback {Function} 任务处理完后的回调 @param context {Object} 上下文环境
	 */
	function TaskManager(processFn, callback, context) {
		this.tasks = [];
		this.isActived = false;
		this.processFn = processFn;
		this.callback = callback || function() {
		};
		this.context = context || this;
	}
	TaskManager.prototype = {
		/*
		 * 添加任务，并开始执行 @param args {Array} 处理程序需要的参数
		 */
		append : function(args) {
			this.tasks.push(args);
			this.on();
		},
		on : function() {
			if (!this.isActived) {
				this.isActived = true;
				this.todo();
			}
		},
		off : function() {
			this.isActived = false;
		},
		todo : function() {
			var _this = this;
			setTimeout(function() {
				var start = +new Date();
				var tasks = _this.tasks;
				do {
					_this.processFn.apply(_this.context, _this.tasks.shift());
				} while (tasks.length > 0 && (+new Date() - start < 50));
				if (tasks.length > 0) {
					setTimeout(arguments.callee, 25);
				} else {
					_this.callback();
					_this.off();
				}
			}, 25);
		}
	};

	if (matched.browser) {
		browser[matched.browser] = true;
		browser.version = matched.version;
	}
	if (!$.browser)
		$.browser = browser;
	var isAndroid = (/android/gi).test(navigator.appVersion), isIDevice = (/iphone|ipad|ipod/gi).test(navigator.appVersion), isTouchPad = (/hp-tablet/gi).test(navigator.appVersion), hasTouch = isIDevice || isTouchPad;
	window.helper = {
		browser : browser, // 检测浏览器，用法同jquery1.7
		isAndroid : isAndroid,
		isIDevice : isIDevice,
		isTouchPad : isTouchPad,
		hasTouch : hasTouch,
		RESIZE_EV : 'onorientationchange' in window ? 'orientationchange' : 'resize',
		START_EV : hasTouch ? 'touchstart' : 'mousedown',
		START_CLICK_EV : hasTouch ? 'touchstart' : 'click',
		MOVE_EV : hasTouch ? 'touchmove' : 'mousemove',
		END_EV : hasTouch ? 'touchend' : 'mouseup',
		CANCEL_EV : hasTouch ? 'touchcancel' : 'mouseup',
		loading : {
			start : function(e) {
				var $el = $(e);
				if (($el.attr("loadding") && true) === true) {
					return false;
				}
				$el.attr("txt", $el.text());
				$el.html("&nbsp;");
				$el.attr("loadding", true);
				$el.spin('tiny');
				return true;
			},
			end : function(e) {
				var $el = $(e);
				$el.text($el.attr("txt"));
				$el.removeAttr("loadding");
				$el.spin('stop');
			}
		},
		getEvents : function(obj) {
			var _this = this, _obj = {};
			_.each(obj, function(v, n) {
				n = n.replace("START_EV", _this.START_EV).replace("MOVE_EV", _this.MOVE_EV).replace("END_EV", _this.END_EV).replace("CANCEL_EV", _this.CANCEL_EV);
				_obj[n] = v;
			});
			return _obj;
		},
		scrollTop : function() {
			if (this.browser.mozilla) {
				$("html").animate({
					scrollTop : 0
				}, 120);
			} else {
				$("body").animate({
					scrollTop : 0
				}, 120);
			}
		},
		/*
		 * 更改元素的data-options方法
		 */
		doChangeOptions : function($jq, opts) {
			var datastr = JSON.stringify(opts);

			datastr = datastr.substring(1, datastr.length - 1);
			$jq.attr("data-options", datastr);
		},
		/*
		 * 转换时间格式
		 */
		getTime : function(nMSec, toObj) {
			var nSec = Math.floor(nMSec / 1000), min = Math.floor(nSec / 60), hour = Math.floor(min / 60), sec = nSec - (min * 60);
			min = min - (hour * 60);
			return (!toObj ? (hour ? (hour + ":") : "") + ((min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec)) : {
				'min' : min,
				'sec' : sec,
				'hour' : hour
			});
		},
		doCheckVersion : function() {
			if (helper.browser.msie && helper.browser.version * 1 < 8) {
				$(".upgradePrompt ").show().html("<div>" + "系统检测到您的浏览器版本过低，请" + "<a>升级</a>" + "至IE6.0以上，或使用" + "<a>Chrome</a>" + "、" + "<a>Firefox</a>" + "、" + "<a>safari</a>" + "、" + "<a>搜狗高速模式</a>" + "等" + "</div>");
			} else {
				$(".upgradePrompt ").remove();
			}
		},
		cookie : {
			addCookie : function(objName, objValue, objHours) {
				var str = objName + "=" + escape(objValue);
				if (objHours > 0) { // 为时不设定过期时间，浏览器关闭时cookie自动消失
					var date = new Date();
					var ms = objHours * 3600 * 1000;
					date.setTime(date.getTime() + ms);
					str += "; expires=" + date.toGMTString();
				}
				document.cookie = str + ";path=/";
			},
			getCookie : function(objName) {
				var arrStr = document.cookie.split("; ");
				for ( var i = 0; i < arrStr.length; i++) {
					var temp = arrStr[i].split("=");
					if (temp[0] == objName)
						return unescape(temp[1]);
				}
			},
			delCookie : function(name) {
				document.cookie = name + "=;expires=" + (new Date(0)).toGMTString();
			}
		},
		/*
		 * 第三方帐号登录 type:1-新浪，2-qq baidu:百度统计 callback:登录成功回调，若没有callbakc则刷新页面
		 */
		login : function(type, baidu, callback) {

			if (window._hmt && baidu) {
				_hmt.push([ '_trackEvent', baidu, 'click' ]);
			}
			var callback_name = "gLoginCallback";
			var height = 560, width = 760, $win = $(window), winHeight = $win.height(), winWidth = $win.width(), left = (winWidth - width) / 2, top = (winHeight - height) / 2;
			left = left > 0 ? left : 0;
			top = top > 0 ? top : 0;
			var pram = "height=" + height + ",width=" + width + ",left=" + left + ",top=" + top;
			window.open('/passport/auth/' + type + '/authorize?customerFunction=' + callback_name, '', pram);

			window[callback_name] = function(data) {
				if (!callback) {
					window.location.reload();
				} else {
					callback(data);
				}
				window[callback_name] = null;
			};
		},
		/*
		 * 判断是否登录
		 */
		isLogin : function() {
			if (!(config && config.CURRENT_USER && config.CURRENT_USER.uid)) {
				return false;
			}
			return true;
		},
		/*
		 * 获取字符串的长度，单位字节
		 */
		gblen : function(str) {
			return $.trim(str).replace(/[^\x00-\xff]/ig, 'xx').length;
		},
		/*
		 * 截取指定长度的字符串 str {String} 原始字符串 len {Number} 长度 s {String} 超过指定长度后加后缀。默认为""。可以加"..."
		 */
		cutString : function(str, len, s) {
			var newstr = '';
			var len2 = 0;
			for ( var i = 0; i < str.length; i++) {
				if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
					len2 += 2;
				} else {
					len2++;
				}
			}
			if (len2 <= len) {
				return str;
			}
			len2 = 0;
			s = s || '';
			len = (len > this.gblen(s)) ? len - this.gblen(s) : len;
			for ( var i = 0; i < str.length; i++) {
				if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
					len2 += 2;
				} else {
					len2++;
				}
				if (len2 > len) {
					newstr += s;
					break;
				}
				newstr += str.charAt(i);
			}
			return newstr;
		},
		/*
		 * 格式化string strFormat("{0}","3")
		 */
		strFormat : function(str) {
			var args = [].slice.call(arguments, 1);

			return str.replace(/\{(\d+)\}/g, function(m, i) {
				return args[i];
			});
		},
		/*
		 * 获取相对时间
		 */
		getNiceTime : function(old) {
			if (!old) {
				return "";
			}
			var now = new Date();
			var commentdate = (new this.datetrans(old)).trans().date.getTime();
			var nMSec = now.getTime() - config.TIME_GAP - commentdate, nSec = Math.floor(nMSec / 1000), min = Math.floor(nSec / 60), hour = Math.floor(min / 60), day = Math.floor(hour / 24), month = Math.floor(day / 30), year = Math.floor(month / 12);

			nSec = nSec < 0 ? 0 : nSec;
			min = min < 0 ? 0 : min;
			hour = hour < 0 ? 0 : hour;
			day = day < 0 ? 0 : day;
			month = month < 0 ? 0 : month;
			year = year < 0 ? 0 : year;

			return year ? year + "年前" : (month ? month + "月前" : (day ? day + "天前" : (hour ? hour + "小时前" : (min ? min + "分钟前" : ("刚刚")))));
		},
		datetrans : function(spDate) {
			this.trans = function() {
				var inputdate = this.getDateInfo(spDate);
				var localdate = this.getDateInfo(new Date().toString());
				var ux = inputdate.date.getTime() / 1000 + (inputdate.utc - localdate.utc) * 3600;

				return {
					unix : ux * 1000,
					date : new Date(ux * 1000)
				};
			}, this.getDateInfo = function(sdate) {
				var dregex = new RegExp("[+|-]\\d{2}:\\d{2}", "g");
				var matchs = sdate.match(dregex);
				var oDate = null;
				var utc = null;
				var utcf = 0;
				var utcb = 0;

				if (matchs != null) {
					sdate = sdate.replace(matchs, "");
					sdate = sdate.replace(/T/g, " ");
					sdate = sdate.replace(/-/g, "/");
					oDate = new Date(sdate);
					utc = matchs[0].split(':');
					utcf = utc[0] * 1;
					utcb = utc[1] / 60;
				} else {
					dregex = new RegExp("[+|-]\\d{2}\\d{2}", "g");
					matchs = sdate.match(dregex);
					if (matchs != null) {
						utc = matchs[0];
						utcf = utc.substr(1, 2) * 1;
						utcb = utc.substr(4, 2) / 60;
					}
				}
				if (utcf < 0) {
					utcb *= -1;
				}
				utc = utcf + utcb;

				return {
					date : oDate,
					utc : utc
				};
			};
		},
		scrollTo1 : function(top, offset) {
			$("html, body").animate({
				scrollTop : top + offset
			}, 120);
		},
		scrollTo : function($el, offset) {
			var top = $el.offset().top + $el.scrollTop() + offset;
			$("html, body").animate({
				scrollTop : top
			}, 120);
		},
		timedProcessArray : function(items, process, callback) {
			var todo = items.concat();
			callback = callback || $.noop;
			setTimeout(function() {
				var start = +new Date();
				do {
					process(todo.shift());
				} while (todo.length > 0 && (+new Date() - start < 50));
				if (todo.length > 0) {
					setTimeout(arguments.callee, 25);
				} else {
					callback(items);
				}
			}, 25);
		},
		_isWindowBusy : false,
		/*
		 * 判断浏览器是否繁忙,在繁忙时，应当避免一些影响性能的操作
		 */
		isWindowBusy : function(isBusy) {
			if (isBusy === undefined) {
				return this._isWindowBusy;
			} else {
				this._isWindowBusy = isBusy;
			}
		},
		copyLink : function() {
			alert("复制链接");
		},
		TaskManager : TaskManager
	};
	$(window).bind("scroll", window_onscroll_callback);
	var window_onscroll_callback_timeoutId = null;
	function window_onscroll_callback() {
		if (window_onscroll_callback_timeoutId) {
			clearTimeout(window_onscroll_callback_timeoutId);
		}
		helper.isWindowBusy(true);
		window_onscroll_callback_timeoutId = setTimeout(function() {
			helper.isWindowBusy(false);
		}, 50);
	}
	return window.helper;
});