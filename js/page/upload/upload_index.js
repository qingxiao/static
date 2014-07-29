/**
 * Created with JetBrains WebStorm.
 * User: xiaoqing
 * Date: 13-5-23
 * Time: 上午10:24
 * To change this template use File | Settings | File Templates.
 */
define(['jquery',
    'page/page_base',
    'helper',
    'plugin/swfupload/swfupload.queue',
    'plugin/jrecorder',
    'plugin/dialog',
    "page/upload/record",
    "page/upload/information",
    "module/dialogs/login_box",
    "page/upload/fileprogress",
    "page/upload/handlers"
],
    function ($, PageBase, helper, SWFUpload, jRecorder, dialog, recordPage, information, login_box) {

        var flash_url = "/swf/swfupload.swf";

        var upload_url = config.UPLOAD_ROOT + '/audio/upload';
        var img_upload_url = config.DIRECT_DTRES_ROOT + "/cover/upload";
        var progress_url = config.DIRECT_DTRES_ROOT + '/progress';
        var transcoding_url = '/dtres/transcoding/process'; //config.TRANSCODING_ROOT;
        var loading_imgurl = config.STATIC_ROOT + "/css/img/record/loading.gif";

        var checkLoginUrl = "/passport/check_me"; //检查登录状态

        var mTotalNum = 100,
            mMaxNum = 100,
            mTitleMaxLength = 40;

        var mFileList = [],
            refPram = { singleFile: true };

        var swfuUploadComplete = false,
            mUploadSuccess;
        var Page = PageBase.extend({
            init: function () {
                this.callParent("init");
                this.initDom();

                if ($("#record_box").hasClass("full")) {
                    $(".uploadLoading").remove();
                    $('#recordBtn, #uploadBtn').click(function () {
                        dialog.alert("容量不够");
                    });
                    return;
                }

                this.setFlashWrap();
                this.showSwfupload();
                this.hideJRecorder();
                this.bindEvents();
                this.initSwfUpload();
                var _this = this;
                setTimeout(function () {
                    _this.initSwfUploadInfo();
                }, 150);
                $(".bodyBgColor").addClass("bodyBgColor2");
            },

            initDom: function () {
                this.$jRecorder = $("#jRecorder");
                this.$swfupload = $("#swfupload");
                this.$recordBtn = $("#recordBtn");
                this.$uploadBtn = $("#uploadBtn");
                this.page = {
                    recordBox: $("#record_box"),
                    info: $("#record_info"),
                    uploadIndex: $("#upload_index")
                };

            },
            windowResize: function (e) {
                e.data.setFlashWrap();
            },
            setFlashWrap: function () {
                //给flash容器定位
                var _this = this;
                this.$swfupload.css({
                    left: _this.$uploadBtn.offset().left || -200,
                    top: _this.$uploadBtn.offset().top,
                    position: "absolute"
                });
                this.$jRecorder.css({
                    left: _this.$recordBtn.offset().left,
                    top: _this.$recordBtn.offset().top,
                    position: "absolute",
                    width: 300,
                    height: 300
                });
            },
            getSettings: function () {
                var _this = this;
                var settings = {
                    flash_url: flash_url,
                    upload_url: upload_url,
                    transcoding_url: transcoding_url,
                    file_size_limit: "200 MB",
                    file_types: _this.getUploadTypes(),
                    file_types_description: "Audio Files",
                    file_upload_limit: mTotalNum,
                    file_queue_limit: mTotalNum,
                    custom_settings: {
                        progressTarget: "progressBarContainer"
                    },
                    debug: false,
                    requeue_on_error_time: 20, // second
                    requeue_on_error: true,

                    transcoding_success: function () {
                        transcodingSuccess();
                    },
                    // Button settings
                    /*        button_text:"<a href='javascript:;' style='top:200px;position: absolute;'>上传声音</a>",*/
                    button_width: "185",
                    button_height: "85",
                    button_placeholder_id: "swfuploadWarp", //"swfcontainer",
                    button_cursor: SWFUpload.CURSOR.HAND,
                    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,
                    swfupload_loaded_handler: function () {
                        $(".uploadLoading").remove();
                    },
                    file_queued_handler: function (file) {
                        /*记录一次操作需要上传的文件list*/
                        if (!this.file_queued_list) {
                            this.file_queued_list = [];
                        }
                        this.file_queued_list.push(file);

                        mFileList.push(file);
                    },
                    file_queue_error_handler: function (file, errorCode, message) {
                        if (SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT == errorCode) {
                            mFileList.push(file);

                            if (!this.cancelTranscoding) {
                                /*添加取消转码方法*/
                                this.cancelTranscoding = function (fileid) {
                                    _this.cancelFileUpload(fileid);
                                };
                            }
                        }
                        this.filesSelected = refPram;
                        fileQueueError.call(this, file, errorCode, message);
                    },
                    file_dialog_complete_handler: function (numFilesSelected, numFilesQueued) {
                        if (numFilesSelected >= 1 && numFilesSelected <= mTotalNum) {

                            var self = this;

                            _this.checkLogin(function () {
                                if (1 == numFilesSelected) {
                                    refPram.singleFile = true;
                                    _this.initInfo({ album: false });
                                } else {
                                    refPram.singleFile = false;
                                    _this.initInfo({ album: true });
                                }
                                this.filesSelected = refPram;
                                fileDialogComplete.call(self, numFilesSelected, numFilesQueued, refPram);
                                self.startUpload();

                                _this.hideSwfupload();

                                mTotalNum = mTotalNum - numFilesSelected;
                                mTotalNum = mTotalNum <= 0 ? 1 : mTotalNum;
                            }, function () {
                                _this._swfupload.destroy();
                                _this.$swfupload.append('<div id="swfuploadWarp"></div>');
                                _this._swfupload = new SWFUpload(settings);
                            });
                        }
                    },
                    upload_start_handler: function (file) {
                        var file_temp = findFileByFileid(mFileList, file.id);
                        if (!file_temp) return;

                        uploadStart.call(this, file);
                    },
                    upload_progress_handler: function (file, bytesLoaded, bytesTotal) {
                        var file_temp = findFileByFileid(mFileList, file.id);
                        if (!file_temp) return;

                        uploadProgress.call(this, file_temp, bytesLoaded, bytesTotal);
                    },
                    upload_error_handler: function (file, errorCode, message) {
                        if (errorCode == SWFUpload.UPLOAD_ERROR.FILE_CANCELLED) {
                            //取消上传
                            _this.cancelFileUpload(file.id);
                        }
                        uploadError.call(this, file, errorCode, message);
                    },
                    upload_success_handler: function (file, serverData) {

                        /*将mFilelist里面的file替换为参数的file*/
                        var file_temp = findFileByFileid(mFileList, file.id);
                        if (!file_temp) return;
                        var sData = $.parseJSON(serverData);


                        uploadSuccess.call(this, file_temp, serverData);
                    },
                    upload_complete_handler: function (file) {
                        if (!this.cancelTranscoding) {
                            /*添加取消转码方法*/
                            this.cancelTranscoding = function (fileid) {
                                _this.cancelFileUpload(fileid);
                            };
                        }
                        uploadComplete.call(this, file);
                    },
                    queue_complete_handler: function (numFilesUploaded) {
                        queueComplete.call(this, numFilesUploaded);
                        /* 再次上传  需要先等待第一次文件上传完成才开始上传；*/
                        swfuUploadComplete = true;
                        if (_this._swfupload2 && _this._swfu2HasFile) {
                            _this._swfupload2.startUpload();
                        }

                    }
                    // Queue plugin event
                };
                return settings;
            },
            getUploadTypes: function () {
                var file_types = "*.MP4;*.3GP;*.AVI;*.WMV;*.MPG;*.VOB;*.FLV;*.SWF;*.MOV;*.RMVB;*.RM;*.MPEG;*.MP3;*.WMA;*.AIFF;*.AIF;*.WAV;*.FLAC;*.OGG;*.MP2;*.AAC;*.AMR;*.M4A;";
                file_types += file_types.toLowerCase();
                return file_types;
            },
            initSwfUpload: function () {
                var settings = this.getSettings();
                this._swfupload = new SWFUpload(settings);
            },
            initSwfUploadInfo: function () {
                var _this = this,
                    settings = this.getSettings();
                var settings2 = $.extend({}, settings, {
                    button_width: "708",
                    button_height: "33",
                    file_upload_limit: mTotalNum,
                    file_queue_limit: mTotalNum,
                    button_placeholder_id: "swfupload2",
                    button_text_style: ".theFont { color: #ffffff; }",
                    button_text_left_padding: 10,
                    swfupload_loaded_handler: function () {
                        this.setFileQueueLimit(mTotalNum);
                        this.setFileUploadLimit(mTotalNum);
                    },
                    button_text_top_padding: 5,
                    file_dialog_complete_handler: function (numFilesSelected, numFilesQueued) {
                        if (numFilesSelected <= 0) return;

                        $(".p_info").hide();
                        _this._swfu2HasFile = true;
                        refPram.singleFile = false;
                        fileDialogComplete.call(this, numFilesSelected, numFilesQueued, refPram);
                        if (swfuUploadComplete) {
                            this.startUpload();
                        }
                    }
                });
                this._swfupload2 = new SWFUpload(settings2);
            },
            initInfo: function (data) {
                this.showUploadInfo();
                information.init(data);
            },
            showSwfupload: function () {
                this.$swfupload.css({ zIndex: 1000 });
            },
            hideSwfupload: function () {
                this.$swfupload.css({ left: -200, top: -200 });
            },
            hideJRecorder: function () {
                this.$jRecorder.css({ left: -200, top: -200 });
            },
            release: function () {
                this.callParent("release");
                this.unbindEvents();
                $(".bodyBgColor").removeClass("bodyBgColor2");
            },
            bindEvents: function () {
                var _this = this;
                //用js控制被flash挡住的a标签的hover效果
                this.$swfupload.on({
                    mouseenter: function () {
                        _this.$uploadBtn.addClass("hover");
                    },
                    mouseleave: function () {
                        _this.$uploadBtn.removeClass("hover");
                    }
                });
                var $uploadContinue =  $(".uploadContinue");
                $(".uploadContinueWrap").on({
                    mouseenter: function () {
                        $uploadContinue.addClass("hover");
                    },
                    mouseleave: function () {
                        $uploadContinue.removeClass("hover");
                    }
                });
                //录音按钮
                this.$recordBtn.click(function () {
                    _this.initJRecord();
                });

                $(window).on("resize", this, this.windowResize);


            },
            showUploadInfo: function () {
                this.page.recordBox.hide();
                this.page.info.show().removeClass("hidden");
            },
            initJRecord: function () {
                var _this = this;
                recordPage.init({
                    upload_url: upload_url,
                    progress_url: progress_url,
                    transcoding_url: transcoding_url,
                    checkLogin: _this.checkLogin,
                    beforeUpload: function (file) {
                        mFileList.push(file);
                        refPram.singleFile = true;
                        this.filesSelected = refPram;
                        mUploadSuccess = false;
                        _this.initInfo({ album: false });
                    },
                    uploadSuccess: function (file, serverData) {
                        mTotalNum--;
                        file = findFileByFileid(mFileList, file.id);
                        swfuUploadComplete = true;
                        if (_this._swfupload2 && _this._swfu2HasFile) {
                            _this._swfupload2.startUpload();
                        }
                        return file;
                    },
                    transcodingSuccess: function () {
                        transcodingSuccess();
                    }
                });
                this.hideSwfupload();
                this.page.uploadIndex.hide();
            },
            cancelFileUpload: function (fileid) {
                for (var i = 0, l = mFileList.length; i < l; i++) {
                    var tempfile = mFileList[i];
                    if (tempfile.id == fileid) {
                        if (tempfile.transcodeTimer) {
                            clearInterval(tempfile.transcodeTimer);
                            tempfile.transcodeTimer = null;
                        }
                        /*从mFileList中删掉选中项*/
                        mFileList.splice(i, 1);
                        /*在继续上传中增加可以上传个数*/
                        var cur_limit = this._swfupload2.getSetting("file_upload_limit");
                        var stats = this._swfupload2.getStats();
                        this._swfupload2.setFileQueueLimit(0);
                        this._swfupload2.setFileUploadLimit(mMaxNum - mFileList.length + stats.successful_uploads + stats.files_queued);
                        break;
                    }
                }
                if (mFileList.length == 0) {
                    $(".p_info").show().html("该专辑还没有任何声音");
                } else {
                    $(".p_info").hide();
                }

            },
            checkLogin: function (loginFn, unloginFn) {

                loginFn = loginFn || $.noop;
                unloginFn = unloginFn || $.noop;
                var unloginFn2 = function () {
                    login_box.open(function (data) {
                        login_box.close();
                    });
                    unloginFn();
                };
                var token = readCookie(config.TOKEN_LABEL);
                if (!token) {
                    unloginFn2();
                    return;
                }
                //todo放model
                $.ajax({
                    type: "get",
                    url: checkLoginUrl,
                    data: { token: decodeURIComponent(token), rememberMe: 'y' },
                    dataType: "json",
                    success: function (result) {
                        if (result && result.ret == 50) {
                            unloginFn2();
                        } else {
                            loginFn();
                        }
                    },
                    error: function () {
                        unloginFn2();
                    }
                });
            },
            unbindEvents: function () {
                this.callParent("unbindEvents");
                $(window).off("resize", this, this.windowResize);
            }
        });

        function findFileByUuid(fileArray, uuid) {
            for (var i = 0, l = fileArray.length; i < l; i++) {
                var tempfile = fileArray[i];
                if (tempfile.uuid == uuid) {
                    return tempfile;

                }
            }
            return false;
        }

        function findFileByFileid(fileArray, fileid) {
            for (var i = 0, l = fileArray.length; i < l; i++) {
                var tempfile = fileArray[i];
                if (tempfile.id == fileid) {
                    return tempfile;
                    break;
                }
            }
            return false;
        }

        function transcodingSuccess() {
            $("#singleFile").find(".p_tip").html("上传成功");
            mUploadSuccess = true;
            myDebug('transcodingsuccess------------', mFileList);
            // console.info(mFileList);
        }

        //mUploadSuccess
        /*
        提交表单 ajax 后台验证敏感词
        成功： { res: true }
        报错：{ res: false, errors: [ [title','标题填写有误'],['user_source', '来源设置有误'] ] }
        123: 新上传, m123: (移动的)track_id, r123: (专辑里原有的)record_id
        */
        var $submit_save = $("#submit_save");
        $submit_save.click(function () {
            var that = this;
            beforeSubmit(function () {
                var href = refPram.singleFile ? "/my_tracks" : "/my_albums";
                information.submitForm(that, href);
            });
            return false;
        });




        function beforeSubmit(callback) {
            if (!information.check()) {
                return false;
            }
            information.holdSubmit(checkFileUpload, callback);
            return true;

        }

        function checkFileUpload() {
            var infoErr = $("#infoErr");
            infoErr.html("").css({ color: "red" });
            var item = $("#multiFile .progressBarContainer").children();
            if (item.size() > mMaxNum) {
                infoErr.html("一次只能上传" + mMaxNum + "个声音，请删掉多余的后重试");
                return false;
            }
            var fileArr = [];
            var l = mFileList.length;
            /*  if (l == 0) {
            infoErr.html("没有声音，请选择声音后保存");
            return false;
            }*/
            for (var i = 0; i < l; i++) {
                var ff = mFileList[i],
                    $dom = $("#" + ff.id),
                     progress = new FileProgress(ff, "progressBarContainer", refPram, true);
                if (ff.size > 200 * 1024 * 1024) {
                    information.unHoldSubmit();
                    information.setError($dom);
                    //infoErr.html("单个上传文件不能超过200M");
                    progress.titleError("单个上传文件不能超过200M");
                    return false;
                }
                if (!ff.uuid) {
                    information.setHoldTip();
                    return false;
                }

                if (ff.transcoded && ff.uploadSuccess) {
                    fileArr.push(ff.uuid);
                } else if (ff.transcodingError) {
                    information.setError($dom);
                    infoErr.html("请删除转码失败的文件后重试");
                    information.unHoldSubmit();
                    return false;
                } else {
                    information.setHoldTip();
                    return false;
                }

                if (!refPram.singleFile) {
                    if (!checkMaxLength(ff.title, mTitleMaxLength * 2)) {
                        information.setError($dom);
                        information.unHoldSubmit();
                        progress.titleError();
                        return false;
                    }
                    if (!ff.title) {
                        information.setError($dom);
                        information.unHoldSubmit();
                        progress.titleError();
                        return false;
                    }
                }

            }
            return true;
        }

        //中文长度
        function checkMaxLength(val, len) {
            return helper.gblen(val) <= len;
        }

        return new Page();
    });

