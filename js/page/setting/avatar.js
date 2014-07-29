/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-4-27
 * Time: 下午5:14
 * To change this template use File | Settings | File Templates.
 */
define([
    'jquery',
    'model/setting',
    'plugin/dialog',
    'plugin/swfupload/swfupload.queue',
    'plugin/jquery.jcrop',
    'plugin/webcam'],
    function ($,  SettingModel, dialog) {

        var image_domain = config.FDFS_PATH;
        var img_upload_url = config.DIRECT_DTRES_ROOT + "/headerThumb/upload";
        var img_cut_url =  config.DIRECT_DTRES_ROOT + "/header/cut";
        var loading_imgurl = config.STATIC_ROOT + "/css/img/record/loading.gif";



        var $img_photo = $("#img_photo"),
            $img_photo_container = $("#img_photo_container"),
            $photo_handle = $("#photo_handle"),
            $photo_shoot = $('#photo_shoot'),
            $preview_100 = $("#preview_100"),
            $preview_60 = $("#preview_60"),
            $preview_30 = $("#preview_30"),
            $trackUploadInfo = $("#trackUploadInfo"),
            $trackUploadId = $("#trackUploadId");

        var box_width = 260,
            box_height = 260;



        function uploadImgInit() {
            var $imgUpload = $("#local_photo");
            $imgUpload.css("position", "relative");
            var text = $imgUpload.text();
            $imgUpload.html('<div>' + text + '</div><div style="position: absolute;left:0;top:0;"><span id="imgUploadSwf"></span></div>');
            var original_src = "";
            var flash_url = "/swf/swfupload.swf";
            var settings = {
                flash_url:flash_url,
                upload_url:img_upload_url,
                file_size_limit:"5 MB",
                file_types:"*.gif; *.jpg; *.png;*.jpeg;*.bmp;",
                file_types_description:"Image Files",
                debug:false,
                file_queue_limit : 1,
                button_width:$imgUpload.width(),
                button_height:$imgUpload.height(),
                button_placeholder_id:"imgUploadSwf", //"swfcontainer",
                button_cursor:SWFUpload.CURSOR.HAND,
                button_window_mode:SWFUpload.WINDOW_MODE.TRANSPARENT,
                file_dialog_complete_handler:function(numFilesSelected, numFilesQueued){
                    if(numFilesSelected==0){
                        return;
                    }

                    this.startUpload();
                },
                file_queue_error_handler:function(file, errorCode, message){
                    if(errorCode ==  SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED){
                        dialog.alert("选择一张图片上传");
                    }
                    if(errorCode ==  SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT){
                        dialog.alert("图片最大不超过5M");
                    }
                    return;
                },
                upload_start_handler:function(file){
                    $img_photo.attr({"src": loading_imgurl});
                    ImageCut.prepare();
                },
                upload_success_handler:function (file, str_data) {
                    var data = $.parseJSON(str_data);
                    if (!data.status) {

                        if (dialog) dialog.alert(data.msg);
                        return;
                    }
                    var info = data.data[0];
                    var trackUploadId = info.uploadTrack.id;

                    var src = image_domain + "/"+info.processResult[260];
                    var img = new Image();
                    img.onload = function(){
                        ImageCut.init(src, img.width, img.height,trackUploadId);
                    };
                    img.src = src;
                }
            };
            new SWFUpload(settings);
            return;

        }

        var ImageCut = {
            width:300,
            height:300,
            init:function(src, width, height, trackUploadId){
                if(!src || !width || !height) return;
                $trackUploadId.val(trackUploadId);
                this.width = width;
                this.height = height;
                $img_photo_container.css({
                    left:(box_width-width)/2,
                    top:(box_height-height)/2,
                    width:width,
                    height:height
                });
                $img_photo.attr("src", src).css({
                    width:"100%",
                    height:"100%"
                });
                if(!trackUploadId) return;
                $preview_100.attr("src", src);
                $preview_60.attr("src", src);
                $preview_30.attr("src", src);

                var _this = this;
                var select = [
                    width/2 - 50,
                    height/2 - 50,
                    width/2 + 50,
                    height/2 + 50
                ];
                $img_photo.Jcrop({
                    onChange: function(coords){
                        _this.onChange(coords);
                    },
                    onSelect:function(coords){
                        _this.onChange(coords);
                    },
                    setSelect:select,
                    minSize : [30, 30],
                    //  maxSize : [_this.width, _this.height],
                    aspectRatio: 1,
                    bgOpacity:0.5
                },function(){
                    _this.jcrop_api = this;
                });
            },
            prepare:function(){
                $photo_handle.show();
                $photo_shoot.hide();

                ImageCut.destroy();
                // $img_photo.attr({"src": loading_imgurl});
                $img_photo_container.css({
                    left:0,
                    top:0,
                    width:box_width,
                    height:box_height
                });
                $img_photo.css({visibility:"visible", width:"100%",height:"100%"});
            },

            destroy:function(){
                if(this.jcrop_api){
                    this.jcrop_api.destroy();
                }
            },
            release:function(){
                if(this.jcrop_api){
                    this.jcrop_api.release();
                }
            },
            onChange:function(coords){

                if (parseInt(coords.w) > 0)
                {
                    this.showPreview($preview_100, 100, 100, coords);
                    this.showPreview($preview_60, 60, 60, coords);
                    this.showPreview($preview_30, 30, 30, coords);

                    $("#upload_w").val(parseInt(coords.w));
                    $("#upload_h").val(parseInt(coords.h));
                    $("#upload_x").val(parseInt(coords.x));
                    $("#upload_y").val(parseInt(coords.y));
                    $("#upload_ow").val(this.width);
                    $("#upload_oh").val(this.height);
                }
            },
            showPreview:function(el, w, h, coords){
                var ox = this.width,
                    oy = this.height;
                var rx = w / coords.w;
                var ry = h / coords.h;
                el.css({
                    width: Math.round(rx * ox) + 'px',
                    height: Math.round(ry * oy) + 'px',
                    marginLeft: '-' + Math.round(rx * coords.x) + 'px',
                    marginTop: '-' + Math.round(ry * coords.y) + 'px'
                });

            }
        };
        $("#photo_upload").click(function(){
            $photo_handle.hide();
            $photo_shoot.show();
            shoot.init();
        });
        var taking_photo = true;
        $("#take_snapshot").click(function(){
            if(taking_photo) return;
            shoot.snap();
            taking_photo = true;
        });
        var shoot = {
            inited:false,
            init:function(){
                if(!this.inited){
                    // webcam.set_swf_url(config.STATIC_ROOT+"/js/lib/webcam.swf?_t="+new Date().getTime());
                    webcam.set_swf_url("/swf/webcam.swf?_t="+new Date().getTime());
                    webcam.set_api_url(img_upload_url+"?"+"token="+readCookie(config.TOKEN_LABEL)+ "&rememberMe="+readCookie(config.REMEMBERME_LABEL));
                    webcam.set_quality( 90 );
                    webcam.set_shutter_sound(false);
                    $("#snapshot_warp").html(webcam.get_html(box_width, box_height, box_width, box_height, "transparent"));
                    webcam.set_hook( 'onLoad', this.onLoad );
                    webcam.set_hook( 'onComplete', this.onComplete );
                    webcam.set_hook( 'onError', this.onError );

                }else{
                    webcam.reset();
                }
                this.inited = true;
            },
            onComplete:function(data){

                data = $.parseJSON(data);
                if(data.status){
                    ImageCut.prepare();
                    ImageCut.init(image_domain+"/"+data.data[0].processResult[260],260, 260,data.data[0].uploadTrack.id );
                }
                taking_photo = false;
            },
            onLoad:function(){
                taking_photo = false;
            },
            onError:function(msg){
                dialog.alert("摄像头未找到:"+msg);
            },
            snap:function(){
                webcam.snap();
            }
        };
        function readCookie(name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return encodeURIComponent(c.substring(nameEQ.length,c.length));
                if(c.indexOf(nameEQ)!= -1){
                    return encodeURIComponent(c.substring(c.indexOf("=")+1,c.length));
                }
            }
            return null;
        }
        $("#submit_btn").click(function(){
            $(this).parent().submit();
        });
        if($img_photo.attr("src")){
            ImageCut.prepare();
            var src = $img_photo.attr("src");
            var img = new Image();
            img.onload = function(){
                ImageCut.init(src, img.width, img.height);
                img = null;
            };
            img.src = src;
        }

        var page = {
            init:function(){
                uploadImgInit();
            }
        };
        return page;
    });