/*xiaoqing*/
define(['jquery', 'module/dialogs/copyright', "helper", "module/dialogs/zawan"], function($, dialog, helper, zawan){
    $("#apply_deal").off("click").click(function(){
        dialog.applyDeal();
    });
    $(".apply_deal").off("click").click(function(){
        dialog.applyDeal();
    });

    $("#copy_right").off("click").click(function(){
        dialog.copyright();
    });
    $(".copy_right").off("click").click(function(){
        dialog.copyright();
    });
    $(".j_friendly_link").click(function(){
        $(".footer_friendly_link").toggle();
        $(".footer-other .bomb-layer").not(".footer_friendly_link").hide();
    });
    $(".j_hot_sound").click(function(){
        $(".footer_hot_sound").toggle();
        $(".footer-other .bomb-layer").not(".footer_hot_sound").hide();
    });
    $(".j_personal_radio").click(function(){
        $(".footer_personal_radio").toggle();
        $(".footer-other .bomb-layer").not(".footer_personal_radio").hide();
    });

    $(".register-tip-video").on("click",function(){
        zawan.open();
    });

    var unloginBottomTip = {
        init:function(){
            var $tip = $(".register-tip");
            if($tip.length == 0){
                return;
            }
            this.addEvent();
            this.initDigit();
        },
        addEvent:function(){
            var $tip = $(".register-tip");
            $tip.find(".register-tip-btn2").click(function(){
                $tip.animate({height:15}, 120);
            });
            $tip.on("mouseenter",function(e){
                if($(e.target).hasClass("register-tip-btn2")){
                    return;
                }
                $tip.animate({height:80}, 120);
            });
            $(".register-tip-panel a").click(function(e){
                var $a = $(this),
                    type = $a.index()+ 1,
                    baidu = $a.attr("data-baidu");
                 helper.login(type, baidu);
            });
        },
        getData:function(){
            var _this = this;
            $.ajax({
                url:"/global_counts_json",
                type:"post",
                dataType:"json",
                success:function(result){
                    _this.user_digit = result.users+"";
                    _this.voice_digit = result.tracks+"";
                    _this.createDigit();
                },
                error:function(){

                }
            });
        },
        initDigit:function(){
            //todo 还没有数据来源
            this.getData();
            var _this = this;
            //不需要动态了
           /*setInterval(function(){
                _this.getData();
            },60000);*/
        },
        createDigit:function(){
            var _this = this;
            var $user_digit = $("#user_digit"),
                $voice_digit = $("#voice_digit");
            if(!$user_digit.size() || !$voice_digit){
                return;
            }
           // setInterval(function(){
                if(!_this.user_digit) return;
                _this.addDigit($user_digit, _this.user_digit);
          //  },3000);
            setTimeout(function(){
                if(!_this.voice_digit) return;
                _this.addDigit($voice_digit, _this.voice_digit);
            },200);
        },
        addDigit:function($user_voice_digit, new_digit){
            new_digit = new_digit + "";
            var old_digit = $user_voice_digit.attr("data-digit") || "0",
                i = 0;
            $user_voice_digit.attr("data-digit", new_digit);
            if(new_digit == old_digit) return;

            var new_len = new_digit.length,
                old_len = old_digit.length;
            if(new_len>old_len){
                for( i= 0;i<new_len - old_len;i++){
                    var $clone = $user_voice_digit.children().first().clone();
                    $clone.find(".digit").text("");
                    $clone.appendTo($user_voice_digit);
                }
            }
            var new_digit_arr = new_digit.split(""),
                old_digit_arr = old_digit.split("");
            for(i=new_len-1;i>=0;i--){
                if(new_digit_arr[i] != old_digit_arr[i]){
                    var $digit = $user_voice_digit.children().eq(i).find(".digit");
                    $digit.text(new_digit_arr[i]);
                    (function(el, num){
                        setTimeout(function(){
                            el.animate({"fontSize":40,marginLeft:-8}, 100, function(){
                                $(this).animate({"fontSize":16,marginLeft:0}, 100);
                            });
                        },100*(new_len-num));
                    })($digit, i);

                }
            }
        }
    };
    $(document).ready(function(){
        unloginBottomTip.init();
    });

    var footer = {
        unloginBottomTip:unloginBottomTip
    };
    return footer;
});