/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-27
 * Time: 下午3:06
 * To change this template use File | Settings | File Templates.
 * 我的声音，他的声音，我的专辑，他的专辑，我喜欢的声音，他喜欢的声音，我的关注，他的关注，我的粉丝，他的粉丝
 */

define([
    'jquery',
    'underscore',
    'backbone'],
    function ($, _, Backbone) {
        var View = Backbone.View.extend({
            init: function () {
                this.$el = $(document);
                this.bindEvents();
            },
            bindEvents: function () {
                 var  _this = this;
                this.$el.on("click",".searchPanel2 .search_btn", function(){
                    _this.searchResult( $(this).parent().find(".search_input"));
                });
                this.$el.on("keyup",".searchPanel2 .search_input", function(e){
                    if (e.keyCode == 13) {
                        _this.searchResult($(this));
                    }
                });
            },
            searchResult: function ($input) {
                var key = $.trim($input.val());
               // if(!key) return;
                var data = "q:"+decodeURIComponent(key);
                var options = $input.attr("data-options");
                if (options) {
                    data += "," + options;
                }

                var href = window.location.href;
                if (href.indexOf("?")) {
                    href = href.replace(/\?.*/, "");
                }
                data = data.replace(/\:/g, "=").replace(/\,/g, "&");
                window.location.href = href + "?" + data;
            },
            release: function () {
                this.$el.off("click",".search_btn");
                this.$el.off("keyup",".search_input");
            }
        });
        var view = new View();
        view.init();
        return view;
    });