/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-8-30
 * Time: 下午2:23
 * To change this template use File | Settings | File Templates.
 */
define(['jquery','plugin/jquery.placeholder'],function($){

    return function(tag){
        if(window.console){
            console.log("plugin/placeholder--->plugin/jquery.placeholder");
        }
        $(tag).placeholder();
    };
    /*
    function reset_ph($input){
        $input.each(function(){
            var input = $(this);
            if (!input.val()) {
                input.parent().find("span").show();
            } else {
                input.parent().find("span").hide();
            }
        });

    }

    var placeholder = function (tag) {
        var warp = $(tag);

        warp.click(function () {
            $(this).find("input, textarea").focus();
        });

        var input = warp.find("input, textarea");
        input.bind("blur", function () {
            var _this = $(this);
            reset_ph(_this);
            _this.parent().removeClass("input_1");
        });
        input.bind("focus", function () {
            var _this = $(this);
            _this.parent().find("span").hide();
            _this.parent().addClass("input_1");
        });

       // input.attr("autocomplete", "off");
       // reset_ph(input);
        setTimeout(function(){
            reset_ph(input);
        },150);
        var one_off = function(){
            var _this = $(this);
            _this.parent().find("span").hide();
            _this.parent().addClass("input_1");
            //input.unbind("keypress keydown keyup mousedown", one_off);
        };
        input.bind("keypress keydown keyup mousedown", one_off);

    };
    return placeholder;*/
});
