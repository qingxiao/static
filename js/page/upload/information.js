/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 12-7-26
 * Time: 下午3:10
 * To change this template use File | Settings | File Templates.
 */
define(["jquery",
    'json2',
    'page/page_base',
    "plugin/dialog",
    "plugin/count_char",
    'plugin/swfupload/swfupload.queue',
    'module/uploadimg',
    'module/share',
    'module/header_search',
    'plugin/jquery.selecter',
    'plugin/kindeditor/kindeditor'
],
    function ($, JSON, PageBase, dialog, countChar, SWFUpload, UploadImg, ShareView, header_search) {
        var image_domain = config.FDFS_PATH || "http://fdfs.x.com/";
        var img_upload_url_cover = config.DIRECT_DTRES_ROOT + "/cover/upload";
        var img_upload_url_album = config.DIRECT_DTRES_ROOT + "/album/upload";
        var def_imgurl = config.STATIC_ROOT + "/css/img/record/image.gif";

        var recommend_tags_url = "/handle_album/recommend_tags";
        var tag_suggest_url = "/s/search/tag_suggest";

        var mTitleMaxLength = 40;
        var Page = PageBase.extend({
            init: function (data) {
                this.callParent("init");
                this._isAlbum = data.album || false;

                if(this._isAlbum){
                    $("#shareSound [data-type]").attr("data-type", "album");

                }
                this.initValidCode();
                this.initAlbum();
                setBindShare();
                addInfoEvent();
                uploadImgInit();
                addTagEvent();
                this.bindEvents();
            },
            initAlbum: function () {
                setIsAlbum(this._isAlbum, true);
            },
            initValidCode:function(){
                //上传专辑需要验证码
                var $tr_validcode = $("#tr_validcode"),
                    $btn_validcode = $("#btn_validcode"),
                    $img_validcode = $("#img_validcode");

                if(this._isAlbum){
                    if( $tr_validcode.size()==0) return;
                    $tr_validcode.removeClass("hidden");
                    var url = $img_validcode.attr("src");
                    $btn_validcode.on("click", function(){
                        $img_validcode.attr("src", url+ "&_t" + (new Date()).getTime());
                    });
                }else{
                    $tr_validcode.remove();
                }
            },
            bindEvents:function(){
                var _this = this;
                $("input, textarea").on("focus", function(){
                    var $error = $(this).closest(".is-error");
                    if($error.size() >= 1){
                         _this.setRight($error);
                    }
                });
            },
            setError:function($el, info, noScroll){
                if(!noScroll){
                    setTimeout(function(){
                        helper.scrollTo($el, -100);
                    }, 200);

                }
                if(info){
                    var $info = $el.find("span.c01");
                    if($info.size() == 0){
                        $info = $('<span class="c01"></span>');
                        $el.append($info);
                    }
                    $el.addClass("is-error");
                    $info.text(info);
                }
            },
            setRight:function($el, info){
                var $info = $el.find("span.c01");
                $el.removeClass("is-error");
                $info.text(info || "");
            },
            release: function () {
                this.callParent("release");
            }
        });


        var gIsAlbum = false;

        function setIsAlbum(flag, needAct) {
            gIsAlbum = flag;

            hideEl($non_music);
            hideEl($music);
            hideEl($lyric);
            if (needAct) {
                $genre.trigger("change");
                //    $genre_sub.trigger("change");
            }

            setKindEditor();
            if (!gIsAlbum) {
                $(".conMain").addClass("conMain_add_img");
            } else {
                $(".conMain").removeClass("conMain_add_img");
                $("#public_tr").hide();
            }


        }


        var $title = $("#title"), //标题  必填
            $origin = $("#origin"), //来源 必填
            $genre = $("#genre"), //类型 必填
            $genre_sub = $("#genre_sub"),

            $music = $(".music"),
            $lyric = $(".lyric"),
            $non_music = $(".non_music"),
            $advanced_settings = $("#advanced_settings"),
            $agreeDeal = $("#agreeDeal"),
            $createNewAlbum = $("#createNewAlbum"),
            $submit_save = $("#submit_save"),
            $album_list = $("#album_list"),
            $description = $("#description");

        var $is_public = $("input[name=is_public]");

        var checkInfo = {
            titleSuccess: false,
            originSuccess: false,
            genreSuccess: false,
            title: function (isScroll) {
                if (this.noCheck) {
                    this.titleSuccess = true;
                    return true;
                }
                this.titleSuccess = false;
                var $parent = $title.parent();
                var val = $title.val();
                if (!val) {
                    page.setError($parent, "请为声音加上标题", !isScroll);
                    return false;
                } else {
                    page.setRight($parent);
                    $parent.removeClass("is-error");
                }

                if (!checkMaxLength(val, mTitleMaxLength * 2)) {
                    var tip = "标题太长，必须小于" + mTitleMaxLength + "个汉字或者" + (mTitleMaxLength * 2) + "个字母";
                    page.setError($parent, tip, !isScroll);
                    return false;
                }
                this.titleSuccess = true;
                return true;
            },
            origin: function (isScroll) {
                if (this.noCheck) {
                    this.originSuccess = true;
                    return true;
                }
                this.originSuccess = false;
                var $parent = $origin.parent();
                var val =   $origin.selecter("val") || $origin.val();
                if (!val) {
                    var tip = "请为声音标注来源";
                    page.setError($parent, tip, !isScroll);
                    return false;
                } else {
                    page.setRight($parent, "该信息必填");
                }
                this.originSuccess = true;
                return true;
            },
            genre: function (isScroll) {
                if (this.noCheck) {
                    this.genreSuccess = true;
                    return true;
                }
                this.genreSuccess = false;
                var $parent = $genre.parent();
                var val = $genre.selecter("val") || $genre.val(),
                     text = $genre.selecter("text"),
                    sub_val =  $genre_sub.selecter('val') || $genre_sub.val();
                if (!val || (text == "音乐" && !sub_val && !gIsAlbum)) {
                    var tip = "请为声音加上类型";
                    page.setError($parent, tip, !isScroll);
                    return false;
                } else {
                    page.setRight($parent, "该信息必填");
                }
                this.genreSuccess = true;
                return true;
            }
        };

        function addInfoEvent() {
            $title = $("#title");
            $origin = $("#origin");
            $genre = $("#genre");
            $genre_sub = $("#genre_sub");
            $music = $(".music");
            $lyric = $(".lyric");
            $description = $("#description");
            $non_music = $(".non_music");
            $is_public = $("input[name=is_public]");
            checkInfo.titleSuccess = false;
            checkInfo.originSuccess = false;
            checkInfo.genreSuccess = false;


            $(".selecter").selecter();

            $title.bind("blur", function () {
                checkInfo.title();
            });

            $origin.bind("change", function () {
                checkInfo.origin();
            });
            $genre.bind("change", function () {
                checkInfo.genre();
                genreChange();
            });
            $genre_sub.bind("change", function () {
                checkInfo.genre();
                genreSubChange();
            });
            $genre.trigger("change");
            $description.bind({
                blur: function () {
                    checkDesc($(this));
                },
                focus: function () {
                    page.setRight($description);
                }
            });
            $is_public.bind("click", function () {
                var val = $(this).attr("value");
                var $public = $('[public=true]');
                if (val == "1") {
                    $public.show();
                } else {
                    $public.hide();
                }
            });
            //专辑 新建与加入已有专辑
            var $createNewAlbum = $("#createNewAlbum"),
                $addToAlbum = $("#addToAlbum"),
                $chooseAlbum = $("#chooseAlbum"),
                $choose_album_entry = $("#choose_album_entry"),
                $info_table_warp = $("#info_table_warp"),
                $chooseAlbumInput = $chooseAlbum.find("input[name=choose_album]");
            $createNewAlbum.on("click", function(){
                $addToAlbum.removeClass("on");
                $createNewAlbum.addClass("on");
                $chooseAlbum.hide();
                $info_table_warp.show();
                $chooseAlbumInput.val("");
                checkInfo.noCheck = false;
            });
            $addToAlbum.on("click", function(){
                if($addToAlbum.hasClass("forbid")){
                    return;
                }
                $addToAlbum.addClass("on");
                $createNewAlbum.removeClass("on");
                $chooseAlbum.show();
                $info_table_warp.hide();
                $choose_album_entry.find(".album_tile_list .item.selected").trigger("click");
                if($choose_album_entry.children().size() == 0){
                    getAlbumList();
                }


            });
            function getAlbumList(page, callback){
                callback = callback || $.noop;
                $chooseAlbum.addClass("loadingMore");
                page = page || 1;
                $.get("/upload/choose_album", {page:page}, function(html){
                    $choose_album_entry.html(html);
                    $choose_album_entry.find(".album_tile_list .item").eq(0).trigger("click");
                    $chooseAlbum.removeClass("loadingMore");
                });
            }
            $chooseAlbum.on("click", ".album_tile_list .item", function(){
                var $item = $(this),
                    $list = $item.parent();
                $list.children().removeClass("selected");
                $item.addClass("selected");
                $chooseAlbumInput.val($item.attr("album_id"));
                checkInfo.noCheck = true;
            });
            //专辑分页
            $chooseAlbum.on("click", ".pagingBar [data-page]", function(){
                var $btn = $(this),
                    page = $btn.attr("data-page");
                getAlbumList(page);
                return false;
            });
            //取消
            var $cancel_save = $("#cancel_save");
            $cancel_save.click(function () {
                var $this = $(this);
                var result = dialog.confirm("是否要放弃本次操作？", function () {
                    window.location.href = $this.attr("href") || window.location.href;
                });
                return false;
            });

        }

        function checkDesc(input) {
            var val = input.val();

            if (val.length > 3000) {
                var more = Math.ceil((val.length - 3000));
                var tip = '已超出' + more + '个字';
                page.setError(input.parent(), tip, true);
                return false;
            }
            return true;
        }


        function genreChange() {
            var text = $genre.selecter("text");
            if (text == "音乐") {
                showEl($genre_sub);
                showEl($lyric);
                $genre_sub.trigger("change");
                hideEl($non_music);
            } else {
                showEl($non_music);
                hideEl($genre_sub);
                hideEl($music);
                hideEl($lyric);
            }
            if (gIsAlbum) {
                var $copy_writer = $('.copy_writer');
                showEl($copy_writer);
                hideEl($non_music);
                hideEl($music);
                hideEl($lyric);
            }
            showName();

            var category_id = $genre.selecter("val") || $genre.val();
            var extra = $genre.attr("extra");
            if (!extra) {
                recommend_tags(category_id);
            }

        }

        function genreSubChange() {
            if (gIsAlbum) {
                hideEl($non_music);
                hideEl($music);
                hideEl($lyric);
                showName();
                return;
            }
            var table = $(".tbInfo");
            hideEl(table.find(".music"));
            showEl($lyric);
            var val = $genre_sub.selecter("val") || $genre_sub.val();
            switch (val) {
                case "原唱":
                    showEl(table.find(".music.original"));
                    break;
                case "翻唱":
                    showEl(table.find(".music.cover"));
                    break;
                case "伴奏":
                    showEl(table.find(".music.sideman"));
                    break;
                default:
                    break;

            }
            showName();
        }

        function showName() {
            var hide_input = $("[hide_name]");
            hide_input.each(function () {
                var $this = $(this);
                $this.attr("name", $this.attr("hide_name"));
                $this.removeAttr("hide_name");
            });
        }


        function hideEl(el) {
            el.addClass("hidden");
        }

        function showEl(el) {
            el.removeClass("hidden");
        }

//图片上传
        function uploadImgInit() {
            var $imgUpload = $("#uploadPicBtn"),
                $imgWrap = $("#imageWrap"),
                $upload_img = $imgWrap.find("img"),
                $img_id = $("#img_id"),
                original_src = "",
                $imgLoading = $imgWrap.find(".imgLoading"),
                file_queue_limit = 4,
                file_upload_limit = 4,
                url = img_upload_url_cover,
                $soundImgBox = $("#soundImgBox"),
                alreadyBoxSize =   $soundImgBox.find(".imgBox").size();
            if(gIsAlbum){
                file_queue_limit = 1;
                file_upload_limit = 0;
                url = img_upload_url_album;
            }else{
                file_upload_limit -=  alreadyBoxSize;
            }

            var uploadImg = new UploadImg({
                url: url,
                $el: $imgUpload,
                maxSize: 3,
                file_queue_limit:file_queue_limit,
                file_upload_limit:file_upload_limit,
                swfupload_loaded_handler:function(){
                    if(alreadyBoxSize >= 4){
                        this.setButtonDisabled(true);
                    }
                },
                file_queued_handler:function(file){
                    imageOperate.addImg(file);
                },
                error: function (data, file) {
                    imageOperate.setError(data, file);
                },
                success: function (data, file, str_data) {
                    imageOperate.fillImg(data, file, str_data);
                }
            });
            //声音封面操作
            //todo 声音编辑默认带图处理
            var imageOperate = {
                $container:$imgWrap,
                $phoneImg:$("#info_table_warp .dv-phone img"),
                $soundImgBox:$soundImgBox,
                init:function(){

                    this.$imgBox2 = this.$container.find(".imgBox2");
                    this.defSoundImg = this.$imgBox2.find("img").attr("src");
                    this.defAlbumImg = this.$container.attr("album_src");
                    this.$destroyImg = this.$container.find("input[name=destroy_images]");

                    var $td = this.$container.parent();
                    var $soundImgTips = $td.find(".sound-image-tips"),
                         $albumImgTips = $td.find(".album-image-tips");
                    if(gIsAlbum){
                        this.$imgBox2.attr({src:this.defAlbumImg, src640:this.defAlbumImg});
                        this.$imgBox2.find("img").attr("src", this.defAlbumImg);
                        this.setCover(this.$imgBox2);
                        $soundImgTips.hide();
                    }else{
                        this.$imgBox2.find("input").remove();
                        $albumImgTips.hide();
                        if(alreadyBoxSize){
                            this.$imgBox2.hide();
                        }
                    }
                    this.bindEvents();
                },
                html:'<div class="imgBox">'+
                    '<a class="del"></a>'+
                         '<div class="imgItem">'+
                             '<img src="">'+
                            '<input type="hidden" name="image[]" />'+
                            '<div class="imgLoading"></div>'+
                        '</div>'+
                        '<div class="setfenmian">设为封面</div>'+
                        '<div class="isfenmian"></div>'+
                    '</div>',
                bindEvents:function(){
                    if(gIsAlbum){
                        return;
                    }
                    var _this = this,
                        hasDestroyImg = false;
                    if(this.$destroyImg.size()>0){
                        hasDestroyImg = true;
                    }

                    this.$soundImgBox.on("click", ".imgBox .del", function(){
                        var $btn = $(this),
                            $imgBox =  $btn.closest(".imgBox"),
                            imageId = $imgBox.attr("image_id");
                        $imgBox.remove();
                        uploadImg.increaseUploadLimit();
                        uploadImg.setButtonDisabled(false);
                        _this.onBoxRemove();
                        if(imageId && hasDestroyImg){
                            _this.destroyImage(imageId);
                        }
                        return false;
                    });
                    this.$soundImgBox.on("click", ".imgBox", function(){
                        var $curBox = $(this);
                        var index = $curBox.index();
                        if(index == 0){
                            return;
                        }
                        var $firstBox = _this.$soundImgBox.find(".imgBox").eq(0);
                        $firstBox.removeClass("is-fenmian");
                        _this.setCover($curBox);
                        $firstBox.insertBefore($curBox);
                        if($curBox.index() != 0){
                            $curBox.insertBefore(_this.$soundImgBox.find(".imgBox").eq(0));
                        }
                    });
                },
                destroyImage:function(imageId){
                    var $ipt = this.$destroyImg,
                        val = $ipt.val();
                    if(val){
                        val += ","+imageId;
                    }else{
                        val = imageId;
                    }
                    $ipt.val(val);
                },
                addImg:function(file){
                    if(gIsAlbum){
                        this.$imgBox2.addClass("is-loading");
                        return;
                    }
                    this.$imgBox2.hide();
                    var $box = $(this.html).addClass("is-loading").attr("id", file.id);
                    this.$soundImgBox.append($box);
                    if($box.index() == 0){
                       this.setCover($box);
                    }
                    if(this.$soundImgBox.find(".imgBox").size() >= 4){
                        uploadImg.setButtonDisabled(true);
                    }
                },
                setCover:function($box){
                    $box.addClass("is-fenmian");

                    var src = $box.attr("src"),
                        src640 = $box.attr("src640");
                    if(!src){
                        return;
                    }
                    this.$phoneImg.attr("src",src);
                    var img = new Image();
                    var _this = this;
                    img.onload = function(){
                        _this.$phoneImg.attr("src",src640);
                        img = null;
                    };
                    img.src = src640;
                },
                setError:function(data, file){
                    $upload_img.attr("src", original_src || def_imgurl);
                    if(gIsAlbum){
                        this.$imgBox2.removeClass("is-loading");
                    }else{
                        $("#"+file.id).removeClass("is-loading");
                    }
                },
                fillImg:function(data, file, str_data){
                    var processResult =  data.data[0].processResult,
                         src = image_domain + "/" + processResult[100],
                         src640 =  image_domain + "/"+(processResult[640]?processResult[640]:processResult[180]),
                         $div = $("#"+file.id);

                    if(gIsAlbum){
                        $div = this.$imgBox2;
                    }
                    $div.attr("src640", src640);
                    $div.attr("src", src);
                    $div.find("img").attr("src", src);
                    var postData = this.getPostData(data);
                    $div.find("input").val(postData);
                    $div.removeClass("is-loading");
                    if(gIsAlbum || $div.index() == 0){
                        this.setCover($div);
                    }
                },
                getPostData:function(data){
                    //精简img数据   status  processResult
                    var postData = {};
                    postData.status = data.status;
                    postData.data = [{processResult:data.data[0].processResult, uploadTrack:data.data[0].uploadTrack}];
                    return JSON.stringify(postData);
                },
                onBoxRemove:function(){
                    var $boxes =  this.$soundImgBox.find(".imgBox");
                    if($boxes.size() == 0){
                         this.$imgBox2.show();
                         var src = this.defSoundImg;
                         if(gIsAlbum){
                              src = this.defAlbumImg;
                         }
                         this.$phoneImg.attr("src", src);
                    }else{
                        var $first = $boxes.eq(0);
                        $first.addClass("is-fenmian");
                        this.$phoneImg.attr("src",$first.attr("src640"));
                    }

                }

            };
            imageOperate.init();
        }


        function checkMaxLength(val, len) {
            var temp = val.replace(/[\u0391-\uFFE5]/g, "aa");
            return temp.length <= len;

        }

        var infoErr = $("#infoErr");

        function check() {
            var $input_album =   $("#chooseAlbum").find("input[name=choose_album]");
            if($input_album.val()){
                return true;
            }
            infoErr.html("").css({color: "red"});
            richEditorSwitch();

            if (!checkInfo.title(true) || !checkInfo.origin(true) || ! checkInfo.genre(true)) {
                //infoErr.html("必填信息不符合要求,请先完成后再保存");
                return false;
            }
            if (!$agreeDeal[0].checked) {
                infoErr.html("请先同意协议");
                return false;
            }
            if (!checkDesc($description)) {
                page.setError($description.parent(), "简介不能超过3000个汉字");
                return false;
            }
            if ($("#shareSound .selected").length > 0) {
                //分享到第三方的文本
                var $share_content = $("#share_content");
                var val = $share_content.val();
                if ((gIsAlbum && val != $share_content.attr('default_album_text')) || val != $share_content.attr('default_sound_text')) {
                    $share_content.attr("name", "share_content");
                    if ($share_content.attr("pass")) {
                        infoErr.html("分享内容长度超过最大长度");
                        page.setError($share_content);
                        return false;
                    }
                } else {
                    $share_content.removeAttr("name");
                }
            }

            //验证码
            var $tr_validcode = $("#tr_validcode");
            if($tr_validcode.size()>=1){
                var $codeInput =  $tr_validcode.find("input"),
                    val = $.trim($codeInput.val());
                if(!val || val.length != 4){
                    page.setError($tr_validcode, "请输入正确的验证码");
                    return false;
                }
            }
            // 上传图片
            var $imgWrap =  $("#imageWrap"),
                $inputs = $imgWrap.find("input[name='image[]']"),
                checkInput = true;
            $inputs.each(function(){
                if(!$(this).val()){
                    checkInput = false;
                    return false;
                }
            });
            if(!checkInput){
                infoErr.html("图片正在上传中，请稍等");
                return false
            }

            var hide_input = $(".hidden").find("input,textarea");
            hide_input.each(function () {
                var $this = $(this);
                $this.attr("hide_name", $this.attr("name"));
                $this.removeAttr("name");
            });
            return true;
        }


        /*标签标签*/
        var $inputArea = $(".inputArea"), //标签
                $inputAreaTag = $inputArea.find(".inputArea-tag .tagsBox"),
            $tagPanel = $("#tagPanel"),
            $tagPanelCss = $(".tagBtnList"),
            $input_editor_area = $("#editor_area");

        function addTagEvent() {
            $inputArea = $(".inputArea"); //标签
            $inputAreaTag = $inputArea.find(".inputArea-tag .tagsBox");
            $tagPanel = $("#tagPanel");
            $tagPanelCss = $(".tagBtnList");
            $input_editor_area = $("#editor_area");
            var keyHash = {
                enter: 13,
                space: 32,
                backspace: 8
            };
            var option = {
                url: tag_suggest_url,
                $el:$inputArea,
                $listResult :$(".searchTagsPanel .results_wrap"),
                resultKeyCode: [keyHash.space],
                maxKeywords: 16,
                createResultHtml: function (data, scope) {
                    var html = "<ul class='results'>";
                       html +=  '<li  data-title="'+data.key+'"><div class="searchPanel_sound"> ' +
                           '<a class="title" href="javascript:;" title="'+data.key+'">添加"'+data.key+'"的标签</a>' +
                           '</div></li>';
                    for (var j = 0; j < data.list.length; j++) {
                        var item = data.list[j];
                        html += '<li data-id="'+item.id+'" data-title="'+item.title+'"><div class="searchPanel_sound"> ' +
                        '<a class="title" href="javascript:;" title="'+item.title+'">'+item.text+'</a>' +
                          '</div></li>';
                    }
                    html += "</ul>";
                    return html;
                },
                callback: function (data) {
                    addTag(data.title);
                }
            };
            header_search(option);
            //todo smart_search($(".inputArea-txt").parents("td"), option);

            $inputArea.bind({
                click: function () {
                    $input_editor_area.focus();
                }
            });

            $inputAreaTag.off().on({
                click: function () {
                    var $tag =  $(this).parent();
                    $tag.fadeOut(200, function(){
                         $tag.remove();
                        changeArea();
                        $input_editor_area.focus();
                    });
                    return false;
                }
            }, ".tagBtn .del");

            $input_editor_area.bind({
                keypress: function (event) {
                    //兼容ie6 7 keydown 回车键没反映
                    var value = $input_editor_area.val();
                    value = $.trim(value);
                    var code = event.keyCode;


                    if (code == keyHash.enter) {
                        addTag(value);
                    }
                },
                keydown: function (event) {
                    var value = $input_editor_area.val();
                    var code = event.keyCode;
                    if (code == keyHash.backspace) {
                        if (value == "") {
                            $inputAreaTag.children().last().remove();
                            changeArea();
                            return false;
                        }
                    }
                    //空格也能添加标签
                    if (code == keyHash.space) {
                        addTag(value);
                        return false;
                    }

                }
            });


            $tagPanelCss.on("click", ".tagBtn2", function (event) {
                var _tag = $(this);
                addTag(_tag.text());
            });
        }

        function addTag(tag) {
            tag = $.trim(tag).replace(/\s+/, "");

            var showAlert = function (msg) {
                $input_editor_area.blur();
                if (dialog) dialog.alert(msg, {onClose: function () {
                    $input_editor_area.focus();
                }});
            };
            var illchar = /[\~\`\!\@\#\$\%\^\&\*\(\)\-\=\+\\\|\'\"\;\:\.\>\,\<\/\?\~\·\！\@\#\￥\%\…\…\&\*\（\）\—\—\-\+\=\|\\\}\]\{\[\"\'\:\;\?\/\>\.\<\，]/;
            if (illchar.test(tag)) {
                showAlert("不能包含特殊字符");
                return;
            }
            if (!checkMaxLength(tag, 16)) {
                showAlert("内容超出范围");
                return;
            }

            if (tag == "") {
                return false;
            }
            var length = $inputAreaTag.children().size();
            if (length >= 5) {
                showAlert("最多只能选择5个标签");
                $input_editor_area.val("");
                return false;
            }
            var repeat = false;
            $inputAreaTag.find(".tagBtn span").each(function () {
                if ($(this).text() == tag) {
                    repeat = true;
                    return false;
                }
            });
            if (repeat) {
                $input_editor_area.val("");
                return false;
            }
            var tagBtn = '<a class="tagBtn" href="javascript:;"><span>'+tag+'</span><div class="del"></div></a>';
            $inputAreaTag.append(tagBtn);
            $input_editor_area.val("");
            changeArea();
            return true;
        }

        function changeArea() {
            var val_arr = [];
            var span = $inputAreaTag.find(".tagBtn span");
            span.each(function () {
                val_arr.push($(this).text());
            });
            $("#chosen_area").val(val_arr.join(","));
        }


        function recommend_tags(category_id) {
            $.ajax({
                type: "POST",
                url: recommend_tags_url,
                dataType: "html",
                data: {
                    "category_id": category_id
                },
                success: function (html) {
                    $tagPanel.html(html);
                }
            });
        }

//检查是否要显示分享内容
        function checkShareContent() {
            var $share_content_tr = $(".share_content_tr");
            var $share_content = $("#share_content");
            var $checked = $("#shareSound .selected");
            var $container = $("#shareSound");

            var share_data = shareView.getShareData(function(data){
                var name = "sharing_to[]",
                     values = data.sharing_to;
                 $container.find("[name='"+name+"']").remove();
                 for(var i=0;i<values.length;i++){
                       var v = values[i];
                     $container.append('<input name="'+name+'" value="'+v+'" type="hidden"/>');
                 }
            });
            if ($checked.length == 0) {
                $share_content_tr.hide();
                return;
            }
            $share_content_tr.show();
            if (!$share_content.val()) {
                if (gIsAlbum) {
                    $share_content.val($share_content.attr('default_album_text'));
                } else {
                    $share_content.val($share_content.attr('default_sound_text'));
                }
            }
            $share_content.blur();
        }

//检查绑定状态
        var shareView;

        function setBindShare() {
            var $container = $("#shareSound");

            shareView = new ShareView({
                $el: $container,
                bindedClass: "already",
                checkedClass: "selected",
                checkedSuccess: function () {
                    checkShareContent();
                }
            });
            checkShareContent();
            var $share_content = $("#share_content");
            var $share_content_tr = $(".share_content_tr");

            countChar($share_content, $share_content_tr.find(".count-char"), 100);
            return;
        }

        function parseSubmitError(errors) {
            /*
             * [ [title','标题填写有误'],['user_source', '来源设置有误'] ]
             * 0：正常通过
             -1：用户在黑名单中，不允许用户操作
             -2：用户发帖太快
             -3：ip被禁止
             -4：对应该IP的主机发帖太快
             -11：文本内容中包含了不合法的词汇
             -21：不允许为空
             */
            var msg = {
                dirty_words: "信息包含敏感词或者输入连续相同字符超过限制！",
                files_dirty_words: "声音标题包含敏感词"
            };
            var error_str = "";
            for (var i = 0, max = errors.length; i < max; i++) {
                var name = errors[i][0],
                    value = errors[i][1];

                if(name == "page"){
                    var $tr_validcode = $("#tr_validcode"),
                        $btn_validcode = $("#btn_validcode");
                    var $codeInput =  $tr_validcode.find("input");
                    page.setError($tr_validcode, value, false);
                    $btn_validcode.trigger("click");
                }

                if (msg[name]) {
                    error_str = msg[name];

                    for (var nn in value) {
                        if(nn<0 && nn>=-4){
                            dialog.alert("您的上传太频繁了，请休息一段时间或绑定手机号");
                            return;
                        }
                        var $input;
                        if (name == "dirty_words") {
                            $input = $("[name=" + value[nn] + "]");
                            page.setError($input.parent(), "信息包含敏感词,请修改");
                        }
                        if(name == "files_dirty_words"){
                            $input = $("input[value="+value[nn]+"]");
                            page.setError($input.closest("li").find(".albumList_r1"), "标题包含敏感词,请修改");
                        }

                    }
                } else {
                    error_str += value;
                }
            }
            infoErr.html(error_str).css({color: "red"});
        }

        var ajax_loading = false;

        function submitForm(btn, href) {
            if (ajax_loading) {
                return false;
            }
            var $btn =  $(btn);
            $submit_save.addClass("load").text("保存中");
            // common.loading.start(btn);
            ajax_loading = true;
            var form = $("form"),
                data = form.serialize(),
                action = form.attr("action") || "/upload/create",
                type = form.attr("method");
            infoErr.css({color: "#000000"});
            infoErr.html("正在保存中");

            $.ajax({
                url: action,
                type: type,
                data: data,
                timeout: 30 * 60 * 1000,
                dataType: "json",
                success: function (result) {
                    if (result.res) {
                        window.location.href = result.redirect_to || href;
                        $btn.unbind("click");
                      //  unHoldSubmit();
                    } else {
                        parseSubmitError(result.errors);
                        unHoldSubmit(true);
                        $submit_save.removeClass("load").text("保存");
                    }

                    // common.loading.end(btn);
                    ajax_loading = false;

                },
                error: function () {
                    //common.loading.end(btn);
                    unHoldSubmit();
                    ajax_loading = false;
                    infoErr.css({color: "red"}).html("服务器未知错误");
                    $submit_save.removeClass("load").text("保存");
                }
            });
        }

        var $info_table_warp = $("#info_table_warp"),
            $info_table_show = $('#info_table_show'),
            $tbInfo = $info_table_warp.find(".tbInfo"),
            info_table_height = 0;
        $info_table_show.click(function () {
            unHoldSubmit(true);
            infoErr.html("");
        });
        var submit_time;

        function holdSubmit(check, callback) {
            unHoldSubmit();
            $submit_save.addClass("load").text("保存中");
            $info_table_show.show();
            $tbInfo.animate({height: 0}, 300, function () {
                $tbInfo.css({visibility: "hidden"});
            });
            $agreeDeal.attr("disabled","disabled");
            // common.loading.start($submit_save);
            if (check()) {
                callback();
            }
            submit_time = setInterval(function () {
                if (check()) {
                    callback();
                }
            }, 3000);
        }

        function unHoldSubmit(show_wrap) {
            if (submit_time) {
                clearInterval(submit_time);
            }
            //common.loading.end($submit_save);
            if (show_wrap) {
                $info_table_show.hide();
                $tbInfo.animate({height: $tbInfo.find("table").height()}, 300, function () {
                    $tbInfo.css({visibility: "visible", height: "auto"});
                });
            }
            $agreeDeal.removeAttr("disabled");
            $submit_save.removeClass("load").text("保存");
            //infoErr.html("");
        }

        function setHoldTip() {
            infoErr.css({color: "#000000"});
            infoErr.html("上传完成后会自动提交噢");
        }

//富文本编辑
        var rich_editor_intro;
        var rich_editor_lyric;

        function setKindEditor() {
            var basePath = config.STATIC_ROOT + "/js/plugin/kindeditor/",
                themesPath = config.STATIC_ROOT + "/css/plugin/kindeditor/themes/",
                items = [ 'bold', 'italic', 'underline', 'link', "image"],
                pasteType = 2;
            if (rich_editor_intro) {
                rich_editor_intro.remove();
            }
            rich_editor_lyric = KindEditor.create('textarea[name="lyric"]', {
                basePath:  basePath,
                themesPath: themesPath,
                items: [],
                width: "613",
                newlineTag: "br",
                pasteType: 1,
                themeType: 'noheader',
                afterBlur: function () {
                    this.sync();
                },
                afterFocus:function(){
                    page.setRight($('textarea[name="lyric"]').parent());
                }
            });

            rich_editor_intro = KindEditor.create('textarea[name="rich_intro"]', {
                basePath: basePath,
                themesPath: themesPath,
                resizeType: 1,
                themeType: 'simple',
                pasteType: 2, //0 禁止，1 纯文本，2 html  3, html(!img)
                width: "613",
                newlineTag: "br",
                allowPreviewEmoticons: false,
                uploadJson: "/dtres/attachment/upload",
                fillDescAfterUploadImage: true,
                imageData: {},
                uploadImageBefore: function (url) {
                    if (!checkfile(url)) {
                        dialog.alert("请上传正确的图片");
                        this.hideDialog();
                        return false;
                    }
                    return true;
                },
                uploadImageSuccess: function (data) {
                    var _data = {};
                    if (data.status) {
                        if (data.data[0].fileSize > 2 * 1024 * 1024) {
                            _data = {
                                error: 1,
                                msg: "图片最大不超过2M"
                            };
                        } else {
                            var uploadTrack = data.data[0]['uploadTrack'];
                            var id = uploadTrack["id"],
                                url = image_domain + "/" + uploadTrack["url"];
                            this.imageData[url] = id;
                            _data = {
                                error: 0,
                                url: url
                            };
                        }
                    } else {
                        _data = data;
                        _data.error = data.ret;
                    }
                    return _data;
                },
                uploadImageError: function (data) {
                    this.hideDialog();
                    dialog.alert(data.msg);
                },
                afterFocus:function(){
                   page.setRight($description.parent());
                },
                afterBlur: function () {
                    this.sync();
                },
                allowImageUpload: true,
                items: items,
                htmlTags: {
                    font: [],
                    span: [],
                    div: [],
                    a: ['href', 'target', 'title', 'alt'],
                    img: [ 'src', 'alt', 'title', 'align'],
                    'p,ol,ul,li,blockquote': [],
                    'br,tbody,tr,strong,b,sub,sup,em,i,u,strike,s,del': []
                }
            });
        }

//检测文件类型是否合法
        function checkfile(url) {
            var filetype = ["gif", "jpg", "jpeg", "png", "bmp"];
            var val = url;
            var type = val.split(/\//);
            if ($.inArray("jpg", filetype) && !$.inArray("jpeg", filetype)) {
                filetype.push("jpeg");
            }
            if ($.inArray("jpeg", filetype) && !$.inArray("jpg", filetype)) {
                filetype.push("jpg");
            }
            var types = filetype.join("|").toLowerCase();
            var reg = new RegExp("" + types + "$");
            return reg.test(val.toLowerCase());

        }

        function richEditorSwitch() {
            if (rich_editor_intro) {
                rich_editor_intro.sync();
                var html = rich_editor_intro.html();

                var text = html.replace(/<(?!br|img)[^>]+>/g, "");
                text = text.replace(/(\n|\s)/g, "&nbsp;");
                //连续多个空格替换成一个空格
                text = text.replace(/(&nbsp;)+/ig, ' ');
                //把只有<br />的文本替换为空
                text = text.replace(/^<br[^>]+>$/, "");
                //只带换行和img的文本
                /*20130705 mid_intro不需要了*/

                //$("[name=mid_intro]").val(text);
                //只带空格纯文本
                text = text.replace(/(<[^>]+>)+/g, " ");
                text = text.replace(/^\s+$/g, "");
                if(text == "<br>"){
                    text = '';
                }
                $("[name=intro]").val(text);
                //存放上传的图片id
                var $intro_images = $("[name=intro_images]"),
                    ids = [];
                for (var url in rich_editor_intro.imageData) {
                    if (text.indexOf(url) != -1) {
                        ids.push(rich_editor_intro.imageData[url]);
                    }
                }
                $intro_images.val(ids.join(","));
            } else {
                $description.val($("[name=rich_intro]").val());
            }
            if (rich_editor_lyric) {
                rich_editor_lyric.sync();
                $("[name=lyric]").each(function () {
                    var $this = $(this);
                    var html = $this.val();
                    var text = html.replace(/<(?!br)[^>]+>/g, "");
                    text = text.replace(/(\n|\s)/g, "&nbsp;");
                    //连续多个空格替换成一个空格
                    text = text.replace(/(&nbsp;)+/ig, ' ');
                    //将唯一的空格替换成空
                    text = text.replace(/^\s+$/g, "");
                    if(text == "<br>"){
                        text = '';
                    }
                    $this.val(text);
                });
            }
        }

        var page = new Page();
        page.check = check;
        page.setIsAlbum = setIsAlbum;
        page.parseSubmitError = parseSubmitError;
        page.submitForm = submitForm;
        page.holdSubmit = holdSubmit;
        page.unHoldSubmit = unHoldSubmit;
        page.setHoldTip = setHoldTip;
        page.setBindShare = setBindShare;
        return page;
    })
;