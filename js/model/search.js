/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-3-6
 * Time: 下午2:39
 * To change this template use File | Settings | File Templates.
 */

define(['jquery', 'underscore', 'backbone'], function ($, _, Backbone) {
    var Model = Backbone.Model.extend({
        defaults: {
            scope: "",
            keywords: undefined,
            title: undefined
        },
        searchUrl:"/s/search/suggest",
        setSearchUrl:function(url){
            this.searchUrl = url;
        },
        doSearch: function (success, error) {
            success = success || $.noop;
            error = error || $.noop;

            var url = this.searchUrl,
               data = this.toJSON();
            $.ajax({
                url: url,
                type: "get",
                cache: false,
                data: data,
                dataType: "json",
                success: function (result) {
                    success(result);
                },
                error: function (data) {
                    error(data);
                }
            });
        },
        doSearchUsers: function (success, error) {
            success = success || $.noop;
            error = error || $.noop;

            $.ajax({
                url: "/quan_suggest?q=" + this.get("keywords"),
                type: "get",
                success: function (result) {
                    success(result);
                },
                error: function (data) {
                    error(data);
                }
            });
        }
    });
    return Model;
});
