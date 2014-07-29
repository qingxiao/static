/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-16
 * Time: 上午11:38
 * To change this template use File | Settings | File Templates.
 */

define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
    var Model = Backbone.Model.extend({
        defaults:{
            "page":1,
            "per_page":5
        },
        cache:{},
        getData:function( success, error){
            success = success || $.noop;
            error = error || $.noop;

            var url = "/"+this.get("uid")+"/sound_list",
                data = this.toJSON(),
                _this = this,
                cacheData  = _this.cache[this.get("page")];
            if(cacheData){
                success(cacheData);
                return;
            }
            $.ajax({
                url:url,
                type:"get",
                cache:false,
                data:data,
                dataType:"json",
                success:function (result) {
                    _this.cache[result.page] = result;
                    success(result);
                },
                error:function (data) {
                    error(data);
                }
            });
        }
    });
    return Model;
});

