/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-8-13
 * Time: 下午2:18
 * To change this template use File | Settings | File Templates.
 * 根据id获取声音图片
 */
define([ 'jquery', 'underscore', 'backbone' ], function($, _, Backbone) {
    var Model = Backbone.Model.extend({

        cache:{},
        getData:function(imgId, success, error){
            success = success || $.noop;
            error = error || $.noop;

            var url = '/sounds/'+imgId+'/pictures',
                _this = this,
                cacheData  = this.cache[imgId];
            /*if(cacheData){
                success(cacheData);
                return;
            }*/
            $.ajax({
                url:url,
                type:"get",
                cache:false,
                dataType:"json",
                success:function (result) {
                    _this.cache[imgId] = result;
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
