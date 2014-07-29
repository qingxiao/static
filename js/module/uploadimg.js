/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-16
 * Time: 下午4:49
 * To change this template use File | Settings | File Templates.
 */
define(["jquery", "underscore", 'backbone', 'plugin/dialog',"plugin/swfupload/swfupload.queue"],
    function ($, _, Backbone, dialog) {

        var img_upload_url = config.DIRECT_DTRES_ROOT + "/headerThumb/upload";

        var UploadImg = Backbone.View.extend({
            initialize: function (options) {
                this.options = $.extend({
                    url:img_upload_url,
                    $el:"",
                    maxSize: 5,
                    beforeUpload: $.noop,
                    success: $.noop,
                    error: $.noop,
                    textClass:"",
                    file_queue_limit:1,
                    file_upload_limit:0,
                    file_queued_handler: $.noop,
                    swfupload_loaded_handler: $.noop
                }, options);
                this.$el = this.options.$el;
                this.initUploadImg();
            },
            initUploadImg: function () {
                var _this = this,
                    $el = this.$el,
                    text = $el.text(),
                    ops = this.options;

                $el.css("position", "relative");
                $el.html('<div class="'+ops.textClass+'">' + text + '</div><div style="position: absolute;left:0;top:0;"><span id="imgUploadSwf"></span></div>');
                var flash_url = "/swf/swfupload.swf";
                var settings = {
                    flash_url: flash_url,
                    upload_url: ops.url,
                    file_size_limit: ops.maxSize + " MB",
                    file_types: "*.gif; *.jpg; *.png;*.jpeg;*.bmp;",
                    file_types_description: "Image Files",
                    debug: false,
                    file_queue_limit: ops.file_queue_limit,
                    file_upload_limit:ops.file_upload_limit,
                    button_width: $el.width(),
                    button_height: $el.height(),
                    button_placeholder_id: "imgUploadSwf", //"swfcontainer",
                    button_cursor: SWFUpload.CURSOR.HAND,
                    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                    swfupload_loaded_handler:function(){
                        ops.swfupload_loaded_handler.call(this);
                    },
                    file_queued_handler:function(file){
                        ops.file_queued_handler.call(this, file);
                    },
                    file_dialog_complete_handler: function (numFilesSelected, numFilesQueued) {
                        if (numFilesSelected == 0) {
                            return;
                        }
                        this.startUpload();
                    },
                    upload_error_handler: function (file, errorCode, message) {
                        if(!file && errorCode){
                            return;
                        }
                        ops.error.call(this, file, errorCode, message);
                    },
                    file_queue_error_handler: function (file, errorCode, message) {

                        if (errorCode == SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
                            dialog.alert("选择图片超过最大上传限制");
                        }
                        if (errorCode == SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT) {
                            dialog.alert("图片最大不超过"+ops.maxSize+"M");
                        }
                        return;
                    },
                    upload_start_handler: function (file) {
                       ops.beforeUpload.call(this, file);
                    },
                    upload_success_handler: function (file, str_data) {
                        var data = $.parseJSON(str_data);
                        if (!data.status) {
                            if (dialog) dialog.alert(data.msg);
                            ops.error.call(this, data, file);
                            return;
                        }
                        ops.success.call(this, data, file, str_data);
                    }
                };
                this.swfupload = new SWFUpload(settings);
            },
            setButtonDisabled:function(disabled){
                this.swfupload.setButtonDisabled(disabled);
            },
            setFileUploadLimit:function(limit){
                this.swfupload.setFileUploadLimit(limit);
            },
            getFileUploadLimit:function(){
                return this.swfupload.getSetting("file_upload_limit");
            },
            //上传固定数量的图片，上传完成然后删掉，再上传之前要设置可以上传数量+1
            //因为之前删掉那个图片已经计算到已上传数量里面了
            increaseUploadLimit:function(){
                this.setFileUploadLimit(this.getFileUploadLimit()+1);
            }
        });

        return UploadImg;
    });