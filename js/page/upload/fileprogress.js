/*
 A simple class for displaying file information and progress
 Note: This is a demonstration only and not part of SWFUpload.
 Note: Some have had problems adapting this class in IE7. It may not be suitable for your application.
 */

// Constructor
// file is a SWFUpload file object
// targetID is the HTML element id attribute that the FileProgress HTML structure will be added to.
// Instantiating a new FileProgress object with an existing file will reuse/update the existing DOM elements
define(["jquery", "helper", "plugin/dialog"], function($, helper, dialog){

    function FileProgress(file, target, fileSelected, unReset) {
        this.fileProgressID = file.id;
        file.title = file.title || file.name.replace(file.type, "");

        this.opacity = 100;
        this.height = 0;
        this.isSingleFile = fileSelected.singleFile;

        var con_multi = $("#multiFile"),
            con_single = $("#singleFile"),
            input_isalbum = $("#isalbum"),
            appendToAlbum = $("#appendToAlbum"),
            title = $("#title"),
            voice_info_title = $("#voice_info_title");

        this.fileProgressWrapper = $("#" + this.fileProgressID);


        if (this.fileProgressWrapper.length == 0) {
            if (!this.isSingleFile) {
                this.fileProgressContainer = con_multi.find("." + target);
                con_single.hide();
                con_multi.show();

                input_isalbum.val("true");
                appendToAlbum.hide();
                voice_info_title.html("专辑信息");
            } else {
                this.fileProgressContainer = con_single.find("." + target);
                con_single.show();
                con_multi.hide();

                input_isalbum.val("false");
                appendToAlbum.show();
                voice_info_title.html("声音信息");
                title.val(file.title);
            }

            var progress_str = '<div class="progressBar"><div class="progress">' +
                '<div class="warp"><span class="uploading"></span><span class="info">上传进度：0M/0M</span></div>' +
                '<div class="warp"><span class="converting" style="width:0;"></span><span class="info">等待转码</span></div></div> <div class="progMask"></div>' +
                '<input class="fileid" type="hidden" name="fileids[]"/></div>';
            if (!this.isSingleFile) {
                var order = this.fileProgressContainer.children().length + 1;
                progress_str = '<li>' +
                    /* '<input class="track_data" type="hidden"  name="track_data[]" value="" />' +*/
                    '<div class="albumList_r1">' +
                    '<div class="number">' + order + '</div>' +
                    '<div class="albumList_sound">' +
                    '<div class="soundInfo">' +
                    '<div class="unedit"><span class="tit" title="'+file.title+'">' + this.shortTitle(file.title) + '</span><a class="editBtn"></a></div>' +
                    '<div class="edit"><input type="text" value="' + file.title + '" name="files[]" ><a class="editConfirm">确认</a><a class="cancel btn-close">取消</a></div>' +
                    '</div>' +
                    '<span class="c01"></span>'+
                    '</div>' +
                    '<div class="fr">' +
                    '<div class="albumList_status"><span class="waitUpload">等待上传</span></div>' +
                    '<a class="del"></a>' +
                    '</div>' +
                    '</div>' +
                    '<div class="uploadStatus">' +
                    progress_str +
                    '<span class="albumList_arrow"><i></i></span>' +
                    '</div>' +
                    '</li>';

                /* progress_str = '<div class="albumItem"><a class="btn-close" href="javascript:;"></a><div class="albumTit">' +
                 '<input class="track_data" type="hidden"  name="track_data[]" value="" />' +
                 '<input class="track_name" name="files[]" value="'+ file.title+'" style="margin-top:5px;width:635px;" type="text" maxLength="40"/>' +
                 '</div>' + progress_str + '</div>'*/
            }

            this.fileProgressWrapper = $(progress_str);
            this.fileProgressWrapper.attr("id", this.fileProgressID);
            if ($("#set-top").is(":checked")) {
                this.fileProgressContainer.prepend(this.fileProgressWrapper);
                this.resetOrderNumber();
            } else {
                this.fileProgressContainer.append(this.fileProgressWrapper);
            }

        }
        this._file = file;
        if (!this.isSingleFile) {
            //编辑专辑会进到这里
            this.setDrag();
            this.fileProgressContainer = con_multi.find("." + target);
            $("#multiFile").find("#h_info").html("批量上传(" + this.fileProgressContainer.children().size() + ")");
            this.setDrag();
            this.bindEvents();
        } else {
            this.fileProgressContainer = con_single.find("." + target);
            title.on("change", function(){
                file.title = title.val();
            });
        }
        this.fileUploadingProgress = this.fileProgressWrapper.find(".uploading");
        this.fileUploadingStatus = this.fileUploadingProgress.next(".info");
        this.fileTranscodingProgress = this.fileProgressWrapper.find(".converting");
        this.fileTranscodingStatus = this.fileTranscodingProgress.next(".info");

        if (!unReset) {
            this.reset();
        }
    }

    FileProgress.prototype.setTimer = function (timer) {

    };
    FileProgress.prototype.getTimer = function (timer) {

    };

    FileProgress.prototype.bindEvents = function () {
        var $wrap = this.fileProgressWrapper,
            _this = this,
            $soundInfo = $wrap.find(".soundInfo");

        if($wrap.attr("binded-events")){
            return;
        }
        $wrap.attr("binded-events", true);
        //编辑按钮
        $wrap.on("click", ".editBtn", function () {
            var $btn = $(this);
            $soundInfo = $btn.closest(".soundInfo");
            var $tit = $soundInfo.find(".tit"),
                $input = $soundInfo.find(".edit input"),
                tit_width = $tit.width();
           // $input.width(tit_width > 430 ? 430 : tit_width);

            $soundInfo.find(".unedit").hide();
            $soundInfo.find(".edit").show();
        });
        //保存
        $wrap.on("click", ".editConfirm, .cancel", function () {
            var $btn = $(this);
            $soundInfo = $btn.closest(".soundInfo");
            var $tit = $soundInfo.find(".tit"),
                $input = $soundInfo.find(".edit input");
            if ($btn.hasClass("editConfirm")) {
                var val = $.trim($input.val());
                if (val && _this.checkTitle(val)) {
                    var val_tmp = _this.shortTitle(val);
                    $tit.text(val_tmp).attr("title", val);
                    _this._file.title = val;
                    _this.titleRight();
                } else {
                    _this.titleError();
                    return;
                }
            } else {
                $input.val($tit.text());
            }
            $soundInfo.find(".unedit").show();
            $soundInfo.find(".edit").hide();
        });
    };

    FileProgress.prototype.checkTitle = function(title){
        if(helper.gblen(title) > 80){
             return false;
        }
        return true;
    };

    FileProgress.prototype.titleRight = function(){
        var $wrap = this.fileProgressWrapper,
            $albumList_r1 = $wrap.find(".albumList_r1");
        $albumList_r1.removeClass("is-error");
    };
    FileProgress.prototype.titleError = function(info){
        info = info || "标题长度不符合要求,系统要求1-80字节";
        var $wrap = this.fileProgressWrapper,
            $albumList_r1 = $wrap.find(".albumList_r1"),
            $info = $albumList_r1.find(".c01");
        $albumList_r1.addClass("is-error");
        $info.text(info);
    };
    FileProgress.prototype.shortTitle = function(title, len){
        len = len || 45;
        var cut_str = this.cutStr(title, len);
        if(cut_str != title){
            cut_str += "...";
        }
        return cut_str;
    };

    FileProgress.prototype.cutStr = function (str, len) {
        if(helper.gblen(str)<=len){
            return str;
        }else{
            str = str.substring(0, str.length-1);
            return arguments.callee(str, len);
        }
    };


    FileProgress.prototype.reset = function () {
        this.fileUploadingProgress.width("0");
        this.appear();
    };

    FileProgress.prototype.setUuid = function (id) {
        this.fileProgressWrapper.find(".fileid").val(id);
        this.appear();
    };

    FileProgress.prototype.setTrackData = function (data) {
        this.fileProgressWrapper.find(".track_data").val(data);
    };


    FileProgress.prototype.setComplete = function () {


    };
    FileProgress.prototype.setError = function () {
        var $status = this.fileProgressWrapper.find(".albumList_status"),
            $uploadStatus = this.fileProgressWrapper.find(".uploadStatus");
        $status.find("span").removeClass().addClass("failIcon").html('上传失败,请删除');
        $uploadStatus.slideDown(1000);
    };
    FileProgress.prototype.setCancelled = function () {
        var oSelf = this;
        this.setTimer(setTimeout(function () {
            oSelf.disappear();
        }, 2000));
    };
    FileProgress.prototype.setStatus = function (status) {
        this.fileUploadingStatus.html(status);
    };

    FileProgress.prototype.beforeCancel = function (show, swfUploadInstance, callback) {

    };

// Show/Hide the cancel button
    FileProgress.prototype.toggleCancel = function (show, swfUploadInstance, callback) {

        if (this.isSingleFile) return;

        var closeBtn = this.fileProgressWrapper.find("a.del");
        if (show) {
            closeBtn.show();
        } else {
            closeBtn.hide();
        }

        var fileID = this.fileProgressID;
        var _this = this;
        var _event = function () {
            closeBtn.unbind("click");
            if (swfUploadInstance) {
                swfUploadInstance.cancelUpload(fileID);
                if (swfUploadInstance.cancelTranscoding) {
                    swfUploadInstance.cancelTranscoding(fileID);
                }
            }
            if ($.isFunction(callback)) {
                callback(fileID);
            }
            _this.disappear();
        };
        closeBtn.unbind("click");
        closeBtn.bind("click", function () {
            var $parent =  _this.fileProgressWrapper.parent(),
                callback = function(){_event();};
            var result = $parent.triggerHandler("beforeCancel", [callback, _this.fileProgressWrapper]);
            if ( !result) {
                _event();
            }

        });

    };

    FileProgress.prototype.appear = function () {

    };

// Fades out and clips away the FileProgress box.
    FileProgress.prototype.disappear = function () {
        var _this = this;
        var wrapper = this.fileProgressWrapper;
        wrapper.animate({"height": 0}, 1000, function () {
            wrapper.remove();
            wrapper = null;
            _this.resetOrderNumber();
        });
    };

    FileProgress.prototype.destroy = function () {
        var wrapper = this.fileProgressWrapper;
        wrapper.remove();
        this.resetOrderNumber();
    };
    FileProgress.prototype.hide = function () {
        var wrapper = this.fileProgressWrapper;
        wrapper.hide();
    };
    FileProgress.prototype.uploadStart = function () {
        var  $uploadStatus = this.fileProgressWrapper.find(".uploadStatus");
        $uploadStatus.slideDown(1000);
    };

    FileProgress.prototype.setProgress = function (percentage) {
        var member = percentage + "%";
        this.fileUploadingProgress.width(member);
        if (this.isSingleFile) {
            $("#singleFile").find(".p_tip em").text(parseInt(percentage / 2) + "%");
        } else {

            var $status = this.fileProgressWrapper.find(".albumList_status"),
                $uploadStatus = this.fileProgressWrapper.find(".uploadStatus");
            $status.find("span").removeClass().addClass("areUploading").html('正在上传(' + parseInt(percentage / 2) + '%)');

        }


        this.appear();
    };

    FileProgress.prototype.setAttr = function (name, value) {
        this.fileProgressWrapper.attr(name, value);
    };

    FileProgress.prototype.setTranscodingStatus = function (status) {
        this.fileTranscodingStatus.html(status);
    };
    FileProgress.prototype.resetTranscodingProgress = function () {
        this.fileTranscodingProgress.width("0");
    };


    FileProgress.prototype.transcodingSuccess = function () {
        var $uploadStatus = this.fileProgressWrapper.find(".uploadStatus");
        var $status = this.fileProgressWrapper.find(".albumList_status");
        $uploadStatus.stop().slideUp(1000);
        $status.find("span").removeClass().addClass("successIcon").html('上传成功');
    };

    FileProgress.prototype.setTranscodingProgress = function (percentage) {
        this.fileTranscodingProgress.width(percentage + "%");
        if (this.isSingleFile) {
            $("#singleFile").find(".p_tip em").text(parseInt(percentage / 2 + 50) + "%");
        } else {
            var $status = this.fileProgressWrapper.find(".albumList_status");
            $status.find("span").removeClass().addClass("areUploading").html('正在上传(' + parseInt(percentage / 2 + 50) + '%)');

            if (percentage >= 100) {
                this.transcodingSuccess();

            }
        }

        this.appear();
    };

    FileProgress.prototype.setTranscodingError = function () {
        var $status = this.fileProgressWrapper.find(".albumList_status");
        $status.find("span").removeClass().addClass("failIcon").html('上传失败,请删除');
    };
    FileProgress.prototype.setOnErrorTimer = function (timer) {
        this.timer = timer;
    };
    FileProgress.prototype.getOnErrorTimer = function () {
        return this.timer;
    };

    FileProgress.prototype.resetOrderNumber = function () {
        var $container = this.fileProgressContainer,
            $items = $container.children(),
            max = $items.size();
        for (var i = 0; i < max; i++) {
            $items.eq(i).find(".number").text(i + 1);
        }

        $("#multiFile").find("#h_info").html("批量上传(" + max + ")");
    };

    FileProgress.prototype.setDrag = function () {
        //return false;
        var wrapper = this.fileProgressWrapper,
            _this = this;
        if (wrapper.attr("drag_able")) {
            return;
        }
        wrapper.attr("drag_able", true);
        var parent = wrapper.parent();
        var holder = $('<li class="albumItem-holder"></li>');
        var $move_tip = $(".dragIcon");
        if ($move_tip.length == 0) {
            $move_tip = $('<div class="dragIcon">拖动改变顺序</div>');
            $("body").append($move_tip);
        }
        var moveFn = function (e) {
            $move_tip.css({
                left: e.pageX + 20,
                top: e.pageY - 10
            });
        };
        var $target = wrapper.find(".albumList_r1"),
            $doc = $(document);

        $target.bind({
            mouseover: function (e) {
                if (e.target == $target[0]) {
                    $move_tip.show();
                    $doc.on("mousemove", moveFn);
                    moveFn(e);
                }
            },
            mouseleave: function () {
                $move_tip.hide();
                $doc.off("mousemove", moveFn);
            },
            mouseout: function () {
                $move_tip.hide();
                $doc.off("mousemove", moveFn);
            }
        });

        var $win = $(window),
            $dom = $(document);
        wrapper.easydrag(true);
        wrapper.setHandler($target);

        wrapper.beforeDrag(function (e, element) {
            var tagName = e.target.tagName.toLowerCase();
            if (!$(e.target).hasClass("albumList_r1")) {
                return true;
            }
            var $this = $(this);
            wrapper.after(holder);
            var height = wrapper.height();
            holder.height(height);

            var offsetY = wrapper.offset().top - e.pageY;
           // $win.on("scroll", {e:e, element:element, offsetY:offsetY}, onScroll);

        });
        function onScroll(e){
            var data = e.data,
                element = data.element,
                offsetY = data.offsetY,
                clientY = data.e.clientY,
                $el = $(element),
                parentTop = $el.parent().offset().top;
            var top = clientY + $dom.scrollTop() -parentTop + offsetY;
            if(window.console) console.log(top);
            $el.css("top", top);
            onDrag(data.e, element);
        }

        function onDrag(e, element){
            var $this = $(element);
            $this.css({left: 0, zIndex: 10});
            var height = $this.outerHeight();
            var top = $this.position().top;
            var center = top + height / 2;
            //向下移动
            var next = holder.next();
            if (next.attr("id") == $this.attr("id")) {
                next = next.next();
            }

            if (next.size() != 0) {
                var next_center = next.position().top + next.outerHeight() / 2;
                if (center > next_center) {
                    holder.insertAfter(next);
                    onDrag(e, element);
                    return;
                }
            }
            //向上移动
            var prev = holder.prev();
            if (prev.attr("id") == $this.attr("id")) {
                prev = prev.prev();
            }

            if (prev.size() != 0) {
                var prev_center = prev.position().top + prev.outerHeight() / 2;
                if (center < prev_center) {
                    holder.insertBefore(prev);
                    onDrag(e, element);
                    return;
                }
            }
        }
        wrapper.ondrag(function (e, element) {
            onDrag(e, element);
        });
        wrapper.ondrop(function (e, element) {
            $win.off("scroll", onScroll);
            var $this = $(element);
            $this.insertAfter(holder);
            holder.remove();
            $this.css({position: 'relative', left: "", top: '', zIndex: ""});
            _this.resetOrderNumber();

        });
    };
    window.FileProgress = FileProgress;
});
