/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-6-8
 * Time: 下午3:17
 * To change this template use File | Settings | File Templates.
 */

define(["jquery", "plugin/dialog"], function ($, dialog) {
    var addToAlbum = {
        open: function (callback) {
            this.callback = callback || $.noop;
            if(this._isAjax){
                return;
            }
            if(!this.pop){
                this.getSoundList();
            }else{
                this.pop.open();
            }

        },
        getSoundList:function(){
            var _this = this;
            this._isAjax = true;
            $.ajax({
                url:"/handle_album/sound_list",
                type:"get",
                dataType:"json",
                success:function(result){
                    _this._isAjax = false;
                    _this.createPop(result);
                }
            });
        },
        createListHtml:function(data){
            var str = "";
            for(var i=0;i<data.length;i++){
                var dd = data[i];
                str += '<li data-id="'+dd.id+'" data-title="'+dd.title+'"><span>'+dd.title+'</span><a class="addItemBtn"></a><a class="delItemBtn"></a></li>';
            }
            return str;
        },
        createPop: function (data) {
            var li_html = this.createListHtml(data);

            var html = '<strong>等待添加</strong>' +
                '<ul class="addTo">'+ li_html +'</ul>' +
                '<strong>已添加</strong>' +
                '<ul class="delFrom"></ul>' +
                '<div class="operate"><a class="confirmBtn" href="javascript:;">确认</a><a class="cancelBtn"  href="javascript:;">取消</a></div>';
            var op = {
                id:"addToAlbum2",
                hide:true,
                dialogClass:"addtoalbum2",
                header:"添加至专辑",
                content:html
            };

            var pop = new dialog.Dialog(op);
            pop.open();
            this.pop = pop;
            this.$el = pop.getEl();
            this.bindEvents();
        },
        bindEvents: function () {
            var _this = this,
                $el = this.$el,
                $addTo = $el.find(".addTo"),
                $delFrom = $el.find(".delFrom");
            $addTo.on("click", "li .addItemBtn", function(){
                var $li = $(this).closest("li");
                $li.appendTo($delFrom);
            });
            $delFrom.on("click", "li .delItemBtn", function(){
                var $li = $(this).closest("li");
                $li.appendTo($addTo);
            });
            $el.on("click", ".confirmBtn", function(){

                _this.callback($delFrom.children());
                _this.pop.close();
            });
            $el.on("click", ".cancelBtn", function(){
                $delFrom.children().appendTo($addTo);
                _this.pop.close();
            });
        },
        delSound:function(id){
            var _this = this,
                $el = this.$el,
                $addTo = $el.find(".addTo"),
                $delFrom = $el.find(".delFrom");
            $delFrom.find("[data-id="+id+"]").appendTo($addTo);
        }
    };
    return addToAlbum;
});