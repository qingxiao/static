/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-1-31
 * Time: 下午4:49
 * To change this template use File | Settings | File Templates.
 */
define(["../../lib/jquery","underscore", 'backbone','helper','model/soundwall',"greensock/TweenMax"],function($, _, Backbone, helper, SoundWallModel){
    var SoundWall = Backbone.View.extend({
        default_img:"",
        max_width:150,
        max_height:150,
        moving:false,
        model: new SoundWallModel(),
        el:"#logosWrapper",
        _item_template:
            '<div class="wall-item" style="width:<%= width %>px;height:<%= height %>px;">' +
                '<div class="img-wrap" style="<%= ie_style %>" >' +
                /* '<div style="">'+*/
                '<img src="<%= src %>" style="width:<%= width %>px;height:<%= height %>px;"/>' +
                /* '<div class="img-cover"></div>' +*/
                /*'</div>'+*/

                '</div>' +
                '<span class="wall-btn-play"></span>' +
                '<span class="sound-title"><%= title %></span>' +
                '</div>',
        init:function(el){
            this.$el = $(el);
            this.model.set("uid", this.$el.attr("uid"));
            this.imageTimeline = new TimelineLite();
            this.btnTimeline = new TimelineLite();
            this.bindEvents();
            this.getData();
            if (helper.browser.msie && parseInt(helper.browser.version) <= 8) {
               this.$el.attr("onselectstart", "javascript:return false;");
            }
        },
        nextPage:function(){
            this.getData();
        },
        getData:function(){
            var _this = this;
            this.model.getData(function(data){
                if(Math.ceil(data.count/data.per_page)>data.page){
                    _this.model.set("page", data.page+1);
                    _this.imagesShowBefore(data.list);
                }else{
                    _this.model.set("page", 1);
                }

            });
        },
        bindEvents:function(){
            this.$el.delegate(".wall-item .wall-btn-play",{
                mouseenter:function () {
                    var $item = $(this).closest(".wall-item");
                    var tt =   $item.attr("data-timeout");
                    if(tt){
                        clearTimeout(parseInt(tt));
                        $item.removeAttr("data-timeout");
                    }
                    return;
                },
                mouseleave:function () {
                    var $item = $(this).closest(".wall-item");
                    $item.attr("data-form-btnplay", true);
                    return;
                }
            });
            var _this = this;
            this.$el.delegate(".img-wrap", {
                mouseenter:function(e){
                    e.stopPropagation();
                },
                mouseleave:function(e){
                    e.stopPropagation();
                }
            });
            this.$el.delegate(".wall-item .img-wrap", {
                mouseenter:function (evt) {
                    var $wallItem = $(this).closest(".wall-item");
                  //  $wallItem.addClass("hover");
                  //  _this.btnTimeline.to($wallItem.find("img"),0,{scale:1.1});
                     enter($wallItem);
                },
                mouseleave:function () {
                    var $wallItem = $(this).closest(".wall-item");
                   // $wallItem.removeClass("hover");
                  //  _this.btnTimeline.to($wallItem.find("img"),0,{scale:1});
                    leave($wallItem);
                }
            });

            var timeout;
            function leave($item) {

                $item.removeAttr("data-form-btnplay");
                timeout = setTimeout(function () {
                    $item.removeClass("hover");
                    $item.find(".sound-title").css("visibility", "hidden");
                      _this.btnTimeline.to($item.find("img"),0,{scale:1});
                }, 0);
                $item.attr("data-timeout", timeout);
            }



            function enter($item) {
                if($item.attr("data-form-btnplay")) return;
                var current = $item.parent().children(".hover");
                current.removeClass("hover");
                current.find(".sound-title").css("visibility", "hidden");
                current.removeAttr("data-form-btnplay");

                var title = $item.find(".sound-title");
                title.css("visibility", "hidden");
                var width = title.attr("data-width");
                $item.addClass("hover");

                if(!width){
                    width = title.width();
                    title.attr("data-width", width);
                }
                _this.btnTimeline.stop();
                _this.btnTimeline = new TimelineLite();
                _this.btnTimeline.set(title, {visibility:"visible"});
                 _this.btnTimeline.to($item.find("img"),0,{scale:1.1});
                //_this.btnTimeline.fromTo(title, 0.4, {rotationX:"-270deg", top:-80,  ease:Back.easeOut,width:0},{rotationX:"0deg",top:-30,width:width});
                // _this.btnTimeline.fromTo(title, 1 , {width:0},{width:width, ease:Back.easeOut});
            }
        },
        imagesLoad:function(datalist){
            var imageData = [];
            var _this = this;
            for (var i = 0, j = 0, len = datalist.length; i < len; i++) {
                var img = new Image();
                img.onerror = function () {
                    j++;
                    var idx = this.getAttribute("data-idx");
                    var title = this.getAttribute("data-title");
                    var error_src = "";
                    imageData[idx] = [_this.default_img, title];
                    if (j == len) {
                        _this.imagesLoaded(imageData);
                    }
                };
                img.onload = function () {
                    j++;
                    var idx = this.getAttribute("data-idx");
                    var title = this.getAttribute("data-title");
                    imageData[idx] = [this.src, title];
                    if (j == len) {
                        _this.imagesLoaded(imageData);
                    }

                };
                var data = datalist[i];
                img.setAttribute("data-idx", i);
                img.setAttribute("data-title", data.title);
                img.src = data.cover_path_142;
                img = null;
            }
        },
        imagesLoaded:function(imageData){
            var maxW = this.max_width,
                maxH = this.max_height,
                item_str = "";
            for (var i = 0; i < imageData.length; i++) {
                var data = imageData[i],
                    src = data[0],
                    title = data[1],
                    width= 120,
                    height = 120;

                var imgStyle = 'style="';
                if (width/height >= maxW/maxH) {
                    if (width > maxW) {
                        height = parseInt(height * (maxW / width));
                        width = maxW;
                    }
                } else {
                    if (height > maxH) {
                        width = parseInt(width * (maxH / height));
                        height = maxH;
                    }
                }
                var ie_style = '';
                //兼容ie8以下的  不然旋转后图片被切掉边
                if (helper.browser.msie && parseInt(helper.browser.version) <= 8) {
                    var padding_width = Math.ceil(Math.sqrt(height * height + width * width) / 2);
                    ie_style = 'padding:' + padding_width + 'px;margin:' + (-1 * padding_width) + 'px;';
                }
                var temp_data = {
                    width:width,
                    height:height,
                    src:src,
                    title:title,
                    ie_style:ie_style
                };
                item_str += _.template(this._item_template)(temp_data);
            }
            this.$el.html(item_str).css("visibility","hidden");
            this.imagesShow();
        },
        imagesShow:function(){
            var img_wrap = this.$el.find(".img-wrap"),
                from_top = 200;

            this.imageTimeline.set(img_wrap, {top:-from_top});
            this.imageTimeline.set(this.$el,{visibility:"visible"});
            for (var i = 0; i < img_wrap.length; i++) {
                var to_rotation = parseInt(Math.random() * 45) * ((parseInt(Math.random() * 10) / 2) == 0 ? 1 : -1),
                    r = (parseInt(Math.random() * 10) / 2) == 0,
                    form_rotation = (r ? 1 : -1) * 120,
                    left = (r ? "+=" : "-=") + this.max_width,
                    ease = Back.easeOut;
                this.imageTimeline.fromTo(img_wrap.eq(i), 0.2, {top:-from_top, left:left, rotation:form_rotation, ease:ease}, {top:0, left:0, rotation:to_rotation, ease:ease}, i == 0 ? "+=0" : "-=0.1");
                // this.imageTimeline.fromTo(img_wrap[i], 0.2, {top:-from_top, left:left,  ease:ease}, {top:0, left:0, ease:ease}, i == 0 ? "+=0" : "-=0.1");
            }
            return;
        },
        imagesShowBefore:function(datalist){
            var img_wrap = this.$el.find(".img-wrap"),
                top = this.$el.height();

            var counter = img_wrap.length;
            if(counter == 0){
                this.imagesLoad(datalist);
                return;
            }
            if(this.moving){
                return;
            }

            // this.imageTimeline.stop();
            // this.imageTimeline = new TimelineLite();
            var left = this.max_width;
            this.moving = true;
            var _this = this;
            this.imageTimeline.staggerTo(img_wrap,0.2, {top:-top, rotation:90, left:"+="+left, opacity:0,ease:Back.easeIn, onComplete:function(){
                counter--;
                if(counter<=0){
                    _this.$el.empty();
                    _this.imagesLoad(datalist);
                    _this.moving = false;
                }
            }}, 0.1);
        },
        imageShowCache:function(){

        },
        release:function(){}
    });

    return SoundWall;
});