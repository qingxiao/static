/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-2-26
 * Time: 上午10:53
 * To change this template use File | Settings | File Templates.
 */

define(['jquery'], function ($) {
    /*
     * <span class="ph_input">
         <span class="ph_label" style="display: inline;">手机号/邮箱</span>
         <input type="text" >
     </span>
     * */
    $.fn.placeholder = function (options) {
        var defaults = {
            focusClass:"input_1",  // textarea获得焦点时，wrap的class
            label:'span',            //placeholder的文本容器
            text:""                   //placeholder的文本内容
        };
        options = $.extend(defaults, options);

        this.each(function () {

            var wrap = $(this),
                input = wrap.find("input, textarea"),
                label = wrap.find(options.label);
            //避免重复绑定事件
            if(wrap.attr("is-placeholder")){
                return true;
            }
            wrap.attr("is-placeholder", true);
            if(options.text){
                label.text(options.text);
            }
            wrap.click(function () {
                input.focus();
            });

            //检查label是否要显示
            var reset_ph = function(){
                if (!input.val()) {
                    label.show();
                } else {
                    label.hide();
                }
            };

            input.bind({
                blur:function () {
                    reset_ph();
                    wrap.removeClass(options.focusClass);
                },
                focus:function () {
                    label.hide();
                    wrap.addClass(options.focusClass);
                }
            });

            //防止浏览器自动填充，placeholder不消失；
            setTimeout(function () {
                reset_ph();
            }, 150);

            //防止意外情况 label显示不正确
            var one_off = function () {
                label.hide();
                wrap.addClass(options.focusClass);
                //input.unbind("keypress keydown keyup mousedown", one_off);
            };
            input.bind("keypress keydown keyup mousedown", one_off);
        });
        return this;
    };
    return $;
});
