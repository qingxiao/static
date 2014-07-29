define(['model/user', 'module/dialogs/login_box','helper', 'module/dialogs/imageslider','./header/header', './right/right', 'module/foot', 'module/common/backtotop', 'module/my/search_input'],
    function (UserModel, login_box, helper, imageslider) {
	$(window).bind("scroll", window_onscroll_callback);
	var $header = $(".header").eq(0);
	var $footer = $(".footer").eq(0);
	var $discoverMenu = $(".discoverMenu").eq(0);
	var $floatHeader = $(".floatHeader").eq(0);
	var footerHeight = $footer.height();
	var headerHeight = $header.height();
	var floatHeaderHeight = $floatHeader.height();
	var discoverMenuHeight = 110;
	var $document = $(document).eq(0);
	function window_onscroll_callback() {
		refreshFloatHeader();
		refreshFixedBox();
	}
	function refreshFloatHeader(){
		var scrollTop = $document.scrollTop();
		var gap = headerHeight + ($discoverMenu.is(":hidden")?0:discoverMenuHeight);
		$floatHeader.toggleClass("is-fixed", (scrollTop >$header.offset().top+gap));
	}
	function checkFixedBox($fixedBox){
		if($fixedBox.parents(".mainbox_right").size()){
			if($(".mainbox_right").height() > $(".mainbox_left").height()){
				return false;
			}			
		}
		return true;		
	}
	function refreshFixedBox(){
		var scrollTop = $document.scrollTop();
		var $fixedBoxs = $(".fixedBox");
		var top = floatHeaderHeight;
		if($document.height()+document.documentElement.clientHeight<$document.scrollTop()) return;
		if($document.height()<document.documentElement.clientHeight+$document.scrollTop()) return;
		$.each($fixedBoxs, function(index, fixedBox){
			var $fixedBox = $(fixedBox);
			if(!checkFixedBox($fixedBox)){
				$fixedBox.removeClass("is-fixed");
				return;
			}
			if($fixedBox.is(".is-fixed")){
				var lastScrollTop = $fixedBox.data("scrollTop");
				if(lastScrollTop>scrollTop){
					$fixedBox.removeClass("is-fixed");
					return;
				}
			}else{
				var floatBoxOffsetTop = $fixedBox.offset().top;
				if(scrollTop + floatHeaderHeight + 10> floatBoxOffsetTop){
					$fixedBox.addClass("is-fixed");
					$fixedBox.data("scrollTop", scrollTop);
				}else{
					return;
				}
			}
			var footerOffsetTop = $footer.offset().top;
			var height = $fixedBox.height();	
			var gap = height + top -  document.documentElement.clientHeight;
			if(gap>0){
				top = top - gap;
			}
			gap = height + top + scrollTop - footerOffsetTop;
			if(gap>0){
				top = top - gap;
			}
			$fixedBox.css({
				top:top
			});
		});
	}
	$(document).ajaxComplete(function(event, xhr, settings){
		if(xhr.status == 400){
            login_box.open();
		}
	});

    //右侧二维码
    (function(){
        var cookie_name = "close_download";
        $document.on("click", ".downloadApp .closeBtn", function(){
            $(".downloadApp").hide();
            $.cookie(cookie_name, true, 24*60*60);
        });
        if($.cookie(cookie_name)){
            $(".downloadApp").hide();
        }else{
            $(".downloadApp").show();
        }

    })();
    //声音图片 幻灯片
        $document.on("click", "[sound_popsrc]", function(){
            var id = $(this).attr("sound_popsrc");
            imageslider.open(id);
            return false;
        });

	var common = {
		userModel: new UserModel(config.CURRENT_USER, {parse:true}),
		refreshFixedBox : refreshFixedBox,
		refreshFloatHeader : refreshFloatHeader
	};
	return common;
});