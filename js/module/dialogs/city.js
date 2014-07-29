/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-7-19
 * Time: 下午5:51
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "plugin/dialog", "./city_data"], function ($, dialog, city_data) {


    //var directly = city_data.directly,
    var    china = city_data.china;

    var city = {
        open:function (fn, option) {
            this.callback = fn || $.noop;
            if(this.popDialog){
                this.popDialog.open();
            }else{
                this.createPop(option);
            }
        },
        createPop:function (option) {
            var html = '<div>'+this.getItemsHtml(china)+'</div><div class="town content-expand"></div>';
            var op = $.extend({
                id:"dialog_city",
                hide:true,
                dialogClass:"location",
                header:"选择您的所在地",
                content:html
            },option);

            var pop = new dialog.Dialog(op);
            pop.open();
            this.popDialog = pop;
            this.bindEvents();
        },
        getItemsHtml:function(data, province){
            var html = "";
            for (var i = 0, l = data.length; i < l; i++) {
                var c = data[i];
                html += '<a  href="javascript:;" has_child="' + (c.has_child ? "yes" : "no") + '"  province="' + (province||"")  + '">'+ c.name+'</a>';
            }
            return html;
        },
        bindEvents:function () {

            var $el = this.popDialog.getEl(),
                $body = $el.find(".bd"),
                $town = $body.find(".town"),
                _this = this;

            $body.on("click", "a", function(){
               var $a = $(this),
                   text = $a.text();
                $a.parent().children(".on").removeClass("on");
                $a.addClass("on");

                if ($a.attr("has_child") == "no") {
                    var pro = $a.attr("province") || "";

                    _this.callback(pro, text);
                    _this.popDialog.close();
                } else {
                    var data = china[$a.index()].children;
                    if (data) {
                        $town.empty().html(_this.getItemsHtml(data, text));

                    }
                }
            });
            $body.find("a").eq(0).trigger("click");
        }
    };
    return city;
});
