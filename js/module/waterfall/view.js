define(['jquery', 'underscore', 'backbone', 'module/waterfall/model', "module/player/player", "module/wave","helper"], function ($, _, Backbone, Model, player, wave, helper) {
    var View = Backbone.View.extend({
        pinTemplate:_.template(['<div id="pin<%=id%>" sound_id="<%=id%>" class="waterfall-item">',
            '<div class="PinHolder">',
            '<img style="height: <%= imgHeight%>px;" class="PinImageImg" data-componenttype="MODAL_PIN" alt="chunky oversized sweater - fall outfit" src="http://media-cache-lt0.pinterest.com/upload/201043570835712950_jnuXktzc_b.jpg">',
            '</div>',
            '<p class="description">chunky oversized sweater - fall outfit</p>',
            '<p class="stats colorless">',
            '<span class="LikesCount">84 likes</span>',
            '<span class="CommentsCount hidden"></span>',
            '<span class="RepinsCount">254 repins</span>',
            '</p>',
            '<div class="convo attribution clearfix">',
            '<img alt="" src="http://media-cache-ec5.pinterest.com/avatars/gracereed_1348458110.jpg">',
            '<p class="NoImage">',
            '<a data-elementtype="PIN_USER" href="/gracereed/">Grace Reed</a> via <a data-elementtype="PIN_REPIN_USER" href="/hannahlouisec/">Hannah Chiasson</a> onto <a data-elementtype="PIN_BOARD_PIN" href="/gracereed/things-that-give-me-a-reality-check-when-i-open-my/">things that give me a reality check when I open my real closet...</a>',
            '</p>',
            '</div>',
            '</div>'].join("")),
        colTops:[],
        colLefts:[],
        init:function(data){
            var _this = this;
            this.model.init(data);
            this.model.getFirst(function(){
                _this.controlWindowScroll();
            });
            $(this.el).height(0);
            this.showLoading();
        },
        initCols:function () {
            var model = this.model,
                colNum = model.get("colNum"),
                pinWidth = model.pinWidth(),
                gapWidth = model.gapWidth();
            this.colLefts = [];
            this.colTops = [];
            for (var i = 0; i < colNum; i++) {
                this.colTops[i] = 0;
                this.colLefts[i] = i * (pinWidth + gapWidth);
            }
        },
        setTemplate:function (html) {
            this.pinTemplate = _.template(html);
        },
        render:function (model) {
            var pinIds = model.get("pinIds");
            this.initCols();
            if (pinIds.length) {
                this.$el.css({"visibility":"hidden", "opacity":0.5});
                this.calculate(model, pinIds);
                this.$el.css("visibility", "visible").animate({
                    opacity:1
                }, 400);
            }
        },
        setInitTop:function (colTop) {
            var gapHeight = this.model.gapHeight();
            this.colTops[0] = gapHeight + colTop;
        },
        calculate:function (model, pinIds) {
            var isLogin = helper.isLogin();
            var gapHeight = model.gapHeight(),
                colTops = this.colTops,
                colLefts = this.colLefts,
                $box = $('<div class="waterfall-pinsbox" style="opacity:0.5;"></div>'),
                _this = this;

            var $pin_holder = $("#pin_holder");

            for (var i = 0, len = pinIds.length; i < len; i++) {
                var pinId = pinIds[i],
                    pin = model.getPin(pinId),
                    imgHeight = pin.explore_height || 0,
                    minColTop = _.min(colTops),
                    index = _.indexOf(colTops, minColTop),
                    colLeft = colLefts[index],
                    left = colLeft,
                    top = minColTop;
                pin.waveform = config.FDFS_PATH+ "/"+  pin.waveform;
                pin.url = "/"+pin.uid+"/sound/"+pin.id;
                if(isLogin){
                    pin.url = "#"+pin.url;
                }
                pin.short_intro = _this.shortIntro(pin.short_intro);

                var pinHtml = this.renderPin(pin);
                var $pinItem = $(pinHtml);
                $pinItem.css({
                    left:left + "px",
                    top:top + "px"
                }).appendTo($box);

                 //计算高度
                var pinHeight = 0;

                if(pin.waterfall_image){
                    pinHeight = imgHeight || 180;
                    $pinItem.find(".img_wrap img").css("height", pinHeight);
                }else{
                    pinHeight = 40;
                }



                var $clone = $pinItem.clone();
                $clone.find(".float_info, .img_wrap").remove();
                $pin_holder.append($clone);
                pinHeight += $pin_holder.children(0).height();
                colTops[index] = top + pinHeight + gapHeight;
                $pin_holder.empty();

            }

            var canGetMore = _this.model.canGetMore(),
                $el = $(this.el);

            if ($box.children().size()){
                $box.appendTo($el).animate({opacity:1}, 200);
            }

            if (!canGetMore){
                _this.hideLoading();
            } else{
                _this.showLoading();
            }

            var canvas = document.createElement("canvas");
            if (canvas.getContext){
                player.render({$container:$box, color:"transparent"});
            }else{
                $box.find(".waterfall_item").each(function(){
                    var $item = $(this);
                    if($item.hasClass("lack_img")){
                        player.render({$container:$item, color:"transparent"});
                    }else{
                        player.render({$container:$item, color:"transparent", waveRenderDelay:true});
                        $item.find(".playBtn").attr("data-wavedelay" , true);
                    }
                });
                $box.on("click", "[data-wavedelay]", function(){
                       var $btn = $(this),
                           $item = $btn.closest(".waterfall_item");
                         wave.render({$container:$item, color:"transparent"});
                });
            }

            canvas = null;

            $el.height(_.max(colTops)).html();

        },
        shortIntro:function(intro){
            intro = intro || "";
            var len = 30;
            if(intro.length >len){
                return intro.substring(0, len)+"...";
            }
            return intro;
        },
        appendPinIds:function (model, pinIds) {
            this.calculate(model, pinIds);
            player.appendSoundIds(pinIds);
        },
        renderPin:function (pin) {
            return this.pinTemplate(pin);
        },
        renderContainer:function (model, containerWidth) {
            this.$el.width(containerWidth);
        },
        onWindowResize:function (e) {
            var view = e.data.view;
            view.model.containerWidth(view.$el.parent().width());
        },
        windowScrollLocked:false,
        onWindowScroll:function (e) {
            var view = e.data.view;
            if (view.scrollTimer) {
                clearTimeout(view.scrollTimer);
            }
            view.scrollTimer = setTimeout(function () {
                view.controlWindowScroll();
            }, 50);

        },
        showLoading:function(){
            var $loadingMore = $(".loadingMore");
            if($loadingMore.size()>0){
                $loadingMore.show();
            }else{
                 this.$el.after('<div class="loadingMore"></div>');
            }

        },
        hideLoading:function(){
            var $loadingMore = $(".loadingMore");
            $loadingMore.hide();
        },
        controlWindowScroll:function (forceLoad) {
            var minColTop = _.min(this.colTops),
                model = this.model,
                $el = this.$el,
                _this = this;
            if (this.windowScrollLocked) return;

            if (!model.canGetMore()){
                return;
            }

            if (forceLoad || $(document).scrollTop() + $(window).height() > $el.offset().top + minColTop) {
                this.windowScrollLocked = true;
                this.$(".waterfall-loading").show();
                this.showLoading();

                model.getMore(function () {
                    _this.windowScrollLocked = false;
                    _this.$(".waterfall-loading").hide();
                    _this.controlWindowScroll();
                });
            }
        },
        onChangePinIds:function(model, pinIds){
            this.$el.attr("sound_ids", pinIds);
        },
        initialize:function (options) {
            if (options.pinTemplate) this.pinTemplate = options.pinTemplate;
            this.model.on("change:colNum", this.render, this);
            this.model.on("change:pinIds", this.onChangePinIds, this);
            this.model.on("appendPinIds", this.appendPinIds, this);
            this.model.on("change:containerWidth", this.renderContainer, this);

            var containerWidth = this.$el.width();
            this.model.containerWidth(containerWidth);
            $(window).bind("resize", {view:this}, this.onWindowResize);
            $(window).bind("scroll", {view:this}, this.onWindowScroll);
        },
        release:function () {
            this.model.release();
            $(window).unbind("resize", this.onWindowResize);
            $(window).unbind("scroll", this.onWindowScroll);
        }
    });

    return View;
});