/**
 * Created with JetBrains WebStorm. User: xiaoqing Date: 12-12-10 Time: 下午2:51
 * To change this template use File | Settings | File Templates.
 */
define(['jquery', 'underscore', 'model/search', 'module/player/player', 'helper',"module/common/ifollow", 'plugin/jquery.selecter'],
    function ($, _, SearchModel, player, helper, ifollow) {

        var opKey = {
            enter: 13,
            left: 37,
            up: 38,
            right: 39,
            down: 40,
            space: 32
        };

        var searchModel = new SearchModel();


        /*var resultTemplate = {
         voice:_.template('<li data-scope="<%= scope %>"><div class="searchPanel_sound">' +
         '<a class="title" href="#" title="<%= title %>"><%= text %></a><a class="playBtn" href="javascript:;">play</a>' +
         '</div></li>'),
         user:_.template('<li data-scope="<%= scope %>"><div class="searchPanel_user">' +
         '<div class="left">' +
         '<a href="#" class="userface"><img alt="" src="<%= image %>"></a>' +
         '</div>' +
         '<div class="right">' +
         '<p><a class="title" href="#" title="<%= title %>"><%= text %></a><a class="vBtn"></a></p><p><span class="sign"><%= intro %></span></p>' +
         '</div>' +
         '</div></li>'),
         album:_.template('<li data-scope="<%= scope %>"><div class="searchPanel_album">' +
         '<div class="left"><a href="#" class="userface"><img alt="" src=""></a></div>' +
         '<div class="right"><p><a class="title" href="#" title="<%= title %>"><%= text %></a></p><p><span class="soundCount">12个声音</span></p></div>' +
         '</div></li>')
         };*/
        var resultTemplate = {
            voice: _.template('<li data-scope="<%= scope %>" sound_id="<%= id %>"><div class="searchPanel_sound">' +
                '<a class="title" href="<%= url %>" title="<%= title %>"><%= text %></a><div class="operateBtn">' +
                '<a class="playBtn" href="javascript:;"><span class="sub-play">play</span><span class="sub-pause">pause</span></a></div>' +
                '</div></li>'),
            user: _.template('<li data-scope="<%= scope %>" user_id="<%= id %>" is_follow="<%= is_follow %>"><div class="searchPanel_sound">' +
                '<a class="title" href="<%= url %>" title="<%= title %>"><%= text %></a>' +
                '<a class="operateBtn" data-options='+
                "'"+
                '{"uid":<%= id %>,"is_follow":<%= is_follow%>,"be_followed":false,"nickname":"<%= title%>"}' +
                "'"+
                '><span class="default">' +
                '<% if(is_follow) {%>已<% } %>' +
               /* '<% if(!!be_follow) {%>相互<% } %>' +*/
                '关注</span></a>' +
                '</div></li>'),
            album: _.template('<li data-scope="<%= scope %>" album_id="<%= id %>"><div class="searchPanel_sound">' +
                '<a class="title" href="<%= url %>" title="<%= title %>"><%= text %></a>' +
                '</div></li>')
        };

        //全局搜索框
        function HeaderSearch(options) {
            var _this = this;
            this.options = $.extend({
                url: "/s/search/suggest",
                type: "get",
                pramName: "keywords",
                resultKeyCode: [],// 确认结果按键
                $el: $(".g-player-search"),
                callback: function () {
                    _this.callback.apply(_this, arguments);
                },
                $listResult:""
            }, options);

            searchModel.setSearchUrl(this.options.url);
            var $el = this.options.$el;

            this.$el = $el;
            this.$searchType = $el.find(".selecter");
            this.$searchPanel = $el;
            this.$searchInput = $el.find("input[type!=hidden]").attr("autocomplete", 'off');
            this.$searchBtn = $el.find(".searchBtn");
            this.$listResult = this.options.$listResult || $el.find(".results_wrap");
            this.isBlur = true;
            this.init();
        }

        HeaderSearch.prototype = {
            init: function () {
                this.addInputEvent();
                this.addBtnEvent();
                this.addEvents();
                this.hideList();

            },
            addEvents: function () {
                var _this = this;
                this.$searchType.selecter();
                this.setScope(this.$searchType.selecter("val"));
                // 下拉框
                this.$searchType.on("change", function () {
                    _this.setScope(_this.$searchType.selecter("val"));
                });

                // hover效果
                this.$searchPanel.on({
                    mouseenter: function () {
                        $(this).addClass("focus");
                    },
                    mouseleave: function () {
                        if (!_this.isBlur) return;
                        $(this).removeClass("focus");
                        _this.$searchType.removeClass("is-type-hover");
                    }
                });


                // 搜索结果列表
                this.$listResult.on({
                    "mouseenter": function (event) {
                        var $li = $(this);
                        _this.$listResult.find("li[data-select]").removeAttr("data-select");
                        $li.attr("data-select", true);
                        _this.$listResult.find(".on").removeClass("on");
                        $li.addClass("on");
                    },
                     click:function(){
                         _this.chooseResult();
                     }
                }, ".results li");

                //阻止 playBtn 按钮冒泡
                this.$listResult.on({
                    click:function(){return false;},
                    mousedown:function(){return false;}
                }, ".results li .operateBtn");

                /*this.$listResult.on("click", ".results li[sound_id] .operateBtn", function () {
                    var $li = $(this).closest("li[sound_id]");
                    if($li.data("init_play")){
                        return;
                    }
                    $li.data("init_play", true);
                    _this.initPlayer($li);
                    $li.find(".playBtn").trigger("click");
                });*/

            },

            initPlayer: function () {
                player.render({$container: this.$listResult});
            },
            releasePlayer:function(){
                player.release({$container: this.$listResult});
            },
            unbindEvents: function () {
                this.$listResult.off();
            },
            showList: function () {
                if (this.isBlur || this.$listResult.children().length == 0) {
                    return
                }
                this.$listResult.removeClass("hidden");
                this.show = true;
            },
            hideList: function () {
                this.$listResult.addClass("hidden");
                this.show = false;
            },
            getPostData: function () {
                return {scope: this.getScope()};
            },
            getScope: function () {
                return this.searchScope;
            },
            getFDFSPath: function (path) {
                if (path.indexOf("http://") < 0) {
                    if (window.config) {
                        path = (config.FDFS_PATH || "") + "/" + path;
                    }
                }
                return path;
            },
            createAllHtml: function (data) {
                var html = "<ul class='resultsAll'>" +
                    this.createAllItemHtml(data.sound, "voice") +
                    this.createAllItemHtml(data.user, "user") +
                    this.createAllItemHtml(data.album, "album") + "</ul>";
                return html;
            },
            createAllItemHtml: function (data, scope) {
                var tit = {
                    voice: "声音",
                    user: "用户",
                    album: "专辑"
                };
                if(!data.list || (data.list && data.list.length<=0)){
                    return "";
                }
                var html = '<li><div class="resultsAll_tit">' + tit[scope] + '</div>';
                html += this.createResultHtml(data, scope);
                html += "</li>";
                return html;
            },
            createResultHtml: function (data, scope) {
                /* {"list":[{"title":"","id":""},"key":"","count":0} */
                if (!data || $.isEmptyObject(data)) return "";

                var html = "";
                if(this.options.createResultHtml){
                    html = this.options.createResultHtml.call(this, data, scope);
                    if(html){
                        return html;
                    }
                }
                if (scope == "all" && data.scope == "all") {
                    html = this.createAllHtml(data);
                    return html;
                }
                var template = resultTemplate[scope],
                    ul_cls = {
                        voice: "results",
                        album: "results",
                        user: "results"
                    },
                    temp_div = $('<div><ul class="' + ul_cls[scope] + '"></ul></div>');

                if (!template) return "";
                for (var i = 0; i < data.list.length; i++) {
                    var dd = data.list[i];
                    dd.scope = scope;
                    dd.url = this.getUrl(dd.id, scope);
                    html += template(dd);
                }
                temp_div.find("ul").append(html);
                return temp_div.html();
            },
            getUrl:function(id, scope){
                var obj = {
                    voice: "/sound/"+id,
                    album: "/album/"+id,
                    user: "/"+id
                };
                var url = obj[scope] || "";
                if(helper.isLogin()){
                    url = "#"+url;
                }
                return  url;
            },
            shortWords: function (word, len) {
                var oldLen = word.length;
                var temp = word.replace(/[\u0391-\uFFE5]/g, "..");
                var tempLen = temp.length;
                if (tempLen > len) {
                    var ll = Math.floor(len * oldLen / tempLen);
                    return word.substring(0, ll) + "...";
                } else {
                    return word;
                }
            },
            addBtnEvent: function () {
                if (this.$searchBtn.length > 0) {
                    var _this = this;
                    this.$searchBtn.on("click", function () {
                        if (!_this.$searchInput.val()) {
                            _this.$searchInput.focus();
                            return;
                        }
                        _this.chooseResult(true);
                    });
                }
            },
            beginLoading: function () {
                this.$searchPanel.addClass("is-searchPanel-search");
            },
            endLoading: function () {
                this.$searchPanel.removeClass("is-searchPanel-search");
            },
            addInputEvent: function () {
                var _this = this;

                this.$searchInput.on({
                    blur: function () {
                        setTimeout(function () {
                            _this.hideList();
                        }, 150);
                        _this.isBlur = true;
                        _this.$searchPanel.removeClass("focus");
                        _this.$searchPanel.removeClass("is-searchPanel-focus");
                    },
                    focus: function () {
                        _this.isBlur = false;
                        _this.$searchPanel.addClass("focus");
                        _this.$searchPanel.addClass("is-searchPanel-focus");
                    },
                    // 兼容ie6 7 keydown 回车键没反映
                    keypress: function (event) {
                        // if (!_this.show) return;
                        _this.holdSearch(true);
                        if (event.keyCode == opKey.enter) {
                            _this.chooseResult();
                            _this.hideList();
                            return false;
                        }
                    },
                    keydown: function (event) {
                        var code = event.keyCode;
                        for (var i = 0; i < _this.options.resultKeyCode.length; i++) {
                            if (code == _this.options.resultKeyCode[i]) {
                                _this.chooseResult();
                                _this.hideList();
                                return false;
                            }
                        }

                        if (!_this.show) return;
                        _this.holdSearch(true);
                        switch (code) {

                            case opKey.left:
                                break;
                            case opKey.right:
                                break;
                            case opKey.up:
                                var item = _this.$listResult.find(".results li");
                                var cur = _this.$listResult.find("[data-select]");
                                var index = 0;
                                item.each(function (idx, el) {
                                    if (el == cur[0]) {
                                        index = idx;
                                    }
                                });
                                if (index <= 0) {
                                    index == item.length - 1;
                                }
                                item.eq(index - 1).mouseenter();
                                return false;
                                break;
                            case opKey.down:
                                var item = _this.$listResult.find(".results li");
                                var cur = _this.$listResult.find("[data-select]");
                                var index = -1;
                                item.each(function (idx, el) {
                                    if (el == cur[0]) {
                                        index = idx;
                                    }
                                });
                                if (index >= item.length - 1) {
                                    index = -1;
                                }
                                item.eq(index + 1).mouseenter();
                                return false;
                                break;
                            default:
                                break;
                        }
                    }
                });
                // 监听input值的变化；
                this.$searchInput.on("input keyup keydown paste cut focus mousedown", function (event) {
                    // setTimeout 让paste和cut事件先执行
                    setTimeout(function () {
                        _this.onChange(event);
                    }, 0);
                });
                if(this.$searchInput.val()){
                   // this.$searchInput.trigger("focus");
                }
            },
            onChange: function (event) {
                var keyCode = event.keyCode;
                if (keyCode) {
                    for (var k in opKey) {
                        if (keyCode == opKey[k]) return true;
                    }
                }
                this.holdSearch();
            },
            holdSearch: function (nonSearch) {
                var _this = this;
                if (_this.holdTimer) {
                    clearTimeout(_this.holdTimer);
                }
                if (nonSearch) {
                    return;
                }
                _this.holdTimer = setTimeout(function () {
                    _this.doSearch(_this.$searchInput.val());
                }, 200);
            },

            doSearch: function (keywords) {
                keywords = this.cutStr($.trim(keywords));
                var post_data = this.getPostData();
                var scope = post_data.scope;
                if (this.lastKeywords == keywords && keywords != ""
                    && this.lastScope == scope) {
                    this.showList();
                    return;
                }

                this.lastKeywords = keywords;
                this.lastScope = scope;

                this.$searchInput.attr("keyowrds", keywords);
                if (!keywords) {
                    this.hideList();
                    return;
                }
                var _this = this,
                    data = {};

                data[this.options.pramName] = keywords;
                data = $.extend(data, post_data);
                this.beginLoading();
                searchModel.set(data);
                searchModel.doSearch(function (result) {
                    if (_this.lastKeywords != keywords) {
                        return
                    }
                    _this.$listResult.children().remove();
                    _this.hideList();
                    _this.searchResult(result, keywords, scope);
                    _this.endLoading();
                }, function () {
                    _this.endLoading();
                });
            },
            setScope: function (scope) {
                this.searchScope = scope;
            },
            searchResult: function (data, keywords, scope) {
                this.searchKeywords = keywords;
                scope = scope || this.searchScope || "";
                var html = "";
                html += this.createResultHtml(data, scope);
                if (!html) {
                    this.hideList();
                    return;
                }
                this.releasePlayer();
                this.$listResult.children().remove();
                this.$listResult.html(html);

                this.showList();
                this.initPlayer();
                ifollow.doBindOne(this.$listResult.find(".operateBtn[data-options]"));
            },
            chooseResult: function (isClickBtn) {
                var cur = this.$listResult.find("[data-select]");
                cur.removeAttr("data-select");

                if (!this.show || isClickBtn || cur.length == 0) {
                    var scope = this.getScope();
                    this.options.callback({scope: scope}, this.cutStr(this.$searchInput.val()), null);
                    return;
                }
                var newKeyWords = this.$searchInput.attr("keyowrds");
                if (this.searchKeywords != newKeyWords) {
                    return;
                }

                var data = {
                    scope: cur.attr("data-scope"),
                    id: cur.attr("data-id"),
                    title: cur.attr("data-title"),
                    uid: cur.attr("data-uid")
                };

                this.$searchInput.val(data.title);
                this.options.callback(data, this.searchKeywords);
            },
            release: function () {
                this.unbindEvents();
            },
            cutStr: function (str) {
                var reg = /[\u4e00-\u9fa5]/g;
                var temp_str = str.replace(reg, "aa");
                if (temp_str.length > 70) {
                    str = str.substring(0, 30);
                }
                return str;
            },
            callback: function (data, keywords) {
                if (window._hmt) {
                    _hmt.push(['_trackEvent', 'home_search', 'click']);
                }
                if (!data)data = {scope: "voice", id: "", title: ""};
                if (data.id || data.title) {
                    var p = {"voice": "/sound/", "album": "/album/", "tag": "/tag/", "user": "/"};
                    var a_url = "";
                    switch (data.scope) {
                        case  "tag":
                            a_url = p[data.scope] + data.title;
                            break;
                        case "user":
                            a_url = "/" + data.id;
                            break;
                        case "voice":
                        case "album":
                            if (data.uid) {
                                a_url = "/" + data.uid + p[data.scope] + data.id;
                            } else {
                                a_url = p[data.scope] + data.id;
                            }
                            break;
                        default:
                            a_url = "/s?q=" + encodeURIComponent(keywords) + "&qf=" + (data.scope || "");
                            break;
                    }
                    if (helper.isLogin()) {
                        a_url = "/#" + a_url;
                    }

                    window.location.href = a_url;
                } else {
                    var s_arg = "?q=" + encodeURIComponent(keywords) + "&qf=" + (data.scope || "");
                    var s_url = "/s";
                    if (helper.isLogin()) {
                        s_url = "/#/s";
                    }
                    window.location.href = s_url + s_arg;
                }
            }
        };

        var header_search = function (op) {
            var search = new HeaderSearch(op);
            return search;
        };
        header_search({
            $el: $(".searchPanel")
        });
        return header_search;
    });