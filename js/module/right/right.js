/// <summary>
/// 页面右侧
/// </summary>
define(['jquery', 'underscore', 'backbone', 'model/tag', 'plugin/dialog'], function ($, _, Backbone, TagModel, dialog) {
	$("body").on("click", ".recommendTagsBar .tab_item", function () {
        var $el = $(this);
        var $parent = $el.parent();
        var $recommendTagsBar = $el.closest(".recommendTagsBar");
        $recommendTagsBar.find(".tab_content,.tab_item").removeClass("on");
        var index = $parent.find(".tab_item").index($el);
        $el.addClass("on");
        $recommendTagsBar.find(".tab_content").eq(index).addClass("on");
    });
	$("body").on("click", '.addTagBtn', function () {
		var $addTagBtn = $(this);
		var $tag = $addTagBtn.closest(".addTagOperate");
		var $input = $tag.find("input");
		$addTagBtn.hide();
		$tag.find("div").fadeIn(200);
		//$tag.addClass("on");
		$input.focus();
	});
	$("body").on("click", '.addTagOperate', function (event) {
		return false;
	});
	$("body").on("click", function (event) {
		var $tag = $(".addTagOperate");
		if($tag.size()){
			var $input = $tag.find("input");
			//$tag.removeClass("on");
			$tag.find("div").fadeOut(200, function(){
				$input.val("");
				$tag.find(".addTagBtn").show();				
			});
		}
	});
	$("body").on("keydown", '.addTagOperate input', function (event) {
		if (event.keyCode === 13) {
			var $el = $(this);
			var $tag = $el.closest(".addTagOperate");
			var $confirm = $tag.find(".editConfirm");
			var $input = $tag.find("input");
			$input.blur();
			$confirm.click();
		}
	});
	$("body").on("click", '.addTagOperate .editConfirm', function () {
		var $el = $(this);
		var $tag = $el.closest(".addTagOperate");
		var $tagsBox = $tag.closest(".tagsBox");
		var $input = $tag.find("input");
		var name = $input.val();
		var html = '<a class="tagBtn" href="/#/tag/'+name+'/"><span>'+name+'</span><div class="del"></div></a>';
		if(name){
			var model = new TagModel({
				tagName:name
			});
			if($el.data("is_querying")) return;
			$el.data("is_querying", true);
			model.create(function(){
				//$tag.removeClass("on");
				$tag.find("div").fadeOut(200, function(){
					$tag.find(".addTagBtn").show();					
					$input.val("");
				});
				$(html).appendTo($tagsBox).hide().fadeIn(200);
				$el.data("is_querying", false);
			}, function(msg){
				dialog.alert(msg);
				$el.data("is_querying", false);
			});
		}
	});
	$("body").on("click", '.tagBtn .del', function () {
		var $el = $(this);
		var $tag = $el.closest(".tagBtn");
		var name = $tag.find("span").text();
		var model = new TagModel({
			tagName:name
		});
		model.switchFollowedTag();
		$tag.fadeOut(200);
		return false;
	});
    $("body").on("click", '.homeNavMoreBar a.off', function () {
        var $el = $(this);

        $("li.message,li.comment,li.at").slideToggle(200, "linear");
        $el.toggleClass("on");

        if ($el.hasClass("on")) {
            $el.text("收起");
        } else {
            $el.text("展开");
        }
    });
    /* xiaoqing  start*/
    //右侧 你可能感兴趣的电台
    var $dom = $(document);
    //展开
    $dom.on("click", ".personPanelBar3 .selectBtn", function(){
        var $btn = $(this),
            $panel = $btn.closest(".personPanelBar3");
        $panel.toggleClass("is-open");
        if($panel.hasClass("is-open")){
            $btn.addClass("on");
        }else{
            $btn.removeClass("on");
        }

    });
    //关闭
    $dom.on("click", ".personPanelBar3 .closeBtn", function(){
        var $btn = $(this),
            $item = $btn.closest(".listItem");
        $item.slideUp(function(){
            $item.remove();
        });
    });
    //换一组
    function getRandomArr(maxLen, len){
        var arr = [];
        while (maxLen--) {
            arr[maxLen] = maxLen;
        }
        var return_arr = [];
        while (len--) {
            var num = parseInt(Math.random() * arr.length);
            return_arr.push(arr[num]);
            arr.splice(num, 1);
        }
        return return_arr;
    }
    $dom.on("click",".recommendedBar .more", function(){
        var $bar = $(this).closest(".recommendedBar"),
            $list = $bar.find(".personPanelBar3List"),
            $items = $list.children();
        $items.hide();
        var len = $items.length;
        if (len <= 6) {
            $items.show();
            return;
        }
        var random_arr = getRandomArr(len, 6);
        for (var i = 0; i < random_arr.length; i++) {
            $items.eq(random_arr[i]).show();
        }
    });
    /* end */
});
